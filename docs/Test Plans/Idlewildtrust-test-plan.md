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

---

## Test Data

| Item | Value |
|------|-------|
| Test user email | grantpathway+idle1@gmail.com |
| Test user password | (set by tester at registration) |
| Charity name | Harry's Rainbow |
| Charity registration number | 1194917 |
| Charity type | UK Registered Charity |
| Charity focus | Children's bereavement support, Milton Keynes |
| Funder | Idlewild Trust |
| Programme 1 | Arts — Nurturing Early-Stage Professionals |
| Programme 2 | Conservation — Cultural Heritage Collections |
| Grant amount (Arts) | Up to £7,000 |
| Application window | Round 1 2026 — opens 8 June 2026, deadline 5 September 2026 |
| Guidelines file (Arts) | `docs/Grant Org Guidelines/idlewild-arts-application-questions-dec2025.pdf` |
| Guidelines file (Conservation) | `docs/Grant Org Guidelines/idlewild-conservation-application-questions-dec2025.pdf` |
| Guidelines input method | File upload (PDF) |

---

## Known Expected Behaviours

The following behaviours are known limitations at the time of this test. They are **not** failures — log them as observations only.

| Ref | Description |
|-----|-------------|
| GAP-27 | Character limits may be extracted as word limits or missed entirely. Observe and record what the AI extracts. |
| GAP-28 | Non-narrative questions (Yes/No A/B/C, dropdown Q7/Q16, dates Q17/Q18, number Q24, budget tables Q25–Q27, file uploads Q31–Q33) may appear as text areas rather than being excluded or shown as reminders. Observe and record. |

---

## Test Results Summary

Complete after running all tests.

| Test ID | Test Name | Programme | Idlewild-Specific | Result | Notes |
|---------|-----------|-----------|-------------------|--------|-------|
| IT-01 | Account registration and charity profile | Both | No | | |
| IT-02 | Idlewild Trust funder picker | Both | Yes | | |
| IT-03 | Arts guidelines PDF upload and AI summary | Arts | Yes | | |
| IT-04 | AI eligibility mismatch detection | Arts | Yes | | |
| IT-05 | Character limit extraction and display | Arts | Yes | | |
| IT-06 | Non-narrative question handling | Arts | Yes | | |
| IT-07 | Narrative answer writing and character counter | Arts | Yes | | |
| IT-08 | Conservation guidelines PDF upload and AI summary | Conservation | Yes | | |
| IT-09 | Conservation knowledge-sharing requirement identified | Conservation | Yes | | |
| IT-10 | Word document export — structure and content | Arts | No | | |

---

## Defect Log

Log any failures not listed in Known Expected Behaviours above.

| ID | Test | Description | Severity | Status |
|----|------|-------------|----------|--------|
| | | | | |

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
3. Enter first name, last name, email `grantpathway+idle1@gmail.com`, password (10+ characters), accept Terms and Privacy Policy
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
6. On Step 3, click **Generate summary**
7. Observe the loading indicator and staged progress messages
8. Review the generated AI summary

**Expected result:**
- PDF uploads successfully (no format or size error)
- AI summary generates without error within 30 seconds
- Summary includes:
  - Funder priorities (arts sector, early-stage professionals, performing and visual arts)
  - Grant ceiling (£7,000)
  - Application deadline reference
  - Plain-English explanation of the narrative questions (Q9, Q19–Q23, Q28–Q30)
- Application Sections or Questions card is displayed showing extracted questions

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-04 — AI Eligibility Mismatch Detection

**Programme:** Arts
**Idlewild-specific:** Yes — Idlewild Arts funds arts sector organisations supporting early-stage arts professionals. Harry's Rainbow is a children's bereavement charity with no arts remit. The AI summary should surface this potential mismatch.
**Prerequisite:** IT-03 complete

**Steps:**
1. Review the AI summary generated in IT-03
2. Check whether the summary includes any of the following eligibility signals:
   - Idlewild Arts requires the applicant to be an **arts sector UK Registered Charity**
   - The programme supports professionals in performing, fine and applied arts — musicians, dancers, writers, artists, composers, theatre-makers
   - Participants must be aged **18 or over** and have completed education to the highest level in their discipline
   - The funder **does not fund** educational institutions, schools, or administration/management skills projects
3. Note whether the summary flags any potential eligibility concern given Harry's Rainbow's bereavement focus

