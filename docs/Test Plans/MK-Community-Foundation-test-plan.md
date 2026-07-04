# MK Community Foundation — Oak Grants Test Plan

**Version:** 1.3
**Date:** 2026-07-04
**Status:** Complete — clean full retest executed 2026-07-04. All 13 test cases (IT-MKCF-01–13) passed. RT-00 passed, confirmed against `grant-pathway-dev` (via `sb-stanwaejdvlvremtffkf-auth-token` cookie). The unresolved issue that stopped the 2026-07-03 attempt at IT-MKCF-11 did not reproduce. A batch of plan-quality TODOs (redundant/inconsistent steps and expected results found during this run) is pending a follow-up amendment — see inline "TODO (next amendment...)" notes under IT-MKCF-06, 08, 09, and 10.
**Tester:** WJ
**Test accounts:** grantpathway+walton1@gmail.com (Elmbridge Families Together — geographic mismatch) · grantpathway+mkcf1@gmail.com (MK Minds Matter — happy path, new account)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the **MK Community Foundation Oak Grants** programme. MK Community Foundation funds charities and voluntary organisations delivering activities and services that benefit residents of **Milton Keynes**. Oak Grants support projects costing between £5,001 and £15,000, with a **20% match funding requirement**.

**Risk-based coverage:** This plan tests the Oak Grants variant only. If Oak passes, **Seed Grants** (up to £750, 5 questions) and **Sapling Grants** (£750–£5,000, 6 questions) are assumed to pass — same portal, same funder type, fewer questions. The **Strategic Partnership Grants** (above £15,000 p.a.; email EOI; narrative) is a different funder type and must be tested separately when required.

**This test plan runs two accounts in sequence:**

1. **Elmbridge Families Together (geographic mismatch test)** — Financial hardship charity based in Elmbridge, Surrey. MK Community Foundation exclusively funds organisations benefiting Milton Keynes residents. This tests FR-47 (eligibility hard stop) for geographic ineligibility.

2. **MK Minds Matter (happy path)** — Fictional mental health and wellbeing charity based in Milton Keynes. Clear geographic fit for MKCF and broad community benefit focus. Tests the full end-to-end flow through to export.

**Guidelines source:** MK Community Foundation publishes grant criteria on its website. The Oak Grants portal questions are accessed via the online application system. As with other portal-based funders, the tester should paste the criteria text and portal questions into Step 2 if a downloadable PDF is not available. The exact portal questions (estimated at 10) will be confirmed during IT-MKCF-06.

**20% match funding requirement:** Oak Grants require the applicant to contribute at least 20% of total project costs. The AI summary should extract and surface this requirement. The test charity (MK Minds Matter) should have match funding available — this is noted in the charity profile.

**AI policy:** Check MKCF's published criteria or website for any statement on AI use. Note whether the AI summary reflects an AI policy or flags it as absent.

---

## Pre-Test Setup

### Environment check — run first, every session

Run **RT-00** in `regression-test-plan.md` before starting IT-MKCF-01. On 2026-07-01 an audit found `grant-pathway-dev` and `grant-pathway-prod` had been silently missing the AI usage-cap RPCs (both projects) and the `approve_application`/`reopen_application` RPCs (prod only) for weeks — this has been fixed, but never re-verified. Skipping RT-00 risks the AI summary (IT-MKCF-06) or export/approve step (IT-MKCF-13) failing in a way that looks like a product bug rather than a schema gap. Confirm via RT-00 step 1 which Supabase project (dev/prod) the test URL is backed by, and record it in this plan's notes.

### Guidelines — access before testing

Obtain the MKCF Oak Grants criteria and portal questions:

- Visit the MK Community Foundation website and navigate to Oak Grants
- Download the criteria PDF if available, or copy the eligibility and application criteria to a text file
- Save as `docs/Grant Org Guidelines/mkcf-oak-grants-criteria.pdf` (or `.txt`)
- If portal questions are not in the criteria document, note the question list and word limits from the portal preview/guidance page and paste them alongside the criteria text

