import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// TEMPORARY — D-012 experiment logging (added 2026-07-02, remove once WJ's
// browser experiment is done — see CHANGELOG.md and regression-test-plan.md).
// Not previously any visibility into hits on this route; this makes every
// hit visible (user agent, IP, which branch, and the exact result) so we can
// see whether this route gets hit more than once per confirmation link, and
// by what, before deciding on a permanent fix.
// ---------------------------------------------------------------------------
function logCallbackHit(request: Request, label: string, extra: Record<string, unknown>) {
  const info = {
    label,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
    timestamp: new Date().toISOString(),
    ...extra,
  }
  console.log('[D-012-EXPERIMENT]', JSON.stringify(info))
  Sentry.captureMessage(`D-012 experiment: ${label}`, {
    level: 'info',
    tags: { experiment: 'd-012-auth-callback' },
    extra: info,
  })
}

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
  const next = searchParams.get('next')

  logCallbackHit(request, 'entry', {
    hasTokenHash: !!token_hash,
    tokenHashPrefix: token_hash?.slice(0, 12) ?? null,
    type,
    hasCode: !!code,
    codePrefix: code?.slice(0, 12) ?? null,
    next,
  })

  // Token hash flow — covers email verification (type=email) and password
  // reset (type=recovery). Route the success/failure redirect based on type.
  if (token_hash && type) {
    const supabase = await createClient()

    // For recovery tokens, sign out any existing session first. If the user
    // is already signed in and clicks the reset link, the active session
    // causes verifyOtp to fail with "token expired". Signing out first gives
    // verifyOtp a clean slate to create the recovery session.
    if (type === 'recovery') {
      await supabase.auth.signOut()
    }

    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    logCallbackHit(request, 'verifyOtp result', {
      tokenHashPrefix: token_hash.slice(0, 12),
      type,
      success: !error,
      errorMessage: error?.message ?? null,
      errorCode: error?.code ?? null,
    })
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

  // PKCE code exchange — used by OAuth providers, magic links, and password
  // reset (resetPasswordForEmail passes next=reset in redirectTo so we can
  // distinguish recovery from email verification here).
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    logCallbackHit(request, 'exchangeCodeForSession result', {
      codePrefix: code.slice(0, 12),
      next,
      success: !error,
      errorMessage: error?.message ?? null,
      errorCode: error?.code ?? null,
    })
    if (!error) {
      if (next === 'reset') {
        return NextResponse.redirect(`${origin}/forgot-password?state=reset`)
      }
      return NextResponse.redirect(`${origin}/verify-email?state=verified`)
    }
    if (next === 'reset') {
      return NextResponse.redirect(`${origin}/forgot-password?state=expired`)
    }
  }

  // Token/code missing — fall back to verify-email expired state
  logCallbackHit(request, 'fallback to expired', { code: !!code, token_hash: !!token_hash })
  return NextResponse.redirect(`${origin}/verify-email?state=expired`)
}
