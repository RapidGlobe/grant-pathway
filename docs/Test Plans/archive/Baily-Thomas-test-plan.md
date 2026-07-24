# Baily Thomas Charitable Foundation — General Programme Test Plan

**Version:** 1.2
**Date:** 2026-07-03
**Status:** Ready for execution
**Tester:** WJ
**Test accounts:** grantpathway+idle1@gmail.com (Harry's Rainbow — eligibility mismatch) · grantpathway+bt1@gmail.com (Steps Forward — happy path, new account)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the **Baily Thomas Charitable Foundation General Programme**. Baily Thomas exclusively funds organisations that support **people with learning disabilities** (and autism where it co-occurs with learning disability). The General Programme accepts applications of **£9,000 or more** via the **BenefactorCloud** online portal.

**Risk-based coverage:** This plan tests the General Programme only. If General Programme passes, the **Small Grants** programme (£1,000–£8,999, same portal and funder type, simpler application) is assumed to pass. The General Programme is the more complex and higher-value of the two variants.

**This test plan runs two accounts in sequence:**

1. **Harry's Rainbow (eligibility mismatch)** — Children's bereavement charity based in Milton Keynes. Harry's Rainbow does not support people with learning disabilities. Baily Thomas is focused exclusively on learning disability. This tests FR-47 (eligibility hard stop) for subject-matter mismatch.

2. **Steps Forward Learning Support (happy path)** — Fictional supported living and day activities charity for adults with moderate to severe learning disabilities in Greater Manchester. Tests the full end-to-end flow through to export.

**Guidelines source:** Baily Thomas publishes grant criteria on its website. The BenefactorCloud portal application form may contain questions not included in any downloadable criteria document. As with other portal-based funders, the tester should paste the portal question list alongside the criteria text if a self-contained PDF is not available. Confirm the actual number and text of portal questions during IT-BT-06.

**Learning disability focus:** Baily Thomas does **not** fund autism unless it co-occurs with learning disability. The AI summary must surface this restriction clearly. The test charity profile (Steps Forward) should describe learning disability as the primary condition.

**AI policy:** Check the Baily Thomas website and BenefactorCloud portal for any statement on AI-generated content. Flag as absent rather than fabricated if none found.

---

## Pre-Test Setup

### Guidelines — access before testing

Obtain the Baily Thomas General Programme criteria and portal questions:

- Visit the Baily Thomas Charitable Foundation website and navigate to **General Programme**
- Download the criteria or guidelines PDF if available
- Save as `docs/Grant Org Guidelines/baily-thomas-general-criteria.pdf` (or `.txt`)
- If portal questions are not in the criteria document, access the BenefactorCloud portal (registration may be required for a preview) and copy the question list and any word limits to a text file

### Account 1 — Harry's Rainbow (existing)

- Email: `grantpathway+idle1@gmail.com`
- Verify the profile shows Harry's Rainbow — children's bereavement charity in Milton Keynes. Do not modify.

### Account 2 — Steps Forward Learning Support (new account to create)

Register `grantpathway+bt1@gmail.com` and set up the following charity profile:

| Field                       | Value                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First name                  | Priya                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Last name                   | Sharma                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Charity name                | Steps Forward Learning Support                                                                                                                                                                                                                                                                                                                                                                                                          |
| Registration number         | (leave blank — optional)                                                                                                                                                                                                                                                                                                                                                                                                                |
| What does your charity do?  | Steps Forward Learning Support provides specialist day activities, social skills development, and employment readiness programmes for adults with moderate to severe learning disabilities in Greater Manchester. We operate three specialist day centres in Stockport, Didsbury, and Wythenshawe, supporting 85 adults per year. We do not support autism unless it co-occurs with a learning disability. We are a registered charity. |
| Who does your charity help? | Adults aged 18 and over with moderate to severe learning disabilities, including those with complex needs. Our beneficiaries require specialist support to participate in daily activities, develop communication skills, and progress toward supported employment.                                                                                                                                                                     |
| Where do you work?          | Greater Manchester (Stockport, Didsbury, and Wythenshawe)                                                                                                                                                                                                                                                                                                                                                                               |

**Note:** The profile explicitly states learning disability as the primary focus and correctly excludes standalone autism — this mirrors Baily Thomas's eligibility criteria.

---

## Test Data

### Account 1 — Harry's Rainbow (mismatch test)

| Item                         | Value                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| Test user email              | grantpathway+idle1@gmail.com                                      |
| Charity name                 | Harry's Rainbow                                                   |
| Funder                       | Baily Thomas — General Programme                                  |
| Grant name                   | Bereavement Support Referral Network 2026–27                      |
| Guidelines source            | Baily Thomas General Programme criteria (same file as happy path) |
| Expected eligibility outcome | Mismatch (bereavement charity, not learning disability)           |

### Account 2 — Steps Forward Learning Support (happy path)

| Item                         | Value                                                     |
| ---------------------------- | --------------------------------------------------------- |
| Test user email              | grantpathway+bt1@gmail.com                                |
| Charity name                 | Steps Forward Learning Support                            |
| Funder                       | Baily Thomas — General Programme                          |
| Grant name                   | Day Activities and Employment Readiness Programme 2026–27 |
| Grant amount                 | £12,000 (within General Programme range £9,000+)          |
| Guidelines source            | Baily Thomas General Programme criteria                   |
| Expected eligibility outcome | Pass                                                      |

---

## Known Expected Behaviours

| Ref                      | Description                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IT-BT-02                 | Harry's Rainbow (bereavement charity) is expected to trigger an eligibility mismatch. Baily Thomas exclusively funds learning disability organisations.                                                                                                                                                                                                               |
| Learning disability only | The AI summary must clearly state the learning disability focus. Pure autism-only charities are also excluded — summary should surface this restriction.                                                                                                                                                                                                              |
| BenefactorCloud portal   | Questions appear in the BenefactorCloud portal which may require registration. Paste path with question text likely required alongside criteria. Confirm during IT-BT-06.                                                                                                                                                                                             |
| Non-narrative fields     | Portal applications typically include financial, governance, and data-entry fields. These should not appear as Step 4 writing cards.                                                                                                                                                                                                                                  |
| Small Grants assumption  | This plan tests General Programme only. Small Grants (£1,000–£8,999, same portal, same funder type, simpler application) are assumed to pass under risk-based coverage. Run a brief smoke test (Steps 1–3 only) if any doubt arises.                                                                                                                                  |
| AI policy                | Confirm whether Baily Thomas has a published AI use policy in the criteria or portal. Flag as absent if none found.                                                                                                                                                                                                                                                   |
| Empty-state button       | IT-BT-05 uses a freshly registered account (zero applications). The dashboard shows **Start your first application**, not **+ New Application** — the latter only appears once at least one application already exists. Confirmed in the user guide and live in the app.                                                                                              |
| Test order               | IT-BT-07 (AI summary content accuracy) must run **before** IT-BT-08 (checklist/start writing) — clicking "I have what I need — start writing" in the old IT-BT-07 navigates past Step 3, so the AI summary is no longer available to review afterwards. Same defect found and fixed in the MKCF plan (2026-07-03); reordered here accordingly before first execution. |

---

## Expected Narrative Questions (to be confirmed during IT-BT-06)

The following are indicative based on typical Baily Thomas General Programme applications. Update this table with actual extracted questions and word limits observed during testing.

| #   | Expected question area                                     | Expected limit | Actual limit | Present? |
| --- | ---------------------------------------------------------- | -------------- | ------------ | -------- |
| Q1  | About your organisation and who you support                | TBC            |              |          |
| Q2  | Description of the project to be funded                    | TBC            |              |          |
| Q3  | How the project benefits people with learning disabilities | TBC            |              |          |
| Q4  | Evidence of need for the project                           | TBC            |              |          |
| Q5  | Outcomes and how you will measure them                     | TBC            |              |          |
| Q6  | Experience and track record of the organisation            | TBC            |              |          |
| Q7  | Project management and delivery team                       | TBC            |              |          |
| Q8  | Sustainability beyond the grant period                     | TBC            |              |          |
| Q9  | Any other relevant information                             | TBC            |              |          |

**Note:** Update this table with actual questions and limits observed during IT-BT-06 — BenefactorCloud portal question text may differ from the above.

---

## Test Results Summary

| Test ID  | Test Name                                                                              | BT-specific | AI Summary Time | Result | Notes |
| -------- | -------------------------------------------------------------------------------------- | ----------- | --------------- | ------ | ----- |
| IT-BT-01 | Harry's Rainbow sign in and profile verification                                       | No          | N/A             |        |       |
| IT-BT-02 | Harry's Rainbow — Baily Thomas funder picker and guidelines upload                     | Yes         |                 |        |       |
| IT-BT-03 | Harry's Rainbow — eligibility mismatch confirmed (bereavement vs. learning disability) | Yes         | N/A             |        |       |
| IT-BT-04 | Steps Forward account registration and profile setup                                   | No          | N/A             |        |       |
| IT-BT-05 | Steps Forward — Baily Thomas General Programme funder picker                           | Yes         | N/A             |        |       |
| IT-BT-06 | Steps Forward — guidelines upload/paste and AI summary                                 | Yes         |                 |        |       |
| IT-BT-07 | Steps Forward — AI summary content accuracy and learning disability restriction        | Yes         | N/A             |        |       |
| IT-BT-08 | Steps Forward — eligibility check passes; preparation checklist                        | Yes         | N/A             |        |       |
| IT-BT-09 | Steps Forward — narrative question extraction and word limits                          | Yes         | N/A             |        |       |
| IT-BT-10 | Steps Forward — non-narrative question handling                                        | Yes         | N/A             |        |       |
| IT-BT-11 | Steps Forward — narrative answer writing and AI assist                                 | No          | N/A             |        |       |
| IT-BT-12 | Steps Forward — answer approval and assembly                                           | No          | N/A             |        |       |
| IT-BT-13 | Steps Forward — export; Word document verified; re-export warning                      | No          | N/A             |        |       |

---

## Defect Log

| ID  | Test | Description | Severity | Status |
| --- | ---- | ----------- | -------- | ------ |

---

## Test Cases

---

### IT-BT-01 — Harry's Rainbow Sign In and Profile Verification

**BT-specific:** No
**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Sign in as `grantpathway+idle1@gmail.com`
3. Navigate to **Charity Profile** and verify the profile reads Harry's Rainbow — children's bereavement charity, Milton Keynes
4. Do not modify the profile — it is used as-is for the mismatch test

**Expected result:**

- Sign in succeeds
- Profile shows Harry's Rainbow correctly
- Dashboard accessible

**Result:**

**Notes:**

---

### IT-BT-02 — Harry's Rainbow — Baily Thomas Funder Picker and Guidelines Upload

**BT-specific:** Yes — tests learning disability eligibility mismatch
**Prerequisite:** IT-BT-01 complete; Baily Thomas General Programme criteria file ready

**Steps:**

1. From the dashboard, click **+ New Application**
2. Type **"Baily Thomas"** in the funder picker
3. Confirm **Baily Thomas — General Programme** appears with a **Structured** badge
4. Select it
5. Enter grant name: **"Bereavement Support Referral Network 2026–27"**
6. Click **Continue**
7. On Step 2, upload or paste the Baily Thomas General Programme criteria
8. Click **Continue**
9. On Step 3, start a stopwatch — AI summary auto-generates on page load
10. Stop when summary cards appear — record the time
11. Note whether a red eligibility mismatch warning appears

**Expected result:**

- Baily Thomas — General Programme appears in picker with Structured badge
- Guidelines accepted
- AI summary generates without error

**Result:**

**Notes (record summary time and whether mismatch warning appears):**

---

### IT-BT-03 — Harry's Rainbow — Eligibility Mismatch Confirmed

**BT-specific:** Yes — FR-47 eligibility hard stop for subject-matter restriction
**Prerequisite:** IT-BT-02 complete

**Steps:**

1. If a red mismatch warning appeared on Step 3, verify it cites subject-matter ineligibility (Harry's Rainbow is a bereavement charity, not a learning disability organisation)
2. Click **"I understand — return to my dashboard"**
3. Verify the dashboard shows the application with a red **"Ineligible"** badge and no Continue button

**If no mismatch appeared (unexpected):**

- Record as a defect and note the AI summary content and eligibility criteria shown
- Do not proceed with the Harry's Rainbow account

**Expected result:**

- Red mismatch warning displayed citing learning disability restriction
- Application marked Ineligible on dashboard
- FR-47 hard stop confirmed

**Result:**

**Notes:**

---

### IT-BT-04 — Steps Forward Account Registration and Profile Setup

**BT-specific:** No
**Prerequisite:** IT-BT-03 complete; sign out of Harry's Rainbow account

**Steps:**

1. Sign out of Harry's Rainbow account
2. Register `grantpathway+bt1@gmail.com` (first name Priya, last name Sharma)
3. Verify the email and click the verification link
4. On first login, complete the charity profile using the Steps Forward values in the Pre-Test Setup table above
5. Save the profile and confirm redirect to dashboard

**Expected result:**

- Registration and email verification completes without error
- Charity profile saves successfully
- Dashboard shows profile complete (no incomplete banner)

**Result:**

**Notes:**

---

### IT-BT-05 — Steps Forward — Baily Thomas General Programme Funder Picker

**BT-specific:** Yes
**Prerequisite:** IT-BT-04 complete

**Steps:**

1. From the dashboard, click **Start your first application** — this is a brand-new account with zero applications, so the dashboard shows this empty-state button rather than the **+ New Application** button that appears once at least one application exists (per the user guide)
2. Type **"Baily Thomas"** in the funder picker
3. Confirm **Baily Thomas — General Programme** appears with a **Structured** badge
4. Select it
5. Enter grant name: **"Day Activities and Employment Readiness Programme 2026–27"**
6. Click **Continue**

**Expected result:**

- Baily Thomas — General Programme appears with Structured badge
- Application created and Step 2 displayed

**Result:**

**Notes:**

---

### IT-BT-06 — Steps Forward — Guidelines Upload/Paste and AI Summary

**BT-specific:** Yes — tests guidelines input and AI summary for BenefactorCloud portal funder
**Prerequisite:** IT-BT-05 complete; Baily Thomas General Programme criteria file ready

**Steps:**

1. On Step 2, upload the Baily Thomas criteria PDF (if available) — or paste the criteria text
2. Click **Continue**
3. On Step 3, start a stopwatch — summary auto-generates on page load
4. Stop when summary cards appear — record the time
5. Review all summary cards
6. Check whether application questions and word limits have been extracted
7. **If no questions extracted from PDF alone:** go back to Step 2, switch to paste mode, and include the BenefactorCloud portal question text alongside the criteria. Regenerate and note which input method worked.
8. Note whether a red eligibility mismatch warning appears (not expected for Steps Forward)

**Expected result:**

- Guidelines accepted and AI summary generates within NFR-01 (≤45 seconds)
- Summary reflects learning disability focus, grant range, exclusion of standalone autism, and application priorities
- Steps Forward should pass eligibility

**Result:**

**Notes (record input method used and whether PDF or paste was needed for question extraction):**

---

### IT-BT-07 — Steps Forward — AI Summary Content Accuracy and Learning Disability Restriction

**BT-specific:** Yes
**Prerequisite:** IT-BT-06 complete. Review this **before** continuing past Step 3 (AI Summary) — the summary is no longer easily visible once you proceed to Step 4 and start writing (see IT-BT-08).

**Verify the summary includes:**

- **Learning disability focus** — the sole beneficiary group
- **Autism exclusion** — standalone autism without learning disability is not funded; confirm this restriction is surfaced
- Grant range: £9,000+ (General Programme)
- Application priorities and eligibility criteria extracted accurately
- Any AI policy statement (or absence flagged gracefully)

**Expected result:**

- Summary accurately reflects Baily Thomas General Programme criteria
- Learning disability focus clearly stated
- Autism-only exclusion present and clearly worded
- No hallucinated conditions

**Result:**

**Notes (record whether the autism exclusion was extracted and where it appeared in the summary):**

---

### IT-BT-08 — Steps Forward — Eligibility Check Passes; Preparation Checklist

**BT-specific:** Yes
**Prerequisite:** IT-BT-07 complete (AI summary content reviewed while still on Step 3)

**Steps:**

1. Confirm no mismatch warning appeared — eligibility passed
2. Click **Continue** to Step 4
3. Verify the **"Before you begin writing"** preparation checklist appears correctly
4. Click **"I have what I need — start writing"**

**Expected result:**

- Steps Forward passes eligibility — learning disability charity is the Baily Thomas target beneficiary
- Preparation checklist displays correctly
- Step 4 loads with writing cards

**If mismatch appears (unexpected):**

- Record the mismatch reason as a defect and investigate before proceeding

**Result:**

**Notes:**

---

### IT-BT-09 — Steps Forward — Narrative Question Extraction and Word Limits

**BT-specific:** Yes
**Prerequisite:** IT-BT-08 complete; preparation checklist confirmed

**Steps:**

1. On Step 4, record the total number of question cards displayed
2. For each card, record: question text and displayed word/character limit
3. Update the Expected Narrative Questions table above with actual values observed
4. Verify narrative questions are project-focused (learning disability benefit, outcomes, need, sustainability)

**Expected result:**

- Narrative questions extracted with word/character limits
- Questions are relevant to learning disability provision
- No data-entry or administrative fields appearing as writing cards

**Result:**

**Notes (update Expected Narrative Questions table with actual observed values):**

---

### IT-BT-10 — Steps Forward — Non-Narrative Question Handling

**BT-specific:** Yes
**Prerequisite:** IT-BT-06 complete

**Steps:**

1. Review Step 4 — confirm data-entry, financial, and Yes/No fields from BenefactorCloud are absent as writing cards
2. Confirm administrative questions (company number, turnover, governance, safeguarding policies) are absent
3. Note whether any budget-related question appears with the amber budget card (£ badge, AI assist disabled)
4. Verify the budget card warning message if present

**Expected result:**

- Non-narrative portal fields absent from Step 4
- Any financial/budget question correctly flagged with amber budget card
- Assembly gate not affected by administrative fields

**Result:**

**Notes:**

---

### IT-BT-11 — Steps Forward — Narrative Answer Writing and AI Assist

**BT-specific:** No
**Prerequisite:** IT-BT-09 complete

**Steps:**

1. Navigate to the first narrative question (project description or about your organisation)
2. Write an answer for Steps Forward — day activities and employment readiness for adults with learning disabilities, three centres in Greater Manchester, 85 adults per year
3. Verify the word/character counter is correct
4. Click **Help me improve this** — verify the refined answer:
   - Corrects spelling/grammar
   - Stays within the limit
   - Does not add invented facts
5. Accept or dismiss the refined version and approve the answer
6. **Over-limit hard stop test:** Paste text exceeding the word/character limit on any question — verify approve button disappears and red message appears
7. Trim or use AI assist to bring within limit — verify approve button reappears
8. Approve all remaining mandatory questions

**Expected result:**

- Word/character counters correct throughout
- AI assist produces an improved version within limits without fabrication
- Over-limit hard stop confirmed

**Result:**

**Notes:**

---

### IT-BT-12 — Steps Forward — Answer Approval and Assembly

**BT-specific:** No
**Prerequisite:** IT-BT-11 complete

**Steps:**

1. Approve all mandatory question cards
2. Verify the progress bar reaches "Ready to assemble"
3. Click **Ready to assemble**
4. Verify the **"Before we put it together"** senior review screen appears
5. Click **Yes — assemble my draft**
6. On Step 5, verify:
   - Correct funder (Baily Thomas — General Programme) and grant name displayed
   - All approved answers shown in read-only view

**Expected result:**

- Assembly completes correctly
- Step 5 displays correct funder and grant name

**Result:**

**Notes:**

---

### IT-BT-13 — Steps Forward — Export; Word Document Verified; Re-export Warning

**BT-specific:** No
**Prerequisite:** IT-BT-12 complete

**Steps:**

1. Tick all three review checkboxes on Step 5
2. Click **Download as Word document (.docx)**
3. Open the downloaded .docx file and verify:
   - Title: **"Day Activities and Employment Readiness Programme 2026–27"**
   - Funder: **"Baily Thomas"** (or similar)
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

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                    |
| ------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-17 | Rapidglobe Ltd | Initial test plan — Baily Thomas General Programme. Risk-based: General Programme covers Small Grants variant. Two accounts: Harry's Rainbow (subject-matter mismatch — bereavement) and Steps Forward (learning disability happy path). 13 test cases. Autism exclusion flagged as key extraction check. |
| 1.1     | 2026-07-03 | Rapidglobe Ltd | Fixed IT-BT-05 step 1: Steps Forward is a freshly registered account with zero applications, so the dashboard shows **Start your first application**, not **+ New Application** (per user guide). Added corresponding row to Known Expected Behaviours.                                                   |
| 1.2     | 2026-07-03 | Rapidglobe Ltd | Swapped IT-BT-07/IT-BT-08 order: AI summary content accuracy now runs first (while still on Step 3), checklist/start-writing now runs second — same step-ordering defect found and fixed in the MKCF plan. Updated Test Results Summary, IT-BT-09 prerequisite, and added Known Expected Behaviours row.  |
