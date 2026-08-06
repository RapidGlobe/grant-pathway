// @vitest-environment happy-dom
//
// GAP-42/43/44 — Step 4 save reassurance.
//
// All three came out of WJ watching a first-time user complete a real Stony
// Stratford Town Council application and hesitate to leave the screen:
//
//   GAP-42  nothing told her a part-written application could be resumed
//   GAP-43  the copy that existed said "saved automatically as you type",
//           which is false — saving is on blur plus a 60-second sweep
//   GAP-44  no successful save was ever confirmed; the only save feedback in
//           the component was the "Not saved." failure alert
//
// The copy assertions below are deliberately exact rather than substring
// matches on "saved". GAP-43 was a *wording* defect that survived because the
// PRD's own 2026-07-13 correction fixed an implementation note and never
// checked the user-facing string; a loose assertion here would let the same
// class of error back in.

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
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
  funderName: 'Stony Stratford Town Council',
  grantName: 'Large grants',
  approachingLimit: false,
  limitReached: false,
  currentUsage: 0,
  guidelineText: null,
  overallWordLimit: null,
}

describe('Step 4 sub-heading — resumability reassurance (GAP-42/GAP-43)', () => {
  it('tells a structured-funder user their answers are saved and they can come back', () => {
    render(
      <ApplicationStep4Draft
        {...baseProps}
        funderType="structured"
        questions={[makeQuestion({ id: 'q1' })]}
      />,
    )

    expect(
      screen.getByText(
        'Answer each question below. Your answers are saved automatically. You can close this page at any time and continue from your dashboard.',
      ),
    ).toBeInTheDocument()
  })

  it('tells a free-form user the same thing', () => {
    render(
      <ApplicationStep4Draft
        {...baseProps}
        funderType="free_form"
        questions={[makeQuestion({ id: 'q1' })]}
      />,
    )

    expect(
      screen.getByText(
        'Write your content for each section below. Your work is saved automatically. You can close this page at any time and continue from your dashboard.',
      ),
    ).toBeInTheDocument()
  })

  it('never claims answers are saved "as you type" — they are not (GAP-43)', () => {
    // Saving is on blur plus a 60-second sweep. AC-FR-18-03 explicitly accepts
    // that up to 60 seconds of edits can be lost, so this phrasing promised
    // something the product does not do.
    for (const funderType of ['structured', 'free_form'] as const) {
      cleanup()
      render(
        <ApplicationStep4Draft
          {...baseProps}
          funderType={funderType}
          questions={[makeQuestion({ id: 'q1' })]}
        />,
      )
      expect(screen.queryByText(/as you type/i)).not.toBeInTheDocument()
    }
  })

  it('does not promise a return to the exact question — return is to the step', () => {
    // With a long question list the user lands at the top and scrolls to find
    // their place, so "continue from your dashboard" is the true promise and
    // must not drift into something stronger.
    render(
      <ApplicationStep4Draft
        {...baseProps}
        funderType="structured"
        questions={[makeQuestion({ id: 'q1' })]}
      />,
    )
    expect(screen.queryByText(/exact (point|question|place)/i)).not.toBeInTheDocument()
  })
})

describe('Step 4 save confirmation (GAP-44, AC-FR-18-05)', () => {
  it('shows nothing until a save has actually happened', () => {
    render(
      <ApplicationStep4Draft
        {...baseProps}
        funderType="structured"
        questions={[makeQuestion({ id: 'q1' })]}
      />,
    )
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('confirms a successful save, then clears itself with nothing to dismiss', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(
        <ApplicationStep4Draft
          {...baseProps}
          funderType="structured"
          questions={[makeQuestion({ id: 'q1', questionText: 'Describe your project' })]}
        />,
      )

      const answer = screen.getByLabelText('Answer for question 1')
      fireEvent.change(answer, { target: { value: 'We run a community larder.' } })
      fireEvent.blur(answer)

      await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument())

      // It clears on its own. There is no dismiss control, which is what keeps
      // AC-FR-18-05 compatible with the intent of the rule AC-FR-18-02's
      // amendment withdrew — unobtrusive, not silent.
      await vi.advanceTimersByTimeAsync(3000)
      await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument())
    } finally {
      vi.useRealTimers()
    }
  })

  it('confirms the save on a governance field too, which has no word count', async () => {
    // Governance items are answers as much as narrative ones are, and a £
    // figure typed into a field the user is unsure about is exactly where the
    // reassurance is wanted. They render no word counter, so the indicator has
    // to stand on its own there.
    render(
      <ApplicationStep4Draft
        {...baseProps}
        funderType="structured"
        questions={[
          makeQuestion({
            id: 'g1',
            questionText: 'Total annual expenditure',
            itemType: 'data',
            fieldKey: 'governance_total_expenditure',
          }),
        ]}
      />,
    )

    const field = screen.getByLabelText('Total annual expenditure')
    fireEvent.change(field, { target: { value: '1100' } })
    fireEvent.blur(field)

    await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument())
  })

  it('confirms each answer independently, not globally', async () => {
    render(
      <ApplicationStep4Draft
        {...baseProps}
        funderType="structured"
        questions={[
          makeQuestion({ id: 'q1', questionText: 'First', questionOrder: 1 }),
          makeQuestion({ id: 'q2', questionText: 'Second', questionOrder: 2 }),
        ]}
      />,
    )

    const first = screen.getByLabelText('Answer for question 1')
    fireEvent.change(first, { target: { value: 'An answer.' } })
    fireEvent.blur(first)

    await waitFor(() => expect(screen.getAllByText('Saved')).toHaveLength(1))
  })
})
