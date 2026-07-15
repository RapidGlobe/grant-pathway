import { describe, it, expect } from 'vitest'
import {
  GOVERNANCE_ITEMS,
  GOVERNANCE_FIELD_KEYS,
  isOrphanedItem,
  resolveGovernanceInserts,
} from '@/lib/governance-items'

describe('GOVERNANCE_ITEMS — the 5 fixed governance/reserves items (2026-07-15)', () => {
  it('defines exactly 5 items', () => {
    expect(GOVERNANCE_ITEMS).toHaveLength(5)
  })

  it('has a unique field_key per item, matching GOVERNANCE_FIELD_KEYS', () => {
    const keys = GOVERNANCE_ITEMS.map((item) => item.field_key)
    expect(new Set(keys).size).toBe(keys.length)
    expect(GOVERNANCE_FIELD_KEYS).toEqual(keys)
  })

  it('reserves a unique negative item_order for every item, so they always sort before any AI-extracted narrative item (item_order >= 1)', () => {
    const orders = GOVERNANCE_ITEMS.map((item) => item.item_order)
    expect(new Set(orders).size).toBe(orders.length)
    orders.forEach((order) => expect(order).toBeLessThan(0))
  })

  it('marks every item_label as optional, so the Step 4 approval gate treats them as skippable-when-blank', () => {
    GOVERNANCE_ITEMS.forEach((item) => {
      expect(item.item_label.toLowerCase()).toContain('(optional)')
    })
  })
})

describe('isOrphanedItem — generic orphan predicate (PDR-AI-008: no governance-specific carve-out)', () => {
  const summaryOrders = [1, 2, 3]

  it('treats an unanswered item as orphaned when its order is no longer in the summary', () => {
    const row = { item_order: 99, answer_text: null }
    expect(isOrphanedItem(row, summaryOrders)).toBe(true)
  })

  it('does not treat an answered item as orphaned, even when its order is no longer in the summary', () => {
    const row = { item_order: 99, answer_text: 'The charity already wrote this.' }
    expect(isOrphanedItem(row, summaryOrders)).toBe(false)
  })

  it('does not treat an item as orphaned when its order is still present in the summary', () => {
    const row = { item_order: 2, answer_text: null }
    expect(isOrphanedItem(row, summaryOrders)).toBe(false)
  })

  it('a governance item survives when the caller includes its reserved item_order in summaryOrders (i.e. the fact is still detected)', () => {
    const row = { item_order: -4, answer_text: null }
    expect(isOrphanedItem(row, [...summaryOrders, -4])).toBe(false)
  })

  it('a governance item is orphaned like any other item once its reserved item_order is no longer detected and it is unanswered', () => {
    const row = { item_order: -4, answer_text: null }
    expect(isOrphanedItem(row, summaryOrders)).toBe(true)
  })
})

describe('resolveGovernanceInserts — builds the upsert payload for detected governance facts only', () => {
  it('returns an empty array when no facts were detected', () => {
    expect(resolveGovernanceInserts([], 'app-1', 'user-1')).toEqual([])
  })

  it('returns one insert per detected fact, with metadata looked up from GOVERNANCE_ITEMS, not trusted from the caller', () => {
    const inserts = resolveGovernanceInserts(
      [
        {
          field_key: 'governance_reserves',
          guideline_reference: { source_type: 'page', page_number: 4, quote: 'reserves policy' },
        },
      ],
      'app-1',
      'user-1',
    )

    expect(inserts).toHaveLength(1)
    expect(inserts[0]).toEqual({
      application_id: 'app-1',
      user_id: 'user-1',
      item_type: 'number',
      source_of_truth: 'charity_profile',
      field_key: 'governance_reserves',
      item_label: 'Reserves (£) (optional)',
      item_order: -4,
      is_budget_question: true,
      guideline_reference: { source_type: 'page', page_number: 4, quote: 'reserves policy' },
    })
  })

  it('only creates rows for the facts actually detected — a fact absent from the input never appears in the output', () => {
    const inserts = resolveGovernanceInserts(
      [{ field_key: 'governance_bank_signatory_count', guideline_reference: null }],
      'app-1',
      'user-1',
    )

    expect(inserts).toHaveLength(1)
    expect(inserts[0].field_key).toBe('governance_bank_signatory_count')
  })

  it('deduplicates by field_key, keeping the first occurrence', () => {
    const inserts = resolveGovernanceInserts(
      [
        { field_key: 'governance_reserves', guideline_reference: null },
        {
          field_key: 'governance_reserves',
          guideline_reference: {
            source_type: 'page',
            page_number: 9,
            quote: 'a later, duplicate mention',
          },
        },
      ],
      'app-1',
      'user-1',
    )

    expect(inserts).toHaveLength(1)
    expect(inserts[0].guideline_reference).toBeNull()
  })

  it('passes a null guideline_reference through unchanged — a detected fact with no citation is still returned', () => {
    const inserts = resolveGovernanceInserts(
      [{ field_key: 'governance_trustees_related', guideline_reference: null }],
      'app-1',
      'user-1',
    )

    expect(inserts).toHaveLength(1)
    expect(inserts[0].guideline_reference).toBeNull()
  })
})
