# Grant Pathway — Regression Test Plan

**Version:** 1.5
**Date:** 2026-06-15
**Last updated:** 2026-07-02 (D-012 resolved — stale Resend API key in dev's Supabase SMTP settings rotated; registration confirmed working again via direct API test)
**Status:** Ready for execution — **has never actually been run** (all RT-01–10 results are still blank as of this update)
**Tester:** WJ
**Test account:** grantpathway+idle100@gmail.com

---

## ⚠️ Read this before running v1.1 for the first time

On 2026-07-01, a full audit found that `grant-pathway-dev` and `grant-pathway-prod` had been silently missing critical schema for weeks: the AI usage-cap RPC functions (`reserve_ai_slot` and friends — used by **every** AI call) were absent from **both** projects, and the transactional `approve_application`/`reopen_application` RPCs were absent from **prod**. This has now been fixed and verified on both projects (see `docs/Implementation Plan/CHANGELOG.md`, 2026-07-01 entries) — but it means:

- **Every "passed" result recorded against any funder test plan in this folder predates the fix** (all funder testing finished by 2026-06-17; the AI-cap RPC dependency was only introduced into the route code on 2026-06-22, and the approve/reopen RPC on 2026-06-29). None of those passes are evidence that the _current_ codebase works end-to-end.
- **This regression plan itself has zero recorded executions.** It was written 2026-06-15 and never run.
- RT-00 below is new — run it **first**, every time, before trusting any other result in this plan or any funder plan.

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
- **Before relying on any historical funder test result** — if the schema has drifted from tracked migrations before, it can happen again; RT-00 catches it in under a minute

---

## Test Tiers

This plan has three tiers:

| Tier | Name              | When to run                                             | Time    |
| ---- | ----------------- | ------------------------------------------------------- | ------- |
| 0    | Environment check | First, every session — before trusting any other result | ~2 min  |
| 1    | Smoke             | Every dependency update / quick confidence check        | ~10 min |
| 2    | Full regression   | Before any production deployment                        | ~25 min |

Tier 0 is marked **[ENV]** and always runs first. Tier 1 tests are marked **[SMOKE]**. Run all Tier 1 tests first; proceed to Tier 2 only if all pass.

---

## Test Data

This plan uses a pre-seeded test account with an existing in-progress application. No new application creation is required for Tier 1.

**Using a freshly registered account instead (e.g. to verify full functionality end-to-end rather than reuse prior state):** run **RT-01a** (below) first, immediately after RT-00 and before RT-01. A fresh account has no charity profile and no pre-seeded application, so RT-01a covers registration, email verification, and charity profile setup, then hands off to Appendix A to create a new application before continuing to RT-04 onward.

| Item                      | Value                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test URL                  | https://grant-pathway-three.vercel.app                                                                                                                                                                                                                                                                                           |
| Test URL Supabase project | `grant-pathway-dev` — confirmed 2026-07-01 via the `sb-stanwaejdvlvremtffkf-auth-token` session cookie (DevTools → Application → Cookies while signed in). Nothing currently points to `grant-pathway-prod` — it has no live consumer yet. Re-check the same way if this ever changes (e.g. after the P5.6 DNS/go-live cutover). |
| Test account              | grantpathway+idle100@gmail.com                                                                                                                                                                                                                                                                                                   |
| Display name              | Testname                                                                                                                                                                                                                                                                                                                         |
| Pre-seeded application    | Henry Smith Foundation — "Test Application"                                                                                                                                                                                                                                                                                      |
| Application status        | In progress (Step 4, Q&A writing interface)                                                                                                                                                                                                                                                                                      |
| Funder                    | Henry Smith Foundation                                                                                                                                                                                                                                                                                                           |

**Pre-test check:** Confirm the test account still has the "Test Application" in "In progress" status at Step 4. If it has been deleted or exported, a new application will need to be created first (see Appendix A).

---

## Test Results Summary

| Test ID | Test Name                                 | Tier  | Result | Date | Notes |
| ------- | ----------------------------------------- | ----- | ------ | ---- | ----- |
| RT-00   | Environment and schema verification       | Env   |        |      |       |
| RT-01a  | Account registration (fresh account only) | Smoke |        |      |       |
| RT-01   | Sign-in and session persistence           | Smoke |        |      |       |
| RT-02   | Unauthenticated redirect                  | Smoke |        |      |       |
| RT-03   | Dashboard renders with data               | Smoke |        |      |       |
| RT-04   | Step 4 Q&A interface loads                | Smoke |        |      |       |
| RT-05   | AI refine-answer endpoint                 | Smoke |        |      |       |
| RT-06   | Answer approval and progress bar          | Full  |        |      |       |
| RT-07   | Preparation checklist gate                | Full  |        |      |       |
| RT-08   | Senior review screen                      | Full  |        |      |       |
| RT-09   | Final review and approval                 | Full  |        |      |       |
| RT-10   | Word document export                      | Full  |        |      |       |
| RT-11   | Dashboard reopen application              | Full  |        |      |       |

---

## Tier 0 — Environment Check

Run this before every session, every time, no exceptions. It exists because on 2026-07-01 the hosted `grant-pathway-dev` and `grant-pathway-prod` Supabase projects were found to be missing schema that every other check (CI, local dev, prior test sessions) had no way of detecting — the gap was invisible from inside the app until someone deliberately checked the database directly.

---

### RT-00 — Environment and Schema Verification [ENV]

**What this tests:** That the environment being tested has the full, current schema applied — not just that the app loads.

**Steps:**

1. Confirm which Supabase project backs the test URL. Sign in at the test URL, open DevTools → **Application** tab → **Storage** → **Cookies**, and find the cookie named `sb-<project-ref>-auth-token`. The ref tells you dev (`stanwaejdvlvremtffkf`) or prod (`mvmjryipieepvsjudche`). (Checking Vercel's env vars directly doesn't reliably work — sensitive-marked variables can't be revealed in the dashboard once saved, only overwritten. The cookie is visible regardless, since most Supabase calls in this app happen server-side and never appear in the Network tab.)
2. Run this against **that** project's SQL Editor:
   ```sql
   select proname from pg_proc where proname in
     ('reserve_ai_slot', 'update_ai_slot_token_count', 'cancel_ai_slot',
      'approve_application', 'reopen_application');
   ```
3. Confirm all 5 rows are returned.
4. In a terminal, run `cd "C:\Users\WJ\OneDrive - Rapidglobe Ltd\Documents\Rapidglobe\Development\AI Grant Accelerator\grant-pathway"` (the CLI needs to be run from inside the project directory to find the linked project config), then run `supabase migration list --linked` (after linking the CLI to the correct project) and confirm every row shows a matching Local/Remote timestamp — no blanks.

**Expected result:**

- All 5 functions present
- No blank rows in `migration list`

**If this fails:** stop. Do not proceed to RT-01 or any funder test plan — every AI feature and the approve/reopen flow will fail, and the failure will look like a product bug rather than a missing-migration issue. Fix the schema gap first (see `docs/Implementation Plan/CHANGELOG.md`, 2026-07-01, for the exact remediation SQL if this recurs).

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which project — dev or prod — this session tested against):**

---

## Tier 1 — Smoke Tests

---

### RT-01a — Account Registration and Email Verification [SMOKE]

**Applies only when testing with a freshly created account** — skip this and go straight to RT-01 if reusing the pre-seeded test account.

**User guide reference:** Sections 1–2 (Registering, Verifying Your Email)
**What this tests:** The registration and onboarding path a brand-new user goes through — account creation, email verification, and charity profile setup — none of which the pre-seeded account exercises, since it already has all of this done.

**Steps:**

1. Open https://grant-pathway-three.vercel.app in a fresh browser tab (or private/incognito window)
2. Click **Register** / **Create an account**
3. Enter a new test email (e.g. `grantpathway+<label>@gmail.com`), a compliant password (12+ characters, letters and digits), first name, and last name. Deliberately note whether you tick or leave unticked the feedback-consent checkbox — this is needed later for P5.5's `feedback_consent` verification.
4. Submit registration
5. Open the verification email and click the verification link. **Note:** the link expires after 1 hour, not 24 hours as the user guide currently states (known discrepancy, see `screen-requirements.md`) — don't leave this step for later in the session.
6. Confirm the app shows a success state after verification
7. Sign in with the new account
8. Complete charity profile setup — either look up the charity by name/registration number, or enter the fields manually
9. Confirm you land on the dashboard showing the correct empty state (no applications yet)

**Expected result:**

- Registration succeeds and the verification email arrives promptly
- Verification link works within the 1-hour window
- Charity profile saves successfully
- Dashboard renders the correct empty state

**Note:** After this test, the account has no application yet. Use Appendix A to create one before continuing to RT-04 onward (which assume an application already exists at a specific step). RT-01 (sign-in) is effectively already covered by step 7 above — running it again with this account is optional, not required.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record the test email used, and the feedback-consent choice made in step 3):**

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
**What this tests:** `@anthropic-ai/sdk`, `/api/refine-answer` route, Bedrock connectivity, AI suggestion rendering, and — critically — the `reserve_ai_slot` RPC that every AI route calls before touching Bedrock. This is the single most important test in this plan: if the AI cap-check schema is missing on the environment under test, this is where it surfaces (as a generic error, not an obvious "missing function" message).

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
**What this tests:** Step 5 review screen, confirmation checkboxes, final approve action — this calls `approveApplication()`, which runs the `approve_application` Postgres RPC. This RPC was missing from production until 2026-07-01; this test is the direct end-to-end check that it's actually present and working on the environment under test.

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

