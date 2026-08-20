// D-021 — the refine-answer route rejects short-answer items server-side.
//
// Step 4 gives date, number and governance items no "Help me improve this"
// button, but a Route Handler is reachable by direct POST regardless of what
// the UI renders. That is the same reason the existing budget-question check
// reads is_budget_question from the database rather than trusting the client,
// and the Next.js docs state it outright for Server Functions: "reachable via
// direct POST requests, not just through your application's UI."
//
// Mirrors refine-answer-truncation-guard.test.ts — mocks Supabase, the rate
// limiter, Bedrock and Sentry (the route needs all four to run) and calls the
// real POST handler, so the guard executes rather than being inferred from
// reading the source around it.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockCreate, mockRpc, mockGetUser, mockItemType } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockRpc: vi.fn(),
  mockGetUser: vi.fn(),
  mockItemType: { value: 'narrative' as string | null },
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
                    item_type: mockItemType.value,
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

function makeRequest() {
  return new NextRequest('http://localhost/api/refine-answer', {
    method: 'POST',
    body: JSON.stringify({
      applicationId: 'app-1',
      answerId: 'answer-1',
      questionText: 'What is your expected start date for the project?',
      answerText: 'April 2027',
    }),
  })
}

describe('refine-answer rejects short-answer item types (D-021)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockRpc.mockImplementation((fnName: string) => {
      if (fnName === 'reserve_ai_slot') {
        return Promise.resolve({
          data: { allowed: true, log_id: 'log-1', approaching_limit: false, current_usage: 1 },
          error: null,
        })
      }
      return Promise.resolve({ data: null, error: null })
    })
    mockItemType.value = 'narrative'
  })

  for (const itemType of ['date', 'number', 'data'] as const) {
    it(`rejects item_type "${itemType}" with 400 and never calls Bedrock`, async () => {
      mockItemType.value = itemType
      const { POST } = await import('@/app/api/refine-answer/route')

      const res = await POST(makeRequest())
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('invalid_request')
      // The cost point, not just the status code: a rejected request must not
      // have spent a Bedrock call or a slot of the user's monthly fair-use
      // allowance before deciding to reject.
      expect(mockCreate).not.toHaveBeenCalled()
    })
  }

  it('still allows a narrative item through to Bedrock', async () => {
    // The control. Without this, every assertion above would also pass if the
    // route had started rejecting everything.
    mockItemType.value = 'narrative'
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"refinedText": "A refined answer."}' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 20 },
    })

    const { POST } = await import('@/app/api/refine-answer/route')
    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(mockCreate).toHaveBeenCalled()
  })

  it('allows an item whose item_type is missing entirely', async () => {
    // Defensive: a row predating D-021, or a partial select. The fallback
    // everywhere in this change is pre-D-021 behaviour, never a hard failure.
    mockItemType.value = null
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"refinedText": "A refined answer."}' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 20 },
    })

    const { POST } = await import('@/app/api/refine-answer/route')
    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
  })
})
