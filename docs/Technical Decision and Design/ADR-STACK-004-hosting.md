---
id: ADR-STACK-004
category: Stack
status: Decided
---

# ADR-STACK-004 — Hosting

## Context

Grant Pathway is a Next.js application that requires a hosting platform with zero-configuration deployment, preview environments for testing, and the ability to configure extended function timeouts for AI generation routes (up to 90 seconds). The platform must be cost-effective for a single-developer, bootstrapped product.

## Options Considered

- **Option A — Vercel:** Native Next.js deployment platform. Zero configuration, automatic preview deployments, edge functions, CDN. Hobby tier is free; Pro tier ~$20/month adds extended function timeouts.
- **Option B — Railway:** Container-based deployment, more flexibility, less Next.js optimisation, no built-in preview environments.
- **Option C — AWS (Amplify or EC2):** Maximum flexibility, significantly higher operational overhead, not appropriate for single-developer at this stage.
- **Option D — Render:** PaaS with good Next.js support, no native Next.js optimisations, less ecosystem integration.

## Decision

**Option A — Vercel.**

Vercel is the hosting platform. The Pro plan is required to configure `maxDuration = 90` on AI generation routes (see ADR-OPS-001 and ADR-AI-006).

## Rationale

- Vercel is built by the creators of Next.js and provides first-class support with no deployment configuration required.
- Automatic preview deployments for every pull request support the development workflow.
- Vercel's CDN and Edge Network provide optimal performance for a UK-based user base.
- The Pro plan resolves the Vercel function timeout blocker (60-second AI generation vs 10-second Hobby limit).
- Monthly cost of ~$20 is within the C1 budget constraint of £100/month operating cost.

## Consequences

- Vercel Pro plan is a required operating cost (ADR-OPS-001 must confirm this).
- The 4.5MB request body limit on Vercel means file uploads must bypass Vercel entirely (ADR-FILE-001 BLOCKER).
- AI generation routes must explicitly set `export const maxDuration = 90` in the route file.
- Environment variables are managed in the Vercel dashboard (ADR-SEC-006).

## Source

technology-stack.md (TS-04 — Hosting Platform), NFR-01 (AI response time targets), C1 (Operating cost budget).

## Date Decided

2026-04-17
