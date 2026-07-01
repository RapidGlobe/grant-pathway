# Grant Pathway — Technical Design Document

**Tier:** 1 — Always check after every task
**Volatility:** High
**Update when:** Any change to system architecture, data model, API contracts, or component design

**Version:** 1.7
**Date:** 2026-04-21
**Last updated:** 2026-07-01
**Status:** Approved — all architectural decisions decided
**Owner:** Rapidglobe Ltd

---

## Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Authentication and Session Management](#5-authentication-and-session-management)
6. [Database Design](#6-database-design)
7. [Application Routing and Page Structure](#7-application-routing-and-page-structure)
8. [Rendering Strategy](#8-rendering-strategy)
9. [API Design — Server Actions and API Routes](#9-api-design--server-actions-and-api-routes)
10. [File Handling Pipeline](#10-file-handling-pipeline)
11. [AI Integration Pipeline](#11-ai-integration-pipeline)
12. [Document Export Pipeline](#12-document-export-pipeline)
13. [Security](#13-security)
14. [Operations and Deployment](#14-operations-and-deployment)
15. [Development Environment Setup](#15-development-environment-setup)
16. [Pre-Launch Checklist](#16-pre-launch-checklist)

---

## 1. Purpose and Scope

This document describes the technical design of Grant Pathway v1 — a free AI-assisted grant writing tool for UK charities. It synthesises all 42 architectural decisions recorded in the ADR files in this directory into a unified, actionable reference for development.

**This document answers:** How is Grant Pathway built, how do its components fit together, and what does a developer need to know to start working on it?

**The ADR files answer:** Why was each decision made, what alternatives were considered, and what are the consequences?

### What Grant Pathway does

1. A charity worker registers and creates a charity profile (name, what the charity does, who it helps, where it works)
2. They create a grant application and enter the funder name and grant name (Step 1)
3. They upload or paste the funder's guidelines PDF or Word document (Step 2)
4. The AI reads the guidelines and produces a structured plain-English summary including funder priorities, eligibility, grant amount, extracted questions/sections, and any AI usage policy (Step 3)
5. The charity **writes their own draft answers** to each question or section; AI can help improve the structure and clarity of a written answer on request but does not generate content from scratch (Step 4, "AI assisted and not AI generated")
6. For **structured funders** (numbered questions): Q&A interview — one card per question
7. For **free_form funders** (narrative sections): section-by-section writing — one card per section with guidance notes from the funder's own instructions
8. A senior review prompt encourages checking budget figures and trustee sign-off before assembly
9. The application is assembled and the user exports as a Word document (Step 5)

### Primary persona

**Margaret** — a volunteer coordinator at a small UK charity. Limited prior AI experience. Uses a desktop or laptop. Values simplicity, warmth, and clear guidance. Needs to feel confident, not overwhelmed.

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (User)                    │
│   Next.js React (App Router, Client Components)      │
└──────────────┬──────────────────────┬───────────────┘
               │ HTTP / Server Actions │ Direct upload
               ▼                      ▼
┌──────────────────────┐   ┌──────────────────────────┐
│   Vercel (Pro)       │   │   Supabase Storage       │
│   Next.js App Router │   │   guidelines-temp bucket │
│   Server Components  │   │   (private, London)      │
│   API Routes         │   └──────────────────────────┘
│   Server Actions     │              ▲
│   Cron Jobs          │              │ retrieve + delete
└──────┬───────────────┘              │
       │                              │
       ▼                              │
┌──────────────────────┐   ┌──────────┴───────────────┐
│   Supabase (London)  │   │   Amazon Bedrock         │
│   PostgreSQL + Auth  │   │   Claude Sonnet 4.6      │
│   Row Level Security │   │   eu-west-2 In-Region    │
└──────────────────────┘   └──────────────────────────┘
       │
       ▼
┌──────────────────────┐   ┌──────────────────────────┐
│   Resend             │   │   Sentry (EU)            │
│   Transactional      │   │   Error tracking         │
│   Email              │   │   and monitoring         │
└──────────────────────┘   └──────────────────────────┘
```

**Key architectural constraint:** Vercel serverless functions have a 4.5MB request body limit and (on Hobby) a 10-second timeout. Both are resolved: file uploads bypass Vercel via direct Supabase Storage upload; AI routes use `maxDuration = 90` on Vercel Pro.

---

## 3. Technology Stack

| Layer           | Technology                                                 | Decision                   |
| --------------- | ---------------------------------------------------------- | -------------------------- |
| Framework       | Next.js 14+ with TypeScript                                | ADR-STACK-001              |
| Database        | Supabase PostgreSQL (London, eu-west-2)                    | ADR-STACK-002              |
| Authentication  | Supabase Auth                                              | ADR-STACK-003              |
| Hosting         | Vercel Pro                                                 | ADR-STACK-004, ADR-OPS-001 |
| Source control  | GitHub (private repository)                                | ADR-STACK-005              |
| UI components   | shadcn/ui + Radix UI + Tailwind CSS                        | ADR-STACK-006              |
| Icons           | Lucide React (via shadcn/ui)                               | ADR-STACK-006              |
| AI provider     | Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2) | ADR-AI-001                 |
| AI model        | Claude Sonnet 4.6                                          | ADR-AI-002                 |
| PDF extraction  | `unpdf`                                                    | ADR-FILE-003               |
| Word extraction | `mammoth`                                                  | ADR-FILE-003               |
| Word generation | `docx`                                                     | ADR-EXPORT-001             |
| Rate limiting   | Upstash Redis + `@upstash/ratelimit`                       | ADR-SEC-005                |
| Email           | Resend (via Supabase Auth SMTP)                            | ADR-OPS-003                |
| Error tracking  | Sentry (EU region)                                         | ADR-OPS-005                |
| Migrations      | Supabase CLI + Docker Desktop                              | ADR-DATA-004               |
| Validation      | Zod (all API routes and Server Actions)                    | ADR-ARCH-003               |
| Test framework  | Vitest                                                     | —                          |
| CI              | GitHub Actions                                             | —                          |

### Operating costs (monthly)

| Service                 | Cost                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| Vercel Pro              | ~£16/month                                                                         |
| Supabase Pro            | ~£20/month (ADR-DATA-005 — includes daily automated backups)                       |
| Amazon Bedrock (Claude) | Usage-based (capped at 50 req/user/month)                                          |
| Upstash                 | Free tier                                                                          |
| Resend                  | Free tier (3,000 emails/month)                                                     |
| Sentry                  | Free tier (5,000 errors/month)                                                     |
| **Total fixed**         | **~£36/month** (well within £100/month C1 budget; ~£64/month headroom for Bedrock) |

---

## 4. Project Structure

```
/
├── app/
│   ├── (public)/                    # Public routes (no auth required)
│   │   ├── page.tsx                 # Landing / sign-in page
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── terms/page.tsx
│   │   └── privacy/page.tsx
│   │
│   ├── (authenticated)/             # Protected routes (auth required)
│   │   ├── layout.tsx               # Shared layout: nav + charity profile banner
│   │   ├── error.tsx                # Authenticated error boundary
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── applications/
│   │   │   ├── new/                 # Creation intermediary (no UI rendered)
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # Redirects to current step
│   │   │       └── step/
│   │   │           ├── 1/page.tsx   # Application Details
│   │   │           ├── 2/page.tsx   # Upload Guidelines
│   │   │           ├── 3/page.tsx   # AI Summary
│   │   │           ├── 4/page.tsx   # Draft Answers
│   │   │           └── 5/page.tsx   # Review & Export
│   │   └── account/
│   │       └── page.tsx             # Account settings + deletion
│   │
│   ├── api/
│   │   ├── generate-summary/route.ts    # maxDuration = 90
│   │   ├── refine-answer/route.ts       # maxDuration = 60
│   │   ├── health/route.ts              # Uptime monitoring endpoint
│   │   ├── upload/
│   │   │   ├── signed-url/route.ts
│   │   │   └── process/route.ts
│   │   ├── export/[id]/route.ts
│   │   ├── account/
│   │   │   └── delete/route.ts
│   │   └── cron/
│   │       ├── cleanup-guidelines/route.ts
│   │       ├── inactivity-warning/route.ts
│   │       └── inactivity-deletion/route.ts
│   │
│   ├── global-error.tsx             # Top-level error boundary (root layout errors)
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
│
├── actions/                         # Server Actions ("use server")
│   ├── auth.ts                      # Sign in, register, reset password, sign out
│   ├── charity.ts                   # Save/update charity profile
│   └── applications.ts              # Create, rename, delete, update status, approve, reopen
│
├── components/
│   ├── ui/                          # shadcn/ui components
│   └── [feature components]
│
├── lib/
│   ├── prompts.ts                   # AI prompt builder functions + MODEL constant
│   ├── ai-error-handler.ts          # Shared Anthropic retry + error mapping
│   ├── application-guard.ts         # Path-prefix IDOR check for application routes
│   ├── database.types.ts            # Auto-generated Supabase type definitions
│   ├── env.ts                       # Zod-validated environment variable schema
│   ├── extract-text.ts              # PDF (unpdf) + Word (mammoth) extraction
│   ├── file-validation.ts           # Client-side file type/size validation
│   ├── guidelines-session.ts        # sessionStorage get/set/clear for guidelines
│   ├── preprocess-text.ts           # Text normalisation before AI processing
│   ├── rate-limit.ts                # Upstash rate-limit helpers
│   ├── types.ts                     # Shared TypeScript types (AiSummaryData etc.)
│   ├── utils.ts                     # General utilities
│   └── supabase/
│       ├── server.ts                # createServerClient (Server Components, Actions)
│       ├── client.ts                # createBrowserClient (Client Components)
│       └── middleware.ts            # updateSession() — used by middleware.ts
│
├── __tests__/                       # Vitest unit tests
│   ├── ai-cap.test.ts
│   ├── prompts.test.ts
│   └── upload-idor.test.ts
│
├── middleware.ts                    # Route protection + session refresh + CSP nonce
├── vitest.config.ts
├── instrumentation.ts               # Sentry server-side initialisation (Next.js hook)
├── instrumentation-client.ts        # Sentry client-side initialisation (Next.js hook)
├── sentry.client.config.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
├── vercel.json                      # Cron job configuration
├── next.config.ts                   # Security headers + Next.js config
├── tailwind.config.ts               # Design token colours
│
└── supabase/
    ├── migrations/
    │   └── [timestamp]_*.sql
    └── seed.sql                     # Sample data for local development
```

---

## 5. Authentication and Session Management

### Provider

Supabase Auth handles registration, login, email verification, and password reset. (ADR-STACK-003)

### Middleware

`middleware.ts` at the project root intercepts every request before the page renders. It imports `updateSession()` from `lib/supabase/middleware.ts`, which uses `createServerClient` from `@supabase/ssr` to refresh the Supabase session cookie. (ADR-SEC-001)

**What middleware does:**

1. Generates a per-request cryptographic nonce used to lock down the Content Security Policy
2. Skips session handling for public API routes (`/api/health`, `/api/cron/*`) — these authenticate via `CRON_SECRET` header instead
3. Calls `updateSession()` to read and refresh the Supabase session from request cookies
4. Stamps the CSP header (with the per-request nonce) on every response
5. Redirects unauthenticated requests to protected routes → `/` (landing/sign-in page)
6. Redirects authenticated requests to `/` or `/register` → `/dashboard`

**Matcher configuration:**

```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**Protected routes:** `/dashboard`, `/profile`, `/applications`, `/account`

**Public routes:** `/` (landing + sign-in), `/register`, `/forgot-password`, `/verify-email`, `/terms`, `/privacy`

### Session timeout

A 60-minute inactivity timeout is enforced client-side. (ADR-SEC-003)

- Activity tracking monitors `mousemove`, `keydown`, and `click` events
- A warning modal appears at 55 minutes of inactivity with a "Stay signed in" option
- If dismissed or ignored, the user is signed out and redirected to `/` with the message: _"You've been signed out due to inactivity."_
- Auto-save (Step 4) ensures in-progress answers are saved before the timeout fires

### Supabase client instances

Three distinct clients are used depending on context:

| Context                           | Client / function     | File                         |
| --------------------------------- | --------------------- | ---------------------------- |
| Server Components, Server Actions | `createServerClient`  | `lib/supabase/server.ts`     |
| Client Components                 | `createBrowserClient` | `lib/supabase/client.ts`     |
| Middleware                        | `updateSession()`     | `lib/supabase/middleware.ts` |

The **service role client** (using `SUPABASE_SERVICE_ROLE_KEY`) is used only in API routes that require bypassing RLS — specifically account deletion and the Storage cleanup cron job. It must never appear in client-side code.

---

## 6. Database Design

### Schema

All tables are in the `public` schema. RLS is enabled on all tables with default-deny. (ADR-DATA-001, ADR-SEC-002)

The authoritative column-level reference is `docs/data-model.md` (Tier 1). This section documents the schema structure and key design decisions.

#### `user_profiles`

| Column             | Type          | Constraints                   |
| ------------------ | ------------- | ----------------------------- |
| `id`               | `uuid`        | PK                            |
| `user_id`          | `uuid`        | FK → `auth.users(id)`, unique |
| `first_name`       | `text`        | Not null                      |
| `last_name`        | `text`        | Not null                      |
| `feedback_consent` | `boolean`     | Not null, default `false`     |
| `created_at`       | `timestamptz` | Default `now()`               |
| `updated_at`       | `timestamptz` | Default `now()`               |

Email is **not** stored here — it is managed by Supabase Auth in `auth.users`.

#### `charity_profiles`

Stores the charity's full organisational information — the "thick profile" (BD-02). Used as context for all AI-generated content. Contains ~30 fields across six groups: identity, address/contact, mission and work, financial (from latest signed accounts), supporting document status, and metadata. Full field definitions in `docs/data-model.md` §2.

Key design points:

- `user_id` is unique — one charity profile per user account
- A completed charity profile (core required fields populated) is required before a new application can be created
- Financial fields default from Charity Commission annual return data where available; the charity must confirm all financial figures before use

#### `funders`

Global reference table — not user-scoped. Seeded and maintained by Rapidglobe. Users can only SELECT active rows.

| Column           | Type          | Constraints                                  |
| ---------------- | ------------- | -------------------------------------------- |
| `id`             | `uuid`        | PK, default `gen_random_uuid()`              |
| `name`           | `text`        | Not null, unique                             |
| `funder_type`    | `text`        | `structured \| narrative`                    |
| `grant_range`    | `text`        | Nullable — display string (e.g. "£10k–£30k") |
| `guidelines_url` | `text`        | Nullable                                     |
| `is_active`      | `boolean`     | Not null, default `true`                     |
| `created_at`     | `timestamptz` | Default `now()`                              |

#### `applications`

| Column             | Type          | Constraints                                                                        |
| ------------------ | ------------- | ---------------------------------------------------------------------------------- |
| `id`               | `uuid`        | PK, default `gen_random_uuid()`                                                    |
| `user_id`          | `uuid`        | FK → `auth.users(id)`                                                              |
| `funder_id`        | `uuid`        | FK → `funders(id)`, nullable (migration safety)                                    |
| `funder_name`      | `text`        | Not null — retained for display/export; populated from `funders.name` on selection |
| `grant_name`       | `text`        | Not null                                                                           |
| `status`           | `text`        | `not_started \| in_progress \| approved \| exported \| mismatch`                   |
| `current_step`     | `integer`     | 1–5, default 1                                                                     |
| `ai_summary`       | `text`        | Nullable — JSON string, populated in Step 3                                        |
| `last_exported_at` | `timestamptz` | Nullable — timestamp of most recent Word export                                    |
| `created_at`       | `timestamptz` | Default `now()`                                                                    |
| `updated_at`       | `timestamptz` | Default `now()`                                                                    |

`mismatch` is a terminal status — no transitions to steps 4 or 5 are permitted from this state (FR-47, DR-EL-001).

#### `application_answers`

| Column               | Type          | Constraints                                                               |
| -------------------- | ------------- | ------------------------------------------------------------------------- |
| `id`                 | `uuid`        | PK, default `gen_random_uuid()`                                           |
| `application_id`     | `uuid`        | FK → `applications(id)`                                                   |
| `user_id`            | `uuid`        | FK → `auth.users(id)` (denormalised for RLS)                              |
| `question_text`      | `text`        | Not null                                                                  |
| `question_type`      | `text`        | `narrative \| data_entry \| financial \| dropdown \| date \| file_upload` |
| `question_order`     | `integer`     | Not null — unique per `(application_id, question_order)`                  |
| `word_limit`         | `integer`     | Nullable — set when `limit_type = 'words'`                                |
| `char_limit`         | `integer`     | Nullable — set when `limit_type = 'characters'`                           |
| `limit_type`         | `text`        | `words \| characters \| none`                                             |
| `answer_text`        | `text`        | Nullable                                                                  |
| `answer_source`      | `text`        | `user_written \| user_edited \| ai_assisted`                              |
| `is_budget_question` | `boolean`     | Not null, default `false` — disables AI assist on this row                |
| `is_approved`        | `boolean`     | Not null, default `false` — set in the Step 4 review gate                 |
| `created_at`         | `timestamptz` | Default `now()`                                                           |
| `updated_at`         | `timestamptz` | Default `now()`                                                           |

**Note on free_form funders:** For narrative (free_form) funders, `question_text` stores the section title (e.g. "About your organisation"). Section guidance text is re-derived on each Step 4 page load from `applications.ai_summary.sections[i].guidance`, matched by `question_order`. This avoids data duplication and keeps guidance in sync with the AI summary.

#### `ai_usage_log`

| Column           | Type          | Constraints                                |
| ---------------- | ------------- | ------------------------------------------ |
| `id`             | `uuid`        | PK, default `gen_random_uuid()`            |
| `user_id`        | `uuid`        | FK → `auth.users(id)`                      |
| `application_id` | `uuid`        | Nullable                                   |
| `request_type`   | `text`        | `guideline_summary \| draft_generation`    |
| `token_count`    | `integer`     | Nullable — tokens consumed by this request |
| `created_at`     | `timestamptz` | Default `now()` — used for monthly count   |

### Row Level Security policies

| Table                 | SELECT                  | INSERT   | UPDATE   | DELETE   |
| --------------------- | ----------------------- | -------- | -------- | -------- |
| `user_profiles`       | Own rows                | Own rows | Own rows | Own rows |
| `charity_profiles`    | Own rows                | Own rows | Own rows | Own rows |
| `funders`             | Active rows (all users) | ✗ Denied | ✗ Denied | ✗ Denied |
| `applications`        | Own rows                | Own rows | Own rows | Own rows |
| `application_answers` | Own rows                | Own rows | Own rows | Own rows |
| `ai_usage_log`        | Own rows                | Own rows | ✗ Denied | ✗ Denied |

"Own rows" = `user_id = auth.uid()`. UPDATE and DELETE are denied on `ai_usage_log` to prevent users from deleting their usage history to bypass the monthly AI request limit. `funders` INSERT/UPDATE/DELETE is restricted to the service role only.

### Monthly AI usage count

The monthly usage check is performed via a Supabase RPC call (`reserve_ai_slot`) rather than a bare client count. This provides an atomic advisory lock — preventing race conditions where two concurrent AI requests could both pass the cap check simultaneously.

### Data not stored

Funder guidelines text is **never** written to the database or to Supabase Storage permanently. It is extracted from the uploaded file, held in `sessionStorage` during the session, passed in the POST body to the AI API route, and discarded after the response returns. (ADR-DATA-002)

### Data retention

All data is retained for the lifetime of the user account. Account deletion cascades through all tables in order: `application_answers` → `applications` → `charity_profiles` → `ai_usage_log` → `user_profiles` → Supabase Auth user. Deletion is permanent and immediate. (ADR-DATA-003)

### Migrations

The Supabase CLI manages all schema changes. Migration files live in `supabase/migrations/` and are committed to Git. Direct schema changes in the Supabase dashboard are prohibited — all changes go through migration files. (ADR-DATA-004)

Local development uses Docker Desktop (WSL2 backend on Windows) to run a full isolated Supabase stack:

```bash
supabase start        # spin up local Supabase in Docker
supabase db reset     # apply all migrations and seed data
npm run dev           # start the Next.js application
```

---

## 7. Application Routing and Page Structure

### Route groups

Two route groups separate public and authenticated pages, sharing different layouts:

- `app/(public)/` — no authentication required, no shared nav
- `app/(authenticated)/` — requires authentication, shares `layout.tsx` with nav and charity profile completeness banner

### Application flow routing

The five-step application flow uses URL-based step routing. (ADR-ARCH-004)

| URL                         | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| `/applications/[id]`        | Redirects to `/applications/[id]/step/[current_step]` |
| `/applications/[id]/step/1` | Application Details                                   |
| `/applications/[id]/step/2` | Upload Funder Guidelines                              |
| `/applications/[id]/step/3` | AI Summary                                            |
| `/applications/[id]/step/4` | Draft Answers                                         |
| `/applications/[id]/step/5` | Review & Export                                       |

**Step locking:** Users cannot jump ahead to a step whose prerequisites are not met. Accessing `/step/4` before Step 3 is complete redirects to the current step.

**Resume on return:** Navigating to `/applications/[id]` reads `current_step` from the `applications` table and redirects to the correct step.

### Page inventory

| Route                       | Type               | Data source                           |
| --------------------------- | ------------------ | ------------------------------------- |
| `/`                         | Public, static     | None — landing + sign-in page         |
| `/register`                 | Public, static     | None                                  |
| `/forgot-password`          | Public, static     | None                                  |
| `/verify-email`             | Public, static     | None                                  |
| `/terms`                    | Public, static     | None                                  |
| `/privacy`                  | Public, static     | None                                  |
| `/dashboard`                | Authenticated, SSR | `applications` table                  |
| `/profile`                  | Authenticated, SSR | `charity_profiles` table              |
| `/applications/[id]/step/1` | Authenticated, SSR | `applications` table                  |
| `/applications/[id]/step/2` | Authenticated, SSR | `applications` table                  |
| `/applications/[id]/step/3` | Authenticated, SSR | `applications.ai_summary`             |
| `/applications/[id]/step/4` | Authenticated, SSR | `applications`, `application_answers` |
| `/applications/[id]/step/5` | Authenticated, SSR | `applications`, `application_answers` |
| `/account`                  | Authenticated, SSR | `user_profiles`                       |

---

## 8. Rendering Strategy

React Server Components are the default. `"use client"` is added only to components that require browser APIs, React hooks, or event handlers. (ADR-ARCH-002)

| Component                                    | Type             | Reason                                                 |
| -------------------------------------------- | ---------------- | ------------------------------------------------------ |
| Page shells (dashboard, profile, step pages) | Server Component | Fetches data server-side — no loading spinner on mount |
| Navigation bar                               | Client Component | Requires auth state and active route highlighting      |
| Charity profile edit form                    | Client Component | Controlled inputs and form state                       |
| Answer text areas (Step 4)                   | Client Component | Auto-save requires `onChange` and debounce             |
| AI loading state (Steps 3 & 4)               | Client Component | Timer-driven progress bar animation                    |
| Session timeout modal                        | Client Component | Timer and user interaction                             |
| Delete confirmation modal                    | Client Component | User interaction                                       |

**Loading states:** Next.js `loading.tsx` files provide Suspense-based page-level loading skeletons where server data fetch may be slow.

---

## 9. API Design — Server Actions and API Routes

### Server Actions

Server Actions handle all data mutations. Defined in `actions/` with the `"use server"` directive. Called directly from Client Components or Server Components. All inputs validated with Zod. (ADR-ARCH-003)

| Action file               | Key functions                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `actions/auth.ts`         | Sign in, register, reset password, change password, sign out                                                                                                                                            |
| `actions/charity.ts`      | `saveCharityProfile(data)`                                                                                                                                                                              |
| `actions/applications.ts` | `createApplication`, `updateStep1`, `deleteApplication`, `advanceToStep4`, `saveAnswer`, `saveManualAnswer`, `setDraftReadyToAssemble`, `assembleAndAdvance`, `approveApplication`, `reopenApplication` |

### API Routes

Explicit API routes handle long-running operations, file handling, export, and scheduled jobs. (ADR-ARCH-003)

| Route                           | Method | Purpose                                                            | Config                |
| ------------------------------- | ------ | ------------------------------------------------------------------ | --------------------- |
| `/api/generate-summary`         | POST   | Step 3: AI summary generation                                      | `maxDuration = 90`    |
| `/api/refine-answer`            | POST   | Step 4: Per-answer structure/clarity improvement (non-budget only) | `maxDuration = 60`    |
| `/api/health`                   | GET    | Uptime monitoring endpoint (polled by UptimeRobot)                 | Default timeout       |
| `/api/upload/signed-url`        | POST   | Request Supabase Storage signed URL                                | Default timeout       |
| `/api/upload/process`           | POST   | Extract text after upload; store in sessionStorage                 | Default timeout       |
| `/api/export/[id]`              | GET    | Generate and stream Word document                                  | Default timeout       |
| `/api/account/delete`           | POST   | Cascade-delete user account and all data                           | Default timeout       |
| `/api/cron/cleanup-guidelines`  | GET    | Delete orphaned Storage objects                                    | Cron: every 30 min    |
| `/api/cron/inactivity-warning`  | GET    | Send inactivity warning emails                                     | Cron: 08:00 UTC daily |
| `/api/cron/inactivity-deletion` | GET    | Delete inactive accounts ≥24 months                                | Cron: 09:00 UTC daily |

### Zod validation pattern

Every Server Action and API Route validates its input:

```typescript
const schema = z.object({
  applicationId: z.string().uuid(),
  questionText: z.string().min(1).max(2000),
  wordLimit: z.number().int().positive().nullable(),
})

const result = schema.safeParse(input)
if (!result.success) {
  return { error: 'Invalid input' }
}
```

---

## 10. File Handling Pipeline

Funder guidelines can be uploaded as PDF (`.pdf`) or Word (`.docx`) documents up to 10MB, or pasted as plain text. (ADR-FILE-002)

### Upload pipeline (file upload path)

The Vercel 4.5MB request body limit is bypassed by uploading directly to Supabase Storage. (ADR-FILE-001)

```
Step 1: Client requests signed URL
  POST /api/upload/signed-url
  → Server creates a signed upload URL (5-min expiry) for the guidelines-temp bucket
  → Returns { signedUrl, path }

Step 2: Client uploads directly to Supabase Storage
  PUT [signedUrl] with file bytes
  → File lands in guidelines-temp bucket (private)
  → Upload progress shown to user

Step 3: Client notifies server
  POST /api/upload/process { path }
  → Server retrieves file from Storage using service role client
  → Text extracted (see below)
  → try/finally: file deleted from Storage regardless of outcome
  → Extracted text stored in sessionStorage[guidelines_text_${applicationId}]
  → Proceeds to AI summary generation (Step 3)
```

### Text extraction

Both extraction functions live in `lib/extract-text.ts`. (ADR-FILE-003)

| File type              | Library        | Fallback behaviour                                                                       |
| ---------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `.pdf`                 | `unpdf`        | If text < 100 chars: "This PDF appears to be scanned — please paste the text instead."   |
| `.docx`                | `mammoth`      | If extraction throws: user-friendly error message                                        |
| Password-protected PDF | `unpdf` throws | "This PDF is password protected — please remove the password or paste the text instead." |

If extracted text exceeds 100,000 tokens (~75,000 words), a plain-language advisory message is shown before processing. The user may proceed with the full document or upload a trimmed version. No hard truncation is applied — the document is passed to the AI in full (PDR-AI-004, ADR-AI-007).

### Orphaned file protection

Two layers ensure no guidelines data lingers in Storage: (ADR-FILE-001)

- **Layer 1 — `try/finally`:** The process route always deletes the Storage object in the `finally` block, even if extraction or AI generation throws an error.
- **Layer 2 — Cron job:** `/api/cron/cleanup-guidelines` runs every 30 minutes and deletes any objects in `guidelines-temp` older than 1 hour. Handles infrastructure failures where `finally` did not run.

### Guidelines session storage

After successful text extraction, the guidelines text is stored in `sessionStorage` keyed by application ID. (ADR-FILE-004)

```typescript
// lib/guidelines-session.ts
const key = (applicationId: string) => `guidelines_text_${applicationId}`

export const setGuidelines = (applicationId: string, text: string) =>
  sessionStorage.setItem(key(applicationId), text)

export const getGuidelines = (applicationId: string) => sessionStorage.getItem(key(applicationId))

export const clearGuidelines = (applicationId: string) =>
  sessionStorage.removeItem(key(applicationId))
```

The `sessionStorage` entry is cleared when Step 3 completes successfully. If the user closes the tab, the browser clears `sessionStorage` automatically — no guidelines data persists across sessions.

---

## 11. AI Integration Pipeline

### Provider and model

- **Provider:** Anthropic Claude Sonnet 4.6 via Amazon Bedrock eu-west-2 (`AnthropicBedrock` client from `@anthropic-ai/sdk`) (ADR-AI-001)
- **Model:** `anthropic.claude-sonnet-4-6` (Bedrock In-Region model ID) (ADR-AI-002)
- **Response mode:** Batch (non-streaming) (ADR-AI-005)
- **Function timeout:** `maxDuration = 90` on both AI routes (ADR-AI-006)

### Prompt architecture

All prompts are defined in `lib/prompts.ts`. AI routes import from this file — they contain no prompt text inline. (ADR-AI-003)

```typescript
// lib/prompts.ts
export const MODEL = 'anthropic.claude-sonnet-4-6' // Bedrock In-Region model ID

// Step 3: extract structured summary from funder guidelines
export const buildSummaryPrompt = (
  guidelinesText: string,
  charity: CharityContext | null,
): string => `...`
// Returns JSON: { funder_type, aboutGrant, amount, whoCanApply, lookingFor,
//                 questions[], sections[], keyRequirements, funderAiPolicy,
//                 supportingDocuments, eligibilityMismatch, mismatchReason }

// Step 4: generate draft answers for all questions
export const buildDraftPrompt = (...): string => `...`

// Step 4: improve structure/clarity of a written answer (non-budget only)
export const buildRefinePrompt = (
  questionText: string,
  answerText: string,
  wordLimit: number | null,
): string => `...`
// Returns JSON: { "refinedText": "..." }
```

**Prompt safety:** All prompts use XML-tag fencing to delimit user-supplied content (guidelines text, answer text) from the system instruction. This prevents prompt injection from funder documents. All LLM responses are validated with `safeParse` before use — an invalid JSON response triggers one automatic retry before surfacing as an error.

**`AiSummaryData` TypeScript type** (defined in `lib/types.ts`):

```typescript
export type AiSummaryQuestion = {
  number: number
  text: string
  wordLimit?: number | null
  charLimit?: number | null
  limitType?: 'words' | 'characters' | 'none' | null
  is_budget_question: boolean
}

export type AiSummarySection = {
  number: number
  title: string
  guidance: string
  wordLimit?: number
  is_budget_section: boolean
}

export type AiSummaryData = {
  funder_type: 'structured' | 'free_form'
  aboutGrant: string
  amount: string
  whoCanApply: string[]
  lookingFor: string[]
  questions: AiSummaryQuestion[]
  sections?: AiSummarySection[]
  keyRequirements: string[]
  funderAiPolicy?: string | null
  supportingDocuments?: string[]
  eligibilityMismatch?: boolean
  mismatchReason?: string | null
}
```

**Funder type routing:**

- `structured` funders → Step 4 Q&A interview (numbered questions, one textarea per question)
- `free_form` funders → Step 4 section-by-section writing (section title + guidance, one textarea per section)

**Eligibility mismatch:** If the AI determines the charity is ineligible for the grant, `eligibilityMismatch: true` is returned and `applications.status` is set to `mismatch` — a terminal state that blocks steps 4 and 5.

Prompts use explicit JSON output format. (ADR-AI-004)

### Usage tracking and cost controls

Before every AI API call, the server calls the `reserve_ai_slot` Supabase RPC. This is an atomic advisory lock that checks the monthly usage count and reserves a slot in a single database round-trip, preventing race conditions where two concurrent requests both pass the cap check. (ADR-AI-008)

The monthly cap is **50 requests/user/month**. A failed request does not consume quota. An `AI_ENABLED` environment variable acts as a kill-switch — setting it to `false` blocks all AI routes immediately without a code deployment.

### Rate limiting

Per-user sliding window rate limiting via Upstash Redis (`@upstash/ratelimit`) is applied to both AI routes. (ADR-SEC-005)

| Route                   | Limit                              |
| ----------------------- | ---------------------------------- |
| `/api/generate-summary` | 5 requests per 60 seconds per user |
| `/api/refine-answer`    | 5 requests per 60 seconds per user |

Rate limit exceeded → HTTP 429 with message: _"Too many requests. Please wait a moment before trying again."_

### Error handling

All Bedrock Claude API calls go through `lib/ai-error-handler.ts`. (ADR-AI-009)

**Retry behaviour:**

- Transient errors (429, 500, 529): retry up to 2 times with 1s then 3s delays
- Non-transient errors (400, auth): no retry — surface immediately
- JSON parse failure: one automatic retry before surfacing as an error

**User-facing error messages:**

| Error                            | Message                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| Rate limit (after retries)       | "Our AI service is a little busy right now. Please try again in a few minutes."       |
| Server error (after retries)     | "Something went wrong with our AI service. Please try again."                         |
| Bad request                      | "We couldn't process your request. Please check your inputs and try again."           |
| Timeout                          | "AI generation is taking longer than expected. Please try again."                     |
| JSON parse failure (after retry) | "We had trouble formatting your draft answers. Please try again."                     |
| Usage limit                      | "You've used all 50 of your AI requests this month. Your allowance resets on [date]." |

### Loading state (Steps 3 and 4)

A teal progress bar with staged text messages is shown during AI generation. The bar is time-based — it does not reflect actual API progress. (DDR-CS-005, ADR-AI-005)

**Step 3 stages:**

| Bar  | Message                             |
| ---- | ----------------------------------- |
| 0%   | "Reading your funder guidelines..." |
| 60%  | "Almost there..."                   |
| 100% | Content appears                     |

**Step 4 — per-question refine:**

Step 4 has no page-level AI loading state for draft generation (which runs server-side on arrival). The optional "Help me improve this" button (non-budget questions only) triggers `/api/refine-answer` and displays a per-question inline loading state.

If the API responds before the bar reaches 100%, it jumps to 100% immediately. If the API is slow, the bar holds at ~90% until the response arrives. On error, the bar stops and an inline error message with a "Try again" button replaces the progress indicator. (Applies to Step 3 only from v1.0.)

---

## 12. Document Export Pipeline

Step 5 allows the user to download their completed application as a Microsoft Word document. (ADR-EXPORT-001, ADR-EXPORT-002)

**Route:** `GET /api/export/[applicationId]`

**Process:**

1. Middleware verifies the user session (unauthenticated → 401)
2. Route confirms `applications.user_id = auth.uid()` for the given ID (not the owner → 403)
3. Fetches application details and all `application_answers` rows
4. Generates `.docx` in memory using the `docx` npm library
5. Returns the file as a streaming download

**Response headers:**

```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="[funder-name-slugified]-application.docx"
```

**Document structure:**

- Cover section: funder name, fund name, charity name, export date
- One section per question: question text as a heading, draft answer as body text, word count where a word limit was specified
- Unanswered questions included with a blank answer section

**Styling:** Calibri 11pt body / 14pt headings, A4 page, 2.54cm margins, footer on every page. No web design system fonts or teal branding — the exported document is a professional submission to a funder (PDR-DH-003).

Document generation is fast (milliseconds). No `maxDuration` extension is needed.

---

## 13. Security

### HTTP security headers

Static security headers are configured in `next.config.ts`. (ADR-SEC-004)

| Header                      | Value                                      |
| --------------------------- | ------------------------------------------ |
| `X-Frame-Options`           | `DENY`                                     |
| `X-Content-Type-Options`    | `nosniff`                                  |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`          |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`      |

**Content Security Policy** is **not** set in `next.config.ts`. It is stamped per-request in `middleware.ts` so it can carry a per-request cryptographic nonce. This allows `script-src` to use `'nonce-{nonce}'` instead of `'unsafe-inline'` — only scripts tagged with the matching nonce by Next.js are permitted to execute.

**CSP directives (production):**

| Directive         | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| `default-src`     | `'self'`                                                     |
| `script-src`      | `'self' 'nonce-{per-request nonce}'`                         |
| `style-src`       | `'self' 'unsafe-inline'`                                     |
| `img-src`         | `'self' data:`                                               |
| `connect-src`     | `'self' https://*.supabase.co https://*.ingest.de.sentry.io` |
| `frame-ancestors` | `'none'`                                                     |

In development, `'unsafe-eval'` is added to `script-src` for React call-stack reconstruction.

### Secrets management

Environment variables are stored in Vercel (scoped per environment) and in `.env.local` locally. (ADR-SEC-006)

| Variable                        | Browser accessible | Used in                                 |
| ------------------------------- | ------------------ | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes                | Client and server                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes                | Client and server                       |
| `NEXT_PUBLIC_SENTRY_DSN`        | Yes                | Client-side Sentry SDK                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | **No**             | API routes only                         |
| `AWS_ACCESS_KEY_ID`             | **No**             | AI API routes only (Amazon Bedrock)     |
| `AWS_SECRET_ACCESS_KEY`         | **No**             | AI API routes only (Amazon Bedrock)     |
| `AWS_REGION`                    | **No**             | AI API routes only — value: `eu-west-2` |
| `UPSTASH_REDIS_REST_URL`        | **No**             | AI API routes only                      |
| `UPSTASH_REDIS_REST_TOKEN`      | **No**             | AI API routes only                      |
| `RESEND_API_KEY`                | **No**             | Email sending (Resend)                  |
| `CRON_SECRET`                   | **No**             | Cron route authentication               |
| `SENTRY_DSN`                    | **No**             | Server-side Sentry SDK                  |
| `AI_ENABLED`                    | **No**             | Kill-switch for all AI routes           |

A `.env.example` file with placeholder values is committed to the repository. `.env.local` is in `.gitignore` and must never be committed.

### Defence-in-depth summary

| Layer                    | Protection                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| Middleware               | Unauthenticated users cannot access any protected route                    |
| RLS policies             | Database rejects cross-user queries even if application code has a bug     |
| RLS `WITH CHECK`         | Write policies enforce ownership on INSERT/UPDATE, not just SELECT         |
| Server-side only secrets | `SUPABASE_SERVICE_ROLE_KEY` and AWS credentials never reach the browser    |
| Zod env validation       | `lib/env.ts` validates all required environment variables at startup       |
| Zod input validation     | All inputs validated before processing                                     |
| Path-prefix IDOR check   | `lib/application-guard.ts` verifies application ownership before access    |
| Rate limiting            | Upstash prevents rapid-fire AI route abuse                                 |
| Usage cap (fail-closed)  | `reserve_ai_slot` RPC — if the RPC fails, the request is denied            |
| CSP nonce                | Per-request nonce replaces `unsafe-inline` on `script-src`                 |
| Resend preflight         | Email domain verified (SPF + DKIM) before any mail is sent                 |
| Security headers         | HSTS, X-Frame-Options, Referrer-Policy protect against client-side attacks |

---

## 14. Operations and Deployment

### Deployment strategy

Vercel automatic Git deployment. (ADR-OPS-002)

- `master` branch → production deployment (automatic)
- Feature branches → Vercel preview deployments (automatic, unique URL per branch)
- Branch protection on `master`: CI checks must pass before merge

**Always verify the feature branch preview URL before merging to `master`.**

**Per-release deployment process:**

1. Apply pending migrations: `supabase db push --db-url [prod-url]`
2. Verify the feature branch preview deployment
3. Merge to `master`
4. Confirm the Vercel production deployment completes

### Continuous Integration

GitHub Actions CI runs on every push and pull request to `master`. Four jobs:

| Job                   | What it runs                                                 |
| --------------------- | ------------------------------------------------------------ |
| `lint-and-typecheck`  | `npm run type-check`, `npm run lint`, `npm run format:check` |
| `test`                | `npm test` (Vitest)                                          |
| `audit`               | `npm audit --audit-level=high`                               |
| `validate-migrations` | `supabase db start && supabase db reset --local`             |

### Email

Resend handles transactional email (verification, password reset) via Supabase Auth SMTP. (ADR-OPS-003)

Supabase Auth email templates are customised in the Supabase dashboard under Authentication → Email Templates. Templates must reference "Grant Pathway" and follow the warm, approachable tone in `design-requirements.md`.

### Scheduled jobs

Vercel Cron Jobs handle application-level scheduled tasks. (ADR-OPS-004)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-guidelines",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/inactivity-warning",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/inactivity-deletion",
      "schedule": "0 9 * * *"
    }
  ]
}
```

All cron routes require an `Authorization: Bearer [CRON_SECRET]` header and reject unauthorised calls with 401.

### Error tracking

Sentry (EU region) captures all unhandled errors on server and client. (ADR-OPS-005)

Sentry is initialised via Next.js instrumentation hooks:

- `instrumentation.ts` — server-side init
- `instrumentation-client.ts` — client-side init
- `sentry.*.config.ts` — per-runtime configuration

**Two key configuration points:**

1. **PII scrubbing** — `beforeSend` hook strips `user.email` and `user.name` from all events:

```typescript
beforeSend(event) {
  if (event.user) { delete event.user.email; delete event.user.username; }
  return event;
}
```

2. **AI route tagging** — errors in AI generation routes are tagged for separate filtering:

```typescript
Sentry.withScope((scope) => {
  scope.setTag('route', 'generate-summary')
  Sentry.captureException(error)
})
```

Alert configuration: email on new error types only (not every occurrence).

### Accessibility

WCAG 2.2 Level AA is required from day one. (DDR-AC-001, ADR-OPS-006)

- `@axe-core/react` in development mode for automated violation detection
- Lighthouse accessibility audit as part of pre-release checks (target: 95+)
- Manual keyboard and screen reader testing before each release
- Accessibility violations are treated as bugs — not deferred

---

## 15. Development Environment Setup

### Prerequisites

- Node.js 20+
- Docker Desktop (with WSL2 backend on Windows)
- Supabase CLI (`npm install -g supabase`)
- Git

### First-time setup

```bash
# 1. Clone the repository
git clone [repo-url]
cd grant-pathway

# 2. Install dependencies
npm install

# 3. Copy environment variables template
cp .env.example .env.local
# Fill in .env.local with development Supabase project credentials

# 4. Start local Supabase stack
supabase start

# 5. Apply migrations and seed data
supabase db reset

# 6. Start the development server
npm run dev
```

### Environment variables for local development

Obtain the development Supabase project URL and keys from the Supabase dashboard (or from `supabase status` after `supabase start`). Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-2
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
AI_ENABLED=true
```

### Useful commands

| Command                            | Purpose                                              |
| ---------------------------------- | ---------------------------------------------------- |
| `npm run dev`                      | Start development server                             |
| `npm test`                         | Run Vitest unit tests                                |
| `npm run type-check`               | TypeScript type check (no emit)                      |
| `npm run lint`                     | ESLint                                               |
| `supabase start`                   | Start local Supabase stack                           |
| `supabase stop`                    | Stop local Supabase stack                            |
| `supabase db reset`                | Reset local database (applies all migrations + seed) |
| `supabase db diff --schema public` | Generate migration from dashboard changes            |
| `supabase db push --db-url [url]`  | Apply migrations to remote project                   |
| `supabase status`                  | Show local project URLs and keys                     |

---

## 16. Pre-Launch Checklist

The following one-time tasks must be completed before the first production deployment. Full details are in ADR-OPS-002.

- [ ] Activate Vercel Pro and confirm billing
- [ ] Add `export const maxDuration = 90` to AI route files
- [ ] Create Resend account, verify sending domain (SPF + DKIM DNS records)
- [ ] Configure Supabase Auth SMTP with Resend credentials
- [ ] Customise Supabase Auth email templates (verification + password reset) — must reference "Grant Pathway", follow tone and voice guide, use teal CTA buttons
- [ ] Configure Amazon Bedrock Claude Sonnet 4.6 model access in AWS eu-west-2 console; set monthly spend cap as a secondary safety net
- [ ] Create Sentry project in EU region, configure PII scrubbing and AI route tagging, set up email alerts for new error types
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to Vercel production environment variables
- [ ] Set all production environment variables in Vercel Production scope (including `AI_ENABLED=true`)
- [ ] Add `CRON_SECRET` environment variable to Vercel and confirm all three cron jobs appear active in Vercel dashboard
- [ ] Validate HTTP security headers at securityheaders.com
- [ ] Apply initial database migrations to the production Supabase project
- [ ] Run a full manual test of the five-step flow on the production deployment
- [ ] Run Lighthouse accessibility audit on key pages (target 95+)

---

---

## Document History

| Version | Date       | Author         | Summary of changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-04-21 | Rapidglobe Ltd | Initial document — full technical design covering all 16 sections                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.1     | 2026-05-07 | Rapidglobe Ltd | Updated database schema (assembled_draft, draft_status columns; corrected status values; renamed fund_name → grant_name); corrected application_answers schema (question_order, answer_source, is_budget_question); updated ai_usage_log schema (token_count, request_type values)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.2     | 2026-05-20 | Rapidglobe Ltd | Updated Server Actions table and API Routes table to reflect current implementations; added GAP notes from Phase 3 → Phase 4 gate sweep                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.3     | 2026-05-29 | Rapidglobe Ltd | Added AiSummarySection type and sections? field to AiSummaryData; updated funder type routing description (structured vs free_form paths); removed /api/generate-draft from API routes table (replaced by /api/refine-answer); updated AI usage cap from 20 to 50 requests/user/month throughout; removed Step 4 page-level loading stages (no longer applicable after Q&A redesign); added document history table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.4     | 2026-06-30 | Rapidglobe Ltd | Major gap-analysis update: §3 added Vitest and GitHub Actions to stack table, corrected AI cap to 50 in costs table; §4 full project tree rewrite (added **tests**/, vitest.config.ts, instrumentation*.ts, sentry.*.config.ts, global-error.tsx, error.tsx, robots.ts, sitemap.ts, new lib files, next.config.ts); §5 updated middleware to updateSession() pattern + per-request CSP nonce, corrected public routes; §6 full schema rewrite to match data-model.md (thick charity_profiles, corrected user_profiles, added funders table, fixed application_answers columns, corrected ai_usage_log request_type, updated RLS table); §9 restored /api/generate-draft as active, added /api/health, updated actions function list; §11 moved AiSummaryData to lib/types.ts, updated type with charLimit/limitType/eligibilityMismatch, added notes on XML fencing/Zod safeParse/kill-switch/advisory lock; §13 CSP moved to middleware (nonce-based), updated defence-in-depth table, added RESEND_API_KEY/AI_ENABLED/split SENTRY_DSN to secrets; §14 corrected branch name main→master, documented 4 active CI jobs, updated vercel.json to show all 3 cron jobs, added Sentry instrumentation file notes |
| 1.5     | 2026-07-01 | Rapidglobe Ltd | Removed 3 phantom `/mfa` TOTP references (project tree, protected routes, routes table) reintroduced in error by the 1.4 gap-analysis pass — MFA was actually removed from the codebase 2026-06-12 and demoted to Won't Have in `moscow-feature-register.md`; see CHANGELOG.md 2026-07-01                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 1.6     | 2026-07-01 | Rapidglobe Ltd | Fixed `/application/[id]` → `/applications/[id]` route-naming inconsistency (project tree merged from two separate top-level entries into one; 12 occurrences across §4 and §7 route tables) to match the actual codebase and decision D1 in `IMPLEMENTATION-PLAN.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 1.7     | 2026-07-01 | Rapidglobe Ltd | Removed the 1.4 pass's incorrect "restored /api/generate-draft as active" claim — the route was confirmed genuinely orphaned (zero callers anywhere in the codebase) and deleted entirely 2026-07-01. Corrected §4 project tree, §9 API routes table (`/api/refine-answer` config corrected from "Default timeout" to `maxDuration = 60`), and §13 rate-limiting table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

---

_Technical Design Document — Grant Pathway v1_
_All architectural decisions recorded in `docs/Technical Decision and Design/ADR-*.md`_
