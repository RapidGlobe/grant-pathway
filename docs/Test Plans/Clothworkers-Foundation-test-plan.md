# Clothworkers' Foundation Test Plan — Small Grants Programme

**Version:** 1.3
**Date:** 2026-06-07
**Status:** Ready for execution
**Tester:** WJ
**Test account:** grantpathway+cloth1@gmail.com

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using The Clothworkers' Foundation Open Grants Programme (Small Grants, up to £15,000) as the target funder.

Clothworkers is a **Structured** funder. Their Small Grants form uses **word limits** with an "approx. X words" format (not exact limits), and contains a significant number of non-narrative questions (dropdowns, numbers, percentages, yes/no, file uploads). These make Clothworkers the primary test case for "approx." word limit extraction (GAP-27 variant) and non-narrative question filtering (GAP-28).

This is the first test using a **capital funder** — Clothworkers funds equipment, buildings, vehicles, and digital infrastructure only. Programme areas focus on disadvantaged communities. Harry's Rainbow is not used for this test as it does not clearly map to Clothworkers' programme areas. A purpose-designed test charity (Bridge Support MK) is used instead.

**Test coverage principle:** Every test plan covers the complete end-to-end flow — registration, profile, funder selection, guidelines upload, AI summary, preparation checklist, Q&A writing, and export.

---

## Test Data

| Item                        | Value                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Test user email             | grantpathway+cloth1@gmail.com                                                                                                                    |
| Test user password          | (set by tester at registration)                                                                                                                  |
| Charity name                | Bridge Support MK                                                                                                                                |
| Charity registration number | None — fictional charity, use manual entry                                                                                                       |
| Charity type                | UK Registered Charity (fictional)                                                                                                                |
| Charity focus               | Practical support, food, and emergency resources for young people aged 16–25 facing economic disadvantage and homelessness risk in Milton Keynes |
| Who they help               | Young people aged 16–25 at risk of homelessness or in economic hardship in Milton Keynes                                                         |
| Where they work             | Milton Keynes                                                                                                                                    |
| Programme areas             | Young People Facing Disadvantage; Economic Disadvantage                                                                                          |
| Annual income               | £180,000                                                                                                                                         |
| Capital project             | Purchase of 10 laptops and 5 tablets for a drop-in digital skills and employment support centre                                                  |
| Grant amount requested      | £8,500 (Small Grant — up to £15,000)                                                                                                             |
| Funder                      | The Clothworkers' Foundation                                                                                                                     |
| Grant name                  | Open Grants Programme — Small Grant 2026                                                                                                         |
| Guidelines file             | `docs/Grant Org Guidelines/clothworkers-open-grants-guidance-and-sample-forms.pdf`                                                               |
| Guidelines input method     | File upload (PDF)                                                                                                                                |

---

## Known Expected Behaviours

| Ref            | Description                                                                                                                                                                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAP-27 variant | Clothworkers uses "approx. X words" format (not exact word counts). Observe whether the AI extracts these as word limits and what value it records (e.g., "approx. 250 words" → 250 words).                                                                                                                                        |
| GAP-28         | Non-narrative questions (religion affiliation yes/no, Living Wage accredited yes/no, programme area multi-select, percentage fields for lived experience, income/expenditure numbers, file uploads for accounts and project budget, project type dropdown, marketing consent yes/no) may appear as text areas. Observe and record. |

---

## Expected Narrative Questions

The following narrative questions should be extracted from the Small Grants form. Budget questions are marked ← budget and should be flagged amber with AI assist disabled.

**Verified output (2026-06-07 retest, D-CWF-01 fix confirmed): 8 questions extracted.** Questions 8 (project title, 20 words), 10 (shortfall, 200 words), and 11 (difference your project will make, 250 words) appear in the Large Grants section of the same PDF and are correctly excluded by the MULTIPLE FORMS rule.

