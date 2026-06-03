# Wolfson Foundation — Health & Disability Stage 1 Test Plan

**Version:** 1.1
**Date:** 2026-06-03
**Status:** Ready for execution
**Tester:** WJ
**Test account:** grantpathway+wf1@gmail.com (new account — see pre-test setup below)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the **Wolfson Foundation — Health & Disability** programme. Wolfson funds capital infrastructure projects (building refurbishment, equipment purchases) for charities supporting people with disabilities or mental health needs, hospices, and similar organisations. Grant range: £30k–£250k+. Minimum eligible project cost: £50,000.

**Stage 1 guidelines are online-only.** The Wolfson Foundation does not publish a downloadable PDF or Word file for Stage 1 questions — the questions are listed on their website. This test therefore exercises the **paste path** for Step 2 (copy-paste text from website into the text box), rather than the file upload path. This is an important distinct test coverage area.

**This test includes a re-open flow.** After the application is exported (IT-WF-11), the application is re-opened, an answer amended, and the application is re-approved and re-exported (IT-WF-12). This tests the complete re-open → amend → re-approve → re-export cycle.

**Test coverage principle:** This plan covers the complete end-to-end flow — account setup, profile, funder selection, guidelines paste, AI summary, preparation checklist, Q&A writing, export, re-open, amendment, re-approval, and re-export. No step is omitted.

---

## Pre-Test Setup

**New test account required.** Create `grantpathway+wf1@gmail.com` by completing the standard registration flow (equivalent of S0-P-01 from the main test plan). Do not reuse an existing test account for this plan — a fresh charity profile appropriate for Wolfson Health & Disability is required.

**Charity profile to set up on registration:**

| Field | Value |
|-------|-------|
| First name | Sarah |
| Last name | Okafor |
| Charity name | Compass Wellbeing |
| Registration number | 1182734 |
| What does your charity do? | Compass Wellbeing provides therapeutic group sessions, sensory activities, and peer support programmes for adults and young people with mental health challenges and acquired brain injuries across South London. We deliver weekly group sessions and one-to-one support from a dedicated community centre, as well as outreach activities in partnership with local NHS trusts and community hubs. |
| Who does your charity help? | Adults and young people aged 16 and over living with mental health conditions, acquired brain injuries, or neurodevelopmental conditions in South London. Approximately 60% of our beneficiaries are referred via NHS mental health services. |
| Where do you work? | South London (Lambeth, Southwark, and Lewisham) |

> **Why this charity?** Compass Wellbeing is a capital-eligible organisation (leases a community centre, has a stable programme of group delivery) that sits squarely within Wolfson's Health & Disability remit. The project — refurbishment of a therapy and sensory room — is typical of the capital projects Wolfson funds.

**Guidelines preparation:**

Stage 1 questions must be copied from the Wolfson website before beginning the test:

1. Go to https://www.wolfson.org.uk/funding/application-guidance/
2. Navigate to **Health & Disability → Stage 1** (or equivalent section on the page)
3. Copy all Stage 1 question text including field labels, descriptions, and word limits
4. Paste into a plain Word document and save as `wolfson-health-disability-stage1-questions.docx` in `docs/Grant Org Guidelines/`
5. This document will be used as the source text for the Step 2 paste path

**Note:** If the website structure has changed since research was conducted, check that the questions in the "Expected Narrative Questions" section below are still present. Update this plan if word limits have changed.

---

## Test Data

| Item | Value |
|------|-------|
| Test user email | grantpathway+wf1@gmail.com |
| Charity name | Compass Wellbeing |
| Charity registration number | 1182734 |
| Funder | Wolfson Foundation |
| Grant programme | Health & Disability — Sensory Therapy Room Refurbishment 2026 |
| Project description | Full refurbishment of the ground-floor therapy room: acoustic panelling, sensory lighting, specialist flooring, furniture, and equipment suitable for adults with acquired brain injuries and mental health conditions |
| Total project cost | £85,000 |
| Funds raised | £35,000 (Lambeth Council grant + self-funding) |
| Wolfson ask | £50,000 |
| Guidelines input method | **Paste** (no downloadable file — Stage 1 is online-only) |
| Sector | Health & Disability |

---

## Known Expected Behaviours

