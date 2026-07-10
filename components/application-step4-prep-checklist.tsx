'use client'

// Step 4 — Preparation checklist (S6.4)
//
// Shown once, on the user's first visit to Step 4 (draft_status = 'not_started').
// Prompts Margaret to gather financial documents before starting the Q&A interview,
// and to involve a senior colleague before reaching budget questions.
//
// Funder-specific supporting documents (AC-FR-28-09): the Step 3 AI summary extracts
// a list of supporting documents this funder requires (e.g. governing document, most
// recent accounts) into summary_json.supportingDocuments. When non-empty, it is shown
// as a second checklist alongside the standing financial-prep advice above — the two
// lists can overlap (e.g. both may mention annual accounts) since one is Grant Pathway's
// general advice and the other is this specific funder's stated requirement.
//
// On "I have what I need — start writing": calls setDraftInProgress(), which sets
// draft_status = 'in_progress' AND syncs application_answers from ai_summary, then
// returns { ok: true }. The client uses window.location.href for a hard navigation
// (bypasses Next.js Router Cache) so Step 4 renders fresh with the synced rows
// (D-HSF-03 fix — AC-FR-28-01, AC-FR-28-02).

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ClipboardList, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/step-indicator'
import { setDraftInProgress } from '@/actions/applications'

interface ApplicationStep4PrepChecklistProps {
  applicationId: string
  funderName?: string
  supportingDocuments?: string[]
}

const CHECKLIST_ITEMS = [
  'Most recent annual accounts or financial statements',
  'Projected budget for the grant period (income and planned expenditure)',
  'Details of other funding secured or applied for',
  'Input from your treasurer, finance lead, or a trustee who understands the budget',
]

export function ApplicationStep4PrepChecklist({
  applicationId,
  funderName,
  supportingDocuments = [],
}: ApplicationStep4PrepChecklistProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleStart() {
    setServerError(null)
    startTransition(async () => {
      const result = await setDraftInProgress(applicationId)
      if (result.ok) {
        // Hard navigation bypasses the Next.js Router Cache so Step 4 renders
        // fresh with the rows written by setDraftInProgress (D-HSF-03 fix)
        window.location.href = `/applications/${applicationId}/step/4`
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={4} />

      <div className="mb-6 flex items-center gap-3">
        <ClipboardList className="h-6 w-6 shrink-0 text-[#0D6E6E]" aria-hidden="true" />
        <h1 className="text-[24px] font-bold text-[#1E293B]">Before you begin writing</h1>
      </div>

      <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="mb-4 text-[15px] text-[#374151]">
          The financial sections of this application cannot be completed by AI. Before you start,
          gather:
        </p>

        <ul className="mb-5 space-y-3">
          {CHECKLIST_ITEMS.map((item, i) => (
            <ChecklistItem key={i} index={i + 1}>
              {item}
            </ChecklistItem>
          ))}
        </ul>

        {supportingDocuments.length > 0 && (
          <>
            <p className="mb-4 text-[15px] text-[#374151]">
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
          <p className="text-[13px] text-[#78350F]">
            It is worth involving a senior colleague — such as your CEO, treasurer, or a trustee —
            before reaching the financial questions.
          </p>
        </div>
      </div>

      {serverError && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]"
        >
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Link
          href={`/applications/${applicationId}/step/3`}
          className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Back
        </Link>
        <Button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-70"
        >
          {isPending ? 'Saving…' : 'I have what I need — start writing'}
        </Button>
      </div>
    </div>
  )
}

function ChecklistItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#0D6E6E] text-[11px] font-bold text-[#0D6E6E]"
        aria-hidden="true"
      >
        {index}
      </span>
      <span className="text-[14px] text-[#374151]">{children}</span>
    </li>
  )
}
