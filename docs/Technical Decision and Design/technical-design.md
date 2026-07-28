# Grant Pathway — Technical Design Document

**Tier:** 1 — Always check after every task
**Volatility:** High
**Update when:** Any change to system architecture, data model, API contracts, or component design

**Version:** 1.22
**Date:** 2026-04-21
**Last updated:** 2026-07-25
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

This document describes the technical design of Grant Pathway v1 — a free AI-assisted grant writing tool for UK charities. It synthesises the architectural decisions recorded in the ADR files in this directory (47 as of 2026-07-05, see `ADR-INDEX.md`) into a unified, actionable reference for development.

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
│   PostgreSQL + Auth  │   │   Claude Sonnet (latest) │
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

| Layer           | Technology                                                            | Decision                   |
| --------------- | --------------------------------------------------------------------- | -------------------------- |
| Framework       | Next.js 14+ with TypeScript                                           | ADR-STACK-001              |
| Database        | Supabase PostgreSQL (London, eu-west-2)                               | ADR-STACK-002              |
| Authentication  | Supabase Auth                                                         | ADR-STACK-003              |
| Hosting         | Vercel Pro                                                            | ADR-STACK-004, ADR-OPS-001 |
| Source control  | GitHub (private repository)                                           | ADR-STACK-005              |
| UI components   | shadcn/ui + Base UI + Tailwind CSS                                    | ADR-STACK-006              |
| Icons           | Lucide React (via shadcn/ui)                                          | ADR-STACK-006              |
| AI provider     | Anthropic Claude (latest Sonnet model) via Amazon Bedrock (eu-west-2) | ADR-AI-001                 |
| AI model        | Latest Claude Sonnet model                                            | ADR-AI-002                 |
| PDF extraction  | `unpdf`                                                               | ADR-FILE-003               |
| Word extraction | `mammoth`                                                             | ADR-FILE-003               |
| Word generation | `docx`                                                                | ADR-EXPORT-001             |
| Rate limiting   | Upstash Redis + `@upstash/ratelimit`                                  | ADR-SEC-005                |
| Email           | Resend (via Supabase Auth SMTP)                                       | ADR-OPS-003                |
| Error tracking  | Sentry (EU region)                                                    | ADR-OPS-005                |
| Migrations      | Supabase CLI + Docker Desktop                                         | ADR-DATA-004               |
| Validation      | Zod (all API routes and Server Actions)                               | ADR-ARCH-003               |
| Test framework  | Vitest                                                                | —                          |
| CI              | GitHub Actions                                                        | —                          |

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
│   │   ├── verify-email/confirm/page.tsx  # D-012: auto-confirms via JS, no visible action
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

**Public routes:** `/` (landing + sign-in), `/register`, `/forgot-password`, `/verify-email`, `/verify-email/confirm`, `/terms`, `/privacy`

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

**Forward reference (`P6.1`, 2026-07-05):** five nullable governance/financial columns — `total_expenditure`, `reserves`, `trustees_related`, `bank_signatory_count`, `bank_signatories_related` — were added to support derived-ratio eligibility checks (R13). Applied to `grant-pathway-dev` only; not yet applied to production. Full detail in `docs/data-model.md`.

#### `funders`

Global reference table — not user-scoped. Seeded and maintained by Rapidglobe. Users can only SELECT active rows.

| Column           | Type          | Constraints                                  |
| ---------------- | ------------- | -------------------------------------------- |
| `id`             | `uuid`        | PK, default `gen_random_uuid()`              |
| `name`           | `text`        | Not null, unique                             |
| `grant_range`    | `text`        | Nullable — display string (e.g. "£10k–£30k") |
| `guidelines_url` | `text`        | Nullable                                     |
| `is_active`      | `boolean`     | Not null, default `true`                     |
| `created_at`     | `timestamptz` | Default `now()`                              |

**`funder_type` dropped (P6.2, migration `20260714000000`):** this column (`structured \| narrative`) was dropped from the Step 1 picker UI (DR-FD-001, 2026-07-04) after being found not to reflect a stable property of any funder, left in place afterwards, unused. **ADR-DATA-006** (2026-07-05) formally superseded it as part of the item-graph rearchitecture; the P6.2 migration dropped the column outright.

#### `applications`

| Column              | Type          | Constraints                                                                                                                                                                                                                                                                                                |
| ------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `uuid`        | PK, default `gen_random_uuid()`                                                                                                                                                                                                                                                                            |
| `user_id`           | `uuid`        | FK → `auth.users(id)`                                                                                                                                                                                                                                                                                      |
| `funder_id`         | `uuid`        | FK → `funders(id)`, nullable (migration safety)                                                                                                                                                                                                                                                            |
| `funder_name`       | `text`        | Not null — retained for display/export; populated from `funders.name` on selection                                                                                                                                                                                                                         |
| `grant_name`        | `text`        | Not null                                                                                                                                                                                                                                                                                                   |
| `status`            | `text`        | `not_started \| in_progress \| approved \| exported \| mismatch`                                                                                                                                                                                                                                           |
| `current_step`      | `integer`     | 1–5, default 1                                                                                                                                                                                                                                                                                             |
| `ai_summary`        | `text`        | Nullable — JSON string, populated in Step 3                                                                                                                                                                                                                                                                |
| `draft_status`      | `text`        | `not_started \| in_progress \| ready_to_assemble \| assembled \| exported`, default `not_started` — tracks progress through the Step 4 Q&A workflow                                                                                                                                                        |
| `assembled_draft`   | `text`        | Nullable — final assembled application text, written by the assemble action once all questions are answered; Step 5 export reads from this column                                                                                                                                                          |
| `last_exported_at`  | `timestamptz` | Nullable — timestamp of most recent export (any format); drives the re-export warning                                                                                                                                                                                                                      |
| `first_exported_at` | `timestamptz` | Nullable — timestamp of this application's very first export (any format), added 2026-07-17. Set once, never overwritten — the export document's displayed "Date:" always reads this column, not `new Date()` at request time, so every export (either format, any future re-download) shows the same date |
| `created_at`        | `timestamptz` | Default `now()`                                                                                                                                                                                                                                                                                            |
| `updated_at`        | `timestamptz` | Default `now()`                                                                                                                                                                                                                                                                                            |

