---
id: ADR-OPS-002
category: Operations
status: Decided
---

# ADR-OPS-002 — Deployment Strategy

## Context

Grant Pathway must have a reliable, repeatable deployment process. Deployments should be fast, automated from the Git repository, and support a staging/preview environment for testing changes before they reach production users. The deployment strategy must be operable by a single developer.

## Options Considered

### Option A — Vercel automatic deployment from Git (master → production, branches → preview)

- **What it is:** Every push to the `master` branch triggers a production deployment. Every branch push creates a preview deployment with a unique URL. This is Vercel's default behaviour.
- **Strengths:** Zero configuration required. Preview URLs allow testing before merging. Instant rollback by redeploying a previous deployment in the Vercel dashboard. No CI/CD pipeline to maintain.
- **Weaknesses:** Every push to `master` deploys immediately — no manual approval gate. For a single developer, this is acceptable.

### Option B — Manual promotion (branch → staging → manual promote to production)

- **What it is:** A `staging` branch auto-deploys to a staging environment. Promotion to production is manual (merge staging → master).
- **Strengths:** Adds a manual gate before production deployment.
- **Weaknesses:** More branch management overhead. Preview deployments on Vercel already provide a staging-like environment for each branch.

### Option C — GitHub Actions CI pipeline + Vercel deployment

- **What it is:** GitHub Actions runs tests and linting on every push. On success, it triggers a Vercel deployment.
- **Strengths:** Automated quality gates. Tests run before deployment.
- **Weaknesses:** Requires setting up GitHub Actions. Vercel already runs TypeScript build checks on every deployment — adding a CI layer duplicates some checks. Justified when a test suite exists.

## Decision

**Option A — Vercel automatic Git deployment, with GitHub Actions adopted when a test suite exists.**

Every push to `master` deploys to production. Every branch push creates a Vercel preview deployment at a unique URL. This is Vercel's default behaviour, requiring zero CI/CD configuration.

**Branch strategy:**

- `master` → production deployment
- Feature branches → Vercel preview deployments (unique URL per branch)
- Branch protection on `master`: Vercel build check must pass before merge (configured in GitHub repository settings)

**Pre-merge practice:** Always verify the Vercel preview URL for the feature branch before merging to `master`. This is the manual gate that makes automatic production deployment safe for a solo developer.

**Upgrade trigger:** GitHub Actions CI (Option C) is added when the first meaningful test suite exists. The workflow will run lint and tests on every push; the Vercel deployment only proceeds on success.

**Pre-launch checklist (one-time tasks before first production deployment):**

1. Activate Vercel Pro and set `maxDuration = 90` on AI routes (ADR-AI-006)
2. Configure Resend SMTP in Supabase Auth dashboard (ADR-OPS-003)
3. Customise Supabase Auth email templates — verification and password reset must reference "Grant Pathway", not "Supabase". Follow tone and voice guide in design-requirements.md (ADR-OPS-003)
4. Add SPF and DKIM DNS records for the sending domain (ADR-OPS-003)
5. Configure AWS Bedrock spend cap in the AWS Billing console (PDR-AI-005) — Grant Pathway uses AWS Bedrock, not the Anthropic API directly
6. Configure Sentry EU data region and add `SENTRY_DSN` to Vercel production environment (ADR-OPS-005)
7. Validate HTTP security headers at securityheaders.com (ADR-SEC-004)
8. Set production Supabase environment variables in Vercel Production scope (ADR-SEC-006)
9. Add `CRON_SECRET` environment variable to Vercel and verify the Storage cleanup cron job is active (ADR-OPS-004). **Updated 2026-07-10:** two further cron jobs are now built and confirmed active — `inactivity-warning` (daily, 08:00 UTC) and `inactivity-deletion` (daily, 09:00 UTC) — see `IMPLEMENTATION-STATUS.md` S8.3 and `ADR-OPS-004`'s "Implemented" section.

**Per-release deployment checklist:**

1. Apply any pending migrations to the production Supabase project: `supabase db push --db-url [prod-url]`
2. Verify the feature branch preview deployment
3. Merge to `master`
4. Confirm the production Vercel deployment completes successfully

