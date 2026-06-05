---
id: PDR-UI-002
category: User Interface & Experience
status: Decided
---

# PDR-UI-002 — Design-First or Code-First

## Question

Will wireframes or visual mockups be created before coding begins, or will the UI be designed directly in code?

## Context

A design-first approach means creating low or high fidelity wireframes or mockups (e.g. in Figma or Canva) for each screen before writing any code. This gives a clear visual target, makes it easier to spot UX problems early, and produces assets that can be shared with potential users for feedback. A code-first approach means building screens directly in Next.js, iterating on appearance as development progresses. Given the solo developer constraint (C4) and tight timeline (C2), the right approach balances quality with speed. The user personas (particularly Margaret, who is not technically confident) make UX quality especially important.

## Options

- **Option A — Design-first (full wireframes):** Create low or high-fidelity wireframes for every screen in a design tool before any code is written. Maximum UX clarity but significant upfront time cost.
- **Option B — Code-first:** Build screens directly in Next.js from the outset, iterating on appearance as development progresses. Fastest to start but no visual artefact for early feedback or UX validation.
- **Option C — Lightweight design-first (key screens only):** Sketch low-fidelity wireframes for the 5–6 most critical screens (dashboard, application form, AI output review, export) to validate core user flows, then build in code. No full design tool required.

## Decision

**Option C — Lightweight design-first for key screens only.**

Low-fidelity wireframes will be created for the following screens before coding begins:

1. Dashboard (post-login home screen)
2. Charity profile setup
3. New application — guideline input
4. AI-generated draft review screen
5. Approved application / export screen
6. Account settings / deletion

All other screens will be designed directly in code using shadcn/ui components as the visual foundation.

## Rationale

A full design-first approach would consume too much of the available build time for a solo developer on a fixed July 2026 deadline. However, the most critical screens — particularly the AI draft review and dashboard — involve complex layout and user flow decisions that are much cheaper to fix in a sketch than in code. Targeting wireframes at only these screens captures most of the UX benefit at a fraction of the time cost. shadcn/ui components provide a strong visual starting point for all remaining screens, reducing the risk of poor appearance on code-first pages.

## Date Decided

2026-04-16