`mismatch` is a terminal status — no transitions to steps 4 or 5 are permitted from this state (FR-47, DR-EL-001).

#### `application_items`

**Replaces `application_answers` (P6.2, migration `20260714000000`).** Compatibility mode: only `item_type = 'narrative'` is populated today; the other nine item types exist in the enum but are unused until P6.3 onward. See **ADR-DATA-006** (item-graph model) and **ADR-DATA-007** (guideline reference/citation shape).

| Column                       | Type          | Constraints                                                                                                                                                                                                                                                                     |
| ---------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                         | `uuid`        | PK, default `gen_random_uuid()`                                                                                                                                                                                                                                                 |
| `application_id`             | `uuid`        | FK → `applications(id)`                                                                                                                                                                                                                                                         |
| `user_id`                    | `uuid`        | FK → `auth.users(id)` (denormalised for RLS)                                                                                                                                                                                                                                    |
| `item_type`                  | `text` (enum) | `narrative \| data \| date \| number \| table \| file \| consent \| eligibility_gate \| scoring_criterion \| manual_action` — always `narrative` today                                                                                                                          |
| `item_label`                 | `text`        | Not null — item's prompt/label (was `question_text`)                                                                                                                                                                                                                            |
| `item_order`                 | `integer`     | Not null — unique per `(application_id, item_order)` (was `question_order`)                                                                                                                                                                                                     |
| `visibility_condition`       | `jsonb`       | Nullable — branching condition (R2/R3); always null today                                                                                                                                                                                                                       |
| `source_of_truth`            | `text` (enum) | `user_input \| charity_profile \| derived \| disclosure` — always `user_input` today                                                                                                                                                                                            |
| `validation_mode`            | `text` (enum) | Nullable — `hard_check \| judgement_flag`; always null today                                                                                                                                                                                                                    |
| `rubric_criterion_link`      | `uuid`        | Nullable — no FK yet, target table doesn't exist. Tracked as an explicit `P6.7` task (`ADR-TRACEABILITY.md`), not `P6.5` — see `ADR-DATA-006`'s 2026-07-14 amendment                                                                                                            |
| `cloned_from_application_id` | `uuid`        | Nullable, `on delete set null` — set when this row was carried over from a previous application via `P6.5`'s reuse feature (migration `20260714000002`). Drives the Step 4 "carried over — please review" badge                                                                 |
| `decision_maker_visible`     | `boolean`     | Not null, default `true` (R20) — always `true` today                                                                                                                                                                                                                            |
| `output_mode`                | `text` (enum) | Not null, default `generic_export` — `CHECK (output_mode = 'generic_export')`; `native_template_fill` is permanently out of scope (ADR-DATA-006 2026-07-11 amendment), enforced at the DB layer                                                                                 |
| `guideline_reference`        | `jsonb`       | Nullable — ADR-DATA-007 discriminated union (`source_type`: `'page'`\|`'heading'`\|`'item'`; `page_number`/`heading_path`/`item_number`; `quote`), `CHECK`-enforced (extended 2026-07-21 for `'item'`); populated by P6.3's extraction, null when no marker could be identified |
| `word_limit`                 | `integer`     | Nullable — set when `limit_type = 'words'`                                                                                                                                                                                                                                      |
| `char_limit`                 | `integer`     | Nullable — set when `limit_type = 'characters'`                                                                                                                                                                                                                                 |
| `limit_type`                 | `text`        | `words \| characters \| none`                                                                                                                                                                                                                                                   |
| `is_budget_question`         | `boolean`     | Not null, default `false` — disables AI assist on this row                                                                                                                                                                                                                      |
| `answer_text`                | `text`        | Nullable                                                                                                                                                                                                                                                                        |
| `ai_refined_answer`          | `text`        | Nullable — AI-suggested improved version, shown in the "Suggested improvement" card; kept separate from `answer_text` so the original is never overwritten without an explicit "Use this version" action                                                                        |
| `answer_source`              | `text`        | `user_written \| user_edited \| ai_generated`                                                                                                                                                                                                                                   |
| `is_approved`                | `boolean`     | Not null, default `false` — set in the Step 4 review gate                                                                                                                                                                                                                       |
| `created_at`                 | `timestamptz` | Default `now()`                                                                                                                                                                                                                                                                 |
| `updated_at`                 | `timestamptz` | Default `now()`                                                                                                                                                                                                                                                                 |

**Note on free_form funders:** For narrative (free_form) funders, `item_label` stores the section title (e.g. "About your organisation"). Section guidance text is re-derived on each Step 4 page load from `applications.ai_summary.sections[i].guidance`, matched by `item_order`. This avoids data duplication and keeps guidance in sync with the AI summary.

