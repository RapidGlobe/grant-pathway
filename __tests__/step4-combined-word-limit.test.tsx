// @vitest-environment happy-dom
//
// PDR-AI-012 — combined word counter across free_form sections that share a
// single aggregate word limit (found live-testing CPF Trust, GCM-03 Defect
// Log #3: a funder's 500-word total spanning several AI-extracted sections,
// none of which shows any limit badge on its own).

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ApplicationStep4Draft, type QuestionRow } from '@/components/application-step4-draft'

vi.mock('@/actions/applications', () => ({
  saveAnswer: vi.fn().mockResolvedValue(undefined),
  approveAnswer: vi.fn().mockResolvedValue(undefined),
  saveManualAnswer: vi.fn().mockResolvedValue(undefined),
  setDraftReadyToAssemble: vi.fn().mockResolvedValue(undefined),
  addManualGovernanceItems: vi.fn().mockResolvedValue(undefined),
}))

afterEach(() => {
  cleanup()
})

function makeQuestion(overrides: Partial<QuestionRow> & Pick<QuestionRow, 'id'>): QuestionRow {
  return {
    questionText: 'Section',
    questionOrder: 1,
    itemType: 'narrative',
    fieldKey: null,
    wordLimit: null,
    charLimit: null,
    limitType: null,
    answerText: '',
    answerSource: null,
    isBudgetQuestion: false,
    guidance: null,
    isApproved: false,
    guidelineReference: null,
    isCarriedOver: false,
    addedManually: false,
    ...overrides,
  }
}

const baseProps = {
  applicationId: 'app-1',
  funderType: 'free_form' as const,
  funderName: 'CPF Trust',
  grantName: '',
  approachingLimit: false,
  limitReached: false,
  currentUsage: 0,
  guidelineText: null,
}

describe('ApplicationStep4Draft — combined word-limit counter (PDR-AI-012)', () => {
  it('sums only sections with no individual limit of their own, ignoring one with its own limit', () => {
    const questions: QuestionRow[] = [
      makeQuestion({ id: 'q1', questionText: 'About your organisation', questionOrder: 1 }),
      makeQuestion({ id: 'q2', questionText: 'How the grant would be used', questionOrder: 2 }),
      makeQuestion({
        id: 'q3',
        questionText: 'Budget',
        questionOrder: 3,
        wordLimit: 50,
        limitType: 'words',
      }),
    ]

    render(<ApplicationStep4Draft {...baseProps} questions={questions} overallWordLimit={10} />)

    // Combined banner present, starts at 0 across the 2 unlimited sections only
    expect(screen.getByText(/Combined across 2 linked sections: 0 \/ 10 words/)).toBeInTheDocument()

    // Badges: the two unlimited sections show the shared-limit badge, the
    // one with its own limit shows its own badge instead.
    expect(screen.getAllByText('Counts toward 10-word total')).toHaveLength(2)
    expect(screen.getByText('50 words')).toBeInTheDocument()

    const section1 = screen.getByLabelText('Content for section 1: About your organisation')
    fireEvent.change(section1, { target: { value: 'one two three four five' } })

    expect(screen.getByText(/Combined across 2 linked sections: 5 \/ 10 words/)).toBeInTheDocument()

    const section2 = screen.getByLabelText('Content for section 2: How the grant would be used')
    fireEvent.change(section2, { target: { value: 'six seven' } })

    // 5 + 2 = 7, still under 10 — not yet flagged as over/near
    const combined = screen.getByText(/Combined across 2 linked sections: 7 \/ 10 words/)
    expect(combined).toBeInTheDocument()
    expect(combined.className).not.toContain('DC2626')

    // Typing in the limited section (q3) must not affect the combined count
    const section3 = screen.getByLabelText('Content for section 3: Budget')
    fireEvent.change(section3, { target: { value: 'one two three' } })
    expect(screen.getByText(/Combined across 2 linked sections: 7 \/ 10 words/)).toBeInTheDocument()
  })

  it('flags the combined count as over limit once it exceeds the aggregate', () => {
    const questions: QuestionRow[] = [
      makeQuestion({ id: 'q1', questionText: 'Section one', questionOrder: 1 }),
    ]

    render(<ApplicationStep4Draft {...baseProps} questions={questions} overallWordLimit={3} />)

    const textarea = screen.getByLabelText('Content for section 1: Section one')
    fireEvent.change(textarea, { target: { value: 'one two three four five' } })

    const combined = screen.getByText(/Combined across 1 linked section: 5 \/ 3 words/)
    expect(combined).toBeInTheDocument()
    expect(combined.className).toContain('DC2626')
  })

  it('shows no combined counter or badges when overallWordLimit is null', () => {
    const questions: QuestionRow[] = [
      makeQuestion({ id: 'q1', questionText: 'Section one', questionOrder: 1 }),
    ]

    render(<ApplicationStep4Draft {...baseProps} questions={questions} overallWordLimit={null} />)

    expect(screen.queryByText(/Combined across/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Counts toward/)).not.toBeInTheDocument()
  })
})
