# Build Plan — Handling Any Guideline or Form

**Tier:** 2 — Check if relevant
**Volatility:** High — sequencing will shift as real funder work surfaces new priorities
**Update when:** A phase completes, is reordered, or a new funder forces a change to scope

---

## 1. What this is

A phased implementation plan for the architecture recommended in [clean-slate-design-proposal.md](clean-slate-design-proposal.md): a typed item-graph data model, populated via AI-drafted, human-reviewed playbooks per funder, with visible support-status transparency layered on top. It assumes that recommendation is accepted. It does not re-argue it — see the proposal for the four options, the recommendation, and the R1–R20 requirements every phase below traces back to.

It is grounded in [question-coverage-analysis.md](question-coverage-analysis.md)'s codebase audit (Section 9 of the proposal): the current system is a flat `application_answers` table, one extraction prompt that explicitly discards non-narrative and conditional questions, a generic export, and zero per-funder configuration. Nothing here assumes more than that.

## 2. Before Phase 1: formalise the decision

This plan is built on a proposal, not a decision. Per this project's own conventions (`AGENTS.md` Step 3), an architectural choice of this size should be captured as a formal ADR under `docs/Technical Decision and Design/` before implementation begins — the same way DR-FD-001 captured the funder-directory model change. This build plan does not substitute for that. Recommended: draft the ADR alongside Phase 1, not after it, so the record reflects what was actually decided rather than being reconstructed later.

**Update (2026-07-05):** Formalised as `ADR-DATA-006-application-item-graph-model.md`, and this plan expanded into `IMPLEMENTATION-PLAN.md`/`IMPLEMENTATION-STATUS.md` as Phase 6 (P6.1–P6.7, mapping the phases below in order). **WJ additionally decided the same day that this rearchitecture now gates launch** — Phases 0–5 below (P6.1–P6.6) must complete before go-live; only Phase 6 (P6.7, the ongoing funder-by-funder extension) remains genuinely open-ended and non-blocking. See the Phase 6 → Go-Live Gate in `IMPLEMENTATION-PLAN.md`. Target launch is no longer 31 July 2026 — working estimate August–September 2026, not committed.

**Update (2026-07-10):** the guideline source-reference (citation) feature was blended into this plan rather than run as a separate track — see the new Phase 1a and the citation-related additions to Phases 1–4 below. Formalised the same day as `PDR-DH-004` (design decision) and `ADR-DATA-007` (technical mechanism); the requirement is FR-48 in `moscow-feature-register.md`.

**Update (2026-07-13):** two parked items corrected after a staleness review — native-document output (R9) was declared permanently out of scope on 2026-07-11 (not "pick up whenever needed", as this plan previously said), and R16 was resolved the same day via a disclosure pattern requiring no BD-06 reversal (not still blocked, as this plan previously said). See the amendments under Section 4's parked items.

## 3. Sequencing principle

The proposal already states the phasing instinct: build the graph model, populate it with today's item types first so nothing regresses, then extend funder by funder. Two rules follow from that, applied throughout this plan:

- **No big-bang cutover.** Every existing funder currently works, end to end, on the flat model. The new model must prove itself against one funder before any other funder is migrated onto it.
- **Sequence by dependency, not by importance.** Some of the most valuable capabilities (rubric coaching, native-document output) are deliberately scheduled after less exciting foundational work, because nothing else can be built correctly until the item-graph exists.

Effort is sized relatively (S / M / L / XL) rather than in weeks, for the same reason the proposal gave no time estimate: this is one developer's time, running alongside continued funder testing, and translating size into calendar time depends on how much of that time is available in a given period.

## 4. Phases

### Phase 0 — Profile schema extension

**What:** Add governance facts (trustee relatedness, bank-signatory count/relatedness) and the fields needed to compute derived ratios (e.g. reserves ÷ monthly expenditure) to `charity_profiles`.
**Why first:** Additive only — no dependency on the item-graph, and it starts paying off immediately even under the current flat model (Walton- and MK Community Foundation-style eligibility checks, R13).
**Depends on:** Nothing.
**Exit criteria:** New fields exist, are captured during profile setup, and at least one derived ratio can be computed and displayed.
**Size:** S

### Phase 1a — Guideline page/section reference extraction (groundwork)

**Added 2026-07-10:** the guideline source-reference (citation) feature, previously discussed as a standalone Phase 3/4 enhancement, was blended into this plan rather than run as a separate track — see `PDR-DH-004` and `ADR-DATA-007`. This phase is its groundwork; the citation-related additions to Phases 1–4 below are the rest of it.
**What:** PDF text extraction (`lib/extract-text.ts`) changes from merging all pages into one string to per-page extraction, with a `[PAGE N]` marker inserted between pages. Docx and pasted guidelines, which have no fixed pages, fall back to heading/section structure as the reference unit. Pre-processing's page-number noise-stripping step (`lib/preprocess-text.ts`) is updated so it does not strip these newly-inserted markers before the AI ever sees them.
**Why first (independent):** Nothing else in the citation mechanism can be built until extraction preserves structure to cite. Independent of the item-graph itself — can start immediately, in parallel with Phase 0 and Phase 1.
**Depends on:** Nothing.
**Exit criteria:** PDF, docx, and pasted guidelines all preserve page/section structure through extraction with no loss of information.
**Size:** S–M
**Maps to:** `P6.2a` in `IMPLEMENTATION-PLAN.md`.

