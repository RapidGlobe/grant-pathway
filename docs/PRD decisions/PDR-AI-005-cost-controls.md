---
id: PDR-AI-005
category: AI Integration
status: Decided
---

# PDR-AI-005 — AI Cost Controls

## Question
Will there be a limit on the number of AI requests a single user can make per day or per session, and if so, what happens when they reach that limit?

## Context
The £100/month running cost budget (C1) is the binding constraint on AI usage. Each call to the Claude API costs a small amount per token (input and output). With no usage limits, a single heavy user — or a small number of power users — could consume the entire monthly budget. Conversely, overly restrictive limits could frustrate users and undermine the value of the product. The right balance needs to reflect realistic usage patterns (David writes 8-12 applications per year; each application has multiple questions), the cost per API call for the chosen model (PDR-AI-001), and the expected number of active users at launch (~10 concurrent, NFR-03). The user experience when a limit is reached must also be defined — a clear, non-alarming message is essential.

## Options
- **Option A — No limits:** No per-user restrictions. Simplest to implement but leaves the service exposed to cost spikes as user numbers grow.
- **Option B — Hard daily limit per user:** Fixed number of AI requests per day per user. Predictable but arbitrary for grant writing workflows and could frustrate legitimate users.
- **Option C — Soft monthly limit with warning, tracked in Supabase:** A generous monthly AI request allowance per user tracked in a dedicated `ai_usage` table. A soft warning appears as the user approaches the limit; a friendly message is shown when it is reached. A spend cap on the Anthropic dashboard acts as a backstop.
- **Option D — Platform-level spend cap only:** Monthly spend cap set in the Anthropic API dashboard only. Zero implementation effort but a blunt instrument — one user's overuse stops AI features for all users with no per-user warning.

## Decision
**Option C — Per-user monthly limit tracked in Supabase, with Anthropic dashboard spend cap as a backstop.**

### Implementation
A dedicated `ai_usage` table in Supabase will record each AI request with the following fields: `user_id`, `request_type` (summarise / generate), `timestamp`, and `token_count` (returned by the API).

Before each AI request, the application will:
1. Query `ai_usage` for the user's request count in the current calendar month
2. If count is at or above 80% of the limit (e.g. 16 of 20), display a soft advisory banner: *"You've used most of your monthly AI allowance."*
3. If count has reached the limit, disable AI action buttons and display: *"You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch."*

### Monthly limit
**20 AI requests per user per month** for v1. This is well above the realistic usage of any single user (David's persona writes 8–12 applications per year, each requiring 2 AI calls — approximately 2 requests per month). The limit will be reviewed post-launch based on actual usage data.

### Backstop
A monthly spend cap will also be configured in the Amazon Bedrock / AWS console to prevent runaway costs in the event of an unforeseen spike. This acts as a secondary safety net only — the primary control is the per-user in-app limit.

## Rationale
At launch scale (~10 concurrent users), AI costs are estimated at £5–£10/month — well within the £100/month budget (C1). However, usage controls protect against unexpected growth or abuse without inconveniencing legitimate users. A monthly cadence matches how grant writing actually works. Tracking usage in Supabase provides per-user visibility, enables the graceful soft-warning experience, and produces data that will inform future limit adjustments. The Amazon Bedrock spend cap provides a hard backstop that requires no application code.

## Date Decided
2026-04-16
