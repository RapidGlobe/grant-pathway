import type { GovernanceFieldKey } from './governance-items'

// Guideline source-reference (ADR-DATA-007, P6.3): a discriminated union so a
// citation is never both- or neither-populated. Matches the `application_items
// .guideline_reference` JSONB shape/CHECK constraint exactly (P6.2 migration,
// extended 2026-07-21 for the 'item' variant) — the fields belonging to the
// other variants must be entirely OMITTED (not just null) per that constraint.
// 'item' (2026-07-21 amendment): fallback marker for guidelines with no page
// structure (docx/pasted) AND no real heading structure — a flat, unheaded
// bullet list would otherwise carry no structural marker at all to cite.
export type GuidelineCitation =
  | { source_type: 'page'; page_number: number; quote: string }
  | { source_type: 'heading'; heading_path: string[]; quote: string }
  | { source_type: 'item'; item_number: number; quote: string }

export type AiSummaryQuestion = {
  number: number
  text: string
  wordLimit?: number | null
  charLimit?: number | null
  limitType?: 'words' | 'characters' | 'none' | null
  is_budget_question: boolean
  citation?: GuidelineCitation | null
}

export type AiSummarySection = {
  number: number
  title: string
  guidance: string
  wordLimit?: number | null
  is_budget_section: boolean
  citation?: GuidelineCitation | null
}

// PDR-AI-008 (2026-07-15): guideline-driven detection of the 5 fixed
// governance/reserves facts (lib/governance-items.ts). Extracted only when
// the guidelines actually raise the topic — never forced, never guessed.
// `questionText` is the funder's own wording/paraphrase, surfaced as Step 4
// guidance text — not used as the item's label (that stays the fixed,
// controlled string from GOVERNANCE_ITEMS so the £/count/Yes-No widget
// selection and the "(optional)" gate stay predictable).
export type AiSummaryGovernanceFact = {
  field_key: GovernanceFieldKey
  questionText: string
  citation?: GuidelineCitation | null
}

export type AiSummaryData = {
  funder_type: 'structured' | 'free_form'
  aboutGrant: string
  amount: string
  whoCanApply: string[]
  lookingFor: string[]
  questions: AiSummaryQuestion[]
  sections?: AiSummarySection[]
  governanceFacts?: AiSummaryGovernanceFact[]
  keyRequirements: string[]
  funderAiPolicy?: string | null
  supportingDocuments?: string[]
  eligibilityMismatch?: boolean
  mismatchReason?: string | null
  /** free_form only (PDR-AI-012): set when the guidelines state a single word
   * limit governing the whole application/response rather than any one
   * section individually — e.g. "keep your total response to 500 words".
   * Sections covered by this limit carry no wordLimit of their own; Step 4
   * shows a live combined counter across them instead of a per-card limit.
   * null when no such aggregate limit is stated, or for structured funders. */
  overallWordLimit?: number | null
}
