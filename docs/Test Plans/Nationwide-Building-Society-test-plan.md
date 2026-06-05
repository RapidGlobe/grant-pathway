# Nationwide Building Society — Community Grants Test Plan

**Version:** 1.0
**Date:** 2026-06-04
**Status:** Ready for execution
**Tester:** WJ
**Test accounts:** grantpathway+idle1@gmail.com (Harry's Rainbow — focus area mismatch) · grantpathway+nationwide1@gmail.com (Homehaven Oldham — happy path, new account)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the **Nationwide Building Society Community Grants** programme. Nationwide distributes up to £500,000 per year through 11 regional Community Foundations across the UK, supporting projects that help people in housing need. Grants of £10,000–£50,000 fund 1–2 year projects targeting Nationwide's three priority outcomes: people having a safe home, a settled home, and a thriving home.

**Programme status note:** The last confirmed open round closed May 2023. The dedicated portal (nationwidecommunitygrants.co.uk) is currently unreachable and no 2024/2025 open round has been publicly announced. The programme may be between rounds, paused, or restructured under Nationwide's "Fairer Futures" partnership model launched in 2024. This test plan uses the published criteria documents and is designed to be executed when the programme reopens. Testing proceeds on the basis of the criteria and documentation available.

**This test plan runs two accounts in sequence:**

1. **Harry's Rainbow (focus area mismatch test)** — Children's bereavement charity, Milton Keynes. Nationwide's programme is exclusively focused on housing and homelessness — bereavement support has no housing nexus. The AI is expected to flag a mismatch. This tests FR-47 (eligibility hard stop) for thematic ineligibility.

2. **Homehaven Oldham (happy path)** — Fictional floating support charity helping recently housed individuals sustain their tenancy in Oldham, Greater Manchester. Clear fit for Nationwide's priority areas and eligibility criteria. Tests the full end-to-end flow through to export.

**Guidelines source:** Nationwide does not publish a downloadable application form. The specific application questions and word limits are only accessible via the online portal during live rounds. The best publicly available documentation is third-party criteria PDFs published by regional Community Foundations. This test uses the **Norfolk Foundation 2019 criteria PDF** as the primary upload. This creates a unique testing scenario: the AI must work with third-party criteria documentation rather than an official application form, and may or may not extract specific questions. The test records what the AI extracts and whether the summary is useful despite this limitation.

**AI policy:** Not stated in any Nationwide or Community Foundation published document. The AI summary should flag this absence.

**Key eligibility rules to watch:**

- Organisation must have operated for at least **3 years** with annual accounts
- Average annual income must be at least **£25,000** over the 3 most recent years
- Grant must not exceed **25% of annual income** per year
- Grant must represent at least **50% of total project cost**
- Must have current safeguarding **and** equal opportunities policies (both required — missing either is an automatic disqualifier)
- Staff paid at least the **Real Living Wage**
- No vehicles, land, or property acquisition
- No retrospective costs
- No religious or party-political activities

---

## Pre-Test Setup

### Guidelines file — download before testing

Download the Norfolk Foundation Nationwide criteria PDF:

- URL: https://www.norfolkfoundation.com/wp-content/uploads/2019/10/Nationwide_2019_criteria-south.pdf
- Save as `docs/Grant Org Guidelines/nationwide-community-grants-criteria-norfolk-foundation-2019.pdf`
- Note: this is a third-party criteria document, not the official application form. The official form is online-only and portal-gated.

### Account 1 — Harry's Rainbow (existing)

- Email: `grantpathway+idle1@gmail.com`
- Verify profile is set to the original Harry's Rainbow description (children's bereavement charity, Milton Keynes). Revert if modified.

### Account 2 — Homehaven Oldham (new account to create)

Register `grantpathway+nationwide1@gmail.com` and set up the following charity profile:

| Field                       | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First name                  | James                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Last name                   | Nkrumah                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Charity name                | Homehaven Oldham                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Registration number         | (leave blank — optional)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| What does your charity do?  | Homehaven Oldham provides floating support to individuals and families who have recently been housed after a period of homelessness or insecure accommodation in Oldham and the surrounding area. We deploy trained support workers who visit clients in their new homes to help them build the skills and confidence needed to sustain their tenancy — covering financial management, accessing benefits, maintaining relationships with landlords, and connecting to local community networks. Since 2018 we have helped over 350 individuals remain in stable housing for 12 months or more following our intensive support period. |
| Who does your charity help? | Individuals and families aged 18 and over in Oldham and surrounding areas who have been housed after a period of homelessness, rough sleeping, or insecure accommodation. Many of our clients have experience of the criminal justice system, substance misuse, or mental health difficulties.                                                                                                                                                                                                                                                                                                                                         |
| Where do you work?          | Oldham and surrounding areas in Greater Manchester                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

