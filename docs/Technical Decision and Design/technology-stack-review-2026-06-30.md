# Technology Stack Review — Grant Pathway v1

**Tier:** 3
**Volatility:** Low
**Update when:** A formal decision to swap a stack component is made

**Product:** Grant Pathway v1
**Date:** 30 June 2026
**Author:** Rapidglobe Ltd
**Basis:** technology-stack.md v1.3 · technical-design.md v1.4 · ADR-AI-001/002, ADR-STACK-001–006, ADR-OPS-003/005/008, ADR-SEC-005

---

## Overall Finding

Every component in the current stack is the correct selection for its role. No swaps are recommended. The stack is appropriately lean for a solo developer operating under UK data residency, a £100/month cost ceiling, and a 31 July 2026 launch target. One addition — Axiom for structured log management — is worth scheduling for P5.4 to close the AI route latency observability gap without waiting for Sentry performance monitoring to be fully configured.

---

## Component Review

### TS-01 — Framework & Language

**Current:** Next.js App Router + TypeScript  
**Verdict:** Retain

**Alternatives considered:**

- **Remix / React Router v7** — Merged with React Router in late 2024; strong form handling and progressive enhancement. Smaller ecosystem; no Vercel parity advantage; fewer mature AI/SaaS library integrations.
- **SvelteKit** — Lighter runtime, excellent DX. Smaller future-maintainer pool — a real concern given the C18 succession plan — and fewer component libraries at WCAG 2.2 AA standard.

**Recommendation:** Next.js App Router is the industry standard for this class of product. The Vercel-native deployment, breadth of ecosystem, and the largest future-maintainer pool are genuine advantages — not defaults.

---

### TS-02 — Database

**Current:** Supabase PostgreSQL · London  
**Verdict:** Retain

**Alternatives considered:**

- **Neon** — Serverless Postgres with database branching (excellent for migration testing). Lacks Auth and Storage; would require two additional vendors. No equivalent to Supabase's native RLS–auth integration.
- **PlanetScale** — Deprecated its free tier in 2024. MySQL lacks PostgreSQL features in use here. No London region.
- **Turso (libSQL)** — Designed for edge-distributed SQLite reads; not a natural fit for a server-rendered app with complex relational queries and strict UK data residency.

**Recommendation:** The combination of Postgres, Auth, RLS, and Storage in a single London-region service is unique in the market. No alternative bundles these capabilities without introducing additional vendors.

---

### TS-03 — Authentication

**Current:** Supabase Auth (bundled)  
**Verdict:** Retain

**Alternatives considered:**

- **Clerk** — Excellent DX; pre-built React components; organisation support. UK/EU data residency requires the Enterprise plan. Removes the native RLS–auth linkage that automatically scopes every database query to the authenticated user.
- **Auth.js (NextAuth v5)** — Open-source, no vendor lock-in. Requires custom RLS integration logic and significantly more session-management plumbing for a solo developer.
- **Lucia** — Lightweight, session-based, good control. Requires writing more auth plumbing code at the cost of development velocity.

**Recommendation:** Supabase Auth's native RLS integration is a genuine architectural advantage: every user session automatically scopes database access at the database level. Clerk or Auth.js cannot replicate this without custom work.

---

### TS-04 — Hosting Platform

**Current:** Vercel Pro · London (lhr1)  
**Verdict:** Retain

**Alternatives considered:**

- **Cloudflare Pages + Workers** — Edge-first, globally fast, significantly cheaper. Workers have a CPU time cap (not wall-clock) that cuts AI routes well below the 30–45 s call times observed in testing. The 90-second function timeout is a hard requirement Cloudflare cannot meet without a full Durable Objects redesign.
- **Fly.io** — Container-based, London region available. More operational overhead; no first-class Next.js optimisation; no equivalent per-PR preview deployments.
- **Railway** — Good developer experience, simple container deployment. No CDN equivalent; no Next.js-specific optimisations; preview deployments require additional configuration.

**Recommendation:** The 90-second function timeout eliminates Cloudflare — the only serious cost-competitive alternative. Vercel with a London function region also aligns compute directly with Bedrock eu-west-2, reducing AI call latency and keeping all processing in UK infrastructure.

---

### TS-05 — Email Service

**Current:** Resend (free tier)  
**Verdict:** Retain · Monitor

**Alternatives considered:**

