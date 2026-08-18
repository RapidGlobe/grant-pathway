# Phase 6 Coverage Review — P5.5 Item 2 Prerequisite

**Tier:** 2
**Volatility:** Medium
**Update when:** A finding below is actioned, or the test suite's Phase 6 coverage changes

**Created:** 17 August 2026
**Purpose:** `IMPLEMENTATION-PLAN.md` P5.5 item 2 requires the test plans to be refreshed **before** the production runs in item 1, on the stated grounds that Phase 6's features are barely covered. That statement was verified on **2026-07-30**. This review re-checks it against the plans as they stand today, because acting on a two-and-a-half-week-old coverage claim is exactly the drift `DR-TEST-001` exists to prevent.

**Status:** Analysis only. **No test plan has been edited.** One finding needs a decision before any plan changes.

---

## Headline — the prerequisite's premise is mostly out of date, but it is hiding one real gap

P5.5 item 2 says: _"Phase 6's features are barely covered: verified 2026-07-30, **governance facts appear in only one plan** (AB Charitable Trust) and citations in three. The features gating launch are the least-tested part of the service."_

**Both figures have since been overtaken by work done in August.** Governance facts and citations are now substantively covered in three plans each, as test cases with recorded results — not passing mentions. The August runs (MKCF's June-2026 re-run, the GCM-06/07 live re-runs, `GAP-90`'s fix) closed most of this gap without anybody updating the P5.5 wording.

**But one Phase 6 feature is genuinely untested by the functional suite, and it is not the one the plan warns about.**

---

## Coverage as it stands

| Phase 6 feature                            | Covered where                                                                | Assessment                                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Governance facts** (`PDR-AI-008`)        | `ABC-06`, `MKCF-06`, `GCM-06`/`GCM-07`                                       | ✅ **Well covered.** Three plans, with real counts recorded and `GAP-90` found by one of them     |
| **Guideline citations** (P6.3/P6.4)        | `ABC-08`, `MKCF-07`, `GCM-05`                                                | ✅ **Covered.** MKCF-07's 2026-08-14 run checked citations question-by-question, not a spot-check |
| **Item graph** (P6.2)                      | No plan names it; behaviour tested via `ABC-06`, `MKCF-06`, `GCM-01`–`07`    | 🟡 **Covered in substance, invisible by name** — see note below                                   |
| **Non-narrative filtering**                | `MKCF-06`, `GCM-06`                                                          | ✅ Covered                                                                                        |
| **Eligibility hard-stop** (`FR-47`)        | `eligibility-check-test-plan.md` (`EL-01`–`EL-03`), plus flagship references | ✅ Covered — its own plan                                                                         |
| **Reuse of a previous application** (P6.5) | **Nowhere in the functional suite** — see Finding 1                          | 🔴 **Gap**                                                                                        |

**On the item graph:** the term appears in no test plan, and its only occurrence anywhere in `docs/Test Plans/` is a single line in `regression-test-plan.md`. That is **not** the same as untested — the item graph is the data structure behind the Step 4 question cards, and the card counts asserted throughout `GCM` and both flagships exercise it thoroughly. Recorded here so a future reader does not mistake the naming absence for a coverage absence, and does not "fix" it by bolting on a redundant case.

---

## Finding 1 — P6.5's reuse path has no positive test anywhere in the functional suite

**This is the one real gap, and it is the inverse of what P5.5 currently warns about.**

Both flagships mention reuse, and **both mention it only to assert it does not appear**:

- `AB-Charitable-Trust-test-plan.md:129` — _"No 'reuse a previous application' prompt appears (this is a fresh account's first application…)"_
- `MK-Community-Foundation-test-plan.md:171` — _"No 'reuse a previous application' prompt (fresh account, no prior applications)"_

Both assertions are correct and worth keeping. But they test the feature's **absence**. Nothing in `regression-test-plan.md`, either flagship, the capability matrix or the eligibility plan tests that reuse **works**.

