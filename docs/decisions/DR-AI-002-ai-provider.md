---
id: DR-AI-002
category: AI Strategy
status: Decided
supersedes: 2026-04-09 decision
---

# DR-AI-002 — AI Provider

## Question

Which AI provider or providers will power the app?

## Context

The choice of AI provider affects capability, cost, data privacy, reliability, and vendor lock-in. Anthropic's Claude models, OpenAI's GPT models, and open-source models (e.g. Llama) each have different strengths, pricing structures, and data handling policies. For a charity-facing app handling potentially sensitive organisational data, data privacy commitments matter. The delivery mechanism — whether models are accessed via a provider's direct API or via a cloud platform such as Amazon Bedrock — affects where data is processed and therefore the compliance position under UK GDPR. Cost per API call affects the sustainability of a free-to-use model.

## Options

- **Option A: Anthropic Claude via direct API** — Use Claude models via the Anthropic API; data processed on Anthropic's US infrastructure
- **Option A2: Anthropic Claude via Amazon Bedrock** — Use the same Claude models delivered through Amazon Bedrock; data processing geography controlled by AWS region and routing configuration
- **Option B: OpenAI GPT** — Use GPT-4o or similar via the OpenAI API
- **Option C: Open-source models (self-hosted)** — Run open-source models (e.g. Llama) on own infrastructure for maximum data control
- **Option D: Multi-provider** — Use more than one provider, e.g. different models for different tasks
- **Option E: UK/EU-based provider** — Prioritise a provider with UK or EU data centres for data residency compliance

## Decision

**Option A2: Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2, In-Region)** — The app will be powered by Anthropic's Claude Sonnet 4.6 model, accessed through Amazon Bedrock using In-Region routing in AWS eu-west-2 (London) as the primary configuration, with EU Geo routing (`eu.anthropic.claude-sonnet-4-6`) as the operational fallback.

## Rationale

The model selection rationale from the original decision remains unchanged. Claude Sonnet 4.6 is the strongest fit for the two capabilities decided in DR-AI-001 — its 1M token context window handles lengthy funder guidelines comfortably for summarisation, and its writing quality for structured professional content is excellent. It is also significantly more capable than Haiku 4.5 for reasoning-heavy writing tasks (15–20% performance gap on structured professional content) and has a 5x larger context window (1M vs 200k tokens), making it the appropriate choice for this use case.

The change from the original decision is the delivery mechanism. Amazon Bedrock (eu-west-2) rather than the Anthropic direct API is used in order to achieve UK data residency for AI inference, consistent with the data hosting position in DR-DP-002. Claude Sonnet 4.6 supports In-Region routing in eu-west-2 (London), meaning inference requests are processed strictly within the UK under normal operating conditions. The model, its capabilities, and its pricing are identical to the direct API — Bedrock does not mark up base token rates for In-Region routing.

A single provider and model remains sufficient for v1. Multi-provider optimisation can be revisited in future phases.

## Pricing

- Input: $3.00 per million tokens
- Output: $15.00 per million tokens
- No cross-region surcharge applies to In-Region routing
- EU Geo fallback routing carries a 10% surcharge ($3.30 / $16.50 per million tokens) if activated

At projected v1 usage (100 active charities, 10 sessions/month), estimated monthly AI inference cost is approximately $35–38 depending on routing mode used.

## Change from Previous Decision (2026-04-09)

The original decision selected the Anthropic Claude API (direct), with data residency concerns to be managed through Anthropic's Data Processing Agreement and Standard Contractual Clauses at the hosting and API agreement level. Following a review of Amazon Bedrock's regional capabilities, it was established that Claude Sonnet 4.6 supports In-Region routing in eu-west-2 (London), enabling UK data residency for AI inference without changing the model or incurring additional cost. The delivery mechanism has therefore been changed to Amazon Bedrock to align with the strengthened data hosting position in DR-DP-002.

## Date Decided

2026-05-07
