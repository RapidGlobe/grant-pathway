// Step 3's "what we found" line.
//
// Found by GCM-06's live re-run, 2026-08-07: the line read "We found 21
// application questions in these guidelines" directly above a list of 19. The
// total counted questions + governanceFacts; the list rendered questions alone.
// Both numbers were right about different things, and together they told the
// applicant that two questions had vanished — on the one screen whose job is
// telling them what the AI found.
//
// The copy assertions are exact rather than substring matches on the numbers.
// A test asserting only "contains 19" would pass on the broken version too,
// since that rendered a list of 19 as well; the defect was in the relationship
// between the two numbers, so the whole sentence has to be pinned.

import { describe, it, expect } from 'vitest'
import { structuredSummaryCount, freeFormSummaryCount } from '@/lib/summary-counts'

describe('Step 3 count — structured funders', () => {
  it('names the split when governance facts are present', () => {
    // The exact Stony Stratford case that exposed this: 19 + 2.
    expect(structuredSummaryCount(19, 2)).toBe(
      "We found 19 application questions, plus 2 financial details you'll complete with your own " +
        "figures. You'll work through all 21 in the next step.",
    )
  })

  it('never states a total that disagrees with the listed count', () => {
    // The regression itself. Whatever the wording, the number attached to
    // "application questions" must be the number of items in the list.
    for (const [q, g] of [
      [19, 2],
      [5, 1],
      [12, 3],
      [1, 4],
    ]) {
      const line = structuredSummaryCount(q, g)
      expect(line).toContain(`We found ${q} application`)
      expect(line).toContain(`all ${q + g} in the next step`)
    }
  })

  it('says nothing about financial details when there are none', () => {
    expect(structuredSummaryCount(19, 0)).toBe(
      "We found 19 application questions in these guidelines. You'll answer each one in the next step.",
    )
  })

  it('reads correctly for a single question and no governance facts', () => {
    expect(structuredSummaryCount(1, 0)).toBe(
      "We found 1 application question in these guidelines. You'll answer it in the next step.",
    )
  })

  it('reads correctly for a single question and a single financial detail', () => {
    expect(structuredSummaryCount(1, 1)).toBe(
      "We found 1 application question, plus 1 financial detail you'll complete with your own " +
        "figures. You'll work through all 2 in the next step.",
    )
  })
})

describe('Step 3 count — free-form funders', () => {
  it('carried the identical mismatch and is fixed the same way', () => {
    expect(freeFormSummaryCount(4, 2)).toBe(
      "We identified 4 sections to complete, plus 2 financial details you'll complete with your own " +
        "figures. You'll work through all 6 in the next step.",
    )
  })

  it('says nothing about financial details when there are none', () => {
    expect(freeFormSummaryCount(4, 0)).toBe(
      "We identified 4 sections to complete. In the next step, you'll write your content section by section.",
    )
  })

  it('handles the singular section', () => {
    expect(freeFormSummaryCount(1, 0)).toBe(
      "We identified 1 section to complete. In the next step, you'll write your content section by section.",
    )
    expect(freeFormSummaryCount(1, 1)).toContain('1 financial detail ')
  })

  it('never states a total that disagrees with the listed count', () => {
    for (const [s, g] of [
      [4, 2],
      [1, 1],
      [7, 3],
    ]) {
      const line = freeFormSummaryCount(s, g)
      expect(line).toContain(`We identified ${s} section`)
      expect(line).toContain(`all ${s + g} in the next step`)
    }
  })
})
