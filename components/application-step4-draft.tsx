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
import {
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Scissors,
  CheckCircle2,
  CheckCheck,
  FileText,
  History,
} from 'lucide-react'
import { SAVE_FAILED_MESSAGE, ACTION_FAILED_MESSAGE } from '@/lib/action-error'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { StepIndicator } from '@/components/step-indicator'
import {
  saveAnswer,
  approveAnswer,
  saveManualAnswer,
  setDraftReadyToAssemble,
  addManualGovernanceItems,
} from '@/actions/applications'
import type { GuidelineCitation } from '@/lib/types'
import { findQuoteRange } from '@/lib/guideline-citations'
import {
  GOVERNANCE_ITEMS,
  GOVERNANCE_FIELD_EXPLANATIONS,
  type GovernanceFieldKey,
} from '@/lib/governance-items'
import { MONTHLY_CAP } from '@/lib/prompts'
import { ContextualTooltip } from '@/components/contextual-tooltip'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestionRow = {
  id: string
  questionText: string
  questionOrder: number
  /** 'narrative' for ordinary AI-extracted questions/sections; 'number' | 'data' for the 5 fixed governance items (fieldKey set). */
  itemType: 'narrative' | 'data' | 'number'
  /** Set only for the 5 governance/reserves items (2026-07-15) — null for ordinary narrative items. */
  fieldKey: string | null
  wordLimit: number | null
  charLimit: number | null
  limitType: 'words' | 'characters' | 'none' | null
  answerText: string | null
  answerSource: 'ai_generated' | 'user_edited' | 'user_written' | null
  isBudgetQuestion: boolean
  guidance: string | null
  isApproved: boolean
  guidelineReference: GuidelineCitation | null
  /** True when this answer was carried over from a previous application via P6.5's reuse feature. */
  isCarriedOver: boolean
  /** True only for a governance item the charity added themselves via the manual-add picker (PDR-AI-008 fast-follow) — shows "Added by you" instead of a citation badge. */
  addedManually: boolean
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
  /** AI requests used this calendar month (of MONTHLY_CAP). Computed at page
   * load; kept in sync with each refine response's own currentUsage so the
   * count is live without a page reload (PDR-UI-008, tt-ai-help-limit). */
  currentUsage: number
  /** Retained guideline text (P6.4, GAP-33) — null if never retained (older
   * applications, or the summary has never been regenerated since). Text
   * only, never the raw file (ADR-DATA-002). */
  guidelineText: string | null
  /** free_form only (PDR-AI-012) — a single word limit governing several
   * sections together rather than any one of them individually. null when
   * the guidelines state no such aggregate limit (the common case), or for
   * structured funders. */
  overallWordLimit: number | null
}

/** Badge/dialog-title labels stay readable even when a funder's own document
 * styles a whole instructional paragraph as a heading (found live, 2026-07-17,
 * Stony Stratford Town Council: "a) Give details of expenditure required for
 * your project e.g. materials..." — a real, valid heading_path, just far too
 * long to render as a small badge). Truncates at a word boundary; the full
 * text is still shown via the button's title attribute and inside the "view
 * original guidelines" panel itself. */
const CITATION_LABEL_MAX_LENGTH = 90

/** How long a "Saved" confirmation stays on screen before clearing itself
 * (AC-FR-18-05). Module scope, not component scope: a per-render const makes
 * `markSaved` — and through it `doSave` — look unstable to
 * react-hooks/exhaustive-deps, which then demands `doSave` as a dependency of
 * the 60-second sweep effect and would restart the interval on every render. */
const SAVED_INDICATOR_MS = 2500

