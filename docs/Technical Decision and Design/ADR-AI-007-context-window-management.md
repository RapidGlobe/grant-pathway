---
id: ADR-AI-007
category: AI Integration
status: Decided
---

# ADR-AI-007 — Context Window Management

## Context

Claude Sonnet 4.6 has a 1,000,000 token context window (accessed via Amazon Bedrock — ADR-AI-001). Grant Pathway passes funder guidelines text (potentially long) and the charity profile (moderate length) as AI context. For Step 4, all application questions and the full AI summary are also included in the prompt.

No practical context window constraint exists for the expected input sizes. However, very long inputs may reduce output quality by diluting the model's focus on the application-relevant sections, so a soft length guidance is still warranted.

## Options Considered

- **Option A — No truncation, rely on 200K context window:** Accept any input size up to the 200K limit. Most funder guidelines and charity profiles will be well within this.
- **Option B — Truncate guidelines text at a defined character limit:** If extracted guidelines text exceeds a threshold, truncate to the most relevant sections.
- **Option C — Summarise guidelines before main prompt (two-pass):** If guidelines exceed a threshold, run a condensing pass first. Then use the condensed version in the main prompt.
- **Option D — Reject inputs over a size limit:** Return an error if the guidelines text is too long.

## Decision

**The 1,000,000 token context window of Claude Sonnet 4.6 is not a practical constraint for any expected input in v1. No truncation strategy is implemented for context window reasons.**

A soft limit of 150,000 characters (~37,500 tokens) is set for extracted guidelines text as a quality guidance measure. If text exceeds this limit, the user is informed: "These guidelines are very long. We'll use the first part for your summary." The text is truncated at the character limit before being sent to the API. This covers edge cases with unusually large documents where quality (not capacity) is the concern.

## Rationale

- Typical funder guidelines are 2,000–15,000 words (10,000–75,000 characters). The 1M token context window is not a constraint for any realistic input.
- A 150,000-character soft limit protects against edge cases (e.g., a user uploading the wrong file — a 100-page report rather than a 10-page guidelines document) where quality rather than capacity is the concern.
- PDR-AI-004 specifies a 150,000 character soft threshold as a quality measure.
- Two-pass summarisation (Option C) adds latency and complexity for a case that will rarely occur.

## Consequences

- Text extraction functions (ADR-FILE-003) should check text length before passing to the API route.
- If text exceeds 150,000 characters, it is truncated at the nearest sentence boundary before the limit.
- The truncation message is shown in the UI as an informational notice, not an error.
- The charity profile fields are typically short (a few hundred words each) and do not require truncation.

## Source

Product Decision PDR-AI-004.

## Date Decided

2026-04-17
