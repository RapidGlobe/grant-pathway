'use server'

// Application Server Actions (Slice 2)
// createApplication, deleteApplication, and reopenApplication are centralised
// here so dashboard components and page routes stay thin.

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { toGuidelineReferenceColumn } from '@/lib/guideline-citations'
import { GOVERNANCE_ITEMS } from '@/lib/governance-items'
import type { AiSummaryData } from '@/app/api/generate-summary/route'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type ApplicationStatus = 'not_started' | 'in_progress' | 'approved' | 'exported' | 'mismatch'

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

export type DeleteApplicationResult = { ok: true } | { ok: false; error: string }

/**
 * Hard-deletes an application owned by the authenticated user.
 *
 * application_items rows cascade-delete automatically via the FK
 * constraint (ON DELETE CASCADE). ai_usage_log rows are retained with
 * application_id set to null (ON DELETE SET NULL) so usage history is
 * preserved for billing purposes.
 *
 * RLS on the applications table ensures users can only delete their own
 * rows — the .eq('user_id', user.id) filter is belt-and-braces.
 */
export async function deleteApplication(applicationId: string): Promise<DeleteApplicationResult> {
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
// P6.5 — Reuse Previous Application (private, per-charity, per-funder)
// ---------------------------------------------------------------------------

export type PreviousApplicationOption = {
  id: string
  grantName: string
  updatedAt: string
}

/**
 * Looks up the most recent OTHER application by this user for the same
 * funder that has reached at least Step 4 (i.e. has a question list and
 * retained guidelines worth reusing). Returns null if none exists.
 *
 * "Same funder" is matched by a case-insensitive, trimmed comparison of
 * the free-typed `funder_name` (the curated funder directory and its
 * `funder_id` FK were removed 2026-07-15 — DR-FD-001 amendment — so there
 * is no longer a stable funder identity to match on). This is a
 * deliberate soft-miss trade-off: if a charity types the same funder's
 * name slightly differently between applications (e.g. "Henry Smith
 * Charity" vs "The Henry Smith Charity"), the reuse prompt simply won't
 * offer itself — it will never wrongly match two different funders.
 *
 * Used by Step 1 to offer "Start fresh" vs "Start from your last
 * application to [Funder]" once a funder name is entered. Entirely scoped
 * to the current user — no cross-charity sharing, no curator role (P6.5
 * design, 2026-07-14 — supersedes the earlier "Curated Funder Playbooks"
 * concept, see ADR-DATA-006's amendment).
 */
export async function getPreviousApplicationForFunder(
  currentApplicationId: string,
  funderName: string,
): Promise<PreviousApplicationOption | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const trimmedName = funderName.trim()
  if (!trimmedName) return null

  // Escape ILIKE wildcard characters so a funder name containing a literal
  // "%" or "_" (e.g. "Awards for All (100%)") is matched exactly rather
  // than treated as a pattern.
  const escapedName = trimmedName.replace(/[\\%_]/g, (char) => `\\${char}`)

  const { data, error } = await supabase
    .from('applications')
    .select('id, grant_name, updated_at')
    .eq('user_id', user.id)
    .ilike('funder_name', escapedName)
    .neq('id', currentApplicationId)
    .gte('current_step', 4)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  return { id: data.id, grantName: data.grant_name, updatedAt: data.updated_at }
}

/**
 * Copies a previous application's question list, retained guidelines, and
 * AI summary into a new application, so Step 2 (guideline upload) can be
 * skipped entirely. Previous answers are carried across but is_approved is
 * always reset to false and cloned_from_application_id is set, so Step 4
 * can show a "carried over — please review" badge rather than treating
 * inherited answers as already reviewed for this new application.
 *
 * Non-fatal by design (mirrors the ai_summary/application_guidelines save
 * pattern elsewhere): if the source application or its rows can't be read,
 * the caller proceeds with an empty application rather than failing the
 * whole Step 1 save.
 */
