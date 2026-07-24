# Idlewild Trust Test Plan

**Version:** 1.0
**Date:** 2026-06-01
**Status:** Ready for execution
**Tester:** WJ
**Test account:** grantpathway+idle1@gmail.com

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using Idlewild Trust as the target funder. Both the **Arts** (Nurturing Early-Stage Professionals) and **Conservation** (Cultural Heritage) programmes are tested — each as a separate application under the same user account.

Idlewild Trust is classified as a **Structured** funder. Their question sets use **character limits** (not word limits), and include a significant number of non-narrative question types (Yes/No, dropdown, date, number, budget tables, file uploads). These make Idlewild the primary test case for GAP-27 (character limit handling) and GAP-28 (non-narrative question classification).

**Test coverage principle:** Every test plan covers the complete end-to-end flow for each application — registration, profile, funder selection, guidelines upload, AI summary, preparation checklist, Q&A writing, and export — regardless of whether individual steps are considered "already tested." No step is assumed to work without verification in the context of this specific funder.

---

## Test Data

| Item                           | Value                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| Test user email                | grantpathway+idle1@gmail.com                                                        |
| Test user password             | (set by tester at registration)                                                     |
| Charity name                   | Harry's Rainbow                                                                     |
| Charity registration number    | 1194917                                                                             |
| Charity type                   | UK Registered Charity                                                               |
| Charity focus                  | Children's bereavement support, Milton Keynes                                       |
| Funder                         | Idlewild Trust                                                                      |
| Programme 1                    | Arts — Nurturing Early-Stage Professionals                                          |
| Programme 2                    | Conservation — Cultural Heritage Collections                                        |
| Grant amount (Arts)            | Up to £7,000                                                                        |
| Application window             | Round 1 2026 — opens 8 June 2026, deadline 5 September 2026                         |
| Guidelines file (Arts)         | `docs/Grant Org Guidelines/idlewild-arts-application-questions-dec2025.pdf`         |
| Guidelines file (Conservation) | `docs/Grant Org Guidelines/idlewild-conservation-application-questions-dec2025.pdf` |
| Guidelines input method        | File upload (PDF)                                                                   |

---

## Known Expected Behaviours

The following behaviours are known limitations at the time of this test. They are **not** failures — log them as observations only.

| Ref    | Description                                                                                                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GAP-27 | Character limits may be extracted as word limits or missed entirely. Observe and record what the AI extracts.                                                                                                                  |
| GAP-28 | Non-narrative questions (Yes/No A/B/C, dropdown Q7/Q16, dates Q17/Q18, number Q24, budget tables Q25–Q27, file uploads Q31–Q33) may appear as text areas rather than being excluded or shown as reminders. Observe and record. |

---

## Test Results Summary

Complete after running all tests.