### RT-11 — Dashboard Reopen Application [FULL]

**User guide reference:** Section 2 (Your Dashboard) — reopening an approved application
**What this tests:** The dashboard "Reopen" action, which calls `reopenApplication()` → the `reopen_application` Postgres RPC. Like RT-09, this RPC was missing from production until 2026-07-01. This is the only test in this plan that exercises the reopen path — RT-06's approve/unapprove cycle is a different code path (direct `is_approved` column update, not this RPC) and does not cover it.

**Prerequisite:** RT-09 complete (an approved application exists)

**Steps:**

1. From the dashboard, locate the application approved in RT-09
2. Click **Reopen** (or equivalent control on the application card)
3. Confirm the application returns to Step 4 with status **In progress**
4. Confirm all previously-approved answers now show as unapproved (per the "resets all approvals" behaviour)
5. Confirm `current_step` is 4 and the Q&A interface loads correctly, not a blank or error state

**Expected result:**

- Reopen action completes without error
- Application status changes from Approved back to In progress
- All answer approvals are reset
- Step 4 Q&A interface loads correctly on return

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Defect Log

| ID    | Test   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Severity | Status                                          |
| ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| D-012 | RT-01a | Registration fails with the generic "Something went wrong" message for every new account. Root cause confirmed by calling Supabase Auth's `/auth/v1/signup` directly (bypassing the app): `{"code":500,"error_code":"unexpected_failure","msg":"Error sending confirmation email"}`. This is an email-delivery failure inside Supabase Auth's SMTP relay (Resend), not an app bug — but the app was silently swallowing the real error into a generic `{ error: 'unknown' }` with no logging, making it look like a mystery app failure. Confirmed no orphaned/partial `auth.users` rows are created when this happens — safe to retry once fixed. | Blocking | ✅ **Resolved 2026-07-02** — see fix note below |

