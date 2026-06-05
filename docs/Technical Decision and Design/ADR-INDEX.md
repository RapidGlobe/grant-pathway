# Architectural Decision Records — Index

**Product:** Grant Pathway v1
**Created:** 2026-04-17
**Last updated:** 2026-06-05

This index lists all Architectural Decision Records (ADRs) for Grant Pathway, grouped in the recommended decision order. ADRs marked ⚠️ **BLOCKER** must be resolved before production deployment.

---

## How to read this index

| Status     | Meaning                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| ✅ Decided | Decision has been made. Rationale is documented.                                                     |
| ⏳ Pending | Decision is open. Options are documented. Review and decide before development of the affected area. |
| ⚠️ BLOCKER | This pending decision blocks production deployment. Resolve first.                                   |

---

## Group 1 — Technology Stack

Foundational choices that everything else depends on. All decided.

| ID            | Title                      | Status     | File                                                                                       |
| ------------- | -------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| ADR-STACK-001 | Framework and Language     | ✅ Decided | [ADR-STACK-001-framework-and-language.md](ADR-STACK-001-framework-and-language.md)         |
| ADR-STACK-002 | Database                   | ✅ Decided | [ADR-STACK-002-database.md](ADR-STACK-002-database.md)                                     |
| ADR-STACK-003 | Authentication Provider    | ✅ Decided | [ADR-STACK-003-authentication-provider.md](ADR-STACK-003-authentication-provider.md)       |
| ADR-STACK-004 | Hosting                    | ✅ Decided | [ADR-STACK-004-hosting.md](ADR-STACK-004-hosting.md)                                       |
| ADR-STACK-005 | Source Control and Licence | ✅ Decided | [ADR-STACK-005-source-control-and-licence.md](ADR-STACK-005-source-control-and-licence.md) |
| ADR-STACK-006 | UI Component Library       | ✅ Decided | [ADR-STACK-006-ui-component-library.md](ADR-STACK-006-ui-component-library.md)             |

---

## Group 2 — Next.js Architecture

Structural decisions about how the Next.js application is organised. Must be decided before pages are built.

| ID           | Title                             | Status     | File                                                                             |
| ------------ | --------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| ADR-ARCH-001 | Next.js Router Strategy           | ✅ Decided | [ADR-ARCH-001-nextjs-router-strategy.md](ADR-ARCH-001-nextjs-router-strategy.md) |
| ADR-ARCH-002 | Rendering Strategy                | ✅ Decided | [ADR-ARCH-002-rendering-strategy.md](ADR-ARCH-002-rendering-strategy.md)         |
| ADR-ARCH-003 | API Pattern                       | ✅ Decided | [ADR-ARCH-003-api-pattern.md](ADR-ARCH-003-api-pattern.md)                       |
| ADR-ARCH-004 | Multi-Step Application Flow State | ✅ Decided | [ADR-ARCH-004-multi-step-flow-state.md](ADR-ARCH-004-multi-step-flow-state.md)   |
| ADR-ARCH-005 | Responsive Strategy               | ✅ Decided | [ADR-ARCH-005-responsive-strategy.md](ADR-ARCH-005-responsive-strategy.md)       |

---

## Group 3 — Security and Authentication

Security decisions that must be in place before any protected pages are built.

| ID          | Title                       | Status     | File                                                                         |
| ----------- | --------------------------- | ---------- | ---------------------------------------------------------------------------- |
| ADR-SEC-001 | Authentication Middleware   | ✅ Decided | [ADR-SEC-001-auth-middleware.md](ADR-SEC-001-auth-middleware.md)             |
| ADR-SEC-002 | Row Level Security Policies | ✅ Decided | [ADR-SEC-002-rls-policies.md](ADR-SEC-002-rls-policies.md)                   |
| ADR-SEC-003 | Session Timeout             | ✅ Decided | [ADR-SEC-003-session-timeout.md](ADR-SEC-003-session-timeout.md)             |
| ADR-SEC-004 | HTTP Security Headers       | ✅ Decided | [ADR-SEC-004-http-security-headers.md](ADR-SEC-004-http-security-headers.md) |
| ADR-SEC-005 | API Rate Limiting           | ✅ Decided | [ADR-SEC-005-api-rate-limiting.md](ADR-SEC-005-api-rate-limiting.md)         |
| ADR-SEC-006 | Secrets Management          | ✅ Decided | [ADR-SEC-006-secrets-management.md](ADR-SEC-006-secrets-management.md)       |

