import { describe, it, expect } from 'vitest'
import {
  extractValidMarkers,
  validateCitation,
  toGuidelineReferenceColumn,
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
})

describe('validateCitation', () => {
  const markers = extractValidMarkers(
    '[PAGE 3]\nEligibility text.\n\n[SECTION: Eligibility > Referrals]\nReferral detail.',
  )

  it('accepts a page citation that matches a real marker', () => {
    const result = validateCitation(
      { source_type: 'page', page_number: 3, heading_path: null, quote: 'Eligibility text' },
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
      { source_type: 'page', page_number: 99, heading_path: null, quote: 'made up' },
      markers,
    )
    expect(result.wasOffered).toBe(true)
    expect(result.wasValid).toBe(false)
    expect(result.citation).toBeNull()
  })

  it('rejects a heading citation pointing at a path that does not exist', () => {
    const result = validateCitation(
      {
        source_type: 'heading',
        page_number: null,
        heading_path: ['Not', 'Real'],
        quote: 'made up',
      },
      markers,
    )
    expect(result.wasValid).toBe(false)
    expect(result.citation).toBeNull()
  })

  it('rejects a citation with an empty quote even if the marker is real', () => {
    const result = validateCitation(
      { source_type: 'page', page_number: 3, heading_path: null, quote: '   ' },
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
})
