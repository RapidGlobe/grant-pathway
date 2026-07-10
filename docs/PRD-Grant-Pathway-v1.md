# Product Requirements Document

# Grant Pathway -- Version 1

---

## Document Control

| Field              | Detail                                            |
| ------------------ | ------------------------------------------------- |
| **Document title** | Product Requirements Document -- Grant Pathway v1 |
| **Version**        | 0.8 Draft                                         |
| **Status**         | Draft                                             |
| **Author**         | Rapidglobe Ltd                                    |
| **Date created**   | 2026-04-16                                        |
| **Last updated**   | 2026-07-10                                        |
| **Review date**    | Prior to development start                        |

### Revision History

| Version | Date       | Author         | Summary of Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-04-16 | Rapidglobe Ltd | Initial draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 0.2     | 2026-05-07 | Rapidglobe Ltd | AI delivery mechanism changed from Anthropic direct API to Amazon Bedrock Claude Sonnet 4.6 (eu-west-2). Model updated from claude-sonnet-4 to claude-sonnet-4-6. Compliance section updated: Anthropic DPA replaced by AWS DPA review. Privacy Policy disclosure updated. Sections 9.3, 10.1, 10.5, 15, and Appendix A updated for consistency.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 0.3     | 2026-07-10 | Rapidglobe Ltd | Full correction pass against `moscow-feature-register.md` (v1.10), screen requirements, data model, and the live implementation, following two months of drift since 0.2. Key corrections: launch date de-committed to match Section 1 (OBJ-01, Section 15); FR-02/12.4 password policy corrected to the actual 12-character, letters-and-digits, leaked-password-check policy (a live front-end/back-end inconsistency was found during this check -- see report); FR-07 (MFA) corrected to Won't Have throughout (demoted 2026-06-12); monthly AI limit corrected 20 → 50 (80% threshold 16 → 40) throughout; Section 6.6 rewritten for the charity-authored Q&A model (FR-28-31), replacing the abandoned auto-generation model; FR-45, FR-46, and FR-47 added as new Functional Requirements subsections (previously entirely missing); Section 6.7 extended to cover the per-question Step 4 approval flow alongside the existing Step 5 flow; FR-15 and Screen 7 Step 1 updated for the funder picker (DR-FD-001); Screen 7 Step 4 rewritten for the preparation checklist and per-question Q&A interface; Screen 7 Step 5 updated for the three-checkbox approval gate; Section 9.1 Entities table updated to include `funders`; Section 9.3/6.4 (FR-22) updated to reflect ADR-DATA-002's 2026-07-10 reversal, with a forward note pending Phase 6; Section 15 updated for AWS DPA, Terms of Service, and Privacy Policy status; Section 16 no longer hardcodes an FR count; Document Control and Appendix B document paths corrected from a stale `business/...` prefix to the actual `docs/...` locations, including two relocations. |
| 0.4     | 2026-07-10 | Rapidglobe Ltd | Closed out the discrepancies 0.3 flagged but did not fix: Section 6.1's password front-end/back-end inconsistency is resolved (register/reset/account-settings forms now enforce 12 characters + letters and digits, matching the server-side policy; `actions/auth.ts` surfaces a specific `weak_password` state) -- Section 12.4 and Section 6.1 both updated accordingly. Section 10.2's `ai_usage_log.request_type` discrepancy resolved (`docs/data-model.md` now lists all five enum values including `refine_answer`); `buildDraftPrompt` confirmed genuinely dead code (zero callers), flagged as a separate follow-up cleanup rather than fixed here. Section 16's note on `acceptance-criteria.md` updated -- FR-45/46/47, the FR-29 priority fix, and the FR-31A numbering flag are now all in place there. Section 6.11 (FR-46) verification note upgraded from "could not be confirmed, appears likely not built" to "confirmed not built," now that `moscow-feature-register.md` and BRD v0.6 independently agree.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 0.5     | 2026-07-10 | Rapidglobe Ltd | Closed out the `buildDraftPrompt` follow-up flagged in 0.4: the dead function and its unused `ApplicationQuestion` type were removed from `lib/prompts.ts` along with the dedicated tests in `__tests__/prompts.test.ts`; confirmed zero remaining references, `tsc --noEmit`/lint/vitest all clean. Section 10.2 updated to record the removal.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 0.6     | 2026-07-10 | Rapidglobe Ltd | Section 3 review surfaced a real gap: the guideline source-reference/citation feature ("Option 2"), blended into Phase 6 on 2026-07-10, had no FR, PDR, or ADR of its own -- Section 3.1 had no scope-list entry for a capability that gates launch. Formalised with new `PDR-DH-004` (design decision) and `ADR-DATA-007` (architecture, consolidating forward-notes already scattered across `ADR-FILE-003`/`ADR-AI-007`/`ADR-SEC-004`/`ADR-OPS-006`); added FR-48 to `moscow-feature-register.md` and acceptance criteria to `acceptance-criteria.md` Section 9.11; added Section 6.13 and a new Section 3.1 row here; Section 3.3 MoSCoW counts updated (43 -> 44 Must Have, 47 -> 48 total). Also fixed in passing: Section 3.3's footnote about the register's summary table being stale no longer applied (already corrected in the register's own v1.11 pass) -- removed; `moscow-feature-register.md`'s own FR-22 row had never been updated for `ADR-DATA-002`'s reversal (fixed elsewhere in this PRD and in `acceptance-criteria.md`, but missed in the register itself) -- now corrected there too; Section 6.4's FR-22 status note still said "21-document corpus" -- corrected to 23 documents / 14 funders, matching `ADR-DATA-002`.                                                                                                                                                                                                                                                                                                                                                                                            |
| 0.7     | 2026-07-10 | Rapidglobe Ltd | Section 5 review found it predated the 2026-06-09/2026-06-10 nav and legal-page changes and was never updated -- corrected against the live `components/nav-public.tsx`/`nav-authenticated.tsx` and `docs/information-architecture-and-navigation.md` v1.7. Fixes: `/terms` and `/privacy` were entirely missing from the route tables (5.2) despite being live pages -- added, plus an access-control row (5.3) and page-title rows (5.7); 5.1's auth-aware-routing principle didn't note the legal-page exception -- added; 5.4 described a "Sign in" nav link that was removed 2026-06-09, and an unconditional Register link that is actually hidden on `/register`, `/verify-email`, and the legal pages -- both corrected; 5.6's footer didn't note the legal links open in a new tab (added 2026-06-10) -- added. 5.5 (authenticated nav) checked out accurate against `nav-authenticated.tsx`, no change needed. Also fixed the trailing document-status line, still reading "Version 0.3 Draft" since that section was introduced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 0.8     | 2026-07-10 | Rapidglobe Ltd | Section 6.1 review found FR-08 (feedback opt-in) confirmed built end-to-end (schema since `20260519000000_initial_schema.sql`, `register-form.tsx` -> `actions/auth.ts` -> `user_profiles.feedback_consent`, verified in the P5.5 checklist) -- corrected the "omitted if not built" hedge here, in `moscow-feature-register.md` (both its 9.1 row and Should Have build-conditions table), and in `screen-requirements.md`, none of which had ever been updated once the feature actually shipped. Rest of 6.1 (password policy, verification/reset flows, sign-in/reset error messages, MFA removal) verified accurate against live code.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### Related Documents

| Document                              | Location                                                     |
| ------------------------------------- | ------------------------------------------------------------ |
| Business Requirements Document        | `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-v0.6.md` |
| MoSCoW Feature Register               | `docs/moscow-feature-register.md`                            |
| Screen Requirements                   | `docs/PRD inputs/screen-requirements.md`                     |
| Acceptance Criteria                   | `docs/PRD inputs/acceptance-criteria.md`                     |
| Application Status Model              | `docs/PRD inputs/application-status-model.md`                |
| Email Notifications                   | `docs/PRD inputs/email-notifications.md`                     |
| Success Metrics                       | `docs/PRD inputs/success-metrics.md`                         |
| Information Architecture & Navigation | `docs/information-architecture-and-navigation.md`            |
| Data Model                            | `docs/data-model.md`                                         |
| Non-Functional Requirements           | `docs/non-functional-requirements.md`                        |
| PRD Decisions Index                   | `docs/PRD decisions/PRD-DECISIONS-INDEX.md`                  |
| User Personas, Journeys & Use Cases   | `docs/user-personas-journeys-and-use-cases.md`               |

