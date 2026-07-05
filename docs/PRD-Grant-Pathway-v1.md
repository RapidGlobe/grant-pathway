# Product Requirements Document

# Grant Pathway -- Version 1

---

## Document Control

| Field              | Detail                                            |
| ------------------ | ------------------------------------------------- |
| **Document title** | Product Requirements Document -- Grant Pathway v1 |
| **Version**        | 0.2 Draft                                         |
| **Status**         | Draft                                             |
| **Author**         | Rapidglobe Ltd                                    |
| **Date created**   | 2026-04-16                                        |
| **Last updated**   | 2026-05-07                                        |
| **Review date**    | Prior to development start                        |

### Revision History

| Version | Date       | Author         | Summary of Changes                                                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0.1     | 2026-04-16 | Rapidglobe Ltd | Initial draft                                                                                                                                                                                                                                                                                                                                    |
| 0.2     | 2026-05-07 | Rapidglobe Ltd | AI delivery mechanism changed from Anthropic direct API to Amazon Bedrock Claude Sonnet 4.6 (eu-west-2). Model updated from claude-sonnet-4 to claude-sonnet-4-6. Compliance section updated: Anthropic DPA replaced by AWS DPA review. Privacy Policy disclosure updated. Sections 9.3, 10.1, 10.5, 15, and Appendix A updated for consistency. |

### Related Documents

| Document                              | Location                                              |
| ------------------------------------- | ----------------------------------------------------- |
| Business Requirements Document        | `business/BRD-Grant-Pathway-v1.md`                    |
| MoSCoW Feature Register               | `business/moscow-feature-register.md`                 |
| Screen Requirements                   | `business/PRD inputs/screen-requirements.md`          |
| Acceptance Criteria                   | `business/PRD inputs/acceptance-criteria.md`          |
| Application Status Model              | `business/PRD inputs/application-status-model.md`     |
| Email Notifications                   | `business/PRD inputs/email-notifications.md`          |
| Success Metrics                       | `business/PRD inputs/success-metrics.md`              |
| Information Architecture & Navigation | `business/information-architecture-and-navigation.md` |
| Data Model                            | `business/data-model.md`                              |
| Non-Functional Requirements           | `business/non-functional-requirements.md`             |
| PRD Decisions Index                   | `business/PRD decisions/PRD-DECISIONS-INDEX.md`       |
| User Personas, Journeys & Use Cases   | `business/user-personas-journeys-and-use-cases.md`    |

---

## 1. Executive Summary

Grant Pathway is a free, AI-assisted grant writing tool for UK charities. It reduces the time, effort, and expertise required to write a strong grant application -- enabling volunteers and non-specialist staff to produce clearer, more consistent applications without professional fundraising support.

This Product Requirements Document defines exactly what must be built for the v1 release: what the product does, how each screen behaves, what data is stored, how the AI integration works, and the standards the product must meet. It is the primary reference for development.

The document synthesises requirements from the Business Requirements Document, 16 PRD decision records, and 5 PRD input documents. Where this document and any source document differ, this PRD takes precedence. Known divergences from the BRD are documented in the MoSCoW Feature Register.

**Target launch date: not committed (revised 2026-07-05; was 31 July 2026).** Launch now requires Phase 6 (`ADR-DATA-006`, the application item-graph rearchitecture) to complete — see the Phase 6 → Go-Live Gate in `docs/Implementation Plan/IMPLEMENTATION-PLAN.md`. Working estimate: August–September 2026.

---

## 2. Product Vision & Objectives

### 2.1 Vision Statement

> To be the trusted, free writing companion for UK charities -- helping non-specialists produce stronger, more consistent grant applications through AI-powered drafting, guideline summarisation, and mandatory human review.

### 2.2 Objectives for v1

| Ref    | Objective                                                                             | Measure                                             |
| ------ | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| OBJ-01 | Launch a stable, accessible web application by 31 July 2026                           | Live deployment by target date                      |
| OBJ-02 | Enable any UK charity to register and complete an application within a single session | Confirmed through user testing                      |
| OBJ-03 | Reduce the time a non-specialist spends writing a grant application                   | Evidenced through user feedback interviews          |
| OBJ-04 | Achieve WCAG 2.2 Level AA accessibility from day one                                  | Internal testing and checklist review pre-launch    |
| OBJ-05 | Operate within a monthly running cost of £100                                         | Monthly cost monitoring                             |
| OBJ-06 | Gather sufficient early user feedback to inform v2 planning                           | Feedback interviews with opted-in users post-launch |

---

## 3. Scope & Feature Priorities

### 3.1 In Scope for v1

| #   | Capability                                                             |
| --- | ---------------------------------------------------------------------- |
| 1   | User registration, email verification, login, and account management   |
| 2   | Charity profile creation with Charity Commission API lookup            |
| 3   | Grant application creation, editing, saving, deletion, and export      |
| 4   | Funder guideline input by paste or file upload                         |
| 5   | AI-powered plain-English summarisation of funder guidelines            |
| 6   | AI-powered draft answer generation for application questions           |
| 7   | Mandatory human review and approval before any content can be exported |
| 8   | Export of approved content to Word (.docx)                             |
| 9   | Full account and data deletion by the user                             |
| 10  | WCAG 2.2 Level AA accessibility                                        |
| 11  | UK-region data hosting                                                 |
| 12  | Basic passive usage metrics via database records                       |

### 3.2 Out of Scope for v1

Grant discovery, eligibility matching, grant tracking, post-grant reporting, EU/international grants, live grant databases, CRM integrations, open-ended AI chat, native mobile application, multi-region hosting, and formal survey infrastructure are all explicitly out of scope. Full detail in `business/v1-out-of-scope.md`.

### 3.3 MoSCoW Feature Priorities

| Priority        | Count | Functional requirements                                               |
| --------------- | ----- | --------------------------------------------------------------------- |
| Must Have       | 39    | FR-01 to FR-06, FR-09 to FR-28, FR-30, FR-32 to FR-37, FR-39 to FR-43 |
| Should Have     | 5     | FR-07, FR-08, FR-29, FR-38, FR-44                                     |
| Could Have      | 0     | --                                                                    |
| Won't Have (v1) | 0     | See `business/v1-out-of-scope.md`                                     |

The five Should Have requirements and their build conditions:

| Ref   | Requirement                          | Build condition                                           |
| ----- | ------------------------------------ | --------------------------------------------------------- |
| FR-07 | Optional MFA                         | Build if authentication roadmap supports it               |
| FR-08 | Feedback opt-in at registration      | Build if feedback interview programme confirmed at launch |
| FR-29 | Word limit input on draft generation | Build if time permits                                     |
| FR-38 | Plain text (.txt) export             | Build if time permits                                     |
| FR-44 | Deletion confirmation email          | Build if transactional email confirmed in scope           |

---

## 4. User Personas

Two primary personas are defined for v1. Both are volunteers or non-specialist staff at small or mid-size UK charities with no dedicated fundraising resource.

### 4.1 Margaret -- Volunteer Grant Writer

