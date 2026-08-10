import { NavAuthenticated } from '@/components/nav-authenticated'
import { SiteFooter } from '@/components/site-footer'
import { SessionTimeoutProvider } from '@/components/session-timeout-provider'
import { createClient } from '@/lib/supabase/server'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  // Read the authenticated user's name for the nav.
  // first_name is stored in user_metadata (set via options.data in signUp).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? ''
  const email = user?.email ?? ''

  return (
    <>
      <NavAuthenticated firstName={firstName} email={email} />

      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>

      <SiteFooter />

      {/* 60-minute inactivity session timeout (FR-06 / S0.5) */}
      <SessionTimeoutProvider />
    </>
  )
}
