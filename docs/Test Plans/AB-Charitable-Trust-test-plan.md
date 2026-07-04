# A B Charitable Trust Test Plan

**Version:** 1.2
**Date:** 2026-07-04
**Status:** Ready for a full clean execution. Corrected against the current service and `grant-pathway-user-guide-v1_15.docx` (2026-07-04) — see Document History for the full list of corrections. ABC-01 and ABC-02 were already confirmed live against the corrected flow (2026-07-04) and their Pass results retained; ABC-03 onward cleared for a clean re-run.
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
| Prep checklist must be explicitly confirmed          | Step included in ABC-06                                                         |
| PDF table format causes extraction failure (D-IT-01) | AB format is numbered list — expect clean extraction; paste fallback documented |
| No indication of which file was loaded               | Known limitation — noted in ABC-03 expected result                              |
| Eligibility mismatch should be surfaced              | ABC-04 tests for POSITIVE eligibility match (Harry's Rainbow IS eligible)       |
| Non-narrative questions should not appear in Step 4  | ABC-07 explicitly verifies only narrative questions shown                       |

---

## Known Expected Behaviours

| Ref               | Description                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prior test        | AB Charitable Trust was previously processed by Grant Pathway (D-011 in the main test log). Document has sections A–D. Only 2–3 questions require narrative prose (B3, B4, possibly C11). D5 is a file upload instruction (Word/PDF proposal, 2–2½ pages) — must NOT appear as a text writing card.                                                                                                                               |
| B4 word limit     | B4 asks for a summary in "no more than 15 words" — the tightest word limit of any funder tested. Counter should show "X / 15 words".                                                                                                                                                                                                                                                                                              |
| Grant amount      | AB does not ask applicants to specify a grant amount. Open Programme range is £10,000–£30,000 pa.                                                                                                                                                                                                                                                                                                                                 |
| No file indicator | The Step 3 summary page does not currently show which guidelines file was uploaded. This is a known limitation logged as a product improvement.                                                                                                                                                                                                                                                                                   |
| Test order        | ABC-04 (eligibility mismatch) and ABC-05 (content accuracy) must run **before** ABC-06 (preparation checklist/start writing) — clicking "start writing" navigates past Step 3, so the AI summary is no longer available to review afterwards. Same defect found and fixed in the MKCF plan (2026-07-03); fixed here by splitting the Step 4 navigation out of ABC-03 into its own ABC-06, renumbering old ABC-06–10 to ABC-07–11. |

---

## Test Results Summary

Complete after running all tests.

| Test ID | Test Name                                                        | Idlewild Lesson Applied                           | AI Summary Time | Result | Notes                                                                              |
| ------- | ---------------------------------------------------------------- | ------------------------------------------------- | --------------- | ------ | ---------------------------------------------------------------------------------- |
| ABC-01  | Account registration and charity profile                         | No                                                | N/A             | Pass   | Confirmed live 2026-07-04 against the corrected D-012 verification flow.           |
| ABC-02  | A B Charitable Trust funder picker                               | No                                                | N/A             | Pass   | Confirmed live 2026-07-04; empty-state "Start your first application" button used. |
| ABC-03  | PDF upload and AI summary                                        | Yes — timing                                      |                 |        |                                                                                    |
| ABC-04  | AI eligibility mismatch — Harry's Rainbow NOT eligible           | Yes — social justice focus vs bereavement charity | N/A             |        |                                                                                    |
| ABC-05  | AI summary content accuracy                                      | No                                                | N/A             |        |                                                                                    |
| ABC-06  | Preparation checklist and start writing                          | Yes — prep checklist                              | N/A             |        |                                                                                    |
| ABC-07  | Narrative question extraction — 2–3 expected; D5 must NOT appear | Yes — non-narrative filtering                     | N/A             |        |                                                                                    |
| ABC-08  | Word limit extraction — B4 is 15 words (tightest limit tested)   | Yes — limit type correct                          | N/A             |        |                                                                                    |
| ABC-09  | Narrative answer writing and AI assist                           | No                                                | N/A             |        |                                                                                    |
| ABC-10  | Answer approval and assembly                                     | No                                                | N/A             |        |                                                                                    |
| ABC-11  | Word document export; Word document verified; re-export warning  | No                                                | N/A             |        |                                                                                    |

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
5. Open the verification email and click the verification link — this auto-confirms on page load (no button click required) and expires after 1 hour (D-012, 2026-07-02)
6. On the "Email verified" screen, click **Sign in** and enter the registered email and password (the verification flow signs the session out — this is a normal credentials sign-in, not an automatic redirect to the dashboard)
7. Click **Charity Profile** in the navigation
8. Enter charity registration number **1194917** and trigger the Charity Commission lookup
9. Confirm or complete pre-filled fields:
   - Charity name: Harry's Rainbow
   - What does your charity do: children's bereavement support, therapeutic groups, activities and trips for children aged 0–25 bereaved of a parent or sibling, Milton Keynes and surrounding areas
   - Who does your charity help: children, young people and young adults aged 0–25 bereaved of a parent or sibling
   - Where do you work: Milton Keynes and surrounding areas
10. Complete any remaining required fields and click **Save**

**Expected result:**

- Account created and email verified without errors
- Sign-in with credentials succeeds
- Charity Commission lookup returns Harry's Rainbow details and pre-fills name and registration number
- Profile saves successfully

**Result:** ☑ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Registration, corrected verification flow (auto-confirm + separate sign-in), and Charity Commission lookup/profile save all completed successfully.

---

### ABC-02 — A B Charitable Trust Funder Picker

**Idlewild lesson applied:** No — this test passed cleanly in Idlewild; confirms the picker works consistently
**Prerequisite:** ABC-01 complete

**Steps:**

1. From the dashboard, click **Start your first application** — this is a freshly registered account with zero applications, so the dashboard shows this empty-state button rather than the **+ New Application** button that appears once at least one application already exists
2. On Step 1, click into the funder picker search field
3. Type **"A B"**
4. Confirm **A B Charitable Trust** appears in the dropdown with a **Structured** badge
5. Select **A B Charitable Trust**
6. Enter grant name: **"General Grant 2026"**
7. Click **Continue**

**Expected result:**

- "A B" search returns A B Charitable Trust in the dropdown
- **Structured** badge displayed alongside the name
- "Can't find your funder? Request it to be added" link visible below the picker
- Application created and Step 2 (Uploaded Guidelines) displayed

**Result:** ☑ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Confirmed the empty-state button and that Continue lands directly on Step 2 (Uploaded Guidelines), not the dashboard.

---

### ABC-03 — PDF Upload and AI Summary

**Idlewild lesson applied:** Yes — timing recorded; paste fallback documented
**Prerequisite:** ABC-02 complete

**Steps:**

1. On Step 2, upload the A B Charitable Trust application questions PDF from `docs/Grant Org Guidelines/`
2. Confirm the file is accepted (filename displayed, no error)
3. Click **Continue**
4. On Step 3, start a stopwatch — AI summary auto-generates on page load
5. Stop when summary cards appear — record the time in the results table above
6. Review the generated AI summary

**Do not click Continue yet** — the eligibility mismatch review (ABC-04) and content-accuracy review (ABC-05) both need the AI summary visible on Step 3. Continuing to Step 4 happens in ABC-06, after both reviews are complete.

**If PDF extraction fails (no questions shown after continuing in ABC-06):**

- Return to Step 2 using the **Back** button
- Paste the narrative questions directly from the AB Charitable Trust document into the paste box instead
- Regenerate the summary and proceed

**Expected result:**

- PDF uploads successfully (no format or size error — AB document is .pdf)
- AI summary generates without error within 30 seconds
- Summary content covers AB Charitable Trust's focus areas, eligibility, and requirements
- _(Known limitation: no filename indicator shown on Step 3 — this is expected)_

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-04 — AI Eligibility Mismatch — Harry's Rainbow Likely NOT Eligible

**Idlewild lesson applied:** Yes — same pattern as IT-04. AB Charitable Trust funds specific social justice causes; Harry's Rainbow does not operate in these areas
**Prerequisite:** ABC-03 complete (AI summary generated). Review this **before** continuing past Step 3 — the summary is no longer easily visible once you proceed to Step 4 and start writing (see ABC-06).

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
**Prerequisite:** ABC-03 complete. Review this **before** continuing past Step 3 — the summary is no longer easily visible once you proceed to Step 4 and start writing (see ABC-06).

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

### ABC-06 — Preparation Checklist and Start Writing

**Idlewild lesson applied:** Yes — prep checklist explicitly confirmed
**Prerequisite:** ABC-05 complete (AI summary content and eligibility reviewed while still on Step 3)

**Steps:**

1. Click **Continue** to proceed to Step 4
2. Confirm the **"Before you begin writing"** preparation checklist screen appears
3. Click **"I have what I need — start writing"** to enter the Q&A interface

**Expected result:**

- Prep checklist screen confirmed before Q&A interface
- Step 4 loads with writing cards

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-07 — Narrative Question Extraction — Only 2–3 Expected

**Idlewild lesson applied:** Yes — directly tests non-narrative question filtering
**Prerequisite:** ABC-06 complete (Q&A interface entered)

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

### ABC-08 — Word Limit Extraction and Counter Display

**Idlewild lesson applied:** Yes — Idlewild used character limits; AB uses word limits. Also tests B4's unique 15-word limit — the tightest tested so far
**Prerequisite:** ABC-07 complete

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

### ABC-09 — Narrative Answer Writing and AI Assist

**Idlewild lesson applied:** No — core writing interface test
**Prerequisite:** ABC-08 complete

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

### ABC-10 — Answer Approval and Assembly

**Idlewild lesson applied:** No
**Prerequisite:** ABC-09 complete (at least one answer approved)

**Steps:**

1. Approve all remaining mandatory narrative questions (B3 and B4; C11 too if it appeared and was answered)
2. Verify the progress bar shows all questions approved
3. Click **Ready to assemble**
4. Verify the **"Before we put it together"** senior review screen appears, confirming the financial content has been reviewed by a senior colleague
5. Click **Yes — assemble my draft**
6. On Step 5, verify:
   - Correct funder (A B Charitable Trust) and grant name ("General Grant 2026") displayed
   - All approved answers shown in read-only view

**Expected result:**

- Ready to assemble button enabled once all answers are approved
- Senior review confirmation screen appears before assembly
- Assembly completes correctly
- Step 5 displays correct funder and grant name

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-11 — Word Document Export; Word Document Verified; Re-export Warning

**Idlewild lesson applied:** No — blocked in Idlewild due to D-IT-01; this is the first successful export test
**Prerequisite:** ABC-10 complete

**Steps:**

1. Tick all three review checkboxes on Step 5
2. Click **Download as Word document (.docx)** — this both approves and downloads in one action (no separate Approve button/modal since 2026-06-12); confirm a persistent "Application approved" banner replaces the checklist
3. Open the downloaded .docx file and verify:
   - Title: **"General Grant 2026"**
   - Funder: **"A B Charitable Trust"** (or similar)
   - Export date includes time
   - AI disclaimer present and correctly worded
   - Footer reads "Prepared using Grant Pathway v[version] — grantpathway.org.uk" plus a "Page N of NN" line
   - All approved answers present
4. Click **Download as Word document (.docx)** again
5. Verify the re-export warning dialog appears with the prior export timestamp
6. Cancel — do not re-export
7. Click **Download as plain text (.txt)** — because the application was already exported as Word in step 2, the re-export confirmation dialog will appear again here too (D-WF-04, expected, not a defect); confirm through it
8. Verify a .txt file is downloaded, with the same footer line but no page numbers (plain text has no concept of pages)

**Expected result:**

- Word export opens correctly in Microsoft Word
- Export date includes a timestamp
- Only approved answers are included (unapproved questions are absent); word limits are not shown in the exported document
- Re-export warning shows the prior export timestamp on both the second Word download and the plain-text download
- Plain text download works
- Document is clean, readable, and free of formatting artefacts

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 2026-06-01 | Rapidglobe Ltd | Initial test plan — A B Charitable Trust, Harry's Rainbow test charity, 10 tests incorporating Idlewild lessons                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 1.1     | 2026-07-04 | Rapidglobe Ltd | Fixed step-ordering defect (same as MKCF plan, 2026-07-03): ABC-03 previously bundled AI summary generation with clicking past Step 3 into Step 4 and starting the checklist/writing flow, so ABC-04/ABC-05's content review nominally ran after the summary was no longer visible. Split the Step 4 navigation out of ABC-03 into a new ABC-06 ("Preparation Checklist and Start Writing"), which now runs after ABC-04/ABC-05. Old ABC-06–10 renumbered to ABC-07–11; now 11 test cases total.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 1.2     | 2026-07-04 | Rapidglobe Ltd | Corrected against the current service and `grant-pathway-user-guide-v1_15.docx`, following live execution of ABC-01/ABC-02 and cross-checking in parallel with Clothworkers. Fixed a formatting error from a prior edit that had accidentally deleted the "### ABC-02" heading and section divider. ABC-01: updated verification flow for D-012 (2026-07-02) — auto-confirm + **Sign in**, not "Go to my dashboard"; corrected "Who do you help" to the actual field label "Who does your charity help?" (`grant-pathway-user-guide-v1_15.docx` p.19); removed the unsourced "Dashboard shows profile complete — Start button enabled" bullet. ABC-02: empty-state dashboard button is **Start your first application**, not **+ New Application**, for this freshly registered account; removed the "Application created and dashboard updated" bullet (Continue lands on Step 2, not the dashboard, at this point); corrected the "My funder isn't listed" bullet to the actual copy ("Can't find your funder? Request it to be added..."). ABC-03: removed a stray "Open the application from the dashboard" step that didn't follow from ABC-02; removed "select Upload a file" / "click Generate summary" wording — no such toggle or button exists, and the AI summary auto-generates on page load. ABC-10/ABC-11 rewritten to match the current merged approve+download flow (2026-06-12, D-WF-04) and the "Before we put it together" senior review screen; ABC-11 now also covers the re-export warning dialog and the plain-text export, matching IT-MKCF-13's current template. ABC-01/ABC-02 results retained as Pass (confirmed live against the corrected flow, 2026-07-04); ABC-03 onward cleared for a clean re-run. |
