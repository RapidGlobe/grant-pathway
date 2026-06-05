---
id: PDR-AI-001
category: AI Integration
status: Decided
last-reviewed: 2026-05-07
---

# PDR-AI-001 — Claude Model Selection

## Question

Which Claude model will be used for AI summarisation and draft generation in v1, and through which platform will it be accessed?

## Context

Anthropic offers several Claude models with different capability and cost profiles. The choice of model directly affects the quality of AI outputs, the speed of responses, and the cost per API call — all of which are critical given the £100/month budget constraint (C1). Higher-capability models produce better outputs but cost more per token; faster, lighter models are cheaper but may produce lower quality drafts. The model selected must be capable of summarising complex funder guidelines and generating coherent, tailored grant application answers. Models are accessed via Amazon Bedrock (eu-west-2, In-Region) per DR-AI-002 and DR-DP-002 — the model, its capabilities, and its pricing are identical to the Anthropic direct API.

## Options

- **Option A — claude-haiku-4-5 for everything:** Fastest and cheapest ($1/$5 per MTok). Quality may be insufficient for coherent, well-structured grant application draft writing. 200k token context window may also constrain longer funder documents. Not available In-Region in eu-west-2.
- **Option B — claude-opus-4-7 for everything:** Highest quality but most expensive ($5/$25 per MTok). Risk of exceeding the £100/month budget constraint (C1) as usage grows.
- **Option C — claude-sonnet-4-6 for everything:** Balanced quality and cost ($3/$15 per MTok). High-quality long-form writing at a fraction of Opus cost. 1M token context window handles even the longest funder guidelines comfortably. Single model keeps the codebase simple.
- **Option D — claude-haiku-4-5 for summarisation, claude-sonnet-4-6 for draft generation:** Cost-optimised split. Haiku handles the simpler comprehension task; Sonnet handles the more demanding writing task. Noted as a future cost optimisation option, though Haiku's smaller context window and lower writing quality make this a less clear benefit than it appears.

## Decision

**Option C — claude-sonnet-4-6 for all AI tasks in v1.**

A single model (`anthropic.claude-sonnet-4-6`, accessed via Amazon Bedrock eu-west-2 In-Region) will be used for both summarisation of funder guidelines and generation of grant application draft answers. The model will be referenced via a configuration constant so it can be swapped without changes across the codebase.

## Rationale

claude-sonnet-4-6 produces high-quality, coherent long-form writing suitable for grant application drafts, at a cost well within the £100/month budget constraint (C1) for an initial user base. Its 1M token context window means even the longest UK funder guidelines documents can be processed in a single context without chunking or truncation. Using a single model for both tasks reduces codebase complexity and makes the AI layer easier to reason about and test. If real-world usage data shows cost pressure, the split approach (Option D — Haiku for summarisation, Sonnet for drafts) is a straightforward optimisation that can be made without architectural change, as the model is referenced via a single configuration constant.

## Review Note (2026-05-07)

The original decision (2026-04-16) referenced `claude-sonnet-4` via the Anthropic direct API. Following the change to Amazon Bedrock (DR-AI-002), the model has been updated to `claude-sonnet-4-6` (the current Sonnet generation), accessed via Amazon Bedrock eu-west-2 In-Region (`anthropic.claude-sonnet-4-6`). The EU Geo fallback inference ID is `eu.anthropic.claude-sonnet-4-6`. The model selection rationale, pricing, and decision are unchanged — claude-sonnet-4-6 is the direct successor to claude-sonnet-4 with improved capabilities and a significantly larger context window (1M tokens vs 200k).

## Date Decided

2026-04-16

## Last Reviewed

2026-05-07
