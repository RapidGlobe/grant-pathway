// Prompt library — single source of truth for all AI generation routes
// (ADR-AI-002, ADR-AI-003, S5.1)
//
// ALL AI API routes MUST import their model identifier and prompt text from
// this file. No prompt text or model strings in route files.
//
// Section comments below explain the intent of each prompt segment so future
// maintainers understand WHY specific instructions are included, not just what
// they do (ADR-AI-003, GAP-01 resolved).
//
// If you find that outputs are inconsistent, add few-shot examples to the
// relevant prompt function before adjusting the model (ADR-AI-004).

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

/**
 * Bedrock model identifier — single source of truth (ADR-AI-002).
 * Both generate-summary and generate-draft import from here so changing
 * the model updates both routes simultaneously.
 */
export const MODEL = 'anthropic.claude-sonnet-4-6'

// ---------------------------------------------------------------------------
// Shared system prompt
// ---------------------------------------------------------------------------

/**
 * System prompt used by both AI routes.
 *
 * Role framing: positions Claude as a UK grant writing expert so it applies
 * domain knowledge to its analysis (e.g., understanding "Section 106",
 * "CIO", "VCSE" vocabulary, UK funding body conventions).
 *
 * JSON-only instruction: strictly required for ADR-AI-004 JSON parsing.
 * Without this, Claude sometimes prepends "Here is the summary:" or wraps
 * the JSON in markdown code fences, which breaks `JSON.parse()`.
 */
export const AI_SYSTEM_PROMPT = `You are an expert grant writer helping UK charities prepare funding applications. You have extensive knowledge of UK charitable funding, grant guidelines, and what funders are looking for in applications.

Respond with valid JSON only. Do not include any text, explanation, or markdown outside the JSON object. Do not wrap the JSON in code blocks or backticks.`

// ---------------------------------------------------------------------------
// Summary prompt (Step 3 — S5.1, S5.2)
// ---------------------------------------------------------------------------

export type CharityContext = {
  charityName: string
  whatCharityDoes: string
  whoCharityHelps: string
  whereCharityWorks: string
}

/**
 * Builds the user-turn message for the funder guidelines summary.
 *
 * Output schema: typed `AiSummaryData` (route.ts in generate-summary).
 * Field names in the JSON schema below must stay in sync with that type.
 *
 * Charity context: included so Claude can flag eligibility considerations.
 * Not used to generate draft answers (that happens in Step 4).
 *
 * Question extraction rules:
 *   - Extract questions EXACTLY as written — do not paraphrase
 *   - Include wordLimit ONLY if an explicit word count is stated
 *   - Return an empty "questions" array if no specific questions are found
 *   - Do not invent or synthesise questions from generic grant-writing advice
 *   - Set is_budget_question=true for any question about budget, income,
 *     expenditure, financial projections, or funding breakdown
 *
 * funder_type classification:
 *   - "structured": guidelines contain a numbered list of questions or a form
 *     with discrete labelled fields
 *   - "free_form": guidelines describe themes/sections to cover in a narrative
 *     document; no numbered questions
 *
 * @param guidelinesText  Extracted text from the uploaded PDF or Word doc,
 *                        or the user's pasted text. May be very long.
 * @param charity         Charity profile from the database. Pass null if the
 *                        user has not yet completed their charity profile.
 */
