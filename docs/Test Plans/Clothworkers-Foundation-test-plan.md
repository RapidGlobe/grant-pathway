# Clothworkers' Foundation Test Plan — Small Grants Programme

**Version:** 1.6
**Date:** 2026-07-04
**Status:** Ready for a full clean execution. All outstanding TODOs from v1.5 applied — see Document History. All results below have been cleared; retest from IT-CW-01.
**Tester:** WJ
**Test account:** grantpathway+cloth1@gmail.com

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using The Clothworkers' Foundation Open Grants Programme (Small Grants, up to £15,000) as the target funder.

Clothworkers publishes a sample application form with discrete, numbered questions. Their Small Grants form uses **word limits** with an "approx. X words" format (not exact limits), and contains a significant number of non-narrative questions (dropdowns, numbers, percentages, yes/no, file uploads). These make Clothworkers the primary test case for "approx." word limit extraction (GAP-27 variant) and non-narrative question filtering (GAP-28).

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

| Ref                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GAP-27 variant                    | Clothworkers uses "approx. X words" format (not exact word counts). Observe whether the AI extracts these as word limits and what value it records (e.g., "approx. 250 words" → 250 words).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| GAP-28                            | Non-narrative questions (religion affiliation yes/no, Living Wage accredited yes/no, programme area multi-select, percentage fields for lived experience, income/expenditure numbers, file uploads for accounts and project budget, project type dropdown, marketing consent yes/no) may appear as text areas. Observe and record.                                                                                                                                                                                                                                                                                                                                                                                                               |
| Test order                        | IT-CW-04 (eligibility check) and IT-CW-05 (content accuracy) must run **before** IT-CW-06 (preparation checklist/start writing) — clicking "start writing" navigates past Step 3, so the AI summary is no longer available to review afterwards. Same defect found and fixed in the MKCF plan (2026-07-03); fixed here by splitting the Step 4 navigation out of IT-CW-03 into its own IT-CW-06, renumbering old IT-CW-06–10 to IT-CW-07–11.                                                                                                                                                                                                                                                                                                     |
| Large-document truncation warning | Confirmed live 2026-07-04 (IT-CW-03): a yellow warning banner appears on Step 3 — "Your guidelines document is very large and was partially summarised. The AI reviewed the first section of the document. If key questions or eligibility criteria appear near the end of the document, consider pasting the most relevant sections as text instead." This is expected, designed behaviour, not a defect — the Clothworkers guidance PDF is large (1.1MB, ~30 pages) and previously required a raised preprocessing ceiling to extract questions correctly (see v1.2, PREPROCESS_CHAR_CEILING). Given the warning appeared, double-check in IT-CW-05/IT-CW-07 that no key content or questions were missed from later sections of the document. |

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

| Test ID  | Test Name                                                       | Clothworkers-Specific | AI Summary Time | Result | Notes |
| -------- | --------------------------------------------------------------- | --------------------- | --------------- | ------ | ----- |
| IT-CW-01 | Account registration and charity profile                        | No                    | N/A             |        |       |
| IT-CW-02 | Clothworkers' Foundation funder picker                          | Yes                   | N/A             |        |       |
| IT-CW-03 | PDF upload and AI summary                                       | Yes                   |                 |        |       |
| IT-CW-04 | Eligibility check — Bridge Support MK passes                    | Yes                   | N/A             |        |       |
| IT-CW-05 | AI summary content accuracy                                     | Yes                   | N/A             |        |       |
| IT-CW-06 | Preparation checklist and start writing                         | Yes                   | N/A             |        |       |
| IT-CW-07 | Narrative question extraction with "approx." word limits        | Yes                   | N/A             |        |       |
| IT-CW-08 | Budget question flagging and non-narrative question absence     | Yes                   | N/A             |        |       |
| IT-CW-09 | Narrative answer writing and AI assist                          | No                    | N/A             |        |       |
| IT-CW-10 | Answer approval and assembly                                    | No                    | N/A             |        |       |
| IT-CW-11 | Word document export; Word document verified; re-export warning | No                    | N/A             |        |       |

---

## Defect Log

