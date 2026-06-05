import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ApplicationStatus = 'not_started' | 'in_progress' | 'approved' | 'exported'

export type DraftStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready_to_assemble'
  | 'assembled'
  | 'exported'

export type ApplicationData = {
  funderName: string
  grantName: string
  status: ApplicationStatus
  currentStep: number
  aiSummary: string | null
  draftStatus: DraftStatus
}

/**
 * Fetches an application row, verifies ownership, and enforces step locking.
 *
 * Step locking rule: a user may not access a step number higher than
 * the application's current_step. Attempting to do so redirects them
 * to their current step so they must complete steps in order.
 *
 * Backward navigation is always allowed — a user may return to any
 * step they have already completed (requestedStep <= current_step).
 *
 * Redirects:
 *   - / .............. if the user is not authenticated
 *   - /dashboard ..... if the application does not exist or belongs to
 *                      a different user (RLS also enforces this)
 *   - /applications/[id]/step/[current_step] ... if requestedStep is
 *                      ahead of current_step (S3.3)
 *
 * Used by every step page (1–5) so locking logic lives in one place.
 */
export async function getApplicationOrRedirect(
  applicationId: string,
  requestedStep: number,
): Promise<ApplicationData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data, error } = await supabase
    .from('applications')
    .select('funder_name, grant_name, status, current_step, ai_summary, draft_status')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) redirect('/dashboard')

  // Step locking — redirect forward-jumping users to their current step
  if (requestedStep > data.current_step) {
    redirect(`/applications/${applicationId}/step/${data.current_step}`)
  }

  return {
    funderName: data.funder_name,
    grantName: data.grant_name,
    status: data.status as ApplicationStatus,
    currentStep: data.current_step,
    aiSummary: data.ai_summary ?? null,
    draftStatus: (data.draft_status ?? 'not_started') as DraftStatus,
  }
}
