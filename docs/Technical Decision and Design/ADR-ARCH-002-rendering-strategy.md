---
id: ADR-ARCH-002
category: Architecture
status: Decided
---

# ADR-ARCH-002 — Rendering Strategy

## Context

Grant Pathway has a mix of public pages (landing, sign in, registration) and authenticated application pages (dashboard, application flow, profile). The rendering strategy determines how pages are built and served — affecting initial load performance, SEO, and how data is fetched.

This decision is closely linked to ADR-ARCH-001 (Router Strategy). If App Router is chosen, Server Components introduce a third option beyond SSR and CSR.

## Options Considered

### Option A — Server-Side Rendering (SSR) for authenticated pages, Static for public pages
- **What it is:** Public pages (`/`, `/sign-in`, `/register`) are statically generated at build time. Authenticated pages (`/dashboard`, `/application/*`) are rendered on-demand on the server.
- **Strengths:** Fast initial load for authenticated pages (no client-side data waterfall). Reduces client bundle. Server-rendered pages can fetch data securely without exposing API keys.
- **Weaknesses:** Authenticated pages incur a server round-trip on every navigation (can be mitigated with caching).

### Option B — Client-Side Rendering (CSR) for all authenticated pages
- **What it is:** All authenticated pages are rendered in the browser. Data is fetched via client-side API calls after mount.
- **Strengths:** Simple to implement. Familiar React SPA pattern. No server rendering complexity.
- **Weaknesses:** Loading state on every page mount. Client bundle includes all data-fetching logic. Not optimal for a form-heavy application where data is known at request time.

### Option C — React Server Components (RSC) — App Router only
- **What it is:** Authenticated page shells and data-fetching components run on the server. Interactive form components are Client Components.
- **Strengths:** Best performance. Data is fetched server-side with no client waterfall. Client bundle only includes interactive components.
- **Weaknesses:** Requires App Router (ADR-ARCH-001 Option A). Requires understanding of Server/Client component boundaries.

### Option D — Hybrid: SSR for dashboard and profile, CSR for multi-step application flow
- **What it is:** High-value pages with stable data (dashboard, profile) use SSR. The multi-step application flow, which has frequent state changes across steps, uses CSR.
- **Strengths:** Pragmatic — optimises where it matters most. Simplifies the interactive flow.
- **Weaknesses:** Inconsistency in the codebase. Two patterns to maintain.

## Decision

**Option A — React Server Components as the default rendering strategy.**

Server Components are the default for all pages. `"use client"` is added only to components that require browser APIs, React hooks, or event handlers. Data fetching is co-located in Server Components using `async`/`await` with the Supabase server client (`createServerClient` from `@supabase/ssr`).

**Applied per page area:**

| Page area | Rendering | Rationale |
|---|---|---|
| Dashboard | Server Component | Fetches applications list server-side; no loading spinner on visit |
| Charity Profile shell | Server Component | Loads saved profile data server-side |
| Charity Profile edit form | Client Component | Requires controlled inputs and form state |
| Application flow page shell | Server Component | Loads existing application and answers server-side |
| Answer text areas (Step 4) | Client Component | Auto-save requires `onChange` and debounce logic |
| AI loading state (Steps 3 & 4) | Client Component | Requires timer-driven progress bar animation |
| Navigation bar | Client Component | Requires auth state and active route highlighting |

Next.js `loading.tsx` files provide Suspense-based loading states at the page level where needed.

## Consequences

- Affects how Supabase data is fetched in each page (server-side client vs client-side hooks).
- Affects the loading state implementation — SSR/RSC reduces loading spinners; CSR requires them on every mount.
- Must be consistent with the middleware pattern in ADR-SEC-001.

## Source

ADR-ARCH-001, NFR-02 (Page load target), design-requirements.md (loading states).

## Date Decided

2026-04-21