### Phase 1 — Item-graph data model (compatibility mode)

**What:** Design and migrate the new schema — items with type, visibility condition, source-of-truth, validation mode (`hard_check` / `judgement_flag`), rubric-criterion link, `decision_maker_visible` flag (R20), output-mapping. Migrate existing data into this shape using only the item types that exist today (narrative, budget-flagged narrative). No new capability yet — this is re-platforming, not extending.
**Why first:** Every other phase depends on this existing. Section 9 of the proposal calls this the foundation everything else sits on.
**Depends on:** Nothing (can run in parallel with Phase 0).
**Exit criteria:** One existing funder (pick the simplest already-tested one) runs end to end — extraction, storage, Step 4 rendering, export — on the new schema with zero behavioural regression versus today. Verified against that funder's existing test plan.
**Size:** XL — the highest-risk phase in this plan.
**Added 2026-07-10 (`ADR-DATA-007`):** the typed item schema also carries a guideline reference field (page number or section/heading, from Phase 1a) alongside its other properties — the citation field is part of this schema, not a bolt-on addition to it.

### Phase 2 — Extraction rewrite (compatibility mode, then incremental)

**What:** Rewrite `lib/prompts.ts` and the extraction route to produce the graph shape. First milestone: same item types as today (narrative, budget), new shape only. Second milestone onward: extend extraction to cover new item types one at a time, driven by whichever funder is next in the curation queue (Phase 4) rather than built speculatively.
**Why after Phase 1:** Extraction needs somewhere to write a graph to.
**Depends on:** Phase 1.
**Exit criteria (first milestone):** Extraction output validates against the new schema for the same funder used in Phase 1's exit test, with no loss of information versus the current prompt.
**Size:** L for the rewrite; each additional item type thereafter is roughly S–M depending on complexity (a `data` field is cheap; a conditional branch is not).
**Added 2026-07-10 (`ADR-DATA-007`):** the rewritten extraction prompt and route also cite a specific chunk of the page/section-tagged text (from Phase 1a) for each summary bullet, eligibility criterion, and extracted question — structurally guaranteed to reference real tagged content, never a free-typed guess.

### Phase 3 — Step 4 rendering rework

**What:** Rework the Step 4 UI to walk the graph — respecting visibility conditions (branching, R2), rendering whatever item types exist rather than a flat narrative-card list. First milestone: render exactly what compatibility-mode items produce, matching today's UI. Second milestone onward: add rendering for new item types as Phase 2 adds them (checklist-style reminders for data/date/file/consent items first — cheapest UI addition — then flexible budget shapes, then rubric-coaching display, then the `decision_maker_visible` treatment for R20).
**Why after Phases 1–2:** Nothing to render until the graph and its extraction exist.
**Depends on:** Phase 1; Phase 2 for each new item type as it's added.
**Exit criteria (first milestone):** The same test funder renders identically to its current production behaviour.
**Size:** L for the rework; each new item type's rendering thereafter is S–M.
**Added 2026-07-10 (`ADR-DATA-007`):** rendering also shows each item's guideline reference alongside it, plus a "view original guidelines" panel letting the user click a reference to jump to and highlight the cited page/section. **Corrected 2026-07-14:** built as a plain text panel, not canvas-based PDF rendering as originally assumed here — only extracted text is ever retained, never the raw file (`ADR-DATA-002`). A plain `<iframe>`/`<object>` embed remains ruled out for the original reason (no highlighting API), independent of this correction.

### Phase 4 — Playbook infrastructure and curation workflow