**Predecessor (`application_answers`, superseded 2026-07-14):** carried a `question_type` column for BD-04 (question-level typing) that was never populated beyond `narrative` in practice — extraction (`lib/prompts.ts`) explicitly discarded non-narrative and conditional questions rather than classifying them. A nine-funder review (`docs/BRD plus decisions Mark Two/question-coverage-analysis.md`) found this flat, narrative-only model false in twenty distinct ways (R1–R20), which is what **ADR-DATA-006** (2026-07-05) replaced it for. All 169 existing rows were copied across as `item_type = 'narrative'` with zero information loss, verified against the MK Community Foundation — Oak Grants test application before the old table was dropped.

#### `application_guidelines`

**GAP-33 fix (2026-07-14), migration `20260714000001`.** Retains the marker-tagged guideline text sent to the AI and validated against for citations (`P6.3`), so `P6.4`'s "view original guidelines" viewer has something real to render. `ADR-DATA-002`'s 2026-07-10 reversal decided this retention should exist, but no task ever actually built it — found while scoping `P6.4`; a planning gap, not a defect in `P6.2`'s own build (`ADR-TRACEABILITY.md` GAP-33).

| Column           | Type          | Constraints                                                                                                                                          |
| ---------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | `uuid`        | PK, default `gen_random_uuid()`                                                                                                                      |
| `application_id` | `uuid`        | FK → `applications(id)` `on delete cascade`, unique — one row per application                                                                        |
| `user_id`        | `uuid`        | FK → `auth.users(id)` `on delete cascade` (denormalised for RLS, same convention as `application_items`)                                             |
| `guideline_text` | `text`        | Not null — the marker-tagged (`[PAGE N]`/`[SECTION: ...]`) text as sent to the AI, post-preprocessing (`textForPrompt`), never the raw uploaded file |
| `created_at`     | `timestamptz` | Default `now()`                                                                                                                                      |
| `updated_at`     | `timestamptz` | Default `now()` — refreshed whenever the summary is regenerated (upsert on `application_id`)                                                         |

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

| Table                    | SELECT                  | INSERT   | UPDATE   | DELETE   |
| ------------------------ | ----------------------- | -------- | -------- | -------- |
| `user_profiles`          | Own rows                | Own rows | Own rows | Own rows |
| `charity_profiles`       | Own rows                | Own rows | Own rows | Own rows |
| `funders`                | Active rows (all users) | ✗ Denied | ✗ Denied | ✗ Denied |
| `applications`           | Own rows                | Own rows | Own rows | Own rows |
| `application_items`      | Own rows                | Own rows | Own rows | Own rows |
| `application_guidelines` | Own rows                | Own rows | Own rows | Own rows |
| `ai_usage_log`           | Own rows                | Own rows | ✗ Denied | ✗ Denied |

"Own rows" = `user_id = auth.uid()`. UPDATE and DELETE are denied on `ai_usage_log` to prevent users from deleting their usage history to bypass the monthly AI request limit. `funders` INSERT/UPDATE/DELETE is restricted to the service role only.

### Monthly AI usage count

The monthly usage check is performed via three `SECURITY DEFINER` Supabase RPC functions rather than a bare client count, all using `pg_advisory_xact_lock` to prevent race conditions where two concurrent AI requests could both pass the cap check simultaneously:

- `reserve_ai_slot` — checks the monthly cap and reserves a slot before the Bedrock call is made
- `update_ai_slot_token_count` — records the actual token count against the reserved slot once the Bedrock response returns
- `cancel_ai_slot` — releases a reserved slot without counting it, if the Bedrock call fails

### Data not stored — raw file (still accurate); guideline text (superseded 2026-07-14 — GAP-33 fix)

The raw uploaded guideline file (PDF/Word) is **never** written to the database or retained in Supabase Storage — this remains accurate today. It is downloaded from the `guidelines-temp` bucket, extracted, and the Storage object deleted, all within the same request (`ADR-FILE-001`).

The extracted guideline **text**, however, is no longer session-only: as of `application_guidelines` (GAP-33 fix, migration `20260714000001`, 2026-07-14), the marker-tagged text sent to the AI is retained in Postgres for the life of the owning application, per `ADR-DATA-002`'s 2026-07-10 reversal. `sessionStorage` (`lib/guidelines-session.ts`) is still used client-side between Step 2 and Step 3, but the text no longer vanishes once the summary saves — it is additionally persisted server-side at that point.

**Reversal note (ADR-DATA-002, 2026-07-10):** The premise behind "never store" — that funder guidelines "may contain commercially sensitive information" — was checked against the real document corpus in `docs/Grant Org Guidelines/` and found false: these are funders' own publicly published application guidance. The decision was formally reversed the same day; **the storage half of that reversal is now built** (see above) — no raw guideline file is ever stored under either the old or new decision, only extracted text.

### Data retention

All data is retained for the lifetime of the user account. Account deletion cascades through all tables in order: `application_items`, `application_guidelines` → `applications` → `charity_profiles` → `ai_usage_log` → `user_profiles` → Supabase Auth user. Deletion is permanent and immediate. (ADR-DATA-003)

`application_guidelines` cascade-deletes with its owning application, same as `application_items` (both have `on delete cascade` FKs); the account-deletion route also deletes it explicitly, matching the existing explicit-deletion convention for `application_items`.