| Test ID | Test Name                                                | Programme    | Idlewild-Specific | AI Summary Time | Result     | Notes                                                                                                                                                                                              |
| ------- | -------------------------------------------------------- | ------------ | ----------------- | --------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IT-01   | Account registration and charity profile                 | Both         | No                | N/A             | ✅ Pass    |                                                                                                                                                                                                    |
| IT-02   | Idlewild Trust funder picker                             | Both         | Yes               | N/A             | ✅ Pass    |                                                                                                                                                                                                    |
| IT-03   | Arts guidelines PDF upload and AI summary                | Arts         | Yes               | Not recorded    | ✅ Pass    | 9 questions extracted; red mismatch warning shown; no Continue button                                                                                                                              |
| IT-04   | AI eligibility mismatch hard stop                        | Arts         | Yes               | N/A             | ✅ Pass    | Red warning, acknowledge button, redirected to dashboard; red Ineligible badge shown                                                                                                               |
| IT-05   | Character limit extraction and display                   | Arts         | Yes               | N/A             | ⛔ Blocked | Blocked by mismatch (IT-11 must pass first to get arts-aligned profile)                                                                                                                            |
| IT-06   | Non-narrative question handling                          | Arts         | Yes               | N/A             | ⛔ Blocked | Blocked by mismatch (IT-11 must pass first)                                                                                                                                                        |
| IT-07   | Narrative answer writing and character counter           | Arts         | Yes               | N/A             | ⛔ Blocked | Blocked by mismatch (IT-11 must pass first)                                                                                                                                                        |
| IT-08   | Conservation guidelines PDF upload and AI summary        | Conservation | Yes               | Not recorded    | ✅ Pass    | Eligibility mismatch correctly detected and displayed — Harry's Rainbow has no conservation remit                                                                                                  |
| IT-09   | Conservation knowledge-sharing requirement identified    | Conservation | Yes               | N/A             | N/A        | Redundant — mismatch detected before summary content is accessible; Harry's Rainbow cannot qualify for this programme                                                                              |
| IT-10   | Word document export — structure and content             | Arts         | No                | N/A             | N/A        | Redundant — Harry's Rainbow is ineligible for both Idlewild programmes; export cannot be reached                                                                                                   |
| IT-11   | Profile correction and reapplication — mismatch resolved | Arts         | Yes               | N/A             | ⏭ Deferred | Harry's Rainbow cannot be made eligible for Idlewild Arts regardless of profile wording. Escape hatch to be tested with a funder Harry's Rainbow genuinely qualifies for in a future test session. |

---

## Defect Log

Log any failures not listed in Known Expected Behaviours above.

| ID      | Test                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Severity | Status |
| ------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| D-IT-01 | IT-05, IT-06, IT-07, IT-10 | AI failed to extract structured questions from the Idlewild Arts PDF question set. The document is published as a multi-column table (question number, question text, type, help text, mandatory, character limits) rather than a simple narrative list. The AI returned an empty questions array, causing the app to fall back to the Tier 3 free-form interface ("No specific questions were found"). The 9 narrative questions (Q9, Q19–Q23, Q28–Q30) with their character limits (800 or 1,600 chars) were not extracted. Root cause: the AI extraction prompt is not designed to parse table-formatted question set documents. This is an extension of GAP-28. IT-05, IT-06, IT-07 and IT-10 are blocked until fixed. | High     | Open   |

---

## Test Cases

---

### IT-01 — Account Registration and Charity Profile

**Programme:** Both (setup — run once)
**Idlewild-specific:** No
**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Register**
3. Enter first name, last name, email `grantpathway+idle1@gmail.com`, password (12+ characters, must include letters and digits), accept Terms and Privacy Policy
4. Click **Create account**
5. Open the verification email and click the verification link
6. Click **Go to my dashboard**
7. Click **Charity Profile** in the navigation
8. Enter charity registration number **1194917** and trigger the Charity Commission lookup
9. Confirm or complete the pre-filled fields:
   - Charity name: Harry's Rainbow
   - What does your charity do: children's bereavement support, activities, and therapeutic groups for children 0–25 bereaved of a parent or sibling, Milton Keynes and surrounding areas
   - Who do you help: children, young people and young adults aged 0–25 bereaved of a parent or sibling
   - Where do you work: Milton Keynes and surrounding areas
10. Complete any remaining required fields and click **Save**

**Expected result:**

- Account created and email verified without errors
- Charity Commission lookup returns Harry's Rainbow details and pre-fills name and registration number
- Profile saves successfully
- Dashboard shows profile complete — Start button enabled

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-02 — Idlewild Trust Funder Picker

**Programme:** Both (run for each application)
**Idlewild-specific:** Yes — verifies Idlewild Trust appears in the approved funder directory
**Prerequisite:** IT-01 complete

**Steps:**

1. From the dashboard, click **+ New Application**
2. On Step 1 (Application Details), click into the funder picker field
3. Type **"Idlewild"**
4. Observe the filtered dropdown list
5. Confirm **Idlewild Trust** appears with a **Structured** badge
6. Select **Idlewild Trust**
7. Enter grant name: **"Arts Grant 2026 — Early-Stage Professionals"**
8. Click **Continue**
9. Repeat steps 1–8 for the Conservation application with grant name: **"Conservation Grant 2026 — Cultural Heritage"**

