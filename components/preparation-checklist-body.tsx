// Preparation checklist body — shared between Step 4 and Step 5 (PDR-UI-007).
//
// Two showings of the same information, at the two moments it is actionable:
//
//   'before-writing'    Step 4's gate. "Go and gather these before you start."
//   'before-submitting' Step 5, above the review. "These are still outstanding."
//
// WHY THE SECOND SHOWING EXISTS. Raised 2026-08-19 by WJ's wife, the only person
// to have completed a genuine application through the live service. Until then
// this list appeared once, before the user had written a word — the right moment
// to say "gather these", the wrong moment to say "this is still outstanding",
// because at that point nothing is. By the end of Step 4 the user has answered
// every question Grant Pathway asked and the next button is approve and export,
// which invites the belief that they have finished. They have not: the funder
// still wants accounts, policies, and — for a funder like A B Charitable Trust —
// a supporting document Grant Pathway does not help them write.
//
// PASSIVE BY DECISION (WJ, 2026-08-19). The second showing informs; it does not
// gate. Grant Pathway cannot know whether the user has attached their accounts,
// and a gate the product cannot verify would be a poor gate.
//
// No 'use client': this is presentational only, with no state, no effects and no
// server-only APIs. Step 4's client component imports it (so it joins that
// module graph); Step 5 renders it through a client component the same way.

import { AlertTriangle } from 'lucide-react'

export type PreparationChecklistVariant = 'before-writing' | 'before-submitting'

interface PreparationChecklistBodyProps {
  variant: PreparationChecklistVariant
  funderName?: string
  supportingDocuments?: string[]
}

// Grant Pathway's own standing advice, identical for every funder — as distinct
// from the funder-specific list below it, which is extracted from the guidelines.
const CHECKLIST_ITEMS = [
  'Most recent annual accounts or financial statements',
  'Projected budget for the grant period (income and planned expenditure)',
  'Details of other funding secured or applied for',
  'Input from your treasurer, finance lead, or a trustee who understands the budget',
]

// The tense is the only thing that changes between the two showings. "Before you
// start, gather" and "before reaching the financial questions" are both wrong at
// Step 5 — the user has already started and already passed those questions.
const COPY: Record<PreparationChecklistVariant, { intro: string; note: string }> = {
  'before-writing': {
    intro:
      'The financial sections of this application cannot be completed by AI. Before you start, gather:',
    note: 'It is worth involving a senior colleague — such as your CEO, treasurer, or a trustee — before reaching the financial questions.',
  },
  'before-submitting': {
    intro:
      'The financial sections of this application cannot be completed by AI. Have these ready before you submit:',
    note: 'It is worth involving a senior colleague — such as your CEO, treasurer, or a trustee — before you submit.',
  },
}

export function PreparationChecklistBody({
  variant,
  funderName,
  supportingDocuments = [],
}: PreparationChecklistBodyProps) {
  const copy = COPY[variant]

  return (
    <>
      <p className="mb-4 text-[0.9375rem] text-[#374151]">{copy.intro}</p>

      <ul className="mb-5 space-y-3">
        {CHECKLIST_ITEMS.map((item, i) => (
          <ChecklistItem key={i} index={i + 1}>
            {item}
          </ChecklistItem>
        ))}
      </ul>

      {supportingDocuments.length > 0 && (
        <>
          <p className="mb-4 text-[0.9375rem] text-[#374151]">
            {funderName || 'This funder'} also asks you to submit:
          </p>
          <ul className="mb-5 space-y-3">
            {supportingDocuments.map((item, i) => (
              <ChecklistItem key={i} index={i + 1}>
                {item}
              </ChecklistItem>
            ))}
          </ul>
        </>
      )}

      <div className="flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
        <p className="text-[0.8125rem] text-[#78350F]">{copy.note}</p>
      </div>
    </>
  )
}

function ChecklistItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#0D6E6E] text-[0.6875rem] font-bold text-[#0D6E6E]"
        aria-hidden="true"
      >
        {index}
      </span>
      <span className="text-[0.875rem] text-[#374151]">{children}</span>
    </li>
  )
}