| Field                 | Detail                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| Role                  | Volunteer, 1-2 days per week                                                                                   |
| Charity               | Small community wellbeing charity, under £100k income                                                          |
| Location              | Market town, North of England                                                                                  |
| Technical environment | Personal Windows laptop, Google Chrome, no prior AI experience                                                 |
| Pain points           | Starts from scratch every time; confused by funder jargon; each application takes 2-3 days                     |
| Goals                 | Submit more applications in less time; build reusable content; feel confident the output is funder-appropriate |

### 4.2 David -- Overloaded Charity Manager

| Field                 | Detail                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Role                  | Charity Manager / Operations Manager                                                                                |
| Charity               | Youth services charity, £250k-£600k income                                                                          |
| Location              | Urban, Midlands                                                                                                     |
| Technical environment | Work Windows laptop, Chrome and Edge, has used ChatGPT                                                              |
| Pain points           | Adapts same content repeatedly for different funders; inconsistency across applications; no time to improve quality |
| Goals                 | Reduce time per application; achieve consistent language; submit stronger applications                              |

The product is designed for Margaret and David. A third persona (Priya -- a less experienced part-time administrator) should not be excluded but is not the primary design target for v1.

---

## 5. Information Architecture & Navigation

### 5.1 Design Principles

| Principle                | Application                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Minimal navigation       | Three primary nav items plus an account dropdown. Non-technical users should never feel lost                           |
| Auth-aware routing       | Every route is either public-only or authenticated-only                                                                |
| Focused application flow | The five-step journey lives within a single route. Steps are not separate nav pages                                    |
| Predictable redirects    | Authenticated users on public pages redirect to `/dashboard`. Unauthenticated users on protected pages redirect to `/` |
| No dead ends             | Every error state and confirmation page provides a clear next action                                                   |

### 5.2 Route Structure

**Public routes (unauthenticated only)**

| URL                | Page              | Purpose                                                 |
| ------------------ | ----------------- | ------------------------------------------------------- |
| `/`                | Sign In / Landing | Sign-in form; entry point for returning users           |
| `/register`        | Register          | New account creation                                    |
| `/verify-email`    | Verify Email      | Post-registration email confirmation (3 states)         |
| `/forgot-password` | Forgot Password   | Password reset request and new password form (2 states) |

**Authenticated routes (logged-in users only)**

| URL                  | Page             | Purpose                                              |
| -------------------- | ---------------- | ---------------------------------------------------- |
| `/dashboard`         | My Applications  | View all saved applications; start new application   |
| `/applications/new`  | New Application  | Step 1 of application flow (new application)         |
| `/applications/[id]` | Application      | Steps 1-5 of application flow (existing application) |
| `/profile`           | Charity Profile  | View, create, and edit charity profile               |
| `/account`           | Account Settings | Change password; access account deletion             |
| `/account/delete`    | Delete Account   | Deletion confirmation screen                         |

### 5.3 Access Control & Redirects

| Scenario                                                        | Behaviour                             |
| --------------------------------------------------------------- | ------------------------------------- |
| Authenticated user visits a public route                        | Redirected to `/dashboard`            |
| Unauthenticated user visits an authenticated route              | Redirected to `/`                     |
| User visits `/applications/[id]` for another user's application | Redirected to `/dashboard`            |
| Session expires while on a protected page                       | Redirected to `/` on next interaction |

### 5.4 Navigation Bar -- Unauthenticated

Displayed on all public routes.

| Element                   | Behaviour                        |
| ------------------------- | -------------------------------- |
| Grant Pathway logo (left) | No link -- stays on current page |
| Sign in                   | Links to `/`                     |
| Register                  | Links to `/register`             |

### 5.5 Navigation Bar -- Authenticated

Displayed on all authenticated routes.

