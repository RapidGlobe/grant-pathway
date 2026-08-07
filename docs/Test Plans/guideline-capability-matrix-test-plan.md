# Guideline Capability / Shape Matrix — Test Plan

**Tier:** 2 — Check if relevant
**Volatility:** Medium
**Update when:** A new guideline shape is encountered that isn't represented below, or the extraction/citation pipeline changes

**Version:** 1.7
**Date:** 2026-08-06
**Status:** 🟢 **All six cases Pass.** GCM-01 through GCM-05 executed 2026-07-27 (one defect found and fixed the same session on GCM-01's table-format budget-question skip-list; two further observations — GCM-03's aggregate word limit and a non-deterministic eligibility verdict — both built and live-verified 2026-07-28, see Defect Log #2 and #3). **GCM-06 added and failed 2026-08-06** against a real completed application: two substantive questions never extracted (`GAP-39`, High) and two adjacent sub-questions merged into one card (`GAP-40`, Medium). Both rules were rewritten the same day, and the case was deliberately **held at Fail** because prompt tests can only confirm a rule is present, never what the model does with it — a live extraction was blocked by rejected AWS credentials. **Live re-run 2026-08-07: both defects fixed.** §4 produced all six lettered sub-questions, including §4e and §4f which `GAP-39` had lost, and §10 produced two separate cards, closing `GAP-40`. Nothing that should have been excluded turned into a narrative question. **Two observations were recorded rather than logged as defects — see the case Notes**; one is a user-facing count that disagrees with its own list, the other a question for WJ about whether this plan's own expectation is right.
**Tester:** WJ

---

## Purpose

Grant Pathway's value proposition is now "any guideline or form" (`ADR-DATA-006`; `DR-FD-001` v1.4), not a curated list of named funders. This plan tests the dimension the product actually varies on — **the shape of the guidelines document and the extraction path it exercises** — using real funder documents as fixtures, without claiming to validate that funder specifically. Naming a funder here is incidental to the shape it happens to provide.

Two shapes are **not** repeated here because the two flagship plans already cover them end-to-end:

- **Numbered-list PDF (structured)** — covered by `AB-Charitable-Trust-test-plan.md`
- **Mixed financial + governance + narrative + file-upload** — covered by `MK-Community-Foundation-test-plan.md`

This plan covers everything else: the harder multi-column structured shape, the freeform/no-discrete-questions shape, the paste-only path, a large-document truncation check, a docx **application form** (as opposed to guidance about one), and a citation-coverage spot-check across whichever of the above are run.

Individual cases here may reuse a pre-seeded account rather than registering fresh each time, following the pattern already established in `regression-test-plan.md` — registration/profile mechanics are not the point of this plan and are covered by the two flagships and `regression-test-plan.md` itself.

---

## Test Data

| Case   | Shape                                     | Fixture document                                                                                                                           | Notes                                                                                                                   |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| GCM-01 | Multi-column table PDF                    | `docs/Grant Org Guidelines/idlewild-arts-application-questions-dec2025.pdf` (Idlewild Trust)                                               | Previously caused D-IT-01 (extraction failure) — confirm it stays fixed                                                 |
| GCM-02 | Freeform narrative, no discrete questions | `docs/Grant Org Guidelines/garfield-weston-foundation-application-guidelines-2026.pdf` (Garfield Weston)                                   | Tagged in prior funder-catalogue work as "primary test for free-form path"; has known citation-fix history              |
| GCM-03 | Pasted-text-only, no file at all          | CPF Trust's 500-word email application guidance (no PDF/portal exists for this funder — paste is the only input method, not a fallback)    | Application window 1 Jun–30 Sep; confirm still open before running                                                      |
| GCM-04 | Large/long document (truncation check)    | `docs/Grant Org Guidelines/clothworkers-open-grants-guidance-and-sample-forms.pdf` (largest guideline document in the corpus by file size) | See `ADR-AI-007` (context window management) for the truncation logic being exercised                                   |
| GCM-05 | Citation coverage (spot-check)            | Reuses whichever of GCM-01/02/04 produced citation badges                                                                                  | Not exhaustive — see the established testing limitation on hallucination/citation checking (`DR-AI-003`)                |
| GCM-06 | Docx form with short-answer sub-questions | `docs/Grant Org Guidelines/Stony Stratford Grant-Application-Form-2026.docx` (Stony Stratford Town Council)                                | Added 2026-08-06 after `GAP-39`/`GAP-40`. The only shape in the corpus that is a **fillable form** rather than guidance |

---

## Test Results Summary

| Test ID | Test Name                                      | Result        | Notes                                                                                                                                                                                                                              |
| ------- | ---------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GCM-01  | Multi-column table PDF — extraction robustness | Pass (caveat) | Real defect found and fixed same session — see Defect Log #1. Charity: National Opera Studio                                                                                                                                       |
| GCM-02  | Freeform narrative — no discrete questions     | Pass          | Charity: National Opera Studio (same account)                                                                                                                                                                                      |
| GCM-03  | Pasted-text-only as a first-class path         | Pass (caveat) | Section-count expectation outdated (see case Notes); aggregate word-limit gap logged — see Defect Log #3                                                                                                                           |
| GCM-04  | Large document — truncation behaviour          | Pass          | New charity used (Bridge Support MK, per archived Clothworkers plan)                                                                                                                                                               |
| GCM-05  | Citation coverage spot-check                   | Pass          | Sampled from GCM-04 (5 citations, all correct)                                                                                                                                                                                     |
| GCM-06  | Docx form — short-answer narrative questions   | **Pass**      | ✅ **Live re-run 2026-08-07 — both defects fixed.** §4 produced all six sub-questions including `GAP-39`'s missing §4e and §4f; §10 produced two separate cards, closing `GAP-40`. Two observations, neither a failure — see below |

---

## Defect Log

| ID  | Test   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Severity | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | GCM-01 | A project funding-amount question ("State the total amount of funding you are requesting...") was silently missing from Step 4. Root cause: `lib/prompts.ts`'s TABLE FORMAT rule (used for table-structured guidelines) had its own numeric-type skip-list with no budget-question exception, distinct from the general exclusion rule fixed earlier the same day for MK Community Foundation. See `CHANGELOG.md` 2026-07-27.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Medium   | Fixed and live-verified same session (12→13 questions)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2   | GCM-01 | Eligibility verdict was non-deterministic on identical input: National Opera Studio against Idlewild Trust Arts failed the eligibility check on one run, then passed on an immediate retry with no profile changes made. Root-caused 2026-07-28: `temperature: 0` was already set — Bedrock does not guarantee bit-identical output across separate calls even at temperature 0 (batched-inference floating-point non-determinism, not fixable in application code). Fixed with a second confirming call before a `true` verdict is trusted (`PDR-AI-011`, `app/api/generate-summary/route.ts`).                                                                                                                                                                                                                                                                                                                                                    | Medium   | Fixed and live-verified 2026-07-28 (retested National Opera Studio vs Idlewild Trust, no false mismatch)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 3   | GCM-03 | CPF Trust's guidance states a 500-word limit across the whole application, but the AI split the application into 3 sections, none of which show a word-limit badge — the app has no way to represent or enforce a limit shared across multiple extracted sections. Fixed with a new `overallWordLimit` extraction field plus a live combined counter across the linked sections, soft nudge only, never a hard block (`PDR-AI-012`, `components/application-step4-draft.tsx`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Low      | Fixed and live-verified 2026-07-28 (retested CPF Trust; counter also made more prominent — 14px bold — per WJ's feedback)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 4   | GCM-06 | **Two substantive questions were never extracted.** `Stony Stratford Grant-Application-Form-2026.docx` §4 has six lettered sub-questions (a–f); only a–d reached Step 4. Missing: **§4e "Please give an accurate figure for the number of people in the parish the project will serve"** and **§4f "For how long will the project run?"** — for a town council, beneficiary reach is one of the questions the grant turns on. Root cause: `lib/prompts.ts`'s "questions" rule excludes data-entry fields and the TABLE FORMAT rule skips short numerical fields; the only carve-out from either is for budget/cost questions. A short answer is being treated as equivalent to a non-narrative one. **Third instance of this failure mode** — Defect Log #1 (Idlewild, table-format skip-list) and the same-day MK Community Foundation fix were both patched with their own single exception rather than by changing the rule. Logged as `GAP-39`. | High     | ✅ **FIXED — rule rewritten 2026-08-06, live-verified 2026-08-07.** Fixed at the level of the principle rather than with a third exception: the rule now says the test is what a question is _about_, never how long its answer is, and budget/cost is recast as an instance of that rather than the sole carve-out. **The live re-run produced all six §4 cards**, with §4e ("an accurate figure for the number of people in the parish the project will serve") and §4f ("For how long will the project run?") both present as separate narrative questions with the AI-assist available. Fixing the principle rather than adding a third exception is what makes this credible: the failure mode had already recurred twice. |
| 5   | GCM-06 | **Two adjacent sub-questions merged into one card.** §10 MONITORING PROGRESS asks a) what you hope to have achieved six months after receiving a grant and b) twelve months after; both arrived as a single Step 4 card (Q16) with the text concatenated. `lib/prompts.ts` already carries the rule verbatim — "DO NOT MERGE ADJACENT QUESTIONS… never combine two related-but-distinct questions into one, even if they are adjacent, thematically similar, or commonly answered together" — so this is an adequate rule the model did not follow, not a rule needing amendment (unlike #4). Nothing is lost to the applicant here (both asks are visible, one box answers both), but a per-question word limit or a sharper divergence between the two asks would make it material. Logged as `GAP-40`.                                                                                                                                           | Medium   | ✅ **FIXED — rule added 2026-08-06, live-verified 2026-08-07.** Lettered sub-parts are now explicitly separate questions, and a shared stem must be combined with each part rather than used as grounds to merge. **The live re-run produced two cards** — "Please state what you hope to have achieved six months after receiving a grant" and the twelve-month equivalent — each carrying the shared stem and each citing §10 MONITORING PROGRESS. Note this one needed no rule change, only obedience to a rule already present verbatim, so the re-run is the only thing that could ever have closed it.                                                                                                                    |

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

### GCM-06 — Docx Form with Short-Answer Narrative Sub-Questions

**Prerequisite:** Signed in, existing or new application. Funder: "Stony Stratford Town Council", grant name: "Capability Matrix — Docx Form".

**Background:** Every other fixture in this matrix is **guidance about** an application. This one is the application itself — a fillable Word form with numbered sections, lettered sub-questions (§4 a–f, §6 a–d, §8 a–b, §10 a–b), signature blocks, and a supporting-documents checklist. That makes it the only fixture that exercises two things nothing else does:

1. **Sub-question flattening** — a numbered section containing several distinct lettered asks must become several cards, not one.
2. **Short-answer narrative questions** — asks whose correct answer is a number or a duration ("how many people will the project serve", "for how long will the project run") but which are genuine application questions, not data-entry fields.

Added 2026-08-06 after WJ reviewed a **real application his wife completed through the live service** against this form and found both behaviours wrong — `GAP-39` and `GAP-40`. The form is also already the fixture behind `PDR-AI-010` (financial-section catch-all, 2026-07-17), so its financial section has known prior history.

**Steps:**

1. Upload `Stony Stratford Grant-Application-Form-2026.docx` at Step 2
2. On Step 3, confirm the AI summary generates without error
3. Continue to Step 4 and **count the cards**, separating governance-fact cards (tagged "Budget") from extracted questions
4. Cross-check every card against the source form, section by section, and list any form ask with no corresponding card
5. Check specifically that **§4 a–f all appear as six separate cards** — including **§4e** (number of people in the parish served) and **§4f** (how long the project will run)
6. Check specifically that **§10 a) and b)** (six-month and twelve-month achievements) appear as **two separate cards**, not one merged card
7. Confirm the correctly-excluded material is genuinely absent: the front organisation-details table, §3's seven-principle tick-list, §5's expenditure/income table totals, §9's address and phone, §12's contact-person block, §13's supporting-documents checklist, and both signature blocks
8. Confirm §1 "PURPOSE OF APPLICATION" — a numbered heading with no ask beneath it — is handled sensibly (it is legitimately absorbed by §2's "…or the purpose you require the grant for"; record which behaviour is observed, but do not treat absorption as a failure)

**Expected result:**

- §4 produces **six** cards; §4e and §4f are both present
- §10 produces **two** cards, one per reporting point
- No governance fact is duplicated as a narrative question, and no narrative ask is silently dropped
- Every excluded item in step 7 is genuinely non-narrative

**Result:** ☒ **Pass** &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked — _live re-run 2026-08-07; the 2026-08-06 Fail and its two defects are kept below as the record of what was fixed._

**Notes:** Executed 2026-08-06, not as a scripted run but by reconciling a **genuine completed application** (WJ's wife, Stony Stratford Community Larder, upload path) against the source form. Observed: **17 cards = 2 governance facts + 15 questions**, against 17 narrative asks in the form.

Mapping as built — Q1–2 §7 governance facts (total expenditure, reserves; the reserves-justification prose is folded into the reserves card's helper text, which is correct per `PDR-AI-008`), Q3 §2, Q4 §3's narrative follow-up, Q5–8 §4 a–d, Q9 §5a, Q10–13 §6 a–d, Q14–15 §8 a–b, Q16 §10 a **and** b merged, Q17 §11a.

**Two failures, both logged:** §4e and §4f absent entirely (Defect Log #4, `GAP-39`); §10 a and b merged into Q16 (Defect Log #5, `GAP-40`). Everything in step 7 was correctly excluded, and §1 was absorbed by §2 as anticipated in step 8 — no defect there. Note also that no "Finances of Your Group" narrative catch-all card appeared; `PDR-AI-010`'s Option C governs `free_form` **sections** mode and this document extracted in **questions** mode, so that is out of scope here rather than a regression — worth confirming deliberately if this fixture is ever run through the paste path.

**Update, 2026-08-06 (later the same day): both rules have been rewritten in `lib/prompts.ts`, but this case stays Fail and must be re-run.**

`GAP-39` was fixed at the level of the principle rather than with a third exception. The exclusion list was about **administrative identity and contact details**, yet read as though it were about **answer length** — which is how three separate short-answer questions came to be dropped across three funders. It now states outright that the test is what a question is _about_, never how long its answer is; names the cases that were lost (people reached, project duration, start and end dates, sessions or places provided); and forbids dropping a question solely because its answer is a number, date, duration or quantity. Budget/cost is recast as a **case** of that rule rather than the sole exception to it — being the sole exception is exactly why a non-budget short answer had nothing to appeal to. The TABLE FORMAT skip-list, which carried its own independent copy of the flaw (the reason Defect Log #1's Idlewild instance survived the same-day MK Community Foundation fix), is now explicitly subordinated to the same principle.

`GAP-40` gained the rule the existing "DO NOT MERGE ADJACENT QUESTIONS" wording lacked: **lettered sub-parts are separate questions, and a shared stem does not join them.** §10's a)/b) most likely merged because neither sub-part reads as a complete question on its own — the stem "Please state what you hope to have achieved:" sits above both — so merging looked like the only coherent option. The model is now told to combine the stem with each part instead. It also states explicitly that a bare section heading is not a question, which keeps §1's correct non-extraction correct rather than inviting an over-correction.

⚠️ **Nothing above is behaviourally verified, and this case cannot close until it is.** Nine new prompt tests assert the rules are present and correctly framed, but a prompt test cannot tell you what the model does with them. A live extraction was attempted during the fix and could not run: **the AWS credentials in `.env.local` are rejected by Bedrock with a 403 signature mismatch** (correctly shaped at 20 and 40 characters, so almost certainly rotated since they were entered on 2026-08-04), and `AWS_REGION` is empty there as well. Verification therefore has to happen against the deployed service.

---

### ✅ Live re-run, 2026-08-07 — both defects fixed

Run against `localhost:3000` with working AWS credentials (the 403 that blocked the 2026-08-06 attempt was a wrong secret access key, fixed earlier today). Fresh application, upload path, "Start fresh" chosen deliberately — reusing the previous Stony Stratford application would have carried the old, buggy questions across and proved nothing.

**21 Step 4 cards: 2 governance facts + 19 narrative questions.**

| Check                                                                   | Expected                        | Got                                                                                               |
| ----------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| §4 a–f                                                                  | six separate cards              | **six** — cards 5–10                                                                              |
| **§4e** — number of people in the parish served                         | present                         | ✅ card 9, narrative, AI-assist available                                                         |
| **§4f** — how long the project will run                                 | present                         | ✅ card 10, narrative, AI-assist available                                                        |
| §10 a) and b)                                                           | two cards                       | ✅ cards 19 and 20, each citing §10                                                               |
| §6 a–d                                                                  | four cards                      | ✅ cards 13–16                                                                                    |
| §8 a–b                                                                  | two cards                       | ✅ cards 17–18                                                                                    |
| §7 finances                                                             | governance facts, not questions | ✅ cards 1–2, Budget-tagged, no AI assist                                                         |
| Front details table, §3 tick-list, §9 address/phone, §12 contact person | absent                          | ✅ all absent                                                                                     |
| §1 PURPOSE OF APPLICATION                                               | absorbed or handled sensibly    | ✅ absorbed into card 3 (§2's "…or the purpose you require the grant for"), as step 8 anticipated |

**`GAP-39` and `GAP-40` are both closed.** Worth separating why each is credible: `GAP-39` was fixed by changing the principle rather than adding a third exception to a rule that had already failed twice this way, so the fix addresses the class. `GAP-40` needed no rule change at all — the rule was present verbatim and the model simply had not followed it — which means a live re-run was the **only** thing that could ever have closed it, and no amount of prompt testing would have done.

**§7 has three fields but only two governance cards, and that is correct.** "Total income of your organisation in the last year" has no card because the governance vocabulary in `lib/governance-items.ts` is a closed set of five and total income is not one of them. Checked rather than assumed, because it looks like a miss.

### Two observations — recorded, not logged as defects

**1. Step 3 says "We found 21 application questions" and lists 19.** The count includes the two Budget-tagged governance cards; the list above it does not. Both numbers are defensible on their own — 21 is what Step 4 shows, 19 is what the list contains — and together they invite the user to think something has been lost. This is user-facing copy on the screen whose whole job is telling the applicant what the AI found. Not logged as a defect here because it is not a capability-matrix concern and would recur on any funder; **it belongs to WJ as a copy decision**, and the honest options are to count 19, or to say "21 items, including 2 you complete with your own figures".

**2. §5b's table totals are handled inconsistently, and this plan's own expectation may be the thing that is wrong.** §5 b) has three figures — "Total needed for this project", "Amount requested from SSTC", "Balance outstanding". **One became a card** (card 12, Budget-tagged, no AI assist); the other two did not. Step 7 above lists "§5's expenditure/income table totals" among the material that should be excluded, so read strictly, one leaked.

But `lib/prompts.ts` says the opposite, deliberately: after the MK Community Foundation work on 2026-07-27, project-specific budget and cost questions are **never** excluded, precisely because the model had been dropping "What is the total cost of your project?" entirely. "Total needed for this project" is exactly that kind of ask, so its card is the prompt behaving as designed — and step 7 of this case, written on 2026-08-06, contradicts a rule set six weeks earlier.

**So the defect, if there is one, is that two of the three did not appear** — not that one did. **Question for WJ**, and not one to settle by editing either document unilaterally: should all three §5b figures produce Budget cards, or none? Whichever way it goes, step 7 of this case needs correcting to match.

Neither observation blocks the Pass: both defects this re-run existed to check are fixed, and nothing that should have stayed out became a narrative question.

**What re-running must confirm:** §4 produces six cards including §4e and §4f; §10 produces two; and — the part that matters as much — **GCM-01 to GCM-05 still pass**, because a rule loosened to stop dropping short answers is exactly the kind of change that starts extracting contact details and consent boxes instead.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.7     | 2026-08-07 | Rapidglobe Ltd | **GCM-06 re-run live — `GAP-39` and `GAP-40` both closed, and the plan reaches 🟢 for the first time since GCM-06 was added.** §4 produced all six lettered sub-questions including §4e and §4f; §10 produced two cards. **`GAP-40` is the case for having held this at Fail on 2026-08-06 rather than letting nine passing prompt tests close it:** its rule was already in `lib/prompts.ts` verbatim and the model simply had not obeyed it, so every one of those tests would have passed against the broken behaviour. `GAP-39` is separately credible because it was fixed by changing the principle rather than adding a third exception to a rule that had failed this way twice before. Two observations added to the case Notes, neither a failure and both needing WJ: Step 3's "21 questions" heading sits above a list of 19 (the governance cards are counted, not listed), and §5b's three table totals are handled inconsistently — one card, two not — where **step 7 of this plan and `lib/prompts.ts` contradict each other** about which is correct, the prompt having deliberately stopped excluding project budget questions on 2026-07-27. Step 7 needs correcting whichever way WJ rules.                                                                                                                                                                                                                                                               |
| 1.6     | 2026-08-06 | Rapidglobe Ltd | **`GAP-39` and `GAP-40` rules rewritten in `lib/prompts.ts` — but GCM-06 stays Fail, deliberately.** `GAP-39` is fixed at the level of the principle rather than with a third exception: the exclusion list was about administrative identity and contact details yet read as though it were about answer length, which is how three separate short-answer questions were dropped across three funders. Budget/cost is recast as a **case** of the rule rather than the sole exception to it — being the sole exception is precisely why a non-budget short answer had nothing to appeal to — and the TABLE FORMAT skip-list, which carried its own copy of the flaw (the reason Defect Log #1 survived the same-day MK Community Foundation fix), is now subordinated to it. `GAP-40` adds what the existing "DO NOT MERGE" rule lacked: lettered sub-parts are separate questions and a shared stem must be combined with each part rather than used as grounds to merge. **Nine new prompt tests — which assert the rules exist, not what the model does with them.** A live extraction was attempted and blocked: the AWS credentials in `.env.local` are rejected by Bedrock (403 signature mismatch, correctly shaped, almost certainly rotated since 2026-08-04). **The case closes only on a live re-run of GCM-06 plus GCM-01–05**, the latter because a rule loosened to stop dropping short answers is exactly what might start extracting contact details instead. |
| 1.5     | 2026-08-06 | Rapidglobe Ltd | **GCM-06 added and executed — the plan's first Fail.** New case for a docx **application form** (Stony Stratford Town Council), the only fixture in the corpus that is the form itself rather than guidance about one, and so the only one exercising lettered sub-question flattening and short-answer narrative asks. Executed by reconciling a **real completed application** (WJ's wife, Stony Stratford Community Larder) against the source form rather than as a scripted run. Two failures: §4e (people served) and §4f (project duration) never extracted — **the third instance of the short-answer-drop failure mode** after Defect Log #1 and the same-day MK Community Foundation fix, both of which were patched with their own single exception rather than a rule change (`GAP-39`, High); and §10 a) and b) merged into one card against the prompt's own verbatim "DO NOT MERGE ADJACENT QUESTIONS" rule (`GAP-40`, Medium). Neither fixed — logged only, per WJ, pending further review of the same application.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.4     | 2026-07-28 | Rapidglobe Ltd | Defect Log #2 and #3 both live-verified: eligibility confirmation fix (`PDR-AI-011`) retested with National Opera Studio vs Idlewild Trust, no false mismatch; combined word-limit counter (`PDR-AI-012`) retested with CPF Trust, counter also made more prominent (14px bold) per WJ's feedback.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.3     | 2026-07-28 | Rapidglobe Ltd | Defect Log #3 (aggregate word-limit counter) built — see `PDR-AI-012` and `CHANGELOG.md` 2026-07-28. Pending live verification.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 1.2     | 2026-07-28 | Rapidglobe Ltd | Defect Log #2 (non-deterministic eligibility verdict) root-caused and fixed — see `PDR-AI-011` and `CHANGELOG.md` 2026-07-28. Pending live verification.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.1     | 2026-07-27 | Rapidglobe Ltd | Full execution completed: GCM-01–05 all Pass. One real defect found and fixed same session (GCM-01 — a project funding-amount question dropped by a table-format-specific skip-list gap in `lib/prompts.ts`, distinct from the same-day MKCF fix). Two observations logged, not actioned tonight: a non-deterministic eligibility verdict on identical input (GCM-01), and a missing aggregate word-limit indicator when one funder limit spans multiple extracted sections (GCM-03) — fix agreed (live combined counter) but deferred. GCM-03's "single narrative card" expectation struck through as based on an inaccurate assumption from the archived plan, not the funder's real guidance text. See Defect Log and `CHANGELOG.md` 2026-07-27.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | New plan created under `DR-TEST-001`, replacing per-funder full walkthroughs for shapes not already covered by the two flagship plans. Covers multi-column table PDF (Idlewild), freeform narrative (Garfield Weston), pasted-text-only (CPF Trust), large-document truncation (Clothworkers), and a citation-coverage spot-check. Not yet executed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
