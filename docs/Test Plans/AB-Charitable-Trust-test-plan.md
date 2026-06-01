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

| Factor | Idlewild Trust | A B Charitable Trust |
|--------|---------------|----------------------|
| Question document format | Multi-column table (caused D-IT-01) | Numbered list / narrative — expected to extract cleanly |
| Charity eligibility | Arts sector only — Harry's Rainbow not eligible | Broad causes — Harry's Rainbow IS eligible |
| Limit type | Character limits (GAP-27) | Word limits expected |
| Previous test result | D-IT-01 open | First live test of fixed extraction prompt |

**Application window:** Next deadline **31 July 2026** — decisions expected October 2026. Applications are currently open.

**Coverage principle:** Every test covers the complete end-to-end flow. No step is omitted on the assumption it was tested previously. See AGENTS.md — mandatory test plan coverage rule.

---

## Test Data

| Item | Value |
|------|-------|
| Test user email | grantpathway+ABC@gmail.com |
| Test user password | (set by tester at registration) |
| Charity name | Harry's Rainbow |
| Charity registration number | 1194917 |
| Charity type | UK Registered Charity |
| Charity focus | Children's bereavement support, Milton Keynes |
| Funder | A B Charitable Trust |
| Grant range | £10k–£40k/yr |
| Application type | Single stage |
| Application deadline | 31 July 2026 |
| Guidelines file | AB Charitable Trust application questions PDF (from `docs/Grant Org Guidelines/`) |
| Guidelines input method | PDF upload (primary); paste text (fallback if extraction fails) |

---

## Lessons Applied from Idlewild Trust Testing