- **AWS SES (eu-west-2)** — Already have active AWS credentials in the same region. Cost is approximately £0.10 per 1,000 emails — a fraction of any alternative. Would consolidate billing and reduce vendor count by one. Requires SMTP and DKIM configuration in Supabase Auth settings; straightforward but not trivial.
- **Postmark** — Best-in-class transactional deliverability. More expensive than Resend; no meaningful advantage at current estimated volumes (under 200 emails/month).
- **Brevo** — EU-headquartered, GDPR-friendly, 300 emails/day free. Less developer-focused API; Resend's DX is cleaner for a code-first setup.

**Recommendation:** Retain now. At current volumes the Resend free tier is more than sufficient. When email volume or vendor count becomes a concern, migrating to AWS SES is a clean swap — Supabase SMTP config change plus package removal — that consolidates billing within the existing AWS footprint.

---

### TS-06 — Error Tracking

**Current:** Sentry EU  
**Verdict:** Retain

**Alternatives considered:**

- **Highlight.io** — Open-source; session replay included; EU cloud and self-hosting available. Less mature for Next.js edge runtime coverage. Worth watching as the open-source ecosystem matures.
- **Bugsnag** — Reliable, used by large teams. More expensive; less Next.js-specific SDK maturity than Sentry.
- **Vercel logs only** — No persistent history, no deduplication, no alerting. Sufficient for development; not for production monitoring of a live charity service.

**Recommendation:** Sentry's Next.js SDK covers all three runtimes (client, server, edge) and the EU data region satisfies C13. One complement worth adding at P5.4: Axiom for structured log management — see New Addition section below.

---

### TS-07 — Rate Limiting

**Current:** Upstash Redis · sliding window  
**Verdict:** Retain

**Alternatives considered:**

- **Supabase DB counter** — Eliminates Upstash as a separate vendor. Adds database load on every AI request; weaker timing guarantees than an atomic Redis counter. Valid at low volume, but provides less burst protection.
- **Vercel KV** — Upstash Redis under the hood, accessed via Vercel's API. Identical capability; would add a Vercel billing dependency without reducing vendor count.
- **Application-level only** — The monthly `ai_usage_log` cap already blocks sustained abuse. Provides no protection against rapid-fire bursting within the monthly limit.

**Recommendation:** The sliding window algorithm provides measurably better burst protection than a DB count, at zero additional cost — the Upstash free tier covers 200,000 requests per day, far above expected AI route volume.

---

### TS-08 — CI Pipeline

**Current:** GitHub Actions · 4 jobs  
**Verdict:** Retain

**Alternatives considered:**

- **CircleCI** — Mature CI platform. No advantage over GitHub Actions for a public GitHub repository; introduces an additional account and configuration surface.
- **GitLab CI** — Would require migrating the repository away from GitHub. No benefit; significant disruption.

**Recommendation:** No credible alternative offers any advantage for a public GitHub repository. GitHub Actions is zero-configuration, free for public repos, and covers lint, type-check, tests, security audit, and migration validation on every push.

---

### TS-09 — Test Framework

**Current:** Vitest  
**Verdict:** Retain

**Alternatives considered:**

- **Jest** — Established standard. Slower than Vitest in CI; TypeScript requires additional configuration (ts-jest or Babel transform). No meaningful advantage for a TypeScript-first project.
- **Playwright** — End-to-end browser testing; complementary to Vitest rather than a replacement. Worth adding once the UI flows are stable enough to justify E2E coverage post-launch.

**Recommendation:** Vitest is the correct choice: Jest-compatible API, native TypeScript support, significantly faster in CI. Playwright is the natural next addition when E2E coverage becomes a priority after launch.

---

### AI — Provider & Model

**Current:** Amazon Bedrock eu-west-2 · Claude Sonnet 4.6  
**Verdict:** Retain · Monitor

**Alternatives considered:**

- **Azure AI Foundry (Claude)** — Azure now offers Anthropic Claude models in EU regions including UK South, as of 2025. An alternative path to UK-region Claude inference using Azure credentials rather than AWS. SDK change required; no quality or cost advantage — it trades one cloud dependency for another.
- **Anthropic direct API** — US-region only as of mid-2025; no EU endpoint available. Cannot satisfy C13 data residency without cloud provider routing.
- **Claude Opus 4.8** — Higher quality, significantly higher cost. Output quality with Sonnet 4.6 is already strong for grant writing; Opus is not justified at v1 scale.
- **Claude Haiku 4.5** — Lower cost, lower quality. Grant writing quality is the core value proposition; the cost saving does not justify the quality tradeoff.
- **Gemini via Vertex AI** — Different model family; would require a full prompt strategy rewrite and quality validation from scratch. Not a like-for-like swap.