Vercel environment variables are scoped separately for Production and Preview — the production Supabase project credentials are set in Production scope only.

## Consequences

- ~~A `master` branch protection rule (require PR, or at minimum require build to pass) is recommended even for solo development.~~ ✅ **DECIDED 2026-08-16 (WJ): protection stays configured, and the admin bypass stays with it.** This consequence had been open since 2026-04-21 and was the last undecided item in `P5.4`.

  **What is live:** classic branch protection on `master` requiring three CI contexts (`lint-and-typecheck`, `test`, `validate-migrations`), strict mode on, force-pushes and branch deletion blocked, and **`enforce_admins = false`** — so the sole contributor bypasses the required checks on every direct push. Each push prints `Bypassed rule violations: 3 of 3 required status checks are expected`, which is the bypass working as configured rather than a fault.

  **Why the bypass is kept, in the order that decided it:**
  1. **Enforcement would buy process, not safety.** With one contributor, the same person is author, reviewer and approver. Self-approving a pull request adds ceremony and no second pair of eyes.
  2. **⚠️ Branch protection is not a production gate on this project, and treating it as one is the mistake to avoid.** **Vercel deploys from `master` on push, independently of CI.** Protection governs what enters the branch, not what reaches users — so even with `enforce_admins = true`, a red CI run would block a _merge_ and not a _deployment_.
  3. **It would fight the documented workflow.** `AGENTS.md` §5 instructs every session to push to `origin master` immediately after a change. Required checks are evaluated against the commit being pushed but only _run_ after it, so a direct push can never satisfy them — admin enforcement therefore blocks direct pushes outright. On 2026-08-16 alone that would have meant roughly fifteen self-approved pull requests.

  **What actually keeps broken code out of production** is running the checks before pushing — `type-check`, `lint --max-warnings 0`, the full test suite and a clean `next build`. That was done before every code push on 2026-08-16 and is the control this decision relies on.

  ⚠️ **Residual risk, accepted rather than absent:** nothing mechanically prevents an unreviewed commit, or one with a failing CI run, from reaching production. The mitigations relied on instead are the pre-deploy checklist, Vercel's instant rollback (`ROLLBACK-PROCEDURE.md`), the `AI_ENABLED` kill switch, and CI now being genuinely green so a real failure is visible.

  **Revisit on either trigger:** (1) **a second contributor joins** — a pull request then gains an actual reviewer and enforcement becomes correct; (2) **a genuine pre-launch gate is wanted**, in which case the effective change is making **Vercel** refuse to deploy on a failed check, not tightening GitHub. That is separate work and belongs in `P5.6`, not here.

- Production deployments should be tagged in Git for rollback reference.
- Database migrations must be applied before or alongside the code deployment that requires them.

## Source

ADR-STACK-004, ADR-STACK-005, ADR-DATA-004.

## Date Decided

2026-04-21

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-16 | **Branch-protection consequence decided and closed (WJ) — open since 2026-04-21 and the last undecided item in `P5.4`.** Protection stays configured on `master`; the **admin bypass stays with it**. Enforcement would buy process rather than safety on a repository where one person is author, reviewer and approver. **The decisive point is that branch protection is not a production gate here at all** — Vercel deploys from `master` on push, independently of CI, so protection governs what enters the branch and not what reaches users. Enforcement would also block direct pushes outright, since required checks are evaluated against the pushed commit but only run afterwards, which contradicts `AGENTS.md` §5. The control actually relied on is running type-check, lint, the full suite and a clean build **before** pushing. Residual risk recorded as accepted, not absent. **Two revisit triggers:** a second contributor, or a decision to gate deployment properly — the latter being a change to **Vercel**, not to GitHub, and belonging in `P5.6`. |
| 2026-07-10 | Every "main" reference corrected to "master" (Context, Decision, branch strategy, pre-merge practice, Consequences) — the repository's actual production branch has always been `master`, confirmed via `git branch`/`git status`; `ADR-OPS-008`'s CI example already correctly used `master`. Pre-launch checklist item 9 updated to also cover the `inactivity-warning` and `inactivity-deletion` cron jobs (S8.3), both confirmed complete and active alongside the original storage-cleanup job.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