| Ref | Description |
|-----|-------------|
| Stage 1 only | This test covers Stage 1 only. Wolfson's two-stage process means Stage 1 is a brief screening application. A separate test plan should be prepared for Stage 2 if an invitation is received. |
| Paste path | Step 2 uses the text paste area, not file upload. Verify the paste input accepts the copied question text and passes it to the AI. |
| Sector-specific questions | Wolfson publishes different question sets for each sector. This test uses the Health & Disability set. Questions for Science & Medicine, Heritage, and Secondary Education are different and are not covered here. |
| Non-narrative questions | Timetable, location, ownership/tenure/planning permission, financial figures (cost/raised/shortfall), audited accounts, signed covering letter, and CQC report fields are non-narrative and should be absent from Step 4. |
| Short word limits | The 50-word "previous support" field and 25-word "project title" field are unusually short. The AI may extract these as narrative questions or skip them. Record the outcome. |
| Optional question | "Any other information" (200 words) is explicitly marked optional on the Wolfson website. It may or may not be extracted. Record the outcome. |
| No AI policy | Wolfson Foundation publishes no AI restriction or guidance. No mismatch on that basis is expected. |

---

## Expected Narrative Questions

Narrative questions from the Wolfson Health & Disability Stage 1 question set:

| # | Question (abbreviated) | Word limit |
|---|------------------------|------------|
| 1 | Background to the organisation | 250 words |
| 2 | Project summary (title + description) | 25 words (title) + 400 words (summary) |
| 3 | Previous support from the Wolfson Foundation | 50 words |
| 4 | Any other information you would like us to note (optional) | 200 words |

**Non-narrative questions expected to be absent from Step 4:**

| Question | Type |
|----------|------|
| Organisation name, address, charity number | Data entry |
| Head of organisation and contact person details | Data entry |
| Care Quality Commission / Ofsted inspection report | File upload (if applicable) |
| Indication of timetable for the project | Structured data |
| Location of the project | Structured data |
| Ownership or tenure of land/property; planning permission | Structured data |
| Total cost of the project; funds raised; shortfall | Financial figures |
| Signed, audited accounts (last two years) | File upload |
| Confirmation of support from the head of the organisation | File upload / signed letter |

---

## Test Results Summary

| Test ID | Test Name | Wolfson-specific | AI Summary Time | Result | Notes |
|---------|-----------|-----------------|----------------|--------|-------|
| IT-WF-01 | Account registration and profile setup | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-02 | Wolfson Foundation funder picker | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-03 | Guidelines paste and AI summary | Yes | | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-04 | Eligibility check — observe outcome | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-05 | AI summary content accuracy | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-06 | Narrative question extraction and word limits | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-07 | Non-narrative question handling | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-08 | Narrative answer writing and AI assist | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-09 | Answer approval and Step 5 navigation | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-10 | Word document export — structure and content | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-11 | Re-open approved application, amend answer, re-approve | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WF-12 | Re-export after amendment — verify re-export warning and updated content | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |

---

## Defect Log

| ID | Test | Description | Severity | Status |
|----|------|-------------|----------|--------|

---

## Test Cases

---

### IT-WF-01 — Account Registration and Profile Setup

**Wolfson-specific:** No
**Prerequisite:** None — this is the first step

**Steps:**
1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Create an account** and register as `grantpathway+wf1@gmail.com` with first name Sarah, last name Okafor
3. Verify the email confirmation arrives in the Gmail inbox and click the verification link
4. On first login, complete the charity profile using the values in the Test Data table above — copy the "What does your charity do?", "Who does your charity help?", and "Where do you work?" text exactly as specified
5. Save the profile
6. Confirm you are redirected to the dashboard

**Expected result:**
- Registration and email verification completes without error
- Charity profile saves successfully
- Dashboard shows charity profile complete (no amber incomplete banner)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WF-02 — Wolfson Foundation Funder Picker

**Wolfson-specific:** Yes
**Prerequisite:** IT-WF-01 complete

**Steps:**
1. From the dashboard, click **+ New Application**
2. Type **"Wolfson"** in the funder picker search box
3. Confirm **Wolfson Foundation** appears in the results with a **Structured** badge
4. Select **Wolfson Foundation**
5. Enter grant name: **"Health & Disability — Sensory Therapy Room Refurbishment 2026"**
6. Click **Continue**