| ID       | Test     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Severity | Status                            |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------- |
| D-CW-01  | IT-CW-08 | AI assist ("Help me improve this") not disabled when answer exceeded the word limit. Client-side `isOver` flag was not reliably preventing the button click due to React rendering timing. Server-side word limit guard added to `/api/refine-answer`; client-side early-return guard added to `handleRefine`. Both layers now enforce the word limit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Medium   | Fixed                             |
| D-CWF-01 | IT-CW-06 | Question 1 ("Please provide further information about your organisation's religious affiliation…") extracted as a standard writing card. This is a conditional question that only applies to faith-based organisations. The existing conditional question exclusion rule in `lib/prompts.ts` targets project-type conditionals ("only required if applying for a vehicle") — it does not detect faith-affiliation conditionals. Non-faith organisations see this as a mandatory writing card with no guidance that it is optional. Fixed (2026-06-05): FAITH AND RELIGION QUESTIONS rule added to `lib/prompts.ts` — questions asking primarily about religious affiliation, the role of faith in activities, or faith requirements for staff/trustees are now excluded as inherently conditional. Verified (2026-06-07): retest confirms faith affiliation question no longer appears — 8 questions extracted, none relating to faith or religion.                                                                                                                                                                                                                                                                                                                   | Medium   | Fixed — verified                  |
| D-CW-02  | IT-CW-09 | AI assist ("Help me improve this") on an over-limit answer did not reliably compress the answer to fit. A 344-word answer against a 250-word limit (38% over) was returned by AI assist almost completely unchanged — no words removed. A smaller earlier case (60 words against a 50-word limit, 20% over) was partially compressed but still left over. Root cause: `buildRefinePrompt` in `lib/prompts.ts` told the model both "must not exceed N words" and "do not change facts... the claims being made," with no instruction on how to actually cut length — the model appears to have prioritised preserving all content over meeting the limit, more so as the excess grew. Fixed (2026-07-04): prompt now detects when the answer is already over the limit and adds an explicit hard-requirement instruction to cut less essential detail, combine sentences, and remove repetition/examples; the "don't change facts" instruction now explicitly scopes to facts that are _kept_, and explicitly permits omitting less essential detail to meet the limit. Verified: `npx tsc --noEmit` clean, existing `__tests__/prompts.test.ts` (9 tests) and full suite (24 tests) pass. **Not yet re-verified live** — pending WJ's next over-limit AI assist test. | High     | Fixed — pending live verification |

---

## Test Cases

---

### IT-CW-01 — Account Registration and Charity Profile

**Clothworkers-specific:** No
**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Register**
3. Enter first name, last name, email `grantpathway+cloth1@gmail.com`, password (12+ characters, must include letters and digits), accept Terms and Privacy Policy
4. Click **Create account**
5. Open the verification email and click the verification link — this auto-confirms on page load (no button click required) and expires after 1 hour (D-012, 2026-07-02)
6. On the "Email verified" screen, click **Sign in** and enter the registered email and password (the verification flow signs the session out — this is a normal credentials sign-in, not an automatic redirect to the dashboard)
7. Click **Charity Profile** in the navigation
8. Enter charity registration number field — leave blank (fictional charity)
9. Complete all fields manually:
   - Charity name: Bridge Support MK
   - What does your charity do: Bridge Support MK provides practical support, food, and emergency resources to young people aged 16–25 facing economic disadvantage and homelessness risk in Milton Keynes, including a drop-in centre, digital skills workshops, and employment support
   - Who does your charity help: Young people aged 16–25 at risk of homelessness or in economic hardship in Milton Keynes
   - Where do you work: Milton Keynes
10. Click **Save**

**Expected result:**

- Account created and email verified without errors
- Sign-in with credentials succeeds
- Profile saves successfully with all fields populated

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-02 — Clothworkers' Foundation Funder Picker

**Clothworkers-specific:** Yes — verifies Clothworkers' Foundation appears in the approved funder directory
**Prerequisite:** IT-CW-01 complete

**Steps:**

1. From the dashboard, click **Start your first application** — this is a brand-new account with zero applications, so the dashboard shows this empty-state button rather than the **+ New Application** button that appears once at least one application already exists
2. On Step 1 (Application Details), click into the funder picker field
3. Type **"Clothworkers"**
4. Observe the filtered dropdown list
5. Confirm **The Clothworkers' Foundation** appears in the dropdown
6. Select **The Clothworkers' Foundation**
7. Enter grant name: **"Open Grants Programme — Small Grant 2026"**
8. Click **Continue**

