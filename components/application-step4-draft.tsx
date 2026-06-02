'use client'

// Step 4 — Draft Answers (S6.1–S6.8)
//
// Supports two modes driven by funder_type from ai_summary:
//   free_form  — section-by-section narrative interface (Option B design)
//   structured — numbered Q&A interview
//
// Both modes share: sticky progress bar, funder context bar, wider layout,
// auto-save on blur, 60-second background sweep, and AI refine assist.
//
// Charity-authored model: the charity writes all content; AI assists only
// on request via "Help me improve this" (S6.6). Budget sections are blocked
// from AI assistance at the UI level.

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { AlertTriangle, AlertCircle, Sparkles, CheckCircle2, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { StepIndicator } from '@/components/step-indicator'
import { saveAnswer, approveAnswer, saveManualAnswer, setDraftReadyToAssemble } from '@/actions/applications'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestionRow = {
  id: string
  questionText: string
  questionOrder: number
  wordLimit: number | null
  charLimit: number | null
  limitType: 'words' | 'characters' | 'none' | null
  answerText: string | null
  answerSource: 'ai_generated' | 'user_edited' | 'user_written' | null
  isBudgetQuestion: boolean
  guidance: string | null
  isApproved: boolean
}

type RefineState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'showing'; refinedText: string }

