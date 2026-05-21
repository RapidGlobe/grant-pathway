'use client'

// Step 4 — Draft Answers (S6.1–S6.4)
//
// On mount:
//   - If questions.length === 0          → 'no-questions' (manual entry path)
//   - If hasExistingAnswers              → 'content' (returning user, skip AI)
//   - Otherwise                         → 'loading' (first visit, call generate-draft)
//
// Auto-save: debounced 400 ms after each keystroke + 60-second background
// save for any unsaved changes. Silent — no disruptive feedback.
//
// answer_source tracking:
//   - 'ai_generated' set by /api/generate-draft (never by this component)
//   - 'user_edited'  when user modifies an AI-generated answer
//   - 'user_written' when user writes without AI generation

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { StepIndicator } from '@/components/step-indicator'
import {
  saveAnswer,
  saveManualAnswer,
  advanceToStep5,
} from '@/actions/applications'

// ---------------------------------------------------------------------------
// Types (exported so Step 4 page can use them)
// ---------------------------------------------------------------------------

export type QuestionRow = {
  id: string
  questionText: string
  questionOrder: number
  wordLimit: number | null
  answerText: string | null
  answerSource: 'ai_generated' | 'user_edited' | 'user_written' | null
}

type DisplayState = 'loading' | 'content' | 'failure' | 'persistent-failure' | 'no-questions'

type DraftApiResponse = {
  answers: Array<{ id: string; answerText: string }>
  approachingLimit: boolean
}

interface ApplicationStep4DraftProps {
  applicationId: string
  questions: QuestionRow[]
  hasExistingAnswers: boolean
  approachingLimit: boolean
  limitReached: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOADING_MESSAGES = [
  { threshold: 0, text: 'Reviewing your guidelines and charity profile…' },
  { threshold: 40, text: 'Writing your draft answers…' },
  { threshold: 75, text: 'Almost there…' },
]

const REVIEW_PROMPTS = [
  'Does this accurately describe your charity and project?',
  'Are all figures, dates, and facts correct?',
  'Does this answer the question that was asked?',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ApplicationStep4Draft({
  applicationId,
  questions,
  hasExistingAnswers,
  approachingLimit: initialApproachingLimit,
  limitReached: initialLimitReached,
}: ApplicationStep4DraftProps) {
  // ── Derive initial display state ──────────────────────────────────────────
  const getInitialState = (): DisplayState => {
    if (questions.length === 0) return 'no-questions'
    if (hasExistingAnswers) return 'content'
    return 'loading'
  }

  const [displayState, setDisplayState] = useState<DisplayState>(getInitialState)
  const [progress, setProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0].text)

  // answers: keyed by application_answers.id
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => Object.fromEntries(questions.map((q) => [q.id, q.answerText ?? ''])),
  )

  // Limit/approaching state — may be updated if generate-draft returns fresh data
  const [approachingLimit, setApproachingLimit] = useState(initialApproachingLimit)
  const [limitReached] = useState(initialLimitReached)

  // Continue transition
  const [isContinuing, startContinueTransition] = useTransition()
  const [continueError, setContinueError] = useState<string | null>(null)

