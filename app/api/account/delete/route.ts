// POST /api/account/delete (S8.2)
//
// Cascades deletion for a user-initiated account deletion request.
// Deletion order per implementation plan:
//   application_answers → applications → charity_profiles →
//   ai_usage_log → user_profiles → Supabase Auth deleteUser
//
// Uses the service role client for admin operations and auth.admin.deleteUser.
// Uses the regular server client first to verify the caller is authenticated.
//
// Sends Email 2 (account-deleted-user) via Resend after deletion (FR-44, Should Have).
// If the email send fails, the deletion is NOT rolled back — the user is already
// deleted and cannot be recovered. The email failure is logged to Sentry.

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import { buildAccountDeletedByUserEmail } from '@/lib/emails/account-deleted-user'

export async function POST() {
  // 1. Verify the caller is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  const userEmail = user.email ?? ''
  const firstName = (user.user_metadata?.first_name as string | undefined) ?? 'there'

  // 2. Switch to service role for cascade deletion (bypasses RLS, required for
  //    auth.admin.deleteUser)
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // 3. Cascade deletion in plan order

  // Step 1: application_answers — fetch application IDs first, then delete answers
  const { data: apps } = await service.from('applications').select('id').eq('user_id', userId)

  const appIds = apps?.map((a: { id: string }) => a.id) ?? []

  if (appIds.length > 0) {
    const { error: answersError } = await service
      .from('application_answers')
      .delete()
      .in('application_id', appIds)

    if (answersError) {
      console.error('[delete-account] Failed to delete application_answers:', answersError)
      return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
    }
  }

  // Step 2: applications
  const { error: appsError } = await service.from('applications').delete().eq('user_id', userId)

  if (appsError) {
    console.error('[delete-account] Failed to delete applications:', appsError)
    return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
  }

  // Step 3: charity_profiles
  const { error: profileError } = await service
    .from('charity_profiles')
    .delete()
    .eq('user_id', userId)

  if (profileError) {
    console.error('[delete-account] Failed to delete charity_profiles:', profileError)
    return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
  }

  // Step 4: ai_usage_log (includes rows where application_id is now null)
  const { error: usageError } = await service.from('ai_usage_log').delete().eq('user_id', userId)

  if (usageError) {
    console.error('[delete-account] Failed to delete ai_usage_log:', usageError)
    return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
  }

  // Step 5: user_profiles
  const { error: userProfileError } = await service
    .from('user_profiles')
    .delete()
    .eq('user_id', userId)

  if (userProfileError) {
    console.error('[delete-account] Failed to delete user_profiles:', userProfileError)
    return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
  }

  // Step 6: Supabase Auth — deleteUser (service role required)
  const { error: authDeleteError } = await service.auth.admin.deleteUser(userId)

  if (authDeleteError) {
    console.error('[delete-account] Failed to delete auth user:', authDeleteError)
    return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
  }

  // 4. Send confirmation email (FR-44, Should Have)
  //    Failure is logged but does not fail the request — the user is already deleted.
  if (userEmail) {
    try {
      await sendEmail({
        to: userEmail,
        subject: 'Your Grant Pathway account has been deleted',
        html: buildAccountDeletedByUserEmail(firstName),
      })
    } catch (emailErr) {
      console.error('[delete-account] Confirmation email failed to send:', emailErr)
    }
  }

  return NextResponse.json({ ok: true })
}