export function buildSummaryPrompt(
  guidelinesText: string,
  charity: CharityContext | null,
): string {
  const charitySection = charity
    ? `CHARITY PROFILE (for context — use to note eligibility considerations):
Charity name: ${charity.charityName}
What they do: ${charity.whatCharityDoes}
Who they help: ${charity.whoCharityHelps}
Where they work: ${charity.whereCharityWorks}`
    : `CHARITY PROFILE: Not provided.`

  return `Analyse the following funder guidelines and return a JSON object with exactly these fields:

{
  "funder_type": "structured",
  "aboutGrant": "2–3 sentences describing what this grant is for and who runs it",
  "amount": "The grant amount or funding range as stated in the guidelines. If not specified, write 'Not specified.'",
  "whoCanApply": [
    "Eligibility criterion 1",
    "Eligibility criterion 2"
  ],
  "lookingFor": [
    "Funding priority or theme 1",
    "Funding priority or theme 2"
  ],
  "questions": [
    {
      "number": 1,
      "text": "Exact question text as written in the guidelines",
      "wordLimit": 400,
      "is_budget_question": false
    }
  ],
  "keyRequirements": [
    "Key requirement or restriction 1",
    "Key requirement or restriction 2"
  ],
  "funderAiPolicy": null,
  "supportingDocuments": [
    "Document category 1",
    "Document category 2"
  ]
}

Rules:
- "funder_type": set to "structured" if the guidelines contain a numbered list of questions or a downloadable form with discrete labelled fields; set to "free_form" if the guidelines ask applicants to write a narrative document covering specified themes with no numbered questions
- "aboutGrant": 2–3 sentences maximum; include the funder name and grant programme name if present
- "whoCanApply": short bullet-point phrases; extract from eligibility criteria sections
- "lookingFor": short bullet-point phrases; extract from priorities, themes, or funding focus sections
- "questions": extract EXACTLY as written; include "wordLimit" only if an explicit word count is stated; set "is_budget_question" to true for any question about budget, income, expenditure, financial projections, or funding breakdown; if no specific application questions are found, return an empty array []
- "keyRequirements": important restrictions, deadlines, geographic limits, exclusions
- "funderAiPolicy": extract any statement the funder makes about AI tool usage (verbatim or very close paraphrase); return null if no AI policy statement is found
- "supportingDocuments": list all supporting document categories the funder requires or recommends submitting alongside the application (e.g. "Most recent annual accounts", "Governing document / constitution"); return an empty array [] if none are mentioned
- Use UK English spelling throughout
- All arrays must have at least one item except "questions" and "supportingDocuments" which may be empty

${charitySection}

FUNDER GUIDELINES:
${guidelinesText}`
}

// ---------------------------------------------------------------------------
// Draft answers prompt (Step 4 — S6.2)
// ---------------------------------------------------------------------------

export type ApplicationQuestion = {
  id: string
  questionText: string
  questionOrder: number
  wordLimit: number | null
}

/**
 * Builds the user-turn message for generating all draft answers in one call.
 *
 * Batch generation: all questions answered in a single Bedrock call to
 * stay within the monthly usage cap (ADR-AI-008). One call = one AI request
 * counted against the 20/month limit.
 *
 * Output schema: a JSON array keyed by question ID so the route can upsert
 * each answer to the correct `application_answers` row without ambiguity.
 *
 * Tone instructions: answers should sound like the charity wrote them, not
 * like a template. Using the charity profile as context is essential here.
 *
 * Word limit handling: Claude is instructed to respect word limits strictly.
 * If no word limit is given, 400 words is the default.
 *
 * @param questions   Array of questions from `application_answers` rows.
 * @param charity     Charity profile — used as the "voice" for the answers.
 * @param aiSummary   The funder guidelines summary from Step 3, parsed as
 *                    a string. Gives Claude context about what the funder
 *                    is looking for without re-sending the full guidelines.
 */
export function buildDraftPrompt(
  questions: ApplicationQuestion[],
  charity: CharityContext,
  aiSummary: string,
): string {
  const questionList = questions
    .map((q) => {
      const limit = q.wordLimit ? `Word limit: ${q.wordLimit} words.` : 'Word limit: 400 words.'
      return `Question ID: ${q.id}\nQuestion ${q.questionOrder}: ${q.questionText}\n${limit}`
    })
    .join('\n\n')

  return `You are writing grant application answers on behalf of a UK charity. The answers must sound authentic, specific to this charity, and directly address what the funder is looking for. Do not use generic grant-writing phrases.

Return a JSON array where each item has exactly these fields:
[
  {
    "id": "the question ID exactly as provided",
    "answer": "Your draft answer text"
  }
]

Rules:
- Write in first-person plural ("we", "our", "us") as if the charity is speaking
- Stay strictly within the stated word limit for each question
- Use concrete, specific language — reference the charity's actual work
- Address the funder's stated priorities directly
- UK English spelling throughout
- Return answers for ALL questions provided

CHARITY PROFILE:
Name: ${charity.charityName}
What they do: ${charity.whatCharityDoes}
Who they help: ${charity.whoCharityHelps}
Where they work: ${charity.whereCharityWorks}

FUNDER GUIDELINES SUMMARY:
${aiSummary}

QUESTIONS TO ANSWER:
${questionList}`
}
