# Plan of Action — Linting

**Source article:** [Linting: Engineering for Vibe Coders — Alan Knox](https://alanknox.com/linting-engineering-for-vibe-coders/)
**Reviewed:** 2026-06-05
**Completed:** 2026-06-05
**ADR:** `docs/Technical Decision and Design/ADR-OPS-008-linting-and-code-quality.md`

---

## Why this mattered for Grant Pathway

Grant Pathway is built with significant AI assistance. Alan Knox's core observation is directly applicable: AI-generated code varies significantly between prompts, files, and sessions, so without an automated feedback loop, inconsistencies accumulate faster than any manual review can catch them. The pre-existing `lint` script in `package.json` was targeting no files and running with no `--max-warnings 0` flag — it was silently doing nothing. Every AI-generated commit was going in unchecked.

---

## Steps completed

### Phase 1 — Prettier formatting and ESLint baseline

**Knox principle addressed:** _Set up linting before inconsistent patterns spread; prioritise readability and consistency._

- Installed `prettier` and `eslint-config-prettier` as dev dependencies
- Created `.prettierrc` with project-wide style rules (no semicolons, single quotes, 2-space indent, trailing commas, 100-char print width)
- Created `.prettierignore` to exclude generated output directories (`.next/`, `build/`, `node_modules/`, `public/`, `*.lock`)
- Added `eslint-config-prettier` as the last entry in `eslint.config.mjs` so Prettier wins on all style rules
- Added `.vercel/**` to ESLint `globalIgnores` — generated build artefacts were being incorrectly linted
- Fixed the `lint` script: now targets `.` with `--max-warnings 0`, so any warning is treated as a failure
- Added `lint:fix`, `format`, `format:check`, and `type-check` scripts to `package.json`
- Downgraded ESLint from `^10` to `^9` — `eslint-config-next` bundles a plugin that calls a deprecated API removed in ESLint 10; ESLint 9 is the correct version for Next.js 16
- Applied a one-time Prettier pass across all 226 existing source files to establish a clean baseline
- Resolved 14 pre-existing lint issues across 4 source files (8 errors, 6 warnings): unused variables, stale `eslint-disable` comments, `react-hooks` violations. All suppressions are documented inline with a reason

### Phase 2 — Pre-commit hooks

**Knox principle addressed:** _Automate linting so it runs without requiring a conscious decision; catch generated code before it enters the repository._

- Installed `husky` and `lint-staged` as dev dependencies
- Configured `.husky/pre-commit` to run `npx lint-staged` on every commit
- Configured `lint-staged` in `package.json`:
  - `*.{ts,tsx}` — runs ESLint then Prettier
  - `*.{json,md,css}` — runs Prettier only
- Every commit now automatically formats and lints staged files before they are written to git history. A commit with a lint error will be rejected at the hook stage.

### Phase 3 — GitHub Actions CI pipeline

**Knox principle addressed:** _Treat warnings as signals; create a feedback loop that catches problems before they reach production._

- Created `.github/workflows/ci.yml`
- CI runs three checks on every push to `master` and every pull request targeting `master`:
  - `type-check` — TypeScript `tsc --noEmit`
  - `lint` — ESLint with `--max-warnings 0`
  - `format:check` — Prettier in check mode (fails if any file is not formatted)
- Vercel will not build a commit that fails CI, providing a hard gate before any code reaches production

### Phase 4 — TypeScript tightening

**Knox principle addressed:** _Prioritise rules that improve safety and clarity over purely stylistic preferences._

- Added `noImplicitReturns: true` to `tsconfig.json` — functions must explicitly return a value on all code paths; prevents silent `undefined` returns
- Added `noFallthroughCasesInSwitch: true` to `tsconfig.json` — prevents accidental fall-through in switch statements
- Both flags passed `tsc --noEmit` cleanly with zero new errors on the existing codebase
- `noUncheckedIndexedAccess` noted as a future tightening step — deferred because it may surface existing issues requiring targeted fixes across the codebase (see ADR-OPS-008)

---

## Limits acknowledged

Knox explicitly states that linting cannot guarantee good architecture or correct business logic. The steps above address code consistency and surface-level errors. Architectural decisions and business logic correctness remain the responsibility of the engineering and product review process — covered by ADR reviews, AGENTS.md, and funder test plans.

---

## Outstanding action

- `noUncheckedIndexedAccess` — defer to a future session once the codebase has stabilised post-launch. This flag will surface array/record access patterns that currently assume a value is always present, and will require targeted fixes.
