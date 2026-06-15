# Grant Pathway — Regression Test Plan

**Version:** 1.0
**Date:** 2026-06-15
**Status:** Ready for execution
**Tester:** WJ
**Test account:** grantpathway+idle100@gmail.com

---

## Purpose

This plan is a **regression test** — not a funder UAT. Its purpose is to answer one question after every dependency update, code change, or deployment:

> Has anything that previously worked stopped working?

It does not test whether AI output is accurate or funder-specific question extraction is correct. Those are covered by the funder test plans in this folder.

**Run this plan:**

- After merging dependency update PRs
- After any change to the auth, session, or middleware layer
- After any change to the AI API routes
- Before deploying a new release to production
- After any infrastructure change (Supabase, Vercel, Node version)

---

## Test Tiers

This plan has two tiers:

| Tier | Name            | When to run                                      | Time    |
| ---- | --------------- | ------------------------------------------------ | ------- |
| 1    | Smoke           | Every dependency update / quick confidence check | ~10 min |
| 2    | Full regression | Before any production deployment                 | ~25 min |

Tier 1 tests are marked **[SMOKE]**. Run all Tier 1 tests first; proceed to Tier 2 only if all pass.

---

## Test Data

This plan uses a pre-seeded test account with an existing in-progress application. No new application creation is required for Tier 1.

| Item                   | Value                                       |
| ---------------------- | ------------------------------------------- |
| Test URL               | https://grant-pathway-three.vercel.app      |
| Test account           | grantpathway+idle100@gmail.com              |
| Display name           | Testname                                    |
| Pre-seeded application | Henry Smith Foundation — "Test Application" |
| Application status     | In progress (Step 4, Q&A writing interface) |
| Funder                 | Henry Smith Foundation                      |

**Pre-test check:** Confirm the test account still has the "Test Application" in "In progress" status at Step 4. If it has been deleted or exported, a new application will need to be created first (see Appendix A).

---

## Test Results Summary

| Test ID | Test Name                        | Tier  | Result | Date | Notes |
| ------- | -------------------------------- | ----- | ------ | ---- | ----- |
| RT-01   | Sign-in and session persistence  | Smoke |        |      |       |
| RT-02   | Unauthenticated redirect         | Smoke |        |      |       |
| RT-03   | Dashboard renders with data      | Smoke |        |      |       |
| RT-04   | Step 4 Q&A interface loads       | Smoke |        |      |       |
| RT-05   | AI refine-answer endpoint        | Smoke |        |      |       |
| RT-06   | Answer approval and progress bar | Full  |        |      |       |
| RT-07   | Preparation checklist gate       | Full  |        |      |       |
| RT-08   | Senior review screen             | Full  |        |      |       |
| RT-09   | Final review and approval        | Full  |        |      |       |
| RT-10   | Word document export             | Full  |        |      |       |

---

## Tier 1 — Smoke Tests

---

### RT-01 — Sign-in and Session Persistence [SMOKE]

**User guide reference:** Section 1 (Signing In)
**What this tests:** `@supabase/ssr` cookie/session layer, auth middleware, protected route access

**Steps:**

1. Open https://grant-pathway-three.vercel.app in a fresh browser tab (or private/incognito window)
2. Confirm the sign-in page loads with email and password fields
3. Enter email `grantpathway+idle100@gmail.com` and the correct password
4. Click **Sign in**

**Expected result:**

- Sign-in page loads without console errors
- Login succeeds — user is redirected to the dashboard
- Dashboard shows "My Applications" heading and the user's name ("Testname") in the nav bar
- No error message displayed

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### RT-02 — Unauthenticated Redirect [SMOKE]

**User guide reference:** Implied — unauthenticated users cannot access protected routes
**What this tests:** Auth middleware correctly protects routes; session cookie required

**Steps:**

1. Open a new private/incognito window (no active session)
2. Navigate directly to https://grant-pathway-three.vercel.app/dashboard

**Expected result:**

- User is redirected to the sign-in page (/)
- Dashboard content is not shown
- No error page displayed

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### RT-03 — Dashboard Renders with Data [SMOKE]

**User guide reference:** Section 2 (Your Dashboard)
**What this tests:** Supabase data queries, dashboard page rendering, application status labels, AI usage counter

**Prerequisite:** RT-01 complete (signed in)

**Steps:**

1. On the dashboard, verify the following elements are present:
   - Summary bar showing application counts (Not started / In progress / Approved / Exported)
   - AI requests counter ("X of 50 AI requests used this month")
   - At least one application card showing funder name, grant name, status, and last updated date
   - "+ New Application" button
