// @vitest-environment happy-dom
//
// GAP-05 — the below-768px blocking banner.
//
// `ADR-ARCH-005` (amended 2026-08-05) decided the UI is blocked, not merely
// warned, below 768px, with exact copy left to this task. This pins the
// heading and body text so a future edit can't drift from the decided
// wording without a visible test failure.
//
// happy-dom does not evaluate real CSS media queries, so it cannot prove the
// banner actually shows/hides at the right viewport width — that is verified
// live in a real browser (see the GAP-05 write-up in
// docs/Implementation Plan/ADR-TRACEABILITY.md). This test only guards the
// copy and the presence of the `flex`/`md:hidden` classes that the live
// check depends on.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MobileViewportBanner } from '@/components/mobile-viewport-banner'

afterEach(cleanup)

describe('GAP-05 — mobile viewport banner', () => {
  it('renders the decided heading and body copy', () => {
    render(<MobileViewportBanner />)
    expect(screen.getByText('Please use a desktop or laptop')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Grant Pathway is designed for bigger screens, with space for funder guidelines and your draft answers side by side. Switch to a desktop or laptop browser to carry on.',
      ),
    ).toBeInTheDocument()
  })

  it('hides the icon from assistive technology', () => {
    const { container } = render(<MobileViewportBanner />)
    const icon = container.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('is shown by default and hidden at the md breakpoint', () => {
    const { container } = render(<MobileViewportBanner />)
    const root = container.firstElementChild
    expect(root?.className).toContain('flex')
    expect(root?.className).toContain('md:hidden')
  })
})
