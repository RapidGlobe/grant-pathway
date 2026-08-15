# Technology Stack — Grant Pathway v1

**Tier:** 2 — Check if relevant to the task
**Volatility:** Medium
**Update when:** Any change to technology choices, libraries, services, or infrastructure

**Version:** 1.13
**Last updated:** 2026-08-15

This document captures the agreed technology stack for the v1 build. These decisions inform the BRD and constrain the technical architecture.

---

## TS-01 — Programming Language & Framework

| Decision  | Choice     |
| --------- | ---------- |
| Framework | Next.js    |
| Language  | TypeScript |

**Rationale:**
Next.js is a full-stack React framework — it handles both the user interface and server-side logic (API calls to Amazon Bedrock for Claude AI, Charity Commission lookups, database operations) within a single codebase. TypeScript is a typed superset of JavaScript that makes the codebase more self-documenting, directly supporting the documented-codebase requirement (C18) and future handover to a successor organisation (DR-BM-002).

**Key benefits for this project:**

- Single codebase covers both frontend and backend — less to manage as a solo developer (C4)
- Both the Anthropic SDK and the AWS SDK support Amazon Bedrock integration in TypeScript
- Excellent accessible component libraries available (e.g. shadcn/ui, built on Base UI primitives -- corrected 2026-07-13, see `PDR-UI-001`'s review note; originally decided as Radix UI, but the live codebase uses `@base-ui/react` throughout) supporting WCAG 2.2 AA compliance (C15)
- Deploys to any Node.js host including UK-region cloud platforms (C13)
- Largest web framework community — future maintainers or successor organisations are likely to know it

---

## TS-02 — Database

| Decision        | Choice      |
| --------------- | ----------- |
| Platform        | Supabase    |
| Database engine | PostgreSQL  |
| Region          | London (UK) |

**Rationale:**
Supabase is a managed platform built on PostgreSQL — the industry-standard open source relational database. Hosting in the London region satisfies the UK-region data storage requirement (C13, DR-DP-002). Supabase is the natural complement to Next.js and consolidates database, authentication, and file storage into a single platform, reducing complexity for a solo developer.

**Included in Supabase:**

- Managed PostgreSQL database with automatic backups
- Row Level Security — database-level enforcement of which user can access which charity's data
- Authentication (see TS-03)
- File storage — for uploaded funder guidelines
- Free tier sufficient for v1 usage volumes (NFR-03)

---

## TS-03 — Authentication Provider

| Decision | Choice                                        |
| -------- | --------------------------------------------- |
| Provider | Supabase Auth (included in Supabase platform) |

**Rationale:**
Supabase Auth is included within the Supabase platform at no additional cost, eliminating the need for a separate authentication service. It integrates natively with the Supabase database via Row Level Security, ensuring that authentication and data access controls are enforced at the database level.

**Features:**

- Email and password login
- Magic link (passwordless) login
- Password reset — built in
- MFA — not offered. Removed 2026-06-12; FR-07 demoted to Won't Have (NFR-04)
- Account deletion — full user and data removal supported (DR-DP-003)

---

## TS-04 — Hosting Platform

| Layer                               | Platform | Region                                                                        |
| ----------------------------------- | -------- | ----------------------------------------------------------------------------- |
| Application (Next.js)               | Vercel   | **London, UK (eu-west-2 / lhr1)** — function region explicitly set 2026-05-29 |
| Data (database, auth, file storage) | Supabase | London, UK                                                                    |

**Rationale:**
Vercel is built by the same team as Next.js — deployment is a single command and auto-scaling is handled automatically, requiring no infrastructure management from the developer. All charity data is stored exclusively in Supabase London, satisfying the UK-region data storage requirement (C13, DR-DP-002). Vercel's compute layer processes requests but holds no persistent data.

**Qualified 2026-08-15.** The operational claims above hold — deployment is a single command and there is no infrastructure to manage. **The "built by the same team as Next.js" framing should not be read as a technical dependency**, and is not load-bearing for this choice: as of Next.js 16.3 the framework's own documentation states that running it requires "a Node.js server. That's it", and that "Vercel's adapter uses the same public API as every other adapter." Vercel's advantage is zero-configuration deployment and performance fidelity, not exclusive framework access. Recorded here so this section does not drift from `ADR-STACK-004`, whose equivalent rationale was corrected on the same date. Full analysis: `hosting-platform-review-2026-08-15.md`.

**Vercel function region — London (eu-west-2 / lhr1):** The Vercel function region was explicitly set to London on 2026-05-29 (Vercel → Settings → Function Regions). This aligns Vercel functions with the AWS Bedrock region (eu-west-2), eliminating the transatlantic round trip that previously occurred when functions defaulted to iad1 (Virginia). All AI processing now executes within the same UK region. This reduces call latency, lowers timeout risk, and ensures all processing remains in UK infrastructure (C13, DR-DP-002).

**Fallback:** If the UK data residency interpretation requires additional assurance, the Vercel function region setting provides explicit evidence that compute also runs in UK/EEA.

---

## TS-05 — Email Service

| Decision | Choice |
| -------- | ------ |
| Provider | Resend |

**Rationale:**
Resend is a developer-focused transactional email API with first-class Next.js support. It handles all system emails — account verification, password reset, inactivity warnings, account deletion confirmation — via the `RESEND_API_KEY` environment variable. Chosen over alternatives for its simple API, reliable delivery, and straightforward domain verification.

**Emails sent by the application:**

- Email address verification (on registration)
- Password reset link
- Inactivity warning (23 months, via cron)
- Account deletion confirmation (on user-initiated deletion and on cron-triggered deletion)

See `ADR-OPS-003-email-service.md`.

---

## TS-06 — Error Tracking

| Decision | Choice    |
| -------- | --------- |
| Provider | Sentry EU |

**Rationale:**
Sentry provides real-time error tracking across all three Next.js runtimes (client, server, edge). The EU data region is used to keep error data within UK/EEA infrastructure (C13). Configuration is split across three files: `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`. The client-side DSN is exposed via `NEXT_PUBLIC_SENTRY_DSN`; the server-side DSN is kept server-only.

See `ADR-OPS-005-error-tracking.md`.

---

## TS-07 — Rate Limiting

| Decision | Choice        |
| -------- | ------------- |
| Provider | Upstash Redis |

**Rationale:**
Upstash provides a serverless Redis instance used for per-user rate limiting on **both** AI API routes — `/api/generate-summary` and `/api/refine-answer`. (Corrected 2026-07-30, audit finding **L2**: this read "all three AI API routes… and the draft generation route". `/api/generate-draft` was **deleted on 2026-07-01** — see `CHANGELOG.md` that date — so there are two.) A sliding window algorithm limits requests per user per time window, providing a defence-in-depth layer on top of the monthly AI usage cap enforced at the database level.

---

## TS-08 — CI Pipeline

| Decision | Choice         |
| -------- | -------------- |
| Provider | GitHub Actions |

**Rationale:**
GitHub Actions runs automatically on every push to `master` and every pull request. Three gating jobs run in `ci.yml` — job names below are the real workflow job names, so they match what GitHub reports and what branch protection requires:

| Job                   | What it checks                                                        |
| --------------------- | --------------------------------------------------------------------- |
| `lint-and-typecheck`  | `type-check`, `lint` (ESLint, max-warnings 0), `format:check`         |
| `test`                | Vitest test suite (`npm test`)                                        |
| `validate-migrations` | Applies all migrations from scratch against a local Supabase instance |

Two further workflows run outside `ci.yml` and deliberately do **not** gate:

| Workflow                 | What it checks                                                                                                                     | When                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `security-audit.yml`     | `npm audit --audit-level=high`                                                                                                     | Weekly (Mondays) + manual |
| `schema-drift-check.yml` | Tracked migrations and RPC functions against the real hosted databases — **`dev` only on a schedule until P5.4; `prod` on demand** | Daily + manual            |

The dependency scan was a fourth job inside `ci.yml` until 2026-07-29. It was separated out because a high-severity advisory in a devDependency with no available fix (see `PR #70`, ESLint 10 upgrade deferred) held it red continuously — and since a workflow's status is the worst of its jobs, `ci.yml` went red on every push. A genuine failure in the three gating jobs became indistinguishable from known, accepted noise. The scan still runs and still reports; it just no longer determines whether `ci.yml` is green.

**`schema-drift-check.yml` was narrowed to `dev` on 2026-08-03 (decision: WJ) for the same reason, one layer down.** Its prod leg had failed every scheduled run since at least 2026-07-24 — correctly, because Phase 6's migrations exist only on `grant-pathway-dev` — and a check that is expected to be red cannot report anything else, so a genuine unrelated drift on prod would have been indistinguishable from the known failure. Skipping the prod leg is not a claim that prod is healthy; it restores dev drift as a live signal while prod is unprovisioned. It was safe to skip only because this workflow gates nothing — the required contexts on `master` are `lint-and-typecheck`, `test` and `validate-migrations`, so no gate is left waiting on a check that never reports. `workflow_dispatch` still offers `["dev"]`, `["dev","prod"]` and `["prod"]`, so prod is one manual run away. Restoring the scheduled prod leg is a tasked step in **P5.4** and forms part of its exit test.

See `ADR-OPS-008-linting-and-code-quality.md`.

---

## TS-09 — Test Framework

| Decision  | Choice |
| --------- | ------ |
| Framework | Vitest |

**Rationale:**
Vitest is a fast, Vite-native test runner with first-class TypeScript support and a Jest-compatible API. It runs the unit and integration test suite (`__tests__/`) as part of the CI pipeline. Configuration is in `vitest.config.ts`.

---

## TS-10 — Infrastructure & Accounts

### Registered and active

| Item              | Status    | Notes                                                                                             |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------- |
| Domain name       | ✅ Active | **grantpathway.org.uk** — registered; DNS to be pointed to Vercel pre-launch                      |
| AWS cloud account | ✅ Active | Amazon Bedrock (latest Claude Sonnet model, eu-west-2) configured                                 |
| GitHub account    | ✅ Active | Private repository at github.com/RapidGlobe/grant-pathway (proprietary licence — `ADR-STACK-005`) |
| Supabase account  | ✅ Active | Two projects: grant-pathway-dev and grant-pathway-prod (London)                                   |
| Vercel account    | ✅ Active | Pro plan; linked to GitHub; auto-deploys on push to master                                        |
| Resend account    | ✅ Active | Domain verified; transactional emails live                                                        |
| Sentry account    | ✅ Active | EU region; client and server error tracking live                                                  |
| Upstash account   | ✅ Active | Redis instance; rate limiting live on all AI routes                                               |
| VS Code           | ✅ Active | Primary development environment                                                                   |

---

## Stack Summary

| Concern                 | Technology                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| Language                | TypeScript                                                            |
| Framework               | Next.js (App Router)                                                  |
| Database                | PostgreSQL via Supabase (London)                                      |
| Authentication          | Supabase Auth                                                         |
| File storage            | Supabase Storage (London)                                             |
| App hosting             | Vercel (function region: London, eu-west-2 / lhr1)                    |
| AI API                  | Anthropic's latest Claude Sonnet model via Amazon Bedrock (eu-west-2) |
| Email                   | Resend                                                                |
| Error tracking          | Sentry EU                                                             |
| Rate limiting           | Upstash Redis                                                         |
| CI pipeline             | GitHub Actions                                                        |
| Test framework          | Vitest                                                                |
| Charity register        | Charity Commission for England and Wales public API                   |
| Source control          | GitHub (private repository, proprietary licence)                      |
| Development environment | VS Code                                                               |
| Domain                  | grantpathway.org.uk                                                   |

---

## Checklist Coverage

| Checklist Item | Description                                   | Status           |
| -------------- | --------------------------------------------- | ---------------- |
| Item 36        | Preferred programming language and framework  | Covered by TS-01 |
| Item 37        | Database preference                           | Covered by TS-02 |
| Item 38        | Hosting platform — UK region                  | Covered by TS-04 |
| Item 39        | Authentication provider                       | Covered by TS-03 |
| Item 40        | Existing infrastructure, accounts and tooling | Covered by TS-10 |

---

## Document History

| Version | Date       | Author         | Summary of changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.13    | 2026-08-15 | Rapidglobe Ltd | **TS-04 rationale qualified — "built by the same team as Next.js" is not a technical dependency.** Next.js 16.3's own documentation states that running it needs "a Node.js server. That's it", and that Vercel's adapter uses the same public API as every other adapter. The operational claims in TS-04 are unchanged and still hold; only the framing is corrected, so this section does not drift from `ADR-STACK-004`, whose equivalent rationale was corrected the same day. Vercel remains the hosting platform — reaffirmed on evidence after the `P5.4a` Railway proposal was evaluated and closed. Source: `hosting-platform-review-2026-08-15.md`.                                                                                                                                                                                                                                                                                                                                                                                                      |
| 1.12    | 2026-08-03 | Rapidglobe Ltd | **`schema-drift-check.yml` narrowed to `dev` on scheduled runs until P5.4 (decision: WJ).** Its prod leg had failed every scheduled run since at least 2026-07-24 because Phase 6's migrations exist only on `grant-pathway-dev`, so a genuine unrelated drift on prod would have looked identical to the expected failure — the same masking that moved the dependency scan out of `ci.yml` in v1.9, one layer down. Prod remains available on demand via `workflow_dispatch`. Safe only because this workflow gates nothing; restoring the scheduled prod leg is a tasked P5.4 step and part of its exit test. **The narrowing removes a false alarm, not a real risk — production is exactly as unprovisioned as it was.**                                                                                                                                                                                                                                                                                                                                       |
| 1.11    | 2026-07-30 | Rapidglobe Ltd | **Route count corrected — audit finding L2.** TS-07 said Upstash rate-limits "all three AI API routes (`/api/generate-summary`, `/api/refine-answer`, and the draft generation route)". **There are two.** `/api/generate-draft` was deleted on 2026-07-01 and is gone from the codebase entirely (`grep generate-draft` over `app/`, `lib/`, `actions/` returns nothing). The 2026-07-01 deletion did sweep the documentation — `CHANGELOG.md` that date lists `future-phases.md`, `IMPLEMENTATION-PLAN.md` and six ADR files as corrected — but TS-07 was missed, along with five other locations found in this pass.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.10    | 2026-07-30 | Rapidglobe Ltd | **Document retitled from "AI Grant Accelerator v1" to "Grant Pathway v1", and this history table put back into descending order** (Opus audit **L1**). "AI Grant Accelerator" was the project's internal working title before the rename to Grant Pathway; it survives only as the local working-folder name, which is why it kept reappearing. `docs/app-name-and-branding.md` correctly records it as the retired working title — that reference is deliberate and stays. A repo-wide sweep found **five further live documents** carrying the retired name, all corrected in the same pass: `constraints-and-assumptions.md`, `decisions/DECISIONS-INDEX.md`, `user-personas-journeys-and-use-cases.md`, `v1-out-of-scope.md` and `vision-statement.md`. The audit had spotted only this one. Separately, this table listed 1.8 and 1.9 above 1.0 and then ran 1.0→1.7 ascending — new entries had been added to the top of an ascending table. Now descending (newest first), matching `IMPLEMENTATION-PLAN.md`, `ADR-TRACEABILITY.md` and the PDR/ADR records. |
| 1.9     | 2026-07-29 | Rapidglobe Ltd | TS-08 rewritten (Opus audit M2). The job table used invented labels — Quality / Tests / Security / Migrations — matching no real workflow job name, so a red check in GitHub could not be traced back to this document. Replaced with the three real gating job names (`lint-and-typecheck`, `test`, `validate-migrations`). The dependency scan was moved out of `ci.yml` into a new `security-audit.yml` (weekly + manual, non-gating) because an unfixable devDependency advisory held it red continuously, turning `ci.yml` red on 11 of its last 12 runs and masking any genuine failure; both it and `schema-drift-check.yml` are now listed separately as non-gating workflows.                                                                                                                                                                                                                                                                                                                                                                              |
| 1.8     | 2026-07-24 | Rapidglobe Ltd | Dev-only component-testing dependencies added (`@testing-library/react`, `@testing-library/jest-dom`, `happy-dom`) — none existed before (`vitest.config.ts` was `environment: 'node'`, `.test.ts` only). Added while building `PDR-UI-008`'s `contextual-tooltip.tsx`. No new product-facing dependency — the tooltip mechanism itself deliberately reuses the existing `@base-ui/react` primitive rather than adding a coachmark/tour library.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 1.7     | 2026-07-13 | Rapidglobe Ltd | Two findings fixed from a cross-document alignment check against `technical-design.md`, the BRD, and the PRD, per WJ: (1) TS-10 and Stack Summary both still pinned "Claude Sonnet 4.6" -- de-versioned to "the latest Claude Sonnet model" to match `technical-design.md` (corrected the same way in this same pass) and the PRD (already de-versioned). (2) The missing v1.4 Document History row (see above) added retrospectively after confirming via `git log` that v1.4 was a real, used version -- not a skipped number as initially suspected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.6     | 2026-07-13 | Rapidglobe Ltd | TS-01's UI component library example corrected: said "shadcn/ui built on Radix UI" — the live codebase uses `@base-ui/react` throughout `components/ui/`, with no `@radix-ui/*` dependency in `package.json`. Found during a `PRD-Grant-Pathway.md` Section 13 review; same fix applied to the PRD and a new review note added to `PDR-UI-001` (decision and rationale unchanged, just the primitive library name).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 1.5     | 2026-07-10 | Rapidglobe Ltd | TS-10 and Stack Summary corrected: GitHub repository is private under a proprietary licence, not public — `DR-BM-003` (open source) reversed 2026-07-10; `ADR-STACK-005` (private repo, proprietary licence) is the standing decision.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 1.4     | 2026-07-01 | Rapidglobe Ltd | TS-03's MFA bullet corrected -- "Optional MFA, available as opt-in" was stale; MFA was actually removed from the codebase 2026-06-12 and FR-07 demoted to Won't Have. Corrected to "MFA -- not offered. Removed 2026-06-12; FR-07 demoted to Won't Have (NFR-04)." Part of a wider same-day fix removing phantom `/mfa` references from `middleware.ts` and `technical-design.md` (`258daa9`). This row was missing from the history table until added retrospectively 2026-07-13 during a staleness audit -- the version bump and content fix both landed correctly at the time, only this table entry was never written.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 1.3     | 2026-06-29 | Rapidglobe Ltd | Added TS-05 (Resend), TS-06 (Sentry), TS-07 (Upstash Redis), TS-08 (GitHub Actions CI), TS-09 (Vitest). Retired "To Be Set Up" table — all accounts now active; replaced with current status table. Stack Summary updated with all new services.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 1.2     | 2026-05-29 | Rapidglobe Ltd | TS-04 updated: Vercel function region explicitly set to London (eu-west-2 / lhr1). Stack Summary table updated. Rationale updated to explain region alignment with AWS Bedrock eu-west-2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1.1     | 2026-05-29 | Rapidglobe Ltd | Document history table added to support multi-contributor development                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 1.0     | 2026-04-13 | Rapidglobe Ltd | Initial version                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
