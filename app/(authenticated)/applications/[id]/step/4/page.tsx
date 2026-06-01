import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ApplicationStep4Draft, type QuestionRow } from '@/components/application-step4-draft'
import { ApplicationStep4PrepChecklist } from '@/components/application-step4-prep-checklist'
import { ApplicationStep4SeniorReview } from '@/components/application-step4-senior-review'
import { getApplicationOrRedirect } from '@/lib/application-guard'
import { createClient } from '@/lib/supabase/server'
import type { AiSummaryData } from '@/app/api/generate-summary/route'

export const metadata: Metadata = {
  title: 'Draft Answers',
}

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Step 4 — Q&A Interview (S6.1–S6.8).
 *
 * getApplicationOrRedirect(id, 4) enforces step locking.
 *
 * S6.4 — Preparation checklist gate: if draft_status = 'not_started', the
 * preparation checklist is shown instead of the Q&A interface. The checklist
 * sets draft_status = 'in_progress' on confirm, then redirects here so the
 * page re-renders showing the Q&A interface (AC-FR-28-01, AC-FR-28-02).
 *
 * S6.1 — Question population: if no application_answers rows exist yet,
 * creates them from the questions extracted in the ai_summary JSON. Uses
 * ON CONFLICT DO NOTHING so returning to Step 4 never overwrites answers.
 */
export default async function Step4Page({ params }: Props) {
  const { id } = await params

  // Step locking: redirects to current step if current_step < 4
  const { aiSummary, draftStatus, funderName, grantName } = await getApplicationOrRedirect(id, 4)

  // S6.4 — Show preparation checklist on first visit (AC-FR-28-01)
  if (draftStatus === 'not_started') {
    return <ApplicationStep4PrepChecklist applicationId={id} />
  }

  // S6.7 — Show senior review confirmation before assembly
  if (draftStatus === 'ready_to_assemble') {
    return <ApplicationStep4SeniorReview applicationId={id} />
  }

  // S6.7 — Draft already assembled; send user straight to Step 5
  if (draftStatus === 'assembled') {
    redirect(`/applications/${id}/step/5`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // getApplicationOrRedirect already redirects unauthenticated users — type guard only
  if (!user) return null

  // ── Parse ai_summary once — used for both funder_type and question population ──
  let funderType: 'structured' | 'free_form' = 'structured'
  let parsedSummary: AiSummaryData | null = null

  if (aiSummary) {
    try {
      parsedSummary = JSON.parse(aiSummary) as AiSummaryData
      funderType = parsedSummary.funder_type ?? 'structured'
    } catch {
      // ai_summary parse failed — funderType stays 'structured'
    }
  }

  // ── S6.1: Fetch existing question rows ────────────────────────────────────
  const { data: existingRows } = await supabase
    .from('application_answers')
    .select(
      'id, question_text, question_order, word_limit, char_limit, limit_type, answer_text, answer_source, is_budget_question',
    )
    .eq('application_id', id)
    .eq('user_id', user.id)
    .order('question_order')

  let questionRows = existingRows ?? []

  // ── Build guidance map from ai_summary sections (free_form only) ─────────
  const guidanceMap: Record<number, string> = {}
  if (funderType === 'free_form' && parsedSummary?.sections) {
    for (const s of parsedSummary.sections) {
      if (s.guidance) guidanceMap[s.number] = s.guidance
    }
  }

  // ── S6.1: Populate from ai_summary if no rows exist yet ──────────────────
  if (questionRows.length === 0 && parsedSummary) {
    try {
      if (
        funderType === 'free_form' &&
        Array.isArray(parsedSummary.sections) &&
        parsedSummary.sections.length > 0
      ) {
        // Free_form: populate from narrative sections
        const inserts = parsedSummary.sections.map((s) => ({
          application_id: id,
          user_id: user.id,
          question_text: s.title,
          question_order: s.number,
          word_limit: s.wordLimit ?? null,
          char_limit: null,
          limit_type: s.wordLimit ? 'words' : null,
          is_budget_question: s.is_budget_section ?? false,
        }))

        const { data: inserted } = await supabase
          .from('application_answers')
          .upsert(inserts, {
            onConflict: 'application_id,question_order',
            ignoreDuplicates: true,
          })
          .select(
            'id, question_text, question_order, word_limit, char_limit, limit_type, answer_text, answer_source, is_budget_question',
          )

        questionRows = inserted ?? []
      } else if (Array.isArray(parsedSummary.questions) && parsedSummary.questions.length > 0) {
        // Structured: populate from numbered questions
        const inserts = parsedSummary.questions.map((q, idx) => ({
          application_id: id,
          user_id: user.id,
          question_text: q.text,
          question_order: q.number ?? idx + 1,
          word_limit: q.wordLimit ?? null,
          char_limit: q.charLimit ?? null,
          limit_type: q.limitType ?? null,
          is_budget_question: q.is_budget_question ?? false,
        }))

        // ON CONFLICT DO NOTHING — returning to Step 4 never overwrites rows
        const { data: inserted } = await supabase
          .from('application_answers')
          .upsert(inserts, {
            onConflict: 'application_id,question_order',
            ignoreDuplicates: true,
          })
          .select(
            'id, question_text, question_order, word_limit, char_limit, limit_type, answer_text, answer_source, is_budget_question',
          )

        questionRows = inserted ?? []
      }
    } catch {
      // question population failed — questionRows stays empty (manual entry path)
    }
  }

  // ── AI usage state for limit / approaching-limit banners ──────────────────
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: usageCount } = await supabase
    .from('ai_usage_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const currentUsage = usageCount ?? 0
  const approachingLimit = currentUsage >= 40
  const limitReached = currentUsage >= 50

  // ── Map DB rows to component props ────────────────────────────────────────
  const questions: QuestionRow[] = questionRows.map((row) => ({
    id: row.id as string,
    questionText: row.question_text as string,
    questionOrder: row.question_order as number,
    wordLimit: (row.word_limit as number | null) ?? null,
    charLimit: (row.char_limit as number | null) ?? null,
    limitType: (row.limit_type as QuestionRow['limitType']) ?? null,
    answerText: (row.answer_text as string | null) ?? null,
    answerSource: (row.answer_source as QuestionRow['answerSource']) ?? null,
    isBudgetQuestion: (row.is_budget_question as boolean) ?? false,
    guidance: guidanceMap[row.question_order as number] ?? null,
  }))

  return (
    <ApplicationStep4Draft
      applicationId={id}
      questions={questions}
      funderType={funderType}
      funderName={funderName}
      grantName={grantName}
      approachingLimit={approachingLimit}
      limitReached={limitReached}
    />
  )
}
