---
id: ADR-AI-008
category: AI Integration
status: Decided
---

# ADR-AI-008 — AI Usage Tracking and Cost Controls

## Context

Grant Pathway calls the Amazon Bedrock Claude API, which charges per token. Without usage controls, a single power user or API abuse could generate unlimited costs. The product must enforce a per-user monthly limit and track usage for operational monitoring.

## Options Considered

- **Option A — Hard limit in application code:** Check `ai_usage_log` before each AI call. If the user has reached 50 requests this month, reject the request with a user-friendly message.
- **Option B — Amazon Bedrock spend limits only:** Configure a monthly spend cap in the AWS console. No application-level tracking.
  - Weaknesses: Provides no per-user granularity. All users share the cap. Does not produce usage data for product analytics.
- **Option C — Per-user soft limit with override:** Users can exceed 50 requests but see a warning. No hard block.
  - Weaknesses: Cost unpredictability.
- **Option D — Paid tier for higher limits:** Charge users who need more than 50 requests.
  - Not in v1 scope (product is free tier).

## Decision

**Option A — Hard 50 AI requests per user per month, tracked in the `ai_usage_log` table.**

Before each AI API call, the server counts the user's requests in `ai_usage_log` for the current calendar month. If the count is 50 or more, the request is rejected with a user-friendly message: "You have reached your monthly AI request limit. Your limit resets at the start of next month." (matching the live message in `lib/ai-error-handler.ts` — see this ADR's 2026-07-10 revision).

A successful AI call inserts a row into `ai_usage_log` after the response is returned.

An Amazon Bedrock / AWS console spend cap should also be configured as a secondary safety net.

## Rationale

- 50 requests per month is sufficient for typical charity grant writing activity. The original "2 requests per application: 1 summary + 1 draft" derivation (supports 25 applications/month) assumed the abandoned auto-generated-draft model (superseded 2026-05-28 by the charity-authored Q&A model — see `ADR-AI-003`/`ADR-AI-004`). Under the current model, AI usage per application is 1 guideline summary (Step 3) plus zero or more optional per-question "refine my answer" calls (Step 4) — a variable count, not a fixed 2. 50/month remains a reasonable round-number cap for typical usage; it is no longer precisely derivable from a fixed per-application request count.
- Application-level tracking provides per-user visibility and per-month analytics.
- Product Decision PDR-AI-005 specifies this limit.
- Hard limit prevents runaway costs during the free product phase.
- Both application-level and AWS console spend limits provide defence-in-depth.

## Consequences

- Every AI API route must check `ai_usage_log` count before calling Anthropic.
- Every successful AI API response must insert a row into `ai_usage_log`.
- The dashboard should show the user their current month's usage (e.g., "12 of 50 AI requests used this month").
- RLS on `ai_usage_log`: users can insert their own rows and select their own rows. No update or delete.
- An Amazon Bedrock / AWS console monthly spend cap should be set (e.g., $50) as a failsafe.

## Source

Product Decision PDR-AI-005, ADR-DATA-001 (ai_usage_log table).

## Date Decided

2026-04-17

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Corrected stale "20 requests/month" figures to 50 throughout Options, Decision, Rationale, and Consequences. This is a factual catch-up, not a reversal: the monthly cap was raised from 20 → 50 across all three AI routes on 2026-06-17 — see `ADR-SEC-005`'s Revision History for that change, which this ADR had never been updated to reflect. On a second pass the same day: the quoted "Usage limit reached" message didn't match any version actually implemented in `lib/ai-error-handler.ts` — replaced with the real message. The Rationale's "2 requests per application: 1 summary + 1 draft" derivation (and its "25 applications/month" conclusion) assumed the abandoned auto-generated-draft model — corrected to describe the current variable per-application usage (1 summary + optional per-question refine calls) instead of a fixed count. |
