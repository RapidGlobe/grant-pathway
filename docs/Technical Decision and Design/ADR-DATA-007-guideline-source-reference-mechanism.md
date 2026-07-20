---
id: ADR-DATA-007
category: Data
status: Decided
---

# ADR-DATA-007 — Guideline Source-Reference (Citation) Mechanism

## Context

`PDR-DH-004` decided _that_ Grant Pathway will let a user trace an AI summary bullet, eligibility criterion, or extracted question back to a specific page or section of the funder's own guidelines ("Option 2" — chunk-anchored citation + a "view original guidelines" panel), rather than a free-typed label (Option A) or a full retained-document viewer (Option C). This ADR decides _how_: the concrete data-model, extraction, and rendering mechanism, consolidating technical consequences that were provisionally recorded as forward-looking notes across several other ADRs on 2026-07-10, ahead of this ADR being written.

This mechanism only exists because two other decisions made it possible:

- `ADR-DATA-002`'s 2026-07-10 reversal: guideline text is now retained (extracted, page/section-tagged, in Postgres), not discarded after the AI call returns. A citation with nothing left to point at is meaningless.
- `ADR-DATA-006`'s item-graph model: citations attach as a field on each typed item, not on the old flat `application_answers` row structure. Building the citation mechanism against the flat model first would mean rebuilding it again once the item-graph lands (see `PDR-DH-004`'s Sequencing rationale).

## Options Considered

- **Option A — Free-typed page/section reference:** The AI extraction prompt is simply asked to state which page or section a piece of information came from, as a plain string, with no structural guarantee it corresponds to anything real. Rejected in `PDR-DH-004` — nothing prevents the AI hallucinating a reference that doesn't exist.
- **Option B — Structural chunk-anchoring:** Preserve page (PDF) or heading/section (docx, pasted text) boundaries during extraction, so the text itself carries verifiable structure (e.g. `[PAGE 3]` markers). The extraction prompt is required to cite a chunk of _this already-tagged_ text, not free-type a number — a citation can only ever reference a chunk that structurally exists in the source. Chosen.
- **Option C — Separate embeddings-based retrieval:** Compute vector embeddings of guideline chunks and retrieve the best-matching chunk for a given summary bullet after the fact, independent of what the AI actually read. Rejected: adds a second AI/infra dependency (embeddings model, vector search) to verify something the primary extraction call could simply be asked to report directly and correctly the first time; also weaker as a citation guarantee than Option B's structural anchoring, since a retrieved "best match" is not the same as "the text the AI actually used."

## Decision

**Option B — structural chunk-anchoring, built in five parts (Build plan `P6.2a`, `P6.2`, `P6.3`, `P6.4`, `P6.5`):**

