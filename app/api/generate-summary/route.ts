// POST /api/generate-summary (S5.2)
//
// Generates an AI summary of funder guidelines using Amazon Bedrock.
// Called automatically when the user arrives at Step 3 (AC-FR-24-01).
// Also called when the user clicks "Regenerate summary".
//
// Request body: { applicationId: string, guidelinesText: string }
//
// Success response:
//   { summary: AiSummaryData, questionsFound: boolean, approachingLimit: boolean }
//
// Error response (all AI routes use this shape — GAP-04):
//   { error: AiErrorCode, message: string }
//
// HTTP status codes: see lib/ai-error-handler.ts
//
// maxDuration = 90 seconds: Bedrock summary calls take up to ~35 s in
// production. The default Vercel function timeout (10 s) is too short.
// Vercel Pro required in production (ADR-AI-006, ADR-OPS-001). (🔵 P5.4)
//
// Also upserts application_guidelines.guideline_text (GAP-33, ADR-DATA-002
// 2026-07-10 reversal) — the marker-tagged text citations were validated
// against, retained so P6.4's "view original guidelines" viewer has
// something real to render.

import AnthropicBedrock from '@anthropic-ai/bedrock-sdk'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { aiRatelimit } from '@/lib/rate-limit'
import {
  classifyBedrockError,
  withRetry,
  httpStatusForError,
  aiErrorBody,
} from '@/lib/ai-error-handler'
import {
  MODEL,
  AI_SYSTEM_PROMPT,
  MONTHLY_CAP,
  APPROACHING_LIMIT_THRESHOLD,
  buildSummaryPrompt,
  type CharityContext,
} from '@/lib/prompts'
import { preprocessText, DEFAULT_CHAR_CEILING } from '@/lib/preprocess-text'
import { extractValidMarkers, validateCitation } from '@/lib/guideline-citations'
import type { AiSummaryData } from '@/lib/types'
import { NextResponse, type NextRequest } from 'next/server'

// Raw citation shape as the AI actually returns it (P6.3, ADR-DATA-007) —
// both page_number and heading_path present, one always null, per the
// prompt's worked examples. reconcileCitations() below (near the parse
// logic) converts this into the strict omitted-key discriminated union
// application_items expects, after cross-checking it against real markers
// in the guidelines text (lib/guideline-citations.ts).
const citationSchema = z
  .object({
    source_type: z.enum(['page', 'heading']),
    page_number: z.number().nullable(),
    heading_path: z.array(z.string()).nullable(),
    quote: z.string(),
  })
  .nullable()
  .optional()

// Zod schemas for Bedrock response validation (F-02-02)
const aiSummaryQuestionSchema = z.object({
  number: z.number(),
  text: z.string(),
  wordLimit: z.number().nullable().optional(),
  charLimit: z.number().nullable().optional(),
  limitType: z.enum(['words', 'characters', 'none']).nullable().optional(),
  is_budget_question: z.boolean(),
  citation: citationSchema,
})

const aiSummarySectionSchema = z.object({
  number: z.number(),
  title: z.string(),
  guidance: z.string(),
  wordLimit: z.number().nullable().optional(),
  is_budget_section: z.boolean(),
  citation: citationSchema,
})

// PDR-AI-008 (2026-07-15): closed vocabulary of the 5 governance/reserves
// facts (lib/governance-items.ts) — kept as an inline literal enum, not
// derived from GOVERNANCE_FIELD_KEYS, since that export is a plain readonly
// array (not a tuple) and z.enum requires a `[string, ...string[]]` tuple.
const governanceFieldKeySchema = z.enum([
  'governance_total_expenditure',
  'governance_reserves',
  'governance_trustees_related',
  'governance_bank_signatory_count',
  'governance_bank_signatories_related',
])

const aiSummaryGovernanceFactSchema = z.object({
  field_key: governanceFieldKeySchema,
  questionText: z.string(),
  citation: citationSchema,
})

const aiSummarySchema = z.object({
  funder_type: z.enum(['structured', 'free_form']),
  aboutGrant: z.string(),
  amount: z.string(),
  whoCanApply: z.array(z.string()),
  lookingFor: z.array(z.string()),
  questions: z.array(aiSummaryQuestionSchema),
  sections: z.array(aiSummarySectionSchema).optional(),
  governanceFacts: z.array(aiSummaryGovernanceFactSchema).optional(),
  keyRequirements: z.array(z.string()),
  funderAiPolicy: z.string().nullable().optional(),
  supportingDocuments: z.array(z.string()).optional(),
  eligibilityMismatch: z.boolean().optional(),
  mismatchReason: z.string().nullable().optional(),
})

