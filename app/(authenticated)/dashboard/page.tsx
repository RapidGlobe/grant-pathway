import type { Metadata } from 'next'
import { DashboardEmpty } from '@/components/dashboard-empty'
import { DashboardPopulated } from '@/components/dashboard-populated'
import { createClient } from '@/lib/supabase/server'
import { getCharityProfile } from '@/actions/charity'
import type { ApplicationSummary, ApplicationStatus } from '@/actions/applications'

export const metadata: Metadata = {
  title: 'My Applications',
}

/**
 * Dashboard page (S2.1).
 *
 * Fetches in parallel:
 *   - Charity profile existence (for profile-incomplete banner)
 *   - Applications list sorted by updated_at descending
 *   - Current-month AI usage count from ai_usage_log
 *
 * Renders DashboardEmpty when the user has no applications yet,
 * DashboardPopulated otherwise. The ?state URL param used in the
 * static shell is no longer needed and is removed.
 */
export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName =
    (user?.user_metadata?.first_name as string | undefined) ?? ''

  // Start of the current calendar month in ISO format (used for AI usage count)
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  ).toISOString()

  const [profile, applicationsResult, usageResult] = await Promise.all([
    getCharityProfile(),

    supabase
      .from('applications')
      .select('id, funder_name, grant_name, status, current_step, updated_at')
      .eq('user_id', user?.id ?? '')
      .order('updated_at', { ascending: false }),

    supabase
      .from('ai_usage_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user?.id ?? '')
      .gte('created_at', monthStart),
  ])

  const profileIncomplete = !profile

  const applications: ApplicationSummary[] = (applicationsResult.data ?? []).map(
    (row) => ({
      id: row.id,
      funderName: row.funder_name,
      grantName: row.grant_name,
      status: row.status as ApplicationStatus,
      currentStep: row.current_step,
      lastUpdated: row.updated_at,
    }),
  )

  const aiRequestsUsed = usageResult.count ?? 0

  if (applications.length === 0) {
    return (
      <DashboardEmpty
        firstName={firstName}
        profileIncomplete={profileIncomplete}
      />
    )
  }

  return (
    <DashboardPopulated
      applications={applications}
      aiRequestsUsed={aiRequestsUsed}
      profileIncomplete={profileIncomplete}
    />
  )
}
