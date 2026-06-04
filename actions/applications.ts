'use server'

// Application Server Actions (Slice 2)
// createApplication, deleteApplication, and reopenApplication are centralised
// here so dashboard components and page routes stay thin.

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type ApplicationStatus =
  | 'not_started'
  | 'in_progress'
  | 'approved'
  | 'exported'
  | 'mismatch'

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
// P5.FD4 — Fetch approved funder list for Step 1 picker
// ---------------------------------------------------------------------------

export type FunderOption = {
  id: string
  name: string
  funderType: 'structured' | 'narrative'
}

/**
 * Returns all active funders from the approved directory, ordered
 * alphabetically. Used to populate the searchable picker on Step 1.
 *
 * Called server-side in the Step 1 page component so the list is
 * available on first render with no client-side fetch.
 */
export async function getActiveFunders(): Promise<FunderOption[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('funders')
    .select('id, name, funder_type')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error || !data) return []

  return data.map((f) => ({
    id: f.id,
    name: f.name,
    funderType: f.funder_type as 'structured' | 'narrative',
  }))
}

// ---------------------------------------------------------------------------
// S3.1 / S3.2 — Save Step 1 (Application Details)
// ---------------------------------------------------------------------------

/**
 * Saves funder_id, funder_name, and grant_name for an existing application
 * and redirects to Step 2.
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
  funderId: string,
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
        funder_id: funderId,
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
      .select('current_step, draft_status')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    const newStep = Math.max(existing?.current_step ?? 3, 4)

    // If the user has already confirmed the prep checklist (draft_status =
    // 'in_progress') but navigates back to Step 3 and continues again, reset
    // to 'not_started' so the checklist is shown on the next visit to Step 4.
    // Do not reset if further along (ready_to_assemble / assembled).
    const updates: Record<string, unknown> = { current_step: newStep }
    if (existing?.draft_status === 'in_progress') {
      updates.draft_status = 'not_started'
    }

    const { error } = await supabase
      .from('applications')
      .update(updates)
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

  revalidatePath(`/applications/${applicationId}/step/4`)
  redirect(`/applications/${applicationId}/step/4`)
}

// ---------------------------------------------------------------------------
// FR-47 — Set application status to 'mismatch' (eligibility hard stop)
// ---------------------------------------------------------------------------

/**
 * Called when the user acknowledges the eligibility mismatch warning on Step 3.
 * Sets status = 'mismatch' and redirects to the dashboard.
 *
 * Applications in mismatch state cannot be advanced to Step 4. The user must
 * correct their charity profile and create a new application (DR-EL-001).
 */
export async function setApplicationMismatch(
  applicationId: string,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { error } = await supabase
    .from('applications')
    .update({ status: 'mismatch' })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Could not update application status. Please try again.' }
  }

  redirect('/dashboard')
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

  revalidatePath(`/applications/${applicationId}/step/4`)
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

// ---------------------------------------------------------------------------
// FR-33 — Approve answer (per-question explicit approval step)
// ---------------------------------------------------------------------------

/**
 * Sets is_approved = true on a single application_answers row.
 * Called from Step 4 when the user clicks "Approve this answer" after
 * reviewing all three FR-32 review prompts. Resets to false if the user
 * subsequently edits the answer (handled client-side via unapproveAnswer).
 */
export async function approveAnswer(
  answerId: string,
): Promise<SaveAnswerResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase
    .from('application_answers')
    .update({ is_approved: true })
    .eq('id', answerId)
    .eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Could not approve your answer. Please try again.' }
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
 * answered). Sets draft_status = 'ready_to_assemble' and redirects back to
 * Step 4, where the senior review screen is shown (S6.7).
 *
 * current_step is NOT advanced here — it advances to 5 only after the draft
 * is assembled (in assembleAndAdvance). This prevents the user from reaching
 * Step 5 before assembly is complete.
 */
export async function setDraftReadyToAssemble(
  applicationId: string,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { error } = await supabase
    .from('applications')
    .update({ draft_status: 'ready_to_assemble' })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Could not save your progress. Please try again.' }
  }

  revalidatePath(`/applications/${applicationId}/step/4`)
  redirect(`/applications/${applicationId}/step/4`)
}