**Expected result:**

- "Clothworkers" search returns The Clothworkers' Foundation in the dropdown
- Application created and Step 2 (Uploaded Guidelines) displayed

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-03 — PDF Upload and AI Summary

**Clothworkers-specific:** Yes — tests the full guidance document (including sample form) as the guidelines source; also verifies no mismatch is triggered for Bridge Support MK
**Prerequisite:** IT-CW-02 complete

**Steps:**

1. On Step 2, upload `clothworkers-open-grants-guidance-and-sample-forms.pdf`
2. Confirm the file is accepted (name displayed, no error)
3. Click **Continue**
4. On Step 3, start a stopwatch — AI summary auto-generates on page load
5. Stop when summary cards appear — record the time
6. Review the generated AI summary
7. Confirm **no red eligibility mismatch warning** appears — Bridge Support MK should be eligible

**Do not click Continue yet** — the eligibility check (IT-CW-04) and content-accuracy review (IT-CW-05) both need the AI summary visible on Step 3. Continuing to Step 4 happens in IT-CW-06, after both reviews are complete.

**Expected result:**

- PDF uploads successfully (no format or size error — note: this is a large PDF at 1.1MB)
- AI summary generates without error
- **No eligibility mismatch warning** — Bridge Support MK qualifies under Young People Facing Disadvantage and Economic Disadvantage
- Summary cards displayed (about the grant, grant amount, who can apply, what funder is looking for, questions, key requirements)
- A large-document truncation warning may appear (expected — see Known Expected Behaviours); if so, note it and double-check in IT-CW-05/IT-CW-07 that no content from later in the document was missed

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-04 — Eligibility Check — Bridge Support MK Passes

**Clothworkers-specific:** Yes — verifies FR-47 does not incorrectly flag Bridge Support MK as ineligible
**Prerequisite:** IT-CW-03 complete. Review this **before** continuing past Step 3 — the summary is no longer easily visible once you proceed to Step 4 and start writing (see IT-CW-06).

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
**Prerequisite:** IT-CW-03 complete. Review this **before** continuing past Step 3 — the summary is no longer easily visible once you proceed to Step 4 and start writing (see IT-CW-06).

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

**Observation (not a defect, 2026-07-04):** The 10 programme areas are not surfaced as their own labelled section/card — they're folded into the third bullet of "What the funder is looking for" ("Projects supporting communities experiencing racial inequalities, disabled people, domestic and sexual abuse survivors, economic disadvantage, homelessness, LGBT+ communities, older people, prison and rehabilitation, substance misuse, or young people facing disadvantage"). All 10 are present and accurate (confirmed exactly 10 items, including both of Bridge Support MK's programme areas), satisfying "listed or summarised" as worded — but it's easy to miss on a skim since there's no dedicated heading.

**Enhancement (not a defect, 2026-07-04):** "Income eligibility: under £2 million" appears in the "Who can apply" bullets ("Organisations with annual income of £2 million or less (Small Grants) or under £10 million (Large Grants)") with the same visual weight as every other bullet — no bold, no distinct styling — despite being a hard eligibility cutoff. Same underlying issue as the 20% match requirement flagged on IT-MKCF-07 (MKCF plan) — treat as one recurring pattern, not two separate enhancements: hard eligibility/financial thresholds aren't visually distinguished from softer, descriptive content in the AI summary. Reinforces the case for a general design pattern (DDR) covering all funder-specific "hard conditions," rather than a one-off fix per funder.

---

### IT-CW-06 — Preparation Checklist and Start Writing

**Clothworkers-specific:** Yes
**Prerequisite:** IT-CW-05 complete (eligibility and AI summary content reviewed while still on Step 3)

**Steps:**

1. Click **Continue** to proceed to Step 4
2. Confirm the **"Before you begin writing"** preparation checklist screen appears
3. Click **"I have what I need — start writing"**

**Expected result:**

- Preparation checklist screen appears on clicking Continue
- Q&A interface loads

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-07 — Narrative Question Extraction with "Approx." Word Limits

**Clothworkers-specific:** Yes — GAP-27 variant: Clothworkers uses "approx. X words" not exact word counts
**Prerequisite:** IT-CW-06 complete

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