**Note:** The Business Requirements Document above was previously filed as `BRD-Grant-Pathway-v0.5.md` despite its internal header stating Version 0.6 -- a filename/version mismatch. Corrected 2026-07-10: the file was renamed to `BRD-Grant-Pathway-v0.6.md` to match its internal header, and all references to the old filename were updated.

---

## 1. Executive Summary

Grant Pathway is a free, AI-assisted grant writing tool for UK charities. It reduces the time, effort, and expertise required to write a strong grant application -- enabling volunteers and non-specialist staff to produce clearer, more consistent applications without professional fundraising support.

This Product Requirements Document defines exactly what must be built for the v1 release: what the product does, how each screen behaves, what data is stored, how the AI integration works, and the standards the product must meet. It is the primary reference for development.

The document synthesises requirements from the Business Requirements Document, 16 PRD decision records, and 5 PRD input documents. Where this document and any source document differ, this PRD takes precedence. Known divergences from the BRD are documented in the MoSCoW Feature Register.

**Target launch date: not committed (revised 2026-07-05; was 31 July 2026).** Launch now requires Phase 6 (`ADR-DATA-006`, the application item-graph rearchitecture) to complete — see the Phase 6 → Go-Live Gate in `docs/Implementation Plan/IMPLEMENTATION-PLAN.md`. Working estimate: August–September 2026.

---

## 2. Product Vision & Objectives

### 2.1 Vision Statement

> To be the trusted, free preparation tool for UK charities -- helping non-specialists produce stronger, more consistent grant applications through AI-assisted writing, plain-English guideline summarisation, and mandatory human review.
>
> _Corrected 2026-07-10: this PRD's own quote had drifted from the canonical `docs/vision-statement.md` -- an earlier pass here paraphrased it as "writing companion... charity-authored writing with on-request AI assistance" instead of quoting the source verbatim. `docs/vision-statement.md` (Tier 3) already carries the correct, current wording (revised 2026-05-29, replacing "AI-powered drafting" with "AI-assisted writing" for the same reason -- AI generating content was abandoned). Restored to an exact quote of the canonical text; no change made to `docs/vision-statement.md` itself._

### 2.2 Objectives for v1

| Ref    | Objective                                                                                                                               | Measure                                                                                |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| OBJ-01 | Launch a stable, accessible web application (target launch date not committed; working estimate August-September 2026 -- see Section 1) | Live deployment once Phase 6 (`ADR-DATA-006`) completes and the Go-Live Gate is passed |
| OBJ-02 | Enable any UK charity to register and complete an application within a single session                                                   | Confirmed through user testing                                                         |
| OBJ-03 | Reduce the time a non-specialist spends writing a grant application                                                                     | Evidenced through user feedback interviews                                             |
| OBJ-04 | Achieve WCAG 2.2 Level AA accessibility from day one                                                                                    | Internal testing and checklist review pre-launch                                       |
| OBJ-05 | Operate within a monthly running cost of £100                                                                                           | Monthly cost monitoring                                                                |
| OBJ-06 | Gather sufficient early user feedback to inform v2 planning                                                                             | Feedback interviews with opted-in users post-launch                                    |

---

## 3. Scope & Feature Priorities

### 3.1 In Scope for v1

| #   | Capability                                                                                                                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | User registration, email verification, login, and account management                                                                                                                                                                                           |
| 2   | Charity profile creation with Charity Commission API lookup                                                                                                                                                                                                    |
| 3   | Grant application creation, editing, saving, deletion, and export                                                                                                                                                                                              |
| 4   | Funder guideline input by paste or file upload                                                                                                                                                                                                                 |
| 5   | AI-powered plain-English summarisation of funder guidelines                                                                                                                                                                                                    |
| 6   | Charity-authored Q&A writing interface, with on-request AI assist to improve structure and clarity (revised 2026-05-28 -- see Section 6.6)                                                                                                                     |
| 7   | Mandatory human review and approval before any content can be exported, at both per-question (Step 4) and application level (Step 5)                                                                                                                           |
| 8   | Export of approved content to Word (.docx)                                                                                                                                                                                                                     |
| 9   | Full account and data deletion by the user                                                                                                                                                                                                                     |
| 10  | WCAG 2.2 Level AA accessibility                                                                                                                                                                                                                                |
| 11  | UK-region data hosting                                                                                                                                                                                                                                         |
| 12  | Basic passive usage metrics via database records                                                                                                                                                                                                               |
| 13  | Guideline source-reference: citations from AI summary bullets/questions to the specific guideline page/section, with a "view original guidelines" panel (FR-48, added 2026-07-10 -- see `PDR-DH-004`, `ADR-DATA-007`; gates launch via Phase 6, not yet built) |

### 3.2 Out of Scope for v1

Grant discovery, eligibility matching, grant tracking, post-grant reporting, EU/international grants, live grant databases, CRM integrations, open-ended AI chat, native mobile application, multi-region hosting, and formal survey infrastructure are all explicitly out of scope. Full detail in `docs/v1-out-of-scope.md`.

### 3.3 MoSCoW Feature Priorities

| Priority        | Count | Functional requirements                                                        |
| --------------- | ----- | ------------------------------------------------------------------------------ |
| Must Have       | 44    | FR-01 to FR-06, FR-09 to FR-31, FR-32 to FR-37, FR-39 to FR-43, FR-45 to FR-48 |
| Should Have     | 3     | FR-08, FR-38, FR-44                                                            |
| Could Have      | 0     | --                                                                             |
| Won't Have (v1) | 1     | FR-07 -- demoted from Should Have 2026-06-12. See `docs/v1-out-of-scope.md`    |

_48 functional requirements are defined in total (FR-01 to FR-48; no gaps in the numbering). Counts corrected against `docs/moscow-feature-register.md` v1.12. FR-48 (guideline source-reference/citations, "Option 2") added 2026-07-10 -- see `PDR-DH-004` and `ADR-DATA-007`; blended into Phase 6, not yet built. The earlier note here about the register's summary table being stale ("42" Must Have / "0" Won't Have) no longer applies -- that was corrected in the register's own v1.11 revision (2026-07-10), and both documents' counts now match._

FR-29 (word/character limits displayed per question) and FR-31 (budget-question flagging) were both promoted from Should Have to Must Have on 2026-05-28, once the charity-authored Q&A model made them integral to Step 4 rather than optional extras -- see Section 6.6. FR-45 to FR-47 were added later (2026-05-29 and 2026-06-02) and FR-48 later still (2026-07-10); all four are Must Have from introduction. The three remaining Should Have requirements and their build conditions:

| Ref   | Requirement                     | Build condition                                           |
| ----- | ------------------------------- | --------------------------------------------------------- |
| FR-08 | Feedback opt-in at registration | Build if feedback interview programme confirmed at launch |
| FR-38 | Plain text (.txt) export        | Build if time permits                                     |
| FR-44 | Deletion confirmation email     | Build if transactional email confirmed in scope           |

**FR-07 (optional MFA) -- Won't Have, demoted 2026-06-12.** Originally Should Have. A risk analysis found the worst-case impact of a password compromise is limited to viewing draft applications and charity profile data (all publicly registered information) -- there is no payment data and no submission capability -- so the mandatory friction MFA would add for non-technical volunteer users was judged to outweigh the marginal security benefit. See `docs/moscow-feature-register.md` Section 9.1 for the full reasoning.

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

| Principle                | Application                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal navigation       | Three primary nav items plus an account dropdown. Non-technical users should never feel lost                                                         |
| Auth-aware routing       | Every route is either public-only or authenticated-only, with one exception: the legal pages (`/terms`, `/privacy`) are accessible in any auth state |
| Focused application flow | The five-step journey lives within a single route. Steps are not separate nav pages                                                                  |
| Predictable redirects    | Authenticated users on public pages redirect to `/dashboard`. Unauthenticated users on protected pages redirect to `/`                               |
| No dead ends             | Every error state and confirmation page provides a clear next action                                                                                 |

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

