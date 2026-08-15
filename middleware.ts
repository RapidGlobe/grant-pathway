import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Public API routes — bypass session handling entirely (ADR-OPS-007, ADR-OPS-004)
// These routes must be reachable without a session:
//   /api/health  — polled by UptimeRobot without a session (ADR-OPS-007)
//   /api/cron    — called by Vercel Cron without a user session (ADR-OPS-004, GAP-13)
//                  Cron routes authenticate via CRON_SECRET header instead.
const PUBLIC_API = ['/api/health', '/api/cron']

// Protected routes — require an authenticated session (D1 resolution: plural /applications)
const PROTECTED = ['/dashboard', '/profile', '/applications', '/account']

// Auth-only routes — redirect to /dashboard if already signed in.
// NOTE: /verify-email and /forgot-password are intentionally excluded.
// After clicking their email link the user is authenticated (Supabase sets
// an email-confirmation or recovery session in the callback) and the
// callback redirects them here.  Putting those routes in AUTH_ONLY would
// bounce them to /dashboard before they can see the confirmation or set
// their new password.
const AUTH_ONLY = ['/', '/register']

// In development React requires 'unsafe-eval' for call-stack reconstruction.
const isDev = process.env.NODE_ENV === 'development'

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    // Sentry EU ingest — must be present or browser SDK requests are silently blocked
    "connect-src 'self' https://*.supabase.co https://*.ingest.de.sentry.io",
    "frame-ancestors 'none'",
    // Added 2026-08-15 (P5.2 security review, GAP-96/GAP-97).
    //
    // base-uri and form-action are the two directives here that do NOT fall
    // back to default-src — the CSP spec's fallback chain covers fetch
    // directives only. Without them, 'default-src self' gives no protection at
    // all on either axis:
    //   base-uri   — an injected <base> tag silently retargets every relative
    //                URL on the page, including the Next.js chunk paths.
    //   form-action— an injected <form> can post to an attacker's origin.
    //                This is the one that matters most here: Step 4 holds the
    //                charity's drafted answers in form state.
    // object-src does inherit from default-src, so 'none' is a tightening
    // rather than a fix — nothing in this app loads a plugin, and 'none' is
    // narrower than default-src's 'self'.
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ')
}

function isProtected(pathname: string) {
  return PROTECTED.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

function isAuthOnly(pathname: string) {
  return AUTH_ONLY.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Generate a fresh nonce for every request — used to replace 'unsafe-inline'
  // in script-src so only Next.js-stamped scripts execute (item 22, F-08-02).
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  // Public API routes bypass session handling entirely — return immediately
  // without calling updateSession() so no Supabase SSR overhead is incurred
  if (PUBLIC_API.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request, nonce)

  // Stamp the CSP header on every HTML response.
  supabaseResponse.headers.set('content-security-policy', csp)

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