### IT-CW-08 — Budget Question Flagging and Non-Narrative Question Absence

**Clothworkers-specific:** Yes — GAP-28: Clothworkers has a high proportion of non-narrative questions
**Prerequisite:** IT-CW-06 complete

**Rewritten 2026-07-04** — the previous version of this test case asked the tester to "record how Grant Pathway displays" each non-narrative question type, which doesn't fit the actual behaviour: these types are filtered out entirely at AI extraction and never reach Step 4 in any form (not pre-filled, not shown as a reminder). This is confirmed, current, deliberate behaviour — not a defect — though it falls short of the originally-decided BD-03 pre-fill/reminder mechanism, which remains an **open product decision** (see `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-v0.5.md`, Section 10, BD-03 note). This test now verifies the current behaviour is at least consistent (non-narrative absent, budget questions correctly flagged), rather than testing for a display mechanism that doesn't exist.

**Non-narrative questions present in the Clothworkers Small Grants form (for reference — expected to be entirely absent from Step 4):**

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

1. On Step 4, review the full list of displayed question cards
2. Confirm **none** of the 18 non-narrative question types listed above appear anywhere at Step 4 — not as a writing card, not pre-filled, not as a read-only reminder
3. Confirm budget questions (financial position, financial difficulties) **do** appear as ordinary writing cards, visually flagged amber, with AI assist disabled and a word limit shown

**Expected result:**

- None of the 18 listed non-narrative question types appear at Step 4 in any form
- Budget questions appear as writing cards (not pre-filled), flagged amber, with AI assist disabled

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-09 — Narrative Answer Writing and AI Assist

**Clothworkers-specific:** No
**Prerequisite:** IT-CW-07 complete (questions visible)

**Steps:**

1. Navigate to **Q2 — Briefly summarise the work of your organisation** (approx. 200 words)
2. Write an answer describing Bridge Support MK's work (approx. 150 characters to start)
3. Observe the word counter updating in real time
4. Click **Help me improve this**
5. Review the AI-refined answer — verify it does not add invented facts
6. Review the three mandatory confirmation prompts
7. Click **Approve**
8. Navigate to **Q8 — Please describe your project** (approx. 250 words)
9. Write a short answer describing the laptop/tablet purchase for the digital skills centre
10. Click **Help me improve this**, review, and approve

**Expected result:**

- Word counter updates in real time
- Counter shows "X / 200 words" for Q2 and "X / 250 words" for Q8
- AI assist returns a refined answer without adding new facts
- Mandatory review prompts displayed before approval
- Approved answers visually marked
- No data loss when navigating between questions

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-10 — Answer Approval and Assembly

**Clothworkers-specific:** No
**Prerequisite:** IT-CW-09 complete (Q2 and Q8 approved)

**Steps:**