**Legal routes (accessible in any auth state) -- added 2026-06-10**

| URL        | Page             | Purpose                                                                    |
| ---------- | ---------------- | -------------------------------------------------------------------------- |
| `/terms`   | Terms of Service | Full Terms of Service, statically rendered from `docs/terms-of-service.md` |
| `/privacy` | Privacy Policy   | Full Privacy Policy, statically rendered from `docs/privacy-policy.md`     |

### 5.3 Access Control & Redirects

| Scenario                                                        | Behaviour                                         |
| --------------------------------------------------------------- | ------------------------------------------------- |
| Authenticated user visits a public route                        | Redirected to `/dashboard`                        |
| Unauthenticated user visits an authenticated route              | Redirected to `/`                                 |
| User visits `/applications/[id]` for another user's application | Redirected to `/dashboard`                        |
| Session expires while on a protected page                       | Redirected to `/` on next interaction             |
| Any user (signed in or not) visits `/terms` or `/privacy`       | Page is shown -- legal pages are never redirected |

### 5.4 Navigation Bar -- Unauthenticated

**Corrected 2026-07-10 -- this section was stale, describing the nav bar as it existed before the 2026-06-09/2026-06-10 changes; corrected to match the live `components/nav-public.tsx` and `docs/information-architecture-and-navigation.md` v1.7.**

Displayed on all public routes (`/`, `/register`, `/verify-email`, `/forgot-password`) and on the legal pages (`/terms`, `/privacy`).

| Element                   | Behaviour                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Grant Pathway logo (left) | Links to `/` -- gives pages reached directly (e.g. `/terms` from a search result) a route back; signed-in users redirected to `/dashboard` |
| Register -- it's free     | Links to `/register`; hidden on `/register` (circular), `/verify-email` (user has just registered), and the legal pages (out of context)   |

**No standalone "Sign in" nav link exists** -- it was removed 2026-06-09; every public-facing form already carries a contextual sign-in link.

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

| Element          | Detail                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Tagline          | "Your free grant writing companion for UK charities"                                                                   |
| Privacy Policy   | Links to `/privacy` -- opens in a new tab so the user never loses a form or in-progress application (added 2026-06-10) |
| Terms of Service | Links to `/terms` -- opens in a new tab, same reason (added 2026-06-10)                                                |
| Copyright        | (c) RapidGlobe Ltd [current year]                                                                                      |

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
| `/terms`                                    | Terms of Service -- Grant Pathway              |
| `/privacy`                                  | Privacy Policy -- Grant Pathway                |

---

## 6. Functional Requirements

Requirements are grouped by the nine functional areas defined in the BRD. Each requirement states its MoSCoW priority. Should Have requirements are only built if their stated build condition is met.

Full testable acceptance criteria for all requirements are in `docs/PRD inputs/acceptance-criteria.md`.

---

### 6.1 Authentication & Accounts

| Ref   | Requirement                                                                                                                                                                                          | Priority                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| FR-01 | The system shall allow new users to register with their full name, email address, and a password                                                                                                     | Must Have                                           |
| FR-02 | The system shall validate email format and enforce a minimum password length of 12 characters, containing both letters and digits, at registration                                                   | Must Have                                           |
| FR-03 | The system shall send a verification email upon registration; accounts shall not be activated until the email link is clicked                                                                        | Must Have                                           |
| FR-04 | The system shall allow registered users to log in with their email address and password                                                                                                              | Must Have                                           |
| FR-05 | The system shall provide a self-service password reset flow triggered by email                                                                                                                       | Must Have                                           |
| FR-06 | The system shall automatically log out users after 60 minutes of inactivity                                                                                                                          | Must Have                                           |
| FR-07 | ~~The system shall provide optional MFA as an opt-in feature; MFA shall not be mandatory in v1~~ -- **Won't Have.** Demoted 2026-06-12; see implementation note below                                | Won't Have                                          |
| FR-08 | During registration, the system shall present a plain-language prompt asking the user if they are willing to participate in a feedback interview; the response shall be recorded against the account | Should Have -- **confirmed built** (see note below) |

**Implementation notes:**

- **Password policy (updated 2026-06-29, VQ-009):** minimum 12 characters, must contain both letters and digits; leaked-password check enabled (checked against the HaveIBeenPwned database); secure password change enabled; current password required to change password. This replaces the original 10-character-minimum, no-complexity policy, which followed pure NCSC minimalism -- see Appendix A for the updated NCSC glossary note. This is configured at the Supabase Auth project level and applies uniformly to registration, password reset, and password change.
  - **Discrepancy resolved 2026-07-10:** the client-side validation and hint text in `components/register-form.tsx`, `components/reset-password-form.tsx`, and `components/account-settings-form.tsx` previously still enforced and displayed a 10-character minimum, uniformly across all three forms. This has been corrected in code — all three forms now validate 12 characters plus letters and digits client-side, matching Supabase Auth's server-side policy, and `actions/auth.ts` now surfaces a specific `weak_password` state (rather than a generic error) if the server-side check ever rejects a password the client-side check let through.
- **FR-07 (MFA) -- Won't Have, demoted 2026-06-12.** MFA was fully removed from the codebase (`/mfa` route, enrolment/verification actions, and the Account Settings MFA section all deleted). See Section 3.3 for the reasoning.
- Email verification link expires after 24 hours. Resend is rate-limited to 3 per hour
- Password reset link expires after 1 hour
- Sign-in errors must never confirm whether an email address is registered (same message for wrong password and unknown email)
- Password reset requests must never confirm whether an email address is registered (same message regardless)
- **FR-08 status corrected 2026-07-10:** this bullet previously read "FR-08 opt-in checkbox is omitted entirely from the registration screen if FR-08 is not built" -- FR-08 is not hypothetical. It has been built since the initial schema (`supabase/migrations/20260519000000_initial_schema.sql`) and is wired end-to-end: the checkbox is live in `components/register-form.tsx`, `actions/auth.ts`'s `registerUser()` reads it and writes `feedback_consent` to `user_profiles`, and verifying it (checked and unchecked) is an explicit item in the P5.5 pre-launch checklist. `docs/moscow-feature-register.md` and `docs/PRD inputs/screen-requirements.md` both carried the same stale "omit if not built" hedge -- corrected there too.

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

| Ref   | Requirement                                                                                                                                                                                    | Priority  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-15 | The system shall allow a user to create a new grant application by selecting a funder from a searchable, curated picker (seeded from the `funders` database table) and entering the grant name | Must Have |
| FR-16 | The system shall display all saved applications on the user dashboard with grant name, funder name, status, and date last updated                                                              | Must Have |
| FR-17 | The system shall allow a user to open and continue any saved application from their dashboard                                                                                                  | Must Have |
| FR-18 | The system shall auto-save application progress; save also occurs on every Continue action                                                                                                     | Must Have |
| FR-19 | The system shall allow a user to delete a saved application                                                                                                                                    | Must Have |
| FR-20 | A single user account shall support multiple saved applications simultaneously                                                                                                                 | Must Have |

**Implementation notes:**

- Auto-save runs silently every 60 seconds in the background with no visible indicator
- Save also occurs on every Continue action (step advance)
- A returning user is taken directly to the step they last reached, not to Step 1
- Dashboard application cards are sorted by most recently updated, descending
- The summary strip on the dashboard always shows all four status counts, even when some are zero
- The application deadline field mentioned in the BRD is not included in v1
- **Revised 2026-06-01 (DR-FD-001):** the funder is selected from a searchable, curated picker seeded from the `funders` database table, not entered as free text. A "My funder isn't listed -- request it" link is displayed below the picker for funders not yet in the directory. See Screen 7 Step 1 (Section 7) for the full UI specification.

---

### 6.4 Funder Guideline Handling

