---
id: ADR-OPS-002
category: Operations
status: Decided
---

# ADR-OPS-002 — Deployment Strategy

## Context

Grant Pathway must have a reliable, repeatable deployment process. Deployments should be fast, automated from the Git repository, and support a staging/preview environment for testing changes before they reach production users. The deployment strategy must be operable by a single developer.

## Options Considered

### Option A — Vercel automatic deployment from Git (main → production, branches → preview)
- **What it is:** Every push to the `main` branch triggers a production deployment. Every branch push creates a preview deployment with a unique URL. This is Vercel's default behaviour.
- **Strengths:** Zero configuration required. Preview URLs allow testing before merging. Instant rollback by redeploying a previous deployment in the Vercel dashboard. No CI/CD pipeline to maintain.
- **Weaknesses:** Every push to `main` deploys immediately — no manual approval gate. For a single developer, this is acceptable.

### Option B — Manual promotion (branch → staging → manual promote to production)
- **What it is:** A `staging` branch auto-deploys to a staging environment. Promotion to production is manual (merge staging → main).
- **Strengths:** Adds a manual gate before production deployment.
- **Weaknesses:** More branch management overhead. Preview deployments on Vercel already provide a staging-like environment for each branch.

### Option C — GitHub Actions CI pipeline + Vercel deployment
- **What it is:** GitHub Actions runs tests and linting on every push. On success, it triggers a Vercel deployment.
- **Strengths:** Automated quality gates. Tests run before deployment.
- **Weaknesses:** Requires setting up GitHub Actions. Vercel already runs TypeScript build checks on every deployment — adding a CI layer duplicates some checks. Justified when a test suite exists.

## Decision

**Option A — Vercel automatic Git deployment, with GitHub Actions adopted when a test suite exists.**

Every push to `main` deploys to production. Every branch push creates a Vercel preview deployment at a unique URL. This is Vercel's default behaviour, requiring zero CI/CD configuration.

**Branch strategy:**
- `main` → production deployment
- Feature branches → Vercel preview deployments (unique URL per branch)
- Branch protection on `main`: Vercel build check must pass before merge (configured in GitHub repository settings)

**Pre-merge practice:** Always verify the Vercel preview URL for the feature branch before merging to `main`. This is the manual gate that makes automatic production deployment safe for a solo developer.

**Upgrade trigger:** GitHub Actions CI (Option C) is added when the first meaningful test suite exists. The workflow will run lint and tests on every push; the Vercel deployment only proceeds on success.

**Pre-launch checklist (one-time tasks before first production deployment):**
1. Activate Vercel Pro and set `maxDuration = 90` on AI routes (ADR-AI-006)
2. Configure Resend SMTP in Supabase Auth dashboard (ADR-OPS-003)
3. Customise Supabase Auth email templates — verification and password reset must reference "Grant Pathway", not "Supabase". Follow tone and voice guide in design-requirements.md (ADR-OPS-003)
4. Add SPF and DKIM DNS records for the sending domain (ADR-OPS-003)
5. Set Anthropic API spend limit in the Anthropic dashboard (ADR-AI-008)
6. Configure Sentry EU data region and add `SENTRY_DSN` to Vercel production environment (ADR-OPS-005)
7. Validate HTTP security headers at securityheaders.com (ADR-SEC-004)
8. Set production Supabase environment variables in Vercel Production scope (ADR-SEC-006)
9. Add `CRON_SECRET` environment variable to Vercel and verify the Storage cleanup cron job is active (ADR-OPS-004)

**Per-release deployment checklist:**
1. Apply any pending migrations to the production Supabase project: `supabase db push --db-url [prod-url]`
2. Verify the feature branch preview deployment
3. Merge to `main`
4. Confirm the production Vercel deployment completes successfully

Vercel environment variables are scoped separately for Production and Preview — the production Supabase project credentials are set in Production scope only.

## Consequences

- A `main` branch protection rule (require PR, or at minimum require build to pass) is recommended even for solo development.
- Production deployments should be tagged in Git for rollback reference.
- Database migrations must be applied before or alongside the code deployment that requires them.

## Source

ADR-STACK-004, ADR-STACK-005, ADR-DATA-004.

## Date Decided

2026-04-21
