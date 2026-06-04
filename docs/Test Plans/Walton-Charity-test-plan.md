# Walton Charity — Community Grants Test Plan

**Version:** 1.0
**Date:** 2026-06-04
**Status:** Ready for execution
**Tester:** WJ
**Test accounts:** grantpathway+idle1@gmail.com (Harry's Rainbow — geographic mismatch) · grantpathway+walton1@gmail.com (Elmbridge Families Together — happy path, new account)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the **Walton Charity Community Grants** programme. Walton Charity supports charities and CIOs working to alleviate financial poverty and improve health, wellbeing, and educational outcomes for people in **Elmbridge, Surrey**. Grants range from small awards up to £10,000 (rolling deadline) to larger grants reviewed by a committee on a fixed schedule.

**This test plan runs two accounts in sequence:**

1. **Harry's Rainbow (geographic mismatch test)** — Children's bereavement charity based in Milton Keynes. Walton Charity funds activities within Elmbridge, Surrey only — an absolute geographic restriction. The AI is expected to flag a mismatch. This tests FR-47 (eligibility hard stop) for geographic ineligibility.

2. **Elmbridge Families Together (happy path)** — Fictional financial hardship charity based in Walton-on-Thames, Elmbridge. Clear fit for Walton Charity's priority of poverty alleviation. Tests the full end-to-end flow through to export.

**Guidelines source:** Walton Charity publishes a downloadable **PDF** (Funding Guidelines, Jan 2025). This tests the PDF upload path. Note: the application form itself is online-only and issued after initial enquiry — the guidelines PDF provides eligibility and priority context. The actual application questions with suggested word counts are published on a separate public guidance page. Both sources should be combined in the upload/paste to maximise question extraction.

**AI policy:** No AI policy is published by Walton Charity. The AI summary should flag this absence rather than fabricating a policy.

**Word limits:** Walton Charity describes word counts as **suggestions, not hard limits** ("relevant, clear and somewhat succinct"). Grant Pathway enforces the extracted limits as hard stops (D-LBF-02 fix). This is a known discrepancy — the hard stop is still appropriate as best practice, but the test should note whether the AI labels them as suggested or required.

**Geographic restriction:** Elmbridge, Surrey is an **absolute** requirement. Activities outside Elmbridge are explicitly excluded. This is the primary eligibility disqualifier for Harry's Rainbow.

---

## Pre-Test Setup

### Guidelines file — download before testing
Download the Walton Charity Funding Guidelines PDF:
- URL: https://www.waltoncharity.org.uk/s/Community-Grant-funding-guidelines-Jan-2025-2.pdf
- Save as `docs/Grant Org Guidelines/walton-charity-community-grant-funding-guidelines-jan-2025.pdf`
- This is a PDF file — tests the PDF upload path

**Note on application questions:** The guidelines PDF covers eligibility and priorities. The actual application questions with suggested word counts are published at https://www.waltoncharity.org.uk/education-community-grant-application-guidance. If the AI summary does not extract the application questions from the PDF alone, use the paste option on Step 2 with the combined text from both sources.

### Account 1 — Harry's Rainbow (existing)
- Email: `grantpathway+idle1@gmail.com`
- Profile should be set to the **original** Harry's Rainbow description (children's bereavement charity, Milton Keynes). Revert if modified.

### Account 2 — Elmbridge Families Together (new account to create)
Register `grantpathway+walton1@gmail.com` and set up the following charity profile:

| Field | Value |
|-------|-------|
| First name | Sarah |
| Last name | Okafor |
| Charity name | Elmbridge Families Together |
| Registration number | (leave blank — optional) |
| What does your charity do? | Elmbridge Families Together provides practical support and financial assistance to families in crisis across Elmbridge, Surrey. We run a community pantry in Walton-on-Thames, offer emergency grants to prevent eviction and utility disconnections, and provide one-to-one key worker support to help families access benefits and reduce debt. We work with approximately 200 families per year, the majority of whom have household incomes below the poverty line. |
| Who does your charity help? | Families and individuals experiencing financial hardship in Elmbridge, Surrey, including low-income working families, single parents, and households affected by unemployment, illness or domestic disruption. |
| Where do you work? | Elmbridge, Surrey (primarily Walton-on-Thames, Weybridge, and Hersham) |

---

## Test Data

### Account 1 — Harry's Rainbow (mismatch test)