  // Manual entry state (no-questions path)
  const [manualQuestion, setManualQuestion] = useState('')
  const [manualAnswer, setManualAnswer] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)
  const [isSavingManual, setIsSavingManual] = useState(false)

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false)

  // ── Refs ──────────────────────────────────────────────────────────────────

  // Whether this is a second (retry) attempt — determines failure state
  const isRetryRef = useRef(false)

  // Debounce timers keyed by answer ID
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Tracks which answer IDs have unsaved changes (for 60-second background save)
  const dirtyAnswers = useRef<Set<string>>(new Set())

  // Always-current reference to answers state (used in 60-second save interval)
  const latestAnswers = useRef(answers)
  latestAnswers.current = answers

  // Tracks which IDs were AI-generated (to determine answer_source on save)
  // Initialised from props; updated when generate-draft returns new answers
  const aiGeneratedIdsRef = useRef<Set<string>>(
    new Set(questions.filter((q) => q.answerSource === 'ai_generated').map((q) => q.id)),
  )

  // Pending save counter (to drive isSaving indicator)
  const pendingSaves = useRef(0)

  // ── Auto-save helpers ─────────────────────────────────────────────────────

  function getAnswerSource(answerId: string): 'user_edited' | 'user_written' {
    // If the answer was ever AI-generated, edits are 'user_edited'
    return aiGeneratedIdsRef.current.has(answerId) ? 'user_edited' : 'user_written'
  }

  async function doSave(answerId: string, text: string) {
    pendingSaves.current++
    setIsSaving(true)
    try {
      await saveAnswer(answerId, text, getAnswerSource(answerId))
    } catch {
      // Silent failure — the 60-second interval will retry
    } finally {
      pendingSaves.current--
      if (pendingSaves.current === 0) setIsSaving(false)
    }
  }

  function handleAnswerChange(answerId: string, text: string) {
    setAnswers((prev) => ({ ...prev, [answerId]: text }))
    dirtyAnswers.current.add(answerId)

    // Debounced save — 400 ms after typing stops
    clearTimeout(saveTimers.current[answerId])
    saveTimers.current[answerId] = setTimeout(() => {
      dirtyAnswers.current.delete(answerId)
      void doSave(answerId, text)
    }, 400)
  }

  // ── 60-second background save ─────────────────────────────────────────────
  useEffect(() => {
    if (displayState !== 'content') return

    const interval = setInterval(() => {
      for (const answerId of dirtyAnswers.current) {
        dirtyAnswers.current.delete(answerId)
        void doSave(answerId, latestAnswers.current[answerId] ?? '')
      }
    }, 60_000)

    return () => clearInterval(interval)
  }, [displayState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Generate draft on mount / retry ───────────────────────────────────────
  useEffect(() => {
    if (displayState !== 'loading') return

    let cancelled = false

    setProgress(0)
    setLoadingMessage(LOADING_MESSAGES[0].text)

    let p = 0
    const interval = setInterval(() => {
      p += (89 - p) * 0.04 // asymptotic approach — never reaches 90% on timer alone
      const msg =
        [...LOADING_MESSAGES].reverse().find((m) => p >= m.threshold)?.text ??
        LOADING_MESSAGES[0].text
      setLoadingMessage(msg)
      setProgress(p)
    }, 200)

    fetch('/api/generate-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId }),
    })
      .then((res) => res.json())
      .then((data: DraftApiResponse & { error?: string }) => {
        if (cancelled) return
        clearInterval(interval)
        setProgress(100)

        if (data.error) {
          const willPersist = isRetryRef.current
          isRetryRef.current = true
          setTimeout(() => {
            if (!cancelled) setDisplayState(willPersist ? 'persistent-failure' : 'failure')
          }, 200)
          return
        }

        // Update answers state with AI-generated content
        const newAnswers: Record<string, string> = {}
        for (const item of data.answers ?? []) {
          newAnswers[item.id] = item.answerText
          aiGeneratedIdsRef.current.add(item.id)
        }
        setAnswers((prev) => ({ ...prev, ...newAnswers }))

        // Update approaching-limit state from fresh API data
        if (data.approachingLimit) setApproachingLimit(true)

        setTimeout(() => {
          if (!cancelled) setDisplayState('content')
        }, 300)
      })
      .catch(() => {
        if (cancelled) return
        clearInterval(interval)
        const willPersist = isRetryRef.current
        isRetryRef.current = true
        setDisplayState(willPersist ? 'persistent-failure' : 'failure')
      })

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [displayState, applicationId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Action handlers ───────────────────────────────────────────────────────

  function handleTryAgain() {
    setDisplayState('loading')
  }

  function handleRegenerate() {
    if (limitReached) return
    isRetryRef.current = false
    setDisplayState('loading')
  }

  function handleContinue() {
    setContinueError(null)
    startContinueTransition(async () => {
      const result = await advanceToStep5(applicationId)
      if (result && !result.ok) setContinueError(result.error)
    })
  }

  async function handleManualContinue() {
    if (!manualQuestion.trim()) {
      setManualError('Please enter your application question.')
      return
    }
    setManualError(null)
    setIsSavingManual(true)

    const saveResult = await saveManualAnswer(applicationId, manualQuestion, manualAnswer)
    if (!saveResult.ok) {
      setManualError(saveResult.error)
      setIsSavingManual(false)
      return
    }

    startContinueTransition(async () => {
      const result = await advanceToStep5(applicationId)
      if (result && !result.ok) {
        setContinueError(result.error)
        setIsSavingManual(false)
      }
    })
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (displayState === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={4} />
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
              aria-label="Generating draft answers"
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
        <StepIndicator currentStep={4} />
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <div>
            <p className="text-[14px] text-[#991B1B]">
              We couldn&apos;t generate your draft answers right now. This is usually temporary —
              please try again.
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
            href={`/applications/${applicationId}/step/3`}
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
        <StepIndicator currentStep={4} />
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
            href={`/applications/${applicationId}/step/3`}
            className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Back
          </Link>
        </div>
      </div>
    )
  }

  // ── No questions extracted — manual entry path ──────────────────────────────
  if (displayState === 'no-questions') {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={4} />
        <h1 className="mb-2 text-[24px] font-bold text-[#1E293B]">Your draft answers</h1>
        <p className="mb-8 text-[14px] text-[#64748B]">
          No specific questions were found in the funder&apos;s guidelines. Enter your application
          question below and write your answer.
        </p>

        <div className="space-y-6">
          <div>
            <Label
              htmlFor="manualQuestion"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              Application question
            </Label>
            <Input
              id="manualQuestion"
              type="text"
              value={manualQuestion}
              onChange={(e) => setManualQuestion(e.target.value)}
              placeholder="e.g. Describe your project and who it will help."
              className="h-10 text-[14px]"
              aria-describedby={manualError ? 'manual-error' : undefined}
            />
          </div>
          <div>
            <Label
              htmlFor="manualAnswer"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              Your answer
            </Label>
            <Textarea
              id="manualAnswer"
              rows={10}
              value={manualAnswer}
              onChange={(e) => setManualAnswer(e.target.value)}
              placeholder="Write your answer here&hellip;"
              className="text-[14px]"
            />
            <p className="mt-1 text-right text-[12px] text-[#94A3B8]">
              {countWords(manualAnswer)} words
            </p>
          </div>
        </div>

        {manualError && (
          <div
            id="manual-error"
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <p className="text-[13px] text-[#991B1B]">{manualError}</p>
          </div>
        )}

        {continueError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <p className="text-[13px] text-[#991B1B]">{continueError}</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link
            href={`/applications/${applicationId}/step/3`}
            className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Back
          </Link>
          <Button
            type="button"
            onClick={handleManualContinue}
            disabled={isSavingManual || isContinuing}
            className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
          >
            {isSavingManual || isContinuing ? 'Saving…' : "I’ve reviewed my answers — continue"}
          </Button>
        </div>
      </div>
    )
  }

  // ── Content state ───────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[980px] px-4 py-10 sm:px-6">
      {/* Step indicator constrained to main column width */}
      <div className="max-w-[640px]">
        <StepIndicator currentStep={4} />
      </div>

      <div className="flex items-start gap-8">
        {/* ── Left: main content ── */}
        <div className="w-full min-w-0 max-w-[640px]">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-[24px] font-bold text-[#1E293B]">Your draft answers</h1>
            {isSaving && (
              <span className="text-[12px] text-[#94A3B8]" aria-live="polite">
                Saving&hellip;
              </span>
            )}
          </div>

          {/* Approaching-limit banner */}
          {approachingLimit && !limitReached && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]"
                aria-hidden="true"
              />
              <p className="text-[13px] text-[#78350F]">
                You&apos;ve used most of your monthly AI allowance.
              </p>
            </div>
          )}

          {/* Limit-reached banner */}
          {limitReached && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
                aria-hidden="true"
              />
              <p className="text-[13px] text-[#991B1B]">
                You&apos;ve reached your monthly AI limit. You can still edit your answers
                manually, but you won&apos;t be able to regenerate them until next month.
              </p>
            </div>
          )}

          {/* Draft answer textareas */}
          <div className="mb-6 space-y-8">
            {questions.map((q) => {
              const text = answers[q.id] ?? ''
              const words = countWords(text)
              const isOver = q.wordLimit != null && words > q.wordLimit
              const isNear = q.wordLimit != null && !isOver && words > q.wordLimit * 0.9

              return (
                <div key={q.id}>
                  <p className="mb-2 text-[15px] font-semibold text-[#1E293B]">
                    {q.questionOrder}. {q.questionText}
                    {q.wordLimit && (
                      <span className="ml-2 text-[13px] font-normal text-[#64748B]">
                        ({q.wordLimit} words)
                      </span>
                    )}
                  </p>
                  <Textarea
                    id={`answer-${q.id}`}
                    value={text}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    rows={8}
                    aria-label={`Answer for question ${q.questionOrder}`}
                    className="text-[14px]"
                  />
                  <p
                    className={`mt-1 text-right text-[12px] ${
                      isOver
                        ? 'text-[#DC2626]'
                        : isNear
                          ? 'text-[#D97706]'
                          : 'text-[#94A3B8]'
                    }`}
                    aria-live="polite"
                  >
                    {q.wordLimit ? `${words} / ${q.wordLimit} words` : `${words} words`}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Regenerate all answers */}
          <div className="mb-8">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={limitReached}
              className="flex items-center gap-1.5 rounded text-[14px] text-[#64748B] underline hover:text-[#1E293B] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Regenerate all answers
            </button>
          </div>

          {/* Continue error */}
          {continueError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
                aria-hidden="true"
              />
              <p className="text-[13px] text-[#991B1B]">{continueError}</p>
            </div>
          )}

          {/* Back + Continue */}
          <div className="flex items-center justify-between">
            <Link
              href={`/applications/${applicationId}/step/3`}
              className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
            >
              Back
            </Link>
            <Button
              type="button"
              onClick={handleContinue}
              disabled={isContinuing}
              className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
            >
              {isContinuing
                ? 'Saving…'
                : "I’ve reviewed my answers — continue"}
            </Button>
          </div>
        </div>

        {/* ── Right: sticky review prompts sidebar ── */}
        <aside aria-label="Review checklist" className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-8 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
            <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">
              Before you continue
            </h2>
            <ul className="space-y-4">
              {REVIEW_PROMPTS.map((prompt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D6E6E] text-[11px] font-bold text-white"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="text-[13px] leading-snug text-[#374151]">{prompt}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
