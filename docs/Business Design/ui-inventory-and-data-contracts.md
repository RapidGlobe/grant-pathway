# UI Inventory & Data Contracts — Grant Pathway v1

This document lists every page, modal, and shared panel/component in Grant Pathway v1. For each item it defines the data it reads (Data In) and the data it writes or actions it triggers (Data Out). It is a reference for design, front-end development, and API contract definition.

---

## How to Read This Document

**Data In** — the data a page or component needs in order to render correctly. This includes database records, session data, URL parameters, and derived values.

**Data Out** — the database writes, session changes, navigations, and side effects triggered by user actions on that page or component.

**Derived** — a value calculated at render time from stored data, not stored separately itself (e.g. whether a charity profile is complete).

**In-session only** — data held in memory or a temporary store for the duration of the user's session. Not written to the database.

---

## Summary

| #   | Type  | Name                              | Route                                       |
| --- | ----- | --------------------------------- | ------------------------------------------- |
| 1   | Page  | Sign In / Landing                 | `/`                                         |
| 2   | Page  | Register                          | `/register`                                 |
| 3   | Page  | Verify Email                      | `/verify-email`                             |
| 4   | Page  | Forgot Password                   | `/forgot-password`                          |
| 5   | Page  | Dashboard                         | `/dashboard`                                |
| 6   | Page  | Charity Profile                   | `/profile`                                  |
| 7   | Page  | Application Flow — Step 1         | `/applications/new` or `/applications/[id]` |
| 8   | Page  | Application Flow — Step 2         | `/applications/[id]`                        |
| 9   | Page  | Application Flow — Step 3         | `/applications/[id]`                        |
| 10  | Page  | Application Flow — Step 4         | `/applications/[id]`                        |
| 11  | Page  | Application Flow — Step 5         | `/applications/[id]`                        |
| 12  | Page  | Account Settings                  | `/account`                                  |
| 13  | Page  | Account Deletion Confirmation     | `/account/delete`                           |
| 14  | Modal | Delete Application                | Dashboard                                   |
| 15  | Modal | Re-open Application               | Dashboard / Step 5                          |
| 16  | Modal | Re-export Warning                 | Step 5                                      |
| 17  | Panel | Unauthenticated Navigation Bar    | All public routes                           |
| 18  | Panel | Authenticated Navigation Bar      | All authenticated routes                    |
| 19  | Panel | Account Dropdown Menu             | All authenticated routes                    |
| 20  | Panel | Global Footer                     | All routes                                  |
| 21  | Panel | Step Indicator                    | Application flow (Steps 1--5)               |
| 22  | Panel | Right-Hand Sidebar — Step 3       | Application flow Step 3                     |
| 23  | Panel | Right-Hand Sidebar — Step 4       | Application flow Step 4                     |
| 24  | Panel | Charity Profile Incomplete Banner | Dashboard                                   |
| 25  | Panel | AI Usage Warning Banner           | Application flow Steps 3--4                 |
| 26  | Panel | Inline Approve Confirmation       | Application flow Step 5                     |

---

---

# PAGES — PUBLIC

---

## Page 1 — Sign In / Landing

**Route:** `/`
**Auth state:** Unauthenticated only. Authenticated users are redirected to `/dashboard`.
**Description:** Entry point for returning users. Sign-in form with links to register and reset password. Also receives redirect messages from other flows.

### Data In

| Field              | Source                               | Notes                                                                                                                                                           |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `redirect_message` | URL query parameter or session flash | Optional. Displayed as an inline alert. Values: `account_deleted` → _"Your account has been deleted."_ / `password_reset` → _"Your password has been updated."_ |

### Data Out

| Action                                        | Writes / Triggers                                                                   |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| User submits sign-in form (success)           | Supabase Auth session created. Redirect to `/dashboard`.                            |
| User submits sign-in form (unverified email)  | No session created. Inline error shown. Resend verification email option displayed. |
| User submits sign-in form (wrong credentials) | No session created. Inline error shown.                                             |
| User clicks "Forgot password"                 | Navigate to `/forgot-password`.                                                     |
| User clicks "Register for free"               | Navigate to `/register`.                                                            |
| User clicks "Resend verification email"       | Supabase Auth re-sends Email 1 to submitted email address.                          |

### Shared Components Used

Unauthenticated Navigation Bar, Global Footer.

---

## Page 2 — Register

**Route:** `/register`
**Auth state:** Unauthenticated only. Authenticated users are redirected to `/dashboard`.
**Description:** New account creation. Collects name, email, password, and optional consents.

### Data In

| Field | Source | Notes                                    |
| ----- | ------ | ---------------------------------------- |
| None  | —      | Static page. No data required to render. |

### Data Out

