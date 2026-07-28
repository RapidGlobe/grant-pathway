# PRD Decisions Index — Grant Pathway v1

This index tracks all product-level decisions required before the Product Requirements Document (PRD) can be written. Each decision record contains a single question to be answered, context explaining why it matters, and a placeholder for the decision and rationale.

These decisions cover: feature scope and prioritisation, user interface and experience, AI integration, and data and file handling. Technical architecture decisions (rendering strategy, database schema, API approach, state management) and operational decisions (testing approach, error monitoring, definition of done) are recorded separately in their own documents.

---

## Status Summary

| Status         | Count |
| -------------- | ----- |
| ✅ Decided     | 26    |
| 🔄 In Progress | 0     |
| ⏳ Pending     | 0     |
| ⏸ Deferred     | 0     |

---

## Feature Scope (FS)

| ID                                                        | Question                                                                                     | Status     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------- |
| [PDR-FS-001](PDR-FS-001-moscow-feature-prioritisation.md) | Which functional requirements are Must Have, Should Have, Could Have, and Won't Have for v1? | ✅ Decided |
| [PDR-FS-002](PDR-FS-002-phased-build-approach.md)         | Will v1 be built and released as a single delivery or in smaller internal phases?            | ✅ Decided |

---

## User Interface & Experience (UI)

| ID                                                                   | Question                                                                                                                          | Status     |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [PDR-UI-001](PDR-UI-001-ui-component-library.md)                     | Will Grant Pathway use a pre-built accessible UI component library or build components from scratch?                              | ✅ Decided |
| [PDR-UI-002](PDR-UI-002-design-first-or-code-first.md)               | Will wireframes or mockups be created before coding begins, or will the UI be designed directly in code?                          | ✅ Decided |
| [PDR-UI-003](PDR-UI-003-mobile-first-or-desktop-first.md)            | Will the UI be designed mobile-first or desktop-first?                                                                            | ✅ Decided |
| [PDR-UI-004](PDR-UI-004-navigation-structure.md)                     | What are the main pages and navigation structure of the application?                                                              | ✅ Decided |
| [PDR-UI-005](PDR-UI-005-dashboard-design.md)                         | What does a user see on their dashboard when they log in, and how is it laid out?                                                 | ✅ Decided |
| [PDR-UI-006](PDR-UI-006-api-failure-user-experience.md)              | What does the user see when the Charity Commission API or Claude API is unavailable?                                              | ✅ Decided |
| [PDR-UI-007](PDR-UI-007-supporting-documents-checklist.md)           | The Step 3 summary extracts a list of funder-required supporting documents but never displays it — should it be shown, and where? | ✅ Decided |
| [PDR-UI-008](PDR-UI-008-help-centre-link-and-contextual-tooltips.md) | Should a persistent help-centre link and contextual in-app tooltips be added, and using what implementation approach?             | ✅ Decided |

---

## AI Integration (AI)

| ID                                                                    | Question                                                                                                                                                                                      | Status     |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [PDR-AI-001](PDR-AI-001-claude-model-selection.md)                    | Which Anthropic Claude model will be used for AI summarisation and draft generation in v1?                                                                                                    | ✅ Decided |
| [PDR-AI-002](PDR-AI-002-prompt-strategy.md)                           | Will AI prompts be hardcoded, stored in the database, or managed through a configuration file?                                                                                                | ✅ Decided |
| [PDR-AI-003](PDR-AI-003-streaming-vs-batch.md)                        | Should AI-generated content stream to the screen word by word, or appear all at once when complete?                                                                                           | ✅ Decided |
| [PDR-AI-004](PDR-AI-004-context-window-management.md)                 | How will the application handle funder guidelines that are too long for a single API context window?                                                                                          | ✅ Decided |
| [PDR-AI-005](PDR-AI-005-cost-controls.md)                             | Will there be a limit on AI requests per user per day or session, and what happens when the limit is reached?                                                                                 | ✅ Decided |
| [PDR-AI-006](PDR-AI-006-word-limit-compression-disclosure.md)         | When AI assist can't fully compress an over-limit answer to fit, how should Grant Pathway tell the user?                                                                                      | ✅ Decided |
| [PDR-AI-007](PDR-AI-007-budget-over-limit-messaging.md)               | When a budget/financial question exceeds its limit, what message and trim assistance should be shown, given AI assist is disabled for these questions?                                        | ✅ Decided |
| [PDR-AI-008](PDR-AI-008-governance-fact-detection-and-fallback.md)    | When should the 5 governance/reserves facts be asked, and what happens when a funder's guidelines don't clearly raise one — should a novice user ever be asked to judge relevance themselves? | ✅ Decided |
| [PDR-AI-009](PDR-AI-009-refine-relevance-check-consistency.md)        | When an answer doesn't genuinely address its question, what should "Help me improve this" do — consistently, regardless of word-limit status?                                                 | ✅ Decided |
| [PDR-AI-010](PDR-AI-010-financial-section-catch-all.md)               | When a free_form funder's themed financial section reduces to pure numbers already covered by the 5 governance facts, should it be dropped, forced unconditionally, or something else?        | ✅ Decided |
| [PDR-AI-011](PDR-AI-011-eligibility-mismatch-verdict-confirmation.md) | `eligibilityMismatch` gates a hard stop with no override — given the verdict can flip between two identical calls on unchanged input, how should the hard stop be made reliable?              | ✅ Decided |
| [PDR-AI-012](PDR-AI-012-aggregate-word-limit-across-sections.md)      | When a free_form funder's single overall word limit spans multiple AI-extracted sections, none of which carries it individually, how should the limit be shown and enforced?                  | ✅ Decided |

