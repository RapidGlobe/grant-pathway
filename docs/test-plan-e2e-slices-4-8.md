# Grant Pathway — End-to-End Test Plan: Slices 0–8

**Version:** 1.7  
**Date:** 2026-05-22  
**Last updated:** 2026-05-29  
**Scope:** Slices 0 (Authentication), 1 (Charity Profile), 2 (Dashboard), 3 (Application Details), 4 (File Upload), 5 (AI Summary), 6 (Draft Answers), 7 (Approve & Export), 8 (Account Management)  
**Environment:** Staging (Vercel preview) or local dev with Supabase + Bedrock credentials  
**Tester:**  
**Sign-off:**  

---

## Test Results Summary

Complete this table after running all tests.

| Section | Total | Pass | Fail | Blocked | Notes |
|---------|-------|------|------|---------|-------|
| Positive (S0) | 10 | | | | |
| Positive (S1) | 6 | | | | |
| Positive (S2) | 5 | | | | |
| Positive (S3) | 2 | | | | |
| Positive (S4) | 6 | | | | |
| Positive (S5) | 7 | | | | |
| Positive (S6) | 7 | | | | |
| Positive (S7) | 6 | | | | |
| Positive (S8) | 3 | | | | |
| Negative (S0) | 9 | | | | |
| Negative (S1) | 3 | | | | |
| Negative (S2) | 2 | | | | |
| Negative (S3) | 2 | | | | |
| Negative (S4) | 5 | | | | |
| Negative (S5) | 4 | | | | |
| Negative (S6) | 3 | | | | |
| Negative (S7) | 4 | | | | |
| Negative (S8) | 7 | | | | |
| Non-Functional | 13 | | | | |
| Usability / Flow | 12 | | | | |
| **Total** | **116** | | | | |

---

## Defect Log

Log any failures that are NOT in the known expected failures list below.

| ID | Test case | Description | Severity | Status |
|----|-----------|-------------|----------|--------|
| D-001 | S0-P-04 | Sign out button in nav dropdown had no onClick handler — clicking it did nothing and the user remained signed in. Fixed in `components/nav-authenticated.tsx` (2026-05-26). | High | Fixed |
| D-002 | S0-P-05/06 | Password reset email link landed on "Email verified" instead of "Choose a new password". PKCE code exchange in `/auth/callback` routed all successful exchanges to `verify-email?state=verified`. Fixed by passing `next=reset` in `redirectTo` so the callback can distinguish recovery from email verification (2026-05-26). | High | Fixed |
| D-003 | S0-P-06 | Setting the same password during reset showed generic "Something went wrong" error. Fixed by detecting Supabase `same_password` error code and returning a specific message (2026-05-26). | Low | Fixed |
| D-004 | S0-P-06 | After successful password reset, clicking "Sign in" redirected to `/dashboard` instead of the sign-in page. Recovery session remained active after `updateUser`. Fixed by signing out immediately after a successful password update (2026-05-26). | Medium | Fixed |
| D-005 | S6-P-02 | Sticky progress bar not visible when scrolling through Step 4 sections. `sticky top-0` placed the bar directly behind the authenticated nav header (`sticky top-0 z-[100]`, `h-16`), hiding it. Fixed by changing to `top-16` in `components/application-step4-draft.tsx` (2026-05-29). | Medium | Fixed |
| D-006 | S6-P-02 | Back button only present at the bottom of Step 4. On long free_form applications (e.g. 11 sections) users had no way to navigate back to Step 3 without scrolling past all sections. Fixed by adding a ← Back link to the top-right of the funder context bar in `components/application-step4-draft.tsx` (2026-05-29). | Medium | Fixed |
| D-007 | S5-P-02b | Typo in Step 3 free_form confirmation message: "11 sectionsto complete" (missing space). Caused by JSX whitespace stripping the newline between text `section` and expression `{"s"}`. Fixed by rewriting as a template literal in `components/application-step3-summary.tsx` (2026-05-29). | Low | Fixed |
| D-008 | S6-N-01 | `parse_error` returned by `/api/refine-answer` when "Help me improve this" clicked on sections with very short answers (e.g. 1–2 words). AI returns a conversational response ("Your answer is too short...") instead of the expected `{ "refinedText": "..." }` JSON, causing `JSON.parse` to fail. Fixed by strengthening `buildRefinePrompt` in `lib/prompts.ts`: added explicit instruction to return JSON only (no preamble, no markdown), and to return the answer unchanged if too short to improve (2026-05-29). | Medium | Fixed |
| D-009 | S6-N-03 | `rate_limited` returned by `/api/refine-answer` when "Help me improve this" clicked on multiple sections in quick succession. Upstash sliding window limit is 5 requests per 60 seconds — correct production behaviour but surfaced during testing. Not a bug. Stale comment in `lib/rate-limit.ts` referenced old 20 req/month cap (cap is 50). Fixed by updating the comment (2026-05-29). | Low | Fixed |

---

## Test Fixtures

The canonical list of 12 target funders (10 structured, 2 narrative) is in [`docs/target-funder-list.md`](../target-funder-list.md). Guidelines for all 12 funders should be sourced from the URLs in that document before running a full test cycle.

The following real funder guideline files are currently available in `docs/test-fixtures/`:

| File | Format | Funder type | Notes |
|------|--------|-------------|-------|
| `tnl-community-fund-application-form-2025.docx` | DOCX | Structured | National Lottery Community Fund — medium length, has named questions with word limits |
| `heritage-fund-application-guidance.pdf` | PDF | Structured | National Lottery Heritage Fund — structured guidance with discrete questions |
| `Garfield Weston Application-guidelines-1.pdf` | PDF | Narrative (free_form) | Garfield Weston Foundation — 10-page narrative proposal; no discrete questions; primary test for free_form path |

**Missing fixtures (source from `docs/target-funder-list.md` before full test run):**
- Idlewild Trust — Arts and Conservation question set PDFs now in `docs/test-fixtures/` — **do not use for full structured-path testing until GAP-27 and GAP-28 are resolved** (character limits not supported; non-text questions extracted as text)
- A B Charitable Trust — PDF question set (structured)
- Clothworkers' Foundation — online guidelines (structured)
- Henry Smith Foundation — Stage 1 questions (structured)
- Wolfson Foundation — Stage 1 questions with per-question word limits (structured)
- Lloyds Bank Foundation CI — PDF Advice Note (structured)
- Foyle Foundation — sector-specific guidance PDF (structured)
- Walton Charity — guidelines PDF (structured)
- Nationwide Building Society Community Grants — guidance and FAQ PDF (structured)
- Motability Foundation — guidance PDFs (structured)
- City Bridge Foundation — Word sample form (narrative / free_form)

You will need to create additional files to test error states:

| Required | How to create |
|----------|--------------|
| Oversized file (>10MB) | Copy any PDF and pad it, or use a large stock PDF |
| Wrong format (e.g. `.jpg`) | Rename any image file |
| Scanned / image-only PDF | Print-to-PDF with no text layer, or use a scanned document |

---

## Test Accounts

Create dedicated test accounts before starting. You do not need separate email inboxes for each — if you use Gmail, the `+` alias trick lets you create multiple accounts from a single inbox:

- `yourname+gp1@gmail.com` → Primary test user
- `yourname+gp2@gmail.com` → Secondary / cross-user test
- `yourname+gpdelete@gmail.com` → Deletion test (this account will be destroyed)
- `yourname+gppassword@gmail.com` → Password change test

All four deliver to the same Gmail inbox. Supabase treats each as a distinct email address.

> **Note:** The registration tests in Section 1 (S0-P-01 onwards) will create these accounts as part of the test run. You do not need to set them up in advance — work through S0-P-01 four times (once per account) before running any other tests.

| Account | Purpose |
|---------|---------|
| **Primary test user** (`yourname+gp1@gmail.com`) | Main happy-path testing |
| **Secondary test user** (`yourname+gp2@gmail.com`) | Cross-user security tests (RLS) |
| **Deletion test user** (`yourname+gpdelete@gmail.com`) | Account deletion — expect this to be destroyed |
| **Password change test user** (`yourname+gppassword@gmail.com`) | Password change tests |

Each account must have:
- Email verified (S0-P-02)
- Charity profile complete (S1-P-03) — required before Step 2 onwards

---

## Cron Job Status During Testing