---

## Group 4 — Data

Data model, retention, and migration decisions. Must be decided before the database is created.

| ID           | Title                    | Status     | File                                                                       |
| ------------ | ------------------------ | ---------- | -------------------------------------------------------------------------- |
| ADR-DATA-001 | Data Model               | ✅ Decided | [ADR-DATA-001-data-model.md](ADR-DATA-001-data-model.md)                   |
| ADR-DATA-002 | Data That Is Not Stored  | ✅ Decided | [ADR-DATA-002-data-not-stored.md](ADR-DATA-002-data-not-stored.md)         |
| ADR-DATA-003 | Data Retention           | ✅ Decided | [ADR-DATA-003-data-retention.md](ADR-DATA-003-data-retention.md)           |
| ADR-DATA-004 | Database Migrations      | ✅ Decided | [ADR-DATA-004-database-migrations.md](ADR-DATA-004-database-migrations.md) |
| ADR-DATA-005 | Database Backup Strategy | ✅ Decided | [ADR-DATA-005-backup-strategy.md](ADR-DATA-005-backup-strategy.md)         |

---

## Group 5 — File Handling

File upload and processing decisions. ADR-FILE-001 is a production blocker.

| ID           | Title                                 | Status     | File                                                                                       |
| ------------ | ------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| ADR-FILE-001 | File Upload Architecture              | ✅ Decided | [ADR-FILE-001-file-upload-architecture.md](ADR-FILE-001-file-upload-architecture.md)       |
| ADR-FILE-002 | Accepted File Formats and Size Limits | ✅ Decided | [ADR-FILE-002-accepted-formats-and-limits.md](ADR-FILE-002-accepted-formats-and-limits.md) |
| ADR-FILE-003 | PDF Text Extraction                   | ✅ Decided | [ADR-FILE-003-pdf-text-extraction.md](ADR-FILE-003-pdf-text-extraction.md)                 |
| ADR-FILE-004 | Funder Guidelines Session Storage     | ✅ Decided | [ADR-FILE-004-guidelines-session-storage.md](ADR-FILE-004-guidelines-session-storage.md)   |

---

## Group 6 — AI Integration

AI provider, model, prompt, and reliability decisions.

| ID         | Title                                 | Status                                                    | File                                                                                             |
| ---------- | ------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| ADR-AI-001 | AI Provider                           | ✅ Decided                                                | [ADR-AI-001-ai-provider.md](ADR-AI-001-ai-provider.md)                                           |
| ADR-AI-002 | AI Model Selection                    | ✅ Decided                                                | [ADR-AI-002-model-selection.md](ADR-AI-002-model-selection.md)                                   |
| ADR-AI-003 | Prompt Storage                        | ✅ Decided                                                | [ADR-AI-003-prompt-storage.md](ADR-AI-003-prompt-storage.md)                                     |
| ADR-AI-004 | Prompt Construction Strategy          | ✅ Decided                                                | [ADR-AI-004-prompt-construction.md](ADR-AI-004-prompt-construction.md)                           |
| ADR-AI-005 | AI Response Mode (Streaming vs Batch) | ✅ Decided                                                | [ADR-AI-005-response-mode.md](ADR-AI-005-response-mode.md)                                       |
| ADR-AI-006 | Function Execution Timeout            | ✅ Decided                                                | [ADR-AI-006-function-execution-timeout.md](ADR-AI-006-function-execution-timeout.md)             |
| ADR-AI-007 | Context Window Management             | ✅ Decided                                                | [ADR-AI-007-context-window-management.md](ADR-AI-007-context-window-management.md)               |
| ADR-AI-008 | AI Usage Tracking and Cost Controls   | ✅ Decided                                                | [ADR-AI-008-usage-tracking-and-cost-controls.md](ADR-AI-008-usage-tracking-and-cost-controls.md) |
| ADR-AI-009 | Claude API Error Handling             | ✅ Decided                                                | [ADR-AI-009-claude-api-error-handling.md](ADR-AI-009-claude-api-error-handling.md)               |
| ADR-AI-010 | AI Summary Performance Strategy       | ✅ Decided — pre-processing pre-launch; streaming post-v1 | [ADR-AI-010-summary-performance-strategy.md](ADR-AI-010-summary-performance-strategy.md)         |

