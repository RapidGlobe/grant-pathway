# AGENTS.md — Grant Pathway

This file governs how all contributors — human and AI — work on this codebase. Read it in full at the start of each session. Every rule here is mandatory; none are advisory.

**Sequence at a glance:**

| When                     | What                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| Before starting any task | Check Next.js docs for the relevant area → check ADR consequences |
| While working            | Use relative file paths; reference GitHub, not the local copy     |
| After every task         | Run the documentation tier checklist → commit and push            |

---

## Contents

0. [How to write responses in chat](#0-how-to-write-responses-in-chat) — always
1. [Next.js version warning](#1-nextjs-version-warning) — pre-task
2. [ADR consequences check](#2-adr-consequences--mandatory-pre-task-check) — pre-task
3. [Documentation — tier system and checklist](#3-documentation--mandatory-audit-trail) — post-task
4. [File references and information search](#4-file-references-and-information-search) — during task
5. [GitHub — commit and push](#5-github--always-commit-and-push-after-changes) — post-task

---

## 0. How to write responses in chat

**Keep replies short, plain-English and action-first.** Lead with what needs doing. Leave out technical history, evidence trails and reasoning unless asked — long replies cost tokens and bury the decision.

The detail still gets written down: it belongs in the changelog, the ADR or the runbook, not in the chat reply. Say "recorded in X" and move on.

Findings are the exception to brevity in one respect only: a real problem is always stated plainly, in a sentence or two. Being brief never means leaving something out.

**Why:** the project owner is not a developer and skims replies while making decisions across a large document set. Asked for on 2026-08-15 and again on 2026-08-19: _"What needs doing, is what I am interested in. I don't need the full technical history."_

---

## 1. Next.js version warning

**This is NOT the Next.js you know.** This version has breaking changes — APIs, conventions, and file structure may differ from your training data.

Before writing any Next.js code, identify the area you are working in and read the corresponding guide in `node_modules/next/dist/docs/` before touching any code:

| Area                                 | Where to look                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Routing, layouts, pages              | `01-app/01-getting-started/03-layouts-and-pages.md`, `01-app/03-api-reference/03-file-conventions/`  |
| Server Components and Server Actions | `01-app/01-getting-started/05-server-and-client-components.md`, `01-app/02-guides/server-actions.md` |
| Data fetching and mutations          | `01-app/01-getting-started/06-fetching-data.md`, `01-app/01-getting-started/07-mutating-data.md`     |
| Caching and revalidation             | `01-app/01-getting-started/08-caching.md`, `01-app/01-getting-started/09-revalidating.md`            |
| **Proxy** (formerly Middleware)      | `01-app/01-getting-started/16-proxy.md`, `01-app/03-api-reference/03-file-conventions/proxy.md`      |
| API routes (Route Handlers)          | `01-app/01-getting-started/15-route-handlers.md`                                                     |
| Configuration (`next.config.ts`)     | `01-app/03-api-reference/05-config/01-next-config-js/`                                               |

Paths are relative to `node_modules/next/dist/docs/`. The two top-level directories that matter are `01-app/` (App Router — this project) and `02-pages/` (Pages Router — **not** used here; do not read from it).

**As of Next.js 16, Middleware is renamed to Proxy.** The `middleware` file convention is deprecated. This codebase still uses `middleware.ts`, which has not yet been migrated — see the note in `docs/Implementation Plan/CHANGELOG.md` (2026-07-29). Read the Proxy docs, not your training data's Middleware docs, when working in that file.

Heed all deprecation notices. If the guide contradicts your training data, the guide wins.

**If the whole `node_modules/next/dist/docs/` tree appears to be missing,** check whether you are in a git worktree (`.claude/worktrees/…`) before concluding anything. Worktrees do not get their own `node_modules` — the docs live in the main checkout's copy, and the paths in the table below resolve correctly there. Read them from the main checkout; do not skip the check, and do not "correct" the table, which is not wrong in this case. Noted 2026-08-06, after a worktree session found the tree absent and had to establish that the paths were fine.

**If an individual path above does not exist,** list the directory and find the current location rather than skipping this check — Next.js reorganises its documentation tree between versions. Then correct the table here so the next session does not repeat the search. These paths were wrong from the project's start until 2026-07-29 (they pointed at a non-existent `app-router/` tree), which made this check unenforceable for months; the whole point of the rule is that it actually runs.

**Why:** Next.js App Router introduced breaking changes from the Pages Router. Code written from training data alone has repeatedly introduced subtle bugs and deprecated patterns into this codebase.

---

## 2. ADR Consequences — Mandatory pre-task check

Every ADR in `docs/Technical Decision and Design/` has a **Consequences** section listing concrete actions that must be implemented. These are binding requirements, not suggestions.

Before starting any implementation task:

1. **Identify every ADR relevant to the task area.** Read the full Consequences section of each one.
2. **For each consequence bullet, confirm there is a specific step in the current task that covers it.** If not, add the step before writing any code.
3. **Before starting a new Phase, do a full ADR consequences sweep.** Walk all ADRs. For every consequence without a covering task, add one to the implementation plan and document the sign-off in `IMPLEMENTATION-STATUS.md` before the first task of the new phase begins.
4. **This rule applies to all phases.** It cannot be skipped even if the task seems straightforward.

**Why:** Implementation tasks are written feature-first ("what does the app need to run?"). ADR consequences are spec-first ("what does the architecture require?"). Without an explicit check, the gap is invisible until something breaks. Past omissions — missing `word_limit` column, missing `@axe-core/react`, missing `/api/health`, missing Sentry `beforeSend` on edge config, session cookies lost on redirect — all traced back to this check being skipped.

---

## 3. Documentation — Mandatory audit trail

**Every change must be documented. This is not optional.**

A change that is not documented did not happen as far as any future session, team member, or review is concerned.

### Document volatility tiers

Every project document carries a **Tier** in its header. The tier tells you how urgently it needs checking after any task.

| Tier  | Label             | Rule                                                                                                           |
| ----- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| **1** | Always check      | Review and update after every task that could affect it. These docs must reflect current reality at all times. |
| **2** | Check if relevant | Review when the task touches the domain this doc covers. Update if anything has changed.                       |
| **3** | Stable            | Only update if a formal decision was made or revised. Do not update for implementation changes.                |

### End-of-task documentation checklist

Before closing any task, work through this checklist in order:

**Step 1 — Tier 1 docs (always):**
Check every Tier 1 doc below. If the task affected it, update it before committing.

| Document                                                 | Update when                                                                                                                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`      | After every task — mark complete `[x]`, update summary table counts, update **Last updated** date, add a Notes entry for any deviation or significant decision                                 |
| `docs/Implementation Plan/CHANGELOG.md`                  | Any significant design decision, deviation from plan, or architectural change. **Always write new entries here — never to `CHANGELOG-ARCHIVE.md`** (archive covers Phase 0–4 and is read-only) |
| `docs/Technical Decision and Design/technical-design.md` | Any change to system architecture, data model, API contracts, or component design                                                                                                              |
| `docs/data-model.md`                                     | Any change to database schema, table definitions, field types, constraints, or entity relationships                                                                                            |
| `docs/PRD-Grant-Pathway.md` (Section 7)                  | Any change to the content, fields, validation rules, or error states of any screen (merged in from the retired `screen-requirements.md`, 2026-07-13)                                           |
| `docs/PRD inputs/acceptance-criteria.md`                 | Any change to functional requirements that alters what "done" looks like                                                                                                                       |

**Step 2 — Tier 2 docs (if relevant):**
Scan this list. Update any doc whose domain was touched by the task.

| Document                                                 | Domain                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/Implementation Plan/IMPLEMENTATION-PLAN.md`        | Approach for a future task changes — update the task spec                                                                                                                                                                                                                                                                                                                                                                                             |
| `docs/Implementation Plan/ADR-TRACEABILITY.md`           | A GAP item is resolved — update Task column, change ⚠️ to ✅; update phase gate sign-off when a gate is passed                                                                                                                                                                                                                                                                                                                                        |
| `docs/Technical Decision and Design/technology-stack.md` | Technology choices, libraries, services, or infrastructure                                                                                                                                                                                                                                                                                                                                                                                            |
| `docs/non-functional-requirements.md`                    | Performance targets, availability, scalability, security, browser support, accessibility                                                                                                                                                                                                                                                                                                                                                              |
| `docs/moscow-feature-register.md`                        | Feature added, removed, promoted, or demoted between Must/Should/Could/Won't. **Before closing out a withdrawal or promotion, grep the live `IMPLEMENTATION-PLAN.md`/`IMPLEMENTATION-STATUS.md` task list for the same concept** (by name or synonym) and reconcile any overlap — a 2026-07-13 incident found FR-46 withdrawn in this register without checking that `ADR-DATA-006`'s P6.6 task specified the same disproven premise six days earlier |
| `docs/information-architecture-and-navigation.md`        | Page structure, navigation, routing, or information hierarchy                                                                                                                                                                                                                                                                                                                                                                                         |
| `docs/target-funder-list.md`                             | Set of target grant-giving organisations or their classification                                                                                                                                                                                                                                                                                                                                                                                      |
| `docs/Test Plans/TEST-DASHBOARD.md`                      | After every funder test session — update funder row, summary counts, version, and document history. Also when a new funder test plan is created (add row in 🟡 status)                                                                                                                                                                                                                                                                                |
| `docs/app-name-and-branding.md`                          | Product name, domain, branding, or tone decisions                                                                                                                                                                                                                                                                                                                                                                                                     |
| `docs/constraints-and-assumptions.md`                    | Budget, timeline, scope, or operating constraints change                                                                                                                                                                                                                                                                                                                                                                                              |
| `docs/future-phases.md`                                  | Items explicitly deferred to post-v1                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `docs/v1-out-of-scope.md`                                | Items confirmed out of scope for v1                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `docs/business-overview.md`                              | Product purpose, problem statement, or target audience                                                                                                                                                                                                                                                                                                                                                                                                |
| `docs/Business Design/` (DDR-\* files)                   | UI design decisions, component specifications, or visual design changes — update or create the relevant DDR file; update `DESIGN-DECISIONS-INDEX.md`                                                                                                                                                                                                                                                                                                  |
| `docs/PRD decisions/` (PDR-\* files)                     | Product decisions on AI, data handling, features, or UI — update or create the relevant PDR file; update `PRD-DECISIONS-INDEX.md`                                                                                                                                                                                                                                                                                                                     |
| `docs/legal/`                                            | Privacy policy, terms of service, data protection, or compliance documents — **and any change to the set of third-party services the product uses. See the service-change trigger below; that is the case this row keeps missing.**                                                                                                                                                                                                                   |

**Step 2a — The service-change trigger (added 2026-08-17, `GAP-112`):**

**If this task added, removed, replaced or reconfigured any third-party service, you must check the privacy policy's processor table before closing the task.** A "third-party service" means anything the running product sends data to or receives data from — a new dependency with a hosted component, a log drain, a queue, a cache, an analytics or monitoring tool, an email sender, a database, an AI provider. It does **not** mean a build-time-only dev dependency.

Three files, in this order:

1. `docs/legal/privacy-policy-external.md` — Section 5's processor table, Section 6's transfer analysis, Section 7's retention table. **This is the file the live `/privacy` page renders**, so it is the published document.
2. `docs/legal/privacy-policy.md` — the internal copy. Same body, plus the `Change from vX.X` blocks. **Mirror the same edit and add a change block.**
3. `docs/legal/pdf/` — the generated PDF and `.docx` go stale on any policy change.

For each service, the table needs four things, and each must be **read from the vendor's DPA or terms, not from its console**: what personal data it receives, where that data is processed, how long it is kept, and under what transfer safeguard.

⚠️ **A vendor console shows infrastructure; a DPA states processing. Where they disagree, the DPA governs.** This is not a hypothetical: on 2026-08-15 Resend's console showed an Irish sending region, which was read as a processing location and raised as a discrepancy against the policy (`GAP-102`). Resend's DPA states processing is in the United States and all 22 of its sub-processors are US entities. The policy had been right, the finding was wrong, and acting on it would have published a **less** accurate document than the one it replaced.

**Why this exists.** The processor table was written once, reviewed by an independent solicitor at `P5.1`, and drifted from the stack from that day on. Four findings arrived in two days — `GAP-109` (Upstash absent while storing email addresses), Axiom (connected 2026-08-16 and missing from the table the same day, by a session that had this file open), `GAP-111` (one cookie declared, three set), `GAP-110` (Vercel described as US-hosted when execution is in London). New services reliably get an ADR, a `technology-stack.md` entry and environment variables. **None of those routes reaches `docs/legal/`.** The Tier 2 row above named `docs/legal/` all along and did not fire, because adding a dependency does not feel like editing a legal document — which is why this trigger is phrased around **the act of adding a service** instead.

**The economics are the argument.** Each omission is individually small, and they accumulate against a solicitor-reviewed document that costs a fee to have re-reviewed. On 2026-08-17 WJ declined a further review for that reason. **This check is cheaper than the reviews it avoids.**

**Step 3 — Tier 3 docs (only if a decision changed):**
These docs are stable. Only update if a formal business, product, or architectural decision was made or revised — not for implementation changes.

- `docs/decisions/` (DR-\* files) — business and product decisions; update `DECISIONS-INDEX.md`
- `docs/Technical Decision and Design/` (ADR-\* files) — architectural decisions; update `ADR-INDEX.md`
- `docs/vision-statement.md` — product vision
- `docs/user-personas-journeys-and-use-cases.md` — target users, goals, journeys
- `docs/BRD plus decisions Mark Two/` — business requirements

**Step 4 — When in doubt:**
If it is not obvious whether a doc needs updating, **stop and ask the user before proceeding**. The cost of a 30-second question is far lower than the cost of a lost decision reconstructed weeks later.

### What must always be documented

- Any new product or design decision — including research findings, funder lists, scope changes, or feature decisions — even if no code changes
- Any change to how the product works, looks, or behaves
- Any deviation from the implementation plan
- Any architectural decision, data model change, or API change
- Any resolved question or open issue that gets closed

### Adding a new document

When creating a new project document, add the following header block so it is immediately governed by the tier system:

```
**Tier:** [1 / 2 / 3]
**Volatility:** [High / Medium / Low]
**Update when:** [one-line trigger]
```

No change to AGENTS.md is required — the tier header makes the doc self-governing.

### Test plans — mandatory coverage rule

As of `DR-TEST-001` (2026-07-24), `docs/Test Plans/` is organised in layers rather than one plan per named funder — see `TEST-DASHBOARD.md` for the current structure (mechanical regression, two flagship end-to-end plans, a guideline-shape/capability matrix, a dedicated eligibility plan, and a UI/accessibility plan for cross-cutting concerns like `PDR-UI-008`'s help centre link and contextual tooltips). This reflects the product no longer varying its behaviour by funder identity (`DR-FD-001` v1.4) — the axis worth testing is guideline shape and capability, not funder name. Horizontal UI features that touch many routes at once (tooltips, nav, help links) get their own plan rather than being folded into the flagships, which stay scoped to the funder-flow-specific coverage in the list below.

**Full end-to-end coverage — from login through to export, no step omitted** — remains mandatory for:

- The two flagship plans (`AB-Charitable-Trust-test-plan.md`, `MK-Community-Foundation-test-plan.md`)
- At least one path through `guideline-capability-matrix-test-plan.md`

Minimum required steps for a full end-to-end run:

1. Account registration (or login for returning test user)
2. Charity profile setup or verification
3. Application details — funder and grant name entry (Step 1, free text)
4. Guidelines upload or paste (Step 2)
5. AI summary generation — including recording the time taken (Step 3)
6. "Before you begin writing" preparation checklist confirmation (Step 4 gate)
7. Q&A writing interface — at least one narrative answer written, AI-assisted, and approved (Step 4)
8. Export as Word document (Step 5)
9. Any capability- or shape-specific checks relevant to that plan (word/character limit type, non-narrative filtering, citation coverage, etc.)

**Individual capability-matrix or eligibility-plan cases may share a pre-seeded account** rather than re-registering each time, matching the pattern `regression-test-plan.md` already uses (RT-01a is the only case that exercises fresh registration; the rest reuse the seeded account). These cases exist to test a specific extraction/eligibility behaviour, not to re-prove account/profile mechanics that the flagships and `regression-test-plan.md` already cover.

**Why:** Steps that appear generic may still behave differently depending on guideline shape, extraction path, or limit-handling — testing them in context catches issues a generic test would not. Full coverage is concentrated in the two flagships (and at least one matrix path) rather than repeated across many near-identical funder plans, because the previous funder-by-funder structure caused real, repeated drift (the funder-picker removal and the eligibility hard-stop's structural conflict with full-flow coverage — see `DR-TEST-001` — both went undetected across multiple plans before being caught).

---

## 4. File references and information search

The canonical source for all project files is the GitHub repository:
**https://github.com/RapidGlobe/grant-pathway**

When searching for or referencing project files:

1. **Use the GitHub repository as the default location for information search** — browse or fetch files from `https://github.com/RapidGlobe/grant-pathway` rather than navigating the local working copy's directory structure.
2. **Use relative paths in all file references** — always reference files relative to the repository root (e.g. `docs/Technical Decision and Design/ADR-AI-001-ai-provider.md`), never absolute Windows paths.
3. **Never expose the full local path** of the working copy in responses, commit messages, or documentation. Where the clone happens to sit is an implementation detail of the developer's machine, not a project reference.

**Why:** The local path is machine-specific and will differ between contributors. GitHub paths are stable, version-controlled, and work for all team members and future sessions.

This rule is deliberately worded without naming any particular location. Until 2026-07-31 the working copy lived inside OneDrive and these three points said so, which made the rule read as "avoid OneDrive" rather than "avoid absolute local paths" — the clone has since moved out of OneDrive, and the rule applies unchanged wherever it sits next.

---

## 5. GitHub — Always commit and push after changes

After completing any task that modifies source files or documentation:

1. **Stage** only the files changed in that task (never `git add -A` or `git add .`).
2. **Commit** with a clear message summarising what changed and why.
3. **Push** to `origin master` immediately after committing.
4. This applies to all changes — code, components, documentation, changelogs, and design records.

**Why:** Multiple contributors may be working on this project. Every push ensures the latest code and documentation is available to all team members and is reflected in Vercel's production deployment.

### Prettier — files copied from outside the repository

The pre-commit hook (lint-staged) only runs Prettier on files it recognises by extension that are **staged within the repo**. It does not catch files that were written directly from external sources (scratchpad output, artifact exports, downloaded files, generated HTML) without going through the normal edit workflow.

The CI `format:check` job runs `prettier --check .` across the entire repository and **will** catch these files. To prevent a CI failure:

**Before committing any file that originated outside the repository**, run:

```bash
npx prettier --write <path-to-file>
```

Then stage the formatted version and commit as normal.

**Affected file types most likely to trigger this:** `.html`, `.md`, `.json`, `.ts`, `.tsx` files that were copied, pasted, or generated rather than edited in-place.

**Past incidents:** CI lint-and-typecheck failed twice (2026-06-30) on `docs/Business Design/dashboard-sketch-2026-06-30.html`, which was copied from a scratchpad without being formatted first.