2. Confirm the "Test Application" (Henry Smith Foundation) shows status **In progress**
3. Confirm the application card shows a **Continue** button (not just View — user guide v1.14 says "View" but the app shows "Continue"; record which is shown)

**Expected result:**

- All dashboard elements render correctly
- Application data loaded from database (not empty/loading state)
- Status labels match Section 16 of the user guide (Not started / In progress / Approved / Exported)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record button label — "Continue" or "View"):**

---

### RT-04 — Step 4 Q&A Interface Loads [SMOKE]

**User guide reference:** Section 7 (Write Your Answers)
**What this tests:** Dynamic route rendering for `[id]/step/4`, Supabase question data fetch, Step 4 server component

**Prerequisite:** RT-03 complete

**Steps:**

1. Click **Continue** (or View) on the "Test Application" (Henry Smith Foundation — In progress)
2. Confirm Step 4 loads — the Q&A writing interface

**Verify the following elements are present:**

- Application progress navigation (steps 1–5, Step 4 highlighted as current)
- Funder name and grant name displayed at the top
- At least one question card with a text box
- Word or character counter beneath each text box
- **Help me improve this** button on at least one non-budget question card
- **Approve this answer** button on each card
- Progress bar showing "X of Y sections approved"

**Expected result:**

- Step 4 loads within 5 seconds
- Question cards rendered with content from the database
- No "Page not found" or error state
- No console errors

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record number of question cards shown):**

---

### RT-05 — AI Refine-Answer Endpoint [SMOKE]

**User guide reference:** Section 7 — Getting AI Help
**What this tests:** `@anthropic-ai/sdk`, `/api/refine-answer` route, Bedrock connectivity, AI suggestion rendering

**Prerequisite:** RT-04 complete (Step 4 visible with question cards)

**Steps:**

1. Locate the first question card that has a **Help me improve this** button (not a budget section)
2. Confirm the text box contains at least a few words of existing answer text
3. If the text box is empty, type a short placeholder answer (e.g. "Our charity supports people in the local community.")
4. Click **Help me improve this**
5. Wait for the AI response (up to 30 seconds)

**Expected result:**

- While processing: button changes state (loading indicator or button disabled)
- After processing: a "Suggested improvement" panel appears below the text box
- The suggestion contains coherent text (not empty, not an error message)
- Two options are shown: **Use this improved version** and **Keep my original**
- No error toast or console error

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record approximate response time):**

---

## Tier 2 — Full Regression Tests

Run these after all Tier 1 tests pass.

---

### RT-06 — Answer Approval and Progress Bar [FULL]

**User guide reference:** Section 7 — Approving Answers
**What this tests:** Approval server action, progress bar update, "Approve this answer" → "Approved" state transition, re-approval after edit

**Prerequisite:** RT-04 complete

**Steps:**

1. On Step 4, locate a question card with existing answer text
2. Click **Approve this answer**
3. Confirm the card shows an "Approved" state
4. Confirm the progress bar at the top increments (e.g. "1 of 5 sections approved")
5. Click inside the approved answer box and make a small edit (add a word)
6. Confirm the approval is removed (card returns to unapproved state, progress bar decrements)
7. Re-approve the answer

**Expected result:**

- Approval toggles correctly on click
- Progress bar updates immediately after each approval/unapproval
- Editing an approved answer removes the approval (as per user guide: "If you edit an approved answer, the approval is removed")
- **Ready to assemble** button remains inactive while any answer is unapproved

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### RT-07 — Preparation Checklist Gate [FULL]

**User guide reference:** Section 6 (Before You Begin Writing)
**What this tests:** `draft_status = 'not_started'` gate renders checklist; "I have what I need" sets `draft_status = 'in_progress'`

**Note:** This test requires an application that has NOT yet passed the checklist gate (i.e. `draft_status = 'not_started'`). The pre-seeded "Test Application" is already at `in_progress` and will show the Q&A interface directly. Use the "New application" card on the dashboard (status: Not started) if it has reached Step 4, or create a new application via Appendix A up to the point of clicking Continue on Step 3.

**Steps:**

1. Navigate to an application that is at Step 4 for the first time (draft_status = not_started)
2. Confirm the preparation checklist screen appears (not the Q&A interface)
3. Verify the screen prompts the user to have financial information ready (per user guide Section 6)
4. Verify the tip about the 50 AI request monthly limit is shown
5. Click **I have what I need — start writing**
6. Confirm the Q&A interface (Step 4 main view) now loads

