# Guideline Capability / Shape Matrix — Test Plan

**Tier:** 2 — Check if relevant
**Volatility:** Medium
**Update when:** A new guideline shape is encountered that isn't represented below, or the extraction/citation pipeline changes

**Version:** 1.3
**Date:** 2026-07-28
**Status:** Fully executed 2026-07-27 — GCM-01 through GCM-05 all Pass. One real defect found and fixed same session (GCM-01, table-format budget-question skip-list); two observations logged, not actioned that session (GCM-03 aggregate word limit; a non-deterministic eligibility verdict found alongside GCM-01) — see Defect Log. Both since built 2026-07-28, pending live verification: Defect #2 (non-deterministic eligibility verdict) and Defect #3 (aggregate word-limit counter).
**Tester:** WJ

---

## Purpose

Grant Pathway's value proposition is now "any guideline or form" (`ADR-DATA-006`; `DR-FD-001` v1.4), not a curated list of named funders. This plan tests the dimension the product actually varies on — **the shape of the guidelines document and the extraction path it exercises** — using real funder documents as fixtures, without claiming to validate that funder specifically. Naming a funder here is incidental to the shape it happens to provide.

Two shapes are **not** repeated here because the two flagship plans already cover them end-to-end:

- **Numbered-list PDF (structured)** — covered by `AB-Charitable-Trust-test-plan.md`
- **Mixed financial + governance + narrative + file-upload** — covered by `MK-Community-Foundation-test-plan.md`

This plan covers everything else: the harder multi-column structured shape, the freeform/no-discrete-questions shape, the paste-only path, a large-document truncation check, and a citation-coverage spot-check across whichever of the above are run.

Individual cases here may reuse a pre-seeded account rather than registering fresh each time, following the pattern already established in `regression-test-plan.md` — registration/profile mechanics are not the point of this plan and are covered by the two flagships and `regression-test-plan.md` itself.

---

## Test Data

| Case   | Shape                                     | Fixture document                                                                                                                           | Notes                                                                                                      |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| GCM-01 | Multi-column table PDF                    | `docs/Grant Org Guidelines/idlewild-arts-application-questions-dec2025.pdf` (Idlewild Trust)                                               | Previously caused D-IT-01 (extraction failure) — confirm it stays fixed                                    |
| GCM-02 | Freeform narrative, no discrete questions | `docs/Grant Org Guidelines/garfield-weston-foundation-application-guidelines-2026.pdf` (Garfield Weston)                                   | Tagged in prior funder-catalogue work as "primary test for free-form path"; has known citation-fix history |
| GCM-03 | Pasted-text-only, no file at all          | CPF Trust's 500-word email application guidance (no PDF/portal exists for this funder — paste is the only input method, not a fallback)    | Application window 1 Jun–30 Sep; confirm still open before running                                         |
| GCM-04 | Large/long document (truncation check)    | `docs/Grant Org Guidelines/clothworkers-open-grants-guidance-and-sample-forms.pdf` (largest guideline document in the corpus by file size) | See `ADR-AI-007` (context window management) for the truncation logic being exercised                      |
| GCM-05 | Citation coverage (spot-check)            | Reuses whichever of GCM-01/02/04 produced citation badges                                                                                  | Not exhaustive — see the established testing limitation on hallucination/citation checking (`DR-AI-003`)   |

---

## Test Results Summary

| Test ID | Test Name                                      | Result        | Notes                                                                                                    |
| ------- | ---------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| GCM-01  | Multi-column table PDF — extraction robustness | Pass (caveat) | Real defect found and fixed same session — see Defect Log #1. Charity: National Opera Studio             |
| GCM-02  | Freeform narrative — no discrete questions     | Pass          | Charity: National Opera Studio (same account)                                                            |
| GCM-03  | Pasted-text-only as a first-class path         | Pass (caveat) | Section-count expectation outdated (see case Notes); aggregate word-limit gap logged — see Defect Log #3 |
| GCM-04  | Large document — truncation behaviour          | Pass          | New charity used (Bridge Support MK, per archived Clothworkers plan)                                     |
| GCM-05  | Citation coverage spot-check                   | Pass          | Sampled from GCM-04 (5 citations, all correct)                                                           |