**Fixed alongside this finding:** `actions/auth.ts` now calls `Sentry.captureException(error, { tags: { action: 'registerUser' } })` before returning `{ error: 'unknown' }`, so the real Supabase error is visible in Sentry next time instead of vanishing.

**Root cause and fix (2026-07-02):** The Resend API key configured as the SMTP password in Supabase Dashboard → Authentication → Emails → SMTP Settings (dev project) was invalid/stale — confirmed by querying Resend's API directly with the key on file, which returned `"API key is invalid"`. Resend's own dashboard showed zero sent emails in the last 15 days, consistent with the key never having worked recently rather than a fresh regression. Domain verification was not the issue — `resend._domainkey.grantpathway.org.uk` (DKIM) and `send.grantpathway.org.uk` (SPF) were both correctly configured. Wac generated a new Resend API key (`grant-pathway-supabase-smtp`, Sending-access scope) and updated the SMTP Settings password field. Verified fixed by repeating the direct `/auth/v1/signup` call — Supabase returned a full success response with `confirmation_sent_at` set, no error. **Prod SMTP settings have not been checked** — prod has no live consumer yet, so this was correctly deferred, but should be verified before prod is used for anything.

---

## Appendix A — Resetting or Creating Test Data

If the pre-seeded "Test Application" is no longer available (deleted, exported, or at the wrong step) — or you're using a freshly registered account per RT-01a, which has no application at all yet — create one:

1. Sign in as `grantpathway+idle100@gmail.com` (or skip this if you're already signed in from RT-01a with a fresh account)
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

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-15 | Rapidglobe Ltd | Initial regression test plan. 10 test cases across 2 tiers. Derived from Alan Knox Automated Testing audit and cross-referenced with user guide v1.14.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 1.1     | 2026-07-01 | Rapidglobe Ltd | Added Tier 0 (RT-00 environment/schema verification) after discovering `grant-pathway-dev` and `grant-pathway-prod` were both missing the AI-cap RPC schema (and prod was also missing the approve/reopen RPC) for weeks — invisible from inside the app, only found by querying the database directly. Added RT-11 (dashboard reopen), the only test covering `reopen_application`. Annotated RT-05 and RT-09 with their RPC dependencies. Noted that this plan has zero recorded executions and that every historical funder test result predates the 2026-06-22/06-29 RPC introductions, so none of them are valid evidence the current codebase works end-to-end. 11 test cases across 3 tiers. |