| Item | Value |
|------|-------|
| Test user email | grantpathway+idle1@gmail.com |
| Charity name | Harry's Rainbow |
| Funder | Walton Charity |
| Grant name | Community Grant — Bereavement Support 2026 |
| Guidelines file | walton-charity-community-grant-funding-guidelines-jan-2025.pdf |
| Expected eligibility outcome | Mismatch (Milton Keynes is outside Elmbridge, Surrey) |

### Account 2 — Elmbridge Families Together (happy path)

| Item | Value |
|------|-------|
| Test user email | grantpathway+walton1@gmail.com |
| Charity name | Elmbridge Families Together |
| Funder | Walton Charity |
| Grant name | Community Pantry and Financial Crisis Support 2026 |
| Grant amount | Up to £10,000 (small grant) |
| Guidelines file | walton-charity-community-grant-funding-guidelines-jan-2025.pdf |
| Guidelines input method | File upload (PDF) |
| Expected eligibility outcome | Pass |

---

## Known Expected Behaviours

| Ref | Description |
|-----|-------------|
| IT-WC-02 | Harry's Rainbow is expected to trigger an eligibility mismatch. Milton Keynes is outside Elmbridge, Surrey — Walton Charity's geographic restriction is absolute. |
| Word limits | Walton Charity describes word counts as suggestions, not hard limits. The app enforces them as hard stops (D-LBF-02). Note whether the AI labels them as "suggested" or "required" in the summary. |
| No AI policy | Walton Charity has no published AI policy. The AI summary should flag this absence rather than fabricating a policy statement. |
| Non-narrative questions | The application includes data fields (Living Wage confirmation, legal status dropdown, registered charity number, financial information). These should be absent from Step 4 writing cards. |
| Application form | Walton Charity's actual application form is online-only, issued after an initial enquiry. The guidelines PDF covers eligibility and priorities. If the PDF alone does not yield application questions, test the paste path using the published guidance text. |
| Optional questions | Q5 (plan to continue beyond the grant period) is phrased as a conditional narrative ("if yes... if no..."). Monitor whether it is treated as optional. |

---

## Expected Narrative Questions (Elmbridge Families Together application)

Questions from the Walton Charity application guidance page (word counts are suggestions):

| # | Question | Suggested word limit |
|---|----------|---------------------|
| Q1 | Tell us about your proposed activities | 500 words |
| Q2 | What difference do you expect to see? | 300 words |
| Q3 | How will you measure these changes? | 300 words |
| Q4 | How will you ensure the successful delivery of your project? | 500 words |
| Q5 | Do you plan to continue the project beyond the period of the grant? | 300 words |

**Note:** The above will be updated after actual AI extraction in IT-WC-06, following the lesson learned from IT-LBF-09 (actual questions differed from anticipated).

**Non-narrative questions expected to be absent from Step 4:**

| Question | Type |
|----------|------|
| How many people from Elmbridge will benefit? | Numeric |
| Does your organisation pay the Real Living Wage? | Yes/No + explanation |
| Are contractual staff paid at least the National Living Wage? | Yes/No |
| Summary of organisational activities | Organisational info |
| Financial review date and controls | Organisational info |
| Confirmation of 3 months' unrestricted expenditure reserves | Confirmation |
| Legal organisational status | Dropdown |
| Registered charity number | Data entry |
| Registered company number | Data entry |

---

## Test Results Summary

| Test ID | Test Name | WC-specific | AI Summary Time | Result | Notes |
|---------|-----------|-------------|----------------|--------|-------|
| IT-WC-01 | Harry's Rainbow sign in and profile verification | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-02 | Harry's Rainbow — Walton Charity funder picker and guidelines upload | Yes | | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-03 | Harry's Rainbow — geographic eligibility mismatch confirmed | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-04 | Elmbridge Families Together account registration and profile setup | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-05 | Elmbridge Families Together — Walton Charity funder picker | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-06 | Elmbridge Families Together — PDF upload and AI summary | Yes | | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-07 | Elmbridge Families Together — eligibility check passes; preparation checklist | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-08 | Elmbridge Families Together — AI summary content accuracy | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-09 | Elmbridge Families Together — narrative question extraction and word limits | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-10 | Elmbridge Families Together — non-narrative question handling; optional question behaviour | Yes | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-11 | Elmbridge Families Together — narrative answer writing and AI assist | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-12 | Elmbridge Families Together — answer approval and Step 5 navigation | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-WC-13 | Elmbridge Families Together — export; timestamp in doc; re-export warning | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |

