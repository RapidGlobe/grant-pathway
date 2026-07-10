---
id: PDR-DH-004
category: Data & File Handling
status: Decided
---

# PDR-DH-004 — Guideline Source-Reference (Citation) Design

## Question

When the AI summarises funder guidelines (Step 3) and extracts questions (Step 4), how — if at all — should the user be able to trace a given summary bullet, eligibility criterion, or extracted question back to the specific place in the funder's own guidelines it came from?

## Context

Funder guidelines are often long, dense documents. The AI condenses them into a plain-English summary and a set of extractable questions, but that condensation is opaque — the user has no way to check a given AI-produced statement against the funder's original wording without manually re-reading the whole document. This becomes more consequential, not less, once `ADR-DATA-006`'s item-graph model ships: items carry branching logic, rubric links, and hard/judgement validation modes drawn from the guidelines, and a curator (P6.5) needs to verify each one against the source before approving a playbook.

This question was raised as a standalone Phase 3/4 enhancement, initially discussed independently of Phase 6. Investigation found it touches the exact same data model (`application_answers` → item-graph), extraction prompt (`lib/prompts.ts`), and Step 4 rendering that Phase 6 (`ADR-DATA-006`) was already rewriting — building it first, against the flat model, would mean rebuilding it again shortly after against the item-graph shape. See the **Sequencing decision** below.

This decision also depends on `ADR-DATA-002`'s 2026-07-10 reversal: a citation is only meaningful if the cited guideline text still exists to be shown. Under the original "never store guidelines" decision, there would be nothing left to point a citation at once the AI call returned — this design would not have been possible at all before that reversal.

## Options

- **Option A — Free-text label only:** Each summary bullet or question carries a short free-text label (e.g. "see page 3" or "Eligibility section") typed by the AI at extraction time, with no link back to the source document and no verification that the label is even correct. Cheapest to build. Weaknesses: nothing stops the AI hallucinating a page or section that doesn't exist; the user still has to manually locate it in their own copy; provides an illusion of traceability without actually delivering it.
- **Option B ("Option 2") — Chunk-anchored citation + "view original guidelines" panel:** Guideline text is extracted with page (PDF) or heading/section (docx, pasted text) boundaries preserved. Each summary bullet, eligibility criterion, and extracted question carries a citation to a specific chunk of that tagged text — not a free-typed label, so a citation cannot point at a page or section that doesn't exist. A "view original guidelines" panel lets the user click a citation to jump to and highlight the cited page/section, rendered from the retained guideline text (`ADR-DATA-002`). A human curator (P6.5) confirms or corrects each citation once per funder before a playbook is approved, rather than trusting a fresh AI guess on every application.
- **Option C — Full retained-document viewer with inline annotation:** Store and render the complete original document (not just extracted text) with inline highlighting/annotation directly in the document's own layout, similar to a PDF-review tool. Most complete traceability. Weaknesses: substantially larger scope (a general-purpose document viewer/annotator, not a targeted citation mechanism); requires retaining and rendering the original file layout, not just extracted text, which the current retention decision (`ADR-DATA-002`) does not provide for (it retains extracted text in Postgres, not the raw file); no clear stopping point for v1 given the Phase 6 timeline already gates launch.

## Decision

**Option B ("Option 2") — chunk-anchored citation with a "view original guidelines" panel, populated via human-curated review (P6.5), not per-application AI guesses.**

Blended into Phase 6 rather than run as a separate track (2026-07-10) — see `ADR-DATA-006` and `IMPLEMENTATION-PLAN.md`'s Phase 6 section. Groundwork (page/section-tagged extraction) is `P6.2a`; the citation field on each item is part of `P6.2`'s schema; extraction recording a citation is `P6.3`; the reference display and viewer panel is `P6.4`; curator confirmation of each citation is `P6.5`. Full technical architecture: `ADR-DATA-007`.

## Rationale

- Option A doesn't solve the actual problem — it produces a citation-shaped label with no guarantee of correctness, which is worse than no citation at all for a "trusted" product: a wrong citation that looks authoritative is more damaging to trust than an absent one.
- Option C solves a bigger problem than the one being asked here. The goal is "can the user check this specific statement against the source," not "can the user annotate the entire document" — Option C's scope (full document retention and rendering, general-purpose annotation) is disproportionate, and its retained-document-layout requirement isn't supported by the current data retention decision.
- Option B is the only option where a citation is structurally guaranteed to point at real content: because chunks are derived from the same page/section-tagged extraction the item-graph itself is built from, a citation can only reference a chunk that exists.
- Folding this into Phase 6 rather than running it first against the flat model avoids building the same mechanism twice (once for `application_answers`, once for the item-graph) — it would have to be rebuilt from scratch days or weeks later once `ADR-DATA-006` lands, for no benefit to users in the interim (Phase 6 already gates launch, so there is no window where shipping it early against the old model would reach a user before the rebuild).
- The P6.5 human-curation step matters because it moves citation-correctness verification from "trust a fresh AI guess on every single application" to "one human confirms it once per funder" — consistent with `ADR-DATA-006`'s broader decision to prefer curated playbooks over per-application unsupervised extraction wherever accuracy matters.

## Date Decided

2026-07-10

## Revision History

_None yet — this record was written after the underlying decision (folding this feature into Phase 6) had already been made and documented informally in `IMPLEMENTATION-STATUS.md`'s 2026-07-10 notes and `IMPLEMENTATION-PLAN.md`'s Phase 6 section. This PDR formalises that decision as its own record rather than changing it._