| Action                                   | Writes / Triggers                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| User submits registration form (success) | Creates `auth.users` record via Supabase Auth: `{ email, encrypted_password, email_confirmed_at: null }`. |
|                                          | Creates `user_profiles` record: `{ user_id, first_name, last_name, feedback_consent }`.                   |
|                                          | Supabase Auth sends Email 1 (verification email).                                                         |
|                                          | Redirect to `/verify-email`.                                                                              |
| User submits form (validation failure)   | No records created. Inline errors displayed. Form data preserved.                                         |
| User clicks "Sign in"                    | Navigate to `/`.                                                                                          |

### Form Fields

| Field                   | Stored in                                | Required               | Validation                                 |
| ----------------------- | ---------------------------------------- | ---------------------- | ------------------------------------------ |
| `first_name`            | `user_profiles.first_name`               | Yes                    | Non-empty                                  |
| `last_name`             | `user_profiles.last_name`                | Yes                    | Non-empty                                  |
| `email`                 | `auth.users.email`                       | Yes                    | Valid email format; not already registered |
| `password`              | `auth.users.encrypted_password` (hashed) | Yes                    | Minimum 10 characters                      |
| `password_confirmation` | Not stored                               | Yes                    | Must match `password`                      |
| `terms_accepted`        | Not stored                               | Yes                    | Must be checked; validation only           |
| `feedback_consent`      | `user_profiles.feedback_consent`         | No (Should Have FR-08) | Defaults to `false`                        |

### Shared Components Used

Unauthenticated Navigation Bar, Global Footer.

---

## Page 3 — Verify Email

**Route:** `/verify-email`
**Auth state:** Unauthenticated only.
**Description:** Three-state page covering the email verification journey after registration.

### State 1 — Awaiting Verification

Displayed immediately after registration.

#### Data In

| Field   | Source                                 | Notes                                                               |
| ------- | -------------------------------------- | ------------------------------------------------------------------- |
| `email` | Registration session / query parameter | Displayed to reassure the user the email went to the right address. |

#### Data Out

| Action                                         | Writes / Triggers                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| User clicks "Resend verification email"        | Supabase Auth re-sends Email 1. Rate-limited to 3 resends per hour. |
| User clicks "Sign in with a different account" | Navigate to `/`.                                                    |

---

### State 2 — Email Verified

Displayed when user clicks a valid, unexpired verification link from Email 1.

#### Data In

| Field   | Source                          | Notes                       |
| ------- | ------------------------------- | --------------------------- |
| `token` | URL parameter (from email link) | Validated by Supabase Auth. |

#### Data Out

| Action                           | Writes / Triggers                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| Link clicked (valid)             | Supabase Auth sets `auth.users.email_confirmed_at` to current timestamp. Account becomes active. |
| User clicks "Go to my dashboard" | Navigate to `/dashboard`.                                                                        |

---

### State 3 — Link Expired or Invalid

Displayed when user clicks a verification link that has expired (after 24 hours) or is malformed.

#### Data In

| Field   | Source        | Notes                                 |
| ------- | ------------- | ------------------------------------- |
| `token` | URL parameter | Invalid or expired — no write occurs. |

#### Data Out

| Action                                      | Writes / Triggers               |
| ------------------------------------------- | ------------------------------- |
| User clicks "Send a new verification email" | Supabase Auth re-sends Email 1. |

### Shared Components Used

Unauthenticated Navigation Bar, Global Footer.

---

## Page 4 — Forgot Password

**Route:** `/forgot-password`
**Auth state:** Unauthenticated only.
**Description:** Two-state page for requesting and completing a password reset.

### State 1 — Reset Request Form

#### Data In

| Field | Source | Notes                                     |
| ----- | ------ | ----------------------------------------- |
| None  | —      | Static state. No data required to render. |

#### Data Out

| Action                     | Writes / Triggers                                                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User submits email address | Supabase Auth sends Email 2 if account exists for that email. Same confirmation message shown regardless of whether account exists (security best practice). No database write at this stage. |

#### Form Fields

| Field   | Stored in  | Required | Validation         |
| ------- | ---------- | -------- | ------------------ |
| `email` | Not stored | Yes      | Valid email format |

---

### State 2 — Reset Password Form

Displayed when user clicks a valid, unexpired reset link from Email 2 (1-hour expiry).

#### Data In

| Field   | Source                          | Notes                       |
| ------- | ------------------------------- | --------------------------- |
| `token` | URL parameter (from email link) | Validated by Supabase Auth. |

#### Data Out

| Action                              | Writes / Triggers                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| User submits new password (success) | Supabase Auth updates `auth.users.encrypted_password`. Redirect to `/` with `redirect_message: password_reset`. |
| Link expired or invalid             | Error message displayed. Link to request a new reset.                                                           |

#### Form Fields

| Field                  | Stored in                                | Required | Validation                |
| ---------------------- | ---------------------------------------- | -------- | ------------------------- |
| `new_password`         | `auth.users.encrypted_password` (hashed) | Yes      | Minimum 10 characters     |
| `confirm_new_password` | Not stored                               | Yes      | Must match `new_password` |

### Shared Components Used

Unauthenticated Navigation Bar, Global Footer.

