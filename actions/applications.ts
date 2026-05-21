'use server'

// Application Server Actions (Slice 2)
// createApplication, deleteApplication, and reopenApplication are centralised
// here so dashboard components and page routes stay thin.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type ApplicationStatus =
  | 'not_started'
  | 'in_progress'
  | 'approved'
  | 'exported'

/**
 * Lightweight application summary used by the dashboard list.
 * Fetched server-side in DashboardPage and passed as props to
 * DashboardPopulated.
 */
export type ApplicationSummary = {
  id: string
  funderName: string
  grantName: string
  status: ApplicationStatus
  currentStep: number
  lastUpdated: string
}

// ---------------------------------------------------------------------------
// S2.2 — Create application
// ---------------------------------------------------------------------------

/**
 * Creates a new empty application row for the authenticated user and
 * immediately redirects to Step 1 of the new application.
 *
 * funder_name and grant_name start as empty strings — they are saved
 * to the database when the user submits Step 1 (S3.1).
 *
 * Called from /applications/new (server component) which acts as a
 * creation intermediary — no UI is rendered on that page.
 *
 * Returns never because it always calls redirect().
 */
export async function createApplication(): Promise<never> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      funder_name: '',
      grant_name: '',
      status: 'not_started',
      current_step: 1,
    })
    .select('id')
    .single()

  if (error || !data) {
    // Creation failed — return user to dashboard rather than showing a
    // blank page. Sentry will capture the error if configured.
    redirect('/dashboard')
  }

  redirect(`/applications/${data.id}/step/1`)
}

// ---------------------------------------------------------------------------
// S2.4 — Delete application
// ---------------------------------------------------------------------------

export type DeleteApplicationResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Hard-deletes an application owned by the authenticated user.
 *
 * application_answers rows cascade-delete automatically via the FK
 * constraint (ON DELETE CASCADE). ai_usage_log rows are retained with
 * application_id set to null (ON DELETE SET NULL) so usage history is
 * preserved for billing purposes.
 *
 * RLS on the applications table ensures users can only delete their own
 * rows — the .eq('user_id', user.id) filter is belt-and-braces.
 */
export async function deleteApplication(
  applicationId: string,
): Promise<DeleteApplicationResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Could not delete the application. Please try again.' }
  }

  return { ok: true }
}

// ---------------------------------------------------------------------------
// S2.3 — Re-open application
// ---------------------------------------------------------------------------

export type ReopenApplicationResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Re-opens an approved or exported application:
 *   1. Sets applications.status = 'in_progress'
 *   2. Sets applications.current_step = 4 (Draft Answers)
 *   3. Resets is_approved = false on all application_answers rows
 *
 * The client redirects to Step 4 after receiving { ok: true }.
 * updated_at is managed by the database trigger on both tables.
 */
export async function reopenApplication(
  applicationId: string,
): Promise<ReopenApplicationResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  // 1. Update application status and step
  const { error: appError } = await supabase
    .from('applications')
    .update({
      status: 'in_progress',
      current_step: 4,
    })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (appError) {
    return { ok: false, error: 'Could not re-open the application. Please try again.' }
  }

  // 2. Reset is_approved on all answers (non-fatal if no answers exist yet)
  await supabase
    .from('application_answers')
    .update({ is_approved: false })
    .eq('application_id', applicationId)

  return { ok: true }
}