| Element                                  | Behaviour                                          |
| ---------------------------------------- | -------------------------------------------------- |
| Grant Pathway logo (left)                | Links to `/dashboard`                              |
| My Applications                          | Links to `/dashboard`                              |
| Charity Profile                          | Links to `/profile`                                |
| Account (right, shows user's first name) | Dropdown: Account Settings (`/account`) / Sign Out |

### 5.6 Global Footer

Displayed on all routes.

| Element   | Detail                                               |
| --------- | ---------------------------------------------------- |
| Tagline   | "Your free grant writing companion for UK charities" |
| Links     | Privacy Policy \| Terms of Service                   |
| Copyright | (c) RapidGlobe Ltd [current year]                    |

### 5.7 Page Titles

| Page                                        | Browser tab title                              |
| ------------------------------------------- | ---------------------------------------------- |
| `/`                                         | Sign in -- Grant Pathway                       |
| `/register`                                 | Register -- Grant Pathway                      |
| `/verify-email`                             | Verify your email -- Grant Pathway             |
| `/forgot-password`                          | Reset your password -- Grant Pathway           |
| `/dashboard`                                | My Applications -- Grant Pathway               |
| `/applications/new` or `/applications/[id]` | [Grant name] -- [Funder name] -- Grant Pathway |
| `/profile`                                  | Charity Profile -- Grant Pathway               |
| `/account`                                  | Account Settings -- Grant Pathway              |
| `/account/delete`                           | Delete Account -- Grant Pathway                |

---

## 6. Functional Requirements

Requirements are grouped by the nine functional areas defined in the BRD. Each requirement states its MoSCoW priority. Should Have requirements are only built if their stated build condition is met.

Full testable acceptance criteria for all requirements are in `business/PRD inputs/acceptance-criteria.md`.

---

### 6.1 Authentication & Accounts

| Ref   | Requirement                                                                                                                                                                                          | Priority    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| FR-01 | The system shall allow new users to register with their full name, email address, and a password                                                                                                     | Must Have   |
| FR-02 | The system shall validate email format and enforce a minimum password length of 10 characters at registration                                                                                        | Must Have   |
| FR-03 | The system shall send a verification email upon registration; accounts shall not be activated until the email link is clicked                                                                        | Must Have   |
| FR-04 | The system shall allow registered users to log in with their email address and password                                                                                                              | Must Have   |
| FR-05 | The system shall provide a self-service password reset flow triggered by email                                                                                                                       | Must Have   |
| FR-06 | The system shall automatically log out users after 60 minutes of inactivity                                                                                                                          | Must Have   |
| FR-07 | The system shall provide optional MFA as an opt-in feature; MFA shall not be mandatory in v1                                                                                                         | Should Have |
| FR-08 | During registration, the system shall present a plain-language prompt asking the user if they are willing to participate in a feedback interview; the response shall be recorded against the account | Should Have |

**Implementation notes:**

- Password policy follows NCSC guidance: 10-character minimum length only, no mandatory complexity rules
- Email verification link expires after 24 hours. Resend is rate-limited to 3 per hour
- Password reset link expires after 1 hour
- Sign-in errors must never confirm whether an email address is registered (same message for wrong password and unknown email)
- Password reset requests must never confirm whether an email address is registered (same message regardless)
- FR-08 opt-in checkbox is omitted entirely from the registration screen if FR-08 is not built

---

### 6.2 Charity Profile

| Ref   | Requirement                                                                                                                                               | Priority  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-09 | Following account activation, the system shall prompt the user to set up their charity profile                                                            | Must Have |
| FR-10 | The system shall query the Charity Commission for England and Wales public API and pre-fill charity details on a successful match                         | Must Have |
| FR-11 | Where the Charity Commission API is unavailable or the charity is not found, the system shall allow manual entry and display a plain-language explanation | Must Have |
| FR-12 | The charity profile shall include the defined set of fields                                                                                               | Must Have |
| FR-13 | The system shall allow users to update their charity profile at any time                                                                                  | Must Have |
| FR-14 | The charity profile shall be used as an input to all AI-generated content                                                                                 | Must Have |

**Charity profile fields:**

| Field                   | Label shown to user           | Required | Notes                                           |
| ----------------------- | ----------------------------- | -------- | ----------------------------------------------- |
| Charity name            | "Charity name"                | Yes      | Pre-populated on Charity Commission match       |
| Registration number     | "Charity registration number" | No       | Optional; may be blank for exempt charities     |
| What the charity does   | "What does your charity do?"  | Yes      | Combines charitable objects and main activities |
| Who the charity helps   | "Who does your charity help?" | Yes      | Beneficiary description                         |
| Where the charity works | "Where do you work?"          | Yes      | Geographic area of operation                    |

**Implementation notes:**

- The dashboard shows a profile incomplete banner whenever the profile has not been fully saved. The banner is shown whether the profile has never been started or has been partially completed
- The "Start your first application" button on the dashboard is disabled until the charity profile is fully saved
- On first save, a success message is shown on the profile page. The user is not automatically redirected
- Annual income band was considered and removed from the field set
- Charitable objects and main activities have been merged into the single "What does your charity do?" field

---

### 6.3 Application Management

| Ref   | Requirement                                                                                                                       | Priority  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-15 | The system shall allow a user to create a new grant application by entering the grant name and funder name                        | Must Have |
| FR-16 | The system shall display all saved applications on the user dashboard with grant name, funder name, status, and date last updated | Must Have |
| FR-17 | The system shall allow a user to open and continue any saved application from their dashboard                                     | Must Have |
| FR-18 | The system shall auto-save application progress; save also occurs on every Continue action                                        | Must Have |
| FR-19 | The system shall allow a user to delete a saved application                                                                       | Must Have |
| FR-20 | A single user account shall support multiple saved applications simultaneously                                                    | Must Have |

**Implementation notes:**

- Auto-save runs silently every 60 seconds in the background with no visible indicator
- Save also occurs on every Continue action (step advance)
- A returning user is taken directly to the step they last reached, not to Step 1
- Dashboard application cards are sorted by most recently updated, descending
- The summary strip on the dashboard always shows all four status counts, even when some are zero
- The application deadline field mentioned in the BRD is not included in v1

---

### 6.4 Funder Guideline Handling

| Ref   | Requirement                                                                                                                             | Priority  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-21 | The system shall allow users to input funder guidelines by pasting text or uploading a PDF or .docx file                                | Must Have |
| FR-22 | Funder guidelines shall be used for AI processing only and shall not be permanently stored                                              | Must Have |
| FR-23 | The system shall display a plain-language error if an unsupported file format is uploaded and prompt the user to paste the text instead | Must Have |

**File upload rules:**

| Rule                   | Detail                                     |
| ---------------------- | ------------------------------------------ |
| Accepted formats       | PDF (.pdf) and Microsoft Word (.docx) only |
| Maximum file size      | 10 MB                                      |
| Large document warning | Shown when document exceeds 100,000 tokens |

**File error messages:**

| Scenario            | Message                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Wrong format        | "We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."                           |
| File too large      | "Your file is over 10MB. Please upload a smaller file or paste the text directly."                                                 |
| Scanned / image PDF | "We couldn't read the text in your PDF -- it may be a scanned document. Please try copying and pasting the text directly instead." |

**Implementation note:** Vercel free tier has a 4.5 MB API route limit. A 10 MB file upload requires either Vercel Pro or a client-side upload direct to Supabase Storage, bypassing the API route entirely. This is a pre-development technical decision.

---

### 6.5 AI Guideline Summarisation

| Ref   | Requirement                                                                                                                  | Priority  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-24 | On advancing to Step 3, the system shall generate a plain-English summary of the funder's guidelines                         | Must Have |
| FR-25 | AI summarisation shall use both the funder guidelines and the charity profile as inputs                                      | Must Have |
| FR-26 | The system shall display a visible staged progress indicator while AI processing is underway                                 | Must Have |
| FR-27 | In the event of an API error or timeout, the system shall display a plain-language error message and allow the user to retry | Must Have |

**Summary content areas:**

- What the grant is for
- Grant amount (if stated)
- Who can apply (eligible organisations)
- What the funder is looking for (priorities and project types)
- Key evidence expectations
- Each application question explained in plain English

**Progress indicator messages (Step 3):**

1. "Reading your funder guidelines..."
2. "Almost there..."

**API error message (Step 3):** "We couldn't generate your summary right now. This is usually temporary -- please try again." with a Try again button.

---

### 6.6 AI Draft Answer Generation

| Ref   | Requirement                                                                                                                      | Priority    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| FR-28 | On advancing to Step 4, the system shall generate a draft answer for each extracted application question                         | Must Have   |
| FR-29 | Before generating a draft, the user shall be able to specify a word limit for the answer                                         | Should Have |
| FR-30 | AI draft generation shall use the application question, word limit (if specified), funder summary, and charity profile as inputs | Must Have   |
| FR-31 | If the generated draft significantly exceeds the specified word limit, the system shall flag this prominently                    | Should Have |

**Progress indicator messages (Step 4):**

1. "Reviewing your guidelines and charity profile..."
2. "Writing your draft answers..."
3. "Almost there..."

**Monthly AI request limit (PDR-AI-005):**

| Threshold                     | Action                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 16 of 20 requests used (80%)  | Soft warning banner: "You've used most of your monthly AI allowance."                                                              |
| 20 of 20 requests used (100%) | Generation blocked. Message: "You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch." |

Each summarisation (including regeneration) and each draft generation (including regeneration) counts as one AI request. Monthly limit resets on the first day of the calendar month.

**API error message (Step 4):** "We couldn't generate your draft right now. This is usually temporary -- please try again." with a Try again button.

---

### 6.7 Mandatory Review & Approval

| Ref   | Requirement                                                                                                  | Priority  |
| ----- | ------------------------------------------------------------------------------------------------------------ | --------- |
| FR-32 | Every draft shall be presented alongside three plain-language review prompts                                 | Must Have |
| FR-33 | The system shall require explicit user approval before content can be exported; this step cannot be bypassed | Must Have |
| FR-34 | The user shall be able to edit draft text directly within the review interface                               | Must Have |
| FR-35 | The user shall be able to discard a draft and regenerate or write their own answer                           | Must Have |
| FR-36 | Approved content shall be visually marked as approved and saved to the application record                    | Must Have |

**Three review prompts (displayed on Step 5):**

1. Does this accurately describe your charity and project?
2. Are all figures, dates, and facts correct?
3. Does this answer the question that was asked?

**Approval confirmation prompt:** "Are you sure you want to approve this application? You can re-open it to make changes at any time."

**Re-opening prompt (shown when opening an approved or exported application):** "Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."

---

### 6.8 Export

| Ref   | Requirement                                                                                  | Priority    |
| ----- | -------------------------------------------------------------------------------------------- | ----------- |
| FR-37 | The system shall allow users to export all approved content as a Microsoft Word (.docx) file | Must Have   |
| FR-38 | The system shall allow users to export all approved content as a plain text (.txt) file      | Should Have |
| FR-39 | The system shall prevent export where no content has been approved                           | Must Have   |

**Exported Word document structure (PDR-DH-003):**

| Element        | Detail                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------- |
| Document title | Grant name                                                                                   |
| Funder         | Funder name                                                                                  |
| Date exported  | Date of export, formatted DD Month YYYY                                                      |
| AI disclaimer  | Plain-language statement that content was AI-assisted and has been reviewed by the applicant |
| Q&A body       | Each question as a heading, followed by its approved answer                                  |
| Footer         | "Prepared using Grant Pathway v[version number] -- grantpathway.org.uk"                      |

**Re-export warning (shown when downloading an already-exported application):**

"You exported this application on [date]. If you have already submitted that version to the funder, please contact them to let them know a revised version is being submitted. Funders may treat multiple submissions as separate applications."

Actions: Download anyway / Cancel

---

### 6.9 Account Deletion

| Ref   | Requirement                                                                                                        | Priority    |
| ----- | ------------------------------------------------------------------------------------------------------------------ | ----------- |
| FR-40 | The system shall allow users to permanently delete their account from Account Settings                             | Must Have   |
| FR-41 | Before deletion, the system shall display a plain-language warning explaining all data will be permanently deleted | Must Have   |
| FR-42 | The user shall be required to type DELETE (uppercase, case-sensitive) to confirm deletion                          | Must Have   |
| FR-43 | On confirmation, the system shall permanently delete all data associated with the account                          | Must Have   |
| FR-44 | The system shall send a confirmation email to the user once deletion is complete                                   | Should Have |

**Data deleted on confirmation:**

- User account and login credentials
- Charity profile
- All saved applications and their content (draft and approved answers)
- AI usage records

**Post-deletion behaviour:**

1. All data permanently deleted
2. User session ended immediately
3. User redirected to `/` with message: "Your account has been deleted."
4. Confirmation email sent (Email 5) if FR-44 is implemented

**Implementation note:** The BRD specified re-entering the email address as the confirmation mechanism. The screen requirements supersede this -- the implemented confirmation is typing the word DELETE (uppercase, exact match, case-sensitive).

---

## 7. Screen Specifications

This section defines the content, fields, validation rules, error states, and post-submission behaviour for each of the nine screens. Full detail is also held in `business/PRD inputs/screen-requirements.md`.

---

### Screen 1 -- Sign In / Landing

**URL:** `/` | **Auth:** Unauthenticated only

| Element         | Detail                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------- |
| Tagline         | "Your free grant writing companion for UK charities" -- displayed prominently below logo |
| Email address   | Text input, required                                                                     |
| Password        | Password input, required, show/hide toggle                                               |
| Forgot password | Link below password field, right-aligned -- links to `/forgot-password`                  |
| Sign in button  | Primary action, teal, full width                                                         |
| Register prompt | "New to Grant Pathway? Register for free" -- links to `/register`                        |

**Validation and error states:**

| Scenario              | Message                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Empty email           | "Please enter a valid email address"                                                      |
| Empty password        | "Please enter your password"                                                              |
| Incorrect credentials | "Your email address or password is incorrect. Please try again."                          |
| Email not verified    | "Please verify your email address before signing in." with Resend verification email link |
| Email not registered  | Same as incorrect credentials (do not reveal whether email is registered)                 |

---

### Screen 2 -- Register

**URL:** `/register` | **Auth:** Unauthenticated only

| Element               | Detail                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading          | "Create your free account"                                                                                                                                       |
| First name            | Text input, required                                                                                                                                             |
| Last name             | Text input, required                                                                                                                                             |
| Email address         | Text input, required                                                                                                                                             |
| Password              | Password input, required, show/hide toggle                                                                                                                       |
| Password confirmation | Password input, required, show/hide toggle                                                                                                                       |
| Terms checkbox        | "I have read and agree to the [Terms of Service] and [Privacy Policy]" -- both links open in new tab -- required                                                 |
| Feedback opt-in       | "I'm happy to be contacted occasionally to share feedback about Grant Pathway" -- optional, unchecked by default (FR-08, Should Have -- omit if FR-08 not built) |
| Create account button | Primary action, teal, full width                                                                                                                                 |
| Sign in prompt        | "Already have an account? Sign in" -- links to `/`                                                                                                               |

**Validation:**

| Field                 | Rule                            | Error message                                                       |
| --------------------- | ------------------------------- | ------------------------------------------------------------------- |
| First name            | Required                        | "Please enter your first name"                                      |
| Last name             | Required                        | "Please enter your last name"                                       |
| Email                 | Required, valid format          | "Please enter a valid email address"                                |
| Email                 | Not already registered          | "An account with this email address already exists"                 |
| Password              | Required, minimum 10 characters | "Your password must be at least 10 characters"                      |
| Password confirmation | Must match password             | "Your passwords do not match"                                       |
| Terms checkbox        | Must be checked                 | "Please accept the Terms of Service and Privacy Policy to continue" |

**On success:** Account created, Email 1 sent, user redirected to `/verify-email`.

---

### Screen 3 -- Verify Email

**URL:** `/verify-email` | **Auth:** Unauthenticated only

**State 1 -- Awaiting verification:**

| Element            | Detail                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Heading            | "Check your email"                                                                                         |
| Message            | "We've sent a verification link to [email address]. Click the link in the email to activate your account." |
| Resend button      | "Resend verification email" -- rate-limited to 3 per hour                                                  |
| Wrong email prompt | "Wrong email address? [Sign in with a different account]" -- links to `/`                                  |

**State 2 -- Verified (link clicked, valid):**

| Element | Detail                                           |
| ------- | ------------------------------------------------ |
| Heading | "Email verified"                                 |
| Message | "Your account is now active. Let's get started." |
| Button  | "Go to my dashboard" -- links to `/dashboard`    |

**State 3 -- Link expired or invalid:**

| Element | Detail                                                                |
| ------- | --------------------------------------------------------------------- |
| Heading | "This link has expired"                                               |
| Message | "Your verification link is no longer valid. Request a new one below." |
| Button  | "Send a new verification email" -- primary action                     |

---

### Screen 4 -- Forgot Password

**URL:** `/forgot-password` | **Auth:** Unauthenticated only

**State 1 -- Reset request form:**

| Element       | Detail                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| Heading       | "Reset your password"                                                       |
| Instruction   | "Enter the email address for your account and we'll send you a reset link." |
| Email address | Text input, required                                                        |
| Send button   | "Send reset link" -- primary action, teal, full width                       |

On submission (regardless of whether email is registered): "If an account exists for that email address, you'll receive a reset link shortly. Check your spam folder if it doesn't arrive within a few minutes."

**State 2 -- New password form (valid reset link):**

| Element              | Detail                                                  |
| -------------------- | ------------------------------------------------------- |
| Heading              | "Choose a new password"                                 |
| New password         | Password input, required, show/hide toggle              |
| Confirm new password | Password input, required, show/hide toggle              |
| Save button          | "Save new password" -- primary action, teal, full width |

**Validation (State 2):**

| Field                | Rule                            | Error message                                  |
| -------------------- | ------------------------------- | ---------------------------------------------- |
| New password         | Required, minimum 10 characters | "Your password must be at least 10 characters" |
| Confirm new password | Must match                      | "Your passwords do not match"                  |

On success: "Your password has been updated." with Sign in button. On expired link: "This reset link has expired. Please request a new one." with link back to State 1.

---

### Screen 5 -- Dashboard

**URL:** `/dashboard` | **Auth:** Authenticated only

**Profile incomplete banner** (shown whenever charity profile not fully saved, in both states):

> "Before you start, add your charity details -- we'll use these to personalise your applications."
> [Set up charity profile] button -- links to `/profile`

**State 1 -- Empty (no applications):**

| Element              | Detail                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Heading              | "Welcome to Grant Pathway, [first name]"                                                                               |
| Empty state message  | "You don't have any applications yet."                                                                                 |
| Start button         | "Start your first application" -- disabled if profile incomplete (tooltip: "Please set up your charity profile first") |
| Three-step explainer | "1. Add funder guidelines" / "2. Get an AI summary" / "3. Generate your draft"                                         |

**State 2 -- Populated (one or more applications):**

| Element                | Detail                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| Heading                | "My Applications"                                                                                              |
| Summary strip          | "[n] applications -- [n] not started . [n] in progress . [n] approved . [n] exported" -- all four always shown |
| New application button | "+ New Application" -- primary, teal, top right                                                                |

**Application card contents:**

| Element                | Detail                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| Funder name            | Bold, prominent                                                                                   |
| Grant name             | Below funder name                                                                                 |
| Status label           | Colour-coded pill: Not started (slate) / In progress (amber) / Approved (green) / Exported (teal) |
| Last updated           | "Last updated [DD Month YYYY]"                                                                    |
| Continue / View button | "Continue" for Not started and In progress; "View" for Approved and Exported                      |
| Delete button          | Red text link -- triggers confirmation prompt per application status model                        |

---

### Screen 6 -- Charity Profile

**URL:** `/profile` | **Auth:** Authenticated only

| State            | Heading                       | Save button    |
| ---------------- | ----------------------------- | -------------- |
| First-time setup | "Set up your charity profile" | "Save profile" |
| Editing existing | "Your charity profile"        | "Save changes" |

**Fields:**

| Field                     | Label                         | Type          | Required | Placeholder                                                                                                |
| ------------------------- | ----------------------------- | ------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| Charity name              | "Charity name"                | Text          | Yes      | Pre-populated on lookup match                                                                              |
| Registration number       | "Charity registration number" | Text          | No       | Pre-populated on lookup match                                                                              |
| Charity Commission lookup | --                            | Search button | --       | Searches by name or number                                                                                 |
| What the charity does     | "What does your charity do?"  | Textarea      | Yes      | "e.g. We support elderly people living alone in rural areas by providing companionship and practical help" |
| Who the charity helps     | "Who does your charity help?" | Textarea      | Yes      | "e.g. Adults aged 65 and over living in North Yorkshire"                                                   |
| Where the charity works   | "Where do you work?"          | Text          | Yes      | "e.g. South Yorkshire, or National"                                                                        |

**Charity Commission lookup outcomes:**

| Scenario        | Message                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| Match found     | Fields pre-populated. "Details retrieved from the Charity Commission register." User may edit |
| No match        | "We couldn't find that charity. Please enter your details manually."                          |
| API unavailable | "We couldn't reach the Charity Commission right now. Please enter your details manually."     |

**Post-save behaviour:**

| Scenario           | Behaviour                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First-time save    | Success message on profile page: "Your charity profile has been saved. You're ready to start your first application." with Go to my dashboard button. User stays on `/profile` |
| Edit save          | "Your changes have been saved." User stays on `/profile`                                                                                                                       |
| Validation failure | Inline errors shown; form data preserved                                                                                                                                       |

---

### Screen 7 -- Application Flow

**URLs:** `/applications/new` (new) and `/applications/[id]` (existing) | **Auth:** Authenticated only

A five-step flow with a step indicator at the top showing all five steps at all times. Current step is highlighted. Indicator is read-only.

**Auto-save:** On every Continue action and silently every 60 seconds in the background.

---

**Step 1 -- Application Details**

| Element     | Detail                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Heading     | "Start a new application"                                                                                |
| Funder name | Text, required. Label: "Who is offering this grant?" Placeholder: "e.g. National Lottery Community Fund" |
| Grant name  | Text, required. Label: "What is the grant called?" Placeholder: "e.g. Awards for All England"            |
| Continue    | Creates application record (`not_started`), advances to Step 2                                           |
| Cancel      | Returns to `/dashboard` -- no record created                                                             |

**Validation:** Funder name: "Please enter the funder's name" / Grant name: "Please enter the grant name"

---

**Step 2 -- Funder Guidelines**

| Element                | Detail                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| Heading                | "Add the funder's guidelines"                                      |
| File upload            | PDF and .docx only, max 10 MB, drag-and-drop or click to browse    |
| Paste textarea         | Label: "Or paste the guidelines text here"                         |
| Large document warning | Shown if guidelines exceed 100,000 tokens                          |
| Continue               | Saves guidelines, sets status to `in_progress`, advances to Step 3 |
| Back                   | Returns to Step 1                                                  |

---

**Step 3 -- AI Summary**

| Element             | Detail                                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading             | "Your funder guidelines -- summary"                                                                                                                      |
| Progress            | "Reading your funder guidelines..." then "Almost there..."                                                                                               |
| Summary content     | AI-generated plain-English digest: what the grant is for, who can apply, funder priorities, evidence expectations, extracted questions with explanations |
| Questions found     | "We found [n] application questions in these guidelines. We'll use these to generate your draft answers in the next step."                               |
| Questions not found | "We couldn't identify specific application questions in this document. In the next step, you'll be able to enter your questions manually."               |
| Regenerate          | "Regenerate summary" -- secondary action, counts as one AI request                                                                                       |
| Continue            | "This looks right -- continue" -- advances to Step 4                                                                                                     |
| Back                | Returns to Step 2                                                                                                                                        |
| API failure         | "We couldn't generate your summary right now. This is usually temporary -- please try again." with Try again button                                      |

---

**Step 4 -- Draft Answers**

| Element       | Detail                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Heading       | "Your draft answers"                                                                                                                       |
| Progress      | "Reviewing your guidelines and charity profile..." then "Writing your draft answers..." then "Almost there..."                             |
| Draft content | Each question as bold heading; AI-generated answer in editable textarea below                                                              |
| Manual entry  | If no questions extracted in Step 3, user sees manual question entry field                                                                 |
| Regenerate    | "Regenerate all answers" -- secondary action, counts as one AI request                                                                     |
| Continue      | "I've reviewed my answers -- continue" -- advances to Step 5                                                                               |
| Back          | Returns to Step 3                                                                                                                          |
| API failure   | "We couldn't generate your draft right now. This is usually temporary -- please try again." with Try again button                          |
| Usage warning | "You've used most of your monthly AI allowance." (at 80% of limit)                                                                         |
| Limit reached | "You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch." Generate/regenerate buttons disabled |

---

**Step 5 -- Approve & Export**

| Element           | Detail                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Heading           | "Review and approve your application"                                                                   |
| Content           | Read-only view of all questions and answers                                                             |
| Review prompts    | Three prompts displayed before approval action (see Section 6.7)                                        |
| Approve button    | "Approve my application" -- sets status to `approved`. Requires confirmation prompt                     |
| Export button     | "Download as Word document" -- enabled after approval only. Sets status to `exported` on first download |
| Re-export warning | Shown if previously exported (see Section 6.8 for wording)                                              |
| Back              | Returns to Step 4                                                                                       |

---

### Screen 8 -- Account Settings

**URL:** `/account` | **Auth:** Authenticated only

| Element                 | Detail                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                 | "Account settings"                                                                                                                           |
| Email                   | Read-only display: "Your email address: [email]" -- no change facility in v1                                                                 |
| Change password heading | "Change your password"                                                                                                                       |
| Current password        | Password input, required, show/hide toggle                                                                                                   |
| New password            | Password input, required, show/hide toggle                                                                                                   |
| Confirm new password    | Password input, required, show/hide toggle                                                                                                   |
| Update password button  | "Update password" -- primary, teal                                                                                                           |
| Delete account heading  | "Delete your account"                                                                                                                        |
| Delete warning          | "Deleting your account will permanently remove all your data, including your charity profile and saved applications. This cannot be undone." |
| Delete button           | "Delete my account" -- destructive, red -- links to `/account/delete`                                                                        |

**Password change validation:**

| Field                | Rule                                 | Error                                          |
| -------------------- | ------------------------------------ | ---------------------------------------------- |
| Current password     | Required, must match stored password | "Your current password is incorrect"           |
| New password         | Required, minimum 10 characters      | "Your password must be at least 10 characters" |
| Confirm new password | Must match new password              | "Your passwords do not match"                  |

On success: "Your password has been updated." Form fields cleared.

---

### Screen 9 -- Account Deletion Confirmation

**URL:** `/account/delete` | **Auth:** Authenticated only (accessible via `/account` only)

| Element            | Detail                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading            | "Delete your account"                                                                                                                                           |
| Warning            | "This will permanently delete your account and all associated data, including your charity profile and all saved applications. This cannot be undone."          |
| Data summary       | List of what will be deleted: Your account and login details / Your charity profile / All saved applications and draft answers / Any uploaded funder guidelines |
| Confirmation input | Text input -- user must type DELETE. Label: "Type DELETE to confirm"                                                                                            |
| Delete button      | "Permanently delete my account" -- destructive, red -- disabled until DELETE typed exactly (case-sensitive)                                                     |
| Cancel             | "Cancel" -- returns to `/account` with no changes                                                                                                               |

**Post-deletion:** All data deleted, session ended, redirected to `/` with "Your account has been deleted."

---

## 8. Application Status Model

### 8.1 Statuses

| Status        | Display label | Meaning                                             |
| ------------- | ------------- | --------------------------------------------------- |
| `not_started` | Not started   | Application record created; no guidelines added yet |
| `in_progress` | In progress   | Guidelines added; user is working through the flow  |
| `approved`    | Approved      | User has reviewed and formally approved all content |
| `exported`    | Exported      | Approved content has been downloaded at least once  |

### 8.2 Transition Rules

| From          | To            | Trigger                                         |
| ------------- | ------------- | ----------------------------------------------- |
| `not_started` | `in_progress` | User saves funder guidelines on Step 2          |
| `in_progress` | `approved`    | User approves application on Step 5             |
| `approved`    | `exported`    | User downloads Word document for the first time |
| `approved`    | `in_progress` | User re-opens approved application for editing  |
| `exported`    | `in_progress` | User re-opens exported application for editing  |

### 8.3 Deletion Confirmation Prompts

| Status        | Confirmation prompt                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not_started` | "Are you sure you want to delete this application? This cannot be undone."                                                                              |
| `in_progress` | "Are you sure you want to delete this application? This cannot be undone."                                                                              |
| `approved`    | "Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."                          |
| `exported`    | "Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document." |

### 8.4 Dashboard Status Colours

| Status      | Colour          |
| ----------- | --------------- |
| Not started | Slate (#1E293B) |
| In progress | Amber (#D97706) |
| Approved    | Green (#16A34A) |
| Exported    | Teal (#0D6E6E)  |

---

## 9. Data Requirements

All data is stored in PostgreSQL via Supabase (London region). Authentication is managed by Supabase Auth. No persistent data is held at the application layer. Full field-level detail is in `business/data-model.md`.

### 9.1 Entities

| Entity                | Type              | Purpose                                                    |
| --------------------- | ----------------- | ---------------------------------------------------------- |
| `auth.users`          | Supabase Auth     | Authentication credentials and email verification          |
| `user_profiles`       | Application table | First name, last name, feedback consent                    |
| `charity_profiles`    | Application table | Charity organisational information used as AI context      |
| `applications`        | Application table | Application records with status and step tracking          |
| `application_answers` | Application table | Question and answer pairs per application                  |
| `ai_usage_log`        | Application table | Per-user AI request tracking for monthly limit enforcement |

### 9.2 Relationships

| Relationship                       | Cardinality |
| ---------------------------------- | ----------- |
| User to user_profile               | One-to-one  |
| User to charity_profile            | One-to-one  |
| User to applications               | One-to-many |
| Application to application_answers | One-to-many |
| User to ai_usage_log               | One-to-many |

### 9.3 Data Not Stored

| Item                                       | Reason                                                 |
| ------------------------------------------ | ------------------------------------------------------ |
| Funder guidelines (file or text)           | Used for AI processing within the session only (FR-22) |
| Raw AI prompts                             | Held in `lib/prompts.ts` in the codebase               |
| Raw API responses beyond extracted outputs | Only processed outputs are stored                      |
| Beneficiary personal data                  | Out of scope                                           |

### 9.4 Data Retention

| Event                | Action                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| User account active  | All data retained                                                                             |
| 23 months no login   | Inactivity warning email sent (Email 3)                                                       |
| 24 months no login   | All user data permanently deleted; confirmation email sent (Email 4)                          |
| User deletes account | All user data permanently deleted immediately; confirmation email sent (Email 5, Should Have) |

---

## 10. AI Integration

### 10.1 Model

| Setting       | Value                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Provider      | Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2, In-Region)                                                       |
| Model         | claude-sonnet-4-6 (Bedrock model ID: `anthropic.claude-sonnet-4-6`)                                                         |
| Configuration | Referenced via a named config constant in `lib/prompts.ts` -- not hardcoded -- to allow easy swapping without a code search |

### 10.2 Prompt Strategy

All AI prompts are centralised in a single file: `lib/prompts.ts`. Prompts are version-controlled alongside the codebase. Changes to prompts are deployed via standard Vercel deployment (under 2 minutes). No database storage of prompts is required.

Two prompt types are defined:

| Type                | Used at | Inputs                                                                                   |
| ------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `guideline_summary` | Step 3  | Funder guidelines text + charity profile                                                 |
| `draft_generation`  | Step 4  | Application question(s) + funder summary + charity profile + word limit (if FR-29 built) |

### 10.3 Processing Mode

AI requests are batch (not streaming). Staged progress indicator messages are shown to the user while the request is in flight. The Continue button is unavailable until processing is complete.

### 10.4 Context Window Management

If the funder guidelines document exceeds 100,000 tokens, a soft warning is displayed to the user before proceeding:

> "Your guidelines document is quite long. For the best results, we recommend uploading only the core sections -- such as eligibility criteria, application questions, and assessment criteria. Very long documents may reduce the quality of your AI summary."

The user may proceed with the full document. The warning is informational only.

### 10.5 Cost Controls

| Control                | Detail                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Per-user monthly limit | 20 AI requests per user per calendar month                                                    |
| Warning threshold      | Soft warning shown at 16 requests (80%)                                                       |
| Hard limit             | AI generation blocked at 20 requests                                                          |
| Monitoring             | Usage tracked in `ai_usage_log` table; Amazon Bedrock / AWS console spend cap set as backstop |
| Monthly target         | Under £100/month total API spend (C1)                                                         |

### 10.6 Error Handling

| Scenario                          | User-facing behaviour                                                            |
| --------------------------------- | -------------------------------------------------------------------------------- |
| API error or timeout (Step 3)     | Progress indicator replaced with error message and Try again button              |
| API error or timeout (Step 4)     | Progress indicator replaced with error message and Try again button              |
| Monthly limit reached             | Generate/regenerate buttons disabled; limit message shown                        |
| No manual fallback for AI failure | Users cannot manually trigger alternative processing -- retry is the only option |

---

## 11. Email Notifications

All emails are sent from `noreply@grantpathway.org.uk` with display name "Grant Pathway". Emails 1 and 2 are handled by Supabase Auth. Emails 3, 4, and 5 are handled by the application's transactional email service.

| #   | Email                            | Trigger                           | Handled by                | Expiry   |
| --- | -------------------------------- | --------------------------------- | ------------------------- | -------- |
| 1   | Email Verification               | User submits registration form    | Supabase Auth             | 24 hours |
| 2   | Password Reset                   | User submits Forgot Password form | Supabase Auth             | 1 hour   |
| 3   | Inactivity Warning               | 23 consecutive months no login    | Application scheduled job | --       |
| 4   | Account Deleted (inactivity)     | 24 months no login                | Application scheduled job | --       |
| 5   | Account Deleted (user initiated) | User completes deletion flow      | Application               | --       |

### Email 1 -- Email Verification

**Subject:** Verify your Grant Pathway email address

Body: Hi [First name], Thanks for signing up to Grant Pathway. Please verify your email address to activate your account. [Verify my email address] button. Link expires in 24 hours. If you did not create a Grant Pathway account, you can ignore this email.

### Email 2 -- Password Reset

**Subject:** Reset your Grant Pathway password

Body: Hi [First name], We received a request to reset your password. Click the link below to choose a new one. [Reset my password] button. Link expires in 1 hour. If you did not request a password reset, please ignore this email -- your account is safe.

### Email 3 -- Inactivity Warning

**Subject:** Your Grant Pathway account will be deleted in 30 days

Body: Hi [First name], We noticed you haven't logged in to Grant Pathway for a while. To keep your account and any saved applications, simply log in before [deletion date -- 30 days from send]. [Log in to Grant Pathway] button. If we don't hear from you, your account and all associated data will be permanently deleted on [deletion date]. This cannot be undone.

Deletion date shown as DD Month YYYY. Only one inactivity warning is sent per inactivity cycle.

### Email 4 -- Account Deleted (Inactivity)

**Subject:** Your Grant Pathway account has been deleted

Body: Hi [First name], As we mentioned in our previous email, your Grant Pathway account has now been deleted due to inactivity. All data has been permanently removed. If you'd like to use Grant Pathway in the future, you're welcome to register again at any time. [Register a new account] button.

### Email 5 -- Account Deleted (User Initiated) -- Should Have

**Subject:** Your Grant Pathway account has been deleted

Body: Hi [First name], This confirms that your Grant Pathway account has been permanently deleted, as you requested. All data has been removed. If you change your mind in the future, you're welcome to register again. [Register a new account] button. Thank you for using Grant Pathway. We hope it was useful.

Note: The subject line is identical to Email 4. A user will only ever receive one or the other, never both.

---

## 12. Non-Functional Requirements

### 12.1 Performance

| Metric                     | Target           |
| -------------------------- | ---------------- |
| Page loads and navigation  | Under 3 seconds  |
| AI guideline summarisation | Under 30 seconds |
| AI draft answer generation | Under 60 seconds |

### 12.2 Availability

| Metric                  | Target    |
| ----------------------- | --------- |
| Uptime                  | 99.5%     |
| Maximum annual downtime | ~44 hours |

### 12.3 Scalability

| Phase                               | Expected concurrent users |
| ----------------------------------- | ------------------------- |
| At launch                           | ~10                       |
| At scale (12-18 months post-launch) | ~100                      |

Architecture should scale from launch to 12-18 month target without a major rebuild. Managed cloud services are preferred.

### 12.4 Security

| Control               | Requirement                                                          |
| --------------------- | -------------------------------------------------------------------- |
| Encryption in transit | TLS 1.2 or higher; HTTPS enforced across all pages and API calls     |
| Encryption at rest    | Database-level encryption enabled on all data stores                 |
| Passwords             | Minimum 10 characters; no mandatory complexity rules (NCSC guidance) |
| MFA                   | Available as opt-in (FR-07, Should Have); not mandatory              |
| Session timeout       | Automatic logout after 60 minutes of inactivity                      |
| Security baseline     | OWASP Top 10                                                         |
| Secrets management    | No credentials or API keys committed to the public repository        |

### 12.5 Browser & Device Support

| Category             | Supported                                              |
| -------------------- | ------------------------------------------------------ |
| Desktop browsers     | Chrome, Edge, Firefox, Safari (latest 2 versions each) |
| Mobile browsers      | Chrome on Android; Safari on iOS                       |
| Minimum screen width | 320px                                                  |
| Internet Explorer    | Not supported                                          |

The application is designed desktop-primary (PDR-UI-003). It must remain usable on mobile browsers as a byproduct of responsive layout. Full mobile optimisation is deferred to a future phase.

### 12.6 Accessibility

- WCAG 2.2 Level AA from day one -- a design-in requirement, not a retrofit
- Testing: automated scanning (axe DevTools / Lighthouse), keyboard-only navigation testing, screen reader testing (NVDA + Chrome), manual WCAG 2.2 AA checklist pre-launch, colour contrast verification
- Independent third-party audit deferred to a pre-scaling milestone

---

## 13. Branding & Design

### 13.1 Technology

| Concern              | Choice                                                               |
| -------------------- | -------------------------------------------------------------------- |
| UI component library | shadcn/ui (built on Radix UI primitives + Tailwind CSS)              |
| Design approach      | Lightweight design-first for 6 key screens before build (PDR-UI-002) |

The 6 screens requiring lightweight design before build: dashboard, charity profile, guideline input, AI output review, export, account settings.

### 13.2 Colour Palette

| Role          | Colour      | Hex     |
| ------------- | ----------- | ------- |
| Primary       | Deep teal   | #0D6E6E |
| Primary light | Soft teal   | #E6F4F4 |
| Accent        | Warm amber  | #D97706 |
| Success       | Muted green | #16A34A |
| Neutral dark  | Slate       | #1E293B |
| Neutral light | Off-white   | #F8FAFC |
| White         | White       | #FFFFFF |

### 13.3 Typography

| Role              | Font  | Weight          | Minimum size |
| ----------------- | ----- | --------------- | ------------ |
| Headings          | Inter | Bold (700)      | 20px         |
| Sub-headings      | Inter | Semi-bold (600) | 16px         |
| Body text         | Inter | Regular (400)   | 16px         |
| Labels & captions | Inter | Medium (500)    | 14px         |

### 13.4 Tone of Voice

| Principle     | In practice                                          |
| ------------- | ---------------------------------------------------- |
| Plain English | "Here's a draft answer" not "AI-generated output"    |
| Encouraging   | Acknowledge the user is doing something valuable     |
| Honest        | Clear that this is a starting point requiring review |
| Respectful    | Non-patronising; charities know their work           |
| Concise       | Short sentences; active voice; no padding            |

---

## 14. Success Metrics

Full detail in `business/PRD inputs/success-metrics.md`. All metrics are derived from Supabase data records. No third-party analytics platform is included in v1.

### 14.1 Acquisition

| Metric                             | Target |
| ---------------------------------- | ------ |
| Registered users -- end of month 1 | 10     |
| Registered users -- end of month 2 | 40     |
| Registered users -- end of month 3 | 90     |

### 14.2 Activation

| Metric                                                 | Target |
| ------------------------------------------------------ | ------ |
| % registered users who complete charity profile        | 70%    |
| % registered users who create at least one application | 50%    |

### 14.3 Completion

| Metric                                            | Target |
| ------------------------------------------------- | ------ |
| % created applications that reach Exported status | 55%    |
| Total Word documents exported by end of month 6   | 100    |

The export completion rate is the single most important product metric.

### 14.4 Retention

| Metric                                       | Target |
| -------------------------------------------- | ------ |
| % users who log in more than once            | 50%    |
| % users who create more than one application | 30%    |

### 14.5 Operational

| Metric                                        | Target            |
| --------------------------------------------- | ----------------- |
| Monthly AI API spend                          | Within £100/month |
| Average AI requests per active user per month | Fewer than 10     |

### 14.6 User Feedback

| Metric                                                   | Target |
| -------------------------------------------------------- | ------ |
| % of interviewed users who would recommend Grant Pathway | 80%    |

Applies to users who opt in to feedback interviews (FR-08, Should Have). Deferred if FR-08 is not in v1 build.

---

## 15. Compliance & Pre-Launch Requirements

The following items are blocking -- the product cannot launch until all three are resolved.

| Item                         | Requirement                                                                                                                                                                                                                                                                            | Status          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| AWS Data Processing Addendum | Confirm that the AWS Data Processing Addendum covers Amazon Bedrock usage and satisfies UK GDPR obligations before launch. AI processing occurs within UK/EEA via Bedrock eu-west-2 (In-Region primary, EU Geo fallback) -- no international transfer or SCCs are required (DR-DP-002) | To be confirmed |
| Terms of Service             | Draft and publish Terms of Service before launch. Must state: Grant Pathway does not guarantee funding outcomes; does not submit applications on behalf of charities; makes no representations to funders                                                                              | To be drafted   |
| Privacy Policy               | Draft and publish Privacy Policy before launch. Must cover: data collected, Supabase London hosting, Vercel global edge, AI processing via Amazon Bedrock eu-west-2 (UK/EEA -- data does not leave UK/EEA), no-AI-training commitment, user rights, retention periods                  | To be drafted   |

A two-week compliance review window is reserved in the project timeline prior to the 31 July 2026 launch date.

---

## 16. Acceptance Criteria

Testable Given/When/Then acceptance criteria for all 44 functional requirements are defined in:

`business/PRD inputs/acceptance-criteria.md`

Criteria are organised by the same nine functional sections used in this document. Should Have requirements include criteria that apply only if the requirement is built.

---

## Appendix A -- Glossary

| Term                   | Definition                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS DPA                | AWS Data Processing Addendum -- governs how Amazon Web Services (including Bedrock) processes customer data, satisfying UK GDPR obligations |
| Charity Commission API | The public API provided by the Charity Commission for England and Wales, used to look up registered charity details                         |
| CIC                    | Community Interest Company -- the intended long-term legal structure for owning and operating Grant Pathway                                 |
| CVS                    | Council for Voluntary Service -- local infrastructure bodies that support charities and voluntary organisations                             |
| NCSC                   | National Cyber Security Centre -- source of UK password guidance referenced in NFR-04                                                       |
| OWASP Top 10           | Open Worldwide Application Security Project's list of the ten most critical web application security risks                                  |
| SCCs                   | Standard Contractual Clauses -- contractual mechanisms used to legitimise international data transfers under UK GDPR                        |
| WCAG 2.2 AA            | Web Content Accessibility Guidelines version 2.2, Level AA -- the accessibility standard the application must meet                          |
| shadcn/ui              | UI component library built on Radix UI primitives and Tailwind CSS -- the chosen component library for v1                                   |
| Supabase               | Managed PostgreSQL database and authentication service used for all data storage (London region)                                            |

---

## Appendix B -- Related Documents

| Document                            | Location                                              | Purpose                                                |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| Business Requirements Document      | `business/BRD-Grant-Pathway-v1.md`                    | Business context, constraints, risks, and stakeholders |
| Non-Functional Requirements         | `business/non-functional-requirements.md`             | Full NFR detail                                        |
| Data Model                          | `business/data-model.md`                              | Entity definitions, field-level detail, relationships  |
| MoSCoW Feature Register             | `business/moscow-feature-register.md`                 | Consolidated feature priorities and BRD divergences    |
| IA & Navigation                     | `business/information-architecture-and-navigation.md` | Route structure, nav components, user flows            |
| Screen Requirements                 | `business/PRD inputs/screen-requirements.md`          | Full screen-level field and validation detail          |
| Acceptance Criteria                 | `business/PRD inputs/acceptance-criteria.md`          | Given/When/Then criteria for all 44 FRs                |
| Application Status Model            | `business/PRD inputs/application-status-model.md`     | Status definitions, transitions, deletion prompts      |
| Email Notifications                 | `business/PRD inputs/email-notifications.md`          | Full email body content and trigger rules              |
| Success Metrics                     | `business/PRD inputs/success-metrics.md`              | Full metrics detail with measurement approach          |
| PRD Decisions Index                 | `business/PRD decisions/PRD-DECISIONS-INDEX.md`       | All 16 PRD decision records                            |
| User Personas, Journeys & Use Cases | `business/user-personas-journeys-and-use-cases.md`    | Full persona and journey detail                        |
| Technology Stack                    | `business/technology-stack.md`                        | Full technology stack detail                           |
| Future Phases                       | `business/future-phases.md`                           | Post-v1 roadmap items                                  |

---

_Document status: Version 0.2 Draft_
_Compliance section (Section 15) is outstanding pending AWS DPA review (Bedrock), Terms of Service drafting, and Privacy Policy drafting._
_Last updated: 2026-05-07_