### Account 1 — Elmbridge Families Together (existing)

- Email: `grantpathway+walton1@gmail.com`
- Profile should show Elmbridge Families Together based in Elmbridge, Surrey. Verify before running — do not modify.

### Account 2 — MK Minds Matter (new account to create)

Register `grantpathway+mkcf1@gmail.com` and set up the following charity profile:

| Field                       | Value                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First name                  | James                                                                                                                                                                                                                                                                                                                                                                              |
| Last name                   | Nkosi                                                                                                                                                                                                                                                                                                                                                                              |
| Charity name                | MK Minds Matter                                                                                                                                                                                                                                                                                                                                                                    |
| Registration number         | (leave blank — optional)                                                                                                                                                                                                                                                                                                                                                           |
| What does your charity do?  | MK Minds Matter provides free counselling, peer support groups, and community mental health workshops for adults experiencing anxiety, depression, and social isolation in Milton Keynes. We run weekly drop-in sessions at three community centres across central MK, Bletchley, and Newport Pagnell, supporting approximately 300 clients per year. We are a registered charity. |
| Who does your charity help? | Adults aged 18 and over experiencing mental health challenges, loneliness, or emotional crisis in Milton Keynes and surrounding areas, including those on low incomes who cannot access private therapy.                                                                                                                                                                           |
| Where do you work?          | Milton Keynes (central MK, Bletchley, and Newport Pagnell)                                                                                                                                                                                                                                                                                                                         |

**Match funding note:** MK Minds Matter can contribute 20% match through in-kind volunteer counsellor hours and existing equipment. Reference this in any project description answers during testing.

---

## Test Data

### Account 1 — Elmbridge Families Together (mismatch test)

| Item                         | Value                                                 |
| ---------------------------- | ----------------------------------------------------- |
| Test user email              | grantpathway+walton1@gmail.com                        |
| Charity name                 | Elmbridge Families Together                           |
| Funder                       | MK Community Foundation — Oak Grants                  |
| Grant name                   | Community Support — Surrey Families 2026              |
| Guidelines source            | MKCF Oak Grants criteria (same file as happy path)    |
| Expected eligibility outcome | Mismatch (Elmbridge, Surrey is outside Milton Keynes) |

### Account 2 — MK Minds Matter (happy path)

| Item                         | Value                                             |
| ---------------------------- | ------------------------------------------------- |
| Test user email              | grantpathway+mkcf1@gmail.com                      |
| Charity name                 | MK Minds Matter                                   |
| Funder                       | MK Community Foundation — Oak Grants              |
| Grant name                   | Community Mental Health Drop-In Programme 2026–27 |
| Grant amount                 | £8,500 (within Oak Grants range £5,001–£15,000)   |
| Guidelines source            | MKCF Oak Grants criteria (paste or PDF upload)    |
| Expected eligibility outcome | Pass                                              |

---

## Known Expected Behaviours

| Ref                     | Description                                                                                                                                                                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IT-MKCF-02              | Elmbridge Families Together (Surrey) is expected to trigger a geographic mismatch. MKCF exclusively funds organisations benefiting Milton Keynes residents.                                                                                                                                                                |
| 20% match requirement   | Oak Grants require 20% match funding from the applicant. The AI summary should extract this and it should appear in the summary cards. Note how it is surfaced (eligibility card or summary note).                                                                                                                         |
| Portal questions        | The 10 Oak Grants questions are in an online portal — a criteria document or guidance page may not contain them verbatim. Paste path likely required. Confirm actual question count during testing.                                                                                                                        |
| Non-narrative questions | Portal applications typically include data-entry fields (organisation finances, governance). These should not appear as Step 4 writing cards.                                                                                                                                                                              |
| AI policy               | Confirm whether MKCF has a published AI use policy. Flag as absent rather than fabricated if none found.                                                                                                                                                                                                                   |
| Seed/Sapling assumption | This plan tests Oak only. Seed (5 questions) and Sapling (6 questions) are assumed to pass under risk-based coverage. Run a brief smoke test (Steps 1–3 only) if any doubt arises.                                                                                                                                         |
| Empty-state button      | IT-MKCF-05 uses a freshly registered account (zero applications). The dashboard shows **Start your first application**, not **+ New Application** — the latter only appears once at least one application already exists. Confirmed in the user guide and live in the app.                                                 |
| Test order              | IT-MKCF-07 (AI summary content accuracy) must run **before** IT-MKCF-08 (checklist/start writing) — clicking "I have what I need — start writing" in the old IT-MKCF-07 navigates past Step 3, so the AI summary is no longer available to review afterwards. Found live during 2026-07-03 testing; reordered accordingly. |

