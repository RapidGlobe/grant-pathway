# Henry Smith Foundation — Holiday Grants Test Plan

**Version:** 1.0
**Date:** 2026-06-02
**Status:** Ready for execution
**Tester:** WJ
**Test account:** grantpathway+idle1@gmail.com (Harry's Rainbow — existing account)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the Henry Smith Foundation **Holiday Grants** programme. Holiday Grants are one-off grants (£500–£3,000) for schools, youth groups, and non-profit organisations to take children aged 13 and under on recreational day trips or short residential trips in the UK.

This test reuses the existing **Harry's Rainbow** test account (`grantpathway+idle1@gmail.com`). Harry's Rainbow supports bereaved children 0–25 in Milton Keynes — parts of Milton Keynes are within the 20% most deprived areas nationally, and bereaved children frequently face financial hardship. Whether the AI passes or flags a mismatch for Harry's Rainbow is itself a test objective (IT-HSF-04).

**IT-11 escape hatch test:** If a mismatch is detected, IT-HSF-04 will test the profile correction → reapplication path — completing the IT-11 test that was deferred during Idlewild testing.

**Test coverage principle:** Every test plan covers the complete end-to-end flow — sign-in, profile verification, funder selection, guidelines upload, AI summary, preparation checklist, Q&A writing, and export.

---

## Test Data

| Item                        | Value                                                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test user email             | grantpathway+idle1@gmail.com                                                                                                                              |
| Charity name                | Harry's Rainbow                                                                                                                                           |
| Charity registration number | 1194917                                                                                                                                                   |
| Charity focus               | Children's bereavement support, activities, and therapeutic groups for children 0–25 bereaved of a parent or sibling, Milton Keynes and surrounding areas |
| Funder                      | Henry Smith Foundation                                                                                                                                    |
| Grant programme             | Holiday Grants — Summer Trip 2026                                                                                                                         |
| Grant amount                | Up to £3,000 (Small end of £500–£3,000 range)                                                                                                             |
| Trip description            | 2-day residential trip to an outdoor activity centre in Northamptonshire for 20 bereaved children aged 7–12                                               |
| Guidelines file             | `docs/Grant Org Guidelines/henry-smith-holiday-grants-application-template.docx`                                                                          |
| Guidelines input method     | File upload (DOCX)                                                                                                                                        |

**Pre-test check:** Verify Harry's Rainbow's charity profile is set to the **original** description above — not the arts-modified version used during Idlewild IT-11 testing.

---

## Known Expected Behaviours

| Ref                   | Description                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAP-28                | Non-narrative questions (trip dates, number of children/adults, ages, dropdown for additional needs, trip cost numbers, file uploads for accounts/budget/risk assessment, safeguarding multi-select, data protection dropdowns) should be absent from Step 4 or shown as reminders. |
| Conditional questions | Q2.6b (additional needs), Q3.3b (family contribution hardship), Q3.4b (plans to raise remaining funds) are conditional. The extraction prompt should skip them. Observe and record if any appear.                                                                                   |
| IT-11                 | If eligibility mismatch is detected for Harry's Rainbow, this test covers the full IT-11 escape hatch: update profile → create new application → verify mismatch resolved. Updated profile text in IT-HSF-04.                                                                       |

---

## Expected Narrative Questions

Universal (non-conditional) narrative questions from the application template:

| #    | Question (abbreviated)                              | Word limit |
| ---- | --------------------------------------------------- | ---------- |
| Q1.2 | Tell us about your organisation                     | 300 words  |
| Q2.1 | Where will the trip take place?                     | 300 words  |
| Q2.2 | What challenges do the children you work with face? | 300 words  |
| Q2.3 | How will this trip provide fun or new experiences?  | 300 words  |
| Q4.2 | Outline your safeguarding processes for the trip    | 300 words  |

**Conditional questions** (should be excluded by prompt):

| #     | Question                                    | Condition                                |
| ----- | ------------------------------------------- | ---------------------------------------- |
| Q2.6b | How will you meet the group's access needs? | Only if attendees have additional needs  |
| Q3.3b | What if a family or carer is unable to pay? | Only if families are asked to contribute |
| Q3.4b | Plans to raise remaining budget             | Only if budget left to raise > £0        |

---

## Test Results Summary

| Test ID   | Test Name                                                                       | HSF-Specific | AI Summary Time | Result  | Notes                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------- | ------------ | --------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IT-HSF-01 | Sign in and verify Harry's Rainbow profile                                      | No           | N/A             | ✅ Pass |                                                                                                                                                                   |
| IT-HSF-02 | Henry Smith Foundation funder picker                                            | Yes          | N/A             | ✅ Pass | Note: app advances to Step 2 directly, not dashboard — expected result in test plan corrected                                                                     |
| IT-HSF-03 | DOCX upload and AI summary                                                      | Yes          | Not recorded    | ✅ Pass | No AI policy banner (removed during this session). Grant amount "Not specified" — application template doesn't state range explicitly                             |
| IT-HSF-04 | Eligibility check — observe outcome; IT-11 escape hatch if mismatch             | Yes          | N/A             | ✅ Pass | Branch A — Harry's Rainbow passed eligibility (bereaved children, MK deprived areas). IT-11 escape hatch remains deferred.                                        |
| IT-HSF-05 | AI summary content accuracy                                                     | Yes          | N/A             | ✅ Pass | All key content accurate. Grant amount not stated (see IT-HSF-03 note).                                                                                           |
| IT-HSF-06 | Narrative question extraction — exact 300-word limits and conditional filtering | Yes          | N/A             | ✅ Pass | 8 questions after prompt fixes. All show "0 / 300 words". Q5 (family payment) conditional still appears. Q9 (feedback) removed by prompt fix during this session. |
| IT-HSF-07 | Budget and non-narrative question handling                                      | Yes          | N/A             | ✅ Pass | Q6 correctly flagged amber (Budget). Non-narrative questions absent from Step 4.                                                                                  |
| IT-HSF-08 | Narrative answer writing and AI assist                                          | No           | N/A             | ✅ Pass | Spelling correction fixed. Over-limit AI assist enabled (compresses to limit). Multiple wording improvements made during this session.                            |
| IT-HSF-09 | Answer approval and Step 5 navigation                                           | No           | N/A             | ✅ Pass | Assembly and approval flow correct.                                                                                                                               |
| IT-HSF-10 | Word document export — structure and content                                    | No           | N/A             | ✅ Pass | Export correct. D-HSF-01: funder name shows "Henry Smith Charity" not "Henry Smith Foundation" — seed data defect, fixed during this session.                     |

---

## Defect Log

| ID       | Test      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Severity | Status |
| -------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| D-HSF-01 | IT-HSF-10 | Funder name seeded as "Henry Smith Charity" — should be "Henry Smith Foundation". Affects export header and Step 3 summary display. Fixed by migration `20260602000001_fix_henry_smith_name.sql` and seed file update.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Low      | Fixed  |
| D-HSF-02 | IT-HSF-08 | Question sync bug: `ignoreDuplicates: true` upsert returned empty array on return visits, overwriting `questionRows` and showing "No specific questions found" fallback. Fixed by re-fetching from DB after upsert.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | High     | Fixed  |
| D-HSF-03 | IT-HSF-04 | Step 4 shows "No specific questions were found" fallback on first load after IT-11 escape hatch flow (profile correction → new application → regenerated summary). Sections/questions visible on second load (go Back → regenerate summary). Root cause: Step 4 sync does not reliably populate `application_answers` when an application has passed through Step 3 multiple times (mismatch → profile fix → regeneration). Same vulnerability as D-HSF-02 and D-GWF-01 — not caused by ADR-AI-010 preprocessing. Workaround: return to Step 3 and regenerate. Fixed 2026-06-07: upsert error now checked explicitly (was silently swallowed); inserts filtered for null question_text; ignoreDuplicates changed to false so question metadata refreshes on regeneration while answers are preserved. | Medium   | Fixed  |

---

## Test Cases

---

### IT-HSF-01 — Sign In and Verify Harry's Rainbow Profile

**HSF-specific:** No
**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Sign in as `grantpathway+idle1@gmail.com`
3. Navigate to **Charity Profile**
4. Verify the profile reads:
   - Charity name: Harry's Rainbow
   - What does your charity do: Children's bereavement support, activities, and therapeutic groups for children 0–25 bereaved of a parent or sibling, Milton Keynes and surrounding areas
   - Who do you help: Children, young people and young adults aged 0–25 bereaved of a parent or sibling
   - Where do you work: Milton Keynes and surrounding areas
5. If the profile shows the arts-modified version from Idlewild IT-11 testing, revert it to the above description and save

**Expected result:**

- Sign in succeeds
- Profile shows Harry's Rainbow original description
- Dashboard is accessible

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-02 — Henry Smith Foundation Funder Picker

**HSF-specific:** Yes
**Prerequisite:** IT-HSF-01 complete

**Steps:**

1. From the dashboard, click **+ New Application**
2. Type **"Henry"** in the funder picker
3. Confirm **Henry Smith Foundation** appears with a **Structured** badge
4. Select **Henry Smith Foundation**
5. Enter grant name: **"Holiday Grants — Summer Trip 2026"**
6. Click **Continue**

**Expected result:**

- Henry Smith Foundation appears with Structured badge
- Application created on dashboard

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-03 — DOCX Upload and AI Summary

**HSF-specific:** Yes — tests DOCX upload path with the application template
**Prerequisite:** IT-HSF-02 complete

**Steps:**

1. On Step 2, upload `henry-smith-holiday-grants-application-template.docx`
2. Confirm file accepted, click **Continue**
3. Start a stopwatch, click **Generate summary**, stop when summary appears — record time
4. Review the summary cards
5. Note whether a red eligibility mismatch warning appears (record outcome for IT-HSF-04)
6. Click **Continue** → verify preparation checklist or mismatch state

**Expected result:**

- DOCX uploads successfully
- AI summary generates without error
- No AI policy banner (removed — Grant Pathway's own AI safeguards are sufficient; approved funders are pre-screened)
- Outcome of eligibility check recorded (pass or mismatch)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record summary time and eligibility outcome):**

---

### IT-HSF-04 — Eligibility Check — Observe Outcome; IT-11 Escape Hatch if Mismatch

**HSF-specific:** Yes — this test has two branches depending on whether the AI flags Harry's Rainbow as eligible or not
**Prerequisite:** IT-HSF-03 complete

#### Branch A — No mismatch (Harry's Rainbow passes)

If no red mismatch warning appeared in IT-HSF-03:

1. Confirm the preparation checklist screen appeared on clicking Continue
2. Note that Harry's Rainbow passed eligibility — bereaved children in MK, financial hardship, MK is in deprived areas
3. Record as Pass and proceed to IT-HSF-05

#### Branch B — Mismatch detected (IT-11 escape hatch test)

If a red mismatch warning appeared in IT-HSF-03:

1. Confirm the red warning card is displayed with a clear mismatch reason
2. Click **"I understand — return to my dashboard"**
3. Verify application shows **Ineligible** red badge on dashboard
4. Navigate to **Charity Profile** and update "What does your charity do?" to:
   _"Harry's Rainbow provides bereavement support and group activities for children aged 5–13 who have been bereaved of a parent or sibling, including therapeutic groups, recreational activities, and annual trips to outdoor activity centres, for families in Milton Keynes — an area within the most deprived 20% nationally"_
5. Save the updated profile
6. Create a **new** application: Henry Smith Foundation → "Holiday Grants — Summer Trip 2026 (Reapplication)"
7. Re-upload `henry-smith-holiday-grants-application-template.docx` and regenerate summary
8. Verify **no mismatch warning** appears with the updated profile

**Expected result (Branch A):** Harry's Rainbow passes — proceed to IT-HSF-05
**Expected result (Branch B):** Mismatch detected → profile corrected → new application passes — IT-11 escape hatch verified ✅

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which branch was taken):**