| Ref   | Requirement                                                                                                                                                                                    | Priority  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-21 | The system shall allow users to input funder guidelines by pasting text or uploading a PDF or .docx file                                                                                       | Must Have |
| FR-22 | Funder guidelines shall be used for AI processing only and shall not be permanently stored. **True of the product as it exists in production today; changing under Phase 6 -- see note below** | Must Have |
| FR-23 | The system shall display a plain-language error if an unsupported file format is uploaded and prompt the user to paste the text instead                                                        | Must Have |

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

**FR-22 status note (added 2026-07-10):** `ADR-DATA-002` originally decided funder guidelines would never be stored, on the basis that they "may contain commercially sensitive information provided by the funder." On 2026-07-10 that ADR was formally revised: checked against the actual 23-document corpus (14 funders) Grant Pathway processes, the commercial-sensitivity premise did not hold -- these are funders' own publicly published application guidance. The revised decision is that guideline text **will** be retained (extracted, page/section-tagged text in Postgres, cascade-deleting with its owning application; retained indefinitely where it backs an approved playbook), once Phase 6 (P6.2a onward) ships. **As of this pass, that retention mechanism has not been built.** FR-22 as stated above, and the "not permanently stored" behaviour described throughout this PRD, remain true of the live production product today. Treat this FR the same way `ADR-DATA-001` treats the superseded `application_answers` model: an accurate description of what exists now, not a permanent design commitment. See Section 9.3 and `ADR-DATA-002`'s 2026-07-10 revision for full detail.

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

### 6.6 Q&A Interview and Application Assembly

**Revised 2026-05-28.** The originally specified model -- AI auto-generates a draft answer for each question on arrival at Step 4 -- was abandoned. Funder AI-guidance research (Henry Smith, National Lottery Community Fund) found that AI-generated answers disadvantage charities in practice. The replacement model, in production today: **the charity writes every answer**; AI assists only on request, improving structure and clarity of what the charity has already written. AI never generates application content from scratch. The old `/api/generate-draft` route and the "Regenerate all answers" action no longer exist -- both were removed 2026-07-01 after being confirmed to have zero callers. Full design rationale: `docs/Implementation Plan/archive/STEP4-REDESIGN-PROPOSAL.md`.

| Ref   | Requirement                                                                                                                                                                                                                                                       | Priority  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-28 | The charity shall write each application answer from scratch, section by section; on arriving at Step 4 for the first time, the user shall see a preparation checklist before beginning the Q&A interview                                                         | Must Have |
| FR-29 | Word limits and character limits shall be auto-extracted from the funder guidelines and displayed alongside each question; each answer shall show a live word/character counter as the user types                                                                 | Must Have |
| FR-30 | A per-question "Help me improve this" AI assist action shall be available on request, using the charity's own written answer as its only input; it shall correct spelling and grammar and improve structure and clarity, and shall not add facts or change claims | Must Have |
| FR-31 | Budget questions and sections shall be visually flagged (amber) and the AI assist action shall be disabled on them; the user must enter their own figures                                                                                                         | Must Have |

**The preparation checklist (shown once, on first arrival at Step 4):**

Heading: _"Before you begin writing."_ Message: _"The financial sections of this application cannot be completed by AI. Before you start, gather:"_ followed by a checklist:

1. Most recent annual accounts or financial statements
2. Projected budget for the grant period (income and planned expenditure)
3. Details of other funding secured or applied for
4. Input from your treasurer, finance lead, or a trustee who understands the budget

A warning note follows: _"It is worth involving a senior colleague -- such as your CEO, treasurer, or a trustee -- before reaching the financial questions."_ Button: _"I have what I need -- start writing."_ The checklist is shown only once per application; returning users go directly to the Q&A interface. See Screen 7 Step 4 (Section 7) for the full Q&A interface specification.

**Word and character limits (FR-29):** limits are extracted automatically from the funder guidelines during Step 3 -- the user never enters a limit manually. Both word limits and character limits are supported (`limit_type: words | characters | none`); the counter on each question displays "X / N words" or "X / N characters" as appropriate, or a plain word count with no limit shown where the funder sets none.

**Over-limit hard stop (FR-29, updated 2026-06-04, D-LBF-02):** when an answer exceeds its word or character limit, the "Approve this answer" panel and button are hidden, and a red message is shown: _"Your answer exceeds the funder's word limit. Please trim it or use AI to bring it within the limit before approving."_ The approve panel reappears automatically once the answer is brought back within the limit. This replaced an earlier "warn but allow" behaviour (removed 2026-06-04) -- grant portals uniformly reject over-limit submissions, so allowing approval of an over-limit answer would give false confidence.

**AI assist limitation (PDR-AI-006, found live during Clothworkers testing, 2026-07-04):** LLMs cannot reliably hit an exact word or character count when compressing an over-limit answer -- a 200-word answer against a 50-word limit was refined to 60 words by the AI assist, still over limit. When the AI's suggestion remains over limit after refining, a conditional inline message naming the shortfall and prompting further trimming is planned but **not yet implemented** as of this pass. Do not describe this as guaranteed to bring an answer within limit in any user-facing copy or test plan.

**Budget question treatment (FR-31):** budget questions/sections are shown with an amber border and a "Budget" badge; the "Help me improve this" button is absent; a label reads: _"This section requires your actual financial data -- do not use AI-generated figures."_ Budget questions require a user-entered answer before the application can be assembled.

**AI assist mechanics (FR-30):** "Help me improve this" is available on non-budget questions once the user has written something. On success, a "SUGGESTED IMPROVEMENT" card shows the refined text alongside the original, with two actions: **"Use this improved version"** (replaces the answer) and **"Keep my original"** (discards the suggestion). The refine prompt always corrects spelling and grammar, even for very short answers, and is instructed never to add facts, statistics, or claims not present in the charity's own text.

**Assembly:** once all mandatory questions are approved (optional questions -- those containing "(optional)" or beginning "This question is optional" -- do not block the gate), a senior-review prompt asks the user to confirm with a CEO, treasurer, or trustee that the budget figures are accurate and approved, the project description reflects current priorities, and they have authority to submit. Assembly then formats the charity's own words (or AI-refined words where the charity chose to use them) into the funder's required output -- a Q&A list for structured funders, a flowing narrative for free-form funders -- without adding any content.

**Progress/status indicators (Step 4):** each question card shows green (complete), amber (partial), or grey (not started) depending on answer state, rather than a single generation progress bar -- there is no AI generation step to wait for on arrival at Step 4.

**Monthly AI request limit (PDR-AI-005, raised 20 → 50, aligned across every AI route by 2026-06-17):** `generate-summary` and `refine-answer` were raised to 50 on 2026-05-28 as part of the Step 4 redesign; the then-separate `generate-draft` route was missed in that change and stayed at 20 until corrected on 2026-06-17. `generate-draft` was itself deleted entirely on 2026-07-01 (zero callers, superseded by `refine-answer`) -- `generate-summary` and `refine-answer` are the two AI routes live today, both enforcing 50.

| Threshold                     | Action                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 40 of 50 requests used (80%)  | Soft warning banner: "You've used most of your monthly AI allowance."                                                                                                                      |
| 50 of 50 requests used (100%) | AI assist blocked. Message: "You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch." Writing and saving your own answers is never restricted. |

Each guideline summarisation (including regeneration) and each "Help me improve this" AI assist request counts as one AI request against the monthly allowance. Writing or auto-saving an answer does not consume a request. Monthly limit resets on the first day of the calendar month.

**AI service unavailable (kill switch, added 2026-06-29):** when the `AI_ENABLED` flag is set to `false`, AI routes return HTTP 503 immediately and no quota is consumed; the user sees: _"The AI service is temporarily unavailable. Please try again later."_

**API error message:** "We couldn't generate your draft right now. This is usually temporary -- please try again." with a Try again button.

---

### 6.7 Mandatory Review & Approval

Review and approval happens at **two levels**: a per-question approval on each Step 4 question card, and a final application-level approval gate on Step 5. Both are mandatory; neither can be bypassed.

