# A B Charitable Trust Test Plan — Flagship

**Version:** 2.3
**Date:** 2026-07-27
**Status:** ⚠️ **Production run in progress, 2026-08-19 (`P5.5`)** — results recorded per case as `Notes — 2026-08-19, production run`. **The 2026-07-27 results below were earned on `grant-pathway-dev` and are not evidence about production**; they stand as their own record. **ABC-01 through ABC-05 Pass — AI summary generated in 22 seconds; the Step 3 banner reported 3 questions plus 1 financial detail, matching the dev run exactly.** ⚠️ **Account substitution for the whole production run: `grantpathway+RT01test@gmail.com`**, signed in rather than registered, to limit the number of real accounts created on production (WJ). Permitted by the flagship coverage rule's "registration **or login** for returning test user"; registration is covered by `RT-01a` on production the same day. **Previously: fully executed 2026-07-27 under Asylum Justice — ABC-01 through ABC-10 all Pass. One real defect found and fixed same session (ABC-08, manually-added governance dropdown stuck at its default) — see Defect Log.
**Tester:** WJ
**Test account:** grantpathway+ABC2@gmail.com

---

## Overview

This is one of two **flagship** end-to-end plans (with `MK-Community-Foundation-test-plan.md`) that exercise the complete Grant Pathway flow — registration through export — against a real funder's guidelines. Per `DR-TEST-001` (2026-07-24), most named-funder plans have been retired in favour of a capability/guideline-shape matrix (`guideline-capability-matrix-test-plan.md`) and a dedicated eligibility plan (`eligibility-check-test-plan.md`); this plan and MK Community Foundation's are kept specifically because, between them, they cover both extraction paths' user experience, both limit types, and the governance/financial path with minimal overlap.

A B Charitable Trust publishes a numbered list of application questions as a PDF in advance of their online portal opening (`docs/Grant Org Guidelines/AB Trust Online-Application-Form-Guidance-July-2024-b.pdf`), making it a clean numbered-list PDF fixture. Only 2–3 of its questions require narrative prose; the rest are data-entry, financial, dropdown, or file-upload fields — a good test of non-narrative filtering. B4's 15-word limit is the tightest word limit tested anywhere in this suite.

**This document was previously tested under a deliberate eligibility mismatch** (Harry's Rainbow, a children's bereavement charity, against AB's actual social-justice/human-rights/refugees/penal-reform focus) to exercise `DR-EL-001`'s hard stop. That design conflicted with this plan's own mandate to reach export in the same run — if the mismatch fires as intended, the application dead-ends at Step 3 and none of the writing/export steps can run. `DR-TEST-001` resolves this: the negative case is retested once, properly, in `eligibility-check-test-plan.md` (reusing the Harry's Rainbow / AB Charitable Trust pairing — see EL-02 there, which keeps its own `grantpathway+ABC@gmail.com` account and profile as a dedicated fixture, unaffected by the change below).

**Charity swapped again, 2026-07-27:** v2.0's replacement charity ("plausible alignment" wording layered onto Harry's Rainbow) was live-tested and still triggered a genuine eligibility mismatch — the AI's rejection reasoning centred on "emotional support, mentoring, and recreational activities for bereaved children," ignoring the added access-to-justice framing, because the charity's real underlying nature was still bereavement support. Rather than attempt a third wording tweak on the same charity, this plan now uses **Asylum Justice** (real charity, number 1112026) — its actual, genuine charitable objects are to provide legal advice, assistance, and representation to asylum seekers and refugees, which is an unambiguous, unforced match against two of AB's four funded categories (Access to Justice; Migrants and Refugees). No invented "plausible alignment" narrative is needed — the profile fields below use the charity's real stated purpose. Since a charity profile is one-per-account (`docs/data-model.md` §2), this required a new test account (`grantpathway+ABC2@gmail.com`) rather than reusing `grantpathway+ABC@gmail.com`, which stays reserved for EL-02's Harry's Rainbow fixture.

**Application window:** the guidelines document states no fixed deadline or decision date at all — applications appear to be accepted on a rolling basis. Do not expect the AI summary to mention a specific date; there isn't one to extract. (An earlier version of this plan incorrectly asserted a "31 July 2026" deadline that doesn't appear anywhere in the source guidelines — corrected 2026-07-27, see Document History.)

**Coverage principle:** As one of the two flagship plans, every test here covers the complete end-to-end flow. No step is omitted on the assumption it was tested previously. See `AGENTS.md` — mandatory test plan coverage rule.