---

---

# PAGES — AUTHENTICATED

---

## Page 5 — Dashboard

**Route:** `/dashboard`
**Auth state:** Authenticated only. Unauthenticated users redirected to `/`.
**Description:** Post-login home screen. Shows all saved applications. Two states: empty (no applications) and populated (one or more applications).

### Data In

| Field                      | Source                                                                   | Notes                                                                                                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `user_profiles.first_name` | `user_profiles` table                                                    | Used in welcome heading (empty state): _"Welcome to Grant Pathway, [first name]"_.                                                                                                                                                                                                   |
| `charity_profile_complete` | Derived from `charity_profiles` record                                   | `true` if all required fields (`charity_name`, `what_charity_does`, `who_charity_helps`, `where_charity_works`) are populated. `false` if record does not exist or any required field is empty. Controls: profile incomplete banner visibility; Start button enabled/disabled state. |
| `applications[]`           | `applications` table, filtered by `user_id`, sorted by `updated_at DESC` | Array of application records. Each record: `{ id, funder_name, grant_name, status, current_step, updated_at }`.                                                                                                                                                                      |
| `application_counts`       | Derived from `applications[]`                                            | Count per status: `not_started`, `in_progress`, `approved`, `exported`. Used in summary strip (populated state).                                                                                                                                                                     |

### Data Out

| Action                                                            | Writes / Triggers                                                                                                                        |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| User clicks "Start your first application" or "+ New Application" | Navigate to `/applications/new`. (Disabled with tooltip if `charity_profile_complete` is `false`.)                                       |
| User clicks "Continue" or "View" on an application card           | Navigate to `/applications/[id]` at `current_step`.                                                                                      |
| User clicks "Delete" on an application card                       | Open Delete Application Modal (Modal 14) with `{ application.id, application.funder_name, application.grant_name, application.status }`. |
| User clicks "Set up charity profile" (banner)                     | Navigate to `/profile`.                                                                                                                  |

### Shared Components Used

Authenticated Navigation Bar, Global Footer, Charity Profile Incomplete Banner, Application Cards (one per application), Delete Application Modal (on trigger).

---

## Page 6 — Charity Profile

**Route:** `/profile`
**Auth state:** Authenticated only.
**Description:** Create and edit the charity's profile. Used as AI context for all draft generation. Two states: first-time setup and editing existing profile.

### Data In

| Field                            | Source                                          | Notes                                                                                                                    |
| -------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `charity_profiles` record        | `charity_profiles` table, filtered by `user_id` | `null` if no profile yet (first-time setup state). All fields pre-populated into the form if record exists (edit state). |
| `charity_profiles.lookup_source` | `charity_profiles` table                        | If `charity_commission`: display note _"Details retrieved from the Charity Commission register."_                        |

### Data Out

| Action                                  | Writes / Triggers                                                                                                                                                                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User searches Charity Commission lookup | External API call (Charity Commission API). On match: pre-fills `charity_name`, `registration_number` in form. Sets `lookup_source` → `charity_commission` (stored on save, not on lookup). On no match or API failure: inline message shown; manual entry continues. |
| User clicks "Save profile" (first-time) | Creates `charity_profiles` record: `{ user_id, charity_name, registration_number, what_charity_does, who_charity_helps, where_charity_works, lookup_source }`. Displays milestone success state.                                                                      |
| User clicks "Save changes" (edit)       | Updates `charity_profiles` record. Updates `charity_profiles.updated_at`. Displays inline success alert.                                                                                                                                                              |
| Validation failure (either state)       | No write. Inline errors displayed. Form data preserved.                                                                                                                                                                                                               |

### Form Fields

| Field                 | Label                         | Stored in                              | Required | Notes                                   |
| --------------------- | ----------------------------- | -------------------------------------- | -------- | --------------------------------------- |
| `charity_name`        | "Charity name"                | `charity_profiles.charity_name`        | Yes      | Pre-filled from API lookup if available |
| `registration_number` | "Charity registration number" | `charity_profiles.registration_number` | No       | Pre-filled from API lookup if available |
| `what_charity_does`   | "What does your charity do?"  | `charity_profiles.what_charity_does`   | Yes      | Textarea                                |
| `who_charity_helps`   | "Who does your charity help?" | `charity_profiles.who_charity_helps`   | Yes      | Textarea                                |
| `where_charity_works` | "Where do you work?"          | `charity_profiles.where_charity_works` | Yes      |                                         |

### Shared Components Used

Authenticated Navigation Bar, Global Footer.

---

---

# PAGES — APPLICATION FLOW

All application flow steps share the Step Indicator panel and are contained within the `/applications/[id]` route (or `/applications/new` for the initial Step 1 creation). Steps are UI states within a single page, not separate routes.

Auto-save behaviour applies across all steps: progress is saved on Continue and silently every 60 seconds in the background.

---

## Page 7 — Application Flow: Step 1 — Application Details