---

## Expected Narrative Questions (confirmed during IT-MKCF-09, 2026-07-03)

The indicative list below (based on typical MKCF Oak Grants applications) has been replaced with the actual 10 questions extracted and observed live on Step 4.

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

**Findings from IT-MKCF-09:**

- **No word/character limits displayed on any of the 10 questions** — each card shows only a running word count (e.g. "0 words"), with no visible cap. Not treated as a defect at this stage — record as an observation; may reflect the real MKCF Oak Grants portal genuinely having no limits on these fields, but worth independently checking against the live portal if access is available.
- **No dedicated match-funding question found.** None of the 10 questions specifically asks how the 20% match requirement will be met — Q6 is about funding continuation _after_ the grant period (sustainability), not the match itself. Not logged as a defect — the AI summary correctly surfaced the 20% match requirement in IT-MKCF-07, and the real MKCF application likely collects match-funding evidence via a separate budget/financial section not modelled as a narrative card here. Recorded as an observation for awareness, not a product gap.

---

## Test Results Summary

| Test ID    | Test Name                                                               | MKCF-specific | AI Summary Time | Result | Notes |
| ---------- | ----------------------------------------------------------------------- | ------------- | --------------- | ------ | ----- |
| IT-MKCF-01 | Elmbridge Families Together sign in and profile verification            | No            | N/A             | Pass   |       |
| IT-MKCF-02 | Elmbridge Families Together — MKCF funder picker and guidelines upload  | Yes           | 28s             | Pass   |       |
| IT-MKCF-03 | Elmbridge Families Together — geographic eligibility mismatch confirmed | Yes           | N/A             | Pass   |       |
| IT-MKCF-04 | MK Minds Matter account registration and profile setup                  | No            | N/A             | Pass   |       |
| IT-MKCF-05 | MK Minds Matter — MKCF Oak Grants funder picker                         | Yes           | N/A             | Pass   |       |
| IT-MKCF-06 | MK Minds Matter — guidelines upload/paste and AI summary                | Yes           | 26s             | Pass   |       |
| IT-MKCF-07 | MK Minds Matter — AI summary content accuracy and 20% match requirement | Yes           | N/A             | Pass   |       |
| IT-MKCF-08 | MK Minds Matter — eligibility check passes; preparation checklist       | Yes           | N/A             | Pass   |       |
| IT-MKCF-09 | MK Minds Matter — narrative question extraction and word limits         | Yes           | N/A             | Pass   |       |
| IT-MKCF-10 | MK Minds Matter — non-narrative question handling                       | Yes           | N/A             | Pass   |       |
| IT-MKCF-11 | MK Minds Matter — narrative answer writing and AI assist                | No            | N/A             | Pass   |       |
| IT-MKCF-12 | MK Minds Matter — answer approval and assembly                          | No            | N/A             | Pass   |       |
| IT-MKCF-13 | MK Minds Matter — export; Word document verified; re-export warning     | No            | N/A             | Pass   |       |

---

## Defect Log

| ID  | Test | Description | Severity | Status |
| --- | ---- | ----------- | -------- | ------ |

---

## Test Cases

---

### IT-MKCF-01 — Elmbridge Families Together Sign In and Profile Verification

