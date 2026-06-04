# Lloyds Bank Foundation — Specialist Programme Test Plan

**Version:** 1.8
**Date:** 2026-06-04
**Status:** In progress
**Tester:** WJ
**Test accounts:** grantpathway+idle1@gmail.com (Harry's Rainbow — eligibility mismatch test) · grantpathway+lloyds1@gmail.com (New Leaf — happy path, new account)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the **Lloyds Bank Foundation for England and Wales — Specialist Programme**. The Specialist Programme offers unrestricted grants of £75,000 over 3 years to small/medium charities (annual income £25k–£500k) tackling complex social issues: homelessness, domestic abuse, addiction, care leavers, offending, asylum seekers, sexual exploitation, and trafficking.

**This test plan runs two accounts in sequence:**

1. **Harry's Rainbow (eligibility mismatch test)** — Children's bereavement charity. Lloyds E&W focuses on complex social exclusion; bereavement support is not in their core remit. The AI is expected to flag a mismatch. This tests FR-47 (eligibility hard stop) and the IT-11 escape hatch.

2. **New Leaf (happy path)** — Fictional care leavers / homelessness prevention charity in Greater Manchester. Clear fit for Lloyds E&W criteria. This tests the full end-to-end flow through to export.

**Guidelines source:** Lloyds Bank Foundation publishes a downloadable **Word document** example application form. This tests the Word (.docx) upload path — distinct from the PDF upload path used in previous test cycles.

**AI policy:** Lloyds E&W explicitly permits AI use with conditions: *"Use AI for drafting/grammar, then thoroughly customise responses."* Grant Pathway's model (charity writes content, AI refines on request) is compliant. No mismatch expected on AI policy grounds.

**Note:** The Specialist Programme is currently closed pending summer 2026 reopening. Testing uses the published example application form (Word document). When the programme reopens, this test plan should be re-run against live guidelines.

**Test coverage principle:** This plan covers the complete end-to-end flow for both accounts — sign-in/registration, profile, funder selection, guidelines upload, AI summary, preparation checklist, Q&A writing, and export. No step is omitted.

---

## Pre-Test Setup

### Account 1 — Harry's Rainbow (existing)
- Email: `grantpathway+idle1@gmail.com`
- Profile should be set to the **original** Harry's Rainbow description (children's bereavement charity, Milton Keynes). If it was modified during previous testing, revert it before starting.

### Account 2 — New Leaf (new account to create)
Register `grantpathway+lloyds1@gmail.com` and set up the following charity profile:

| Field | Value |
|-------|-------|
| First name | Marcus |
| Last name | Webb |
| Charity name | New Leaf |
| Registration number | 1198342 |
| What does your charity do? | New Leaf provides intensive, relationship-based support for care leavers and young people leaving the criminal justice system aged 16–25 in Greater Manchester. We offer one-to-one key worker support, peer mentoring, and practical assistance with housing, employment, and life skills. We work closely with local authorities, probation services, and housing providers to prevent homelessness and reoffending among young people making the transition to independent living. |
| Who does your charity help? | Care leavers and young people aged 16–25 leaving the criminal justice system in Greater Manchester, particularly those at risk of homelessness and reoffending. Approximately 70% of our beneficiaries have experience of both the care and justice systems. |
| Where do you work? | Greater Manchester (Salford, Wigan, and Bolton) |

### Guidelines file
Download the Lloyds Bank Foundation example application form:
- URL: https://www.lloydsbankfoundation.org.uk/media/yytlgce2/example-application-form-specialist-funding-programme-2023-24.docx
- Save as `docs/Grant Org Guidelines/lloyds-bank-foundation-specialist-programme-example-form.docx`
- This is a Word (.docx) file — tests the DOCX upload path

**Note:** The Specialist Programme is currently closed. The "New Leaf" test application will reference the example form. Funder picker should now show "Lloyds Bank Foundation" (updated from CI in migration 20260603000000).

---

## Test Data

### Account 1 — Harry's Rainbow (mismatch test)