**Expected result:**

- "Idlewild" search returns Idlewild Trust in the dropdown
- **Structured** badge is displayed alongside the name
- Selecting Idlewild Trust populates the funder field correctly
- Both applications are created and appear on the dashboard
- "My funder isn't listed" link is visible below the picker

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-03 — Arts Guidelines PDF Upload and AI Summary

**Programme:** Arts
**Idlewild-specific:** Yes — Idlewild publish their question set as a structured PDF; tests the file upload path with a real Idlewild document
**Prerequisite:** IT-02 complete (Arts application created)

**Steps:**

1. Open the Arts application from the dashboard
2. On Step 2 (Funder Guidelines), select **Upload a file**
3. Upload `idlewild-arts-application-questions-dec2025.pdf`
4. Confirm the file is accepted (name displayed, no error)
5. Click **Continue**
6. On Step 3, start a stopwatch then click **Generate summary**
7. Observe the loading indicator and staged progress messages ("Reading your funder guidelines…" → "Almost there…")
8. Stop the stopwatch when the summary appears — record the time in the results table
9. Review the generated AI summary
10. Click **Continue** to proceed to Step 4
11. Confirm the **"Before you begin writing"** preparation checklist screen appears, listing financial preparation items and the senior colleague advisory note
12. Click **"I have what I need — start writing"** to enter the Q&A interface

**Expected result:**

- PDF uploads successfully (no format or size error)
- AI summary generates without error within 30 seconds
- Summary cards display correctly (About this grant, Grant amount, Who can apply, What the funder is looking for, Application questions, Key requirements)
- 9 narrative questions extracted and displayed
- A **red eligibility mismatch warning card** is displayed prominently above or instead of the Continue button (FR-47) — Harry's Rainbow is a bereavement charity; Idlewild Arts funds arts sector organisations only
- The Continue button to Step 4 is **not visible** — replaced by an acknowledge button
- The preparation checklist screen does **not** appear for this charity/funder combination

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-04 — AI Eligibility Mismatch Hard Stop

**Programme:** Arts
**Idlewild-specific:** Yes — Idlewild Arts funds arts sector organisations supporting early-stage arts professionals. Harry's Rainbow is a children's bereavement charity with no arts remit. This test verifies the FR-47 hard stop behaviour.
**Prerequisite:** IT-03 complete (mismatch warning visible on Step 3)

**Steps:**

1. On the Step 3 summary screen (from IT-03), locate the red eligibility mismatch warning card
2. Verify the warning card:
   - Is displayed in red (not amber)
   - Contains a plain-English explanation of why Harry's Rainbow may not be eligible for this grant
   - Has an acknowledge button (e.g. "I understand, return to my dashboard")
3. Verify the **Continue button is not visible** — there is no path to Step 4
4. Click the acknowledge button
5. Confirm the app returns to the dashboard
6. On the dashboard, locate the Arts application
7. Verify the application shows a red **"Ineligible"** status badge (not "In progress")

**Expected result:**

- Red mismatch warning card is displayed prominently on Step 3
- Warning text references the arts sector eligibility requirement and/or the bereavement charity mismatch
- Continue button is absent — replaced by acknowledge button only
- Clicking acknowledge returns to dashboard
- Application status on dashboard is "Ineligible" (red badge)
- No path to Step 4 exists from the dashboard for this application

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-05 — Character Limit Extraction and Display

**Programme:** Arts
**Idlewild-specific:** Yes — ALL Idlewild narrative questions use **character limits**, not word limits. This is the primary test for GAP-27.
**Prerequisite:** IT-03 complete

**Expected character limits from Idlewild Arts question set:**

