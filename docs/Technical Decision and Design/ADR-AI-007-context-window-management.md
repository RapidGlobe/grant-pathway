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

## Note — 2026-07-10

**Correction, not just a forward-looking note:** this ADR's Consequences state that text exceeding a 150,000-character limit "is truncated at the nearest sentence boundary." That is not accurate today, and does not appear to have ever been implemented as literally described. Per `docs/Implementation Plan/ADR-TRACEABILITY.md`'s own record, hard truncation at a sentence boundary was superseded by a soft-warning-only approach (no truncation) — matching `PDR-AI-004`, which actually specifies a 100,000-token (not 150,000-character) soft advisory threshold, with the full document still processed. This ADR's own Rationale (above) already misquotes `PDR-AI-004` as "150,000 character" — that citation error predates this note and is not introduced by it.

Separately, and independently of the above, `lib/preprocess-text.ts` (governed by `ADR-AI-010`) does apply a real, live character-ceiling truncation as a safety net -- `DEFAULT_CHAR_CEILING = 20,000`, overridden to 50,000 in production via `PREPROCESS_CHAR_CEILING` -- snapping to the nearest preceding newline within the final 10% of the ceiling. This is the mechanism that actually risks cutting text mid-page once P6.2a inserts `[PAGE N]` markers, not the 150,000-character/sentence-boundary mechanism this ADR describes.

**Forward-looking point (still valid):** once P6.2a lands, `preprocessText`'s newline-snap truncation should become page-marker-aware -- snapping to the nearest preceding `[PAGE N]` marker rather than the nearest newline -- so a page cut off by the ceiling is dropped in its entirety rather than partially, keeping citation references intact. Nothing about current truncation behaviour changes until P6.2a is built.

**Flagged, not resolved here:** this ADR's original Decision/Rationale/Consequences (2026-04-17) describe a 150,000-character, sentence-boundary truncation mechanism that does not match either the superseded decision (`ADR-TRACEABILITY.md`) or the live code (`lib/preprocess-text.ts`'s 20,000/50,000-character ceiling). This needs its own correction pass -- reconciling the ADR's text against `PDR-AI-004`'s actual 100,000-token figure and the live preprocessing ceiling -- rather than being folded into this P6.2a forward-reference note.

**Note (2026-08-14):** this ADR governs input-side truncation only. The corresponding output-side policy — what happens when an AI _response_ (not the guidelines input) hits its own token ceiling — is covered separately by `ADR-AI-011` (`GAP-93`), rather than being added here on top of the corrections already pending above.

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Corrected a false claim in this ADR's own prior 2026-07-10 draft note, which asserted the 150,000-character/sentence-boundary truncation "remains accurate today" -- it does not; that mechanism was superseded (soft-warning-only, per `ADR-TRACEABILITY.md`) and does not match live code. Identified the actual live truncation mechanism (`lib/preprocess-text.ts`'s `PREPROCESS_CHAR_CEILING`, 20,000 default / 50,000 production) as the one P6.2a's page-marker work needs to account for. Flagged this ADR's original 150,000-character figure (which also misquotes `PDR-AI-004`'s real 100,000-token threshold) as needing its own separate correction pass. |