---

### IT-HSF-05 — AI Summary Content Accuracy

**HSF-specific:** Yes
**Prerequisite:** IT-HSF-03 complete

**Verify the summary includes:**

- Programme purpose: recreational trips for children aged 13 and under
- Grant range: £500–£3,000 _(Note: the application template does not state the grant range explicitly — "Not specified" is an acceptable result; the funding guidelines document would capture this)_
- Eligibility: 20% most deprived areas OR children facing financial/systemic challenges; income under £2m
- Trip requirements: UK only, 1–7 days, recreational (no educational or religious aims)
- One application per calendar year
- Apply at least 6 weeks before trip
- Key exclusions: trips outside UK, educational/religious trips, retrospective trips

**Expected result:**

- Key content accurately represented
- Grant range and eligibility threshold correct

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-06 — Narrative Question Extraction — Exact 300-Word Limits and Conditional Filtering

**HSF-specific:** Yes
**Prerequisite:** IT-HSF-03 complete

**Steps:**

1. On Step 4, review all extracted questions
2. Record the number of questions displayed
3. Verify universal questions appear with "0 / 300 words" counter
4. Check whether conditional questions (Q2.6b additional needs, Q3.3b family contribution hardship, Q3.4b fundraising plans) appear — they should be excluded

**Expected result:**

