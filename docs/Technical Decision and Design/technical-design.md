# Grant Pathway — Technical Design Document

**Version:** 1.0
**Date:** 2026-04-21
**Status:** Approved — all 42 architectural decisions decided
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

1. A charity worker registers and creates a charity profile (name, mission, beneficiaries, programmes, impact)
2. They create a grant application, upload or paste funder guidelines
3. The AI reads the guidelines and produces a structured summary
4. The AI writes draft answers to each application question using the charity profile and summary
5. The user reviews and edits the draft answers
6. The user exports the completed application as a Word document

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

| Layer | Technology | Decision |
|---|---|---|
| Framework | Next.js 14+ with TypeScript | ADR-STACK-001 |
| Database | Supabase PostgreSQL (London, eu-west-2) | ADR-STACK-002 |
| Authentication | Supabase Auth | ADR-STACK-003 |
| Hosting | Vercel Pro | ADR-STACK-004, ADR-OPS-001 |
| Source control | GitHub (private repository) | ADR-STACK-005 |
| UI components | shadcn/ui + Radix UI + Tailwind CSS | ADR-STACK-006 |
| Icons | Lucide React (via shadcn/ui) | ADR-STACK-006 |
| AI provider | Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2) | ADR-AI-001 |
| AI model | Claude Sonnet 4.6 | ADR-AI-002 |
| PDF extraction | `unpdf` | ADR-FILE-003 |
| Word extraction | `mammoth` | ADR-FILE-003 |
| Word generation | `docx` | ADR-EXPORT-001 |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | ADR-SEC-005 |
| Email | Resend (via Supabase Auth SMTP) | ADR-OPS-003 |
| Error tracking | Sentry (EU region) | ADR-OPS-005 |
| Migrations | Supabase CLI + Docker Desktop | ADR-DATA-004 |
| Validation | Zod (all API routes and Server Actions) | ADR-ARCH-003 |

### Operating costs (monthly)

| Service | Cost |
|---|---|
| Vercel Pro | ~£16/month |
| Supabase | Free tier (initially) |
| Amazon Bedrock (Claude) | Usage-based (capped at 20 req/user/month) |
| Upstash | Free tier |
| Resend | Free tier (3,000 emails/month) |
| Sentry | Free tier (5,000 errors/month) |
| **Total fixed** | **~£16/month** (well within £100/month C1 budget) |

---

## 4. Project Structure

```
/
├── app/
│   ├── (public)/                    # Public routes (no auth required)
│   │   ├── page.tsx                 # Landing page
│   │   ├── sign-in/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (authenticated)/             # Protected routes (auth required)
│   │   ├── layout.tsx               # Shared layout: nav + charity profile banner
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── application/
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
│   └── api/
│       ├── generate-summary/route.ts    # maxDuration = 90
│       ├── generate-draft/route.ts      # maxDuration = 90
│       ├── upload/
│       │   ├── signed-url/route.ts
│       │   └── process/route.ts
│       ├── export/[id]/route.ts
│       └── cron/
│           └── cleanup-storage/route.ts
│
├── actions/                         # Server Actions ("use server")
│   ├── profile.ts                   # Save/update charity profile
│   ├── applications.ts              # Create, rename, delete, update status
│   └── answers.ts                   # Save individual answers (auto-save)
│
├── components/
│   ├── ui/                          # shadcn/ui components
│   └── [feature components]
│
├── lib/
│   ├── prompts.ts                   # AI prompt builder functions + MODEL constant
│   ├── ai-error-handler.ts          # Shared Anthropic retry + error mapping
│   ├── extract-text.ts              # PDF (unpdf) + Word (mammoth) extraction
│   ├── guidelines-session.ts        # sessionStorage get/set/clear for guidelines
│   └── supabase/
│       ├── server.ts                # createServerClient (Server Components, Actions)
│       ├── client.ts                # createBrowserClient (Client Components)
│       └── middleware.ts            # createMiddlewareClient
│
├── middleware.ts                    # Route protection + session refresh
├── vercel.json                      # Cron job configuration
├── next.config.js                   # Security headers + Next.js config
├── tailwind.config.ts               # Design token colours
│
└── supabase/
    ├── migrations/
    │   └── [timestamp]_initial_schema.sql
    └── seed.sql                     # Sample data for local development
```

