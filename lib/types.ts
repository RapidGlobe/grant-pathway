// Guideline source-reference (ADR-DATA-007, P6.3): a discriminated union so a
// citation is never both- or neither-populated. Matches the `application_items
// .guideline_reference` JSONB shape/CHECK constraint exactly (P6.2 migration)
// — `page_number`/`heading_path` must be entirely OMITTED (not just null) for
// the unused variant when writing to the database, per that constraint.
export type GuidelineCitation =
  | { source_type: 'page'; page_number: number; quote: string }
  | { source_type: 'heading'; heading_path: string[]; quote: string }

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
  wordLimit?: number
  is_budget_section: boolean
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
  keyRequirements: string[]
  funderAiPolicy?: string | null
  supportingDocuments?: string[]
  eligibilityMismatch?: boolean
  mismatchReason?: string | null
}
