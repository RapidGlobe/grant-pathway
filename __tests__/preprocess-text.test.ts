import { describe, it, expect } from 'vitest'
import { preprocessText } from '@/lib/preprocess-text'

describe('preprocessText — repeated-line stripping only removes genuine running headers/footers (2026-07-16, Clothworkers regression)', () => {
  it('strips a line that repeats as the first line after every page marker (a true running header)', () => {
    const text = [
      '[PAGE 1]',
      'THE FOUNDATION: OPEN GRANTS PROGRAMME GUIDANCE',
      'Content unique to page one.',
      '',
      '[PAGE 2]',
      'THE FOUNDATION: OPEN GRANTS PROGRAMME GUIDANCE',
      'Content unique to page two.',
      '',
      '[PAGE 3]',
      'THE FOUNDATION: OPEN GRANTS PROGRAMME GUIDANCE',
      'Content unique to page three.',
    ].join('\n')

    const { text: out } = preprocessText(text)

    expect(out).not.toContain('THE FOUNDATION: OPEN GRANTS PROGRAMME GUIDANCE')
    expect(out).toContain('Content unique to page one.')
    expect(out).toContain('Content unique to page two.')
    expect(out).toContain('Content unique to page three.')
  })

  it('keeps a genuine question repeated verbatim across multiple forms, embedded mid-page each time', () => {
    const question = 'Please describe the difference you expect your capital project to make.'
    const text = [
      '[PAGE 19]',
      'SAMPLE SMALL GRANTS PROGRAMME APPLICATION',
      'What is the title of your project?',
      question,
      'Please upload your project budget.',
      '',
      '[PAGE 28]',
      'SAMPLE LARGE GRANTS PROGRAMME FIRST STAGE',
      'What is the title of your project?',
      question,
      'Please upload your project budget.',
      '',
      '[PAGE 35]',
      'SAMPLE LARGE GRANTS PROGRAMME STAGE TWO',
      'What is the title of your project?',
      question,
      'Please upload your project budget.',
    ].join('\n')

    const { text: out } = preprocessText(text)

    expect(out).toContain(question)
  })

  it('keeps a repeated line at all when even one occurrence is not marker-adjacent (errs toward keeping content)', () => {
    const line = 'Please refer to our guidance document for more information.'
    const text = [
      '[PAGE 1]',
      line, // marker-adjacent (header-like) here
      'Content on page one.',
      '',
      '[PAGE 2]',
      'Content on page two.',
      line, // marker-adjacent (footer-like) here too
      '',
      '[PAGE 3]',
      'Some content before.',
      line, // embedded mid-page here — NOT marker-adjacent
      'Some content after.',
    ].join('\n')

    const { text: out } = preprocessText(text)

    expect(out).toContain(line)
  })
})

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

describe('preprocessText — [ITEM N] fallback marker for headless pasted text (2026-07-21 amendment, ADR-DATA-007)', () => {
  // Confirmed live on the Wolfson Foundation's Health & Disability guidelines:
  // a flat, unheaded bullet list with no numbered or ALL-CAPS heading lines
  // produced zero [SECTION: ...] markers (nothing for looksLikeHeading to
  // match) and, being pasted text rather than a PDF, zero [PAGE N] markers —
  // the whole document carried no structural marker at all, so no citation
  // could ever validate. This fallback numbers every non-blank line instead.
  it('tags every non-blank line with [ITEM N] when no heading-like line exists anywhere', () => {
    const text = [
      'Name and address of the organisation',
      'UK charity number, if applicable',
      'Background to the organisation (max 250 words)',
    ].join('\n')

    const { text: out } = preprocessText(text)

    expect(out).toContain('[ITEM 1]\nName and address of the organisation')
    expect(out).toContain('[ITEM 2]\nUK charity number, if applicable')
    expect(out).toContain('[ITEM 3]\nBackground to the organisation (max 250 words)')
  })

  it('does not apply the [ITEM N] fallback when at least one heading-like line exists', () => {
    const text = ['1. Eligibility', 'Who can apply.', 'A plain bullet with no heading.'].join('\n')

    const { text: out } = preprocessText(text)

    expect(out).toContain('[SECTION: 1. Eligibility]')
    expect(out).not.toContain('[ITEM 1]')
  })

  it('protects [ITEM N] markers from repeated-line/boilerplate stripping and truncation the same way [PAGE N]/[SECTION: ...] are protected', () => {
    const lines = Array.from({ length: 5 }, (_, i) => `Bullet number ${i + 1} of the guidelines.`)
    const text = lines.join('\n')

    const { text: out } = preprocessText(text)

    for (let i = 1; i <= 5; i++) {
      expect(out).toContain(`[ITEM ${i}]`)
    }
  })
})