---

## 5. Authentication and Session Management

### Provider

Supabase Auth handles registration, login, email verification, and password reset. (ADR-STACK-003)

### Middleware

`middleware.ts` at the project root intercepts every request before the page renders, using `createServerClient` from `@supabase/ssr`. (ADR-SEC-001)

**What middleware does:**
1. Reads the Supabase session from request cookies
2. Refreshes the session token if close to expiry
3. Redirects unauthenticated requests to protected routes → `/sign-in`
4. Redirects authenticated requests to `/sign-in` or `/register` → `/dashboard`

**Matcher configuration:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Protected routes:** `/dashboard`, `/profile`, `/application/:path*`, `/account/:path*`

**Public routes:** `/`, `/sign-in`, `/register`, `/forgot-password`, `/reset-password`

### Session timeout

A 60-minute inactivity timeout is enforced client-side. (ADR-SEC-003)

- Activity tracking monitors `mousemove`, `keydown`, and `click` events
- A warning modal appears at 55 minutes of inactivity with a "Stay signed in" option
- If dismissed or ignored, the user is signed out and redirected to `/sign-in` with the message: *"You've been signed out due to inactivity."*
- Auto-save (Step 4) ensures in-progress answers are saved before the timeout fires

### Supabase client instances

Three distinct clients are used depending on context:

| Context | Client | File |
|---|---|---|
| Server Components, Server Actions | `createServerClient` | `lib/supabase/server.ts` |
| Client Components | `createBrowserClient` | `lib/supabase/client.ts` |
| Middleware | `createMiddlewareClient` | `lib/supabase/middleware.ts` |

The **service role client** (using `SUPABASE_SERVICE_ROLE_KEY`) is used only in API routes that require bypassing RLS — specifically account deletion and the Storage cleanup cron job. It must never appear in client-side code.

---

## 6. Database Design

### Schema

All tables are in the `public` schema. RLS is enabled on all tables with default-deny. (ADR-DATA-001, ADR-SEC-002)

#### `user_profiles`
| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, references `auth.users(id)` |
| `email` | `text` | Not null |
| `full_name` | `text` | |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

#### `charity_profiles`
| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `user_profiles(id)`, unique |
| `charity_name` | `text` | |
| `charity_number` | `text` | |
| `mission_statement` | `text` | |
| `beneficiaries` | `text` | |
| `programmes` | `text` | |
| `impact` | `text` | |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

#### `applications`
| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `user_profiles(id)` |
| `funder_name` | `text` | Not null |
| `fund_name` | `text` | |
| `deadline` | `date` | Nullable |
| `amount_sought` | `integer` | Nullable |
| `status` | `text` | `draft`, `in_progress`, `complete` |
| `current_step` | `integer` | 1–5, default 1 |
| `ai_summary` | `text` | Nullable, populated in Step 3 |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

#### `application_answers`
| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `application_id` | `uuid` | FK → `applications(id)` |
| `user_id` | `uuid` | FK → `user_profiles(id)` (denormalised for RLS) |
| `question_text` | `text` | Not null |
| `answer_text` | `text` | Nullable |
| `word_limit` | `integer` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

#### `ai_usage_log`
| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `user_profiles(id)` |
| `request_type` | `text` | `summary` or `draft` |
| `application_id` | `uuid` | Nullable |
| `created_at` | `timestamptz` | Default `now()` — used for monthly count |

### Row Level Security policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `user_profiles` | Own rows | Own rows | Own rows | Own rows |
| `charity_profiles` | Own rows | Own rows | Own rows | Own rows |
| `applications` | Own rows | Own rows | Own rows | Own rows |
| `application_answers` | Own rows | Own rows | Own rows | Own rows |
| `ai_usage_log` | Own rows | Own rows | ✗ Denied | ✗ Denied |