**Route:** `/applications/new` (new) or `/applications/[id]` (returning)
**Auth state:** Authenticated only.
**Description:** Enter the funder name and grant name to create or update the application record.

### Data In

| Field                     | Source               | Notes                                                                                |
| ------------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| `application.id`          | URL parameter        | Only present if returning to an existing application. Absent on `/applications/new`. |
| `application.funder_name` | `applications` table | Pre-filled in form if returning. Empty string if new.                                |
| `application.grant_name`  | `applications` table | Pre-filled in form if returning. Empty string if new.                                |

### Data Out

| Action                                            | Writes / Triggers                                                                                                                                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User clicks "Continue" on a new application       | Creates `applications` record: `{ user_id, funder_name, grant_name, status: 'not_started', current_step: 1 }`. Redirects to `/applications/[id]` and advances to Step 2. Updates `current_step` → 2. |
| User clicks "Continue" on an existing application | Updates `applications`: `{ funder_name, grant_name, current_step: 2, updated_at }`. Advances to Step 2.                                                                                              |
| User clicks "Cancel"                              | Navigate to `/dashboard`. No record created (if new). No changes saved (if returning).                                                                                                               |
| Auto-save                                         | Updates `applications.funder_name`, `applications.grant_name`, `applications.updated_at` every 60 seconds.                                                                                           |

### Form Fields

| Field         | Stored in                  | Required | Validation |
| ------------- | -------------------------- | -------- | ---------- |
| `funder_name` | `applications.funder_name` | Yes      | Non-empty  |
| `grant_name`  | `applications.grant_name`  | Yes      | Non-empty  |

### Shared Components Used

Authenticated Navigation Bar, Global Footer, Step Indicator.

---

## Page 8 — Application Flow: Step 2 — Funder Guidelines

**Route:** `/applications/[id]`
**Auth state:** Authenticated only.
**Description:** Upload or paste the funder's guidelines. Guidelines are not stored — they are passed to AI processing in-session only (FR-22).

### Data In

| Field                     | Source               | Notes                 |
| ------------------------- | -------------------- | --------------------- |
| `application.id`          | URL parameter        |                       |
| `application.funder_name` | `applications` table | Displayed as context. |
| `application.grant_name`  | `applications` table | Displayed as context. |

### Data Out

| Action                 | Writes / Triggers                                                                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User clicks "Continue" | Updates `applications.status` → `in_progress` (if `not_started`). Updates `applications.current_step` → 3. Passes `guidelines` (file content or pasted text) to Step 3 in-session — **not written to database**. |
| User clicks "Back"     | Returns to Step 1. No write.                                                                                                                                                                                     |
| Auto-save              | Updates `applications.current_step`, `applications.updated_at`. Guidelines themselves are never saved.                                                                                                           |

### Form Fields / Inputs

| Field             | Stored in                    | Notes                                                                                                      |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `file_upload`     | Not stored (in-session only) | Accepts PDF and .docx only. Max 10MB. Validated for format, size, and readability (scanned PDF detection). |
| `guidelines_text` | Not stored (in-session only) | Large textarea. Alternative to file upload.                                                                |

### Error States

| Scenario                        | Message                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| Wrong file format               | _"We can only accept PDF or Word (.docx) files."_                         |
| File too large (>10MB)          | _"Your file is over 10MB."_                                               |
| Scanned / unreadable PDF        | _"We couldn't read the text in your PDF — it may be a scanned document."_ |
| Document exceeds 100,000 tokens | Soft warning banner (non-blocking).                                       |

### Shared Components Used

Authenticated Navigation Bar, Global Footer, Step Indicator.

---

## Page 9 — Application Flow: Step 3 — AI Summary

**Route:** `/applications/[id]`
**Auth state:** Authenticated only.
**Description:** AI generates a plain-English summary of the funder guidelines. Displays summary and extracted questions. Two-column layout: main content left, questions-found panel right.

### Data In

| Field                     | Source                        | Notes                                                                                                                            |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `application.id`          | URL parameter                 |                                                                                                                                  |
| `application.funder_name` | `applications` table          | Context display.                                                                                                                 |
| `application.grant_name`  | `applications` table          | Context display.                                                                                                                 |
| `application.ai_summary`  | `applications` table          | Pre-loaded if returning to this step (avoids regeneration). `null` if generating for first time.                                 |
| `guidelines`              | In-session only (from Step 2) | Passed to Anthropic API for summarisation. Not stored.                                                                           |
| `charity_profile`         | `charity_profiles` table      | `{ charity_name, what_charity_does, who_charity_helps, where_charity_works }`. Passed to Anthropic API as context.               |
| `monthly_request_count`   | Derived from `ai_usage_log`   | Count of rows where `user_id` matches and `created_at` is within the current calendar month. Checked before allowing generation. |

### Data Out

