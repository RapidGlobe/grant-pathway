# Guideline Capability / Shape Matrix — Test Plan

**Tier:** 2 — Check if relevant
**Volatility:** Medium
**Update when:** A new guideline shape is encountered that isn't represented below, or the extraction/citation pipeline changes

**Version:** 1.0
**Date:** 2026-07-24
**Status:** New plan under `DR-TEST-001` (capability-based test strategy). Not yet executed.
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

| Test ID | Test Name                                      | Result | Notes |
| ------- | ---------------------------------------------- | ------ | ----- |
| GCM-01  | Multi-column table PDF — extraction robustness |        |       |
| GCM-02  | Freeform narrative — no discrete questions     |        |       |
| GCM-03  | Pasted-text-only as a first-class path         |        |       |
| GCM-04  | Large document — truncation behaviour          |        |       |
| GCM-05  | Citation coverage spot-check                   |        |       |

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

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

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

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

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

**Expected result:**

- Paste-only input produces a working AI summary with no file present at any point
- Step 4 shows one narrative card, correctly reflecting the single-block email format
- 500-word limit correctly extracted and displayed

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

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

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

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

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which citations were sampled and from which case):**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | New plan created under `DR-TEST-001`, replacing per-funder full walkthroughs for shapes not already covered by the two flagship plans. Covers multi-column table PDF (Idlewild), freeform narrative (Garfield Weston), pasted-text-only (CPF Trust), large-document truncation (Clothworkers), and a citation-coverage spot-check. Not yet executed. |
