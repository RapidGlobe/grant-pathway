// GET /api/cron/inactivity-warning (S8.3 — Cron 1)
//
// Sends Email 3 (inactivity warning) to users whose last_sign_in_at is in the
// 23rd month window (≥23 months ago and <24 months ago).
//
// Schedule: daily at 08:00 UTC ("0 8 * * *") — configured in vercel.json.
//
// Authentication: Authorization: Bearer [CRON_SECRET] header (ADR-OPS-004).
// This route is in PUBLIC_API in proxy.ts (/api/cron prefix) so Vercel Cron
// requests bypass session handling.
//
// Uses auth.admin.listUsers() (paginated) and filters client-side.
// Only users with a non-null last_sign_in_at are considered — users who
// registered but never signed in are excluded.
//
// Deduplication (GAP-31, 2026-08-05): the eligibility window above is a whole
// month wide and this cron runs daily, so before the
// user_profiles.last_inactivity_warned_at guard existed a user in that window
// was emailed the same deletion warning every morning for about a month. A
// user is now warned once per period of inactivity — see
// supabase/migrations/20260805000000_gap31_inactivity_warning_dedup.sql.

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '@/lib/emails/send'
import { buildInactivityWarningEmail } from '@/lib/emails/inactivity-warning'
import { isInWarningWindow, shouldSendWarning } from '@/lib/inactivity'

// How many user ids to put in one .in(...) lookup — see the call site.
const PROFILE_LOOKUP_CHUNK = 200

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const now = new Date()

  // Page through all users — filter client-side for the 23-month window
  let warned = 0
  let skipped = 0
  let failed = 0
  let page = 1

  while (true) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 })

    if (error) {
      console.error('[inactivity-warning] Failed to list users:', error)
      Sentry.captureException(error, {
        tags: { route: 'cron/inactivity-warning', step: 'listUsers' },
      })
      return NextResponse.json({ error: 'Failed to list users.' }, { status: 500 })
    }

    if (!data?.users?.length) break

    // Candidates on this page: in the 23-month window (≥23 months ago AND
    // <24 months ago), signed in at least once, and contactable.
    const candidates = data.users.flatMap((user) => {
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
      if (!lastSignIn) return []
      if (!isInWarningWindow(lastSignIn, now)) return []
      const email = user.email
      if (!email) return []
      return [{ id: user.id, email, lastSignIn, user }]
    })

    if (candidates.length > 0) {
      // Read the stamps in bulk rather than one query per user. Chunked because
      // .in() becomes a query string: a page can hold 1000 candidates, and 1000
      // UUIDs is roughly 39KB of URL, past what PostgREST will accept.
      const warnedAtByUser = new Map<string, string | null>()

      for (let i = 0; i < candidates.length; i += PROFILE_LOOKUP_CHUNK) {
        const chunk = candidates.slice(i, i + PROFILE_LOOKUP_CHUNK)

        const { data: profiles, error: profileErr } = await service
          .from('user_profiles')
          .select('user_id, last_inactivity_warned_at')
          .in(
            'user_id',
            chunk.map((c) => c.id),
          )

        if (profileErr) {
          // Without the guard this run would re-send to everyone in the window,
          // so stop rather than fall back to the old behaviour.
          console.error('[inactivity-warning] Failed to read warning timestamps:', profileErr)
          Sentry.captureException(profileErr, {
            tags: { route: 'cron/inactivity-warning', step: 'readWarnedAt' },
          })
          return NextResponse.json({ error: 'Failed to read warning state.' }, { status: 500 })
        }

        for (const profile of (profiles ?? []) as Array<{
          user_id: string
          last_inactivity_warned_at: string | null
        }>) {
          warnedAtByUser.set(profile.user_id, profile.last_inactivity_warned_at)
        }
      }

      // A profile row exists for every account (on_auth_user_created trigger),
      // so an absent entry here means the guard cannot work for that user.
      for (const { id: userId, email, lastSignIn, user } of candidates) {
        if (!warnedAtByUser.has(userId)) {
          console.error(`[inactivity-warning] No user_profiles row for user ${userId} — skipping`)
          Sentry.captureMessage('Inactivity warning skipped: user_profiles row missing', {
            level: 'error',
            tags: { route: 'cron/inactivity-warning', step: 'missingProfile' },
            extra: { userId },
          })
          failed++
          continue
        }

        // Already warned for this period of inactivity? A sign-in after the
        // warning moves last_sign_in_at past the stamp, making the user
        // eligible again if they go quiet for another 23 months.
        const warnedAt = warnedAtByUser.get(userId) ?? null
        if (!shouldSendWarning(lastSignIn, warnedAt ? new Date(warnedAt) : null)) {
          skipped++
          continue
        }

        const firstName = (user.user_metadata?.first_name as string | undefined) ?? 'there'

        // Deletion date = last sign-in + 24 months
        const deletionDate = new Date(lastSignIn)
        deletionDate.setMonth(deletionDate.getMonth() + 24)

        try {
          await sendEmail({
            to: email,
            subject: 'Your Grant Pathway account will be deleted in 30 days',
            html: buildInactivityWarningEmail(firstName, formatDate(deletionDate)),
          })
        } catch (emailErr) {
          console.error(`[inactivity-warning] Failed to send warning to user ${userId}:`, emailErr)
          Sentry.captureException(emailErr, {
            tags: { route: 'cron/inactivity-warning', step: 'sendEmail' },
            extra: { userId },
          })
          failed++
          // Leave the timestamp unset so tomorrow's run tries again — this
          // user has 30 days of inactivity left before deletion.
          continue
        }

        warned++

        // Stamp only after a successful send. If this write fails the user may
        // get one more warning tomorrow, which is the right way round: never
        // warning them at all is the failure GAP-31's second half is about.
        const { error: stampErr } = await service
          .from('user_profiles')
          .update({ last_inactivity_warned_at: new Date().toISOString() })
          .eq('user_id', userId)

        if (stampErr) {
          console.error(
            `[inactivity-warning] Sent warning but failed to record it for user ${userId}:`,
            stampErr,
          )
          Sentry.captureException(stampErr, {
            tags: { route: 'cron/inactivity-warning', step: 'stampWarnedAt' },
            extra: { userId },
          })
        }
      }
    }

    if (data.users.length < 1000) break
    page++
  }

  console.log(
    `[inactivity-warning] Sent ${warned} warning email(s); ${skipped} already warned; ${failed} failed`,
  )
  return NextResponse.json({ warned, skipped, failed })
}