| Ref   | Requirement                                                                                                                                                                               | Priority  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-32 | Every answer shall be presented alongside plain-language review prompts, both per-question on Step 4 and application-wide on Step 5, before it can be approved                            | Must Have |
| FR-33 | The system shall require explicit user approval, at both the per-question level (Step 4) and the application level (Step 5), before content can be exported; neither step can be bypassed | Must Have |
| FR-34 | The user shall be able to edit their answer text directly within the Step 4 interface at any time before assembly                                                                         | Must Have |
| FR-35 | The user shall be able to clear and rewrite any answer at any time before assembly; there is no "regenerate" action, since content is user-written, not AI-generated                      | Must Have |
| FR-36 | Approved content shall be visually marked as approved and saved to the application record, at both the per-question and application level                                                 | Must Have |

**Level 1 -- per-question approval (Step 4, implemented 2026-06-01):** each question card carries its own "Before you approve, check:" review prompts and its own "Approve this answer" button. The approval panel is shown once the answer is non-empty (or, for a question marked optional, even when empty), and is hidden while the answer is over its word/character limit (Section 6.6). Editing an approved answer clears its approval -- the question must be re-approved. The "Ready to assemble" button on Step 4 is gated on the approved count (all mandatory questions approved), not merely the answered count.

**Level 2 -- application-level approval (Step 5):** the assembled draft is shown read-only, alongside **three mandatory confirmation checkboxes** that must all be ticked before the approval/export action activates (see FR-32/33's implementation detail and Screen 7 Step 5 in Section 7):

1. "I have reviewed all responses in full and am satisfied with their content."
2. "The information provided is accurate and complete to the best of my knowledge."
3. "I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted."

**Revised 2026-06-12:** the separate "Approve my application" button and confirmation modal were removed to reduce friction. Ticking all three checkboxes and clicking a download button now approves the application (sets status to `approved`) and begins the download in a single action -- there is no intermediate confirmation modal.

**Re-opening prompt (shown when opening an approved or exported application):** "Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export." Confirming reverts the application to `in_progress`, clears the assembled draft, and resets every question's per-question approval, requiring both levels of approval to be completed again.

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

### 6.10 Question-Level Typing (FR-45)

**Added 2026-05-29 (BD-04); status corrected 2026-07-10.**

| Ref   | Requirement                                                                                                                                                                                                                                                                                                                                                              | Priority  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| FR-45 | Each extracted application question shall carry a `question_type` of `narrative`, `data_entry`, `financial`, `dropdown`, `date`, or `file_upload`, driving different handling per type (narrative questions get a writing card; data-entry and financial are pre-filled from the charity profile; dropdown, date, and file_upload are shown as read-only reminders only) | Must Have |

**Not built as described.** In practice, only `narrative` is ever extracted -- the AI extraction prompt in `lib/prompts.ts` discards every other question type entirely rather than classifying it. A nine-funder review (`docs/BRD plus decisions Mark Two/question-coverage-analysis.md`) found this typing mechanism too narrow in twenty distinct ways. `ADR-DATA-006` (2026-07-05) supersedes FR-45's mechanism with a typed item-graph model (`docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md`) -- not yet built; see that ADR's linked build plan. FR-45 is retained here as the current formal requirement and should be revised or retired once the item-graph work lands, not before. Do not present question-level typing as working in any user-facing material or test plan on the strength of this FR.

---

### 6.11 Three-Tier Funder Coverage Model (FR-46)

**Added 2026-05-29 (BD-07).**

| Ref   | Requirement                                                                                                                                                                                                                                                                                                                                                                         | Priority  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-46 | The system shall display a three-tier funder coverage model to the user: **Tier 1 (Full)** -- narrative questions with profile pre-fill; **Tier 2 (Partial)** -- a narrative subset of a portal form; **Tier 3 (Guidance)** -- a free-form narrative document. The coverage tier shall be shown on the new-application screen, on the Step 3 summary card, and on the export screen | Must Have |

**Confirmed not built (2026-07-10):** a code search for "Tier 1", "Tier 2", "Tier 3", and a `coverage_tier`-style field found no trace of this model anywhere in `components/`, `app/`, or `lib/database.types.ts`. The `funders` table (Section 9.1) has no coverage-tier column. This is now independently confirmed by three sources in agreement: this code search, `docs/moscow-feature-register.md` (FR-46, "Not built"), and `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-v0.6.md` Section 3.3 ("never built — no tier/coverage column exists... no tier badge appears anywhere in the app," confirmed 2026-07-04). FR-46 is carried forward here per the moscow register as the current formal requirement, but the underlying product decision on whether to build it, defer it, or retire it remains open — see `docs/moscow-feature-register.md` FR-46 for that open question.

---

### 6.12 Eligibility Mismatch Detection (FR-47)

**Added 2026-06-02 (DR-EL-001).**

| Ref   | Requirement                                                                                                                                                                                                  | Priority  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| FR-47 | On Step 3, if the AI detects a clear mismatch between the charity's profile and the funder's eligibility criteria, the system shall display a hard stop: a red warning card, with the Continue button hidden | Must Have |

Confirmed built and matching the register description: acknowledging the warning sets the application status to `mismatch` (a terminal state -- no transition to Step 4 or 5 is permitted) and returns the user to the dashboard. There is no override path. The only route forward is for the user to correct their charity profile and start a new application. Default message if no specific reason is available: _"Your charity's focus does not appear to meet this funder's eligibility criteria."_

---

### 6.13 Guideline Source-Reference / Citations (FR-48)

**Added 2026-07-10 (`PDR-DH-004`, "Option 2"; architecture in `ADR-DATA-007`).**

| Ref   | Requirement                                                                                                                                                                                                                                                  | Priority  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| FR-48 | Each AI summary bullet, eligibility criterion, and extracted question shall carry a citation to a specific page (PDF) or heading/section (docx, pasted text) of the funder's guidelines, with a "view original guidelines" panel to jump to and highlight it | Must Have |

**Not built as of 2026-07-10.** Depends on two other decisions: `ADR-DATA-002`'s guideline-retention reversal (a citation needs retained text to point at) and `ADR-DATA-006`'s item-graph model (the citation is a field on each item, not on the flat `application_answers` structure). Blended into Phase 6 rather than run as a separate track, since it touches the same data model, extraction prompt, and Step 4 rendering Phase 6 was already rewriting -- see `ADR-DATA-007`'s Decision for the five-part build sequence (`P6.2a` groundwork through `P6.5` curation). Part of the Phase 6 → Go-Live Gate; none of the underlying build tasks have started. See `docs/PRD inputs/acceptance-criteria.md` Section 9.11 for full acceptance criteria.

---

## 7. Screen Specifications

This section defines the content, fields, validation rules, error states, and post-submission behaviour for each screen. Full detail is also held in `docs/PRD inputs/screen-requirements.md`.

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

| Field                 | Rule                                                             | Error message                                                                       |
| --------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| First name            | Required                                                         | "Please enter your first name"                                                      |
| Last name             | Required                                                         | "Please enter your last name"                                                       |
| Email                 | Required, valid format                                           | "Please enter a valid email address"                                                |
| Email                 | Not already registered                                           | "An account with this email address already exists"                                 |
| Password              | Required, minimum 12 characters, must contain letters and digits | "Your password must be at least 12 characters and include both letters and numbers" |
| Password confirmation | Must match password                                              | "Your passwords do not match"                                                       |
| Terms checkbox        | Must be checked                                                  | "Please accept the Terms of Service and Privacy Policy to continue"                 |

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

| Field                | Rule                                                             | Error message                                                                       |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| New password         | Required, minimum 12 characters, must contain letters and digits | "Your password must be at least 12 characters and include both letters and numbers" |
| Confirm new password | Must match                                                       | "Your passwords do not match"                                                       |

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

**Revised 2026-06-01 (DR-FD-001):** the funder name field was replaced with a searchable picker over the approved `funders` directory (FR-15, FR-46).

| Element                       | Detail                                                                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                       | "Start a new application" (new application); "Continue your application" (returning to an existing application)                                                         |
| Funder picker                 | Searchable dropdown/combobox populated from the active `funders` table, required. Label: "Who is offering this grant?" Placeholder: "Search for a funder..."            |
| "My funder isn't listed" link | Below the picker: "My funder isn't listed -- request it" -- opens a funder-request form (mailto or Tally in v1)                                                         |
| Coverage tier (FR-46)         | The funder's coverage tier (Tier 1 Full / Tier 2 Partial / Tier 3 Guidance) is shown alongside the selected funder. **Build status not confirmed -- see Section 6.11.** |
| Grant name                    | Text, required. Label: "What is the grant called?" Placeholder: "e.g. Awards for All England"                                                                           |
| Continue                      | Creates application record (`not_started`), advances to Step 2                                                                                                          |
| Cancel                        | Returns to `/dashboard` -- no record created                                                                                                                            |

**Validation:** Funder: "Please select a funder from the list" (must be selected from the directory, free text is no longer accepted) / Grant name: "Please enter the grant name"

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

| Element                                        | Detail                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                                        | "Your funder guidelines -- summary"                                                                                                                                                                                                                                                                                                                                              |
| Progress                                       | "Reading your funder guidelines..." then "Almost there..."                                                                                                                                                                                                                                                                                                                       |
| Summary content                                | AI-generated plain-English digest: what the grant is for, who can apply, funder priorities, evidence expectations, extracted questions with explanations                                                                                                                                                                                                                         |
| Questions found                                | "We found [n] application questions in these guidelines. We'll use these to generate your draft answers in the next step."                                                                                                                                                                                                                                                       |
| Questions not found                            | "We couldn't identify specific application questions in this document. In the next step, you'll be able to enter your questions manually."                                                                                                                                                                                                                                       |
| Coverage tier (FR-46)                          | Summary card shows the funder's coverage tier (Tier 1 Full / Tier 2 Partial / Tier 3 Guidance). **Build status not confirmed -- see Section 6.11.**                                                                                                                                                                                                                              |
| Eligibility mismatch (FR-47, added 2026-06-02) | If the AI detects a clear mismatch between the charity profile and the funder's eligibility criteria, Continue is hidden and a red warning card is shown instead: "Eligibility mismatch -- this application cannot proceed" with a specific or default reason. Acknowledging sets status to `mismatch` (terminal -- no override) and returns to the dashboard. See Section 6.12. |
| Regenerate                                     | "Regenerate summary" -- secondary action, counts as one AI request                                                                                                                                                                                                                                                                                                               |
| Continue                                       | "This looks right -- continue" -- advances to Step 4                                                                                                                                                                                                                                                                                                                             |
| Back                                           | Returns to Step 2                                                                                                                                                                                                                                                                                                                                                                |
| API failure                                    | "We couldn't generate your summary right now. This is usually temporary -- please try again." with Try again button                                                                                                                                                                                                                                                              |

---

**Step 4 -- Draft Answers (rewritten 2026-05-28 for the Q&A model; updated 2026-06-04)**

The auto-generation model originally specified here (AI writes a draft for every question on arrival) was abandoned -- see Section 6.6. Step 4 is now a charity-authored Q&A interview, preceded by a one-time preparation checklist.

**Preparation checklist (shown once, on first arrival at Step 4 only):**

| Element         | Detail                                                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading         | "Before you begin writing"                                                                                                                                                                                                                                              |
| Message         | "The financial sections of this application cannot be completed by AI. Before you start, gather:"                                                                                                                                                                       |
| Checklist       | 1. Most recent annual accounts or financial statements 2. Projected budget for the grant period (income and planned expenditure) 3. Details of other funding secured or applied for 4. Input from your treasurer, finance lead, or a trustee who understands the budget |
| Warning note    | "It is worth involving a senior colleague -- such as your CEO, treasurer, or a trustee -- before reaching the financial questions."                                                                                                                                     |
| Continue button | "I have what I need -- start writing" -- advances to the Q&A interface; not shown again on return visits                                                                                                                                                                |
| Back            | Returns to Step 3                                                                                                                                                                                                                                                       |

**Q&A interface (shown on every visit after the checklist is passed once):**

| Element                 | Detail                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Heading                 | "Your draft answers"                                                                                                                                                                                               |
| Sub-heading             | "Answer each question below. Your work is saved automatically as you type." (structured funder) or the free-form equivalent                                                                                        |
| Progress indicator      | Sticky bar at top: "X of N questions approved"                                                                                                                                                                     |
| Question/section cards  | One card per extracted question (or narrative section for free-form funders); textarea starts **empty** -- there is no AI-generated text to edit                                                                   |
| Word/character counter  | Below each textarea: "X / N words" or "X / N characters" where the funder sets a limit (FR-29); a plain word count where it does not                                                                               |
| Over-limit hard stop    | When the answer exceeds its limit, the approve panel is hidden and a red message shown: "Your answer exceeds the funder's word limit. Please trim it or use AI to bring it within the limit before approving."     |
| "Help me improve this"  | Shown on non-budget questions once the answer is non-empty. Returns a "SUGGESTED IMPROVEMENT" card with **"Use this improved version"** and **"Keep my original"** actions. Counts as one AI request               |
| Budget question styling | Amber border, "Budget" badge, no AI assist button. Label: "This section requires your actual financial data -- do not use AI-generated figures." Must be filled in before assembly                                 |
| Per-question approval   | "Before you approve, check:" prompts plus an "Approve this answer" button on each card (Section 6.7). Editing an approved answer clears its approval                                                               |
| Optional questions      | Questions containing "(optional)" show the approve panel even when empty, letting the user explicitly skip them; excluded from the assembly gate                                                                   |
| Manual entry            | If no questions/sections were extracted in Step 3, the user sees a manual entry field to add a question and write their own answer                                                                                 |
| Ready to assemble       | Active once every mandatory question is approved (greyed out otherwise); leads to the senior-review prompt, then assembly, then Step 5                                                                             |
| AI service unavailable  | When the AI kill switch is active: "The AI service is temporarily unavailable. Please try again later." shown inline on the card; no quota consumed                                                                |
| Back                    | Returns to Step 3                                                                                                                                                                                                  |
| API failure             | "We couldn't generate your draft right now. This is usually temporary -- please try again." with Try again button (shown on an AI-assist failure, not on page load -- there is no page-load AI call in this model) |
| Usage warning           | "You've used most of your monthly AI allowance." (at 40 of 50 requests, 80% of limit)                                                                                                                              |
| Limit reached           | "You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch." "Help me improve this" buttons disabled; writing and saving answers is never restricted                      |

---

**Step 5 -- Approve & Export (checkboxes added 2026-06-01; approve+download collapsed into one action 2026-06-12)**

| Element                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                 | "Review and approve your application"                                                                                                                                                                                                                                                                                                                                                                                        |
| Content                 | Read-only view of the assembled draft -- all questions and approved answers                                                                                                                                                                                                                                                                                                                                                  |
| Confirmation checkboxes | **Three mandatory checkboxes, all of which must be ticked** before the download buttons activate (Section 6.7): (1) "I have reviewed all responses in full and am satisfied with their content." (2) "The information provided is accurate and complete to the best of my knowledge." (3) "I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted." |
| Export buttons          | "Download as Word document (.docx)" and "Download as plain text (.txt)" -- both disabled until all three checkboxes are ticked. On first click: the application is approved (status → `approved`) and the download begins immediately in the same action -- there is no separate "Approve my application" button or intermediate confirmation modal                                                                          |
| Re-export warning       | Shown if previously exported (see Section 6.8 for wording)                                                                                                                                                                                                                                                                                                                                                                   |
| Re-open link            | "Re-open application to make changes" -- always shown; opens a confirmation modal; on confirm, resets status to `in_progress`, clears the assembled draft and all per-question approvals, and redirects to Step 4. This is the only route back to Step 4 from Step 5 -- there is no plain Back link                                                                                                                          |

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

| Field                | Rule                                                             | Error                                                                               |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Current password     | Required, must match stored password                             | "Your current password is incorrect"                                                |
| New password         | Required, minimum 12 characters, must contain letters and digits | "Your password must be at least 12 characters and include both letters and numbers" |
| Confirm new password | Must match new password                                          | "Your passwords do not match"                                                       |

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

All data is stored in PostgreSQL via Supabase (London region). Authentication is managed by Supabase Auth. No persistent data is held at the application layer. Full field-level detail is in `docs/data-model.md`.

### 9.1 Entities

**Updated 2026-07-10** to add the `funders` table (added 2026-06-01, DR-FD-001, missing from this table since) and to reflect the current field picture per `docs/data-model.md` v1.4.

| Entity                | Type              | Purpose                                                                                                                                                                                                                                                                       |
| --------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.users`          | Supabase Auth     | Authentication credentials and email verification                                                                                                                                                                                                                             |
| `user_profiles`       | Application table | First name, last name, feedback consent                                                                                                                                                                                                                                       |
| `funders`             | Application table | The approved funder directory used to populate the Step 1 picker (FR-15). Global reference table, not user-scoped -- users can read active funders but not write to it. **Added 2026-06-01 (DR-FD-001)**                                                                      |
| `charity_profiles`    | Application table | Charity organisational information used as AI context. Extended 2026-05-29 into a "thick profile" (identity, mission/work, financial fields, governance facts) -- see `docs/data-model.md` Section 2 for exactly which of these fields are built versus still documented-only |
| `applications`        | Application table | Application records with status (including the `mismatch` terminal status, FR-47) and step tracking; `funder_id` links to `funders`                                                                                                                                           |
| `application_answers` | Application table | Question and answer pairs per application, including `question_type`, `word_limit`/`char_limit`/`limit_type`, `is_budget_question`, and `is_approved` fields added for the Q&A model (Section 6.6, 6.7)                                                                       |
| `ai_usage_log`        | Application table | Per-user AI request tracking for monthly limit enforcement (50/month -- Section 10.5)                                                                                                                                                                                         |

### 9.2 Relationships

| Relationship                       | Cardinality |
| ---------------------------------- | ----------- |
| User to user_profile               | One-to-one  |
| User to charity_profile            | One-to-one  |
| User to applications               | One-to-many |
| Funder to applications             | One-to-many |
| Application to application_answers | One-to-many |
| User to ai_usage_log               | One-to-many |
| Application to ai_usage_log        | One-to-many |

### 9.3 Data Not Stored

**True today; changing under Phase 6 -- see note below the table.**

| Item                                       | Reason                                                 |
| ------------------------------------------ | ------------------------------------------------------ |
| Funder guidelines (file or text)           | Used for AI processing within the session only (FR-22) |
| Raw AI prompts                             | Held in `lib/prompts.ts` in the codebase               |
| Raw API responses beyond extracted outputs | Only processed outputs are stored                      |
| Beneficiary personal data                  | Out of scope                                           |

**Forward note (added 2026-07-10):** `ADR-DATA-002` originally justified never storing funder guidelines on the grounds that they "may contain commercially sensitive information." That premise was checked on 2026-07-10 against the real 21-document corpus Grant Pathway processes and found unsupported -- these are funders' own publicly published guidance. The ADR was formally revised the same day: guideline text **will** be retained (extracted, page/section-tagged text in Postgres, cascade-deleting with the owning application; retained indefinitely where it backs an approved playbook) once Phase 6 (P6.2a onward) ships. As of this pass, that retention mechanism **has not been built** -- the table above remains an accurate description of the product as it exists in production today. This mirrors how `ADR-DATA-001` treats the item-graph model superseding `application_answers`: a documented future direction, not yet a change to what is live. Track this via `ADR-DATA-002`'s 2026-07-10 revision and the Phase 6 build plan.

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

**Updated 2026-07-10** to reflect the Q&A model (Section 6.6) and the actual `request_type` values used in the live `generate-summary` and `refine-answer` routes:

| Type                 | Used at       | Inputs                                                                                                                                                                                                                                 |
| -------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `guideline_summary`  | Step 3        | Funder guidelines text + charity profile                                                                                                                                                                                               |
| `refine_answer`      | Step 4        | The charity's own written answer text + the question + its word/character limit (if any) -- **not** funder summary or charity profile; the assist may only restructure/clarify what the charity already wrote, not draw on new context |
| `charity_paraphrase` | Profile setup | Charity Commission lookup result text, paraphrased for the profile fields (authenticated and metered since 2026-06-22)                                                                                                                 |

**Discrepancy resolved 2026-07-10:** `docs/data-model.md`'s documented `ai_usage_log.request_type` enum previously omitted `refine_answer` (the value the live `refine-answer` route actually writes, confirmed in `app/api/refine-answer/route.ts`) — corrected there to list all five DB enum values, with a note on which are live vs. dead.

**Dead code removed 2026-07-10:** the follow-up flagged in 0.4 is now closed. `lib/prompts.ts` no longer exports `buildDraftPrompt` (or the `ApplicationQuestion` type used only by it) — removed along with its dedicated tests in `__tests__/prompts.test.ts`; confirmed zero remaining references, `tsc --noEmit`/lint/test suite all clean. `lib/prompts.ts` now exports exactly the two prompt builders actually used by live routes: `buildSummaryPrompt` and `buildRefinePrompt`.

### 10.3 Processing Mode

AI requests are batch (not streaming). Staged progress indicator messages are shown to the user while the request is in flight. The Continue button is unavailable until processing is complete.

### 10.4 Context Window Management

If the funder guidelines document exceeds 100,000 tokens, a soft warning is displayed to the user before proceeding:

> "Your guidelines document is quite long. For the best results, we recommend uploading only the core sections -- such as eligibility criteria, application questions, and assessment criteria. Very long documents may reduce the quality of your AI summary."

The user may proceed with the full document. The warning is informational only.

### 10.5 Cost Controls

| Control                | Detail                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Per-user monthly limit | 50 AI requests per user per calendar month (raised from 20 on 2026-06-17, across all three AI routes) |
| Warning threshold      | Soft warning shown at 40 requests (80%)                                                               |
| Hard limit             | AI assist blocked at 50 requests; writing and saving answers is never restricted                      |
| Monitoring             | Usage tracked in `ai_usage_log` table; Amazon Bedrock / AWS console spend cap set as backstop         |
| Monthly target         | Under £100/month total API spend (C1)                                                                 |

### 10.6 Error Handling

| Scenario                             | User-facing behaviour                                                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API error or timeout (Step 3)        | Progress indicator replaced with error message and Try again button                                                                                                                   |
| API error or timeout (Step 4)        | Inline error shown on the affected question card ("Help me improve this" call failed) with a Try again option -- there is no page-load AI call to fail in the Q&A model (Section 6.6) |
| Monthly limit reached                | "Help me improve this" buttons disabled across Step 4; limit message shown. Writing and saving your own answers is never restricted                                                   |
| No manual fallback for AI failure    | Users cannot manually trigger alternative AI processing -- retry is the only option; writing an answer manually is always available regardless of AI status                           |
| AI service unavailable (kill switch) | When `AI_ENABLED=false`, AI routes return HTTP 503 immediately; message: "The AI service is temporarily unavailable. Please try again later." No quota consumed. Added 2026-06-29     |

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

**Updated to reflect the Q&A model (Section 6.6) -- there is no longer a single "AI draft answer generation" step to time; the equivalent live metric is the per-question "Help me improve this" refine action.**

| Metric                                                            | Target           |
| ----------------------------------------------------------------- | ---------------- |
| Page loads and navigation                                         | Under 3 seconds  |
| AI guideline summarisation -- standard documents (up to ~8 pages) | Under 30 seconds |
| AI guideline summarisation -- large documents (over 8 pages)      | Under 45 seconds |
| AI answer refine ("Help me improve this", per question)           | Under 15 seconds |

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

| Control               | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Encryption in transit | TLS 1.2 or higher; HTTPS enforced across all pages and API calls                                                                                                                                                                                                                                                                                                                                                                 |
| Encryption at rest    | Database-level encryption enabled on all data stores                                                                                                                                                                                                                                                                                                                                                                             |
| Passwords             | Minimum 12 characters, must contain both letters and digits; leaked-password check enabled (HaveIBeenPwned); secure password change enabled; current password required to change password. Hardened 2026-06-29 (VQ-009), up from a 6-character minimum with no complexity rules. Client-side forms (register, reset, account settings) enforce the same 12-character/letters-and-digits rule as of 2026-07-10 -- see Section 6.1 |
| MFA                   | ~~Available as opt-in (FR-07, Should Have); not mandatory~~ -- **Not offered.** FR-07 demoted to Won't Have 2026-06-12; fully removed from the codebase. See Section 3.3 for the risk analysis                                                                                                                                                                                                                                   |
| Session timeout       | Automatic logout after 60 minutes of inactivity                                                                                                                                                                                                                                                                                                                                                                                  |
| Security baseline     | OWASP Top 10                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Secrets management    | No credentials or API keys committed to the repository (private, proprietary licence)                                                                                                                                                                                                                                                                                                                                            |

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

Full detail in `docs/PRD inputs/success-metrics.md`. All metrics are derived from Supabase data records. No third-party analytics platform is included in v1.

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

**Updated 2026-07-10 -- status corrected against `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` (P5.1).** All three items have progressed substantially since this section was last written; none is now fully closed, but none is "to be confirmed" or "to be drafted" from a standing start either.

| Item                         | Requirement                                                                                                                                                                                                                                                                            | Status                                                                                                                                                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS Data Processing Addendum | Confirm that the AWS Data Processing Addendum covers Amazon Bedrock usage and satisfies UK GDPR obligations before launch. AI processing occurs within UK/EEA via Bedrock eu-west-2 (In-Region primary, EU Geo fallback) -- no international transfer or SCCs are required (DR-DP-002) | **Confirmed (2026-06-22).** Model invocation logging confirmed disabled in the Bedrock eu-west-2 console; the AWS DPA is automatically in force via AWS Service Terms, no separate acceptance required. See `docs/legal/AWS-DPA-reference.md` and the DR-DP-003 review note. |
| Terms of Service             | Publish Terms of Service before launch. Must state: Grant Pathway does not guarantee funding outcomes; does not submit applications on behalf of charities; makes no representations to funders                                                                                        | **Live (built 2026-06-10).** `/terms` renders `docs/legal/terms-of-service.md` (v1.2). **Outstanding before P5.1 can close:** the effective date is still `[TO BE CONFIRMED]` in the source document, and solicitor review has not yet taken place.                          |
| Privacy Policy               | Publish Privacy Policy before launch. Must cover: data collected, Supabase London hosting, Vercel global edge, AI processing via Amazon Bedrock eu-west-2 (UK/EEA -- data does not leave UK/EEA), no-AI-training commitment, user rights, retention periods                            | **Live (built 2026-06-10).** `/privacy` renders `docs/legal/privacy-policy.md` (v1.4). Same two items outstanding: effective date `[TO BE CONFIRMED]`, solicitor review pending.                                                                                             |

A compliance review window remains reserved in the project timeline ahead of launch; the launch date itself is not committed (see Section 1) and is no longer tied to a fixed calendar date.

---

## 16. Acceptance Criteria

Testable Given/When/Then acceptance criteria for all functional requirements are defined in:

`docs/PRD inputs/acceptance-criteria.md`

Criteria are organised by the same functional sections used in this document. Should Have requirements include criteria that apply only if the requirement is built. **Updated 2026-07-10:** that document now includes a full FR-45/46/47 section (Section 9.10) and a FR-48 section (Section 9.11), FR-29 is corrected to Must Have, and the FR-31A numbering gap against the canonical FR-01 to FR-48 list is explicitly flagged there (not silently resolved, since it is real, built, and already load-bearing in code comments -- see that document's FR-31A note).

---

## Appendix A -- Glossary

| Term                   | Definition                                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS DPA                | AWS Data Processing Addendum -- governs how Amazon Web Services (including Bedrock) processes customer data, satisfying UK GDPR obligations                                                                                                                                                                                                 |
| Charity Commission API | The public API provided by the Charity Commission for England and Wales, used to look up registered charity details                                                                                                                                                                                                                         |
| CIC                    | Community Interest Company -- the intended long-term legal structure for owning and operating Grant Pathway                                                                                                                                                                                                                                 |
| CVS                    | Council for Voluntary Service -- local infrastructure bodies that support charities and voluntary organisations                                                                                                                                                                                                                             |
| HaveIBeenPwned         | A public database of passwords known to have been exposed in prior data breaches -- Supabase Auth checks new passwords against it as a leaked-password check (enabled 2026-06-29, VQ-009)                                                                                                                                                   |
| NCSC                   | National Cyber Security Centre -- source of the original UK password guidance referenced in NFR-04 (10-character minimum, no complexity rules). The live policy has since been hardened beyond pure NCSC minimalism to a 12-character minimum with mandatory letters and digits, plus the HaveIBeenPwned leaked-password check (2026-06-29) |
| OWASP Top 10           | Open Worldwide Application Security Project's list of the ten most critical web application security risks                                                                                                                                                                                                                                  |
| SCCs                   | Standard Contractual Clauses -- contractual mechanisms used to legitimise international data transfers under UK GDPR                                                                                                                                                                                                                        |
| WCAG 2.2 AA            | Web Content Accessibility Guidelines version 2.2, Level AA -- the accessibility standard the application must meet                                                                                                                                                                                                                          |
| shadcn/ui              | UI component library built on Radix UI primitives and Tailwind CSS -- the chosen component library for v1                                                                                                                                                                                                                                   |
| Supabase               | Managed PostgreSQL database and authentication service used for all data storage (London region)                                                                                                                                                                                                                                            |

---

## Appendix B -- Related Documents

**Paths corrected 2026-07-10.** All entries below used a stale `business/...` prefix; the live repository holds these under `docs/...`. Two entries have also moved to a different subfolder, not just a prefix swap: the Business Requirements Document and the Technology Stack document (see notes below the table).

| Document                            | Location                                                     | Purpose                                                  |
| ----------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| Business Requirements Document      | `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-v0.6.md` | Business context, constraints, risks, and stakeholders   |
| Non-Functional Requirements         | `docs/non-functional-requirements.md`                        | Full NFR detail                                          |
| Data Model                          | `docs/data-model.md`                                         | Entity definitions, field-level detail, relationships    |
| MoSCoW Feature Register             | `docs/moscow-feature-register.md`                            | Consolidated feature priorities and BRD divergences      |
| IA & Navigation                     | `docs/information-architecture-and-navigation.md`            | Route structure, nav components, user flows              |
| Screen Requirements                 | `docs/PRD inputs/screen-requirements.md`                     | Full screen-level field and validation detail            |
| Acceptance Criteria                 | `docs/PRD inputs/acceptance-criteria.md`                     | Given/When/Then criteria for all functional requirements |
| Application Status Model            | `docs/PRD inputs/application-status-model.md`                | Status definitions, transitions, deletion prompts        |
| Email Notifications                 | `docs/PRD inputs/email-notifications.md`                     | Full email body content and trigger rules                |
| Success Metrics                     | `docs/PRD inputs/success-metrics.md`                         | Full metrics detail with measurement approach            |
| PRD Decisions Index                 | `docs/PRD decisions/PRD-DECISIONS-INDEX.md`                  | PRD decision records                                     |
| User Personas, Journeys & Use Cases | `docs/user-personas-journeys-and-use-cases.md`               | Full persona and journey detail                          |
| Technology Stack                    | `docs/Technical Decision and Design/technology-stack.md`     | Full technology stack detail                             |
| Future Phases                       | `docs/future-phases.md`                                      | Post-v1 roadmap items                                    |

**Notes on relocations:** the Business Requirements Document is not at a top-level `docs/BRD-Grant-Pathway-v1.md` path -- the current, authoritative BRD lives in the `docs/BRD plus decisions Mark Two/` subfolder as `BRD-Grant-Pathway-v0.6.md` (see the filename/version mismatch correction note under Document Control). The Technology Stack document is not at a top-level `docs/technology-stack.md` path -- it lives in `docs/Technical Decision and Design/technology-stack.md`.

---

_Document status: Version 0.8 Draft_
_Compliance section (Section 15) -- AWS DPA confirmed 2026-06-22; Terms of Service and Privacy Policy are live, with effective dates and solicitor review still outstanding before P5.1 can close. See Section 15 for full detail._
_Last updated: 2026-07-10_
