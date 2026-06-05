# Information Architecture & Navigation -- Grant Pathway v1

**Version:** 1.3
**Last updated:** 2026-05-29

This document defines the complete information architecture, URL structure, navigation components, access control rules, and page-level navigation for Grant Pathway v1. It is a reference for design, development, and testing.

---

## Related Documents

| Document                      | Location                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| Navigation Structure Decision | `business/PRD decisions/PDR-UI-004-navigation-structure.md` |
| Screen Requirements           | `business/PRD inputs/screen-requirements.md`                |
| Application Status Model      | `business/PRD inputs/application-status-model.md`           |

---

## 1. Design Principles

| Principle                | Application                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal navigation       | Three primary nav items plus an account dropdown -- nothing more. Non-technical users should never feel lost                                       |
| Auth-aware routing       | Every route is either public-only or authenticated-only. Mixed-access pages do not exist                                                           |
| Focused application flow | The multi-step application journey lives within a single route (`/applications/[id]`). Steps are not separate pages in the nav                     |
| Predictable redirects    | Authenticated users landing on public pages are redirected to `/dashboard`. Unauthenticated users landing on protected pages are redirected to `/` |
| No dead ends             | Every error state, expiry screen, and confirmation page provides a clear next action                                                               |

---

## 2. Site Map

**PUBLIC (unauthenticated only)**

- `/` -- Sign In / Landing
- `/register` -- Register
- `/verify-email` -- Email Verification
- `/forgot-password` -- Forgot Password / Password Reset

**AUTHENTICATED (logged-in users only)**

- `/dashboard` -- My Applications
- `/applications/new` -- New Application (Step 1)
- `/applications/[id]` -- Application Flow (Steps 1-5)
- `/profile` -- Charity Profile
- `/account` -- Account Settings
  - `/account/delete` -- Account Deletion Confirmation

---

## 3. Route Reference

### 3.1 Public Routes

| URL                | Page name         | Auth state           | Purpose                                                         |
| ------------------ | ----------------- | -------------------- | --------------------------------------------------------------- |
| `/`                | Sign In / Landing | Unauthenticated only | Sign-in form; entry point for returning users; link to register |
| `/register`        | Register          | Unauthenticated only | New account creation form                                       |
| `/verify-email`    | Verify Email      | Unauthenticated only | Three states: awaiting verification / verified / link expired   |
| `/forgot-password` | Forgot Password   | Unauthenticated only | Two states: reset request form / new password form              |

### 3.2 Authenticated Routes

| URL                  | Page name        | Auth state         | Purpose                                                              |
| -------------------- | ---------------- | ------------------ | -------------------------------------------------------------------- |
| `/dashboard`         | My Applications  | Authenticated only | View all saved applications; start a new application                 |
| `/applications/new`  | New Application  | Authenticated only | Step 1 of the application flow for a new application                 |
| `/applications/[id]` | Application      | Authenticated only | Steps 1-5 of the application flow for an existing application        |
| `/profile`           | Charity Profile  | Authenticated only | View, create, and edit charity profile                               |
| `/account`           | Account Settings | Authenticated only | Change password; link to delete account                              |
| `/account/delete`    | Delete Account   | Authenticated only | Deletion confirmation screen; accessible only to authenticated users |

---

## 4. Access Control & Redirect Rules

| Scenario                                                                                  | Behaviour                                                                                           |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Authenticated user visits a public route (e.g. `/`, `/register`)                          | Redirected to `/dashboard`                                                                          |
| Unauthenticated user visits an authenticated route (e.g. `/dashboard`, `/profile`)        | Redirected to `/`                                                                                   |
| User visits `/applications/[id]` for an application that does not belong to their account | Redirected to `/dashboard`                                                                          |
| User visits `/account/delete` directly                                                    | Accessible to authenticated users; the confirmation input (typing DELETE) is the friction mechanism |
| User's session expires while on a protected page                                          | Redirected to `/` on next interaction                                                               |

---

## 5. Navigation Components

### 5.1 Unauthenticated Navigation Bar

Displayed on all public routes (`/`, `/register`, `/verify-email`, `/forgot-password`).

| Element                   | Behaviour                        |
| ------------------------- | -------------------------------- |
| Grant Pathway logo (left) | No link -- stays on current page |
| Sign in                   | Link to `/`                      |
| Register                  | Link to `/register`              |

---

### 5.2 Authenticated Navigation Bar

Displayed on all authenticated routes.

