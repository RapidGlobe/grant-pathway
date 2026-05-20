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

  // Email verification: ?token_hash=xxx&type=email
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}/verify-email?state=verified`)
    }
  }

  // PKCE code exchange — used by OAuth providers and magic links
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/verify-email?state=verified`)
    }
  }

  // Token missing, invalid, or expired
  return NextResponse.redirect(`${origin}/verify-email?state=expired`)
}
