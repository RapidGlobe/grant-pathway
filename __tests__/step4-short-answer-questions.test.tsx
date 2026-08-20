// @vitest-environment happy-dom
//
// D-021 — date and number questions render as short inputs, not writing cards.
//
// The defect had two faces from one cause. The extraction schema had no field
// for the model to say what kind of question it had found, so the Radcliffe
// fixture extracted project start/end dates as prose writing cards — textarea,
// word counter, "Help me improve this" — while the Idlewild fixture dropped its
// two mandatory date questions entirely, absent from Step 4 and from the export.
//
// Stage 1 gave extraction a question_type and wrote item_type from it. These
// tests cover Stage 2: what the Step 4 screen then does with it.
//
// The structural point being pinned: dispatch used to be `fieldKey != null`,
// which is true only of the 5 fixed governance items. An AI-extracted date has
// fieldKey == null, so it fell through to the catch-all textarea no matter what
// item_type said. isShortAnswerType is a second predicate covering both, and it
// is deliberately NOT a widening of the governance check — the £ prefix, the
// Yes/No select and the guidance-note rule stay governance-only.

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ApplicationStep4Draft, type QuestionRow } from '@/components/application-step4-draft'
import { saveAnswer } from '@/actions/applications'

vi.mock('@/actions/applications', () => ({
  saveAnswer: vi.fn().mockResolvedValue(undefined),
  approveAnswer: vi.fn().mockResolvedValue(undefined),
  saveManualAnswer: vi.fn().mockResolvedValue(undefined),
  setDraftReadyToAssemble: vi.fn().mockResolvedValue(undefined),
  addManualGovernanceItems: vi.fn().mockResolvedValue(undefined),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function makeQuestion(overrides: Partial<QuestionRow> & Pick<QuestionRow, 'id'>): QuestionRow {
  return {
    questionText: 'Question',
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
  funderName: 'Idlewild Trust',
  grantName: 'Main grants',
  approachingLimit: false,
  limitReached: false,
  currentUsage: 0,
  guidelineText: null,
  overallWordLimit: null,
  funderType: 'structured' as const,
}

// The two questions Idlewild actually asks, which is what makes this concrete
// rather than a synthetic fixture.
const dateQuestion = makeQuestion({
  id: 'q-date',
  questionText: 'What is your expected start date for the project?',
  itemType: 'date',
})

const numberQuestion = makeQuestion({
  id: 'q-number',
  questionText: 'State the total amount of funding you are requesting towards this project',
  itemType: 'number',
  isBudgetQuestion: true,
})

describe('date and number questions render as a single-line input', () => {
  it('gives a date question a text input, not a textarea', () => {
    render(<ApplicationStep4Draft {...baseProps} questions={[dateQuestion]} />)

    const field = screen.getByLabelText('Answer for question 1')
    expect(field.tagName).toBe('INPUT')
    expect(field).toHaveAttribute('type', 'text')
  })

  it('uses type="text" rather than type="date" on purpose', () => {
    // WJ's decision, 2026-08-20. Funders word these asks loosely and a real
    // date picker would refuse "April 2027" or "on receipt of funding", which
    // is frequently the answer the form invites. This assertion is the record
    // of that choice — if someone later "improves" it to type="date", the
    // decision should have to be revisited deliberately, not silently.
    render(<ApplicationStep4Draft {...baseProps} questions={[dateQuestion]} />)
    expect(screen.getByLabelText('Answer for question 1')).not.toHaveAttribute('type', 'date')
  })

  it('gives a number question a single-line input too', () => {
    render(<ApplicationStep4Draft {...baseProps} questions={[numberQuestion]} />)
    expect(screen.getByLabelText('Answer for question 1').tagName).toBe('INPUT')
  })

  it('still gives an ordinary narrative question a textarea', () => {
    // The regression that would matter most: 12 of Idlewild's 16 questions are
    // narrative, and three of them are budget questions that must stay prose.
    render(
      <ApplicationStep4Draft
        {...baseProps}
        questions={[makeQuestion({ id: 'q1', questionText: 'Describe the project' })]}
      />,
    )
    expect(screen.getByLabelText('Answer for question 1').tagName).toBe('TEXTAREA')
  })

  it('keeps a budget question that needs prose as a textarea', () => {
    // "Give a breakdown of the total costs of the project" is number-adjacent
    // and budget-tagged, but the answer is a list. question_type and
    // is_budget_question are independent for exactly this case.
    render(
      <ApplicationStep4Draft
        {...baseProps}
        questions={[
          makeQuestion({
            id: 'q1',
            questionText: 'Give a breakdown of the total costs of the project.',
            isBudgetQuestion: true,
            itemType: 'narrative',
          }),
        ]}
      />,
    )
    expect(screen.getByLabelText('Answer for question 1').tagName).toBe('TEXTAREA')
  })
})

describe('no word counter on a short answer', () => {
  it('shows no word count for a date question', () => {
    render(<ApplicationStep4Draft {...baseProps} questions={[dateQuestion]} />)
    // The pluralisation fix of 2026-08-20 made this "1 word" / "N words".
    expect(screen.queryByText(/\d+ words?$/)).not.toBeInTheDocument()
  })

  it('still shows a word count on a narrative question', () => {
    // Guards against the gate being switched everywhere rather than only where
    // it belongs — a counter that vanished from all 16 cards would also satisfy
    // the assertion above.
    render(
      <ApplicationStep4Draft
        {...baseProps}
        questions={[makeQuestion({ id: 'q1', answerText: 'Two words' })]}
      />,
    )
    expect(screen.getByText('2 words')).toBeInTheDocument()
  })
})

describe('no AI assist on a short answer', () => {
  it('offers no refine button on a date question', () => {
    render(<ApplicationStep4Draft {...baseProps} questions={[dateQuestion]} />)
    expect(screen.queryByRole('button', { name: /Help me improve this/i })).not.toBeInTheDocument()
  })

  it('offers no refine button on a number question', () => {
    render(<ApplicationStep4Draft {...baseProps} questions={[numberQuestion]} />)
    expect(screen.queryByRole('button', { name: /Help me improve this/i })).not.toBeInTheDocument()
  })

  it('still offers it on a narrative question', () => {
    render(
      <ApplicationStep4Draft
        {...baseProps}
        questions={[makeQuestion({ id: 'q1', answerText: 'Some written answer.' })]}
      />,
    )
    expect(screen.getByRole('button', { name: /Help me improve this/i })).toBeInTheDocument()
  })

  it('puts the AI-help tooltip on a card that actually has the button', () => {
    // firstRefineButtonIndex used to be `!isBudgetQuestion && fieldKey == null`,
    // which a date question satisfies — so with a date first in the list the
    // tooltip attached to a card showing no refine button at all.
    render(
      <ApplicationStep4Draft
        {...baseProps}
        questions={[dateQuestion, makeQuestion({ id: 'q2', answerText: 'Written answer.' })]}
      />,
    )
    const refine = screen.getByRole('button', { name: /Help me improve this/i })
    expect(refine).toBeInTheDocument()
    // Question 2 is the narrative one; the button must belong to it.
    expect(screen.getByLabelText('Answer for question 2').tagName).toBe('TEXTAREA')
  })
})

describe('a short answer still saves and approves like any other', () => {
  it('saves a typed date on blur', async () => {
    // The whole point of the free-text choice: this value must survive exactly
    // as typed, including a vaguer answer than a calendar could express.
    render(<ApplicationStep4Draft {...baseProps} questions={[dateQuestion]} />)

    const field = screen.getByLabelText('Answer for question 1')
    fireEvent.change(field, { target: { value: 'April 2027' } })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(saveAnswer).toHaveBeenCalledWith('q-date', 'April 2027', 'user_written')
    })
  })

  it('offers approval once a date is entered', () => {
    render(
      <ApplicationStep4Draft
        {...baseProps}
        questions={[makeQuestion({ ...dateQuestion, answerText: 'April 2027' })]}
      />,
    )
    expect(screen.getByRole('button', { name: /Approve this answer/i })).toBeInTheDocument()
  })
})
