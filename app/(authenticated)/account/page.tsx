import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AccountSettingsForm } from '@/components/account-settings-form'

export const metadata: Metadata = {
  title: 'Account Settings',
}

/**
 * Account Settings page.
 * Reads the authenticated user's email server-side and passes it as a prop.
 */
export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? ''

  return <AccountSettingsForm email={email} />
}