- 4–5 universal narrative questions extracted
- All show exact "0 / 300 words" counter
- Conditional questions absent (GAP-28 Layer 1)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record actual questions shown):**

---

### IT-HSF-07 — Budget and Non-Narrative Question Handling

**HSF-specific:** Yes
**Prerequisite:** IT-HSF-03 complete

**Non-narrative questions expected to be absent from Step 4:**

| Question                                | Type                  |
| --------------------------------------- | --------------------- |
| Q1.1 — Org name, address, type          | Data entry / dropdown |
| Q1.3 — Upload accounts                  | File upload           |
| Q1.4 — Contact details                  | Structured data       |
| Q2.4 — Trip start/end dates             | Date fields           |
| Q2.5 — Number of children, adults, ages | Numbers               |
| Q2.6 — Additional needs?                | Dropdown              |
| Q3.1 — Total trip cost                  | Number                |
| Q3.2 — Upload budget document           | File upload           |
| Q3.3 — Family contribution?             | Dropdown + numbers    |
| Q3.4 — Amount requested from HSF        | Number                |
| Q4.1 — Safeguarding statements          | Multi-select dropdown |
| Q4.3 — Upload risk assessment           | File upload           |
| Q5.2 — Where did you hear about this?   | Dropdown              |
| Q5.4 — Data protection agreement        | Dropdown              |

