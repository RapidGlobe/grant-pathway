<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:adr-consequences-rules -->

# ADR Consequences — Mandatory pre-task check

Every ADR has a **Consequences** section listing concrete actions that must be implemented. These are binding requirements, not suggestions. Omissions found in Phase 0–3 (missing `word_limit` column, missing `@axe-core/react`, missing `/api/health` task, missing Sentry `beforeSend` on edge config, session cookies lost on redirect) all traced back to ADR consequences not being walked through before implementation.

Before starting any implementation task:

1. **Identify every ADR relevant to that task area.** Read the full Consequences section of each one.
2. **For each consequence bullet, confirm there is a specific step in the current task that covers it.** If there is not, add the step before writing any code.
3. **Before starting a new Phase, do a full ADR consequences sweep.** Walk all ADRs in `docs/Technical Decision and Design/`. For every consequence that does not map to a completed or planned task, add a task to the implementation plan. Get this sign-off documented in `IMPLEMENTATION-STATUS.md` before the first task of the new phase begins.
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

Use the table below to identify the right document(s) for every change. Multiple documents may need updating for a single change — work through the full list.

### Implementation Plan documents (`docs/Implementation Plan/`)

| Document                   | Update when                                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IMPLEMENTATION-STATUS.md` | After every task — mark complete `[x]`, update summary table counts, update **Last updated** date, add a Notes entry for any deviation or significant decision |
| `CHANGELOG.md`             | Any significant design decision, deviation from the original plan, or architectural change that a team member would need context for                           |
| `ADR-TRACEABILITY.md`      | When a GAP item is resolved — update the Task column and change status from ⚠️ to ✅; also update the phase gate sign-off table when a gate is passed          |
| `IMPLEMENTATION-PLAN.md`   | When the approach for a future task changes during implementation — update the task spec so it reflects current intent                                         |

### Product and design documents (`docs/`)

| Document                                                 | Update when                                                                                                                                                                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/` (DR-\* files)                          | Any business or product decision is made or revised — create a new DR file or update the relevant existing one; update `DECISIONS-INDEX.md`                                                                                                                      |
| `docs/Technical Decision and Design/` (ADR-\* files)     | Any architectural or technical decision is made or revised — create a new ADR file or update the relevant existing one; update `ADR-INDEX.md`                                                                                                                    |
| `docs/Technical Decision and Design/technical-design.md` | Any change to system architecture, data model, API contracts, or component design                                                                                                                                                                                |
| `docs/user-personas-journeys-and-use-cases.md`           | Any change to target users, user goals, pain points, journeys, or use cases                                                                                                                                                                                      |
| `docs/information-architecture-and-navigation.md`        | Any change to page structure, navigation, routing, or information hierarchy                                                                                                                                                                                      |
| `docs/moscow-feature-register.md`                        | Any feature added, removed, promoted, or demoted between Must/Should/Could/Won't                                                                                                                                                                                 |
| `docs/technology-stack.md`                               | Any change to the technology choices, libraries, services, or infrastructure (if applicable)                                                                                                                                                                     |
| `docs/test-plan-e2e-slices-4-8.md`                       | Any change to test coverage, E2E slice scope, or acceptance criteria that affects the test plan (if applicable)                                                                                                                                                  |
| `docs/target-funder-list.md`                             | Any change to the set of target grant-giving organisations or their classification                                                                                                                                                                               |
| `docs/Test Plans/TEST-DASHBOARD.md`                      | After every funder test session — update the funder row (passed/failed counts, RAG status, notes), update the summary counts, bump the version, and add a document history entry. Also update when a new funder test plan is created (add the row in 🟡 status). |
| `docs/data-model.md`                                     | Any change to the database schema, table definitions, field types, constraints, or entity relationships                                                                                                                                                          |
| `docs/PRD inputs/screen-requirements.md`                 | Any change to the content, fields, validation rules, or error states of any screen                                                                                                                                                                               |
| `docs/PRD inputs/acceptance-criteria.md`                 | Any change to functional requirements that alters what "done" looks like — revised requirements, new edge cases, or new acceptance criteria                                                                                                                      |
| `docs/non-functional-requirements.md`                    | Any change to performance targets, availability, scalability, security, browser support, or accessibility testing approach — update the relevant NFR row and bump the Last updated date                                                                          |

## Test plans — mandatory coverage rule

Every funder test plan in `docs/Test Plans/` must cover the **complete end-to-end flow** for each application — from login through to export. No step may be omitted on the assumption that it was tested previously or is not specific to that funder. Every step must be verified in the context of the specific funder being tested.

The minimum required steps for every funder test plan are:

1. Account registration (or login for returning test user)
2. Charity profile setup or verification
3. Funder selection from the picker (Step 1)
4. Grant name entry (Step 1)
5. Guidelines upload or paste (Step 2)
6. AI summary generation — including recording the time taken (Step 3)
7. "Before you begin writing" preparation checklist confirmation (Step 4 gate)
8. Q&A writing interface — at least one narrative answer written, AI-assisted, and approved (Step 4)
9. Export as Word document (Step 5)
10. Any funder-specific tests relevant to that organisation's question set, format, or eligibility criteria

**Why:** Steps that appear generic (e.g. the preparation checklist, the progress bar, the export) may behave differently for different funders due to funder type, question count, or character/word limit handling. Testing them in context catches issues that a generic test would not.

## When in doubt — ask before proceeding

If it is not obvious where a decision or change should be documented, **stop and ask the user before proceeding**. Do not proceed on the assumption that it will be captured later. The cost of a 30-second question is far lower than the cost of a lost decision that has to be reconstructed weeks later.

**Why this matters:** Teammates and future AI sessions rely on these documents to understand the current state of the project. An update missed here means someone works from stale information. The changelog in particular captures _why_ decisions were made — that context is lost if it is not recorded at the time.

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