---

## Defect Log

| ID  | Test   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Severity | Status                                                 |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------ |
| 1   | GCM-01 | A project funding-amount question ("State the total amount of funding you are requesting...") was silently missing from Step 4. Root cause: `lib/prompts.ts`'s TABLE FORMAT rule (used for table-structured guidelines) had its own numeric-type skip-list with no budget-question exception, distinct from the general exclusion rule fixed earlier the same day for MK Community Foundation. See `CHANGELOG.md` 2026-07-27.                                                                                                                                                                    | Medium   | Fixed and live-verified same session (12→13 questions) |
| 2   | GCM-01 | Eligibility verdict was non-deterministic on identical input: National Opera Studio against Idlewild Trust Arts failed the eligibility check on one run, then passed on an immediate retry with no profile changes made. Root-caused 2026-07-28: `temperature: 0` was already set — Bedrock does not guarantee bit-identical output across separate calls even at temperature 0 (batched-inference floating-point non-determinism, not fixable in application code). Fixed with a second confirming call before a `true` verdict is trusted (`PDR-AI-011`, `app/api/generate-summary/route.ts`). | Medium   | Fixed 2026-07-28, pending live verification            |
| 3   | GCM-03 | CPF Trust's guidance states a 500-word limit across the whole application, but the AI split the application into 3 sections, none of which show a word-limit badge — the app has no way to represent or enforce a limit shared across multiple extracted sections. Fixed with a new `overallWordLimit` extraction field plus a live combined counter across the linked sections, soft nudge only, never a hard block (`PDR-AI-012`, `components/application-step4-draft.tsx`).                                                                                                                   | Low      | Fixed 2026-07-28, pending live verification            |

---

## Test Cases

---

### GCM-01 — Multi-Column Table PDF — Extraction Robustness

**Prerequisite:** Signed in, existing or new application. Funder: "Idlewild Trust", grant name: "Capability Matrix — Multi-Column PDF".

**Background:** Idlewild Trust's arts application questions PDF uses a multi-column table layout, which previously caused a real extraction failure (D-IT-01) before the extraction prompt was fixed. This case exists to confirm that fix still holds against this exact shape, independent of anything to do with Idlewild as a funder.

**Steps:**

1. Upload `idlewild-arts-application-questions-dec2025.pdf` at Step 2
2. On Step 3, confirm the AI summary generates without error and reflects the document's actual content
3. Continue to Step 4 and confirm narrative questions are extracted correctly, in the right order, without column-crossing corruption (e.g. a question's text merged with an adjacent column's content)
4. Confirm character limits (this document uses character limits, not word limits) are extracted correctly

**Expected result:**

- Clean extraction — no repeat of D-IT-01
- Question text is coherent and not merged across table columns
- Character limits correctly typed as "characters," not "words"

**Result:** ☒ Pass (caveat) &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Tested against **National Opera Studio** — Harry's Rainbow (used for this case in earlier sessions) was never a genuine match for Idlewild Arts' early-career-professional-development remit and has already failed elsewhere (AB Charitable Trust) for the same reason. Character limits correctly typed throughout (e.g. 1600 characters on the project-description question). Found a real defect: Q24 ("State the total amount of funding you are requesting...") was missing entirely — root-caused to a table-format-specific skip-list gap, fixed and confirmed live (12→13 questions, Q24 present and budget-flagged). See Defect Log #1. Separately, the eligibility check gave a different verdict (fail, then pass) across two runs with an unchanged profile — see Defect Log #2, not investigated tonight.

---

### GCM-02 — Freeform Narrative — No Discrete Questions

**Prerequisite:** Signed in, existing or new application. Funder: "Garfield Weston Foundation", grant name: "Capability Matrix — Freeform Narrative".

