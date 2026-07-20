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

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { sendEmail } from '@/lib/emails/send'
import { buildAccountDeletedInactivityEmail } from '@/lib/emails/account-deleted-inactivity'

function subMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
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
  const twentyFourMonthsAgo = subMonths(now, 24)

  let deleted = 0
  let page = 1

  while (true) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 })

    if (error) {
      console.error('[inactivity-deletion] Failed to list users:', error)
      return NextResponse.json({ error: 'Failed to list users.' }, { status: 500 })
    }

    if (!data?.users?.length) break

    for (const user of data.users) {
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null

      // Skip users who have never signed in
      if (!lastSignIn) continue

      // 24+ months of inactivity
      if (lastSignIn < twentyFourMonthsAgo) {
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
          continue
        }

        console.log(`[inactivity-deletion] Deleted inactive user ${userId}`)
        deleted++

        // Send Email 4 — fire and forget; log failure but continue
        if (email) {
          try {
            await sendEmail({
              to: email,
              subject: 'Your Grant Pathway account has been deleted',
              html: buildAccountDeletedInactivityEmail(firstName),
            })
          } catch (emailErr) {
            console.error(`[inactivity-deletion] Email 4 failed for user ${userId}:`, emailErr)
          }
        }
      }
    }

    if (data.users.length < 1000) break
    page++
  }

  console.log(`[inactivity-deletion] Deleted ${deleted} inactive account(s)`)
  return NextResponse.json({ deleted })
}
