---
id: ADR-DATA-003
category: Data
status: Decided
---

# ADR-DATA-003 — Data Retention

## Context

Grant Pathway stores user profiles, charity profiles, applications, answers, and AI usage logs. A data retention policy is required for GDPR compliance (PRD-Grant-Pathway.md Section 9.4 — Data Retention). The policy must define how long data is held, when it is deleted, and what happens when a user deletes their account.

## Options Considered

- **Option A — Retain data indefinitely unless user deletes their account:** Simplest to implement. Risk: data accumulates indefinitely for inactive users.
- **Option B — Automatic deletion of data after 2 years of inactivity:** Reduces data accumulation. Requires a scheduled job to identify and delete inactive accounts. Users are notified before deletion.
- **Option C — User-controlled deletion only:** Users can delete their account and all associated data at any time. No automatic deletion. Clear data export before deletion.
- **Option D — Tiered retention: applications retained 2 years, user account indefinitely:** Complex, multiple retention policies.

## Decision

**Data is retained for the lifetime of the user account. When a user deletes their account, all associated data is permanently and immediately deleted. No automatic time-based deletion is implemented in v1.**

Account deletion removes, in order: `application_answers`, `applications`, `charity_profiles`, `ai_usage_log`, `user_profiles`, and the Supabase Auth user record.

The `ai_usage_log` monthly request counter is reset at the start of each calendar month. Historical log entries older than 3 months may be deleted by a scheduled job to keep the table size manageable (post-v1).

**Added 2026-07-10 — Phase 6 tables (table names TBD until P6.2/P6.5 land):** retained guideline chunks (P6.2, guideline source-reference feature) are application-owned data — they cascade-delete alongside `application_answers` in the account-deletion order above. Playbooks (P6.5) are **not** included in any user's cascade delete — they are curator-owned, shared across every user applying to that funder (same non-user-scoped status as `funders`), with their own independent lifecycle managed through the curation workflow, not tied to any single user's account.

## Rationale

- Account deletion with immediate cascade is the most user-friendly and GDPR-compliant approach.
- Automatic inactivity-based deletion adds scheduling infrastructure (ADR-OPS-004) not justified in v1.
- 2-year inactivity threshold is a post-v1 consideration once user base scale is understood.
- Monthly `ai_usage_log` reset is a product requirement (PDR-AI-005), not a retention decision — it is achieved by counting rows within the current calendar month.

## Consequences

- Account deletion must cascade through all related tables in the correct foreign key order.
- The account deletion flow (Page 13 in ui-inventory-and-data-contracts.md) must include a confirmation step and clear messaging about what is deleted.
- Supabase Auth user record deletion must be performed using the service role key (ADR-SEC-006) as only the service role can delete auth users.
- A GDPR-compliant privacy policy must document the retention period ("for the lifetime of your account").
- Retained guideline chunks (P6.2) must be included in the account-deletion cascade once that table exists; playbooks (P6.5) must explicitly not be, and need their own retirement/versioning process independent of user account deletion.

## Source

PRD-Grant-Pathway.md (Section 9.4 — Data Retention), FR-29 to FR-32 (Account management), PDR-AI-005.

## Date Decided

2026-04-17

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Retention rule extended to two Phase 6 tables not yet built (table names TBD until P6.2/P6.5 land), as part of reversing `ADR-DATA-002`'s "never store guidelines" decision. Retained guideline chunks (P6.2) cascade-delete with their owning application, same as `application_answers`. Playbooks (P6.5) are excluded from any user's cascade — curator-owned, independent lifecycle, same non-user-scoped status as `funders`. |
