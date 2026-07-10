---
id: ADR-STACK-003
category: Stack
status: Decided
---

# ADR-STACK-003 — Authentication Provider

## Context

Grant Pathway requires user authentication with email/password, email verification, password reset, and secure session management. The authentication system must integrate tightly with the database layer so that Row Level Security policies can reference the authenticated user's ID.

## Options Considered

- **Option A — Supabase Auth:** Built into the Supabase stack. JWTs are automatically threaded into RLS policies via `auth.uid()`. No additional service required.
- **Option B — NextAuth.js (Auth.js):** Flexible Next.js-native auth library. Requires additional configuration to integrate with Supabase RLS.
- **Option C — Clerk:** Managed auth service with polished pre-built UI. Additional monthly cost. Requires bridging to Supabase RLS.
- **Option D — Auth0:** Enterprise-grade managed auth. Over-engineered for v1 scope. Additional cost and complexity.

## Decision

**Option A — Supabase Auth.**

Supabase Auth handles all authentication: registration, login, email verification, and password reset. Session tokens are passed to Supabase queries so that RLS policies resolve correctly.

## Rationale

- Supabase Auth is already included in the Supabase subscription (ADR-STACK-002) at no additional cost.
- `auth.uid()` in RLS policies directly references the Supabase Auth user ID, making multi-tenant isolation straightforward.
- The `@supabase/ssr` package provides server-side session handling for Next.js middleware and server components.
- Email verification and password reset are provided out of the box.
- Reduces the number of external services to manage.

## Consequences

- Email templates for verification and password reset are configured in the Supabase dashboard.
- Session handling in Next.js requires `@supabase/ssr` middleware (ADR-SEC-001).
- Social login (Google, etc.) is not in scope for v1 but is available in Supabase Auth if needed later.

## Source

technology-stack.md (TS-03 — Authentication Provider), FR-01 to FR-05 (Registration and Login).

## Date Decided

2026-04-17
