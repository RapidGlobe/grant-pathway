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
// S3.1 / S3.2 — Save Step 1 (Application Details)
// ---------------------------------------------------------------------------

/**
 * Saves funder_name and grant_name for an existing application and
 * redirects to Step 2.
 *
 * current_step advances to 2 on first save (new application). If the
 * user returns to Step 1 later (current_step already >= 2), current_step
 * is left unchanged so their progress further along is not reset.
 *
 * Returns { ok: false, error } only when the DB update fails — the
 * success path always calls redirect() and never returns normally.
 */
export async function saveApplicationStep1(
  applicationId: string,
  funderName: string,
  grantName: string,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  try {
    // Fetch current step so we only advance it, never regress it
    const { data: existing } = await supabase
      .from('applications')
      .select('current_step')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    const newStep = Math.max(existing?.current_step ?? 1, 2)

    const { error } = await supabase
      .from('applications')
      .update({
        funder_name: funderName,
        grant_name: grantName,
        current_step: newStep,
      })
      .eq('id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      return { ok: false, error: 'Could not save your application. Please try again.' }
    }
  } catch {
    // Network error or Supabase unavailable
    return { ok: false, error: 'Could not reach the server. Please check your connection and try again.' }
  }

  redirect(`/applications/${applicationId}/step/2`)
}

// ---------------------------------------------------------------------------
// S4.2 — Advance to Step 3 (saves guidelines progress)
// ---------------------------------------------------------------------------

/**
 * Called when the user clicks Continue on Step 2 (after uploading a file
 * or entering paste text). Sets status = 'in_progress' (the not_started →
 * in_progress transition per D8 / application-status-model.md) and advances
 * current_step to 3 (never regresses if already further along).
 *
 * The guidelines text is stored client-side in sessionStorage by this point
 * (via setGuidelines in lib/guidelines-session.ts) — it is never sent to or
 * stored in the database (ADR-DATA-002, ADR-FILE-004).
 *
 * Returns never on success (calls redirect). Returns { ok: false, error }
 * only when the DB update fails.
 */
export async function advanceToStep3(
  applicationId: string,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  try {
    // Fetch current step to avoid regression
    const { data: existing } = await supabase
      .from('applications')
      .select('current_step')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    const newStep = Math.max(existing?.current_step ?? 2, 3)

    const { error } = await supabase
      .from('applications')
      .update({
        status: 'in_progress',
        current_step: newStep,
      })
      .eq('id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      return { ok: false, error: 'Could not save your progress. Please try again.' }
    }
  } catch {
    return {
      ok: false,
      error: 'Could not reach the server. Please check your connection and try again.',
    }
  }

  redirect(`/applications/${applicationId}/step/3`)
}

// ---------------------------------------------------------------------------
// S5.4 — Advance to Step 4 (summary confirmed)
// ---------------------------------------------------------------------------

/**
 * Called when the user clicks "This looks right — continue" on Step 3.
 * Advances current_step to 4 (never regresses if already further along).
 * Does NOT change status — it remains 'in_progress' from Step 2.
 *
 * Returns never on success (calls redirect). Returns { ok: false, error }
 * only when the DB update fails.
 */
export async function advanceToStep4(
  applicationId: string,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  try {
    const { data: existing } = await supabase
      .from('applications')
      .select('current_step')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    const newStep = Math.max(existing?.current_step ?? 3, 4)

    const { error } = await supabase
      .from('applications')
      .update({ current_step: newStep })
      .eq('id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      return { ok: false, error: 'Could not save your progress. Please try again.' }
    }
  } catch {
    return {
      ok: false,
      error: 'Could not reach the server. Please check your connection and try again.',
    }
  }

  redirect(`/applications/${applicationId}/step/4`)
}

// ---------------------------------------------------------------------------
// S6.4 — Set draft_status to 'in_progress' (preparation checklist confirmed)
// ---------------------------------------------------------------------------

/**
 * Called when the user clicks "I have what I need — start writing" on the
 * Step 4 preparation checklist. Sets draft_status = 'in_progress' so the
 * checklist is not shown again on return visits (AC-FR-28-02).
 *
 * Redirects back to Step 4 on success so the page re-renders showing the
 * Q&A interface instead of the preparation checklist.
 */
export async function setDraftInProgress(
  applicationId: string,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { error } = await supabase
    .from('applications')
    .update({ draft_status: 'in_progress' })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Could not save your progress. Please try again.' }
  }

  redirect(`/applications/${applicationId}/step/4`)
}

// ---------------------------------------------------------------------------
// S6.3 — Save answer (auto-save and manual save from Step 4)
// ---------------------------------------------------------------------------