"Own rows" = `user_id = auth.uid()`.

UPDATE and DELETE are denied on `ai_usage_log` to prevent users from deleting their usage history to bypass the monthly AI request limit.

### Monthly AI usage count query

```sql
SELECT COUNT(*) FROM ai_usage_log
WHERE user_id = auth.uid()
AND created_at >= date_trunc('month', now());
```

No reset job is required — the count is always computed from the current calendar month.

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

| URL | Purpose |
|---|---|
| `/application/[id]` | Redirects to `/application/[id]/step/[current_step]` |
| `/application/[id]/step/1` | Application Details |
| `/application/[id]/step/2` | Upload Funder Guidelines |
| `/application/[id]/step/3` | AI Summary |
| `/application/[id]/step/4` | Draft Answers |
| `/application/[id]/step/5` | Review & Export |

**Step locking:** Users cannot jump ahead to a step whose prerequisites are not met. Accessing `/step/4` before Step 3 is complete redirects to the current step.

**Resume on return:** Navigating to `/application/[id]` reads `current_step` from the `applications` table and redirects to the correct step.

### Page inventory

| Route | Type | Data source |
|---|---|---|
| `/` | Public, static | None |
| `/sign-in` | Public, static | None |
| `/register` | Public, static | None |
| `/forgot-password` | Public, static | None |
| `/reset-password` | Public, static | None |
| `/dashboard` | Authenticated, SSR | `applications` table |
| `/profile` | Authenticated, SSR | `charity_profiles` table |
| `/application/[id]/step/1` | Authenticated, SSR | `applications` table |
| `/application/[id]/step/2` | Authenticated, SSR | `applications` table |
| `/application/[id]/step/3` | Authenticated, SSR | `applications.ai_summary` |
| `/application/[id]/step/4` | Authenticated, SSR | `applications`, `application_answers` |
| `/application/[id]/step/5` | Authenticated, SSR | `applications`, `application_answers` |
| `/account` | Authenticated, SSR | `user_profiles` |

---

## 8. Rendering Strategy

React Server Components are the default. `"use client"` is added only to components that require browser APIs, React hooks, or event handlers. (ADR-ARCH-002)

| Component | Type | Reason |
|---|---|---|
| Page shells (dashboard, profile, step pages) | Server Component | Fetches data server-side — no loading spinner on mount |
| Navigation bar | Client Component | Requires auth state and active route highlighting |
| Charity profile edit form | Client Component | Controlled inputs and form state |
| Answer text areas (Step 4) | Client Component | Auto-save requires `onChange` and debounce |
| AI loading state (Steps 3 & 4) | Client Component | Timer-driven progress bar animation |
| Session timeout modal | Client Component | Timer and user interaction |
| Delete confirmation modal | Client Component | User interaction |

**Loading states:** Next.js `loading.tsx` files provide Suspense-based page-level loading skeletons where server data fetch may be slow.

---

## 9. API Design — Server Actions and API Routes

### Server Actions

Server Actions handle all data mutations. Defined in `app/actions/` with the `"use server"` directive. Called directly from Client Components or Server Components. All inputs validated with Zod. (ADR-ARCH-003)

| Action file | Functions |
|---|---|
| `actions/profile.ts` | `saveCharityProfile(data)` |
| `actions/applications.ts` | `createApplication(data)`, `updateApplication(id, data)`, `deleteApplication(id)`, `updateApplicationStatus(id, status)` |
| `actions/answers.ts` | `saveAnswer(applicationId, questionId, answerText)` |

### API Routes

Explicit API routes handle long-running operations, file handling, export, and scheduled jobs. (ADR-ARCH-003)

| Route | Method | Purpose | Config |
|---|---|---|---|
| `/api/generate-summary` | POST | Step 3: AI summary generation | `maxDuration = 90` |
| `/api/generate-draft` | POST | Step 4: Draft answer generation | `maxDuration = 90` |
| `/api/upload/signed-url` | POST | Request Supabase Storage signed URL | Default timeout |
| `/api/upload/process` | POST | Extract text + call AI after upload | Default timeout |
| `/api/export/[id]` | GET | Generate and stream Word document | Default timeout |
| `/api/cron/cleanup-storage` | GET | Delete orphaned Storage objects | Default timeout |