The only place the reuse path has ever been driven end to end is **`accessibility-test-plan.md`'s AC-14 (Redundant Entry)**, on 2026-08-12. That run was genuine and thorough — two applications to the same funder, carried-over extraction and carried-over approved answer text, verified via the field's live `.value`. But:

1. It was run against **`grant-pathway-dev`**, like everything else in the suite.
2. It is an **accessibility** case. Its pass criterion is WCAG 3.3.7 Redundant Entry, not functional correctness. If the reuse feature broke in a way that still avoided re-asking the user for information, AC-14 could still pass.
3. **P5.5 item 1 does not require the accessibility plan to prove functional behaviour** — and nobody reading the functional plans would know the reuse path had only ever been exercised by an accessibility case.

**Why this matters for launch specifically:** `IMPLEMENTATION-PLAN.md` states that Phase 6 — of which P6.5 is part — is the reason the go-live gate exists at all. Going into the production test runs, the functional suite would prove every Phase 6 feature except this one.

✅ **DECIDED 2026-08-17 (WJ): option A** — the positive reuse case goes into `regression-test-plan.md` as a new `RT-` case. ✅ **Written the same day as `RT-16` in `regression-test-plan.md`** — nine steps, on the pre-seeded account, with step 5 (no AI re-generation) called out as the one easiest to wave through. **Never run**; it executes as part of `P5.5` item 1 against production. The options are kept below as the record of what was weighed.

**Decision needed before I write anything:** where should the positive reuse case live?

| Option                                                              | Argument                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — new case in `regression-test-plan.md`** _(my recommendation)_ | Reuse is funder-agnostic mechanics, which is exactly what the regression plan covers. It already runs on a pre-seeded account, and reuse needs a prior application — so the seeded account is a natural fit rather than an awkward one. Lowest disruption to the flagships.      |
| **B — extend both flagships**                                       | The flagships are the plans required to run end-to-end with no step omitted. But reuse needs a **second** application to the same funder, so it would extend both flagship runs materially — and `DR-TEST-001` deliberately concentrated full coverage rather than spreading it. |
| **C — leave it to AC-14 and note the reliance**                     | Cheapest. But it leaves a launch-gating feature proven only by an accessibility case, which is the kind of thing this project keeps finding and regretting.                                                                                                                      |

---

## Finding 2 — two stale figures in P5.5's own wording

Both should be corrected in `IMPLEMENTATION-PLAN.md` so the next reader is not working from numbers that were true in July.

| P5.5 says                                        | Actually                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| "governance facts appear in only one plan"       | **Three plans**, as cases with recorded results                                        |
| "citations in three"                             | Still three, but the depth has changed — MKCF-07 now checks question-by-question       |
| "refresh the user guide, which is still at v1.3" | The user guide is at **v1.19** (`docs/User Guide/grant-pathway-user-guide-v1.19.docx`) |

The user guide figure is the one worth pausing on. **"Still at v1.3" was the stated reason to refresh it**, and that reason no longer holds — sixteen revisions have landed since. Whether it needs a Phase 6 refresh is now an open question rather than a settled one, and it needs someone to open the document and judge. I have not: it is a `.docx`, and its content is a product-voice decision rather than a mechanical check.

---

## What I have not done

- **No test plan edited.** Finding 1 needs the A/B/C decision first.
- **No `IMPLEMENTATION-PLAN.md` edit.** Finding 2's corrections are straightforward, but P5.5's text is the task specification for work about to be executed, and I would rather change it with you than behind you.
- **No user guide review.** See above.
- **`TEST-DASHBOARD.md` untouched** — nothing here changes any plan's RAG status. The suite remains 7 🟢, all earned against dev.

---

## Recommended order when you're back

1. Decide Finding 1 (A / B / C).
2. I write the case, refresh the affected plan, and correct P5.5's two stale figures.
3. You judge whether the user guide needs a Phase 6 pass.
4. Only then does item 1 — the production runs — become worth starting.