| Element                                    | Behaviour                 |
| ------------------------------------------ | ------------------------- |
| Grant Pathway logo (left)                  | Links to `/dashboard`     |
| My Applications                            | Links to `/dashboard`     |
| Charity Profile                            | Links to `/profile`       |
| Account (right -- shows user's first name) | Dropdown menu (see below) |

**Account dropdown items:**

| Item             | Behaviour                      |
| ---------------- | ------------------------------ |
| Account Settings | Links to `/account`            |
| Sign Out         | Ends session; redirects to `/` |

---

### 5.3 Global Footer

Displayed on all routes (public and authenticated).

| Element          | Detail                                               |
| ---------------- | ---------------------------------------------------- |
| Tagline          | "Your free grant writing companion for UK charities" |
| Privacy Policy   | Link -- opens in current tab                         |
| Terms of Service | Link -- opens in current tab                         |
| Copyright        | (c) RapidGlobe Ltd [current year]                    |

---

## 6. Application Flow -- Step Navigation

The five-step application journey is contained within `/applications/new` (Step 1 only, on creation) and `/applications/[id]` (all steps, on continuation). Steps are not separate routes -- they are states within a single page, controlled by the step indicator.

### 6.1 Steps

| Step | Name                | Key action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Application Details | Enter funder name and grant name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2    | Funder Guidelines   | Upload or paste funder guidelines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 3    | AI Summary          | Review AI-generated plain-English summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 4    | Draft Answers       | Write answers section by section (Tier 3 / free_form funders) or respond to numbered questions (Tier 1 / Tier 2 structured funders). Every extracted question or section carries a `question_type` (`narrative \| data_entry \| financial \| dropdown \| date \| file_upload`). Narrative questions show a writing card with textarea, word/character counter, and AI assist. Data-entry and financial questions are pre-filled from the charity profile. Dropdown, date, and file_upload questions are shown as reminders only. All substantive content is written by the charity; AI assists on request only |
| 5    | Approve & Export    | Approve application and download Word document                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### 6.2 Step Indicator

- Displayed at the top of the screen throughout the application flow
- All five steps are visible at all times
- The current step is highlighted
- Completed steps are visually distinguished from upcoming steps
- The step indicator is read-only -- users cannot click steps to jump ahead or back

### 6.3 Step-Level Navigation Controls

| Control  | Location                        | Behaviour                                                      |
| -------- | ------------------------------- | -------------------------------------------------------------- |
| Continue | Bottom of each step (Steps 1-4) | Saves progress and advances to the next step                   |
| Back     | Bottom of each step (Steps 2-5) | Returns to the previous step; no data is lost                  |
| Cancel   | Step 1 only                     | Returns to `/dashboard` without creating an application record |

### 6.4 Returning to a Saved Application

When a user opens an in-progress application from the dashboard, they are taken directly to the step they last reached -- not to Step 1.

---

## 7. Page Titles (Browser Tab)

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

## 8. Key User Flows

### 8.1 New User -- Registration to First Application

1. `/register` -- user completes registration form
2. `/verify-email` (awaiting state) -- verification email sent
3. `/verify-email` (verified state) -- user clicks email link
4. `/dashboard` (empty state) -- profile incomplete banner shown
5. `/profile` -- user completes charity profile
6. `/dashboard` (empty state) -- profile complete, start button enabled
7. `/applications/new` -- Step 1, enter funder and grant name
8. `/applications/[id]` -- Steps 2 to 5, complete and export

### 8.2 Returning User -- Sign In to Export

1. `/` -- user signs in
2. `/dashboard` (populated state) -- existing applications shown
3. `/applications/[id]` -- application resumed at last reached step
4. Step 5 -- user approves and downloads Word document

### 8.3 Password Reset

1. `/` -- user clicks Forgot password link
2. `/forgot-password` (State 1) -- user enters email address
3. `/forgot-password` (State 2) -- user clicks email link and sets new password
4. `/` -- user signs in with new password

### 8.4 Account Deletion

1. `/account` -- user clicks Delete my account
2. `/account/delete` -- user types DELETE and confirms
3. `/` -- session ended, "Your account has been deleted." message shown

---

## 9. Inactivity & Session Behaviour

| Event                                                 | Behaviour                                                 |
| ----------------------------------------------------- | --------------------------------------------------------- |
| 60 minutes of inactivity                              | Session ended; user redirected to `/` on next interaction |
| User interacts with the app                           | Inactivity timer reset                                    |
| User returns to a protected page after session expiry | Redirected to `/`                                         |
| User signs out manually                               | Session ended immediately; redirected to `/`              |

---

## 10. Post-Action Redirects & Messages

| Action                               | Destination                      | Message shown                                                                        |
| ------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| Email verified                       | `/verify-email` (verified state) | "Your account is now active. Let's get started." with Go to dashboard button         |
| Password reset complete              | `/`                              | "Your password has been updated."                                                    |
| Charity profile saved (first time)   | `/profile` (stays on page)       | "Your charity profile has been saved. You're ready to start your first application." |
| Charity profile updated              | `/dashboard` (redirect)          | None (redirect is the confirmation)                                                  |
| Password changed in account settings | `/account` (stays on page)       | "Your password has been updated."                                                    |
| Account deleted                      | `/`                              | "Your account has been deleted."                                                     |
| Application deleted from dashboard   | `/dashboard` (stays on page)     | Application card removed; no page redirect                                           |

---

_Status: Complete_

---

## Document History

| Version | Date       | Author         | Summary of changes                                                                                                                                                                           |
| ------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-04-16 | Rapidglobe Ltd | Initial version                                                                                                                                                                              |
| 1.1     | 2026-05-26 | Rapidglobe Ltd | Post-action redirect for charity profile update changed from stay-on-page to redirect to dashboard (2026-05-26 testing decision)                                                             |
| 1.2     | 2026-05-29 | Rapidglobe Ltd | Step 4 description updated to reflect section-by-section mode for narrative funders and Q&A mode for structured funders. Document history table added.                                       |
| 1.3     | 2026-05-29 | Rapidglobe Ltd | Step 4 description updated to reflect question-level typing (BD-04): `narrative \| data_entry \| financial \| dropdown \| date \| file_upload`. Tier 1/2/3 funder coverage model referenced. |
