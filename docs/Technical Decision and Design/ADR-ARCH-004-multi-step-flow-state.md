---
id: ADR-ARCH-004
category: Architecture
status: Decided
---

# ADR-ARCH-004 — Multi-Step Application Flow State

## Context

Grant Pathway's core user journey is a five-step application flow:

1. Application Details
2. Upload / Paste Funder Guidelines
3. AI Summary (generated)
4. Draft Answers (AI generated)
5. Review & Export

Each step builds on data from previous steps. The user must be able to navigate between steps, leave and return to an in-progress application, and resume at the correct step. State must be persisted so that a page refresh or return visit does not lose progress.

The funder guidelines text is session-use only (FR-22 — not stored in the database). This creates a specific challenge: if the user navigates away after Step 2, the guidelines text may be lost.

## Options Considered

### Option A — Database as primary state store (persisted steps)

- **What it is:** Each completed step writes its data to the database. On return, the application row records the current step and stored answers. Navigation between steps fetches data from the database.
- **Strengths:** Fully persistent. Works across devices and sessions. No state management library needed. Aligns with the data model (FR-22 requires guidelines not be stored, but all other step data is persisted).
- **Weaknesses:** Every step interaction requires a database write. The funder guidelines (Step 2 input) cannot be stored — must be held in session/memory and re-submitted if the user navigates away and returns.

### Option B — Client-side state (React Context or Zustand) with periodic database sync

- **What it is:** All five steps' data is held in a client-side store. The store syncs to the database at step completion or on a timer. On return, the client re-hydrates from the database.
- **Strengths:** Smooth step navigation without database round-trips. Good UX for typing in answer fields.
- **Weaknesses:** Client-side state is lost on page refresh. Re-hydration logic is complex. Risk of data loss if the user closes the tab before a sync.

### Option C — URL-based step state + database

- **What it is:** The current step is encoded in the URL (e.g., `/applications/[id]/step/3`). Each step page fetches its own data from the database on load.
- **Strengths:** Deep-linkable and shareable URLs. Browser back/forward works correctly. Step state is always accurate (no client desync). Aligns with SSR/RSC rendering (each step page can be server-rendered with fresh data).
- **Weaknesses:** Every step navigation triggers a page transition. Requires each step to have its own route and data-fetching logic.

### Option D — Wizard component with in-memory state, save on exit

- **What it is:** A client-side wizard manages all steps in a single-page component. Data is saved to the database only when the user explicitly saves or exits.
- **Strengths:** Fastest UX — no page transitions. Single component manages all state.
- **Weaknesses:** High risk of data loss. All in-memory state lost on refresh. Not recoverable across sessions.

## Decision

**Option A — Database as primary state store, with URL-encoded step routing.**

Each step is a discrete route. The `applications` table `current_step` column tracks progress. Navigating to `/applications/[id]` redirects to the current step.

**URL structure:**

| URL                         | Step                                                  |
| --------------------------- | ----------------------------------------------------- |
| `/applications/[id]`        | Redirects to `/applications/[id]/step/[current_step]` |
| `/applications/[id]/step/1` | Application Details                                   |
| `/applications/[id]/step/2` | Upload Funder Guidelines                              |
| `/applications/[id]/step/3` | AI Summary                                            |
| `/applications/[id]/step/4` | Draft Answers                                         |
| `/applications/[id]/step/5` | Review & Export                                       |

Each step page is a Server Component that fetches only the data relevant to that step. Advancing to a new step updates `current_step` in the database via a Server Action. Step navigation is locked if prerequisites are not met (e.g., Step 4 is inaccessible until Step 3 is complete).

**Auto-save in Step 4:** Answer text areas are Client Components. A debounced Server Action (300–500ms after the user stops typing) writes the current answer text to the `application_answers` table without a full page reload.

**Funder guidelines (Step 2):** Not stored in the database per ADR-DATA-002. Handled via `sessionStorage` — see ADR-FILE-004.

## Consequences

