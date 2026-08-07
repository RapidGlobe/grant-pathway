// GAP-52 — a truncated AI response must not be treated as a parse failure.
//
// On 2026-08-07, GAP-51's new extraction rule asked the model for two more
// budget cards and the Step 3 summary began failing with "We couldn't generate
// your summary right now. This is usually temporary — please try again."
//
// It was not temporary, and the retry could not succeed. The model had hit
// `SUMMARY_MAX_TOKENS` and returned JSON cut off mid-structure; the route
// classified that as a parse failure and re-asked with the identical ceiling,
// which overflowed identically. Two Bedrock calls to fail the same way twice,
// and a user-facing button offering a third.
//
// The ceiling itself had been running with almost no headroom and nothing said
// so. `ai_usage_log` stores only input+output combined, and the route logged
// only that same combined figure — so establishing the cause took reconstructing
// it across two days of usage rows. `stop_reason` was available on every
// response the whole time and was never read.
//
// These tests cover the two halves separately: the error taxonomy (a pure
// function, tested directly) and the route/component wiring (a source scan,
// for the same reason ai-route-sentry-tagging.test.ts uses one — the behaviour
// lives inside a route handler that would need Supabase, Upstash and Bedrock
// all mocked to exercise, and there is no pure function to extract).

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { aiErrorBody, httpStatusForError, type AiErrorCode } from '@/lib/ai-error-handler'

function read(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const ROUTE = 'app/api/generate-summary/route.ts'
const STEP3 = 'components/application-step3-summary.tsx'

describe('GAP-52 — response_too_long is its own error code', () => {
  it('is distinct from parse_error', () => {
    // The whole point. Both produce unparseable JSON; only one is worth
    // retrying, and collapsing them is what produced a dead-end retry button.
    expect(aiErrorBody('response_too_long').error).toBe('response_too_long')
    expect(aiErrorBody('response_too_long').message).not.toBe(aiErrorBody('parse_error').message)
  })

  it('does not tell the user to try again', () => {
    // A retry against the same ceiling overflows the same way every time.
    // parse_error may legitimately clear on a retry and still says so.
    const message = aiErrorBody('response_too_long').message
    expect(message.toLowerCase()).not.toContain('try again')
    expect(aiErrorBody('parse_error').message.toLowerCase()).toContain('try again')
  })

  it('tells the user it is our limit, not their document', () => {
    // They uploaded a perfectly valid form. Blaming the document would send
    // them off editing a file that is not the problem.
    const message = aiErrorBody('response_too_long').message
    expect(message).toMatch(/limit on our side/i)
    expect(message).toMatch(/support/i)
  })

  it('returns 500, like the other server-side AI faults', () => {
    expect(httpStatusForError('response_too_long')).toBe(500)
  })

  it('every error code still has a message', () => {
    // Guards the actual mechanism of adding a code: ERROR_MESSAGES is a
    // Record<AiErrorCode, string>, so a missing entry is a type error — but
    // only if the code is in the union. This catches an entry added to the
    // union and forgotten in the map via a widened cast.
    const codes: AiErrorCode[] = [
      'usage_limit',
      'rate_limited',
      'overloaded',
      'timeout',
      'server_error',
      'parse_error',
      'response_too_long',
      'auth_error',
      'unknown',
    ]
    for (const code of codes) {
      expect(aiErrorBody(code).message.length).toBeGreaterThan(10)
    }
  })
})

describe('GAP-52 — the route detects truncation before it parses', () => {
  it('checks stop_reason for max_tokens', () => {
    expect(read(ROUTE)).toMatch(/stop_reason === 'max_tokens'/)
  })

  it('bails out rather than retrying', () => {
    // The retry re-asks with the same max_tokens. Against a truncation it
    // cannot produce a shorter answer, so it only spends a second Bedrock call.
    const src = read(ROUTE)
    const truncationCheck = src.indexOf("stop_reason === 'max_tokens'")
    const retryWarning = src.indexOf('JSON parse/validation failed on first attempt')
    expect(truncationCheck).toBeGreaterThan(-1)
    expect(retryWarning).toBeGreaterThan(-1)
    // The truncation guard must come first, or the doomed retry runs anyway.
    expect(truncationCheck).toBeLessThan(retryWarning)
  })

  it('checks truncation before parsing, not after', () => {
    // Truncated JSON occasionally still parses into a valid-looking object
    // that is silently missing questions — worse than a visible failure.
    const src = read(ROUTE)
    expect(src.indexOf("stop_reason === 'max_tokens'")).toBeLessThan(
      src.indexOf('rawParsed = JSON.parse(cleaned)'),
    )
  })

  it('returns the slot so a truncation is not charged to the monthly cap', () => {
    const src = read(ROUTE)
    const guard = src.indexOf("stop_reason === 'max_tokens'")
    const block = src.slice(guard, guard + 1400)
    expect(block).toContain('cancel_ai_slot')
    expect(block).toContain('response_too_long')
  })

  it('tags the truncation for Sentry, like every other AI failure (GAP-21)', () => {
    const src = read(ROUTE)
    const guard = src.indexOf("stop_reason === 'max_tokens'")
    expect(src.slice(guard, guard + 1400)).toMatch(/ai_error: 'response_too_long'/)
  })
})

describe('GAP-52 — the diagnostics that would have made this a one-look answer', () => {
  it('logs input and output tokens separately, not just the total', () => {
    // ai_usage_log stores only the combined figure. When the route logged the
    // same combined figure, nothing anywhere recorded how much of it was
    // output — the one number that mattered.
    const src = read(ROUTE)
    expect(src).toMatch(/usage\?\.input_tokens/)
    expect(src).toMatch(/usage\?\.output_tokens/)
  })

  it('logs the output ceiling next to the output count', () => {
    // "3958 tokens" means nothing on its own. "3958/4000" is the whole story.
    // [\s\S] rather than the `s` flag: tsconfig targets below es2018.
    expect(read(ROUTE)).toMatch(/output_tokens[\s\S]*\}\/\$\{SUMMARY_MAX_TOKENS\}/)
  })

  it('logs stop_reason', () => {
    expect(read(ROUTE)).toMatch(/stop_reason: \$\{bedrockResponse\.stop_reason\}/)
  })
})

describe('GAP-52 — Step 3 offers no retry it cannot honour', () => {
  it('has a dedicated too-long display state', () => {
    expect(read(STEP3)).toMatch(/\| 'too-long'/)
  })

  it('routes response_too_long to it, bypassing the retry ladder', () => {
    const src = read(STEP3)
    expect(src).toMatch(/data\.error === 'response_too_long'/)
    // Must return before reaching the failure/persistent-failure assignment,
    // which exists to give the user a second attempt.
    const branch = src.indexOf("data.error === 'response_too_long'")
    const ladder = src.indexOf("setDisplayState(isRetry ? 'persistent-failure' : 'failure')")
    expect(branch).toBeGreaterThan(-1)
    expect(branch).toBeLessThan(ladder)
  })

  it('renders no Try again button in that state', () => {
    const src = read(STEP3)
    const start = src.indexOf("if (displayState === 'too-long')")
    expect(start).toBeGreaterThan(-1)
    const block = src.slice(start, src.indexOf("if (displayState === 'persistent-failure')", start))
    expect(block).not.toContain('handleTryAgain')
    expect(block).not.toContain('Try again')
  })

  it('reassures the user their guidelines are not lost', () => {
    const src = read(STEP3)
    const start = src.indexOf("if (displayState === 'too-long')")
    const block = src.slice(start, src.indexOf("if (displayState === 'persistent-failure')", start))
    expect(block).toMatch(/saved/i)
  })
})
