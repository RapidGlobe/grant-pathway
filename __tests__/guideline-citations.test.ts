import { describe, it, expect } from 'vitest'
import {
  extractValidMarkers,
  validateCitation,
  toGuidelineReferenceColumn,
  findQuoteRange,
} from '@/lib/guideline-citations'

describe('extractValidMarkers', () => {
  it('extracts page numbers from [PAGE N] markers', () => {
    const text = '[PAGE 1]\nSome text.\n\n[PAGE 2]\nMore text.'
    const markers = extractValidMarkers(text)
    expect(markers.pages.has(1)).toBe(true)
    expect(markers.pages.has(2)).toBe(true)
    expect(markers.pages.has(3)).toBe(false)
  })

  it('extracts heading paths from [SECTION: ...] markers', () => {
    const text =
      '[SECTION: Eligibility]\nWho can apply.\n\n[SECTION: Eligibility > Referrals]\nDetail.'
    const markers = extractValidMarkers(text)
    expect(markers.headingPaths.has('Eligibility')).toBe(true)
    expect(markers.headingPaths.has('Eligibility > Referrals')).toBe(true)
    expect(markers.headingPaths.has('Something else')).toBe(false)
  })

  // [ITEM N] (2026-07-21 amendment, ADR-DATA-007): fallback marker for
  // guidelines with no page or heading structure at all — confirmed live on
  // the Wolfson Foundation's Health & Disability docx, whose paragraphs all
  // use Word's default "Normal" style (no w:pStyle Heading reference
  // anywhere), so it previously produced zero citations of any kind.
  it('extracts item numbers from [ITEM N] markers', () => {
    const text = '[ITEM 1]\nName and address of the organisation\n\n[ITEM 2]\nUK charity number.'
    const markers = extractValidMarkers(text)
    expect(markers.items.has(1)).toBe(true)
    expect(markers.items.has(2)).toBe(true)
    expect(markers.items.has(3)).toBe(false)
  })
})

