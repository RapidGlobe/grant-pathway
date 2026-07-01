# A B Charitable Trust Test Plan

**Version:** 1.0
**Date:** 2026-06-01
**Status:** Ready for execution
**Tester:** WJ
**Test account:** grantpathway+ABC@gmail.com

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using A B Charitable Trust as the target funder. A B Charitable Trust is a **Structured** funder that publishes a numbered list of application questions as a PDF in advance of their online portal opening — making them a primary test case for the numbered-list PDF extraction path.

**Key differences from the Idlewild Trust test:**

| Factor                   | Idlewild Trust                                  | A B Charitable Trust                                                                    |
| ------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| Question document format | Multi-column table (caused D-IT-01)             | Numbered list (A1–D8) — expected to extract cleanly                                     |
| Charity eligibility      | Arts sector only — Harry's Rainbow not eligible | Social justice / human rights focus — Harry's Rainbow likely NOT eligible               |
| Narrative questions      | 9 (all character-limited)                       | 2–3 only (B3, B4, C11) — rest are data-entry, financial, or file uploads                |
| Key unique limit         | Character limits (GAP-27)                       | B4: **15-word limit** — very tight and specific                                         |
| D5 — proposal document   | N/A                                             | File upload (Word/PDF 2–2½ pages) — NOT a text field; must not appear as a writing card |
| Previous test result     | D-IT-01 open                                    | First live test of fixed extraction prompt                                              |

**Application window:** Next deadline **31 July 2026** — decisions expected October 2026. Applications are currently open.

**Coverage principle:** Every test covers the complete end-to-end flow. No step is omitted on the assumption it was tested previously. See AGENTS.md — mandatory test plan coverage rule.

---

## Test Data

| Item                        | Value                                                                             |
| --------------------------- | --------------------------------------------------------------------------------- |
| Test user email             | grantpathway+ABC@gmail.com                                                        |
| Test user password          | (set by tester at registration)                                                   |
| Charity name                | Harry's Rainbow                                                                   |
| Charity registration number | 1194917                                                                           |
| Charity type                | UK Registered Charity                                                             |
| Charity focus               | Children's bereavement support, Milton Keynes                                     |
| Funder                      | A B Charitable Trust                                                              |
| Grant range                 | £10k–£40k/yr                                                                      |
| Application type            | Single stage                                                                      |
| Application deadline        | 31 July 2026                                                                      |
| Guidelines file             | AB Charitable Trust application questions PDF (from `docs/Grant Org Guidelines/`) |
| Guidelines input method     | PDF upload (primary); paste text (fallback if extraction fails)                   |

---

## Lessons Applied from Idlewild Trust Testing