| Item | Value |
|------|-------|
| Test user email | grantpathway+idle1@gmail.com |
| Charity name | Harry's Rainbow |
| Funder | Lloyds Bank Foundation |
| Grant programme | Specialist Programme — Bereavement Support 2026 |
| Guidelines file | lloyds-bank-foundation-specialist-programme-example-form.docx |
| Expected eligibility outcome | Mismatch (bereavement not in Lloyds E&W's complex social exclusion focus) |

### Account 2 — New Leaf (happy path)

| Item | Value |
|------|-------|
| Test user email | grantpathway+lloyds1@gmail.com |
| Charity name | New Leaf |
| Registration number | 1198342 |
| Funder | Lloyds Bank Foundation |
| Grant programme | Specialist Programme — Care Leavers Support 2026 |
| Grant amount | £75,000 over 3 years (unrestricted) |
| Guidelines file | lloyds-bank-foundation-specialist-programme-example-form.docx |
| Guidelines input method | File upload (DOCX) |
| Expected eligibility outcome | Pass |

---

## Known Expected Behaviours

| Ref | Description |
|-----|-------------|
| IT-LBF-02 | Harry's Rainbow is expected to trigger an eligibility mismatch. Bereavement support for children is not in Lloyds E&W's focus areas (homelessness, domestic abuse, addiction, care leavers, offending, trafficking). |
| D-WF-01 (fixed) | Optional sections now show the approve button even when empty, and do not block the assembly gate. Verify the fix is working during IT-LBF-10. |
| D-WF-04 (fixed) | Re-export warning now appears after re-open/re-approve cycle. Verify during IT-LBF-13. |
| D-WF-05 (fixed) | Export date now includes HH:MM timestamp. Verify in exported document. |
| Non-narrative questions | Lloyds form includes many data-entry, dropdown, financial, and file-upload fields. These should be absent from Step 4. Key narrative questions listed below. |
| DOCX upload path | This is the first test plan to use a DOCX file as the primary guidelines source. Step 2 file upload (not paste) is the input method. |

---

## Expected Narrative Questions (New Leaf application)

Key narrative questions from the Lloyds Specialist Programme example form:

| # | Question (abbreviated) | Word limit |
|---|------------------------|------------|
| Q2 | History and background of the charity | 250 words |
| Q3 | Main activities and benefits to people supported | 500 words |
| Q4 | How the charity engages people with lived experience | 250 words |
| Q5 | How you track an individual person's progress | 250 words |
| Q6 | Outcomes — differences made to lives of people supported (1–3 outcomes) | 50 words each |
| Q19 | Key financial information | 250 words |
| Q21 | What the grant will fund | 500 words |
| Q25 | Difference the grant will make (outcomes, 1–3) | 50 words each |
| Q27 | Track record — why you are the right organisation | 250 words |
| Q28 | Collaboration — unique offer, partners, avoiding duplication | 250 words |
| Q29 | Gap in services — what would happen without this service | 250 words |
| Q30 | Social need and impact | 500 words |
| Q31 | Sustainability — plans beyond funding period | 50 words |

**Non-narrative questions expected to be absent from Step 4:**

| Question | Type |
|----------|------|
| Q1 Charity classification | Dropdown |
| Q7–Q11 Trustees/volunteers/staff numbers | Numbers |
| Q12 Management structure | Data entry (names and roles) |
| Q13 Links to national charity | Conditional |
| Q14 Charity regulator registration | Checkbox |
| Q15 Data protection registration | Checkbox |
| Q16 Policies and procedures | Multi-select |
| Q17 Quality marks | Data entry (names and dates) |
| Q18 Financial overview (income/expenditure tables) | Financial figures |
| Q20 Amount requested | Number |
| Q22 Existing or new work | Dropdown |
| Q23 Preferred start date | Date |
| Q24 Number of people benefiting | Number |
| Q26 Only organisation offering this service | Dropdown |
| Q32 Total funding required — cost breakdown | Financial table |
| Q33 Funding secured/pending | Financial data |
| Q34 Outstanding amount to raise | Number |
| Supporting documents | File uploads |

---

## Test Results Summary

| Test ID | Test Name | LBF-specific | AI Summary Time | Result | Notes |
|---------|-----------|-------------|----------------|--------|-------|
| IT-LBF-01 | Harry's Rainbow sign in and profile verification | No | N/A | ✅ Pass | |
| IT-LBF-02 | Harry's Rainbow — Lloyds funder picker and guidelines upload | Yes | | ✅ Pass | |
| IT-LBF-03 | Harry's Rainbow — eligibility mismatch confirmed | Yes | N/A | ✅ Pass | Ineligible badge shown on dashboard; FR-47 hard stop confirmed |
| IT-LBF-04 | New Leaf account registration and profile setup | No | N/A | ✅ Pass | Registration number omitted (optional field) — profile saved successfully without it |
| IT-LBF-05 | New Leaf — Lloyds funder picker | Yes | N/A | ✅ Pass | |
| IT-LBF-06 | New Leaf — DOCX upload and AI summary | Yes | 24s | ✅ Pass | 10 questions extracted. Question set differs from test plan expectation — actual form has 500/600-word narrative questions. IT-LBF-09 table updated to reflect actual questions. Q3 (quality marks, 150 words) borderline — monitor in IT-LBF-10. |
| IT-LBF-07 | New Leaf — eligibility check passes | Yes | N/A | ✅ Pass | Preparation checklist appeared correctly |
| IT-LBF-08 | New Leaf — AI summary content accuracy | Yes | N/A | ✅ Pass | Grant amount, 8 themes, eligibility, exclusions, and key requirements all correctly reflected |
| IT-LBF-09 | New Leaf — narrative question extraction and word limits | Yes | N/A | ✅ Pass | All 10 questions present with correct word limits. Q3 (quality marks, 150 words) included as writing card — borderline but acceptable as form assigns word limit |
| IT-LBF-10 | New Leaf — non-narrative question handling; optional section fix (D-WF-01) | Yes | N/A | ✅ Pass | No financial questions displayed. Ready to assemble visible with Q10 empty — D-WF-01 fix confirmed. D-LBF-01 raised: optional label buried in Q10 question text, not visible as a card badge |
| IT-LBF-11 | New Leaf — narrative answer writing and AI assist | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-LBF-12 | New Leaf — answer approval and Step 5 navigation | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-LBF-13 | New Leaf — export; timestamp fix (D-WF-05); re-export warning fix (D-WF-04) | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |

---

## Defect Log

| ID | Test | Description | Severity | Status |
|----|------|-------------|----------|--------|
| D-LBF-01 | IT-LBF-10 | Optional question label not visible as a card badge. Q10's optional nature is buried in the question text ("This question is optional. You can use this space..."). Users may miss it and feel obligated to fill it in. Suggested fix: surface "(Optional)" as a visible badge or label on the card header, consistent with how optional sections are treated elsewhere. | Low | Open |

---

## Test Cases

---

### IT-LBF-01 — Harry's Rainbow Sign In and Profile Verification

**LBF-specific:** No
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

**Result:** ✅ Pass

**Notes:**

---

### IT-LBF-02 — Harry's Rainbow — Lloyds Funder Picker and Guidelines Upload

**LBF-specific:** Yes — tests DOCX upload path and confirms Lloyds E&W appears in picker
**Prerequisite:** IT-LBF-01 complete

**Steps:**
1. From the dashboard, click **+ New Application**
2. Type **"Lloyds"** in the funder picker
3. Confirm **Lloyds Bank Foundation** appears with a **Structured** badge (note: CI version should no longer appear — confirm migration applied)
4. Select **Lloyds Bank Foundation**
5. Enter grant name: **"Specialist Programme — Bereavement Support 2026"**
6. Click **Continue**
7. On Step 2, upload `lloyds-bank-foundation-specialist-programme-example-form.docx`
8. Confirm file accepted, click **Continue**
9. On Step 3, wait for AI summary to auto-generate — record the time
10. Note whether a red eligibility mismatch warning appears

**Expected result:**
- "Lloyds Bank Foundation" (E&W) appears in picker — not CI version
- DOCX uploads successfully (tests Word upload path)
- AI summary generates without error

**Result:** ✅ Pass

**Notes (record summary time and whether mismatch warning appears):**

---

### IT-LBF-03 — Harry's Rainbow — Eligibility Mismatch Confirmed

**LBF-specific:** Yes — FR-47 eligibility hard stop test
**Prerequisite:** IT-LBF-02 complete

**Steps:**
1. If a red mismatch warning appeared on Step 3, verify it shows:
   - Red warning card with a clear mismatch reason
   - Reference to Lloyds E&W's focus on complex social exclusion/disadvantage
   - "I understand — return to my dashboard" button
2. Click **"I understand — return to my dashboard"**
3. Verify the dashboard shows the application with a red **"Ineligible"** badge and no Continue button

**If no mismatch appeared (unexpected):**
- Record as a defect — Harry's Rainbow is not a match for Lloyds E&W criteria
- Note the AI summary content and the eligibility criteria shown

**Expected result:**
- Red mismatch warning displayed with clear reason
- Application marked Ineligible on dashboard
- FR-47 hard stop confirmed for Lloyds E&W

**Result:** ✅ Pass

**Notes:** Ineligible badge confirmed on dashboard. FR-47 hard stop working correctly for Lloyds E&W Specialist Programme.

---

### IT-LBF-04 — New Leaf Account Registration and Profile Setup

**LBF-specific:** No
**Prerequisite:** IT-LBF-03 complete (Harry's Rainbow mismatch confirmed)

**Steps:**
1. Sign out of Harry's Rainbow account
2. Register `grantpathway+lloyds1@gmail.com` (first name Marcus, last name Webb)
3. Verify the email confirmation and click the verification link
4. On first login, complete the charity profile using the New Leaf values in the Test Data table above
5. Save the profile and confirm redirect to dashboard

**Expected result:**
- Registration and email verification completes without error
- Charity profile saves successfully
- Dashboard shows profile complete (no amber incomplete banner)

**Result:** ✅ Pass

**Notes:** Registration number omitted (field is optional) — profile saved successfully without it. All other charity profile fields saved correctly.

---

### IT-LBF-05 — New Leaf — Lloyds Funder Picker

**LBF-specific:** Yes
**Prerequisite:** IT-LBF-04 complete

**Steps:**
1. From the dashboard, click **+ New Application**
2. Type **"Lloyds"** in the funder picker
3. Confirm **Lloyds Bank Foundation** appears with a **Structured** badge
4. Select **Lloyds Bank Foundation**
5. Enter grant name: **"Specialist Programme — Care Leavers Support 2026"**
6. Click **Continue**

**Expected result:**
- Lloyds Bank Foundation appears with Structured badge
- Application created and Step 2 displayed

**Result:** ✅ Pass

**Notes:** No issues.

---

### IT-LBF-06 — New Leaf — DOCX Upload and AI Summary

**LBF-specific:** Yes — primary test of DOCX upload path with Lloyds guidelines
**Prerequisite:** IT-LBF-05 complete

**Steps:**
1. On Step 2, upload `lloyds-bank-foundation-specialist-programme-example-form.docx`
2. Confirm the file is accepted
3. Click **Continue**
4. On Step 3, start a stopwatch — summary auto-generates on page load
5. Stop the stopwatch when summary cards appear — record the time
6. Review all summary cards displayed
7. Note whether a red eligibility mismatch warning appears — record for IT-LBF-07
8. Click **Continue**

**Expected result:**
- DOCX uploads successfully
- AI summary auto-generates within 30 seconds (NFR-01)
- No JSON parse error
- New Leaf's profile aligns with Lloyds E&W criteria — no mismatch expected

**Result:** ✅ Pass

**Notes:** Summary generated in 24 seconds (within NFR-01 30s target). 10 questions extracted. Summary content accurate — grant amount, eligibility criteria, eight themes, and key requirements all correctly reflected. Question set differs from test plan expectation: actual form uses 500/600-word narrative questions rather than the anticipated 50/250-word set. IT-LBF-09 table updated accordingly. Q3 (quality marks, 150 words) borderline non-narrative — monitor in IT-LBF-10.

---

### IT-LBF-07 — New Leaf — Eligibility Check Passes; Preparation Checklist

**LBF-specific:** Yes
**Prerequisite:** IT-LBF-06 complete

> **Where the eligibility warning appears:** On Step 3 (AI Summary page), replacing the summary cards entirely. Reaching the preparation checklist confirms no mismatch was detected.

**Steps:**
1. If normal summary cards appeared and Continue was possible — confirm eligibility passed
2. Verify the **"Before you begin writing"** preparation checklist appears with:
   - Financial sections advisory (CEO/treasurer/trustee review required)
   - Four items to gather before starting
   - "I have what I need — start writing" button
3. Click **"I have what I need — start writing"**

**Expected result (no mismatch):**
- New Leaf passes eligibility — care leavers/homelessness prevention is a clear fit
- Preparation checklist displays correctly
- "I have what I need — start writing" navigates to Step 4

**If mismatch appears (unexpected):**
- Record the mismatch reason as a defect
- Log and investigate before proceeding

**Result:** ✅ Pass

**Notes:** Preparation checklist appeared correctly after Continue on Step 3. Eligibility passed — no mismatch for New Leaf.

---

### IT-LBF-08 — New Leaf — AI Summary Content Accuracy

**LBF-specific:** Yes
**Prerequisite:** IT-LBF-06 complete

**Verify the summary includes:**
- Funder description: grants for charities tackling complex social issues / social exclusion and disadvantage
- Eligibility: charities with annual income £25k–£500k; focus on complex social issues
- What is funded: core operating costs or specific roles (unrestricted); 3-year funding
- Key exclusions: religious activity as core service; families as predominant focus for addiction charities; retroactive funding
- Outcome focus: measurable differences in lives of people supported
- Application sections listed with word limits

**Expected result:**
- Summary accurately reflects Lloyds E&W Specialist Programme criteria
- No hallucinated conditions
- Word limits extracted correctly for narrative questions

**Result:** ✅ Pass

**Notes:** Grant amount (£75k/3 years), eight specialist themes, eligibility criteria, "what the funder is looking for", and key requirements all correctly reflected. No hallucinated conditions observed.

---

### IT-LBF-09 — New Leaf — Narrative Question Extraction and Word Limits

**LBF-specific:** Yes
**Prerequisite:** IT-LBF-06 complete; preparation checklist confirmed

**Steps:**
1. On Step 4, record the total number of question/section cards displayed
2. For each card, record: question text and displayed word limit
3. Verify the following questions appear with correct limits (updated from actual form):

| Q# | Expected question | Expected word limit | Actual limit | Present? |
|----|-------------------|--------------------|--------------| ---------|
| Q1 | Short summary of charity's purpose and aims | 500 words | 500 words | ✅ |
| Q2 | Main services your charity provides | 600 words | 600 words | ✅ |
| Q3 | Quality marks or standards held and date awarded | 150 words | 150 words | ✅ (borderline non-narrative — included as word limit assigned) |
| Q4 | What changes are you working towards with people you support | 500 words | 500 words | ✅ |
| Q5 | How does your organisation approach equity, diversity and inclusion | 500 words | 500 words | ✅ |
| Q6 | How are people with lived experience involved in how your charity is run | 500 words | 500 words | ✅ |
| Q7 | How do you support people who have experienced trauma | 500 words | 500 words | ✅ |
| Q8 | Strengths of and opportunities for your organisation | 500 words | 500 words | ✅ |
| Q9 | Most pressing areas for further development and how identified | 500 words | 500 words | ✅ |
| Q10 | Anything further in support of your application (optional) | 400 words | 400 words | ✅ |

4. Note: Q3 (quality marks, 150 words) is borderline non-narrative — verify whether it appears as a writing card or is absent from Step 4 (covered in IT-LBF-10)

**Expected result:**
- Narrative questions extracted with correct word limits
- Mix of 50/250/500-word limits all handled correctly

**Result:** ✅ Pass

**Notes:** All 10 questions present with correct word limits. Q3 (quality marks, 150 words) confirmed present as writing card — borderline non-narrative but acceptable given form assigns a word limit. All other questions are clearly narrative. Word counters displayed correctly across 150/400/500/600-word variants.

---

### IT-LBF-10 — New Leaf — Non-Narrative Question Handling; Optional Section Fix Verification

**LBF-specific:** Yes — also verifies D-WF-01 fix (optional sections no longer block assembly)
**Prerequisite:** IT-LBF-06 complete

**Steps:**
1. Review Step 4 — confirm data-entry, dropdown, financial, and file-upload fields from the non-narrative list above are absent as writing cards
2. Confirm financial questions (income/expenditure tables, amounts requested, cost breakdown) are either absent or flagged amber as Budget sections
3. **D-WF-01 fix verification:** If any section is labelled "(optional)":
   - Confirm the "Approve this answer" button is visible even when the textarea is empty
   - Confirm leaving it blank and clicking approve works
   - Confirm the "Ready to assemble" button activates without requiring the optional section to be filled in

**Expected result:**
- Non-narrative fields absent from Step 4
- Optional sections show approve button when empty ✅ (D-WF-01 fixed)
- Assembly gate does not require optional sections to be answered ✅ (D-WF-01 fixed)

**Result:** ✅ Pass

**Notes:** No financial questions present in Step 4. Q3 (quality marks) is the only borderline case — included as writing card due to 150-word limit, acceptable. "Ready to assemble" button visible with Q10 empty — D-WF-01 fix confirmed working. D-LBF-01 raised: Q10's optional nature is buried in the question text ("This question is optional. You can use this space...") rather than surfaced as a visible card badge. Suggested fix: add "(Optional)" as a visible label on the card header.

---

### IT-LBF-11 — New Leaf — Narrative Answer Writing and AI Assist

**LBF-specific:** No
**Prerequisite:** IT-LBF-09 complete

**Steps:**
1. Navigate to **History and background** (250 words)
2. Write an answer about New Leaf — founding, programme of key worker support and peer mentoring for care leavers, Greater Manchester focus
3. Verify counter shows "X / 250 words"
4. Click **Help me improve this** — verify the refined answer:
   - Corrects any spelling/grammar
   - Stays within 250 words
   - Does not add invented facts
5. Use the refined version and approve
6. Navigate to **What the grant will fund** (500 words)
7. Write an answer about the core operating costs: key worker salaries, peer mentoring programme, housing liaison role
8. Approve without AI assist (tests user-authored path on a 500-word field)
9. Navigate to a **50-word outcome question** (Q6 or Q25 equivalent)
10. Write a concise outcome statement (e.g. *"Young care leavers maintain stable housing and avoid reoffending in the 12 months following our support."*)
11. Verify the counter shows "X / 50 words"
12. Approve

**Expected result:**
- Word counters correct across all limit types (50, 250, 500 words)
- AI assist works on 250-word field
- 50-word field enforces limit correctly
- All approval prompts displayed before each approval

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-LBF-12 — New Leaf — Answer Approval and Step 5 Navigation

**LBF-specific:** No
**Prerequisite:** IT-LBF-11 complete

**Steps:**
1. Approve all remaining mandatory question cards
2. Verify the progress bar reaches "Ready to assemble"
3. Click **Ready to assemble**
4. Verify the **"Before we put it together"** senior review confirmation screen appears with correct content
5. Click **Yes — assemble my draft**
6. On Step 5, verify:
   - Correct funder (Lloyds Bank Foundation) and grant name displayed
   - All approved answers shown in read-only view with correct source badges
7. Tick all three review checkboxes and click **Approve my application**
8. Confirm the approval modal shows correct application details

**Expected result:**
- Assembly and approval flow completes correctly
- Step 5 content correct

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-LBF-13 — New Leaf — Export; Timestamp Fix; Re-Export Warning Fix

**LBF-specific:** No — primarily verifies D-WF-04 and D-WF-05 fixes
**Prerequisite:** IT-LBF-12 complete

**Steps:**
1. Click **Export as Word document**
2. Open the downloaded .docx file and verify:
   - Title: **"Specialist Programme — Care Leavers Support 2026"**
   - Funder: **"Lloyds Bank Foundation"**
   - Export date includes time — e.g. **"03 June 2026, 17:35"** ✅ (D-WF-05 fix)
   - AI disclaimer present and correctly worded
   - All approved answers present
   - Footer present
3. Record the exact export timestamp shown on the document
4. Click **Export as Word document** again
5. Verify the **re-export warning dialog** appears showing the prior export timestamp ✅ (D-WF-04 fix)
6. Cancel — do not re-export
7. Click **Re-open application to make changes**
8. Confirm the re-open dialog and return to Step 4
9. Make a minor amendment to one answer and re-approve all sections
10. Return to Step 5, re-approve the application
11. Click **Export as Word document**
12. **D-WF-04 fix verification:** Confirm the re-export warning dialog appears even after the re-open/re-approve cycle, showing the original export timestamp
13. Confirm the dialog and download
14. Verify the downloaded document contains the amended answer

**Expected result:**
- Export date includes HH:MM timestamp ✅ (D-WF-05)
- Re-export warning appears on second download in same session ✅
- Re-export warning appears after re-open/re-approve cycle ✅ (D-WF-04)
- Amended content present in final document ✅

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record export timestamps for comparison):**

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-06-03 | Rapidglobe Ltd | Initial test plan — Lloyds Bank Foundation (England & Wales) Specialist Programme. Two test accounts: Harry's Rainbow (eligibility mismatch) and New Leaf (happy path, new charity, care leavers). 13 test cases. Verifies D-WF-01, D-WF-04, D-WF-05 fixes. DOCX upload path tested. |
| 1.1 | 2026-06-04 | Rapidglobe Ltd | IT-LBF-01 passed — Harry's Rainbow sign in and profile verification complete. |
| 1.2 | 2026-06-04 | Rapidglobe Ltd | IT-LBF-02 and IT-LBF-03 passed — DOCX upload confirmed, eligibility mismatch hard stop (FR-47) verified for Harry's Rainbow. Ineligible badge shown on dashboard. |
| 1.3 | 2026-06-04 | Rapidglobe Ltd | IT-LBF-04 passed — New Leaf account registered and profile saved. Registration number omitted (optional field) — no issue. |
| 1.4 | 2026-06-04 | Rapidglobe Ltd | IT-LBF-05 passed — Lloyds Bank Foundation appears in funder picker with Structured badge. No issues. |
| 1.5 | 2026-06-04 | Rapidglobe Ltd | IT-LBF-06 passed — DOCX upload and AI summary complete in 24s. 10 questions extracted. Question set differs from test plan expectation; IT-LBF-09 table updated to reflect actual form questions. Q3 (quality marks, 150 words) flagged for monitoring in IT-LBF-10. |
| 1.6 | 2026-06-04 | Rapidglobe Ltd | IT-LBF-07 passed — eligibility check passed for New Leaf, preparation checklist appeared correctly. |
| 1.7 | 2026-06-04 | Rapidglobe Ltd | IT-LBF-08 and IT-LBF-09 passed — AI summary accurate; all 10 questions extracted with correct word limits. Q3 (quality marks, 150 words) confirmed present as writing card — borderline but acceptable. IT-LBF-09 table completed with observed values. |
| 1.8 | 2026-06-04 | Rapidglobe Ltd | IT-LBF-10 passed — no financial questions in Step 4, D-WF-01 fix confirmed (Ready to assemble visible with Q10 empty). D-LBF-01 raised: optional label buried in Q10 question text, not visible as card badge. |
