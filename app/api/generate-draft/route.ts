// POST /api/generate-draft (S6.2)
//
// Generates AI draft answers for all extracted questions in one Bedrock call.
// Called automatically when the user arrives at Step 4 (AC-FR-28-01).
// Also called when the user clicks "Regenerate all answers".
//
// Request body: { applicationId: string }
//
// Success response:
//   { answers: Array<{ id: string; answerText: string }>, approachingLimit: boolean }
//
// Error response (all AI routes use this shape — GAP-04):
//   { error: AiErrorCode, message: string }
//
// maxDuration = 90 seconds: draft generation for 3–5 answers can take 30–60 s.
// Vercel Pro required in production (ADR-AI-006, ADR-OPS-001). (🔵 P5.4)
//
// DRAFT_MAX_TOKENS = 3000: sufficient for typical 3–4 question applications
// at 300–400 words each. Very large document-format applications (e.g.
// Garfield Weston: 5 sections × 600 words) may approach this limit. Monitor
// in production and increase if truncation occurs.

import AnthropicBedrock from '@anthropic-ai/bedrock-sdk'
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
  buildDraftPrompt,
  type CharityContext,
  type ApplicationQuestion,
} from '@/lib/prompts'
import { NextResponse, type NextRequest } from 'next/server'

export const maxDuration = 90

// Monthly AI request cap per user (ADR-AI-008, ADR-SEC-005)
const MONTHLY_CAP = 20
const APPROACHING_LIMIT_THRESHOLD = 16

// max_tokens for draft generation. Each answer is typically 300–400 words
// (~400–550 tokens). For 3–5 questions: 1200–2750 tokens + JSON overhead.
const DRAFT_MAX_TOKENS = 3000

