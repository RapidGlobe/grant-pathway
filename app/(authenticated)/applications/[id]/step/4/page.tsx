import type { Metadata } from 'next'
import { ApplicationStep4Draft, type QuestionRow } from '@/components/application-step4-draft'
import { ApplicationStep4PrepChecklist } from '@/components/application-step4-prep-checklist'
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
  const { aiSummary, draftStatus } = await getApplicationOrRedirect(id, 4)

  // S6.4 — Show preparation checklist on first visit (AC-FR-28-01)
  if (draftStatus === 'not_started') {
    return <ApplicationStep4PrepChecklist applicationId={id} />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // getApplicationOrRedirect already redirects unauthenticated users — this
  // is a type-safety guard only
  if (!user) return null

  // ── S6.1: Fetch existing question rows ────────────────────────────────────
  const { data: existingRows } = await supabase
    .from('application_answers')
    .select('id, question_text, question_order, word_limit, answer_text, answer_source')
    .eq('application_id', id)
    .eq('user_id', user.id)
    .order('question_order')

  let questionRows = existingRows ?? []

  // ── S6.1: Populate from ai_summary if no rows exist yet ──────────────────
  if (questionRows.length === 0 && aiSummary) {
    try {
      const summary = JSON.parse(aiSummary) as AiSummaryData

      if (Array.isArray(summary.questions) && summary.questions.length > 0) {
        const inserts = summary.questions.map((q, idx) => ({
          application_id: id,
          user_id: user.id,
          question_text: q.text,
          question_order: q.number ?? idx + 1,
          word_limit: q.wordLimit ?? null,
        }))

        // ON CONFLICT DO NOTHING — returning to Step 4 never overwrites rows
        const { data: inserted } = await supabase
          .from('application_answers')
          .upsert(inserts, {
            onConflict: 'application_id,question_order',
            ignoreDuplicates: true,
          })
          .select('id, question_text, question_order, word_limit, answer_text, answer_source')

        questionRows = inserted ?? []
      }
    } catch {
      // ai_summary parse failed — questionRows stays empty (manual entry path)
    }
  }

  // ── Determine whether answers already exist (skip AI generation) ──────────
  const hasExistingAnswers = questionRows.some(
    (row) => typeof row.answer_text === 'string' && row.answer_text.trim() !== '',
  )

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
    answerText: (row.answer_text as string | null) ?? null,
    answerSource: (row.answer_source as QuestionRow['answerSource']) ?? null,
  }))

  return (
    <ApplicationStep4Draft
      applicationId={id}
      questions={questions}
      hasExistingAnswers={hasExistingAnswers}
      approachingLimit={approachingLimit}
      limitReached={limitReached}
    />
  )
}