---

## Defect Log

| ID | Test | Description | Severity | Status |
|----|------|-------------|----------|--------|

---

## Test Cases

---

### IT-WC-01 — Harry's Rainbow Sign In and Profile Verification

**WC-specific:** No
**Prerequisite:** None

**Steps:**
1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Sign in as `grantpathway+idle1@gmail.com`
3. Navigate to **Charity Profile** and verify the profile reads:
   - Charity name: Harry's Rainbow
   - What does your charity do: Children's bereavement support, activities, and therapeutic groups for children 0–25 bereaved of a parent or sibling, Milton Keynes and surrounding areas
   - Who do you help: Children, young people and young adults aged 0–25 bereaved of a parent or sibling
   - Where do you work: Milton Keynes and surrounding areas
4. If the profile shows a modified version from previous testing, revert it to the above and save

**Expected result:**
- Sign in succeeds
- Profile shows the original Harry's Rainbow description
- Dashboard accessible

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WC-02 — Harry's Rainbow — Walton Charity Funder Picker and Guidelines Upload

**WC-specific:** Yes — tests geographic eligibility mismatch via PDF upload
**Prerequisite:** IT-WC-01 complete

**Steps:**
1. From the dashboard, click **+ New Application**
2. Type **"Walton"** in the funder picker
3. Confirm **Walton Charity** appears with a **Structured** badge
4. Select **Walton Charity**
5. Enter grant name: **"Community Grant — Bereavement Support 2026"**
6. Click **Continue**
7. On Step 2, upload `walton-charity-community-grant-funding-guidelines-jan-2025.pdf`
8. Confirm file accepted, click **Continue**
9. On Step 3, start a stopwatch — AI summary auto-generates on page load
10. Stop the stopwatch when summary cards appear — record the time
11. Note whether a red eligibility mismatch warning appears

**Expected result:**
- Walton Charity appears in picker with Structured badge
- PDF uploads successfully
- AI summary generates without error

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record summary time and whether mismatch warning appears):**

---

### IT-WC-03 — Harry's Rainbow — Geographic Eligibility Mismatch Confirmed

**WC-specific:** Yes — FR-47 eligibility hard stop for geographic restriction
**Prerequisite:** IT-WC-02 complete

**Steps:**
1. If a red mismatch warning appeared on Step 3, verify it shows:
   - Red warning card with a clear mismatch reason referencing Elmbridge, Surrey
   - "I understand — return to my dashboard" button
2. Click **"I understand — return to my dashboard"**
3. Verify the dashboard shows the application with a red **"Ineligible"** badge and no Continue button

**If no mismatch appeared (unexpected):**
- Record as a defect — Harry's Rainbow (Milton Keynes) is outside Elmbridge
- Note the AI summary content and eligibility criteria shown

**Expected result:**
- Red mismatch warning displayed citing geographic restriction (Elmbridge, Surrey only)
- Application marked Ineligible on dashboard
- FR-47 hard stop confirmed for geographic ineligibility

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record mismatch reason shown by AI):**

---

### IT-WC-04 — Elmbridge Families Together Account Registration and Profile Setup

**WC-specific:** No
**Prerequisite:** IT-WC-03 complete

**Steps:**
1. Sign out of Harry's Rainbow account
2. Register `grantpathway+walton1@gmail.com` (first name Sarah, last name Okafor)
3. Verify the email confirmation and click the verification link
4. On first login, complete the charity profile using the Elmbridge Families Together values in the Pre-Test Setup table above
5. Leave registration number blank (optional field)
6. Save the profile and confirm redirect to dashboard

**Expected result:**
- Registration and email verification completes without error
- Charity profile saves successfully
- Dashboard shows profile complete

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WC-05 — Elmbridge Families Together — Walton Charity Funder Picker

**WC-specific:** Yes
**Prerequisite:** IT-WC-04 complete

**Steps:**
1. From the dashboard, click **+ New Application**
2. Type **"Walton"** in the funder picker
3. Confirm **Walton Charity** appears with a **Structured** badge
4. Select **Walton Charity**
5. Enter grant name: **"Community Pantry and Financial Crisis Support 2026"**
6. Click **Continue**

