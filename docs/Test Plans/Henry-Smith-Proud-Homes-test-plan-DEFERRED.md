# Henry Smith Foundation — Proud Homes Fund Test Plan

**Version:** 1.0
**Date:** 2026-06-02
**Status:** Ready for execution
**Tester:** WJ
**Test account:** grantpathway+hsf1@gmail.com

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the Henry Smith Foundation **Proud Homes Fund** as the target funder. Proud Homes provides multi-year development grants to generalist homelessness organisations to embed safe, inclusive practice for LGBT+ young people aged 16–25.

This test uses the **Full Application form** (Stage 2 — invited applicants only) as the guidelines document. The Full Application has 8 narrative questions all with explicit **300-word limits** (one conditional question at 500 words), making this the primary test for exact word limit extraction with non-"approx." format.

Henry Smith Foundation has a published AI policy statement — this is a key test for `funderAiPolicy` banner display on Step 3.

**Test coverage principle:** Every test plan covers the complete end-to-end flow — registration, profile, funder selection, guidelines upload, AI summary, preparation checklist, Q&A writing, and export.

---

## Test Data

| Item | Value |
|------|-------|
| Test user email | grantpathway+hsf1@gmail.com |
| Test user password | (set by tester at registration) |
| Charity name | Rainbow Steps MK |
| Charity registration number | None — fictional charity, use manual entry |
| Charity type | UK Registered Charity (fictional) |
| Charity focus | Generalist homelessness support for young people aged 16–25 in Milton Keynes, providing housing advice, emergency accommodation referrals, and drop-in support, with a strong commitment to inclusive practice for LGBT+ young people |
| Who they help | Young people aged 16–25 facing or at risk of homelessness in Milton Keynes, including LGBT+ young people |
| Where they work | Milton Keynes |
| Annual income | £420,000 |
| Funder | Henry Smith Foundation |
| Grant programme | Proud Homes Fund — Full Application 2026 |
| Grant amount | £50,000 per year for 4 years (£200,000 total) |
| Application deadline | 24 July 2026 at 5pm |
| Guidelines file | `docs/Grant Org Guidelines/henry-smith-proud-homes-application-form-sample.docx` |
| Guidelines input method | File upload (DOCX) |

---

## Known Expected Behaviours

| Ref | Description |
|-----|-------------|
| GAP-28 | Non-narrative questions (staff numbers, volunteer numbers, file uploads for income projection and budget, dropdown for safeguarding statements, yes/no for Development Grant, time to complete, data protection checkboxes) may appear as text areas. Observe and record. |
| Conditional Q2.8 | Q2.8 is conditional on whether the organisation is a Development Grant or Established Practice grant. The updated prompt should exclude this conditional question from extraction. Observe whether it appears. |

---

## Expected Narrative Questions

The following narrative questions should be extracted from the Full Application form. All limits are exact word counts (not "approx.").

| # | Question (abbreviated) | Word limit |
|---|------------------------|------------|
| 2.1 | How do you know your work is making a difference? | 300 words |
| 2.3 | How do trustees and senior leadership support and oversee the work? | 300 words |
| 2.4 | How do you review, reflect upon and embed learning over time? | 300 words |
| 2.5 | How are inclusive practices embedded in the day-to-day work? | 300 words |
| 2.6 | What does effective partnership work look like for you? | 300 words |
| 2.7 | What are you looking to strengthen, and what has led you to prioritise these? | 300 words |
| 2.8 | How do you support and include LGBT+ young people? (conditional) | 500 words |
| 3.2 | Tell us how safeguarding is embedded in your work | 300 words |

**Note:** Q2.8 is conditional (two versions: Development Grant vs Not). The conditional question extraction fix should exclude it, or extract only the universal version.

---

## Test Results Summary

| Test ID | Test Name | HSF-Specific | AI Summary Time | Result | Notes |
|---------|-----------|--------------|-----------------|--------|-------|
| IT-HSF-01 | Account registration and charity profile | No | N/A | | |
| IT-HSF-02 | Henry Smith Foundation funder picker | Yes | N/A | | |
| IT-HSF-03 | DOCX upload, AI summary, prep checklist, and AI policy banner | Yes | TBC | | |
| IT-HSF-04 | Eligibility check — Rainbow Steps MK passes | Yes | N/A | | |
| IT-HSF-05 | AI summary content accuracy | Yes | N/A | | |
| IT-HSF-06 | Narrative question extraction — exact 300-word limits | Yes | N/A | | |
| IT-HSF-07 | Budget and non-narrative question handling | Yes | N/A | | |
| IT-HSF-08 | Narrative answer writing and AI assist | No | N/A | | |
| IT-HSF-09 | Answer approval and Step 5 navigation | No | N/A | | |
| IT-HSF-10 | Word document export — structure and content | No | N/A | | |