- Each step is a separate route under `/applications/[id]/step/[n]` or similar.
- The `applications` table must record `current_step` to redirect the user to the correct step on return.
- The AI API routes receive guidelines text in the POST body (not from the database).
- Auto-save in Step 4 requires a debounce mechanism (300–500ms after typing stops).

## Source

FR-22, FR-10 to FR-19 (Application flow), DDR-INT-002 (Auto-save), ui-inventory-and-data-contracts.md (step state).

## Date Decided

2026-04-21

## Note — 2026-07-10

This ADR's Context states that funder guidelines are "session-use only (FR-22 — not stored in the database)," and Option A's weakness above reads: "the funder guidelines (Step 2 input) cannot be stored — must be held in session/memory and re-submitted if the user navigates away and returns." This remains accurate today.

However, `ADR-DATA-002` reversed the "guidelines are never stored" decision on 2026-07-10 — guideline text is now retained server-side in Postgres (extracted, page-tagged text, per the P6.2a groundwork). Once P6.2a ships, that specific Option A weakness goes away: guidelines will be retrievable server-side rather than needing re-upload or a `sessionStorage` round-trip if the user navigates away and returns.

This should be updated together with `ADR-FILE-004`, which currently shares the same "guidelines can't be stored" assumption (see that ADR's matching 2026-07-10 note).

## Note — 2026-08-06 (`GAP-32`) — the 2026-07-10 note's trigger has been met

**DRAFT — pending WJ's sign-off.** `P6.2a` shipped on 2026-07-14, so the "once P6.2a ships" condition above is satisfied and the real update it promised is now due. Two statements in this ADR are false as written. **They are corrected here rather than edited in place**, following this repository's convention of leaving superseded text intact for the historical record (as `ADR-DATA-002` does with its original decision):

- **Context** reads: "The funder guidelines text is session-use only (FR-22 — not stored in the database)." **This is no longer true.** The extracted, `[PAGE N]`/`[SECTION: …]`-tagged guideline text is retained for the life of the application in `application_guidelines` (migration `20260714000001`). Only the uploaded PDF or Word **file** is not persisted.
- **Option A's weakness** reads: "The funder guidelines (Step 2 input) cannot be stored — must be held in session/memory and re-submitted if the user navigates away." **That weakness no longer exists.**
- **The Decision section's "Funder guidelines (Step 2)" line** reads: "Not stored in the database per ADR-DATA-002. Handled via `sessionStorage` — see ADR-FILE-004." **The first sentence is no longer true**; the second still is, and is the subject of the open question below.

**Unchanged and still accurate:** the Consequences bullet "The AI API routes receive guidelines text in the POST body (not from the database)" — that is how the routes still work, and retention did not change it.

**The decision itself is unaffected, and is if anything strengthened.** Option A (database as primary state store) was chosen despite that weakness; removing the weakness removes the only part of the flow that Option A could not persist.

**Still true in production, for now.** The retention migration has reached `grant-pathway-dev` only. Until `P5.4` pushes migrations to `grant-pathway-prod`, production behaves exactly as this ADR originally described. Do not read the correction above as a statement about the live service yet.

**One open question, deliberately not settled here — it is WJ's call and it changes code, not just this document.** `ADR-FILE-004`'s `sessionStorage` round-trip may now be unnecessary for returning to Step 2, since the text can be re-read from the server. See that ADR's matching 2026-08-06 note for the full statement of the question.

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-06 | **DRAFT, pending WJ.** `GAP-32`: the 2026-07-10 note's trigger condition is met — `P6.2a` shipped 2026-07-14. Added a note correcting the two false statements (Context's "session-use only", Option A's "cannot be stored") without editing them in place, recording that the chosen option is unaffected and strengthened, and flagging that production still behaves as originally written until `P5.4` pushes migrations. The `sessionStorage` question is left open to WJ in `ADR-FILE-004`'s matching note. |
| 2026-07-10 | Added forward-looking note: `ADR-DATA-002`'s reversal means the Option A weakness ("guidelines cannot be stored") goes away once P6.2a ships — guidelines become retrievable server-side. To be updated together with `ADR-FILE-004`, which shares the same now-outdated assumption.                                                                                                                                                                                                                              |