### Zod validation pattern

Every Server Action and API Route validates its input:

```typescript
const schema = z.object({
  applicationId: z.string().uuid(),
  questionText: z.string().min(1).max(2000),
  wordLimit: z.number().int().positive().nullable(),
});

const result = schema.safeParse(input);
if (!result.success) {
  return { error: 'Invalid input' };
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

| File type | Library | Fallback behaviour |
|---|---|---|
| `.pdf` | `unpdf` | If text < 100 chars: "This PDF appears to be scanned — please paste the text instead." |
| `.docx` | `mammoth` | If extraction throws: user-friendly error message |
| Password-protected PDF | `unpdf` throws | "This PDF is password protected — please remove the password or paste the text instead." |

Post-extraction, text is truncated at 150,000 characters before being passed to the AI API (ADR-AI-007).

### Orphaned file protection

Two layers ensure no guidelines data lingers in Storage: (ADR-FILE-001)

- **Layer 1 — `try/finally`:** The process route always deletes the Storage object in the `finally` block, even if extraction or AI generation throws an error.
- **Layer 2 — Cron job:** `/api/cron/cleanup-storage` runs every 30 minutes and deletes any objects in `guidelines-temp` older than 1 hour. Handles infrastructure failures where `finally` did not run.

### Guidelines session storage

After successful text extraction, the guidelines text is stored in `sessionStorage` keyed by application ID. (ADR-FILE-004)

```typescript
// lib/guidelines-session.ts
const key = (applicationId: string) => `guidelines_text_${applicationId}`;

export const setGuidelines = (applicationId: string, text: string) =>
  sessionStorage.setItem(key(applicationId), text);

export const getGuidelines = (applicationId: string) =>
  sessionStorage.getItem(key(applicationId));

export const clearGuidelines = (applicationId: string) =>
  sessionStorage.removeItem(key(applicationId));
```

The `sessionStorage` entry is cleared when Step 3 completes successfully. If the user closes the tab, the browser clears `sessionStorage` automatically — no guidelines data persists across sessions.

---

## 11. AI Integration Pipeline

### Provider and model

- **Provider:** Anthropic Claude Sonnet 4.6 via Amazon Bedrock eu-west-2 (`AnthropicBedrock` client from `@anthropic-ai/sdk`, or `@aws-sdk/client-bedrock-runtime`) (ADR-AI-001)
- **Model:** `anthropic.claude-sonnet-4-6` (Bedrock In-Region model ID) (ADR-AI-002)
- **Response mode:** Batch (non-streaming) (ADR-AI-005)
- **Function timeout:** `maxDuration = 90` on both AI routes (ADR-AI-006)

### Prompt architecture

All prompts are defined in `lib/prompts.ts`. AI routes import from this file — they contain no prompt text inline. (ADR-AI-003)

```typescript
// lib/prompts.ts
export const MODEL = 'anthropic.claude-sonnet-4-6'; // Bedrock In-Region model ID

export const SUMMARY_SYSTEM_PROMPT = `You are an expert grant writer helping UK charities...`;

export const buildSummaryPrompt = (guidelinesText: string): string => `
<guidelines>
${guidelinesText}
</guidelines>

Summarise these funder guidelines under the following headings:
- Who can apply
- What they fund
- What they don't fund
- Key priorities
- Word limits and format requirements
- Deadline and submission notes
...`;

export const DRAFT_SYSTEM_PROMPT = `You are an expert grant writer...`;

export const buildDraftPrompt = (
  summary: string,
  charityProfile: CharityProfile,
  questions: Question[]
): string => `...`;
```

Prompts use XML-tagged structured inputs and explicit JSON output format for Step 4. (ADR-AI-004)

**Note:** Prompt wording is an initial implementation to be validated during testing. Changes to `lib/prompts.ts` are treated as first-class code changes and reviewed accordingly.

### Usage tracking and cost controls

Before every AI API call, the server checks the user's monthly usage count. (ADR-AI-008)

```typescript
const { count } = await supabase
  .from('ai_usage_log')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .gte('created_at', startOfMonth);