---

## Defect Log

| ID | Test | Description | Severity | Status |
|----|------|-------------|----------|--------|

---

## Test Cases

---

### IT-HSF-01 — Account Registration and Charity Profile

**HSF-specific:** No
**Prerequisite:** None

**Steps:**
1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Register**
3. Enter first name, last name, email `grantpathway+hsf1@gmail.com`, password (10+ characters), accept Terms and Privacy Policy
4. Click **Create account**, verify email, click **Go to my dashboard**
5. Click **Charity Profile** and complete manually (fictional charity — no Charity Commission lookup):
   - Charity name: Rainbow Steps MK
   - What does your charity do: Rainbow Steps MK provides generalist homelessness support for young people aged 16–25 in Milton Keynes, including housing advice, emergency accommodation referrals, a drop-in centre, and practical support. We are committed to safe, inclusive and affirming practice for LGBT+ young people and work in partnership with specialist organisations to strengthen support pathways
   - Who do you help: Young people aged 16–25 facing or at risk of homelessness in Milton Keynes, with a particular commitment to supporting LGBT+ young people
   - Where do you work: Milton Keynes
6. Click **Save**

**Expected result:**
- Account created and verified without errors
- Profile saves successfully
- Dashboard shows profile complete — Start button enabled

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-02 — Henry Smith Foundation Funder Picker

**HSF-specific:** Yes — verifies Henry Smith Foundation appears in the approved funder directory
**Prerequisite:** IT-HSF-01 complete

**Steps:**
1. From the dashboard, click **+ New Application**
2. Type **"Henry"** in the funder picker
3. Confirm **Henry Smith Foundation** appears with a **Structured** badge
4. Select **Henry Smith Foundation**
5. Enter grant name: **"Proud Homes Fund — Full Application 2026"**
6. Click **Continue**

**Expected result:**
- Henry Smith Foundation appears in the dropdown with a Structured badge
- Application created and visible on the dashboard

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-03 — DOCX Upload, AI Summary, Prep Checklist, and AI Policy Banner

**HSF-specific:** Yes — tests DOCX upload path with the Full Application form; AI policy banner is a key test for Henry Smith's published AI statement
**Prerequisite:** IT-HSF-02 complete

**Steps:**
1. On Step 2, upload `henry-smith-proud-homes-application-form-sample.docx`
2. Confirm file accepted, click **Continue**
3. Start a stopwatch, click **Generate summary**, stop when summary appears — record time
4. Review summary cards
5. Check for the **blue AI policy banner** — Henry Smith's policy should be extracted and displayed
6. Confirm **no red eligibility mismatch warning** — Rainbow Steps MK should pass
7. Click **Continue** → verify preparation checklist screen appears
8. Click **"I have what I need — start writing"**

**Expected result:**
- DOCX uploads successfully
- AI summary generates without error
- Blue **AI policy banner** appears with Henry Smith's statement about using AI responsibly (something to the effect of: AI welcome, use for structure not content, your own words are important)
- No eligibility mismatch warning
- Preparation checklist appears on clicking Continue

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record AI policy banner text and summary time):**

---

### IT-HSF-04 — Eligibility Check — Rainbow Steps MK Passes

**HSF-specific:** Yes — verifies FR-47 does not incorrectly flag Rainbow Steps MK
**Prerequisite:** IT-HSF-03 complete

**Steps:**
1. Confirm from IT-HSF-03 that no red mismatch warning appeared
2. Review the summary's "Who can apply" section — check that generalist homelessness organisations for young people 16–25 are described
3. Confirm Rainbow Steps MK's profile (homelessness support, LGBT+ inclusive) aligns with these criteria

**Expected result:**
- No eligibility mismatch warning
- Summary correctly describes the eligibility criteria for Proud Homes

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-05 — AI Summary Content Accuracy

**HSF-specific:** Yes
**Prerequisite:** IT-HSF-03 complete

**Verify the summary includes:**
- Programme purpose: embedding inclusive, affirming practice for LGBT+ young people in generalist homelessness services
- Grant amount: £50,000/year for 4 years (£200,000 total)
- Income eligibility: £250,000–£3 million
- Application deadline: 24 July 2026
- Two-stage process (EOI → Full Application)
- Key requirements: generalist homelessness service, demonstrable track record with young people, inclusive practice commitment
- Exclusions: activity outside UK, retrospective projects, religious proselytising

**Expected result:**
- All key content accurately represented
- Grant amount and income threshold correct
- No significant inaccuracies

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-06 — Narrative Question Extraction — Exact 300-Word Limits

