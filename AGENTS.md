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

<!-- BEGIN:documentation-rules -->

# Documentation — mandatory audit trail. No exceptions.

**Every change must be documented. This is not optional.**

This project requires a complete audit trail of all decisions, design changes, and product evolution. A change that is not documented did not happen as far as any future session, team member, or review is concerned.

## Document volatility tiers

Every project document carries a **Tier** in its header. The tier tells you how urgently it needs checking after any task.

| Tier  | Label             | Rule                                                                                                           |
| ----- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| **1** | Always check      | Review and update after every task that could affect it. These docs must reflect current reality at all times. |
| **2** | Check if relevant | Review when the task touches the domain this doc covers. Update if anything has changed.                       |
| **3** | Stable            | Only update if a formal decision was made or revised. Do not update for implementation changes.                |

## End-of-task documentation checklist

Before closing any task, work through this checklist in order:

**Step 1 — Tier 1 docs (always):**
Check every Tier 1 doc listed below. If the task affected it, update it before committing.

| Document                                                 | Update when                                                                                                                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`      | After every task — mark complete `[x]`, update summary table counts, update **Last updated** date, add a Notes entry for any deviation or significant decision                                 |
| `docs/Implementation Plan/CHANGELOG.md`                  | Any significant design decision, deviation from plan, or architectural change. **Always write new entries here — never to `CHANGELOG-ARCHIVE.md`** (archive covers Phase 0–4 and is read-only) |
| `docs/Technical Decision and Design/technical-design.md` | Any change to system architecture, data model, API contracts, or component design                                                                                                              |
| `docs/data-model.md`                                     | Any change to database schema, table definitions, field types, constraints, or entity relationships                                                                                            |
| `docs/PRD inputs/screen-requirements.md`                 | Any change to the content, fields, validation rules, or error states of any screen                                                                                                             |
| `docs/PRD inputs/acceptance-criteria.md`                 | Any change to functional requirements that alters what "done" looks like                                                                                                                       |

**Step 2 — Tier 2 docs (if relevant):**
Scan this list. Update any doc whose domain was touched by the task.

| Document                                          | Domain                                                                                                                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` | Approach for a future task changes — update the task spec                                                                                                              |
| `docs/Implementation Plan/ADR-TRACEABILITY.md`    | A GAP item is resolved — update Task column, change ⚠️ to ✅; update phase gate sign-off when a gate is passed                                                         |
| `docs/technology-stack.md`                        | Technology choices, libraries, services, or infrastructure                                                                                                             |
| `docs/non-functional-requirements.md`             | Performance targets, availability, scalability, security, browser support, accessibility                                                                               |
| `docs/moscow-feature-register.md`                 | Feature added, removed, promoted, or demoted between Must/Should/Could/Won't                                                                                           |
| `docs/information-architecture-and-navigation.md` | Page structure, navigation, routing, or information hierarchy                                                                                                          |
| `docs/target-funder-list.md`                      | Set of target grant-giving organisations or their classification                                                                                                       |
| `docs/Test Plans/TEST-DASHBOARD.md`               | After every funder test session — update funder row, summary counts, version, and document history. Also when a new funder test plan is created (add row in 🟡 status) |
| `docs/app-name-and-branding.md`                   | Product name, domain, branding, or tone decisions                                                                                                                      |
| `docs/constraints-and-assumptions.md`             | Budget, timeline, scope, or operating constraints change                                                                                                               |
| `docs/future-phases.md`                           | Items explicitly deferred to post-v1                                                                                                                                   |
| `docs/v1-out-of-scope.md`                         | Items confirmed out of scope for v1                                                                                                                                    |
| `docs/business-overview.md`                       | Product purpose, problem statement, or target audience                                                                                                                 |
| `docs/Business Design/` (DDR-\* files)            | UI design decisions, component specifications, or visual design changes — update or create the relevant DDR file; update `DESIGN-DECISIONS-INDEX.md`                   |
| `docs/PRD decisions/` (PDR-\* files)              | Product decisions on AI, data handling, features, or UI — update or create the relevant PDR file; update `PRD-DECISIONS-INDEX.md`                                      |
| `docs/legal/`                                     | Privacy policy, terms of service, data protection, or compliance documents                                                                                             |

**Step 3 — Tier 3 docs (only if a decision changed):**
These docs are stable. Only update if a formal business, product, or architectural decision was made or revised — not for implementation changes.

- `docs/decisions/` (DR-\* files) — business and product decisions; update `DECISIONS-INDEX.md`
- `docs/Technical Decision and Design/` (ADR-\* files) — architectural decisions; update `ADR-INDEX.md`
- `docs/vision-statement.md` — product vision
- `docs/user-personas-journeys-and-use-cases.md` — target users, goals, journeys
- `docs/BRD plus decisions Mark Two/` — business requirements

**Step 4 — When in doubt:**
If it is not obvious whether a doc needs updating, **stop and ask the user before proceeding**. The cost of a 30-second question is far lower than the cost of a lost decision reconstructed weeks later.

## What must always be documented

- Any new product or design decision — including research findings, funder lists, scope changes, or feature decisions — even if no code changes
- Any change to how the product works, looks, or behaves
- Any deviation from the implementation plan
- Any architectural decision, data model change, or API change
- Any resolved question or open issue that gets closed

## Adding a new document

When creating a new project document, add the following header block so it is immediately governed by the tier system:

```
**Tier:** [1 / 2 / 3]
**Volatility:** [High / Medium / Low]
**Update when:** [one-line trigger]
```

No change to AGENTS.md is required — the tier header makes the doc self-governing.

## Test plans — mandatory coverage rule

Every funder test plan in `docs/Test Plans/` must cover the **complete end-to-end flow** for each application — from login through to export. No step may be omitted on the assumption that it was tested previously or is not specific to that funder.

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

**Why:** Steps that appear generic may behave differently for different funders due to funder type, question count, or character/word limit handling. Testing them in context catches issues that a generic test would not.

<!-- END:documentation-rules -->

<!-- BEGIN:file-reference-rules -->

# File references and information search

The canonical source for all project files is the GitHub repository:
**https://github.com/RapidGlobe/grant-pathway**

When searching for or referencing project files:

1. **Use the GitHub repository as the default location for information search** — browse or fetch files from `https://github.com/RapidGlobe/grant-pathway` rather than navigating the local OneDrive file structure.
2. **Use relative paths in all file references** — always reference files relative to the repository root (e.g. `docs/Technical Decision and Design/ADR-AI-001-ai-provider.md`), never absolute Windows/OneDrive paths.
3. **Never expose the full OneDrive path** in responses, commit messages, or documentation. The local working directory is an implementation detail of the developer's machine, not a project reference.

<!-- END:file-reference-rules -->

<!-- BEGIN:github-commit-rules -->

# GitHub — Always commit and push after changes

After completing any task that modifies source files or documentation:

1. **Stage** only the files changed in that task (never `git add -A` or `git add .`).
2. **Commit** with a clear message summarising what changed and why.
3. **Push** to `origin master` immediately after committing.
4. This applies to all changes — code, components, documentation, changelogs, and design records.

**Why:** Multiple contributors may be working on this project. Every push ensures the latest code and documentation is available to all team members and is reflected in Vercel's production deployment.

<!-- END:github-commit-rules -->
