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

import AnthropicBedrock from '@anthropic-ai/bedrock-sdk'
import { createClient } from '@/lib/supabase/server'
import { aiRatelimit } from '@/lib/rate-limit'
import {
  classifyBedrockError,
  withRetry,
  httpStatusForError,
  aiErrorBody,
} from '@/lib/ai-error-handler'
import { MODEL, AI_SYSTEM_PROMPT, buildSummaryPrompt, type CharityContext } from '@/lib/prompts'
import { NextResponse, type NextRequest } from 'next/server'

export const maxDuration = 90

// Monthly AI request cap per user (ADR-AI-008, ADR-SEC-005)
// Raised from 20 → 50 on 2026-05-28 to accommodate the Q&A model call pattern.
const MONTHLY_CAP = 50
const APPROACHING_LIMIT_THRESHOLD = 40

// Raised to 4000: complex structured documents (e.g. AB Charitable Trust with
// 33 questions across 4 sections) were truncating at 2000 tokens, producing
// invalid JSON. 4000 gives headroom for large question sets while remaining
// well within Claude's output limits.
const SUMMARY_MAX_TOKENS = 4000

export async function POST(request: NextRequest) {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', message: 'You must be signed in.' }, { status: 401 })
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

  // ── 3. Check monthly usage cap (ADR-AI-008, ADR-SEC-005) ──────────────────
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: usageCount } = await supabase
    .from('ai_usage_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const currentUsage = usageCount ?? 0

  if (currentUsage >= MONTHLY_CAP) {
    return NextResponse.json(aiErrorBody('usage_limit'), {
      status: httpStatusForError('usage_limit'),
    })
  }

  const approachingLimit = currentUsage >= APPROACHING_LIMIT_THRESHOLD

  // ── 4. Per-minute rate limit (ADR-SEC-005) ─────────────────────────────────
  const { success: rateLimitOk } = await aiRatelimit.limit(user.id)
  if (!rateLimitOk) {
    return NextResponse.json(aiErrorBody('rate_limited'), {
      status: httpStatusForError('rate_limited'),
    })
  }

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

  // ── 6. Call Bedrock with retry ─────────────────────────────────────────────
  const client = new AnthropicBedrock({
    awsAccessKey: process.env.AWS_ACCESS_KEY_ID!,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY!,
    awsRegion: process.env.AWS_REGION ?? 'eu-west-2',
  })

  const prompt = buildSummaryPrompt(guidelinesText, charity)

  let bedrockResponse: Awaited<ReturnType<typeof client.messages.create>>
  try {
    bedrockResponse = await withRetry(() =>
      client.messages.create({
        model: MODEL,
        max_tokens: SUMMARY_MAX_TOKENS,
        system: AI_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    )
  } catch (err) {
    const code = classifyBedrockError(err)
    console.error('[generate-summary] Bedrock error after retries:', code, err)
    return NextResponse.json(aiErrorBody(code), { status: httpStatusForError(code) })
  }

  // ── 7. Extract and parse JSON response ────────────────────────────────────
  const rawText =
    bedrockResponse.content[0]?.type === 'text' ? bedrockResponse.content[0].text : ''

  const tokenCount =
    (bedrockResponse.usage?.input_tokens ?? 0) + (bedrockResponse.usage?.output_tokens ?? 0)

  // Strip markdown code fences if Claude wrapped the JSON (ADR-AI-004)
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  let summary: AiSummaryData
  try {
    summary = JSON.parse(cleaned) as AiSummaryData
  } catch {
    // JSON parse failed — retry once with a stricter prompt (ADR-AI-004)
    console.warn('[generate-summary] JSON parse failed on first attempt, retrying...')

    let retryResponse: Awaited<ReturnType<typeof client.messages.create>>
    try {
      retryResponse = await withRetry(() =>
        client.messages.create({
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
        }),
      )
    } catch (retryErr) {
      const code = classifyBedrockError(retryErr)
      return NextResponse.json(aiErrorBody(code), { status: httpStatusForError(code) })
    }

    const retryText =
      retryResponse.content[0]?.type === 'text' ? retryResponse.content[0].text : ''
    const retryCleaned = retryText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim()

    try {
      summary = JSON.parse(retryCleaned) as AiSummaryData
    } catch {
      console.error('[generate-summary] JSON parse failed after retry')
      return NextResponse.json(aiErrorBody('parse_error'), {
        status: httpStatusForError('parse_error'),
      })
    }
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

  // ── 9. Log AI usage (ADR-AI-008) ──────────────────────────────────────────
  await supabase.from('ai_usage_log').insert({
    user_id: user.id,
    application_id: applicationId,
    request_type: 'guideline_summary',
    token_count: tokenCount,
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
  })
}

// ---------------------------------------------------------------------------
// Types (shared with the Step 3 component via import)
// ---------------------------------------------------------------------------

export type AiSummaryQuestion = {
  number: number
  text: string
  wordLimit?: number
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
}
