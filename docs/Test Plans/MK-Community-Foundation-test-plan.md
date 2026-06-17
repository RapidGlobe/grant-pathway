# MK Community Foundation — Oak Grants Test Plan

**Version:** 1.0
**Date:** 2026-06-17
**Status:** Ready for execution
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

| Ref                     | Description                                                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IT-MKCF-02              | Elmbridge Families Together (Surrey) is expected to trigger a geographic mismatch. MKCF exclusively funds organisations benefiting Milton Keynes residents.                                         |
| 20% match requirement   | Oak Grants require 20% match funding from the applicant. The AI summary should extract this and it should appear in the summary cards. Note how it is surfaced (eligibility card or summary note).  |
| Portal questions        | The 10 Oak Grants questions are in an online portal — a criteria document or guidance page may not contain them verbatim. Paste path likely required. Confirm actual question count during testing. |
| Non-narrative questions | Portal applications typically include data-entry fields (organisation finances, governance). These should not appear as Step 4 writing cards.                                                       |
| AI policy               | Confirm whether MKCF has a published AI use policy. Flag as absent rather than fabricated if none found.                                                                                            |
| Seed/Sapling assumption | This plan tests Oak only. Seed (5 questions) and Sapling (6 questions) are assumed to pass under risk-based coverage. Run a brief smoke test (Steps 1–3 only) if any doubt arises.                  |

---

## Expected Narrative Questions (to be confirmed during IT-MKCF-06)

The following are indicative based on typical MKCF Oak Grants applications. Update this table with actual extracted questions and word limits observed during testing.

| #   | Expected question area                                       | Expected limit | Actual limit | Present? |
| --- | ------------------------------------------------------------ | -------------- | ------------ | -------- |
| Q1  | About your organisation / what you do                        | TBC            |              |          |
| Q2  | Who you help / beneficiaries                                 | TBC            |              |          |
| Q3  | Project description and activities                           | TBC            |              |          |
| Q4  | Need / evidence of need in Milton Keynes                     | TBC            |              |          |
| Q5  | Outcomes and difference the project will make                | TBC            |              |          |
| Q6  | How you will measure outcomes                                | TBC            |              |          |
| Q7  | Match funding — how 20% will be met                          | TBC            |              |          |
| Q8  | Project sustainability beyond the grant period               | TBC            |              |          |
| Q9  | Project management and delivery capability                   | TBC            |              |          |
| Q10 | Any other information / anything else the funder should know | TBC            |              |          |

**Note:** Update this table with actual questions extracted in IT-MKCF-06 — portal question text may differ from the above.

---

## Test Results Summary

| Test ID    | Test Name                                                               | MKCF-specific | AI Summary Time | Result | Notes |
| ---------- | ----------------------------------------------------------------------- | ------------- | --------------- | ------ | ----- |
| IT-MKCF-01 | Elmbridge Families Together sign in and profile verification            | No            | N/A             |        |       |
| IT-MKCF-02 | Elmbridge Families Together — MKCF funder picker and guidelines upload  | Yes           |                 |        |       |
| IT-MKCF-03 | Elmbridge Families Together — geographic eligibility mismatch confirmed | Yes           | N/A             |        |       |
| IT-MKCF-04 | MK Minds Matter account registration and profile setup                  | No            | N/A             |        |       |
| IT-MKCF-05 | MK Minds Matter — MKCF Oak Grants funder picker                         | Yes           | N/A             |        |       |
| IT-MKCF-06 | MK Minds Matter — guidelines upload/paste and AI summary                | Yes           |                 |        |       |
| IT-MKCF-07 | MK Minds Matter — eligibility check passes; preparation checklist       | Yes           | N/A             |        |       |
| IT-MKCF-08 | MK Minds Matter — AI summary content accuracy and 20% match requirement | Yes           | N/A             |        |       |
| IT-MKCF-09 | MK Minds Matter — narrative question extraction and word limits         | Yes           | N/A             |        |       |
| IT-MKCF-10 | MK Minds Matter — non-narrative question handling                       | Yes           | N/A             |        |       |
| IT-MKCF-11 | MK Minds Matter — narrative answer writing and AI assist                | No            | N/A             |        |       |
| IT-MKCF-12 | MK Minds Matter — answer approval and assembly                          | No            | N/A             |        |       |
| IT-MKCF-13 | MK Minds Matter — export; Word document verified; re-export warning     | No            | N/A             |        |       |

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

**Result:**

**Notes:**

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

**Result:**

**Notes (record summary time and whether mismatch warning appears):**

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

**Result:**

**Notes:**

---

### IT-MKCF-04 — MK Minds Matter Account Registration and Profile Setup

**MKCF-specific:** No
**Prerequisite:** IT-MKCF-03 complete; sign out of walton1 account

**Steps:**

1. Sign out of Elmbridge Families Together account
2. Register `grantpathway+mkcf1@gmail.com` (first name James, last name Nkosi)
3. Verify the email and click the verification link
4. On first login, complete the charity profile using the MK Minds Matter values in the Pre-Test Setup table above
5. Save the profile and confirm redirect to dashboard

**Expected result:**

- Registration and email verification completes without error
- Charity profile saves successfully
- Dashboard shows profile complete (no incomplete banner)

