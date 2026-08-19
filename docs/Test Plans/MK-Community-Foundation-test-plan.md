# MK Community Foundation — Oak Grants Test Plan — Flagship

**Version:** 2.8
**Date:** 2026-08-14
**Status:** ✅ **COMPLETE on production, 2026-08-19 (`P5.5`) — MKCF-01–09 all Pass, no further observations.** The second flagship executed end to end against `grant-pathway-prod`. ✅ **`MKCF-09` exercised the multi-line export check that `ABC-10` could not, and it passes — discharging that caveat.** Previously in progress: — MKCF-04's AI summary took **44.71s** (dev was 43s on the same document; NFR-01's large-document tier allows 45s, so inside it by 0.3s — **the first production timing that is not comfortable**, worth watching rather than acting on). **MKCF-06 Pass: 19 questions plus 4 financial details, 23 total, matching the hand-derived June 2026 figure exactly, and `GAP-90`'s fix confirmed live** — a suspected failure was examined and found to be the by-design shared citation, not a regression. **Previously: ✅ Re-run against the June 2026 edition complete — MKCF-01–09 all Pass; both `GAP-90` and `GAP-91` (MKCF-06's and MKCF-08's caveats) since fixed and live-verified.** This re-run is now current evidence the app handles `MK Comm Found oak-grants-criteria-final-june-2026.pdf` correctly, superseding the 2026-08-10 "not yet re-verified" status. See Document History.
**Tester:** WJ, with Claude watching production logs and the persisted database record live throughout
**Test account:** grantpathway+mkcf1@gmail.com

---

## Overview

This is one of two **flagship** end-to-end plans (with `AB-Charitable-Trust-test-plan.md`) that exercise the complete Grant Pathway flow — registration through export — against a real funder's guidelines. Per `DR-TEST-001` (2026-07-24), most named-funder plans have been retired in favour of a capability/guideline-shape matrix (`guideline-capability-matrix-test-plan.md`) and a dedicated eligibility plan (`eligibility-check-test-plan.md`); this plan and A B Charitable Trust's are kept specifically because, between them, they cover both extraction paths' user experience, both limit types, and the governance/financial path with minimal overlap.

MK Community Foundation funds charities and voluntary organisations delivering activities and services that benefit residents of **Milton Keynes**. Oak Grants support projects costing between £5,001 and £15,000, with a **20% match funding requirement**. Guidelines and portal questions are pasted or uploaded per the standard flow, from `docs/Grant Org Guidelines/MK Comm Found oak-grants-criteria-final-june-2026.pdf` (refreshed 2026-08-10 from the MKCF website ahead of a live demo; the prior November 2025 edition — see audit finding **L6**, 2026-07-30 — is preserved at `docs/Grant Org Guidelines/archive/MK Comm oak-grants-criteria-final-nov-2025.pdf` for historical comparison, not for testing against).

**Risk-based coverage:** This plan tests the Oak Grants variant only. If Oak passes, **Seed Grants** (up to £750, 5 questions) and **Sapling Grants** (£750–£5,000, 6 questions) are assumed to pass — same portal, same document shape, fewer questions. The **Strategic Partnership Grants** (above £15,000 p.a.; email EOI; narrative) is a different guideline shape and is covered by the freeform-narrative case in `guideline-capability-matrix-test-plan.md` if tested at all.

**This plan previously ran two accounts** — Elmbridge Families Together (a deliberate geographic-eligibility mismatch) and MK Minds Matter (happy path). Per `DR-TEST-001`, dedicated eligibility testing has moved to `eligibility-check-test-plan.md`; that plan's own cases use different charity/funder pairings, but Elmbridge Families Together's already-passed 2026-07-04 result against this same funder (geographic exclusion, FR-47 hard stop confirmed) remains valid corroborating evidence and is cited there rather than re-run. This plan now runs MK Minds Matter only, so the single account can be carried through the complete flow to export without the earlier plan's two-account handoff.

**20% match funding requirement:** Oak Grants require the applicant to contribute at least 20% of total project costs. The AI summary should extract and surface this requirement. MK Minds Matter has match funding available via in-kind volunteer counsellor hours and existing equipment (noted in the charity profile).

---

## Test Data

| Item                         | Value                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test user email              | grantpathway+mkcf1@gmail.com                                                                                                                                                                                                                                                                                                                                                       |
| Test user password           | (set by tester at registration — 12+ characters, letters and numbers)                                                                                                                                                                                                                                                                                                              |
| First name / Last name       | James / Nkosi                                                                                                                                                                                                                                                                                                                                                                      |
| Charity name                 | MK Minds Matter                                                                                                                                                                                                                                                                                                                                                                    |
| Registration number          | (leave blank — optional)                                                                                                                                                                                                                                                                                                                                                           |
| What does your charity do?   | MK Minds Matter provides free counselling, peer support groups, and community mental health workshops for adults experiencing anxiety, depression, and social isolation in Milton Keynes. We run weekly drop-in sessions at three community centres across central MK, Bletchley, and Newport Pagnell, supporting approximately 300 clients per year. We are a registered charity. |
| Who does your charity help?  | Adults aged 18 and over experiencing mental health challenges, loneliness, or emotional crisis in Milton Keynes and surrounding areas, including those on low incomes who cannot access private therapy.                                                                                                                                                                           |
| Where do you work?           | Milton Keynes (central MK, Bletchley, and Newport Pagnell)                                                                                                                                                                                                                                                                                                                         |
| Funder                       | MK Community Foundation — Oak Grants                                                                                                                                                                                                                                                                                                                                               |
| Grant name                   | Community Mental Health Drop-In Programme 2026–27                                                                                                                                                                                                                                                                                                                                  |
| Grant amount                 | £8,500 (within Oak Grants range £5,001–£15,000)                                                                                                                                                                                                                                                                                                                                    |
| Guidelines source            | MKCF Oak Grants criteria (paste or PDF upload)                                                                                                                                                                                                                                                                                                                                     |
| Expected eligibility outcome | Pass                                                                                                                                                                                                                                                                                                                                                                               |

