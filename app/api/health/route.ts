// Health endpoint — required by ADR-OPS-007
// Polled every 5 minutes by UptimeRobot to confirm both application
// availability and database connectivity.
//
// Returns 200 { status: 'ok', region }  — app is running, Supabase is reachable
// Returns 503 { status: 'error', region } — database query failed
//
// No authentication required — this route is explicitly excluded from
// session handling in proxy.ts so UptimeRobot can reach it without a session.
//
// `region` reports VERCEL_REGION, the region the function actually executed in
// (GAP-110, 2026-08-17). It exists because there was no way to observe this:
// the `vercel.region` field in the Axiom log drain reports `fra1` even though
// Frankfurt has never been selected in Function Regions, so it is measuring
// something other than execution — and a dashboard checkbox is a statement of
// intent, not evidence. `null` locally, where Vercel sets nothing.
//
// `status` is deliberately the first key and its values are unchanged, because
// P5.6 adds an UptimeRobot keyword monitor looking for `"status":"ok"`.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const region = process.env.VERCEL_REGION ?? null

  try {
    const supabase = await createClient()
    // Lightweight query — confirms DB connectivity without returning user data
    await supabase.from('user_profiles').select('count').limit(1)
    return NextResponse.json({ status: 'ok', region }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'error', region }, { status: 503 })
  }
}