interface ApplicationStep4DraftProps {
  applicationId: string
  questions: QuestionRow[]
  funderType: 'structured' | 'free_form'
  funderName: string
  grantName: string
  approachingLimit: boolean
  limitReached: boolean
}

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
  funderType,
  funderName,
  grantName,
  approachingLimit,
  limitReached,
}: ApplicationStep4DraftProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => Object.fromEntries(questions.map((q) => [q.id, q.answerText ?? ''])),
  )

  // FR-33: per-question approval state (initialised from DB is_approved)
  const [approved, setApproved] = useState<Record<string, boolean>>(
    () => Object.fromEntries(questions.map((q) => [q.id, q.isApproved])),
  )
  // Tracks whether server approval call is in flight per question
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [approveErrors, setApproveErrors] = useState<Record<string, string>>({})

  const [refineStates, setRefineStates] = useState<Record<string, RefineState>>(
    () => Object.fromEntries(questions.map((q) => [q.id, { status: 'idle' } as RefineState])),
  )

  const [isSaving, setIsSaving] = useState(false)
  const [assembleError, setAssembleError] = useState<string | null>(null)
  const [isAssembling, startAssembleTransition] = useTransition()

  // manual entry state (no questions/sections path)
  const [manualQuestion, setManualQuestion] = useState('')
  const [manualAnswer, setManualAnswer] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)
  const [isSavingManual, setIsSavingManual] = useState(false)
  const [manualContinueError, setManualContinueError] = useState<string | null>(null)
  const [isManualContinuing, startManualContinueTransition] = useTransition()

  const latestAnswers = useRef(answers)
  latestAnswers.current = answers
  const dirtyRef = useRef<Set<string>>(new Set())
  const pendingSaves = useRef(0)

  const answeredCount = questions.filter((q) => (answers[q.id] ?? '').trim() !== '').length
  // FR-32/FR-33: progress bar and gate use approved count, not just answered count
  const approvedCount = questions.filter((q) => approved[q.id]).length
  const allApproved = questions.length > 0 && approvedCount === questions.length

  const itemLabel = funderType === 'free_form' ? 'section' : 'question'
  const itemLabelPlural = funderType === 'free_form' ? 'sections' : 'questions'

  // ── Auto-save ─────────────────────────────────────────────────────────────

  async function doSave(
    answerId: string,
    text: string,
    source: 'user_edited' | 'user_written' = 'user_written',
  ) {
    pendingSaves.current++
    setIsSaving(true)
    try {
      await saveAnswer(answerId, text, source)
    } catch {
      // silent — blur will retry on next edit
    } finally {
      pendingSaves.current--
      if (pendingSaves.current === 0) setIsSaving(false)
    }
  }

  function handleAnswerChange(answerId: string, text: string) {
    setAnswers((prev) => ({ ...prev, [answerId]: text }))
    dirtyRef.current.add(answerId)
    // Editing clears approval — the user must re-approve after any change (FR-33)
    if (approved[answerId]) setApproved((prev) => ({ ...prev, [answerId]: false }))
  }

  function handleAnswerBlur(answerId: string) {
    if (!dirtyRef.current.has(answerId)) return
    dirtyRef.current.delete(answerId)
    void doSave(answerId, latestAnswers.current[answerId] ?? '')
  }

  // 60-second background sweep — catches dirty answers if user closes tab
  useEffect(() => {
    const interval = setInterval(() => {
      for (const id of [...dirtyRef.current]) {
        dirtyRef.current.delete(id)
        void doSave(id, latestAnswers.current[id] ?? '')
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Refine answer (S6.6) ─────────────────────────────────────────────────

  async function handleRefine(q: QuestionRow) {
    const text = (latestAnswers.current[q.id] ?? '').trim()
    if (!text) return

    // Belt-and-braces: re-check word/char limit at call time using the latest answer text.
    // The disabled prop on the button is the primary gate, but React batching can
    // allow a click to fire before the next render reflects isOver=true.
    if (q.wordLimit != null && countWords(text) > q.wordLimit) return
    if (q.charLimit != null && text.length > q.charLimit) return

    setRefineStates((prev) => ({ ...prev, [q.id]: { status: 'loading' } }))

    try {
      const res = await fetch('/api/refine-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          answerId: q.id,
          questionText: q.questionText,
          answerText: text,
        }),
      })

      const data = (await res.json()) as { refinedText?: string; error?: string }

      if (!res.ok || data.error) {
        setRefineStates((prev) => ({
          ...prev,
          [q.id]: {
            status: 'error',
            message: data.error ?? 'Could not improve your answer. Please try again.',
          },
        }))
        return
      }

      setRefineStates((prev) => ({
        ...prev,
        [q.id]: { status: 'showing', refinedText: data.refinedText ?? '' },
      }))
    } catch {
      setRefineStates((prev) => ({
        ...prev,
        [q.id]: { status: 'error', message: 'Could not reach the server. Please try again.' },
      }))
    }
  }

  function handleUseRefined(answerId: string, refinedText: string) {
    setAnswers((prev) => ({ ...prev, [answerId]: refinedText }))
    setRefineStates((prev) => ({ ...prev, [answerId]: { status: 'idle' } }))
    // Replacing text with AI refinement clears approval — re-review required (FR-33)
    setApproved((prev) => ({ ...prev, [answerId]: false }))
    void doSave(answerId, refinedText, 'user_edited')
  }

  function handleKeepOriginal(answerId: string) {
    setRefineStates((prev) => ({ ...prev, [answerId]: { status: 'idle' } }))
  }

  function dismissRefineError(answerId: string) {
    setRefineStates((prev) => ({ ...prev, [answerId]: { status: 'idle' } }))
  }

  // ── Approve answer (FR-33) ────────────────────────────────────────────────

  async function handleApprove(answerId: string) {
    // Flush any unsaved text first so the approved answer matches what's stored
    if (dirtyRef.current.has(answerId)) {
      dirtyRef.current.delete(answerId)
      await doSave(answerId, latestAnswers.current[answerId] ?? '')
    }
    setApprovingId(answerId)
    setApproveErrors((prev) => ({ ...prev, [answerId]: '' }))
    const result = await approveAnswer(answerId)
    setApprovingId(null)
    if (!result.ok) {
      setApproveErrors((prev) => ({ ...prev, [answerId]: result.error }))
    } else {
      setApproved((prev) => ({ ...prev, [answerId]: true }))
    }
  }

  // ── Ready to assemble ─────────────────────────────────────────────────────

  function handleReadyToAssemble() {
    setAssembleError(null)
    startAssembleTransition(async () => {
      const result = await setDraftReadyToAssemble(applicationId)
      if (result && !result.ok) setAssembleError(result.error)
    })
  }

  // ── Manual entry continue (no questions/sections path) ────────────────────

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

    startManualContinueTransition(async () => {
      const result = await setDraftReadyToAssemble(applicationId)
      if (result && !result.ok) {
        setManualContinueError(result.error)
        setIsSavingManual(false)
      }
    })
  }

  // ── No questions/sections extracted — manual entry fallback ───────────────

  if (questions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6">
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
              {countWords(manualAnswer)} {countWords(manualAnswer) === 1 ? 'word' : 'words'}
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

        {manualContinueError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <p className="text-[13px] text-[#991B1B]">{manualContinueError}</p>
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
            onClick={() => void handleManualContinue()}
            disabled={isSavingManual || isManualContinuing}
            className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
          >
            {isSavingManual || isManualContinuing ? 'Saving…' : 'Ready to assemble'}
          </Button>
        </div>
      </div>
    )
  }

  // ── Main interview / section-by-section path ──────────────────────────────

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6">
      <StepIndicator currentStep={4} />

      {/* Funder context bar — Back link + funder name */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-[#0D6E6E] px-4 py-3">
        <p className="text-[13px] font-medium text-white">
          {funderName}
          {grantName && grantName !== funderName && (
            <span className="ml-2 font-normal opacity-80">&middot; {grantName}</span>
          )}
        </p>
        <Link
          href={`/applications/${applicationId}/step/3`}
          className="text-[13px] text-white opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
        >
          ← Back
        </Link>
      </div>

      {/* Sticky progress bar — offset by nav height (h-16 = 64px) */}
      <div className="sticky top-16 z-10 -mx-4 mb-6 border-b border-[#E2E8F0] bg-white px-4 py-3 shadow-sm sm:-mx-6 sm:px-6">
        <div className="mx-auto max-w-[960px]">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] text-[#64748B]">
              {approvedCount} of {questions.length}{' '}
              {approvedCount === 1 ? itemLabel : itemLabelPlural} approved
            </span>
            {isSaving && (
              <span className="text-[12px] text-[#94A3B8]" aria-live="polite">
                Saving&hellip;
              </span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-[#0D6E6E] transition-all duration-300"
              style={{ width: `${(approvedCount / questions.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={approvedCount}
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-label={funderType === 'free_form' ? 'Sections approved' : 'Questions approved'}
            />
          </div>
        </div>
      </div>

      <h1 className="mb-2 text-[24px] font-bold text-[#1E293B]">Your draft answers</h1>
      <p className="mb-6 text-[14px] text-[#64748B]">
        {funderType === 'free_form'
          ? 'Write your content for each section below. Your work is saved automatically as you type.'
          : 'Answer each question below. Your work is saved automatically as you type.'}
      </p>

      {/* AI limit banners */}
      {approachingLimit && !limitReached && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-[13px] text-[#78350F]">
            You&apos;ve used most of your monthly AI allowance. &ldquo;Help me improve this&rdquo;
            may not be available for all {itemLabelPlural}.
          </p>
        </div>
      )}
      {limitReached && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[13px] text-[#991B1B]">
            You&apos;ve reached your monthly AI limit. You can still write and edit your answers
            — AI writing assistance is unavailable until next month.
          </p>
        </div>
      )}

      {/* Question / section cards */}
      <div className="mb-8 space-y-6">
        {questions.map((q) => {
          const text = answers[q.id] ?? ''
          const words = countWords(text)
          const chars = text.length
          const useChars = q.limitType === 'characters'
          const limit = useChars ? q.charLimit : q.wordLimit
          const count = useChars ? chars : words
          const isOver = limit != null && count > limit
          const isNear = limit != null && !isOver && count > limit * 0.9
          const refineState = refineStates[q.id] ?? ({ status: 'idle' } as RefineState)
          const isEmpty = text.trim() === ''

          const isApprovedQ = approved[q.id] ?? false
          const isApprovingQ = approvingId === q.id
          const approveError = approveErrors[q.id] ?? ''

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 ${
                isApprovedQ
                  ? 'border-[#6EE7B7] bg-[#F0FDF4]'
                  : q.isBudgetQuestion
                    ? 'border-[#FDE68A] bg-[#FFFBEB]'
                    : 'border-[#E2E8F0] bg-white'
              }`}
            >
              {/* Card header */}
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-[15px] font-semibold leading-snug text-[#1E293B]">
                  {funderType === 'structured' && (
                    <span className="mr-0.5">{q.questionOrder}.&nbsp;</span>
                  )}
                  {q.questionText}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  {limit && (
                    <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
                      {limit}&nbsp;{useChars ? 'characters' : 'words'}
                    </span>
                  )}
                  {q.isBudgetQuestion && (
                    <span className="rounded bg-[#FDE68A] px-2 py-0.5 text-[11px] font-semibold text-[#78350F]">
                      Budget
                    </span>
                  )}
                </div>
              </div>

              {/* Guidance note — free_form non-budget sections */}
              {funderType === 'free_form' && q.guidance && !q.isBudgetQuestion && (
                <p className="mb-3 text-[13px] leading-relaxed text-[#64748B]">{q.guidance}</p>
              )}

              {/* Budget warning */}
              {q.isBudgetQuestion && (
                <div className="mb-3 flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]"
                    aria-hidden="true"
                  />
                  <p className="text-[12px] text-[#78350F]">
                    {funderType === 'free_form'
                      ? 'Budget sections must be completed using your own figures, as AI cannot generate these for you. Please ensure all numbers are accurate before proceeding.'
                      : 'Budget questions must be completed using your own figures, as AI cannot generate these for you. Please ensure all numbers are accurate before proceeding.'}
                  </p>
                </div>
              )}

              {/* Textarea */}
              <Textarea
                id={`answer-${q.id}`}
                value={text}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                onBlur={() => handleAnswerBlur(q.id)}
                rows={8}
                aria-label={
                  funderType === 'free_form'
                    ? `Content for ${q.questionText}`
                    : `Answer for question ${q.questionOrder}`
                }
                placeholder={
                  funderType === 'free_form'
                    ? 'Write your content here…'
                    : 'Write your answer here…'
                }
                className={`text-[14px] ${q.isBudgetQuestion ? 'bg-white' : ''}`}
              />

              {/* Word count */}
              <p
                className={`mt-1 text-right text-[12px] ${
                  isOver ? 'text-[#DC2626]' : isNear ? 'text-[#D97706]' : 'text-[#94A3B8]'
                }`}
                aria-live="polite"
              >
                {limit
                  ? `${count} / ${limit} ${useChars ? 'characters' : 'words'}`
                  : `${words} words`}
              </p>

              {/* Refine answer — non-budget only */}
              {!q.isBudgetQuestion && (
                <div className="mt-3">
                  {refineState.status === 'idle' && (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleRefine(q)}
                        disabled={isEmpty || limitReached || isOver || isApprovedQ}
                        className="flex items-center gap-1.5 rounded text-[13px] text-[#0D6E6E] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        Help me improve this
                      </button>
                      {isOver && (
                        <p className="mt-1 text-[12px] text-[#DC2626]">
                          Your answer exceeds the word limit. Please reduce it first, then use AI to refine and improve the structure.
                        </p>
                      )}
                    </>
                  )}

                  {refineState.status === 'loading' && (
                    <p className="text-[13px] text-[#64748B]">Improving your answer&hellip;</p>
                  )}

                  {refineState.status === 'error' && (
                    <div className="flex items-center gap-3">
                      <p className="text-[13px] text-[#DC2626]">{refineState.message}</p>
                      <button
                        type="button"
                        onClick={() => dismissRefineError(q.id)}
                        className="text-[13px] text-[#64748B] underline hover:no-underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {refineState.status === 'showing' && (
                    <div className="mt-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-4">
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#1D4ED8]">
                        Suggested improvement
                      </p>
                      <p className="mb-4 whitespace-pre-wrap text-[14px] leading-relaxed text-[#1E293B]">
                        {refineState.refinedText}
                      </p>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          onClick={() => handleUseRefined(q.id, refineState.refinedText)}
                          className="h-8 bg-[#1D4ED8] px-4 text-[13px] font-semibold text-white hover:bg-[#1E40AF]"
                        >
                          Use this version
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleKeepOriginal(q.id)}
                          className="text-[13px] text-[#64748B] underline hover:no-underline"
                        >
                          Keep my original
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FR-32 / FR-33 — Review prompts and approval step */}
              {!isEmpty && !isApprovedQ && refineState.status !== 'showing' && (
                <div className="mt-5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] p-4">
                  <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#475569]">
                    Before you approve, check:
                  </p>
                  <ul className="mb-4 space-y-2">
                    <li className="flex items-start gap-2 text-[13px] text-[#1E293B]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" aria-hidden="true" />
                      Does this accurately describe your charity and project?
                    </li>
                    <li className="flex items-start gap-2 text-[13px] text-[#1E293B]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" aria-hidden="true" />
                      Are all figures, dates, and facts correct?
                    </li>
                    <li className="flex items-start gap-2 text-[13px] text-[#1E293B]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" aria-hidden="true" />
                      Does this answer the question that was asked?
                    </li>
                  </ul>
                  {approveError && (
                    <p className="mb-3 text-[13px] text-[#DC2626]" role="alert">
                      {approveError}
                    </p>
                  )}
                  <Button
                    type="button"
                    onClick={() => void handleApprove(q.id)}
                    disabled={isApprovingQ}
                    className="h-9 bg-[#0D6E6E] px-5 text-[13px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
                  >
                    {isApprovingQ ? 'Approving…' : 'Approve this answer'}
                  </Button>
                </div>
              )}

              {/* Approved confirmation banner */}
              {isApprovedQ && (
                <div className="mt-4 flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                  <span className="text-[13px] font-medium text-[#059669]">
                    Answer approved — edit above to revise
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Assemble error */}
      {assembleError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[13px] text-[#991B1B]">{assembleError}</p>
        </div>
      )}

      {/* Back + Ready to assemble */}
      <div className="flex items-center justify-between">
        <Link
          href={`/applications/${applicationId}/step/3`}
          className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Back
        </Link>
        <Button
          type="button"
          onClick={handleReadyToAssemble}
          disabled={!allApproved || isAssembling}
          title={
            !allApproved
              ? `Approve all ${questions.length} ${itemLabelPlural} to continue`
              : undefined
          }
          className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
        >
          {isAssembling ? 'Saving…' : 'Ready to assemble'}
        </Button>
      </div>
    </div>
  )
}