**Background:** Garfield Weston's guidelines describe a 10-page proposal responding to published headings, not a numbered question list. This exercises the `free_form` extraction path (as opposed to `structured`) — the AI must derive its own section breakdown from prose guidance rather than lifting an existing numbered list.

**Steps:**

1. Upload `garfield-weston-foundation-application-guidelines-2026.pdf` at Step 2
2. On Step 3, confirm the summary includes the **Application sections** card (this only renders for `free_form`-classified funders — its presence here is itself part of what's being tested)
3. Continue to Step 4 and confirm the sections presented correspond to the guidelines' published headings, not an invented or generic structure
4. Confirm citation badges are present on at least some sections (this document has a known prior citation-fix history — see GCM-05)

**Expected result:**

- Application sections card present and populated
- Step 4 sections map sensibly onto the guidelines' actual headings
- No fabricated section headings not present in the source document

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Same account/charity (National Opera Studio) as GCM-01. 10 sections identified, mapping sensibly onto Garfield Weston's published headings — no fabricated structure. Clean result.

---

### GCM-03 — Pasted-Text-Only as a First-Class Path

**Prerequisite:** Signed in, existing or new application. Funder: "CPF Trust", grant name: "Capability Matrix — Paste-Only Path". Confirm CPF Trust's 1 June–30 September application window is currently open before running.

**Background:** CPF Trust has no downloadable guidelines document at all — its entire application is a 500-word email, with criteria published only on its website. Every other case in this suite uploads a file; this is the one guideline shape that can **only** be tested via paste, making it the natural fixture for treating paste as a first-class path rather than a PDF-extraction-failed fallback.

**Steps:**

1. At Step 2, click the **Paste text** tab (not Upload a file) and paste CPF Trust's published criteria and application guidance directly
2. Click **Continue**
3. On Step 3, confirm the AI summary generates correctly from pasted text alone — no file was ever uploaded
4. Continue to Step 4 and confirm the writing interface presents a **single narrative card** (matching CPF Trust's actual single-block email format), not multiple discrete question cards
5. Confirm a 500-word limit badge is shown and the counter tracks correctly

**Expected result — superseded 2026-07-27, see Notes:**

- Paste-only input produces a working AI summary with no file present at any point
- ~~Step 4 shows one narrative card, correctly reflecting the single-block email format~~ — this assumption came from the archived plan's oversimplified characterisation, not the funder's actual guidance text; see Notes
- 500-word limit correctly extracted and displayed — **gap found, see Defect Log #3**

**Result:** ☒ Pass (caveat) &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** CPF Trust's real guidance lists 5 named pieces of information the email must include, not a single free-flowing prompt — the AI correctly produced 3 sections reflecting that structure (merging charity name+description, keeping the core "how the grant would be used" narrative, and splitting out "grant amount requested" as its own budget-flagged section), correctly excluding contact details and the two attachment requirements. This is a better representation of the source than one undifferentiated card would be — the "single card" expectation above is now known to be based on an inaccurate assumption, not a real requirement, and is left struck through rather than deleted. However, none of the 3 cards shows the guidance's stated 500-word **total** limit — see Defect Log #3, fix agreed (a live combined counter) but deferred to a future session.

---

### GCM-04 — Large Document — Truncation Behaviour

**Prerequisite:** Signed in, existing or new application. Funder: "Clothworkers' Foundation", grant name: "Capability Matrix — Large Document".

**Background:** `clothworkers-open-grants-guidance-and-sample-forms.pdf` is the largest guideline document in `docs/Grant Org Guidelines/` by file size. Large guidelines risk hitting the context-window/truncation logic described in `ADR-AI-007` — this case checks that truncation, if it occurs, is marker-aware (per the P6.2a fix) rather than silently cutting off mid-question.

**Steps:**

1. Upload the Clothworkers guidance PDF at Step 2
2. On Step 3, confirm the AI summary generates without error or timeout
3. Continue to Step 4 and confirm the full set of expected questions/sections is present — cross-check against the document's actual contents for any section that appears to be missing or cut short
4. If anything is missing, check whether it falls after a point in the document consistent with a truncation boundary

**Expected result:**

- Summary and extraction complete without error
- No question or section silently missing in a way consistent with mid-content truncation
- If truncation does occur, it happens at a sensible boundary (not mid-sentence or mid-question), per the marker-aware truncation fix (P6.2a, 2026-07-14)

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** National Opera Studio doesn't genuinely fit Clothworkers' 10 disadvantage/marginalisation programme areas (capital projects only), so a different charity was needed — used **Bridge Support MK** (young people facing economic disadvantage/homelessness risk, Milton Keynes) per the archived `Clothworkers-Foundation-test-plan.md`, matching Clothworkers' Young People Facing Disadvantage / Homelessness / Economic Disadvantage categories. The truncation warning appeared as expected (document is the largest in the corpus) and was marker-aware, per `ADR-AI-007`/P6.2a — it correctly located and prioritised the actual application form (pages 21–24) rather than cutting off mid-content. All 13 extracted questions cross-checked directly against the source PDF (pages 21–24): every citation, quote, and stated word limit matches exactly, no hallucinations found.

---

### GCM-05 — Citation Coverage Spot-Check

**Prerequisite:** At least one of GCM-01, GCM-02, or GCM-04 complete, with citation badges visible on some Step 4 answers or AI suggestions.

**Background:** This is a spot-check, not exhaustive verification — per the established testing limitation (`DR-AI-003`; also noted in the retired MKCF and AB plans), a human reviewer cannot rigorously verify "no hallucinated conditions" against a large guidelines document. What **can** be checked directly: does a citation badge, when clicked, actually point to a real, correctly-highlighted passage in the source document.

**Steps:**

1. Across the cases run above, identify 3–5 citation badges on different Step 4 answers or suggestions
2. Click each one and confirm the guidelines viewer opens, scrolled to and highlighting the cited passage
3. Read the highlighted passage and confirm it plausibly supports the claim or suggestion the citation is attached to
4. Note any badge that opens with no highlight, lands on the wrong page, or points to a passage that doesn't support the claim

**Expected result:**

- All sampled citations open with a correct highlight
- Highlighted passages plausibly support their attached claim
- Any failure is logged as a defect with the exact question, funder document, and citation text

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which citations were sampled and from which case):** Sampled from GCM-04 (Clothworkers): 5 citations checked directly against the source PDF's pages 21–24 (annual expenditure, community description, org summary, lived-experience leadership, project description). All 5 opened with a correct highlight, on the correct page, supporting their attached question — no defects found.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3     | 2026-07-28 | Rapidglobe Ltd | Defect Log #3 (aggregate word-limit counter) built — see `PDR-AI-012` and `CHANGELOG.md` 2026-07-28. Pending live verification.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 1.2     | 2026-07-28 | Rapidglobe Ltd | Defect Log #2 (non-deterministic eligibility verdict) root-caused and fixed — see `PDR-AI-011` and `CHANGELOG.md` 2026-07-28. Pending live verification.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.1     | 2026-07-27 | Rapidglobe Ltd | Full execution completed: GCM-01–05 all Pass. One real defect found and fixed same session (GCM-01 — a project funding-amount question dropped by a table-format-specific skip-list gap in `lib/prompts.ts`, distinct from the same-day MKCF fix). Two observations logged, not actioned tonight: a non-deterministic eligibility verdict on identical input (GCM-01), and a missing aggregate word-limit indicator when one funder limit spans multiple extracted sections (GCM-03) — fix agreed (live combined counter) but deferred. GCM-03's "single narrative card" expectation struck through as based on an inaccurate assumption from the archived plan, not the funder's real guidance text. See Defect Log and `CHANGELOG.md` 2026-07-27. |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | New plan created under `DR-TEST-001`, replacing per-funder full walkthroughs for shapes not already covered by the two flagship plans. Covers multi-column table PDF (Idlewild), freeform narrative (Garfield Weston), pasted-text-only (CPF Trust), large-document truncation (Clothworkers), and a citation-coverage spot-check. Not yet executed.                                                                                                                                                                                                                                                                                                                                                                                                |
