---
id: ADR-SEC-005
category: Security
status: Decided
---

# ADR-SEC-005 — API Rate Limiting

## Context

Grant Pathway exposes API routes for AI generation (Step 3 AI Summary, Step 4 Draft Answers). These routes call the Anthropic API and incur direct cost per call. Without rate limiting, a single user or a bad actor could trigger unlimited AI calls, resulting in uncontrolled cost.

A soft limit is already defined in the product: 50 AI requests per user per month (`ai_usage_log` table, PDR-AI-005). This is an application-level business rule. A separate technical rate limit may be needed to prevent abuse at the API layer.

## Options Considered

### Option A — Application-level rate limiting only (via `ai_usage_log` check)

- **What it is:** Before each AI API call, the server checks the `ai_usage_log` table for the current user's monthly count. If at 20, the request is rejected with a user-friendly message.
- **Strengths:** Already required by product spec (PDR-AI-005). Zero additional infrastructure. Sufficient for the expected user volume at launch.
- **Weaknesses:** Does not protect against rapid-fire requests within the limit (e.g., 20 requests in 60 seconds from a script). Does not protect non-AI routes.

### Option B — Vercel Edge Middleware rate limiting (IP-based)

- **What it is:** Next.js middleware using an in-memory or KV-backed counter per IP address, limiting requests per time window to all API routes.
- **Strengths:** Blocks automated abuse before it reaches the application. Protects all API routes.
- **Weaknesses:** Vercel KV (Upstash Redis) is an additional service and cost. IP-based limiting is less precise for users behind NAT. Adds implementation complexity.

### Option C — Upstash Redis rate limiting library (`@upstash/ratelimit`)

- **What it is:** Upstash provides a free-tier Redis instance and a rate limiting library designed for serverless/edge environments. Sliding window or fixed window algorithms.
- **Strengths:** Purpose-built for serverless rate limiting. Free tier covers low-volume use. Works in Next.js middleware.
- **Weaknesses:** Additional third-party dependency. Upstash free tier has limits on requests per day.

### Option D — No additional rate limiting (rely on Supabase Auth + usage log)

- **What it is:** Rely on authentication (unauthenticated users cannot call AI routes) and the monthly usage cap.
- **Strengths:** Zero additional infrastructure.
- **Weaknesses:** A compromised or malicious authenticated user can still make 20 AI calls rapidly.

## Decision

**Option C — Upstash Redis rate limiting (`@upstash/ratelimit`), implemented alongside the AI route build.**

Per-user rate limiting (keyed on `auth.uid()`) is applied to all AI API routes using a sliding window algorithm. The application-level 50 requests/month cap (ADR-AI-008) remains in place as a second layer of protection.

**Rate limit parameters:**

| Route                        | Limit      | Window     |
| ---------------------------- | ---------- | ---------- |
| `POST /api/generate-summary` | 5 requests | 60 seconds |
| `POST /api/refine-answer`    | 5 requests | 60 seconds |

This prevents rapid-fire automated requests within a user's monthly allowance while not inconveniencing a legitimate user who would never generate 5 summaries in 60 seconds.

**Implementation:**

- `@upstash/ratelimit` and `@upstash/redis` packages installed
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` added to environment variables (ADR-SEC-006)
- Rate limit check applied in each AI API route handler before the `ai_usage_log` check and Anthropic API call
- If the rate limit is exceeded, respond with HTTP 429 and the message: "Too many requests. Please wait a moment before trying again."
- Rate limiting is implemented alongside the AI route build — not as a standalone task

**Cost:** Upstash free tier (10,000 commands/day) covers all realistic v1 usage. Paid tier is $0.20 per 100,000 commands beyond the free tier.

## Consequences

- The `ai_usage_log` check is implemented in all AI API routes regardless of this decision.
- If Upstash is chosen, `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables are required.

## Source

PDR-AI-005, ADR-AI-008, NFR-04 (Security).

## Date Decided

2026-04-21

## Revision History

| Date       | Change                                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-17 | Monthly cap raised from 20 → 50 across all three AI routes (`generate-summary`, `generate-draft`, `refine-answer`) to align with product usage patterns. `generate-draft` was the last route still at 20; updated to match. |
