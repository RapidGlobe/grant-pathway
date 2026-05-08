---
id: ADR-AI-008
category: AI Integration
status: Decided
---

# ADR-AI-008 — AI Usage Tracking and Cost Controls

## Context

Grant Pathway calls the Amazon Bedrock Claude API, which charges per token. Without usage controls, a single power user or API abuse could generate unlimited costs. The product must enforce a per-user monthly limit and track usage for operational monitoring.

## Options Considered

- **Option A — Hard limit in application code:** Check `ai_usage_log` before each AI call. If the user has reached 20 requests this month, reject the request with a user-friendly message.
- **Option B — Amazon Bedrock spend limits only:** Configure a monthly spend cap in the AWS console. No application-level tracking.
  - Weaknesses: Provides no per-user granularity. All users share the cap. Does not produce usage data for product analytics.
- **Option C — Per-user soft limit with override:** Users can exceed 20 requests but see a warning. No hard block.
  - Weaknesses: Cost unpredictability.
- **Option D — Paid tier for higher limits:** Charge users who need more than 20 requests.
  - Not in v1 scope (product is free tier).

## Decision

**Option A — Hard 20 AI requests per user per month, tracked in the `ai_usage_log` table.**

Before each AI API call, the server counts the user's requests in `ai_usage_log` for the current calendar month. If the count is 20 or more, the request is rejected with a user-friendly message: "You've used all 20 of your AI requests this month. Your allowance resets on [date]."

A successful AI call inserts a row into `ai_usage_log` after the response is returned.

An Amazon Bedrock / AWS console spend cap should also be configured as a secondary safety net.

## Rationale

- 20 requests per month is sufficient for typical charity grant writing activity (2 requests per application: 1 summary + 1 draft). Supports up to 10 applications per month per user.
- Application-level tracking provides per-user visibility and per-month analytics.
- Product Decision PDR-AI-005 specifies this limit.
- Hard limit prevents runaway costs during the free product phase.
- Both application-level and AWS console spend limits provide defence-in-depth.

## Consequences

- Every AI API route must check `ai_usage_log` count before calling Anthropic.
- Every successful AI API response must insert a row into `ai_usage_log`.
- The dashboard should show the user their current month's usage (e.g., "12 of 20 AI requests used this month").
- RLS on `ai_usage_log`: users can insert their own rows and select their own rows. No update or delete.
- An Amazon Bedrock / AWS console monthly spend cap should be set (e.g., $50) as a failsafe.

## Source

Product Decision PDR-AI-005, ADR-DATA-001 (ai_usage_log table).

## Date Decided

2026-04-17
