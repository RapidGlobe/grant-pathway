---
id: ADR-OPS-008
category: Operations
status: Implemented — 2026-06-05
---

# ADR-OPS-008 — Linting and Code Quality Infrastructure

## Context

Grant Pathway is developed using AI-assisted coding. As the article "Linting: Engineering for Vibe Coders" (Alan Knox, 2026) identifies, AI-generated code varies significantly across prompts and sessions — naming conventions, async patterns, error handling, and typing all drift without enforcement. Small inconsistencies compound quietly; by the time they become visible they are expensive to fix.

An audit of the project's current linting setup (2026-06-04) found the following gaps:

| Area                      | Current state                                                                |
| ------------------------- | ---------------------------------------------------------------------------- |
| ESLint                    | Present — flat config with `next/core-web-vitals` + `next/typescript` only   |
| Prettier                  | Not installed — no formatting enforcer                                       |
| Pre-commit hooks          | None — code can be committed without any automated check                     |
| CI lint gate              | None — no GitHub Actions workflows                                           |
| `lint` script             | `eslint` with no path and no `--max-warnings 0`; warnings silently swallowed |
| `type-check` script       | Missing — TypeScript errors not separately runnable                          |
| TypeScript advanced flags | `strict: true` only; `noUncheckedIndexedAccess`, `noImplicitReturns` not set |
| Build-time lint           | Active — `next build` runs ESLint and fails on errors (good)                 |

The absence of pre-commit hooks is the most critical gap: every AI-generated commit enters the repository unchecked.

## Options Considered

**Option A — Minimal: fix the `lint` script only**

- Add `--max-warnings 0` and a target path. No other changes.
- Weaknesses: No formatting enforcer, no pre-commit gate, no CI. Relies entirely on developer discipline.

**Option B — ESLint + Prettier only (no hooks or CI)**

- Install Prettier, wire it to ESLint, fix scripts.
- Weaknesses: Still relies on manual `npm run lint` before every commit. One forgotten run means unchecked code.

**Option C — Full stack: Prettier + pre-commit hooks + CI + TypeScript tightening**

- ESLint + Prettier with conflict resolution (`eslint-config-prettier`).
- Husky + lint-staged for pre-commit automation.
- GitHub Actions CI for lint + format-check + type-check on every push.
- TypeScript additional strictness flags.
- Strengths: Completely automated. No developer discipline required. Fast (lint-staged only processes changed files; typical pre-commit run is 2–5 seconds).

## Decision

**Option C — Full linting and code quality stack, implemented in four phases.**

The goal is a fully automated pipeline where inconsistencies are caught at the earliest possible moment: at commit time, not at build time or in code review.

---

## Implementation Plan

### Phase 1 — Scripts and Prettier (estimated: 30 minutes)

**Packages to install:**

```bash
npm install --save-dev prettier eslint-config-prettier
```

**`.prettierrc` configuration:**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": []
}
```

**`.prettierignore`:**

```
.next/
out/
build/
node_modules/
public/
*.lock
```

**`eslint.config.mjs` — add Prettier conflict resolution:**

```js
import prettierConfig from 'eslint-config-prettier'
// Add prettierConfig to the config array (last, so it overrides style rules)
```

**`package.json` scripts — replace/add:**

```json
"lint": "eslint . --max-warnings 0",
"lint:fix": "eslint . --fix",
"format": "prettier --write .",
"format:check": "prettier --check .",
"type-check": "tsc --noEmit"
```

---

### Phase 2 — Pre-commit Hooks (estimated: 30 minutes)

**Packages to install:**

```bash
npm install --save-dev husky lint-staged
npx husky init
```

**`.husky/pre-commit`:**

```bash
npx lint-staged
```

**`lint-staged` config in `package.json`:**

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

**Result:** Every `git commit` automatically lints and formats only the staged files. No full project scan — typical run is 2–5 seconds.

---

### Phase 3 — GitHub Actions CI (estimated: 1 hour)

**File: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run format:check
```

**Result:** Every push to `master` and every PR shows a green ✅ or red ❌ on GitHub.

> **Correction (2026-07-29, Opus audit M2/M4).** Two things above describe the plan rather than what was built. First, the snippet shows one job; `ci.yml` as built has **three** gating jobs — `lint-and-typecheck`, `test` and `validate-migrations` — plus a non-gating `security-audit.yml` (the dependency scan, split out because an unfixable devDependency advisory held it permanently red and masked genuine failures) and a scheduled `schema-drift-check.yml`. See `technology-stack.md` TS-08 for the current picture. Second, "before Vercel begins its build" was never true: Vercel deploys on push independently of and in parallel with CI, so a red run has never blocked a deployment. Whether to make that gate real is an open decision recorded in `DEPLOYMENT-CHECKLIST.md`. The `node-version` in the snippet was also updated from `'20'` to `'24'` to match the live workflows — Node 20 reached end-of-life on 30 April 2026, and Vercel runs 24.x. The decision this ADR records is unchanged; only these factual details were stale.

---

### Phase 4 — TypeScript Tightening (estimated: 1–2 hours, review required)

Add to `tsconfig.json` `compilerOptions`:

```json
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true
```

**Evaluate (may surface existing issues requiring fixes):**

```json
"noUncheckedIndexedAccess": true
```

`noImplicitReturns` and `noFallthroughCasesInSwitch` are low risk. `noUncheckedIndexedAccess` adds `| undefined` to all index signatures and may require targeted fixes — should be a separate session after Phases 1–3 are stable.

---

## Rationale

- **Prettier** eliminates formatting inconsistency across AI-generated sessions. It is opinionated by design — no decisions required.
- **Husky + lint-staged** catches issues at the earliest possible moment (commit time) without slowing down development. Processing only staged files keeps the hook fast.
- **GitHub Actions** provides an independent gate that does not depend on Vercel. Catches formatting and type errors that Vercel's `next build` would not.
- **`--max-warnings 0`** ensures warnings are treated as actionable signals, consistent with the project's approach to defects.
- **`eslint-config-prettier`** prevents ESLint and Prettier from fighting over formatting — Prettier wins on all style rules.

## Consequences

- Phase 1 must be completed before Phase 2 (hooks run the scripts).
- Phases 1 and 2 have zero risk — they add tooling without changing any application code.
- Phase 3 requires a `.github/workflows/` directory to be created (currently absent).
- Phase 4 may surface TypeScript issues in existing code — treat these as bugs to be fixed, not obstacles to be suppressed.
- After Phase 2, `git commit` will fail if staged files have lint errors. This is the intended behaviour.
- The existing Vercel build-time ESLint check is retained as a final backstop.

## Source

- Audit findings: 2026-06-04 linting audit of `grant-pathway` project
- Reference: Alan Knox, "Linting: Engineering for Vibe Coders" (alanknox.com/linting-engineering-for-vibe-coders/)
- Related: ADR-OPS-006 (Accessibility Testing), ADR-OPS-002 (Deployment Strategy)

## Date Decided

2026-06-04

## Implementation scheduled

2026-06-05
