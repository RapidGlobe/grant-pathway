---
id: DR-BM-003
category: Build & Maintenance
status: Decided
superseded_by: ADR-STACK-005
---

# DR-BM-003 — Open Source vs. Closed Source

> ## Reversed 2026-07-10 — Closed Source Confirmed
>
> This decision is superseded. **Closed source is the standing decision** — formalised eight days after the record below, in [`ADR-STACK-005 — Source Control and Licence`](../Technical%20Decision%20and%20Design/ADR-STACK-005-source-control-and-licence.md) (2026-04-17: private GitHub repository, proprietary licence, all rights reserved), and actively reconsidered and reaffirmed on 2026-07-10. The live repository is private with no licence file, matching `ADR-STACK-005`, not this record.
>
> The Decision, Options, and Rationale below are preserved unchanged as the historical record of what was decided on 2026-04-09 — they no longer reflect the current position and must not be relied on as current.
>
> **Why the reversal stands (2026-07-10):**
>
> 1. **The "no commercial value to protect" premise in the Rationale below does not hold.** The AI prompt engineering (`lib/prompts.ts`) and the item-graph/playbook curation design (Phase 6, `ADR-DATA-006`) are genuinely differentiated, hard-won product work worth protecting — not a thin wrapper with nothing underneath.
> 2. **Open source and closed source are not symmetrically reversible.** Closed → open is a trivial decision to make later, at no cost. Open → closed is not: once code is public it can be cloned, forked, or mirrored, and can never be fully retracted. The reversible option is the sound default absent a specific reason to open up.
> 3. **Free-to-charities (C5) and closed source are not in tension.** C5 governs what charities pay to use the app; this decision governs who can see the source code. The two are independent — closing the source does not touch the free-to-use commitment.
> 4. **The succession plan's actual goal does not require public code.** The goal is continuity if the maintainer can no longer continue — not public code specifically. `DR-BM-002` already listed Option C (escrow with a sector body) and Option B (named co-maintainer with standing access) as alternatives that achieve the same continuity without giving up IP protection. `DR-BM-002` has been updated (2026-07-10) to adopt escrow as the succession mechanism in place of public hosting — the goal is unchanged, only the mechanism moved.
>
> This reversal does not touch `DR-OD-001` (CIC transition) or `DR-OD-002`/`DR-OD-003` (donation ethos, free access to the app) — those stand as decided. Only the source-visibility mechanism changes.

## Question

Will the app be open source or closed source?

## Context

Open sourcing the app allows the sector to inspect the code, contribute improvements, fork it if needed, and trust that there is no hidden data processing. It aligns with the ethos of a donated tool and supports the succession plan (DR-BM-002). However, open source means the codebase is publicly visible, which may surface security vulnerabilities if not managed carefully. It also means anyone can copy and commercialise the work. Closed source is simpler to manage but limits transparency and community contribution. A middle path (open-core or source-available) is also possible.

## Options

- **Option A: Fully open source** — The entire codebase is publicly available under an open-source licence (e.g. MIT, Apache 2.0, AGPL)
- **Option B: Open source with a non-commercial licence** — Code is public but commercial use is restricted (e.g. Creative Commons NC, BSL)
- **Option C: Closed source** — The codebase is private; charities access the app as a hosted service only
- **Option D: Open-core** — Core functionality is open source; any advanced or hosted features are closed
- **Option E: Source-available** — Code is viewable for transparency and audit purposes but not formally open-source licensed

## Decision

**Option A: Fully open source under the MIT Licence** — The entire codebase will be publicly available under the MIT Licence. No secrets, credentials, or sensitive configuration will ever be committed to the repository.

## Rationale

Every decision made across this set points to open source. The succession plan (DR-BM-002) depends on a public, documented codebase. The CIC model (DR-OD-001) is built on transparency and community benefit. The donation ethos (DR-OD-002, DR-OD-003) means there is no commercial value to protect. The MIT Licence is chosen for its simplicity — it is the most widely understood open-source licence, requires only that the licence notice is retained in copies, and is trusted by both developers and non-technical stakeholders in the charity sector. Commercial exploitation of the codebase is not a significant concern given the tool's nature and audience.

## Date Decided

2026-04-09