**Expected result:**
- Wolfson Foundation appears in the picker with a Structured badge
- Application is created and Step 2 is displayed
- Application appears on dashboard when navigating back (not tested here — proceed to IT-WF-03)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WF-03 — Guidelines Paste and AI Summary

**Wolfson-specific:** Yes — tests the paste input path; Wolfson has no downloadable Stage 1 guidelines file
**Prerequisite:** IT-WF-02 complete; Stage 1 question text copied from wolfson.org.uk as per pre-test setup

**Steps:**
1. On Step 2, click the **paste text** tab (not the file upload area)
2. Paste the full Wolfson Health & Disability Stage 1 question text prepared in pre-test setup
3. Confirm the text area shows the pasted content
4. Click **Continue**
5. On Step 3, start a stopwatch, click **Generate summary**, stop when the summary appears — record the time
6. Review the summary cards displayed
7. Note whether a red eligibility mismatch warning appears — record the outcome for IT-WF-04
8. Click **Continue** → verify the preparation checklist or mismatch state appears

**Expected result:**
- Paste area accepts the text without error
- AI summary generates successfully within 30 seconds (NFR-01)
- Summary displays without a JSON parse error
- Outcome of eligibility check noted (pass or mismatch)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record summary time and eligibility outcome):**

---

### IT-WF-04 — Eligibility Check — Observe Outcome

**Wolfson-specific:** Yes — Compass Wellbeing should be a strong fit for Health & Disability; a mismatch would indicate a prompt issue
**Prerequisite:** IT-WF-03 complete

#### Branch A — No mismatch (Compass Wellbeing passes)

If no red mismatch warning appeared in IT-WF-03:

1. Confirm the preparation checklist screen appeared on clicking Continue
2. Note that Compass Wellbeing passed — mental health and acquired brain injury services are squarely within Wolfson's Health & Disability remit
3. Record as Pass and proceed to IT-WF-05

#### Branch B — Mismatch detected (unexpected)

If a red mismatch warning appeared:

1. Record the mismatch reason displayed
2. Review whether the reason is plausible (e.g. the AI incorrectly identified an exclusion)
3. Log as a defect if the mismatch is clearly wrong given Compass Wellbeing's profile
4. If the mismatch reason reflects a genuine profile gap, update the profile description accordingly and create a new application
5. Report the defect and revised steps in the notes

**Expected result (Branch A):** Compass Wellbeing passes — proceed to IT-WF-05

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which branch and the eligibility reason if mismatch):**

---

### IT-WF-05 — AI Summary Content Accuracy

**Wolfson-specific:** Yes
**Prerequisite:** IT-WF-03 complete

**Verify the summary includes:**
- Funder description: capital infrastructure grants for Health & Disability organisations
- Grant range: £30k–£250k+ (or similar — Wolfson does not publish exact figures; "Not specified" is an acceptable partial result)
- Eligibility: registered charities, organisations supporting disabled people or those with mental health conditions; minimum project cost £50,000
- What is funded: building refurbishment, equipment — capital projects only
- What is excluded: salaries, overheads, maintenance, VAT; purchase of land or existing buildings; projects already completed; endowment funds
- UK-only scope
- Two-stage process noted (Stage 1 screening → Stage 2 by invitation)

**Expected result:**
- Key funding criteria and exclusions accurately represented
- No significant errors or hallucinated eligibility conditions

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WF-06 — Narrative Question Extraction and Word Limits

**Wolfson-specific:** Yes
**Prerequisite:** IT-WF-03 complete; preparation checklist confirmed on Step 4 entry

**Steps:**
1. Complete the preparation checklist on Step 4 and proceed to the Q&A interface
2. Record the total number of question cards displayed
3. For each card, record: question text, displayed word/character limit
4. Verify the following expected questions appear with correct limits:

| Expected question | Expected word limit | Actual word limit | Present? |
|-------------------|--------------------|--------------------|----------|
| Background to the organisation | 250 words | | |
| Project summary | 400 words | | |
| Previous support from the Wolfson Foundation | 50 words | | |
| Any other information (optional) | 200 words | | |

5. Note: the 25-word "project title" field may or may not appear as a card (it is very short and may be treated as a data field). Record the outcome.

