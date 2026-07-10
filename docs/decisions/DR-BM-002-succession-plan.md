---
id: DR-BM-002
category: Build & Maintenance
status: Decided
supersedes: 2026-04-09 decision
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

**Option C: Escrow with a sector body or other named, trusted third party**, with Option D (defined sunset process) as the last-resort fallback. Codebase access, deployment credentials, and handover documentation will be held in escrow by a named sector body (e.g. NCVO, a digital-infrastructure charity) or another trusted third party, to be activated on a defined trigger — prolonged maintainer inactivity, incapacity, or an explicit handover decision — rather than relying on the codebase being publicly hosted.

## Rationale

The codebase will still be fully documented, exactly as before — that has not changed. What changes is the mechanism by which a successor gains access: instead of public hosting doing that job implicitly, a named escrow holder is given the credentials and documentation up front and a clear trigger for when to act. This achieves the same continuity outcome — the app can be picked up by another developer or organisation without starting from zero, and without an improvised handover in a crisis — without requiring the codebase to be publicly visible. As a last-resort fallback, if handover genuinely becomes impossible, a defined sunset process will give charities a minimum 3-month notice period, the ability to export their data, and a clean decommission. The CIC transition (DR-OD-001) will further strengthen this position by adding institutional continuity beyond the individual, and is a natural candidate to formalise or absorb the escrow arrangement once established.

## Change from Previous Decision (2026-04-09)

The original decision (Option A: document and donate codebase, relying on public hosting) assumed the codebase would be open source (`DR-BM-003`). `DR-BM-003` was reversed on 2026-07-10 — closed source is now the standing decision (`ADR-STACK-005`) — which removed the public-repository mechanism this record depended on. The succession _goal_ has not changed: someone else must be able to take over if the maintainer can no longer continue. Only the _mechanism_ has moved, from "public code, picked up by anyone" to "escrow with a named body, activated on a defined trigger" — Option C, which was already identified as an alternative in this record's original options list. Option D (defined sunset process) remains the unchanged last-resort fallback.

**Action arising:** a specific sector body or trusted third party to hold escrow should be identified — even informally, as the original decision already required for a successor organisation — before launch. Not yet named; this is an open follow-up, not a blocker to recording the mechanism change.

## Date Decided

2026-07-10 (original decision 2026-04-09)