if (count >= 20) {
  return { error: 'USAGE_LIMIT_REACHED', resetDate: endOfMonth };
}
```

On successful AI response, a row is inserted into `ai_usage_log`. A failed request does not consume quota.

### Rate limiting

Per-user sliding window rate limiting via Upstash Redis (`@upstash/ratelimit`) is applied to both AI routes. (ADR-SEC-005)

| Route | Limit |
|---|---|
| `/api/generate-summary` | 5 requests per 60 seconds per user |
| `/api/generate-draft` | 5 requests per 60 seconds per user |

Rate limit exceeded → HTTP 429 with message: *"Too many requests. Please wait a moment before trying again."*

### Error handling

All Bedrock Claude API calls go through `lib/ai-error-handler.ts`. (ADR-AI-009)

**Retry behaviour:**
- Transient errors (429, 500, 529): retry up to 2 times with 1s then 3s delays
- Non-transient errors (400, auth): no retry — surface immediately
- Step 4 JSON parse failure: one automatic retry before surfacing as an error

**User-facing error messages:**

| Error | Message |
|---|---|
| Rate limit (after retries) | "Our AI service is a little busy right now. Please try again in a few minutes." |
| Server error (after retries) | "Something went wrong with our AI service. Please try again." |
| Bad request | "We couldn't process your request. Please check your inputs and try again." |
| Timeout | "AI generation is taking longer than expected. Please try again." |
| JSON parse failure (after retry) | "We had trouble formatting your draft answers. Please try again." |
| Usage limit | "You've used all 20 of your AI requests this month. Your allowance resets on [date]." |

### Loading state (Steps 3 and 4)

A teal progress bar with staged text messages is shown during AI generation. The bar is time-based — it does not reflect actual API progress. (DDR-CS-005, ADR-AI-005)

**Step 3 stages:**

| Bar | Message |
|---|---|
| 0% | "Reading your funder guidelines..." |
| 60% | "Almost there..." |
| 100% | Content appears |

**Step 4 stages:**

| Bar | Message |
|---|---|
| 0% | "Reviewing your guidelines and charity profile..." |
| 35% | "Writing your draft answers..." |
| 75% | "Almost there..." |
| 100% | Content appears |

If the API responds before the bar reaches 100%, it jumps to 100% immediately. If the API is slow, the bar holds at ~90% until the response arrives. On error, the bar stops and an inline error message with a "Try again" button replaces the progress indicator.

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

**Styling:** Inter font, teal headings consistent with the design system.

Document generation is fast (milliseconds). No `maxDuration` extension is needed.

---

## 13. Security

### HTTP security headers

Configured globally in `next.config.js`. (ADR-SEC-004)

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'` |

After first production deployment, validate at securityheaders.com and tighten the CSP iteratively. If third-party scripts are added, update `script-src`.

### Secrets management

Environment variables are stored in Vercel (scoped per environment) and in `.env.local` locally. (ADR-SEC-006)

| Variable | Browser accessible | Used in |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client and server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client and server |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | API routes only |
| `AWS_ACCESS_KEY_ID` | **No** | AI API routes only (Amazon Bedrock) |
| `AWS_SECRET_ACCESS_KEY` | **No** | AI API routes only (Amazon Bedrock) |
| `AWS_REGION` | **No** | AI API routes only — value: `eu-west-2` |
| `UPSTASH_REDIS_REST_URL` | **No** | AI API routes only |
| `UPSTASH_REDIS_REST_TOKEN` | **No** | AI API routes only |
| `CRON_SECRET` | **No** | Cron route auth |
| `SENTRY_DSN` | Yes (public DSN) | Client and server |

A `.env.example` file with placeholder values is committed to the repository. `.env.local` is in `.gitignore` and must never be committed.

