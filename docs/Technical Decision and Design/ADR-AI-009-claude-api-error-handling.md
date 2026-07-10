---
id: ADR-AI-009
category: AI Integration
status: Decided
---

# ADR-AI-009 — Claude API Error Handling

## Context

AI generation is the critical path in Grant Pathway. The Amazon Bedrock Claude API can fail for several reasons: network timeout, rate limiting (429), server errors (500/529), invalid request (400), or an unexpected response format (malformed JSON in Step 4 output). Users must receive clear, helpful error messages when generation fails — not a blank screen or a technical error code.

## Options Considered

### Option A — Retry with exponential backoff, then user-facing error

- **What it is:** If the API call fails with a transient error (429, 500, 529), the route retries up to 2 times with exponential backoff (1s, 3s delay). If all retries fail, a user-facing error is returned.
- **Strengths:** Handles transient failures transparently. Most 429 and 500 errors are short-lived.
- **Weaknesses:** Adds latency on failure (up to 4s of retry delay). Must not retry non-transient errors (400, invalid request).

### Option B — Single attempt, immediate error on failure

- **What it is:** No retries. If the API call fails, an error is immediately returned to the user.
- **Strengths:** Simplest. Fastest to surface genuine errors.
- **Weaknesses:** Transient failures (brief API blip) result in a user-visible error that could have been resolved with a retry.

### Option C — Client-side retry button (no server retry)

- **What it is:** On failure, the user is shown an error with a "Try again" button. The server does not retry automatically.
- **Strengths:** User is in control. No hidden retry delay.
- **Weaknesses:** Requires the user to actively retry, which may be confusing.

### Option D — Comprehensive error handling with user-specific messages per error type

- **What it is:** Different error messages for different failure types: "Our AI service is busy — please try again in a moment" (429/503), "Something went wrong with your request" (400), "Generation failed — please try again" (500).
- **Strengths:** Best user experience. Error messages are actionable.
- **Weaknesses:** More implementation effort. Must map all error types to user messages.

## Decision

**Option B — Retry transient errors with exponential backoff, with typed user-facing error messages per failure type.**

A shared utility `lib/ai-error-handler.ts` wraps all Anthropic API calls. AI routes do not implement retry logic inline — they call through this wrapper.

**Retry behaviour:**

- Transient errors (HTTP 429, 500, 529): retry up to 2 times with delays of 1s then 3s
- Non-transient errors (HTTP 400, authentication errors): no retry — surface immediately
- Step 3 (`/api/generate-summary`) JSON parse failure: one automatic retry of the full API call (with a stricter prompt) before surfacing as an error
- Step 4 (`/api/refine-answer`) JSON parse failure: **no retry** — the AI usage slot is cancelled (`cancel_ai_slot`) and a `parse_error` is returned immediately

**Error message mapping:**

| Error type                             | User-facing message                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 429 Rate Limit (after retries)         | "Our AI service is a little busy right now. Please try again in a few minutes."                 |
| 500 / 529 Server Error (after retries) | "Something went wrong with our AI service. Please try again."                                   |
| 400 Bad Request                        | "We couldn't process your request. Please check your inputs and try again."                     |
| Function timeout                       | "AI generation is taking longer than expected. Please try again."                               |
| JSON parse failure (after retry)       | "We had trouble formatting your draft answers. Please try again."                               |
| Usage limit reached                    | "You have reached your monthly AI request limit. Your limit resets at the start of next month." |

_Note (2026-07-10): "after retry" in the JSON parse failure row applies to `/api/generate-summary` only. `/api/refine-answer` shows this same message on the first parse failure, with no retry — see the corrected retry behaviour above._

**Progress bar error state (ADR-AI-005):** On error, the bar stops at its current position. The staged message is replaced by the error message. A "Try again" button appears inline — the user is not sent back to a previous step.

**Usage tracking:** `ai_usage_log` rows are inserted only on a successful API response. A failed request does not consume the user's monthly quota.

**SDK retry:** The SDK's built-in `maxRetries` option is not used — the custom wrapper provides control over which errors are retried and what the user sees.

## Consequences

- A shared error handling wrapper should be created for all AI API routes.
- Error responses from AI routes must use consistent HTTP status codes and JSON error shapes so the client can display the right message.
- Monitoring (ADR-OPS-005) should track the frequency and types of AI API errors.

## Source

ADR-AI-001, ADR-AI-005, ADR-AI-008, NFR-01.

## Date Decided

2026-04-21

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Corrected the Usage limit reached row twice today: first a partial fix (stale "20 of your AI requests" → "50"), then found — on checking the actual implemented message in `lib/ai-error-handler.ts` — that no version of this quoted message (with either 20 or 50, or a specific reset date) exists in the live code at all. Replaced with the real message the code shows: "You have reached your monthly AI request limit. Your limit resets at the start of next month." This message doesn't name the request count or a specific date; if surfacing the count/date is still wanted, that would need a code change, not a doc fix — flagged as an open product question, not resolved here. |
| 2026-07-10 | Corrected the "Step 4 JSON parse failure: one automatic retry" bullet. Verified against the live `app/api/refine-answer/route.ts`: on JSON parse/Zod validation failure, the route calls `cancel_ai_slot` and returns a `parse_error` immediately — there is no retry. The one-retry-then-stricter-prompt behaviour actually exists on `/api/generate-summary` (Step 3), not `/api/refine-answer` (Step 4). Split the single bullet into separate Step 3 and Step 4 lines and added a clarifying note under the error message mapping table.                                                                                                                                                      |