**Expected result:**
- Walton Charity appears with Structured badge
- Application created and Step 2 displayed

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WC-06 — Elmbridge Families Together — PDF Upload and AI Summary

**WC-specific:** Yes — tests PDF upload path with Walton Charity guidelines
**Prerequisite:** IT-WC-05 complete

**Steps:**
1. On Step 2, upload `walton-charity-community-grant-funding-guidelines-jan-2025.pdf`
2. Confirm the file is accepted
3. Click **Continue**
4. On Step 3, start a stopwatch — summary auto-generates on page load
5. Stop the stopwatch when summary cards appear — record the time
6. Review all summary cards displayed
7. Check whether application questions with word limits have been extracted
8. **If no questions extracted from PDF alone:** go back to Step 2 and switch to paste mode; paste the combined text from the guidelines PDF and the application guidance page (https://www.waltoncharity.org.uk/education-community-grant-application-guidance). Regenerate summary and note which input method yielded question extraction.
9. Note whether a red eligibility mismatch warning appears
10. Click **Continue**

**Expected result:**
- PDF uploads successfully
- AI summary generates within 30 seconds (NFR-01)
- Summary reflects Elmbridge, Surrey geographic restriction, poverty alleviation priorities, and small grants programme
- Elmbridge Families Together should pass eligibility

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record summary time, input method used, and whether questions were extracted):**

---

### IT-WC-07 — Elmbridge Families Together — Eligibility Check Passes; Preparation Checklist

**WC-specific:** Yes
**Prerequisite:** IT-WC-06 complete

**Steps:**
1. If normal summary cards appeared and Continue was possible — confirm eligibility passed
2. Verify the **"Before you begin writing"** preparation checklist appears correctly
3. Click **"I have what I need — start writing"**

**Expected result:**
- Elmbridge Families Together passes eligibility — financial hardship in Elmbridge is a clear fit
- Preparation checklist displays correctly
- "I have what I need — start writing" navigates to Step 4

**If mismatch appears (unexpected):**
- Record the mismatch reason as a defect and investigate before proceeding

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which branch taken):**

---

### IT-WC-08 — Elmbridge Families Together — AI Summary Content Accuracy

**WC-specific:** Yes
**Prerequisite:** IT-WC-06 complete

**Verify the summary includes:**
- Geographic restriction: Elmbridge, Surrey only
- Focus areas: financial poverty alleviation, health and wellbeing, mental health, educational attainment
- Grant size: up to £10,000 for small grants; larger grants reviewed by committee
- Key exclusions: activities outside Elmbridge; organisations with core mission unrelated to poverty alleviation; religious advancement; retrospective funding
- Income requirement: under £200,000 for small grants; under £5 million overall
- Reserves guidance: unrestricted reserves between 3 and 12 months
- AI policy: flagged as not published / not stated (not fabricated)
- Word limits noted as suggested, not hard limits (if extractable)

**Expected result:**
- Summary accurately reflects Walton Charity Community Grants criteria
- No hallucinated conditions
- AI policy absence handled gracefully

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WC-09 — Elmbridge Families Together — Narrative Question Extraction and Word Limits

**WC-specific:** Yes
**Prerequisite:** IT-WC-06 complete; preparation checklist confirmed

**Steps:**
1. On Step 4, record the total number of question/section cards displayed
2. For each card, record: question text and displayed word limit
3. Verify the following key narrative questions appear with correct limits (update table with actual observed values):

| Expected question | Expected word limit | Actual limit | Present? |
|-------------------|--------------------|--------------| ---------|
| Tell us about your proposed activities | 500 words | | |
| What difference do you expect to see? | 300 words | | |
| How will you measure these changes? | 300 words | | |
| How will you ensure successful delivery? | 500 words | | |
| Do you plan to continue beyond the grant period? | 300 words | | |

4. Note: word limits are "suggested" by Walton Charity — verify whether the app labels them as suggested or required
5. If no questions were extracted (PDF path only), record this and note which questions the AI invented or omitted

**Expected result:**
- Narrative questions extracted with correct suggested word limits (300/500 words)
- Mix of 300 and 500-word limits handled correctly
- If questions missing — record as observation and note input method used

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record all questions and limits as observed):**

---

### IT-WC-10 — Elmbridge Families Together — Non-Narrative Question Handling; Optional Question Behaviour

**WC-specific:** Yes
**Prerequisite:** IT-WC-06 complete