// ---------------------------------------------------------------------------
// S6.7 — Assemble draft and advance to Step 5
// ---------------------------------------------------------------------------

export type AssembleAndAdvanceResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Called when the user confirms on the senior review screen. Assembles all
 * answered questions into a single formatted draft, saves it to
 * applications.assembled_draft, sets draft_status = 'assembled', advances
 * current_step to 5, and redirects to Step 5.
 *
 * Assembly format is funder-type-aware (AC-FR-31A):
 *   structured — numbered Q&A pairs (question then answer, separated)
 *   free_form  — same format; section headings derived from question text
 *
 * No AI is used — this is a pure text formatting step. The charity's words
 * are reproduced verbatim; AI is not involved in the assembly.
 *
 * Unanswered questions are omitted from the assembled draft. In practice all
 * questions should be answered before this action is reachable (the UI gate
 * requires allAnswered), but the assembly is robust to partial completion.
 */
export async function assembleAndAdvance(
  applicationId: string,
): Promise<AssembleAndAdvanceResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  // ── Verify ownership and current draft_status ──────────────────────────────
  const { data: appRow, error: appError } = await supabase
    .from('applications')
    .select('current_step, draft_status, ai_summary')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (appError || !appRow) {
    return { ok: false, error: 'Application not found.' }
  }

  if (appRow.draft_status !== 'ready_to_assemble') {
    return { ok: false, error: 'Application is not ready to assemble.' }
  }

  // ── Fetch answered questions in order ─────────────────────────────────────
  const { data: answerRows, error: answersError } = await supabase
    .from('application_answers')
    .select('question_order, question_text, answer_text')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .order('question_order')

  if (answersError) {
    return { ok: false, error: 'Could not load your answers. Please try again.' }
  }

  const answered = (answerRows ?? []).filter(
    (r) => typeof r.answer_text === 'string' && r.answer_text.trim() !== '',
  )

  // ── Detect funder type for assembly format ────────────────────────────────
  let funderType: 'structured' | 'free_form' = 'structured'
  if (typeof appRow.ai_summary === 'string' && appRow.ai_summary) {
    try {
      const parsed = JSON.parse(appRow.ai_summary) as { funder_type?: string }
      if (parsed.funder_type === 'free_form') funderType = 'free_form'
    } catch {
      // parse failed — default to structured
    }
  }

  // ── Format assembled_draft ────────────────────────────────────────────────
  // free_form: section title then answer (no number prefix — narrative flow)
  // structured: numbered Q&A pairs
  let assembledDraft: string

  if (answered.length === 0) {
    assembledDraft = ''
  } else {
    assembledDraft = answered
      .map((r) =>
        funderType === 'free_form'
          ? `${r.question_text}\n\n${r.answer_text}`
          : `${r.question_order}. ${r.question_text}\n\n${r.answer_text}`,
      )
      .join('\n\n---\n\n')
  }

  // ── Save assembled_draft and advance ──────────────────────────────────────
  const newStep = Math.max(appRow.current_step ?? 4, 5)

  const { error: saveError } = await supabase
    .from('applications')
    .update({
      assembled_draft: assembledDraft,
      draft_status: 'assembled',
      current_step: newStep,
    })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (saveError) {
    return { ok: false, error: 'Could not save your draft. Please try again.' }
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
 *   3. Resets draft_status = 'in_progress' (clears 'assembled' / 'ready_to_assemble')
 *   4. Clears assembled_draft (will be regenerated when user re-assembles)
 *   5. Resets is_approved = false on all application_answers rows
 *
 * draft_status must be reset so the Step 4 gate shows the Q&A interface
 * rather than immediately redirecting back to Step 5 (S6.8 gate fix).
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

  // 1. Update application status, step, and draft state
  const { error: appError } = await supabase
    .from('applications')
    .update({
      status: 'in_progress',
      current_step: 4,
      draft_status: 'in_progress',
      assembled_draft: null,
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
