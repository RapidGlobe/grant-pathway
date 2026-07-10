---
id: DR-BM-001
category: Build & Maintenance
status: Decided
---

# DR-BM-001 — Who Will Build and Maintain the App

## Question

Who will build and maintain the app?

## Context

The build and maintenance resource directly determines what can be built, how fast, and how reliably it is supported. Building solo gives full control but creates a single point of failure. A small team shares the load but requires coordination. Outsourcing to a development agency can move faster but costs money and creates dependency on a third party. Volunteers and open-source contributors bring goodwill but are unpredictable. Given that this is a donated product, the long-term maintenance model must be realistic and sustainable without commercial revenue driving it.

## Options

- **Option A: Solo developer (you)** — You build and maintain the app alone, at least initially
- **Option B: Small team** — You recruit one or more collaborators (employed, contracted, or volunteer) to share the build and maintenance load
- **Option C: Development agency** — Commission an agency to build the app, with a handover plan for ongoing maintenance
- **Option D: Open-source contributor community** — Build in the open and invite community contributions; maintenance is distributed
- **Option E: Hybrid** — You lead the build; open-source the code so others can contribute; retain core maintainer control

## Decision

**Option A: Solo developer** — The app will be built and maintained by a single developer (the app's creator) for v1. As the app matures, the intention is to transition toward a hybrid model (Option E) — open-sourcing the codebase to invite community contributions while retaining lead maintainer control.

## Rationale

Solo development is pragmatic and realistic for a focused v1 with the scope defined across previous decisions. It keeps momentum without coordination overhead and is consistent with individual ownership transitioning to a CIC (DR-OD-001). The single-point-of-failure risk is mitigated by the succession plan (DR-BM-002) and will be further addressed when the codebase is open-sourced as part of the CIC transition.

## Date Decided

2026-04-09

## Note (2026-07-10)

The intention noted above to transition toward Option E ("hybrid... open-sourcing the codebase") and the open-sourcing reference in the Rationale both depended on `DR-BM-003`'s original open-source decision. `DR-BM-003` was reversed on 2026-07-10 — closed source, proprietary licence is now the standing decision (`ADR-STACK-005`). This record's core decision (solo developer for v1) is unaffected, but the future-state references to open-sourcing the codebase above no longer reflect the current position; single-point-of-failure risk is now mitigated by the succession plan's escrow mechanism (`DR-BM-002`, updated 2026-07-10) rather than by opening the codebase.