---

## Group 7 — Export

Document export decisions.

| ID             | Title                        | Status     | File                                                                                             |
| -------------- | ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| ADR-EXPORT-001 | Export Format                | ✅ Decided | [ADR-EXPORT-001-export-format.md](ADR-EXPORT-001-export-format.md)                               |
| ADR-EXPORT-002 | Document Generation Location | ✅ Decided | [ADR-EXPORT-002-document-generation-location.md](ADR-EXPORT-002-document-generation-location.md) |

---

## Group 8 — Operations

Infrastructure, deployment, and operational decisions.

| ID          | Title                                    | Status                            | File                                                                               |
| ----------- | ---------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| ADR-OPS-001 | Vercel Plan Tier                         | ✅ Decided                        | [ADR-OPS-001-vercel-plan-tier.md](ADR-OPS-001-vercel-plan-tier.md)                 |
| ADR-OPS-002 | Deployment Strategy                      | ✅ Decided                        | [ADR-OPS-002-deployment-strategy.md](ADR-OPS-002-deployment-strategy.md)           |
| ADR-OPS-003 | Email Service                            | ✅ Decided                        | [ADR-OPS-003-email-service.md](ADR-OPS-003-email-service.md)                       |
| ADR-OPS-004 | Scheduled Job Mechanism                  | ✅ Decided                        | [ADR-OPS-004-scheduled-job-mechanism.md](ADR-OPS-004-scheduled-job-mechanism.md)   |
| ADR-OPS-005 | Error Tracking and Monitoring            | ✅ Decided                        | [ADR-OPS-005-error-tracking.md](ADR-OPS-005-error-tracking.md)                     |
| ADR-OPS-006 | Accessibility Testing                    | ✅ Decided                        | [ADR-OPS-006-accessibility-testing.md](ADR-OPS-006-accessibility-testing.md)       |
| ADR-OPS-007 | Uptime Monitoring and Application Health | ✅ Decided                        | [ADR-OPS-007-uptime-monitoring.md](ADR-OPS-007-uptime-monitoring.md)               |
| ADR-OPS-008 | Linting and Code Quality Infrastructure  | ✅ Decided — implement 2026-06-05 | [ADR-OPS-008-linting-and-code-quality.md](ADR-OPS-008-linting-and-code-quality.md) |

---

## Summary

| Group          | Total  | Decided | Pending | Blockers |
| -------------- | ------ | ------- | ------- | -------- |
| Stack          | 6      | 6       | 0       | 0        |
| Architecture   | 5      | 5       | 0       | 0        |
| Security       | 6      | 6       | 0       | 0        |
| Data           | 5      | 5       | 0       | 0        |
| File Handling  | 4      | 4       | 0       | 0        |
| AI Integration | 10     | 10      | 0       | 0        |
| Export         | 2      | 2       | 0       | 0        |
| Operations     | 8      | 8       | 0       | 0        |
| **Total**      | **45** | **45**  | **0**   | **0**    |

---

## ✅ Production Blockers — All Resolved

All three original production blockers have been decided:

- **ADR-FILE-001** — File Upload Architecture: direct client-to-Supabase Storage upload bypasses the 4.5MB Vercel limit. ✅
- **ADR-OPS-001** — Vercel Plan Tier: Vercel Pro to be activated when testing begins (~£16/month). ✅
- **ADR-AI-006** — Function Execution Timeout: `export const maxDuration = 90` on both AI routes, applied at upgrade time. ✅

Grant Pathway has no remaining architectural blockers to production deployment.

---

## All Decisions Complete

All 44 architectural decisions have been decided as of 2026-05-26. Grant Pathway is ready to move into the development phase.

**Key implementation reminders before writing code:**

- Run `supabase init` and create the initial migration (ADR-DATA-004)
- Install Docker Desktop with WSL2 backend (ADR-DATA-004)
- Set up two Supabase projects: development and production (ADR-DATA-004)
- Work through the pre-launch checklist in ADR-OPS-002 before the first production deployment
