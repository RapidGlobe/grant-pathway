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

<!-- BEGIN:github-commit-rules -->
# GitHub — Always commit and push after changes

After completing any task that modifies source files or documentation:

1. **Stage** only the files changed in that task (never `git add -A` or `git add .`).
2. **Commit** with a clear message summarising what changed and why.
3. **Push** to `origin master` immediately after committing.
4. This applies to all changes — code, components, documentation, changelogs, and design records.

**Why:** Multiple contributors may be working on this project. Every push ensures the latest code and documentation is available to all team members and is reflected in Vercel's production deployment.
<!-- END:github-commit-rules -->
