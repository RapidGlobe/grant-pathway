import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Public API routes — bypass session handling entirely (ADR-OPS-007)
// These routes must be reachable without a session (e.g. UptimeRobot health checks).
// They are listed here rather than in the matcher so the intent is explicit.
const PUBLIC_API = ['/api/health']

// Protected routes — require an authenticated session (D1 resolution: plural /applications)
// /mfa is the TOTP challenge page reached after password auth when aal2 is required (S0.6)
const PROTECTED = ['/dashboard', '/profile', '/applications', '/account', '/mfa']

// Auth-only routes — redirect to /dashboard if already signed in.
// NOTE: /verify-email and /forgot-password are intentionally excluded.
// After clicking their email link the user is authenticated (Supabase sets
// an email-confirmation or recovery session in the callback) and the
// callback redirects them here.  Putting those routes in AUTH_ONLY would
// bounce them to /dashboard before they can see the confirmation or set
// their new password.
const AUTH_ONLY = ['/', '/register']

function isProtected(pathname: string) {
  return PROTECTED.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

function isAuthOnly(pathname: string) {
  return AUTH_ONLY.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public API routes bypass session handling entirely — return immediately
  // without calling updateSession() so no Supabase SSR overhead is incurred
  if (PUBLIC_API.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request)

  // Unauthenticated user trying to access a protected route → sign in page
  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return redirectWithCookies(url, supabaseResponse)
  }

  // Authenticated user trying to access sign in / register → dashboard
  if (user && isAuthOnly(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return redirectWithCookies(url, supabaseResponse)
  }

  // All other requests — return the response with refreshed session cookies
  return supabaseResponse
}

/**
 * Returns a redirect response that carries the refreshed Supabase session
 * cookies from `supabaseResponse`. Without this, the session token is not
 * refreshed on redirect responses and users may be spuriously logged out.
 * See: https://supabase.com/docs/guides/auth/server-side/nextjs (SSR cookie warning)
 */
function redirectWithCookies(url: URL, supabaseResponse: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url)
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie)
  })
  return redirect
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
