// POST /api/refine-answer (S6.6)
//
// Refines a single grant application answer for structure and clarity.
// Called by the per-question "Help me improve this" button in Step 4.
//
// Request body: { applicationId: string, answerId: string, questionText: string, answerText: string }
//
// Success response:
//   { refinedText: string, approachingLimit: boolean }
//
// Error response (same shape as all AI routes — GAP-04):
//   { error: AiErrorCode, message: string }
//
// Guards:
//   - is_budget_question: fetched from DB; request rejected if true (AI must
//     not help with budget/financial answers — AC-FR-31)
//   - Monthly cap: 50 requests/month per user (shared with generate-summary)
//   - Per-minute rate limit: Upstash Redis burst limit
//
// maxDuration = 60 s: refine calls are faster than full summary generation
// but still require more than the 10 s default Vercel function timeout.

import AnthropicBedrock from '@anthropic-ai/bedrock-sdk'
import { createClient } from '@/lib/supabase/server'
import { aiRatelimit } from '@/lib/rate-limit'
import {
  classifyBedrockError,
  withRetry,
  httpStatusForError,
  aiErrorBody,
} from '@/lib/ai-error-handler'
import { MODEL, AI_SYSTEM_PROMPT, buildRefinePrompt } from '@/lib/prompts'
import { NextResponse, type NextRequest } from 'next/server'

export const maxDuration = 60

const MONTHLY_CAP = 50
const APPROACHING_LIMIT_THRESHOLD = 40
const REFINE_MAX_TOKENS = 800

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
  let body: {
    applicationId?: unknown
    answerId?: unknown
    questionText?: unknown
    answerText?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const { applicationId, answerId, questionText, answerText } = body

  if (
    typeof applicationId !== 'string' ||
    !applicationId ||
    typeof answerId !== 'string' ||
    !answerId ||
    typeof questionText !== 'string' ||
    !questionText.trim() ||
    typeof answerText !== 'string' ||
    !answerText.trim()
  ) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Missing or invalid request fields.' },
      { status: 400 },
    )
  }

  // ── 3. Verify ownership and check is_budget_question ──────────────────────
  // Fetch the answer row to verify it belongs to this user and the parent
  // application matches. Also reads is_budget_question and word_limit from DB
  // rather than trusting the client.
  const { data: answerRow, error: answerError } = await supabase
    .from('application_answers')
    .select('id, application_id, is_budget_question, word_limit')
    .eq('id', answerId)
    .eq('user_id', user.id)
    .single()

  if (answerError || !answerRow) {
    return NextResponse.json({ error: 'not_found', message: 'Answer not found.' }, { status: 404 })
  }

  // Belt-and-braces: application ID must match
  if (answerRow.application_id !== applicationId) {
    return NextResponse.json({ error: 'not_found', message: 'Answer not found.' }, { status: 404 })
  }

  // Budget questions must never receive AI assistance (AC-FR-31)
  if (answerRow.is_budget_question) {
    return NextResponse.json(
      {
        error: 'invalid_request',
        message: 'AI assistance is not available for budget questions.',
      },
      { status: 400 },
    )
  }

  // Note: AI assist is intentionally allowed when over the word limit.
  // The refine prompt instructs the AI to stay within the word limit, actively
  // compressing the answer — more helpful than blocking the user at this point.

  // ── 4. Check monthly usage cap (ADR-AI-008, ADR-SEC-005) ──────────────────
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: usageCount, error: usageError } = await supabase
    .from('ai_usage_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  // Fail closed: if the cap query errors, refuse the call rather than
  // defaulting to 0 and bypassing the cap entirely.
  if (usageError) {
    console.error('[refine-answer] Failed to read usage count:', usageError)
    return NextResponse.json(aiErrorBody('server_error'), {
      status: httpStatusForError('server_error'),
    })
  }

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

  // ── 6. Call Bedrock with retry ─────────────────────────────────────────────
  const client = new AnthropicBedrock({
    awsAccessKey: process.env.AWS_ACCESS_KEY_ID!,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY!,
    awsRegion: process.env.AWS_REGION ?? 'eu-west-2',
  })

  const refineWordLimit = typeof answerRow.word_limit === 'number' ? answerRow.word_limit : null
  const prompt = buildRefinePrompt(questionText, answerText, refineWordLimit)

  const bedrockStart = Date.now()
  let bedrockResponse: Awaited<ReturnType<typeof client.messages.create>>
  try {
    bedrockResponse = await withRetry(() =>
      client.messages.create({
        model: MODEL,
        max_tokens: REFINE_MAX_TOKENS,
        system: AI_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    )
  } catch (err) {
    const code = classifyBedrockError(err)
    console.error(
      `[refine-answer] Bedrock error after retries (${Date.now() - bedrockStart}ms):`,
      code,
      err,
    )
    return NextResponse.json(aiErrorBody(code), { status: httpStatusForError(code) })
  }

  // ── 7. Parse JSON response ─────────────────────────────────────────────────
  const rawText = bedrockResponse.content[0]?.type === 'text' ? bedrockResponse.content[0].text : ''

  const tokenCount =
    (bedrockResponse.usage?.input_tokens ?? 0) + (bedrockResponse.usage?.output_tokens ?? 0)

  console.log(
    `[refine-answer] Bedrock latency: ${Date.now() - bedrockStart}ms, ${tokenCount} tokens`,
  )

  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  let refinedText: string
  try {
    const parsed = JSON.parse(cleaned) as { refinedText?: unknown }
    if (typeof parsed.refinedText !== 'string' || !parsed.refinedText.trim()) {
      throw new Error('refinedText missing or empty')
    }
    refinedText = parsed.refinedText.trim()
  } catch {
    console.error('[refine-answer] JSON parse failed:', cleaned.slice(0, 200))
    return NextResponse.json(aiErrorBody('parse_error'), {
      status: httpStatusForError('parse_error'),
    })
  }

  // ── 8. Log AI usage (ADR-AI-008) ──────────────────────────────────────────
  await supabase.from('ai_usage_log').insert({
    user_id: user.id,
    application_id: applicationId,
    request_type: 'refine_answer',
    token_count: tokenCount,
  })

  // ── 9. Return response ─────────────────────────────────────────────────────
  return NextResponse.json({ refinedText, approachingLimit })
}
