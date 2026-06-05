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

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { sendEmail } from '@/lib/emails/send'
import { buildInactivityWarningEmail } from '@/lib/emails/inactivity-warning'

function subMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
}

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
  const twentyThreeMonthsAgo = subMonths(now, 23)
  const twentyFourMonthsAgo = subMonths(now, 24)

  // Page through all users — filter client-side for the 23-month window
  let warned = 0
  let page = 1

  while (true) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 })

    if (error) {
      console.error('[inactivity-warning] Failed to list users:', error)
      return NextResponse.json({ error: 'Failed to list users.' }, { status: 500 })
    }

    if (!data?.users?.length) break

    for (const user of data.users) {
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null

      // Skip users who have never signed in
      if (!lastSignIn) continue

      // In the 23-month window: ≥23 months ago AND <24 months ago
      if (lastSignIn >= twentyFourMonthsAgo && lastSignIn < twentyThreeMonthsAgo) {
        const firstName = (user.user_metadata?.first_name as string | undefined) ?? 'there'
        const email = user.email
        if (!email) continue

        // Deletion date = last sign-in + 24 months
        const deletionDate = new Date(lastSignIn)
        deletionDate.setMonth(deletionDate.getMonth() + 24)

        try {
          await sendEmail({
            to: email,
            subject: 'Your Grant Pathway account will be deleted in 30 days',
            html: buildInactivityWarningEmail(firstName, formatDate(deletionDate)),
          })
          warned++
        } catch (emailErr) {
          console.error(`[inactivity-warning] Failed to send warning to user ${user.id}:`, emailErr)
        }
      }
    }

    if (data.users.length < 1000) break
    page++
  }

  console.log(`[inactivity-warning] Sent ${warned} inactivity warning email(s)`)
  return NextResponse.json({ warned })
}