| Lesson                                               | Applied in this plan                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Complete end-to-end flow mandatory                   | All steps 1–5 covered including prep checklist                                  |
| Record AI summary timing                             | Stopwatch step included in ABC-03                                               |
| Prep checklist must be explicitly confirmed          | Step included in ABC-03                                                         |
| PDF table format causes extraction failure (D-IT-01) | AB format is numbered list — expect clean extraction; paste fallback documented |
| No indication of which file was loaded               | Known limitation — noted in ABC-03 expected result                              |
| Eligibility mismatch should be surfaced              | ABC-04 tests for POSITIVE eligibility match (Harry's Rainbow IS eligible)       |
| Non-narrative questions should not appear in Step 4  | ABC-06 explicitly verifies only narrative questions shown                       |

---

## Known Expected Behaviours

| Ref               | Description                                                                                                                                                                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prior test        | AB Charitable Trust was previously processed by Grant Pathway (D-011 in the main test log). Document has sections A–D. Only 2–3 questions require narrative prose (B3, B4, possibly C11). D5 is a file upload instruction (Word/PDF proposal, 2–2½ pages) — must NOT appear as a text writing card. |
| B4 word limit     | B4 asks for a summary in "no more than 15 words" — the tightest word limit of any funder tested. Counter should show "X / 15 words".                                                                                                                                                                |
| Grant amount      | AB does not ask applicants to specify a grant amount. Open Programme range is £10,000–£30,000 pa.                                                                                                                                                                                                   |
| No file indicator | The Step 3 summary page does not currently show which guidelines file was uploaded. This is a known limitation logged as a product improvement.                                                                                                                                                     |

---

## Test Results Summary

Complete after running all tests.

| Test ID | Test Name                                                        | Idlewild Lesson Applied                           | AI Summary Time | Result  | Notes                                                             |
| ------- | ---------------------------------------------------------------- | ------------------------------------------------- | --------------- | ------- | ----------------------------------------------------------------- |
| ABC-01  | Account registration and charity profile                         | No                                                | N/A             | ✅ Pass |                                                                   |
| ABC-02  | A B Charitable Trust funder picker                               | No                                                | N/A             | ✅ Pass |                                                                   |
| ABC-03  | PDF upload, AI summary and prep checklist                        | Yes — timing, prep checklist                      | Not recorded    | ✅ Pass | Paste text used; PDF extraction issue (D-IT-01) still open        |
| ABC-04  | AI eligibility mismatch — Harry's Rainbow NOT eligible           | Yes — social justice focus vs bereavement charity | N/A             | ✅ Pass | Summary clearly states social justice categories required         |
| ABC-05  | AI summary content accuracy                                      | No                                                | N/A             | ✅ Pass | All sections accurate; grant amount correct                       |
| ABC-06  | Narrative question extraction — 2–3 expected; D5 must NOT appear | Yes — non-narrative filtering                     | N/A             | ✅ Pass | 3 questions shown (B3, B4, C11); D5 absent                        |
| ABC-07  | Word limit extraction — B4 is 15 words (tightest limit tested)   | Yes — limit type correct                          | N/A             | ✅ Pass | "15 words" badge and "0 / 15 words" counter correct               |
| ABC-08  | Narrative answer writing and AI assist                           | No                                                | N/A             | ✅ Pass | AI assist working; spelling correction fix applied mid-test       |
| ABC-09  | Answer approval and Step 5 navigation                            | No                                                | N/A             | ✅ Pass | Senior review screen; Step 5 review checkboxes and approval modal |
| ABC-10  | Word document export — structure and content                     | No                                                | N/A             | ✅ Pass | Both .docx and .txt downloaded; all content correct               |

---

## Defect Log

| ID  | Test | Description | Severity | Status |
| --- | ---- | ----------- | -------- | ------ |
|     |      |             |          |        |

---

## Test Cases

---

### ABC-01 — Account Registration and Charity Profile

**Idlewild lesson applied:** No — standard setup
**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Register**
3. Enter first name, last name, email `grantpathway+ABC@gmail.com`, password (12+ characters, must include letters and digits), accept Terms and Privacy Policy
4. Click **Create account**
5. Open the verification email and click the verification link
6. Click **Go to my dashboard**
7. Click **Charity Profile** in the navigation
8. Enter charity registration number **1194917** and trigger the Charity Commission lookup
9. Confirm or complete pre-filled fields:
   - Charity name: Harry's Rainbow
   - What does your charity do: children's bereavement support, therapeutic groups, activities and trips for children aged 0–25 bereaved of a parent or sibling, Milton Keynes and surrounding areas
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

### ABC-02 — A B Charitable Trust Funder Picker

**Idlewild lesson applied:** No — this test passed cleanly in Idlewild; confirms the picker works consistently
**Prerequisite:** ABC-01 complete

**Steps:**

1. From the dashboard, click **+ New Application**
2. On Step 1, click into the funder picker search field
3. Type **"A B"**
4. Confirm **A B Charitable Trust** appears in the dropdown with a **Structured** badge
5. Select **A B Charitable Trust**
6. Enter grant name: **"General Grant 2026"**
7. Click **Continue**

**Expected result:**

- "A B" search returns A B Charitable Trust in the dropdown
- **Structured** badge displayed alongside the name
- Application created and dashboard updated
- "My funder isn't listed" link visible below the picker

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-03 — PDF Upload, AI Summary and Prep Checklist

**Idlewild lesson applied:** Yes — timing recorded; prep checklist explicitly confirmed; paste fallback documented
**Prerequisite:** ABC-02 complete

**Steps:**

1. Open the application from the dashboard
2. On Step 2 (Funder Guidelines), select **Upload a file**
3. Upload the A B Charitable Trust application questions PDF from `docs/Grant Org Guidelines/`
4. Confirm the file is accepted (filename displayed, no error)
5. Click **Continue**
6. On Step 3, **start a stopwatch** then click **Generate summary**
7. Observe the loading indicator and staged progress messages
8. **Stop the stopwatch** when the summary appears — record the time in the results table above
9. Review the generated AI summary
10. Click **Continue** to proceed to Step 4
11. Confirm the **"Before you begin writing"** preparation checklist screen appears
12. Click **"I have what I need — start writing"** to enter the Q&A interface

**If PDF extraction fails (no questions shown in Step 4):**

- Return to Step 2 using the **Back** button
- Select **paste text** instead
- Paste the narrative questions directly from the AB Charitable Trust document
- Regenerate the summary and proceed

**Expected result:**

- PDF uploads successfully (no format or size error — AB document is .pdf)
- AI summary generates without error within 30 seconds
- Summary content covers AB Charitable Trust's focus areas, eligibility, and requirements
- Prep checklist screen confirmed before Q&A interface
- _(Known limitation: no filename indicator shown on Step 3 — this is expected)_

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-04 — AI Eligibility Mismatch — Harry's Rainbow Likely NOT Eligible

**Idlewild lesson applied:** Yes — same pattern as IT-04. AB Charitable Trust funds specific social justice causes; Harry's Rainbow does not operate in these areas
**Prerequisite:** ABC-03 complete (AI summary generated)

**Background:** AB Charitable Trust funds organisations working in: Access to Justice, Human Rights, Migrants and Refugees, and The Justice System and Penal Reform (these are the categories in the B1 dropdown). Harry's Rainbow provides bereavement support to children — this does not fall within these categories.

**Steps:**

1. Review the AI summary generated in ABC-03
2. Check the "Who can apply" and "What the funder is looking for" sections
3. Confirm the summary correctly identifies AB Charitable Trust's social justice / human rights focus:
   - Access to Justice
   - Human Rights
   - Migrants and Refugees
   - The Justice System and Penal Reform
4. Assess whether the summary flags a potential mismatch with Harry's Rainbow's bereavement focus
5. Note whether the AI surfaces the category restriction (B1) as an eligibility consideration

**Expected result:**

- Summary clearly identifies the social justice / human rights funding focus
- A user reading the summary would immediately recognise that Harry's Rainbow's bereavement work does not align with AB's categories
- Ideally the AI flags the mismatch explicitly — this is an observation, not a mandatory pass criterion
- Grant Pathway does not block the user from proceeding (eligibility is the charity's responsibility)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-05 — AI Summary Content Accuracy

**Idlewild lesson applied:** No
**Prerequisite:** ABC-03 complete

**Steps:**

1. Review the full AI summary
2. Check each section is present and plausible:
   - **About this grant** — describes AB Charitable Trust and its focus areas
   - **Grant amount** — references the £10k–£40k/yr range or similar
   - **Who can apply** — UK registered charities, eligibility criteria
   - **What the funder is looking for** — funding priorities and themes
   - **Key requirements** — restrictions, deadlines, exclusions
3. Check whether the application deadline (31 July 2026) is mentioned
4. Check whether the single-stage nature of the application is noted

**Expected result:**

- All five summary sections are present and populated
- Grant amount or range is referenced correctly
- At least one of: deadline, exclusions, or key priorities is accurately captured
- Summary is in plain English and comprehensible to a non-specialist user

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-06 — Narrative Question Extraction — Only 2–3 Expected

**Idlewild lesson applied:** Yes — directly tests non-narrative question filtering
**Prerequisite:** ABC-03 complete (Q&A interface entered)

**Background:** The A B Charitable Trust document has questions across four sections (A, B, C, D). The vast majority are data-entry, financial, dropdown, or file upload fields. Only 2–3 require a narrative prose answer:

| Question | Text                                                                         | Expected                                                                                       |
| -------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| B3       | How does your organisation reflect the communities that you work with?       | ✅ Should appear — narrative, no explicit word limit                                           |
| B4       | Summarise your work or your project in no more than 15 words                 | ✅ Should appear — narrative, **15-word limit**                                                |
| C11      | If you would like to give us any additional information, please use this box | May appear — optional narrative                                                                |
| D5       | Please provide an overview of your work/funding proposal                     | ❌ Should NOT appear as a writing card — this is a file upload (Word/PDF document, 2–2½ pages) |

**Steps:**

1. In the Step 4 Q&A interface, count the number of questions displayed
2. Confirm B3 and B4 are both present
3. Confirm D5 ("Please provide an overview of your work/funding proposal") does **NOT** appear as a text writing card — it is a document upload instruction
4. Confirm none of the following appear as writing cards: A1–A10 (org details), B1–B2 (dropdowns), C1–C10 (financial figures), D1–D4 (file uploads), D6–D8 (further file uploads)
5. Record the exact number and text of all questions shown

**Expected result:**

- 2–3 questions displayed (B3, B4, and possibly C11)
- B4 shows a **15-word limit** badge — the tightest limit in any funder tested so far
- D5 does not appear as a text writing card
- No data-entry, financial, dropdown, or standard file upload questions shown
- _(If more than 5 questions shown, investigate — log as defect if non-narrative fields included)_

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record exact questions shown):**

---

### ABC-07 — Word Limit Extraction and Counter Display

**Idlewild lesson applied:** Yes — Idlewild used character limits; AB uses word limits. Also tests B4's unique 15-word limit — the tightest tested so far
**Prerequisite:** ABC-06 complete

**Steps:**

1. On the B4 question card ("Summarise your work or your project in no more than 15 words"):
   - Confirm a **"15 words"** limit badge is displayed
   - Type a short answer and confirm the counter shows **"X / 15 words"**
   - Type more than 15 words and confirm the counter highlights as over-limit
2. On the B3 question card ("How does your organisation reflect the communities..."):
   - Confirm whether a limit badge is shown (B3 has guidance text but no explicit word count — AI may or may not extract a limit)
   - Record what the counter shows
3. Confirm counter format throughout uses **"words"** not "characters"

**Expected result:**

- B4 shows **"15 words"** badge and **"X / 15 words"** counter
- Counter highlights or changes colour when the 15-word limit is exceeded on B4
- B3 may or may not show a limit (guidance text only — acceptable either way)
- All counters show "words" not "characters" — confirming limit type extraction is correct for this funder
- _(If B4 shows "15 characters" instead of "15 words" — log as a defect)_

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record limit type and values seen):**