---

## Test Data

### Account 1 — Harry's Rainbow (mismatch test)

| Item                         | Value                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Test user email              | grantpathway+idle1@gmail.com                                                                     |
| Charity name                 | Harry's Rainbow                                                                                  |
| Funder                       | Nationwide Building Society — Community Grants                                                   |
| Grant name                   | Community Grant — Bereavement Support 2026                                                       |
| Guidelines file              | nationwide-community-grants-criteria-norfolk-foundation-2019.pdf                                 |
| Expected eligibility outcome | Mismatch (children's bereavement has no housing nexus; programme is exclusively housing-focused) |

### Account 2 — Homehaven Oldham (happy path)

| Item                         | Value                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Test user email              | grantpathway+nationwide1@gmail.com                                                      |
| Charity name                 | Homehaven Oldham                                                                        |
| Funder                       | Nationwide Building Society — Community Grants                                          |
| Grant name                   | Floating Support Service — Tenancy Sustainment 2026-28                                  |
| Grant amount                 | £40,000 (2-year project; £20,000/year = 22% of £180,000 annual income — within 25% cap) |
| Guidelines file              | nationwide-community-grants-criteria-norfolk-foundation-2019.pdf                        |
| Guidelines input method      | File upload (PDF)                                                                       |
| Expected eligibility outcome | Pass                                                                                    |

---

## Known Expected Behaviours

| Ref                                | Description                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IT-NBS-02                          | Harry's Rainbow is expected to trigger a mismatch. Nationwide's programme is exclusively focused on housing need — children's bereavement support has no housing nexus. The AI should identify the thematic mismatch clearly.                                                                            |
| No official application form       | Nationwide's application form is online-only (portal-gated). The criteria PDF does not contain specific questions with word limits. The AI summary may extract implied questions or section headings rather than numbered questions with word limits. Record what is extracted and whether it is useful. |
| No AI policy                       | Not published by Nationwide or any regional Community Foundation. Summary should flag the absence.                                                                                                                                                                                                       |
| Programme status                   | Programme may be between rounds or paused. Testing uses available criteria documentation. Flag if funder does not appear in the picker.                                                                                                                                                                  |
| Income/grant cap rules             | Grant must be ≤25% of annual income per year; grant must be ≥50% of total project cost. Verify these are captured in the summary.                                                                                                                                                                        |
| Real Living Wage requirement       | All staff funded must be paid the Real Living Wage. Verify this is captured in the summary.                                                                                                                                                                                                              |
| Safeguarding + equal opportunities | Both policies are mandatory — missing either is an automatic disqualifier. Verify both are mentioned in the summary.                                                                                                                                                                                     |

---

## Expected Narrative Questions (Homehaven Oldham application)

**Note:** Specific application questions and word limits are not publicly available — they are only accessible via the live portal during open rounds. The following are the expected themes based on published criteria guidance. The actual question extraction table will be populated after IT-NBS-06.

| Theme                            | Expected to appear              | Actual question text | Word limit | Present? |
| -------------------------------- | ------------------------------- | -------------------- | ---------- | -------- |
| Project description / activities | Yes                             | TBC after extraction | TBC        |          |
| Outcomes and impact              | Yes                             | TBC after extraction | TBC        |          |
| Local need / evidence            | Yes                             | TBC after extraction | TBC        |          |
| Sustainability beyond the grant  | Yes                             | TBC after extraction | TBC        |          |
| Budget / financial information   | Possibly (may be non-narrative) | TBC after extraction | TBC        |          |

**If no questions are extracted:** The app should either fall back to free-form mode or display section headings. Record what appears in Step 4 and whether it is useful for the applicant.

---

## Test Results Summary

| Test ID   | Test Name                                                          | NBS-specific | AI Summary Time | Result                  | Notes |
| --------- | ------------------------------------------------------------------ | ------------ | --------------- | ----------------------- | ----- |
| IT-NBS-01 | Harry's Rainbow sign in and profile verification                   | No           | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-02 | Harry's Rainbow — Nationwide funder picker and guidelines upload   | Yes          |                 | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-03 | Harry's Rainbow — focus area mismatch confirmed                    | Yes          | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-04 | Homehaven Oldham account registration and profile setup            | No           | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-05 | Homehaven Oldham — Nationwide funder picker                        | Yes          | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-06 | Homehaven Oldham — PDF upload and AI summary                       | Yes          |                 | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-07 | Homehaven Oldham — eligibility check passes; preparation checklist | Yes          | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-08 | Homehaven Oldham — AI summary content accuracy                     | Yes          | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-09 | Homehaven Oldham — question/section extraction                     | Yes          | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-10 | Homehaven Oldham — non-narrative question handling                 | Yes          | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-11 | Homehaven Oldham — narrative answer writing and AI assist          | No           | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-12 | Homehaven Oldham — answer approval and Step 5 navigation           | No           | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |
| IT-NBS-13 | Homehaven Oldham — export; timestamp; re-export warning            | No           | N/A             | ☐ Pass ☐ Fail ☐ Blocked |       |

---

## Defect Log

| ID  | Test | Description | Severity | Status |
| --- | ---- | ----------- | -------- | ------ |

---

## Test Cases

---

### IT-NBS-01 — Harry's Rainbow Sign In and Profile Verification

**NBS-specific:** No
**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Sign in as `grantpathway+idle1@gmail.com`
3. Navigate to **Charity Profile** and verify:
   - Charity name: Harry's Rainbow
   - What does your charity do: Children's bereavement support, activities, and therapeutic groups for children 0–25 bereaved of a parent or sibling, Milton Keynes and surrounding areas
   - Where do you work: Milton Keynes and surrounding areas
4. Revert to the above if modified from previous testing

**Expected result:** Sign in succeeds; original Harry's Rainbow profile confirmed.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-NBS-02 — Harry's Rainbow — Nationwide Funder Picker and Guidelines Upload

**NBS-specific:** Yes
**Prerequisite:** IT-NBS-01 complete

**Steps:**

1. From the dashboard, click **+ New Application**
2. Type **"Nationwide"** in the funder picker
3. Confirm **Nationwide Building Society — Community Grants** appears with a **Structured** badge
4. Select it and enter grant name: **"Community Grant — Bereavement Support 2026"**
5. Click **Continue**
6. On Step 2, upload `nationwide-community-grants-criteria-norfolk-foundation-2019.pdf`
7. Confirm file accepted; click **Continue**
8. On Step 3, start a stopwatch — record time when summary cards appear
9. Note whether a red eligibility mismatch warning appears

**Expected result:**

- Nationwide Building Society appears in picker with Structured badge
- PDF uploads successfully
- AI summary generates without error

**If Nationwide does not appear in picker:** Log as a defect — funder may not be seeded in the database. Testing cannot proceed until funder is added.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record summary time and whether mismatch warning appears):**

