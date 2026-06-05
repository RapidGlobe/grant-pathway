'use client'

// Design mock-up — Step 4 Draft Answers redesign
// Shows three interfaces side by side for comparison:
//   Option A  — Narrative funder: single textarea + guidance checklist
//   Option B  — Narrative funder: section-by-section cards (recommended)
//   Structured — Existing Q&A (improved layout)
// Not connected to real data. Safe to delete after design sign-off.

import { useState } from 'react'
import {
  Sparkles,
  AlertTriangle,
  FileText,
  List,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ── Sample data ──────────────────────────────────────────────────────────────

const NARRATIVE_SECTIONS = [
  {
    id: 'n1',
    title: 'About your organisation',
    guidance:
      "Describe your organisation's mission, the communities you serve, and the difference you make.",
    wordLimit: 200,
    isBudget: false,
  },
  {
    id: 'n2',
    title: 'The need you are addressing',
    guidance:
      'What problem or opportunity does this project respond to? Use evidence or data where possible.',
    wordLimit: 300,
    isBudget: false,
  },
  {
    id: 'n3',
    title: 'Your project and approach',
    guidance:
      'What will you do and how? Describe the activities, timescale, and why this is the right approach.',
    wordLimit: 400,
    isBudget: false,
  },
  {
    id: 'n4',
    title: 'Expected impact and outcomes',
    guidance: 'Who will benefit, what will change for them, and how will you measure success?',
    wordLimit: 300,
    isBudget: false,
  },
  {
    id: 'n5',
    title: 'Financial information',
    guidance:
      'Total project cost, amount requested from Garfield Weston, and how funds will be spent. Complete this section with your finance lead or treasurer.',
    wordLimit: 200,
    isBudget: true,
  },
  {
    id: 'n6',
    title: 'Other funders and partnerships',
    guidance: 'List any confirmed or pending co-funders. Describe key delivery partnerships.',
    wordLimit: 150,
    isBudget: false,
  },
]

const STRUCTURED_QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    text: "Summarise your organisation's work in 15 words or fewer.",
    wordLimit: 15,
    isBudget: false,
  },
  {
    id: 'q2',
    number: 2,
    text: 'What does your organisation do, who do you work with, and where?',
    wordLimit: 150,
    isBudget: false,
  },
  {
    id: 'q3',
    number: 3,
    text: 'What change are you seeking to bring about and why is it needed?',
    wordLimit: 200,
    isBudget: false,
  },
  {
    id: 'q4',
    number: 4,
    text: 'What are the main activities you will carry out to achieve this change?',
    wordLimit: 200,
    isBudget: false,
  },
  {
    id: 'q5',
    number: 5,
    text: 'How much are you requesting from ABCT, and how will the funds be spent?',
    wordLimit: 150,
    isBudget: true,
  },
  {
    id: 'q6',
    number: 6,
    text: 'How do you measure the difference you make to the people you work with?',
    wordLimit: 150,
    isBudget: false,
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function wc(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function WordCount({ text, limit }: { text: string; limit: number | null }) {
  const count = wc(text)
  const over = limit !== null && count > limit
  return (
    <span
      className={`text-[12px] tabular-nums ${
        over ? 'font-semibold text-[#DC2626]' : 'text-[#94A3B8]'
      }`}
    >
      {count}
      {limit !== null ? ` / ${limit} words` : ' words'}
    </span>
  )
}

function AIButton({ disabled, reason }: { disabled: boolean; reason?: string }) {
  return (
    <button
      disabled={disabled}
      title={reason}
      className="flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#0D6E6E] transition-colors hover:bg-[#F0FDFA] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Help me improve this
    </button>
  )
}

// ── Option A — Single narrative textarea ─────────────────────────────────────

function OptionA({
  answers,
  setAnswer,
}: {
  answers: Record<string, string>
  setAnswer: (id: string, v: string) => void
}) {
  const text = answers['narrative'] ?? ''
  const wordLimitApprox = 2750 // ~10 A4 pages at ~275 words/page

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
      {/* Checklist sidebar */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h3 className="mb-1 border-l-4 border-[#0D6E6E] pl-3 text-[15px] font-semibold text-[#1E293B]">
          What to cover
        </h3>
        <p className="mb-4 pl-3 text-[12px] text-[#64748B]">Based on Garfield Weston guidelines</p>
        <ul className="space-y-3">
          {NARRATIVE_SECTIONS.map((s) => {
            return (
              <li key={s.id} className="flex items-start gap-2">
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#CBD5E1]" />
                <div>
                  <p className="text-[13px] font-medium text-[#1E293B]">{s.title}</p>
                  <p className="text-[12px] text-[#64748B]">≈ {s.wordLimit} words</p>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="mt-5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]" />
            <p className="text-[12px] text-[#78350F]">
              Complete the financial section with your treasurer or finance lead.
            </p>
          </div>
        </div>
      </div>

      {/* Main textarea */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="border-l-4 border-[#0D6E6E] pl-3 text-[15px] font-semibold text-[#1E293B]">
              Your proposal
            </h3>
            <p className="mt-1 pl-3 text-[12px] text-[#64748B]">
              Write your full narrative document. Use the section checklist on the left to guide
              what to cover. Aim for around {wordLimitApprox.toLocaleString()} words (approx. 10
              pages).
            </p>
          </div>
        </div>

        <textarea
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#0D6E6E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20"
          rows={24}
          placeholder="Begin writing your proposal here. Start with a brief introduction to your organisation, then work through each section in the checklist…"
          value={text}
          onChange={(e) => setAnswer('narrative', e.target.value)}
        />

        <div className="mt-2 flex items-center justify-between">
          <WordCount text={text} limit={wordLimitApprox} />
          <AIButton disabled={text.trim().length < 20} reason="Write something first" />
        </div>
      </div>
    </div>
  )
}

// ── Option B — Section-by-section ────────────────────────────────────────────

function OptionB({
  answers,
  setAnswer,
}: {
  answers: Record<string, string>
  setAnswer: (id: string, v: string) => void
}) {
  const filled = NARRATIVE_SECTIONS.filter((s) => (answers[s.id] ?? '').trim().length > 0).length
  const total = NARRATIVE_SECTIONS.length
  const pct = Math.round((filled / total) * 100)
  const allFilled = filled === total

  return (
    <>
      {/* Funder context card */}
      <div className="mb-5 rounded-xl border border-[#E2E8F0] bg-white p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Funder</p>
            <p className="text-[14px] font-semibold text-[#1E293B]">Garfield Weston Foundation</p>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Format</p>
            <p className="text-[14px] text-[#374151]">Narrative proposal (max 10 pages)</p>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">
              Deadline
            </p>
            <p className="text-[14px] text-[#374151]">Rolling — no fixed deadline</p>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Grant</p>
            <p className="text-[14px] text-[#374151]">Up to £100,000</p>
          </div>
        </div>
      </div>

      {/* Progress — sticky so it stays visible while scrolling through sections */}
      <div className="sticky top-0 z-10 mb-5 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-medium text-[#1E293B]">
            {filled} of {total} sections written
          </p>
          <p className="text-[13px] text-[#64748B]">{pct}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className="h-full rounded-full bg-[#0D6E6E] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Section cards */}
      <div className="space-y-4">
        {NARRATIVE_SECTIONS.map((section) => {
          const text = answers[section.id] ?? ''
          const hasContent = text.trim().length > 0

          return (
            <div
              key={section.id}
              className={`rounded-xl border p-5 ${
                section.isBudget ? 'border-[#FDE68A] bg-[#FFFBEB]' : 'border-[#E2E8F0] bg-white'
              }`}
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {hasContent ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#CBD5E1]" />
                  )}
                  <div>
                    <h3
                      className={`border-l-4 pl-3 text-[15px] font-semibold ${
                        section.isBudget
                          ? 'border-[#F59E0B] text-[#92400E]'
                          : 'border-[#0D6E6E] text-[#1E293B]'
                      }`}
                    >
                      {section.title}
                    </h3>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {section.isBudget && (
                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#B45309]">
                      Budget
                    </span>
                  )}
                  <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
                    ~{section.wordLimit} words
                  </span>
                </div>
              </div>

              {/* Guidance note */}
              <p className="mb-3 pl-6 text-[13px] italic text-[#64748B]">{section.guidance}</p>

              {/* Budget warning */}
              {section.isBudget && (
                <div className="mb-3 ml-6 flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-white p-3">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]" />
                  <p className="text-[12px] text-[#78350F]">
                    AI assistance is disabled for financial sections. Complete this with your
                    treasurer or finance lead to ensure accuracy.
                  </p>
                </div>
              )}

              {/* Textarea */}
              <textarea
                className={`ml-6 w-[calc(100%-1.5rem)] rounded-lg border p-3 text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 ${
                  section.isBudget
                    ? 'border-[#FCD34D] bg-[#FFFBEB] focus:border-[#D97706] focus:ring-[#D97706]/20'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0D6E6E] focus:bg-white focus:ring-[#0D6E6E]/20'
                }`}
                rows={5}
                placeholder={
                  section.isBudget
                    ? 'Enter financial details — complete with your treasurer or finance lead…'
                    : `Write your response here…`
                }
                value={text}
                onChange={(e) => setAnswer(section.id, e.target.value)}
              />

              {/* Footer */}
              <div className="ml-6 mt-2 flex items-center justify-between">
                <WordCount text={text} limit={section.wordLimit} />
                {!section.isBudget && (
                  <AIButton
                    disabled={text.trim().length < 20}
                    reason={text.trim().length < 20 ? 'Write something first' : undefined}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Ready to assemble */}
      <div className="mt-8 flex items-center justify-between">
        <button className="text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B]">
          Back
        </button>
        <button
          disabled={!allFilled}
          className="rounded-lg bg-[#0D6E6E] px-6 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allFilled ? 'Ready to assemble →' : `Complete all ${total} sections to continue`}
        </button>
      </div>
    </>
  )
}

// ── Structured Q&A ────────────────────────────────────────────────────────────

function StructuredQA({
  answers,
  setAnswer,
}: {
  answers: Record<string, string>
  setAnswer: (id: string, v: string) => void
}) {
  const answered = STRUCTURED_QUESTIONS.filter(
    (q) => (answers[q.id] ?? '').trim().length > 0,
  ).length
  const total = STRUCTURED_QUESTIONS.length
  const pct = Math.round((answered / total) * 100)
  const allAnswered = answered === total

  return (
    <>
      {/* Funder context card */}
      <div className="mb-5 rounded-xl border border-[#E2E8F0] bg-white p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Funder</p>
            <p className="text-[14px] font-semibold text-[#1E293B]">A B Charitable Trust</p>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Format</p>
            <p className="text-[14px] text-[#374151]">Structured Q&A — 6 questions</p>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">
              Grant range
            </p>
            <p className="text-[14px] text-[#374151]">£10,000–£40,000 / year</p>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Stage</p>
            <p className="text-[14px] text-[#374151]">Single stage</p>
          </div>
        </div>
      </div>

      {/* Progress — sticky so it stays visible while scrolling through questions */}
      <div className="sticky top-0 z-10 mb-5 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-medium text-[#1E293B]">
            {answered} of {total} questions answered
          </p>
          <p className="text-[13px] text-[#64748B]">{pct}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className="h-full rounded-full bg-[#0D6E6E] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Question cards */}
      <div className="space-y-4">
        {STRUCTURED_QUESTIONS.map((q) => {
          const text = answers[q.id] ?? ''
          const hasContent = text.trim().length > 0

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 ${
                q.isBudget ? 'border-[#FDE68A] bg-[#FFFBEB]' : 'border-[#E2E8F0] bg-white'
              }`}
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {hasContent ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#CBD5E1]" />
                  )}
                  <p
                    className={`border-l-4 pl-3 text-[15px] font-semibold ${
                      q.isBudget
                        ? 'border-[#F59E0B] text-[#92400E]'
                        : 'border-[#0D6E6E] text-[#1E293B]'
                    }`}
                  >
                    <span className="mr-1 font-bold">{q.number}.</span> {q.text}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {q.isBudget && (
                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#B45309]">
                      Budget
                    </span>
                  )}
                  {q.wordLimit && (
                    <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
                      {q.wordLimit} words
                    </span>
                  )}
                </div>
              </div>

              {/* Budget warning */}
              {q.isBudget && (
                <div className="mb-3 ml-7 flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-white p-3">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]" />
                  <p className="text-[12px] text-[#78350F]">
                    AI assistance is disabled for budget questions. Complete this with your
                    treasurer or finance lead to ensure accuracy.
                  </p>
                </div>
              )}

              {/* Textarea */}
              <textarea
                className={`ml-7 w-[calc(100%-1.75rem)] rounded-lg border p-3 text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 ${
                  q.isBudget
                    ? 'border-[#FCD34D] bg-[#FFFBEB] focus:border-[#D97706] focus:ring-[#D97706]/20'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0D6E6E] focus:bg-white focus:ring-[#0D6E6E]/20'
                }`}
                rows={4}
                placeholder={
                  q.isBudget
                    ? 'Enter budget details — complete with your treasurer or finance lead…'
                    : 'Write your answer here…'
                }
                value={text}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />

              {/* Footer */}
              <div className="ml-7 mt-2 flex items-center justify-between">
                <WordCount text={text} limit={q.wordLimit} />
                {!q.isBudget && (
                  <AIButton
                    disabled={text.trim().length < 10}
                    reason={text.trim().length < 10 ? 'Write something first' : undefined}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Ready to assemble */}
      <div className="mt-8 flex items-center justify-between">
        <button className="text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B]">
          Back
        </button>
        <button
          disabled={!allAnswered}
          className="rounded-lg bg-[#0D6E6E] px-6 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allAnswered ? 'Ready to assemble →' : `Answer all ${total} questions to continue`}
        </button>
      </div>
    </>
  )
}

// ── Advantages / Disadvantages panel ─────────────────────────────────────────

function ProsCons() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-10 rounded-xl border border-[#E2E8F0] bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="text-[15px] font-semibold text-[#1E293B]">
          Design options — advantages &amp; disadvantages
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#64748B]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#64748B]" />
        )}
      </button>

      {open && (
        <div className="border-t border-[#E2E8F0] p-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Option A */}
            <div>
              <h4 className="mb-3 border-l-4 border-[#7C3AED] pl-3 text-[14px] font-semibold text-[#1E293B]">
                Option A — Single narrative
              </h4>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#059669]">
                Advantages
              </p>
              <ul className="mb-4 space-y-1.5">
                {[
                  'Minimum code change — one new render path',
                  'Maximum writing freedom',
                  'No extra AI extraction step',
                  'Familiar to experienced grant writers',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-[13px] text-[#374151]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#059669]" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#DC2626]">
                Disadvantages
              </p>
              <ul className="space-y-1.5">
                {[
                  'Blank page problem — no scaffolding',
                  'No per-section word limits',
                  'Progress tracking is all-or-nothing',
                  'AI improvement on full doc is slow and expensive',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-[13px] text-[#374151]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Option B */}
            <div>
              <h4 className="mb-3 border-l-4 border-[#0D6E6E] pl-3 text-[14px] font-semibold text-[#1E293B]">
                Option B — Section by section ★
              </h4>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#059669]">
                Advantages
              </p>
              <ul className="mb-4 space-y-1.5">
                {[
                  'Breaks the blank page problem into sections',
                  'Per-section word limits and progress tracking',
                  'AI assist per section — faster and cheaper',
                  'Consistent UX across structured and narrative funders',
                  'Assembly joins sections into a polished proposal doc',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-[13px] text-[#374151]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#059669]" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#DC2626]">
                Disadvantages
              </p>
              <ul className="space-y-1.5">
                {[
                  'Requires AI prompt update to extract sections',
                  "New 'sections' field in AiSummaryData type",
                  'AI may mis-extract sections for loosely written guidelines',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-[13px] text-[#374151]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Structured */}
            <div>
              <h4 className="mb-3 border-l-4 border-[#0EA5E9] pl-3 text-[14px] font-semibold text-[#1E293B]">
                Structured Q&amp;A (existing)
              </h4>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#059669]">
                Advantages
              </p>
              <ul className="mb-4 space-y-1.5">
                {[
                  'Already built — covers 10 of 12 target funders',
                  'Exact question text extracted from guidelines',
                  'Word limits enforced per question',
                  'Budget question detection and AI lock',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-[13px] text-[#374151]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#059669]" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#DC2626]">
                Disadvantages
              </p>
              <ul className="space-y-1.5">
                {[
                  'Does not handle narrative funders (Garfield Weston, City Bridge)',
                  'Falls back to manual entry when no questions found',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-[13px] text-[#374151]">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-4">
            <p className="text-[13px] font-semibold text-[#065F46]">Recommendation</p>
            <p className="mt-1 text-[13px] text-[#065F46]">
              Implement <strong>Option B</strong> for narrative funders alongside the existing
              structured Q&A. The AI prompt extracts named sections for free_form funders; Step 4
              routes to the section-by-section view. Multi-stage funders (e.g. Henry Smith, Wolfson)
              are handled as separate application records — one per stage. No new DB columns
              required beyond those already in place.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MockupPage() {
  const [funderType, setFunderType] = useState<'narrative' | 'structured'>('narrative')
  const [narrativeOption, setNarrativeOption] = useState<'A' | 'B'>('B')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Prototype banner */}
      <div className="bg-[#7C3AED] px-4 py-2.5 text-center">
        <p className="text-[13px] font-medium text-white">
          ✦ Design Mock-up — Step 4 Draft Answers · Interactive prototype · Not connected to real
          data
        </p>
      </div>

      <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6">
        {/* Step indicator (static) */}
        <div className="mb-8 flex items-center gap-2 text-[13px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${
                  n === 4
                    ? 'bg-[#0D6E6E] text-white'
                    : n < 4
                      ? 'bg-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#E2E8F0] text-[#94A3B8]'
                }`}
              >
                {n}
              </div>
              {n < 5 && <div className="h-px w-6 bg-[#E2E8F0]" />}
            </div>
          ))}
          <span className="ml-2 text-[#1E293B] font-medium">Step 4 — Draft Answers</span>
        </div>

        {/* Funder type toggle */}
        <div className="mb-6">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">
            Simulating funder type
          </p>
          <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm">
            <button
              onClick={() => setFunderType('narrative')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                funderType === 'narrative'
                  ? 'bg-[#0D6E6E] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <FileText className="h-4 w-4" />
              Narrative — Garfield Weston
            </button>
            <button
              onClick={() => setFunderType('structured')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                funderType === 'structured'
                  ? 'bg-[#0D6E6E] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <List className="h-4 w-4" />
              Structured Q&amp;A — A B Charitable Trust
            </button>
          </div>
        </div>

        {/* Narrative option sub-toggle */}
        {funderType === 'narrative' && (
          <div className="mb-6">
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">
              Design option
            </p>
            <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm">
              <button
                onClick={() => setNarrativeOption('A')}
                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                  narrativeOption === 'A'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Option A — Single document
              </button>
              <button
                onClick={() => setNarrativeOption('B')}
                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                  narrativeOption === 'B'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Option B — Section by section ★ Recommended
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {funderType === 'narrative' && narrativeOption === 'A' && (
          <OptionA answers={answers} setAnswer={setAnswer} />
        )}
        {funderType === 'narrative' && narrativeOption === 'B' && (
          <OptionB answers={answers} setAnswer={setAnswer} />
        )}
        {funderType === 'structured' && <StructuredQA answers={answers} setAnswer={setAnswer} />}

        {/* Pros/cons panel */}
        <ProsCons />
      </div>
    </div>
  )
}