| Question | Description                                                | Character limit  |
| -------- | ---------------------------------------------------------- | ---------------- |
| Q9       | Organisation aims, objectives, activities and achievements | 1,600 characters |
| Q19      | How emerging professionals are selected                    | 800 characters   |
| Q20      | What is the need for the project?                          | 800 characters   |
| Q21      | Age, stage and experience of emerging professionals        | 800 characters   |
| Q22      | Experience and qualifications of project leaders/tutors    | 800 characters   |
| Q23      | Describe the project or programme                          | 1,600 characters |
| Q28      | How will the project be managed?                           | 800 characters   |
| Q29      | How will you measure success?                              | 800 characters   |
| Q30      | What difference will the project make?                     | 800 characters   |

**Steps:**

1. On Step 4 (Draft Answers), review the extracted narrative questions
2. For each narrative question displayed, record:
   - The limit type shown (words or characters)
   - The limit value shown
   - Whether the counter format reads **"X / 800 characters"** or **"X / 800 words"**
3. Type a short answer into Q23 (Describe the project) and observe the counter updating

**Expected result:**

- Counter reads **"X / 800 characters"** (not "X / 800 words") for 800-character questions
- Counter reads **"X / 1600 characters"** for Q9 and Q23
- Counter increments correctly as characters are typed
- _(GAP-27 observation: if limits are shown as words rather than characters, record the values seen)_

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record actual values seen):**

---

### IT-06 — Non-Narrative Question Handling

**Programme:** Arts
**Idlewild-specific:** Yes — Idlewild's question set contains a high proportion of non-narrative question types. This is the primary test for GAP-28.
**Prerequisite:** IT-03 complete

**Non-narrative questions in Idlewild Arts:**

| Ref     | Question                              | Type         |
| ------- | ------------------------------------- | ------------ |
| A, B, C | Privacy and consent                   | Yes/No       |
| Q7      | Organisation status                   | Dropdown     |
| Q16     | Region where project takes place      | Dropdown     |
| Q17     | Expected project start date           | Date         |
| Q18     | Expected project end date             | Date         |
| Q24     | Total funding requested from Idlewild | Number (£)   |
| Q25     | Breakdown of total project costs      | Budget table |
| Q26     | Grants and income raised to date      | Budget table |
| Q27     | Pending grants and projected income   | Budget table |
| Q31     | Most recent signed annual accounts    | File upload  |
| Q32     | Latest management accounts            | File upload  |
| Q33     | Organisation's Safeguarding Policy    | File upload  |

**Steps:**

1. On Step 4 (Draft Answers), review all questions displayed
2. For each non-narrative question type listed above, record how Grant Pathway displays it:
   - Shown as a text area (GAP-28 current behaviour — expected observation)
   - Shown as a read-only reminder / aide-memoire
   - Excluded from the interface entirely
3. Confirm budget questions (Q24–Q27) are visually flagged in amber with AI assist disabled

**Expected result:**

- Budget questions (Q24–Q27) are flagged amber with AI assist disabled
- _(GAP-28 observation: non-narrative questions may appear as text areas — record which types and how many)_
- No crash or error when navigating through all questions

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record actual display for each non-narrative type):**

---

### IT-07 — Narrative Answer Writing and Character Counter

**Programme:** Arts
**Idlewild-specific:** Yes — tests the writing interface against Idlewild's specific 800-character narrative format
**Prerequisite:** IT-05 complete

**Steps:**

1. On Step 4, navigate to **Q23 — Describe the project or programme** (1,600 character limit)
2. Write a short answer of approximately 200 characters describing a fictional arts project for Harry's Rainbow
3. Observe the character counter updating in real time
4. Click **Help me improve this** (AI assist)
5. Observe the AI-refined answer returned
6. Review against the three mandatory prompts:
   - Does this accurately describe your charity and project?
   - Are all figures, dates, and facts correct?
   - Does this answer the question that was asked?
7. Click **Approve**
8. Repeat for **Q20 — What is the need for the project?** (800 character limit)
9. Write an answer that deliberately exceeds 800 characters and observe the counter behaviour

