# Information Architecture & Navigation -- Grant Pathway v1

**Tier:** 2 — Check if relevant to the task
**Volatility:** Medium
**Update when:** Any change to page structure, navigation, routing, or information hierarchy

**Version:** 1.9
**Last updated:** 2026-07-30

This document defines the complete information architecture, URL structure, navigation components, access control rules, and page-level navigation for Grant Pathway v1. It is a reference for design, development, and testing.

---

## Related Documents

| Document                      | Location                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Navigation Structure Decision | `docs/PRD decisions/PDR-UI-004-navigation-structure.md`                                                    |
| Screen Specifications         | `docs/PRD-Grant-Pathway.md` (Section 7 -- merged in from the retired `screen-requirements.md`, 2026-07-13) |
| Application Status Model      | `docs/PRD inputs/application-status-model.md`                                                              |

---

## 1. Design Principles

| Principle                | Application                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal navigation       | Three primary nav items plus an account dropdown -- nothing more. Non-technical users should never feel lost                                         |
| Auth-aware routing       | Every route is either public-only or authenticated-only, with one exception: the legal pages (`/terms`, `/privacy`) are accessible in any auth state |
| Focused application flow | The multi-step application journey lives within a single route (`/applications/[id]`). Steps are not separate pages in the nav                       |
| Predictable redirects    | Authenticated users landing on public pages are redirected to `/dashboard`. Unauthenticated users landing on protected pages are redirected to `/`   |
| No dead ends             | Every error state, expiry screen, and confirmation page provides a clear next action                                                                 |

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

**LEGAL (accessible in any auth state)**

- `/terms` -- Terms of Service
- `/privacy` -- Privacy Policy

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

### 3.3 Legal Routes