**Superseded 2026-07-14 (`ADR-DATA-006` amendment) — left below as historical record, not built as described.** During the actual `P6.5` design walkthrough, WJ directly challenged this phase's premise: why shouldn't a charity applicant be their own curator? The feature built instead is a private, per-charity, per-funder reuse mechanism with no shared playbook, no curator role, no versioning or approval workflow — see the ADR amendment for the full reasoning. Phase 5 below (which depends on this phase's playbook concept) needs its own re-design as a result.

**What:** A new table (or tables) holding a versioned, reviewed playbook per funder — the graph structure, rubric mapping, budget shape, rules, output mode, manual actions. A lightweight review step (does not need to be a built admin UI initially — a reviewed record WJ approves before a funder is marked supported is enough to start). Runtime switches to: look up an approved playbook first; fall back to live extraction (today's behaviour) if none exists, visibly flagged as unreviewed.
**Why after Phase 1:** A playbook is a saved instance of the item-graph; the graph has to exist first.
**Depends on:** Phase 1.
**Exit criteria:** One funder has an approved, versioned playbook that the live application flow reads instead of running extraction fresh each time.
**Size:** M
**Added 2026-07-10 (`ADR-DATA-007`):** human curation also confirms or corrects each item's guideline citation once per funder before the playbook is approved, rather than trusting a fresh AI guess on every application.

### Phase 5 — Transparency status

**What:** A support-status field per funder/playbook (fully supported / partially supported with flagged gaps / guidance-only, use with caution), surfaced in the Step 1 funder picker and the Step 3 summary screen.
**Why after Phase 4:** Status describes a playbook's state; there's nothing to have a status until playbooks exist.
**Depends on:** Phase 4.
**Exit criteria:** A user can see, before starting an application, how well-supported their chosen funder is.
**Size:** S

### Phase 6 — Funder-by-funder capability extension (ongoing)

**What:** This is not a single phase but the ongoing mode of work once Phases 1–5 exist: each new or re-curated funder pulls in whichever capabilities it actually needs — flexible budget shapes (R6), rubric coaching (R4), the `compose` output mode and document-level limits for proposal-style funders (R18/R19), `link_acceptable` in its replace/supplement modes (R14), `manual_action` tracking (R10), a pre-application fit-assessment stage for no-form funders (R11), and multi-stream selection (R12). Priority is set by the live-testing queue, not built speculatively ahead of need.
**Why last (and ongoing):** Building these before Phase 1–5 exist would repeat Option 2's mistake — bolting capability onto a model not designed to hold it.
**Depends on:** Phases 1–5.
**Exit criteria:** None — this is the steady state the plan is building toward.
**Size:** Variable, funder by funder.

### Parked — Native-document output (R9)

**What:** Correctly filling an arbitrary funder's own Word template or portal fields (Stony Stratford-style), instead of, or alongside, the generic export.
**Why parked, not sequenced:** Section 8 of the proposal already flags this as a distinct, non-trivial technical problem deserving its own design pass. It doesn't block anything else in this plan and nothing else blocks it.
**Amendment (2026-07-11):** declared **permanently out of scope, not deferred** — see `ADR-DATA-006`'s 2026-07-11 amendment and `docs/v1-out-of-scope.md`. The engineering cost of correctly parsing and populating an unbounded, ever-changing variety of funder-specific templates and portal fields was judged disproportionate given the diversity of funder form methods observed across the nine-funder review, and it duplicates a boundary the product already committed to at launch (BD-01 — "preparation tool, not a submission platform"). This will not be picked up in a future phase; the line above is superseded.

### Parked — R16 (scored criteria driven by cross-funder history)

**What:** Supporting criteria like MK Community Foundation's Group Profile Score, which depend on a charity's track record with a specific funder across applications over time.
**Why parked, not sequenced:** This requires reversing BD-06 ("multi-stage applications are separate records; no automated linkage"). That's a business decision, not an engineering task, and it hasn't been made. Do not schedule engineering work here until BD-06 is explicitly revisited.
**Amendment (2026-07-11):** resolved — not via a BD-06 reversal, which turned out not to be the actual barrier (`applications` already carries both `user_id` and `funder_id`, so linking a charity's own applications by funder needs no schema change, just a query). The real barrier is that Grant Pathway has no visibility into funder-side outcome or relationship data (won/lost, prior funding, relationship depth) regardless of linkage. R16 is instead handled as a disclosure — a visible, non-fillable item flagging that the criterion exists and is outside Grant Pathway's control, per the R17 "disclose, don't attempt" pattern. See `ADR-DATA-006` consequence 8 and the BRD's BD-06 note (Section 10). This is now part of the item-graph work (Phase 1 onward), not a separately parked, blocked item.

## 5. Dependency summary

```
Phase 0 (profile schema)  ──────────────────────────────┐
                                                          │ (independent, can run anytime)
Phase 1a (citation groundwork) ──────────────────────────┤ (independent, can run anytime)
                                                          │
Phase 1 (item-graph) ──┬── Phase 2 (extraction) ──┬── Phase 6 (ongoing, funder by funder)
                        │                          │
                        └── Phase 3 (Step 4 UI) ───┤
                                                    │
                        Phase 4 (playbooks) ────────┼── Phase 5 (transparency)
                                                    │
Parked: native-document output (R9) ────────────────┘  (permanently out of scope, 2026-07-11 -- will not be built)
R16 (scored cross-funder criteria) -- resolved 2026-07-11 via disclosure, not parked -- see Phase 1 onward
```

## 6. What this plan deliberately does not do

- It does not estimate calendar time. Sizes (S/M/L/XL) are relative effort, not durations.
- It does not resequence around a specific funder's deadline — Phase 6 exists precisely so that real testing priorities can drive order without disturbing Phases 0–5.
- It does not design native-document output — permanently out of scope as of 2026-07-11, not a future design task. The BD-06/R16 tension referenced here originally is resolved (see the R16 amendment above) — it required no BD-06 reversal after all.
- It does not replace the ADR this recommendation should get before Phase 1 begins in earnest (see Section 2).
