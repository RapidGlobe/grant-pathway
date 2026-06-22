'use client'

// Step 3 — AI Summary (S5.2, S5.3, S5.4)
//
// Auto-generation (AC-FR-24-01):
//   On mount, if no existing summary is in the database, the component reads
//   guidelines text from sessionStorage and calls /api/generate-summary.
//   If sessionStorage is empty AND no DB summary exists, a "no guidelines"
//   state prompts the user to go back and re-upload.
//
// Existing summary (returning user):
//   If aiSummary is passed from the page (non-null), the component skips
//   generation and shows the content state immediately. The DB value is the
//   parsed JSON from applications.ai_summary.
//
// Progress bar (GAP-02):
//   Advances 0 → ~89% on a timer (never reaches 90% on its own).
//   Snaps to 100% immediately when the API responds — fast if Bedrock is quick,
//   holds near 90% if Bedrock is slow.
//
// Retry logic:
//   First failure → "failure" state with Try again button.
//   Clicking Try again → second attempt → "persistent-failure" if that also fails.
//   Regenerate → always resets to first attempt (fresh generation counts as new).
//
// sessionStorage cleanup (GAP-10, ADR-FILE-004):
//   clearGuidelines(applicationId) is called after a successful generation.
//   Guidelines text must not persist in the browser once a summary exists in the DB.

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { RefreshCw, AlertCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/step-indicator'
import { getGuidelines, clearGuidelines, getGuidelinesFilename } from '@/lib/guidelines-session'
import { advanceToStep4, setApplicationMismatch } from '@/actions/applications'
import type { AiSummaryData } from '@/app/api/generate-summary/route'

type DisplayState =
  | 'loading'
  | 'content'
  | 'mismatch'
  | 'failure'
  | 'persistent-failure'
  | 'no-guidelines'

interface ApplicationStep3SummaryProps {
  applicationId: string
  funderName: string
  grantName: string
  /** Existing summary JSON string from the database. If non-null, skip generation. */
  existingSummary: string | null
}

const LOADING_MESSAGES = [
  { threshold: 0, text: 'Reading your funder guidelines…' },
  { threshold: 50, text: 'Identifying key information…' },
  { threshold: 75, text: 'Almost there…' },
]

export function ApplicationStep3Summary({
  applicationId,
  funderName,
  grantName,
  existingSummary,
}: ApplicationStep3SummaryProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [displayState, setDisplayState] = useState<DisplayState>(() => {
    if (existingSummary) {
      try {
        const parsed = JSON.parse(existingSummary) as AiSummaryData
        if (parsed.eligibilityMismatch) return 'mismatch'
      } catch {
        // fall through to content
      }
      return 'content'
    }
    return 'loading'
  })

  const [summary, setSummary] = useState<AiSummaryData | null>(() => {
    if (!existingSummary) return null
    try {
      return JSON.parse(existingSummary) as AiSummaryData
    } catch {
      return null
    }
  })

  const [questionsFound, setQuestionsFound] = useState<boolean>(() => {
    if (!existingSummary) return false
    try {
      const parsed = JSON.parse(existingSummary) as AiSummaryData
      if (parsed.funder_type === 'free_form') {
        return Array.isArray(parsed.sections) && parsed.sections.length > 0
      }
      return Array.isArray(parsed.questions) && parsed.questions.length > 0
    } catch {
      return false
    }
  })

  const [approachingLimit, setApproachingLimit] = useState(false)
  const [guidelinesTruncated, setGuidelinesTruncated] = useState(false)
  const [guidelinesFilename, setGuidelinesFilename] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0].text)

  // Track whether the current loading cycle is a "Try again" retry.
  // First failure → failure state; retry failure → persistent-failure state.
  const [isRetry, setIsRetry] = useState(false)

  // Ref to the interval so we can snap the progress bar on API return (GAP-02)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [continueError, setContinueError] = useState<string | null>(null)
  const [isContinuing, startContinuing] = useTransition()

  // Whether guidelines are still available in sessionStorage (for Regenerate warning)
  const [guidelinesAvailable, setGuidelinesAvailable] = useState(true)

  // Read filename and guidelines availability from sessionStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading sessionStorage; can only run client-side in useEffect
    setGuidelinesFilename(getGuidelinesFilename(applicationId))
    setGuidelinesAvailable(getGuidelines(applicationId) !== null)
  }, [applicationId])

  // ── Progress bar timer (GAP-02) ────────────────────────────────────────────
  // Advances asymptotically towards 89% — never reaches 90% on its own.
  // Cleared and snapped to 100% when the API returns (fast or slow).
  useEffect(() => {
    if (displayState !== 'loading') return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting progress state when loading begins
    setProgress(0)
    setLoadingMessage(LOADING_MESSAGES[0].text)

    let p = 0
    progressIntervalRef.current = setInterval(() => {
      // Logarithmic advance: fast at start, slows near 89%
      p += (89 - p) * 0.04
      setProgress(p)

      const msg =
        [...LOADING_MESSAGES].reverse().find((m) => p >= m.threshold)?.text ??
        LOADING_MESSAGES[0].text
      setLoadingMessage(msg)
    }, 200)

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [displayState])

  // ── AI generation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (displayState !== 'loading') return

    // If the DB already has a summary, the initial state is "content" and
    // this effect never runs. If we reach here, we need to generate.
    const guidelinesText = getGuidelines(applicationId)

    if (!guidelinesText) {
      // No guidelines in sessionStorage and no DB summary — user must re-upload
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- updating state in response to missing sessionStorage data
      setDisplayState('no-guidelines')
      return
    }

    let cancelled = false

    async function generate() {
      try {
        const res = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId, guidelinesText }),
        })

        if (cancelled) return

        const data = (await res.json()) as {
          summary?: AiSummaryData
          questionsFound?: boolean
          approachingLimit?: boolean
          guidelinesTruncated?: boolean
          error?: string
          message?: string
        }

        if (!res.ok || !data.summary) {
          // Stop the progress bar, show error state
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
          setDisplayState(isRetry ? 'persistent-failure' : 'failure')
          return
        }

        // Success — snap progress to 100%, then transition to content (GAP-02)
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        setProgress(100)

        setSummary(data.summary)
        setQuestionsFound(data.questionsFound ?? false)
        setApproachingLimit(data.approachingLimit ?? false)
        setGuidelinesTruncated(data.guidelinesTruncated ?? false)

        // Capture the filename label before clearing (it's cleared alongside text)
        setGuidelinesFilename(getGuidelinesFilename(applicationId))

        // Clear guidelines from sessionStorage (GAP-10, ADR-FILE-004)
        clearGuidelines(applicationId)

        setTimeout(() => {
          if (!cancelled) {
            setDisplayState(data.summary!.eligibilityMismatch ? 'mismatch' : 'content')
          }
        }, 300)
      } catch {
        if (cancelled) return
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        setDisplayState(isRetry ? 'persistent-failure' : 'failure')
      }
    }

    generate()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayState])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleTryAgain() {
    setIsRetry(true)
    setDisplayState('loading')
  }

  function handleRegenerate() {
    // Regenerate is a fresh attempt — reset retry tracking
    setIsRetry(false)
    setDisplayState('loading')
  }

  function handleContinue() {
    setContinueError(null)
    startContinuing(async () => {
      const result = await advanceToStep4(applicationId)
      setContinueError(result.error)
    })
  }

  function handleAcknowledgeMismatch() {
    startContinuing(async () => {
      await setApplicationMismatch(applicationId)
      // setApplicationMismatch redirects server-side; this is a fallback
    })
  }

  // ── No guidelines state (user navigated here without sessionStorage) ────────
  if (displayState === 'no-guidelines') {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={3} />
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-[14px] text-[#78350F]">
            Your guidelines document is no longer available. Please go back to Step 2 and upload or
            paste your guidelines again.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href={`/applications/${applicationId}/step/2`}
            className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Back to Step 2
          </Link>
        </div>
      </div>
    )
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (displayState === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={3} />
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8">
          <p className="mb-4 text-[15px] font-medium text-[#1E293B]">{loadingMessage}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-[#0D6E6E] transition-all duration-200"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Generating AI summary"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── API failure state ───────────────────────────────────────────────────────
  if (displayState === 'failure') {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={3} />
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <div>
            <p className="text-[14px] text-[#991B1B]">
              We couldn&apos;t generate your summary right now. This is usually temporary — please
              try again.
            </p>
            <Button
              type="button"
              onClick={handleTryAgain}
              className="mt-3 h-9 bg-[#0D6E6E] px-4 text-[14px] font-semibold text-white hover:bg-[#0A5A5A]"
            >
              Try again
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href={`/applications/${applicationId}/step/2`}
            className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Back
          </Link>
        </div>
      </div>
    )
  }

  // ── Persistent failure state ────────────────────────────────────────────────
  if (displayState === 'persistent-failure') {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={3} />
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[14px] text-[#991B1B]">
            If this keeps happening, please try again later. Your work has been saved.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href={`/applications/${applicationId}/step/2`}
            className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Back
          </Link>
        </div>
      </div>
    )
  }

  // ── Eligibility mismatch state (FR-47, DR-EL-001) ──────────────────────────
  // Hard stop: the AI detected a clear mismatch between the charity profile and
  // the funder's eligibility criteria. No path to Step 4 — user must acknowledge
  // and return to dashboard. The application is set to 'mismatch' status.
  if (displayState === 'mismatch') {
    const reason =
      summary?.mismatchReason ??
      "Your charity's focus does not appear to meet this funder's eligibility criteria."
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={3} />
        <div role="alert" className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-6">
          <div className="mb-4 flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <h2 className="text-[16px] font-semibold text-[#991B1B]">
              Eligibility mismatch — this application cannot proceed
            </h2>
          </div>
          <p className="mb-4 text-[14px] text-[#991B1B]">{reason}</p>
          <p className="mb-6 text-[14px] text-[#991B1B]">
            To apply for this grant, your charity profile must accurately reflect work that aligns
            with this funder&apos;s eligibility criteria. Please update your charity profile and
            start a new application.
          </p>
          <Button
            type="button"
            disabled={isContinuing}
            onClick={handleAcknowledgeMismatch}
            className="h-10 bg-[#DC2626] px-6 text-[15px] font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-70"
          >
            {isContinuing ? 'Saving…' : 'I understand — return to my dashboard'}
          </Button>
        </div>
      </div>
    )
  }

  // ── Content state ───────────────────────────────────────────────────────────
  // summary is always non-null here: either parsed from existingSummary or from
  // a successful API response. The null fallback is a safety guard only.
  if (!summary) return null

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6">
      <StepIndicator currentStep={3} />

      <h1 className="mb-1 text-[24px] font-bold text-[#1E293B]">
        Your funder guidelines — summary
      </h1>
      <p className="mb-1 text-[14px] font-medium text-[#0D6E6E]">
        {funderName}
        {grantName && grantName !== funderName && (
          <span className="font-normal text-[#64748B]"> &middot; {grantName}</span>
        )}
      </p>
      {guidelinesFilename && (
        <p className="mb-6 text-[13px] text-[#64748B]">Guidelines loaded: {guidelinesFilename}</p>
      )}
      {!guidelinesFilename && <div className="mb-6" />}

      {/* Guidelines truncation warning */}
      {guidelinesTruncated && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-[13px] text-[#78350F]">
            Your guidelines document is very large and was partially summarised. The AI reviewed the
            first section of the document. If key questions or eligibility criteria appear near the
            end of the document, consider pasting the most relevant sections as text instead.
          </p>
        </div>
      )}

      {/* Approaching limit banner */}
      {approachingLimit && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-[13px] text-[#78350F]">
            You&apos;re approaching your monthly AI request limit. You have a limited number of
            requests remaining this month — use Regenerate sparingly.
          </p>
        </div>
      )}

      {/* AI summary content — individual cards in a 2-column grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* About this grant — full width */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 md:col-span-2">
          <CardTitle>About this grant</CardTitle>
          <p className="text-[14px] text-[#374151]">{summary.aboutGrant}</p>
        </div>

        {/* Grant amount — half width if Who can apply exists, full width otherwise */}
        <div
          className={`rounded-xl border border-[#E2E8F0] bg-white p-5${!(summary.whoCanApply?.length > 0) ? ' md:col-span-2' : ''}`}
        >
          <CardTitle>Grant amount</CardTitle>
          <p className="text-[14px] text-[#374151]">{summary.amount}</p>
        </div>

        {/* Who can apply — half width (conditional) */}
        {summary.whoCanApply?.length > 0 && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <CardTitle>Who can apply</CardTitle>
            <BulletList items={summary.whoCanApply} />
          </div>
        )}

        {/* What the funder is looking for — full width */}
        {summary.lookingFor?.length > 0 && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 md:col-span-2">
            <CardTitle>What the funder is looking for</CardTitle>
            <BulletList items={summary.lookingFor} />
          </div>
        )}

        {/* Application questions — structured funders only */}
        {summary.funder_type !== 'free_form' && summary.questions?.length > 0 && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 md:col-span-2">
            <CardTitle>Application questions</CardTitle>
            <div className="space-y-2">
              {summary.questions.map((q) => (
                <div key={q.number}>
                  <p className="text-[14px] text-[#374151]">
                    <span className="font-medium">{q.number}.</span> {q.text}
                    {q.wordLimit && <span className="text-[#64748B]"> ({q.wordLimit} words)</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application sections — free_form funders only */}
        {summary.funder_type === 'free_form' && summary.sections && summary.sections.length > 0 && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 md:col-span-2">
            <CardTitle>Application sections</CardTitle>
            <div className="space-y-2">
              {summary.sections.map((s) => (
                <div key={s.number}>
                  <p className="text-[14px] text-[#374151]">
                    <span className="font-medium">{s.number}.</span> {s.title}
                    {s.wordLimit && <span className="text-[#64748B]"> ({s.wordLimit} words)</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key requirements — full width */}
        {summary.keyRequirements?.length > 0 && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 md:col-span-2">
            <CardTitle>Key requirements</CardTitle>
            <BulletList items={summary.keyRequirements} />
          </div>
        )}
      </div>

      {/* funderAiPolicy is stored in the DB for reference but not displayed —
          Grant Pathway's Q&A model already embodies responsible AI use (charity
          writes all content, AI refines only on request, mandatory review before
          approval). All approved funders are pre-screened; displaying extracted
          policy text adds noise without value. */}

      {/* Questions / sections extracted note */}
      {questionsFound ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-4">
          <span
            className="mt-0.5 h-4 w-4 shrink-0 text-center text-[13px] font-bold leading-4 text-[#059669]"
            aria-hidden="true"
          >
            ✓
          </span>
          <p className="text-[13px] text-[#065F46]">
            {summary.funder_type === 'free_form' ? (
              <>
                {`We identified ${summary.sections?.length ?? 0} ${(summary.sections?.length ?? 0) === 1 ? 'section' : 'sections'} to complete. In the next step, you'll write your content section by section.`}
              </>
            ) : (
              <>
                {`We found ${summary.questions.length} application ${summary.questions.length === 1 ? 'question' : 'questions'} in these guidelines. You'll answer each one in the next step.`}
              </>
            )}
          </p>
        </div>
      ) : summary.funder_type === 'free_form' ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" aria-hidden="true" />
          <p className="text-[13px] text-[#475569]">
            This funder asks for a narrative document. We couldn&apos;t identify specific sections —
            you&apos;ll be able to enter your content in the next step.
          </p>
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" aria-hidden="true" />
          <p className="text-[13px] text-[#475569]">
            We couldn&apos;t identify specific application questions in this document. You&apos;ll
            be able to enter them in the next step.
          </p>
        </div>
      )}

      {/* Regenerate link */}
      <div className="mb-8">
        <button
          type="button"
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 rounded text-[14px] text-[#64748B] underline hover:text-[#1E293B] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Regenerate summary
        </button>
        {!guidelinesAvailable && (
          <p className="mt-1.5 text-[12px] text-[#94A3B8]">
            You&apos;ll need to re-upload your guidelines to regenerate.
          </p>
        )}
      </div>

      {/* Server-side continue error */}
      {continueError && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]"
        >
          {continueError}
        </p>
      )}

      {/* Back + Continue */}
      <div className="flex items-center justify-between">
        <Link
          href={`/applications/${applicationId}/step/2`}
          className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Back
        </Link>
        <Button
          type="button"
          disabled={isContinuing}
          onClick={handleContinue}
          className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-70"
        >
          {isContinuing ? 'Saving…' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-l-4 border-[#0D6E6E] pl-3 text-[15px] font-semibold text-[#1E293B]">
      {children}
    </h2>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[14px] text-[#374151]">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D6E6E]"
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  )
}