**Expected result:**
- 3–4 narrative question cards displayed
- Word limits match the Wolfson Stage 1 specification
- No non-narrative questions present as cards (data fields, file uploads, financial figures absent)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record all questions and limits as observed):**

---

### IT-WF-07 — Non-Narrative Question Handling

**Wolfson-specific:** Yes
**Prerequisite:** IT-WF-03 complete

**Steps:**
1. Review the Step 4 Q&A interface
2. Confirm the following non-narrative fields are absent as question cards:

| Question | Type | Absent? |
|----------|------|---------|
| Organisation name, address, charity number | Data entry | |
| Head of organisation / contact person | Data entry | |
| CQC / Ofsted report | File upload | |
| Timetable for the project | Structured data | |
| Location of the project | Structured data | |
| Ownership / tenure / planning permission | Structured data | |
| Total cost / funds raised / shortfall | Financial figures | |
| Audited accounts (last two years) | File upload | |
| Signed letter from head of organisation | File upload | |

3. Check whether the financial shortfall or funding plan appears as a narrative question — if so, verify it is flagged amber as a budget question with AI assist disabled

**Expected result:**
- All non-narrative fields absent from Step 4
- No financial or file-upload fields appearing as text areas

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WF-08 — Narrative Answer Writing and AI Assist

**Wolfson-specific:** No
**Prerequisite:** IT-WF-06 complete

**Steps:**
1. Navigate to the **Background to the organisation** question (250 words)
2. Write an answer about Compass Wellbeing — include founding date, programme of group therapy sessions, number of beneficiaries, NHS referral partnership, community centre base in South London
3. Verify the counter shows "X / 250 words"
4. Click **Help me improve this** and review the refined answer — verify it:
   - Does not add invented facts
   - Stays within 250 words
   - Improves structure and flow
5. Review the three mandatory confirmation prompts:
   - "Does this accurately describe your charity and project?"
   - "Are all figures, dates, and facts correct?"
   - "Does this answer the question that was asked?"
6. Click **Approve this answer**
7. Navigate to **Project summary** (400 words)
8. Write an answer describing the sensory therapy room refurbishment — scope of works, expected beneficiaries, link to strategic goals
9. Verify counter shows "X / 400 words"
10. Approve without using AI assist (tests user-authored path)
11. Navigate to **Previous support from the Wolfson Foundation** (50 words)
12. Enter: *"Compass Wellbeing has not previously received support from the Wolfson Foundation."* (verify this is within 50 words)
13. Approve

**Expected result:**
- Word counters correct for all three question types (250, 400, 50 words)
- AI assist works on Background question — returns improved text within word limit
- All three approval prompts visible before each approval
- Approved cards show green border and confirmation stamp

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WF-09 — Answer Approval and Step 5 Navigation

**Wolfson-specific:** No
**Prerequisite:** IT-WF-08 complete

**Steps:**
1. Approve any remaining unapproved question cards (skip "Any other information" if it appeared — it is optional and may be left blank to test what happens when an optional question is unanswered)
2. Verify the progress bar reaches "Ready to assemble" once all mandatory questions are approved
3. Click **Ready to assemble**
4. Verify assembly completes and Step 5 is displayed
5. On Step 5, review the read-only Q&A view — verify:
   - All approved answers appear
   - Source badges display correctly (AI-assisted vs. written by user)
   - Word counts shown per answer
6. Tick all three review checkboxes:
   - "I have reviewed all responses in full and am satisfied with their content."
   - "The information provided is accurate and complete to the best of my knowledge."
   - "I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted."
7. Click **Approve my application** and confirm the modal dialog (verify grant name and funder are shown in the dialog)

**Expected result:**
- Assembly completes without error
- All approved answers present in Step 5 read-only view
- All three checkboxes must be ticked before Approve button activates
- Confirmation modal shows correct application details
- Application status changes to Approved

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WF-10 — Word Document Export — Structure and Content

**Wolfson-specific:** No
**Prerequisite:** IT-WF-09 complete

