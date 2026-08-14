// GAP-52 — the truncation guard, response_too_long body, and slot refund
// have never actually fired. response-truncation.test.ts confirms the guard
// code exists in the right shape and order via a source scan; it does not
// call the route handler, because nothing has forced Bedrock to genuinely
// return stop_reason: 'max_tokens' since SUMMARY_MAX_TOKENS was raised to
// 6000. This file closes that gap directly: it mocks Bedrock's response
// (not the network, not the model — the one thing this test controls) and
// calls the real POST handler, so the guard runs for real rather than being
// inferred from reading the source around it.
//
// Supabase, the rate limiter, Bedrock and Sentry are mocked because the
// route needs all four to run at all — there is no pure function to extract
// the guard into without restructuring the route, which is a larger change
// than this test warrants (GAP-52 asks for a test, not a refactor).

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { httpStatusForError, aiErrorBody } from '@/lib/ai-error-handler'

const { mockCreate, mockRpc, mockGetUser } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockRpc: vi.fn(),
  mockGetUser: vi.fn(),
}))

vi.mock('@anthropic-ai/bedrock-sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: mockCreate } }
  }),
}))

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  aiRatelimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'applications') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({ data: { id: 'app-1' }, error: null }),
              }),
            }),
          }),
          update: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
        }
      }
      if (table === 'charity_profiles') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
          }),
        }
      }
      if (table === 'application_guidelines') {
        return { upsert: async () => ({ error: null }) }
      }
      throw new Error(`Unmocked table in test: ${table}`)
    },
    rpc: mockRpc,
  })),
}))

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/generate-summary', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const VALID_BODY = { applicationId: 'app-1', guidelinesText: 'Some funder guidelines text.' }

describe('GAP-52 — the truncation guard actually fires', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRpc.mockImplementation((fnName: string) => {
      if (fnName === 'reserve_ai_slot') {
        return Promise.resolve({
          data: { allowed: true, log_id: 'log-1', approaching_limit: false },
          error: null,
        })
      }
      // cancel_ai_slot, update_ai_slot_token_count
      return Promise.resolve({ data: null, error: null })
    })
  })

  it('returns response_too_long, not parse_error, when Bedrock reports stop_reason: max_tokens', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"funder_type": "structured", "questions": [' }], // genuinely cut off
      stop_reason: 'max_tokens',
      usage: { input_tokens: 7636, output_tokens: 6000 },
    })

    const { POST } = await import('@/app/api/generate-summary/route')
    const response = await POST(makeRequest(VALID_BODY))
    const json = await response.json()

    expect(response.status).toBe(httpStatusForError('response_too_long'))
    expect(json).toEqual(aiErrorBody('response_too_long'))
  })

  it('does not retry the truncated call — one Bedrock call, not two', async () => {
    // The whole reason this is a separate error code from parse_error: a
    // retry against the same ceiling cannot produce a shorter answer. If the
    // guard were bypassed, JSON.parse would fail on the cut-off text above
    // and the parse-error retry path would fire a second Bedrock call.
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"funder_type": "structured", "questions": [' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 7636, output_tokens: 6000 },
    })

    const { POST } = await import('@/app/api/generate-summary/route')
    await POST(makeRequest(VALID_BODY))

    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('refunds the AI slot via cancel_ai_slot', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"funder_type": "structured", "questions": [' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 7636, output_tokens: 6000 },
    })

    const { POST } = await import('@/app/api/generate-summary/route')
    await POST(makeRequest(VALID_BODY))

    expect(mockRpc).toHaveBeenCalledWith('cancel_ai_slot', {
      p_log_id: 'log-1',
      p_user_id: 'user-1',
    })
  })

  it('tags Sentry with ai_error: response_too_long (GAP-21)', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"funder_type": "structured", "questions": [' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 7636, output_tokens: 6000 },
    })

    const Sentry = await import('@sentry/nextjs')
    const { POST } = await import('@/app/api/generate-summary/route')
    await POST(makeRequest(VALID_BODY))

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { route: 'generate-summary', step: 'bedrock', ai_error: 'response_too_long' },
      }),
    )
  })

  it('control case: a clean end_turn response with valid JSON succeeds normally', async () => {
    // Proves the mock harness itself is sound — the guard tests above are
    // meaningful only if a non-truncated response demonstrably takes the
    // success path through the same harness, not some other unrelated route.
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            funder_type: 'structured',
            aboutGrant: 'A small grants programme.',
            amount: '£500-£2,000',
            whoCanApply: ['Community groups'],
            lookingFor: ['Community projects'],
            questions: [
              {
                number: 1,
                text: 'What is your project?',
                is_budget_question: false,
              },
            ],
            keyRequirements: ['Must be a UK charity'],
          }),
        },
      ],
      stop_reason: 'end_turn',
      usage: { input_tokens: 500, output_tokens: 200 },
    })

    const { POST } = await import('@/app/api/generate-summary/route')
    const response = await POST(makeRequest(VALID_BODY))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.summary.funder_type).toBe('structured')
    expect(json.questionsFound).toBe(true)
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockRpc).not.toHaveBeenCalledWith('cancel_ai_slot', expect.anything())
  })
})
