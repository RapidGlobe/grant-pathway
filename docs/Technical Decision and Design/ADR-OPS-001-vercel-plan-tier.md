---
id: ADR-OPS-001
category: Operations
status: Decided
---

# ADR-OPS-001 — Vercel Plan Tier

## Context

⚠️ **BLOCKER** — This decision must be made before production deployment.

Vercel hosts Grant Pathway (ADR-STACK-004). The Hobby (free) plan has the following constraints that conflict with product requirements:

| Constraint                  | Hobby limit | Requirement                        |
| --------------------------- | ----------- | ---------------------------------- |
| Serverless function timeout | 10 seconds  | 60 seconds (AI generation, NFR-01) |
| Request body size           | 4.5MB       | 10MB file upload (FR-07, FR-08)    |

**Note on the file upload constraint:** Even on Vercel Pro, the request body size limit is 4.5MB for serverless functions. The recommended solution is direct client-to-Supabase Storage upload (ADR-FILE-001), which bypasses Vercel entirely. This constraint is resolved by architecture, not by plan upgrade.

**Note on the function timeout constraint:** Vercel Pro allows `maxDuration` up to 300 seconds per function. Setting `maxDuration = 90` on AI routes resolves the timeout blocker (ADR-AI-006).

## Options Considered

### Option A — Vercel Hobby (free)

- AI generation routes time out after 10 seconds. Product is non-functional for core use case.
- Not viable.

### Option B — Vercel Pro (~$20/month, ~£16/month)

- `maxDuration = 90` resolves the AI route timeout.
- Direct-to-Supabase file upload (ADR-FILE-001) resolves the file size constraint independently.
- Additional benefits: higher build minutes, better analytics, team collaboration features.
- Cost is within the C1 budget constraint of £100/month.

### Option C — Alternative hosting (Railway, Render, AWS)

- Would resolve timeout constraints with longer function durations.
- Abandons Vercel rationale (ADR-STACK-004): first-class Next.js support, preview deployments, CDN.
- Significantly increases operational complexity for a solo developer.
- Not recommended.

## Decision

**Option B — Vercel Pro (~$20/month, approximately £16/month).**

Vercel Pro is the required hosting plan for production. The upgrade will be activated when testing begins. It is within the C1 operating budget (£100/month), leaving approximately £84/month headroom for Supabase, Anthropic API usage, and other services.

**Immediate actions on upgrade:**

- Set `export const maxDuration = 90` in `/api/generate-summary/route.ts`
- Set `export const maxDuration = 90` in `/api/generate-draft/route.ts`
- These two lines must be added at the same time as the upgrade — the upgrade without the config change does not resolve the timeout blocker

All other routes continue to use the default 10-second timeout.

## Consequences

- Vercel Pro subscription must be activated before production deployment.
- AI route files must include `export const maxDuration = 90`.
- Monthly operating cost: ~£16 (Vercel Pro) + Supabase (free tier initially) + Anthropic API usage.
- Budget headroom: ~£84/month remaining against the £100/month C1 constraint.

## Source

ADR-STACK-004, ADR-AI-006, ADR-FILE-001, NFR-01, C1 (Operating cost budget).

## Date Decided

2026-04-21