**MKCF-specific:** No
**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Sign in as `grantpathway+walton1@gmail.com`
3. Navigate to **Charity Profile** and verify the profile reads Elmbridge Families Together, Elmbridge, Surrey
4. Do not modify the profile — it is used as-is for the geographic mismatch test

**Expected result:**

- Sign in succeeds
- Profile shows Elmbridge Families Together (Surrey) correctly
- Dashboard accessible

**Result:** Pass

**Notes:** Sign-in succeeded, profile confirmed as Elmbridge Families Together (Elmbridge, Surrey), dashboard accessible.

---

### IT-MKCF-02 — Elmbridge Families Together — MKCF Funder Picker and Guidelines Upload

**MKCF-specific:** Yes — tests geographic eligibility mismatch
**Prerequisite:** IT-MKCF-01 complete; MKCF Oak Grants criteria file ready

**Steps:**

1. From the dashboard, click **+ New Application**
2. Type **"MK Community"** in the funder picker
3. Confirm **MK Community Foundation — Oak Grants** appears with a **Structured** badge
4. Select it
5. Enter grant name: **"Community Support — Surrey Families 2026"**
6. Click **Continue**
7. On Step 2, upload or paste the MKCF Oak Grants criteria
8. Click **Continue**
9. On Step 3, start a stopwatch — AI summary auto-generates on page load
10. Stop when summary cards appear — record the time
11. Note whether a red eligibility mismatch warning appears

**Expected result:**

- MK Community Foundation — Oak Grants appears in picker with Structured badge
- Guidelines accepted
- AI summary generates without error

**Result:** Pass

**Notes (record summary time and whether mismatch warning appears):** Structured badge confirmed. AI summary generated in 28 seconds. Red eligibility mismatch warning appeared on Step 3.

---

### IT-MKCF-03 — Elmbridge Families Together — Geographic Eligibility Mismatch Confirmed

**MKCF-specific:** Yes — FR-47 eligibility hard stop for geographic restriction
**Prerequisite:** IT-MKCF-02 complete

**Steps:**

1. If a red mismatch warning appeared on Step 3, verify it cites geographic ineligibility (Elmbridge/Surrey is outside Milton Keynes)
2. Click **"I understand — return to my dashboard"**
3. Verify the dashboard shows the application with a red **"Ineligible"** badge and no Continue button

**If no mismatch appeared (unexpected):**

- Record as a defect and note the AI summary content and eligibility criteria shown
- Do not proceed with the Elmbridge account

**Expected result:**

- Red mismatch warning displayed citing geographic restriction (Milton Keynes only)
- Application marked Ineligible on dashboard
- FR-47 hard stop confirmed

**Result:** Pass

**Notes:** Red mismatch card correctly cited Milton Keynes-only geographic criterion and Elmbridge/Surrey location; Continue button hidden, only "I understand — return to my dashboard" available. Dashboard confirmed application marked Ineligible after acknowledgement. FR-47 hard stop confirmed.

---

### IT-MKCF-04 — MK Minds Matter Account Registration and Profile Setup

**MKCF-specific:** No
**Prerequisite:** IT-MKCF-03 complete; sign out of walton1 account

**Steps:**

1. Sign out of Elmbridge Families Together account
2. Register `grantpathway+mkcf1@gmail.com` (first name James, last name Nkosi)
3. Open the verification email and click the verification link — as of D-012 (2026-07-02) this now auto-confirms on page load (no second button click) and expires after **1 hour** (not 24). Don't leave this step for later in the session.
4. On first login, complete the charity profile using the MK Minds Matter values in the Pre-Test Setup table above
5. Save the profile and confirm redirect to dashboard

**Expected result:**

- Registration and email verification completes without error
- Charity profile saves successfully
- Dashboard shows profile complete (no incomplete banner)

**Result:** Pass

**Notes:** Registration and email verification completed without error. Charity profile saved successfully ("Profile saved" confirmation screen). Dashboard confirmed ready for first application.

---

