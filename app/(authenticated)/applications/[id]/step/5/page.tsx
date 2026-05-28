import type { Metadata } from 'next'
import { ApplicationStep5Approve, type AnswerRow } from '@/components/application-step5-approve'
import { getApplicationOrRedirect } from '@/lib/application-guard'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Approve & Export',
}

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Step 5 — Approve & Export (S7.1–S7.3).
 *
 * getApplicationOrRedirect(id, 5) enforces step locking.
 *
 * Fetches real application data, answers, and last export timestamp to pass
 * to the ApplicationStep5Approve component. The component handles the
 * approve / re-open / download interactions.
 */
export default async function Step5Page({ params }: Props) {
  const { id } = await params

  // Step locking: redirects to current step if current_step < 5
  const { funderName, grantName, status } = await getApplicationOrRedirect(id, 5)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // getApplicationOrRedirect already redirects unauthenticated users
  if (!user) return null

  // ── Fetch last_exported_at and assembled_draft (not in ApplicationData type)
  const { data: appRow } = await supabase
    .from('applications')
    .select('last_exported_at, assembled_draft')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const lastExportedAt = (appRow?.last_exported_at as string | null) ?? null
  const assembledDraft = (appRow?.assembled_draft as string | null) ?? null

  // ── Fetch answers for review ───────────────────────────────────────────────
  const { data: answerRows } = await supabase
    .from('application_answers')
    .select('id, question_order, question_text, word_limit, answer_text, answer_source')
    .eq('application_id', id)
    .eq('user_id', user.id)
    .order('question_order')

  const answers: AnswerRow[] = (answerRows ?? []).map((row) => ({
    id: row.id as string,
    questionOrder: row.question_order as number,
    questionText: row.question_text as string,
    wordLimit: (row.word_limit as number | null) ?? null,
    answerText: (row.answer_text as string | null) ?? '',
    answerSource: (row.answer_source as AnswerRow['answerSource']) ?? null,
  }))

  return (
    <ApplicationStep5Approve
      applicationId={id}
      funderName={funderName}
      grantName={grantName}
      status={status}
      answers={answers}
      assembledDraft={assembledDraft}
      lastExportedAt={lastExportedAt}
    />
  )
}