describe('validateCitation', () => {
  const markers = extractValidMarkers(
    '[PAGE 3]\nEligibility text.\n\n[SECTION: Eligibility > Referrals]\nReferral detail.',
  )

  it('accepts a page citation that matches a real marker', () => {
    const result = validateCitation(
      {
        source_type: 'page',
        page_number: 3,
        heading_path: null,
        item_number: null,
        quote: 'Eligibility text',
      },
      markers,
    )
    expect(result.wasValid).toBe(true)
    expect(result.citation).toEqual({
      source_type: 'page',
      page_number: 3,
      quote: 'Eligibility text',
    })
  })

  it('accepts a heading citation that matches a real marker', () => {
    const result = validateCitation(
      {
        source_type: 'heading',
        page_number: null,
        heading_path: ['Eligibility', 'Referrals'],
        item_number: null,
        quote: 'Referral detail',
      },
      markers,
    )
    expect(result.wasValid).toBe(true)
    expect(result.citation).toEqual({
      source_type: 'heading',
      heading_path: ['Eligibility', 'Referrals'],
      quote: 'Referral detail',
    })
  })

  it('rejects a page citation pointing at a page that does not exist (hallucination guard)', () => {
    const result = validateCitation(
      {
        source_type: 'page',
        page_number: 99,
        heading_path: null,
        item_number: null,
        quote: 'made up',
      },
      markers,
    )
    expect(result.wasOffered).toBe(true)
    expect(result.wasValid).toBe(false)
    expect(result.citation).toBeNull()
  })

  it('accepts a heading citation with a straight apostrophe against a curly one in the source marker (live bug, 2026-07-17 — Stony Stratford Town Council "the Council\'s overarching principles")', () => {
    const curlyMarkers = extractValidMarkers(
      '[SECTION: SSTC overarching principles > Which of the Council’s overarching principles do you believe your project aligns with?]\nTick all that apply.',
    )
    const result = validateCitation(
      {
        source_type: 'heading',
        page_number: null,
        heading_path: [
          'SSTC overarching principles',
          "Which of the Council's overarching principles do you believe your project aligns with?",
        ],
        item_number: null,
        quote: 'Please outline how you believe your project aligns with these aims',
      },
      curlyMarkers,
    )
    expect(result.wasValid).toBe(true)
    expect(result.citation).not.toBeNull()
  })

  it('rejects a heading citation pointing at a path that does not exist', () => {
    const result = validateCitation(
      {
        source_type: 'heading',
        page_number: null,
        heading_path: ['Not', 'Real'],
        item_number: null,
        quote: 'made up',
      },
      markers,
    )
    expect(result.wasValid).toBe(false)
    expect(result.citation).toBeNull()
  })

  it('rejects a citation with an empty quote even if the marker is real', () => {
    const result = validateCitation(
      { source_type: 'page', page_number: 3, heading_path: null, item_number: null, quote: '   ' },
      markers,
    )
    expect(result.wasValid).toBe(false)
  })

  it('treats null/undefined citation as not offered', () => {
    expect(validateCitation(null, markers)).toEqual({
      citation: null,
      wasOffered: false,
      wasValid: false,
    })
  })

  it('accepts an item citation that matches a real [ITEM N] marker', () => {
    const itemMarkers = extractValidMarkers(
      '[ITEM 1]\nBackground to the organisation (max 250 words)\n\n[ITEM 2]\nProject timetable.',
    )
    const result = validateCitation(
      {
        source_type: 'item',
        page_number: null,
        heading_path: null,
        item_number: 1,
        quote: 'Background to the organisation',
      },
      itemMarkers,
    )
    expect(result.wasValid).toBe(true)
    expect(result.citation).toEqual({
      source_type: 'item',
      item_number: 1,
      quote: 'Background to the organisation',
    })
  })

  it('rejects an item citation pointing at an item number that does not exist', () => {
    const itemMarkers = extractValidMarkers('[ITEM 1]\nOnly one item here.')
    const result = validateCitation(
      {
        source_type: 'item',
        page_number: null,
        heading_path: null,
        item_number: 7,
        quote: 'made up',
      },
      itemMarkers,
    )
    expect(result.wasValid).toBe(false)
    expect(result.citation).toBeNull()
  })
})

describe('toGuidelineReferenceColumn', () => {
  it('returns null for a null/undefined citation', () => {
    expect(toGuidelineReferenceColumn(null)).toBeNull()
    expect(toGuidelineReferenceColumn(undefined)).toBeNull()
  })

  it('omits heading_path entirely for a page citation (CHECK constraint requires key absence, not null)', () => {
    const result = toGuidelineReferenceColumn({
      source_type: 'page',
      page_number: 3,
      quote: 'text',
    }) as Record<string, unknown>
    expect(result.source_type).toBe('page')
    expect(result.page_number).toBe(3)
    expect('heading_path' in result).toBe(false)
  })

  it('omits page_number entirely for a heading citation', () => {
    const result = toGuidelineReferenceColumn({
      source_type: 'heading',
      heading_path: ['Eligibility'],
      quote: 'text',
    }) as Record<string, unknown>
    expect(result.source_type).toBe('heading')
    expect(result.heading_path).toEqual(['Eligibility'])
    expect('page_number' in result).toBe(false)
  })

  it('omits page_number and heading_path entirely for an item citation', () => {
    const result = toGuidelineReferenceColumn({
      source_type: 'item',
      item_number: 4,
      quote: 'text',
    }) as Record<string, unknown>
    expect(result.source_type).toBe('item')
    expect(result.item_number).toBe(4)
    expect('page_number' in result).toBe(false)
    expect('heading_path' in result).toBe(false)
  })
})