### Defence-in-depth summary

| Layer | Protection |
|---|---|
| Middleware | Unauthenticated users cannot access any protected route |
| RLS policies | Database rejects cross-user queries even if application code has a bug |
| Server-side only secrets | `SUPABASE_SERVICE_ROLE_KEY` and AWS credentials never reach the browser |
| Zod validation | All inputs validated before processing |
| Rate limiting | Upstash prevents rapid-fire AI route abuse |
| Usage cap | 20 AI requests/user/month hard limit |
| Security headers | CSP, HSTS, X-Frame-Options protect against client-side attacks |

---

## 14. Operations and Deployment

### Deployment strategy

Vercel automatic Git deployment. (ADR-OPS-002)

- `main` branch → production deployment (automatic)
- Feature branches → Vercel preview deployments (automatic, unique URL per branch)
- Branch protection on `main`: Vercel build check must pass before merge

**Always verify the feature branch preview URL before merging to `main`.**

**Per-release deployment process:**
1. Apply pending migrations: `supabase db push --db-url [prod-url]`
2. Verify the feature branch preview deployment
3. Merge to `main`
4. Confirm the Vercel production deployment completes

GitHub Actions CI (lint + tests) will be added when a meaningful test suite exists.

### Email

Resend handles transactional email (verification, password reset) via Supabase Auth SMTP. (ADR-OPS-003)

Supabase Auth email templates are customised in the Supabase dashboard under Authentication → Email Templates. Templates must reference "Grant Pathway" and follow the warm, approachable tone in `design-requirements.md`.

### Scheduled jobs

Vercel Cron Jobs handle application-level scheduled tasks. (ADR-OPS-004)

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup-storage",
    "schedule": "*/30 * * * *"
  }]
}
```

The cleanup route requires an `Authorization: Bearer [CRON_SECRET]` header and rejects unauthorised calls with 401.

### Error tracking

Sentry (EU region) captures all unhandled errors on server and client. (ADR-OPS-005)

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
  scope.setTag('route', 'generate-summary');
  Sentry.captureException(error);
});
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
CRON_SECRET=
SENTRY_DSN=
```

### Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `supabase start` | Start local Supabase stack |
| `supabase stop` | Stop local Supabase stack |
| `supabase db reset` | Reset local database (applies all migrations + seed) |
| `supabase db diff --schema public` | Generate migration from dashboard changes |
| `supabase db push --db-url [url]` | Apply migrations to remote project |
| `supabase status` | Show local project URLs and keys |

---

## 16. Pre-Launch Checklist

The following one-time tasks must be completed before the first production deployment. Full details are in ADR-OPS-002.

- [ ] Activate Vercel Pro and confirm billing
- [ ] Add `export const maxDuration = 90` to `/api/generate-summary/route.ts` and `/api/generate-draft/route.ts`
- [ ] Create Resend account, verify sending domain (SPF + DKIM DNS records)
- [ ] Configure Supabase Auth SMTP with Resend credentials
- [ ] Customise Supabase Auth email templates (verification + password reset) — must reference "Grant Pathway", follow tone and voice guide, use teal CTA buttons
- [ ] Configure Amazon Bedrock Claude Sonnet 4.6 model access in AWS eu-west-2 console; set monthly spend cap as a secondary safety net
- [ ] Create Sentry project in EU region, configure PII scrubbing and AI route tagging, set up email alerts for new error types
- [ ] Add `SENTRY_DSN` to Vercel production environment variables
- [ ] Set all production environment variables in Vercel Production scope
- [ ] Add `CRON_SECRET` environment variable to Vercel and confirm cron job appears active in Vercel dashboard
- [ ] Validate HTTP security headers at securityheaders.com
- [ ] Apply initial database migrations to the production Supabase project
- [ ] Run a full manual test of the five-step flow on the production deployment
- [ ] Run Lighthouse accessibility audit on key pages (target 95+)

---

*Technical Design Document — Grant Pathway v1*
*All 42 architectural decisions recorded in `business/Technical Decision and Design/ADR-*.md`*