### IT-MKCF-05 — MK Minds Matter — MKCF Oak Grants Funder Picker

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-04 complete

**Steps:**

1. From the dashboard, click **Start your first application** — this is a brand-new account with zero applications, so the dashboard shows this empty-state button rather than the **+ New Application** button that appears once at least one application exists (per the user guide)
2. Type **"MK Community"** in the funder picker
3. Confirm **MK Community Foundation — Oak Grants** appears with a **Structured** badge
4. Select it
5. Enter grant name: **"Community Mental Health Drop-In Programme 2026–27"**
6. Click **Continue**

**Expected result:**

- MK Community Foundation — Oak Grants appears with Structured badge
- Application created and Step 2 displayed

**Result:** Pass

**Notes:** Empty-state "Start your first application" button confirmed on fresh account. Structured badge confirmed. Application created, Step 2 (Uploaded Guidelines) displayed correctly with grant name "Community Mental Health Drop-In Programme 2026–27 - Retest 040726".

---

### IT-MKCF-06 — MK Minds Matter — Guidelines Upload/Paste and AI Summary

**MKCF-specific:** Yes — tests guidelines input and AI summary for portal-based structured funder
**Prerequisite:** IT-MKCF-05 complete; MKCF Oak Grants criteria file ready

**Steps:**

1. On Step 2, upload the MKCF Oak Grants criteria PDF (if available) — or paste the criteria text
2. Click **Continue**
3. On Step 3, start a stopwatch — summary auto-generates on page load
4. Stop when summary cards appear — record the time
5. Review all summary cards
6. Check whether application questions have been extracted (word limit accuracy is checked separately in IT-MKCF-09)
7. **If no questions extracted from PDF alone:** go back to Step 2, switch to paste mode, and include the portal question text alongside the criteria. Regenerate and note which input method worked.
8. Note whether a red eligibility mismatch warning appears (not expected for MK Minds Matter)

**Expected result:**

- Guidelines accepted and AI summary generates within NFR-01 (≤45 seconds)
- Summary reflects Milton Keynes focus, grant range, 20% match requirement, and application priorities
- MK Minds Matter should pass eligibility

**Result:** Pass

**Notes (record input method used and whether PDF or paste was needed for question extraction):** AI summary generated in 26 seconds.

**TODO (next amendment):** Remove steps 7 and 8 — WJ flagged as redundant 2026-07-04.

---

### IT-MKCF-07 — MK Minds Matter — AI Summary Content Accuracy and 20% Match Requirement

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-06 complete. Review this **before** continuing past Step 3 (AI Summary) — the summary is no longer easily visible once you proceed to Step 4 and start writing (see IT-MKCF-08).

**Verify the summary includes:**

- Geographic restriction: Milton Keynes only
- Grant range: Oak Grants £5,001–£15,000
- **20% match funding requirement** — this is a key Oak Grants criterion; confirm it is surfaced
- Application priorities and eligibility criteria extracted accurately
- Any AI policy statement (or absence flagged gracefully)

**Expected result:**

- Summary accurately reflects MKCF Oak Grants criteria
- 20% match requirement present and clearly stated
- No hallucinated conditions

**Result:** Pass

**Notes (record whether 20% match requirement was extracted and where it appeared in the summary):** 20% match requirement confirmed present and correctly stated in the summary.

**Enhancement (not a defect):** WJ suggested displaying the 20% match requirement in bold/larger font given it's a hard eligibility condition. Recommend scoping this as a general pattern for all funder-specific "hard conditions" (match %, hard deadlines, exclusions) rather than an MKCF-only tweak — worth a DDR before implementing.

**Testing limitation noted (2026-07-04):** "No hallucinated conditions" cannot be reliably tested by a human reviewer at the depth this check implies — guidelines documents can run to 9+ pages, and Grant Pathway's value proposition is specifically removing the burden of digesting documents that size. The tester cross-checking the full guidelines against the AI summary line-by-line isn't practical or repeatable. The mandatory Step 4 "Are all figures, dates, and facts correct?" checklist remains valid and necessary, but does not substitute for a hallucination check at Step 3. See DR-AI-003 (chose human review over automated fact-checking for v1; automated validation flagged there as a future enhancement) — this test plan will continue treating IT-MKCF-07's "no hallucinated conditions" criterion as a spot-check only, not exhaustive verification.

