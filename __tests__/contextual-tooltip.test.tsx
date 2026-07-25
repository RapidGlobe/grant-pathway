// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ContextualTooltip } from '@/components/contextual-tooltip'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ContextualTooltip', () => {
  it('shows its content on focus, with no dismiss button', () => {
    vi.useFakeTimers()
    render(
      <ContextualTooltip content="Search by name or registration number">
        <button>Search</button>
      </ContextualTooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Search' })
    fireEvent.focus(trigger)
    vi.advanceTimersByTime(700)

    expect(screen.getByText('Search by name or registration number')).toBeInTheDocument()
    expect(screen.queryByLabelText('Dismiss this tip')).not.toBeInTheDocument()
  })

  it('renders bare children when active is false (hover-disabled case, no longer disabled)', () => {
    render(
      <ContextualTooltip content="Approve every answer first" active={false}>
        <button disabled>Ready to assemble</button>
      </ContextualTooltip>,
    )
    expect(screen.getByRole('button', { name: 'Ready to assemble' })).toBeInTheDocument()
    expect(screen.queryByText('Approve every answer first')).not.toBeInTheDocument()
  })

  it('shows its content on focus when active is true (hover-disabled case, still disabled)', () => {
    vi.useFakeTimers()
    render(
      <ContextualTooltip content="Approve every answer first" active={true}>
        <button disabled>Ready to assemble</button>
      </ContextualTooltip>,
    )
    // The disabled button itself can't receive focus, but ContextualTooltip
    // wraps it in a focusable span specifically so the hint is still reachable.
    const trigger = screen.getByRole('button', { name: 'Ready to assemble' }).parentElement
    if (trigger) fireEvent.focus(trigger)
    vi.advanceTimersByTime(700)

    expect(screen.getByText('Approve every answer first')).toBeInTheDocument()
  })

  it('never renders a dismiss button, regardless of how many times it is shown', () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <ContextualTooltip content="Hint one">
        <button>One</button>
      </ContextualTooltip>,
    )
    fireEvent.focus(screen.getByRole('button', { name: 'One' }))
    vi.advanceTimersByTime(700)
    expect(screen.queryByLabelText('Dismiss this tip')).not.toBeInTheDocument()

    rerender(
      <ContextualTooltip content="Hint one">
        <button>One</button>
      </ContextualTooltip>,
    )
    fireEvent.focus(screen.getByRole('button', { name: 'One' }))
    vi.advanceTimersByTime(700)
    expect(screen.getByText('Hint one')).toBeInTheDocument()
    expect(screen.queryByLabelText('Dismiss this tip')).not.toBeInTheDocument()
  })
})
