# Grant Pathway

**The free grant application preparation tool for UK charities.**

Grant Pathway helps non-specialist staff at UK charitable organisations write stronger, more consistent grant applications. It summarises funder guidelines in plain English, extracts the questions a funder wants answered, and provides AI-assisted writing support — while keeping the charity's own voice at the centre. The charity writes every answer; AI refines on request only. Every answer requires explicit human approval before export.

Provided free of charge by **RapidGlobe Ltd** (company no. 05615649). Source code is open source under the MIT Licence.

**Live app:** https://grant-pathway-three.vercel.app

---

## Tech stack

| Concern                   | Technology                                                 |
| ------------------------- | ---------------------------------------------------------- |
| Framework                 | Next.js (App Router), TypeScript                           |
| Database + Auth + Storage | Supabase (PostgreSQL, London region)                       |
| AI                        | Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2) |
| Hosting                   | Vercel (function region: London, eu-west-2)                |
| Email                     | Resend                                                     |
| Error tracking            | Sentry EU                                                  |
| Rate limiting             | Upstash Redis                                              |
| Charity register          | Charity Commission for England and Wales API               |
| Domain                    | grantpathway.org.uk                                        |

All data is stored and processed within the UK/EEA. No data is used to train AI models.

---

## Running locally

### Prerequisites

- Node.js 18+
- A Supabase project (London region recommended)
- AWS credentials with Amazon Bedrock access (Claude Sonnet 4.6, eu-west-2)
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

Every commit runs Prettier and ESLint via Husky pre-commit hooks. GitHub Actions CI runs four jobs on every push to `master` and every PR:

| CI job     | What it checks                                                        |
| ---------- | --------------------------------------------------------------------- |
| Quality    | `type-check`, `lint`, `format:check`                                  |
| Tests      | Vitest test suite (`npm test`)                                        |
| Security   | `npm audit --audit-level=high`                                        |
| Migrations | Applies all migrations from scratch against a local Supabase instance |

See `docs/Technical Decision and Design/ADR-OPS-008-linting-and-code-quality.md`.

---

## Documentation

All project documentation lives in `docs/`. Start here:

| Document                                            | What it covers                                                                                        |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` | Current build status — what's done, what's outstanding, phase gates                                   |
| `docs/Implementation Plan/CHANGELOG.md`             | Every significant design decision and why it was made                                                 |
| `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md`  | Pre-deploy gates, rollback steps, feature flags                                                       |
| `docs/Implementation Plan/ADR-TRACEABILITY.md`      | All ADR consequences mapped to tasks; known gaps (GAP-xx)                                             |
| `docs/Technical Decision and Design/`               | Architectural Decision Records (ADRs) — 46 decisions covering every major technical choice            |
| `docs/decisions/`                                   | Business and product decision records (DRs)                                                           |
| `docs/PRD inputs/`                                  | Acceptance criteria and screen requirements                                                           |
| `docs/data-model.md`                                | Full database schema and entity relationships                                                         |
| `docs/technology-stack.md`                          | Tech stack decisions and rationale                                                                    |
| `docs/non-functional-requirements.md`               | Performance, accessibility, security, and availability targets                                        |
| `docs/Alan Knox Audits/`                            | Engineering practice audits against Alan Knox's vibe-coding series                                    |
| `AGENTS.md`                                         | Rules for AI coding sessions — mandatory pre-task checks, documentation requirements, commit protocol |

---

## Deployment

Pushing to `master` triggers a GitHub Actions CI run (type-check, lint, format:check). On CI pass, Vercel automatically deploys to production. See `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md` for the full process including database migrations, rollback, and feature flags.

---

## Licence

Source code: [MIT Licence](https://opensource.org/licenses/MIT).
Grant Pathway name, logo, and brand materials: © RapidGlobe Ltd — not covered by the MIT Licence.
