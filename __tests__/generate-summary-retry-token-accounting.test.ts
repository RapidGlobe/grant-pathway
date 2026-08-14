// GAP-95 — generate-summary's JSON-reprompt-parse-error retry never added
// its own token usage to any total, combined or split. Found while wiring
// up GAP-93's input/output split (the eligibility-mismatch confirmation
// retry, confirmResponse, already accumulated correctly; the parse-error
// retry, retryResponse, did not). This test forces the retry path with a
// real (mocked) second Bedrock call and asserts the final committed totals
// include both calls' usage, not just the first.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

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

const VALID_SUMMARY = {
  funder_type: 'structured',
  aboutGrant: 'A small grants programme.',
  amount: '£500-£2,000',
  whoCanApply: ['Community groups'],
  lookingFor: ['Community projects'],
  questions: [{ number: 1, text: 'What is your project?', is_budget_question: false }],
  keyRequirements: ['Must be a UK charity'],
}

describe('GAP-95 — the JSON-reprompt retry’s token usage is counted', () => {
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
      return Promise.resolve({ data: null, error: null })
    })
  })

  it('sums both calls into the committed token_count, input, and output totals', async () => {
    // First call: unparseable JSON, forces the reprompt retry.
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'not valid json at all' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 4000, output_tokens: 100 },
    })
    // Second call (the retry): valid JSON.
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(VALID_SUMMARY) }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 4200, output_tokens: 300 },
    })

    const { POST } = await import('@/app/api/generate-summary/route')
    const response = await POST(makeRequest(VALID_BODY))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.summary.funder_type).toBe('structured')
    expect(mockCreate).toHaveBeenCalledTimes(2)

    expect(mockRpc).toHaveBeenCalledWith(
      'update_ai_slot_token_count',
      expect.objectContaining({
        p_log_id: 'log-1',
        p_user_id: 'user-1',
        p_token_count: 4000 + 100 + 4200 + 300,
        p_input_token_count: 4000 + 4200,
        p_output_token_count: 100 + 300,
      }),
    )
  })
})