| Action                                             | Writes / Triggers                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI generation triggered (first time or regenerate) | POST to Anthropic API. On success: updates `applications.ai_summary` with generated text. Creates `ai_usage_log` record: `{ user_id, application_id, request_type: 'guideline_summary', token_count, created_at }`. Creates `application_answers` records (one per extracted question): `{ application_id, question_text, question_order, answer_text: null, is_approved: false }`. |
| User clicks "Continue"                             | Updates `applications.current_step` → 4. Advances to Step 4.                                                                                                                                                                                                                                                                                                                        |
| User clicks "Back"                                 | Returns to Step 2. No write.                                                                                                                                                                                                                                                                                                                                                        |
| User clicks "Regenerate summary"                   | Repeats AI generation. Counts as one additional AI request against monthly allowance. Overwrites existing `applications.ai_summary`. Overwrites existing `application_answers` records.                                                                                                                                                                                             |
| AI API failure                                     | Inline error displayed. Retry available. No `ai_usage_log` record created on failure.                                                                                                                                                                                                                                                                                               |

### Loading State

Animated teal progress bar + staged text messages (DDR-CS-005). Displayed during API call.

### Right-Hand Sidebar Panel Data (Step 3)

See Panel 22.

### Shared Components Used

Authenticated Navigation Bar, Global Footer, Step Indicator, Right-Hand Sidebar Panel (Step 3), AI Usage Warning Banner.

---

## Page 10 — Application Flow: Step 4 — Draft Answers

**Route:** `/applications/[id]`
**Auth state:** Authenticated only.
**Description:** AI generates draft answers for each extracted question. User can read, edit, and save answers. Two-column layout: answers left, review prompts right.

### Data In

| Field                     | Source                                                                                     | Notes                                                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `application.id`          | URL parameter                                                                              |                                                                                                                                                                                            |
| `application.funder_name` | `applications` table                                                                       | Context display.                                                                                                                                                                           |
| `application.grant_name`  | `applications` table                                                                       | Context display.                                                                                                                                                                           |
| `application.ai_summary`  | `applications` table                                                                       | Passed to Anthropic API as context for draft generation.                                                                                                                                   |
| `application_answers[]`   | `application_answers` table, filtered by `application_id`, ordered by `question_order ASC` | Each record: `{ id, question_text, question_order, answer_text, answer_source, is_approved }`. Pre-loaded if returning. Empty or null `answer_text` triggers AI generation on first visit. |
| `charity_profile`         | `charity_profiles` table                                                                   | `{ charity_name, what_charity_does, who_charity_helps, where_charity_works }`. Passed to Anthropic API as context.                                                                         |
| `monthly_request_count`   | Derived from `ai_usage_log`                                                                | Count of rows for current calendar month. Checked before allowing generation.                                                                                                              |

### Data Out

| Action                                          | Writes / Triggers                                                                                                                                                                                                                                                                               |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI draft generation triggered                   | POST to Anthropic API. On success: updates each `application_answers.answer_text` with generated text. Sets each `application_answers.answer_source` → `ai_generated`. Creates `ai_usage_log` record: `{ user_id, application_id, request_type: 'draft_generation', token_count, created_at }`. |
| User edits an answer                            | Updates `application_answers.answer_text`. Sets `application_answers.answer_source` → `user_edited`. Updates `application_answers.updated_at`.                                                                                                                                                  |
| User replaces answer entirely (user-written)    | Updates `application_answers.answer_text`. Sets `application_answers.answer_source` → `user_written`.                                                                                                                                                                                           |
| User adds question manually (if none extracted) | Creates new `application_answers` record: `{ application_id, question_text, question_order, answer_text: null, is_approved: false }`.                                                                                                                                                           |
| User clicks "Regenerate all answers"            | Repeats AI draft generation. Counts as one additional AI request. Overwrites all `application_answers.answer_text` for this application. Resets `answer_source` → `ai_generated`.                                                                                                               |
| User clicks "Continue"                          | Updates `applications.current_step` → 5. Advances to Step 5.                                                                                                                                                                                                                                    |
| User clicks "Back"                              | Returns to Step 3. No write.                                                                                                                                                                                                                                                                    |
| Auto-save                                       | Updates `application_answers.answer_text`, `application_answers.updated_at` every 60 seconds.                                                                                                                                                                                                   |
| AI API failure                                  | Inline error displayed. Retry available. No `ai_usage_log` record created on failure.                                                                                                                                                                                                           |

### Loading State

Animated teal progress bar + staged text messages (DDR-CS-005). Displayed during API call.

### Right-Hand Sidebar Panel Data (Step 4)

See Panel 23.

### Shared Components Used

Authenticated Navigation Bar, Global Footer, Step Indicator, Right-Hand Sidebar Panel (Step 4), AI Usage Warning Banner.

---

## Page 11 — Application Flow: Step 5 — Approve & Export

**Route:** `/applications/[id]`
**Auth state:** Authenticated only.
**Description:** Read-only review of all questions and answers. User approves the application and downloads a Word document. Single-column layout.

### Data In

