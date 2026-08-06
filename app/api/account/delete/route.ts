// POST /api/account/delete (S8.2)
//
// Cascades deletion for a user-initiated account deletion request.
// Deletion order per implementation plan:
//   guidelines-temp Storage objects → application_items, application_guidelines →
//   applications → charity_profiles → ai_usage_log → user_profiles →
//   Supabase Auth deleteUser
//
// The Storage step was added 2026-08-06 to close a gap between PDR-DH-002 —
// which lists uploaded guideline files among the data deleted — and this route,
// which deleted only tables. See lib/storage-guidelines.ts for why it is worth
// doing even though cleanup-guidelines (S4.4) would remove the files within the
// hour regardless.
//
// Uses the service role client for admin operations and auth.admin.deleteUser.
// Uses the regular server client first to verify the caller is authenticated.
//
// Sends Email 2 (account-deleted-user) via Resend after deletion (FR-44, Should Have).
// If the email send fails, the deletion is NOT rolled back — the user is already
// deleted and cannot be recovered. The email failure is logged to Sentry.

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import { buildAccountDeletedByUserEmail } from '@/lib/emails/account-deleted-user'
import { deleteUserGuidelineFiles } from '@/lib/storage-guidelines'

export async function POST() {
  // 0. Preflight: confirm email service is configured before any irreversible action.
  //    Deletion cannot be rolled back — if we can't send the confirmation email,
  //    fail before touching any data rather than silently deleting without receipt.
  if (!process.env.RESEND_API_KEY) {
    console.error('[delete-account] RESEND_API_KEY is not set — refusing deletion to protect user')
    return NextResponse.json(
      { error: 'Service configuration error. Please contact support.' },
      { status: 503 },
    )
  }

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

  // 3. Storage first: remove any in-flight guideline uploads (PDR-DH-002).
  //    Ordered ahead of the table cascade because nothing is destroyed yet at
  //    this point, so a Storage problem cannot leave a half-deleted account. The
  //    objects are ephemeral either way, so removing them before a later table
  //    failure aborts the request costs the user nothing.
  //
  //    Failure is non-fatal and deliberately so: cleanup-guidelines (S4.4) still
  //    sweeps the bucket every 30 minutes, and blocking an erasure request on a
  //    transient Storage error would make this defence-in-depth step a new
  //    single point of failure. Same posture as /api/upload/process.
  const storageResult = await deleteUserGuidelineFiles(service, userId)

  if (storageResult.error) {
    console.error('[delete-account] Failed to delete guideline files:', storageResult.error)
    // Worded without asserting the account was deleted: this step runs first, and
    // a later table failure aborts the request with a 500.
    Sentry.captureMessage('Guideline files could not be removed during account deletion', {
      level: 'warning',
      tags: { route: 'api/account/delete', step: 'deleteGuidelineFiles' },
      extra: { userId, detail: storageResult.error },
    })
  }

  // 4. Cascade deletion in plan order

  // Step 1: application_items, application_guidelines — fetch application IDs
  // first, then delete both (application_guidelines added GAP-33, 2026-07-14)
  const { data: apps } = await service.from('applications').select('id').eq('user_id', userId)

  const appIds = apps?.map((a: { id: string }) => a.id) ?? []

  if (appIds.length > 0) {
    const { error: answersError } = await service
      .from('application_items')
      .delete()
      .in('application_id', appIds)

    if (answersError) {
      console.error('[delete-account] Failed to delete application_items:', answersError)
      return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
    }

    const { error: guidelinesError } = await service
      .from('application_guidelines')
      .delete()
      .in('application_id', appIds)

    if (guidelinesError) {
      console.error('[delete-account] Failed to delete application_guidelines:', guidelinesError)
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

  // 5. Send confirmation email (FR-44, Should Have)
  //    Failure is logged but does not fail the request — the user is already deleted.
  if (userEmail) {
    try {
      await sendEmail({
        to: userEmail,
        subject: 'Your Grant Pathway account has been deleted',
        html: buildAccountDeletedByUserEmail(firstName),
      })
    } catch (emailErr) {
      // The header comment above has said "logged to Sentry" since this route
      // was written; until 2026-08-05 (GAP-31) only the console line existed.
      console.error('[delete-account] Confirmation email failed to send:', emailErr)
      Sentry.captureException(emailErr, {
        tags: { route: 'api/account/delete', step: 'sendEmail' },
        extra: { userId },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
