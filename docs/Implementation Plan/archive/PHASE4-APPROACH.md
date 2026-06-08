# Phase 4 — Approach to Vertical Slice Creation

**Created:** 2026-05-20
**Status:** Approved — gate signed off, Phase 4 may begin

---

## Context

Phase 3 is complete (12/12 tasks). The Phase 3→4 gate has been signed off. Phase 4 converts the static UI shell built in Phase 1 into a fully working application by wiring each feature to the real backend — one slice at a time, in user-journey order.

---

## The Core Idea: Wiring, Not Building From Scratch

The Phase 1 static UI shell already exists for every screen. Phase 4 does not rebuild pages — it replaces:

- Mock data → real Supabase queries
- Disabled buttons → real Server Actions and API routes
- Static loading states → real async flows
- Stub components → fully wired behaviour

Each slice results in a feature that works end-to-end in the browser.

---

## Slice Order (user journey sequence)

| Slice | Feature                      | Tasks                                                                                |
| ----- | ---------------------------- | ------------------------------------------------------------------------------------ |
| S0    | Authentication               | 6 — Registration, email verify, sign-in, password reset, session timeout, MFA opt-in |
| S1    | Charity Profile              | 4 — Charity Commission lookup, save, edit, incomplete banner                         |
| S2    | Dashboard & Applications     | 5 — App list, new/resume/delete, profile-complete gate                               |
| S3    | Step 1 — Application Details | 3 — New/edit app, step locking                                                       |
| S4    | Step 2 — File Upload         | 4 — Upload + paste paths, error states, orphan cleanup cron                          |
| S5    | Step 3 — AI Summary          | 4 — Prompt library, generate-summary route, error handler, display                   |
| S6    | Step 4 — Draft Answers       | 4 — Questions populated, generate-draft route, auto-save, continue                   |
| S7    | Step 5 — Approve & Export    | 3 — Approve/re-open, Word export, plain text export                                  |
| S8    | Account Management           | 3 — Password/MFA, account deletion, inactivity deletion                              |

**Total Phase 4 tasks: 36**

---

## How Each Slice Is Executed

### Before starting a slice

1. ADR consequences pre-check (AGENTS.md rule) — confirm all relevant consequences are covered
2. Read the acceptance criteria for that slice from `business/PRD inputs/acceptance-criteria.md`
3. Read the screen requirements for the relevant pages

### During the slice

- **One task at a time** — stop-and-approve rule (AGENTS.md) applies throughout Phase 4
- **Server Actions** preferred over API routes for data mutations (Next.js App Router pattern)
- **API routes** used for: AI generation (needs `export const maxDuration = 90`), file upload, cron jobs, rate-limited endpoints
- Supabase queries use the server client (`lib/supabase/server.ts`) in Server Components and Actions
- Client components (`'use client'`) only where interactivity is required

### Definition of done for every slice (ADR-OPS-006, GAP-16)

Before marking any slice complete:

- All acceptance criteria from `acceptance-criteria.md` pass
- `@axe-core/react` shows zero WCAG violations in the browser console
- Keyboard navigation through the slice's interactive elements is fully operable (Tab, Shift+Tab, Enter, Space, Arrow keys where applicable)

### After each task

- Update all four docs in `docs/Implementation Plan/` (AGENTS.md blanket rule)
- Commit and push to `origin master`

---

## Key Infrastructure Already in Place

The following are ready to wire in — no new setup required:

| Utility                      | File                          | Used in                                     |
| ---------------------------- | ----------------------------- | ------------------------------------------- |
| Server-side Supabase client  | `lib/supabase/server.ts`      | All server components and actions           |
| Browser-side Supabase client | `lib/supabase/client.ts`      | Client components needing real-time or auth |
| Auth middleware              | `proxy.ts`                    | Already protecting all routes               |
| AI rate limiter              | `lib/rate-limit.ts`           | S5.2, S6.2                                  |
| File type/size validator     | `lib/file-validation.ts`      | S4.1 (`POST /api/upload/process`)           |
| Guidelines session storage   | `lib/guidelines-session.ts`   | S4.1 (set), S5.2 (clear)                    |
| Accessibility checker        | `components/axe-provider.tsx` | Active on every `npm run dev`               |

---

## Where We Start: Slice 0 — Authentication

Slice 0 is the correct starting point because every other slice requires a real authenticated user. Without real auth, all subsequent slices would need to be re-tested once auth is wired. Slice 0 unblocks everything.

**S0.1 — Registration** is the first task. A user must exist before they can sign in.

---

## Related Documents

- Full task specifications: `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — Phase 4 section
- Task progress tracking: `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`
- ADR consequences map: `docs/Implementation Plan/ADR-TRACEABILITY.md`
- Acceptance criteria: `business/PRD inputs/acceptance-criteria.md`