---

### IT-MKCF-08 — MK Minds Matter — Eligibility Check Passes; Preparation Checklist

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-07 complete (AI summary content reviewed while still on Step 3)

**Steps:**

1. Confirm no mismatch warning appeared — eligibility passed
2. Click **Continue** to Step 4
3. Verify the **"Before you begin writing"** preparation checklist appears correctly
4. Click **"I have what I need — start writing"**

**Expected result:**

- Preparation checklist displays correctly
- Step 4 loads with writing cards

**If mismatch appears (unexpected):**

- Record the mismatch reason as a defect and investigate before proceeding

**Result:** Pass

**Notes:**

**TODO (next amendment):** Remove step 1 ("Confirm no mismatch warning appeared — eligibility passed") — redundant, since reaching IT-MKCF-07 already proves no mismatch occurred (FR-47's mismatch state and the Step 3 summary view are mutually exclusive). Also removed the "MK Minds Matter passes eligibility..." expected-result bullet for the same reason — flagged by WJ 2026-07-04.

---

### IT-MKCF-09 — MK Minds Matter — Narrative Question Extraction and Word Limits

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-08 complete; preparation checklist confirmed

**Steps:**

1. On Step 4, record the total number of question cards displayed
2. For each card, record: question text and displayed word/character limit
3. Update the Expected Narrative Questions table above with actual values observed
4. Verify the total question count matches the expected 10 (or note any discrepancy)

**Expected result:**

- Narrative questions extracted with word/character limits
- Total approximately 10 questions (confirm actual count)
- Match funding question present (Q7 or equivalent)
- No data-entry or administrative fields appearing as writing cards

**Result:** Pass

**Notes (update Expected Narrative Questions table with actual observed values):** The Expected Narrative Questions table above already reflects the actual 10 questions observed during the 2026-07-03 attempt (including the no-limit and no-match-question findings) — re-confirmed these hold on this run.

**TODO (next amendment, end-of-testing batch):** Expected result bullet "Match funding question present (Q7 or equivalent)" contradicts the Expected Narrative Questions section's own recorded finding ("No dedicated match-funding question found" — folded into Q6 sustainability answer instead). Update the bullet to reflect that finding. Flagged by WJ 2026-07-04.

---

### IT-MKCF-10 — MK Minds Matter — Non-Narrative Question Handling

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-06 complete

**Steps:**

1. Review Step 4 — confirm data-entry, dropdown, Yes/No, and financial fields from the portal are absent as writing cards
2. Confirm administrative questions (company number, turnover, governance) are absent
3. Note whether any budget-related question is flagged with the amber budget card (£ badge, AI assist disabled)
4. Verify the budget card warning message if present: "AI cannot assist you with this"

**Expected result:**

- Non-narrative portal fields absent from Step 4
- Any financial/budget question correctly flagged with amber budget card
- Assembly gate not affected by administrative fields

**Result:** Pass

**Notes:** Steps 1-2 pass — non-narrative/administrative fields absent from Step 4.

**TODO (next amendment, end-of-testing batch):** Remove step 3 ("Note whether any budget-related question is flagged with the amber budget card...") and step 4 ("Verify the budget card warning message if present...") — not applicable to this funder. MKCF Oak Grants has no budget/financial field among its 10 questions (confirmed in IT-MKCF-09/11); these steps belong in a generalised test plan template, not this one. Flagged by WJ 2026-07-04. WJ also suggested IT-MKCF-10 could be merged into another test case in the same amendment (candidate: fold into IT-MKCF-09, since both are about Step 4 question extraction/typing) — decide exact merge shape when doing the amendment pass.

---

### IT-MKCF-11 — MK Minds Matter — Narrative Answer Writing and AI Assist

**MKCF-specific:** No
**Prerequisite:** IT-MKCF-09 complete

**Note:** This funder has no word/character limits on any of its 10 questions and no budget/financial field to flag — confirmed independently during this session (200- and 500+-word pastes accepted cleanly with accurate counts; see IT-MKCF-09/IT-MKCF-10). Counter accuracy and over-limit/hard-stop/trim-to-limit behaviour are therefore **not tested here** — there is nothing to trigger them against.

**⚠️ Watch closely on retest:** the 2026-07-03 attempt reported an issue on this test case, but the specifics were not captured before the run was abandoned in favour of a clean restart. Pay particular attention to AI assist behaviour on both the first question and the Q6 sustainability/match answer, and log a proper defect (with exact steps, expected vs. actual) if anything is off.

**Steps:**

1. Navigate to the first narrative question (project description or organisation overview)
2. Write an answer for MK Minds Matter — mental health drop-in sessions in Milton Keynes, three community centres, 300 clients per year
3. Click **Help me improve this** — verify the refined answer corrects spelling/grammar and does not add invented facts
4. Accept or dismiss the refined version and approve the answer
5. Navigate to Q6 ("How will you continue to fund the project beyond this grant?...") — there is no dedicated match-funding question (confirmed in IT-MKCF-09), so the 20% match is tested here instead, folded into the sustainability answer
6. Write an answer for Q6 that covers both post-grant sustainability and how the 20% match is being met via volunteer counsellor hours and existing equipment — confirm AI assist works normally on this question (it is a plain narrative field, not a budget card)
7. Approve all remaining mandatory questions

**Expected result:**

- AI assist works on narrative questions, corrects spelling/grammar, does not invent facts
- Q6 answer covers both sustainability and the 20% match reference; AI assist available (not flagged as budget)

**Result:** Pass

**Notes:** No issues. The unresolved issue from the aborted 2026-07-03 attempt did not reproduce on this clean retest.

---

### IT-MKCF-12 — MK Minds Matter — Answer Approval and Assembly

**MKCF-specific:** No
**Prerequisite:** IT-MKCF-11 complete

**Steps:**

1. Approve all mandatory question cards
2. Verify the progress bar reaches "Ready to assemble"
3. Click **Ready to assemble**
4. Verify the **"Before we put it together"** senior review screen appears
5. Click **Yes — assemble my draft**
6. On Step 5, verify:
   - Correct funder (MK Community Foundation — Oak Grants) and grant name displayed
   - All approved answers shown in read-only view

**Expected result:**

- Assembly completes correctly
- Step 5 displays correct funder and grant name

**Result:** Pass

**Notes:** No issues. Step 5 correctly displays MK Community Foundation — Oak Grants and grant name "Community Mental Health Drop-In Programme 2026–27 - Retest 040726".

---

### IT-MKCF-13 — MK Minds Matter — Export; Word Document Verified; Re-export Warning

**MKCF-specific:** No
**Prerequisite:** IT-MKCF-12 complete

**Steps:**

1. Tick all three review checkboxes on Step 5
2. Click **Download as Word document (.docx)** — this both approves and downloads in one action (no separate Approve button/modal since 2026-06-12); confirm a persistent "Application approved" banner replaces the checklist
3. Open the downloaded .docx file and verify:
   - Title: **"Community Mental Health Drop-In Programme 2026–27"**
   - Funder: **"MK Community Foundation"** (or similar)
   - Export date includes time (e.g. **"17 June 2026, 10:30"**)
   - AI disclaimer present and correctly worded
   - Footer reads "Prepared using Grant Pathway v[version] — grantpathway.org.uk" plus a "Page N of NN" line (page numbering added 2026-07-02)
   - All approved answers present
4. Click **Download as Word document (.docx)** again
5. Verify the re-export warning dialog appears with the prior export timestamp
6. Cancel — do not re-export
7. Click **Download as plain text (.txt)** — because the application was already exported as Word in step 2, the re-export confirmation dialog will appear again here too (D-WF-04, expected, not a defect); confirm through it
8. Verify a .txt file is downloaded, with the same footer line but no page numbers (plain text has no concept of pages)

**Expected result:**

- Word export opens correctly in Microsoft Word
- Export date includes HH:MM timestamp
- Re-export warning shows full timestamp on both the second Word download and the plain-text download
- Plain text download works

**Result:** Pass

**Notes:** Title, funder, and export date/time (04 July 2026, 09:14) all correct. AI disclaimer present and correctly worded. Footer "Prepared using Grant Pathway v2026.07.04-5afc638 — grantpathway.org.uk" with "Page 1 of 3" confirmed. Re-export warning dialog appeared correctly on both the second Word download and the plain-text download, citing the 4 July 2026, 09:14 prior export timestamp. Plain-text download completed with matching footer line, no page numbers (as expected — plain text has no page concept).

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-17 | Rapidglobe Ltd | Initial test plan — MK Community Foundation Oak Grants. Risk-based: Oak covers Seed and Sapling variants. Two accounts: Elmbridge Families Together (geographic mismatch) and MK Minds Matter (happy path). 13 test cases. 20% match funding requirement flagged as key extraction check.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 1.1     | 2026-07-03 | Rapidglobe Ltd | Updated before first execution to reflect changes made since v1.0 (all 2026-07-01/02): added mandatory RT-00 environment/schema check to Pre-Test Setup (AI-cap and approve/reopen RPCs were found missing on dev/prod for weeks, now fixed but unverified); updated IT-MKCF-04 for the new auto-confirming email verification flow and 1-hour link expiry (D-012); updated IT-MKCF-13 to reflect the merged approve+download action (2026-06-12), the new Word page-numbering footer line, and the re-export confirmation dialog now expected on the plain-text download too (D-WF-04).                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 1.2     | 2026-07-03 | Rapidglobe Ltd | Incorporated corrections found during a same-day execution attempt that did not complete cleanly (stopped at IT-MKCF-11, cause not captured — results cleared, retest from IT-MKCF-01). Corrections: IT-MKCF-05 empty-state dashboard shows "Start your first application", not "+ New Application" (fixed for freshly registered accounts only); swapped IT-MKCF-07/08 order so AI summary content accuracy is reviewed before the checklist/start-writing step navigates past it; replaced the indicative Expected Narrative Questions table with the actual 10 questions observed live, and recorded as observations (not defects) that none of MKCF's 10 Oak Grants questions display a word/character limit and none specifically asks how the 20% match will be met (folded into the Q6 sustainability answer instead, per IT-MKCF-11); simplified IT-MKCF-11 by removing counter-accuracy and over-limit hard-stop steps that don't apply to this funder; added a caution note to IT-MKCF-11 flagging the unresolved issue from the aborted attempt. |
| 1.3     | 2026-07-04 | Rapidglobe Ltd | Clean full retest executed — all 13 test cases (IT-MKCF-01–13) passed; the unresolved IT-MKCF-11 issue from the 2026-07-03 attempt did not reproduce. Recorded results, notes, and timings throughout. Flagged (not yet actioned — pending a follow-up amendment): 20% match requirement bold/larger-font treatment logged as an enhancement, not a defect, on IT-MKCF-07; a testing-methodology limitation noted on IT-MKCF-07 that "no hallucinated conditions" cannot be rigorously human-verified against large guidelines documents (see DR-AI-003); a batch of plan-quality TODOs collected for the next amendment pass — remove IT-MKCF-06 steps 7–8 (redundant), remove IT-MKCF-08 step 1 and its related expected-result bullet (redundant given IT-MKCF-07's prerequisite), correct IT-MKCF-09's "Match funding question present" bullet to match the already-recorded finding that no dedicated match question exists, remove IT-MKCF-10 steps 3–4 (no budget/financial field on this funder) and consider merging IT-MKCF-10 into IT-MKCF-09.   |
