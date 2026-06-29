import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function updateSession(request: NextRequest, nonce?: string) {
  // Forward x-nonce to the page so the root layout can read it via headers()
  // and Next.js can stamp it on its own inline hydration scripts.
  const requestHeaders = new Headers(request.headers)
  if (nonce) requestHeaders.set('x-nonce', nonce)

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Re-create the response when cookies change — must re-use requestHeaders
          // so the x-nonce is not dropped when the session token is refreshed.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh the session token if it is close to expiry.
  // Must be called before any auth checks — do not add logic between
  // createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