---

### IT-NBS-03 — Harry's Rainbow — Focus Area Mismatch Confirmed

**NBS-specific:** Yes — FR-47 eligibility hard stop for thematic mismatch
**Prerequisite:** IT-NBS-02 complete

**Steps:**

1. If a red mismatch warning appeared on Step 3, verify it:
   - Cites housing/homelessness focus as Nationwide's core remit
   - Notes bereavement support has no housing nexus
   - Shows "I understand — return to my dashboard" button
2. Click **"I understand — return to my dashboard"**
3. Verify the application shows a red **"Ineligible"** badge on the dashboard

**If no mismatch appeared (unexpected):**

- Record as a defect — Harry's Rainbow (bereavement, Milton Keynes) has no alignment with housing outcomes

**Expected result:** Mismatch warning displayed; Ineligible badge on dashboard; FR-47 confirmed.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record mismatch reason shown by AI):**

---

### IT-NBS-04 — Homehaven Oldham Account Registration and Profile Setup

**NBS-specific:** No
**Prerequisite:** IT-NBS-03 complete

**Steps:**

1. Sign out of Harry's Rainbow account
2. Register `grantpathway+nationwide1@gmail.com` (first name James, last name Nkrumah)
3. Verify the email confirmation and click the verification link
4. Complete the charity profile using the Homehaven Oldham values in Pre-Test Setup above
5. Leave registration number blank (optional)
6. Save and confirm redirect to dashboard