> ✅ **Vercel Pro plan is active.** All three cron jobs are running normally.

| Cron job | Schedule | Status | Impact during testing |
|---|---|---|---|
| `cleanup-guidelines` | Every 30 min | ✅ Running | Orphaned files in `guidelines-temp` are cleaned up automatically within 30 minutes — no manual action required |
| `inactivity-warning` | Daily 08:00 UTC | ✅ Running | No impact during testing — requires 23 months of inactivity to trigger |
| `inactivity-deletion` | Daily 09:00 UTC | ✅ Running | No impact during testing — requires 24 months of inactivity to trigger |

### Optional manual cleanup — `guidelines-temp` bucket

Manual cleanup is not required during normal testing. However, if you need an immediate cleanup between tests (e.g. to verify storage behaviour), you can do so manually:

1. Log in to [supabase.com](https://supabase.com) → select the **grant-pathway-dev** project
2. Go to **Storage** → **guidelines-temp** bucket
3. Select all files in the bucket root and click **Delete**

There is no risk to application data — the `guidelines-temp` bucket holds only in-flight upload files. Deleting files does not affect any application or user record.

---

## How to read this plan

Each test case has:
- **ID** — unique reference (e.g. `S4-P-01`)
- **Preconditions** — what must be true before you start
- **Steps** — numbered actions
- **Expected result** — what should happen
- **Pass / Fail** — tick when run

Prefix key: `S0` = Slice 0, `S1` = Slice 1, `S2` = Slice 2, `S3` = Slice 3, `S4` = Slice 4, `S5` = Slice 5, `S6` = Slice 6, `S7` = Slice 7, `S8` = Slice 8  
Suffix: `P` = Positive, `N` = Negative, `NF` = Non-functional, `UX` = Usability/flow

---

---

# 1. POSITIVE TESTS

---

## Slice 0 — Authentication

### S0-P-01 — Register a new account

> **Account creation test.** Run this test four times — once for each test account (primary, secondary, deletion, password). Use a different email address each time.

**Preconditions:** Not signed in. Browser at `grant-pathway-three.vercel.app`.

1. Navigate to `/register`.
2. Enter first name, last name, a valid email address, a password of at least 10 characters, and confirm the password.
3. Tick the Terms of Service checkbox.
4. Optionally tick the feedback opt-in checkbox.
5. Click **Create account**.

**Expected result:**
- No inline validation errors appear when all fields are valid.
- Browser navigates to `/verify-email` showing "Check your email" with the registered address displayed.
- A verification email arrives at the registered address within 2 minutes (check spam if not in inbox).

---

### S0-P-02 — Verify email address

**Preconditions:** S0-P-01 complete. Verification email received.

1. Open the verification email.
2. Click the verification link.

**Expected result:**
- Browser navigates to `/verify-email?state=verified`.
- Page shows "Email verified" with a green tick icon.
- A **Go to my dashboard** button is visible.
- Clicking **Go to my dashboard** navigates to `/dashboard`.

> **Before proceeding to S0-P-03:** Sign out of the service. Click the account avatar/initials in the top-right navigation and select **Sign out**. Confirm you are returned to the sign-in page (`/`) before starting the next test.

---

### S0-P-03 — Sign in with valid credentials

**Preconditions:** Account registered and email verified (S0-P-01, S0-P-02).

1. Navigate to `/` (the sign-in page).
2. Enter the registered email and password.
3. Click **Sign in**.

**Expected result:**
- Browser navigates to `/dashboard`.
- The authenticated navigation bar is visible with the user's first name or initials in the account dropdown.
- No error messages appear.

---

### S0-P-04 — Sign out

**Preconditions:** Signed in (S0-P-03).

1. Click the account avatar/initials in the top-right navigation.
2. Click **Sign out** in the dropdown.

**Expected result:**
- Browser navigates to `/` (sign-in page).
- The unauthenticated navigation bar is shown.
- Attempting to navigate directly to `/dashboard` redirects back to `/`.

---

### S0-P-05 — Request a password reset link

**Preconditions:** Not signed in.

1. Navigate to `/` (sign-in page).
2. Click **Forgot password**.
3. Enter the registered email address.
4. Click **Send reset link**.

**Expected result:**
- Page shows a generic confirmation: "If that address is registered, we've sent a reset link." (or similar — exact wording per design).
- Confirmation is shown regardless of whether the email is registered (no email enumeration).
- A password reset email arrives within 2 minutes.

---

### S0-P-06 — Reset password using link

**Preconditions:** S0-P-05 complete. Reset email received.

1. Open the password reset email.
2. Click the reset link.
3. On the reset form, enter a new password (at least 10 characters) and confirm it.
4. Click **Save new password**.

**Expected result:**
- Page shows a success message with a **Sign in** button.
- Signing in with the new password succeeds (repeat S0-P-03 with the new password).
- Signing in with the old password fails (repeat S0-N-07).

---

### S0-P-07 — Resend verification email

**Preconditions:** Account registered but NOT yet verified. On the `/verify-email` page.

1. Click **Resend verification email**.

**Expected result:**
- A success message confirms the email has been resent.
- A new verification email arrives.
- Clicking the new link verifies the account successfully.

---

### S0-P-08 — Set up MFA (two-factor authentication)

**Preconditions:** Signed in (S0-P-03). On `/account`.

1. Navigate to **Account settings** (`/account`).
2. In the **Two-factor authentication** section, click **Set up two-factor authentication**.
3. Scan the QR code with an authenticator app (e.g. Google Authenticator, Authy).
4. Enter the 6-digit code shown in the authenticator app.
5. Click **Verify**.

**Expected result:**
- MFA status changes to **Enabled**.
- A **Remove two-factor authentication** link is shown in place of the setup button.

---

### S0-P-09 — Sign in with MFA enabled

**Preconditions:** MFA enabled (S0-P-08). Signed out.

1. Navigate to `/` and sign in with valid credentials.
2. When the MFA challenge page appears, enter the 6-digit code from the authenticator app.
3. Click **Verify**.

**Expected result:**
- Browser navigates to `/dashboard`.
- Sign-in is successful.

---

### S0-P-10 — Remove MFA

**Preconditions:** MFA enabled (S0-P-08). Signed in.

1. Navigate to **Account settings** (`/account`).
2. Click **Remove two-factor authentication**.
3. Confirm the removal.

**Expected result:**
- MFA status changes to **Not enabled**.
- **Set up two-factor authentication** button is shown.
- Next sign-in does NOT prompt for an MFA code.

---

## Slice 1 — Charity Profile

### S1-P-01 — Look up charity by name

**Preconditions:** Signed in. No charity profile saved yet. On `/profile`.

1. In the Charity Commission lookup field, type the name of a real UK registered charity (e.g. "Oxfam").
2. Click **Look up charity**.

**Expected result:**
- A match result is shown with the charity name and registration number pre-filled.
- An amber banner prompts you to review the AI-generated descriptions in the "What does it do" and "Who does it help" fields.
- All pre-filled fields are editable.

---

### S1-P-02 — Look up charity by registration number

**Preconditions:** As S1-P-01.

1. In the Charity Commission lookup field, enter a valid charity registration number (e.g. `202918` for Oxfam).
2. Click **Look up charity**.

**Expected result:** Same as S1-P-01 — match found, fields pre-filled.

---

### S1-P-03 — Save charity profile (first time)

**Preconditions:** Signed in. No charity profile saved yet. On `/profile`.

1. Complete all required fields (charity name, what it does, who it helps, where it works). Registration number is optional.
2. Click **Save profile**.

**Expected result:**
- Page replaces the form with a green success card: "Your profile has been saved."
- A **Go to my dashboard** button is visible.
- Navigating back to `/profile` shows the edit state with the saved data pre-filled.

---

### S1-P-04 — Edit existing charity profile

**Preconditions:** Charity profile already saved (S1-P-03). On `/profile`.

1. Change the content of at least one field.
2. Click **Save changes**.

**Expected result:**
- A green success banner appears above the form: "Your changes have been saved."
- The form remains visible with the updated values.
- Navigating away and returning to `/profile` shows the updated values.

---

### S1-P-05 — Profile incomplete banner shown on dashboard

**Preconditions:** Signed in. No charity profile saved.

1. Navigate to `/dashboard`.

**Expected result:**
- An amber or teal banner is visible prompting the user to set up their charity profile.
- The **Start** button (to begin a new application) is disabled.
- Hovering over the Start button shows a tooltip: "Please set up your charity profile first" (or similar).

---

### S1-P-06 — Profile banner disappears after profile saved

**Preconditions:** S1-P-03 complete (profile saved).

1. Navigate to `/dashboard`.

**Expected result:**
- The profile incomplete banner is no longer shown.
- The **+ New Application** or **Start** button is active.

---

## Slice 2 — Dashboard and Application Management

### S2-P-01 — Empty state shown when no applications exist

**Preconditions:** Signed in. Charity profile complete. No applications created.

1. Navigate to `/dashboard`.

**Expected result:**
- A "You don't have any applications yet" message is shown (or similar).
- A three-step explainer or getting started prompt is visible.
- A **Start** or **New Application** button is available and active.

---

### S2-P-02 — Create a new application

**Preconditions:** As S2-P-01.

1. Click **+ New Application** (or **Start**).

**Expected result:**
- Browser navigates to `/applications/[id]/step/1`.
- The page shows "Start a new application" with empty funder name and grant name fields.
- A step indicator is visible with Step 1 highlighted.

---

### S2-P-03 — Application card shows correct status

**Preconditions:** At least one application exists with a known status.

1. Navigate to `/dashboard`.
2. Observe the application card(s).

**Expected result:**
- Each card shows the funder name and grant name.
- The status pill matches the application's actual status (Not started / In progress / Approved / Exported) in the correct colour.
- Applications with status `not_started` or `in_progress` show a **Continue** button.
- Applications with status `approved` or `exported` show a **View** button.

---

### S2-P-04 — Continue button resumes application at correct step

**Preconditions:** An application exists with `current_step` > 1.

1. On the dashboard, click **Continue** on an in-progress application.

**Expected result:**
- Browser navigates directly to the step stored in `current_step` for that application.
- The correct step page is shown with any previously saved data intact.

---

### S2-P-05 — Delete an application

**Preconditions:** At least one application exists.

1. On the dashboard, click **Delete** on an application card.
2. Read the confirmation modal.
3. Click the confirm delete button.

**Expected result:**
- The confirmation modal shows text appropriate to the application's status.
- After confirming, the application card is removed from the dashboard immediately.
- If it was the only application, the empty state is shown.
- The deletion cannot be undone — navigating back to `/dashboard` confirms the card is gone.

---

## Slice 3 — Step 1: Application Details

### S3-P-01 — Save Step 1 details for a new application

**Preconditions:** Signed in. Charity profile complete. New application created (S2-P-02).

1. On Step 1, enter a funder name (e.g. "National Lottery Community Fund").
2. Enter a grant name (e.g. "Awards for All England 2026").
3. Click **Continue**.

**Expected result:**
- Browser navigates to Step 2 (`/applications/[id]/step/2`).
- The step indicator shows Step 1 as completed (tick) and Step 2 as current.
- Navigating back to Step 1 shows the funder name and grant name pre-filled.
- The dashboard card now shows the funder name as the application title.

---

### S3-P-02 — Return to Step 1 of an existing application

**Preconditions:** Application with saved funder name and grant name exists.

1. Navigate to `/applications/[id]/step/1`.

**Expected result:**
- Both the funder name and grant name fields are pre-filled with the previously saved values.
- Heading reads "Continue your application" (not "Start a new application").
- Editing and clicking **Continue** saves the updated values correctly.

---

## Slice 4 — Step 2: File Upload

### S4-P-01 — Upload valid PDF via drag-and-drop

**Preconditions:** Signed in; charity profile complete; application at Step 2 (`current_step = 2`).

1. Navigate to `/applications/[id]/step/2`.
2. Drag `heritage-fund-application-guidance.pdf` onto the upload dropzone.
3. Observe the upload progress bar.
4. Wait for the upload to complete.
5. Click **Continue**.

**Expected result:**
- Upload progress bar appears and advances to 100%.
- Filename is shown with a remove button.
- Large-document warning banner does NOT appear (this file is standard size).
- Continue button becomes active.
- Browser navigates to Step 3.
- File is deleted from Supabase Storage within seconds (fire-and-forget after extraction).

---

### S4-P-02 — Upload valid DOCX via file picker

**Preconditions:** As S4-P-01.

1. Navigate to Step 2.
2. Click anywhere in the upload area to open the file picker.
3. Select `tnl-community-fund-application-form-2025.docx`.
4. Click **Continue**.

**Expected result:** Same as S4-P-01 — progress bar, filename displayed, navigates to Step 3.

---

### S4-P-03 — Paste guidelines text directly

**Preconditions:** As S4-P-01.

1. Navigate to Step 2.
2. Leave the upload area empty.
3. Click in the paste textarea and type (or paste) a block of text at least 200 characters long describing a fictional grant.
4. Click **Continue**.

**Expected result:**
- Continue button becomes active as soon as text is entered.
- Browser navigates to Step 3.
- No upload progress bar is shown.

---

### S4-P-04 — Large-document advisory banner

**Preconditions:** As S4-P-01.

1. Navigate to Step 2.
2. Upload `Garfield Weston Application-guidelines-1.pdf` (longer document).
3. Observe the page after upload completes.

**Expected result:**
- If the extracted text exceeds the large-document threshold (~100k tokens), an amber advisory banner appears: "This document is very long…" (exact wording per design).
- Continue button is still active — the warning does not block progression.
- If the banner does NOT appear, note it as "file too short to trigger" rather than a failure — verify with a manually padded large text file if needed.

---

### S4-P-05 — Remove uploaded file and replace

**Preconditions:** As S4-P-01. File already uploaded (from S4-P-01 or fresh upload).

1. On Step 2 with a file showing, click the remove (×) button next to the filename.
2. Observe the upload area.
3. Upload a different file (`heritage-fund-application-guidance.pdf`).
4. Click **Continue**.

**Expected result:**
- Upload area returns to idle/empty state after removal.
- Continue button becomes disabled again once file is removed.
- Second file uploads successfully and Continue re-activates.

---

### S4-P-06 — Guidelines persist in sessionStorage on page refresh

**Preconditions:** Step 2 with a file successfully uploaded (guidelines text now in sessionStorage).

1. Press F5 (refresh) on the Step 2 page.
2. Observe whether the extracted guidelines text is still available.

**Expected result:** After refresh, the Step 2 page shows the previously uploaded file/text is still present (restored from sessionStorage). Continue button is active. No re-upload is required.

---

---

## Slice 5 — Step 3: AI Summary

### S5-P-01 — AI summary auto-generates on page load

**Preconditions:** Application has reached Step 3 (`current_step = 3`). Guidelines text is in sessionStorage.

1. Navigate to `/applications/[id]/step/3`.
2. Observe the loading state immediately.

**Expected result:**
- Loading state appears automatically (no button press needed).
- Staged messages cycle: "Reading your funder guidelines…" → "Almost there…"
- Progress bar advances (asymptotic, holds near 90% if API is slow).
- Summary card appears when the API responds.
- At least one question is extracted and listed.
- Progress bar snaps to 100% and loading state is replaced by the summary.

---

### S5-P-02 — Summary content is accurate and structured (structured funder)

**Preconditions:** Summary generated using `tnl-community-fund-application-form-2025.docx` (structured funder).

1. Review the summary displayed on Step 3.

**Expected result:**
- Summary is displayed as individual cards in a responsive two-column grid (side-by-side on desktop, stacked on mobile).
- "About this grant" card spans full width.
- "Grant amount" and "Who can apply" cards sit side-by-side (Grant amount expands to full width if Who can apply is absent).
- Each card heading has a teal left border highlight.
- An "Application questions" card is shown (not "Application sections").
- Green confirmation note reads "X questions found" (not "X sections to complete").
- Extracted questions reflect questions present in the DOCX.
- Word limits are displayed alongside questions where specified in the source document.
- No "Documents you will need to submit" card is shown.

---

### S5-P-02b — Summary content for a free_form (narrative) funder

**Preconditions:** Summary generated using `Garfield Weston Application-guidelines-1.pdf` (free_form funder).

1. Review the summary displayed on Step 3.

**Expected result:**
- Two-column card layout as above.
- An "Application sections" card is shown (not "Application questions").
- Green confirmation note reads "X sections to complete".
- Sections reflect the narrative headings in the Garfield Weston guidelines (e.g. "About your organisation", "Your project").
- No numbered questions are listed.

---

### S5-P-03 — AI usage counter increments

**Preconditions:** Note the current AI usage count from the dashboard before starting (e.g. "3 of 50 AI requests used this month").

1. Complete the Step 3 summary generation (S5-P-01).
2. Navigate to the dashboard.
3. Check the AI usage indicator.

**Expected result:** Usage count has incremented by 1 (e.g. "4 of 50 AI requests used this month").

---

### S5-P-04 — Regenerate summary

**Preconditions:** Step 3 with a summary already displayed.

1. Click **Regenerate summary**.
2. Observe the loading state.
3. Wait for the new summary.

**Expected result:**
- Loading state reappears and runs the full generation cycle again.
- A new (potentially different) summary is displayed.
- AI usage counter increments by 1 again.

---

### S5-P-05 — Approaching AI usage limit banner

**Preconditions:** AI usage count is at 40 or above (test account with 40 uses already consumed, or manually insert rows into `ai_usage_log` via Supabase dashboard for the current month).

1. Navigate to Step 3 and trigger summary generation.

**Expected result:** Amber approaching-limit banner is shown on the Step 3 page alongside the summary: "You've used N of 50 AI requests this month."

---

### S5-P-06 — Continue to Step 4

**Preconditions:** Step 3 with a summary successfully displayed.

1. Click **Continue**.

**Expected result:**
- Browser navigates to Step 4 (`/applications/[id]/step/4`).
- `current_step` is updated to 4 in the database (verify by navigating to dashboard and clicking Continue — it should resume at Step 4).

---

---

## Slice 6 — Step 4: Q&A Interview (charity-authored model)

> **Design model (2026-05-28):** Step 4 uses a charity-authored model — the charity writes all answers from scratch. AI does NOT auto-generate answers on page load. The optional "Help me improve this" button (non-budget questions only) calls `/api/refine-answer` to improve structure and clarity without adding facts. The preparation checklist gate appears once when `draft_status = 'not_started'`.

### S6-P-01 — Preparation checklist shown on first visit

**Preconditions:** Application at Step 4 for the first time (`draft_status = 'not_started'`).

1. Navigate to `/applications/[id]/step/4`.
2. Observe the page.

**Expected result:**
- No AI loading state appears.
- A preparation checklist is shown with heading "Before you begin writing".
- The checklist lists financial items to gather (annual accounts, projected budget, other funding, treasurer input).
- A note: "It is worth involving a senior colleague before reaching the financial questions."
- A **"I have what I need — start writing"** button is visible.
- No Q&A interface or textareas are visible yet.

---

### S6-P-02 — Preparation checklist dismissed; Q&A interface shown

**Preconditions:** S6-P-01 complete. On the preparation checklist.

1. Click **"I have what I need — start writing"**.
2. Observe the page.

**Expected result:**
- `draft_status` is set to `'in_progress'` in the database.
- The Q&A interface is shown immediately (no page reload required).
- **For structured funders:** Questions are shown as numbered headings (e.g. "1. Tell us about your organisation") with an empty editable textarea below each.
- **For free_form funders:** Section titles are shown as unnumbered headings (e.g. "About your organisation") with a guidance note beneath the title and an empty editable textarea below.
- A teal funder context bar is shown near the top with the funder name and grant name.
- A sticky progress bar shows "0 of N sections/questions completed".

---

### S6-P-03 — Returning to Step 4 skips preparation checklist

**Preconditions:** `draft_status` is `'in_progress'` (preparation checklist already dismissed).

1. Navigate away from Step 4 (e.g. to Step 3 or dashboard).
2. Navigate back to Step 4.

**Expected result:**
- The preparation checklist is NOT shown.
- The Q&A interface loads immediately with any previously saved answers intact.

---

### S6-P-03b — Returning via Step 3 does not reset advanced draft states

**Preconditions:** Application where `draft_status` is `'ready_to_assemble'` or `'assembled'` (user has already completed writing or assembled the draft).

1. Navigate back to Step 3 (e.g. using the step indicator or Back link).
2. Click **Continue** on Step 3 to advance to Step 4 again.

**Expected result:**
- `draft_status` is NOT reset to `'not_started'`.
- The preparation checklist is NOT shown.
- The Q&A interface loads with all previously saved answers intact.
- The progress bar reflects the previously completed sections/questions.

---

### S6-P-04 — Auto-save on blur and word count

**Preconditions:** S6-P-02 complete. Q&A interface visible.

1. Click into a textarea and type or paste a multi-sentence answer (at least 50 words).
2. Click outside the textarea (trigger blur).
3. Observe the progress bar and any character/word counter.
4. Refresh the page.

**Expected result:**
- After the blur, the answer is saved to the database automatically (no button press needed).
- If a word limit is shown for that question/section, a word counter is visible.
- After page refresh, the saved answer is still present.
- The progress bar updates to reflect the completed section/question (green indicator).

---

### S6-P-05 — Budget section shown with amber background and AI disabled

**Preconditions:** Application using a structured or free_form funder that has a budget question/section.

1. Locate the budget question or section on Step 4 (should have amber/yellow background).
2. Observe the AI button state for that section.

**Expected result:**
- Budget question/section has a visually distinct amber background.
- The AI assist button (if present) is **disabled** for this section with a label indicating it cannot be used for financial data.
- Non-budget sections have the AI assist button enabled (or a "Help me improve this" link active).

---

### S6-P-06 — "Assemble and advance" moves to Step 5

**Preconditions:** All questions/sections have a saved answer (or at minimum the required fields). Q&A interface on Step 4.

1. Click the button to proceed (e.g. **"Review and assemble"** or equivalent final action on Step 4).
2. Confirm in any confirmation prompt that appears.

**Expected result:**
- Browser navigates to Step 5 (`/applications/[id]/step/5`).
- `current_step` is updated to 5 in the database.
- `assembled_draft` is populated in the `applications` table (verify via Supabase dashboard if needed).

---

---

## Slice 7 — Step 5: Approve & Export

### S7-P-01 — All three checkboxes gate the Approve button

**Preconditions:** Application at Step 5; status is `in_progress` or `approved`.

1. Navigate to Step 5.
2. Observe the Approve button state with zero checkboxes ticked.
3. Tick checkbox 1 only. Observe.
4. Tick checkbox 2 only (1 + 2 ticked). Observe.
5. Tick all three checkboxes.

**Expected result:**
- Approve button is disabled with 0, 1, or 2 checkboxes ticked.
- Approve button becomes active only when all three are ticked.

---

### S7-P-02 — Approve application

**Preconditions:** Step 5; all three checkboxes ticked.

1. Click **Approve my application**.
2. Confirm in the confirmation dialog.

**Expected result:**
- Green "Application approved" banner appears.
- Application status in the database changes to `'approved'`.
- `is_approved = true` on all `application_answers` rows (verify via Supabase dashboard).
- Both download buttons become active.
- "Re-open application" link appears.

---

### S7-P-03 — Download as Word document (.docx)

**Preconditions:** Application is approved (S7-P-02 complete).

1. Click **Download as Word document**.
2. Open the downloaded `.docx` file in Microsoft Word (or Google Docs).

**Expected result:**
- File downloads with a sensible filename (e.g. `grant-pathway-export.docx`).
- Document opens without errors.
- Document contains: funder name, grant name, today's date.
- Questions and answers are clearly formatted (question as heading, answer as body text).
- Disclaimer paragraph is present and reads: *"This draft was generated with AI assistance and reviewed by [your full name]. Please review carefully before submitting to the funder."*
  - **Note:** Current implementation uses different wording (GAP-24). Record exact wording found vs expected.
- Attribution footer is present at the end of the document.
- Font is Calibri; margins are approximately 2.54cm; document is A4.
- Application status in DB changes to `'exported'`; `last_exported_at` is set.

---

### S7-P-04 — Download as plain text (.txt)

**Preconditions:** Application is approved.

1. Click **Download as plain text (.txt)**.
2. Open the downloaded `.txt` file in a text editor.

**Expected result:**
- File downloads.
- Plain text contains funder name, grant name, date, all questions and answers, disclaimer, and attribution.
- No HTML tags or formatting artefacts present.
- Readable with correct line breaks.

---

### S7-P-05 — Re-export shows warning dialog with last export date

**Preconditions:** Application has been exported at least once (status = `'exported'`; `last_exported_at` is set).

1. On Step 5, click **Download as Word document** again.

**Expected result:**
- Re-export warning dialog appears (not an immediate download).
- Dialog shows the real `last_exported_at` date in the correct format (e.g. "22 May 2026").
- Clicking **Download anyway** triggers the download.
- Clicking **Cancel** closes the dialog with no download.

---

### S7-P-06 — Re-open application

**Preconditions:** Application is approved or exported (Step 5 shown).

1. Click **Re-open application**.
2. Confirm in the re-open dialog.

**Expected result:**
- Browser navigates to Step 4.
- Application status in DB reverts to `'in_progress'`.
- `is_approved = false` on all `application_answers` rows.
- On Step 5, the green "Application approved" banner is not shown.

---

---

## Slice 8 — Account Management

### S8-P-01 — Change password successfully

**Preconditions:** Signed in as `test-password@example.com`; current password is known.

1. Navigate to `/account`.
2. Enter the correct current password in the "Current password" field.
3. Enter a new password (≥10 characters, different from current) in "New password".
4. Repeat the new password in "Confirm new password".
5. Click **Update password**.

**Expected result:**
- Button shows "Updating…" while the server action runs.
- Green success banner: "Your password has been updated."
- All three password fields are cleared.
- No errors shown.
- Sign out, then sign back in using the **new** password — sign-in succeeds.
- Sign-in using the **old** password fails (credentials error).

---

### S8-P-02 — Delete account (full cascade verification)

**Preconditions:** Signed in as `test-delete@example.com`; charity profile and at least one application with answers exist.

1. Note the user's Supabase UUID from the Supabase dashboard (Auth → Users) before deletion.
2. Navigate to `/account/delete`.
3. Type `DELETE` in the confirmation field (exact case).
4. Click **Permanently delete my account**.

**Expected result:**
- Button shows "Deleting…" during the request.
- Browser navigates to `/` with `?deleted=true` query param.
- Green "Your account has been deleted. We've sent you a confirmation email." banner is shown on the sign-in page.
- **Verify in Supabase dashboard:**
  - User no longer exists in Auth → Users.
  - `user_profiles` row for that UUID is deleted.
  - `charity_profiles` row is deleted.
  - `applications` rows are deleted.
  - `application_answers` rows (linked to those applications) are deleted.
  - `ai_usage_log` rows are deleted.
- Email 2 (account deleted confirmation) is received at `test-delete@example.com`.

---

### S8-P-03 — Sign-in page shows deletion confirmation banner

**Preconditions:** Account deletion redirect has just occurred (from S8-P-02) OR manually navigate to `/?deleted=true`.

1. Observe the sign-in page.

**Expected result:** Green banner is visible: "Your account has been deleted. We've sent you a confirmation email." No other error states are shown.

---

---

# 2. NEGATIVE TESTS

---

## Slice 0 — Authentication

### S0-N-01 — Register with first name empty

**Preconditions:** On `/register`.

1. Leave the first name field blank.
2. Fill all other fields correctly.
3. Click **Create account**.

**Expected result:**
- An inline validation error appears beneath the first name field.
- The form is not submitted.
- No email is sent.

---

### S0-N-02 — Register with invalid email format

**Preconditions:** On `/register`.

1. Enter `notanemail` in the email field.
2. Fill all other fields correctly.
3. Click **Create account**.

**Expected result:**
- An inline validation error appears beneath the email field ("Enter a valid email address" or similar).
- The form is not submitted.

---

### S0-N-03 — Register with password shorter than 10 characters

**Preconditions:** On `/register`.

1. Enter a password of fewer than 10 characters (e.g. `Short1`).
2. Fill all other fields correctly.
3. Click **Create account**.

**Expected result:**
- An inline validation error appears: "Password must be at least 10 characters" (or similar).
- The form is not submitted.

---

### S0-N-04 — Register with mismatched passwords

**Preconditions:** On `/register`.

1. Enter a valid password in the password field.
2. Enter a different value in the confirm password field.
3. Fill all other fields correctly and click **Create account**.

**Expected result:**
- An inline validation error appears beneath the confirm password field: "Passwords do not match" (or similar).
- The form is not submitted.

---

### S0-N-05 — Register without accepting terms

**Preconditions:** On `/register`.

1. Fill all fields correctly.
2. Leave the Terms of Service checkbox unticked.
3. Click **Create account**.

**Expected result:**
- An inline validation error appears next to the terms checkbox.
- The form is not submitted.

---

### S0-N-06 — Register with an already-registered email

**Preconditions:** On `/register`. An account already exists for the email you will use.

1. Fill in the registration form using an email address that is already registered.
2. Click **Create account**.

**Expected result:**
- An error message is shown indicating the email is already in use.
- The form is not submitted and no duplicate account is created.
- Note: Supabase uses a privacy-preserving approach — the error may be surfaced as a general "account already exists" message rather than a specific email-exists error. Either is acceptable as long as the duplicate account is not created.

---

### S0-N-07 — Sign in with wrong password

**Preconditions:** On `/` (sign-in page). Valid registered and verified account exists.

1. Enter the correct email address.
2. Enter an incorrect password.
3. Click **Sign in**.

**Expected result:**
- An error message appears: "Incorrect email address or password" (or similar generic wording — must not reveal whether the email is registered).
- The user remains on the sign-in page.
- No navigation to the dashboard occurs.

---

### S0-N-08 — Sign in with unverified email

**Preconditions:** On `/` (sign-in page). Account registered but email NOT verified.

1. Enter the email and password for an unverified account.
2. Click **Sign in**.

**Expected result:**
- An error message or banner appears indicating the email has not been verified.
- A link or button to resend the verification email is shown.
- The user is not signed in.

---

### S0-N-09 — Access a protected page when signed out

**Preconditions:** Signed out.

1. Attempt to navigate directly to `/dashboard` by typing the URL in the browser.

**Expected result:**
- Browser redirects to `/` (sign-in page).
- The dashboard is not accessible.
- After signing in, the user lands on the dashboard (not a 404 or error page).

---

## Slice 1 — Charity Profile

### S1-N-01 — Charity Commission lookup — no match

**Preconditions:** Signed in. On `/profile`.

1. In the Charity Commission lookup field, enter a search term that will not match any charity (e.g. `ZZZZNOTACHARITY999`).
2. Click **Look up charity**.

**Expected result:**
- An amber "no match" result is shown.
- The form fields are not pre-filled.
- The user can still enter their charity details manually.

---

### S1-N-02 — Save profile with required fields empty

**Preconditions:** Signed in. On `/profile`.

1. Leave one or more required fields empty (e.g. clear the charity name field).
2. Click **Save profile** (or **Save changes**).

**Expected result:**
- Inline validation errors appear beneath each empty required field.
- The form is not submitted.
- No data is saved to the database.

---

### S1-N-03 — Start button disabled when profile incomplete

**Preconditions:** Signed in. No charity profile saved.

1. Navigate to `/dashboard`.
2. Attempt to click the **Start** or **+ New Application** button.

**Expected result:**
- The button is visually disabled (greyed out or non-clickable).
- A tooltip appears on hover: "Please set up your charity profile first" (or similar).
- No new application is created.

---

## Slice 2 — Dashboard and Application Management

### S2-N-01 — Delete application — cancel in confirmation modal

**Preconditions:** At least one application exists on the dashboard.

1. Click **Delete** on an application card.
2. When the confirmation modal appears, click **Cancel**.

**Expected result:**
- The modal closes.
- The application card remains on the dashboard unchanged.
- No data is deleted.

---

### S2-N-02 — Cross-user application access (RLS check)

**Preconditions:** Two test accounts exist (primary and secondary). Application `[id]` belongs to the primary account.

1. Sign in as the secondary test user.
2. Attempt to navigate directly to `/applications/[id]/step/1` using the application ID that belongs to the primary user.

**Expected result:**
- The page does not display the primary user's application data.
- The user is redirected to `/dashboard` or shown a "not found" / "access denied" result.
- Under no circumstances is another user's application data visible.

---

## Slice 3 — Step 1: Application Details

### S3-N-01 — Continue from Step 1 with required fields empty

**Preconditions:** Signed in. On Step 1 of a new application.

1. Leave both the funder name and grant name fields empty.
2. Click **Continue**.

**Expected result:**
- Inline validation errors appear beneath the empty fields.
- The form is not submitted.
- The browser does not navigate to Step 2.

---

### S3-N-02 — Step locking — attempt to skip to Step 2 before completing Step 1

**Preconditions:** Application exists with `current_step = 1` (Step 1 not yet saved).

1. Manually type the Step 2 URL into the browser address bar: `/applications/[id]/step/2`.

**Expected result:**
- The browser redirects to Step 1 (`/applications/[id]/step/1`).
- Step 2 is not accessible until Step 1 has been saved and submitted.

---

## Slice 4 — File Upload Errors

### S4-N-01 — Upload file with wrong format

**Preconditions:** Step 2.

1. Upload any file with extension `.jpg`, `.png`, `.xlsx`, or `.csv`.

**Expected result:**
- Client-side validation fires immediately (before any network request).
- Format error state shown: "File must be a PDF or Word document."
- No upload progress bar appears.
- Continue button remains disabled.

---

### S4-N-02 — Upload file larger than 10MB

**Preconditions:** Step 2. Oversized file prepared (>10MB).

1. Attempt to upload the oversized file.

**Expected result:**
- Client-side size validation fires immediately.
- Size error state shown: "File must be smaller than 10MB."
- No upload attempt is made.
- Continue button remains disabled.

---

### S4-N-03 — Upload scanned/image-only PDF

**Preconditions:** Step 2. Image-only PDF prepared (no text layer).

1. Upload the image-only PDF.
2. Wait for upload and extraction to complete.

**Expected result:**
- Upload progress bar completes (upload to Storage succeeds).
- Extraction error state shown: "We couldn't read this file. Try a different file." (or similar per design).
- Continue button remains disabled.
- File is cleaned up from Storage (confirmed by checking Supabase Storage bucket is empty after a few seconds).

---

### S4-N-04 — Continue clicked with no file and no paste text

**Preconditions:** Step 2 with nothing uploaded or pasted.

1. Observe the Continue button state.

**Expected result:** Continue button is disabled and cannot be clicked. No form submission occurs.

---

### S4-N-05 — Re-upload advisory when returning to Step 2 without sessionStorage

**Preconditions:** Application has `current_step = 4` or higher. Use a different browser or clear sessionStorage manually (`sessionStorage.clear()` in DevTools console).

1. Navigate directly to `/applications/[id]/step/2`.

**Expected result:**
- Blue info banner is shown advising the user to re-upload the guidelines.
- Upload area is empty (sessionStorage entry is gone).
- User cannot proceed to Step 3 without re-uploading or pasting.

---

---

## Slice 5 — AI Summary Errors

### S5-N-01 — AI API failure — transient error

**Preconditions:** Step 3, guidelines ready. Simulate a transient failure by temporarily setting an invalid AWS key in `.env.local` (or use a test account that has already hit the usage limit if you can arrange this in dev).

_Alternatively: If you cannot simulate an AWS error, skip to S5-N-03 and test by exhausting the usage count._

1. Navigate to Step 3 (auto-triggers generation).
2. Wait for the error state to appear.

**Expected result:**
- Loading state stops.
- Transient error banner appears: "We couldn't complete that request." with a **Try again** button.
- Persistent failure state does NOT appear on the first attempt.

---

### S5-N-02 — AI API failure — persistent failure

**Preconditions:** As S5-N-01, but click **Try again** once.

1. With the API still broken, click **Try again**.

**Expected result:**
- Loading state runs again.
- Persistent failure banner replaces the transient error: "If this keeps happening, please try again later. Your work has been saved." — no **Try again** button.

---

### S5-N-03 — AI usage limit reached

**Preconditions:** AI usage for the test account is at 50/50 for the current month. (Insert 50 rows into `ai_usage_log` for this user via Supabase for the current month to set this up.)

1. Navigate to Step 3.

**Expected result:**
- Red limit-reached banner is shown.
- Generation does not trigger; no Bedrock call is made.
- "Regenerate summary" link is disabled or absent.

---

### S5-N-04 — No questions extracted from document

**Preconditions:** Step 3 with guidelines text that contains no questions (e.g. paste a block of plain text that describes a grant but has no question/answer prompts).

1. Use the paste path (S4-P-03) with plain descriptive text (no questions).
2. Navigate to Step 3.

**Expected result:**
- Summary is generated and displayed.
- "No questions found" note is shown (grey/neutral, not an error).
- User can still proceed to Step 4 (Continue button is active).

---

---

## Slice 6 — Draft Answers Errors

### S6-N-01 — AI refine-answer failure (transient)

**Preconditions:** Step 4; Q&A interface visible; at least one non-budget answer entered. API is broken (same approach as S5-N-01) or temporarily set an invalid AWS key.

1. Click the **"Help me improve this"** button on a non-budget question.
2. Wait for the error state.

**Expected result:**
- Per-question inline error appears: "We couldn't improve this right now. Please try again."
- A **Try again** button is visible.
- The original answer text is NOT lost or overwritten.
- Other questions/sections on the page are unaffected.

---

### S6-N-02 — Answer over word limit warning

**Preconditions:** Step 4. Application from `tnl-community-fund-application-form-2025.docx` which should extract word-limited questions.

1. Find a question with a word limit shown.
2. Clear the textarea and type a very long answer well in excess of the limit.

**Expected result:**
- Word count display turns red (or warning colour).
- Over-limit warning text appears below the textarea.
- The answer is NOT blocked — the user can still type and save.
- The proceed/assemble button is still active (over-limit is a warning, not a hard block).

---

### S6-N-03 — Usage limit reached on refine-answer

**Preconditions:** AI usage at 50/50 (manually insert 50 rows into `ai_usage_log` for the current month, as per S5-N-03 approach, but using the 50-request cap).

1. Navigate to Step 4 and attempt to click **"Help me improve this"** on any non-budget answer.

**Expected result:**
- Usage limit banner is shown (or the refine button is disabled with a limit-reached message).
- The `/api/refine-answer` route is not called.
- Any answers already saved in the database are still displayed and editable.
- The Q&A interface remains fully functional for typing new answers.

---

---

## Slice 7 — Export Errors

### S7-N-01 — Attempt to export before approval

**Preconditions:** Application status is `in_progress` (not yet approved); on Step 5.

1. Navigate to Step 5.
2. Observe the download buttons.

**Expected result:** Both download buttons are disabled. Cannot be clicked. No download occurs.

---

### S7-N-02 — Attempt to approve with fewer than three checkboxes

**Preconditions:** Step 5; application not yet approved.

1. Tick only two of the three review checkboxes.
2. Try to click **Approve my application**.

**Expected result:** Approve button is disabled and cannot be activated until the third checkbox is ticked.

---

### S7-N-03 — Direct GET to export route for another user's application

**Preconditions:** Two test accounts. `test2@example.com` has an approved application with a known ID.

1. Sign in as `test1@example.com`.
2. Navigate directly to `/api/export/[test2-application-id]?format=docx`.

**Expected result:** HTTP 403 or 401 response. No file is returned. `test1` cannot access `test2`'s export.

---

### S7-N-04 — Direct GET to export route for unapproved application

**Preconditions:** Signed in. Own application that is `in_progress` (not `approved` or `exported`).

1. Navigate directly to `/api/export/[in-progress-application-id]`.

**Expected result:** HTTP 403 or 400 response. No file downloaded. Error JSON body returned.

---

---

## Slice 8 — Account Management Errors

### S8-N-01 — Change password with wrong current password

**Preconditions:** Signed in as `test-password@example.com`.

1. Navigate to `/account`.
2. Enter an incorrect current password.
3. Enter a valid new password (≥10 chars).
4. Click **Update password**.

**Expected result:**
- Inline error appears on the Current password field: "Incorrect password." (or similar per design).
- Password is NOT changed.
- Success banner does NOT appear.

---

### S8-N-02 — Change password: new password too short

**Preconditions:** Signed in; on `/account`.

1. Enter correct current password.
2. Enter a new password of fewer than 10 characters.
3. Click **Update password** (or observe client-side validation).

**Expected result:** Inline validation error: "Password must be at least 10 characters." Update does not proceed.

---

### S8-N-03 — Change password: new and confirm passwords do not match

**Preconditions:** Signed in; on `/account`.

1. Enter correct current password.
2. Enter a valid new password.
3. Enter a different value in "Confirm new password".
4. Click **Update password** (or observe client-side validation).

**Expected result:** Inline validation error: "Passwords don't match." Update does not proceed.

---

### S8-N-04 — Delete account: wrong confirmation text

**Preconditions:** Signed in; on `/account/delete`.

1. Type `delete` (lowercase) in the confirmation field.
2. Observe or click the button.
3. Clear and type `DELETE ` (with trailing space).
4. Clear and type `DELET` (incomplete).

**Expected result:**
- In all three cases, the Permanently delete button is disabled or shows a validation error.
- Account is NOT deleted.

---

### S8-N-05 — Delete account: Cancel returns to settings

**Preconditions:** Signed in; on `/account/delete`.

1. Click **Cancel**.

**Expected result:** Browser navigates back to `/account`. Account is not deleted. All data is intact.

---

### S8-N-06 — Direct POST to delete API without authentication

**Preconditions:** Not signed in (or use `curl`/Postman with no session cookie).

1. Send a POST request to `/api/account/delete` with no auth cookie.

**Expected result:** HTTP 401 or redirect to sign-in. Account is not deleted.

---

### S8-N-07 — Attempt to sign in after account deletion

**Preconditions:** Account deletion test (S8-P-02) was completed.

1. On the sign-in page (where the deletion banner was shown), enter the deleted account's email and password.
2. Click **Sign in**.

**Expected result:** Sign-in fails with an invalid credentials error. The account no longer exists.

---

---

# 3. NON-FUNCTIONAL TESTS

---

## Performance

### NF-01 — AI summary generation response time

**Target:** ≤30 seconds from page load to summary displayed.

1. Note the time when Step 3 page loads (loading state begins).
2. Note the time when the summary card appears.
3. Calculate elapsed time.

**Expected result:** ≤30 seconds. Record actual time. Flag for investigation if >20 seconds on first test.

---

### NF-02 — AI refine-answer response time

**Target:** ≤15 seconds from clicking "Help me improve this" to refined answer appearing.

**Note:** Step 4 no longer auto-generates answers on page load (the old auto-generation model was replaced by the charity-authored Q&A model in the 2026-05-28 redesign). The only AI call in Step 4 is the optional per-question refine-answer request.

1. Navigate to Step 4 with at least one non-budget question/section that has a saved answer.
2. Note the time when you click **"Help me improve this"** on a non-budget answer.
3. Note the time when the refined answer replaces the original text.
4. Calculate elapsed time.

**Expected result:** ≤15 seconds from click to refined answer displayed. Record actual time. Test with both a short answer (~50 words) and a longer answer (~200 words) and note any difference.

---

### NF-03 — File upload performance (standard size)

**Preconditions:** On Step 2.

1. Upload `heritage-fund-application-guidance.pdf`.
2. Note time from file selection to "uploaded" state.

**Expected result:** Upload completes in ≤10 seconds on a standard broadband connection. Progress bar should show meaningful movement throughout (not jump from 0% to 100%).

---

### NF-04 — Export download time

**Preconditions:** Approved application.

1. Click **Download as Word document**.
2. Note time from click to browser download starting.

**Expected result:** Download starts in ≤5 seconds. File is well-formed (not a 0-byte download).

---

### NF-05 — Auto-save does not block typing

**Preconditions:** Step 4 with answers.

1. Type continuously in a textarea for 30 seconds.
2. Observe for any input lag, freeze, or visual disruption.

**Expected result:** No perceptible lag while typing. Auto-save (debounced at 400ms) fires silently in the background without interrupting the user.

---

### NF-06 — Session timeout at 60 minutes

**Preconditions:** Signed in. Set the system clock forward or use browser DevTools to simulate inactivity (not feasible manually — note this as requiring a manual workaround or acceptance that it was tested via code review).

_Practical approach:_ Verify via code review that `SessionTimeoutProvider` fires at 55 minutes (warning modal) and 60 minutes (sign-out). Confirm the modal appears correctly in the static shell (`?timeout=warning` state if available).

**Expected result:** Warning modal appears at 55 minutes with "I'm still here" / "Sign out now" options. At 60 minutes, user is signed out and redirected to `/`. Note: currently no inactivity message is shown on the sign-in page after timeout (GAP-22 — outstanding gap).

---

## Security

### NF-07 — RLS: user cannot access another user's application

**Preconditions:** Two accounts; `test2` has an application with known ID.

1. Sign in as `test1`.
2. Navigate to `/applications/[test2-app-id]/step/4`.

**Expected result:** User is redirected (likely to `/dashboard`) — not shown `test2`'s application. Verify no data from `test2` is exposed.

---

### NF-08 — RLS: user cannot access another user's charity profile

**Preconditions:** Two accounts.

1. Via Supabase client in browser DevTools console, attempt:
   ```js
   supabase.from('charity_profiles').select('*')
   ```
2. Note what is returned.

**Expected result:** Only own charity profile row is returned. `test2`'s profile is not visible.

---

### NF-09 — AI usage count cannot be manipulated client-side

**Preconditions:** Any signed-in test user.

1. In Supabase Studio, directly insert extra rows into `ai_usage_log` for another user.
2. Verify the row was rejected by RLS (INSERT on own rows only — UPDATE/DELETE denied).

**Expected result:** INSERT into `ai_usage_log` for a different `user_id` returns a permission error. Own rows can only be inserted by the server-side route (not directly by the authenticated client).

---

### NF-10 — Cron endpoint rejects unauthenticated requests

**Preconditions:** None.

1. Send a GET request to `/api/cron/inactivity-warning` with no `Authorization` header.
2. Send a GET request to `/api/cron/inactivity-deletion` with `Authorization: Bearer wrongsecret`.

**Expected result:** Both return HTTP 401. No warning emails sent. No deletions performed.

---

### NF-11 — Export route validates ownership before generating file

**Preconditions:** Two accounts. `test2` has an approved application.

1. Sign in as `test1`.
2. Send authenticated GET request (using cookies from `test1`'s session) to `/api/export/[test2-application-id]`.

**Expected result:** HTTP 403 returned. No file generated or streamed.

---

## Data Integrity

### NF-12 — Cascade deletion removes all associated data

**Preconditions:** `test-delete@example.com` account has charity profile, multiple applications, multiple answers, and AI usage log entries.

1. Perform account deletion (S8-P-02).
2. Check Supabase dashboard: Auth → Users, and each of the five tables.

**Expected result:** Zero rows remain for the deleted user across all tables. No orphan rows.

---

### NF-13 — Orphan guidelines cleanup cron runs correctly

**Preconditions:** Deploy to Vercel (or trigger manually with `curl -H "Authorization: Bearer [CRON_SECRET]" https://[your-vercel-url]/api/cron/cleanup-guidelines`).

1. Upload a guidelines file and then navigate away WITHOUT completing Step 3 (leaving an orphaned file in Storage).
2. Wait for the next cron run (every 30 minutes) or trigger manually.
3. Check Supabase Storage bucket `guidelines-temp`.

**Expected result:** Orphaned file(s) older than 30 minutes are deleted from Storage.

---

---

# 4. USABILITY AND FLOW TESTS

---

## Navigation and Step Locking

### UX-01 — Step indicator reflects current step throughout

**Preconditions:** Application in progress at various steps.

1. Navigate through Steps 1 → 2 → 3 → 4 → 5, checking the step indicator at each step.

**Expected result:**
- Current step has a teal filled circle.
- Completed steps show a tick/checkmark.
- Future steps are grey.
- Screen reader text announces "Current:" / "Completed:" correctly (use tab navigation or NVDA).

---

### UX-02 — Step locking prevents skipping ahead

**Preconditions:** Application with `current_step = 2` (Step 1 complete, Step 2 not yet).

1. Navigate directly to `/applications/[id]/step/4` (skipping Steps 2 and 3).

**Expected result:** Redirected to the correct current step (`/applications/[id]/step/2`). Cannot jump ahead in the workflow.

---

### UX-03 — Back navigation preserves state

**Preconditions:** Step 4 with answers populated and edited.

1. Click the **Back** link on Step 4 (goes to Step 3).
2. Click the **Continue** link on Step 3 to return to Step 4.

**Expected result:** Step 4 shows the same answers that were present before going back. No data is lost. `current_step` is NOT decremented by using Back.

---

### UX-04 — Dashboard "Continue" button resumes at correct step

**Preconditions:** Application with `current_step = 4`.

1. Navigate to `/dashboard`.
2. Find the application card.
3. Click **Continue**.

**Expected result:** Browser navigates to `/applications/[id]/step/4` (the stored current step). Not Step 1, not Step 3.

---

### UX-05 — Dashboard shows correct status pill

**Preconditions:** Applications at various statuses: `in_progress`, `approved`, `exported`.

1. Check the dashboard application cards.

**Expected result:**
- `in_progress` → "In progress" amber pill; **Continue** button.
- `approved` → "Approved" green pill; **View** button.
- `exported` → "Exported" teal pill; **View** button.
- **Continue** and **View** are mutually exclusive.

---

### UX-06 — applications/[id] redirect (GAP-26 check)

**Note:** This test is expected to **fail** until GAP-26 is fixed. Record the result.

**Preconditions:** Application with a known `[id]`.

1. Navigate directly to `/applications/[id]` (no `/step/N` suffix).

**Expected result (after fix):** Redirect to `/applications/[id]/step/[current_step]`.  
**Current expected result (before fix):** Stub page shown — "Application — redirects to current step (stub)". **FAIL — record and raise as blocker for Phase 5.**

---

### UX-07 — Browser back button after account deletion

**Preconditions:** Account just deleted; currently on sign-in page with deletion banner.

1. Press the browser back button.

**Expected result:** Pressing back does not crash or show a broken page. Ideally the sign-in page remains (or the browser shows a "document expired" warning). Deleted session data is not re-surfaced.

---

## Form Behaviour

### UX-08 — Password fields show/hide toggle works

**Preconditions:** On `/account` (change password form).

1. Click the show/hide eye icon on the "Current password" field.
2. Click again.
3. Repeat for "New password" and "Confirm new password".

**Expected result:** Password text toggles between hidden (`type="password"`) and visible (`type="text"`) correctly for each field independently.

---

### UX-09 — Loading states give clear feedback

**Preconditions:** Any action that triggers a loading state (AI generation, approve, export).

1. Trigger an action that takes more than 1 second.
2. Observe the UI during the wait.

**Expected result:**
- A meaningful loading message or spinner is shown.
- The triggering button is disabled or shows "Loading…" / "Updating…" / "Deleting…" during the wait.
- User cannot accidentally trigger the same action twice.

---

### UX-10 — Error banners are dismissible or clear on retry

**Preconditions:** Trigger an error state (e.g. wrong password in S8-N-01).

1. Observe the error.
2. Correct the input and re-submit.

**Expected result:** The error banner / inline error clears when the corrected submission succeeds. Success state replaces error state cleanly — no stale error messages remain visible.

---

### UX-11 — Delete confirmation field is case-sensitive

**Preconditions:** On `/account/delete`.

1. Type `delete` (lowercase) → observe.
2. Type `Delete` (mixed case) → observe.
3. Type `DELETE` (uppercase) → observe button state.

**Expected result:** Only exactly `DELETE` (uppercase) enables the delete button. All other variations keep the button disabled.

---

## Cross-Browser Smoke Test

Run the complete happy path (Steps 2 → 3 → 4 → 5 → Export) in each browser:

| Browser | Version | Step 2 upload | Step 3 AI | Step 4 write | Export .docx | Export .txt | Pass/Fail |
|---------|---------|--------------|-----------|-------------|-------------|------------|-----------|
| Chrome (desktop) | | | | | | | |
| Edge (desktop) | | | | | | | |
| Firefox (desktop) | | | | | | | |
| Safari (desktop) | | | | | | | |
| Chrome (Android) | | | | | | | |
| Safari (iOS) | | | | | | | |

---

## Mobile / Responsive Smoke Test

### UX-12 — Core flow is usable at mobile width

**Note:** The app is desktop-first. Mobile is not a primary target, but basic functionality should not be broken. GAP-05 (below-768px degradation banner) is outstanding.

1. Resize browser to 375px width (iPhone SE simulation in DevTools).
2. Complete the upload → summary → draft → export flow.

**Expected result:** All interactive elements are reachable and tappable. No critical content is hidden or overflowing. Note any degraded-but-usable issues separately from broken issues.

---

---

# 5. KNOWN EXPECTED FAILURES

These tests are expected to fail based on recorded gaps. Record the result and confirm the gap is accurately described — do not re-open new bugs for these unless the behaviour is different from the gap description.

| Test | Related Gap | Expected Failure |
|------|-------------|-----------------|
| UX-06 | GAP-26 | `applications/[id]` shows stub, not redirect |
| S7-P-03 | GAP-24 | Disclaimer wording differs from PDR-DH-003 spec |
| NF-06 | GAP-22 | No inactivity message shown after session timeout |
| S5-P-02 (Idlewild) | GAP-27 | Character limits (e.g. 800 chars, 1600 chars) in Idlewild question sets are not supported — Grant Pathway only handles word limits. The AI may miss these limits entirely or convert them incorrectly to word counts. Affected funders: Idlewild Trust (Arts and Conservation). Fix required before Idlewild can be used as a production test fixture. |
| S6-P-02 (Idlewild) | GAP-28 | Non-text questions in Idlewild form (Yes/No consent, dropdown region/org-type, date fields, number fields, budget tables, file upload fields) will be extracted by the AI as if they were narrative text questions and shown as empty textareas in Step 4. The AI has no way to distinguish question type from a PDF reference document. These questions should either be filtered out or clearly flagged as non-applicable. Fix required before Idlewild can be used as a production test fixture. |

---

---

## Document History

| Version | Date | Author | Summary of changes |
|---------|------|--------|--------------------|
| 1.0 | 2026-05-22 | Rapidglobe Ltd | Initial test plan — Slices 0–8 positive, negative, non-functional, and usability tests |
| 1.1 | 2026-05-26 | Rapidglobe Ltd | Added D-001 to D-004 to defect log (sign-out, password reset, same-password, recovery session bugs fixed during testing) |
| 1.2 | 2026-05-29 | Rapidglobe Ltd | Complete rewrite of S6 positive tests to reflect charity-authored Q&A model (preparation checklist gate, section-by-section/structured Q&A interface, auto-save on blur, budget section indicators, assemble and advance); rewrote S6-N-01 (refine-answer failure replaces draft generation failure); fixed S5-P-03, S5-P-05, S5-N-03 to use 50-request cap and 40-request approaching-limit threshold; updated S5-P-06 button text ("Continue" not "This looks right — continue"); updated cross-browser smoke test header; added document history table |
| 1.3 | 2026-05-29 | Rapidglobe Ltd | Updated "Manual Maintenance" section to reflect Vercel Pro upgrade — all cron jobs now running; manual guidelines-temp cleanup no longer required during testing |
| 1.4 | 2026-05-29 | Rapidglobe Ltd | Test Fixtures section updated: pointer to `docs/target-funder-list.md` (12 consolidated funders); missing fixture files listed per funder. S5-P-02 updated for Step 3 two-column card layout redesign and removal of supporting documents card; S5-P-02b added (free_form funder summary — "Application sections" card, "X sections to complete" confirmation). S6-P-03b added (advanceToStep4 bug fix — confirms `ready_to_assemble`/`assembled` states are preserved when returning via Step 3). NF-02 rewritten: old "AI draft generation response time" test removed (auto-generation model no longer exists); replaced with refine-answer API response time test (target ≤15s). Summary table updated: S5 positive 6 → 7, S6 positive 6 → 7, total 114 → 116. |
| 1.5 | 2026-05-29 | Rapidglobe Ltd | Defect log: D-005 (sticky progress bar hidden behind nav — fixed), D-006 (Back button only at bottom of Step 4 — fixed), D-007 (typo "sectionsto complete" in Step 3 free_form confirmation — fixed). Version bump. |
| 1.6 | 2026-05-29 | Rapidglobe Ltd | Defect log: D-008 (parse_error on refine-answer with short answers — fixed via prompt strengthening), D-009 (rate_limited on rapid refine-answer clicks — expected behaviour; stale comment fixed). Version bump. |
| 1.7 | 2026-05-29 | Rapidglobe Ltd | Three Idlewild Trust PDFs added to `docs/test-fixtures/` (Arts question set, Conservation question set, Funding Guidelines). GAP-27 and GAP-28 raised and added to Known Expected Failures. Idlewild fixture note updated to warn against use until gaps resolved. |

---

_Test plan v1.7 — created 2026-05-22, last updated 2026-05-29. Review and update after each test run._