---

### ABC-08 — Narrative Answer Writing and AI Assist

**Idlewild lesson applied:** No — core writing interface test
**Prerequisite:** ABC-07 complete

**Steps:**

1. Select the first narrative question in Step 4
2. Write a short answer of approximately 50 words describing Harry's Rainbow's work relevant to the question
3. Click **"Help me improve this"** (AI assist button)
4. Observe the AI-refined answer returned
5. Confirm the refined answer:
   - Does not add facts not in the original answer
   - Maintains first-person plural voice ("we", "our", "us")
   - Stays within the word or character limit
6. Review the three mandatory prompts:
   - Does this accurately describe your charity and project?
   - Are all figures, dates, and facts correct?
   - Does this answer the question that was asked?
7. Edit one sentence directly in the text field
8. Click **Approve**

**Expected result:**

- Answer text area accepts input without errors
- AI assist returns a refined answer within 15 seconds
- Mandatory review prompts displayed before approval is possible
- Answer is visually marked as approved after clicking Approve
- No data loss when navigating to the next question

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-09 — Answer Approval and Step 5 Navigation

**Idlewild lesson applied:** No
**Prerequisite:** ABC-08 complete (at least one answer approved)

**Steps:**

1. Approve at least one additional narrative question answer (minimum two approved in total)
2. Click **"Ready to assemble"** at the bottom of Step 4
3. Confirm the **senior review confirmation screen** appears
4. Confirm and proceed
5. Confirm you arrive at **Step 5 (Approve & Export)**
6. Confirm the step indicator shows Step 5 as active with Steps 1–4 complete

