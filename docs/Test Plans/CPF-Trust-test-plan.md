# CPF Trust Test Plan

**Version:** 1.0
**Date:** 2026-06-17
**Status:** Ready for execution
**Tester:** WJ
**Test account:** grantpathway+cpf1@gmail.com (Elmwood Community Arts — happy path, new account)

---

## Overview

This test plan covers an end-to-end test of Grant Pathway using the **CPF Trust**. CPF Trust offers grants of **£1,000–£3,000** via a **500-word email application** to the grants team. The application process is **narrative**: no portal or structured question list — the applicant writes a short narrative in a single block, which is then sent directly to the funder by email.

**Application window:** The CPF Trust grants window runs **1 June to 30 September** only. The window is currently open (today is 17 June 2026). If this plan is executed outside this window, defer until the window reopens.

**Format note:** CPF Trust is a narrative funder with a hard 500-word limit on the email application. The Step 4 writing interface is expected to present a **single narrative card** rather than multiple discrete question cards. The AI assist should help shape the narrative within the word limit.

**Mismatch test:** Unlike the MKCF and Baily Thomas plans, this plan does not run a separate mismatch account. CPF Trust criteria should be reviewed before testing to confirm any eligibility restrictions. If the guidelines identify a clear restriction (e.g. geographic, sector-specific, or cause-area), flag it here and add a mismatch case before executing this plan.

**Guidelines source:** The CPF Trust criteria and email application guidance should be obtained from the CPF Trust website before testing. Save as `docs/Grant Org Guidelines/cpf-trust-criteria.pdf` (or `.txt`). The criteria document is expected to describe: the 500-word email format, the £1,000–£3,000 grant range, and the June–September application window.

---

## Pre-Test Setup

### Guidelines — access before testing

- Visit the CPF Trust website and obtain the grants criteria or guidance notes
- Save the criteria as `docs/Grant Org Guidelines/cpf-trust-criteria.pdf` (or paste into a `.txt` file)
- Confirm: the 500-word limit, the application window, the grant range (£1,000–£3,000), and any eligibility restrictions
- Update the Known Expected Behaviours section below if any restrictions are identified that were not known at the time of writing

### Account — Elmwood Community Arts (new account to create)

Register `grantpathway+cpf1@gmail.com` and set up the following charity profile:

| Field                       | Value                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First name                  | Alison                                                                                                                                                                                                                                                                                                                                                                  |
| Last name                   | Burrows                                                                                                                                                                                                                                                                                                                                                                 |
| Charity name                | Elmwood Community Arts                                                                                                                                                                                                                                                                                                                                                  |
| Registration number         | (leave blank — optional)                                                                                                                                                                                                                                                                                                                                                |
| What does your charity do?  | Elmwood Community Arts runs participatory arts projects — including drama, visual art, and music — for socially isolated adults and families in our local borough. We work with approximately 200 participants per year through weekly workshops, seasonal projects, and community exhibitions. We are a small registered charity and have been active for seven years. |
| Who does your charity help? | Socially isolated adults, young people, and families who face barriers to cultural participation, including those on low incomes, people with disabilities, and older people living alone.                                                                                                                                                                              |
| Where do you work?          | [Insert local borough/area — use a realistic UK local authority name appropriate to CPF Trust's geographic focus if applicable; update once criteria are reviewed]                                                                                                                                                                                                      |

**Note:** Review CPF Trust's eligibility criteria (geographic focus, cause area) before finalising the charity profile. Update "Where do you work?" to a location that fits their criteria if geographic restrictions apply.

---

## Test Data

| Item                         | Value                                                            |
| ---------------------------- | ---------------------------------------------------------------- |
| Test user email              | grantpathway+cpf1@gmail.com                                      |
| Charity name                 | Elmwood Community Arts                                           |
| Funder                       | CPF Trust                                                        |
| Grant name                   | Community Arts Participation Programme Summer 2026               |
| Grant amount                 | £2,500 (within CPF Trust range £1,000–£3,000)                    |
| Guidelines source            | CPF Trust criteria (paste or PDF upload)                         |
| Expected eligibility outcome | Pass (subject to criteria review in Pre-Test Setup)              |
| Application window           | Currently open (1 Jun–30 Sep 2026). Execute before 30 September. |

---

## Known Expected Behaviours

| Ref                    | Description                                                                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Narrative format       | CPF Trust is a narrative funder. Step 4 is expected to display a single writing card rather than multiple structured question cards. Confirm actual card count during IT-CPF-06.                                                                                         |
| 500-word limit         | The email application is capped at 500 words. The word counter on the single narrative card should enforce this limit. The over-limit hard stop (approve button disappears) must be confirmed.                                                                           |
| Application window     | CPF Trust only accepts applications 1 June–30 September. The app does not currently enforce funder-specific date windows — note whether any advisory warning is shown. This is an observation, not a defect, unless the summary fails to surface the window restriction. |
| AI summary window note | The AI summary (Step 3) should extract and surface the June–September window as part of the key facts or eligibility criteria.                                                                                                                                           |
| Export format          | For a 500-word email application, the Word export should produce a document suitable for copy-pasting into an email. Verify the content reads as a coherent narrative, not a structured Q&A.                                                                             |
| AI policy              | Check the CPF Trust website for any statement on AI-generated content. Flag as absent rather than fabricated if none found.                                                                                                                                              |
| Mismatch check         | Review eligibility criteria before executing. If a geographic or sector restriction is identified, add a mismatch test case before executing this plan.                                                                                                                  |

---

## Test Results Summary

| Test ID   | Test Name                                                                   | CPF-specific | AI Summary Time | Result | Notes |
| --------- | --------------------------------------------------------------------------- | ------------ | --------------- | ------ | ----- |
| IT-CPF-01 | Elmwood Community Arts account registration and profile setup               | No           | N/A             |        |       |
| IT-CPF-02 | Elmwood Community Arts — CPF Trust funder picker                            | Yes          | N/A             |        |       |
| IT-CPF-03 | Elmwood Community Arts — guidelines upload/paste and AI summary             | Yes          |                 |        |       |
| IT-CPF-04 | Elmwood Community Arts — eligibility check passes; preparation checklist    | Yes          | N/A             |        |       |
| IT-CPF-05 | Elmwood Community Arts — AI summary content accuracy and application window | Yes          | N/A             |        |       |
| IT-CPF-06 | Elmwood Community Arts — narrative card count and 500-word limit            | Yes          | N/A             |        |       |
| IT-CPF-07 | Elmwood Community Arts — narrative answer writing and AI assist             | No           | N/A             |        |       |
| IT-CPF-08 | Elmwood Community Arts — over-limit hard stop (500 words)                   | Yes          | N/A             |        |       |
| IT-CPF-09 | Elmwood Community Arts — answer approval and assembly                       | No           | N/A             |        |       |
| IT-CPF-10 | Elmwood Community Arts — export; Word document verified; re-export warning  | No           | N/A             |        |       |

---

## Defect Log

| ID  | Test | Description | Severity | Status |
| --- | ---- | ----------- | -------- | ------ |

---

## Test Cases

---

### IT-CPF-01 — Elmwood Community Arts Account Registration and Profile Setup

**CPF-specific:** No
**Prerequisite:** CPF Trust guidelines obtained and pre-test setup complete

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Register `grantpathway+cpf1@gmail.com` (first name Alison, last name Burrows)
3. Verify the email and click the verification link
4. On first login, complete the charity profile using the Elmwood Community Arts values in the Pre-Test Setup table above
5. Confirm the "Where do you work?" field reflects a location appropriate to CPF Trust's criteria (update if criteria indicate a geographic restriction)
6. Save the profile and confirm redirect to dashboard

**Expected result:**

- Registration and email verification completes without error
- Charity profile saves successfully
- Dashboard shows profile complete (no incomplete banner)

**Result:**

**Notes:**

---

### IT-CPF-02 — Elmwood Community Arts — CPF Trust Funder Picker

**CPF-specific:** Yes
**Prerequisite:** IT-CPF-01 complete

**Steps:**

1. From the dashboard, click **+ New Application**
2. Type **"CPF"** in the funder picker
3. Confirm **CPF Trust** appears with a **Narrative** badge (expected for a 500-word email narrative funder — confirm actual badge type)
4. Select it
5. Enter grant name: **"Community Arts Participation Programme Summer 2026"**
6. Click **Continue**

**Expected result:**

- CPF Trust appears in the funder picker
- Funder type badge is Narrative (or confirm actual badge observed)
- Application created and Step 2 displayed

**Result:**

**Notes (record the badge type shown — Narrative or Structured):**

---

### IT-CPF-03 — Elmwood Community Arts — Guidelines Upload/Paste and AI Summary

**CPF-specific:** Yes — tests narrative funder guidelines input
**Prerequisite:** IT-CPF-02 complete; CPF Trust criteria file ready

**Steps:**

1. On Step 2, upload the CPF Trust criteria PDF (if available) — or paste the criteria text
2. Click **Continue**
3. On Step 3, start a stopwatch — AI summary auto-generates on page load
4. Stop when summary cards appear — record the time
5. Review all summary cards — confirm the summary covers:
   - Grant range (£1,000–£3,000)
   - Application window (June–September)
   - 500-word limit
   - Any eligibility criteria or sector/geographic restrictions
6. Note whether a red eligibility mismatch warning appears (not expected)

**Expected result:**

- Guidelines accepted and AI summary generates within NFR-01 (≤45 seconds)
- Summary cards cover the grant range, application window, word limit, and eligibility criteria
- No mismatch warning (Elmwood Community Arts should pass)

**Result:**

**Notes (record summary time and which criteria were extracted):**

---

### IT-CPF-04 — Elmwood Community Arts — Eligibility Check Passes; Preparation Checklist

**CPF-specific:** Yes
**Prerequisite:** IT-CPF-03 complete

**Steps:**

1. Confirm no mismatch warning appeared
2. Click **Continue** to Step 4
3. Verify the **"Before you begin writing"** preparation checklist appears correctly
4. Click **"I have what I need — start writing"**

**Expected result:**

- Elmwood Community Arts passes eligibility
- Preparation checklist displays correctly
- Step 4 loads with writing card(s)

**If mismatch appears (unexpected):**

- Record the mismatch reason as a defect; review the CPF Trust criteria for any restriction not identified in Pre-Test Setup; update the Known Expected Behaviours table

**Result:**

**Notes:**

---

### IT-CPF-05 — Elmwood Community Arts — AI Summary Content Accuracy and Application Window

**CPF-specific:** Yes
**Prerequisite:** IT-CPF-03 complete

**Verify the summary includes:**

- **Application window:** June–September (must be surfaced — this is a key risk for applicants who miss the window)
- **Grant range:** £1,000–£3,000
- **500-word limit:** mentioned or implied
- Any eligibility restrictions identified from the criteria
- AI policy (flag as absent if not found)

**Expected result:**

- Application window (June–September) clearly surfaced in summary
- Grant range and word limit present
- No hallucinated conditions

**Result:**

**Notes (record whether the application window was prominently surfaced in the summary cards):**

---

### IT-CPF-06 — Elmwood Community Arts — Narrative Card Count and 500-Word Limit

**CPF-specific:** Yes — key test for narrative funder format
**Prerequisite:** IT-CPF-04 complete

**Steps:**

1. On Step 4, count the total number of writing cards displayed
2. **Expected:** one narrative card for the full 500-word email application
3. Record the word/character limit displayed on the card — confirm it reads 500 words (or character equivalent)
4. Note whether the card has a descriptive label (e.g. "Your application" or "About your project")
5. Note whether there is a secondary card for any additional information (e.g. a budget narrative card)

**Expected result:**

- A single narrative writing card is displayed (or a small number reflecting the email structure)
- Word limit reads 500 words
- Card label is intelligible

**Result:**

**Notes (record actual card count, word limit displayed, and card label text):**

---

### IT-CPF-07 — Elmwood Community Arts — Narrative Answer Writing and AI Assist

**CPF-specific:** No
**Prerequisite:** IT-CPF-06 complete

**Steps:**

1. Write a narrative answer covering Elmwood Community Arts — what they do, who they help, the specific project being funded, and the expected impact; aim for approximately 450 words
2. Verify the word counter is correct and updates in real time
3. Click **Help me improve this** — verify the refined answer:
   - Corrects spelling/grammar
   - Stays within the 500-word limit
   - Does not add invented facts about Elmwood Community Arts
4. Accept or dismiss the refined version
5. Verify the word counter after accepting
6. Approve the answer

**Expected result:**

- Word counter accurate and updates in real time
- AI assist produces a coherent, within-limit narrative
- Answer approved successfully

**Result:**

**Notes:**

---

### IT-CPF-08 — Elmwood Community Arts — Over-Limit Hard Stop (500 Words)

**CPF-specific:** Yes — 500-word limit is a hard requirement for CPF Trust
**Prerequisite:** IT-CPF-07 complete

**Steps:**

1. On the narrative card, paste a block of text that exceeds 500 words (prepare a 550-word block beforehand)
2. Verify:
   - Word counter turns red (or similar visual indicator)
   - The **Approve** button disappears or is disabled
   - A red warning message appears instructing the user to reduce the word count
3. Trim the text to below 500 words — verify:
   - Word counter returns to normal colour
   - Approve button reappears

**Expected result:**

- Over-limit hard stop enforced correctly at 500 words
- Approve button disappears when over limit; reappears when within limit
- Red warning message present

**Result:**

**Notes:**

---

### IT-CPF-09 — Elmwood Community Arts — Answer Approval and Assembly

**CPF-specific:** No
**Prerequisite:** IT-CPF-08 complete; all cards approved

**Steps:**

1. Approve all mandatory writing cards
2. Verify the progress bar reaches "Ready to assemble"
3. Click **Ready to assemble**
4. Verify the **"Before we put it together"** senior review screen appears
5. Click **Yes — assemble my draft**
6. On Step 5, verify:
   - Correct funder (CPF Trust) and grant name displayed
   - Approved narrative shown in read-only view

**Expected result:**

- Assembly completes correctly
- Step 5 displays correct funder (CPF Trust) and grant name

**Result:**

**Notes:**

---

### IT-CPF-10 — Elmwood Community Arts — Export; Word Document Verified; Re-export Warning

**CPF-specific:** No
**Prerequisite:** IT-CPF-09 complete

**Steps:**

1. Tick all three review checkboxes on Step 5
2. Click **Download as Word document (.docx)**
3. Open the downloaded .docx file and verify:
   - Title: **"Community Arts Participation Programme Summer 2026"**
   - Funder: **"CPF Trust"** (or similar)
   - Export date includes time (e.g. **"17 June 2026, 10:30"**)
   - AI disclaimer present and correctly worded
   - The narrative reads as a coherent 500-word letter/email — not as a structured Q&A format
4. Click **Download as Word document (.docx)** again
5. Verify the re-export warning dialog appears with the prior export timestamp
6. Cancel — do not re-export
7. Click **Download as plain text (.txt)** and verify a .txt file is downloaded

**Expected result:**

- Word export opens correctly in Microsoft Word
- The narrative reads as a coherent email application (not a bulleted Q&A)
- Export date includes HH:MM timestamp
- Re-export warning shows full timestamp
- Plain text download works

**Result:**

**Notes (note whether the exported document is formatted appropriately for email submission):**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                          |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-17 | Rapidglobe Ltd | Initial test plan — CPF Trust. Single account (Elmwood Community Arts). Narrative funder, 500-word email application, June–September window. 10 test cases. Key checks: single narrative card, 500-word hard stop, application window in AI summary, coherent narrative export. |