---

## Pre-Test Setup

### Environment check — run first, every session

Run **RT-00** in `regression-test-plan.md` before starting MKCF-01. Confirm via RT-00 step 1 which Supabase project (dev/prod) the test URL is backed by, and record it in this plan's notes.

### Guidelines — access before testing

**Use the file already in the repository: `docs/Grant Org Guidelines/MK Comm Found oak-grants-criteria-final-june-2026.pdf`.**

✅ **Re-run 2026-08-14 against this edition — MKCF-01–09 all Pass, see Test Results Summary and Defect Log.** WJ downloaded the current Oak/Seed/Sapling criteria from the MKCF website on 2026-08-10, superseding the November 2025 edition this plan was previously executed against (MKCF-01–09, 2026-07-27: 19 questions upload path, 16 paste path). The old file was not overwritten — it remains preserved at `docs/Grant Org Guidelines/archive/MK Comm oak-grants-criteria-final-nov-2025.pdf` for historical comparison only. The 19-question upload-path count held against this new edition too (independently derived from the source PDF's own text and cross-checked against the persisted `ai_summary`), though two new gaps were found — `GAP-90` and `GAP-91`, both logged rather than fixed this session.

If the guidelines need refreshing again beyond this, repeat this same deliberate-change process: add the new file under its own dated name, update this plan and its expected results once re-tested, and record it in the Document History. Do not overwrite or substitute silently — that is what audit finding **L6** (2026-07-30) was originally about.

If portal questions are not in the criteria document, note the question list and word limits from the portal preview/guidance page and paste them alongside the criteria text.

---

## Known Expected Behaviours

| Ref                                | Description                                                                                                                                                                                                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 20% match requirement              | Oak Grants require 20% match funding from the applicant. The AI summary should extract this and it should appear in the summary cards.                                                                                                                                |
| No dedicated match Q               | None of the 10 Oak Grants questions specifically asks how the 20% match will be met (confirmed live, 2026-07-03/04) — the AI summary surfaces the requirement at Step 3 instead; folded into the Q6 sustainability answer at Step 4. Not a defect.                    |
| No word/character limits displayed | Confirmed live: none of the 10 Oak Grants questions show a word/character limit badge — each card shows only a running word count with no cap. Recorded as an observation, not a defect; may reflect the real MKCF portal genuinely having no limits on these fields. |
| Portal questions                   | The 10 Oak Grants questions are in an online portal — a criteria document or guidance page may not contain them verbatim. Paste path likely required.                                                                                                                 |

---

## Expected Narrative Questions (confirmed live, 2026-07-03)

| #   | Actual extracted question                                                                                                                                                              | Actual limit                       | Present? |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------- |
| Q1  | Explain the need for your project, how the need was identified and how this project will address the need.                                                                             | None displayed (word counter only) | Yes      |
| Q2  | Outline the key steps you will take to deliver the project and achieve the aims of the project.                                                                                        | None displayed (word counter only) | Yes      |
| Q3  | Who are the beneficiaries of this project, what impact will the project have (please provide details on both short- and long-term impact of the project)                               | None displayed (word counter only) | Yes      |
| Q4  | How will you measure and record the impact of your project?                                                                                                                            | None displayed (word counter only) | Yes      |
| Q5  | How will you promote the project and ensure the project reaches the intended beneficiaries?                                                                                            | None displayed (word counter only) | Yes      |
| Q6  | How will you continue to fund the project beyond this grant? If the project is addressing a short-term need or a one-off activity, please highlight the lasting impact of the grant... | None displayed (word counter only) | Yes      |
| Q7  | The project should demonstrate collaboration with relevant partners, who are you working with to develop/deliver the project and how are they involved.                                | None displayed (word counter only) | Yes      |
| Q8  | Have you explored similar services or projects in the city, and considered opportunities to collaborate or partner with those organisations to increase impact?...                     | None displayed (word counter only) | Yes      |
| Q9  | How does the project ensure it is inclusive and reaches diverse communities in Milton Keynes?                                                                                          | None displayed (word counter only) | Yes      |
| Q10 | Please expand on the steps taken to actively reach and engage with underserved and marginalised communities to ensure the project is accessible to all intended beneficiaries?         | None displayed (word counter only) | Yes      |

**Superseded 2026-07-27:** the 10-question set above predates a real extraction bug (project-budget questions and compound label+question lines were silently dropped) fixed the same day — see Defect Log. Actual counts confirmed live post-fix: **19 questions on the upload path**, **16 questions on the paste path** (both include the extra project-budget and compound-line questions this table was missing; the two paths differ because the pasted document is a narrower source than the uploaded PDF, not a bug — see MKCF-03 notes). This table is retained as historical baseline only and is no longer being kept current question-by-question.

---

## Test Results Summary

| Test ID | Test Name                                                               | AI Summary Time      | Result        | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ----------------------------------------------------------------------- | -------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MKCF-01 | Account registration and charity profile                                | N/A                  | Pass          | **2026-08-14 (June 2026 edition):** returning-user login (existing account reused), per AGENTS.md's minimum-steps allowance — not a fresh registration this run. Historical Nov-2025-edition notes below retained. Run on both upload and paste passes, same account (2026-07-27)                                                                                                                                                                                                                            |
| MKCF-02 | Application details — funder and grant name (free text)                 | N/A                  | Pass          | **2026-08-14:** actual funder/grant name entered ("MK Comm Fund - NEO test 140826" / "OAK grant retest") deviated from this plan's own Test Data table — both free-text fields still accepted arbitrary text correctly; the deviation is a tester-input choice, not an app defect                                                                                                                                                                                                                            |
| MKCF-03 | Guidelines upload/paste and AI summary                                  | **43s (2026-08-14)** | Pass          | **2026-08-14 (June 2026 edition, PDF upload, 9 pages):** 43s end-to-end (39.6s Bedrock call, confirmed via production logs) — within NFR-01's 45s large-document tier. `stop_reason: end_turn`, 4110/6000 output tokens (69% of cap, comfortable headroom). `unpdf`/`pdfjs-dist` extraction warnings observed, non-blocking (see MKCF-03 Notes). Historical Nov-2025-edition timings: Upload path 15 questions, then 19 after the question-extraction fix. Paste-path retest: 16 questions                   |
| MKCF-04 | AI summary content accuracy — 20% match requirement, no mismatch        | N/A                  | Pass          | **2026-08-14:** confirmed via the persisted `ai_summary` record — `eligibilityMismatch: false`, 20% match requirement present in both `aboutGrant` and `keyRequirements`                                                                                                                                                                                                                                                                                                                                     |
| MKCF-05 | Preparation checklist and start writing                                 | N/A                  | Pass          | Checklist item count tracked question count (9 items after fix, upload path; shorter on paste path — narrower source document)                                                                                                                                                                                                                                                                                                                                                                               |
| MKCF-06 | Narrative question extraction, word limits, and non-narrative filtering | N/A                  | Pass (caveat) | **2026-08-14:** 19 questions confirmed against the June 2026 edition — independently hand-derived from the source PDF and cross-checked against the persisted `ai_summary.questions` array, exact match. **New caveat:** `GAP-90` — the separate `governanceFacts` array (PDR-AI-008) contains two duplicate-text entries; see Defect Log #3. Historical: question-extraction bug and citation-highlight bug both found and fixed same session (2026-07-27); citation fix live-verified on paste-path retest |
| MKCF-07 | Narrative answer writing, AI assist, and citation check                 | N/A                  | Pass          | **2026-08-14:** WJ completed this live; no further observations beyond `GAP-90`/`GAP-91` (both logged against MKCF-06/MKCF-08 respectively, not this case). Historical: citations confirmed correct on both paths, incl. governance-fact citation and the previously-broken Q12/Q14/Q16/Q17 (paste path)                                                                                                                                                                                                     |
| MKCF-08 | Answer approval and assembly                                            | N/A                  | Pass (caveat) | **2026-08-14:** assembly itself completes correctly — confirmed via production logs (`POST /step/5` succeeded, `GET /step/5` loaded the assembled draft). **New caveat:** `GAP-91` — "Ready to assemble" flashes a false "We could not reach the server" error on every successful click; see Defect Log #4                                                                                                                                                                                                  |
| MKCF-09 | Export; Word document verified; re-export warning                       | N/A                  | Pass          | **2026-08-14:** two clean export requests confirmed via production logs (.docx then .txt), no errors or warnings logged                                                                                                                                                                                                                                                                                                                                                                                      |

---

## Defect Log

| ID  | Test    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Severity | Status                                                 |
| --- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| 1   | MKCF-06 | Question extraction silently dropped project-budget questions and the narrative half of compound label+question lines — `lib/prompts.ts` exclusion list conflated organisational financial fields with project budget/cost questions. See `CHANGELOG.md` 2026-07-27.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Medium   | Fixed and live-verified (15→19 questions, upload path) |
| 2   | MKCF-07 | Citation badge on 4 numbered narrative questions (Q12/Q14/Q16/Q17, paste path) navigated to the right heading but highlighted nothing — soft line-wrap from Word's clipboard export broke the `[SECTION: ...]` marker mid-sentence in `lib/preprocess-text.ts`. See `CHANGELOG.md` 2026-07-27.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Medium   | Fixed and live-verified (paste-path retest)            |
| 3   | MKCF-06 | `GAP-90`: Step 3's persisted `governanceFacts` array contains two entries — `governance_bank_signatory_count` and `governance_bank_signatories_related` — with byte-identical `questionText` and citation, because the June 2026 guidelines state bank-signatory count and relatedness in a single sentence rather than two. Applicant sees what looks like the same financial detail twice on Step 4. See `ADR-TRACEABILITY.md` `GAP-90`. **Fixed 2026-08-14** — `lib/prompts.ts` now instructs distinct wording per fact when one sentence answers two; live-verified against both MKCF and Nationwide (whose sentence combines three facts at once) before pushing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Medium   | Fixed and live-verified                                |
| 4   | MKCF-08 | `GAP-91`: Clicking "Ready to assemble" flashes a false "We could not reach the server" red banner, twice in a row, immediately before Step 4 correctly progresses both times. Traced to `handleReadyToAssemble` in `application-step4-draft.tsx` catching the `redirect()` throw that `setDraftReadyToAssemble` uses on its (successful) completion and misreporting it as `ACTION_FAILED_MESSAGE`. No server-side error logged — confirmed client-only. Likely shared by five other actions with the same "success ends in `redirect()`" shape. See `ADR-TRACEABILITY.md` `GAP-91`. **Correction (found 2026-08-14, same day, during the Stony Stratford retest): "fires on every successful click" was wrong.** The identical button/code path produced no false warning on a third click. The code is still genuinely unguarded, but whatever surfaces the throw is intermittent, not deterministic — see `ADR-TRACEABILITY.md` `GAP-91`'s own correction for detail. **Fixed 2026-08-14** — decided to build rather than accept, since `unstable_rethrow` is the officially documented fix for exactly this case. Scope check found only 2 catch blocks (both in this file, both calling `setDraftReadyToAssemble`) were actually at risk, not five other actions as first assumed. Live-verified against the local dev server, no regression. | Medium   | Fixed and live-verified                                |

---

## Test Cases

---

### MKCF-01 — Account Registration and Charity Profile

**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Register — it's free**
3. Enter first name **James**, last name **Nkosi**, email `grantpathway+mkcf1@gmail.com`, password (**12+ characters, letters and numbers**), confirm password
4. Tick **Terms of Service and Privacy Policy** (required); optionally tick the feedback-consent checkbox
5. Click **Create account**
6. Open the verification email and click the verification link — auto-confirms on page load, expires after 1 hour (D-012)
7. Click **Sign in** and enter the registered email and password
8. Click **Complete your profile** and enter the MK Minds Matter details from Test Data above
9. Click **Save profile**
10. On the "Profile saved" confirmation screen, click **Go to my dashboard**
11. Click **Start your first application**

**Expected result:**

- Registration and email verification completes without error
- Charity profile saves successfully; "Profile saved" confirmation screen shown
- Dashboard shows the empty-state **Start your first application** button (fresh account, zero applications)

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Same account reused for a second, fresh application to retest the paste path; registration/profile itself only exercised once.

**2026-08-14 re-run (June 2026 edition):** WJ signed in as a returning user with the existing `grantpathway+mkcf1@gmail.com` account rather than registering fresh — acceptable per `AGENTS.md`'s minimum end-to-end coverage rule ("account registration **or login for returning test user**"). No issues.

---

### MKCF-02 — Application Details — Funder and Grant Name (Free Text)

**Prerequisite:** MKCF-01 complete

**Background:** Step 1 (`Who is offering this grant?`) is a plain free-text field — the searchable picker with a "Structured" badge was removed 2026-07-15 (`DR-FD-001` v1.4).

**Steps:**

1. In **Who is offering this grant?**, type **"MK Community Foundation — Oak Grants"**
2. In grant name, type **"Community Mental Health Drop-In Programme 2026–27"**
3. Click **Continue**

**Expected result:**

- Both fields accept free text; no dropdown, autocomplete, or funder-type badge
- No "reuse a previous application" prompt (fresh account, no prior applications)
- Application created and Step 2 displayed

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

**2026-08-14 re-run (June 2026 edition):** Funder/grant name actually entered was "MK Comm Fund - NEO test 140826" / "OAK grant retest" rather than this plan's own Test Data values — a tester shorthand, not a defect; both fields accepted arbitrary free text correctly, no dropdown/autocomplete/badge appeared, consistent with `DR-FD-001` v1.4.

---

### MKCF-03 — Guidelines Upload/Paste and AI Summary

**Prerequisite:** MKCF-02 complete; MKCF Oak Grants criteria file ready

**Steps:**

1. On Step 2, upload the MKCF Oak Grants criteria PDF (if available) or click the **Paste text** tab and paste the criteria text
2. Click **Continue**
3. On Step 3, start a stopwatch — summary auto-generates on page load
4. Stop when summary cards appear — record the time in the results table above

**Expected result:**

- Guidelines accepted and AI summary generates within NFR-01 (≤45 seconds)
- Summary reflects Milton Keynes geographic focus, grant range, and 20% match requirement
- MK Minds Matter passes eligibility (no mismatch warning)

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record input method used — PDF or paste):** Both methods run: PDF upload first (15 questions, then 19 after the same-day question-extraction fix), then paste (`MKCF Oak copy and paste Application Questions.docx` content pasted directly) on a fresh application — 16 questions. MK Minds Matter passed eligibility on both.

