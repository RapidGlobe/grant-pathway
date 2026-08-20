import { describe, it, expect } from 'vitest'
import { toItemType, isShortAnswerType } from '@/lib/question-types'

// D-021 (2026-08-20). Two sync paths write application_items rows — the primary
// one in actions/applications.ts and the fallback on the Step 4 page — and both
// call toItemType. These tests exist because a divergence between those two
// paths would show up only as "the same document behaves differently depending
// on how the user arrived at Step 4", which is close to undiagnosable from a
// bug report.
describe('toItemType', () => {
  it('maps the three extracted types onto the enum', () => {
    expect(toItemType('narrative')).toBe('narrative')
    expect(toItemType('date')).toBe('date')
    expect(toItemType('number')).toBe('number')
  })

  it('falls back to narrative when the field is absent or null', () => {
    // question_type is optional in the Zod schema on purpose: a response from
    // an older prompt, or one that validates without the field, degrades to
    // pre-D-021 behaviour instead of failing the whole extraction.
    expect(toItemType(undefined)).toBe('narrative')
    expect(toItemType(null)).toBe('narrative')
  })

  it('falls back to narrative for an unrecognised value', () => {
    // Zod rejects these before they reach here, but the fallback is the whole
    // safety argument for the field being optional, so it is asserted directly.
    expect(toItemType('table' as never)).toBe('narrative')
    expect(toItemType('' as never)).toBe('narrative')
  })
})

describe('isShortAnswerType', () => {
  it('treats the 5 fixed governance items as short answers', () => {
    // These have rendered as short inputs since 2026-07-15; field_key is set.
    expect(isShortAnswerType('number', 'governance_reserves')).toBe(true)
    expect(isShortAnswerType('data', 'governance_trustees_related')).toBe(true)
  })

  it('treats AI-extracted date and number questions as short answers', () => {
    // The D-021 case: field_key is null, so the old fieldKey != null dispatch
    // sent these to the narrative textarea regardless of item_type.
    expect(isShortAnswerType('date', null)).toBe(true)
    expect(isShortAnswerType('number', null)).toBe(true)
  })

  it('leaves narrative questions as prose', () => {
    expect(isShortAnswerType('narrative', null)).toBe(false)
    expect(isShortAnswerType(null, null)).toBe(false)
    expect(isShortAnswerType(undefined, undefined)).toBe(false)
  })
})
