import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AccountSettingsForm } from '@/components/account-settings-form'

export const metadata: Metadata = {
  title: 'Account Settings',
}

/**
 * Account Settings page.
 * Reads the authenticated user's email and MFA status server-side and passes
 * them as props — no mock data, no query params needed (S0.6).
 */
export default async function AccountPage() {
  const supabase = await createClient()

  // Real email from auth.users
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? ''

  // MFA status — find the first verified TOTP factor (if any)
  const { data: factorsData } = await supabase.auth.mfa.listFactors()
  const totpFactor = factorsData?.totp?.find(
    (f) => f.factor_type === 'totp' && f.status === 'verified',
  )
  const mfaEnabled = !!totpFactor
  const mfaFactorId = totpFactor?.id ?? ''

  return <AccountSettingsForm email={email} mfaEnabled={mfaEnabled} mfaFactorId={mfaFactorId} />
}
