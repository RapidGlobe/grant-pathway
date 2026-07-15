import { describe, it, expect } from 'vitest'
import { GOVERNANCE_ITEMS, GOVERNANCE_FIELD_KEYS, isOrphanedItem } from '@/lib/governance-items'

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

describe('isOrphanedItem — governance items must survive Step 4 sync regardless of AI summary content', () => {
  const summaryOrders = [1, 2, 3]

  it('never treats a governance item (field_key set) as orphaned, even when unanswered and its order is outside the summary', () => {
    const row = { item_order: -5, answer_text: null, field_key: 'governance_total_expenditure' }
    expect(isOrphanedItem(row, summaryOrders)).toBe(false)
  })

  it('never treats a governance item as orphaned even for an order that happens to collide with a summary order', () => {
    const row = { item_order: 1, answer_text: null, field_key: 'governance_reserves' }
    expect(isOrphanedItem(row, summaryOrders)).toBe(false)
  })

  it('treats an unanswered narrative item as orphaned when its order is no longer in the summary', () => {
    const row = { item_order: 99, answer_text: null, field_key: null }
    expect(isOrphanedItem(row, summaryOrders)).toBe(true)
  })

  it('does not treat an answered narrative item as orphaned, even when its order is no longer in the summary', () => {
    const row = { item_order: 99, answer_text: 'The charity already wrote this.', field_key: null }
    expect(isOrphanedItem(row, summaryOrders)).toBe(false)
  })

  it('does not treat a narrative item as orphaned when its order is still present in the summary', () => {
    const row = { item_order: 2, answer_text: null, field_key: null }
    expect(isOrphanedItem(row, summaryOrders)).toBe(false)
  })
})