---

## Test Data

| Item                         | Value                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test user email              | grantpathway+ABC2@gmail.com                                                                                                                                                                                                                                                                                                                                                                                                         |
| Test user password           | (set by tester at registration — 12+ characters, letters and numbers)                                                                                                                                                                                                                                                                                                                                                               |
| Charity name                 | Asylum Justice                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Charity registration number  | 1112026                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Charity type                 | UK Registered Charity                                                                                                                                                                                                                                                                                                                                                                                                               |
| Charity focus (for this run) | Real charitable objects (not an invented framing): free legal advice, assistance, and representation for asylum seekers and refugees who cannot afford it independently, including cases raising arguments under international human rights conventions — genuinely and unambiguously within AB's Access to Justice and Migrants and Refugees categories (see the 2026-07-27 note above for why this replaced the previous charity) |
| Who does your charity help   | Asylum seekers and refugees navigating the UK asylum and immigration system who cannot access legal advice through mainstream routes                                                                                                                                                                                                                                                                                                |
| Where do you work            | Cardiff, Swansea, and Newport, with a national remit                                                                                                                                                                                                                                                                                                                                                                                |
| Funder                       | A B Charitable Trust                                                                                                                                                                                                                                                                                                                                                                                                                |
| Grant range                  | £10k–£30k/yr (Open Programme, per the guidelines document — corrected 2026-07-27, was previously wrongly recorded as £10k–£40k/yr)                                                                                                                                                                                                                                                                                                  |
| Application type             | Single stage                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Guidelines file              | AB Charitable Trust application questions PDF (from `docs/Grant Org Guidelines/`)                                                                                                                                                                                                                                                                                                                                                   |
| Guidelines input method      | PDF upload (primary); paste text (fallback if extraction fails)                                                                                                                                                                                                                                                                                                                                                                     |

---

## Test Results Summary

