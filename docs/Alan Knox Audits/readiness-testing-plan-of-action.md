# Plan of Action — Readiness Testing

**Source article:** [Readiness Testing: Engineering for Vibe Coders — Alan Knox](https://alanknox.com/readiness-testing-engineering-for-vibe-coders/)
**Reviewed:** 8 June 2026
**Related documents:** `docs/non-functional-requirements.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (GAP-27), `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md`, `docs/Test Plans/TEST-DASHBOARD.md`

---

## Why this mattered for Grant Pathway

Knox's article asks one question: is your system ready for real-world conditions — not just ideal ones? Grant Pathway already has strong readiness foundations: a 116-item E2E test plan, 7 funders fully tested, a health check endpoint, UptimeRobot monitoring, and a comprehensive deployment checklist. The audit confirmed these are well-aligned with Knox's framework.

Two gaps were identified: the health check only covers Supabase connectivity (Bedrock failures go undetected until a user hits an AI route), and there was no documented capacity plan for concurrent user load before the first marketing push. Both are addressed here.

---

## Assessment against Knox's recommendations

### "Test critical user flows end to end"

**Status: Exemplary — no action required**

- 116-item E2E test plan (`docs/test-plan-e2e-slices-4-8.md`) covering Slices 0–8
- 7 funders fully tested, results tracked in `docs/Test Plans/TEST-DASHBOARD.md`
- Funder test plans include negative cases, edge cases, and non-functional checks (latency, accessibility)
- DEPLOYMENT-CHECKLIST.md requires funder test plan re-runs if AI logic changes

### "Validate integrations and external dependencies"

**Status: Partially covered — health check extended**

The `/api/health` endpoint confirms Supabase connectivity. Bedrock and Resend are not pre-verified — a Bedrock outage surfaces only when a user triggers an AI route. This is a known, accepted limitation noted in ADR-OPS-007. It reinforces GAP-27 (observability): structured latency logging across all three AI routes (added 2026-06-08) ensures Bedrock failures now produce timed, labelled log entries in Vercel and Sentry rather than appearing only as generic errors.

### "Simulate real load — know your capacity"

**Status: One gap identified and resolved**

NFR-03 documented expected concurrent users (~10 at launch, ~100 at scale) but contained no statement of expected behaviour under those load levels. This was the missing capacity plan Knox's article highlights. A concurrent AI generation behaviour section has been added to NFR-03 documenting:

- Per-user rate limiting (no cross-user interference)
- Expected Bedrock behaviour at each tier
- The role of `withRetry()` under throttling conditions
- Identification of unmeasured AI route latency under concurrent load as the key pre-marketing-push risk

### "Add logging and metrics — observability is part of readiness"

**Status: One gap identified and partially resolved (GAP-27)**

Structured latency logging added to all three AI routes (2026-06-08):

- `const bedrockStart = Date.now()` before each `withRetry()` call
- Success path: `[route] Bedrock latency: Xms, Y tokens`
- Failure path: error log now includes duration — `[route] Bedrock error after retries (Xms):`

This provides per-call timing visible in Vercel function logs and (once GAP-21 Sentry route tagging is complete) in Sentry. Sentry performance monitoring configuration is deferred to P5.4 once a production traffic baseline is established.

### "Test failure scenarios"

**Status: Well covered — no action required**

- Persistent failure states with clear UX (Step 3)
- Manual entry fallback paths (Steps 3–4)
- Graceful degradation throughout (covered by Knox "Graceful Degradation" audit, 2026-06-08)
- DEPLOYMENT-CHECKLIST.md risk assessment step requires identifying the most likely failure mode before every deploy

---

## Outstanding actions

| Action                                                                               | Owner       | Target                  |
| ------------------------------------------------------------------------------------ | ----------- | ----------------------- |
| Configure Sentry performance monitoring once production traffic baseline established | Development | P5.4 (GAP-27 remaining) |

Latency logging and capacity plan are complete. All other readiness testing gaps are covered by existing documentation and test plans.