**Superseded 2026-07-14:** the sentence above originally continued "Playbook rows (`P6.5`, not yet built) will be excluded from any single user's cascade, matching the non-user-scoped `funders` table today" — describing a shared, funder-wide playbook record that was never built. `P6.5` (built 2026-07-14) turned out to be a private, per-charity reuse feature instead: see `ADR-DATA-006`'s 2026-07-14 amendment. Its only schema footprint is `application_items.cloned_from_application_id` (migration `20260714000002`) — a nullable, `on delete set null` self-referencing FK to `applications`. It is fully user-scoped: a cloned row cascade-deletes with its own owning application and user exactly like any other `application_items` row; the marker only records which prior application it was copied from, and is set to null (not cascade-deleted) if that source application is later removed, so the clone itself is never lost when its source is.

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

| Route                       | Type               | Data source                               |
| --------------------------- | ------------------ | ----------------------------------------- |
| `/`                         | Public, static     | None — landing + sign-in page             |
| `/register`                 | Public, static     | None                                      |
| `/forgot-password`          | Public, static     | None                                      |
| `/verify-email`             | Public, static     | None                                      |
| `/verify-email/confirm`     | Public, SSR        | None — D-012, see §9 for `/auth/callback` |
| `/terms`                    | Public, static     | None                                      |
| `/privacy`                  | Public, static     | None                                      |
| `/dashboard`                | Authenticated, SSR | `applications` table                      |
| `/profile`                  | Authenticated, SSR | `charity_profiles` table                  |
| `/applications/[id]/step/1` | Authenticated, SSR | `applications` table                      |
| `/applications/[id]/step/2` | Authenticated, SSR | `applications` table                      |
| `/applications/[id]/step/3` | Authenticated, SSR | `applications.ai_summary`                 |
| `/applications/[id]/step/4` | Authenticated, SSR | `applications`, `application_items`       |
| `/applications/[id]/step/5` | Authenticated, SSR | `applications`, `application_items`       |
| `/account`                  | Authenticated, SSR | `user_profiles`                           |

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
| `actions/auth.ts`         | Sign in, register, `confirmEmail` (D-012 — completes signup verification, called only from `/verify-email/confirm`), reset password, change password, sign out                                          |
| `actions/charity.ts`      | `saveCharityProfile(data)`                                                                                                                                                                              |
| `actions/applications.ts` | `createApplication`, `updateStep1`, `deleteApplication`, `advanceToStep4`, `saveAnswer`, `saveManualAnswer`, `setDraftReadyToAssemble`, `assembleAndAdvance`, `approveApplication`, `reopenApplication` |

### API Routes

Explicit API routes handle long-running operations, file handling, export, and scheduled jobs. (ADR-ARCH-003)

| Route                           | Method | Purpose                                                                                                                                                                                                    | Config                |
| ------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `/auth/callback`                | GET    | Supabase email verification / password reset redirect target. Password recovery completes immediately here; signup confirmation redirects to `/verify-email/confirm` instead of completing on load (D-012) | Default timeout       |
| `/api/generate-summary`         | POST   | Step 3: AI summary generation                                                                                                                                                                              | `maxDuration = 90`    |
| `/api/refine-answer`            | POST   | Step 4: Per-answer structure/clarity improvement (non-budget only)                                                                                                                                         | `maxDuration = 60`    |
| `/api/health`                   | GET    | Uptime monitoring endpoint (polled by UptimeRobot)                                                                                                                                                         | Default timeout       |
| `/api/upload/signed-url`        | POST   | Request Supabase Storage signed URL                                                                                                                                                                        | Default timeout       |
| `/api/upload/process`           | POST   | Extract text after upload; store in sessionStorage                                                                                                                                                         | Default timeout       |
| `/api/export/[applicationId]`   | GET    | Generate and stream Word (`format=docx`, default) or plain-text (`format=txt`) document                                                                                                                    | Default timeout       |
| `/api/account/delete`           | POST   | Cascade-delete user account and all data                                                                                                                                                                   | Default timeout       |
| `/api/cron/cleanup-guidelines`  | GET    | Delete orphaned Storage objects                                                                                                                                                                            | Cron: every 30 min    |
| `/api/cron/inactivity-warning`  | GET    | Send inactivity warning emails                                                                                                                                                                             | Cron: 08:00 UTC daily |
| `/api/cron/inactivity-deletion` | GET    | Delete inactive accounts ≥24 months                                                                                                                                                                        | Cron: 09:00 UTC daily |

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

**Structural tagging (added P6.2a, 2026-07-14, ADR-DATA-007):** extracted text carries inline markers so a future citation can point at real structure rather than a free-typed guess. PDFs are extracted per-page and joined with `[PAGE N]` markers (was `mergePages: true`, which flattened page boundaries away). Docx has no fixed pages, so Word's heading styles are the fallback reference unit — extraction walks `mammoth.convertToHtml`'s `<h1>`–`<h6>` output (was `extractRawText`, headingless) and emits `[SECTION: A > B]` markers preserving nesting. Pasted text (no file) gets the same `[SECTION: ...]` tagging in `lib/preprocess-text.ts` via a numbered/ALL-CAPS heading heuristic. `preprocessText`'s existing noise-stripping and character-ceiling truncation are both marker-aware — markers are never stripped as boilerplate/page-number noise, and truncation snaps to the last complete marker rather than cutting a page/section in half. **`[ITEM N]` fallback (2026-07-21 amendment):** a docx/pasted guideline with no real Word heading styles (confirmed live on the Wolfson Foundation's guidelines — plain "Normal"-style paragraphs visually formatted to look like section titles, but no `w:pStyle` Heading reference) produces zero `[SECTION: ...]` markers and, having no pages either, zero markers of any kind — nothing for a citation to anchor to. When a document has no headings at all, `tagSectionsFromHtml()`/`tagPastedTextSections()` number every paragraph/line `[ITEM N]` instead. Documents with real headings are unaffected. The marker-recognition regex (previously duplicated across four separate literals) is now centralised in `lib/structural-markers.ts`.