export type SaveAnswerResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Saves a single answer text for an existing application_answers row.
 * Called by the debounced auto-save (400 ms) and the 60-second background
 * save in the Step 4 component.
 *
 * answer_source must be 'user_edited' (user modified an AI-generated answer)
 * or 'user_written' (user wrote without AI). 'ai_generated' is set by the
 * /api/generate-draft route only, never by this action.
 *
 * user_id check is belt-and-braces in addition to RLS on application_answers.
 */
export async function saveAnswer(
  answerId: string,
  answerText: string,
  answerSource: 'user_edited' | 'user_written',
): Promise<SaveAnswerResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase
    .from('application_answers')
    .update({
      answer_text: answerText,
      answer_source: answerSource,
    })
    .eq('id', answerId)
    .eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Could not save your answer. Please try again.' }
  }

  return { ok: true }
}

/**
 * Upserts a single manually-entered question + answer.
 * Used when no questions were extracted from the guidelines.
 * V1 supports one manual question (question_order = 1).
 * ON CONFLICT updates the row so re-submitting the form is idempotent.
 */
export async function saveManualAnswer(
  applicationId: string,
  questionText: string,
  answerText: string,
): Promise<SaveAnswerResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  if (!questionText.trim()) {
    return { ok: false, error: 'Please enter your application question.' }
  }

  const { error } = await supabase
    .from('application_answers')
    .upsert(
      {
        application_id: applicationId,
        user_id: user.id,
        question_text: questionText.trim(),
        question_order: 1,
        answer_text: answerText.trim() || null,
        answer_source: 'user_written',
      },
      { onConflict: 'application_id,question_order' },
    )

  if (error) {
    return { ok: false, error: 'Could not save your answer. Please try again.' }
  }

  return { ok: true }
}

// ---------------------------------------------------------------------------
// S6.5 — Mark draft ready to assemble
// ---------------------------------------------------------------------------

/**
 * Called when the user clicks "Ready to assemble" on Step 4 (all questions
 * answered). Sets draft_status = 'ready_to_assemble', advances current_step
 * to 5 (never regresses), and redirects to Step 5.
 *
 * S6.7 will later intercept the 'ready_to_assemble' state to run assembly
 * before the user reaches Step 5. For now the redirect goes straight to Step 5.
 */
export async function setDraftReadyToAssemble(
  applicationId: string,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  try {
    const { data: existing } = await supabase
      .from('applications')
      .select('current_step')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    const newStep = Math.max(existing?.current_step ?? 4, 5)

    const { error } = await supabase
      .from('applications')
      .update({
        draft_status: 'ready_to_assemble',
        current_step: newStep,
      })
      .eq('id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      return { ok: false, error: 'Could not save your progress. Please try again.' }
    }
  } catch {
    return {
      ok: false,
      error: 'Could not reach the server. Please check your connection and try again.',
    }
  }

  redirect(`/applications/${applicationId}/step/5`)
}

// ---------------------------------------------------------------------------
// S6.4 — Advance to Step 5 (legacy — superseded by setDraftReadyToAssemble)
// ---------------------------------------------------------------------------

/**
 * Called when the user clicks "I've reviewed my answers — continue" on Step 4.
 * Advances current_step to 5 (never regresses if already further along).
 * Does not change status — it remains 'in_progress' from Step 2.
 *
 * Returns never on success (calls redirect). Returns { ok: false, error }
 * only when the DB update fails.
 */
export async function advanceToStep5(
  applicationId: string,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  try {
    const { data: existing } = await supabase
      .from('applications')
      .select('current_step')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    const newStep = Math.max(existing?.current_step ?? 4, 5)

    const { error } = await supabase
      .from('applications')
      .update({ current_step: newStep })
      .eq('id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      return { ok: false, error: 'Could not save your progress. Please try again.' }
    }
  } catch {
    return {
      ok: false,
      error: 'Could not reach the server. Please check your connection and try again.',
    }
  }

  redirect(`/applications/${applicationId}/step/5`)
}

// ---------------------------------------------------------------------------
// S7.1 — Approve application
// ---------------------------------------------------------------------------

export type ApproveApplicationResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Approves an application:
 *   1. Sets applications.status = 'approved'
 *   2. Sets is_approved = true on all application_answers rows
 *
 * The client updates local state after receiving { ok: true }.
 * updated_at is managed by the database trigger on both tables.
 */
export async function approveApplication(
  applicationId: string,
): Promise<ApproveApplicationResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  // 1. Update application status (ownership check via user_id)
  const { error: appError } = await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (appError) {
    return { ok: false, error: 'Could not approve the application. Please try again.' }
  }

  // 2. Set is_approved on all answers (non-fatal if no answers exist)
  await supabase
    .from('application_answers')
    .update({ is_approved: true })
    .eq('application_id', applicationId)

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
