// The 5 charity governance/reserves facts, re-sited from charity_profiles
// into the application_items graph (2026-07-15 — see migration
// 20260715000000_governance_items_move_to_item_graph.sql and
// docs/Technical Decision and Design/ADR-DATA-006-application-item-graph-model.md).
//
// Always present on every application (no per-funder relevance detection
// yet — deliberately deferred), always start blank (no seeding between
// applications, including P6.5 reuse — WJ was explicit that these facts
// must be re-entered fresh every time, not carried forward silently).
//
// item_order uses a reserved negative range so these rows always sort
// before any AI-extracted narrative item (whose item_order comes from the
// AI's own question numbering, starting at 1) without touching that
// numbering logic at all.

export type GovernanceFieldKey =
  | 'governance_total_expenditure'
  | 'governance_reserves'
  | 'governance_trustees_related'
  | 'governance_bank_signatory_count'
  | 'governance_bank_signatories_related'

export type GovernanceItemDefinition = {
  field_key: GovernanceFieldKey
  item_label: string
  item_type: 'number' | 'data'
  is_budget_question: boolean
  item_order: number
}

// item_label deliberately ends with "(optional)" — application-step4-draft.tsx's
// isOptionalQ() gate already treats any question text containing that phrase as
// skippable-when-blank, matching these facts' old /profile "optional for now"
// framing with no change needed to that gate logic.
export const GOVERNANCE_ITEMS: readonly GovernanceItemDefinition[] = [
  {
    field_key: 'governance_total_expenditure',
    item_label: 'Total annual expenditure (£) (optional)',
    item_type: 'number',
    is_budget_question: true,
    item_order: -5,
  },
  {
    field_key: 'governance_reserves',
    item_label: 'Reserves (£) (optional)',
    item_type: 'number',
    is_budget_question: true,
    item_order: -4,
  },
  {
    field_key: 'governance_trustees_related',
    item_label:
      'Are any of your trustees related to each other by family or business relationship? (optional)',
    item_type: 'data',
    is_budget_question: false,
    item_order: -3,
  },
  {
    field_key: 'governance_bank_signatory_count',
    item_label: 'How many people are authorised as bank signatories? (optional)',
    item_type: 'number',
    is_budget_question: false,
    item_order: -2,
  },
  {
    field_key: 'governance_bank_signatories_related',
    item_label: 'Are any bank signatories related to each other or to a trustee? (optional)',
    item_type: 'data',
    is_budget_question: false,
    item_order: -1,
  },
] as const

export const GOVERNANCE_FIELD_KEYS: readonly GovernanceFieldKey[] = GOVERNANCE_ITEMS.map(
  (item) => item.field_key,
)

/** The "Yes / No / Not sure yet" options for the two relatedness fields. */
export const GOVERNANCE_RELATEDNESS_OPTIONS = ['Yes', 'No', 'Not sure yet'] as const

/**
 * Step 4's sync-with-ai-summary pass deletes any unanswered row whose
 * item_order isn't part of the current AI summary ("orphaned" — the
 * extraction dropped that question). Governance items are never part of
 * the AI summary's own numbering, so they must be excluded from orphan
 * candidacy entirely, regardless of item_order or answer state — otherwise
 * every Step 4 page load would delete and immediately recreate them.
 */
export function isOrphanedItem(
  row: { item_order: number; answer_text: string | null; field_key: string | null },
  summaryOrders: readonly number[],
): boolean {
  return !row.field_key && !summaryOrders.includes(row.item_order) && !row.answer_text
}