---

## Data & File Handling (DH)

| ID                                                            | Question                                                                                                                              | Status     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [PDR-DH-001](PDR-DH-001-file-upload-limits-and-formats.md)    | What is the maximum file size for uploaded funder guidelines and which formats will be accepted?                                      | ✅ Decided |
| [PDR-DH-002](PDR-DH-002-data-retention-policy.md)             | How long will data be retained for inactive accounts and will users be notified before deletion?                                      | ✅ Decided |
| [PDR-DH-003](PDR-DH-003-export-format-and-structure.md)       | What exactly does the exported document contain and how is it structured?                                                             | ✅ Decided |
| [PDR-DH-004](PDR-DH-004-guideline-source-reference-design.md) | Should the user be able to trace an AI summary bullet or extracted question back to the specific guideline page/section it came from? | ✅ Decided |

---

## Related Documents

| Document                                 | Location                                                                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Business Decision Records Index          | `docs/decisions/DECISIONS-INDEX.md`                                                                                                                                                        |
| Business Requirements Document           | `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md` — main reference going forward                                                                                                     |
| Functional Requirements (FR-01 to FR-48) | `docs/moscow-feature-register.md`                                                                                                                                                          |
| User Personas, Journeys & Use Cases      | `docs/user-personas-journeys-and-use-cases.md`                                                                                                                                             |
| Non-Functional Requirements              | `docs/non-functional-requirements.md`                                                                                                                                                      |
| Technology Stack                         | `docs/Technical Decision and Design/technology-stack.md`                                                                                                                                   |
| Architectural Decision Records Index     | `docs/Technical Decision and Design/ADR-INDEX.md` — includes ADR-DATA-006 (2026-07-05), a not-yet-built rearchitecture of question/answer handling that supersedes BD-03/BD-04's mechanism |

**Note (2026-07-05):** No new PDR added for ADR-DATA-006. That decision is architectural (data model, extraction pipeline, rendering) and belongs in the ADR series per this index's own scope note above — it's cross-referenced here because it will eventually affect how the AI/data-handling PDRs above are implemented, not because it is itself a pre-PRD product decision.

---

_Last updated: 2026-07-28_
_Status: 26 of 26 decisions made. PDR-AI-008: the 5 governance/reserves facts built earlier the same day as an always-on fixed block (commit `82e11d9`) have been folded into guideline-driven extraction — shown automatically whenever the AI has any signal at all (even an imprecise one), never proactively suggested to a novice user (Persona 1, Margaret) who can't be expected to judge relevance herself. The manual-add picker (rare experienced-user shortcut for the zero-signal case) has also now been built, same day — a quiet link, hidden once all 5 facts are shown, revealing plain-English-explained checkboxes for only the missing ones. Both halves of PDR-AI-008 are complete. PDR-AI-009: decided and **built same day (2026-07-17)** — "Help me improve this" always attempts a polish but prepends a flagged warning when the answer doesn't genuinely address the question, regardless of word-limit status; see that PDR for the two rejected alternatives and a UI risk found and fixed during implementation. PDR-AI-010: decided and **built same day (2026-07-17)**, found live-testing Stony Stratford Town Council — a "sections"-mode financial theme reducing entirely to numbers already captured by the governance facts was citing the exact same quote as a separate governance-fact card; the section is still created (the guidelines named the theme) but its guidance now explicitly invites context beyond the figures, and its citation is omitted rather than duplicated — deliberately guideline-driven, not an unconditional catch-all, to avoid repeating the exact anti-pattern PDR-AI-008's original always-on governance block was corrected away from. PDR-AI-011: decided and **built 2026-07-28**, found live-testing GCM-01 (National Opera Studio vs. Idlewild Trust) — `eligibilityMismatch` could flip between two identical calls despite `temperature: 0` (Bedrock does not guarantee bit-identical output across calls, an inherent hosted-inference limitation, not a missing setting); `DR-EL-001`'s hard stop has no override, so a second confirming call is now required before a `true` verdict is trusted, biased toward not blocking on any confirmation failure. Not yet live-verified. PDR-AI-012: decided and **built 2026-07-28**, found live-testing GCM-03 (CPF Trust) — a single 500-word limit spanning the whole application had no home once the AI (correctly) split it into 3 topic sections, none of which showed any limit badge; a new `overallWordLimit` field plus a live combined counter across the linked sections (soft nudge, never a hard block) now covers it, with a small badge on each contributing section explaining why it carries no limit of its own. Automated component tests added; extraction itself not yet live-verified._