1. **Extraction preserves structure (`P6.2a`):** PDF text extraction (`lib/extract-text.ts`) changes from `unpdf`'s `mergePages: true` (all pages flattened into one string) to per-page extraction, inserting a `[PAGE N]` marker between pages. For docx and pasted guidelines, which have no fixed pages, heading/section structure is preserved as the fallback reference unit. `lib/preprocess-text.ts`'s page-number noise-stripping step is updated so it does not strip these newly-inserted markers before the AI ever sees them.
2. **Citation field on each item (`P6.2`):** `ADR-DATA-006`'s typed item schema carries a guideline reference field (page number or section/heading) alongside its other properties (type, visibility condition, validation mode, etc.). **Concrete shape agreed 2026-07-13** (mocked up and approved by WJ before any migration was written):

   ```
   guideline_reference: {
     source_type: 'page' | 'heading',
     page_number: number | null,     // set only when source_type = 'page'
     heading_path: string[] | null,  // set only when source_type = 'heading', e.g. ['Eligibility', 'Who can refer a family']
     quote: string                   // short verbatim excerpt — always present, either way
   }
   ```

   A discriminated union rather than two independent nullable fields, so a citation can never end up both- or neither-populated. `heading_path` is an array, not a single string, because docx/pasted guidelines nest (a heading under a heading) and the P6.4 "view original guidelines" panel needs the full trail to jump to the right place, not just the top-level heading. `quote` is present regardless of source type — it is what the P6.4 viewer actually searches for and highlights (a page number alone doesn't say where on the page), and doubles as a second, human-checkable guarantee that the citation is real rather than an AI guess.

3. **Extraction records the citation (`P6.3`):** The rewritten extraction prompt (`lib/prompts.ts`) and route cite a specific chunk of the page/section-tagged text for each summary bullet, eligibility criterion, and extracted question — structurally guaranteed to reference real tagged content, never a free-typed guess.
4. **Reference display and viewer (`P6.4`):** Step 4 (and the Step 3 summary) shows each item's guideline reference alongside it. A "view original guidelines" panel lets the user click a reference to jump to and highlight the cited page/section. **Corrected 2026-07-14:** rendered as a text panel showing the retained `application_guidelines.guideline_text` (GAP-33 fix), scrolled to and highlighting the cited marker — not canvas-based PDF rendering as originally assumed here, since only extracted text is ever retained, never the raw file (`ADR-DATA-002`). `<iframe>`/`<object>` remain ruled out for the same original reason (no highlighting API), independent of this correction.
5. **Human curation confirms accuracy (`P6.5`):** Before a funder's playbook is approved, a human curator confirms or corrects each item's citation once — so applications built from that playbook reuse a verified reference, rather than trusting a fresh AI guess on every single application. **Superseded 2026-07-14:** `P6.5` no longer builds a curated playbook or curator role — see the amendment below. There is no human-confirmation step; automated marker-validation (`P6.3`) is the only guard.

## Rationale

- Structural anchoring (Option B) is the only mechanism where correctness is enforced by the data shape itself, not by hoping the AI reports accurately — the same principle `ADR-DATA-006` already applies to citation-adjacent concerns (validation mode, visibility conditions).
- Reusing the existing extraction/rendering rewrite that `ADR-DATA-006` already requires (rather than building the citation feature against the soon-to-be-superseded flat model) avoids duplicated engineering effort for a feature that, being gated behind the same Phase 6 → Go-Live Gate as the item-graph itself, would never actually reach a user in its pre-item-graph form.
- A plain `<iframe>`/`<object>` embed is ruled out because highlighting a cited region is a hard requirement of the design (`PDR-DH-004`) and neither supports programmatic scroll-to-and-highlight. **Corrected 2026-07-14:** this does not require canvas-based PDF rendering, as originally assumed — since only text is retained (`ADR-DATA-002`, GAP-33 fix), a plain scrollable text panel with in-page highlighting (no canvas, no rendering library) satisfies the same requirement more simply.
- Curator-verified citations (P6.5) follow the same reliability-over-raw-coverage principle `ADR-DATA-006` already established for the rest of the item graph — a human confirms a citation once per funder rather than the product silently trusting an unsupervised per-application guess that could be subtly wrong on any given run. **Superseded 2026-07-14** — see the amendment below; this rationale no longer applies now that P6.5 builds no curator role.

## Consequences

This ADR consolidates technical consequences that were already recorded as forward-looking notes elsewhere on 2026-07-10, ahead of this ADR existing. Those notes remain in place (per this project's convention of not rewriting original ADR content) but are cross-referenced here as the single place to look for the full picture:

1. **`ADR-FILE-003`** (PDF text extraction): the `unpdf` call switches from `mergePages: true` to per-page extraction with `[PAGE N]` markers — see that ADR's 2026-07-10 note.
2. **`ADR-AI-007`** (context window management): `lib/preprocess-text.ts`'s `PREPROCESS_CHAR_CEILING` safety-net truncation (20,000 default / 50,000 production) needs to become page-marker-aware — snapping to the nearest preceding `[PAGE N]` marker rather than the nearest newline — so a page cut off by the ceiling is dropped in its entirety rather than partially, keeping citations intact. See that ADR's 2026-07-10 correction.
3. **`ADR-SEC-004`** (HTTP security headers): **corrected 2026-07-14** — no CSP change is needed. The original note assumed `worker-src 'self' blob:` for a canvas-rendering library's web worker; since the viewer renders retained text instead (GAP-33 fix), there is no rendering library and no web worker.
4. **`ADR-OPS-006`** (accessibility testing): manual accessibility checklist items are added once the P6.4 viewer is built — keyboard navigation into/through the viewer and focus management on open/close. **Corrected 2026-07-14:** the original third item ("screen-reader alternative for the canvas-rendered element") no longer applies — a text panel is natively screen-reader-accessible, it isn't a canvas needing an alternative.
5. **`ADR-DATA-002`** (data retention): this mechanism depends entirely on that ADR's 2026-07-10 reversal — extracted, page-tagged guideline text must be retained (not discarded) for a citation to have anything to point at.
6. **`ADR-DATA-006`** (item-graph model): the citation field is part of that ADR's typed item schema, not a bolt-on addition to it.
7. **`docs/data-model.md` and `technical-design.md`** must be updated to reflect the citation field once `P6.2` lands (not yet — this ADR records the decision; the schema does not exist until built).
8. **No code has changed as a result of this ADR.** It formalises and consolidates a mechanism whose pieces were already tracked as build-plan tasks (`P6.2a`–`P6.5`) before this ADR was written; it does not add new scope.

**Amendment (2026-07-14):** step 5 of the Decision above ("Human curation confirms accuracy (`P6.5`)") is superseded, not built. `P6.5` no longer builds a curated, funder-wide playbook or a human-curator role of any kind — see `ADR-DATA-006`'s 2026-07-14 amendment. There is now no additional human-confirmation step for citations at all beyond the automated marker-validation already built in `P6.3` (`validateCitation()`, `lib/guideline-citations.ts`) — a citation is trusted if it points at a real `[PAGE N]`/`[SECTION: ...]` marker in the retained text, same as every other application. `docs/PRD inputs/acceptance-criteria.md` FR-48's curator-confirmation criteria (AC-FR-48-04/05) are corrected accordingly — this is a permanent scope reduction, not a "not yet built" item waiting on a future task.

## Source

`PDR-DH-004` (guideline source-reference design decision, "Option 2"), `ADR-DATA-002` (2026-07-10 reversal), `ADR-DATA-006` (item-graph model), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` Phase 6 section (P6.2a–P6.5 build sequencing).

## Date Decided

2026-07-10
