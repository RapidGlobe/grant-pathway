import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Protected routes — require an authenticated session (D1 resolution: plural /applications)
const PROTECTED = ['/dashboard', '/profile', '/applications', '/account']

// Auth-only routes — redirect to /dashboard if already signed in
const AUTH_ONLY = ['/', '/register', '/verify-email', '/forgot-password']

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
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

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