**2026-08-14 re-run (June 2026 edition):** PDF upload of `MK Comm Found oak-grants-criteria-final-june-2026.pdf` (9 pages) produced `/api/upload/process` server-log warnings — `TypeError: Math.sumPrecise is not a function` (repeated) and font-substitution warnings for three embedded font subsets (`BCDIEE+SymbolMT`, `BCDHEE+ArialMT`, `BCDLEE+Calibri`). Traced to `unpdf`/`pdfjs-dist` internals (no match anywhere in this repo's own code) — `Math.sumPrecise` is a very new JS method pdfjs-dist appears to probe and fall back from safely; the font-substitution warnings are pdfjs-dist's rendering-path font logic, a different code path from text extraction. **Recorded as an observation, not a defect:** extraction completed cleanly in the same request (`13098 → 13080` chars pre-processed, matching the 9-page PDF sensibly) and the AI summary generated correctly (`stop_reason: end_turn`). Not confirmed whether this also fired on the archived November 2025 edition — nobody was watching live server logs during that 2026-07-27 run — so "new" here means newly observed, not necessarily newly introduced.

---

### MKCF-04 — AI Summary Content Accuracy — 20% Match Requirement, No Mismatch

**Prerequisite:** MKCF-03 complete. Review this **before** continuing past Step 3 — the summary is no longer easily visible once you proceed to Step 4 (see MKCF-05).

**Steps:**

1. Confirm no red eligibility-mismatch warning card appears — MK Minds Matter is Milton-Keynes-based and should pass. (The geographic-mismatch case using a non-MK charity against this same funder was already verified 2026-07-04 via the Elmbridge Families Together account, formerly part of this plan — see `eligibility-check-test-plan.md` for the current home of dedicated eligibility testing, and `DR-TEST-001` for why it isn't repeated here.)
2. Verify the summary includes:
   - Geographic restriction: Milton Keynes only
   - Grant range: Oak Grants £5,001–£15,000
   - **20% match funding requirement** — confirm it is surfaced clearly
   - Application priorities and eligibility criteria extracted accurately

**Expected result:**

- No mismatch triggered; Continue button available
- Summary accurately reflects MKCF Oak Grants criteria
- 20% match requirement present and clearly stated
- _(Spot-check only for hallucinated conditions, per `DR-AI-003` — not exhaustive verification, consistent with this suite's established testing limitation)_

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record where the 20% match requirement appeared in the summary):** Confirmed present in the Step 3 summary cards on both paths; no hallucinated conditions spotted in the spot-check.

**2026-08-14 re-run (June 2026 edition):** Confirmed directly against the persisted `applications.ai_summary` record (queried via the Supabase service role, not just visually) — `eligibilityMismatch: false`, `mismatchReason: null`; `aboutGrant` and `keyRequirements` both state the 20% match requirement explicitly ("Applicants must secure at least 20% of project costs from sources other than this grant"). No mismatch card shown, matching MK Minds Matter's Milton Keynes basis.

---

### MKCF-05 — Preparation Checklist and Start Writing

**Prerequisite:** MKCF-04 complete

**Steps:**

1. Click **Continue** to Step 4
2. Verify the **"Before you begin writing"** preparation checklist appears
3. Click **"I have what I need — start writing"**

**Expected result:**

- Preparation checklist displays correctly
- Step 4 loads with writing cards

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Checklist item count tracks question count — 9 items after the extraction fix on the upload path; shorter on the paste path since the pasted document is a narrower source (no supporting-documents content), not a defect.

**2026-08-14 re-run (June 2026 edition):** WJ completed this step live; no issues raised.

---

### MKCF-06 — Narrative Question Extraction, Word Limits, and Non-Narrative Filtering

**Prerequisite:** MKCF-05 complete

**Steps:**

1. On Step 4, record the total number of question cards displayed
2. For each card, record: question text and displayed word/character limit
3. Update the Expected Narrative Questions table above with actual values observed, and confirm whether the count is still 10 or has drifted (see the 10→12 note above the table)
4. Confirm data-entry, dropdown, Yes/No, and financial/administrative fields from the portal are absent as writing cards

**Expected result:**

- Narrative questions extracted with word/character limits (or confirmed absent, per the Known Expected Behaviours note)
- No dedicated match-funding question (expected absent — folded into Q6 instead, tested in MKCF-07)
- No data-entry, dropdown, or administrative fields appearing as writing cards

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes — 2026-08-19, production run:** ✅ **Pass. `GAP-90`'s fix confirmed live on production, and the count is unchanged: 19 questions plus 4 financial details, 23 total** — exactly the June 2026 edition's hand-derived figure from 2026-08-14, so no drift and no regression. ⚠️ **Raised during the run as a suspected `GAP-90` failure, and examined rather than accepted:** the two bank-signatory cards **share a citation**, both badged "Page 3 of the guidelines" and highlighting the same sentence. ✅ **Not a regression.** `GAP-90`'s defect was **byte-identical `questionText`**, and the two now read distinctly — _"The organisation's bank account must have at least two unrelated signatories."_ against _"The bank account signatories must be unrelated to one another — the account must have at least two signatories who are not related."_ — with distinct titles and distinct input types (number, and a Yes/No/Not sure yet dropdown). **The shared citation is by design:** the fix was scoped to `questionText` only, with "citation reuse stays legitimate" recorded at the time (`ADR-TRACEABILITY.md` v2.67), because **MKCF states both facts in a single sentence.** There is one sentence to cite, and citing anything else would point at text that is not the source — which `ADR-DATA-007` exists to prevent. ⚠️ **The fair criticism stands and is recorded, not dismissed:** clicking either badge highlights the same passage, which reads as redundant even though it is truthful. **Changing that would be a new decision, not a `GAP-90` reopening**, and it has not been raised as one. **WJ recorded this as a Pass on that evidence.**

**Notes (update Expected Narrative Questions table with actual observed values; flag if the count has moved from 10):** Count had moved well past 10 — see Defect Log #1. Root cause was a real extraction bug (project-budget questions and compound label+question lines silently dropped), not further drift; fixed same session, confirmed 19 questions on the upload path and 16 on the paste path, both genuine against source. Expected Narrative Questions table above marked superseded rather than rewritten line-by-line, since it's no longer being kept current per-question.

**2026-08-14 re-run (June 2026 edition):** Step 3's summary banner read "We found 19 application questions, plus 4 financial details… 23 in the next step." Independently derived the 19 by extracting the source PDF's own "Application Questions" section by hand (`pdftotext`) — 10 numbered narrative questions plus 9 non-numbered items (dates, geographic dropdown, budget figures, and two narrative funding-related questions) — exact match, confirming no drift or regression against the new edition. The 19 questions themselves (word limits, non-narrative filtering) are clean. **`GAP-90` found in the adjacent `governanceFacts` array** (not the `questions` array MKCF-06 itself checks): `governance_bank_signatory_count` and `governance_bank_signatories_related` share byte-identical text and citation, because the source states both in one sentence — live-confirmed on screen as two cards with identical guidance text/citation badge. Logged, not fixed, per WJ. See Defect Log #3 and `ADR-TRACEABILITY.md` `GAP-90`.

---

### MKCF-07 — Narrative Answer Writing, AI Assist, and Citation Check

**Prerequisite:** MKCF-06 complete

**Note:** This funder has historically shown no word/character limits and no budget/financial field to flag — confirm this still holds; if a limit or budget field now appears, treat MKCF-06/07 as needing a fresh look rather than assuming the old behaviour still applies.

**Steps:**

1. Navigate to the first narrative question and write an answer for MK Minds Matter (mental health drop-in sessions in Milton Keynes, three community centres, 300 clients per year)
2. Click **Help me improve this** — verify the refined answer corrects spelling/grammar and does not add invented facts
3. If a citation badge appears alongside the suggestion, click it and confirm the guidelines viewer opens with the relevant passage highlighted
4. Accept or dismiss the refined version and approve the answer
5. Navigate to Q6 ("How will you continue to fund the project beyond this grant?...") and write an answer covering both post-grant sustainability and how the 20% match is being met via volunteer counsellor hours and existing equipment
6. Approve all remaining mandatory questions

**Expected result:**

- AI assist works on narrative questions, corrects spelling/grammar, does not invent facts
- If present, a citation click opens the guidelines viewer with the passage highlighted
- Q6 answer covers both sustainability and the 20% match reference; AI assist available (not flagged as budget)

**Result:** ☒ Pass (caveat) &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Citation checking went well beyond one question — WJ checked citations question-by-question through the full paste-path set. Found citation highlight missing on 4 numbered questions (Q12/Q14/Q16/Q17) — see Defect Log #2; fixed same session and confirmed working via a fresh Step 3 regeneration and re-check. A governance-fact (Reserves) citation was independently confirmed correct on both paths. AI assist confirmed to correct spelling/grammar without inventing facts.

**2026-08-14 re-run (June 2026 edition):** WJ completed this step live (narrative answers written and approved, including the Q6-equivalent sustainability/match answer). No new observations beyond `GAP-90` and `GAP-91`, both of which sit in adjacent cases (MKCF-06's governance facts, MKCF-08's assemble button) rather than this one.

---

### MKCF-08 — Answer Approval and Assembly

**Prerequisite:** MKCF-07 complete

**Steps:**

1. Approve all mandatory question cards
2. Verify the progress bar reaches "Ready to assemble"
3. Click **Ready to assemble**
4. Verify the **"Before we put it together"** senior review screen appears
5. Click **Yes — assemble my draft**
6. On Step 5, verify correct funder and grant name displayed, and all approved answers shown read-only

**Expected result:**

- Assembly completes correctly
- Step 5 displays correct funder and grant name

**Result:** ☒ Pass (caveat) &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

**2026-08-14 re-run (June 2026 edition):** Assembly and the redirect to Step 5 both completed correctly — confirmed via production logs (`POST /step/4` → `POST /step/5` succeeded, `GET /step/5` served the assembled draft), no server-side error at any point. **`GAP-91` found:** WJ reported a red "We could not reach the server" banner flashing too fast to read, twice, immediately before Step 4 progressed both times. Logs showed nothing wrong server-side; source inspection found `handleReadyToAssemble` in `application-step4-draft.tsx` catches the `redirect()` throw that `setDraftReadyToAssemble` uses to signal success and misreports it as a transport failure — a false alarm on every successful click, not a real failure, and not new to this session (pre-existing code, just newly noticed). Logged, not fixed, per WJ. See Defect Log #4 and `ADR-TRACEABILITY.md` `GAP-91`.

---

### MKCF-09 — Export; Word Document Verified; Re-export Warning

**Prerequisite:** MKCF-08 complete

**Steps:**

1. Tick all three review checkboxes on Step 5
2. Click **Download as Word document (.docx)** — approves and downloads in one action; confirm a persistent "Application approved" banner replaces the checklist
3. Open the downloaded .docx and verify title, funder, export date/time, AI disclaimer, footer ("Prepared using Grant Pathway v[version] — grantpathway.org.uk" plus "Page N of NN"), and all approved answers present
4. Click **Download as Word document (.docx)** again and verify the re-export warning dialog shows the prior export timestamp; cancel
5. Click **Download as plain text (.txt)** — confirm through the re-export dialog again (D-WF-04, expected)
6. Verify the .txt file downloads with the same footer line but no page numbers

**Expected result:**

- Word export opens correctly in Microsoft Word; export date includes HH:MM timestamp
- Re-export warning shows the prior timestamp on both subsequent downloads
- Plain text download works

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes — 2026-08-19, production run:** ✅ **Pass — and this is the run that discharges `ABC-10`'s caveat.** ⚠️ **The multi-line fidelity check was exercised properly this time**, with genuinely multi-line answers written deliberately for it. **Line breaks and blank lines survive the export**: an answer written across two lines arrives in Word as two lines, and a later answer's three-line block arrives intact. **This is the first confirmation on production that `D-015`/`GAP-41`'s fix holds** — fixed 2026-08-06 (one `TextRun` per line with `break: 1`), covered by a test that unzips a generated `.docx` and counts `<w:br/>`, and confirmed manually in Word on 2026-08-14, **but never on production until now.** `ABC-10`'s Pass (caveat) in `AB-Charitable-Trust-test-plan.md` is answered by this run; the two flagships share the same export route. ⚠️ **One observation, raised as a question rather than a finding:** several exported lines show wide gaps between words — _"Not&nbsp;&nbsp;&nbsp;Sure&nbsp;&nbsp;&nbsp;How&nbsp;&nbsp;&nbsp;to describe this field"_, _"Outline&nbsp;&nbsp;&nbsp;Project&nbsp;&nbsp;&nbsp;Deliver"_. **If the tester typed tab characters, this is correct behaviour** — tabs are preserved and rendered at Word's default tab stops. **If single spaces were typed, it is a defect** and would mean something in the pipeline is converting them. **Unresolved at the time of writing; asked of WJ.** Recorded because the alternative — assuming the benign reading — is exactly how `D-015` survived `RT-09`. ✅ **Answered by WJ the same day: the spaces were typed deliberately, and the service did not add them.** **Correct behaviour, not a defect** — multiple consecutive spaces are preserved through the textarea, the database and the `docx` `TextRun` unchanged, which is what fidelity means. **Observation closed.** **Kept in the record rather than deleted**, because the check was worth making: the same question asked of `D-015` in July would have found a real defect, and the cost of asking is one message.

**Notes:**

**2026-08-14 re-run (June 2026 edition):** Confirmed clean via production logs — two `GET /api/export/{id}` requests (.docx then .txt), both `info`-level, no errors or warnings logged either time.

---

## Document History

| Version | Date                     | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.6     | 2026-08-14               | Rapidglobe Ltd | **`GAP-91` fixed — MKCF-08's caveat is closed, decided to build rather than accept.** `unstable_rethrow` (`next/navigation`) is the officially documented fix for exactly this case — `redirect()` is explicitly named in the bundled Next.js docs as an error that should be rethrown, not caught as an application error. Scope check before building found the original "likely shared by five other actions" claim was wrong: every other call site of the related redirect-ending actions already used the correct pattern; only 2 catch blocks, both in `application-step4-draft.tsx`, both calling `setDraftReadyToAssemble`, were actually at risk. `type-check`, `lint --max-warnings 0`, all 269 tests pass; live-verified against the local dev server with no regression. Both flagship-blocking caveats (`GAP-90`, `GAP-91`) are now closed. See `ADR-TRACEABILITY.md` v2.68.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2.5     | 2026-08-14               | Rapidglobe Ltd | **`GAP-90` fixed and live-verified — MKCF-06's caveat is closed.** WJ approved the drafted prompt wording (`lib/prompts.ts`'s `governanceFacts` rule, `DISTINCT WORDING WHEN ONE SENTENCE ANSWERS TWO FACTS`, scoped to `questionText` only). Verified live against both known-affected funders before pushing: MKCF's bank-signatory count/relatedness facts now read distinctly, and Nationwide's harder case — one sentence combining three facts at once (trustee count+relatedness, bank-signatory count, bank-signatory relatedness) — also produced three correctly distinct paraphrases. `type-check`, `lint --max-warnings 0`, all 269 tests pass. `GAP-91` (MKCF-08's caveat) remains open — narrowed by research to most likely being an ordinary network hiccup rather than a recurring defect, but not yet a WJ decision on whether a guard is still worth building. See `ADR-TRACEABILITY.md` v2.67.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.4     | 2026-08-14               | Rapidglobe Ltd | **Re-run against the June 2026 edition complete — MKCF-01–09 all Pass, closing the "not yet re-verified" status opened at v2.3.** WJ drove the browser live; Claude watched Vercel production logs throughout and queried the persisted `applications.ai_summary` record directly via the Supabase service role to verify against ground truth rather than the screen alone. The 19-question upload-path count held exactly — independently re-derived from the source PDF's own text (`pdftotext`), not assumed from the archived edition's count. AI summary generation measured at **43 seconds** (39.6s Bedrock call), within NFR-01's 45-second large-document tier for this 9-page PDF; `stop_reason: end_turn` with 4110/6000 output tokens, comfortable headroom under `GAP-52`'s cap. Two new gaps found and logged (not fixed, per WJ): **`GAP-90`** — the `governanceFacts` array (PDR-AI-008) produces two entries with byte-identical text when the guidelines state bank-signatory count and relatedness in one sentence, visibly duplicating a card on Step 4; likely also affects Nationwide Building Society's guidelines, unconfirmed. **`GAP-91`** — clicking "Ready to assemble" flashes a false "We could not reach the server" error on every successful click (client-side `try/catch` misreading the `redirect()` throw that signals success as a transport failure); pre-existing, not new to this session, and likely shared by five other actions with the same "success ends in `redirect()`" shape. Both logged in `ADR-TRACEABILITY.md` (`GAP-90`/`GAP-91`, v2.62/2.63). One benign observation recorded, not a defect: `unpdf`/`pdfjs-dist` extraction warnings (`Math.sumPrecise is not a function`, font-substitution notices) during PDF upload, with zero effect on extraction quality. `TEST-DASHBOARD.md` row moves 🟡 → 🟢. |
| 1.0–1.5 | 2026-06-17 to 2026-07-04 | Rapidglobe Ltd | Full history archived — see prior version in git history. Summary: initial two-account plan (Elmbridge Families Together mismatch + MK Minds Matter happy path), 13 test cases; corrections for auto-confirming email verification (D-012), merged approve+download export flow (D-WF-04), empty-state dashboard button; clean full retest 2026-07-04, all 13 cases passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.3     | 2026-08-10               | Rapidglobe Ltd | **Guidelines refreshed to June 2026 edition, ahead of a live demo the next day.** WJ downloaded current Oak/Seed/Sapling criteria from the MKCF website and uploaded them to `docs/Grant Org Guidelines/` (`MK Comm Found oak-grants-criteria-final-june-2026.pdf` plus Seed and Sapling variants, not used by this plan). The November 2025 file this plan was executed against was archived to `docs/Grant Org Guidelines/archive/` (not deleted) rather than overwritten, per this plan's own L6-era instruction. Overview and "Guidelines — access before testing" re-pointed at the new file. **The 2.2/2.1 Pass results (MKCF-01–09, 19/16 questions) stand only for the archived November 2025 edition and are not carried forward** — this plan cannot be treated as current evidence of app behaviour against the June 2026 guidelines until MKCF-01–09 is re-run. `TEST-DASHBOARD.md` row moved 🟢 → 🟡 pending that re-run.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2.2     | 2026-07-30               | Rapidglobe Ltd | **Wrong guidelines filename corrected in both places it appeared — audit finding L6.** The Overview and the "Guidelines — access before testing" section both cited `docs/Grant Org Guidelines/mkcf-oak-grants-criteria.pdf`. **That filename has never existed.** The file in the repository is `MK Comm oak-grants-criteria-final-nov-2025.pdf`. The audit framed the risk as a tester being unable to find the input document; the real risk was the opposite and worse — the access section said to save the criteria to that path "if not already present", so a tester would have concluded the file was absent, downloaded the **current** version from MKCF, and saved a second copy under a different name. The repository copy is explicitly the **November 2025** edition, and every recorded MKCF result is measured against it, including the extracted question count, which has moved across runs (10 → 12 → 16 on the paste path, 19 on the upload path). Testing against a silently newer edition would have invalidated that comparison with nothing to show it had happened. Both citations now name the existing file; the access section forbids a fresh download and states what to do if the guidelines genuinely need refreshing (add alongside under a dated name, update expected results, record it here — never overwrite or substitute). Swept the other live test plans in the same pass: the four other guideline-file citations all resolve. **`TEST-DASHBOARD.md` had the filename right all along** — its funder table cites the correct name, so the right answer was sitting two documents away from the plan that got it wrong. No dashboard change needed; its status is unaffected.                                                                                                                                        |
| 2.1     | 2026-07-27               | Rapidglobe Ltd | Full clean execution completed, both extraction paths: MKCF-01–09 all Pass. MKCF-06 surfaced a real question-extraction bug (project-budget questions and compound label+question lines silently dropped) and MKCF-07 surfaced a real citation-highlight bug (soft-wrapped numbered questions in pasted guidelines) — both root-caused, fixed, and live-verified same session; see Defect Log and `CHANGELOG.md` 2026-07-27. Question counts confirmed: 19 (upload path), 16 (paste path) — the old 10-question Expected Narrative Questions table marked superseded rather than rewritten line-by-line.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.0     | 2026-07-24               | Rapidglobe Ltd | **Rewritten as a flagship plan under `DR-TEST-001`.** Removed the Elmbridge Families Together account and its three test cases (IT-MKCF-01–03) — the geographic-mismatch case now lives in `eligibility-check-test-plan.md` (EL-02), reusing the already-passed 2026-07-04 result rather than re-running it here. Step 1 rewritten from the removed funder picker to the current free-text fields (`DR-FD-001` v1.4). Registration step gained the missing "Profile saved" confirmation screen and feedback-consent checkbox; password requirement corrected to 12+ characters with letters and numbers. Merged old IT-MKCF-10 (non-narrative handling) into IT-MKCF-09, resolving the open "not actioned" TODO logged in v1.4. Added a citation-check step to the writing/AI-assist case. Renumbered IT-MKCF-04–13 to MKCF-01–09 (13 cases reduced to 9). Flagged the previously-noted 10→12 question drift as unconfirmed against this rewritten plan, to be re-verified at MKCF-06.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
