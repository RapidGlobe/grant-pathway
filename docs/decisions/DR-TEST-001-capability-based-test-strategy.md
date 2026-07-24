# DR-TEST-001 — Capability-Based Test Strategy

**Date:** 2026-07-24
**Status:** Decided ✓
**Author:** Rapidglobe Ltd

---

## Question

Should `docs/Test Plans/` continue to be organised as one near-identical end-to-end plan per named funder, or restructured around the capabilities and guideline shapes the product actually varies on?

---

## Context

The test suite in `docs/Test Plans/` was built funder-by-funder from 2026-06-01 onward, on the premise that Grant Pathway's functionality needed proving against a specific, curated set of approved funders (`DR-FD-001` v1.0–v1.2). Each plan repeats the same ~11-step walkthrough — registration, charity profile, funder selection, guidelines upload, AI summary, preparation checklist, Q&A writing, assembly, export — against a different funder's guidelines document.

That premise no longer holds. `DR-FD-001` v1.4 (2026-07-15) removed the funder picker/directory entirely: Step 1 is now free text, and extraction is driven per-application by whatever guidelines are uploaded or pasted, not by funder identity (`BD-04`; `ADR-DATA-006`'s "any guideline or form" direction). Testing by funder name when the product deliberately no longer varies on funder identity means the suite validates the wrong axis, at real ongoing cost: 13 plans mean every mechanical or copy change (the Step-4/5 step-order bug, the funder-picker removal, the v1.19 guide drift found 2026-07-24) has to be corrected in as many places.

A live review of `AB-Charitable-Trust-test-plan.md` against the current service (2026-07-24) surfaced this directly: the plan still tested the removed funder picker, and separately, its ABC-04 eligibility-mismatch case assumed mismatch was a soft, non-blocking observation — contradicted by `DR-EL-001` (2026-06-02), which made it a hard stop with no path to Step 4. That hard stop structurally conflicts with the same plan's later steps (write, assemble, export), which assume the same application continues past Step 3. The conflict exists in every funder plan that pairs a deliberately-mismatched charity/funder combination with full end-to-end coverage.

---

## Options Considered

| Option | Description                                                                                                                                    | Outcome                                                                                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Leave the structure as-is; correct each plan's drift line-by-line                                                                              | Rejected — treats the symptom (stale steps), not the cause (wrong test axis); the same drift recurs on the next UI change                                                      |
| 2      | Capability/shape-based restructuring: a small number of guideline-shape and capability plans, plus a small number of flagship end-to-end plans | **Selected**                                                                                                                                                                   |
| 3      | Drop funder-specific testing entirely, rely only on the mechanical regression plan                                                             | Rejected — loses coverage of AI extraction accuracy, citation quality, and eligibility judgement, none of which the regression plan (`regression-test-plan.md`) claims to test |

---

## Decision

Restructure `docs/Test Plans/` into three layers:

1. **Mechanical regression** (`regression-test-plan.md`, unchanged) — is the app itself alive: auth, session, export machinery. Extended with a new Charity Commission lookup case (found/not-found), previously untested anywhere.
2. **Guideline-shape / capability matrix** (new — `guideline-capability-matrix-test-plan.md`) — a deliberately varied set of guideline _shapes_ (numbered-list PDF, multi-column table PDF, freeform narrative Word, pasted-text-only, mixed financial+governance+narrative+file-upload, one large/long document) plus a citation-coverage spot-check, using existing real funder documents as fixtures without claiming to validate that funder specifically.
3. **Eligibility check** (new — `eligibility-check-test-plan.md`) — three varied cases (clear positive match, clear negative hard-stop, borderline/ambiguous calibration check), run once rather than manufactured inside every funder plan. Three cases, not one, because a single pass/fail proves the hard-stop _mechanism_ works but says nothing about whether the AI's eligibility _judgement_ is well-calibrated across different framings — that is a model-quality question and needs more than one data point (WJ, 2026-07-24).

Two funders are retained as **flagship end-to-end plans**, run in full (registration through export): **A B Charitable Trust** (structured numbered-list PDF, tightest word limit tested, weak governance signal) and **MK Community Foundation — Oak Grants** (mixed document, strong governance/financial signal, character limits). Chosen because together they cover both extraction paths' user experience, both limit types, and the governance/financial path, with the least overlap between them — not because either funder is otherwise special.

The remaining 11 named-funder plans (Baily Thomas, Clothworkers, CPF Trust, Garfield Weston, Henry Smith Holiday Grants, Henry Smith Proud Homes, Idlewild Trust, Lloyds Bank Foundation, Nationwide Building Society, Walton Charity, Wolfson Foundation) are archived to `docs/Test Plans/archive/`. Their genuinely useful defect history (Idlewild's D-IT-01 multi-column extraction failure, the origin of `DR-EL-001`'s IT-04 case, Wolfson's citation-fallback and section-count-drift findings) is preserved via pointers in the new capability/eligibility plans rather than lost.

---

## Rationale

- The product's differentiator is now "any guideline or form," not "these named funders" — the test suite should validate the thing that varies (document shape, extraction capability, eligibility judgement), not the thing that no longer does (funder identity).
- Repeating the same ~11-step walkthrough 13 times is expensive to maintain and was already causing drift (this plan's own history: the step-order bug fixed across 11 plans; the funder-picker removal missed in at least one).
- Real, currently-untested gaps exist — pasted-only guidelines as a first-class path (not a fallback), citation coverage, large-document truncation, Charity Commission lookup — that the capability matrix closes directly.
- The eligibility hard-stop (`DR-EL-001`) structurally conflicts with full end-to-end coverage when manufactured inside a funder plan; a dedicated plan removes the conflict rather than working around it per funder.
- This is a real trade-off, not a strict improvement: it gives up a direct, per-funder answer to "does funder X specifically still work" in exchange for cheaper maintenance and closed capability gaps. Accepted knowingly (WJ, 2026-07-24) — the shape/capability abstraction is a bet that could miss a funder-specific issue its shape-twin doesn't have.

---

## Consequences

### Immediate

1. `AB-Charitable-Trust-test-plan.md` and `MK-Community-Foundation-test-plan.md` rewritten as flagships against the current service and `grant-pathway-user-guide-v1.19.docx`.
2. New `guideline-capability-matrix-test-plan.md` and `eligibility-check-test-plan.md` created.
3. `regression-test-plan.md` extended with a Charity Commission lookup case.
4. 11 named-funder plans moved to `docs/Test Plans/archive/`.
5. `TEST-DASHBOARD.md` restructured: funder-by-funder tracking table replaced with a capability/shape coverage table (extending the model already introduced by the governance/reserves coverage table, 2026-07-16) plus the two flagship rows.
6. `AGENTS.md`'s "Test plans — mandatory coverage rule" rewritten: full end-to-end coverage remains mandatory for the two flagships and at least one capability-matrix path; individual matrix/eligibility cases may share a pre-seeded account rather than re-registering each time, matching the pattern `regression-test-plan.md` already uses.

### Not in scope for this decision

- Changing which funders are supported in production — this is a test-strategy decision only, not a product/eligibility change.
- Retiring the `funders` table or any code touched by `DR-FD-001` — already covered there.
- A fixed, closed taxonomy of guideline shapes — the matrix may need new shapes added as real documents surface ones not yet represented.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                    |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | Initial decision — capability-based test strategy adopted, replacing the funder-by-funder model. Raised during a live review of `AB-Charitable-Trust-test-plan.md` against `grant-pathway-user-guide-v1.19.docx` and the current service. |