**Citation recording (added P6.3, 2026-07-14, ADR-DATA-007; extended 2026-07-21):** `buildSummaryPrompt` now asks the AI to report which `[PAGE N]`/`[SECTION: ...]`/`[ITEM N]` marker each question/section was drawn from, with an explicit instruction to omit the citation entirely rather than guess if no marker clearly applies. A citation is never trusted purely on the AI's word: `app/api/generate-summary/route.ts` cross-checks every reported citation against the markers actually present in `textForPrompt` (the text the AI was actually given, post-truncation) using `lib/guideline-citations.ts` — `extractValidMarkers()` reads the real markers out of the source text, `validateCitation()` checks the AI's citation against them and returns null if it doesn't check out (non-existent page/heading/item, or an empty quote), and `toGuidelineReferenceColumn()` converts a validated citation into the exact JSONB shape `application_items.guideline_reference`'s CHECK constraint requires (the unused keys entirely **absent**, not `null` — the constraint tests key presence). A console warning is logged if over half of what the AI offered for a document turns out invalid. Both `application_items` write points (`actions/applications.ts`'s `setDraftInProgress`, and Step 4's page-load sync) write the validated citation into `guideline_reference`. Scope for this milestone: questions/sections only — the Step 3 summary bullets (`aboutGrant`/`whoCanApply`/`lookingFor`/`keyRequirements`) are not citation-tagged, since they have no database column to store one in and nothing displays a citation yet regardless.

