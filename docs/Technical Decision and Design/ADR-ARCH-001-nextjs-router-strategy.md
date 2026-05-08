---
id: ADR-ARCH-001
category: Architecture
status: Decided
---

# ADR-ARCH-001 — Next.js Router Strategy

## Context

Next.js offers two routing systems: the App Router (introduced in Next.js 13, stable in 14+) and the Pages Router (legacy, maintained but not receiving new features). The choice affects how server components, data fetching, layout nesting, and middleware are structured throughout the application.

Grant Pathway has authenticated routes, multi-step flows, server-side AI API calls, and shared layout components (navigation, charity profile banner). The router strategy must be chosen before any pages are built.

## Options Considered

### Option A — App Router
- **What it is:** Next.js 13+ default. Uses the `app/` directory. Supports React Server Components (RSC), nested layouts, server actions, and streaming.
- **Strengths:** Server Components reduce client bundle size. Nested layouts handle the authenticated shell (nav + content) cleanly. Active development and all new Next.js features target App Router. Better performance defaults.
- **Weaknesses:** Steeper learning curve. RSC mental model requires understanding what runs on server vs client. Some third-party libraries are not yet fully RSC-compatible. More complex debugging.
- **Migration risk:** This is the strategic direction for Next.js. Building on Pages Router means a future rewrite.

### Option B — Pages Router
- **What it is:** Legacy `pages/` directory routing. All components are client-side React by default. Data fetching via `getServerSideProps` / `getStaticProps`.
- **Strengths:** Well-documented, stable, familiar to most React developers. Simpler mental model for server/client boundary.
- **Weaknesses:** No Server Components or nested layouts. Officially in maintenance mode — no new features. Requires `_app.tsx` patterns for shared layouts. Less performant by default.
- **Migration risk:** Will require migration to App Router at some point; delaying creates technical debt.

### Option C — App Router with heavy Client Components
- **What it is:** App Router used structurally (for routing and layouts), but most components marked `"use client"`, effectively behaving like Pages Router.
- **Strengths:** Gets App Router structure without needing to learn the full RSC pattern immediately.
- **Weaknesses:** Loses most of the performance and architectural benefits of the App Router. Half-measure that creates inconsistency.

## Decision

**Option A — App Router (`app/` directory).**

The application uses the Next.js App Router exclusively. The `app/` directory structure is used for all routes. React Server Components are used by default; `"use client"` is added to any component that requires browser APIs, React hooks, or user interaction event handlers.

A single authenticated layout (`app/(authenticated)/layout.tsx`) wraps all protected pages, providing the navigation bar and charity profile completeness banner without repetition. Public pages (`/`, `/sign-in`, `/register`, `/forgot-password`) sit outside this layout.

## Consequences

- The decision determines the directory structure of the entire application (`app/` vs `pages/`).
- Affects how middleware (ADR-SEC-001), data fetching, and layout nesting are implemented.
- Affects whether server actions or API routes are used for form mutations.

## Source

ADR-STACK-001 (Next.js + TypeScript).

## Date Decided

2026-04-21