**Steps:**
1. Review Step 4 — confirm data-entry, dropdown, and Yes/No fields from the non-narrative list above are absent as writing cards
2. Confirm Living Wage confirmation (Yes/No), legal status dropdown, registered charity number, and financial fields are absent
3. Check Q5 ("Do you plan to continue the project beyond the period of the grant?") — note whether it is treated as optional and whether the approve section appears when empty
4. Verify "Ready to assemble" is not blocked by any unapproved optional question (D-LBF-01/03 fix)

**Expected result:**
- Non-narrative fields absent from Step 4
- Optional questions (if any) show approve button when empty
- Assembly gate not blocked by unanswered optional questions

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WC-11 — Elmbridge Families Together — Narrative Answer Writing and AI Assist

**WC-specific:** No
**Prerequisite:** IT-WC-09 complete

**Steps:**
1. Navigate to **Q1 — Tell us about your proposed activities** (500 words)
2. Write an answer about Elmbridge Families Together — community pantry in Walton-on-Thames, emergency grants, key worker support, 200 families per year
3. Verify counter shows "X / 500 words"
4. Click **Help me improve this** — verify the refined answer:
   - Corrects spelling/grammar
   - Stays within 500 words
   - Does not add invented facts
5. Use the refined version and approve
6. Navigate to **Q2 — What difference do you expect to see?** (300 words)
7. Write a short answer about measurable outcomes for families (reduced evictions, reduced debt, improved financial stability)
8. Approve without AI assist (tests user-authored path on a 300-word field)
9. **Over-limit hard stop test:** On any 300-word question, paste text exceeding 300 words — verify approve button disappears and red message appears (D-LBF-02 fix)
10. Trim or use AI assist to bring within limit — verify approve button reappears
11. Approve all remaining mandatory questions

**Expected result:**
- Word counters correct for 300 and 500-word fields
- AI assist works on 500-word field
- Hard stop confirmed for over-limit text (D-LBF-02)
- All approval prompts displayed before each approval

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WC-12 — Elmbridge Families Together — Answer Approval and Step 5 Navigation

**WC-specific:** No
**Prerequisite:** IT-WC-11 complete

**Steps:**
1. Approve all mandatory question cards
2. Verify the progress bar reaches "Ready to assemble"
3. Click **Ready to assemble**
4. Verify the **"Before we put it together"** senior review screen appears
5. Click **Yes — assemble my draft**
6. On Step 5, verify:
   - Correct funder (Walton Charity) and grant name displayed
   - All approved answers shown in read-only view
7. Tick all three review checkboxes and click **Approve my application**
8. Confirm the approval modal shows correct application details

**Expected result:**
- Assembly and approval flow completes correctly
- Step 5 content correct for Walton Charity

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-WC-13 — Elmbridge Families Together — Export; Timestamp; Re-export Warning

**WC-specific:** No
**Prerequisite:** IT-WC-12 complete

**Steps:**
1. Click **Export as Word document**
2. Open the downloaded .docx file and verify:
   - Title: **"Community Pantry and Financial Crisis Support 2026"**
   - Funder: **"Walton Charity"**
   - Export date includes time — e.g. **"04 June 2026, 10:30"** (D-WF-05 fix)
   - AI disclaimer present and correctly worded
   - All approved answers present
3. Click **Export as Word document** again
4. Verify the **re-export warning dialog** appears showing the prior export timestamp with HH:MM (D-LBF-04 fix)
5. Cancel — do not re-export
6. Click **Download as plain text (.txt)**
7. Verify the re-export dialog appears (expected — any prior export triggers this)
8. Confirm and verify a .txt file is downloaded with correct content (D-LBF-05 fix)

**Expected result:**
- Export date includes HH:MM timestamp ✅ (D-WF-05)
- Re-export warning shows full timestamp with time ✅ (D-LBF-04)
- Plain text download delivers a file ✅ (D-LBF-05)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record export timestamps):**

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-06-04 | Rapidglobe Ltd | Initial test plan — Walton Charity Community Grants. Two test accounts: Harry's Rainbow (geographic mismatch — Milton Keynes outside Elmbridge) and Elmbridge Families Together (happy path, poverty alleviation charity in Walton-on-Thames). 13 test cases. Notes: word limits are suggested not hard; no AI policy published; application form is online-only (issued after enquiry). All lessons from LBF cycle incorporated. |