**Expected result:**
- AI summary clearly states the arts sector eligibility requirement
- Summary identifies that the programme is for arts organisations, not general charities
- Ideally: summary flags or implies that the applying charity's profile (bereavement charity) may not align with Idlewild's arts focus — this is an **observation**, not a mandatory pass criterion

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-05 — Character Limit Extraction and Display

**Programme:** Arts
**Idlewild-specific:** Yes — ALL Idlewild narrative questions use **character limits**, not word limits. This is the primary test for GAP-27.
**Prerequisite:** IT-03 complete

**Expected character limits from Idlewild Arts question set:**

| Question | Description | Character limit |
|----------|-------------|----------------|
| Q9 | Organisation aims, objectives, activities and achievements | 1,600 characters |
| Q19 | How emerging professionals are selected | 800 characters |
| Q20 | What is the need for the project? | 800 characters |
| Q21 | Age, stage and experience of emerging professionals | 800 characters |
| Q22 | Experience and qualifications of project leaders/tutors | 800 characters |
| Q23 | Describe the project or programme | 1,600 characters |
| Q28 | How will the project be managed? | 800 characters |
| Q29 | How will you measure success? | 800 characters |
| Q30 | What difference will the project make? | 800 characters |

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
- *(GAP-27 observation: if limits are shown as words rather than characters, record the values seen)*

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record actual values seen):**

---

### IT-06 — Non-Narrative Question Handling

**Programme:** Arts
**Idlewild-specific:** Yes — Idlewild's question set contains a high proportion of non-narrative question types. This is the primary test for GAP-28.
**Prerequisite:** IT-03 complete

**Non-narrative questions in Idlewild Arts:**

| Ref | Question | Type |
|-----|----------|------|
| A, B, C | Privacy and consent | Yes/No |
| Q7 | Organisation status | Dropdown |
| Q16 | Region where project takes place | Dropdown |
| Q17 | Expected project start date | Date |
| Q18 | Expected project end date | Date |
| Q24 | Total funding requested from Idlewild | Number (£) |
| Q25 | Breakdown of total project costs | Budget table |
| Q26 | Grants and income raised to date | Budget table |
| Q27 | Pending grants and projected income | Budget table |
| Q31 | Most recent signed annual accounts | File upload |
| Q32 | Latest management accounts | File upload |
| Q33 | Organisation's Safeguarding Policy | File upload |

**Steps:**
1. On Step 4 (Draft Answers), review all questions displayed
2. For each non-narrative question type listed above, record how Grant Pathway displays it:
   - Shown as a text area (GAP-28 current behaviour — expected observation)
   - Shown as a read-only reminder / aide-memoire
   - Excluded from the interface entirely
3. Confirm budget questions (Q24–Q27) are visually flagged in amber with AI assist disabled

**Expected result:**
- Budget questions (Q24–Q27) are flagged amber with AI assist disabled
- *(GAP-28 observation: non-narrative questions may appear as text areas — record which types and how many)*
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
4. Click **Continue** and generate the AI summary on Step 3
5. Review the generated summary

**Expected result:**
- PDF uploads successfully
- AI summary generates without error within 30 seconds
- Summary correctly identifies Conservation programme focus:
  - Objects and works of art in museums, galleries, historic buildings
  - Must be accessible to the public
  - Grant ceiling £7,000
  - Places of worship are **not** funded (important exclusion)
  - Requires an independent Conservation Report before applying
- Questions or sections are extracted and displayed

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-09 — Conservation Knowledge-Sharing Requirement Identified

**Programme:** Conservation
**Idlewild-specific:** Yes — Idlewild Conservation uniquely requires a **knowledge-sharing** outcome (webinar, lecture, or published article) as part of every funded project. This is not a requirement in the Arts programme and is a meaningful differentiator to test.
**Prerequisite:** IT-08 complete

**Steps:**
1. Review the AI summary generated in IT-08
2. Check whether the summary explicitly mentions the knowledge-sharing requirement:
   - *"Priority will be given to applications that include a knowledge-sharing element as an outcome of the project"*
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
- Footer: *"Prepared using Grant Pathway v[version] — grantpathway.org.uk"*

Additional checks:
- Only approved answers are included
- Character limits are not shown in the exported document (these are internal to the app)
- Document is clean and readable — no formatting artefacts

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-06-01 | Rapidglobe Ltd | Initial test plan — Idlewild Trust Arts and Conservation programmes, Harry's Rainbow test charity, 10 test cases including GAP-27 and GAP-28 observations |
