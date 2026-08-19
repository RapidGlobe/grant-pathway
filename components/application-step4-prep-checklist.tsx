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
// draft_status = 'in_progress' AND syncs application_items from ai_summary, then
// returns { ok: true }. The client uses window.location.href for a hard navigation
// (bypasses Next.js Router Cache) so Step 4 renders fresh with the synced rows
// (D-HSF-03 fix — AC-FR-28-01, AC-FR-28-02).

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/step-indicator'
import { setDraftInProgress } from '@/actions/applications'
import { PreparationChecklistBody } from '@/components/preparation-checklist-body'

interface ApplicationStep4PrepChecklistProps {
  applicationId: string
  funderName?: string
  supportingDocuments?: string[]
}

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
        // fresh with the rows written by setDraftInProgress (D-HSF-03 fix).
        // router.push() would resurrect the stale-render bug D-HSF-03 fixed
        // (CHANGELOG.md, 2026-06-07), so this intentionally isn't a soft nav.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
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
        <h1 className="text-[1.5rem] font-bold text-[#1E293B]">Before you begin writing</h1>
      </div>

      <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <PreparationChecklistBody
          variant="before-writing"
          funderName={funderName}
          supportingDocuments={supportingDocuments}
        />
      </div>

      {serverError && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[0.8125rem] text-[#DC2626]"
        >
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Link
          href={`/applications/${applicationId}/step/3`}
          className="rounded text-[0.875rem] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Back
        </Link>
        <Button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="h-10 bg-[#0D6E6E] px-6 text-[0.9375rem] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-70"
        >
          {isPending ? 'Saving…' : 'I have what I need — start writing'}
        </Button>
      </div>
    </div>
  )
}
