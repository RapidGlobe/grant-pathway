import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Auth callback — handles the redirect from Supabase after email verification
// (S0.2). The verification email link goes to the Supabase Auth server first
// (to validate the token), which then redirects here with either:
//   • ?token_hash=xxx&type=email  — email OTP flow (email confirmation)
//   • ?code=xxx                   — PKCE code exchange (OAuth, magic links)
//
// Password recovery (type=recovery, or next=reset) completes immediately here,
// same as before — that flow is unaffected by D-012.
//
// Everything else (signup confirmation) does NOT complete here any more.
// D-012: completing verification on a bare page load meant Gmail's own
// server-side link scanning was silently consuming the single-use link
// within seconds of the email being sent, before the real person ever saw
// it -- confirmed across 5/5 sampled accounts going back a month, regardless
// of browser. Loading a page is something any automated scanner does; instead
// we redirect to /verify-email/confirm, which requires an explicit button
// click (a real user action, not a page fetch) before the token is spent.
// See CHANGELOG.md, 2026-07-02, D-012.
//
// This route is intentionally NOT in the AUTH_ONLY list in proxy.ts — it must
// be reachable by authenticated and unauthenticated users alike.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Token hash flow. Recovery completes immediately (unchanged); anything
  // else (signup confirmation) defers to the explicit-confirm page.
  if (token_hash && type) {
    if (type === 'recovery') {
      const supabase = await createClient()
      // Sign out any existing session first. If the user is already signed
      // in and clicks the reset link, the active session causes verifyOtp
      // to fail with "token expired". Signing out first gives verifyOtp a
      // clean slate to create the recovery session.
      await supabase.auth.signOut()

      const { error } = await supabase.auth.verifyOtp({ token_hash, type })
      if (!error) {
        return NextResponse.redirect(`${origin}/forgot-password?state=reset`)
      }
      return NextResponse.redirect(`${origin}/forgot-password?state=expired`)
    }

    return NextResponse.redirect(
      `${origin}/verify-email/confirm?token_hash=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(type)}`,
    )
  }

  // PKCE code exchange. next=reset (password recovery) completes immediately
  // (unchanged); anything else (signup confirmation) defers to the
  // explicit-confirm page.
  if (code) {
    if (next === 'reset') {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}/forgot-password?state=reset`)
      }
      return NextResponse.redirect(`${origin}/forgot-password?state=expired`)
    }

    return NextResponse.redirect(`${origin}/verify-email/confirm?code=${encodeURIComponent(code)}`)
  }

  // Token/code missing — fall back to verify-email expired state
  return NextResponse.redirect(`${origin}/verify-email?state=expired`)
}