**Expected result:**

- "Ready to assemble" button is enabled after at least one answer is approved
- Senior review confirmation screen appears before Step 5
- Step 5 loads showing approved answers ready for export
- Step indicator correctly reflects completed steps
- No errors during assembly

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-10 — Word Document Export — Structure and Content

**Idlewild lesson applied:** No — blocked in Idlewild due to D-IT-01; this is the first successful export test
**Prerequisite:** ABC-09 complete

**Steps:**

1. On Step 5, click **Export as Word document**
2. Open the downloaded .docx file
3. Review the document structure and content

**Expected result:**
The exported Word document contains, in order:

- Document title and grant name: **"General Grant 2026"**
- Funder name: **"A B Charitable Trust"**
- Export date
- AI disclaimer statement
- Q&A body — each approved question followed by its approved answer
- Footer: _"Prepared using Grant Pathway v[version] — grantpathway.org.uk"_

Additional checks:

- Only approved answers are included (unapproved questions are absent)
- Word limits / character limits are not shown in the exported document
- Document is clean, readable, and free of formatting artefacts
- File opens without errors in Microsoft Word or equivalent

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date       | Author         | Change                                                                                                          |
| ------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-01 | Rapidglobe Ltd | Initial test plan — A B Charitable Trust, Harry's Rainbow test charity, 10 tests incorporating Idlewild lessons |
