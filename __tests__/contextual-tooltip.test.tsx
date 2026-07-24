// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ContextualTooltip } from '@/components/contextual-tooltip'

vi.mock('@/actions/tooltips', () => ({
  dismissTooltip: vi.fn(async () => ({ ok: true }) as const),
}))

import { dismissTooltip } from '@/actions/tooltips'

const dismissTooltipMock = vi.mocked(dismissTooltip)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('ContextualTooltip', () => {
  it('renders bare children when initiallyDismissed is true (no tooltip wrapper)', () => {
    render(
      <ContextualTooltip
        tooltipId="tt-charity-lookup"
        variant="focus"
        content="Hint"
        initiallyDismissed
      >
        <button>Search</button>
      </ContextualTooltip>,
    )
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Dismiss this tip')).not.toBeInTheDocument()
  })

  it('renders bare children for hover-disabled when active is false', () => {
    render(
      <ContextualTooltip
        tooltipId="tt-ai-help-limit"
        variant="hover-disabled"
        content="Hint"
        active={false}
      >
        <button disabled>Help me improve this</button>
      </ContextualTooltip>,
    )
    expect(screen.getByRole('button', { name: 'Help me improve this' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Dismiss this tip')).not.toBeInTheDocument()
  })

  it('page-load variant opens immediately, with no interaction required', () => {
    render(
      <ContextualTooltip
        tooltipId="tt-summary-review"
        variant="page-load"
        content="Review your summary"
      >
        <button>Continue</button>
      </ContextualTooltip>,
    )
    // defaultOpen bypasses Base UI's default hover delay entirely -- no
    // fireEvent/advance-timers needed for this to already be visible.
    expect(screen.getByText('Review your summary')).toBeInTheDocument()
  })

  it('dismissing via the explicit X button persists exactly once and hides the tooltip', async () => {
    render(
      <ContextualTooltip
        tooltipId="tt-summary-review"
        variant="page-load"
        content="Review your summary"
      >
        <button>Continue</button>
      </ContextualTooltip>,
    )
    const dismissButton = screen.getByLabelText('Dismiss this tip')
    fireEvent.click(dismissButton)

    expect(screen.queryByText('Review your summary')).not.toBeInTheDocument()
    expect(dismissTooltipMock).toHaveBeenCalledTimes(1)
    expect(dismissTooltipMock).toHaveBeenCalledWith('tt-summary-review')
  })

  it('persistent variant never calls dismissTooltip and has no X button', () => {
    render(
      <ContextualTooltip variant="persistent" content="This permanently deletes your account">
        <button>Delete my account</button>
      </ContextualTooltip>,
    )
    expect(screen.queryByLabelText('Dismiss this tip')).not.toBeInTheDocument()
    expect(dismissTooltipMock).not.toHaveBeenCalled()
  })

  it('first-click variant persists dismissal on trigger-press and never blocks the wrapped action', () => {
    vi.useFakeTimers()
    const onAction = vi.fn()
    render(
      <ContextualTooltip
        tooltipId="tt-download-docx"
        variant="first-click"
        content="Save a local copy"
      >
        <button onClick={onAction}>Download as Word document</button>
      </ContextualTooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Download as Word document' })

    // Open via focus (immediate per Base UI focus semantics), then advance
    // past the default 600ms open delay to be safe regardless of trigger type.
    fireEvent.focus(trigger)
    vi.advanceTimersByTime(700)

    // TooltipTrigger's default closeOnClick=true closes the popup with
    // reason 'trigger-press' on this exact click -- the same click that
    // fires the wrapped button's own onClick.
    fireEvent.click(trigger)

    expect(onAction).toHaveBeenCalledTimes(1)
    expect(dismissTooltipMock).toHaveBeenCalledTimes(1)
    expect(dismissTooltipMock).toHaveBeenCalledWith('tt-download-docx')

    vi.useRealTimers()
  })
})
