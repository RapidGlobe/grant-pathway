---
id: ADR-STACK-001
category: Stack
status: Decided
---

# ADR-STACK-001 — Framework and Language

## Context

Grant Pathway is a new web application requiring a modern, productive framework for a single developer. The application involves server-side AI API calls, authenticated routes, form-heavy UIs, and a need for rapid iteration in the early product phase. Type safety will reduce bugs at the single-developer scale where there is no QA team.

## Options Considered

- **Option A — Next.js + TypeScript:** Full-stack React framework with server-side capabilities, large ecosystem, Vercel deployment, excellent TypeScript support.
- **Option B — Remix + TypeScript:** Strong form handling, web standards-based, smaller ecosystem, less mainstream.
- **Option C — SvelteKit + TypeScript:** Lighter runtime, strong DX, smaller ecosystem, fewer AI/SaaS integrations.

## Decision

**Option A — Next.js with TypeScript.**

Next.js with TypeScript is the application framework. TypeScript is used throughout — frontend components, API route handlers, utility functions, and data layer.

## Rationale

- Next.js supports server-side rendering, API routes, and client components in a single framework, reducing architectural complexity for a solo developer.
- TypeScript eliminates a class of runtime errors at no deployment cost.
- Vercel (ADR-STACK-004) is the natural deployment target for Next.js with zero configuration.
- The React ecosystem provides access to shadcn/ui (ADR-STACK-006) and the Supabase JavaScript client.
- Established industry choice for SaaS products of this type.

## Consequences

- The team must follow Next.js conventions (App Router vs Pages Router, resolved in ADR-ARCH-001).
- TypeScript compilation must pass before deployment; strict mode is recommended.
- Bundle size and client-side performance must be monitored as the application grows.

## Source

BRD Section 7 (Technology Stack), Product Decision PDR-STACK-001.

## Date Decided

2026-04-17
