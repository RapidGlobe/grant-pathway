import { describe, it, expect } from 'vitest'
import { preprocessText } from '@/lib/preprocess-text'

describe('preprocessText — structural marker protection (ADR-DATA-007, P6.2a)', () => {
  it('does not strip [PAGE N] markers as page-number noise', () => {
    const text = '[PAGE 1]\nEligibility criteria here.\n\n[PAGE 2]\nMore detail on page two.'
    const { text: out } = preprocessText(text)
    expect(out).toContain('[PAGE 1]')
    expect(out).toContain('[PAGE 2]')
  })

  it('does not strip [SECTION: ...] markers as repeated-line or boilerplate noise', () => {
    const text = [
      '[SECTION: Eligibility]',
      'Who can apply.',
      '[SECTION: Eligibility > Who can refer a family]',
      'Referral detail.',
    ].join('\n')
    const { text: out } = preprocessText(text)
    expect(out).toContain('[SECTION: Eligibility]')
    expect(out).toContain('[SECTION: Eligibility > Who can refer a family]')
  })

  it('tags numbered headings in pasted plain text with nesting preserved', () => {
    const text = ['1. Eligibility', 'Who can apply.', '1.1 Referrals', 'Referral detail.'].join(
      '\n',
    )
    const { text: out } = preprocessText(text)
    expect(out).toContain('[SECTION: 1. Eligibility]')
    expect(out).toContain('[SECTION: 1. Eligibility > 1.1 Referrals]')
  })

  it('treats ALL CAPS headings in pasted text as top-level, resetting nesting', () => {
    const text = ['1. Eligibility', '1.1 Referrals', 'ABOUT THE FUND', 'Some detail.'].join('\n')
    const { text: out } = preprocessText(text)
    expect(out).toContain('[SECTION: ABOUT THE FUND]')
    expect(out).not.toContain('1.1 Referrals > ABOUT THE FUND')
  })

  it('does not double-tag text that already has extraction markers', () => {
    const text = '[PAGE 1]\n1. Eligibility\nWho can apply.'
    const { text: out } = preprocessText(text)
    // The numbered line should NOT also get wrapped in its own [SECTION: ...] marker
    expect(out).not.toContain('[SECTION: 1. Eligibility]')
  })

  it('truncation snaps back to the last complete marker instead of cutting mid-page', () => {
    const page1 = 'A'.repeat(50)
    const page2 = 'B'.repeat(50)
    const text = `[PAGE 1]\n${page1}\n\n[PAGE 2]\n${page2}`
    // Ceiling lands partway into page 2's content
    const ceiling = text.indexOf('[PAGE 2]') + 20
    const { text: out, wasTruncated } = preprocessText(text, ceiling)
    expect(wasTruncated).toBe(true)
    expect(out).toContain('[PAGE 1]')
    expect(out).not.toContain('[PAGE 2]')
    expect(out).not.toContain('B')
  })

  it('falls back to newline snap when no marker precedes the ceiling', () => {
    const text = 'Plain text with no markers at all, just a long line of prose content here.'
    const { text: out, wasTruncated } = preprocessText(text, 20)
    expect(wasTruncated).toBe(true)
    expect(out.length).toBeLessThanOrEqual(20)
  })
})
