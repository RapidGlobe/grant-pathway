# Screen Requirements — Grant Pathway v1

This document defines the required content, fields, validation rules, and error states for each of the 9 screens in Grant Pathway v1. It is an input to the Product Requirements Document and to acceptance criteria.

Screens are listed in the order a new user would encounter them.

---

## Screens Index

| # | Screen | URL | Status |
|---|--------|-----|--------|
| 1 | Sign In / Landing | `/` | ✅ Complete |
| 2 | Register | `/register` | ✅ Complete |
| 3 | Verify Email | `/verify-email` | ✅ Complete |
| 4 | Forgot Password | `/forgot-password` | ✅ Complete |
| 5 | Dashboard | `/dashboard` | ✅ Complete |
| 6 | Charity Profile Setup | `/profile` | ✅ Complete |
| 7 | Application Flow | `/applications/new` and `/applications/[id]` | ✅ Complete |
| 8 | Account Settings | `/account` | ✅ Complete |
| 9 | Account Deletion Confirmation | `/account/delete` | ✅ Complete |

---

## Global Elements

The following elements appear on all screens unless otherwise noted.

### Navigation bar (unauthenticated)
- Grant Pathway logo (top left) — no link (stays on current page)
- **Sign in** link — `/`
- **Register** link — `/register`

