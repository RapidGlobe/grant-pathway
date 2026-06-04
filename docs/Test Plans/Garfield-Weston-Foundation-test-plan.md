# Garfield Weston Foundation — Regular Grants Test Plan

**Version:** 1.5
**Date:** 2026-06-04
**Status:** Ready for execution
**Tester:** WJ
**Test accounts:** grantpathway+idle1@gmail.com (Harry's Rainbow — broad eligibility pass test) · grantpathway+garfield1@gmail.com (Greenfield Community Trust — happy path, new account)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the **Garfield Weston Foundation Regular Grants** programme. Garfield Weston is one of the UK's largest independent grant-making foundations, distributing around £60 million per year across nine sectors: Arts, Community, Education, Environment, Faith, Health, Museums and Heritage, Welfare, and Youth. Regular Grants are for amounts under £100,000 and are accepted on a rolling basis with no deadlines.

**This is the first test of the FREE-FORM (narrative) path in Grant Pathway.** Unlike all previous test funders (which publish structured numbered questions with word limits), Garfield Weston asks applicants to submit a free-format typed proposal of up to 10 pages A4. The app should extract the proposal sections from the guidelines and present a section-by-section writing interface in Step 4 — not question cards. This tests a fundamentally different application path.

**This test plan runs two accounts:**

1. **Harry's Rainbow (broad eligibility pass test)** — Children's bereavement charity, Milton Keynes. Garfield Weston funds Health and Welfare sectors broadly — bereavement support for children falls within scope. The AI is **not** expected to flag a mismatch. This tests that the app correctly avoids false-positive eligibility triggers for broadly inclusive funders.

2. **Greenfield Community Trust (happy path)** — Fictional community welfare charity in Sunderland. Core costs application. Tests the full end-to-end free-form path through to export.

**Guidelines source:** Garfield Weston publishes a downloadable **PDF** (Application Guidelines, April 2026, 11 pages). Tests the PDF upload path.

**AI policy:** None stated in the April 2026 guidelines. No mention of AI anywhere in the document. The summary should flag the absence rather than fabricating a policy.

**Key characteristics of the free-form path:**
- Proposal is a single document, maximum 10 pages A4, minimum 11pt font
- No appendices permitted — all content within the proposal
- Sections suggested but not mandatory — the AI should extract them as writing sections
- No per-section word limits — only the overall 10-page constraint
- Finances section includes projected income and expenditure tables — likely to appear as a budget section rather than a narrative writing card
- Trustees decide the grant amount — applicants do not have to request a specific figure

---

## Pre-Test Setup

### Guidelines file — already downloaded
File: `docs/Grant Org Guidelines/garfield-weston-foundation-application-guidelines-2026.pdf`
Source: https://garfieldweston.org/wp-content/uploads/2026/04/Application-guidelines.pdf

### Account 1 — Harry's Rainbow (existing)
- Email: `grantpathway+idle1@gmail.com`
- Verify the original Harry's Rainbow profile is in place. Revert if modified.

### Account 2 — Greenfield Community Trust (new account to create)
Register `grantpathway+garfield1@gmail.com` and set up the following charity profile:

| Field | Value |
|-------|-------|
| First name | Priya |
| Last name | Sharma |
| Charity name | Greenfield Community Trust |
| Registration number | (leave blank — optional) |
| What does your charity do? | Greenfield Community Trust provides welfare support, food assistance, and social activities for older people and families experiencing poverty in Sunderland. We run a community hub offering a hot meal service, welfare benefits advice, digital inclusion classes, and a befriending programme for isolated older residents. Since 2015 we have supported over 800 people each year across three community venues in South Sunderland. |
| Who does your charity help? | Older people and families experiencing poverty, social isolation, or financial hardship in Sunderland. Around 60% of our beneficiaries are aged 65 or over; 40% are working-age adults and families on low incomes. |
| Where do you work? | Sunderland, North East England |

---

## Test Data

### Account 1 — Harry's Rainbow (broad eligibility pass test)

| Item | Value |
|------|-------|
| Test user email | grantpathway+idle1@gmail.com |
| Charity name | Harry's Rainbow |
| Funder | Garfield Weston Foundation |
| Grant name | Welfare Support Grant 2026 |
| Guidelines file | garfield-weston-foundation-application-guidelines-2026.pdf |
| Expected eligibility outcome | **Pass** (Garfield Weston funds Welfare/Health broadly — bereavement support qualifies) |

### Account 2 — Greenfield Community Trust (happy path)

| Item | Value |
|------|-------|
| Test user email | grantpathway+garfield1@gmail.com |
| Charity name | Greenfield Community Trust |
| Funder | Garfield Weston Foundation |
| Grant name | Community Hub Core Costs 2026 |
| Grant amount | ~£50,000 (core costs, ~14% of £350,000 annual income — within 10–20% guideline) |
| Guidelines file | garfield-weston-foundation-application-guidelines-2026.pdf |
| Guidelines input method | File upload (PDF) |
| Expected eligibility outcome | Pass |

---

## Known Expected Behaviours

| Ref | Description |
|-----|-------------|
| IT-GWF-02 | Harry's Rainbow is **not** expected to trigger a mismatch. Garfield Weston funds Welfare and Health broadly — bereavement support for children is within scope. If a mismatch is triggered, record as a defect (false positive). |
| Free-form path | Step 4 shows a section-by-section interface, not numbered question cards. This is the first test of the narrative path. The number and names of sections depend on what the AI extracts from the PDF. |
| No per-section word limits | Garfield Weston specifies no word limits per section — only a 10-page overall limit. The app should not show word limit badges on section cards, or may show a general page-count advisory. |
| Finance sections | Sections covering projected income tables, expenditure breakdown, and income narrative may appear as budget/financial sections or may be absent from writing cards (non-narrative data). Record what appears. |
| No AI policy | Not published by Garfield Weston. Summary should flag absence. |
| No specific amount required | Garfield Weston does not require applicants to specify a grant amount. Trustees decide. The summary should reflect this. |
| Reapplication bar | Must wait 12 months after any outcome before reapplying. Verify this appears in key requirements. |

---

## Expected Proposal Sections (Greenfield Community Trust application)

Based on the published guidelines. The AI may extract all, some, or variations of these. The table will be updated with actual observed values after IT-GWF-06.

| # | Section | Suggested content | Word limit | Expected? |
|---|---------|-------------------|------------|-----------|
| 1 | Executive Summary | Organisation overview, need, location, reach, difference made, request | None stated | Yes |
| 2 | Your Work — Need | What need is addressed; why it matters; what services are delivered | None stated | Yes |
| 3 | Your Work — Reach and Impact | Impact and difference made; who benefits; how many people | None stated | Yes |
| 4 | Your Work — Equity, Diversity and Inclusion | EDI approach; how it informs the work | None stated | Yes |
| 5 | Your Work — Partnerships | Collaborations and partner organisations | None stated | Possibly |
| 6 | Your People | Senior team experience; Trustee skills | None stated | Yes |
| 7 | Your Finances | Income plan, expenditure, Plan B narrative | None stated | Yes (may be budget section) |
| 8 | Your Request | Financial need and shortfall; amount optional | None stated | Yes |

**Non-narrative financial content expected to be absent from writing cards:**
- Projected income table (Source / Anticipated / Confirmed / Notes)
- Planned expenditure table (Salaries / Training / Activity / Office / Building / Legal / Governance)

---

## Test Results Summary

| Test ID | Test Name | GWF-specific | AI Summary Time | Result | Notes |
|---------|-----------|-------------|----------------|--------|-------|
| IT-GWF-01 | Harry's Rainbow sign in and profile verification | No | N/A | ✅ Pass | |
| IT-GWF-02 | Harry's Rainbow — Garfield Weston funder picker and guidelines upload | Yes | 33s | ✅ Pass | Narrative badge confirmed in picker. 11 sections extracted. 33s slightly over NFR-01 30s target — noted, not a failure. |
| IT-GWF-03 | Harry's Rainbow — eligibility passes (no false-positive mismatch) | Yes | N/A | ✅ Pass | No mismatch warning — summary displayed immediately. FR-47 correctly not triggered for a broadly eligible charity. |
| IT-GWF-04 | Greenfield Community Trust account registration and profile setup | No | N/A | ✅ Pass | |
| IT-GWF-05 | Greenfield Community Trust — Garfield Weston funder picker | Yes | N/A | ✅ Pass | |
| IT-GWF-06 | Greenfield Community Trust — PDF upload and AI summary | Yes | | ☐ Pass ☐ Fail ☐ Blocked | |
| IT-GWF-07 | Greenfield Community Trust — eligibility check passes; preparation checklist | Yes | N/A | ✅ Pass | D-GWF-01 raised: Step 4 served stale cached page after prep checklist — Ctrl+Shift+R required as workaround. Fixed: revalidatePath() added to all step/4 redirects. |
| IT-GWF-08 | Greenfield Community Trust — AI summary content accuracy | Yes | N/A | ✅ Pass | Summary accurate and comprehensive. AI policy absence handled gracefully. Budget section wording updated: "AI cannot generate these" → "AI cannot assist you with this". |
| IT-GWF-09 | Greenfield Community Trust — section extraction and free-form interface | Yes | N/A | ✅ Pass | All 11 sections present in correct order with correct guidance text. No word limits shown (correct). Budget sections 8 and 9 correctly flagged amber with Budget badge. Free-form interface confirmed (no numbered Q cards). |
| IT-GWF-10 | Greenfield Community Trust — non-narrative content handling; finance sections | Yes | N/A | ✅ Pass | No financial table cards. Budget sections are free-text with Budget badge. No AI assist button on budget sections. Ready to assemble correctly greyed until all 11 approved. |
| IT-GWF-11 | Greenfield Community Trust — section writing and AI assist | No | N/A | ✅ Pass | AI assist working on narrative sections. Budget sections correctly have no AI assist button. All 11 sections written and approved. |
| IT-GWF-12 | Greenfield Community Trust — section approval and Step 5 navigation | No | N/A | ✅ Pass | Assembly and approval flow completed correctly. |
| IT-GWF-13 | Greenfield Community Trust — export; timestamp; re-export warning | No | N/A | ☐ Pass ☐ Fail ☐ Blocked | |

---

## Defect Log

| ID | Test | Description | Severity | Status |
|----|------|-------------|----------|--------|
| D-GWF-01 | IT-GWF-07 | Step 4 served stale cached page after prep checklist redirect — free-form sections were in the database but the page showed the "No specific questions found" fallback. Ctrl+Shift+R (hard refresh) resolved it. Root cause: Next.js App Router serving cached HTML after Server Action redirect. Fixed by adding revalidatePath() before all redirect() calls to step/4 in actions/applications.ts. | Medium | Fixed |

---

## Test Cases

---

### IT-GWF-01 — Harry's Rainbow Sign In and Profile Verification

**GWF-specific:** No
**Prerequisite:** None

**Steps:**
1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Sign in as `grantpathway+idle1@gmail.com`
3. Verify the original Harry's Rainbow profile (bereavement charity, Milton Keynes)
4. Revert if modified from previous testing

**Expected result:** Sign in succeeds; original Harry's Rainbow profile confirmed.

**Result:** ✅ Pass

**Notes:**

---

### IT-GWF-02 — Harry's Rainbow — Garfield Weston Funder Picker and Guidelines Upload

**GWF-specific:** Yes
**Prerequisite:** IT-GWF-01 complete

**Steps:**
1. From the dashboard, click **+ New Application**
2. Type **"Garfield"** in the funder picker
3. Confirm **Garfield Weston Foundation** appears — note the badge type (Structured or Narrative/Free-form)
4. Select it and enter grant name: **"Welfare Support Grant 2026"**
5. Click **Continue**
6. On Step 2, upload `garfield-weston-foundation-application-guidelines-2026.pdf`
7. Confirm file accepted; click **Continue**
8. On Step 3, start a stopwatch — record time when summary cards appear
9. Note whether a red eligibility mismatch warning appears

**Expected result:**
- Garfield Weston Foundation appears in picker
- PDF uploads successfully
- AI summary generates without error
- **No mismatch warning** (Harry's Rainbow is eligible — Welfare/Health sector)

**If Garfield Weston does not appear in picker:** Log as a defect — funder not seeded.

**Result:** ✅ Pass

**Notes:** Narrative badge confirmed in funder picker. PDF uploaded successfully. AI summary generated in 33s (marginally over 30s NFR-01 — noted). 11 sections extracted correctly matching the guidelines exactly. Summary content accurate and comprehensive.

---

### IT-GWF-03 — Harry's Rainbow — Eligibility Passes (No False-Positive Mismatch)

**GWF-specific:** Yes — tests FR-47 does NOT trigger for a broadly eligible charity
**Prerequisite:** IT-GWF-02 complete

**Steps:**
1. Verify normal summary cards are displayed with no red mismatch warning
2. Confirm the **Continue** button is available (not blocked)
3. Click **Continue** → confirm the preparation checklist appears
4. Return to dashboard — confirm application shows **no** Ineligible badge

**Expected result:** No mismatch warning. Application proceeds normally. Dashboard shows application in progress, not ineligible.

**If a mismatch warning appears (unexpected):** Record as **D-GWF-01** — false positive eligibility trigger. Note the reason given by the AI. Bereavement support for children is within Garfield Weston's Welfare/Health scope.

**Result:** ✅ Pass

**Notes:** No mismatch warning appeared — summary displayed immediately. Harry's Rainbow correctly identified as eligible for Garfield Weston (Welfare/Health sector). FR-47 does not false-positive for broadly inclusive funders. ✅

---

### IT-GWF-04 — Greenfield Community Trust Account Registration and Profile Setup

**GWF-specific:** No
**Prerequisite:** IT-GWF-03 complete

**Steps:**
1. Sign out of Harry's Rainbow account
2. Register `grantpathway+garfield1@gmail.com` (first name Priya, last name Sharma)
3. Verify email and click the verification link
4. Complete the Greenfield Community Trust charity profile using the values in Pre-Test Setup
5. Leave registration number blank (optional)
6. Save and confirm redirect to dashboard

**Expected result:** Registration completes; profile saves; dashboard accessible.

**Result:** ✅ Pass

**Notes:**

---

### IT-GWF-05 — Greenfield Community Trust — Garfield Weston Funder Picker

**GWF-specific:** Yes
**Prerequisite:** IT-GWF-04 complete

**Steps:**
1. Click **Start your first application**
2. Type **"Garfield"** in the funder picker
3. Confirm **Garfield Weston Foundation** appears with the correct badge
4. Select it and enter grant name: **"Community Hub Core Costs 2026"**
5. Click **Continue**

**Expected result:** Funder appears; application created; Step 2 displayed.

**Result:** ✅ Pass

**Notes:**

---

### IT-GWF-06 — Greenfield Community Trust — PDF Upload and AI Summary

**GWF-specific:** Yes — first test of free-form funder summary
**Prerequisite:** IT-GWF-05 complete

**Steps:**
1. On Step 2, upload `garfield-weston-foundation-application-guidelines-2026.pdf`
2. Confirm file accepted; click **Continue**
3. Start a stopwatch — record time when summary cards appear
4. Review all summary cards
5. Note how many sections the AI identified and what the summary bar says (e.g. "We found X sections")
6. Note whether a red eligibility mismatch warning appears
7. Click **Continue**

**Expected result:**
- PDF uploads successfully
- AI summary generates within 30 seconds (NFR-01)
- Summary reflects broad sector coverage, free-form proposal format, 10-page limit, no deadlines
- Greenfield Community Trust passes eligibility

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record summary time, number of sections identified, and eligibility outcome):**

---

### IT-GWF-07 — Greenfield Community Trust — Eligibility Check Passes; Preparation Checklist

**GWF-specific:** Yes
**Prerequisite:** IT-GWF-06 complete

**Steps:**
1. Confirm eligibility passed (no red mismatch warning)
2. Verify the **"Before you begin writing"** preparation checklist appears
3. Click **"I have what I need — start writing"**

**Expected result:** Greenfield Community Trust passes — community welfare charity in Welfare sector is a clear fit. Preparation checklist displayed correctly.

**Result:** ✅ Pass

**Notes:** Eligibility passed. Preparation checklist appeared correctly. D-GWF-01 raised — Step 4 showed stale cached page (free-form fallback) after clicking "I have what I need". Ctrl+Shift+R resolved it. Fix deployed: revalidatePath() added to all step/4 redirects.

---

### IT-GWF-08 — Greenfield Community Trust — AI Summary Content Accuracy

**GWF-specific:** Yes
**Prerequisite:** IT-GWF-06 complete

**Verify the summary includes:**
- Sectors funded: Arts, Community, Education, Environment, Faith, Health, Museums and Heritage, Welfare, Youth
- Grant type: Regular Grants under £100,000; free-format proposal up to 10 pages A4
- No deadlines — rolling open all year
- Grant sizing: typically 10–20% of organisation's annual budget/project costs
- Local community capital grants capped at £30,000
- No appendices permitted
- Eligibility: UK registered charities and CIOs only; at least 1 year of accounts required
- Key exclusions: CICs, social enterprises, local authorities, individuals, organisations under 1 year old
- Decision timescale: currently 4–6 months
- Reapplication: must wait 12 months after any outcome
- Amount: applicants do not need to specify — Trustees decide
- AI policy: not published / not stated

**Expected result:** Summary accurately reflects Garfield Weston guidelines. No hallucinated conditions.

**Result:** ✅ Pass

**Notes:** Summary accurate — sectors, grant amounts, 10-page limit, no deadlines, eligibility, exclusions, 12-month reapplication bar, Major Grant thresholds all correct. No AI policy flagged as absent. Budget section wording improved during this test.

---

### IT-GWF-09 — Greenfield Community Trust — Section Extraction and Free-Form Interface

**GWF-specific:** Yes — key test of the narrative/free-form path
**Prerequisite:** IT-GWF-06 complete; preparation checklist confirmed

**Steps:**
1. On Step 4, confirm the interface shows **sections**, not numbered question cards
2. Record the total number of section cards displayed
3. For each section card, record: section title and any word/page limit shown
4. Check against the expected sections table above and record actual values:

| Expected section | Present? | Actual title shown | Limit shown |
|-----------------|----------|--------------------|-------------|
| Executive Summary | | | |
| Your Work — Need | | | |
| Your Work — Reach and Impact | | | |
| Your Work — EDI | | | |
| Your People | | | |
| Your Finances | | | |
| Your Request | | | |

5. Note whether any limit badge appears (should be absent or show "10 pages total")
6. Note whether the "Ready to assemble" button behaviour differs from structured funders

**Expected result:** Section-by-section interface appears. Sections broadly match the guidelines headings. No per-section word limits. Free-form interface confirmed.

**Result:** ✅ Pass

**Notes:** All 11 sections present in correct order. Section titles and guidance text match guidelines exactly. No word limit badges — counter shows "0 words" only (correct, no per-section limits). Budget badge on sections 8 (Your Finances) and 9 (Income Plan). Section-by-section interface confirmed — no numbered question cards. "Ready to assemble" button visible — clickability to be verified in IT-GWF-10.

---

### IT-GWF-10 — Greenfield Community Trust — Non-Narrative Content Handling; Finance Sections

**GWF-specific:** Yes
**Prerequisite:** IT-GWF-06 complete

**Steps:**
1. Review Step 4 — confirm projected income/expenditure table requests are absent as writing cards (these are financial tables, not narrative text)
2. Check how the finances section appears — is it a writing card, a budget card, or absent?
3. If a finances section appears, note whether it has any special treatment vs other sections
4. Verify "Ready to assemble" is not blocked by any optional sections left empty (D-LBF-01/03 fix)

**Expected result:** Financial tables absent from narrative writing cards (or treated as budget sections). Assembly gate works correctly.

**Result:** ✅ Pass

**Notes:** No financial table fields as separate cards. Budget sections (8 and 9) appear as free-text areas with Budget badge. No AI assist button on budget sections. Ready to assemble correctly greyed until all 11 sections approved.

---

### IT-GWF-11 — Greenfield Community Trust — Section Writing and AI Assist

**GWF-specific:** No — tests free-form writing path
**Prerequisite:** IT-GWF-09 complete

**Steps:**
1. Navigate to the **Executive Summary** section
2. Write 2 paragraphs about Greenfield Community Trust — what it does, the need addressed, Sunderland location, 800+ people supported, what you're asking for
3. Verify word counter displays (even without a hard limit, should show count)
4. Click **Help me improve this** — verify the refined text:
   - Improves clarity
   - Stays focused on the section topic
   - Does not invent facts about the charity
5. Use the refined version and approve
6. Navigate to **Your Work — Need** section
7. Write about the poverty and isolation faced by older people and families in South Sunderland
8. Approve without AI assist (user-authored path)
9. **D-LBF-02 check:** Paste a very long block of text into a section with a word limit (if any). If no limit is shown, note that D-LBF-02 hard stop is not triggered — this is correct for sections without word limits
10. Approve remaining sections

**Expected result:** Writing and approval flow works correctly across all sections. AI assist produces useful improvements. Word counter visible even without hard limits.

**Result:** ✅ Pass

**Notes:** AI assist working on narrative sections. Budget sections correctly have no AI assist button. All 11 sections written and approved.

---

### IT-GWF-12 — Greenfield Community Trust — Section Approval and Step 5 Navigation

**GWF-specific:** No
**Prerequisite:** IT-GWF-11 complete

**Steps:**
1. Approve all mandatory section cards
2. Verify progress bar reaches "Ready to assemble"
3. Click **Ready to assemble** → confirm senior review screen
4. Click **Yes — assemble my draft**
5. On Step 5, verify:
   - Correct funder (Garfield Weston Foundation) and grant name displayed
   - All approved section content shown in read-only view
6. Tick all three review checkboxes and click **Approve my application**
7. Confirm approval modal shows correct details

**Expected result:** Assembly and approval flow completes correctly for a free-form proposal.

**Result:** ✅ Pass

**Notes:** Assembly and approval flow completed correctly.

---

### IT-GWF-13 — Greenfield Community Trust — Export; Timestamp; Re-export Warning

**GWF-specific:** No
**Prerequisite:** IT-GWF-12 complete

**Steps:**
1. Click **Download as Word document (.docx)**
2. Open the downloaded file and verify:
   - Title: **"Community Hub Core Costs 2026"**
   - Funder: **"Garfield Weston Foundation"**
   - Export date includes time — e.g. **"04 June 2026, 15:00"** (D-WF-05 fix)
   - AI disclaimer present
   - All approved section content present
   - **Check formatting:** for a narrative proposal, sections should flow naturally (not numbered Q&A format)
3. Click **Download as Word document (.docx)** again — verify re-export dialog with HH:MM timestamp (D-LBF-04)
4. Click **Download as plain text (.txt)** — verify re-export dialog appears and .txt file downloads (D-LBF-05)

**Expected result:**
- Export timestamp includes HH:MM ✅
- Re-export dialog shows full timestamp ✅
- Plain text file downloads ✅
- Exported document formatted as a narrative proposal, not a Q&A list

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record export timestamps and comment on document formatting):**

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-06-04 | Rapidglobe Ltd | Initial test plan — Garfield Weston Foundation Regular Grants. First test of the free-form/narrative path. Two accounts: Harry's Rainbow (broad eligibility pass — no false-positive mismatch expected) and Greenfield Community Trust (happy path, community welfare, Sunderland). 13 test cases. Guidelines PDF April 2026 edition. No AI policy; no per-section word limits; 10-page total limit; rolling open all year. |
| 1.1 | 2026-06-04 | Rapidglobe Ltd | IT-GWF-01 passed — Harry's Rainbow sign in and profile verified. |
| 1.2 | 2026-06-04 | Rapidglobe Ltd | IT-GWF-02 and IT-GWF-03 passed. Narrative badge confirmed. 11 sections extracted correctly. Summary accurate. Harry's Rainbow passed eligibility — no false-positive mismatch for broadly inclusive funder. |
| 1.3 | 2026-06-04 | Rapidglobe Ltd | IT-GWF-04 and IT-GWF-05 passed. Greenfield Community Trust registered and funder picker confirmed. |
| 1.4 | 2026-06-04 | Rapidglobe Ltd | IT-GWF-07, 08, 09 passed. D-GWF-01 raised and fixed (revalidatePath on step/4 redirects). All 11 sections confirmed. Budget wording improved. 9/13 complete. |
| 1.5 | 2026-06-04 | Rapidglobe Ltd | IT-GWF-10, 11, 12 passed. No financial table cards. No AI assist on budget sections. Assembly and approval complete. 12/13 complete. |