**Citation display and viewer (added P6.4, 2026-07-14, first milestone):** Step 4 (`app/(authenticated)/applications/[id]/step/4/page.tsx`) now selects `guideline_reference` (previously written by `P6.3` but never read back) and fetches `application_guidelines.guideline_text` (GAP-33) for the application. `components/application-step4-draft.tsx` shows a small clickable badge next to any question with a validated citation (e.g. "Page 5", a heading trail for docx/pasted-source citations, or "Item 3 of the guidelines" for the headless-document fallback added 2026-07-21) — clicking it opens a "view original guidelines" panel (the existing `components/ui/dialog.tsx` primitive, Base UI, already used elsewhere — no new UI library) showing the retained text with the cited quote highlighted and auto-scrolled into view. **Design correction (ADR-SEC-004, ADR-DATA-007, ADR-OPS-006, 2026-07-14):** all three ADRs originally assumed this viewer would fetch the raw PDF and render it to a `<canvas>` (pdf.js-style) — that predates GAP-33's fix and no longer holds, since only text is ever retained, never the raw file. Corrected to a plain text panel: no PDF-rendering library, no CSP change (`ADR-SEC-004`'s `worker-src` consequence removed), no novel accessibility surface (`ADR-OPS-006`'s three-item checklist reduced to two — keyboard nav and focus management, the canvas screen-reader item no longer applies). If the AI's quote isn't found verbatim in the retained text, the panel still shows the full text, just without a highlight — a graceful degradation (citations are validated against real page/section markers, not a verbatim-substring guarantee). Scope: first milestone only — no new item types, and the graph-walk/visibility-condition logic is a structural no-op today (nothing produces a branching or non-narrative item yet); building that now would be speculative.

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

**Forward reference (ADR-FILE-004, ADR-ARCH-004, 2026-07-10):** This remains exactly how the product works today. However, its underlying premise — consistency with ADR-DATA-002's "never store" decision — no longer holds, since that decision was reversed on 2026-07-10 (see "Data not stored" above). Once the Phase 6 guideline source-reference feature ships (P6.2a onward), guideline text will be retained server-side in Postgres, and this client-side `sessionStorage` round-trip is expected to become unnecessary for restoring Step 2 state — the retained server-side copy could be read directly instead. Nothing here changes until then.

---

## 11. AI Integration Pipeline

### Provider and model

- **Provider:** Anthropic's latest Claude Sonnet model via Amazon Bedrock eu-west-2 (`AnthropicBedrock` client from `@anthropic-ai/sdk`) (ADR-AI-001)
- **Model:** the latest available Claude Sonnet Bedrock In-Region model ID -- see `lib/prompts.ts`'s `MODEL` constant for the exact value currently deployed (ADR-AI-002)
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
// Added P6.3 (2026-07-14): each question/section carries an optional
// "citation" (source_type/page_number/heading_path/item_number/quote,
// ADR-DATA-007; item_number added 2026-07-21) — see "Citation recording" below.

// Step 4: improve structure/clarity of a written answer (non-budget only)
export const buildRefinePrompt = (
  questionText: string,
  answerText: string,
  wordLimit: number | null,
): string => `...`
// Returns JSON: { "refinedText": "..." }
// Relevance check (PDR-AI-009, 2026-07-17): always attempts the refine —
// never declines outright, regardless of word-limit status — but prepends
// the exported REFINE_IRRELEVANT_WARNING constant to refinedText when the
// answer doesn't plausibly address the question. Stripped by
// components/application-step4-draft.tsx before the suggestion is adopted
// as the saved answer or counted against the word/character limit.
```

**Corrected 2026-07-17** — this code block previously still showed `buildDraftPrompt` (Step 4 draft generation), which was deleted from `lib/prompts.ts` on 2026-07-01 (zero callers, superseded by `refine-answer` — see Section 6.6/PRD 0.x history). Removed here; not caught by the 2026-07-01 change at the time.

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

**Eligibility mismatch:** If the AI determines the charity is ineligible for the grant, `eligibilityMismatch: true` is returned and `applications.status` is set to `mismatch` — a terminal state that blocks steps 4 and 5. Because this hard stop has no override (`DR-EL-001`) and Bedrock does not guarantee identical output across calls even at `temperature: 0`, a `true` verdict from the first call is confirmed with a second, identical call before being trusted — the route only returns `eligibilityMismatch: true` if both calls agree (`PDR-AI-011`, found via GCM-01 live testing, 2026-07-28).

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
3. Fetches application details and all `application_items` rows
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

### App versioning

Since this project deploys continuously rather than on a release cadence, the app version is auto-derived from Vercel's build-time Git metadata rather than manually bumped. Format: `YYYY.MM.DD-<short git SHA>` (e.g. `2026.07.02-a2ca520`). Computed once at build time in `next.config.ts` (`APP_VERSION`), read via `lib/version.ts`'s `getAppVersion()`. Falls back to `"dev"` outside Vercel. Added 2026-07-02 — see `CHANGELOG.md` for the full rationale. Shown in two places: the export document footer (per `PDR-DH-003`) and, since 2026-07-17, the live app's `SiteFooter` component — added so WJ can confirm which deployed build he is testing.

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
- [ ] Configure Amazon Bedrock access for the latest Claude Sonnet model in AWS eu-west-2 console; set monthly spend cap as a secondary safety net
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

## Contextual Tooltips and Help Centre Link (PDR-UI-008)

`components/contextual-tooltip.tsx` is a reusable wrapper around `components/ui/tooltip.tsx` (Base UI), without any coachmark/tour library dependency. **Simplified 2026-07-25 (`PDR-UI-008` v3.0):** every tooltip is a plain hover/focus hint with no dismiss button and no persisted state — the original design's 5 trigger variants, server-side dismissed-state fetch (`actions/tooltips.ts`), and `user_tooltip_dismissals` table were found over-engineered for a pre-launch product and removed. The only remaining prop beyond `content`/`children`/`side` is `active`, used solely to hide the "Ready to assemble" hint once its target button is no longer disabled.

The help centre link's base URL is a single config value (`lib/help-centre.ts`'s `HELP_CENTRE_BASE_URL`, `helpCentreUrl(path?)`), consumed by the nav bar, public nav, footer, and dashboard empty state.

## Document History

| Version | Date       | Author         | Summary of changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.22    | 2026-07-25 | Rapidglobe Ltd | Contextual Tooltips section updated: dismissed-state persistence removed (`PDR-UI-008` v3.0) — 5-variant design and server-side dismiss/persist pattern replaced with a single plain hover/focus tooltip, no memory.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 1.21    | 2026-07-24 | Rapidglobe Ltd | New section: Contextual Tooltips and Help Centre Link (`PDR-UI-008`) — `components/contextual-tooltip.tsx`'s 5-variant design, dismissed-state fetch/persist pattern, `lib/help-centre.ts` config.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.0     | 2026-04-21 | Rapidglobe Ltd | Initial document — full technical design covering all 16 sections                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.1     | 2026-05-07 | Rapidglobe Ltd | Updated database schema (assembled_draft, draft_status columns; corrected status values; renamed fund_name → grant_name); corrected application_answers schema (question_order, answer_source, is_budget_question); updated ai_usage_log schema (token_count, request_type values)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.2     | 2026-05-20 | Rapidglobe Ltd | Updated Server Actions table and API Routes table to reflect current implementations; added GAP notes from Phase 3 → Phase 4 gate sweep                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.3     | 2026-05-29 | Rapidglobe Ltd | Added AiSummarySection type and sections? field to AiSummaryData; updated funder type routing description (structured vs free_form paths); removed /api/generate-draft from API routes table (replaced by /api/refine-answer); updated AI usage cap from 20 to 50 requests/user/month throughout; removed Step 4 page-level loading stages (no longer applicable after Q&A redesign); added document history table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.4     | 2026-06-30 | Rapidglobe Ltd | Major gap-analysis update: §3 added Vitest and GitHub Actions to stack table, corrected AI cap to 50 in costs table; §4 full project tree rewrite (added **tests**/, vitest.config.ts, instrumentation*.ts, sentry.*.config.ts, global-error.tsx, error.tsx, robots.ts, sitemap.ts, new lib files, next.config.ts); §5 updated middleware to updateSession() pattern + per-request CSP nonce, corrected public routes; §6 full schema rewrite to match data-model.md (thick charity_profiles, corrected user_profiles, added funders table, fixed application_answers columns, corrected ai_usage_log request_type, updated RLS table); §9 restored /api/generate-draft as active, added /api/health, updated actions function list; §11 moved AiSummaryData to lib/types.ts, updated type with charLimit/limitType/eligibilityMismatch, added notes on XML fencing/Zod safeParse/kill-switch/advisory lock; §13 CSP moved to middleware (nonce-based), updated defence-in-depth table, added RESEND_API_KEY/AI_ENABLED/split SENTRY_DSN to secrets; §14 corrected branch name main→master, documented 4 active CI jobs, updated vercel.json to show all 3 cron jobs, added Sentry instrumentation file notes |
| 1.5     | 2026-07-01 | Rapidglobe Ltd | Removed 3 phantom `/mfa` TOTP references (project tree, protected routes, routes table) reintroduced in error by the 1.4 gap-analysis pass — MFA was actually removed from the codebase 2026-06-12 and demoted to Won't Have in `moscow-feature-register.md`; see CHANGELOG.md 2026-07-01                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 1.6     | 2026-07-01 | Rapidglobe Ltd | Fixed `/application/[id]` → `/applications/[id]` route-naming inconsistency (project tree merged from two separate top-level entries into one; 12 occurrences across §4 and §7 route tables) to match the actual codebase and decision D1 in `IMPLEMENTATION-PLAN.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 1.7     | 2026-07-01 | Rapidglobe Ltd | Removed the 1.4 pass's incorrect "restored /api/generate-draft as active" claim — the route was confirmed genuinely orphaned (zero callers anywhere in the codebase) and deleted entirely 2026-07-01. Corrected §4 project tree, §9 API routes table (`/api/refine-answer` config corrected from "Default timeout" to `maxDuration = 60`), and §13 rate-limiting table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 1.8     | 2026-07-05 | Rapidglobe Ltd | Added forward-reference notes to the `funders` and `application_answers` schema sections pointing at ADR-DATA-006 (Application Item-Graph Model) — a decided but not-yet-built rearchitecture superseding `funder_type` and the flat `application_answers` structure. No schema change; the tables documented here remain the accurate current-production state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

| 1.9 | 2026-07-10 | Rapidglobe Ltd | Documented the reversal of ADR-DATA-002 ("never store" funder guidelines): the "commercially sensitive information" premise was checked against the real document corpus in `docs/Grant Org Guidelines/` and found false — these are funders' own publicly published guidance. Added a reversal note under "Data not stored" and a forward-reference note under "Guidelines session storage" explaining that extracted guideline text will be retained in Postgres (application-scoped cascade per ADR-DATA-003, or indefinite for approved playbooks) once the Phase 6 P6.2a/P6.2/P6.3 work ships; also added a forward-reference note under "Data retention" for the two new Phase 6 tables. No code has changed — `sessionStorage` and "never stored" remain the accurate current-production behaviour until that Phase 6 work lands |
| 1.20 | 2026-07-21 | Rapidglobe Ltd | **`[ITEM N]` citation fallback marker built (ADR-DATA-007 2026-07-21 amendment).** Live-testing found the Wolfson Foundation's guidelines produced zero citations on every attempt — confirmed by unzipping the actual docx, every paragraph uses Word's default "Normal" style (no `w:pStyle` Heading reference at all), so `tagSectionsFromHtml()` never emits a `[SECTION: ...]` marker and, being a docx not a PDF, no `[PAGE N]` marker either — the whole guideline carried no structural marker of any kind. Added a third `source_type`, `'item'`, anchored to a new `[ITEM N]` marker (one per paragraph/bullet/line), inserted only as a fallback when a document has no heading or page structure at all — `lib/extract-text.ts`'s `tagSectionsFromHtml` and `lib/preprocess-text.ts`'s `tagPastedTextSections`; documents with real headings are unaffected. `lib/guideline-citations.ts`, `lib/types.ts`'s `GuidelineCitation`, the `citationSchema` in `app/api/generate-summary/route.ts`, and `lib/prompts.ts`'s citation instructions all gained the third branch; `components/application-step4-draft.tsx`'s `citationFullLabel()` renders it as "Item N of the guidelines". New migration `20260721000000` extends the `guideline_reference` CHECK constraint. The marker-recognition regex, previously duplicated across four separate literals, was consolidated into new `lib/structural-markers.ts`. §6 and §11 updated above. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-21). |
| 1.19 | 2026-07-17 | Rapidglobe Ltd | **Export date fixed to one timestamp per application.** New nullable `applications.first_exported_at` column (migration `20260717000000`, `grant-pathway-dev` only), set once on an application's very first export (any format) and never overwritten — `app/api/export/[applicationId]/route.ts`'s displayed "Date:" now reads this column instead of computing `new Date()` live on every request. Fixes a bug WJ found live-testing: a .txt export and a .docx export of the same application showed dates 2 minutes apart. `last_exported_at` (always refreshed, drives the re-export warning) is unaffected. §6 `applications` schema table updated. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-17) and `docs/data-model.md` v1.14. |
| 1.18 | 2026-07-17 | Rapidglobe Ltd | **PDR-AI-009 built** — "Prompt architecture" section's `buildRefinePrompt` code sample updated with a relevance-check note: the prompt now always attempts the refine regardless of word-limit status (never declines outright), but prepends the exported `REFINE_IRRELEVANT_WARNING` constant to `refinedText` when the answer doesn't plausibly address the question — stripped by `components/application-step4-draft.tsx` before adoption or limit-counting. Same code block also still showed `buildDraftPrompt`, deleted from `lib/prompts.ts` on 2026-07-01 (zero callers) but missed by that day's own correction pass (v1.7) — removed. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-17) and `PDR-AI-009`. |
| 1.17 | 2026-07-17 | Rapidglobe Ltd | **App versioning note updated** — the app version (`lib/version.ts`'s `getAppVersion()`) is now shown in two places, not one: the export document footer (`PDR-DH-003`, unchanged) and, newly, the live app's `SiteFooter` component (`components/site-footer.tsx`), added so WJ can distinguish deployed builds while live-testing. No new architectural decision — same helper, second call site. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-17). |
| 1.16 | 2026-07-14 | Rapidglobe Ltd | **P6.5 built — private per-charity reuse, not a shared playbook.** During the design walkthrough, WJ challenged the premise behind a shared, curator-approved playbook: why shouldn't a charity applicant be their own curator? The simpler feature adopted instead: a charity starting a new application to a funder they've already reached Step 4 with before may choose to carry across their own previous question list, retained guidelines, AI summary, and answers (reset to "needs review"). New nullable `application_items.cloned_from_application_id` (self-referencing FK, `on delete set null`; migration `20260714000002`) — no new table. §6's `rubric_criterion_link` forward-reference corrected (target is `P6.7`, not `P6.5`); the `application_guidelines` cascade note's "Playbook rows... non-user-scoped" sentence corrected to describe the real, fully user-scoped mechanism. `ADR-DATA-006`/`ADR-DATA-007` amended the same day. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-14). |
| 1.15 | 2026-07-14 | Rapidglobe Ltd | **P6.4 built (first milestone)** — new "Citation display and viewer" note: Step 4 shows a clickable citation badge per question, opening a text panel (reusing the existing `Dialog` primitive) that highlights the cited quote in the retained guideline text. `ADR-SEC-004`/`ADR-DATA-007`/`ADR-OPS-006` corrected the same day — all three wrongly assumed canvas-based PDF rendering; the viewer is a plain text panel, no CSP change needed. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-14). |
| 1.14 | 2026-07-14 | Rapidglobe Ltd | **GAP-33 fixed** — new §6 `application_guidelines` table (migration `20260714000001`): retains the marker-tagged guideline text sent to the AI, so `P6.4`'s viewer has something real to render. `ADR-DATA-002`'s 2026-07-10 reversal decided this should exist; no task ever built it until now (a planning gap, not a P6.2 defect — confirmed with WJ). "Data not stored"/"Data retention" sections corrected: guideline text is no longer session-only. RLS table and account-deletion cascade order updated. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-14) and `docs/data-model.md` v1.8. |
| 1.13 | 2026-07-14 | Rapidglobe Ltd | **P6.3 built (first milestone)** — "Prompt architecture" section gained a "Citation recording" note: `buildSummaryPrompt` now requests a citation per question/section pointing at `P6.2a`'s markers; new `lib/guideline-citations.ts` validates every citation against real markers before it reaches `application_items.guideline_reference`, dropping (never trusting) any that don't check out. No API contract change beyond the new optional `citation` field on each question/section. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-14). |
| 1.12 | 2026-07-14 | Rapidglobe Ltd | **P6.2a built** — "Text extraction" section (§ under Guideline Upload Flow) gained a "Structural tagging" note: PDF extraction now per-page with `[PAGE N]` markers (was `mergePages: true`); docx now via `mammoth.convertToHtml` with `[SECTION: A > B]` markers from Word heading styles (was `extractRawText`, headingless); pasted text gets the same section markers in `lib/preprocess-text.ts` via a heading heuristic. Truncation and noise-stripping in `preprocessText` made marker-aware (ADR-AI-007). No API contract or `sessionStorage` shape change — extraction result is still a plain string, now with embedded markers; nothing consumes them yet (`P6.3`). Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-14). |
| 1.11 | 2026-07-14 | Rapidglobe Ltd | **P6.2 built** — §6 `application_answers` schema section replaced with `application_items` (item-graph model, compatibility mode; migration `20260714000000`, `grant-pathway-dev` only): `question_text`/`question_order` renamed to `item_label`/`item_order`; new columns `item_type`, `visibility_condition`, `source_of_truth`, `validation_mode`, `rubric_criterion_link`, `decision_maker_visible`, `output_mode` (CHECK-constrained to `generic_export`), `guideline_reference` (ADR-DATA-007 shape, CHECK-enforced). `funders.funder_type` dropped, its forward-reference note replaced with a completion note. Cascade-deletion order, page-data-usage table, and the assemble-draft code walkthrough (§9) updated to the new table name. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-14) and `docs/data-model.md` v1.7. |
| 1.10 | 2026-07-13 | Rapidglobe Ltd | Six findings fixed from a staleness audit, per WJ: (1) `applications` schema table was missing `draft_status` and `assembled_draft` — both live in production (`data-model.md` v1.6) and were even documented here once before (added in this doc's own v1.1) but dropped during a later schema rewrite; restored, closing an internal inconsistency with §9's `setDraftReadyToAssemble`/`assembleAndAdvance` Server Actions, which only make sense with `draft_status` present. (2) Technology Stack table corrected from "Radix UI" to "Base UI", matching the live `@base-ui/react` dependency (zero Radix in `package.json`) and the same fix already made in `PDR-UI-001` and the PRD. (3) `application_answers` schema table was missing `ai_refined_answer` — added. (4) "Monthly AI usage count" only described `reserve_ai_slot`; added the other two RPCs from the same migration (`update_ai_slot_token_count`, `cancel_ai_slot`) and named the `pg_advisory_xact_lock` mechanism specifically. (5) De-versioned three forward-looking AI-model mentions (Technology Stack table, §11 Provider/Model bullets, §16 Pre-Launch Checklist) to "the latest Claude Sonnet model" per the project's model de-versioning policy -- the `lib/prompts.ts` code snippet's literal `MODEL` constant value was correctly left as-is. (6) Added a forward-reference note under `charity_profiles` for `P6.1`'s five governance/financial columns (dev-only, not yet in production), matching this document's existing forward-reference pattern for other not-yet-built work. |

---

_Technical Design Document — Grant Pathway v1_
_All architectural decisions recorded in `docs/Technical Decision and Design/ADR-*.md`_
