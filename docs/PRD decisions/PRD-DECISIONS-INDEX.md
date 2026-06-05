# PRD Decisions Index — Grant Pathway v1

This index tracks all product-level decisions required before the Product Requirements Document (PRD) can be written. Each decision record contains a single question to be answered, context explaining why it matters, and a placeholder for the decision and rationale.

These decisions cover: feature scope and prioritisation, user interface and experience, AI integration, and data and file handling. Technical architecture decisions (rendering strategy, database schema, API approach, state management) and operational decisions (testing approach, error monitoring, definition of done) are recorded separately in their own documents.

---

## Status Summary

| Status         | Count |
| -------------- | ----- |
| ✅ Decided     | 16    |
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

| ID                                                        | Question                                                                                                 | Status     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| [PDR-UI-001](PDR-UI-001-ui-component-library.md)          | Will Grant Pathway use a pre-built accessible UI component library or build components from scratch?     | ✅ Decided |
| [PDR-UI-002](PDR-UI-002-design-first-or-code-first.md)    | Will wireframes or mockups be created before coding begins, or will the UI be designed directly in code? | ✅ Decided |
| [PDR-UI-003](PDR-UI-003-mobile-first-or-desktop-first.md) | Will the UI be designed mobile-first or desktop-first?                                                   | ✅ Decided |
| [PDR-UI-004](PDR-UI-004-navigation-structure.md)          | What are the main pages and navigation structure of the application?                                     | ✅ Decided |
| [PDR-UI-005](PDR-UI-005-dashboard-design.md)              | What does a user see on their dashboard when they log in, and how is it laid out?                        | ✅ Decided |
| [PDR-UI-006](PDR-UI-006-api-failure-user-experience.md)   | What does the user see when the Charity Commission API or Claude API is unavailable?                     | ✅ Decided |

---

## AI Integration (AI)

| ID                                                    | Question                                                                                                      | Status     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| [PDR-AI-001](PDR-AI-001-claude-model-selection.md)    | Which Anthropic Claude model will be used for AI summarisation and draft generation in v1?                    | ✅ Decided |
| [PDR-AI-002](PDR-AI-002-prompt-strategy.md)           | Will AI prompts be hardcoded, stored in the database, or managed through a configuration file?                | ✅ Decided |
| [PDR-AI-003](PDR-AI-003-streaming-vs-batch.md)        | Should AI-generated content stream to the screen word by word, or appear all at once when complete?           | ✅ Decided |
| [PDR-AI-004](PDR-AI-004-context-window-management.md) | How will the application handle funder guidelines that are too long for a single API context window?          | ✅ Decided |
| [PDR-AI-005](PDR-AI-005-cost-controls.md)             | Will there be a limit on AI requests per user per day or session, and what happens when the limit is reached? | ✅ Decided |

---

## Data & File Handling (DH)

| ID                                                         | Question                                                                                         | Status     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| [PDR-DH-001](PDR-DH-001-file-upload-limits-and-formats.md) | What is the maximum file size for uploaded funder guidelines and which formats will be accepted? | ✅ Decided |
| [PDR-DH-002](PDR-DH-002-data-retention-policy.md)          | How long will data be retained for inactive accounts and will users be notified before deletion? | ✅ Decided |
| [PDR-DH-003](PDR-DH-003-export-format-and-structure.md)    | What exactly does the exported document contain and how is it structured?                        | ✅ Decided |

---

## Related Documents

| Document                                 | Location                                           |
| ---------------------------------------- | -------------------------------------------------- |
| Business Decision Records Index          | `business/decisions/DECISIONS-INDEX.md`            |
| Business Requirements Document           | `business/BRD-Grant-Pathway-v1.md`                 |
| Functional Requirements (FR-01 to FR-44) | `business/BRD-Grant-Pathway-v1.md` — Section 9     |
| User Personas, Journeys & Use Cases      | `business/user-personas-journeys-and-use-cases.md` |
| Non-Functional Requirements              | `business/non-functional-requirements.md`          |
| Technology Stack                         | `business/technology-stack.md`                     |

---

_Last updated: 2026-04-16_
_Status: 16 of 16 decisions made_
