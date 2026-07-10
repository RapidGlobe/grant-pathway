---
id: ADR-AI-002
category: AI Integration
status: Decided
---

# ADR-AI-002 — AI Model Selection

## Context

Anthropic offers multiple Claude models with different capability and cost profiles. Grant Pathway uses AI for two distinct tasks with different complexity requirements:

1. **Step 3 — AI Summary:** Summarise and structure funder guidelines. Medium complexity — requires good document comprehension and structured output.
2. **Step 4 — Draft Answers:** Write draft answers to multiple application questions using charity profile + AI summary as context. High complexity — requires instructed writing, charity voice matching, and word limit awareness.

The model selection must balance output quality against per-request cost, within the 50 requests/user/month limit (PDR-AI-005). All models are accessed via Amazon Bedrock eu-west-2 (ADR-AI-001).

## Options Considered

| Model             | Context window | Relative cost | Quality |
| ----------------- | -------------- | ------------- | ------- |
| Claude Opus 4.7   | 200K tokens    | High          | Highest |
| Claude Sonnet 4.6 | 1M tokens      | Medium        | High    |
| Claude Haiku 4.5  | 200K tokens    | Low           | Good    |

- **Option A — Claude Sonnet 4.6 for all tasks:** High quality across both tasks. Moderate cost. 1M token context window. Appropriate for a product focused on output quality.
- **Option B — Claude Haiku 4.5 for summary, Claude Sonnet 4.6 for draft:** Cost-optimised. Uses the cheaper model for the simpler summarisation task.
- **Option C — Claude Sonnet 4.6 for summary, Claude Haiku 4.5 for draft:** Prioritises summary quality (the basis for everything downstream) and uses a lighter model for drafting.
- **Option D — Claude Opus 4.7 for all tasks:** Highest quality. Highest cost. Not justified at this scale.

## Decision

**Claude Sonnet 4.6 is used for both Step 3 (AI Summary) and Step 4 (Draft Answers).**

Bedrock model identifier: `anthropic.claude-sonnet-4-6` (In-Region eu-west-2) / `eu.anthropic.claude-sonnet-4-6` (Geo EU fallback).

Model selection should be reviewed periodically as Anthropic releases new models. The model identifier is defined in `lib/prompts.ts` (ADR-AI-003) and can be updated without structural code changes.

## Rationale

- The quality of the AI summary directly affects the quality of draft answers — a low-quality summary produces low-quality drafts. Using the same capable model for both maintains consistency.
- Claude Sonnet 4.6 provides the best balance of quality and cost for the use case, with a 1M token context window that eliminates any practical concern about long funder guidelines.
- PDR-AI-001 specifies Claude Sonnet 4.6.
- The 50 requests/month limit means the absolute monthly cost per user is bounded regardless of model choice.

## Consequences

- The model identifier (`anthropic.claude-sonnet-4-6`) is stored in `lib/prompts.ts` as a constant `MODEL`.
- If a newer Claude model is released, updating the constant in `lib/prompts.ts` updates both generation tasks simultaneously.
- Bedrock model identifiers use a fixed format without date stamps; model behaviour is versioned by AWS/Anthropic on the Bedrock platform.

## Review Note (2026-05-07)

Originally decided as Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`) accessed via the direct Anthropic API. Updated to Claude Sonnet 4.6 via Amazon Bedrock eu-west-2 (PDR-AI-001 revision, DR-AI-002). Context window increased from 200K to 1M tokens. Pricing comparable.

## Source

Product Decision PDR-AI-002.

## Date Decided

2026-04-17

## Revision History

| Date       | Change                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-10 | Corrected stale "20 requests/user/month" figure to 50 in Context and Rationale. The monthly cap was raised from 20 → 50 across all three AI routes on 2026-06-17 — see `ADR-SEC-005`'s Revision History for that change; this ADR had never been updated to match. |
