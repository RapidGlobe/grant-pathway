<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:phase1-approval-rules -->
# Phase 1 — Mandatory stop-and-approve workflow

When working on any Phase 1 task (P1.1 through P1.15):

1. **Complete one task at a time.** Do not start the next task until explicitly told to proceed.
2. **After completing each task**, do all of the following before stopping:
   - Update `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`: mark the task `[x]`, update its row in the Summary table (Done: 0 → 1, Status: Not started → ✅ Complete), and update the **Last updated** date.
   - Update the Phase 1 sub-total row in the Summary table to reflect the new Done count.
   - Report to the user: what was built, any deviations from the plan, and anything that needs attention.
3. **Wait for explicit approval** ("continue", "proceed", "go ahead", or similar) before starting the next task. Do not assume approval.
4. This rule applies even if the next task seems straightforward.
<!-- END:phase1-approval-rules -->

<!-- BEGIN:adr-consequences-rules -->
# ADR Consequences — Mandatory pre-task check

Every ADR has a **Consequences** section listing concrete actions that must be implemented. These are binding requirements, not suggestions. Omissions found in Phase 0–3 (missing `word_limit` column, missing `@axe-core/react`, missing `/api/health` task, missing Sentry `beforeSend` on edge config, session cookies lost on redirect) all traced back to ADR consequences not being walked through before implementation.

Before starting any implementation task:

1. **Identify every ADR relevant to that task area.** Read the full Consequences section of each one.
2. **For each consequence bullet, confirm there is a specific step in the current task that covers it.** If there is not, add the step before writing any code.
3. **Before starting a new Phase, do a full ADR consequences sweep.** Walk all 42 ADRs. For every consequence that does not map to a completed or planned task, add a task to the implementation plan. Get this sign-off documented in `IMPLEMENTATION-STATUS.md` before the first task of the new phase begins.
4. **This rule applies to all phases going forward.** It is not optional and cannot be skipped even if the task seems straightforward.

**Why this rule exists:** Implementation tasks are written feature-first ("what does the app need to run?"). ADR consequences are spec-first ("what does the architecture require?"). Without an explicit check, the gap between the two is invisible until something breaks or a compliance review finds it after the fact.
<!-- END:adr-consequences-rules -->

<!-- BEGIN:implementation-docs-rules -->
# Documentation — mandatory audit trail. No exceptions.

**Every change must be documented. This is not optional.**

This project requires a complete audit trail of all decisions, design changes, and product evolution. A change that is not documented did not happen as far as any future session, team member, or review is concerned. Missing documentation has already caused rework (e.g. the consolidated funder list that was researched but never written down, 2026-05-29). Do not let this happen again.

## What must be documented

- Any new product or design decision, including research findings, funder lists, scope changes, or feature decisions — even if no code changes
- Any change to how the product works, looks, or behaves
- Any deviation from the implementation plan
- Any architectural decision, data model change, or API change
- Any resolved question or open issue that gets closed

## Where to document it

All implementation documentation lives in `docs/Implementation Plan/`. After completing any task, check each of the four documents in that folder and update as appropriate:

| Document | Update when |
|----------|-------------|
| `IMPLEMENTATION-STATUS.md` | After every task — mark complete `[x]`, update summary table counts, update **Last updated** date, add a Notes entry for any deviation or significant decision |
| `CHANGELOG.md` | Any significant design decision, deviation from the original plan, or architectural change that a team member would need context for |
| `ADR-TRACEABILITY.md` | When a GAP item is resolved — update the Task column and change status from ⚠️ to ✅; also update the phase gate sign-off table when a gate is passed |
| `IMPLEMENTATION-PLAN.md` | When the approach for a future task changes during implementation — update the task spec so it reflects current intent |

For product-level decisions (funder lists, feature scope, personas, UX research findings), create or update the relevant file in `docs/` directly. If no suitable file exists, create one and cross-reference it from the CHANGELOG.

## When in doubt — ask before proceeding

If it is not obvious where a decision or change should be documented, **stop and ask the user before proceeding**. Do not proceed on the assumption that it will be captured later. The cost of a 30-second question is far lower than the cost of a lost decision that has to be reconstructed weeks later.

**The rule:** One folder, one check. After any task, open `docs/Implementation Plan/` mentally and ask: does each of these four documents reflect what just happened? If not, update before committing.

**Why this matters:** Teammates and future AI sessions rely on these documents to understand the current state of the project. An update missed here means someone works from stale information. The changelog in particular captures *why* decisions were made — that context is lost if it is not recorded at the time.
<!-- END:implementation-docs-rules -->

<!-- BEGIN:github-commit-rules -->
# GitHub — Always commit and push after changes

After completing any task that modifies source files or documentation:

1. **Stage** only the files changed in that task (never `git add -A` or `git add .`).
2. **Commit** with a clear message summarising what changed and why.
3. **Push** to `origin master` immediately after committing.
4. This applies to all changes — code, components, documentation, changelogs, and design records.

**Why:** Multiple contributors may be working on this project. Every push ensures the latest code and documentation is available to all team members and is reflected in Vercel's production deployment.
<!-- END:github-commit-rules -->
