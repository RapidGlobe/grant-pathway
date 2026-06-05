---
id: ADR-ARCH-003
category: Architecture
status: Decided
---

# ADR-ARCH-003 — API Pattern

## Context

Grant Pathway needs server-side logic for AI calls, data mutations, and file handling. This server-side code must not expose the Anthropic API key or Supabase service-role key to the browser. The API pattern determines how the Next.js frontend communicates with these backend operations.

## Options Considered

### Option A — Next.js API Routes (`pages/api/` or `app/api/`)

- **What it is:** Serverless functions defined in the Next.js project. Each file is a separate API endpoint. Client components call these routes via `fetch`.
- **Strengths:** Familiar REST-like pattern. Works with both Pages Router and App Router. Easy to reason about. All secrets stay server-side.
- **Weaknesses:** Manual route definition. No type-sharing between client and server without extra tooling (tRPC, Zod).

### Option B — Next.js Server Actions (App Router only)

- **What it is:** Functions defined with `"use server"` that can be called directly from Client Components or Server Components as if they were local functions. The Next.js framework handles the HTTP transport.
- **Strengths:** Eliminates the need for separate API route files for form mutations. Type-safe by default — no serialisation layer. Simpler developer experience for form submissions.
- **Weaknesses:** App Router only (requires ADR-ARCH-001 Option A). Less familiar. Cannot be called from outside the Next.js app (e.g., mobile app later). File upload handling via server actions has size limitations.
- **Not suitable for:** AI generation routes (require streaming or long timeout configuration — better as explicit API routes).

### Option C — tRPC

- **What it is:** End-to-end type-safe API layer. Client calls server procedures with full TypeScript type inference.
- **Strengths:** Best-in-class type safety. Auto-complete on API calls. Input validation with Zod.
- **Weaknesses:** Adds tRPC as an architectural layer. Requires learning tRPC patterns. Over-engineered for a v1 single-developer product.

### Option D — Supabase client direct from browser (no custom API layer)

- **What it is:** Use the Supabase JavaScript client directly in Client Components for all data operations. AI calls would still need API routes.
- **Strengths:** Minimal code for CRUD operations. RLS handles security.
- **Weaknesses:** Service-role key cannot be used client-side. Complex queries and AI calls still need server-side routes. Mixed pattern.

## Decision

**Option B — Server Actions for data mutations; explicit API Routes for long-running and streaming operations.**

**Server Actions** (`"use server"`, defined in `app/actions/`) handle all form mutations:

- Save / update charity profile
- Create, rename, and delete applications
- Save individual application answers
- Update application status (re-open, mark complete)

**API Routes** (`app/api/`) handle operations requiring explicit configuration or file streaming:

| Route                         | Purpose                                      | Config             |
| ----------------------------- | -------------------------------------------- | ------------------ |
| `POST /api/generate-summary`  | Step 3 AI summary generation                 | `maxDuration = 90` |
| `POST /api/generate-draft`    | Step 4 draft answer generation               | `maxDuration = 90` |
| `POST /api/upload/signed-url` | Request a Supabase Storage signed upload URL | Default timeout    |
| `POST /api/upload/process`    | Trigger text extraction after upload         | Default timeout    |
| `GET /api/export/[id]`        | Generate and stream Word document download   | Default timeout    |

Zod is used for input validation on all Server Actions and API Routes. The Supabase server client is used inside Server Actions; the browser client is used inside Client Components for read operations only.

## Consequences

- AI generation routes (`/api/generate-summary`, `/api/generate-draft`) must be explicit API Routes so `maxDuration` can be configured.
- Form submissions (charity profile, application answers) may use Server Actions if App Router is chosen.
- Zod is recommended for input validation on all API Routes and Server Actions regardless of the choice.

## Source

ADR-ARCH-001, ADR-ARCH-002, ADR-AI-006, ADR-FILE-001.

## Date Decided

2026-04-21
