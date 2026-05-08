# Grant Pathway — Implementation Plan v1.0

**Date:** 2026-04-26
**Status:** Active
**Owner:** Rapidglobe Ltd
**Launch target:** 31 July 2026

---

## Contents

1. [Build Approach](#1-build-approach)
2. [Guiding Principles](#2-guiding-principles)
3. [Prerequisites](#3-prerequisites)
4. [Milestone Overview](#4-milestone-overview)
5. [Detailed Milestones](#5-detailed-milestones)
6. [BRD Gap Analysis](#6-brd-gap-analysis)
7. [AI-Assisted Session Notes](#7-ai-assisted-session-notes)

---

## 1. Build Approach

This plan combines three complementary build strategies:

**Option 3 — AI-Assisted Development (primary)**
Claude Code is used throughout as the development tool. Every file the AI generates is reviewed and understood before being committed. The technical design document and relevant ADRs are provided as context at the start of each session. No code is shipped that the developer cannot explain.

**Option 2 — MVP-First Sequencing**
The core five-step application flow is built and working end-to-end before operational polish is added. MVP does not mean cutting features or corners on security — the full auth middleware, RLS policies, Zod validation, and file handling pipeline are always built first. It means sequencing: working product before Sentry, session timeout UI, and accessibility audit.

**Elements of Option 1 — Full Build as Designed**
Every ADR decision is honoured. There are no shortcuts on foundations. The complete BRD feature set is delivered — nothing is deferred from scope unless explicitly recorded. The pre-launch checklist in the technical design is completed in full before any user accesses the production environment.

---

## 2. Guiding Principles

1. **Review every generated file.** AI-generated code is a starting point, not a finished product. Every file is read, understood, and tested before being committed.
2. **No secrets in the repository, ever.** `.env.local` is in `.gitignore`. No credentials appear in any committed file.
3. **All changes go through migrations.** No direct schema changes in the Supabase dashboard. Every schema change is a migration file committed to Git.
4. **Security is foundational, not a phase.** RLS, middleware, Zod validation, and HTTP headers are built in Milestone 0 — not added later.
5. **Accessibility is designed in.** WCAG 2.2 AA is a requirement from the first UI component, not a retrofit.
6. **The technical design is the spec.** Where this plan and the technical design conflict, the technical design takes precedence. Where the BRD and the technical design conflict, this plan notes the gap and the BRD takes precedence.
7. **Done criteria are gates.** A milestone is not complete until every done criterion is confirmed. No proceeding to the next milestone on partial completion.

---

## 3. Prerequisites

Before work begins, confirm the following are in place:

| # | Prerequisite | Notes |
|---|---|---|
| P-01 | Node.js 20+ installed | Verify with `node --version` |
| P-02 | Docker Desktop installed with WSL2 backend (Windows) | Required for local Supabase stack |
| P-03 | Supabase CLI installed | `npm install -g supabase` |
| P-04 | Git installed and configured | GitHub private repo ready |
| P-05 | GitHub repository created | Private; `grant-pathway` or `grant-pathway-app` |
| P-06 | Anthropic API key obtained | For local development use |
| P-07 | Upstash account created | Free tier sufficient for development |
| P-08 | VS Code installed | Recommended IDE (C18) |
| P-09 | Domain `grantpathway.org.uk` acquired | Required for pre-launch |
| P-10 | Charity Commission API access confirmed | Public API; verify endpoint availability |

---

## 4. Milestone Overview

| Milestone | Name | Delivers | BRD FRs Covered |
|---|---|---|---|
| M0 | Project Foundation | Running Next.js app, full schema, auth infrastructure | — |
| M1 | Authentication & Registration | Register, verify, login, MFA opt-in, feedback consent | FR-01–FR-08 |
| M2 | Charity Profile | Profile creation with Charity Commission API lookup | FR-09–FR-14 |
| M3 | Dashboard & Application Management | Create, list, rename, delete applications | FR-15–FR-20 |
| M4 | Step 1 — Application Details | Application details form, step locking | FR-15 (detail) |
| M5 | Step 2 — Funder Guidelines | File upload pipeline, text paste, extraction | FR-21–FR-23 |
| M6 | Step 3 — AI Summary | AI guideline summarisation, loading states, error handling | FR-24–FR-27 |
| M7 | Step 4 — Draft Answers & Approval | Draft generation, review/approval workflow, auto-save | FR-28–FR-36 |
| M8 | Step 5 — Review & Export | Final review, Word + plain text export | FR-37–FR-39 |
| M9 | Operational Layer | Session timeout, account deletion, cron, Sentry, metrics | FR-06, FR-40–FR-44 |
| M10 | Legal & Compliance | Privacy Policy, Terms of Service, Anthropic DPA | BRD Section 14 |
| M11 | Pre-Launch | Production environment, full checklist, launch | All |

**Sequencing constraint:** M0 must be complete before any other milestone begins. M1 must be complete before M2. M2 must be complete before M3. M3 through M5 can be done in sequence or with minor overlap. M6, M7, M8 must follow their numbered order. M9, M10 can run in parallel with M6–M8 once M3 is stable. M11 cannot begin until all other milestones are complete.

---

## 5. Detailed Milestones

---

### M0 — Project Foundation

**Summary:** Creates the project from scratch, establishes the database schema (including fields identified in the BRD gap analysis), configures authentication infrastructure, and commits a working baseline to GitHub. Nothing else can begin until this milestone is green.

**BRD requirements:** None directly — this is infrastructure.
**ADRs:** STACK-001, STACK-002, STACK-003, STACK-004, STACK-005, STACK-006, DATA-001, DATA-004, SEC-001, SEC-002, SEC-004, SEC-006

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M0-01 | Scaffold Next.js project | `npx create-next-app@latest grant-pathway --typescript --tailwind --app --import-alias "@/*"` |
| M0-02 | Install core dependencies | `@supabase/ssr`, `@supabase/supabase-js`, `@anthropic-ai/sdk`, `unpdf`, `mammoth`, `docx`, `@upstash/ratelimit`, `@upstash/redis`, `zod` — **do not install `@sentry/nextjs` here**; Sentry is installed via the wizard in M9-07 (ADR-OPS-005) |
| M0-03 | Initialise shadcn/ui | `npx shadcn@latest init` — use teal `#0D6E6E` as primary, Inter as font (ADR-STACK-006) |
| M0-04 | Add shadcn/ui components | `button`, `input`, `label`, `textarea`, `form`, `card`, `badge`, `separator`, `toast`, `dialog`, `alert-dialog`, `progress`, `navigation-menu`, `dropdown-menu` |
| M0-05 | Configure Tailwind design tokens | Add to `tailwind.config.ts`: `teal: '#0D6E6E'`, `teal-light: '#E6F4F4'`, `amber: '#D97706'`, `slate: '#1E293B'`, `off-white: '#F8FAFC'`, `success: '#16A34A'` |
| M0-06 | Create directory structure | Per technical design Section 4: `app/(public)/`, `app/(authenticated)/`, `app/api/`, `actions/`, `components/ui/`, `lib/supabase/`, `supabase/migrations/`, `types/` |
| M0-07 | Define shared TypeScript types | Create `types/index.ts` — lock these before any other work; see schema below |
| M0-08 | Initialise local Supabase | `supabase init`, then `supabase start` (requires Docker Desktop running) |
| M0-09 | Write initial migration | `supabase/migrations/[timestamp]_initial_schema.sql` — full schema including BRD gap fields (see below) |
| M0-10 | Write seed data | `supabase/seed.sql` — one sample user, one charity profile, two sample applications |
| M0-11 | Set up Supabase clients | `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts` per technical design Section 5 |
| M0-12 | Create auth middleware | `middleware.ts` — session refresh, route protection, matcher config per technical design Section 5 |
| M0-13 | Create route group layouts | `app/(public)/layout.tsx` (no nav), `app/(authenticated)/layout.tsx` (nav placeholder, banner placeholder) |
| M0-14 | Configure HTTP security headers | `next.config.js` — all headers per ADR-SEC-004 and technical design Section 13 |
| M0-15 | Create environment variables | `.env.example` with all 8 variables; `.env.local` with local Supabase values from `supabase status`; confirm `.env.local` in `.gitignore` |
| M0-16 | Apply migrations and verify | `supabase db reset`; confirm all tables in Supabase Studio at `http://localhost:54323` |
| M0-17 | Initial GitHub commit | Create private repo; push all foundation files; add `README.md` with setup instructions |

**Schema — full initial migration:**

```sql
-- user_profiles
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  feedback_consent boolean DEFAULT false,   -- FR-08: recorded at registration
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- charity_profiles
CREATE TABLE charity_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  charity_name text,
  charity_number text,
  registered_address text,                  -- FR-12 (gap: not in technical design)
  charitable_objects text,                  -- FR-12 (gap: not in technical design)
  mission_statement text,
  beneficiaries text,
  programmes text,
  geographic_area text,                     -- FR-12 (gap: not in technical design)
  annual_income_band text,                  -- FR-12 (gap: not in technical design)
  impact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- applications
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  funder_name text NOT NULL,
  fund_name text,
  deadline date,
  amount_sought integer,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'complete')),
  current_step integer DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
  ai_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- application_answers
CREATE TABLE application_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  answer_text text,
  word_limit integer,
  is_approved boolean DEFAULT false,        -- FR-33/FR-36 (gap: not in technical design)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ai_usage_log
CREATE TABLE ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  request_type text CHECK (request_type IN ('summary', 'draft')),
  application_id uuid,
  created_at timestamptz DEFAULT now()
);

-- RLS: enable on all tables, default deny
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS policies: own rows only (user_id = auth.uid())
-- [Full policy definitions per ADR-SEC-002 and technical design Section 6]
-- ai_usage_log: UPDATE and DELETE denied to prevent quota bypass
```

**Types file (`types/index.ts`) — lock before parallel work:**

```typescript
export type ApplicationStatus = 'draft' | 'in_progress' | 'complete';
export type StepNumber = 1 | 2 | 3 | 4 | 5;
export type AIRequestType = 'summary' | 'draft';

export interface UserProfile { id: string; email: string; full_name: string | null; feedback_consent: boolean; created_at: string; updated_at: string; }
export interface CharityProfile { id: string; user_id: string; charity_name: string | null; charity_number: string | null; registered_address: string | null; charitable_objects: string | null; mission_statement: string | null; beneficiaries: string | null; programmes: string | null; geographic_area: string | null; annual_income_band: string | null; impact: string | null; created_at: string; updated_at: string; }
export interface Application { id: string; user_id: string; funder_name: string; fund_name: string | null; deadline: string | null; amount_sought: number | null; status: ApplicationStatus; current_step: StepNumber; ai_summary: string | null; created_at: string; updated_at: string; }
export interface ApplicationAnswer { id: string; application_id: string; user_id: string; question_text: string; answer_text: string | null; word_limit: number | null; is_approved: boolean; created_at: string; updated_at: string; }
export interface AIUsageLog { id: string; user_id: string; request_type: AIRequestType; application_id: string | null; created_at: string; }
```

**Done criteria:**
- `npm run dev` opens a Next.js page without errors
- `supabase start` is running; all five tables visible in Supabase Studio
- Unauthenticated request to `/dashboard` redirects to `/sign-in`
- Request to `/sign-in` while authenticated redirects to `/dashboard`
- `.env.local` is not tracked by Git (`git status` confirms)
- All 5 tables have RLS enabled (visible in Supabase Studio → Authentication → Policies)

---

### M1 — Authentication & Registration

**Summary:** A new user can register with their full name, email, and password (minimum 10 characters). They receive a verification email, confirm it, and gain access to the app. Existing users can sign in, reset their password, and sign out. MFA is available as an opt-in. At registration, the user is asked if they are willing to participate in a feedback interview.

**BRD requirements:** FR-01, FR-02, FR-03, FR-04, FR-05, FR-06 (session timeout — defer UI to M9, middleware enforced here), FR-07, FR-08
**ADRs:** STACK-003, SEC-001, SEC-003

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M1-01 | Landing page | `app/(public)/page.tsx` — static, Grant Pathway branding, CTA buttons to register and sign-in; warm, encouraging tone per brand guide |
| M1-02 | Register page | `app/(public)/register/page.tsx` — fields: full name, email, password (min 10 chars — FR-02) |
| M1-03 | Feedback consent prompt | At bottom of registration form: plain-language question asking if willing to participate in a feedback interview; checkbox; response stored in `user_profiles.feedback_consent` (FR-08) |
| M1-04 | Register Server Action | `actions/auth.ts` → `registerUser(data)` — Zod validation, `supabase.auth.signUp()`, insert `user_profiles` row with `feedback_consent` value |
| M1-05 | Email verification | Local: Supabase Inbucket at `http://localhost:54324`; production: Resend (configured in M11); verification required before account activation (FR-03) |
| M1-06 | Sign-in page | `app/(public)/sign-in/page.tsx` — email + password; `supabase.auth.signInWithPassword()`; redirect to `/dashboard` on success |
| M1-07 | Forgot password page | `app/(public)/forgot-password/page.tsx` — email input; `supabase.auth.resetPasswordForEmail()`; confirmation state |
| M1-08 | Reset password page | `app/(public)/reset-password/page.tsx` — new password form; `supabase.auth.updateUser()`; redirect to `/sign-in` |
| M1-09 | Navigation bar | `components/nav.tsx` — Client Component; logo/app name; Dashboard and Profile links; Sign Out button; active route highlight |
| M1-10 | Sign out | `supabase.auth.signOut()` from nav; redirect to `/sign-in` |
| M1-11 | MFA opt-in | FR-07: Enable MFA in Supabase Auth dashboard; expose opt-in toggle in Account Settings page (built in M9); do not make it mandatory |
| M1-12 | Wire nav into authenticated layout | `app/(authenticated)/layout.tsx` — import and render Nav component |
| M1-13 | Password strength indicator | Visual indicator on register and reset password forms; minimum 10 characters enforced (FR-02); follow NCSC guidance — no mandatory complexity rules |

**Done criteria:**
- New user can register, receive verification email (Inbucket locally), confirm, and reach the dashboard
- Sign in with wrong password shows a clear error message
- Forgot password flow sends reset email and allows password update
- `user_profiles` row created on registration with `feedback_consent` value set
- Unverified account cannot access authenticated routes
- `full_name` and `feedback_consent` visible in Supabase Studio for the test user

---

### M2 — Charity Profile

**Summary:** A registered user can enter their charity profile. The app first asks for their Charity Commission registration number and calls the Charity Commission public API to pre-fill fields. Where the API fails or the charity is not found, manual entry is available. The profile includes all fields required by FR-12. The profile can be updated at any time.

**BRD requirements:** FR-09, FR-10, FR-11, FR-12, FR-13, FR-14
**ADRs:** DATA-001

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M2-01 | Charity number lookup component | `components/charity-lookup.tsx` — Client Component; charity number input; "Look up" button; calls internal API route |
| M2-02 | Charity Commission API route | `app/api/charity-lookup/route.ts` — POST with charity number; calls Charity Commission public API (`api.charitycommission.gov.uk`); returns charity name, registered address, charitable objects; returns clear error if not found (FR-10, FR-11) |
| M2-03 | Charity profile page | `app/(authenticated)/profile/page.tsx` — Server Component; loads existing `charity_profiles` row; passes to form |
| M2-04 | Charity profile form | `components/charity-profile-form.tsx` — Client Component; all FR-12 fields: charity number, charity name, registered address, charitable objects, mission narrative, beneficiary description, main activities and programmes, geographic area, annual income band; pre-filled from API lookup or existing profile |
| M2-05 | Save profile Server Action | `actions/profile.ts` → `saveCharityProfile(data)` — Zod validation on all fields; upsert to `charity_profiles` |
| M2-06 | Profile completeness banner | `components/profile-banner.tsx` — Client Component; rendered in `(authenticated)/layout.tsx`; shows when mission_statement, beneficiaries, or programmes are empty; links to `/profile`; dismisses automatically when profile is complete |
| M2-07 | Post-registration prompt | After email verification and first sign-in, if `charity_profiles` row does not exist: redirect or prompt to complete profile before accessing dashboard |
| M2-08 | Profile accessible from account settings | Ensure profile link is accessible from nav and account area per FR-13 |

**Note on Charity Commission API:** The API is public and free but has no formal SLA. The fallback (FR-11) must be tested with the API unavailable — mock the API failure in local development to verify graceful degradation.

**Done criteria:**
- User can enter a charity number, click Look Up, and see pre-filled charity name and address
- Manual entry works when API returns no match
- All FR-12 fields are present, editable, and saved correctly
- Profile completeness banner appears and disappears correctly
- Saving profile shows a success toast
- Refreshing the profile page shows previously saved data

---

### M3 — Dashboard & Application Management

**Summary:** A signed-in user can see all their saved applications on the dashboard, create a new application, rename or delete existing ones, and resume any application from where they left off.

**BRD requirements:** FR-15, FR-16, FR-17, FR-18, FR-19, FR-20
**ADRs:** ARCH-004, DATA-001

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M3-01 | Dashboard page | `app/(authenticated)/dashboard/page.tsx` — Server Component; loads all `applications` for current user ordered by `updated_at` desc; renders application cards or empty state |
| M3-02 | Application card | Shows: funder name, fund name, status badge (draft/in_progress/complete), deadline if set, last edited date, "Continue" button; rename and delete actions |
| M3-03 | Empty state | Encouraging message when no applications exist; prominent "Create your first application" CTA |
| M3-04 | Create application dialog | `components/create-application-dialog.tsx` — fields: funder name (required), fund name (optional), deadline (optional), amount sought (optional); calls `createApplication(data)`; redirects to `/application/[id]/step/1` on success |
| M3-05 | Application Server Actions | `actions/applications.ts`: `createApplication(data)`, `updateApplication(id, data)`, `deleteApplication(id)`, `updateApplicationStatus(id, status)`, `updateApplicationStep(id, step)` — all Zod-validated |
| M3-06 | Delete confirmation | `components/delete-application-dialog.tsx` — shadcn AlertDialog; warns that deletion is permanent; confirms before calling `deleteApplication(id)` (FR-19) |
| M3-07 | Rename application | Inline edit or rename dialog; calls `updateApplication(id, { funder_name })` |
| M3-08 | Application index redirect | `app/(authenticated)/application/[id]/page.tsx` — Server Component; reads `current_step` from `applications`; redirects to `/application/[id]/step/[current_step]` (FR-17) |
| M3-09 | Step locking helper | `lib/step-access.ts` → `checkStepAccess(applicationId, userId, requestedStep)` — returns the step the user should be on; used by all step pages to enforce locking |
| M3-10 | AI usage counter on dashboard | ADR-AI-008: dashboard must display the user's current month AI usage, e.g. "12 of 20 AI requests used this month"; reads from `ai_usage_log` using `checkAIUsage(userId)` (built in M6-04); placed prominently near the "New Application" button |

**Done criteria:**
- Dashboard shows all applications for the logged-in user only (RLS verified)
- Creating an application redirects to Step 1
- Deleting an application removes it from the dashboard and from the database (including cascade to `application_answers`)
- "Continue" button takes the user to the correct step
- A second user cannot see the first user's applications

---

### M4 — Step 1: Application Details

**Summary:** Step 1 of the five-step application flow. The user enters or reviews the grant details (funder name, fund name, deadline, amount sought). Advancing from Step 1 to Step 2 is explicit. The step progress indicator is introduced here and reused across all step pages.

**BRD requirements:** FR-15 (detail), FR-18
**ADRs:** ARCH-004

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M4-01 | Step progress indicator | `components/step-progress.tsx` — shows steps 1–5; current step in teal; completed steps with checkmark; shared across all step pages |
| M4-02 | Step 1 page | `app/(authenticated)/application/[id]/step/1/page.tsx` — Server Component; calls `checkStepAccess()`; loads application data; renders form |
| M4-03 | Step 1 form | Client Component; fields: funder name (required), fund name (optional), deadline (optional — date picker), amount sought (optional — number); pre-populated from `applications` row |
| M4-04 | Save and advance | "Save and continue" calls `updateApplication(id, data)` then `updateApplicationStep(id, 2)`; redirects to Step 2 |
| M4-05 | Step locking enforcement | Accessing `/step/2`, `/step/3`, `/step/4`, or `/step/5` before completing prior steps redirects to `current_step` |

**Done criteria:**
- Step 1 renders with existing application data pre-filled
- Saving and continuing advances to Step 2 and updates `current_step` in the database
- Accessing Step 3 directly when `current_step` is 1 redirects to Step 1
- Step progress indicator accurately shows Step 1 as current

---

### M5 — Step 2: Funder Guidelines

**Summary:** Step 2 allows the user to provide funder guidelines either by uploading a PDF or Word document, or by pasting text. Uploaded files bypass Vercel's 4.5MB limit via direct Supabase Storage upload. Extracted text is stored in `sessionStorage` — never permanently in the database. Two protection layers ensure no guidelines linger in Storage.

**BRD requirements:** FR-21, FR-22, FR-23
**ADRs:** FILE-001, FILE-002, FILE-003, FILE-004

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M5-01 | Step 2 page | `app/(authenticated)/application/[id]/step/2/page.tsx` — Server Component; calls `checkStepAccess()`; renders upload/paste interface |
| M5-02 | Guidelines input component | `components/guidelines-input.tsx` — Client Component; tab toggle between "Upload file" and "Paste text" |
| M5-03 | File upload UI | Drag-and-drop zone or click-to-browse; client-side validation: PDF or .docx only, max 10MB (FR-23 for error message); upload progress bar |
| M5-04 | Signed URL API route | `app/api/upload/signed-url/route.ts` — POST; auth check; generates Supabase Storage signed upload URL (5-min expiry) for `guidelines-temp` bucket; returns `{ signedUrl, path }` where `path = {userId}/{applicationId}/{timestamp}.{ext}` |
| M5-05 | Supabase Storage bucket | Create `guidelines-temp` private bucket; document setup in migration notes or Supabase dashboard setup instructions |
| M5-06 | Direct upload to Storage | Client-side: PUT file bytes to signed URL; show upload progress |
| M5-07 | Process upload API route | `app/api/upload/process/route.ts` — POST `{ path, applicationId }`; **server-side validation of MIME type and file size before processing** (ADR-FILE-002: never trust client-side validation alone — check `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, max 10MB); retrieves file from Storage using service role client; calls `lib/extract-text.ts`; `try/finally` deletes from Storage regardless of outcome (Layer 1 protection — ADR-FILE-001); returns extracted text |
| M5-08 | Text extraction library | `lib/extract-text.ts` — PDF via `unpdf` (fallback message for scanned/password-protected — ADR-FILE-003); Word via `mammoth`; truncate at 150,000 chars (ADR-AI-007) |
| M5-09 | Guidelines session storage | `lib/guidelines-session.ts` — `setGuidelines(appId, text)`, `getGuidelines(appId)`, `clearGuidelines(appId)` using `sessionStorage` keyed by application ID (ADR-FILE-004) |
| M5-10 | Text paste path | If user pastes text: skip Storage upload; validate not empty; truncate at 150,000 chars; store directly in `sessionStorage`; advance to Step 3 |
| M5-11 | Storage cleanup cron | `app/api/cron/cleanup-storage/route.ts` — GET; Bearer token auth (`CRON_SECRET`); deletes objects in `guidelines-temp` older than 1 hour (Layer 2 protection — ADR-FILE-001); `vercel.json` cron schedule `"*/30 * * * *"` — build early, deploy with Layer 1 |
| M5-12 | Advance to Step 3 | On successful extraction: call `updateApplicationStep(id, 3)`; redirect to Step 3 |

**Done criteria:**
- Uploading a PDF extracts text and stores it in `sessionStorage`
- Uploading a Word document extracts text correctly
- Uploading a scanned PDF shows a plain-language error message
- Uploading an unsupported file type (e.g. `.xlsx`) shows a clear error message (FR-23)
- After processing, the file no longer exists in Supabase Storage (`guidelines-temp` bucket is empty)
- Pasting text stores it in `sessionStorage` correctly
- Closing the browser tab clears `sessionStorage` (browser behaviour — verify)

---

### M6 — Step 3: AI Summary

**Summary:** The AI reads the funder guidelines from `sessionStorage` and produces a structured plain-English summary. A teal progress bar with staged messages is shown during generation. Errors are surfaced with a "Try again" option. A pre-existing summary is loaded immediately without re-calling the API. Monthly usage is tracked and capped at 20 requests per user.

**BRD requirements:** FR-24, FR-25, FR-26, FR-27
**ADRs:** AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007, AI-008, AI-009, SEC-005

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M6-01 | AI prompts file | `lib/prompts.ts` — `MODEL` constant; `SUMMARY_SYSTEM_PROMPT`; `buildSummaryPrompt(guidelinesText: string)`; XML-tagged structured inputs; all prompt text here, no inline prompts in routes (ADR-AI-003, ADR-AI-004) |
| M6-02 | AI error handler | `lib/ai-error-handler.ts` — retry logic: up to 2 retries, 1s then 3s delays for transient errors (429, 500, 529); no retry for 400/auth; user-facing error message mapping per technical design Section 11 (ADR-AI-009) |
| M6-03 | Upstash rate limiting | `lib/rate-limit.ts` — configure `@upstash/ratelimit`; 5 requests per 60 seconds per user; applied to both AI routes (ADR-SEC-005) |
| M6-04 | Usage pre-check | `lib/usage-check.ts` → `checkAIUsage(userId)` — queries `ai_usage_log` for current calendar month count; returns `{ allowed: boolean, count: number, resetDate: string }` (ADR-AI-008) |
| M6-05 | Generate summary API route | `app/api/generate-summary/route.ts` — `export const maxDuration = 90`; auth check; usage pre-check; rate limit check; reads guidelines from request body; calls Claude API via error handler; on success: update `applications.ai_summary`; insert `ai_usage_log` row; clear guidelines from `sessionStorage` (client notified); advance step to 3 if not already past it |
| M6-06 | AI loading bar component | `components/ai-loading-bar.tsx` — Client Component; time-based teal progress bar; Step 3 messages: 0% "Reading your funder guidelines…", 60% "Almost there…", 100% content appears; holds at ~90% if API slow; error state: stops bar, shows inline message + "Try again" button (ADR-AI-005) |
| M6-07 | Step 3 page | `app/(authenticated)/application/[id]/step/3/page.tsx` — Server Component; calls `checkStepAccess()`; if `ai_summary` exists in DB: render it directly (no API call); if guidelines in `sessionStorage` and no summary: trigger generation client-side; if no guidelines: show prompt to return to Step 2 |
| M6-08 | Summary display | Render summary with section headings in a clean, readable layout; "Regenerate summary" button; "Next: Draft Answers" button that advances to Step 4 |

**Summary prompt output structure (FR-24):**
The `buildSummaryPrompt` function must instruct the AI to cover:
- Who can apply (eligible organisations)
- What they fund (types of projects)
- What they do not fund
- Key funder priorities
- Plain-language explanation of each application question
- Word limits and format requirements
- Deadline and submission notes

**Done criteria:**
- Arriving at Step 3 with guidelines in `sessionStorage` triggers the loading bar, then displays the AI summary
- Arriving at Step 3 with an existing `ai_summary` in the database renders immediately without an API call
- Arriving at Step 3 with no guidelines shows a clear prompt to return to Step 2
- An API error shows an inline error message with a "Try again" button (FR-27)
- Monthly usage of 20 requests is enforced — the 21st request returns a clear message with reset date (ADR-AI-008)

---

### M7 — Step 4: Draft Answers & Mandatory Approval

**Summary:** The AI generates draft answers for each application question using the AI summary, the charity profile, and any word limits specified. Each draft answer goes through a mandatory review and approval step with three specific review prompts (FR-32). The user can edit, approve, discard, or regenerate. Answers auto-save. Approved content is visually marked.

**BRD requirements:** FR-28, FR-29, FR-30, FR-31, FR-32, FR-33, FR-34, FR-35, FR-36
**ADRs:** AI-001–AI-009, DATA-001, SEC-005

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M7-01 | Draft prompt builder | Add to `lib/prompts.ts`: `DRAFT_SYSTEM_PROMPT`; `buildDraftPrompt(summary, charityProfile, questions)` — XML-tagged sections; explicit JSON output format; per-question word limits included in the prompt (FR-30, ADR-AI-004). **Note:** ADR-AI-004 defines the `<charity_profile>` XML block with 5 fields (Name, Mission, Beneficiaries, Programmes, Impact). This function must be extended to also include the BRD gap fields: `registered_address`, `charitable_objects`, `geographic_area`, `annual_income_band` — so the AI has the full profile context when generating drafts |
| M7-02 | Generate draft API route | `app/api/generate-draft/route.ts` — `export const maxDuration = 90`; auth check; usage pre-check; rate limit check; fetch summary + charity profile + questions from DB; build prompt; call Claude API; parse JSON response — one auto-retry on parse failure (ADR-AI-009); insert `application_answers` rows; insert `ai_usage_log` row; update `current_step = 4` |
| M7-03 | Word limit input | Before generation: each question has a word limit input field (FR-29); user can set or leave blank; value saved to `application_answers.word_limit` before triggering generation |
| M7-04 | Word limit excess flag | FR-31: after draft is generated, if answer word count exceeds word limit by more than 10%, display a prominent warning on that answer card ("This draft is over the word limit — please edit before approving") |
| M7-05 | Step 4 page | `app/(authenticated)/application/[id]/step/4/page.tsx` — Server Component; calls `checkStepAccess()`; loads `application_answers`; if no answers: triggers generation client-side; if answers exist: renders answer editing UI |
| M7-06 | Question and answer cards | One card per question; question text as heading; word limit input; draft answer in editable textarea; word count + limit display; approval status badge |
| M7-07 | Mandatory review prompts | FR-32: below each draft answer, before the Approve button, display all three review prompts: (1) "Does this accurately describe your charity and project?" (2) "Are all figures, dates, and facts correct?" (3) "Does this answer the question that was asked?"; these are always visible, not collapsible |
| M7-08 | Approve answer | "Approve this answer" button — sets `application_answers.is_approved = true` via Server Action; visually marks answer as approved (green tick, teal border); FR-33 — this step cannot be bypassed; export is gated on at least one answer being approved (FR-39) |
| M7-09 | Discard and regenerate | FR-35: "Discard and regenerate" button — clears `answer_text`, sets `is_approved = false`, re-triggers generation for that single question |
| M7-10 | Write own answer | FR-35: "Write my own answer" option — clears `answer_text`, presents blank textarea; user writes manually; still goes through review prompts before approval |
| M7-11 | Auto-save answers | `actions/answers.ts` → `saveAnswer(applicationId, questionId, answerText)` — debounced **300–500ms** after the user stops typing (ADR-ARCH-004; do NOT use 1.5s); "Saving…" / "Saved ✓" indicator per answer; saves regardless of approval status (FR-18) |
| M7-12 | Step 4 AI loading state | Reuse `ai-loading-bar.tsx` with Step 4 messages: 0% "Reviewing your guidelines and charity profile…", 35% "Writing your draft answers…", 75% "Almost there…", 100% content appears |

**Done criteria:**
- Draft answers are generated for all questions when arriving at Step 4 for the first time
- Each question has a word limit input that is saved before generation
- Answers significantly exceeding the word limit show a prominent warning (FR-31)
- All three review prompts are visible below each draft answer (FR-32)
- Clicking "Approve" sets `is_approved = true` and applies visual approved styling (FR-36)
- Approved answers cannot be accidentally overwritten without explicit discard action (FR-35)
- Refreshing Step 4 shows saved answers without re-calling the API
- Auto-save fires after typing stops — confirmed by checking `updated_at` in Supabase Studio

---

### M8 — Step 5: Review & Export

**Summary:** Step 5 presents a read-only review of all questions and answers. From here the user can download the completed application as a Word document (.docx) or plain text (.txt). Export is prevented if no answers have been approved. Downloading marks the application as complete.

**BRD requirements:** FR-37, FR-38, FR-39
**ADRs:** EXPORT-001, EXPORT-002

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M8-01 | Step 5 page | `app/(authenticated)/application/[id]/step/5/page.tsx` — Server Component; calls `checkStepAccess()`; loads all `application_answers`; read-only display |
| M8-02 | Review display | One section per question: question text as heading; approved answer as body text with "Approved ✓" badge; unapproved answers shown with warning; word count displayed alongside word limit |
| M8-03 | Export gate | FR-39: if zero answers have `is_approved = true`, disable download buttons and show message: "Please review and approve at least one answer before exporting." |
| M8-04 | Word export | "Download as Word" button; calls `GET /api/export/[id]?format=docx`; triggers browser download |
| M8-05 | Plain text export | FR-38: "Download as plain text" button; calls `GET /api/export/[id]?format=txt`; triggers browser download |
| M8-06 | Export API route | `app/api/export/[id]/route.ts` — auth check; confirm `applications.user_id = auth.uid()` (not the owner → 403); fetch application + all `application_answers`; branch on `format` query param |
| M8-07 | Word document generation | Using `docx` npm library (ADR-EXPORT-001); cover section: funder name, fund name, charity name, export date; one section per question: question text as heading, approved answer as body text, word count where limit specified; unanswered questions included with blank section; Inter font, teal headings; response headers: `Content-Disposition: attachment; filename="[funder-slug]-application.docx"` |
| M8-08 | Plain text generation | FR-38: plain text format — question text followed by answer text; questions separated by line breaks; `Content-Disposition: attachment; filename="[funder-slug]-application.txt"` |
| M8-09 | Mark as complete | On first successful export: call `updateApplicationStatus(id, 'complete')`; dashboard shows "Complete" badge |
| M8-10 | Edit links | "Return to editing" link from Step 5 back to Step 4 |
| M8-11 | PDF export (post-v1 nice-to-have) | ADR-EXPORT-001 explicitly marks PDF generation as a **secondary nice-to-have deferred to post-v1**. Do NOT implement PDF export in this milestone. Word (.docx) and plain text (.txt) are the required v1 export formats. If a future request raises PDF, revisit ADR-EXPORT-001 first. |

**Done criteria:**
- Step 5 renders all questions and answers in read-only mode with approval status clearly shown
- Download Word button triggers a valid .docx download that opens correctly in Word/Google Docs
- Download plain text button triggers a valid .txt file download
- Download buttons are disabled and a clear message is shown when no answers are approved (FR-39)
- Application status changes to "complete" after first download (visible on dashboard)
- A different user cannot download another user's application (403 response verified)

---

### M9 — Operational Layer

**Summary:** The secondary features that make the product safe and professional for real users. These can be developed in parallel with M6–M8 from M3 onwards, but must all be complete before M11.

**BRD requirements:** FR-06 (session timeout UI), FR-40, FR-41, FR-42, FR-43, FR-44, C20 (basic usage metrics)
**ADRs:** SEC-003, OPS-003, OPS-004, OPS-005, OPS-006, DATA-003

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M9-01 | Session timeout modal | `components/session-timeout-modal.tsx` — Client Component; tracks `mousemove`, `keydown`, `click`; 55-minute warning modal with "Stay signed in" option; 60-minute auto sign-out + redirect to `/sign-in?reason=timeout` with message "You've been signed out due to inactivity" (FR-06, ADR-SEC-003); wire into `(authenticated)/layout.tsx` |
| M9-02 | Account page | `app/(authenticated)/account/page.tsx` — display account email, name; link to profile; MFA opt-in toggle; account deletion section |
| M9-03 | Account deletion — confirmation | FR-41: plain-language warning that all data is permanently deleted; FR-42: user must re-enter their email address to confirm |
| M9-04 | Account deletion — execution | On confirmed deletion: cascade delete in order: `application_answers` → `applications` → `charity_profiles` → `ai_usage_log` → `user_profiles` → Supabase Auth user; use service role client (ADR-DATA-003) |
| M9-05 | Account deletion — confirmation email | FR-44: send confirmation email to user once deletion is complete; via Resend / Supabase Auth (configure in M11 for production; test via Inbucket locally) |
| M9-06 | Storage cleanup cron | If not already built in M5: confirm `vercel.json` cron, `CRON_SECRET` env var, Bearer token auth on route |
| M9-07 | Sentry integration | `npx @sentry/wizard@latest --saas` (ADR-OPS-005 — **NOT** `-i nextjs`; the `--saas` flag is required); EU region project; `beforeSend` hook strips `user.email` and `user.name` (ADR-OPS-005); AI route tagging for generate-summary and generate-draft errors; email alerts for new error types only |
| M9-08 | Error boundaries | `app/error.tsx` — global error boundary with friendly message and refresh prompt; `app/not-found.tsx` — 404 page with link home |
| M9-09 | Loading skeletons | `loading.tsx` files for dashboard, profile, and step pages — Suspense-based skeleton screens (ADR-ARCH-002) |
| M9-10 | Accessibility + Lighthouse CI | Install `@axe-core/react` **as a dev dependency** (`npm install --save-dev @axe-core/react`) for dev-mode violation detection (ADR-OPS-006); review all forms for labels and ARIA attributes; keyboard-only navigation through five-step flow; colour contrast check: teal on white, slate on white; confirm WCAG 2.2 AA compliance. **Lighthouse CI**: ADR-OPS-006 also requires Lighthouse CI added to the build pipeline — configure `.lighthouserc.js` and add a Lighthouse CI step to GitHub Actions (or equivalent CI config); minimum scores: Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 80. The CI check must run on every PR, not just as a one-off pre-launch audit. |
| M9-11 | Basic usage metrics | C20: implement passive database-count metrics: total registrations (count of `user_profiles`), total applications created (count of `applications`), returning users (count of `user_profiles` where `created_at < 30 days ago` and at least one application `updated_at > 7 days ago`); no analytics platform required; viewable via Supabase Studio SQL editor |
| M9-12 | Responsive testing | ADR-ARCH-005 (decided after the BRD) sets **1024px as the minimum supported viewport** — Grant Pathway is desktop-first. Test all pages at 1024px minimum width. Below 768px, display a graceful degradation banner ("Grant Pathway is designed for desktop browsers — some features may not work on mobile devices") rather than a fully responsive layout. Mobile support is deferred to post-v1. **Note:** BRD Section 10.5 states 320px; the ADR takes precedence as it was decided with full knowledge of the BRD trade-off (see Section 6 Conflict Notes). Do NOT optimise for or test on 320px viewports in v1. |

**Done criteria:**
- Session timeout warning appears at 55 minutes of inactivity; auto sign-out fires at 60 minutes
- Account deletion permanently removes all user data in the correct cascade order
- User receives a deletion confirmation email
- `@axe-core/react` (installed as dev dependency) reports no WCAG 2.2 AA violations in development mode
- Keyboard-only navigation completes the full five-step flow without mouse
- All pages render correctly at **1024px minimum viewport** (ADR-ARCH-005; NOT 320px — mobile is post-v1)
- Graceful degradation banner is displayed on viewports below 768px
- Lighthouse CI is configured in the build pipeline and passes minimum score thresholds on every PR

---

### M10 — Legal & Compliance

**Summary:** The three outstanding legal items from BRD Section 14 must be completed before launch. These are non-technical tasks that run in parallel with the development milestones.

**BRD requirements:** BRD Sections 14.2, 14.3, 14.4

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M10-01 | Anthropic DPA review | Review and execute the Anthropic Data Processing Agreement and Standard Contractual Clauses; confirm they satisfy UK GDPR requirements for international data transfers (BRD 14.2, ADR-DP-002) |
| M10-02 | Terms of Service | Draft and publish Terms of Service at `/terms`; must include: (1) Grant Pathway does not guarantee funding outcomes; (2) Grant Pathway does not submit applications on behalf of charities; (3) Grant Pathway makes no representations to funders (BRD 14.3, DR-LC-002) |
| M10-03 | Privacy Policy | Draft and publish Privacy Policy at `/privacy`; must cover: data collected, Supabase London storage, Vercel global edge, Anthropic API US processing covered by DPA, no-AI-training commitment (prominent), user rights, retention, deletion (BRD 14.4) |
| M10-04 | Footer links | Add Terms and Privacy links to footer of all pages (public and authenticated) |
| M10-05 | No-AI-training confirmation | Confirm with Anthropic that charity data submitted via the API is not used for training; reference the relevant API Terms clause in the Privacy Policy (DR-DP-003) |
| M10-06 | Named successor | Identify and informally note a named successor organisation or individual before launch (DR-BM-002, C18) |

**Done criteria:**
- Anthropic DPA executed and on file
- Terms of Service published and accessible
- Privacy Policy published and accessible, prominently stating no AI training use
- Both documents linked from the footer
- Named successor documented (informally)

---

### M11 — Pre-Launch

**Summary:** Production environment setup, all services connected, and the full pre-launch checklist from the technical design completed. No user accesses production until every item is confirmed.

**BRD requirements:** All (final verification)
**ADRs:** OPS-001, OPS-002, OPS-003, OPS-004, OPS-005, SEC-004, SEC-006

**Tasks:**

| # | Task | Detail |
|---|---|---|
| M11-01 | Vercel Pro | Activate Vercel Pro; confirm `maxDuration = 90` is supported; connect GitHub repo |
| M11-02 | Production Supabase | Create production Supabase project in London (eu-west-2); apply migrations: `supabase db push --db-url [prod-url]`; create `guidelines-temp` private bucket |
| M11-03 | Resend | Create Resend account; verify `grantpathway.org.uk` sending domain (SPF + DKIM DNS records); configure Supabase Auth SMTP |
| M11-04 | Auth email templates | Customise verification and password reset templates in Supabase dashboard: reference "Grant Pathway", warm tone, teal CTA buttons |
| M11-05 | Upstash production | Create Upstash Redis database; add production credentials to Vercel env vars |
| M11-06 | Anthropic | Set API spend limit in Anthropic dashboard |
| M11-07 | Sentry | Create Sentry project in EU region; add `SENTRY_DSN` to Vercel production env vars; confirm PII scrubbing is active |
| M11-08 | Production env vars | Set all 8 environment variables in Vercel Production scope |
| M11-09 | CRON_SECRET | Add `CRON_SECRET` to Vercel; confirm cron job appears active in Vercel dashboard |
| M11-10 | Domain setup | Point `grantpathway.org.uk` to Vercel; configure SSL certificate |
| M11-11 | First production deploy | Merge to `main`; confirm Vercel deployment completes without errors |
| M11-12 | Security headers check | Validate at `securityheaders.com`; tighten CSP if needed |
| M11-13 | Full manual test | Complete the entire five-step flow on production: register, verify email, create profile (with Charity Commission lookup), create application, upload guidelines, generate summary, generate draft, review and approve answers, export to Word and plain text |
| M11-14 | Lighthouse audit | Run on `/dashboard`, `/profile`, `/application/[id]/step/4`; target accessibility score 95+ (ADR-OPS-006) |
| M11-15 | Screen reader test | NVDA + Chrome: navigate five-step flow; confirm all interactive elements are labelled and reachable |
| M11-16 | Email flow test | Test verification email, password reset email, and account deletion confirmation email on production |
| M11-17 | Charity Commission API | Confirm API is accessible from Vercel production (no IP restrictions) |

**Done criteria:**
- All 17 items above confirmed green
- Full five-step flow completes successfully on production
- Lighthouse accessibility score ≥ 95 on all audited pages
- Security headers grade A or better at securityheaders.com
- Cron job visible and scheduled in Vercel dashboard
- Production Supabase has empty `user_profiles` table (no test data)

---

## 6. BRD Gap Analysis

The following requirements appear in the BRD but were not fully specified in the technical design document. This plan addresses all of them — each gap is resolved in the milestone tasks above. This section exists for transparency and to prevent them from being overlooked in AI-assisted development sessions.

| FR | BRD Requirement | Gap in Technical Design | Resolution in This Plan |
|---|---|---|---|
| FR-07 | Optional MFA as an opt-in feature | Not mentioned in technical design | M1-11: Enable MFA in Supabase Auth; expose opt-in in Account Settings (M9-02) |
| FR-08 | Feedback interview consent recorded at registration | No `feedback_consent` field in `user_profiles` schema | M0-09: Added `feedback_consent boolean` to `user_profiles`; M1-03: Consent prompt at registration |
| FR-09/10/11 | Charity Commission API lookup at onboarding | Only briefly mentioned; no implementation detail | M2-01/02: Dedicated API route; Client Component for lookup; graceful degradation |
| FR-12 | Extended charity profile fields: registered address, charitable objects, geographic area, annual income band | Schema has 6 fields; BRD requires 9 | M0-09: Added `registered_address`, `charitable_objects`, `geographic_area`, `annual_income_band` to schema |
| FR-29 | User specifies word limit per question before generation | `word_limit` field exists but UX not specified | M7-03: Word limit input per question in Step 4 before generation is triggered |
| FR-31 | Flag prominently if draft significantly exceeds word limit | Not in technical design | M7-04: Post-generation warning displayed on answer card |
| FR-32/33/34/35/36 | Mandatory review and approval workflow with 3 specific prompts; approval cannot be bypassed; discard option | Not in technical design schema or Step 4 description | M7-07–M7-10: Three review prompts below every draft; Approve button sets `is_approved`; Discard and Regenerate option; Write Own Answer option |
| FR-38 | Plain text (.txt) export | Technical design only specifies Word (.docx) export | M8-05/08: Plain text export option in Step 5; separate branch in export API route |
| FR-39 | Prevent export where no content approved | Not in technical design | M8-03: Export gate checks `is_approved` count before allowing download |
| FR-42 | Re-enter email address to confirm account deletion | Not in technical design | M9-03: Email re-entry required in account deletion flow |
| FR-44 | Confirmation email sent after account deletion completes | Not in technical design | M9-05: Deletion confirmation email via Resend |
| C20 | Basic passive usage metrics | Not in technical design | M9-11: Database-count metrics; no analytics platform |

**Additional schema changes required vs. technical design:**

| Table | Field | Change | Reason |
|---|---|---|---|
| `user_profiles` | `feedback_consent boolean DEFAULT false` | Add | FR-08 |
| `charity_profiles` | `registered_address text` | Add | FR-12 |
| `charity_profiles` | `charitable_objects text` | Add | FR-12 |
| `charity_profiles` | `geographic_area text` | Add | FR-12 |
| `charity_profiles` | `annual_income_band text` | Add | FR-12 |
| `application_answers` | `is_approved boolean DEFAULT false` | Add | FR-33, FR-36, FR-39 |

### ADR Conflict Notes

The following conflicts exist between documents. They are recorded here for transparency. The resolution for each is stated — developers must not resolve them independently.

---

**Conflict 1 — Licence / Open Source (UNRESOLVED — requires owner decision)**

| Document | Position |
|---|---|
| ADR-STACK-005 | Proprietary licence; private GitHub repository |
| DR-BM-003 | MIT open source licence; public GitHub repository |

These two decisions directly contradict each other. ADR-STACK-005 was recorded after DR-BM-003 but does not reference it or explain the conflict. **This plan cannot resolve this conflict.** Before launch, the owner must make a final decision and update both documents to agree. In the interim, treat the repository as **private** (the safer default) until the decision is made.

> **Action required (OI-01):** Owner to decide: proprietary + private repo, or MIT + public repo? Update ADR-STACK-005 or DR-BM-003 accordingly.

---

**Conflict 2 — Minimum Viewport Width**

| Document | Position |
|---|---|
| BRD Section 10.5 | 320px minimum viewport; responsive down to mobile |
| ADR-ARCH-005 | 1024px minimum viewport; desktop-first; mobile deferred to post-v1 |

ADR-ARCH-005 was decided after the BRD and explicitly discusses the trade-off, concluding that mobile-first responsive design is out of scope for v1. **The ADR takes precedence.** This plan uses 1024px as the minimum viewport throughout. The BRD reference to 320px is noted but overridden by the ADR.

> **Resolution:** ADR-ARCH-005 applies. Do not optimise for or test on 320px in v1. A graceful degradation banner appears below 768px. Mobile support is a post-v1 enhancement.

---

## 7. AI-Assisted Session Notes

When using Claude Code or another AI coding assistant, provide the following context at the start of each session:

1. **The relevant ADR files** for the feature being built (e.g. if building the file upload pipeline, provide ADR-FILE-001 through ADR-FILE-004)
2. **The relevant sections of the technical design** (e.g. Section 10 for file handling)
3. **The relevant milestone tasks** from this plan (e.g. M5-01 through M5-12)
4. **The shared TypeScript types file** (`types/index.ts`) — so generated code uses the correct types
5. **The BRD gap analysis** (Section 6 of this plan) — so the AI is aware of schema additions

**Session discipline:**
- Review every generated file before committing
- Verify Supabase client usage (server vs client vs middleware — never mix them)
- Confirm all API routes have auth checks as the first operation
- Confirm all Server Actions and API routes use Zod validation
- Confirm `SUPABASE_SERVICE_ROLE_KEY` only appears in API routes, never in client-side code
- Confirm `is_approved` logic is correctly implemented in Step 4 and Step 5

**Common AI mistakes to watch for:**
- Using `supabase.auth.getUser()` on the client instead of calling a Server Action
- Forgetting `export const maxDuration = 90` on AI API routes
- Writing prompt text inline in route files instead of importing from `lib/prompts.ts`
- Using `ShadingType.SOLID` instead of `ShadingType.CLEAR` in `docx` library tables
- Using percentage-based table widths in `docx` library (use DXA units)
- Auto-save debounce set to 1.5s — it must be **300–500ms** (ADR-ARCH-004)
- Installing `@sentry/nextjs` directly via npm — use `npx @sentry/wizard@latest --saas` instead (ADR-OPS-005)
- Building responsive layouts down to 320px — **minimum viewport is 1024px** in v1 (ADR-ARCH-005)
- Generating PDF exports — PDF is **not a v1 requirement**; Word (.docx) and plain text (.txt) only (ADR-EXPORT-001)

**Document conflict warnings (see Section 6 — ADR Conflict Notes for details):**
- ⚠️ **Licence conflict unresolved:** ADR-STACK-005 says proprietary/private; DR-BM-003 says MIT/public. Treat as private until the owner decides. Do not publish or open-source the repo without an explicit decision.
- ⚠️ **Viewport conflict resolved:** BRD says 320px; ADR-ARCH-005 says 1024px. ADR wins. Do not implement or test mobile layouts in v1.

---

*Implementation Plan — Grant Pathway v1.0*
*Generated: 2026-04-26*
*All 44 BRD functional requirements accounted for across milestones M0–M11*
