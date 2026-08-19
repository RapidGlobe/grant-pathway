import type { Metadata } from 'next'
import { ApplicationStep5Approve, type AnswerRow } from '@/components/application-step5-approve'
import { getApplicationOrRedirect } from '@/lib/application-guard'
import { createClient } from '@/lib/supabase/server'
import type { AiSummaryData } from '@/app/api/generate-summary/route'

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
    .select('last_exported_at, assembled_draft, ai_summary')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const lastExportedAt = (appRow?.last_exported_at as string | null) ?? null
  const assembledDraft = (appRow?.assembled_draft as string | null) ?? null

  // ── Supporting documents for the second showing of the preparation checklist
  // (PDR-UI-007, 2026-08-19). Parsed here rather than threaded from Step 4:
  // Step 5 is reachable directly by URL and after a reopen, so it cannot rely on
  // having passed through Step 4 in this session. A parse failure degrades to an
  // empty list, which hides the funder-specific half and leaves the standing
  // advice — the same tolerance Step 4 applies.
  let supportingDocuments: string[] = []
  const aiSummary = appRow?.ai_summary as string | null | undefined
  if (aiSummary) {
    try {
      supportingDocuments = (JSON.parse(aiSummary) as AiSummaryData).supportingDocuments ?? []
    } catch {
      // ai_summary parse failed — the funder-specific list is simply not shown
    }
  }

  // ── Fetch answers for review ───────────────────────────────────────────────
  const { data: answerRows } = await supabase
    .from('application_items')
    .select('id, item_order, item_label, word_limit, answer_text, answer_source')
    .eq('application_id', id)
    .eq('user_id', user.id)
    .order('item_order')

  const answers: AnswerRow[] = (answerRows ?? []).map((row) => ({
    id: row.id as string,
    questionOrder: row.item_order as number,
    questionText: row.item_label as string,
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
      supportingDocuments={supportingDocuments}
      lastExportedAt={lastExportedAt}
    />
  )
}