**Expected result:**

- Character counter updates in real time as text is typed
- Counter displays **"X / 1600 characters"** for Q23
- AI assist returns a refined answer without adding facts
- Mandatory review prompts are displayed before approval
- Approved answers are visually marked
- Counter highlights or warns when answer exceeds the character limit
- No data loss when navigating between questions

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-08 — Conservation Guidelines PDF Upload and AI Summary

**Programme:** Conservation
**Idlewild-specific:** Yes — tests the second Idlewild programme with a different focus (cultural heritage conservation)
**Prerequisite:** IT-02 complete (Conservation application created)

**Steps:**

1. Open the Conservation application from the dashboard
2. On Step 2 (Funder Guidelines), upload `idlewild-conservation-application-questions-dec2025.pdf`
3. Confirm the file is accepted
4. Click **Continue**
5. On Step 3, start a stopwatch then click **Generate summary** — record the time in the results table
6. Observe the loading indicator and staged progress messages
7. Review the generated AI summary
8. Click **Continue** to proceed to Step 4
9. Confirm the **"Before you begin writing"** preparation checklist screen appears
10. Click **"I have what I need — start writing"** to enter the Q&A interface

**Expected result:**

- PDF uploads successfully
- AI summary generates without error
- A **red eligibility mismatch warning** is displayed — Harry's Rainbow has no conservation remit and does not qualify for this programme
- The Continue button is absent; acknowledge button present
- Clicking acknowledge returns to dashboard with red Ineligible badge

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Expected result updated 2026-06-02 — mismatch is the correct outcome for Harry's Rainbow with this funder. IT-09, IT-10, and IT-11 are redundant for this test account as Harry's Rainbow cannot qualify for either Idlewild programme.

---

### IT-09 — Conservation Knowledge-Sharing Requirement Identified

**Programme:** Conservation
**Idlewild-specific:** Yes — Idlewild Conservation uniquely requires a **knowledge-sharing** outcome (webinar, lecture, or published article) as part of every funded project. This is not a requirement in the Arts programme and is a meaningful differentiator to test.
**Prerequisite:** IT-08 complete

**Steps:**

1. Review the AI summary generated in IT-08
2. Check whether the summary explicitly mentions the knowledge-sharing requirement:
   - _"Priority will be given to applications that include a knowledge-sharing element as an outcome of the project"_
   - Examples: webinar, lecture, published article, public engagement activity
3. Check whether the summary mentions the requirement for an independent Conservation Report from an accredited conservator (Icon-accredited) before applying
4. Check whether the exclusion of **places of worship** is noted

**Expected result:**

- Knowledge-sharing requirement is explicitly mentioned in the AI summary
- Conservation Report requirement is mentioned (must be completed before applying)
- Places of worship exclusion is noted
- All three items above constitute a pass — these are specific to Conservation and absent from the Arts programme

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-10 — Word Document Export — Structure and Content

**Programme:** Arts
**Idlewild-specific:** No — tests the standard export functionality
**Prerequisite:** IT-07 complete (at least one answer approved)

**Steps:**

1. From Step 4, ensure at least Q23 and Q20 are approved
2. Navigate to Step 5 (Approve & Export)
3. Click **Export as Word document**
4. Open the downloaded .docx file
5. Review the document structure and content

**Expected result:**
The exported Word document contains, in order:

- Document title and grant name: **"Arts Grant 2026 — Early-Stage Professionals"**
- Funder name: **"Idlewild Trust"**
- Export date
- AI disclaimer statement
- Q&A body — each approved question followed by its approved answer
- Footer: _"Prepared using Grant Pathway v[version] — grantpathway.org.uk"_

Additional checks:

- Only approved answers are included
- Character limits are not shown in the exported document (these are internal to the app)
- Document is clean and readable — no formatting artefacts

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-11 — Profile Correction and Reapplication — Mismatch Resolved (Deferred)

