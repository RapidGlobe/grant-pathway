---
id: ADR-DATA-006
category: Data
status: Decided
---

# ADR-DATA-006 — Application Item-Graph Model

## Context

ADR-DATA-001 modelled a grant application as a normalised list of question/answer rows (`application_answers`): free text, a word limit, and — added later — a boolean `is_budget_question` flag. This assumed every funder's requirements reduce to a flat list of narrative-shaped questions.

A structured review of nine funders' actual guidance and application materials (Idlewild, Clothworkers, Henry Smith, Stony Stratford, Walton Charity, Lloyds Bank Foundation, MK Community Foundation, Garfield Weston, Heritage Fund — full findings in `docs/BRD plus decisions Mark Two/question-coverage-analysis.md`) found that assumption false in twenty distinct, recurring ways (R1–R20, catalogued in `docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md` §4). In summary, real funder requirements include:

- A mix of narrative and non-narrative fields inside one form (R1), sometimes 75%+ non-narrative
- Forms that branch by an earlier answer or the applicant's own status (R2), including multi-stage programmes reviewed months apart (R3)
- Published scoring rubrics that should coach how a narrative answer is written (R4), including items with no corresponding question at all, scored from cross-application history (R16)
- Sensitive data requiring no-default, consent-first handling (R5)
- Budgets in at least four distinct shapes, or no budget at all (R6, R15)
- Guidance split across multiple documents, some not bundled with what's uploaded, including references to sibling programmes never described (R7)
- Rules that range from hard/mechanical to fuzzy/judgement-based, never safely conflated (R8)
- Funder-native output as the actual required submission, not a generic export (R9)
- Manual actions (signatures, mandatory pre-application calls) Grant Pathway can never complete on the applicant's behalf (R10)
- Guidance with no extractable form at all, requiring prose-based fit judgement before any form exists (R11), sometimes across several overlapping funding streams with no clean branch between them (R12)
- Eligibility depending on derived metrics or governance facts the current charity profile does not capture (R13)
- Answer types beyond written prose — a link in place of, or alongside, narrative (R14)
- Items of unequal importance, where only one piece of content reaches an actual human decision-maker (R20)

This directly affects DR-FD-001's `funder_type` (`structured`/`narrative`) concept, already found in that record's 2026-07-04 amendment to not reflect a stable property of any funder, and left in the `funders` table, unused, as low-priority cleanup. This ADR supersedes that concept rather than repairing it.

## Options Considered

- **Option 1 — Universal Item Graph:** Model an application as a graph of typed items (narrative, data, date, number, table, file, consent, eligibility gate, scoring criterion, manual action), each carrying a visibility condition, a source of truth, a hard/judgement validation mode, an optional rubric-criterion link, a decision-maker-visibility flag, and an output mapping. The only representation under consideration that makes every R1–R20 finding a combination of existing primitives rather than a new special case. Large build; correctness depends entirely on the accuracy of whatever populates the graph.
- **Option 2 — Bolt-On Modules:** Independent modules (eligibility assistant, non-narrative checklist, budget helper, rubric-coach, native-output mode, history tracker) added piecemeal to the existing narrative-only core. Cheapest to start, but this is what BD-03/BD-04/BD-07 already were — separate, uncoordinated attempts at pieces of this same problem — and BD-08 already had to retire one of them (the funder-type badge) once it collided with a case it wasn't built for.
- **Option 3 — Curated Funder Playbooks:** Represent each funder as a one-time, AI-drafted, human-reviewed record (its item graph, rubric mapping, budget shape, rules, output mode) rather than trusting a fully automated extraction pipeline to correctly infer branching logic, scoring rubrics, and mandatory human gates unsupervised. Bounded by curation capacity, not engineering capacity.
- **Option 4 — Declared Scope Boundary:** Define a small number of supported application shapes and tell the user plainly when a funder falls outside them, rather than attempting full coverage. Cheapest and most honest, but narrows real-world usefulness — every funder in the review above was reviewed precisely because it didn't fit the previously assumed shape.

Full descriptions, advantages, and disadvantages for each: `docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md` §5.

## Decision

**A combination, not a single option: Option 1's typed item-graph as the data model, populated the Option 3 way (AI-drafted, human-reviewed playbooks per funder), with Option 4's transparency principle applied unconditionally on top.**

Every funder Grant Pathway supports carries a visible status (fully supported / partially supported with flagged gaps / guidance-only, use with caution) so the product never silently overclaims what has actually been verified for that funder. Option 2 (bolt-on modules) is explicitly rejected as the default failure mode this decision is meant to avoid repeating.