**Expected result:** Registration completes; profile saves; dashboard accessible.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-NBS-05 — Homehaven Oldham — Nationwide Funder Picker

**NBS-specific:** Yes
**Prerequisite:** IT-NBS-04 complete

**Steps:**

1. Click **Start your first application** (new account — first-time onboarding state)
2. Type **"Nationwide"** in the funder picker
3. Confirm **Nationwide Building Society — Community Grants** appears with a **Structured** badge
4. Select it and enter grant name: **"Floating Support Service — Tenancy Sustainment 2026-28"**
5. Click **Continue**

**Expected result:** Funder appears with Structured badge; application created; Step 2 displayed.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-NBS-06 — Homehaven Oldham — PDF Upload and AI Summary

**NBS-specific:** Yes — tests third-party criteria PDF; no official application form available
**Prerequisite:** IT-NBS-05 complete

**Steps:**

1. On Step 2, upload `nationwide-community-grants-criteria-norfolk-foundation-2019.pdf`
2. Confirm the file is accepted; click **Continue**
3. On Step 3, start a stopwatch — summary auto-generates on page load
4. Stop when summary cards appear — record the time
5. Review all summary cards
6. Note: the criteria PDF does not contain specific application questions with word limits. Record whether the AI extracts:
   - (a) Specific numbered questions with word limits
   - (b) Section headings without word limits
   - (c) Implied narrative questions derived from criteria themes
   - (d) Nothing (falls back to "no questions found")
7. If no questions extracted from PDF alone — switch to paste mode and paste the key criteria and implied questions (as supplemented for Walton Charity). Record whether paste improves extraction.
8. Note whether a red eligibility mismatch warning appears; click **Continue**

**Expected result:**

- PDF uploads successfully
- AI summary generates within 30 seconds (NFR-01)
- Summary reflects housing focus, eligibility criteria, grant range
- Homehaven Oldham passes eligibility

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record summary time, what was extracted, and input method used):**

---

### IT-NBS-07 — Homehaven Oldham — Eligibility Check Passes; Preparation Checklist

**NBS-specific:** Yes
**Prerequisite:** IT-NBS-06 complete

**Steps:**

1. Confirm eligibility passed (no red mismatch warning)
2. Verify the **"Before you begin writing"** preparation checklist appears correctly
3. Click **"I have what I need — start writing"**

**Expected result:** Homehaven Oldham passes eligibility — floating support for recently housed people is a clear fit. Preparation checklist displayed correctly.

**If mismatch appears (unexpected):** Record as a defect and investigate.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-NBS-08 — Homehaven Oldham — AI Summary Content Accuracy

**NBS-specific:** Yes
**Prerequisite:** IT-NBS-06 complete

**Verify the summary includes:**

- Focus: housing need — safe home, settled home, thriving home
- Grant range: £10,000–£50,000; 1 or 2 years
- Income threshold: minimum £25,000 average annual income over 3 years
- Grant cap: maximum 25% of annual income per year
- Project cost: grant must be at least 50% of total project cost
- Operating requirement: at least 3 years with annual accounts
- Minimum 3 unrelated trustees; 2 unrelated bank signatories
- Safeguarding AND equal opportunities policies both required
- Real Living Wage requirement for all staff
- Key exclusions: vehicles, land, property acquisition, retrospective costs, religious/political promotion
- AI policy: flagged as not published / not stated

**Expected result:** Summary accurately reflects Nationwide criteria. No hallucinated conditions.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-NBS-09 — Homehaven Oldham — Question/Section Extraction

**NBS-specific:** Yes — key test of how the app handles criteria-only documentation
**Prerequisite:** IT-NBS-06 complete; preparation checklist confirmed

**Steps:**

1. On Step 4, record the total number of question/section cards displayed
2. For each card, record: question/section text and displayed word limit (if any)
3. Note which of the following the AI produced:

| Extraction type                     | Description                                            | Observed? |
| ----------------------------------- | ------------------------------------------------------ | --------- |
| Specific questions with word limits | Numbered questions with explicit word/character counts |           |
| Section headings                    | Broad topic areas without specific word limits         |           |
| Implied questions                   | Narrative questions derived from criteria themes       |           |
| Free-form fallback                  | "No questions found" — manual entry mode               |           |