function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) return label
  const truncated = label.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trimEnd()}…`
}

/** Untruncated citation text — used for the badge's `title` (hover) attribute
 * so the full heading is still available even when citationLabel() below
 * truncates the visible text. 'item' (2026-07-21 amendment): fallback marker
 * for guidelines with no page or heading structure at all — see
 * lib/extract-text.ts / lib/preprocess-text.ts. */
function citationFullLabel(citation: GuidelineCitation): string {
  if (citation.source_type === 'page') return `Page ${citation.page_number} of the guidelines`
  if (citation.source_type === 'heading') return citation.heading_path.join(' > ')
  return `Item ${citation.item_number} of the guidelines`
}

/** A short label for a citation badge, e.g. "Page 5 of the guidelines" or "Eligibility > Referrals". */
function citationLabel(citation: GuidelineCitation): string {
  return truncateLabel(citationFullLabel(citation), CITATION_LABEL_MAX_LENGTH)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

/**
 * Must match REFINE_IRRELEVANT_WARNING in lib/prompts.ts (PDR-AI-009) —
 * duplicated here rather than imported so this client component doesn't
 * bundle the server-only prompt library (system prompt, full JSON schemas).
 */
const REFINE_IRRELEVANT_WARNING =
  '⚠️ This answer does not appear to address the question above — please check it carefully before approving.'

/**
 * Strips a leading REFINE_IRRELEVANT_WARNING line (plus the blank line after
 * it) before a refined suggestion is adopted as the answer text — the
 * warning is meant to catch the reviewer's eye in the suggestion panel, not
 * to end up saved as part of the charity's actual application answer.
 */
function stripRefineWarning(text: string): string {
  return text.startsWith(REFINE_IRRELEVANT_WARNING)
    ? text.slice(REFINE_IRRELEVANT_WARNING.length).replace(/^\s*\n+/, '')
    : text
}

/**
 * Deterministic "Trim to limit" for budget/financial questions (PDR-AI-007).
 * No AI/LLM call — mechanically cuts to the last complete sentence that still
 * fits within the limit, giving the charity a starting point rather than
 * counting down from e.g. 503 to 250 words by hand. Falls back to a hard
 * word/character cut (snapped to a word boundary) if even the first sentence
 * alone exceeds the limit.
 */
function trimToLimit(text: string, limit: number, useChars: boolean): string {
  const trimmed = text.trim()
  if (trimmed === '') return trimmed

  // Sentence boundary: ./!/? optionally followed by a closing quote, then
  // whitespace or end of string.
  const sentenceEndPattern = /[.!?]['"’”]?(?:\s+|$)/g
  let bestEnd = 0
  let match: RegExpExecArray | null
  while ((match = sentenceEndPattern.exec(trimmed))) {
    const candidateEnd = match.index + match[0].length
    const candidate = trimmed.slice(0, candidateEnd).trim()
    const size = useChars ? candidate.length : countWords(candidate)
    if (size > limit) break
    bestEnd = candidateEnd
  }

  if (bestEnd > 0) return trimmed.slice(0, bestEnd).trim()

  // No complete sentence fits — hard cut, snapped to a word boundary so a
  // word is never left truncated mid-way.
  if (useChars) {
    const slice = trimmed.slice(0, limit)
    const lastSpace = slice.lastIndexOf(' ')
    return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim()
  }

  return trimmed.split(/\s+/).slice(0, limit).join(' ')
}

/** Renders a raw digit string with UK thousands separators, e.g. "1234567" -> "1,234,567". */
function formatThousands(digits: string): string {
  if (digits === '') return ''
  return Number(digits).toLocaleString('en-GB')
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
  currentUsage,
  guidelineText,
  overallWordLimit,
}: ApplicationStep4DraftProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.answerText ?? ''])),
  )

  // PDR-UI-008 (tt-ai-help-limit): live count of AI requests used this month,
  // seeded from the page-load value and updated from each refine response's
  // own currentUsage so it stays accurate without a page reload.
  const [aiUsageCount, setAiUsageCount] = useState(currentUsage)

  // P6.4: "view original guidelines" panel — which citation is being viewed,
  // or null if the panel is closed. A single dialog is reused for every
  // question's citation rather than one per card.
  const [viewingCitation, setViewingCitation] = useState<GuidelineCitation | null>(null)

  // FR-33: per-question approval state (initialised from DB is_approved)
  const [approved, setApproved] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.isApproved])),
  )
  // Tracks whether server approval call is in flight per question
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [approveErrors, setApproveErrors] = useState<Record<string, string>>({})

  const [refineStates, setRefineStates] = useState<Record<string, RefineState>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, { status: 'idle' } as RefineState])),
  )

  const [isSaving, setIsSaving] = useState(false)
  // Set when a save fails at transport level rather than returning a result —
  // version skew or an expired session. Opus audit M8.
  const [saveError, setSaveError] = useState<string | null>(null)
  // Per-answer "Saved" confirmation (AC-FR-18-05, GAP-44). Fires on every
  // successful save — blur, the 60-second sweep, and the flush before approve
  // alike. AC-FR-18-02 used to forbid any indicator on background saves; WJ
  // withdrew that on 2026-08-06 after watching a first-time user hesitate to
  // leave the screen, on the reasoning that silence reads as "nothing is
  // happening" rather than "everything is fine". What survives from the old
  // rule is that this must not interrupt: it appears, it clears itself, there
  // is nothing to dismiss and focus is never moved.
  const [recentlySaved, setRecentlySaved] = useState<Record<string, boolean>>({})
  const [assembleError, setAssembleError] = useState<string | null>(null)
  const [isAssembling, startAssembleTransition] = useTransition()

  // PDR-AI-008 fast-follow — manual-add picker for governance facts the
  // guideline extraction found no signal for (zero-signal fallback, not
  // proactively suggested — see docs/PRD decisions/PDR-AI-008-...md).
  const [showManualAddPanel, setShowManualAddPanel] = useState(false)
  const [selectedManualFieldKeys, setSelectedManualFieldKeys] = useState<Set<GovernanceFieldKey>>(
    new Set(),
  )
  const [isSavingManualAdd, setIsSavingManualAdd] = useState(false)
  const [manualAddError, setManualAddError] = useState<string | null>(null)

  // Only offer facts not already shown — this is a supplement, not a
  // duplicate-detection mechanism. Hidden entirely once all 5 are present.
  const shownFieldKeys = new Set(questions.map((q) => q.fieldKey).filter(Boolean))
  const missingGovernanceItems = GOVERNANCE_ITEMS.filter(
    (item) => !shownFieldKeys.has(item.field_key),
  )

  // manual entry state (no questions/sections path)
  const [manualQuestion, setManualQuestion] = useState('')
  const [manualAnswer, setManualAnswer] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)
  const [isSavingManual, setIsSavingManual] = useState(false)
  const [manualContinueError, setManualContinueError] = useState<string | null>(null)
  const [isManualContinuing, startManualContinueTransition] = useTransition()

  const latestAnswers = useRef(answers)
  // eslint-disable-next-line react-hooks/refs -- intentional "latest value" ref pattern; read only in callbacks/intervals, not during render
  latestAnswers.current = answers
  const dirtyRef = useRef<Set<string>>(new Set())
  const pendingSaves = useRef(0)
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // FR-32/FR-33: progress bar and gate use approved count, not just answered count
  const approvedCount = questions.filter((q) => approved[q.id]).length
  // A question is optional if its text contains "(optional)" or starts with
  // "this question is optional" (e.g. Lloyds Bank Foundation Q10).
  // Optional questions that are unanswered do not block the assembly gate.
  // Manually-added governance items (q.addedManually) are the one exception:
  // their item_label also carries "(optional)" (matching the AI-detected
  // form of the same fact, which is deliberately skippable-when-blank per
  // PDR-AI-008), but a manual add is the charity actively choosing to answer
  // that fact — so once added, it must be answered and approved like any
  // other required question before the draft can be assembled.
  const isOptionalQ = (text: string) =>
    text.toLowerCase().includes('(optional)') ||
    text.toLowerCase().startsWith('this question is optional')

  const allApproved =
    questions.length > 0 &&
    questions.every(
      (q) =>
        approved[q.id] ||
        (!q.addedManually && isOptionalQ(q.questionText) && (answers[q.id] ?? '').trim() === ''),
    )

  const itemLabel = funderType === 'free_form' ? 'section' : 'question'
  const itemLabelPlural = funderType === 'free_form' ? 'sections' : 'questions'

  // PDR-AI-012 — combined word counter across sections sharing one aggregate
  // limit (e.g. "keep your total response to 500 words" spanning several
  // AI-extracted sections, none of which carries its own wordLimit). Only
  // narrative sections with no limit of their own count towards it — a
  // section that DOES carry its own wordLimit/charLimit is already covered
  // by its own per-card counter and must not be double-counted here.
  const combinedLimitQuestions =
    overallWordLimit != null
      ? questions.filter((q) => q.fieldKey == null && q.wordLimit == null && q.charLimit == null)
      : []
  const combinedWordCount = combinedLimitQuestions.reduce(
    (sum, q) => sum + countWords(answers[q.id] ?? ''),
    0,
  )
  const combinedLimitQuestionIds = new Set(combinedLimitQuestions.map((q) => q.id))
  const combinedIsOver = overallWordLimit != null && combinedWordCount > overallWordLimit
  const combinedIsNear =
    overallWordLimit != null && !combinedIsOver && combinedWordCount > overallWordLimit * 0.9

  // PDR-UI-008 — tt-ai-help-limit and tt-budget-no-ai each attach to the
  // first matching card only, not every card of that kind; computed once
  // here rather than inside the render loop below.
  const firstRefineButtonIndex = questions.findIndex(
    (q) => !q.isBudgetQuestion && q.fieldKey == null,
  )
  const firstBudgetQuestionIndex = questions.findIndex((q) => q.isBudgetQuestion)

  // ── Auto-save ─────────────────────────────────────────────────────────────

  // Clear pending indicator timers on unmount so none fires setState against a
  // component that has gone (e.g. the user navigates away right after a save).
  useEffect(() => {
    const timers = savedTimers
    return () => {
      for (const timer of Object.values(timers.current)) clearTimeout(timer)
      timers.current = {}
    }
  }, [])

  async function doSave(
    answerId: string,
    text: string,
    source: 'user_edited' | 'user_written' = 'user_written',
  ) {
    pendingSaves.current++
    setIsSaving(true)
    try {
      await saveAnswer(answerId, text, source)
      // A save getting through clears any earlier failure notice — the user has
      // recovered (usually by reloading) and the banner would now be misleading.
      setSaveError(null)
      // "Saved" confirmation (AC-FR-18-05). Inlined rather than extracted to a
      // helper on purpose: react-hooks/exhaustive-deps does not propagate
      // stability through a component-scope function, so calling one from here
      // would make `doSave` itself look unstable and force it into the
      // 60-second sweep effect's dependency array — restarting the interval on
      // every render. Touching only setState and refs keeps `doSave` stable.
      setRecentlySaved((prev) => ({ ...prev, [answerId]: true }))
      // Restart rather than stack: a fast second save must not have its tick
      // cleared early by the first save's timer still running.
      clearTimeout(savedTimers.current[answerId])
      savedTimers.current[answerId] = setTimeout(() => {
        setRecentlySaved((prev) => {
          const next = { ...prev }
          delete next[answerId]
          return next
        })
        delete savedTimers.current[answerId]
      }, SAVED_INDICATOR_MS)
    } catch {
      // Previously silent, on the reasoning that blur would retry on the next
      // edit. It does — but if the cause is version skew or an expired session
      // every retry fails too, and the user was told nothing while believing
      // their work was saved. Opus audit M8.
      setSaveError(SAVE_FAILED_MESSAGE)
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
  }, [])

  // ── Refine answer (S6.6) ─────────────────────────────────────────────────

  async function handleRefine(q: QuestionRow) {
    const text = (latestAnswers.current[q.id] ?? '').trim()
    if (!text) return

    // Note: AI assist is intentionally allowed when over the word limit.
    // The refine prompt instructs the AI to stay within the word limit, so it
    // will actively compress the answer — more helpful than blocking the user.

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

      const data = (await res.json()) as {
        refinedText?: string
        error?: string
        approachingLimit?: boolean
        currentUsage?: number
      }

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

      // Keep the live AI-usage count in sync with what the server actually
      // recorded, rather than incrementing client-side (a failed/cancelled
      // call must not bump the count client never sees the server undo).
      if (typeof data.currentUsage === 'number') setAiUsageCount(data.currentUsage)

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
    const cleanedText = stripRefineWarning(refinedText)
    setAnswers((prev) => ({ ...prev, [answerId]: cleanedText }))
    setRefineStates((prev) => ({ ...prev, [answerId]: { status: 'idle' } }))
    // Replacing text with AI refinement clears approval — re-review required (FR-33)
    setApproved((prev) => ({ ...prev, [answerId]: false }))
    void doSave(answerId, cleanedText, 'user_edited')
  }

  function handleKeepOriginal(answerId: string) {
    setRefineStates((prev) => ({ ...prev, [answerId]: { status: 'idle' } }))
  }

  function dismissRefineError(answerId: string) {
    setRefineStates((prev) => ({ ...prev, [answerId]: { status: 'idle' } }))
  }

  // ── Trim to limit (PDR-AI-007) — budget/financial questions only ─────────
  // Deterministic, no AI/LLM call: mechanically cuts to the last complete
  // sentence within the limit. Chosen over AI assist specifically because it
  // doesn't touch the "AI never sees financial figures" trust guarantee.
  function handleTrimToLimit(q: QuestionRow) {
    const limit = q.limitType === 'characters' ? q.charLimit : q.wordLimit
    if (limit == null) return
    const trimmed = trimToLimit(
      latestAnswers.current[q.id] ?? '',
      limit,
      q.limitType === 'characters',
    )
    setAnswers((prev) => ({ ...prev, [q.id]: trimmed }))
    // Editing clears approval — the user must re-approve after any change (FR-33)
    if (approved[q.id]) setApproved((prev) => ({ ...prev, [q.id]: false }))
    void doSave(q.id, trimmed, 'user_edited')
  }

  // ── Approve answer (FR-33) ────────────────────────────────────────────────

  async function handleApprove(answerId: string) {
    // A governance dropdown can be approved without ever firing onChange (its
    // default is now shown, and approvable, as "Not sure yet" — see isEmpty
    // above) — so an untouched one has no dirty text to flush. Persist the
    // real value it's displaying rather than leaving answer_text null while
    // is_approved flips true.
    const question = questions.find((q) => q.id === answerId)
    const rawText = latestAnswers.current[answerId] ?? ''
    const textToSave =
      question?.itemType === 'data' && rawText.trim() === '' ? 'Not sure yet' : rawText

    // Flush any unsaved text first so the approved answer matches what's stored
    if (dirtyRef.current.has(answerId) || textToSave !== rawText) {
      dirtyRef.current.delete(answerId)
      if (textToSave !== rawText) setAnswers((prev) => ({ ...prev, [answerId]: textToSave }))
      await doSave(answerId, textToSave)
    }
    setApprovingId(answerId)
    setApproveErrors((prev) => ({ ...prev, [answerId]: '' }))
    try {
      const result = await approveAnswer(answerId)
      if (!result.ok) {
        setApproveErrors((prev) => ({ ...prev, [answerId]: result.error }))
      } else {
        setApproved((prev) => ({ ...prev, [answerId]: true }))
      }
    } catch {
      // Transport-level failure — the action never returned a result. Without
      // this the rejection reached the global unhandled handler and the user saw
      // the approve button simply stop, with no explanation. Opus audit M8.
      setApproveErrors((prev) => ({ ...prev, [answerId]: ACTION_FAILED_MESSAGE }))
    } finally {
      setApprovingId(null)
    }
  }

  // ── Manual-add governance items (PDR-AI-008 fast-follow) ──────────────────

  function toggleManualFieldKey(fieldKey: GovernanceFieldKey) {
    setSelectedManualFieldKeys((prev) => {
      const next = new Set(prev)
      if (next.has(fieldKey)) next.delete(fieldKey)
      else next.add(fieldKey)
      return next
    })
  }

  async function handleAddManualGovernanceItems() {
    if (selectedManualFieldKeys.size === 0) {
      setManualAddError('Please select at least one item to add.')
      return
    }
    setManualAddError(null)
    setIsSavingManualAdd(true)
    let result: Awaited<ReturnType<typeof addManualGovernanceItems>>
    try {
      result = await addManualGovernanceItems(applicationId, [...selectedManualFieldKeys])
    } catch {
      // Transport-level failure — see lib/action-error.ts. Opus audit M8.
      setManualAddError(ACTION_FAILED_MESSAGE)
      setIsSavingManualAdd(false)
      return
    }
    setIsSavingManualAdd(false)
    if (!result.ok) {
      setManualAddError(result.error)
      return
    }
    // Hard reload so the server re-syncs and renders the new item(s) at their
    // correct sort position with the rest of Step 4's server-computed state
    // (guidance, citation reconciliation, orphan logic) — same "mutate then
    // hard-refresh" pattern setDraftInProgress's own caller already uses.
    window.location.reload()
  }

  // ── Ready to assemble ─────────────────────────────────────────────────────

  function handleReadyToAssemble() {
    setAssembleError(null)
    startAssembleTransition(async () => {
      try {
        const result = await setDraftReadyToAssemble(applicationId)
        if (result && !result.ok) setAssembleError(result.error)
      } catch {
        // Transport-level failure — see lib/action-error.ts. Without this the
        // rejection escaped the transition unhandled and the button reverted to
        // its idle label with nothing explaining why. Opus audit M8.
        setAssembleError(ACTION_FAILED_MESSAGE)
      }
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

    let saveResult: Awaited<ReturnType<typeof saveManualAnswer>>
    try {
      saveResult = await saveManualAnswer(applicationId, manualQuestion, manualAnswer)
    } catch {
      // Transport-level failure — see lib/action-error.ts. Opus audit M8.
      setManualError(SAVE_FAILED_MESSAGE)
      setIsSavingManual(false)
      return
    }
    if (!saveResult.ok) {
      setManualError(saveResult.error)
      setIsSavingManual(false)
      return
    }

    startManualContinueTransition(async () => {
      try {
        const result = await setDraftReadyToAssemble(applicationId)
        if (result && !result.ok) {
          setManualContinueError(result.error)
          setIsSavingManual(false)
        }
      } catch {
        setManualContinueError(ACTION_FAILED_MESSAGE)
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
            <p className="mt-1 text-right text-[12px] text-[#64748B]">
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
              <span className="text-[12px] text-[#64748B]" aria-live="polite">
                Saving&hellip;
              </span>
            )}
          </div>
          {/* Save-failure notice (Opus audit M8). Lives in the sticky bar
              alongside "Saving…" because that is where the user already looks
              for save state, and being sticky means it cannot be scrolled past
              while they carry on typing into an answer that is not persisting.
              role="alert" so it is announced immediately rather than politely. */}
          {saveError && (
            <div
              role="alert"
              className="mb-1.5 rounded-md border border-[#DC2626] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#991B1B]"
            >
              <span className="font-semibold">Not saved.</span> {saveError}{' '}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="font-semibold underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
              >
                Reload now
              </button>
            </div>
          )}
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
          {overallWordLimit != null && (
            <p
              className={`mt-1.5 text-[14px] font-bold ${
                combinedIsOver
                  ? 'text-[#DC2626]'
                  : combinedIsNear
                    ? 'text-[#D97706]'
                    : 'text-[#334155]'
              }`}
              aria-live="polite"
            >
              Combined across {combinedLimitQuestions.length} linked{' '}
              {combinedLimitQuestions.length === 1 ? 'section' : 'sections'}: {combinedWordCount} /{' '}
              {overallWordLimit} words
            </p>
          )}
        </div>
      </div>

      <h1 className="mb-2 text-[24px] font-bold text-[#1E293B]">Your draft answers</h1>
      <p className="mb-6 text-[14px] text-[#64748B]">
        {/* GAP-42/GAP-43. Two changes from the previous copy, both deliberate:
            "as you type" is gone because it was false — saving is on blur plus
            a 60-second sweep, so up to a minute of typing can be lost, which
            AC-FR-18-03 explicitly accepts; and the resumability sentence is new,
            because nothing on this screen ever told the user a part-written
            application can be abandoned and picked up later. "Continue from
            your dashboard" must not be strengthened to "return to the exact
            point" — return is to the step, not the question, so on a long
            question list the user still has to scroll to find their place. */}
        {funderType === 'free_form'
          ? 'Write your content for each section below. Your work is saved automatically. You can close this page at any time and continue from your dashboard.'
          : 'Answer each question below. Your answers are saved automatically. You can close this page at any time and continue from your dashboard.'}
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
            You&apos;ve reached your monthly AI limit. You can still write and edit your answers —
            AI writing assistance is unavailable until next month.
          </p>
        </div>
      )}

      {/* Question / section cards */}
      <div className="mb-8 space-y-6">
        {questions.map((q, index) => {
          const isGovernanceItem = q.fieldKey != null
          // Sequential display number across ALL items in their existing sort
          // order (governance items first, then narrative questions/sections)
          // — not q.questionOrder, which is the raw item_order used for DB
          // sorting only (negative for governance items, meaningless to a
          // user). Applies to both structured and free_form funders
          // (2026-07-16: numbering extended to free_form, see AC-FR-28-04's
          // revision note).
          const displayNumber = index + 1
          const text = answers[q.id] ?? ''
          const words = countWords(text)
          const chars = text.length
          const useChars = q.limitType === 'characters'
          const limit = useChars ? q.charLimit : q.wordLimit
          const count = useChars ? chars : words
          const isOver = limit != null && count > limit
          const isNear = limit != null && !isOver && count > limit * 0.9
          const refineState = refineStates[q.id] ?? ({ status: 'idle' } as RefineState)
          // A governance "data" item is a Yes/No/Not sure yet select — it
          // always has an effectively selected option (there is no blank
          // placeholder), so "Not sure yet" is a real, always-present answer,
          // not an unanswered state. Treating it as isEmpty hid the approve
          // panel entirely for a manually-added item left at its default,
          // with no way to remove the item to escape it (found live-testing
          // AB Charitable Trust, 2026-07-27).
          const isEmpty = q.itemType === 'data' ? false : text.trim() === ''

          // PDR-AI-006: LLMs can't reliably hit an exact word/character count
          // when compressing — surface this only when the AI's own suggestion
          // is still over the limit, not as a blanket disclaimer. Counted
          // against the warning-stripped text (PDR-AI-009) so a prepended
          // relevance warning never inflates this count.
          const refinedCount =
            refineState.status === 'showing'
              ? useChars
                ? stripRefineWarning(refineState.refinedText).length
                : countWords(stripRefineWarning(refineState.refinedText))
              : 0
          const suggestionShortfall =
            refineState.status === 'showing' && limit != null && refinedCount > limit
              ? refinedCount - limit
              : 0
          const suggestionStillOver = suggestionShortfall > 0

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
                  <span className="mr-0.5">{displayNumber}.&nbsp;</span>
                  {q.questionText}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  {limit && (
                    <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
                      {limit}&nbsp;{useChars ? 'characters' : 'words'}
                    </span>
                  )}
                  {!limit && combinedLimitQuestionIds.has(q.id) && (
                    <span
                      title={`This section shares the funder's overall ${overallWordLimit}-word limit with other sections — see the combined count near the top of the page.`}
                      className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#64748B]"
                    >
                      Counts toward {overallWordLimit}-word total
                    </span>
                  )}
                  {q.isBudgetQuestion && (
                    <span className="rounded bg-[#FDE68A] px-2 py-0.5 text-[11px] font-semibold text-[#78350F]">
                      Budget
                    </span>
                  )}
                  {q.guidelineReference && guidelineText && (
                    <button
                      type="button"
                      onClick={() => setViewingCitation(q.guidelineReference)}
                      title={citationFullLabel(q.guidelineReference)}
                      className="flex items-center gap-1 rounded bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#1D4ED8] hover:bg-[#DBEAFE]"
                    >
                      <FileText className="h-3 w-3" aria-hidden="true" />
                      {citationLabel(q.guidelineReference)}
                    </button>
                  )}
                  {q.addedManually && (
                    <span
                      title="You added this — it wasn't found in the funder's guidelines"
                      className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#64748B]"
                    >
                      Added by you
                    </span>
                  )}
                  {q.isCarriedOver && (
                    <span className="flex items-center gap-1 rounded bg-[#FEF3C7] px-2 py-1 text-[13px] font-bold text-[#92400E]">
                      <History className="h-3.5 w-3.5" aria-hidden="true" />
                      Carried over — please review
                    </span>
                  )}
                </div>
              </div>

              {/* Guidance note — free_form non-budget sections, or any governance item
                    (PDR-AI-008: gives the "why this is asked" context that used to live in
                    the removed "Governance and reserves" section header) */}
              {((funderType === 'free_form' && !q.isBudgetQuestion) || isGovernanceItem) &&
                q.guidance && (
                  <p className="mb-3 text-[13px] leading-relaxed text-[#64748B]">{q.guidance}</p>
                )}

              {/* Budget warning — first budget-type card only gets the
                  tt-budget-no-ai tooltip (PDR-UI-008); every budget card
                  still shows the plain warning text either way. */}
              {q.isBudgetQuestion &&
                (index === firstBudgetQuestionIndex ? (
                  <ContextualTooltip content="AI assistance isn't available here — financial figures are shown exactly as you enter them.">
                    <div
                      tabIndex={0}
                      className="mb-3 flex items-start gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
                    >
                      <AlertTriangle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]"
                        aria-hidden="true"
                      />
                      <p className="text-[12px] text-[#78350F]">
                        {funderType === 'free_form'
                          ? 'Budget sections must be completed using your own figures, as AI cannot assist you with this. Please ensure all numbers are accurate before proceeding.'
                          : 'Budget questions must be completed using your own figures, as AI cannot assist you with this. Please ensure all numbers are accurate before proceeding.'}
                      </p>
                    </div>
                  </ContextualTooltip>
                ) : (
                  <div className="mb-3 flex items-start gap-2">
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]"
                      aria-hidden="true"
                    />
                    <p className="text-[12px] text-[#78350F]">
                      {funderType === 'free_form'
                        ? 'Budget sections must be completed using your own figures, as AI cannot assist you with this. Please ensure all numbers are accurate before proceeding.'
                        : 'Budget questions must be completed using your own figures, as AI cannot assist you with this. Please ensure all numbers are accurate before proceeding.'}
                    </p>
                  </div>
                ))}

              {/* Governance item input — currency (£, UK thousands-separated), plain count, or Yes/No/Not sure yet select */}
              {isGovernanceItem && q.itemType === 'number' && q.isBudgetQuestion && (
                <div className="relative sm:w-60">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[14px] text-[#64748B]"
                    aria-hidden="true"
                  >
                    £
                  </span>
                  <Input
                    id={`answer-${q.id}`}
                    type="text"
                    inputMode="numeric"
                    value={formatThousands(text)}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleAnswerBlur(q.id)}
                    aria-label={q.questionText}
                    className="h-10 pl-6 text-[14px]"
                  />
                </div>
              )}
              {isGovernanceItem && q.itemType === 'number' && !q.isBudgetQuestion && (
                <Input
                  id={`answer-${q.id}`}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={text}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  onBlur={() => handleAnswerBlur(q.id)}
                  aria-label={q.questionText}
                  className="h-10 text-[14px] sm:w-60"
                />
              )}
              {isGovernanceItem && q.itemType === 'data' && (
                <select
                  id={`answer-${q.id}`}
                  // "Not sure yet" is given its own real value (not "") so it's
                  // distinguishable from a genuinely untouched field — an empty
                  // string collapsed both cases together, hiding the approve
                  // panel for a manually-added item until the user picked a
                  // *different* option (found live-testing AB Charitable
                  // Trust, 2026-07-27). The fallback below only covers display
                  // for an item that's never been interacted with yet.
                  value={text === '' ? 'Not sure yet' : text}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  onBlur={() => handleAnswerBlur(q.id)}
                  aria-label={q.questionText}
                  className="h-10 w-full rounded-md border border-[#D1D5DB] bg-transparent px-3 text-[14px] sm:w-60"
                >
                  <option value="Not sure yet">Not sure yet</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              )}

              {/* Textarea — ordinary narrative questions/sections only */}
              {!isGovernanceItem && (
                <Textarea
                  id={`answer-${q.id}`}
                  value={text}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  onBlur={() => handleAnswerBlur(q.id)}
                  rows={8}
                  aria-label={
                    funderType === 'free_form'
                      ? `Content for section ${displayNumber}: ${q.questionText}`
                      : `Answer for question ${displayNumber}`
                  }
                  placeholder={
                    funderType === 'free_form'
                      ? 'Write your content here…'
                      : 'Write your answer here…'
                  }
                  className="text-[14px]"
                />
              )}

              {/* Save confirmation + word count.
                  The "Saved" tick (AC-FR-18-05) sits on every item type,
                  governance fields included — they are answers too, and a £
                  figure typed into a field the user is nervous about is
                  exactly where the reassurance is wanted. The word count is
                  narrative-only, since governance items carry no limit.
                  Deliberately teal and iconographic against the red "Not
                  saved." alert above: a failure is something to act on, a
                  success is something to notice and forget. */}
              <div className="mt-1 flex items-center justify-between gap-3">
                <span
                  role="status"
                  className="flex items-center gap-1 text-[12px] font-medium text-[#0D6E6E]"
                >
                  {recentlySaved[q.id] && (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Saved
                    </>
                  )}
                </span>
                {!isGovernanceItem && (
                  <p
                    className={`text-right text-[12px] ${
                      // 12px, so all three states need 4.5:1 against both white
                      // and the amber card (#FFFBEB) this can sit inside.
                      // `isNear` was #D97706 — 3.19 on white, 3.07 on amber —
                      // and AC-01 never caught it, because the sweep never
                      // typed enough text to reach the near-limit state at all
                      // (`DEF-01`). #92400E gives 7.09 / 6.84. `isOver` at
                      // #DC2626 already passes (4.83 / 4.66) and is left alone.
                      isOver ? 'text-[#DC2626]' : isNear ? 'text-[#92400E]' : 'text-[#64748B]'
                    }`}
                    aria-live="polite"
                  >
                    {limit
                      ? `${count} / ${limit} ${useChars ? 'characters' : 'words'}`
                      : `${words} words`}
                  </p>
                )}
              </div>

              {/* Refine answer — non-budget narrative questions only; AI assist doesn't apply to governance facts */}
              {!q.isBudgetQuestion && !isGovernanceItem && (
                <div className="mt-3">
                  {refineState.status === 'idle' && (
                    <>
                      {index === firstRefineButtonIndex ? (
                        <ContextualTooltip
                          content={`This uses one of your ${MONTHLY_CAP} monthly AI requests. You've used ${aiUsageCount} so far this month.`}
                        >
                          <button
                            type="button"
                            onClick={() => void handleRefine(q)}
                            disabled={isEmpty || limitReached || isApprovedQ}
                            className="flex items-center gap-1.5 rounded text-[13px] text-[#0D6E6E] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                          >
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                            Help me improve this
                          </button>
                        </ContextualTooltip>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleRefine(q)}
                          disabled={isEmpty || limitReached || isApprovedQ}
                          className="flex items-center gap-1.5 rounded text-[13px] text-[#0D6E6E] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                        >
                          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                          Help me improve this
                        </button>
                      )}
                      {isOver && (
                        <>
                          <p className="mt-1 text-[12px] text-[#DC2626]">
                            Your answer exceeds the funder&apos;s word limit. Please trim it or use
                            AI to bring it within the limit before approving.
                          </p>
                          {/* Deterministic fallback alongside AI refine (2026-07-16):
                              AI refine can undershoot the limit (PDR-AI-006) or, as WJ
                              found live-testing, decline entirely when there's nothing
                              genuine to refine — this guarantees a way forward either way. */}
                          <button
                            type="button"
                            onClick={() => handleTrimToLimit(q)}
                            disabled={isApprovedQ}
                            className="mt-1 flex items-center gap-1.5 rounded text-[13px] text-[#0D6E6E] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                          >
                            <Scissors className="h-3.5 w-3.5" aria-hidden="true" />
                            Trim to limit
                          </button>
                        </>
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
                      {suggestionStillOver && (
                        <p className="mb-4 text-[12px] text-[#B45309]">
                          {`This suggestion is still ${suggestionShortfall} ${useChars ? 'character' : 'word'}${suggestionShortfall === 1 ? '' : 's'} over the limit — AI can't always hit an exact ${useChars ? 'character' : 'word'} count. Check the counter and trim it further, or try again.`}
                        </p>
                      )}
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          onClick={() => handleUseRefined(q.id, refineState.refinedText)}
                          className="h-8 bg-[#1D4ED8] px-4 text-[13px] font-semibold text-white hover:bg-[#1E40AF]"
                        >
                          Use this improved version
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

              {/* Over-limit trim assist — budget/financial questions only (PDR-AI-007).
                  No AI reference: assist doesn't exist for these, so the narrative
                  over-limit message above would be inaccurate here. A deterministic
                  "Trim to limit" button gives a starting point without an LLM call,
                  preserving the "AI never sees financial figures" guarantee. */}
              {q.isBudgetQuestion && !isGovernanceItem && isOver && (
                <div className="mt-3">
                  <p className="text-[12px] text-[#DC2626]">
                    {`Your answer exceeds the funder's ${useChars ? 'character' : 'word'} limit. Please trim it — AI assist isn't available for financial figures, so this needs to be adjusted manually before approving.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTrimToLimit(q)}
                    disabled={isApprovedQ}
                    className="mt-1 flex items-center gap-1.5 rounded text-[13px] text-[#0D6E6E] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                  >
                    <Scissors className="h-3.5 w-3.5" aria-hidden="true" />
                    Trim to limit
                  </button>
                </div>
              )}

              {/* FR-32 / FR-33 — Review prompts and approval step.
                  Show when: answer is non-empty OR section is optional (optional
                  sections may be left blank and still approved/skipped). A
                  manually-added governance item is never treated as optional
                  here either — see allApproved's addedManually exception above. */}
              {(!isEmpty || (isOptionalQ(q.questionText) && !q.addedManually)) &&
                !isOver &&
                !isApprovedQ &&
                refineState.status !== 'showing' && (
                  <div className="mt-5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] p-4">
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#475569]">
                      Before you approve, check:
                    </p>
                    <ul className="mb-4 space-y-2">
                      <li className="flex items-start gap-2 text-[13px] text-[#1E293B]">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]"
                          aria-hidden="true"
                        />
                        Does this accurately describe your charity and project?
                      </li>
                      <li className="flex items-start gap-2 text-[13px] text-[#1E293B]">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]"
                          aria-hidden="true"
                        />
                        Are all figures, dates, and facts correct?
                      </li>
                      <li className="flex items-start gap-2 text-[13px] text-[#1E293B]">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]"
                          aria-hidden="true"
                        />
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
                  <span className="text-[13px] font-medium text-[#065F46]">
                    Answer approved — edit above to revise
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Manual-add governance items (PDR-AI-008 fast-follow) — zero-signal
          fallback only, never proactively suggested. Hidden entirely once
          all 5 facts are already shown above. */}
      {missingGovernanceItems.length > 0 && (
        <div className="mb-8">
          {!showManualAddPanel ? (
            <ContextualTooltip content="Some funders expect this even if their guidelines don't ask for it directly.">
              <button
                type="button"
                onClick={() => setShowManualAddPanel(true)}
                className="text-[13px] text-[#64748B] underline-offset-2 hover:text-[#1E293B] hover:underline"
              >
                Need to add something about your finances or governance that wasn&apos;t asked
                above? Add it.
              </button>
            </ContextualTooltip>
          ) : (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="mb-3 text-[14px] font-medium text-[#1E293B]">
                Add a financial or governance detail
              </p>
              <div className="mb-4 space-y-3">
                {missingGovernanceItems.map((item) => (
                  <label
                    key={item.field_key}
                    className="flex cursor-pointer items-start gap-2 text-[13px] text-[#334155]"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={selectedManualFieldKeys.has(item.field_key)}
                      onChange={() => toggleManualFieldKey(item.field_key)}
                    />
                    <span>
                      <span className="font-medium text-[#1E293B]">
                        {item.item_label.replace(/\s*\(optional\)$/, '')}
                      </span>
                      <br />
                      <span className="text-[#64748B]">
                        {GOVERNANCE_FIELD_EXPLANATIONS[item.field_key]}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {manualAddError && (
                <p className="mb-3 text-[13px] text-[#DC2626]" role="alert">
                  {manualAddError}
                </p>
              )}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => void handleAddManualGovernanceItems()}
                  disabled={isSavingManualAdd}
                  className="h-9 bg-[#0D6E6E] px-5 text-[13px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
                >
                  {isSavingManualAdd ? 'Adding…' : 'Add selected'}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualAddPanel(false)
                    setSelectedManualFieldKeys(new Set())
                    setManualAddError(null)
                  }}
                  className="text-[13px] text-[#64748B] hover:text-[#1E293B]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
        <ContextualTooltip
          active={!allApproved}
          content={`Approve all ${questions.length} ${itemLabelPlural} before you can assemble your application.`}
        >
          <Button
            type="button"
            onClick={handleReadyToAssemble}
            disabled={!allApproved || isAssembling}
            className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
          >
            {isAssembling ? 'Saving…' : 'Ready to assemble'}
          </Button>
        </ContextualTooltip>
      </div>

      {/* "View original guidelines" panel (P6.4) — one dialog reused for every
          question's citation, showing the retained text (GAP-33) scrolled to
          and highlighting the cited quote. Text only, never a rendered PDF —
          see ADR-SEC-004/ADR-DATA-007's 2026-07-14 correction. */}
      <Dialog
        open={viewingCitation !== null}
        onOpenChange={(open) => !open && setViewingCitation(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewingCitation ? `Original guidelines — ${citationLabel(viewingCitation)}` : ''}
            </DialogTitle>
            <DialogDescription>
              The text below is exactly what was extracted from your uploaded guidelines.
            </DialogDescription>
          </DialogHeader>
          {viewingCitation && guidelineText && (
            <GuidelineTextPanel
              text={guidelineText}
              quote={viewingCitation.quote}
              label={citationLabel(viewingCitation)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Renders the retained guideline text (P6.4) in a scrollable panel, highlighting
 * and auto-scrolling to the cited quote. If the quote isn't found even with
 * whitespace tolerance (the citation was validated against real page/section
 * markers, not a verbatim-substring guarantee — see lib/guideline-citations.ts),
 * the full text is still shown, just without a highlight — a graceful
 * degradation, not an error.
 */
function GuidelineTextPanel({
  text,
  quote,
  label,
}: {
  text: string
  quote: string
  label: string
}) {
  const highlightRef = useRef<HTMLElement>(null)

  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: 'center' })
  }, [text, quote])

  const range = findQuoteRange(text, quote)
  const before = range ? text.slice(0, range.start) : text
  const match = range ? text.slice(range.start, range.end) : ''
  const after = range ? text.slice(range.end) : ''

  return (
    <div
      className="max-h-[60vh] overflow-y-auto rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4"
      tabIndex={0}
      role="region"
      aria-label={`Original guideline text — ${label}`}
    >
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#334155]">
        {before}
        {match && (
          <mark ref={highlightRef} className="rounded bg-[#FDE68A] px-0.5 text-[#78350F]">
            {match}
          </mark>
        )}
        {after}
      </p>
    </div>
  )
}
