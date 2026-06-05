// AI error handler — shared utilities for all AI API routes (S5.3, ADR-AI-009)
//
// Provides:
//   withRetry()           — wraps a Bedrock call with 2 retries for transient errors
//   classifyBedrockError  — maps SDK exceptions to typed AiErrorCode
//   httpStatusForError    — HTTP status to return per error type (GAP-04)
//   aiErrorBody           — consistent JSON response shape for AI errors (GAP-04)
//
// Consistent HTTP status codes and error body shape (GAP-04):
//
//   429  usage_limit    — user's 20/month app-level cap reached
//   429  rate_limited   — per-minute Upstash burst limit hit
//   503  overloaded     — Bedrock returned 529 (service overloaded)
//   503  timeout        — request timed out waiting for Bedrock
//   500  server_error   — Bedrock returned 5xx
//   500  parse_error    — response was not valid JSON
//   500  auth_error     — Bedrock access/credentials error
//   500  unknown        — unexpected error
//
// Retry policy (per spec S5.3):
//   Retries 2× (total 3 attempts) for HTTP 429, 500, and 529.
//   No retry for 400 / 401 / 403 — these indicate a configuration problem
//   that will not resolve on retry.
//   Delays: 1 000 ms before attempt 2, 3 000 ms before attempt 3.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AiErrorCode =
  | 'usage_limit' // App-level 20/month cap
  | 'rate_limited' // Per-minute burst limit
  | 'overloaded' // Bedrock 529
  | 'timeout' // Request timed out
  | 'server_error' // Bedrock 5xx
  | 'parse_error' // JSON parse failed
  | 'auth_error' // Bedrock auth failure
  | 'unknown' // Anything else

// ---------------------------------------------------------------------------
// HTTP status mapping (GAP-04)
// ---------------------------------------------------------------------------

/**
 * Maps an AI error code to the HTTP status the API route should return.
 * All AI routes use this function so the status codes are consistent (GAP-04).
 */
export function httpStatusForError(code: AiErrorCode): number {
  switch (code) {
    case 'usage_limit':
    case 'rate_limited':
      return 429
    case 'overloaded':
    case 'timeout':
      return 503
    default:
      return 500
  }
}

// ---------------------------------------------------------------------------
// Consistent error response body (GAP-04)
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<AiErrorCode, string> = {
  usage_limit:
    'You have reached your monthly AI request limit. Your limit resets at the start of next month.',
  rate_limited: 'Too many requests. Please wait a moment before trying again.',
  overloaded: 'The AI service is busy right now. Please try again in a moment.',
  timeout: 'The request took too long. Please try again.',
  server_error: 'The AI service returned an error. Please try again.',
  parse_error: 'We could not read the AI response. Please try again.',
  auth_error: 'AI service configuration error. Please contact support.',
  unknown: 'An unexpected error occurred. Please try again.',
}

/**
 * Returns a consistent JSON error body for AI route responses (GAP-04).
 * All AI routes must use this function rather than writing ad-hoc messages.
 */
export function aiErrorBody(code: AiErrorCode): { error: AiErrorCode; message: string } {
  return { error: code, message: ERROR_MESSAGES[code] }
}

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

/**
 * Classifies a caught error from the Bedrock SDK into a typed AiErrorCode.
 * Checks the `.status` property set by `@anthropic-ai/bedrock-sdk` on
 * APIStatusError instances, and falls back to 'unknown' for anything else.
 */
export function classifyBedrockError(err: unknown): AiErrorCode {
  if (err && typeof err === 'object') {
    const status = (err as { status?: number }).status
    if (status === 429) return 'rate_limited'
    if (status === 529) return 'overloaded'
    if (status === 500) return 'server_error'
    if (status === 401 || status === 403) return 'auth_error'
    if (status !== undefined && status >= 400 && status < 500) return 'auth_error'
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('timeout') || msg.includes('timed out')) return 'timeout'
    if (msg.includes('connect') || msg.includes('network')) return 'timeout'
  }
  return 'unknown'
}

// ---------------------------------------------------------------------------
// Retry wrapper
// ---------------------------------------------------------------------------

const RETRY_DELAYS_MS = [1_000, 3_000] // 1 s before attempt 2, 3 s before attempt 3

/**
 * Returns true for error types that may resolve on retry.
 * 400/401/403 (auth/config errors) are not retried — they will not resolve.
 */
function isRetryable(code: AiErrorCode): boolean {
  return (
    code === 'rate_limited' ||
    code === 'overloaded' ||
    code === 'server_error' ||
    code === 'timeout'
  )
}

/**
 * Calls `fn` up to 3 times (1 initial + 2 retries) for transient errors.
 *
 * On success: returns the resolved value.
 * On failure after all attempts: throws the last error.
 *
 * Usage in API routes:
 * ```
 * const response = await withRetry(() =>
 *   client.messages.create({ model: MODEL, ... })
 * )
 * ```
 */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt - 1])
    }

    try {
      return await fn()
    } catch (err) {
      lastError = err
      const code = classifyBedrockError(err)

      // Do not retry non-transient errors
      if (!isRetryable(code)) throw err

      // On last attempt, throw instead of looping
      if (attempt === 2) throw err
    }
  }

  throw lastError
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