export const maxDuration = 90

// Raised to 4000: complex structured documents (e.g. AB Charitable Trust with
// 33 questions across 4 sections) were truncating at 2000 tokens, producing
// invalid JSON. 4000 gives headroom for large question sets while remaining
// well within Claude's output limits.
const SUMMARY_MAX_TOKENS = 4000

export async function POST(request: NextRequest) {
  // ── 0. Kill-switch ─────────────────────────────────────────────────────────
  if (process.env.AI_ENABLED === 'false') {
    return NextResponse.json(aiErrorBody('overloaded'), { status: 503 })
  }

  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be signed in.' },
      { status: 401 },
    )
  }

  // ── 2. Parse and validate request body ────────────────────────────────────
  let body: { applicationId?: unknown; guidelinesText?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const { applicationId, guidelinesText } = body

  if (
    typeof applicationId !== 'string' ||
    !applicationId ||
    typeof guidelinesText !== 'string' ||
    !guidelinesText.trim()
  ) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Missing applicationId or guidelinesText.' },
      { status: 400 },
    )
  }

  // Verify the application belongs to this user (ownership check)
  const { data: appRow, error: appError } = await supabase
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (appError || !appRow) {
    return NextResponse.json(
      { error: 'not_found', message: 'Application not found.' },
      { status: 404 },
    )
  }

  // ── 3. Per-minute rate limit (ADR-SEC-005) ────────────────────────────────
  const { success: rateLimitOk } = await aiRatelimit.limit(user.id)
  if (!rateLimitOk) {
    return NextResponse.json(aiErrorBody('rate_limited'), {
      status: httpStatusForError('rate_limited'),
    })
  }

  // ── 4. Atomic cap check + slot reservation (ADR-AI-008, F-01-02) ──────────
  // reserve_ai_slot acquires a per-user advisory lock, counts usage for the
  // current month, and inserts a placeholder log row — all in one transaction.
  // This closes the count-then-insert TOCTOU present in the previous pattern.
  const { data: slotData, error: slotError } = await supabase.rpc('reserve_ai_slot', {
    p_user_id: user.id,
    p_application_id: applicationId,
    p_request_type: 'guideline_summary',
    p_monthly_cap: MONTHLY_CAP,
    p_approaching_threshold: APPROACHING_LIMIT_THRESHOLD,
  })

  if (slotError || !slotData) {
    console.error('[generate-summary] Failed to reserve AI slot:', slotError)
    return NextResponse.json(aiErrorBody('server_error'), {
      status: httpStatusForError('server_error'),
    })
  }

  if (!slotData.allowed) {
    return NextResponse.json(aiErrorBody('usage_limit'), {
      status: httpStatusForError('usage_limit'),
    })
  }

  const logId = slotData.log_id as string
  const approachingLimit = slotData.approaching_limit as boolean

  // ── 5. Fetch charity profile (for prompt context) ─────────────────────────
  let charity: CharityContext | null = null
  const { data: charityRow } = await supabase
    .from('charity_profiles')
    .select('charity_name, what_charity_does, who_charity_helps, where_charity_works')
    .eq('user_id', user.id)
    .maybeSingle()

  if (charityRow) {
    charity = {
      charityName: charityRow.charity_name,
      whatCharityDoes: charityRow.what_charity_does,
      whoCharityHelps: charityRow.who_charity_helps,
      whereCharityWorks: charityRow.where_charity_works,
    }
  }

  // ── 6. Pre-process guidelines text (ADR-AI-010) ───────────────────────────
  // Reduce input tokens by 15–25% before the Bedrock call. Strips PDF
  // artefacts, repeated header/footer lines, boilerplate sections, and
  // excess whitespace. Applies a character ceiling as a safety net for
  // very large multi-form PDFs (e.g. Clothworkers).
  // Disable entirely with DISABLE_TEXT_PREPROCESSING=true.
  // Override the ceiling with PREPROCESS_CHAR_CEILING=<number>.
  const skipPreprocessing = process.env.DISABLE_TEXT_PREPROCESSING === 'true'
  const charCeiling = process.env.PREPROCESS_CHAR_CEILING
    ? parseInt(process.env.PREPROCESS_CHAR_CEILING, 10)
    : DEFAULT_CHAR_CEILING

  let textForPrompt = guidelinesText
  let guidelinesTruncated = false
  if (!skipPreprocessing) {
    const { text, wasTruncated, originalLength, processedLength } = preprocessText(
      guidelinesText,
      charCeiling,
    )
    textForPrompt = text
    guidelinesTruncated = wasTruncated
    console.log(
      `[generate-summary] pre-processing: ${originalLength} → ${processedLength} chars` +
        (wasTruncated ? ` (truncated at ${charCeiling})` : ''),
    )
    if (wasTruncated) {
      console.warn(
        `[generate-summary] text truncated: original ${originalLength} chars exceeded ceiling ${charCeiling}`,
      )
    }
  }

  // ── 7. Call Bedrock with retry ─────────────────────────────────────────────
  const client = new AnthropicBedrock({
    awsAccessKey: process.env.AWS_ACCESS_KEY_ID!,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY!,
    awsRegion: process.env.AWS_REGION ?? 'eu-west-2',
  })

  const prompt = buildSummaryPrompt(textForPrompt, charity)

  const bedrockStart = Date.now()
  let bedrockResponse: Awaited<ReturnType<typeof client.messages.create>>
  try {
    bedrockResponse = await withRetry(() =>
      client.messages.create(
        {
          model: MODEL,
          max_tokens: SUMMARY_MAX_TOKENS,
          // Extraction, not creative generation — the same guidelines text must
          // always yield the same questions/sections/citations (2026-07-15 regression).
          temperature: 0,
          system: AI_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        },
        { signal: AbortSignal.timeout(60_000) },
      ),
    )
  } catch (err) {
    const code = classifyBedrockError(err)
    console.error(
      `[generate-summary] Bedrock error after retries (${Date.now() - bedrockStart}ms):`,
      code,
      err,
    )
    // Return the slot so the user's monthly count is not charged for a service error.
    await supabase.rpc('cancel_ai_slot', { p_log_id: logId, p_user_id: user.id })
    return NextResponse.json(aiErrorBody(code), { status: httpStatusForError(code) })
  }

  // ── 7. Extract and parse JSON response ────────────────────────────────────
  const rawText = bedrockResponse.content[0]?.type === 'text' ? bedrockResponse.content[0].text : ''

  const tokenCount =
    (bedrockResponse.usage?.input_tokens ?? 0) + (bedrockResponse.usage?.output_tokens ?? 0)

  console.log(
    `[generate-summary] Bedrock latency: ${Date.now() - bedrockStart}ms, ${tokenCount} tokens`,
  )

  // Strip markdown code fences if Claude wrapped the JSON (ADR-AI-004)
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  // Typed as the raw Zod-inferred shape (citation keys not yet reconciled
  // against real markers) until step 7a below produces the final AiSummaryData.
  let rawSummary: z.infer<typeof aiSummarySchema>
  let rawParsed: unknown
  try {
    rawParsed = JSON.parse(cleaned)
  } catch {
    rawParsed = null
  }
  const parseResult = aiSummarySchema.safeParse(rawParsed)
  if (parseResult.success) {
    rawSummary = parseResult.data
  } else {
    // JSON parse or Zod validation failed — retry once with a stricter prompt (ADR-AI-004)
    console.warn('[generate-summary] JSON parse/validation failed on first attempt, retrying...')

    let retryResponse: Awaited<ReturnType<typeof client.messages.create>>
    try {
      retryResponse = await withRetry(() =>
        client.messages.create(
          {
            model: MODEL,
            max_tokens: SUMMARY_MAX_TOKENS,
            system: AI_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: prompt },
              { role: 'assistant', content: rawText },
              {
                role: 'user',
                content:
                  'Your previous response was not valid JSON. Return ONLY the JSON object, starting with { and ending with }. No other text.',
              },
            ],
          },
          { signal: AbortSignal.timeout(60_000) },
        ),
      )
    } catch (retryErr) {
      const code = classifyBedrockError(retryErr)
      await supabase.rpc('cancel_ai_slot', { p_log_id: logId, p_user_id: user.id })
      return NextResponse.json(aiErrorBody(code), { status: httpStatusForError(code) })
    }

    const retryText = retryResponse.content[0]?.type === 'text' ? retryResponse.content[0].text : ''
    const retryCleaned = retryText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim()

    let retryRawParsed: unknown
    try {
      retryRawParsed = JSON.parse(retryCleaned)
    } catch {
      retryRawParsed = null
    }
    const retryParseResult = aiSummarySchema.safeParse(retryRawParsed)
    if (retryParseResult.success) {
      rawSummary = retryParseResult.data
    } else {
      console.error('[generate-summary] JSON parse/validation failed after retry')
      await supabase.rpc('cancel_ai_slot', { p_log_id: logId, p_user_id: user.id })
      return NextResponse.json(aiErrorBody('parse_error'), {
        status: httpStatusForError('parse_error'),
      })
    }
  }

  // ── 7a. Reconcile citations against real markers (P6.3, ADR-DATA-007) ─────
  // A citation is never trusted purely on the AI's word — cross-check every
  // reported [PAGE N] / [SECTION: ...] citation against the markers actually
  // present in the text the AI was given (textForPrompt, post-truncation), and
  // drop (null out) any that don't check out. Log a warning (not a failure —
  // nothing renders citations to a user yet) if over half of what the AI
  // offered turns out invalid, as a signal the tagging or the model's
  // behaviour may need attention.
  const validMarkers = extractValidMarkers(textForPrompt)
  let citationsOffered = 0
  let citationsValid = 0

  const reconcileCitation = (raw: (typeof rawSummary.questions)[number]['citation']) => {
    const result = validateCitation(raw ?? null, validMarkers)
    if (result.wasOffered) citationsOffered++
    if (result.wasValid) citationsValid++
    return result.citation
  }

  const summary: AiSummaryData = {
    ...rawSummary,
    questions: rawSummary.questions.map((q) => ({ ...q, citation: reconcileCitation(q.citation) })),
    sections: rawSummary.sections?.map((s) => ({ ...s, citation: reconcileCitation(s.citation) })),
    governanceFacts: rawSummary.governanceFacts?.map((f) => ({
      ...f,
      citation: reconcileCitation(f.citation),
    })),
  }

  if (citationsOffered > 0 && citationsValid / citationsOffered < 0.5) {
    console.warn(
      `[generate-summary] over half of offered citations were invalid: ${citationsValid}/${citationsOffered} valid (applicationId: ${applicationId})`,
    )
  }

  // ── 8. Save summary to database ────────────────────────────────────────────
  const summaryJson = JSON.stringify(summary)

  const { error: saveError } = await supabase
    .from('applications')
    .update({ ai_summary: summaryJson })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (saveError) {
    console.error('[generate-summary] Failed to save summary:', saveError)
    // Non-fatal — return the summary to the client even if DB save failed.
    // The user can still continue; the summary will be regenerated on next visit.
  }

  // ── 8a. Retain guideline text (GAP-33, ADR-DATA-002 2026-07-10 reversal) ───
  // Stores textForPrompt — the exact, marker-tagged text the AI was given and
  // citations were validated against above — so P6.4's "view original
  // guidelines" viewer has something real to render. Upserted (not inserted)
  // so regenerating the summary refreshes the retained text, same convention
  // as application_items. Non-fatal on failure, same as the ai_summary save.
  const { error: guidelinesSaveError } = await supabase.from('application_guidelines').upsert(
    {
      application_id: applicationId,
      user_id: user.id,
      guideline_text: textForPrompt,
    },
    { onConflict: 'application_id' },
  )

  if (guidelinesSaveError) {
    console.error('[generate-summary] Failed to retain guideline text:', guidelinesSaveError)
  }

  // ── 9. Commit AI usage with token count (ADR-AI-008) ──────────────────────
  await supabase.rpc('update_ai_slot_token_count', {
    p_log_id: logId,
    p_user_id: user.id,
    p_token_count: tokenCount,
  })

  // ── 10. Return response ────────────────────────────────────────────────────
  const questionsFound =
    (Array.isArray(summary.questions) && summary.questions.length > 0) ||
    (summary.funder_type === 'free_form' &&
      Array.isArray(summary.sections) &&
      summary.sections.length > 0)

  return NextResponse.json({
    summary,
    questionsFound,
    approachingLimit,
    guidelinesTruncated,
  })
}

// AiSummaryData, AiSummaryQuestion, AiSummarySection — see lib/types.ts
export type {
  AiSummaryData,
  AiSummaryQuestion,
  AiSummarySection,
  AiSummaryGovernanceFact,
} from '@/lib/types'