async function cloneApplicationForReuse(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  sourceApplicationId: string,
  targetApplicationId: string,
): Promise<void> {
  const [sourceAppResult, sourceGuidelinesResult, sourceItemsResult] = await Promise.all([
    supabase
      .from('applications')
      .select('ai_summary')
      .eq('id', sourceApplicationId)
      .eq('user_id', userId)
      .single(),
    supabase
      .from('application_guidelines')
      .select('guideline_text')
      .eq('application_id', sourceApplicationId)
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('application_items')
      .select(
        'item_type, item_label, item_order, source_of_truth, validation_mode, rubric_criterion_link, decision_maker_visible, output_mode, guideline_reference, word_limit, char_limit, limit_type, is_budget_question, answer_text, ai_refined_answer, answer_source',
      )
      .eq('application_id', sourceApplicationId)
      .eq('user_id', userId)
      // Governance/reserves items (field_key IS NOT NULL) are deliberately
      // excluded from reuse — every application collects these facts fresh,
      // no exception for P6.5 reuse (WJ, 2026-07-15). The target
      // application's own item-sync path creates them blank instead.
      .is('field_key', null),
  ])

  if (sourceAppResult.data?.ai_summary) {
    await supabase
      .from('applications')
      .update({ ai_summary: sourceAppResult.data.ai_summary })
      .eq('id', targetApplicationId)
      .eq('user_id', userId)
  }

  if (sourceGuidelinesResult.data?.guideline_text) {
    await supabase.from('application_guidelines').upsert(
      {
        application_id: targetApplicationId,
        user_id: userId,
        guideline_text: sourceGuidelinesResult.data.guideline_text,
      },
      { onConflict: 'application_id' },
    )
  }

  if (sourceItemsResult.data && sourceItemsResult.data.length > 0) {
    const inserts = sourceItemsResult.data.map((item) => ({
      ...item,
      application_id: targetApplicationId,
      user_id: userId,
      is_approved: false,
      cloned_from_application_id: sourceApplicationId,
    }))

    await supabase.from('application_items').insert(inserts)
  }
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
 * If reuseFromApplicationId is provided (user chose "Start from your last
 * application to [Funder]" — P6.5), the previous application's question
 * list, guidelines, and AI summary are cloned in, Step 2 is skipped
 * entirely, and the user lands on Step 3 to review the (carried-over) AI
 * summary before continuing to Step 4 as normal.
 *
 * Returns { ok: false, error } only when the DB update fails — the
 * success path always calls redirect() and never returns normally.
 */
export async function saveApplicationStep1(
  applicationId: string,
  funderName: string,
  grantName: string,
  reuseFromApplicationId?: string,
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

    const newStep = reuseFromApplicationId
      ? Math.max(existing?.current_step ?? 1, 3)
      : Math.max(existing?.current_step ?? 1, 2)

    const { error } = await supabase
      .from('applications')
      .update({
        funder_name: funderName,
        grant_name: grantName,
        current_step: newStep,
        ...(reuseFromApplicationId ? { status: 'in_progress' as const } : {}),
      })
      .eq('id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      return { ok: false, error: 'Could not save your application. Please try again.' }
    }

    if (reuseFromApplicationId) {
      await cloneApplicationForReuse(supabase, user.id, reuseFromApplicationId, applicationId)
    }
  } catch {
    // Network error or Supabase unavailable
    return {
      ok: false,
      error: 'Could not reach the server. Please check your connection and try again.',
    }
  }

  redirect(`/applications/${applicationId}/step/${reuseFromApplicationId ? 3 : 2}`)
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
export async function advanceToStep3(applicationId: string): Promise<{ ok: false; error: string }> {
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
export async function advanceToStep4(applicationId: string): Promise<{ ok: false; error: string }> {
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
    const updates: { current_step: number; draft_status?: string } = { current_step: newStep }
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
 * Step 4 preparation checklist. Sets draft_status = 'in_progress' and syncs
 * application_items from ai_summary so rows exist before the page renders
 * (D-HSF-03: avoids first-load "no questions found" fallback caused by
 * Router Cache serving a stale render before the Server Component sync runs).
 *
 * Returns { ok: true } on success — the client performs a hard navigation via
 * window.location.href to bypass the Next.js Router Cache entirely.
 */
export async function setDraftInProgress(
  applicationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Fetch ai_summary alongside the status update so we can sync questions here
  const { data: appRow, error: fetchError } = await supabase
    .from('applications')
    .select('ai_summary')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { ok: false, error: 'Could not load application data. Please try again.' }
  }

  const { error } = await supabase
    .from('applications')
    .update({ draft_status: 'in_progress' })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Could not save your progress. Please try again.' }
  }

  // Governance/reserves items (2026-07-15): always present, every
  // application, independent of funder_type or ai_summary. answer_text is
  // deliberately omitted from the upsert payload — a fresh row inserts
  // blank, and re-running this on an already-answered row never touches
  // its answer_text (same trick the narrative-item upserts below use).
  // No seeding from a prior application, including P6.5 reuse — every
  // application starts these 5 facts blank by design.
  const { error: governanceUpsertError } = await supabase.from('application_items').upsert(
    GOVERNANCE_ITEMS.map((item) => ({
      application_id: applicationId,
      user_id: user.id,
      item_type: item.item_type,
      source_of_truth: 'charity_profile' as const,
      field_key: item.field_key,
      item_label: item.item_label,
      item_order: item.item_order,
      is_budget_question: item.is_budget_question,
    })),
    { onConflict: 'application_id,item_order', ignoreDuplicates: false },
  )

  if (governanceUpsertError) {
    console.error(
      '[setDraftInProgress] governance item upsert failed:',
      governanceUpsertError.message,
      { applicationId },
    )
  }

  // Sync application_items from ai_summary so rows exist before the page
  // renders. This is the primary sync path; the Step 4 page still syncs as a
  // fallback for returning users who navigate directly without the checklist.
  // item_type is always 'narrative' and source_of_truth always 'user_input'
  // in compatibility mode (P6.2, ADR-DATA-006) — no other item type is
  // produced by today's extraction prompt. guideline_reference is populated
  // when the extraction route's citation validation confirmed a real one
  // (P6.3, ADR-DATA-007) — null otherwise, never a bare unverified AI guess.
  if (appRow?.ai_summary) {
    try {
      const parsedSummary = JSON.parse(appRow.ai_summary) as AiSummaryData
      const funderType = parsedSummary.funder_type ?? 'structured'

      if (
        funderType === 'free_form' &&
        Array.isArray(parsedSummary.sections) &&
        parsedSummary.sections.length > 0
      ) {
        const inserts = parsedSummary.sections
          .filter((s) => s.title && typeof s.number === 'number')
          .map((s) => ({
            application_id: applicationId,
            user_id: user!.id,
            item_type: 'narrative' as const,
            source_of_truth: 'user_input' as const,
            item_label: s.title,
            item_order: s.number,
            word_limit: s.wordLimit ?? null,
            char_limit: null,
            limit_type: s.wordLimit ? 'words' : null,
            is_budget_question: s.is_budget_section ?? false,
            guideline_reference: toGuidelineReferenceColumn(s.citation),
          }))

        if (inserts.length > 0) {
          const { error: upsertError } = await supabase.from('application_items').upsert(inserts, {
            onConflict: 'application_id,item_order',
            ignoreDuplicates: false,
          })

          if (upsertError) {
            console.error('[setDraftInProgress] free_form upsert failed:', upsertError.message, {
              applicationId,
              rowCount: inserts.length,
            })
          }
        }
      } else if (Array.isArray(parsedSummary.questions) && parsedSummary.questions.length > 0) {
        const inserts = parsedSummary.questions
          .filter((q) => q.text)
          .map((q, idx) => ({
            application_id: applicationId,
            user_id: user!.id,
            item_type: 'narrative' as const,
            source_of_truth: 'user_input' as const,
            item_label: q.text,
            item_order: q.number ?? idx + 1,
            word_limit: q.wordLimit ?? null,
            char_limit: q.charLimit ?? null,
            limit_type: q.limitType ?? null,
            is_budget_question: q.is_budget_question ?? false,
            guideline_reference: toGuidelineReferenceColumn(q.citation),
          }))

        if (inserts.length > 0) {
          const { error: upsertError } = await supabase.from('application_items').upsert(inserts, {
            onConflict: 'application_id,item_order',
            ignoreDuplicates: false,
          })

          if (upsertError) {
            console.error('[setDraftInProgress] structured upsert failed:', upsertError.message, {
              applicationId,
              rowCount: inserts.length,
            })
          }
        }
      }
    } catch (syncErr) {
      // Non-fatal: log and continue — the Step 4 page sync will retry
      console.error('[setDraftInProgress] sync threw unexpectedly:', syncErr, { applicationId })
    }
  }

  revalidatePath(`/applications/${applicationId}/step/4`)
  return { ok: true }
}

// ---------------------------------------------------------------------------
// S6.3 — Save answer (auto-save and manual save from Step 4)
// ---------------------------------------------------------------------------

export type SaveAnswerResult = { ok: true } | { ok: false; error: string }

/**
 * Saves a single answer text for an existing application_items row.
 * Called by the on-blur auto-save and the 60-second background save in the
 * Step 4 component.
 *
 * answer_source must be 'user_edited' (user replaced their answer with an
 * AI-refined version via "Help me improve this") or 'user_written' (user
 * wrote without AI assistance). This action never sets 'ai_generated' —
 * that value is unused; the charity-authored model has no code path that
 * generates an answer from scratch.
 *
 * user_id check is belt-and-braces in addition to RLS on application_items.
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
    .from('application_items')
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
 * Sets is_approved = true on a single application_items row.
 * Called from Step 4 when the user clicks "Approve this answer" after
 * reviewing all three FR-32 review prompts. Resets to false if the user
 * subsequently edits the answer (handled client-side via unapproveAnswer).
 */
export async function approveAnswer(answerId: string): Promise<SaveAnswerResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase
    .from('application_items')
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
 * V1 supports one manual question (item_order = 1).
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

  const { error } = await supabase.from('application_items').upsert(
    {
      application_id: applicationId,
      user_id: user.id,
      item_type: 'narrative',
      source_of_truth: 'user_input',
      item_label: questionText.trim(),
      item_order: 1,
      answer_text: answerText.trim() || null,
      answer_source: 'user_written',
    },
    { onConflict: 'application_id,item_order' },
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

export type AssembleAndAdvanceResult = { ok: true } | { ok: false; error: string }

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
export async function assembleAndAdvance(applicationId: string): Promise<AssembleAndAdvanceResult> {
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

  // ── Fetch answered items in order ──────────────────────────────────────────
  const { data: answerRows, error: answersError } = await supabase
    .from('application_items')
    .select('item_order, item_label, answer_text')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .order('item_order')

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
          ? `${r.item_label}\n\n${r.answer_text}`
          : `${r.item_order}. ${r.item_label}\n\n${r.answer_text}`,
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
// S7.1 — Approve application
// ---------------------------------------------------------------------------

export type ApproveApplicationResult = { ok: true } | { ok: false; error: string }

/**
 * Approves an application:
 *   1. Sets applications.status = 'approved'
 *   2. Sets is_approved = true on all application_items rows
 *
 * The client updates local state after receiving { ok: true }.
 * updated_at is managed by the database trigger on both tables.
 */
export async function approveApplication(applicationId: string): Promise<ApproveApplicationResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase.rpc('approve_application', {
    p_application_id: applicationId,
    p_user_id: user.id,
  })

  if (error) {
    return { ok: false, error: 'Could not approve the application. Please try again.' }
  }

  return { ok: true }
}

// ---------------------------------------------------------------------------
// S2.3 — Re-open application
// ---------------------------------------------------------------------------

export type ReopenApplicationResult = { ok: true } | { ok: false; error: string }

/**
 * Re-opens an approved or exported application:
 *   1. Sets applications.status = 'in_progress'
 *   2. Sets applications.current_step = 4 (Draft Answers)
 *   3. Resets draft_status = 'in_progress' (clears 'assembled' / 'ready_to_assemble')
 *   4. Clears assembled_draft (will be regenerated when user re-assembles)
 *   5. Resets is_approved = false on all application_items rows
 *
 * draft_status must be reset so the Step 4 gate shows the Q&A interface
 * rather than immediately redirecting back to Step 5 (S6.8 gate fix).
 *
 * The client redirects to Step 4 after receiving { ok: true }.
 * updated_at is managed by the database trigger on both tables.
 */
export async function reopenApplication(applicationId: string): Promise<ReopenApplicationResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase.rpc('reopen_application', {
    p_application_id: applicationId,
    p_user_id: user.id,
  })

  if (error) {
    return { ok: false, error: 'Could not re-open the application. Please try again.' }
  }

  return { ok: true }
}
