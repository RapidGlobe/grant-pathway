// GAP-92 — bring refine-answer's truncation handling in line with GAP-52's
// fix for generate-summary. Mirrors generate-summary-truncation-guard.test.ts:
// mocks Bedrock's response (not the network, not the model) and calls the
// real POST handler, so the guard runs for real rather than being inferred
// from reading the source around it.
//
// Supabase, the rate limiter, Bedrock and Sentry are mocked because the
// route needs all four to run at all.

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
      if (table === 'application_items') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({
                  data: {
                    id: 'answer-1',
                    application_id: 'app-1',
                    is_budget_question: false,
                    word_limit: 500,
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }
      }
      throw new Error(`Unmocked table in test: ${table}`)
    },
    rpc: mockRpc,
  })),
}))

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/refine-answer', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  applicationId: 'app-1',
  answerId: 'answer-1',
  questionText: 'What is your project?',
  answerText: 'A community project that helps people.',
}

describe('GAP-92 — the refine-answer truncation guard actually fires', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRpc.mockImplementation((fnName: string) => {
      if (fnName === 'reserve_ai_slot') {
        return Promise.resolve({
          data: { allowed: true, log_id: 'log-1', approaching_limit: false, current_usage: 1 },
          error: null,
        })
      }
      // cancel_ai_slot, update_ai_slot_token_count
      return Promise.resolve({ data: null, error: null })
    })
  })

  it('returns answer_too_long, not parse_error, when Bedrock reports stop_reason: max_tokens', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"refinedText": "A much improved answer that got cut' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 300, output_tokens: 800 },
    })

    const { POST } = await import('@/app/api/refine-answer/route')
    const response = await POST(makeRequest(VALID_BODY))
    const json = await response.json()

    expect(response.status).toBe(httpStatusForError('answer_too_long'))
    expect(json).toEqual(aiErrorBody('answer_too_long'))
  })

  it('does not retry the truncated call — one Bedrock call, not two', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"refinedText": "A much improved answer that got cut' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 300, output_tokens: 800 },
    })

    const { POST } = await import('@/app/api/refine-answer/route')
    await POST(makeRequest(VALID_BODY))

    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('refunds the AI slot via cancel_ai_slot', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"refinedText": "A much improved answer that got cut' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 300, output_tokens: 800 },
    })

    const { POST } = await import('@/app/api/refine-answer/route')
    await POST(makeRequest(VALID_BODY))

    expect(mockRpc).toHaveBeenCalledWith('cancel_ai_slot', {
      p_log_id: 'log-1',
      p_user_id: 'user-1',
    })
  })

  it('tags Sentry with ai_error: answer_too_long (GAP-21)', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"refinedText": "A much improved answer that got cut' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 300, output_tokens: 800 },
    })

    const Sentry = await import('@sentry/nextjs')
    const { POST } = await import('@/app/api/refine-answer/route')
    await POST(makeRequest(VALID_BODY))

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { route: 'refine-answer', step: 'bedrock', ai_error: 'answer_too_long' },
      }),
    )
  })

  it('control case: a clean end_turn response with valid JSON succeeds normally', async () => {
    // Proves the mock harness itself is sound — the guard tests above are
    // meaningful only if a non-truncated response demonstrably takes the
    // success path through the same harness, not some other unrelated route.
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ refinedText: 'A much improved answer.' }) }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 300, output_tokens: 40 },
    })

    const { POST } = await import('@/app/api/refine-answer/route')
    const response = await POST(makeRequest(VALID_BODY))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.refinedText).toBe('A much improved answer.')
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockRpc).not.toHaveBeenCalledWith('cancel_ai_slot', expect.anything())
  })
})
