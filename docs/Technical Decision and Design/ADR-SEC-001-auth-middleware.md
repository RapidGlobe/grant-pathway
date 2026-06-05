---
id: ADR-SEC-001
category: Security
status: Decided
---

# ADR-SEC-001 — Authentication Middleware

## Context

Grant Pathway has a clear split between public routes (`/`, `/sign-in`, `/register`, `/forgot-password`) and protected routes (`/dashboard`, `/profile`, `/application/*`). Unauthenticated users attempting to access protected routes must be redirected to `/sign-in`. Authenticated users visiting `/sign-in` or `/register` should be redirected to `/dashboard`.

The middleware implementation depends on the router strategy (ADR-ARCH-001) and uses Supabase Auth (ADR-STACK-003).

## Options Considered

### Option A — Next.js Middleware with `@supabase/ssr`

- **What it is:** A `middleware.ts` file at the project root intercepts all requests. The `@supabase/ssr` package provides server-side session reading via cookies. Middleware checks session validity and redirects accordingly.
- **Strengths:** Runs at the edge before the page renders — no flash of unauthenticated content. Handles both App Router and Pages Router. The recommended Supabase Next.js pattern.
- **Weaknesses:** Middleware runs on every matched route; must be configured carefully to exclude public routes and static assets.

### Option B — Per-page authentication check (server-side in each page)

- **What it is:** Each protected page individually checks for a valid session (e.g., in `getServerSideProps` or as a Server Component). Redirects if no session found.
- **Strengths:** Explicit — each page controls its own auth check.
- **Weaknesses:** Repetitive boilerplate in every protected page. Risk of accidentally missing auth check on a new page. Slower — page begins rendering before the redirect.

### Option C — Client-side auth guard (React context/hook)

- **What it is:** A React context provides the auth state. A higher-order component or hook in each page redirects unauthenticated users.
- **Strengths:** Simple to implement in CSR apps.
- **Weaknesses:** Flash of unauthenticated content before redirect. Not suitable for SSR pages. Not recommended with Supabase SSR.

## Decision

**Option A — Next.js `middleware.ts` with `@supabase/ssr`.**

A single `middleware.ts` file at the project root handles all route protection. It uses `createServerClient` from `@supabase/ssr` to read and refresh the Supabase session from request cookies on every matched request.

**Middleware responsibilities:**

1. Read the Supabase session from cookies
2. Refresh the session token if close to expiry (keeps active users logged in)
3. Redirect unauthenticated requests to protected routes → `/sign-in`
4. Redirect authenticated requests to `/sign-in` or `/register` → `/dashboard`

**Protected routes:**

- `/dashboard`, `/profile`, `/application/:path*`, `/account/:path*`

**Public routes (excluded from protection):**

- `/`, `/sign-in`, `/register`, `/forgot-password`, `/reset-password`

**Matcher configuration excludes:**

- `/_next/static/:path*`, `/_next/image/:path*`, `/favicon.ico`, and other static assets

## Consequences

- A `middleware.ts` file must be created and maintained.
- Public routes must be explicitly excluded from the middleware matcher.
- The Supabase client in middleware uses `createMiddlewareClient` from `@supabase/ssr`.
- Session refresh logic should be included in middleware to extend sessions before they expire.

## Source

ADR-STACK-003 (Supabase Auth), ADR-ARCH-001, FR-01 to FR-05.

## Date Decided

2026-04-21
