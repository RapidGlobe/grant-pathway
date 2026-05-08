---
id: DR-BM-002
category: Build & Maintenance
status: Decided
---

# DR-BM-002 — Succession Plan for the App

## Question

What happens to the app if the primary maintainer can no longer support it?

## Context

A tool donated to the charity sector must be able to survive the departure, illness, or changed circumstances of its original creator. Without a succession plan, charities may come to depend on the app only for it to disappear — which is worse than it never having existed. The succession plan should address: who takes over technical maintenance, who owns the domain and infrastructure, who has access to the codebase and credentials, and how charities are notified if the app shuts down. This is especially relevant if the app is built and run by a single developer.

## Options

- **Option A: Document and donate codebase** — Ensure the codebase is fully documented and hosted in a public repository so another developer can take over; identify a named organisation to hand over to
- **Option B: Appoint a co-maintainer** — From day one, a second person has full access and capability to run the app independently
- **Option C: Escrow with a sector body** — A sector organisation (e.g. NCVO, a digital charity) holds the credentials and can activate a handover if needed
- **Option D: Defined sunset process** — If maintenance becomes impossible, a clear process is followed: 3-month notice to charities, data export provided, app decommissioned cleanly
- **Option E: No formal plan** — Address this if and when it becomes relevant

## Decision

**Option A: Document and donate codebase**, with Option D (defined sunset process) as the last-resort fallback. The codebase will be fully documented, publicly hosted, and a potential successor organisation identified — even informally — before the app goes live.

## Rationale

A well-documented public codebase (aligned with DR-BM-003) means the app can be picked up by another developer or organisation at any point without starting from zero. Identifying a named potential successor in advance ensures a handover isn't improvised in a crisis. As a last-resort fallback, if handover genuinely becomes impossible, a defined sunset process will give charities a minimum 3-month notice period, the ability to export their data, and a clean decommission. The CIC transition (DR-OD-001) will further strengthen this position by adding institutional continuity beyond the individual.

## Date Decided

2026-04-09
