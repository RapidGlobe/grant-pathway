# Screen Requirements — Grant Pathway v1

**Tier:** 1 — Always check after every task
**Volatility:** High
**Update when:** Any change to the content, fields, validation rules, or error states of any screen

This document defines the required content, fields, validation rules, and error states for each of the 11 screens in Grant Pathway v1. It is an input to the Product Requirements Document and to acceptance criteria.

Screens are listed in the order a new user would encounter them.

---

## Screens Index

| #   | Screen                        | URL                                          | Status      |
| --- | ----------------------------- | -------------------------------------------- | ----------- |
| 1   | Sign In / Landing             | `/`                                          | ✅ Complete |
| 2   | Register                      | `/register`                                  | ✅ Complete |
| 3   | Verify Email                  | `/verify-email`                              | ✅ Complete |
| 4   | Forgot Password               | `/forgot-password`                           | ✅ Complete |
| 5   | Dashboard                     | `/dashboard`                                 | ✅ Complete |
| 6   | Charity Profile Setup         | `/profile`                                   | ✅ Complete |
| 7   | Application Flow              | `/applications/new` and `/applications/[id]` | ✅ Complete |
| 8   | Account Settings              | `/account`                                   | ✅ Complete |
| 9   | Account Deletion Confirmation | `/account/delete`                            | ✅ Complete |
| 10  | Terms of Service              | `/terms`                                     | ✅ Complete |
| 11  | Privacy Policy                | `/privacy`                                   | ✅ Complete |

---

## Global Elements

The following elements appear on all screens unless otherwise noted.

### Navigation bar (unauthenticated)

- Grant Pathway logo (top left) — links to `/` (2026-06-10: previously no link; changed so pages reached directly, e.g. `/terms` from a search result, are never a dead end. Signed-in users are redirected on to `/dashboard` by the auth middleware)
- **Register — it's free** button — `/register`; hidden on `/register` (circular), `/verify-email` (the user has just registered; added 2026-06-10), `/privacy`, and `/terms` (out of context on legal pages; added 2026-06-12). 2026-06-09: standalone Sign in link removed as redundant — every public form carries a contextual sign-in link

### Navigation bar (authenticated)

