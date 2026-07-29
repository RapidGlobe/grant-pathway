# Grant Pathway

**The free grant application preparation tool for UK charities.**

Grant Pathway helps non-specialist staff at UK charitable organisations write stronger, more consistent grant applications. It summarises funder guidelines in plain English, extracts the questions a funder wants answered, and provides AI-assisted writing support — while keeping the charity's own voice at the centre. The charity writes every answer; AI refines on request only. Every answer requires explicit human approval before export.

Provided free of charge by **RapidGlobe Ltd** (company no. 05615649). Source code is proprietary and closed source — all rights reserved.

**Live app:** https://grant-pathway-three.vercel.app

---

## Tech stack

| Concern                   | Technology                                                            |
| ------------------------- | --------------------------------------------------------------------- |
| Framework                 | Next.js (App Router), TypeScript                                      |
| Database + Auth + Storage | Supabase (PostgreSQL, London region)                                  |
| AI                        | Anthropic Claude (latest Sonnet model) via Amazon Bedrock (eu-west-2) |
| Hosting                   | Vercel (function region: London, eu-west-2)                           |
| Email                     | Resend                                                                |
| Error tracking            | Sentry EU                                                             |
| Rate limiting             | Upstash Redis                                                         |
| Charity register          | Charity Commission for England and Wales API                          |
| Domain                    | grantpathway.org.uk                                                   |

All data is stored and processed within the UK/EEA. No data is used to train AI models.

---

## Running locally

### Prerequisites

- Node.js 24 or newer (declared in `package.json`'s `engines` field, and the version CI and Vercel both run — Node 20 reached end-of-life on 30 April 2026)
- A Supabase project (London region recommended)
- AWS credentials with Amazon Bedrock access (latest Claude Sonnet model, eu-west-2 — see `lib/prompts.ts`'s `MODEL` constant for the exact deployed value)
- Upstash Redis instance
- Resend API key
- Sentry DSN (optional for local dev)

### Setup

```bash
# Install dependencies
npm install

# Copy the environment variable template and fill in your values
cp .env.example .env.local

# Apply database migrations
# Run each file in supabase/migrations/ in order via the Supabase dashboard SQL editor

# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Available scripts

| Script                 | What it does                |
| ---------------------- | --------------------------- |
| `npm run dev`          | Start development server    |
| `npm run build`        | Production build            |
| `npm run start`        | Start production server     |
| `npm run lint`         | ESLint (max-warnings 0)     |
| `npm run lint:fix`     | ESLint with auto-fix        |
| `npm run format`       | Prettier write              |
| `npm run format:check` | Prettier check (used in CI) |
| `npm run type-check`   | TypeScript `tsc --noEmit`   |
| `npm test`             | Run Vitest test suite       |
| `npm run test:watch`   | Run Vitest in watch mode    |

### Code quality

Every commit runs Prettier and ESLint via Husky pre-commit hooks. GitHub Actions CI (`ci.yml`) runs three jobs on every push to `master` and every PR:

| CI job                | What it checks                                                        |
| --------------------- | --------------------------------------------------------------------- |
| `lint-and-typecheck`  | `type-check`, `lint`, `format:check`                                  |
| `test`                | Vitest test suite (`npm test`)                                        |
| `validate-migrations` | Applies all migrations from scratch against a local Supabase instance |

See `docs/Technical Decision and Design/ADR-OPS-008-linting-and-code-quality.md`.

Two further workflows run outside `ci.yml` and do not gate:

- **`security-audit.yml`** — `npm audit --audit-level=high`, weekly on Mondays plus manual runs. Split out of `ci.yml` on 2026-07-29 because an unfixable devDependency advisory kept it red on every push, which made a real failure in the three gating jobs look identical to known noise.
- **`schema-drift-check.yml`** — runs daily against the real hosted dev and prod Supabase databases (not just a local instance) to catch a tracked migration or RPC function that's missing from either. `validate-migrations` above only proves the migrations apply cleanly to an empty database, not that they've actually been run against the live environments.

---

## Documentation

All project documentation lives in `docs/`. Start here:

| Document                                                 | What it covers                                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`      | Current build status — what's done, what's outstanding, phase gates                                   |
| `docs/Implementation Plan/CHANGELOG.md`                  | Every significant design decision and why it was made                                                 |
| `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md`       | Pre-deploy gates, rollback steps, feature flags                                                       |
| `docs/Implementation Plan/ADR-TRACEABILITY.md`           | All ADR consequences mapped to tasks; known gaps (GAP-xx)                                             |
| `docs/Technical Decision and Design/`                    | Architectural Decision Records (ADRs) — see `ADR-INDEX.md` for the current full list of decisions     |
| `docs/decisions/`                                        | Business and product decision records (DRs)                                                           |
| `docs/PRD-Grant-Pathway.md`                              | Product requirements, including screen-by-screen content and validation rules (Section 7)             |
| `docs/PRD inputs/acceptance-criteria.md`                 | Functional acceptance criteria                                                                        |
| `docs/data-model.md`                                     | Full database schema and entity relationships                                                         |
| `docs/Technical Decision and Design/technology-stack.md` | Tech stack decisions and rationale                                                                    |
| `docs/non-functional-requirements.md`                    | Performance, accessibility, security, and availability targets                                        |
| `docs/Test Plans/TEST-DASHBOARD.md`                      | Current test coverage and pass/fail status across the whole test suite                                |
| `docs/Alan Knox Audits/`                                 | Engineering practice audits against Alan Knox's vibe-coding series                                    |
| `AGENTS.md`                                              | Rules for AI coding sessions — mandatory pre-task checks, documentation requirements, commit protocol |

---

## Deployment

Pushing to `master` triggers a GitHub Actions CI run (type-check, lint, format:check). On CI pass, Vercel automatically deploys to production. See `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md` for the full process including database migrations, rollback, and feature flags.

---

## Licence

Source code: proprietary — © RapidGlobe Ltd, all rights reserved. This is a closed-source, private repository; no open-source licence applies to Grant Pathway's own code (third-party dependencies retain their own licences). See `ADR-STACK-005` and `DR-BM-003` (reversed 2026-07-10).
Grant Pathway name, logo, and brand materials: © RapidGlobe Ltd.
