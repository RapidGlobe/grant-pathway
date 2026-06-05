---
id: PDR-AI-004
category: AI Integration
status: Decided
---

# PDR-AI-004 — Context Window Management

## Question

How will the application handle funder guidelines that are too long to fit within a single Claude API context window?

## Context

Funder guidelines vary enormously in length — some are a single page, others run to 30 or 40 pages. Claude models have a context window limit (the maximum amount of text that can be processed in a single API call). When guidelines exceed this limit, a strategy is needed to ensure the full document is still processed effectively. Options include splitting the document into chunks and processing them separately, summarising in passes, or truncating with a user warning. The chosen approach affects output quality — a poorly chunked document may produce a summary that misses key information. This is a PRD decision because it directly affects what the user experiences and what the product promises to support.

## Options

- **Option A — Truncate with a user warning:** If the document exceeds the limit, truncate it and notify the user that only the first portion was processed. Simple but risks silent loss of important content.
- **Option B — Chunking:** Split the document into overlapping chunks, process each separately, and merge outputs. Full document coverage but significantly more complex, slower, and more expensive.
- **Option C — Soft warning, ask user to reduce the document:** If the uploaded document exceeds a defined soft threshold, display a plain-language guidance message advising the user to upload a trimmed version containing only the core eligibility and application criteria sections. The user remains in control and the document is still processed.
- **Option D — Hard rejection:** Reject documents exceeding the threshold entirely and require the user to upload a shorter version. Simple but abrupt and unhelpful.

## Decision

**Option C — Soft warning with guidance to reduce the document.**

If an uploaded funder guidelines document exceeds 100,000 tokens (approximately 75,000 words), the application will display a plain-language advisory message before processing:

_"Your guidelines document is quite long. For the best results, we recommend uploading only the core sections — such as eligibility criteria, application questions, and assessment criteria. Very long documents can reduce the quality of the AI summary."_

The user may proceed with the full document or upload a trimmed version. No hard rejection is applied. Real-world usage will inform whether thresholds or behaviour need adjustment post-launch.

## Rationale

claude-sonnet-4-6's 1,000,000 token context window means virtually no real-world funder guidelines document will approach the hard limit — even the most extensive UK funder guidance is unlikely to exceed a few hundred pages. The 100,000 token soft threshold is therefore not a technical ceiling but a quality guidance measure: very long documents sent in their entirety may dilute the AI's focus on the core application-relevant sections and reduce summary quality. Chunking (Option B) adds significant implementation complexity for an edge case. Hard rejection (Option D) is unnecessarily obstructive. A soft warning (Option C) empowers the user to make a better submission without blocking them, is honest about the limitation, and is simple to implement. Post-launch usage data will indicate whether thresholds or more sophisticated handling are needed in a future phase.

## Review Note (2026-05-07)

The original rationale referenced claude-sonnet-4's 200,000 token context window as the basis for the 100,000 token soft threshold. Following the model update to claude-sonnet-4-6 (1M token context window per PDR-AI-001 and DR-AI-002), the hard limit concern no longer applies. The soft threshold and user-facing behaviour are unchanged — the rationale has been updated to reflect that the threshold is now a quality guidance measure rather than a technical constraint.

## Date Decided

2026-04-16