**Steps:**
1. Click **Export as Word document**
2. Open the downloaded .docx file in Microsoft Word
3. Verify:
   - Title: **"Health & Disability — Sensory Therapy Room Refurbishment 2026"**
   - Funder: **"Wolfson Foundation"**
   - Export date is today's date
   - AI disclaimer: "This application was prepared with AI assistance..."
   - Q&A body present — each approved question and answer in correct order
   - Footer present
   - Only approved answers included — no blank sections
4. Note the exact export date and time displayed on the document (for verification in IT-WF-12)

**Expected result:**
- Word document downloads without error
- Document is clean, readable, and correctly structured
- AI disclaimer present and correctly worded
- No unanswered questions included

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record the export date/time shown on the document):**

---

### IT-WF-11 — Re-Open Approved Application, Amend Answer, Re-Approve

**Wolfson-specific:** No
**Prerequisite:** IT-WF-10 complete — application must be in Approved or Exported status

**Purpose:** Verifies the full re-open → edit → re-approve cycle. Simulates the common scenario where a user exports a draft, reviews it in Word, notices something to improve, and needs to amend before submitting to the funder.

**Steps:**
1. On Step 5, click **Re-open application**
2. A confirmation dialog should appear warning that:
   - Approval will be removed
   - The export will remain valid but the application must be re-approved before a fresh export
3. Confirm the dialog — click the Re-open button inside the dialog
4. Verify you are redirected to Step 4 (Q&A interface)
5. Verify the application status shows as in-progress (not approved/exported) — the "Approved" stamp or green border on previously approved cards should reflect that re-opening has cleared approval
6. Navigate to the **Project summary** question card
7. Amend the answer — add one or two sentences strengthening the link between the project and beneficiary outcomes (keep within 400 words)
8. Verify the card's approval is cleared (green border removed, "Approve this answer" button re-appears)
9. Re-read the three mandatory review prompts for this card:
   - "Does this accurately describe your charity and project?"
   - "Are all figures, dates, and facts correct?"
   - "Does this answer the question that was asked?"
10. Click **Approve this answer** — verify green border returns
11. Verify all other previously-approved answers remain approved (editing one question should not clear approval on others)
12. Click **Ready to assemble**
13. Verify assembly completes with the amended answer included
14. On Step 5, tick all three review checkboxes again
15. Click **Approve my application** and confirm the modal

**Expected result:**
- Re-open dialog appears with clear warning about approval being removed
- Re-opening redirects to Step 4 correctly
- Editing one answer clears only that answer's approval — not all answers
- All other answers remain approved and do not require re-approval
- Re-assembly includes the amended answer
- Re-approval completes successfully
- Application status returns to Approved

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WF-12 — Re-Export After Amendment — Verify Re-Export Warning and Updated Content

**Wolfson-specific:** No
**Prerequisite:** IT-WF-11 complete — application must be re-approved

**Purpose:** Verifies the re-export warning dialog, the updated document content, and the export timestamp update.

**Steps:**
1. On Step 5, click **Export as Word document**
2. A re-export warning dialog should appear showing:
   - A message indicating a previous export exists
   - The date and time of the **first export** (recorded during IT-WF-10)
3. Confirm the re-export — click the export/download button inside the dialog
4. Open the newly downloaded .docx file in Microsoft Word
5. Verify:
   - The export date on the document reflects today's date and is later than the IT-WF-10 export time
   - The **Project summary** answer contains the amended text added in IT-WF-11
   - All other answers are unchanged from the IT-WF-10 export
   - AI disclaimer, title, funder, and footer are all still present

**Expected result:**
- Re-export warning dialog appears and correctly displays the prior export date from IT-WF-10
- Re-export proceeds after confirmation
- Updated document includes the amended Project summary
- Export timestamp on the document is later than the first export
- Document structure and all other content correct

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (compare export timestamp against IT-WF-10 export timestamp):**

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-06-03 | Rapidglobe Ltd | Initial test plan — Wolfson Foundation Health & Disability Stage 1, Compass Wellbeing test charity, 12 test cases. Includes paste path (no downloadable guidelines), eligibility check, non-narrative question handling, and re-open → amend → re-approve → re-export cycle (IT-WF-11–12). |
| 1.1 | 2026-06-03 | Rapidglobe Ltd | IT-WF-02 step 3 corrected — grant range is not displayed in the funder picker UI (only name and Structured/Narrative badge are shown). Grant range reference removed from step and expected result. |