This replaces `application_answers`' flat structure (ADR-DATA-001) and formally retires the unused `funder_type` column (DR-FD-001) rather than leaving it as low-priority cleanup — question-level typing, not funder-level typing, was always the correct axis (BD-04), and this decision is that axis fully realised.

## Rationale

- Twenty distinct requirements from nine funders in one review is itself evidence a narrow, field-by-field fix will keep breaking, as it already has three times (BD-03, BD-04, BD-07, and BD-08's retirement of the funder-type badge).
- A single canonical representation is the only way to answer "did we cover everything this funder asks for" for any given funder — a question nothing currently built can answer even once.
- Reliability matters more than raw extraction coverage for a free, trusted service: a human-reviewed playbook catches genuinely novel structures (a mandatory pre-application call, a scoring rubric, a native-document requirement) that an unsupervised pipeline would otherwise guess at silently and sometimes wrongly.
- The recommendation was stress-tested against two funders after being drafted (Garfield Weston, Heritage Fund) specifically to check whether it would hold or need revision. It absorbed both with incremental additions (R18–R20) rather than a rewrite — the outcome this kind of model is meant to produce when it meets a new funder.
- This is deliberately in the spirit of the "narrow now, architect for broad" product-scope decision made the same day: a small number of funders get a fully curated, trustworthy playbook first, while the underlying model does not need to be redesigned as the next unfamiliar funder shape turns up.

## Consequences

Full phased sequencing: `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md`. Summary of binding consequences:

1. **`application_answers` is superseded**, not extended. A new item-graph schema replaces it; compatibility mode (today's item types only, in the new shape) must be proven against one existing funder with zero behavioural regression before any other funder is migrated (build plan Phase 1).
2. **The extraction prompt (`lib/prompts.ts`) must be rewritten**, not extended — it currently explicitly forbids extracting conditional questions and discards every non-narrative field by design, which is the opposite of what this decision requires (build plan Phase 2).
3. **Step 4 rendering must be reworked** to walk a graph rather than a flat list (build plan Phase 3).
4. **A new playbook store and review workflow must be built** — the `funders` table currently has no per-funder configuration beyond a name, category label, grant range, and a URL (build plan Phase 4).
5. **`funders.funder_type` is formally superseded by this decision.** The column may now be dropped as part of the Phase 1 migration rather than retained as unused cleanup (updates DR-FD-001's consequence 1).
6. **The charity profile schema must be extended** with governance facts and derived-metric inputs (R13) — additive, independent of the item-graph, can proceed in parallel (build plan Phase 0).
7. **Native-document output (R9)** is explicitly parked as its own design problem, not solved by this decision.
8. **R16** (scoring criteria driven by cross-application history with a specific funder) is explicitly **not** actioned by this decision — it requires reversing BD-06 ("multi-stage applications are separate records; no automated linkage"), which is a business decision, not an engineering one, and has not been made. No engineering work should be scheduled against R16 until BD-06 is explicitly revisited.
9. **`docs/data-model.md` and `docs/Technical Decision and Design/technical-design.md`** must be updated to reflect the new schema once Phase 1 lands (not yet — this ADR records the decision; the schema does not exist until built).

**Amendment (2026-07-05, same day):** WJ decided this rearchitecture (build plan Phase 0–6, tracked as `IMPLEMENTATION-PLAN.md` P6.1–P6.7) must complete before Grant Pathway launches — reversing the initial framing that Phase 6 was a parallel, non-gating track. Rationale: launching on the current flat model while knowingly aware of R1–R20 (in particular, non-narrative fields being silently invisible to the user) risks the "trusted partner" objective more than a later launch does. There is no commercial deadline forcing 31 July 2026, so the cost of waiting is acceptable; the cost of a trust failure is not. A **Phase 6 → Go-Live Gate** requiring P6.1–P6.6 complete (P6.7 is ongoing by design and does not block) has been added to `IMPLEMENTATION-PLAN.md`, immediately before P5.6 (DNS and Go-Live). Target launch is no longer 31 July 2026; working estimate is August–September 2026, not committed.

## Source

`docs/BRD plus decisions Mark Two/question-coverage-analysis.md` (nine-funder findings), `docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md` (options, requirements R1–R20, recommendation), `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md` (phased sequencing). Supersedes ADR-DATA-001 (`application_answers` structure) in part; supersedes DR-FD-001's `funder_type` concept.

## Date Decided

2026-07-05
