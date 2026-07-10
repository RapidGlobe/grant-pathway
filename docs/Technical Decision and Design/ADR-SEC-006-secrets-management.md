---
id: ADR-SEC-006
category: Security
status: Decided
---

# ADR-SEC-006 — Secrets Management

## Context

Grant Pathway requires secure storage of sensitive environment variables: Supabase URL, Supabase anon key, Supabase service role key, and AWS credentials for Amazon Bedrock. These must not be committed to the Git repository and must be accessible to the application at runtime. The service role key and AWS credentials must never be exposed to the browser.

## Options Considered

- **Option A — Vercel Environment Variables + `.env.local` for development:** Environment variables are defined in the Vercel dashboard per environment (production, preview, development). For local development, a `.env.local` file (excluded from Git via `.gitignore`) is used.
- **Option B — AWS Secrets Manager or similar vault:** Enterprise secret management. Over-engineered for the current product scale and single-developer team.
- **Option C — Doppler or similar secrets platform:** Third-party secrets sync service. Adds another service dependency. Not justified for v1.

## Decision

**Option A — Vercel Environment Variables for deployment; `.env.local` for local development.**

Secrets are stored in Vercel's environment variable store, scoped per environment (production and preview). Locally, a `.env.local` file holds the development credentials. `.env.local` is listed in `.gitignore` and must never be committed.

**Variable classification:**

| Variable                        | Exposed to browser | Used in                                 |
| ------------------------------- | ------------------ | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes (public)       | Client and server                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (public)       | Client and server                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | No (server only)   | API routes, server actions              |
| `AWS_ACCESS_KEY_ID`             | No (server only)   | AI API routes only (Amazon Bedrock)     |
| `AWS_SECRET_ACCESS_KEY`         | No (server only)   | AI API routes only (Amazon Bedrock)     |
| `AWS_REGION`                    | No (server only)   | AI API routes only — value: `eu-west-2` |

## Rationale

- Vercel Environment Variables are the standard pattern for Next.js on Vercel. No additional tooling required.
- `NEXT_PUBLIC_` prefix variables are intentionally exposed to the browser — the anon key is safe to expose as RLS prevents data access (the service role key must never be prefixed with `NEXT_PUBLIC_`).
- `.env.local` provides a simple local development pattern that all Next.js developers are familiar with.

## Consequences

- `SUPABASE_SERVICE_ROLE_KEY`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` must only be accessed in server-side code (API routes, server actions, middleware). A lint rule or code review check should confirm this.
- A `.env.example` file (with placeholder values, no real secrets) should be committed to the repository to document required variables.
- Team onboarding requires sharing the `.env.local` values securely (e.g., via a password manager) — never via chat or email.

## Source

technology-stack.md (TS-04 — Hosting Platform), NFR-04 (Security).

## Date Decided

2026-04-17
