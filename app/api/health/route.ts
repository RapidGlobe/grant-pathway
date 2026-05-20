// Health endpoint — required by ADR-OPS-007
// Polled every 5 minutes by UptimeRobot to confirm both application
// availability and database connectivity.
//
// Returns 200 { status: 'ok' }  — app is running, Supabase is reachable
// Returns 503 { status: 'error' } — database query failed
//
// No authentication required — this route is explicitly excluded from
// session handling in proxy.ts so UptimeRobot can reach it without a session.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    // Lightweight query — confirms DB connectivity without returning user data
    await supabase.from('user_profiles').select('count').limit(1)
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