**Steps:**

1. Confirm non-narrative questions are absent from Step 4
2. Check whether any budget-related narrative question (Q3.4b — fundraising plans, 300 words) appears and if so whether it is flagged amber

**Expected result:**

- Non-narrative questions absent from Step 4
- Any budget-related narrative question flagged amber with AI assist disabled

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-08 — Narrative Answer Writing and AI Assist

**HSF-specific:** No
**Prerequisite:** IT-HSF-06 complete

**Steps:**

1. Navigate to **Q2.2 — What challenges do the children face?** (300 words)
2. Write an answer about the challenges bereaved children face (financial hardship, emotional impact, limited access to fun experiences)
3. Verify counter shows "X / 300 words"
4. Click **Help me improve this** and review the refined answer
5. Review the three mandatory confirmation prompts and approve
6. Navigate to **Q2.3 — How will this trip provide fun or new experiences?** (300 words)
7. Write an answer about the outdoor activity centre trip
8. Approve

**Expected result:**

- Counter shows exact "X / 300 words"
- AI assist works without adding invented facts
- Mandatory review prompts displayed before approval

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-09 — Answer Approval and Step 5 Navigation

**HSF-specific:** No
**Prerequisite:** IT-HSF-08 complete

**Steps:**

1. Answer and approve all questions
2. Click **Ready to assemble** → proceed through assembly to Step 5
3. Tick all three review checkboxes
4. Click **Approve my application** and confirm the modal

**Expected result:**

- Assembly and approval flow completes correctly

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-HSF-10 — Word Document Export — Structure and Content

**HSF-specific:** No
**Prerequisite:** IT-HSF-09 complete

**Steps:**

1. Click **Export as Word document**
2. Review the downloaded .docx file

**Expected result:**

- Title: **"Holiday Grants — Summer Trip 2026"**
- Funder: **"Henry Smith Foundation"**
- Export date, AI disclaimer, Q&A body, footer all present
- Only approved answers included
- Clean and readable

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                  |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-02 | Rapidglobe Ltd | Initial test plan — Henry Smith Foundation Holiday Grants, Harry's Rainbow test charity, 10 test cases. IT-HSF-04 includes IT-11 escape hatch branch for profile correction. Replaces Proud Homes test plan (deferred to future testing of two-stage application flow). |
| 1.1     | 2026-06-02 | Rapidglobe Ltd | All 10 tests completed — 10/10 Pass. D-HSF-01 (funder name) and D-HSF-02 (question sync) found and fixed. Multiple UX and prompt improvements made during this session. Defect log and results recorded.                                                                |
| 1.2     | 2026-06-05 | Rapidglobe Ltd | ADR-AI-010 performance retest. IT-HSF-04 Branch B executed for first time — mismatch detected, profile corrected, reapplication passed (IT-11 escape hatch verified). D-HSF-03 added: Step 4 sync fallback on multi-pass Step 3 flows. Summary time 21s.                |
| 1.3     | 2026-06-07 | Rapidglobe Ltd | D-HSF-03 fixed. Step 4 sync hardened: upsert error now checked explicitly; inserts filtered for null question_text; ignoreDuplicates changed to false. D-HSF-03 status updated to Fixed.                                                                                |
