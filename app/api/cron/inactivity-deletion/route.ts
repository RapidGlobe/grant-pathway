// GET /api/cron/inactivity-deletion (S8.3 — Cron 2)
//
// Deletes accounts where last_sign_in_at is 24 or more months ago.
// Cascade deletion order (same as user-initiated deletion in S8.2):
//   application_items → applications → charity_profiles →
//   ai_usage_log → user_profiles → Supabase Auth deleteUser
//
// Sends Email 4 (account-deleted-inactivity) immediately after each deletion.
// Logs each deletion to console with user ID (not email — PII scrubbing).
//
// Schedule: daily at 09:00 UTC ("0 9 * * *") — configured in vercel.json.
// Runs one hour after the warning cron to avoid edge-case race conditions.
//
// Authentication: Authorization: Bearer [CRON_SECRET] header (ADR-OPS-004).
//
// Email failure reporting (GAP-31, 2026-08-05): Email 4 failures were caught
// and written to console.error only, so a charity could be deleted with no
// communication at all and nothing would raise an alarm. Failures now reach
// Sentry (ADR-OPS-005), and a missing RESEND_API_KEY aborts the run before
// anything is deleted — lib/emails/send.ts returns silently rather than
// throwing in that case, so the catch below would never have fired for it,
// which is precisely the configuration under which every user this cron
// touched would have been deleted in silence. Mirrors the preflight that
// app/api/account/delete/route.ts already performs for user-initiated
// deletion.

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '@/lib/emails/send'
import { buildAccountDeletedInactivityEmail } from '@/lib/emails/account-deleted-inactivity'
import { isDueForDeletion } from '@/lib/inactivity'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Preflight: refuse to delete anything if we cannot tell anyone we did.
  // Deletion is irreversible, so an unsendable Email 4 is a reason to stop,
  // not something to discover afterwards in a log line nobody reads.
  if (!process.env.RESEND_API_KEY) {
    console.error(
      '[inactivity-deletion] RESEND_API_KEY is not set — refusing to delete accounts we cannot notify',
    )
    Sentry.captureMessage('Inactivity deletion aborted: RESEND_API_KEY not set', {
      level: 'error',
      tags: { route: 'cron/inactivity-deletion', step: 'preflight' },
    })
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 503 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const now = new Date()

  let deleted = 0
  let notifyFailed = 0
  let page = 1

  while (true) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 })

    if (error) {
      console.error('[inactivity-deletion] Failed to list users:', error)
      Sentry.captureException(error, {
        tags: { route: 'cron/inactivity-deletion', step: 'listUsers' },
      })
      return NextResponse.json({ error: 'Failed to list users.' }, { status: 500 })
    }

    if (!data?.users?.length) break

    for (const user of data.users) {
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null

      // Skip users who have never signed in
      if (!lastSignIn) continue

      // 24+ months of inactivity
      if (isDueForDeletion(lastSignIn, now)) {
        const userId = user.id
        const firstName = (user.user_metadata?.first_name as string | undefined) ?? 'there'
        const email = user.email ?? ''

        // Cascade deletion (same order as user-initiated deletion)
        const { data: apps } = await service.from('applications').select('id').eq('user_id', userId)

        const appIds = (apps ?? []).map((a: { id: string }) => a.id)

        if (appIds.length > 0) {
          await service.from('application_items').delete().in('application_id', appIds)
        }

        await service.from('applications').delete().eq('user_id', userId)
        await service.from('charity_profiles').delete().eq('user_id', userId)
        await service.from('ai_usage_log').delete().eq('user_id', userId)
        await service.from('user_profiles').delete().eq('user_id', userId)

        const { error: authErr } = await service.auth.admin.deleteUser(userId)

        if (authErr) {
          console.error(`[inactivity-deletion] Failed to delete auth user ${userId}:`, authErr)
          Sentry.captureException(authErr, {
            tags: { route: 'cron/inactivity-deletion', step: 'deleteAuthUser' },
            extra: { userId },
          })
          continue
        }

        console.log(`[inactivity-deletion] Deleted inactive user ${userId}`)
        deleted++

        // Send Email 4. The account is already gone and cannot be restored, so
        // a send failure cannot fail the run — but it must be visible, because
        // it means a charity's account was deleted without being told.
        if (!email) {
          console.error(`[inactivity-deletion] Deleted user ${userId} had no email address`)
          Sentry.captureMessage('Account deleted for inactivity with no address to notify', {
            level: 'error',
            tags: { route: 'cron/inactivity-deletion', step: 'noEmailAddress' },
            extra: { userId },
          })
          notifyFailed++
          continue
        }

        try {
          await sendEmail({
            to: email,
            subject: 'Your Grant Pathway account has been deleted',
            html: buildAccountDeletedInactivityEmail(firstName),
          })
        } catch (emailErr) {
          console.error(`[inactivity-deletion] Email 4 failed for user ${userId}:`, emailErr)
          Sentry.captureException(emailErr, {
            tags: { route: 'cron/inactivity-deletion', step: 'sendEmail' },
            extra: { userId },
          })
          notifyFailed++
        }
      }
    }

    if (data.users.length < 1000) break
    page++
  }

  console.log(
    `[inactivity-deletion] Deleted ${deleted} inactive account(s); ${notifyFailed} could not be notified`,
  )
  return NextResponse.json({ deleted, notifyFailed })
}