4. If questions were extracted — update the expected questions table in the Known Expected Behaviours section with actual values
5. Verify word counters display correctly for whatever limits are shown

**Expected result:** Some form of useful content appears in Step 4 — either questions, sections, or implied questions. Free-form fallback is acceptable and should be recorded as a finding, not a defect.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record all questions/sections and limits as observed):**

---

### IT-NBS-10 — Homehaven Oldham — Non-Narrative Question Handling

**NBS-specific:** Yes
**Prerequisite:** IT-NBS-06 complete

**Steps:**

1. Review Step 4 — confirm data-entry and upload fields are absent as writing cards (e.g. accounts upload, bank statement, governing documents, job descriptions — these are document uploads not narrative questions)
2. Check whether any budget/financial fields appear as writing cards or are absent
3. Verify "Ready to assemble" is not blocked by any unanswered optional question (D-LBF-01/03 fix)

**Expected result:** Document upload requirements absent from Step 4. Assembly gate works correctly.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-NBS-11 — Homehaven Oldham — Narrative Answer Writing and AI Assist

**NBS-specific:** No
**Prerequisite:** IT-NBS-09 complete

**Steps:**

1. Navigate to the first narrative question or section
2. Write an answer about Homehaven Oldham — floating support workers, tenancy sustainment, Oldham area, 350+ clients helped since 2018
3. Verify word counter displays correctly
4. Click **Help me improve this** — verify the refined answer:
   - Corrects spelling/grammar
   - Stays within any word limit
   - Does not add invented facts about the charity
5. Use the refined version and approve
6. **Over-limit hard stop test (if word limit present):** Paste text exceeding the limit — verify approve button disappears and red message appears (D-LBF-02 fix)
7. Trim or use AI assist to bring within limit — verify approve button reappears
8. Approve all remaining questions/sections

**Expected result:** Writing and approval flow works correctly. D-LBF-02 hard stop confirmed if word limits are present.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-NBS-12 — Homehaven Oldham — Answer Approval and Step 5 Navigation

**NBS-specific:** No
**Prerequisite:** IT-NBS-11 complete

**Steps:**

1. Approve all mandatory question/section cards
2. Verify progress bar reaches "Ready to assemble"
3. Click **Ready to assemble** → confirm senior review screen
4. Click **Yes — assemble my draft**
5. On Step 5, verify:
   - Correct funder (Nationwide Building Society — Community Grants) and grant name displayed
   - All approved answers shown
6. Tick all three review checkboxes and click **Approve my application**
7. Confirm approval modal shows correct details

**Expected result:** Assembly and approval flow completes correctly.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### IT-NBS-13 — Homehaven Oldham — Export; Timestamp; Re-export Warning

**NBS-specific:** No
**Prerequisite:** IT-NBS-12 complete

**Steps:**

1. Click **Download as Word document (.docx)**
2. Open the downloaded file and verify:
   - Title: **"Floating Support Service — Tenancy Sustainment 2026-28"**
   - Funder: **"Nationwide Building Society — Community Grants"**
   - Export date includes time — e.g. **"04 June 2026, 14:30"** (D-WF-05 fix)
   - AI disclaimer present and correctly worded
   - All approved answers present
3. Click **Download as Word document (.docx)** again
4. Verify the re-export warning dialog appears with full timestamp including HH:MM (D-LBF-04 fix)
5. Cancel
6. Click **Download as plain text (.txt)** — verify re-export dialog appears, confirm, and verify .txt file is delivered (D-LBF-05 fix)

**Expected result:**

- Export timestamp includes HH:MM ✅
- Re-export dialog shows full timestamp ✅
- Plain text file downloads successfully ✅

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record export timestamps):**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-04 | Rapidglobe Ltd | Initial test plan — Nationwide Building Society Community Grants. Two test accounts: Harry's Rainbow (thematic mismatch — bereavement vs housing) and Homehaven Oldham (happy path, floating support for recently housed individuals). 13 test cases. Notes: no downloadable application form (portal-only); no AI policy published; programme may be between rounds. Third-party criteria PDF used as guidelines source. All lessons from LBF and WC cycles incorporated. |
