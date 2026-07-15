// The 5 charity governance/reserves facts, re-sited from charity_profiles
// into the application_items graph (2026-07-15 — see migration
// 20260715000000_governance_items_move_to_item_graph.sql and
// docs/Technical Decision and Design/ADR-DATA-006-application-item-graph-model.md).
//
// Guideline-driven since PDR-AI-008 (2026-07-15 follow-on): a fact is only
// created when the AI extraction actually detects the topic being raised in
// that funder's guidelines — never unconditionally on every application.
// Each detected fact carries a citation exactly like an ordinary narrative
// question/section (nullable — extraction is best-effort, never forced or
// guessed; see lib/prompts.ts and route.ts's reconciliation pass).
//
// Always start blank regardless (no seeding between applications, including
// P6.5 reuse — WJ was explicit that these facts must be re-entered fresh
// every time, not carried forward silently) — see cloneApplicationForReuse's
// `.is('field_key', null)` exclusion in actions/applications.ts.
//
// item_order uses a reserved negative range so a detected item always sorts
// before any AI-extracted narrative item (whose item_order comes from the
// AI's own question numbering, starting at 1) without touching that
// numbering logic at all. Only the slots for actually-detected facts get a
// row — never all 5 unconditionally.

import type { Json } from './database.types'

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
 * extraction dropped that question/fact). Since PDR-AI-008, a governance
 * item's item_order is included in the caller's `summaryOrders` only when
 * that fact was actually detected this time — so a governance fact the
 * extraction no longer raises is orphan-cleaned exactly like a dropped
 * narrative question (deleted if unanswered, kept if already answered).
 * No governance-specific carve-out needed here any more.
 */
export function isOrphanedItem(
  row: { item_order: number; answer_text: string | null },
  summaryOrders: readonly number[],
): boolean {
  return !summaryOrders.includes(row.item_order) && !row.answer_text
}

/**
 * A governance fact to create a row for — either the AI extraction detected
 * it this time (citation already converted to the DB JSONB shape, possibly
 * null), or the charity added it themselves via the manual-add picker
 * (PDR-AI-008 fast-follow, `added_manually: true`, no citation).
 */
export type DetectedGovernanceFact = {
  field_key: GovernanceFieldKey
  guideline_reference: Json
  /** True only when the charity added this themselves — the extraction found no signal for it. Defaults to false (AI-detected). */
  added_manually?: boolean
}

export type GovernanceItemInsert = {
  application_id: string
  user_id: string
  item_type: 'number' | 'data'
  source_of_truth: 'charity_profile'
  field_key: GovernanceFieldKey
  item_label: string
  item_order: number
  is_budget_question: boolean
  guideline_reference: Json
  added_manually: boolean
}

/**
 * Builds the application_items upsert payload for whichever governance
 * facts should get a row (0-5) — either AI-detected or manually added —
 * looking up each fact's item_type/item_label/item_order/is_budget_question
 * from the fixed GOVERNANCE_ITEMS table (never trusting the AI for that
 * metadata). Deduplicates by field_key, keeping the first occurrence —
 * defensive against the caller returning the same fact twice. Silently drops
 * any field_key not found in GOVERNANCE_ITEMS — defensive against a
 * malformed upstream value slipping past validation.
 */
export function resolveGovernanceInserts(
  facts: readonly DetectedGovernanceFact[],
  applicationId: string,
  userId: string,
): GovernanceItemInsert[] {
  const seen = new Set<GovernanceFieldKey>()
  const inserts: GovernanceItemInsert[] = []

  for (const fact of facts) {
    if (seen.has(fact.field_key)) continue
    const def = GOVERNANCE_ITEMS.find((item) => item.field_key === fact.field_key)
    if (!def) continue
    seen.add(fact.field_key)

    inserts.push({
      application_id: applicationId,
      user_id: userId,
      item_type: def.item_type,
      source_of_truth: 'charity_profile',
      field_key: def.field_key,
      item_label: def.item_label,
      item_order: def.item_order,
      is_budget_question: def.is_budget_question,
      guideline_reference: fact.guideline_reference,
      added_manually: fact.added_manually ?? false,
    })
  }

  return inserts
}

/**
 * Plain-English, non-jargon explanation of why a funder might ask about each
 * fact — shown next to its checkbox in the manual-add picker (PDR-AI-008
 * fast-follow). Deliberately not just a restatement of the label: the goal is
 * to help a user who isn't sure whether this applies to them, not just to
 * name the field again.
 */
export const GOVERNANCE_FIELD_EXPLANATIONS: Record<GovernanceFieldKey, string> = {
  governance_total_expenditure:
    "Some funders check the size of your running costs against the grant amount you're asking for.",
  governance_reserves:
    'Your savings — some funders check this to avoid funding a charity that already holds enough money, or that looks financially unstable.',
  governance_trustees_related:
    "Some funders ask this to check for conflicts of interest in how your charity's trustees make decisions.",
  governance_bank_signatory_count:
    "Some funders want reassurance that more than one person controls your charity's bank account.",
  governance_bank_signatories_related:
    'Another conflict-of-interest check some funders make, alongside the trustee-relatedness question.',
}