| #   | Question                                                                                                       | Approx. word limit |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | Please describe the community/group of people you support in your own words                                    | 50 words           |
| 2   | Briefly summarise the work of your organisation                                                                | 200 words          |
| 3   | Please tell us more about the lived experience of the leadership (Trustees or equivalent) of your organisation | 250 words          |
| 4   | Please tell us what lived experience looks like in your organisation amongst your staff and/or volunteers      | 250 words          |
| 5   | How are users involved in your organisation?                                                                   | 250 words          |
| 6   | What is your organisation's financial position?                                                                | 250 words ← budget |
| 7   | Is your organisation experiencing or expecting any financial difficulties?                                     | 250 words ← budget |
| 8   | Please describe your project                                                                                   | 250 words          |

---

## Test Results Summary

Complete after running all tests.

| Test ID  | Test Name                                                | Clothworkers-Specific | AI Summary Time | Result  | Notes                                                                                                                                                                                                                                |
| -------- | -------------------------------------------------------- | --------------------- | --------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IT-CW-01 | Account registration and charity profile                 | No                    | N/A             | ✅ Pass |                                                                                                                                                                                                                                      |
| IT-CW-02 | Clothworkers' Foundation funder picker                   | Yes                   | N/A             | ✅ Pass |                                                                                                                                                                                                                                      |
| IT-CW-03 | PDF upload, AI summary, and prep checklist               | Yes                   | 40–47s          | ✅ Pass | Load time within revised NFR-01 large-document target (≤45s) but approaches upper limit. Large multi-form PDF (1.1MB, 30 pages). Pre-launch performance improvement recommended. Prompt fixes required during test (see defect log). |
| IT-CW-04 | Eligibility check — Bridge Support MK passes             | Yes                   | N/A             | ✅ Pass | No mismatch warning — FR-47 correctly did not flag Bridge Support MK                                                                                                                                                                 |
| IT-CW-05 | AI summary content accuracy                              | Yes                   | N/A             | ✅ Pass | All key content accurate — capital-only, programme areas, grant tiers, exclusions                                                                                                                                                    |
| IT-CW-06 | Narrative question extraction with "approx." word limits | Yes                   | N/A             | ✅ Pass | 11 questions extracted after prompt fixes; "approx." limits correctly extracted as numbers; faith affiliation Q1 still extracted (GAP-28 Layer 2 — open)                                                                             |
| IT-CW-07 | Budget and non-narrative question handling               | Yes                   | N/A             | ✅ Pass | Q7, Q8, Q10 amber with Budget badge and AI assist disabled; non-narrative questions correctly absent from Step 4                                                                                                                     |
| IT-CW-08 | Narrative answer writing and AI assist                   | No                    | N/A             | ✅ Pass | Word counter correct; AI assist blocked over word limit (D-CW-01 found and fixed during test)                                                                                                                                        |
| IT-CW-09 | Answer approval and Step 5 navigation                    | No                    | N/A             | ✅ Pass | Assembly and Step 5 approval flow correct                                                                                                                                                                                            |
| IT-CW-10 | Word document export — structure and content             | No                    | N/A             | ✅ Pass | Both .docx and .txt exported; all required sections present; clean and readable                                                                                                                                                      |

---

## Defect Log

| ID       | Test     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Severity | Status           |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------- |
| D-CW-01  | IT-CW-08 | AI assist ("Help me improve this") not disabled when answer exceeded the word limit. Client-side `isOver` flag was not reliably preventing the button click due to React rendering timing. Server-side word limit guard added to `/api/refine-answer`; client-side early-return guard added to `handleRefine`. Both layers now enforce the word limit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Medium   | Fixed            |
| D-CWF-01 | IT-CW-06 | Question 1 ("Please provide further information about your organisation's religious affiliation…") extracted as a standard writing card. This is a conditional question that only applies to faith-based organisations. The existing conditional question exclusion rule in `lib/prompts.ts` targets project-type conditionals ("only required if applying for a vehicle") — it does not detect faith-affiliation conditionals. Non-faith organisations see this as a mandatory writing card with no guidance that it is optional. Fixed (2026-06-05): FAITH AND RELIGION QUESTIONS rule added to `lib/prompts.ts` — questions asking primarily about religious affiliation, the role of faith in activities, or faith requirements for staff/trustees are now excluded as inherently conditional. Verified (2026-06-07): retest confirms faith affiliation question no longer appears — 8 questions extracted, none relating to faith or religion. | Medium   | Fixed — verified |

