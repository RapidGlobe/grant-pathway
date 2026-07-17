---
id: PDR-AI-010
category: AI Integration
status: Decided
---

# PDR-AI-010 — Financial Section Catch-All (Sections Mode)

## Question

When a free_form funder's own guidelines name a themed financial section (e.g. "Finances of Your Group"), but everything identifiable under that heading turns out to be pure numeric fields already captured by the 5 governance facts (`PDR-AI-008`), what should the resulting narrative "section" card ask for and cite — and should it be dropped, forced unconditionally, or something else?

## Context

Found live-testing Stony Stratford Town Council, 2026-07-17. Section 7 of the source form ("FINANCES OF YOUR GROUP") contains exactly three numeric fields — total income, total expenditure, reserves — plus a short reserves-justification line already folded into the reserves governance fact's own guidance. The extraction correctly created a "Finances of Your Group" narrative section for this heading (per `buildSummaryPrompt()`'s existing "sections" rule: one card per named theme), but with nothing distinctly narrative left under that heading to cite, the model landed on the exact same citation quote already owned by a separate governance-fact card (Reserves) — two different items on Step 4, both pointing at the identical highlighted text. WJ spotted this as visually confusing duplication.

WJ's proposed fix: keep a version of this card as an explicit "tell us about your finances in your own words" catch-all. Agreed in principle, but with one risk flagged before building: making it an unconditional card shown on every application regardless of what the guidelines actually say would repeat the exact anti-pattern `PDR-AI-008` already moved away from — that PDR's governance facts started as an always-on block "shown unconditionally on every application regardless of funder," found live to be "disjointed from the rest of Step 4," and fixed by making the block guideline-driven instead (a fact is shown only when the guidelines actually raise the topic).

## Options

- **Option A — Drop the section entirely when its content is wholly numeric and already governance-fact-covered.** Removes the duplication cleanly, but silently discards a theme the funder's own guidelines explicitly named, with no replacement — a charity who wants to add context about their finances (reserves policy, funding trends, sustainability narrative) has nowhere to do so. Also diverges from "sections" mode's existing, simple rule (one card per named theme) for a case-by-case exception.
- **Option B — Keep the section, unconditional, on every application regardless of what the guidelines say.** A true generic catch-all. Gives WJ's requested safety net, but repeats the exact anti-pattern `PDR-AI-008` was corrected away from — an always-on, guideline-unlinked card, shown even for funders whose guidelines never mention finances at all.
- **Option C — Keep the section guideline-driven (only created when the funder's guidelines actually name a financial-position theme), but reframe it when its content is wholly numeric/governance-covered.** Two changes to that specific case: (1) guidance wording becomes an explicit invitation for context not already captured by the numbers — e.g. "Use this space to tell us anything about your organisation's finances that isn't already covered by the figures above" — rather than restating a theme with nothing left to say; (2) citation is not forced onto a line a governance fact already owns — omit it, or cite the section heading itself rather than a specific already-claimed figure.
- **Option D — Leave as-is (status quo).** Rejected — this is the exact duplication WJ raised; no change is not an option here.

## Decision

**Option C, approved 2026-07-17.**

`buildSummaryPrompt()`'s "sections" rule gains an explicit case: when a themed section's identifiable content consists entirely of numeric fields that map to one or more of the 5 governance facts, with no additional narrative ask of its own, the model should still create the section (the funder's guidelines did name the theme), but its `guidance` must explicitly invite open-ended context beyond the numbers rather than restate a subject already fully covered elsewhere, and its `citation` must not duplicate a quote or heading already claimed by a governance fact for the same underlying figure — omit the citation in that case rather than force one.

No change to the API response shape, the `sections` schema, or any UI component (`components/application-step4-draft.tsx` already renders a null citation as "no badge," the existing, correct fallback).

## Rationale

- Option A was ruled out because it silently removes a theme the funder's own guidelines named, with nowhere for a charity to add financial context — a worse outcome than a slightly redundant card.
- Option B was ruled out on the same grounds `PDR-AI-008`'s original always-on governance block was corrected: an unconditional, guideline-unlinked card reintroduces exactly the "disjointed from the rest of Step 4" problem WJ already found and fixed once.
- Option C is the only option that keeps the "never force a card the guidelines don't support" principle intact (still guideline-driven) while giving WJ the safety-net card he asked for, and directly removes the specific symptom he flagged (two different items citing the identical quote) without touching anything the citation validation mechanism (`lib/guideline-citations.ts`) already does correctly.
- Option D is rejected on its face — the duplication itself is the problem being solved.

## Implementation status

**Built 2026-07-17.** `buildSummaryPrompt()`'s `"sections"` rule (`lib/prompts.ts`) now includes the case described above. Not yet independently verifiable against a real Bedrock call locally (`dotenvx` redacts AWS credentials for this agent) — a future guideline upload for a funder with a wholly-numeric financial section (Stony Stratford's own "Finances of Your Group" is the obvious first candidate) is the outstanding live-verification step.

## Date Decided

2026-07-17.