export async function POST(request: NextRequest) {
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
  let body: { applicationId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const { applicationId } = body

  if (typeof applicationId !== 'string' || !applicationId) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Missing applicationId.' },
      { status: 400 },
    )
  }

  // ── 3. Ownership check ─────────────────────────────────────────────────────
  const { data: appRow, error: appError } = await supabase
    .from('applications')
    .select('id, ai_summary')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (appError || !appRow) {
    return NextResponse.json(
      { error: 'not_found', message: 'Application not found.' },
      { status: 404 },
    )
  }

  // ── 4. Check monthly usage cap (ADR-AI-008, ADR-SEC-005) ──────────────────
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

  // ── 5. Per-minute rate limit (ADR-SEC-005) ─────────────────────────────────
  const { success: rateLimitOk } = await aiRatelimit.limit(user.id)
  if (!rateLimitOk) {
    return NextResponse.json(aiErrorBody('rate_limited'), {
      status: httpStatusForError('rate_limited'),
    })
  }

  // ── 6. Fetch questions from application_answers ───────────────────────────
  const { data: questionRows, error: qError } = await supabase
    .from('application_answers')
    .select('id, question_text, question_order, word_limit')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .order('question_order')

  if (qError || !questionRows || questionRows.length === 0) {
    return NextResponse.json(
      { error: 'not_found', message: 'No questions found for this application.' },
      { status: 404 },
    )
  }

  const questions: ApplicationQuestion[] = questionRows.map((row) => ({
    id: row.id as string,
    questionText: row.question_text as string,
    questionOrder: row.question_order as number,
    wordLimit: (row.word_limit as number | null) ?? null,
  }))

  // ── 7. Fetch charity profile (for prompt context) ─────────────────────────
  const { data: charityRow } = await supabase
    .from('charity_profiles')
    .select('charity_name, what_charity_does, who_charity_helps, where_charity_works')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!charityRow) {
    return NextResponse.json(
      {
        error: 'not_found',
        message: 'Charity profile not found. Please complete your profile first.',
      },
      { status: 404 },
    )
  }

  const charity: CharityContext = {
    charityName: charityRow.charity_name,
    whatCharityDoes: charityRow.what_charity_does,
    whoCharityHelps: charityRow.who_charity_helps,
    whereCharityWorks: charityRow.where_charity_works,
  }

  // ── 8. Build prompt ────────────────────────────────────────────────────────
  const aiSummary = appRow.ai_summary ?? ''
  const prompt = buildDraftPrompt(questions, charity, aiSummary)

  // ── 9. Call Bedrock with retry ─────────────────────────────────────────────
  const client = new AnthropicBedrock({
    awsAccessKey: process.env.AWS_ACCESS_KEY_ID!,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY!,
    awsRegion: process.env.AWS_REGION ?? 'eu-west-2',
  })

  let bedrockResponse: Awaited<ReturnType<typeof client.messages.create>>
  try {
    bedrockResponse = await withRetry(() =>
      client.messages.create({
        model: MODEL,
        max_tokens: DRAFT_MAX_TOKENS,
        system: AI_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    )
  } catch (err) {
    const code = classifyBedrockError(err)
    console.error('[generate-draft] Bedrock error after retries:', code, err)
    return NextResponse.json(aiErrorBody(code), { status: httpStatusForError(code) })
  }

  // ── 10. Extract and parse JSON response ───────────────────────────────────
  const rawText = bedrockResponse.content[0]?.type === 'text' ? bedrockResponse.content[0].text : ''

  const tokenCount =
    (bedrockResponse.usage?.input_tokens ?? 0) + (bedrockResponse.usage?.output_tokens ?? 0)

  // Strip markdown code fences if Claude wrapped the JSON (ADR-AI-004)
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  let draftAnswers: Array<{ id: string; answer: string }>
  try {
    draftAnswers = JSON.parse(cleaned) as Array<{ id: string; answer: string }>
  } catch {
    // JSON parse failed — retry once with a stricter prompt (ADR-AI-004)
    console.warn('[generate-draft] JSON parse failed on first attempt, retrying...')

    let retryResponse: Awaited<ReturnType<typeof client.messages.create>>
    try {
      retryResponse = await withRetry(() =>
        client.messages.create({
          model: MODEL,
          max_tokens: DRAFT_MAX_TOKENS,
          system: AI_SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: prompt },
            { role: 'assistant', content: rawText },
            {
              role: 'user',
              content:
                'Your previous response was not valid JSON. Return ONLY the JSON array, starting with [ and ending with ]. No other text.',
            },
          ],
        }),
      )
    } catch (retryErr) {
      const code = classifyBedrockError(retryErr)
      return NextResponse.json(aiErrorBody(code), { status: httpStatusForError(code) })
    }

    const retryText = retryResponse.content[0]?.type === 'text' ? retryResponse.content[0].text : ''
    const retryCleaned = retryText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim()

    try {
      draftAnswers = JSON.parse(retryCleaned) as Array<{ id: string; answer: string }>
    } catch {
      console.error('[generate-draft] JSON parse failed after retry')
      return NextResponse.json(aiErrorBody('parse_error'), {
        status: httpStatusForError('parse_error'),
      })
    }
  }

  // ── 11. Validate response and upsert answers ──────────────────────────────
  // Build a lookup set of valid question IDs to guard against hallucinated UUIDs
  const validIds = new Set(questions.map((q) => q.id))

  const answersToSave: Array<{ id: string; answerText: string }> = []

  for (const item of draftAnswers) {
    if (typeof item.id !== 'string' || typeof item.answer !== 'string') continue
    if (!validIds.has(item.id)) {
      // Claude returned an unrecognised ID — try matching by position as fallback
      console.warn('[generate-draft] Unrecognised question ID in response:', item.id)
      continue
    }
    answersToSave.push({ id: item.id, answerText: item.answer })
  }

  // Save each answer to the database
  for (const { id, answerText } of answersToSave) {
    const { error: saveErr } = await supabase
      .from('application_answers')
      .update({
        answer_text: answerText,
        answer_source: 'ai_generated',
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (saveErr) {
      console.error('[generate-draft] Failed to save answer:', id, saveErr)
      // Non-fatal — return the answers to the client even if a DB save failed.
    }
  }

  // ── 12. Log AI usage (ADR-AI-008) ─────────────────────────────────────────
  await supabase.from('ai_usage_log').insert({
    user_id: user.id,
    application_id: applicationId,
    request_type: 'draft_generation',
    token_count: tokenCount,
  })

  // ── 13. Return response ────────────────────────────────────────────────────
  return NextResponse.json({
    answers: answersToSave,
    approachingLimit,
  })
}
