---
id: ADR-AI-006
category: AI Integration
status: Decided
---

# ADR-AI-006 — Function Execution Timeout

## Context

⚠️ **BLOCKER** — This decision must be made before production deployment.

Vercel serverless functions have a default maximum execution time of **10 seconds** on the Hobby plan. Grant Pathway's AI generation targets are:
- Step 3 (AI Summary): up to **30 seconds** (NFR-01)
- Step 4 (Draft Answers): up to **60 seconds** (NFR-01)

Both AI generation routes will exceed the Hobby plan's 10-second timeout. Without resolving this, the AI routes will return a 504 Gateway Timeout error in production.

This is closely linked to ADR-OPS-001 (Vercel Plan Tier).

## Options Considered

### Option A — Vercel Pro plan with `maxDuration = 90`
- **What it is:** The Vercel Pro plan allows function timeouts up to 300 seconds. Adding `export const maxDuration = 90` to the AI API route files sets the timeout to 90 seconds for those routes.
- **Strengths:** Simple — one export statement per AI route resolves the blocker. 90 seconds comfortably covers the 60-second target with headroom. All other routes remain on the default 10-second timeout. This is the Vercel-intended solution.
- **Weaknesses:** Requires Vercel Pro (~$20/month). This cost is already anticipated in ADR-OPS-001 and is within the £100/month budget (C1).

### Option B — Supabase Edge Functions for AI generation
- **What it is:** Move AI generation out of Next.js API routes into Supabase Edge Functions, which have a 150-second timeout. The Next.js app calls the Supabase Edge Function.
- **Strengths:** Resolves timeout without Vercel Pro. Supabase Edge Functions are already in the stack.
- **Weaknesses:** Adds architectural complexity — two serverless function environments. Edge Functions have their own deployment and debugging workflow. The Anthropic API key must be stored in Supabase secrets separately.

### Option C — Background job with polling
- **What it is:** The client submits an AI generation request, which is queued. A background worker processes it and stores the result. The client polls for the result.
- **Strengths:** Decouples generation time from HTTP timeout. Scales well for high concurrency (future).
- **Weaknesses:** Significantly more complex architecture. Requires a job queue (e.g., Supabase pg_cron, BullMQ with Redis). Not appropriate for a v1 product. Latency is worse (polling interval adds delay).

### Option D — Reduce AI response time (prompt optimisation)
- **What it is:** Optimise prompts to reduce generation time to under 10 seconds.
- **Weaknesses:** 10 seconds is insufficient for generating multiple draft answers to complex questions. Quality would likely suffer from overly constrained prompts. Not reliable.

## Decision

**Option A — `export const maxDuration = 90` on both AI route files, applied at the same time as the Vercel Pro upgrade.**

```typescript
// app/api/generate-summary/route.ts
export const maxDuration = 90; // seconds — requires Vercel Pro

// app/api/generate-draft/route.ts
export const maxDuration = 90; // seconds — requires Vercel Pro
```

90 seconds provides the 60-second generation target plus 30 seconds of headroom for retry attempts (ADR-AI-009) and network overhead. All other routes use the default 10-second timeout. If generation approaches 90 seconds in practice, Vercel Pro supports up to 300 seconds and the value can be increased without architectural changes.

## Consequences

- Vercel Pro plan is required (ADR-OPS-001).
- Only AI generation routes need `maxDuration = 90`. All other routes use the default.
- The 90-second timeout provides headroom: 60 seconds for generation + 30 seconds for network and processing overhead.
- Monitoring should alert if AI routes approach 90 seconds — this would indicate a prompt or model issue.

## Source

NFR-01, ADR-OPS-001, PDR-AI-003.

## Date Decided

2026-04-21