**Recommendation:** Amazon Bedrock eu-west-2 is the only production-grade path to running Claude in UK/EEA region today. Azure AI Foundry is worth monitoring as it matures — it would simplify the AWS credential model — but offers no advantage that justifies migration before or shortly after launch.

---

## New Addition to Consider

### Axiom — Structured Log Management

**Verdict:** Consider adding at P5.4

Axiom provides a searchable, chartable log management layer with a native Vercel log drain integration. Once the drain is configured — a single URL added in Vercel project settings — every function log line becomes queryable in real time, including the structured latency logs already emitted by both AI routes (`generate-summary`, `refine-answer`; the third route, `generate-draft`, was removed 2026-07-01 as orphaned code — see CHANGELOG.md).

This directly closes the remaining gap from GAP-27: AI route latency data is being logged in structured form but currently has nowhere to land that supports alerting or trend analysis. Sentry handles exceptions; Axiom handles telemetry. They are complementary, not competing.

It also provides a searchable audit trail for AI usage patterns, error rates per route, and token volume — useful context before configuring Sentry performance monitoring at P5.4.

| Attribute        | Detail                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Cost             | Free tier — 10 GB/month, 90-day retention. Zero cost at v1 scale.                                              |
| Setup effort     | ~15 minutes. One log drain URL in Vercel project settings; no SDK changes or code modifications required.      |
| What it replaces | Nothing — complements Sentry. Does not replace error tracking or performance monitoring.                       |
| When to add      | P5.4 — alongside Sentry performance monitoring configuration, once production traffic baseline is established. |
| Data region      | Axiom EU region available; select at account setup to satisfy C13.                                             |

---

## Summary Matrix

| Ref   | Component           | Current selection               | Verdict          | Note                                                                                           |
| ----- | ------------------- | ------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| TS-01 | Framework           | Next.js App Router + TypeScript | Retain           | No credible alternative at this scale and team size                                            |
| TS-02 | Database            | Supabase PostgreSQL · London    | Retain           | Unique bundling of Postgres + Auth + RLS + Storage in UK region                                |
| TS-03 | Authentication      | Supabase Auth (bundled)         | Retain           | Native RLS integration scopes every DB query at the database level automatically               |
| TS-04 | Hosting             | Vercel Pro · London (lhr1)      | Retain           | 90 s timeout requirement eliminates Cloudflare — the only serious cost-competitive alternative |
| TS-05 | Email               | Resend (free tier)              | Retain · Monitor | AWS SES is the natural future migration — same AWS footprint, fraction of the cost per email   |
| TS-06 | Error tracking      | Sentry EU                       | Retain           | Best Next.js three-runtime coverage; EU data region satisfies C13                              |
| TS-07 | Rate limiting       | Upstash Redis · sliding window  | Retain           | Better burst protection than a DB counter at zero additional cost                              |
| TS-08 | CI pipeline         | GitHub Actions · 4 jobs         | Retain           | Native to GitHub, zero configuration overhead, free for public repos                           |
| TS-09 | Tests               | Vitest                          | Retain           | Playwright for E2E is the natural post-launch complement (separate test layer)                 |
| AI    | AI provider + model | Bedrock eu-west-2 · Sonnet 4.6  | Retain · Monitor | Monitor Azure AI Foundry (Claude in UK South) as it matures — no advantage in switching now    |
| —     | Log management      | Not in stack                    | Add · P5.4       | Axiom — ~15 min setup, closes AI latency observability gap, EU region, free tier               |

---

_Last updated: 2026-07-02 — corrected the Axiom section's AI route count from three to two, reflecting the `generate-draft` route removal on 2026-07-01. No component verdicts changed._  
_Originally published: 2026-06-30_  
_Basis: technology-stack.md v1.3 · technical-design.md v1.4 · ADR-AI-001/002, ADR-STACK-001–006, ADR-OPS-003/005/008, ADR-SEC-005_