---

## Test Cases

---

### IT-CW-01 — Account Registration and Charity Profile

**Clothworkers-specific:** No
**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Register**
3. Enter first name, last name, email `grantpathway+cloth1@gmail.com`, password (10+ characters), accept Terms and Privacy Policy
4. Click **Create account**
5. Open the verification email and click the verification link
6. Click **Go to my dashboard**
7. Click **Charity Profile** in the navigation
8. Enter charity registration number field — leave blank (fictional charity)
9. Complete all fields manually:
   - Charity name: Bridge Support MK
   - What does your charity do: Bridge Support MK provides practical support, food, and emergency resources to young people aged 16–25 facing economic disadvantage and homelessness risk in Milton Keynes, including a drop-in centre, digital skills workshops, and employment support
   - Who do you help: Young people aged 16–25 at risk of homelessness or in economic hardship in Milton Keynes
   - Where do you work: Milton Keynes
10. Click **Save**

**Expected result:**

- Account created and email verified without errors
- Profile saves successfully with all fields populated
- Dashboard shows profile complete — Start button enabled

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-02 — Clothworkers' Foundation Funder Picker

**Clothworkers-specific:** Yes — verifies Clothworkers' Foundation appears in the approved funder directory
**Prerequisite:** IT-CW-01 complete

**Steps:**

1. From the dashboard, click **+ New Application**
2. On Step 1 (Application Details), click into the funder picker field
3. Type **"Clothworkers"**
4. Observe the filtered dropdown list
5. Confirm **The Clothworkers' Foundation** appears with a **Structured** badge
6. Select **The Clothworkers' Foundation**
7. Enter grant name: **"Open Grants Programme — Small Grant 2026"**
8. Click **Continue**

**Expected result:**

- "Clothworkers" search returns The Clothworkers' Foundation in the dropdown
- **Structured** badge is displayed alongside the name
- Application created and visible on the dashboard

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-03 — PDF Upload, AI Summary, and Prep Checklist

**Clothworkers-specific:** Yes — tests the full guidance document (including sample form) as the guidelines source; also verifies no mismatch is triggered for Bridge Support MK
**Prerequisite:** IT-CW-02 complete

**Steps:**

1. Open the application from the dashboard
2. On Step 2 (Funder Guidelines), select **Upload a file**
3. Upload `clothworkers-open-grants-guidance-and-sample-forms.pdf`
4. Confirm the file is accepted (name displayed, no error)
5. Click **Continue**
6. On Step 3, start a stopwatch then click **Generate summary**
7. Observe the loading indicator and staged progress messages
8. Stop the stopwatch when the summary appears — record the time in the results table
9. Review the generated AI summary
10. Confirm **no red eligibility mismatch warning** appears — Bridge Support MK should be eligible
11. Click **Continue** to proceed to Step 4
12. Confirm the **"Before you begin writing"** preparation checklist screen appears
13. Click **"I have what I need — start writing"**

**Expected result:**

- PDF uploads successfully (no format or size error — note: this is a large PDF at 1.1MB)
- AI summary generates without error
- **No eligibility mismatch warning** — Bridge Support MK qualifies under Young People Facing Disadvantage and Economic Disadvantage
- Summary cards displayed (about the grant, grant amount, who can apply, what funder is looking for, questions, key requirements)
- Preparation checklist screen appears on clicking Continue
- Q&A interface loads

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-04 — Eligibility Check — Bridge Support MK Passes

**Clothworkers-specific:** Yes — verifies FR-47 does not incorrectly flag Bridge Support MK as ineligible
**Prerequisite:** IT-CW-03 complete

**Steps:**

1. Review the AI summary generated in IT-CW-03
2. Confirm no red mismatch warning was shown at any point
3. Check whether the summary correctly identifies the programme areas most relevant to Bridge Support MK:
   - Young People Facing Disadvantage
   - Economic Disadvantage
