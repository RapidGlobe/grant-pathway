// @vitest-environment happy-dom
//
// GAP-22 — the inactivity sign-out banner.
//
// `technical-design.md` §5 and `ADR-SEC-003` have both said since 2026-04-21
// that a user signed out by the 60-minute inactivity timer is returned to the
// sign-in page "with the message: 'You've been signed out due to inactivity.'"
// What shipped redirected to `/` with no parameter, so the sign-in page had no
// way to know why the user had arrived and the specified message could never
// appear. The user was simply dumped on the sign-in screen.
//
// Two things are asserted here, and the second matters as much as the first:
// the banner appears when it should, and it stays absent otherwise. An
// unconditional banner would be worse than none — every ordinary sign-out and
// every first-time visitor would be told they had been timed out.
//
// The copy assertion is exact rather than a substring match on "inactivity",
// for the reason recorded in step4-save-reassurance.test.tsx: GAP-43 was a
// wording defect that survived because nothing pinned the user-facing string.

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { SignInForm } from '@/components/sign-in-form'

vi.mock('@/actions/auth', () => ({
  signIn: vi.fn().mockResolvedValue({ error: null }),
}))

afterEach(cleanup)

const MESSAGE =
  "You've been signed out due to inactivity. Your work has been saved — sign in again to carry on."

describe('GAP-22 — inactivity sign-out banner', () => {
  it('shows the specified message when signedOutForInactivity is true', () => {
    render(<SignInForm signedOutForInactivity />)
    expect(screen.getByText(MESSAGE)).toBeInTheDocument()
  })

  it('announces the banner to assistive technology', () => {
    // role="status" rather than role="alert": the sign-out has already
    // happened and there is nothing for the user to act on urgently, so it
    // should be announced politely rather than interrupting.
    render(<SignInForm signedOutForInactivity />)
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGE)
  })

  it('shows nothing on an ordinary visit to the sign-in page', () => {
    render(<SignInForm />)
    expect(screen.queryByText(/signed out due to inactivity/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('does not confuse the inactivity banner with the account-deleted one', () => {
    // Both are success-adjacent banners on the same screen and were added by
    // the same mechanism (a search param read in app/(public)/page.tsx). A
    // deleted account must not be told it timed out, or vice versa.
    render(<SignInForm accountDeleted />)
    expect(screen.queryByText(/signed out due to inactivity/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Your account has been deleted/i)).toBeInTheDocument()
  })

  it('renders both banners independently if both params are somehow present', () => {
    render(<SignInForm accountDeleted signedOutForInactivity />)
    expect(screen.getByText(MESSAGE)).toBeInTheDocument()
    expect(screen.getByText(/Your account has been deleted/i)).toBeInTheDocument()
  })
})