1. Approve all remaining mandatory question cards (Q2 and Q8 already approved in IT-CW-09)
2. Verify the progress bar shows all questions approved
3. Click **Ready to assemble**
4. Verify the **"Before we put it together"** senior review screen appears, confirming the financial content has been reviewed by a senior colleague
5. Click **Yes — assemble my draft**
6. On Step 5, verify:
   - Correct funder (The Clothworkers' Foundation) and grant name ("Open Grants Programme — Small Grant 2026") displayed
   - All approved answers shown in read-only view

**Expected result:**

- Ready to assemble button enabled once all answers are approved
- Senior review confirmation screen appears before assembly
- Assembly completes correctly
- Step 5 displays correct funder and grant name

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-CW-11 — Word Document Export; Word Document Verified; Re-export Warning

**Clothworkers-specific:** No
**Prerequisite:** IT-CW-10 complete

**Steps:**

1. Tick all three review checkboxes on Step 5
2. Click **Download as Word document (.docx)** — this both approves and downloads in one action (no separate Approve button/modal since 2026-06-12); confirm a persistent "Application approved" banner replaces the checklist
3. Open the downloaded .docx file and verify:
   - Title: **"Open Grants Programme — Small Grant 2026"**
   - Funder: **"The Clothworkers' Foundation"** (or similar)
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
- Only approved answers are included; word limits are not shown in the exported document
- Re-export warning shows the prior export timestamp on both the second Word download and the plain-text download
- Plain text download works
- Document is clean and readable

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-02 | Rapidglobe Ltd | Initial test plan — Clothworkers' Foundation Small Grants Programme, Bridge Support MK test charity, 10 test cases including GAP-27 ("approx." word limit) and GAP-28 observations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 1.1     | 2026-06-02 | Rapidglobe Ltd | All 10 tests completed — 10/10 Pass. D-CW-01 found and fixed during test. Defect log, results, and observations recorded.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.2     | 2026-06-05 | Rapidglobe Ltd | ADR-AI-010 performance retest. Initial ceiling of 20,000 chars truncated 97,906-char PDF — questions not extracted (0/9). Ceiling raised to 50,000 via PREPROCESS_CHAR_CEILING env var. Second run: 30s, 9 questions extracted correctly. D-CWF-01 added: faith affiliation conditional question (Q1) appears as standard writing card for all charities.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.3     | 2026-06-07 | Rapidglobe Ltd | D-CWF-01 retest verified. Faith/religion question no longer extracted — 8 questions confirmed. Expected questions table updated to reflect verified output. IT-CW-06 expected result updated. D-CWF-01 status updated to Fixed — verified.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.4     | 2026-07-04 | Rapidglobe Ltd | Fixed step-ordering defect (same as MKCF plan, 2026-07-03): IT-CW-03 previously bundled AI summary generation with clicking past Step 3 into Step 4 and starting the checklist/writing flow, so IT-CW-04/IT-CW-05's content review nominally ran after the summary was no longer visible. Split the Step 4 navigation out of IT-CW-03 into a new IT-CW-06 ("Preparation Checklist and Start Writing"), which now runs after IT-CW-04/IT-CW-05. Old IT-CW-06–10 renumbered to IT-CW-07–11; now 11 test cases total.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 1.5     | 2026-07-04 | Rapidglobe Ltd | Corrected against the current service and `grant-pathway-user-guide-v1_15.docx`, found while cross-checking test plans in parallel with live MKCF/ABC testing. IT-CW-01: updated verification flow for D-012 (2026-07-02) — link now auto-confirms passively, "Email verified" screen button is now **Sign in** (normal credentials sign-in), not **Go to my dashboard**; removed the unsourced "Dashboard shows profile complete — Start button enabled" bullet. IT-CW-02: empty-state dashboard button is **Start your first application**, not **+ New Application**, for this freshly registered account; corrected the post-Continue expected result to Step 2 display rather than "visible on the dashboard". IT-CW-03: removed a stray "Open the application from the dashboard" step that didn't follow from IT-CW-02 (Continue already lands on Step 2); removed "select Upload a file" / "click Generate summary" wording — the guidelines screen has no such toggle or button, and the AI summary auto-generates on page load. IT-CW-10/IT-CW-11 rewritten: the old IT-CW-10 described a separate "Approve my application" button and confirmation modal that no longer exist since the 2026-06-12 approve+download merge (D-WF-04) — IT-CW-10 now covers approval and assembly only (including the previously-missing "Before we put it together" senior review screen, per the user guide's Section 8), and IT-CW-11 covers the merged tick-and-download approval, Word export verification (timestamp, footer, page numbering), the re-export warning dialog, and the plain-text export, matching IT-MKCF-13's current template. Results cleared; retest from IT-CW-01. |
| 1.6     | 2026-07-04 | Rapidglobe Ltd | Applied the v1.5 TODO batch, ready for tomorrow's full clean retest. IT-CW-01: "Who do you help" corrected to "Who does your charity help" to match the actual UI field label. IT-CW-08 rewritten (renamed "Budget Question Flagging and Non-Narrative Question Absence"): the previous version tested for a non-existent display mechanism (FR-45/BD-03 pre-fill or reminder for non-narrative questions) — now tests the actual, confirmed-current behaviour instead (non-narrative questions entirely absent from Step 4; budget questions correctly flagged amber). The bigger question of whether to build BD-03 as originally decided remains open and is tracked separately in `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-v0.5.md`, Section 10. IT-CW-09/IT-CW-10: corrected "Q9" to "Q8" throughout (only 8 questions exist per IT-CW-07's table). All results cleared for a full clean re-run from IT-CW-01.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