| URL        | Page name        | Auth state     | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ---------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/terms`   | Terms of Service | Any auth state | Full Terms of Service, statically rendered from **`docs/legal/terms-of-service-external.md`** (path corrected 2026-07-30 — it read `docs/terms-of-service.md`, a root-level file deleted on 2026-06-22, and the route has read the `-external` copy since the internal/external split of 2026-07-28. `docs/legal/terms-of-service.md` remains the authoritative source document; the `-external` copy is the same content with the internal changelog blockquotes stripped, and is what the page renders) |
| `/privacy` | Privacy Policy   | Any auth state | Full Privacy Policy, statically rendered from **`docs/legal/privacy-policy-external.md`** (same correction and same relationship — `docs/legal/privacy-policy.md` is authoritative, the `-external` copy is what the page renders)                                                                                                                                                                                                                                                                        |

---

## 4. Access Control & Redirect Rules

| Scenario                                                                                  | Behaviour                                                                                           |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Authenticated user visits a public route (e.g. `/`, `/register`)                          | Redirected to `/dashboard`                                                                          |
| Unauthenticated user visits an authenticated route (e.g. `/dashboard`, `/profile`)        | Redirected to `/`                                                                                   |
| User visits `/applications/[id]` for an application that does not belong to their account | Redirected to `/dashboard`                                                                          |
| User visits `/account/delete` directly                                                    | Accessible to authenticated users; the confirmation input (typing DELETE) is the friction mechanism |
| User's session expires while on a protected page                                          | Redirected to `/` on next interaction                                                               |
| Any user (signed in or not) visits `/terms` or `/privacy`                                 | Page is shown — legal pages are never redirected                                                    |

---

## 5. Navigation Components

### 5.1 Unauthenticated Navigation Bar

Displayed on all public routes (`/`, `/register`, `/verify-email`, `/forgot-password`) and on the legal pages (`/terms`, `/privacy`).

| Element                   | Behaviour                                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Grant Pathway logo (left) | Link to `/` -- gives pages reached directly (e.g. `/terms` from a search result) a route back; signed-in users are redirected to `/dashboard` |
| Help                      | External link to the GitBook help centre (`PDR-UI-008`, 2026-07-24); opens in a new tab                                                       |
| Register -- it's free     | Link to `/register`; hidden on `/register` (circular) and `/verify-email` (the user has just registered)                                      |

> The standalone "Sign in" nav link was removed 2026-06-09 — every public-facing form already carries a contextual sign-in link (see CHANGELOG).

---

### 5.2 Authenticated Navigation Bar

Displayed on all authenticated routes.

| Element                                    | Behaviour                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| Grant Pathway logo (left)                  | Links to `/dashboard`                                                                   |
| My Applications                            | Links to `/dashboard`                                                                   |
| Charity Profile                            | Links to `/profile`                                                                     |
| Help                                       | External link to the GitBook help centre (`PDR-UI-008`, 2026-07-24); opens in a new tab |
| Account (right -- shows user's first name) | Dropdown menu (see below)                                                               |

**Account dropdown items:**

| Item             | Behaviour                      |
| ---------------- | ------------------------------ |
| Account Settings | Links to `/account`            |
| Sign Out         | Ends session; redirects to `/` |

---

### 5.3 Global Footer

Displayed on all routes (public and authenticated).

| Element          | Detail                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Tagline          | "Your free grant writing companion for UK charities"                                               |
| Help Centre      | External link to the GitBook help centre (`PDR-UI-008`, 2026-07-24) -- opens in a new tab          |
| Privacy Policy   | Link to `/privacy` -- opens in a new tab so the user never loses a form or in-progress application |
| Terms of Service | Link to `/terms` -- opens in a new tab so the user never loses a form or in-progress application   |
| Copyright        | (c) RapidGlobe Ltd [current year]                                                                  |

---

## 6. Application Flow -- Step Navigation

The five-step application journey is contained within `/applications/new` (Step 1 only, on creation) and `/applications/[id]` (all steps, on continuation). Steps are not separate routes -- they are states within a single page, controlled by the step indicator.

### 6.1 Steps

| Step | Name                | Key action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Application Details | Select funder from the funder directory and enter grant name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
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

| Event                                                 | Behaviour                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| 55 minutes of inactivity (5-minute warning)           | Inactivity warning banner displayed; user can dismiss to reset the timer |
| 60 minutes of inactivity                              | Session ended; user redirected to `/` on next interaction                |
| User interacts with the app                           | Inactivity timer reset                                                   |
| User returns to a protected page after session expiry | Redirected to `/`                                                        |
| User signs out manually                               | Session ended immediately; redirected to `/`                             |

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

| Version | Date       | Author         | Summary of changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.9     | 2026-07-30 | Rapidglobe Ltd | **Two stale `business/…` paths corrected, and the `/terms` and `/privacy` source paths corrected.** The route rows pointed at `docs/terms-of-service.md` and `docs/privacy-policy.md` — root-level files **deleted on 2026-06-22** — and described them as "the authoritative source". The routes in fact read `docs/legal/terms-of-service-external.md` and `docs/legal/privacy-policy-external.md`, verified in `app/(public)/terms/page.tsx` and `app/(public)/privacy/page.tsx`, and have read the `-external` copies since the internal/external split of 2026-07-28. Both rows now name the rendered file and explain its relationship to the authoritative `docs/legal/` source. Found while sweeping stale `business/…` prefixes (Opus audit L1 follow-on). |
| 1.8     | 2026-07-24 | Rapidglobe Ltd | Persistent "Help" link added to the authenticated nav, public nav, and global footer (`PDR-UI-008`) -- external link to the GitBook help centre, opens in a new tab.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 1.0     | 2026-04-16 | Rapidglobe Ltd | Initial version                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 1.1     | 2026-05-26 | Rapidglobe Ltd | Post-action redirect for charity profile update changed from stay-on-page to redirect to dashboard (2026-05-26 testing decision)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 1.2     | 2026-05-29 | Rapidglobe Ltd | Step 4 description updated to reflect section-by-section mode for narrative funders and Q&A mode for structured funders. Document history table added.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 1.3     | 2026-05-29 | Rapidglobe Ltd | Step 4 description updated to reflect question-level typing (BD-04): `narrative \| data_entry \| financial \| dropdown \| date \| file_upload`. Tier 1/2/3 funder coverage model referenced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 1.4     | 2026-06-10 | Rapidglobe Ltd | Legal routes `/terms` and `/privacy` added (site map, route reference 3.3, access control, footer link targets). Unauthenticated nav updated to reflect 2026-06-09 changes (Sign in link removed; Register button hidden on `/register`). Auth-aware routing principle amended for legal pages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 1.5     | 2026-06-10 | Rapidglobe Ltd | No-dead-ends fix for legal pages: footer legal links now open in a new tab; public nav logo now links to `/` (previously no link) so directly-reached pages have a route back.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 1.6     | 2026-06-10 | Rapidglobe Ltd | Register button also hidden on `/verify-email` (found during WJ registration walkthrough — the user has just registered).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1.7     | 2026-06-30 | Rapidglobe Ltd | Step 1 description updated: funder is now selected from the funder directory picker, not entered as free text. Inactivity warning row added to §9 (55-minute banner; resolves GAP-22).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
