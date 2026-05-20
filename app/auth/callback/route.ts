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
// On success → /verify-email?state=verified  (session cookies set)
// On failure → /verify-email?state=expired   (invalid or expired token)
//
// This route is intentionally NOT in the AUTH_ONLY list in proxy.ts — it must
// be reachable by authenticated and unauthenticated users alike.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  // Token hash flow — covers email verification (type=email) and password
  // reset (type=recovery). Route the success/failure redirect based on type.
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      if (type === 'recovery') {
        // Recovery session set — send user to the "choose new password" form
        return NextResponse.redirect(`${origin}/forgot-password?state=reset`)
      }
      return NextResponse.redirect(`${origin}/verify-email?state=verified`)
    }
    // Token was invalid or expired — route to the appropriate expired state
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/forgot-password?state=expired`)
    }
    return NextResponse.redirect(`${origin}/verify-email?state=expired`)
  }

  // PKCE code exchange — used by OAuth providers and magic links
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/verify-email?state=verified`)
    }
  }

  // Token/code missing — fall back to verify-email expired state
  return NextResponse.redirect(`${origin}/verify-email?state=expired`)
}