| Lesson | Applied in this plan |
|--------|---------------------|
| Complete end-to-end flow mandatory | All steps 1–5 covered including prep checklist |
| Record AI summary timing | Stopwatch step included in ABC-03 |
| Prep checklist must be explicitly confirmed | Step included in ABC-03 |
| PDF table format causes extraction failure (D-IT-01) | AB format is numbered list — expect clean extraction; paste fallback documented |
| No indication of which file was loaded | Known limitation — noted in ABC-03 expected result |
| Eligibility mismatch should be surfaced | ABC-04 tests for POSITIVE eligibility match (Harry's Rainbow IS eligible) |
| Non-narrative questions should not appear in Step 4 | ABC-06 explicitly verifies only narrative questions shown |

---

## Known Expected Behaviours

| Ref | Description |
|-----|-------------|
| Prior test | AB Charitable Trust was previously processed by Grant Pathway (D-011 in the main test log). The document has 33 numbered questions but only approximately 5 require narrative text answers — the remaining 28 are data-entry, financial, dropdown, date, or file upload fields. Step 4 should show only the ~5 narrative questions. |
| No file indicator | The Step 3 summary page does not currently show which guidelines file was uploaded. This is a known limitation logged as a product improvement. |

---

## Test Results Summary

Complete after running all tests.

| Test ID | Test Name | Idlewild Lesson Applied | AI Summary Time | Result | Notes |
|---------|-----------|------------------------|-----------------|--------|-------|
| ABC-01 | Account registration and charity profile | No | N/A | | |
| ABC-02 | A B Charitable Trust funder picker | No | N/A | | |
| ABC-03 | PDF upload, AI summary and prep checklist | Yes — timing, prep checklist | TBC | | |
| ABC-04 | AI eligibility match — Harry's Rainbow IS eligible | Yes — eligibility check | N/A | | |
| ABC-05 | AI summary content accuracy | No | N/A | | |
| ABC-06 | Narrative question extraction — only ~5 expected, not all 33 | Yes — non-narrative filtering | N/A | | |
| ABC-07 | Word limit extraction and counter display | Yes — limit type correct | N/A | | |
| ABC-08 | Narrative answer writing and AI assist | No | N/A | | |
| ABC-09 | Answer approval and Step 5 navigation | No | N/A | | |
| ABC-10 | Word document export — structure and content | No | N/A | | |

---

## Defect Log

| ID | Test | Description | Severity | Status |
|----|------|-------------|----------|--------|
| | | | | |

---

## Test Cases

---

### ABC-01 — Account Registration and Charity Profile

**Idlewild lesson applied:** No — standard setup
**Prerequisite:** None

**Steps:**
1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Register**
3. Enter first name, last name, email `grantpathway+ABC@gmail.com`, password (10+ characters), accept Terms and Privacy Policy
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
- *(Known limitation: no filename indicator shown on Step 3 — this is expected)*

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-04 — AI Eligibility Match — Harry's Rainbow IS Eligible

**Idlewild lesson applied:** Yes — Idlewild IT-04 tested for a mismatch; this tests the opposite (positive match)
**Prerequisite:** ABC-03 complete (AI summary generated)

**Steps:**
1. Review the AI summary generated in ABC-03
2. Check the "Who can apply" section for eligibility criteria
3. Assess whether the criteria match Harry's Rainbow's profile:
   - Harry's Rainbow is a UK Registered Charity ✅
   - They support children and families (broad social causes) ✅
   - They are based in the UK ✅
   - They are not a grant-making body ✅
4. Check whether the summary flags any concern or mismatch with Harry's Rainbow

**Expected result:**
- "Who can apply" criteria are clearly listed
- The eligibility criteria match Harry's Rainbow's profile — no mismatch should be flagged
- The summary does NOT raise a concern about Harry's Rainbow's suitability (unlike the Idlewild Arts test)
- This confirms the AI correctly surfaces relevant criteria without inventing mismatches

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

### ABC-06 — Narrative Question Extraction — Only ~5 Expected, Not All 33

**Idlewild lesson applied:** Yes — this directly tests the non-narrative question filtering that was previously causing problems
**Prerequisite:** ABC-03 complete (Q&A interface entered)

**Background:** The A B Charitable Trust application has approximately 33 numbered questions in total. However, most are data-entry fields (name, address, charity number), financial fields (income, expenditure), dropdown selections, date fields, and file uploads. Only approximately 5 questions require a narrative prose answer. Grant Pathway should extract and display only the narrative questions.

**Steps:**
1. In the Step 4 Q&A interface, count the number of questions displayed
2. Review each question shown and confirm it requires a **written prose answer**
3. Confirm there are **no** data-entry fields shown (e.g. "Enter your charity registration number", "What is your annual income?")
4. Confirm there are **no** dropdown selections, date fields, or file upload reminders shown as writing tasks
5. Record the exact number of questions shown and their text in the Notes field below

**Expected result:**
- Approximately 5 questions are displayed (not 33)
- All displayed questions require a narrative prose response
- No data-entry, financial, dropdown, date, or file upload fields are shown as writing cards
- *(If more than 10 questions are shown, this is likely a regression — log as a defect)*

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record exact questions shown):**

---

### ABC-07 — Word Limit Extraction and Counter Display

**Idlewild lesson applied:** Yes — Idlewild used character limits (GAP-27); AB is expected to use word limits; this confirms the correct limit type is extracted and displayed
**Prerequisite:** ABC-06 complete

**Steps:**
1. Review each narrative question card in Step 4
2. For each question, note:
   - Whether a limit badge is shown (e.g. "400 words" or "800 characters")
   - The limit type displayed (words or characters)
   - The limit value shown
3. Click into one question's answer field and begin typing
4. Observe the counter updating in real time
5. Confirm the counter format:
   - If word limit: **"X / 400 words"**
   - If character limit: **"X / 800 characters"**
6. Type enough text to reach approximately 90% of the limit and confirm the counter changes colour or highlights

**Expected result:**
- Limit badges shown on all questions that have a stated limit
- Counter updates in real time as text is typed
- Counter format correctly shows "words" or "characters" (not mixed)
- Near-limit visual indicator triggers at approximately 90% of the limit
- *(If limits show as wrong type — e.g. character limit shown as word limit — log as a defect)*

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
- Footer: *"Prepared using Grant Pathway v[version] — grantpathway.org.uk"*

Additional checks:
- Only approved answers are included (unapproved questions are absent)
- Word limits / character limits are not shown in the exported document
- Document is clean, readable, and free of formatting artefacts
- File opens without errors in Microsoft Word or equivalent

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-06-01 | Rapidglobe Ltd | Initial test plan — A B Charitable Trust, Harry's Rainbow test charity, 10 tests incorporating Idlewild lessons |