- Grant Pathway logo (top left) — links to `/dashboard`
- **My Applications** — links to `/dashboard`
- **Charity Profile** — links to `/profile`
- **Account** (top right, displays user's first name or email) — dropdown menu:
  - Account Settings — `/account`
  - Sign Out

### Footer (all screens)

- Tagline: _"Your free grant writing companion for UK charities"_
- Links: Privacy Policy (`/privacy`) | Terms of Service (`/terms`) — both open in a new tab so the user never loses a form or in-progress application; each link carries a visually hidden "(opens in a new tab)" hint for screen readers
- © RapidGlobe Ltd [year]

---

## Screen 1 — Sign In / Landing

**URL:** `/`
**Auth state:** Unauthenticated only. Authenticated users are redirected to `/dashboard`.

### Content

| Element              | Detail                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Tagline              | _"Your free grant writing companion for UK charities"_ — displayed prominently below the logo |
| Email address field  | Text input, required                                                                          |
| Password field       | Password input, required, show/hide toggle                                                    |
| Forgot password link | Below password field, right-aligned — links to `/forgot-password`                             |
| Sign in button       | Primary action — teal background, full width                                                  |
| Register prompt      | Below sign in button: _"New to Grant Pathway? Register for free"_ — links to `/register`      |

### Validation Rules

| Field    | Rule                         | Inline error message                   |
| -------- | ---------------------------- | -------------------------------------- |
| Email    | Required, valid email format | _"Please enter a valid email address"_ |
| Password | Required, non-empty          | _"Please enter your password"_         |

### Error States (post-submission)

| Scenario                    | Message displayed                                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incorrect email or password | _"Your email address or password is incorrect. Please try again."_                                                                                                               |
| Email not yet verified      | _"Please verify your email address before signing in."_ with a **Resend verification email** link                                                                                |
| Account not found           | Same as incorrect password — _"Your email address or password is incorrect. Please try again."_ (deliberately identical — do not confirm whether an email address is registered) |

### Notes

- No marketing content, hero section, or feature list — clean sign-in page with tagline only
- Page title (browser tab): _"Sign in — Grant Pathway"_

---

## Screen 2 — Register

**URL:** `/register`
**Auth state:** Unauthenticated only. Authenticated users are redirected to `/dashboard`.

### Content

| Element                   | Detail                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading              | _"Create your free account"_                                                                                                                   |
| First name                | Text input, required                                                                                                                           |
| Last name                 | Text input, required                                                                                                                           |
| Email address             | Text input, required                                                                                                                           |
| Password                  | Password input, required, show/hide toggle                                                                                                     |
| Password confirmation     | Password input, required, show/hide toggle                                                                                                     |
| Terms acceptance checkbox | _"I have read and agree to the [Terms of Service] and [Privacy Policy]"_ — both linked, open in new tab — required                             |
| Feedback opt-in checkbox  | _"I'm happy to be contacted occasionally to share feedback about Grant Pathway"_ — optional (FR-08, Should Have — confirmed built, 2026-07-10) |
| Create account button     | Primary action — teal background, full width                                                                                                   |
| Sign in prompt            | Below button: _"Already have an account? Sign in"_ — links to `/`                                                                              |

### Validation Rules

| Field                 | Rule                                                                                          | Inline error message                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| First name            | Required                                                                                      | _"Please enter your first name"_                                                      |
| Last name             | Required                                                                                      | _"Please enter your last name"_                                                       |
| Email                 | Required, valid email format                                                                  | _"Please enter a valid email address"_                                                |
| Email                 | Not already registered                                                                        | _"An account with this email address already exists"_                                 |
| Password              | Required, minimum 12 characters, must contain letters and digits (NFR-04, updated 2026-06-29) | _"Your password must be at least 12 characters and include both letters and numbers"_ |
| Password confirmation | Must match password field                                                                     | _"Your passwords do not match"_                                                       |
| Terms checkbox        | Must be checked                                                                               | _"Please accept the Terms of Service and Privacy Policy to continue"_                 |

### Post-Submission Behaviour

| Outcome            | Behaviour                                                                              |
| ------------------ | -------------------------------------------------------------------------------------- |
| Success            | Account created, verification email sent (Email 1), user redirected to `/verify-email` |
| Validation failure | Inline errors shown against relevant fields, form data preserved, not cleared          |

### Notes

- Terms of Service and Privacy Policy must be published at live URLs before this screen can go live (BRD compliance items 45 and 46 — currently outstanding)
- Both legal document links open in a new browser tab so the user does not lose their partially completed form
- Page title (browser tab): _"Register — Grant Pathway"_

---

## Screen 3 — Verify Email

**URL:** `/verify-email`
**Auth state:** Unauthenticated only.

This screen has three states depending on how the user arrives.

### State 1 — Awaiting Verification (immediately after registration)

User has been redirected here after registering. They have not yet clicked the link in their email.

| Element            | Detail                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Page heading       | _"Check your email"_                                                                                         |
| Message            | _"We've sent a verification link to [email address]. Click the link in the email to activate your account."_ |
| Resend button      | _"Resend verification email"_ — secondary action                                                             |
| Wrong email prompt | _"Wrong email address? [Sign in with a different account]"_ — links to `/`                                   |

### Intermediate screen — Confirming (`/verify-email/confirm`)

**Added 2026-07-02 (D-012).** Between clicking the email link and reaching State 2, the user is briefly routed through `/verify-email/confirm`. This exists because Gmail's own server-side link scanning was found to silently visit — and consume — the single-use verification link within seconds of the email being sent, before the real user ever opened it (confirmed across accounts going back a month, independent of browser). Completing verification the instant the link loads is therefore unsafe; it must instead require an action a scanner won't perform.

| Element      | Detail                                                                                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading | _"Confirming your email"_                                                                                                                                                                                                                     |
| Message      | _"This will only take a moment."_                                                                                                                                                                                                             |
| Interaction  | **None visible.** JavaScript submits the confirmation automatically on page load — a real user is not expected to click anything. This is safe against Gmail's scanner, which fetches the raw page over HTTP and does not execute JavaScript. |

If the link is invalid or has already been used, the user instead sees an inline message here ("We couldn't confirm your email with this link...") with the option to sign in (if already verified) or request a new link.

### State 2 — Link Clicked (valid and unexpired)

User has clicked a valid, unexpired verification link from their email, and has passed through the automatic confirming step above.

| Element         | Detail                                                  |
| --------------- | ------------------------------------------------------- |
| Page heading    | _"Email verified"_                                      |
| Message         | _"Your account is now active. Sign in to get started."_ |
| Continue button | _"Sign in"_ — primary action, links to `/`              |

**Note (D-012):** the user is deliberately signed out after confirming, so this button always leads to a normal sign-in with credentials, rather than an active session carried over from the confirmation link.

### State 3 — Link Expired or Invalid

User has clicked a verification link that has expired (after 1 hour) or is malformed.

| Element       | Detail                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| Page heading  | _"This link has expired"_                                               |
| Message       | _"Your verification link is no longer valid. Request a new one below."_ |
| Resend button | _"Send a new verification email"_ — primary action                      |

### Notes

- The user's email address is displayed in State 1 to reassure them the email went to the correct address
- Resend button is rate-limited to a maximum of 3 resends per hour to prevent abuse (technical implementation detail)
- Page title (browser tab): _"Verify your email — Grant Pathway"_

---

## Screen 4 — Forgot Password

**URL:** `/forgot-password`
**Auth state:** Unauthenticated only.

This screen has two states.

### State 1 — Reset Request Form

User has arrived via the Forgot password link on the sign-in screen.

| Element                | Detail                                                                        |
| ---------------------- | ----------------------------------------------------------------------------- |
| Page heading           | _"Reset your password"_                                                       |
| Instruction text       | _"Enter the email address for your account and we'll send you a reset link."_ |
| Email address          | Text input, required                                                          |
| Send reset link button | Primary action — teal background, full width                                  |
| Back to sign in prompt | _"Remembered your password? [Sign in]"_ — links to `/`                        |

### Validation Rules

| Field | Rule                         | Inline error message                   |
| ----- | ---------------------------- | -------------------------------------- |
| Email | Required, valid email format | _"Please enter a valid email address"_ |

### Post-Submission Behaviour (State 1)

Regardless of whether the email address is registered, always display the same confirmation message. Do not confirm whether an account exists (security best practice):

> _"If an account exists for that email address, you'll receive a reset link shortly. Check your spam folder if it doesn't arrive within a few minutes."_

No further action is available on this confirmation — user may navigate back to sign in via the global navigation.

---

### State 2 — Reset Password Form

User has clicked the reset link from Email 2. Link is valid and unexpired (1-hour window).

| Element                  | Detail                                       |
| ------------------------ | -------------------------------------------- |
| Page heading             | _"Choose a new password"_                    |
| New password             | Password input, required, show/hide toggle   |
| Confirm new password     | Password input, required, show/hide toggle   |
| Save new password button | Primary action — teal background, full width |

### Validation Rules (State 2)

| Field                | Rule                                                                                          | Inline error message                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| New password         | Required, minimum 12 characters, must contain letters and digits (NFR-04, updated 2026-06-29) | _"Your password must be at least 12 characters and include both letters and numbers"_ |
| Confirm new password | Must match new password                                                                       | _"Your passwords do not match"_                                                       |

### Post-Submission Behaviour (State 2)

| Outcome                 | Behaviour                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Success                 | Password updated — display: _"Your password has been updated."_ with a **Sign in** button linking to `/`                    |
| Link expired or invalid | Display: _"This reset link has expired. Please request a new one."_ with a **Request a new link** button linking to State 1 |

### Notes

- Page title (browser tab): _"Reset your password — Grant Pathway"_

---

## Screen 5 — Dashboard

**URL:** `/dashboard`
**Auth state:** Authenticated only. Unauthenticated users are redirected to `/`.

This screen has two states depending on whether the user has any saved applications.

### Charity Profile Incomplete Banner

Displayed in both states whenever the user's charity profile is incomplete — whether never started or partially completed but not saved. Dismissed only when the profile is fully saved.

> _"Before you start, add your charity details — we'll use these to personalise your applications."_
> **[Set up charity profile]** button — links to `/profile`

---

### State 1 — Empty State (no applications)

| Element                | Detail                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading           | _"Welcome to Grant Pathway, [first name]"_                                                                                                                       |
| Charity profile banner | Shown if profile incomplete or partial (see above)                                                                                                               |
| Empty state message    | _"You don't have any applications yet."_                                                                                                                         |
| Start button           | **Start your first application** — primary action, teal. If profile is incomplete, button is disabled with tooltip: _"Please set up your charity profile first"_ |
| Three-step explainer   | Three sequential steps with icons: _"1. Add funder guidelines"_ → _"2. Get an AI summary"_ → _"3. Generate your draft"_                                          |

---

### State 2 — Populated State (one or more applications)

| Element                | Detail                                                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading           | _"My Applications"_                                                                                                                            |
| Summary strip          | _"[n] applications — [n] not started · [n] in progress · [n] approved · [n] exported"_ — all four statuses always shown, even if count is zero |
| New application button | **+ New Application** — primary action, teal, top right of page                                                                                |
| Charity profile banner | Shown if profile incomplete or partial (see above)                                                                                             |
| Application cards      | One card per application, sorted by most recently updated first (descending)                                                                   |

### Application Card Contents

| Element                | Detail                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Funder name            | Bold, prominent — top of card                                                                                       |
| Grant name             | Below funder name                                                                                                   |
| Status label           | Colour-coded pill: Not started (slate) · In progress (amber) · Approved (green) · Exported (teal)                   |
| Last updated           | _"Last updated [date]"_ — formatted as DD Month YYYY (e.g. _"Last updated 14 April 2026"_)                          |
| Continue / View button | **Continue** for Not started and In progress statuses; **View** for Approved and Exported statuses — primary action |
| Delete button          | Secondary action — red text link. Triggers confirmation prompt per the application status model                     |

### Notes

- Page title (browser tab): _"My Applications — Grant Pathway"_
- The summary strip total count matches the total number of application cards shown

---

## Screen 6 — Charity Profile Setup

**URL:** `/profile`
**Auth state:** Authenticated only.

This screen allows users to set up and edit their charity details. These details are used by the AI to personalise draft application answers. All field labels use plain English to ensure accessibility for non-specialist users.

### States

| State                    | Page heading                    | Save button label |
| ------------------------ | ------------------------------- | ----------------- |
| First-time setup         | _"Set up your charity profile"_ | **Save profile**  |
| Editing existing profile | _"Your charity profile"_        | **Save changes**  |

### Fields

| Field                     | Label shown to user             | Type          | Required | Notes                                                                                                                                                                                                        |
| ------------------------- | ------------------------------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Charity name              | _"Charity name"_                | Text input    | Yes      | Pre-populated if found via Charity Commission lookup                                                                                                                                                         |
| Registration number       | _"Charity registration number"_ | Text input    | No       | Pre-populated if found via lookup; left blank if exempt or not yet registered                                                                                                                                |
| Charity Commission lookup | —                               | Search button | —        | Searches by name or number; pre-populates name and registration number on match                                                                                                                              |
| What the charity does     | _"What does your charity do?"_  | Textarea      | Yes      | Combines charitable objects and main activities into a single plain-English field. Placeholder: _"e.g. We support elderly people living alone in rural areas by providing companionship and practical help"_ |
| Who the charity helps     | _"Who does your charity help?"_ | Textarea      | Yes      | Placeholder: _"e.g. Adults aged 65 and over living in North Yorkshire"_                                                                                                                                      |
| Where the charity works   | _"Where do you work?"_          | Text input    | Yes      | Placeholder: _"e.g. South Yorkshire, or National"_                                                                                                                                                           |

**Governance and reserves section (added 2026-07-10 -- missing from this document since P6.1 shipped 2026-07-05):** an optional "Governance and reserves" group appears below the fields above, introduced by: _"Optional for now. Some funders check these facts as part of eligibility — filling them in helps Grant Pathway flag issues before you apply."_

| Field                    | Label shown to user                                                                               | Type         | Required | Notes                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Total annual expenditure | _"Total annual expenditure (£) (optional)"_                                                       | Number input | No       | Placeholder: _"From your latest signed accounts"_                                                                                                                                   |
| Reserves                 | _"Reserves (£) (optional)"_                                                                       | Number input | No       | Placeholder: _"Unrestricted/free reserves"_. Once both fields above are entered, a live message shows: _"Based on the figures above, you hold approximately N months of reserves."_ |
| Trustees related         | _"Are any of your trustees related to each other by family or business relationship? (optional)"_ | Dropdown     | No       | Options: Not sure yet / No / Yes                                                                                                                                                    |
| Bank signatory count     | _"How many people are authorised as bank signatories? (optional)"_                                | Number input | No       |                                                                                                                                                                                     |
| Bank signatories related | _"Are any bank signatories related to each other or to a trustee? (optional)"_                    | Dropdown     | No       | Options: Not sure yet / No / Yes                                                                                                                                                    |

### Charity Commission Lookup Behaviour

| Scenario        | Message displayed                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Match found     | Fields pre-populated. Note shown: _"Details retrieved from the Charity Commission register."_ User may edit if needed |
| No match found  | _"We couldn't find that charity. Please enter your details manually."_                                                |
| API unavailable | _"We couldn't reach the Charity Commission right now. Please enter your details manually."_ (per PDR-UI-006)          |

### Validation Rules

| Field                       | Rule     | Inline error message                        |
| --------------------------- | -------- | ------------------------------------------- |
| Charity name                | Required | _"Please enter your charity name"_          |
| What does your charity do?  | Required | _"Please tell us what your charity does"_   |
| Who does your charity help? | Required | _"Please tell us who your charity helps"_   |
| Where do you work?          | Required | _"Please tell us where your charity works"_ |

### Post-Save Behaviour

| Scenario                             | Behaviour                                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First-time save (profile complete)   | Success message shown on profile page: _"Your charity profile has been saved. You're ready to start your first application."_ with a **Go to my dashboard** button linking to `/dashboard` |
| Edit save (existing profile updated) | Success message shown on profile page: _"Your changes have been saved."_ User remains on `/profile`                                                                                        |
| Validation failure                   | Inline errors shown against relevant fields; form data preserved                                                                                                                           |

### Notes

- Annual income field was considered and removed — optional field with potential to confuse or worry novice users, adding no essential AI context value
- Charitable objects and main activities have been merged into a single plain-English field (_"What does your charity do?"_) to reduce complexity for non-specialist users
- Page title (browser tab): _"Charity Profile — Grant Pathway"_

---

## Screen 7 — Application Flow

**URLs:** `/applications/new` (new application) and `/applications/[id]` (existing application)
**Auth state:** Authenticated only.

The entire application journey is contained within this screen as a five-step flow. A step indicator at the top of the screen shows all five steps with the current step highlighted. When a user returns to an in-progress application from the dashboard, they are taken directly to the step they last reached.

### Auto-Save Behaviour

Progress is saved automatically in two ways:

1. **On Continue:** Application state is saved each time the user advances to the next step
2. **Periodic background save:** Active edits are saved every 60 seconds silently in the background — no visible indicator shown to the user

This ensures no work is lost if the user closes their browser or navigates away mid-step.

---

### Step 1 — Application Details

**Revised 2026-06-01 (DR-FD-001):** Funder is selected from a searchable curated directory, not free-text entry.

| Element                       | Detail                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading (new)            | _"Start a new application"_ — shown at `/applications/new`                                                                                                    |
| Page heading (existing)       | _"Continue your application"_ — shown at `/applications/[id]/step/1` when returning to an existing application                                                |
| Funder picker                 | Searchable dropdown/combobox populated from the active `funders` table. Label: _"Who is offering this grant?"_ Placeholder: _"Search for a funder…"_ Required |
| "My funder isn't listed" link | Below the picker: _"My funder isn't listed — request it"_ — opens funder request form (mailto or Tally in v1)                                                 |
| Grant name                    | Text input, required. Label: _"What is the grant called?"_ Placeholder: _"e.g. Awards for All England"_                                                       |
| Continue button               | Primary action — teal. Creates application record (status: `not_started`), advances to Step 2                                                                 |
| Cancel link                   | _"Cancel"_ — returns to `/dashboard` without saving                                                                                                           |

**Validation:**

| Field      | Rule                                           | Error message                            |
| ---------- | ---------------------------------------------- | ---------------------------------------- |
| Funder     | Required — must be selected from the directory | _"Please select a funder from the list"_ |
| Grant name | Required                                       | _"Please enter the grant name"_          |

---

### Step 2 — Funder Guidelines

| Element                | Detail                                                                                                                                                                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading           | _"Add the funder's guidelines"_                                                                                                                                                                                                                                                                                       |
| Instruction            | _"Upload the funder's guidelines document, or paste the text directly below."_                                                                                                                                                                                                                                        |
| File upload area       | Accepts PDF and .docx only, max 10MB (PDR-DH-001). Drag and drop or click to browse                                                                                                                                                                                                                                   |
| Paste text area        | Large textarea — label: _"Or paste the guidelines text here"_                                                                                                                                                                                                                                                         |
| Large document warning | Shown if document exceeds 100,000 tokens (PDR-AI-004): _"Your guidelines document is quite long. For the best results, we recommend uploading only the core sections — such as eligibility criteria, application questions, and assessment criteria. Very long documents may reduce the quality of your AI summary."_ |
| Continue button        | Primary action — teal. Saves guidelines (status: `in_progress`), advances to Step 3                                                                                                                                                                                                                                   |
| Back link              | Returns to Step 1                                                                                                                                                                                                                                                                                                     |

**File upload error states:**

| Scenario                                             | Message                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong format                                         | _"We can only accept PDF or Word (.docx) files. Check the funder's website for a version in one of these formats. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below."_ _(corrected 2026-07-10 to match `application-step2-form.tsx`)_                                   |
| File too large                                       | _"Your file is over 10MB. Some funders publish a shorter summary version of their guidelines — check their website first. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below."_ _(corrected 2026-07-10)_                                                                 |
| Scanned / image-based PDF                            | _"We couldn't read the text in your PDF — it looks like a scanned document rather than a digital one. Some funders also publish a Word version of their guidelines — check their website. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below."_ _(corrected 2026-07-10)_ |
| PDF exceeds 200 pages                                | **Corrected 2026-07-10:** shows the generic processing-error message below, not a page-count-specific one — `lib/extract-text.ts` returns the same `extraction_failed` reason as any other extraction failure, and the client has no distinct case for it.                                                                                      |
| Extraction timeout                                   | **Corrected 2026-07-10:** same generic message as above — `extraction_timeout` is also not a distinct case in the client's error mapping. Still a real 30-second timeout (`EXTRACTION_TIMEOUT_MS` in `lib/extract-text.ts`), just not a tailored message.                                                                                       |
| Generic processing error (not previously documented) | _"Something went wrong while processing your document. Please try again, or paste the guidelines text directly."_ — shown for the 200-page cap, the extraction timeout, and any other server-side processing failure                                                                                                                            |
| Password-protected PDF                               | _"This PDF is password protected — please remove the password or paste the text instead."_                                                                                                                                                                                                                                                      |

---

### Step 3 — AI Summary

| Element                  | Detail                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading             | _"Your funder guidelines — summary"_                                                                                                                                                                                                                                                                                                                       |
| Progress indicator       | Staged messages during generation: _"Reading your funder guidelines…"_ → _"Identifying key information…"_ → _"Almost there…"_ (PDR-AI-003; third stage added to this doc 2026-07-10, was missing)                                                                                                                                                          |
| Summary content          | AI-generated plain-English digest of the guidelines displayed in full once complete. Includes: what the grant is for, grant amount, who can apply, what the funder is looking for, extracted application questions with word limits, and key requirements                                                                                                  |
| Truncation warning       | Shown when guidelines were pre-processed and truncated before AI processing: _"Your guidelines document was very long, so only the most relevant sections were sent for summarisation. If anything looks incomplete, try pasting the key sections manually."_ _(Added 2026-06-22)_                                                                         |
| Questions extracted note | _"We found [n] application questions in these guidelines. You'll answer each one in the next step."_ _(corrected 2026-07-10 -- matched `components/application-step3-summary.tsx`; previously referenced "generate your draft answers," a holdover from the abandoned auto-draft model)_                                                                   |
| Questions not found note | If no questions could be extracted: _"We couldn't identify specific application questions in this document. In the next step, you'll be able to enter your questions manually."_                                                                                                                                                                           |
| Regenerate link          | _"Regenerate summary"_ — secondary action. Counts as one AI request against monthly allowance (PDR-AI-005)                                                                                                                                                                                                                                                 |
| Continue button          | _"Continue"_ — primary action, advances to Step 4                                                                                                                                                                                                                                                                                                          |
| Back link                | Returns to Step 2                                                                                                                                                                                                                                                                                                                                          |
| API failure state        | _"We couldn't generate your summary right now. This is usually temporary — please try again."_ with a **Try again** button (PDR-UI-006)                                                                                                                                                                                                                    |
| AI service unavailable   | When `AI_ENABLED=false` (kill-switch active): _"The AI service is busy right now. Please try again in a moment."_ — the same generic `overloaded` message as real overload, not a dedicated "temporarily unavailable" message _(corrected 2026-07-10; matched `lib/ai-error-handler.ts`)_. Try again button shown; no quota consumed. _(Added 2026-06-29)_ |

---

### Step 4 — Preparation Checklist

**Added to this document 2026-07-10** (screen existed since S6.4; not previously documented here). **Revised 2026-07-10:** funder-specific supporting documents added (AC-FR-28-09).

Shown once, on first entry to Step 4 (`draft_status = 'not_started'`); bypassed on return visits (AC-FR-28-02).

| Element                       | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading                  | _"Before you begin writing"_                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Standing financial checklist  | Always shown, regardless of funder: _"The financial sections of this application cannot be completed by AI. Before you start, gather:"_ — (1) most recent annual accounts or financial statements, (2) projected budget for the grant period, (3) details of other funding secured or applied for, (4) input from a treasurer, finance lead, or trustee                                                                                                                |
| Funder-specific document list | Shown only when Step 3's AI summary extracted one or more supporting document categories for this funder (`summary_json.supportingDocuments`): _"[Funder name] also asks you to submit:"_ followed by the extracted list. Hidden entirely if the array is empty. May overlap with the standing checklist above (e.g. both can mention annual accounts) since one is general advice and the other is this funder's stated requirement _(Added 2026-07-10, AC-FR-28-09)_ |
| Senior colleague note         | _"It is worth involving a senior colleague — such as your CEO, treasurer, or a trustee — before reaching the financial questions."_                                                                                                                                                                                                                                                                                                                                    |
| Start writing button          | _"I have what I need — start writing"_ — sets `draft_status = 'in_progress'`, syncs `application_answers` from the AI summary, then advances to the Q&A interface                                                                                                                                                                                                                                                                                                      |
| Back link                     | Returns to Step 3                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

---

### Step 4 — Draft Answers

**Revised 2026-05-28 (Q&A model); updated 2026-06-04 (over-limit hard stop, optional gate, budget wording).**

| Element                  | Detail                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading             | _"Your draft answers"_                                                                                                                                                                                                                                                                                                                                                                                                     |
| Sub-heading              | _"Answer each question below. Your work is saved automatically as you type."_ (structured) or _"Write your content for each section below. Your work is saved automatically as you type."_ (free-form)                                                                                                                                                                                                                     |
| Progress bar             | Sticky bar at top: _"X of N questions/sections approved"_                                                                                                                                                                                                                                                                                                                                                                  |
| Funder context bar       | Teal bar showing funder name, grant name, and Back link                                                                                                                                                                                                                                                                                                                                                                    |
| Question/section cards   | Each extracted question (structured) or section (free-form) displayed as a card. Structured: numbered heading + question text. Free-form: section title + guidance text below.                                                                                                                                                                                                                                             |
| Word/character counter   | Displayed below each textarea. Shows "X / N words" or "X / N characters" for questions with limits. Shows "X words" only for sections with no limit (e.g. Garfield Weston).                                                                                                                                                                                                                                                |
| Over-limit hard stop     | When answer exceeds word/character limit: approve panel hidden; red message displayed: _"Your answer exceeds the funder's word limit. Please trim it or use AI to bring it within the limit before approving."_ _(Added 2026-06-04, D-LBF-02)_                                                                                                                                                                             |
| AI assist button         | _"Help me improve this"_ — shown on non-budget questions/sections when answer is non-empty. Disabled on budget sections. On success, displays a "SUGGESTED IMPROVEMENT" card with the refined text and two actions: **"Use this improved version"** (replaces the answer) and **"Keep my original"** (discards the suggestion). _(Button label updated from "Use this version" to "Use this improved version" 2026-06-12)_ |
| Budget section treatment | Budget questions/sections shown with amber border and "Budget" badge. Warning: _"Budget sections must be completed using your own figures, as AI cannot assist you with this. Please ensure all numbers are accurate before proceeding."_ AI assist button absent. _(Wording updated 2026-06-04)_                                                                                                                          |
| Approval panel           | "Before you approve, check:" with three review prompts and "Approve this answer" button. Shown when answer is non-empty (or question is optional and empty). Hidden when answer is over-limit.                                                                                                                                                                                                                             |
| Optional questions       | Questions containing "(optional)" or beginning "This question is optional" show the approve panel even when empty, allowing the user to skip them. These questions are excluded from the assembly gate. _(Added 2026-06-04, D-LBF-01/03)_                                                                                                                                                                                  |
| Approved state           | Card shown with green border and _"Answer approved — edit above to revise"_ confirmation.                                                                                                                                                                                                                                                                                                                                  |
| Ready to assemble        | Button active when all mandatory questions/sections are approved. Greyed when any mandatory question is unapproved. Optional questions do not block the gate.                                                                                                                                                                                                                                                              |
| Manual entry fallback    | If no questions/sections were extracted in Step 3, user sees a manual entry field to add a question and write their answer. _"No specific questions were found in the funder's guidelines."_                                                                                                                                                                                                                               |
| AI service unavailable   | When `AI_ENABLED=false` and user clicks "Help me improve this": _"The AI service is busy right now. Please try again in a moment."_ — same generic `overloaded` message, not dedicated _(corrected 2026-07-10)_. Inline error shown on the card; no quota consumed. _(Added 2026-06-29)_                                                                                                                                   |
| Back link                | Returns to Step 3 (via funder context bar or bottom of page)                                                                                                                                                                                                                                                                                                                                                               |

---

### Step 5 — Approve & Export

**Revised 2026-06-01:** Confirmation checkboxes added (FR-32/FR-33); wording updated.
**Revised 2026-06-12:** Approve confirmation modal removed; approve + download collapsed into a single action to reduce friction.

| Element                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading            | _"Review and approve your application"_                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Funder / grant subtitle | _"[Funder name] · [Grant name]"_ — displayed below the heading                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Assembled draft         | Read-only view of all questions and approved answers                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Confirmation checkboxes | Three mandatory checkboxes (FR-32) — all must be ticked before the download buttons are active: (1) _"I have reviewed all responses in full and am satisfied with their content."_ (2) _"The information provided is accurate and complete to the best of my knowledge."_ (3) _"I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted."_                                                                 |
| Export buttons          | **Download as Word document (.docx)** and **Download as plain text (.txt)** — disabled until all three checkboxes are ticked. On first click: approves the application (sets status to `approved`) then triggers the download immediately in a single action. No intermediate confirmation modal. _(Revised 2026-06-12: previously required a separate "Approve my application" button + modal before download unlocked.)_                                                         |
| Re-export warning       | Shown if application has already been exported (PDR-DH-003), titled "Download again?": _"You last exported this application on [date]."_ (or _"You have already exported this application."_ if no date recorded) _"If you have already submitted that version to the funder, please contact them if you intend to submit a revised version — funders may treat multiple submissions as separate applications."_ _(corrected 2026-07-10 to match `application-step5-approve.tsx`)_ |
| Re-open link            | **"Re-open application to make changes"** — always shown. Opens a confirmation modal; on confirm resets status to `in_progress`, clears the assembled draft, and redirects to Step 4. _(Revised 2026-06-12: Back link removed — Step 4 auto-redirects to Step 5 when draft_status = 'assembled', so Back created an unescapable loop. Re-open is the only correct route back.)_                                                                                                    |

### Notes

- Each regeneration (summary or draft answers) counts as one AI request against the user's monthly allowance (PDR-AI-005)
- The AI extracts application questions directly from the guidelines in Step 3 — users do not enter questions manually unless extraction fails
- Page title (browser tab): _"[Grant name] — [Funder name] — Grant Pathway"_

---

## Screen 8 — Account Settings

**URL:** `/account`
**Auth state:** Authenticated only.

### Content

| Element                 | Detail                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading            | _"Account settings"_                                                                                                                           |
| Email address           | Read-only display: _"Your email address: [email]"_ — no change facility in v1                                                                  |
| Change password heading | _"Change your password"_                                                                                                                       |
| Current password        | Password input, required, show/hide toggle                                                                                                     |
| New password            | Password input, required, show/hide toggle                                                                                                     |
| Confirm new password    | Password input, required, show/hide toggle                                                                                                     |
| Update password button  | _"Update password"_ — primary action, teal                                                                                                     |
| Delete account heading  | _"Delete your account"_                                                                                                                        |
| Delete account warning  | _"Deleting your account will permanently remove all your data, including your charity profile and saved applications. This cannot be undone."_ |
| Delete account button   | _"Delete my account"_ — destructive action, red. Links to `/account/delete`                                                                    |

### Validation Rules

| Field                | Rule                                                                                          | Inline error message                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Current password     | Required, must match existing password                                                        | _"Your current password is incorrect"_                                                |
| New password         | Required, minimum 12 characters, must contain letters and digits (NFR-04, updated 2026-06-29) | _"Your password must be at least 12 characters and include both letters and numbers"_ |
| Confirm new password | Must match new password field                                                                 | _"Your passwords do not match"_                                                       |

### Post-Save Behaviour

| Outcome                       | Behaviour                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| Password updated successfully | Success message shown inline: _"Your password has been updated."_ Form fields cleared |
| Validation failure            | Inline errors shown against relevant fields; form data preserved                      |

### Notes

- Email address is displayed as read-only. Email change is not supported in v1 — users who need to change their email address must delete their account and re-register
- Password policy: 12-character minimum length, must contain both letters and digits (NFR-04, updated 2026-06-29). This is one global policy enforced identically on Register, Reset Password, and Account Settings.
- Page title (browser tab): _"Account Settings — Grant Pathway"_

---

## Screen 9 — Account Deletion Confirmation

**URL:** `/account/delete`
**Auth state:** Authenticated only. Accessible only via the Delete my account button on `/account`.

### Content

| Element               | Detail                                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading          | _"Delete your account"_                                                                                                                                                           |
| Warning message       | _"This will permanently delete your account and all associated data, including your charity profile and all saved applications. This cannot be undone."_                          |
| Data summary          | Plain list of exactly what will be deleted: _"Your account and login details / Your charity profile / All saved applications and draft answers / Any uploaded funder guidelines"_ |
| Confirmation input    | Text input — user must type **DELETE** to confirm. Label: _"Type DELETE to confirm"_                                                                                              |
| Delete account button | _"Permanently delete my account"_ — destructive action, red. Disabled until the word DELETE has been typed exactly                                                                |
| Cancel button         | _"Cancel"_ — secondary action. Returns user to `/account` with no changes made                                                                                                    |

### Post-Deletion Behaviour

| Step | Action                                                                                                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | All user data deleted immediately — account, charity profile, applications, uploaded files, AI usage records (FR-40 to FR-43)                                                                                             |
| 2    | User session ended                                                                                                                                                                                                        |
| 3    | User redirected to `/` with inline message: _"Your account has been deleted. We've sent you a confirmation email."_ _(corrected 2026-07-10 -- second sentence previously omitted; matched `components/sign-in-form.tsx`)_ |
| 4    | Confirmation email sent (Email 5) -- **confirmed built (2026-07-10)**, not conditional; sent on every deletion via `lib/emails/account-deleted-user.ts`                                                                   |

### Notes

- The DELETE confirmation input is deliberately high-friction — it prevents accidental account deletion
- The confirmation input is case-sensitive — only the exact string `DELETE` (uppercase) is accepted
- Page title (browser tab): _"Delete Account — Grant Pathway"_

---

## Screen 10 — Terms of Service

**URL:** `/terms`
**Access:** All states — no authentication required; authenticated users are not redirected away

### Content

- Full Terms of Service rendered from `docs/terms-of-service.md` (the single authoritative source — the page is generated from the same file a solicitor reviews)
- Static page, statically prerendered at build time; no fields, no validation, no error states
- Standard public navigation bar and global footer

### Notes

- Linked from the global footer and from the consent checkbox on the Register screen — both open in a new tab so the user never loses their place; the nav logo links to `/` for visitors who arrive directly
- Page title (browser tab): _"Terms of Service — Grant Pathway"_
- The effective date in the source document is `[TO BE CONFIRMED]` and must be set before go-live (P5.1)

---

## Screen 11 — Privacy Policy

**URL:** `/privacy`
**Access:** All states — no authentication required; authenticated users are not redirected away

### Content

- Full Privacy Policy rendered from `docs/privacy-policy.md` (the single authoritative source)
- Static page, statically prerendered at build time; no fields, no validation, no error states
- Tables (company details, legal bases, data processors, retention periods) rendered as accessible HTML tables
- Standard public navigation bar and global footer

### Notes

- Linked from the global footer and from the consent checkbox on the Register screen — both open in a new tab so the user never loses their place; the nav logo links to `/` for visitors who arrive directly
- Page title (browser tab): _"Privacy Policy — Grant Pathway"_
- The effective date in the source document is `[TO BE CONFIRMED]` and must be set before go-live (P5.1)

---

_Last updated: 2026-07-10_

_Changes in this version: Reset Password (State 2) and Account Settings — password policy corrected to match the Register screen: minimum raised from 10 to 12 characters, letters + digits now required (2026-07-10). This closes a gap from the 2026-06-29 correction, which updated the Register screen only even though the policy is global across all three password-entry flows. Register screen — password minimum raised to 12 characters, letters + digits required (2026-06-29). Step 2 — extraction timeout and 200-page cap error states added (2026-06-22). Step 3 — truncation warning banner added (2026-06-22); AI kill-switch unavailable state added (2026-06-29). Step 4 — AI kill-switch unavailable state added for AI assist button (2026-06-29)._