### Navigation bar (authenticated)
- Grant Pathway logo (top left) — links to `/dashboard`
- **My Applications** — links to `/dashboard`
- **Charity Profile** — links to `/profile`
- **Account** (top right, displays user's first name or email) — dropdown menu:
  - Account Settings — `/account`
  - Sign Out

### Footer (all screens)
- Tagline: *"Your free grant writing companion for UK charities"*
- Links: Privacy Policy | Terms of Service
- © RapidGlobe Ltd [year]

---

## Screen 1 — Sign In / Landing

**URL:** `/`
**Auth state:** Unauthenticated only. Authenticated users are redirected to `/dashboard`.

### Content

| Element | Detail |
|---------|--------|
| Tagline | *"Your free grant writing companion for UK charities"* — displayed prominently below the logo |
| Email address field | Text input, required |
| Password field | Password input, required, show/hide toggle |
| Forgot password link | Below password field, right-aligned — links to `/forgot-password` |
| Sign in button | Primary action — teal background, full width |
| Register prompt | Below sign in button: *"New to Grant Pathway? Register for free"* — links to `/register` |

### Validation Rules

| Field | Rule | Inline error message |
|-------|------|---------------------|
| Email | Required, valid email format | *"Please enter a valid email address"* |
| Password | Required, non-empty | *"Please enter your password"* |

### Error States (post-submission)

| Scenario | Message displayed |
|----------|------------------|
| Incorrect email or password | *"Your email address or password is incorrect. Please try again."* |
| Email not yet verified | *"Please verify your email address before signing in."* with a **Resend verification email** link |
| Account not found | Same as incorrect password — *"Your email address or password is incorrect. Please try again."* (deliberately identical — do not confirm whether an email address is registered) |

### Notes
- No marketing content, hero section, or feature list — clean sign-in page with tagline only
- Page title (browser tab): *"Sign in — Grant Pathway"*

---

## Screen 2 — Register

**URL:** `/register`
**Auth state:** Unauthenticated only. Authenticated users are redirected to `/dashboard`.

### Content

| Element | Detail |
|---------|--------|
| Page heading | *"Create your free account"* |
| First name | Text input, required |
| Last name | Text input, required |
| Email address | Text input, required |
| Password | Password input, required, show/hide toggle |
| Password confirmation | Password input, required, show/hide toggle |
| Terms acceptance checkbox | *"I have read and agree to the [Terms of Service] and [Privacy Policy]"* — both linked, open in new tab — required |
| Feedback opt-in checkbox | *"I'm happy to be contacted occasionally to share feedback about Grant Pathway"* — optional (FR-08, Should Have — omit if FR-08 not built in v1) |
| Create account button | Primary action — teal background, full width |
| Sign in prompt | Below button: *"Already have an account? Sign in"* — links to `/` |

### Validation Rules

| Field | Rule | Inline error message |
|-------|------|---------------------|
| First name | Required | *"Please enter your first name"* |
| Last name | Required | *"Please enter your last name"* |
| Email | Required, valid email format | *"Please enter a valid email address"* |
| Email | Not already registered | *"An account with this email address already exists"* |
| Password | Required, minimum 10 characters (NFR-04) | *"Your password must be at least 10 characters"* |
| Password confirmation | Must match password field | *"Your passwords do not match"* |
| Terms checkbox | Must be checked | *"Please accept the Terms of Service and Privacy Policy to continue"* |

### Post-Submission Behaviour

| Outcome | Behaviour |
|---------|-----------|
| Success | Account created, verification email sent (Email 1), user redirected to `/verify-email` |
| Validation failure | Inline errors shown against relevant fields, form data preserved, not cleared |

### Notes
- Terms of Service and Privacy Policy must be published at live URLs before this screen can go live (BRD compliance items 45 and 46 — currently outstanding)
- Both legal document links open in a new browser tab so the user does not lose their partially completed form
- Page title (browser tab): *"Register — Grant Pathway"*

---

## Screen 3 — Verify Email

**URL:** `/verify-email`
**Auth state:** Unauthenticated only.

This screen has three states depending on how the user arrives.

### State 1 — Awaiting Verification (immediately after registration)

User has been redirected here after registering. They have not yet clicked the link in their email.

| Element | Detail |
|---------|--------|
| Page heading | *"Check your email"* |
| Message | *"We've sent a verification link to [email address]. Click the link in the email to activate your account."* |
| Resend button | *"Resend verification email"* — secondary action |
| Wrong email prompt | *"Wrong email address? [Sign in with a different account]"* — links to `/` |

### State 2 — Link Clicked (valid and unexpired)

User has clicked a valid, unexpired verification link from their email.

| Element | Detail |
|---------|--------|
| Page heading | *"Email verified"* |
| Message | *"Your account is now active. Let's get started."* |
| Continue button | *"Go to my dashboard"* — primary action, links to `/dashboard` |

### State 3 — Link Expired or Invalid

User has clicked a verification link that has expired (after 24 hours) or is malformed.

| Element | Detail |
|---------|--------|
| Page heading | *"This link has expired"* |
| Message | *"Your verification link is no longer valid. Request a new one below."* |
| Resend button | *"Send a new verification email"* — primary action |

### Notes
- The user's email address is displayed in State 1 to reassure them the email went to the correct address
- Resend button is rate-limited to a maximum of 3 resends per hour to prevent abuse (technical implementation detail)
- Page title (browser tab): *"Verify your email — Grant Pathway"*

---

## Screen 4 — Forgot Password

**URL:** `/forgot-password`
**Auth state:** Unauthenticated only.

This screen has two states.

### State 1 — Reset Request Form

User has arrived via the Forgot password link on the sign-in screen.

| Element | Detail |
|---------|--------|
| Page heading | *"Reset your password"* |
| Instruction text | *"Enter the email address for your account and we'll send you a reset link."* |
| Email address | Text input, required |
| Send reset link button | Primary action — teal background, full width |
| Back to sign in prompt | *"Remembered your password? [Sign in]"* — links to `/` |

### Validation Rules

| Field | Rule | Inline error message |
|-------|------|---------------------|
| Email | Required, valid email format | *"Please enter a valid email address"* |

### Post-Submission Behaviour (State 1)

Regardless of whether the email address is registered, always display the same confirmation message. Do not confirm whether an account exists (security best practice):

> *"If an account exists for that email address, you'll receive a reset link shortly. Check your spam folder if it doesn't arrive within a few minutes."*

No further action is available on this confirmation — user may navigate back to sign in via the global navigation.

---

### State 2 — Reset Password Form

User has clicked the reset link from Email 2. Link is valid and unexpired (1-hour window).

| Element | Detail |
|---------|--------|
| Page heading | *"Choose a new password"* |
| New password | Password input, required, show/hide toggle |
| Confirm new password | Password input, required, show/hide toggle |
| Save new password button | Primary action — teal background, full width |

### Validation Rules (State 2)

| Field | Rule | Inline error message |
|-------|------|---------------------|
| New password | Required, minimum 10 characters (NFR-04) | *"Your password must be at least 10 characters"* |
| Confirm new password | Must match new password | *"Your passwords do not match"* |

### Post-Submission Behaviour (State 2)

| Outcome | Behaviour |
|---------|-----------|
| Success | Password updated — display: *"Your password has been updated."* with a **Sign in** button linking to `/` |
| Link expired or invalid | Display: *"This reset link has expired. Please request a new one."* with a **Request a new link** button linking to State 1 |

### Notes
- Page title (browser tab): *"Reset your password — Grant Pathway"*

---

## Screen 5 — Dashboard

**URL:** `/dashboard`
**Auth state:** Authenticated only. Unauthenticated users are redirected to `/`.

This screen has two states depending on whether the user has any saved applications.

### Charity Profile Incomplete Banner

Displayed in both states whenever the user's charity profile is incomplete — whether never started or partially completed but not saved. Dismissed only when the profile is fully saved.

> *"Before you start, add your charity details — we'll use these to personalise your applications."*
> **[Set up charity profile]** button — links to `/profile`

---

### State 1 — Empty State (no applications)

| Element | Detail |
|---------|--------|
| Page heading | *"Welcome to Grant Pathway, [first name]"* |
| Charity profile banner | Shown if profile incomplete or partial (see above) |
| Empty state message | *"You don't have any applications yet."* |
| Start button | **Start your first application** — primary action, teal. If profile is incomplete, button is disabled with tooltip: *"Please set up your charity profile first"* |
| Three-step explainer | Three sequential steps with icons: *"1. Add funder guidelines"* → *"2. Get an AI summary"* → *"3. Generate your draft"* |

---

### State 2 — Populated State (one or more applications)

| Element | Detail |
|---------|--------|
| Page heading | *"My Applications"* |
| Summary strip | *"[n] applications — [n] not started · [n] in progress · [n] approved · [n] exported"* — all four statuses always shown, even if count is zero |
| New application button | **+ New Application** — primary action, teal, top right of page |
| Charity profile banner | Shown if profile incomplete or partial (see above) |
| Application cards | One card per application, sorted by most recently updated first (descending) |

### Application Card Contents

| Element | Detail |
|---------|--------|
| Funder name | Bold, prominent — top of card |
| Grant name | Below funder name |
| Status label | Colour-coded pill: Not started (slate) · In progress (amber) · Approved (green) · Exported (teal) |
| Last updated | *"Last updated [date]"* — formatted as DD Month YYYY (e.g. *"Last updated 14 April 2026"*) |
| Continue / View button | **Continue** for Not started and In progress statuses; **View** for Approved and Exported statuses — primary action |
| Delete button | Secondary action — red text link. Triggers confirmation prompt per the application status model |

### Notes
- Page title (browser tab): *"My Applications — Grant Pathway"*
- The summary strip total count matches the total number of application cards shown

---

## Screen 6 — Charity Profile Setup

**URL:** `/profile`
**Auth state:** Authenticated only.

This screen allows users to set up and edit their charity details. These details are used by the AI to personalise draft application answers. All field labels use plain English to ensure accessibility for non-specialist users.

### States

| State | Page heading | Save button label |
|-------|-------------|------------------|
| First-time setup | *"Set up your charity profile"* | **Save profile** |
| Editing existing profile | *"Your charity profile"* | **Save changes** |

### Fields

| Field | Label shown to user | Type | Required | Notes |
|-------|-------------------|------|----------|-------|
| Charity name | *"Charity name"* | Text input | Yes | Pre-populated if found via Charity Commission lookup |
| Registration number | *"Charity registration number"* | Text input | No | Pre-populated if found via lookup; left blank if exempt or not yet registered |
| Charity Commission lookup | — | Search button | — | Searches by name or number; pre-populates name and registration number on match |
| What the charity does | *"What does your charity do?"* | Textarea | Yes | Combines charitable objects and main activities into a single plain-English field. Placeholder: *"e.g. We support elderly people living alone in rural areas by providing companionship and practical help"* |
| Who the charity helps | *"Who does your charity help?"* | Textarea | Yes | Placeholder: *"e.g. Adults aged 65 and over living in North Yorkshire"* |
| Where the charity works | *"Where do you work?"* | Text input | Yes | Placeholder: *"e.g. South Yorkshire, or National"* |

### Charity Commission Lookup Behaviour

| Scenario | Message displayed |
|----------|-----------------|
| Match found | Fields pre-populated. Note shown: *"Details retrieved from the Charity Commission register."* User may edit if needed |
| No match found | *"We couldn't find that charity. Please enter your details manually."* |
| API unavailable | *"We couldn't reach the Charity Commission right now. Please enter your details manually."* (per PDR-UI-006) |

### Validation Rules

| Field | Rule | Inline error message |
|-------|------|---------------------|
| Charity name | Required | *"Please enter your charity name"* |
| What does your charity do? | Required | *"Please tell us what your charity does"* |
| Who does your charity help? | Required | *"Please tell us who your charity helps"* |
| Where do you work? | Required | *"Please tell us where your charity works"* |

### Post-Save Behaviour

| Scenario | Behaviour |
|----------|-----------|
| First-time save (profile complete) | Success message shown on profile page: *"Your charity profile has been saved. You're ready to start your first application."* with a **Go to my dashboard** button linking to `/dashboard` |
| Edit save (existing profile updated) | Success message shown on profile page: *"Your changes have been saved."* User remains on `/profile` |
| Validation failure | Inline errors shown against relevant fields; form data preserved |

### Notes
- Annual income field was considered and removed — optional field with potential to confuse or worry novice users, adding no essential AI context value
- Charitable objects and main activities have been merged into a single plain-English field (*"What does your charity do?"*) to reduce complexity for non-specialist users
- Page title (browser tab): *"Charity Profile — Grant Pathway"*

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

| Element | Detail |
|---------|--------|
| Page heading (new) | *"Start a new application"* — shown at `/applications/new` |
| Page heading (existing) | *"Continue your application"* — shown at `/applications/[id]/step/1` when returning to an existing application |
| Funder name | Text input, required. Label: *"Who is offering this grant?"* Placeholder: *"e.g. National Lottery Community Fund"* |
| Grant name | Text input, required. Label: *"What is the grant called?"* Placeholder: *"e.g. Awards for All England"* |
| Continue button | Primary action — teal. Creates application record (status: `not_started`), advances to Step 2 |
| Cancel link | *"Cancel"* — returns to `/dashboard` without saving |

**Validation:**

| Field | Rule | Error message |
|-------|------|--------------|
| Funder name | Required | *"Please enter the funder's name"* |
| Grant name | Required | *"Please enter the grant name"* |

---

### Step 2 — Funder Guidelines

| Element | Detail |
|---------|--------|
| Page heading | *"Add the funder's guidelines"* |
| Instruction | *"Upload the funder's guidelines document, or paste the text directly below."* |
| File upload area | Accepts PDF and .docx only, max 10MB (PDR-DH-001). Drag and drop or click to browse |
| Paste text area | Large textarea — label: *"Or paste the guidelines text here"* |
| Large document warning | Shown if document exceeds 100,000 tokens (PDR-AI-004): *"Your guidelines document is quite long. For the best results, we recommend uploading only the core sections — such as eligibility criteria, application questions, and assessment criteria. Very long documents may reduce the quality of your AI summary."* |
| Continue button | Primary action — teal. Saves guidelines (status: `in_progress`), advances to Step 3 |
| Back link | Returns to Step 1 |

**File upload error states:**

| Scenario | Message |
|----------|---------|
| Wrong format | *"We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."* |
| File too large | *"Your file is over 10MB. Please upload a smaller file or paste the text directly."* |
| Scanned / image-based PDF | *"We couldn't read the text in your PDF — it may be a scanned document. Please try copying and pasting the text directly instead."* |

---

### Step 3 — AI Summary

| Element | Detail |
|---------|--------|
| Page heading | *"Your funder guidelines — summary"* |
| Progress indicator | Staged messages during generation: *"Reading your funder guidelines…"* → *"Almost there…"* (PDR-AI-003) |
| Summary content | AI-generated plain-English digest of the guidelines displayed in full once complete. Includes: what the grant is for, grant amount, who can apply, what the funder is looking for, extracted application questions with word limits, and key requirements |
| Questions extracted note | *"We found [n] application questions in these guidelines. We'll use these to generate your draft answers in the next step."* |
| Questions not found note | If no questions could be extracted: *"We couldn't identify specific application questions in this document. In the next step, you'll be able to enter your questions manually."* |
| Regenerate link | *"Regenerate summary"* — secondary action. Counts as one AI request against monthly allowance (PDR-AI-005) |
| Continue button | *"Continue"* — primary action, advances to Step 4 |
| Back link | Returns to Step 2 |
| API failure state | *"We couldn't generate your summary right now. This is usually temporary — please try again."* with a **Try again** button (PDR-UI-006) |

---

### Step 4 — Draft Answers

| Element | Detail |
|---------|--------|
| Page heading | *"Your draft answers"* |
| Progress indicator | Staged messages: *"Reviewing your guidelines and charity profile…"* → *"Writing your draft answers…"* → *"Almost there…"* |
| Draft content | Each extracted question shown as a bold heading with the AI-generated answer in an editable text area below. User can edit answers directly |
| Manual question entry | If no questions were extracted in Step 3, user sees a manual entry field to add questions before generating answers |
| Regenerate link | *"Regenerate all answers"* — secondary action. Counts as one AI request against monthly allowance (PDR-AI-005) |
| Continue button | *"I've reviewed my answers — continue"* — primary action, advances to Step 5 |
| Back link | Returns to Step 3 |
| API failure state | *"We couldn't generate your draft right now. This is usually temporary — please try again."* with a **Try again** button (PDR-UI-006) |
| Approaching limit warning | Soft banner: *"You've used most of your monthly AI allowance."* (PDR-AI-005) |
| Limit reached | *"You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch."* — generate and regenerate buttons disabled |

---

### Step 5 — Approve & Export

| Element | Detail |
|---------|--------|
| Page heading | *"Review and approve your application"* |
| Content | Read-only view of all questions and answers for final review |
| Approve button | **Approve my application** — primary action, teal. Sets status to `approved`. Confirmation prompt: *"Are you sure you want to approve this application? You can re-open it to make changes at any time."* |
| Export button | **Download as Word document** — enabled only after approval. Sets status to `exported` on first download |
| Re-export warning | Shown if application has already been exported (PDR-DH-003): *"You exported this application on [date]. If you have already submitted that version to the funder, please contact them to let them know a revised version is being submitted. Funders may treat multiple submissions as separate applications."* Actions: **Download anyway** / **Cancel** |
| Back link | Returns to Step 4 |

### Notes
- Each regeneration (summary or draft answers) counts as one AI request against the user's monthly allowance (PDR-AI-005)
- The AI extracts application questions directly from the guidelines in Step 3 — users do not enter questions manually unless extraction fails
- Page title (browser tab): *"[Grant name] — [Funder name] — Grant Pathway"*

---

## Screen 8 — Account Settings

**URL:** `/account`
**Auth state:** Authenticated only.

### Content

| Element | Detail |
|---------|--------|
| Page heading | *"Account settings"* |
| Email address | Read-only display: *"Your email address: [email]"* — no change facility in v1 |
| Change password heading | *"Change your password"* |
| Current password | Password input, required, show/hide toggle |
| New password | Password input, required, show/hide toggle |
| Confirm new password | Password input, required, show/hide toggle |
| Update password button | *"Update password"* — primary action, teal |
| Delete account heading | *"Delete your account"* |
| Delete account warning | *"Deleting your account will permanently remove all your data, including your charity profile and saved applications. This cannot be undone."* |
| Delete account button | *"Delete my account"* — destructive action, red. Links to `/account/delete` |

### Validation Rules

| Field | Rule | Inline error message |
|-------|------|---------------------|
| Current password | Required, must match existing password | *"Your current password is incorrect"* |
| New password | Required, minimum 10 characters (NCSC guidance, NFR-04) | *"Your password must be at least 10 characters"* |
| Confirm new password | Must match new password field | *"Your passwords do not match"* |

### Post-Save Behaviour

| Outcome | Behaviour |
|---------|-----------|
| Password updated successfully | Success message shown inline: *"Your password has been updated."* Form fields cleared |
| Validation failure | Inline errors shown against relevant fields; form data preserved |

### Notes
- Email address is displayed as read-only. Email change is not supported in v1 — users who need to change their email address must delete their account and re-register
- Password policy follows NCSC guidance: 10-character minimum length only, no mandatory complexity rules (NFR-04)
- Page title (browser tab): *"Account Settings — Grant Pathway"*

---

## Screen 9 — Account Deletion Confirmation

**URL:** `/account/delete`
**Auth state:** Authenticated only. Accessible only via the Delete my account button on `/account`.

### Content

| Element | Detail |
|---------|--------|
| Page heading | *"Delete your account"* |
| Warning message | *"This will permanently delete your account and all associated data, including your charity profile and all saved applications. This cannot be undone."* |
| Data summary | Plain list of exactly what will be deleted: *"Your account and login details / Your charity profile / All saved applications and draft answers / Any uploaded funder guidelines"* |
| Confirmation input | Text input — user must type **DELETE** to confirm. Label: *"Type DELETE to confirm"* |
| Delete account button | *"Permanently delete my account"* — destructive action, red. Disabled until the word DELETE has been typed exactly |
| Cancel button | *"Cancel"* — secondary action. Returns user to `/account` with no changes made |

### Post-Deletion Behaviour

| Step | Action |
|------|--------|
| 1 | All user data deleted immediately — account, charity profile, applications, uploaded files, AI usage records (FR-40 to FR-43) |
| 2 | User session ended |
| 3 | User redirected to `/` with inline message: *"Your account has been deleted."* |
| 4 | Confirmation email sent (Email 5) if FR-44 is implemented |

### Notes
- The DELETE confirmation input is deliberately high-friction — it prevents accidental account deletion
- The confirmation input is case-sensitive — only the exact string `DELETE` (uppercase) is accepted
- Page title (browser tab): *"Delete Account — Grant Pathway"*

---

*Last updated: 2026-04-16*