4. Check whether the summary notes the capital-only restriction (equipment, buildings, vehicles, digital infrastructure)

**Expected result:**

- No eligibility mismatch warning — Bridge Support MK passes
- Summary references programme areas relevant to Bridge Support MK's work
- Capital-only restriction clearly noted in summary or key requirements

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-05 — AI Summary Content Accuracy

**Clothworkers-specific:** Yes
**Prerequisite:** IT-CW-03 complete

**Steps:**

1. Review the AI summary cards
2. Verify the following are present and accurate:
   - Grant ceiling: up to £15,000 (Small Grants)
   - Rolling programme with no deadlines
   - Capital projects only (equipment, buildings, vehicles, digital infrastructure)
   - 10 programme areas listed or summarised
   - Income eligibility: under £2 million (Small Grants)
   - One application per organisation at a time
   - Key exclusions: religious/proselytising activities, income over £10m, schools (standard provision), retrospective projects

**Expected result:**

- All key funder priorities and restrictions are accurately represented
- Grant ceiling and income threshold correct for Small Grants
- Capital-only focus clearly stated
- No significant inaccuracies

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-06 — Narrative Question Extraction with "Approx." Word Limits

**Clothworkers-specific:** Yes — GAP-27 variant: Clothworkers uses "approx. X words" not exact word counts
**Prerequisite:** IT-CW-03 complete

**Expected questions and limits (from Small Grants sample form):**

| #   | Question (abbreviated)                          | Expected limit |
| --- | ----------------------------------------------- | -------------- |
| 1   | Describe the community/group you support        | 50 words       |
| 2   | Briefly summarise the work of your organisation | 200 words      |
| 3   | Lived experience of your leadership             | 250 words      |
| 4   | Lived experience of your staff/volunteers       | 250 words      |
| 5   | How are users involved in your organisation?    | 250 words      |
| 6   | Financial position                              | 250 words      |
| 7   | Financial difficulties                          | 250 words      |
| 8   | Please describe your project                    | 250 words      |

**Steps:**

1. On Step 4 (Draft Answers), review all extracted questions
2. Record the number of questions displayed
3. For each question, record the word limit shown and whether it reads correctly (e.g., "0 / 250 words")
4. Note whether "approx." limits were extracted as the correct numeric value

**Expected result:**

- **8 narrative questions extracted** (verified 2026-06-07 — see Expected Narrative Questions table above)
- Faith/religion question does NOT appear — D-CWF-01 fix confirmed
- Word limits displayed as numbers (e.g., 250 words), not as "approx. 250 words"
- Budget questions (financial position, financial difficulties) flagged amber
- _(GAP-27 observation: record the exact limit values shown for each question)_

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record actual questions and limits shown):**

---

### IT-CW-07 — Budget and Non-Narrative Question Handling

**Clothworkers-specific:** Yes — GAP-28: Clothworkers has a high proportion of non-narrative questions
**Prerequisite:** IT-CW-03 complete

**Non-narrative questions expected in the Clothworkers Small Grants form:**

| Question                                           | Type                  |
| -------------------------------------------------- | --------------------- |
| Programme area(s)                                  | Multi-select dropdown |
| Organisation type / constitution                   | Dropdown              |
| Year established                                   | Number                |
| Religion affiliated?                               | Yes/No                |
| Living Wage accredited?                            | Yes/No                |
| How did you hear about us?                         | Dropdown              |
| % of leadership with direct lived experience       | Number / percentage   |
| % of staff/volunteers with direct lived experience | Number / percentage   |
| Annual income                                      | Number                |
| Annual expenditure                                 | Number                |
| Year end                                           | Date                  |
| Project type                                       | Dropdown              |
| Total project cost                                 | Number                |
| Amount left to raise                               | Number                |
| Project budget                                     | File upload           |
| Annual accounts                                    | File upload           |
| What type of equipment?                            | Short text / dropdown |
| Marketing communications consent                   | Yes/No                |

**Steps:**

