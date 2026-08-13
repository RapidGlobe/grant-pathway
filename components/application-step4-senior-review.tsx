'use client'

// Step 4 — Senior review screen (S6.7)
//
// Shown when draft_status = 'ready_to_assemble'. Prompts the user to confirm
// that a senior colleague has reviewed the budget answers before the draft is
// assembled (AC-FR-31A).
//
// "Assemble my draft" → calls assembleAndAdvance(), which formats all answers
// into assembled_draft, sets draft_status = 'assembled', current_step = 5,
// and redirects to Step 5.
//
// "Back to editing" → calls setDraftInProgress() to reset draft_status back
// to 'in_progress', then redirects to Step 4 showing the Q&A interface.

import { useState, useTransition } from 'react'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/step-indicator'
import { assembleAndAdvance, setDraftInProgress } from '@/actions/applications'
import { ContextualTooltip } from '@/components/contextual-tooltip'

interface ApplicationStep4SeniorReviewProps {
  applicationId: string
}

export function ApplicationStep4SeniorReview({ applicationId }: ApplicationStep4SeniorReviewProps) {
  const [assembleError, setAssembleError] = useState<string | null>(null)
  const [backError, setBackError] = useState<string | null>(null)
  const [isAssembling, startAssembleTransition] = useTransition()
  const [isGoingBack, startBackTransition] = useTransition()

  function handleAssemble() {
    setAssembleError(null)
    startAssembleTransition(async () => {
      const result = await assembleAndAdvance(applicationId)
      if (!result.ok) setAssembleError(result.error)
    })
  }

  function handleBack() {
    setBackError(null)
    startBackTransition(async () => {
      const result = await setDraftInProgress(applicationId)
      if (!result.ok) setBackError(result.error)
    })
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={4} />

      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 shrink-0 text-[#0D6E6E]" aria-hidden="true" />
        <h1 className="text-[1.5rem] font-bold text-[#1E293B]">Before we put it together</h1>
      </div>

      <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="mb-4 text-[0.9375rem] text-[#374151]">
          Your answers have been saved. Before your draft is assembled, please confirm that a senior
          colleague — such as your CEO, treasurer, or a trustee — has reviewed your budget answers.
        </p>
        <p className="text-[0.875rem] text-[#64748B]">
          Funders verify financial information. Inaccurate budget answers are one of the most common
          reasons grant applications are unsuccessful or withdrawn. Once assembled, you will be able
          to review and approve the full draft before it is exported.
        </p>
      </div>

      {assembleError && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[0.8125rem] text-[#DC2626]"
        >
          {assembleError}
        </p>
      )}

      {backError && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[0.8125rem] text-[#DC2626]"
        >
          {backError}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={isGoingBack || isAssembling}
          className="rounded text-[0.875rem] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:opacity-50"
        >
          {isGoingBack ? 'Going back…' : 'Back to editing'}
        </button>
        <ContextualTooltip content="Confirm a senior team member has reviewed the financial content before assembling your draft.">
          <Button
            type="button"
            onClick={handleAssemble}
            disabled={isAssembling || isGoingBack}
            className="h-10 bg-[#0D6E6E] px-6 text-[0.9375rem] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-70"
          >
            {isAssembling ? 'Assembling…' : 'Yes — assemble my draft'}
          </Button>
        </ContextualTooltip>
      </div>
    </div>
  )
}
