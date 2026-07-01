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