| Field                          | Source                                                                                     | Notes                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `application.id`               | URL parameter                                                                              |                                                                                                    |
| `application.funder_name`      | `applications` table                                                                       | Used in page title and .docx filename.                                                             |
| `application.grant_name`       | `applications` table                                                                       | Used in page title and .docx filename.                                                             |
| `application.status`           | `applications` table                                                                       | Controls approve button state. Export button disabled unless `status` is `approved` or `exported`. |
| `application.last_exported_at` | `applications` table                                                                       | `null` if never exported. If not null, Re-export Warning Modal shown on export attempt.            |
| `application_answers[]`        | `application_answers` table, filtered by `application_id`, ordered by `question_order ASC` | Each record: `{ question_text, answer_text }`. Displayed read-only.                                |

### Data Out

| Action                                                 | Writes / Triggers                                                                                                                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User clicks "Approve my application"                   | Expands Inline Approve Confirmation (Panel 26). No write until confirmed.                                                                                                                      |
| User confirms approval                                 | Updates `applications.status` → `approved`.                                                                                                                                                    |
| User clicks "Download as Word document" (first export) | Generates .docx file client-side (PDR-DH-003 structure). Triggers browser file download. Updates `applications.status` → `exported`. Sets `applications.last_exported_at` → current timestamp. |
| User clicks "Download as Word document" (re-export)    | Opens Re-export Warning Modal (Modal 16). No write until user confirms. On confirm: generates .docx, triggers download, updates `applications.last_exported_at` → current timestamp.           |
| User clicks "Back"                                     | Returns to Step 4. No write.                                                                                                                                                                   |

### Export Document Structure (PDR-DH-003)

The generated .docx file contains:

1. Title: `[Grant Name] — [Funder Name]`
2. Date of export
3. AI disclaimer
4. Body: question headings with answer text beneath (one section per question)
5. Footer: version number and export date

### Shared Components Used

Authenticated Navigation Bar, Global Footer, Step Indicator, Inline Approve Confirmation, Re-export Warning Modal.

---

## Page 12 — Account Settings

**Route:** `/account`
**Auth state:** Authenticated only.
**Description:** Change password and access account deletion.

### Data In

| Field              | Source                | Notes                                       |
| ------------------ | --------------------- | ------------------------------------------- |
| `auth.users.email` | Supabase Auth session | Displayed as read-only. Not editable in v1. |

### Data Out

| Action                                                 | Writes / Triggers                                                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| User submits change password form (success)            | Supabase Auth updates `auth.users.encrypted_password`. Displays inline success alert below submit button. Form fields cleared. |
| User submits change password form (validation failure) | No write. Inline errors displayed.                                                                                             |
| User clicks "Delete my account"                        | Navigate to `/account/delete`.                                                                                                 |

### Form Fields

| Field                  | Stored in                                | Required | Validation                                          |
| ---------------------- | ---------------------------------------- | -------- | --------------------------------------------------- |
| `current_password`     | Not stored                               | Yes      | Must match existing `auth.users.encrypted_password` |
| `new_password`         | `auth.users.encrypted_password` (hashed) | Yes      | Minimum 10 characters                               |
| `confirm_new_password` | Not stored                               | Yes      | Must match `new_password`                           |

### Shared Components Used

Authenticated Navigation Bar, Global Footer.

---

## Page 13 — Account Deletion Confirmation

**Route:** `/account/delete`
**Auth state:** Authenticated only. Accessed only via the "Delete my account" button on `/account`.
**Description:** Final confirmation screen before permanent account deletion. High-friction by design.

### Data In

| Field              | Source                | Notes                                                                    |
| ------------------ | --------------------- | ------------------------------------------------------------------------ |
| `auth.users.email` | Supabase Auth session | Displayed in the data summary to confirm whose account is being deleted. |
| `auth.users.id`    | Supabase Auth session | Used to cascade deletion across all related tables.                      |

### Data Out

| Action                                                         | Writes / Triggers                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User types "DELETE" and clicks "Permanently delete my account" | Deletes all records: `user_profiles`, `charity_profiles`, `applications`, `application_answers`, `ai_usage_log`, `auth.users`. Ends session. Redirects to `/` with `redirect_message: account_deleted`. Triggers Email 5 if FR-44 is implemented. |
| User clicks "Cancel"                                           | Navigate to `/account`. No writes.                                                                                                                                                                                                                |

### Form Fields

| Field               | Stored in  | Required | Validation                                                                                               |
| ------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `confirmation_text` | Not stored | Yes      | Must equal the string `DELETE` exactly (uppercase, case-sensitive). Button disabled until condition met. |

### Shared Components Used

Authenticated Navigation Bar, Global Footer.

---

---

# MODALS

---

## Modal 14 — Delete Application

**Trigger:** User clicks "Delete" text link on an application card on the dashboard.
**Description:** Confirmation modal before permanent deletion of an application. Copy varies by application status (per application-status-model.md).

### Data In

