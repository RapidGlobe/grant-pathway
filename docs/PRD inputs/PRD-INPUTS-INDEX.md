# PRD Inputs Index — Grant Pathway v1

This folder contains the five specification documents required to complete the Product Requirements Document. These are distinct from the PRD decision records — they define _content and detail_ that feeds directly into the PRD rather than recording choices made.

---

## Status Summary

| Status         | Count |
| -------------- | ----- |
| ✅ Complete    | 5     |
| 🔄 In Progress | 0     |
| ⏳ Pending     | 0     |

---

## Documents

| File                                                       | Purpose                                                                                                                       | Status      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [application-status-model.md](application-status-model.md) | Defines all application statuses and the rules for moving between them                                                        | ✅ Complete |
| [success-metrics.md](success-metrics.md)                   | Defines measurable KPIs for v1 launch                                                                                         | ✅ Complete |
| [email-notifications.md](email-notifications.md)           | Defines content, triggers, and conditions for all system emails                                                               | ✅ Complete |
| ~~screen-requirements.md~~                                 | **Retired 2026-07-13** -- merged into `../PRD-Grant-Pathway.md` Section 7 (Screen Specifications); this file no longer exists | 🗄️ Merged   |
| [acceptance-criteria.md](acceptance-criteria.md)           | Defines testable Given/When/Then acceptance criteria for all 39 Must Have requirements                                        | ✅ Complete |

---

## Suggested Completion Order

| Order | Document                 | Rationale                                                                             |
| ----- | ------------------------ | ------------------------------------------------------------------------------------- |
| 1     | Application status model | Foundational — statuses are referenced in screen requirements and acceptance criteria |
| 2     | Success metrics          | Quick to define, standalone                                                           |
| 3     | Email notifications      | Medium effort, standalone                                                             |
| 4     | Screen requirements      | Builds on status model; defines what each of the 9 screens must contain               |
| 5     | Acceptance criteria      | Largest effort; draws on all previous documents                                       |

---

## Related Documents

| Document                            | Location                                                 |
| ----------------------------------- | -------------------------------------------------------- |
| PRD Decisions Index                 | `docs/PRD decisions/PRD-DECISIONS-INDEX.md`              |
| Business Requirements Document      | `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md`  |
| Non-Functional Requirements         | `docs/non-functional-requirements.md`                    |
| User Personas, Journeys & Use Cases | `docs/user-personas-journeys-and-use-cases.md`           |
| Technology Stack                    | `docs/Technical Decision and Design/technology-stack.md` |
| App Name & Branding                 | `docs/app-name-and-branding.md`                          |

---

_Last updated: 2026-04-16_
_Status: All 5 inputs complete_
