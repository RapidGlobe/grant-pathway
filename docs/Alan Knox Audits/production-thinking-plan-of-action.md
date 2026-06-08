# Plan of Action — Production Thinking

**Source article:** [Production Thinking: Engineering for Vibe Coders — Alan Knox](https://alanknox.com/production-thinking-engineering-for-vibe-coders/)
**Reviewed:** 8 June 2026
**Completed:** 8 June 2026
**Related documents:** `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md`, `docs/Technical Decision and Design/ADR-OPS-007-uptime-monitoring.md`, `docs/Technical Decision and Design/ADR-DATA-005-backup-strategy.md`

---

## Why this mattered for Grant Pathway

Knox defines production thinking as anticipating failure, designing for reliability, and keeping a system maintainable as it grows. Grant Pathway is approaching its first public launch with real charity users and real grant application data. The review assessed Grant Pathway against Knox's six pillars and found the project in good shape overall, with one meaningful gap: safe deployment practices had no formal documentation. That gap is addressed directly by the new deployment checklist.

---

## Assessment against Knox's six pillars

### Pillar 1 — Anticipate scale and real-world usage

**Status: Mostly covered**

- Per-user AI cap of 50 requests per calendar month enforced at API route level in both `generate-summary` and `refine-answer`
- Upstash Redis burst rate limit (5 AI requests per 60 seconds per user) protects against rapid consecutive calls
- AWS Bedrock monthly spend cap ($127/month, ~£100) with early warning alert at $89 (~£70) — ADR-AI-008
- Vercel Pro plan provides function concurrency and removes the Hobby-tier timeout cap

**Gap noted:** No documented capacity plan for concurrent user load. Not a blocker at v1 launch scale, but should be revisited before any marketing push that could drive a significant spike in sign-ups.

### Pillar 2 — Reliability through design

**Status: Well covered — no action required**

- `withRetry<T>()` in `lib/ai-error-handler.ts` wraps all Bedrock calls with 2 retries (1s then 3s delays) for `rate_limited`, `overloaded`, `server_error`, and `timeout` errors
- Asymptotic progress bar on Step 3 prevents users perceiving a hang during AI calls
- Persistent failure state shown after a failed retry — users are never left in a silent broken state
- `maxDuration = 90` on AI routes (Vercel Pro required) prevents premature timeouts on large documents
- `/api/health` endpoint checks database connectivity for UptimeRobot monitoring

### Pillar 3 — Observability from day one

**Status: Mostly covered — one known gap (GAP-21, already tracked)**

- Sentry EU with PII scrubbing (`beforeSend`) on client, server, and edge configs — ADR-OPS-005
- UptimeRobot polling `/api/health` every 5 minutes — ADR-OPS-007
- Vercel function logs available in real time during development and production
- Supabase dashboard covers DB query performance, auth failures, and storage errors

**Outstanding:** GAP-21 — Sentry `withScope` + route tag (`scope.setTag('route', 'generate-summary')`) missing on AI routes. Without this, AI-specific failures cannot be filtered in the Sentry dashboard. Tracked for P5.3.

### Pillar 4 — Data integrity and state management

**Status: Well covered — no action required**

- Row-Level Security (RLS) on all Supabase tables — users can only access their own data
- Ownership check on every API route and Server Action before any data read or write
- Cascade deletion order enforced in both user-initiated and inactivity deletion paths: `application_answers` → `applications` → `charity_profiles` → `ai_usage_log` → `user_profiles` → `auth.admin.deleteUser`
- `ignoreDuplicates: false` on all upserts after D-HSF-03 root cause analysis
- Supabase Pro daily automated backups with 7-day retention in eu-west-2 — ADR-DATA-005

### Pillar 5 — Safe deployment practices

**Status: Gap identified and resolved**

Grant Pathway had Vercel preview deployments and GitHub Actions CI as quality gates, but no documented rollback strategy, no formal deployment process, and no record of the available feature flags.

**Action taken:** `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md` created (8 June 2026). The checklist covers:

- Pre-deploy gates (CI, preview review, migration verification, risk assessment)
- Standard deploy process (push to master → CI → Vercel auto-deploy)
- Database migration sequencing (dev first, then production, code change immediately after)
- Vercel instant rollback — the fastest recovery path for any code issue (promote prior deployment in ~30 seconds)
- Feature flag reference (`DISABLE_TEXT_PREPROCESSING`, `PREPROCESS_CHAR_CEILING`) — can be toggled without a code deploy
- Post-deploy verification steps

### Pillar 6 — Security and access control

**Status: Well covered — one known gap (GAP-25, already tracked)**

- Supabase Auth with MFA opt-in
- RLS on all tables, ownership enforced at every data access point
- Content Security Policy headers configured in `next.config.ts` including Sentry EU ingest domain
- Sentry PII scrubbing on all three config files (client, server, edge)
- File validation (`lib/file-validation.ts`) re-validates MIME type and size server-side before text extraction
- Upstash rate limiting on all AI routes

**Outstanding:** GAP-25 — Zod input validation missing on `actions/applications.ts` and `actions/auth.ts`. `actions/charity.ts` already uses Zod. Tracked for P5.3.

---

## Limits acknowledged

Knox is clear that production thinking is a mindset, not a one-time checklist. The deployment checklist created as part of this review should be treated as a living document — updated as new feature flags are added, as the deployment process evolves, and as new failure modes are discovered in production.

---

## Outstanding actions

| Item          | What it is                                                        | Target                      |
| ------------- | ----------------------------------------------------------------- | --------------------------- |
| GAP-21        | Sentry route tagging on AI routes                                 | P5.3                        |
| GAP-25        | Zod validation on `actions/applications.ts` and `actions/auth.ts` | P5.3                        |
| Capacity plan | Document expected behaviour under concurrent user load            | Before first marketing push |