**HSF-specific:** Yes — all narrative questions use exact 300-word limits (not "approx."); this is the primary test that GAP-27 works for exact word counts
**Prerequisite:** IT-HSF-03 complete

**Expected questions:**

| Question ref | Abbreviated text | Expected limit |
|-------------|-----------------|---------------|
| 2.1 | How do you know your work is making a difference? | 300 words |
| 2.3 | How do trustees and senior leadership support and oversee the work? | 300 words |
| 2.4 | How do you review, reflect upon and embed learning over time? | 300 words |
| 2.5 | How are inclusive practices embedded in the day-to-day work? | 300 words |
| 2.6 | What does effective partnership work look like for you? | 300 words |
| 2.7 | What are you looking to strengthen and why? | 300 words |
| 3.2 | Tell us how safeguarding is embedded in your work | 300 words |

**Steps:**
1. On Step 4, review all extracted questions
2. Record the number of questions displayed
3. Verify each question counter shows "0 / 300 words"
4. Observe whether Q2.8 (conditional Development Grant question) appears — ideally it should be excluded

**Expected result:**
- 7–8 narrative questions extracted
- All 300-word questions display "0 / 300 words" counter
- Q2.8 conditional question ideally absent (GAP-28 observation if present)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record actual questions and limits shown):**

---

### IT-HSF-07 — Budget and Non-Narrative Question Handling

**HSF-specific:** Yes
**Prerequisite:** IT-HSF-03 complete

**Non-narrative questions in Proud Homes Full Application:**

| Question | Type |
|----------|------|
| Q1.1 — Website URL | Short text / data entry |
| Q1.2 — Number of staff (FTE) | Number |
| Q1.2 — Number of volunteers | Number |
| Q1.3 — Upload Income Projection Form | File upload |
| Q2.2 — How many young people supported annually? | Number |
| Q2.2 — Plans to support more? | Dropdown |
| Q2.8 — Development Grant? | Yes/No |
| Q3.1 — Safeguarding statements | Multi-select dropdown |
| Q4.1 — Total budget | Number |
| Q4.2 — Upload full budget | File upload |
| Q5.1 — Time to complete (hours) | Number |
| Q5.3 — Data protection agreement | Dropdown x2 |

**Steps:**
1. On Step 4, review the full question list
2. For non-narrative questions, record how Grant Pathway displays them
3. Check whether any questions are flagged as budget questions (Q4.1 total budget could be flagged amber)

**Expected result:**
- Non-narrative questions absent from Step 4 or shown as reminders (GAP-28 observation)
- Q4.1 (total budget) possibly flagged amber if extracted

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-08 — Narrative Answer Writing and AI Assist

**HSF-specific:** No
**Prerequisite:** IT-HSF-06 complete

**Steps:**
1. Navigate to **Q2.1 — How do you know your work is making a difference?** (300 words)
2. Write a short answer (approx. 200 words) describing Rainbow Steps MK's impact evidence
3. Verify counter shows "X / 300 words"
4. Click **Help me improve this**
5. Review the refined answer — verify it does not add invented facts
6. Review the three mandatory confirmation prompts
7. Click **Approve**
8. Navigate to **Q3.2 — How is safeguarding embedded in your work?** (300 words)
9. Write a short answer and approve

**Expected result:**
- Counter shows "X / 300 words" — exact limit, no "approx."
- AI assist works and returns a refined answer
- Mandatory review prompts displayed
- Approved answers visually marked

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-09 — Answer Approval and Step 5 Navigation

**HSF-specific:** No
**Prerequisite:** IT-HSF-08 complete (at least Q2.1 and Q3.2 approved)

**Steps:**
1. Ensure all questions answered and approved
2. Click **Ready to assemble**
3. Proceed through assembly to Step 5
4. Tick all three review checkboxes
5. Click **Approve my application** and confirm the modal

**Expected result:**
- Ready to assemble enabled after all questions approved
- Assembly completes without error
- Application approved at Step 5

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-10 — Word Document Export — Structure and Content

**HSF-specific:** No
**Prerequisite:** IT-HSF-09 complete

**Steps:**
1. Click **Export as Word document**
2. Open the downloaded .docx file and review

**Expected result:**
- Document title: **"Proud Homes Fund — Full Application 2026"**
- Funder: **"Henry Smith Foundation"**
- Export date, AI disclaimer, Q&A body, footer ✅
- Only approved answers included
- Word limits not shown as separate badges in export

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-06-02 | Rapidglobe Ltd | Initial test plan — Henry Smith Foundation Proud Homes Fund, Rainbow Steps MK test charity, 10 test cases including AI policy banner test and exact 300-word limit extraction |
