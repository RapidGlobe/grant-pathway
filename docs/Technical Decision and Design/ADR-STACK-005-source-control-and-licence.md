---
id: ADR-STACK-005
category: Stack
status: Decided
---

# ADR-STACK-005 — Source Control and Licence

## Context

Grant Pathway requires a source control strategy and a licence for the codebase. As a commercial product, the licence must protect the proprietary business logic while allowing use of open-source dependencies. The repository visibility and branching strategy must suit a solo developer workflow.

## Options Considered

- **Option A — GitHub private repository, proprietary licence:** Standard for commercial SaaS. Free for individual accounts. Integrates with Vercel for deployment.
- **Option B — GitHub public repository, MIT licence:** Open-source approach. Not appropriate for a commercial product with proprietary AI prompts and business logic.
- **Option C — GitLab private repository:** Alternative hosted Git. Fewer native integrations with Vercel and Supabase than GitHub.

## Decision

**Option A — GitHub private repository with a proprietary licence.**

The codebase is hosted in a private GitHub repository under Rapidglobe Ltd ownership. The licence is proprietary — all rights reserved. Dependencies retain their own open-source licences.

## Rationale

- Private repository protects proprietary AI prompts, data model, and business logic.
- GitHub is the industry-standard integration target for Vercel deployment and CI/CD.
- Proprietary licence prevents unauthorised copying or redistribution of the product.
- GitHub free tier supports unlimited private repositories for individuals and small teams.

## Consequences

- Branch protection rules should be configured on the `main` branch (require PR review or status checks before merge, even for solo development).
- A `.gitignore` must exclude `.env.local` and other files containing secrets.
- Dependency licences (MIT, Apache 2.0, etc.) must be reviewed to confirm compatibility with a proprietary product.

## Source

BRD Section 1 (Company — Rapidglobe Ltd).

## Date Decided

2026-04-17

## Reaffirmed 2026-07-10

This decision was actively revisited, not silently left unexamined, after it came to light that `DR-BM-003` (2026-04-09, decided eight days before this ADR) had recorded the opposite conclusion — fully open source under the MIT Licence — with no note reconciling the two records. On review, this ADR's decision (private repository, proprietary licence) was confirmed as correct going forward; no content change was needed here. `DR-BM-003` has been updated to record the reversal on its own page, and `DR-BM-002` (succession plan) has had its continuity mechanism swapped from public hosting to escrow with a named sector body accordingly. See `DR-BM-003` and `DR-BM-002` for the full reasoning.
