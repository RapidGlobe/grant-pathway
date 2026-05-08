---
id: ADR-AI-001
category: AI Integration
status: Decided
---

# ADR-AI-001 — AI Provider

## Context

Grant Pathway's core value proposition relies on AI generation of two outputs: a structured summary of funder guidelines, and draft application answers. The AI provider must produce high-quality, well-structured text for a charity-sector audience. Quality, reliability, and cost are the primary selection criteria.

## Options Considered

- **Option A — Anthropic Claude API:** Claude is known for high-quality, well-structured long-form text generation. Strong performance on document summarisation and instructed writing tasks. Competitive pricing on Claude 3 Haiku for cost-sensitive operations.
- **Option B — OpenAI GPT-4o / GPT-4o-mini:** The market leader. Extensive documentation. GPT-4o-mini is very cost-effective. Excellent general-purpose capabilities.
- **Option C — Google Gemini API:** Competitive with GPT-4o and Claude 3. Gemini 1.5 Pro has a very large context window, useful for long funder guidelines.
- **Option D — Open-source models (Llama 3 via Groq or similar):** Very low cost. Requires more prompt engineering. Quality may be lower for structured writing tasks. Self-hosting complexity.

## Decision

**Option A — Anthropic Claude, delivered via Amazon Bedrock (eu-west-2).**

Anthropic Claude is the AI model for all generation tasks in Grant Pathway. The model is accessed through Amazon Bedrock in the eu-west-2 (London) region, not the Anthropic direct API. This keeps all AI processing within the UK/EEA (DR-AI-002, DR-DP-002).

## Rationale

- Claude's instruction-following and structured text generation are well-suited to the grant writing domain.
- Claude is particularly strong at summarising long documents while preserving nuance — important for funder guidelines that contain specific eligibility criteria.
- Amazon Bedrock provides the same Claude model with UK-region (eu-west-2) In-Region inference, satisfying the data residency requirement (C13, DR-DP-002).
- No Anthropic DPA or SCCs required — AI processing does not leave the UK/EEA.
- Product decision PDR-AI-001 specifies Anthropic Claude Sonnet 4.6.

## Consequences

- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=eu-west-2`) must be configured in all environments (ADR-SEC-006).
- The `@anthropic-ai/sdk` package is used with its `AnthropicBedrock` client, or the `@aws-sdk/client-bedrock-runtime` AWS SDK may be used directly.
- The Bedrock model identifier format differs from the direct API: `anthropic.claude-sonnet-4-6` (In-Region) or `eu.anthropic.claude-sonnet-4-6` (Geo EU fallback).
- Model selection is a separate decision (ADR-AI-002) — the provider choice does not mandate a specific model.
- Bedrock or AWS outages will prevent AI generation. An appropriate error message must be shown (ADR-AI-009).

## Review Note (2026-05-07)

Originally decided as direct Anthropic Claude API with `ANTHROPIC_API_KEY`. Changed to Amazon Bedrock eu-west-2 delivery to achieve UK data residency (DR-AI-002, DR-DP-002). Model, quality, and base pricing are unchanged.

## Source

Product Decision PDR-AI-001, DR-AI-002, DR-DP-002.

## Date Decided

2026-04-17