1. On Step 4, review the full list of displayed questions
2. For each non-narrative question type above, record how Grant Pathway displays it
3. Confirm budget questions (financial position, financial difficulties, shortfall) are visually flagged amber with AI assist disabled

**Expected result:**

- Budget questions flagged amber with AI assist disabled
- _(GAP-28 observation: record how non-narrative types are displayed)_

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-08 — Narrative Answer Writing and AI Assist

**Clothworkers-specific:** No
**Prerequisite:** IT-CW-06 complete (questions visible)

**Steps:**

1. Navigate to **Q2 — Briefly summarise the work of your organisation** (approx. 200 words)
2. Write an answer describing Bridge Support MK's work (approx. 150 characters to start)
3. Observe the word counter updating in real time
4. Click **Help me improve this**
5. Review the AI-refined answer — verify it does not add invented facts
6. Review the three mandatory confirmation prompts
7. Click **Approve**
8. Navigate to **Q9 — Please describe your project** (approx. 250 words)
9. Write a short answer describing the laptop/tablet purchase for the digital skills centre
10. Click **Help me improve this**, review, and approve

**Expected result:**

- Word counter updates in real time
- Counter shows "X / 200 words" for Q2 and "X / 250 words" for Q9
- AI assist returns a refined answer without adding new facts
- Mandatory review prompts displayed before approval
- Approved answers visually marked
- No data loss when navigating between questions

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-09 — Answer Approval and Step 5 Navigation

**Clothworkers-specific:** No
**Prerequisite:** IT-CW-08 complete (at least Q2 and Q9 approved)

**Steps:**

1. On Step 4, ensure at least Q2 and Q9 are approved
2. Click **Ready to assemble** (enabled when all questions answered and approved)
3. On the assembly screen, confirm answers are assembled correctly
4. Proceed to Step 5 (Approve & Export)
5. Review the three application-level confirmation checkboxes
6. Tick all three checkboxes
7. Click **Approve my application**
8. Confirm the approval modal appears and complete it

**Expected result:**

- Ready to assemble button enabled after all answers approved
- Assembly completes without error
- Step 5 shows all three review checkboxes
- Application can be approved

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-10 — Word Document Export — Structure and Content

**Clothworkers-specific:** No
**Prerequisite:** IT-CW-09 complete (application approved)

**Steps:**

1. From Step 5, click **Export as Word document**
2. Open the downloaded .docx file
3. Review the document structure and content

**Expected result:**
The exported Word document contains, in order:

- Document title and grant name: **"Open Grants Programme — Small Grant 2026"**
- Funder name: **"The Clothworkers' Foundation"**
- Export date
- AI disclaimer statement
- Q&A body — each approved question followed by its approved answer
- Footer: _"Prepared using Grant Pathway v[version] — grantpathway.org.uk"_

Additional checks:

- Only approved answers are included
- Word limits are not shown in the exported document
- Document is clean and readable

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-02 | Rapidglobe Ltd | Initial test plan — Clothworkers' Foundation Small Grants Programme, Bridge Support MK test charity, 10 test cases including GAP-27 ("approx." word limit) and GAP-28 observations                                                                                                                                                                        |
| 1.1     | 2026-06-02 | Rapidglobe Ltd | All 10 tests completed — 10/10 Pass. D-CW-01 found and fixed during test. Defect log, results, and observations recorded.                                                                                                                                                                                                                                 |
| 1.2     | 2026-06-05 | Rapidglobe Ltd | ADR-AI-010 performance retest. Initial ceiling of 20,000 chars truncated 97,906-char PDF — questions not extracted (0/9). Ceiling raised to 50,000 via PREPROCESS_CHAR_CEILING env var. Second run: 30s, 9 questions extracted correctly. D-CWF-01 added: faith affiliation conditional question (Q1) appears as standard writing card for all charities. |
| 1.3     | 2026-06-07 | Rapidglobe Ltd | D-CWF-01 retest verified. Faith/religion question no longer extracted — 8 questions confirmed. Expected questions table updated to reflect verified output. IT-CW-06 expected result updated. D-CWF-01 status updated to Fixed — verified.                                                                                                                |