describe('findQuoteRange', () => {
  it('finds an exact substring match', () => {
    const text = 'Some text before. Explain the need for your project. Some text after.'
    const range = findQuoteRange(text, 'Explain the need for your project.')
    expect(range).not.toBeNull()
    expect(text.slice(range!.start, range!.end)).toBe('Explain the need for your project.')
  })

  it('tolerates a PDF line-wrap newline where the quote has a space (live bug, 2026-07-14)', () => {
    // Real case found live-testing P6.4: the PDF wraps mid-sentence, so the
    // retained text has a newline exactly where the AI's quote has a space.
    const text =
      'Explain the need for your project, how the need was identified and how this project\nwill address the need. (Need & Demand)'
    const quote =
      'Explain the need for your project, how the need was identified and how this project will address the need.'
    const range = findQuoteRange(text, quote)
    expect(range).not.toBeNull()
    expect(text.slice(range!.start, range!.end)).toContain('project\nwill address')
  })

  it('tolerates multiple/irregular whitespace between words', () => {
    const text = 'Some   text  with\n\nirregular   spacing here.'
    const range = findQuoteRange(text, 'text with irregular spacing')
    expect(range).not.toBeNull()
  })

  it('returns null when the quote is not found at all', () => {
    expect(findQuoteRange('Some text.', 'Not present anywhere')).toBeNull()
  })

  it('returns null for an empty or whitespace-only quote', () => {
    expect(findQuoteRange('Some text.', '')).toBeNull()
    expect(findQuoteRange('Some text.', '   ')).toBeNull()
  })

  it('escapes regex-special characters in the quote safely', () => {
    const text = 'The grant is between £5,001 - £15,000 (20% match required).'
    const range = findQuoteRange(text, '£5,001 - £15,000 (20% match required)')
    expect(range).not.toBeNull()
  })

  it('matches a straight apostrophe in the quote against a curly one in the source (live bug, 2026-07-15 — MK Community Foundation "six months\' free reserves")', () => {
    const text =
      'Organisations with over six months’ free reserves should be prepared to explain\nwhy they need to hold this level.'
    const quote =
      "Organisations with over six months' free reserves should be prepared to explain why they need to hold this level."
    const range = findQuoteRange(text, quote)
    expect(range).not.toBeNull()
    // The highlighted slice shows the source's real typesetting, not the quote's
    expect(text.slice(range!.start, range!.end)).toContain('six months’ free reserves')
  })

  it('matches a curly apostrophe in the quote against a straight one in the source (tolerance is symmetric)', () => {
    const text = "The organisation's bank account must be held in its own name."
    const quote = 'The organisation’s bank account must be held in its own name.'
    const range = findQuoteRange(text, quote)
    expect(range).not.toBeNull()
  })

  it('matches straight vs curly double quotes', () => {
    const text = 'Funders sometimes call this the “free reserves” policy.'
    const quote = 'Funders sometimes call this the "free reserves" policy.'
    const range = findQuoteRange(text, quote)
    expect(range).not.toBeNull()
  })

  it('matches a hyphen in the quote against an en dash or em dash in the source', () => {
    const text = 'Grants of £5,001–£15,000 are available (Oak Grants).'
    const quote = 'Grants of £5,001-£15,000 are available'
    const range = findQuoteRange(text, quote)
    expect(range).not.toBeNull()
  })

  it('tolerates a list-bullet glyph the quote drops between words (live bug, 2026-07-23 — Garfield Weston "Your finances")', () => {
    // Real case found live-testing: the PDF's bulleted list renders as
    // "understand:\n■ that you have..." but the AI's "verbatim" quote treats
    // the bullet as formatting, not text, and quotes straight through it.
    const text =
      'This part of your proposal is extremely important. We need to understand:\n■ that you have a robust plan to fund your work\n■ where your funding comes from'
    const quote = 'We need to understand: that you have a robust plan to fund your work'
    const range = findQuoteRange(text, quote)
    expect(range).not.toBeNull()
    expect(text.slice(range!.start, range!.end)).toContain('understand:\n■ that')
  })
})