describe('preprocessText — form-aware truncation (2026-07-16, Clothworkers regression)', () => {
  function buildDoc({
    preambleLines,
    formHeading,
  }: {
    preambleLines: number
    formHeading: string
  }) {
    const preamble = Array.from(
      { length: preambleLines },
      (_, i) =>
        `[PAGE ${i + 1}]\nGuidance paragraph number ${i + 1} about eligibility and funding.`,
    ).join('\n\n')
    const form = [
      `[PAGE ${preambleLines + 1}]`,
      formHeading,
      'Please describe the community you support. (approx. 50 words) *',
      'Please describe your project. (approx. 250 words) *',
      'Please describe the difference you expect your project to make. (approx. 250 words) *',
    ].join('\n')
    return `${preamble}\n\n${form}`
  }

  it('prioritises a SAMPLE ... APPLICATION heading found beyond the plain ceiling, over a numbered table-of-contents entry earlier in the doc', () => {
    const toc = '4. Sample Small Grants Programme Application Form'
    const doc = `[PAGE 1]\n${toc}\n\n${buildDoc({ preambleLines: 20, formHeading: 'SAMPLE SMALL GRANTS PROGRAMME APPLICATION' })}`
    const ceiling = doc.indexOf('SAMPLE SMALL GRANTS PROGRAMME APPLICATION') - 200

    const { text: out, wasTruncated, formSectionPrioritized } = preprocessText(doc, ceiling)

    expect(wasTruncated).toBe(true)
    expect(formSectionPrioritized).toBe(true)
    expect(out).toContain('SAMPLE SMALL GRANTS PROGRAMME APPLICATION')
    expect(out).toContain('Please describe your project')
    expect(out).toContain('Please describe the difference you expect your project to make')
  })

  it('falls back to "THE APPLICATION FORM" heading when no SAMPLE heading exists', () => {
    const doc = buildDoc({ preambleLines: 15, formHeading: 'THE APPLICATION FORM' })
    const ceiling = doc.indexOf('THE APPLICATION FORM') - 200

    const { formSectionPrioritized, text: out } = preprocessText(doc, ceiling)

    expect(formSectionPrioritized).toBe(true)
    expect(out).toContain('THE APPLICATION FORM')
    expect(out).toContain('Please describe your project')
  })

  it('does not engage form-aware logic when the form section already fits within the plain ceiling', () => {
    const doc = buildDoc({
      preambleLines: 3,
      formHeading: 'SAMPLE SMALL GRANTS PROGRAMME APPLICATION',
    })
    const ceiling = doc.length + 1000 // comfortably fits everything

    const { wasTruncated, formSectionPrioritized } = preprocessText(doc, ceiling)

    expect(wasTruncated).toBe(false)
    expect(formSectionPrioritized).toBe(false)
  })

  it('falls back to plain truncation when no form heading is found at all', () => {
    const doc = Array.from(
      { length: 30 },
      (_, i) =>
        `[PAGE ${i + 1}]\nOrdinary narrative guidance content unique to page ${i + 1}, no form heading here.`,
    ).join('\n\n')
    const ceiling = 500

    const { formSectionPrioritized, wasTruncated } = preprocessText(doc, ceiling)

    expect(wasTruncated).toBe(true)
    expect(formSectionPrioritized).toBe(false)
  })
})
