export type AiSummaryQuestion = {
  number: number
  text: string
  wordLimit?: number | null
  charLimit?: number | null
  limitType?: 'words' | 'characters' | 'none' | null
  is_budget_question: boolean
}

export type AiSummarySection = {
  number: number
  title: string
  guidance: string
  wordLimit?: number
  is_budget_section: boolean
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