**Result:**

**Notes:**

---

### IT-MKCF-05 — MK Minds Matter — MKCF Oak Grants Funder Picker

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-04 complete

**Steps:**

1. From the dashboard, click **+ New Application**
2. Type **"MK Community"** in the funder picker
3. Confirm **MK Community Foundation — Oak Grants** appears with a **Structured** badge
4. Select it
5. Enter grant name: **"Community Mental Health Drop-In Programme 2026–27"**
6. Click **Continue**

**Expected result:**

- MK Community Foundation — Oak Grants appears with Structured badge
- Application created and Step 2 displayed

**Result:**

**Notes:**

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
6. Check whether application questions and word limits have been extracted
7. **If no questions extracted from PDF alone:** go back to Step 2, switch to paste mode, and include the portal question text alongside the criteria. Regenerate and note which input method worked.
8. Note whether a red eligibility mismatch warning appears (not expected for MK Minds Matter)

**Expected result:**

- Guidelines accepted and AI summary generates within NFR-01 (≤45 seconds)
- Summary reflects Milton Keynes focus, grant range, 20% match requirement, and application priorities
- MK Minds Matter should pass eligibility

**Result:**

**Notes (record input method used and whether PDF or paste was needed for question extraction):**

---

### IT-MKCF-07 — MK Minds Matter — Eligibility Check Passes; Preparation Checklist

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-06 complete

**Steps:**

1. Confirm no mismatch warning appeared — eligibility passed
2. Click **Continue** to Step 4
3. Verify the **"Before you begin writing"** preparation checklist appears correctly
4. Click **"I have what I need — start writing"**

**Expected result:**

- MK Minds Matter passes eligibility — Milton Keynes-based mental health charity is a clear geographic fit
- Preparation checklist displays correctly
- Step 4 loads with writing cards

**If mismatch appears (unexpected):**

- Record the mismatch reason as a defect and investigate before proceeding

**Result:**

**Notes:**

---

### IT-MKCF-08 — MK Minds Matter — AI Summary Content Accuracy and 20% Match Requirement

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-06 complete

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

**Result:**

**Notes (record whether 20% match requirement was extracted and where it appeared in the summary):**

---

### IT-MKCF-09 — MK Minds Matter — Narrative Question Extraction and Word Limits

**MKCF-specific:** Yes
**Prerequisite:** IT-MKCF-06 complete; preparation checklist confirmed

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

**Result:**

**Notes (update Expected Narrative Questions table with actual observed values):**

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

**Result:**

**Notes:**

---

### IT-MKCF-11 — MK Minds Matter — Narrative Answer Writing and AI Assist

**MKCF-specific:** No
**Prerequisite:** IT-MKCF-09 complete

**Steps:**

1. Navigate to the first narrative question (project description or organisation overview)
2. Write an answer for MK Minds Matter — mental health drop-in sessions in Milton Keynes, three community centres, 300 clients per year
3. Verify the word/character counter is correct
4. Click **Help me improve this** — verify the refined answer:
   - Corrects spelling/grammar
   - Stays within the limit
   - Does not add invented facts
5. Accept or dismiss the refined version and approve the answer
6. Navigate to the match funding question (if present)
7. Write an answer referencing the 20% match via volunteer counsellor hours — note whether AI assist is disabled on this question (budget/match questions may carry the £ badge)
8. **Over-limit hard stop test:** Paste text exceeding the word/character limit on any question — verify approve button disappears and red message appears
9. Trim or use AI assist to bring within limit — verify approve button reappears
10. Approve all remaining mandatory questions

**Expected result:**

- Word/character counters correct throughout
- AI assist works on narrative questions
- Match funding question handled correctly (AI assist disabled if flagged as budget)
- Over-limit hard stop confirmed

**Result:**

**Notes:**

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

**Result:**

**Notes:**

---

### IT-MKCF-13 — MK Minds Matter — Export; Word Document Verified; Re-export Warning

**MKCF-specific:** No
**Prerequisite:** IT-MKCF-12 complete

**Steps:**

1. Tick all three review checkboxes on Step 5
2. Click **Download as Word document (.docx)**
3. Open the downloaded .docx file and verify:
   - Title: **"Community Mental Health Drop-In Programme 2026–27"**
   - Funder: **"MK Community Foundation"** (or similar)
   - Export date includes time (e.g. **"17 June 2026, 10:30"**)
   - AI disclaimer present and correctly worded
   - All approved answers present
4. Click **Download as Word document (.docx)** again
5. Verify the re-export warning dialog appears with the prior export timestamp
6. Cancel — do not re-export
7. Click **Download as plain text (.txt)** and verify a .txt file is downloaded

**Expected result:**

- Word export opens correctly in Microsoft Word
- Export date includes HH:MM timestamp
- Re-export warning shows full timestamp
- Plain text download works

**Result:**

**Notes:**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                    |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-17 | Rapidglobe Ltd | Initial test plan — MK Community Foundation Oak Grants. Risk-based: Oak covers Seed and Sapling variants. Two accounts: Elmbridge Families Together (geographic mismatch) and MK Minds Matter (happy path). 13 test cases. 20% match funding requirement flagged as key extraction check. |