| Field                     | Source                | Notes                                                |
| ------------------------- | --------------------- | ---------------------------------------------------- |
| `application.id`          | Passed from dashboard | Used to identify which records to delete.            |
| `application.funder_name` | Passed from dashboard | Displayed in confirmation copy.                      |
| `application.grant_name`  | Passed from dashboard | Displayed in confirmation copy.                      |
| `application.status`      | Passed from dashboard | Determines confirmation message variant (see below). |

### Confirmation Copy Variants

| Status                         | Message                                                                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not_started` or `in_progress` | _"Are you sure you want to delete [Grant Name] -- [Funder Name]? This cannot be undone."_                                                                 |
| `approved`                     | _"Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."_                          |
| `exported`                     | _"Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document."_ |

### Data Out

| Action                                     | Writes / Triggers                                                                                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User clicks "Delete application" (confirm) | Deletes `application_answers` records where `application_id` matches. Deletes `applications` record. Dashboard re-renders without the deleted card. Modal closes. |
| User clicks "Cancel"                       | Modal closes. No write.                                                                                                                                           |

---

## Modal 15 — Re-open Application

**Trigger:** User clicks "Continue" or "View" on an `approved` or `exported` application card on the dashboard, or attempts to navigate back within the application flow from Step 5.
**Description:** Warns the user that re-opening will remove their approval and require them to re-approve before exporting.

### Data In

| Field                | Source                          | Notes                            |
| -------------------- | ------------------------------- | -------------------------------- |
| `application.id`     | Passed from dashboard or Step 5 |                                  |
| `application.status` | Passed from dashboard or Step 5 | Either `approved` or `exported`. |

### Data Out

| Action                          | Writes / Triggers                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User clicks "Re-open" (confirm) | Updates `applications.status` → `in_progress`. Sets all `application_answers.is_approved` → `false` for this application. Navigates to `/applications/[id]` at `current_step`. |
| User clicks "Cancel"            | Modal closes. No write. User remains on dashboard.                                                                                                                             |

---

## Modal 16 — Re-export Warning

**Trigger:** User clicks "Download as Word document" on Step 5 when `application.last_exported_at` is not null.
**Description:** Warns the user that a previous export exists and that submitting multiple versions to the same funder may cause confusion.

### Data In

| Field                          | Source               | Notes                                         |
| ------------------------------ | -------------------- | --------------------------------------------- |
| `application.last_exported_at` | `applications` table | Displayed as formatted date: DD Month YYYY.   |
| `application.id`               | From Step 5 context  | Used to update `last_exported_at` on confirm. |

### Data Out

| Action                        | Writes / Triggers                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| User clicks "Download anyway" | Generates .docx file. Triggers browser file download. Updates `applications.last_exported_at` → current timestamp. Modal closes. |
| User clicks "Cancel"          | Modal closes. No write.                                                                                                          |

---

---

# SHARED PANELS & COMPONENTS

---

## Panel 17 — Unauthenticated Navigation Bar

**Displayed on:** All public routes (`/`, `/register`, `/verify-email`, `/forgot-password`).

### Data In

| Field      | Source      | Notes                                                    |
| ---------- | ----------- | -------------------------------------------------------- |
| Logo asset | Static file | Grant Pathway logo PNG (transparent background version). |

### Data Out

| Action                 | Triggers                           |
| ---------------------- | ---------------------------------- |
| User clicks "Sign in"  | Navigate to `/`.                   |
| User clicks "Register" | Navigate to `/register`.           |
| Logo click             | No action (stays on current page). |

---

## Panel 18 — Authenticated Navigation Bar

**Displayed on:** All authenticated routes.

### Data In

| Field                      | Source                | Notes                                                    |
| -------------------------- | --------------------- | -------------------------------------------------------- |
| `user_profiles.first_name` | `user_profiles` table | Displayed in the Account dropdown trigger (top right).   |
| Logo asset                 | Static file           | Grant Pathway logo PNG (transparent background version). |

### Data Out

| Action                  | Triggers                                             |
| ----------------------- | ---------------------------------------------------- |
| Logo click              | Navigate to `/dashboard`.                            |
| "My Applications" click | Navigate to `/dashboard`.                            |
| "Charity Profile" click | Navigate to `/profile`.                              |
| Account name click      | Toggle Account Dropdown Menu (Panel 19) open/closed. |

---

## Panel 19 — Account Dropdown Menu

**Displayed on:** All authenticated routes (triggered from Authenticated Navigation Bar).

### Data In

| Field  | Source           | Notes                                         |
| ------ | ---------------- | --------------------------------------------- |
| `open` | UI state (local) | Boolean. Controlled by parent navigation bar. |

### Data Out

| Action                   | Triggers                                     |
| ------------------------ | -------------------------------------------- |
| "Account Settings" click | Navigate to `/account`. Dropdown closes.     |
| "Sign Out" click         | Ends Supabase Auth session. Redirect to `/`. |
| Click outside dropdown   | Dropdown closes. No write.                   |

---

## Panel 20 — Global Footer

**Displayed on:** All routes (public and authenticated).

### Data In

| Field          | Source                                  | Notes                                                     |
| -------------- | --------------------------------------- | --------------------------------------------------------- |
| `current_year` | Derived from system date at render time | Displayed in copyright line: _"© RapidGlobe Ltd [year]"_. |

### Data Out

| Action                   | Triggers                                                 |
| ------------------------ | -------------------------------------------------------- |
| "Privacy Policy" click   | Navigate to Privacy Policy URL (opens in current tab).   |
| "Terms of Service" click | Navigate to Terms of Service URL (opens in current tab). |

---

## Panel 21 — Step Indicator

**Displayed on:** All five steps of the application flow.

### Data In

| Field                | Source                                   | Notes                                                                                                             |
| -------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `current_step`       | `applications.current_step`              | Integer 1--5. Determines which circle is in the "current" state.                                                  |
| `max_completed_step` | Derived from `applications.current_step` | Steps below `current_step` are rendered as "completed" (teal fill, tick icon). Steps above are "upcoming" (grey). |

### States per Circle

| State     | Condition                    | Visual                               |
| --------- | ---------------------------- | ------------------------------------ |
| Completed | Step number < `current_step` | Teal fill, white tick icon           |
| Current   | Step number = `current_step` | Teal fill, white step number         |
| Upcoming  | Step number > `current_step` | White fill, grey border, grey number |

### Data Out

None. Read-only. No pointer events. No click handlers.

---

## Panel 22 — Right-Hand Sidebar: Step 3

**Displayed on:** Application Flow Step 3. Sticky position.

### Data In

| Field                 | Source                                                                                 | Notes                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `questions_found`     | Derived from `application_answers` count for this `application_id` after AI generation | Integer. Displayed as: _"We found [n] application questions in these guidelines."_                                       |
| `questions_not_found` | Derived: `questions_found === 0`                                                       | Boolean. If `true`, alternative message shown: _"We couldn't identify specific application questions in this document."_ |

### Data Out

None. Display only.

---

## Panel 23 — Right-Hand Sidebar: Step 4

**Displayed on:** Application Flow Step 4. Sticky position.

### Data In

None. Fully static content.

### Content

The three mandatory review prompts (FR-32):

1. _"Does this accurately describe your charity and project?"_
2. _"Are all figures, dates, and facts correct?"_
3. _"Does this answer the question that was asked?"_

### Data Out

None. Display only.

---

## Panel 24 — Charity Profile Incomplete Banner

**Displayed on:** Dashboard (both empty and populated states), whenever `charity_profile_complete` is `false`.

### Data In

| Field                      | Source                                 | Notes                                                                                    |
| -------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `charity_profile_complete` | Derived from `charity_profiles` record | Banner shown if `false` (no record or required fields missing). Banner hidden if `true`. |

### Data Out

| Action                               | Triggers                |
| ------------------------------------ | ----------------------- |
| User clicks "Set up charity profile" | Navigate to `/profile`. |

---

## Panel 25 — AI Usage Warning Banner

**Displayed on:** Application Flow Steps 3 and 4. Shown when `monthly_request_count` >= 16.

### Data In

| Field                   | Source                      | Notes                                                                                        |
| ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| `monthly_request_count` | Derived from `ai_usage_log` | Count of rows where `user_id` matches and `created_at` is within the current calendar month. |
| `month_reset_date`      | Derived from current date   | First day of next calendar month. Displayed in hard block message.                           |

### States

| Condition                              | State        | Message                                                                                                    |
| -------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `monthly_request_count` >= 16 and < 20 | Soft warning | _"You've used most of your monthly AI allowance."_ Generate/Regenerate buttons remain enabled.             |
| `monthly_request_count` >= 20          | Hard block   | _"You've reached your monthly AI limit. This resets on [date]."_ Generate/Regenerate buttons **disabled**. |

### Data Out

None. Display only. Button disabling is a side effect handled by the parent page.

---

## Panel 26 — Inline Approve Confirmation

**Displayed on:** Application Flow Step 5. Triggered by "Approve my application" button click.

### Data In

| Field            | Source              | Notes                                                  |
| ---------------- | ------------------- | ------------------------------------------------------ |
| `application.id` | From Step 5 context | Used to identify the record to update on confirmation. |

### Data Out

| Action                     | Writes / Triggers                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| User clicks "Yes, approve" | Updates `applications.status` → `approved`. Collapses inline confirmation. Export button becomes enabled. |
| User clicks "Cancel"       | Collapses inline confirmation. No write.                                                                  |

---

_Last updated: 2026-04-17_
_Status: Complete_
_Sources: screen-requirements.md, information-architecture-and-navigation.md, application-status-model.md, data-model.md, PRD-Grant-Pathway-v1.md, design decision records DDR-LA-001, DDR-LA-002, DDR-CS-005, DDR-IP-001_