**Programme:** Arts
**Idlewild-specific:** Yes — tests the escape hatch introduced in FR-47: correcting the charity profile to accurately reflect an arts remit removes the mismatch flag and allows the application to proceed
**Prerequisite:** IT-04 complete (application in mismatch state on dashboard)

**Test data — updated charity profile:**

| Field                     | Updated value                                                                                                                                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What does your charity do | Harry's Rainbow provides children's bereavement support and arts-based therapeutic programmes for children aged 0–25 who have been bereaved of a parent or sibling, including music, visual arts, and creative writing workshops in Milton Keynes and surrounding areas |

**Steps:**

1. From the dashboard, click **Charity Profile** in the navigation
2. Edit the **"What does your charity do?"** field to include an arts-based therapeutic programme description (use the updated value above)
3. Click **Save changes**
4. Confirm the profile saves successfully
5. From the dashboard, click **+ New Application**
6. Select **Idlewild Trust** from the funder picker
7. Enter grant name: **"Arts Grant 2026 — Early-Stage Professionals (Reapplication)"**
8. Click **Continue**
9. On Step 2, upload `idlewild-arts-application-questions-dec2025.pdf`
10. Click **Continue**
11. On Step 3, click **Generate summary** and wait for the summary to appear
12. Observe whether a red eligibility mismatch warning card appears

**Expected result:**

- Charity profile saves successfully with the updated arts-focus description
- New Arts application is created
- AI summary generates without error
- **No red eligibility mismatch warning card appears** — the updated profile's arts focus satisfies the funder's eligibility criteria
- The **Continue button is visible** (not replaced by an acknowledge button)
- Clicking Continue shows the **"Before you begin writing"** preparation checklist screen
- This application can proceed to Step 4 (Q&A interface)

**Result:** ⏭ Deferred

**Notes:** IT-11 scope revised 2026-06-02. Harry's Rainbow's therapeutic and community-focused model cannot be made eligible for Idlewild Arts regardless of profile wording — the AI correctly identifies that arts-based therapeutic programmes for bereaved children do not meet Idlewild's requirement for professional arts development with high-level emerging talent. This is a stronger-than-expected FR-47 result. The escape hatch (profile correction → reapplication) will be tested in a future session using a funder that Harry's Rainbow genuinely qualifies for. Restore Harry's Rainbow's charity profile to its original description before continuing with IT-08.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-01 | Rapidglobe Ltd | Initial test plan — Idlewild Trust Arts and Conservation programmes, Harry's Rainbow test charity, 10 test cases including GAP-27 and GAP-28 observations                                                                                                                                                                                                                                                           |
| 1.1     | 2026-06-02 | Rapidglobe Ltd | IT-03 expected result updated: mismatch warning expected, prep checklist not expected for Harry's Rainbow. IT-04 rewritten: tests FR-47 hard stop (red warning, acknowledge, dashboard redirect, mismatch status badge). IT-11 added: profile correction and reapplication escape hatch. Results summary updated to reflect re-run status. IT-05–IT-07, IT-10 blocked by mismatch (not D-IT-01) until IT-11 passes. |
| 1.2     | 2026-06-02 | Rapidglobe Ltd | IT-03 ✅, IT-04 ✅ recorded. IT-11 deferred — Harry's Rainbow cannot be made eligible for Idlewild Arts regardless of profile wording; AI correctly rejects arts-therapeutic profile. Escape hatch to be tested with a qualifying funder in a future session. IT-05–IT-07, IT-10 remain blocked pending IT-11.                                                                                                      |
| 1.3     | 2026-06-02 | Rapidglobe Ltd | IT-08 ✅ recorded — mismatch correctly detected for Conservation programme. IT-08 expected result updated to reflect mismatch as the correct outcome. IT-09, IT-10 marked N/A (redundant — Harry's Rainbow ineligible for both Idlewild programmes). IT-11 remains deferred.                                                                                                                                        |