| Test ID | Test Name                                                        | AI Summary Time                             | Result        | Notes                                                                                                                                |
| ------- | ---------------------------------------------------------------- | ------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ABC-01  | Account registration and charity profile                         | N/A                                         | Pass          | Redone on `grantpathway+ABC2@gmail.com` after an initial run mistakenly reused `+ABC1@gmail.com` (EL-02's reserved fixture account)  |
| ABC-02  | Application details — funder and grant name (free text)          | N/A                                         | Pass          |                                                                                                                                      |
| ABC-03  | PDF upload and AI summary                                        | Not timed (dev); **22s (prod, 2026-08-19)** | Pass          |                                                                                                                                      |
| ABC-04  | AI summary content accuracy                                      | N/A                                         | Pass          | Grant range and deadline claims in this plan corrected 2026-07-27 (see Document History)                                             |
| ABC-05  | Preparation checklist and start writing                          | N/A                                         | Pass          |                                                                                                                                      |
| ABC-06  | Narrative question extraction — 2–3 expected; D5 must NOT appear | N/A                                         | Pass          | 4 items total (governance fact + B3 + B4 + C11) — B3 briefly thought missing, confirmed present on inspection of the guidelines text |
| ABC-07  | Word limit extraction — B4 is 15 words (tightest limit tested)   | N/A                                         | Pass          |                                                                                                                                      |
| ABC-08  | Narrative answer writing, AI assist, and citation check          | N/A                                         | Pass (caveat) | See Defect Log — manually-added governance dropdown stuck at "Not sure yet"; found, fixed, and retested same session                 |
| ABC-09  | Answer approval and assembly                                     | N/A                                         | Pass          |                                                                                                                                      |
| ABC-10  | Word document export; Word document verified; re-export warning  | N/A                                         | Pass          |                                                                                                                                      |

---

## Defect Log

| ID  | Test   | Description                                                                                                                                                                                                                                                                                                                                                      | Severity | Status                                          |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| 1   | ABC-08 | Manually-added governance dropdown ("Are any bank signatories related...") showed no approve panel at all when left at its default "Not sure yet" — stored as an empty string, indistinguishable from untouched, with no way to remove the item. Switching to Yes/No worked around it but "Not sure yet" itself was unapprovable. See `CHANGELOG.md` 2026-07-27. | Medium   | Fixed and live-verified (retested same session) |

---

## Test Cases

---

### ABC-01 — Account Registration and Charity Profile

**Prerequisite:** None

**Steps:**

1. Go to [grant-pathway-three.vercel.app](https://grant-pathway-three.vercel.app)
2. Click **Register — it's free**
3. Enter first name, last name, email `grantpathway+ABC2@gmail.com`, password (**12+ characters, must include letters and numbers** — confirmed against `register-form.tsx`; the user guide's "at least 10 characters" is a guide error, not what the app enforces), confirm password
4. Tick **Terms of Service and Privacy Policy** (required). Optionally tick **I'm happy to be contacted occasionally to share feedback about Grant Pathway**
5. Click **Create account**
6. Open the verification email and click the verification link — this auto-confirms on page load (no button click required) and expires after 1 hour (D-012, 2026-07-02)
7. On the "Email verified" screen, click **Sign in** and enter the registered email and password (the verification flow signs the session out — this is a normal credentials sign-in, not an automatic redirect to the dashboard)
8. A banner prompts you to complete your charity profile. Click **Complete your profile**
9. Enter charity registration number **1112026** in the search box and click **Look up charity**
10. Confirm or complete pre-filled fields:
    - Charity name: Asylum Justice
    - What does your charity do: (see Test Data — charity focus above)
    - Who does your charity help: (see Test Data above)
    - Where do you work: (see Test Data above)
11. Click **Save profile**
12. On the "Profile saved" confirmation screen, click **Go to my dashboard**
13. Click **Start your first application**

**Expected result:**

- Account created and email verified without errors
- Sign-in with credentials succeeds
- Charity Commission lookup returns Asylum Justice details and pre-fills name and registration number
- Profile saves successfully; "Profile saved" confirmation screen shown with **Go to my dashboard** button
- Dashboard shows the empty-state **Start your first application** button (zero applications on this fresh account)

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes — 2026-08-19, production run (`grant-pathway-prod`):** ✅ **Pass.** ⚠️ **Run as a sign-in rather than a registration, and on a different account: `grantpathway+RT01test@gmail.com`, not `grantpathway+ABC2@gmail.com`.** WJ's decision, to keep the number of real accounts created on production under control. **This is within the flagship coverage rule**, whose first step reads "account registration **or login for returning test user**" — registration itself was covered by `RT-01a` on the same environment the same day. ⚠️ **Knowingly accepted consequence: a charity profile is one-per-account (`data-model.md` §2), so setting up Asylum Justice overwrote that account's existing 1194917 profile** from `RT-01b`. Nothing depended on it. **The dev run's notes below stand unchanged.**

**Notes:** Initial run mistakenly reused `grantpathway+ABC1@gmail.com` (reserved for `eligibility-check-test-plan.md` EL-02) and reset its charity profile — caught before proceeding past ABC-02, redone cleanly on `+ABC2@gmail.com`.

---

### ABC-02 — Application Details — Funder and Grant Name (Free Text)

**Prerequisite:** ABC-01 complete

**Background:** Step 1 (`Who is offering this grant?`) is a plain free-text field, not a picker — the searchable directory with a "Structured" badge and "Can't find your funder? Request it to be added" link was removed entirely on 2026-07-15 (`DR-FD-001` v1.4). There is no autocomplete, dropdown, or funder-type badge to confirm here.

**Steps:**

1. In the **Who is offering this grant?** field, type **"A B Charitable Trust"**
2. In the **grant name** field, type **"General Grant 2026"**
3. Click **Continue**

**Expected result:**

- Both fields accept free text with no dropdown or autocomplete behaviour
- No "reuse a previous application" prompt appears (this is a fresh account's first application — that prompt only appears when a prior application to a name-matching funder already exists, per P6.5)
- Application created and Step 2 (Upload the Funder's Guidelines) displayed

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes — 2026-08-19, production run:** ✅ **Pass.** Funder and grant name entered as free text, no issues.

**Notes:**

---

### ABC-03 — PDF Upload and AI Summary

**Prerequisite:** ABC-02 complete

**Steps:**

1. On Step 2, click **Choose file** (or drag and drop) and upload the A B Charitable Trust application questions PDF from `docs/Grant Org Guidelines/`
2. Confirm the file is accepted (filename displayed, no error)
3. Click **Continue**
4. On Step 3, start a stopwatch — AI summary auto-generates on page load
5. Stop when summary cards appear — record the time in the results table above (guide states this usually takes up to 45 seconds)

**Expected result:**

- PDF uploads successfully (no format or size error)
- AI summary generates without error, typically within 45 seconds
- Summary content covers AB Charitable Trust's focus areas, eligibility, and requirements
- _(Known limitation: no filename indicator shown on Step 3 confirming which file was loaded — this is expected, not a defect)_

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes — 2026-08-19, production run:** ✅ **Pass. AI summary generated in 22 seconds** — the first timed measurement of this step anywhere, the dev run having recorded it as "Not timed". ⚠️ **This is one figure on one document and is not a performance result**; `GAP-03`'s P95 monitors are what would make it one. **Recorded so the flagship summary table can stop saying "Not timed".**

**Notes:**

---

### ABC-04 — AI Summary Content Accuracy

**Prerequisite:** ABC-03 complete (AI summary generated). Review this **before** continuing past Step 3 — the summary is no longer easily visible once you proceed to Step 4 (see ABC-05).

**Background:** AB Charitable Trust funds organisations working in Access to Justice, Human Rights, Migrants and Refugees, and The Justice System and Penal Reform. Asylum Justice's real, genuine charitable objects — legal advice, assistance, and representation for asylum seekers and refugees — fall squarely within Access to Justice and Migrants and Refugees, with no invented framing required. This case is purely a content-accuracy check; eligibility matching itself (including a genuine mismatch case) is covered once in `eligibility-check-test-plan.md` rather than repeated here — see `DR-TEST-001`.

**Steps:**

1. Review each summary section is present and plausible:
   - **About this grant** — describes AB Charitable Trust and its focus areas
   - **Grant amount** — references the £10k–£30k/yr range or similar
   - **Who can apply** — UK registered charities, eligibility criteria
   - **What the funder is looking for** — funding priorities and themes
   - **Key requirements** — restrictions, deadlines, exclusions
   - _(Application sections is expected to be absent — that card only renders for `free_form`-classified funders; AB's numbered-list PDF is expected to classify as structured)_
2. Confirm no fixed deadline is invented — the guidelines document doesn't state one, so none should appear in the summary

**Expected result:**

- All applicable summary sections present and populated
- Grant amount or range referenced correctly (£10k–£30k/yr)
- No deadline is fabricated; exclusions and key priorities accurately captured
- Summary is in plain English and comprehensible to a non-specialist user
- _(As established in prior sessions — see `DR-AI-003` — "no hallucinated conditions" is a spot-check here, not exhaustive verification; this plan does not attempt to re-litigate that limitation)_

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes — 2026-08-19, production run:** ✅ **Pass, no issues.** ⚠️ **The Step 3 summary banner is recorded here because it is the earliest evidence for ABC-06:** _"We found 3 application questions, plus 1 financial detail you'll complete with your own figures. You'll work through all 4 in the next step."_ **4 items — exactly the dev run's shape**, and it establishes that **D5 was correctly filtered out as a file-upload instruction** before the Q&A interface was even reached. No deadline was asserted, correctly: the guidelines state none.

**Notes:** Grant range confirmed as £10k–£30k/yr; no fabricated deadline appeared, consistent with the guidelines stating none.

---

### ABC-05 — Preparation Checklist and Start Writing

**Prerequisite:** ABC-04 complete (AI summary content reviewed while still on Step 3)

**Steps:**

1. Click **Continue** to proceed to Step 4
2. Confirm the **"Before you begin writing"** preparation checklist screen appears
3. Click **"I have what I need — start writing"** to enter the Q&A interface

**Expected result:**

- Prep checklist screen confirmed before Q&A interface
- Step 4 loads with writing cards

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes — 2026-08-19, production run:** ✅ **Pass, no issues.** The "Before you begin writing" checklist gate behaved as specified.

**Notes:**

---

### ABC-06 — Narrative Question Extraction — Only 2–3 Expected

**Prerequisite:** ABC-05 complete (Q&A interface entered)

**Background:** The A B Charitable Trust document has questions across four sections (A–D). Only 2–3 require a narrative prose answer:

| Question | Text                                                                         | Expected                                                                                       |
| -------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| B3       | How does your organisation reflect the communities that you work with?       | ✅ Should appear — narrative, no explicit word limit                                           |
| B4       | Summarise your work or your project in no more than 15 words                 | ✅ Should appear — narrative, **15-word limit**                                                |
| C11      | If you would like to give us any additional information, please use this box | May appear — optional narrative                                                                |
| D5       | Please provide an overview of your work/funding proposal                     | ❌ Should NOT appear as a writing card — this is a file upload (Word/PDF document, 2–2½ pages) |

**Steps:**

1. In the Step 4 Q&A interface, count the number of question cards displayed
2. Confirm B3 and B4 are both present
3. Confirm D5 ("Please provide an overview of your work/funding proposal") does **NOT** appear as a text writing card — it is a document-upload instruction
4. Confirm none of the following appear as writing cards: A1–A10 (org details), B1–B2 (dropdowns), C1–C10 (financial figures), D1–D4 (file uploads), D6–D8 (further file uploads)
5. Record the exact number and text of all questions shown

**Expected result:**

- 2–3 questions displayed (B3, B4, and possibly C11)
- B4 shows a **15-word limit** badge — the tightest limit in this suite
- D5 does not appear as a text writing card
- No data-entry, financial, dropdown, or standard file-upload questions shown
- _(If more than 5 questions shown, investigate — log as defect if non-narrative fields included)_

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record exact questions shown):** 4 items shown: 1 governance fact (total annual expenditure, mapped from C3) plus B3, B4, and C11 — matches this table's expectation exactly. B3 was briefly thought missing since the app doesn't label cards with their original letter/number code, only running numbers; confirmed present by checking its question text against the source PDF. D5 correctly absent.

---

### ABC-07 — Word Limit Extraction and Counter Display

**Prerequisite:** ABC-06 complete

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
- All counters show "words" not "characters"
- _(If B4 shows "15 characters" instead of "15 words" — log as a defect)_

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record limit type and values seen):** B4 showed "15 words" badge and counted in words throughout. A manual test of the AI-refine step on B3 showed a 2-word difference (56→58) between the written and AI-refined answer — expected per this case's own "AI can't always hit an exact count" allowance, not a defect (B3 has no stated limit to breach either way).

---

### ABC-08 — Narrative Answer Writing, AI Assist, and Citation Check

**Prerequisite:** ABC-07 complete

**Steps:**

1. Select the first narrative question in Step 4
2. Write a short answer of approximately 50 words describing Asylum Justice's work relevant to the question
3. Click **"Help me improve this"** (AI assist button)
4. Observe the AI-refined answer returned
5. Confirm the refined answer:
   - Does not add facts not in the original answer
   - Maintains first-person plural voice ("we", "our", "us")
   - Stays within the word or character limit (or is closer to it — AI can't always hit an exact count)
6. If a citation badge is shown alongside the suggestion, click it and confirm the guidelines viewer opens with the relevant passage highlighted and scrolled to
7. Review the three mandatory prompts:
   - Does this accurately describe your charity and project?
   - Are all figures, dates, and facts correct?
   - Does this answer the question that was asked?
8. Edit one sentence directly in the text field
9. Click **Approve**

**Expected result:**

- Answer text area accepts input without errors
- AI assist returns a refined answer within 15 seconds
- If present, a citation click opens the guidelines viewer with the passage highlighted (not just landing on page 1 with no highlight)
- Mandatory review prompts displayed before approval is possible
- Answer is visually marked as approved after clicking Approve
- No data loss when navigating to the next question

**Result:** ☒ Pass (caveat) &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Found a real defect — see Defect Log #1: a manually-added governance dropdown left at its default "Not sure yet" showed no approve panel at all, with no way to remove the item. Root-caused, fixed, and retested same session; confirmed working (both an explicit "Not sure yet" selection and an untouched-then-approved item now save and approve correctly). All other narrative citation checks passed.

---

### ABC-09 — Answer Approval and Assembly

**Prerequisite:** ABC-08 complete (at least one answer approved)

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

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### ABC-10 — Word Document Export; Word Document Verified; Re-export Warning

**Prerequisite:** ABC-09 complete

**Steps:**

1. Tick all three review checkboxes on Step 5
2. Click **Download as Word document (.docx)** — this both approves and downloads in one action; confirm a persistent "Application approved" banner replaces the checklist
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
7. Click **Download as plain text (.txt)** — the re-export confirmation dialog appears again here too (D-WF-04, expected, not a defect); confirm through it
8. Verify a .txt file is downloaded, with the same footer line but no page numbers

**Expected result:**

- Word export opens correctly in Microsoft Word
- Export date includes a timestamp
- Only approved answers are included; word limits are not shown in the exported document
- Re-export warning shows the prior export timestamp on both the second Word download and the plain-text download
- Plain text download works
- Document is clean, readable, and free of formatting artefacts

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-01 | Rapidglobe Ltd | Initial test plan — A B Charitable Trust, Harry's Rainbow test charity, 10 tests incorporating Idlewild lessons                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 1.1     | 2026-07-04 | Rapidglobe Ltd | Fixed step-ordering defect: split Step 4 navigation out of ABC-03 into a new ABC-06, run after the AI-summary content/eligibility review. Old ABC-06–10 renumbered to ABC-07–11.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 1.2     | 2026-07-04 | Rapidglobe Ltd | Corrected against the service and `grant-pathway-user-guide-v1_15.docx` following live execution of ABC-01/ABC-02. ABC-10/ABC-11 rewritten to match the merged approve+download flow and senior review screen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2.2     | 2026-07-27 | Rapidglobe Ltd | Full clean execution completed under Asylum Justice: ABC-01–10 all Pass. Corrected two factual errors found live: grant range was wrongly recorded as £10k–£40k/yr (the guidelines document actually states £10,000–£30,000 pa for the Open Programme), and a fabricated "31 July 2026" deadline was removed from the Overview and Test Data — the guidelines state no fixed deadline at all, so ABC-04's Step 3 summary correctly didn't mention one. ABC-04 renamed from "AI Summary Accuracy and Eligibility (Positive Check)" to "AI Summary Content Accuracy" and all eligibility-specific steps/wording removed — eligibility matching is `eligibility-check-test-plan.md`'s concern, not this flagship's, per `DR-TEST-001`. ABC-03's redundant "do not click Continue yet" / PDF-extraction-fallback guidance removed (no longer needed). One real defect found and fixed same session: a manually-added governance dropdown left at its default "Not sure yet" showed no approve panel and had no way to be removed — see Defect Log and `CHANGELOG.md` 2026-07-27.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2.1     | 2026-07-27 | Rapidglobe Ltd | **Charity swapped from Harry's Rainbow to Asylum Justice — genuine positive match, no invented framing.** Live-testing v2.0's "plausibly aligned" Harry's Rainbow wording against ABC-04 found it still triggered a real eligibility mismatch (the AI's reasoning centred on bereavement support, ignoring the added justice framing) — the accidental run was retained as a de facto `EL-02` completion in `eligibility-check-test-plan.md` rather than wasted. Replaced with Asylum Justice (real charity, number 1112026), whose actual charitable objects — legal advice/assistance/representation for asylum seekers and refugees — are an unambiguous, unforced match against AB's Access to Justice and Migrants and Refugees categories. Since `charity_profiles` is one-per-account (`docs/data-model.md` §2), this needed a new test account (`grantpathway+ABC2@gmail.com`); `grantpathway+ABC@gmail.com` stays reserved as `eligibility-check-test-plan.md` EL-02's Harry's Rainbow fixture, unaffected by this change. Test Data, ABC-01, ABC-04, and ABC-08 updated accordingly. No results carried forward — full re-execution needed under the new charity.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2.0     | 2026-07-24 | Rapidglobe Ltd | **Rewritten as a flagship plan under `DR-TEST-001`.** Corrected against `grant-pathway-user-guide-v1.19.docx` and current code. Major changes: (1) Step 1 rewritten from the removed funder picker (search dropdown, "Structured" badge, "Request a Funder" link — removed `DR-FD-001` v1.4, 2026-07-15) to the current free-text fields. (2) ABC-01 gained the missing "Profile saved" confirmation screen step and the optional feedback-consent checkbox; password requirement corrected to 12+ characters with letters and numbers (the app's actual rule, per `register-form.tsx` — the user guide's "at least 10 characters" is a guide defect, not reflected here). (3) The old ABC-04 (eligibility mismatch) assumed mismatch was a soft, non-blocking observation — this was wrong since `DR-EL-001` (2026-06-02, predates this plan's v1.0), which made it a hard stop with no path to Step 4. That hard stop structurally conflicted with this plan's later export steps. Resolved per `DR-TEST-001`: this plan now uses a charity description with plausible eligibility alignment (positive case only); the genuine Harry's Rainbow/AB mismatch is retested properly in `eligibility-check-test-plan.md` (EL-02). (4) Retired the "Known Expected Behaviours" section — every row duplicated content already stated in the Overview, Test Data, or the relevant test case's own Background/Prerequisite; the one non-duplicated fact (prior processing history, formerly logged as D-011) is no longer load-bearing enough to keep. (5) Added a citation-check step to ABC-08 (new "Guidelines Citations" feature in the v1.19 guide, not covered in any prior version of this plan). Net: 11 test cases reduced to 10 (eligibility deep-dive moved out; old ABC-04/ABC-05 merged into one lighter positive check). |