**Expected result:**

- Checklist gate shown on first visit
- Clicking the button transitions to the Q&A interface
- Q&A interface loads correctly on first visit with no "No questions found" fallback

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### RT-08 — Senior Review Screen [FULL]

**User guide reference:** Section 8 (Prior Export)
**What this tests:** `draft_status = 'ready_to_assemble'` gate, senior review screen, "Yes — assemble my draft" action

**Prerequisite:** RT-06 complete (all answers approved on a test application); **Ready to assemble** button active

**Steps:**

1. Confirm **Ready to assemble** button is active (all answers approved)
2. Click **Ready to assemble**
3. Confirm the "Before we put it together" screen appears (Section 8 of user guide)
4. Confirm it prompts for senior review of financial/budget content
5. Click **Yes — assemble my draft**

**Expected result:**

- Senior review screen appears after clicking Ready to assemble
- Screen matches Section 8 description in user guide
- Clicking "Yes — assemble my draft" proceeds to the final review (Step 5 / Section 9)

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### RT-09 — Final Review and Approval [FULL]

**User guide reference:** Section 9 (Review)
**What this tests:** Step 5 review screen, confirmation checkboxes, final approve action

**Prerequisite:** RT-08 complete

**Steps:**

1. Confirm the Step 5 review screen loads
2. Verify all approved answers are displayed for review
3. Tick all confirmation checkboxes
4. Click **Approve my application** (or equivalent button — record exact label)
5. Confirm the approval modal or confirmation state appears

**Expected result:**

- Review screen matches Section 9 of user guide
- All answers visible
- Confirmation checkboxes present and ticking them enables the approve button
- Approval action completes without error

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record exact button label shown):**

---

### RT-10 — Word Document Export [FULL]

**User guide reference:** Section 10 (Export)
**What this tests:** Export API route, Word document generation, file download

**Prerequisite:** RT-09 complete (application approved)

**Steps:**

1. Confirm the download button(s) are now active on the Step 5 screen
2. Click **Download as Word document**
3. Open the downloaded .docx file

**Verify the document contains:**

- Application title (grant name)
- Funder name
- Export date
- All approved answers in a readable, structured format
- AI disclaimer text
- No corrupted or missing content

**Expected result:**

- .docx file downloads without error
- Document opens cleanly in Word or equivalent
- Content matches the approved answers entered in Step 4
- Application status on dashboard updates to **Exported**

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Defect Log

| ID  | Test | Description | Severity | Status |
| --- | ---- | ----------- | -------- | ------ |
|     |      |             |          |        |

---

## Appendix A — Resetting or Creating Test Data

If the pre-seeded "Test Application" is no longer available (deleted, exported, or at the wrong step), create a fresh one:

1. Sign in as `grantpathway+idle100@gmail.com`
2. Click **+ New Application**
3. Select **Henry Smith Foundation** from the funder picker
4. Enter grant name: **"Regression Test Application"**
5. Click **Continue**
6. Upload or paste guidelines (use `henry-smith-holiday-grants-application-template.docx` or any guidelines text)
7. Click **Continue** → wait for AI summary → click **Continue**
8. The application is now at the preparation checklist — leave it here if testing RT-07, or click through to Step 4 for RT-04/RT-05/RT-06

For RT-08/RT-09/RT-10, approve all answers in Step 4 before running those tests.

---

## Appendix B — Known Behaviours

| Ref                 | Description                                                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cache               | After dependency updates, the `.next` build cache may need clearing before step pages compile correctly. If step pages return 404 on a fresh server start, stop the server, delete `.next/`, and restart. Verified 2026-06-15.                              |
| Button label        | User guide v1.14 (Section 2) states "View" for continuing an application; the app currently shows "Continue". This is a user guide discrepancy, not a bug.                                                                                                  |
| AI latency          | `/api/refine-answer` typically responds in 5–10 seconds. Up to 30 seconds is acceptable. Over 30 seconds indicates a potential Bedrock or timeout issue.                                                                                                    |
| 50 AI request limit | The test account shares the 50 AI requests/month limit. RT-05 uses one request. If the limit is reached, RT-05 will show a usage limit error — this is expected behaviour, not a regression. Use a different test account or wait for the counter to reset. |

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                 |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 2026-06-15 | Rapidglobe Ltd | Initial regression test plan. 10 test cases across 2 tiers. Derived from Alan Knox Automated Testing audit and cross-referenced with user guide v1.14. |
