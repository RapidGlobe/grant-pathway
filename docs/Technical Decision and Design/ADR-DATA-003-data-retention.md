---
id: ADR-DATA-003
category: Data
status: Decided
---

# ADR-DATA-003 — Data Retention

## Context

Grant Pathway stores user profiles, charity profiles, applications, answers, and AI usage logs. A data retention policy is required for GDPR compliance (BRD Section 9). The policy must define how long data is held, when it is deleted, and what happens when a user deletes their account.

## Options Considered

- **Option A — Retain data indefinitely unless user deletes their account:** Simplest to implement. Risk: data accumulates indefinitely for inactive users.
- **Option B — Automatic deletion of data after 2 years of inactivity:** Reduces data accumulation. Requires a scheduled job to identify and delete inactive accounts. Users are notified before deletion.
- **Option C — User-controlled deletion only:** Users can delete their account and all associated data at any time. No automatic deletion. Clear data export before deletion.
- **Option D — Tiered retention: applications retained 2 years, user account indefinitely:** Complex, multiple retention policies.

## Decision

**Data is retained for the lifetime of the user account. When a user deletes their account, all associated data is permanently and immediately deleted. No automatic time-based deletion is implemented in v1.**

Account deletion removes, in order: `application_answers`, `applications`, `charity_profiles`, `ai_usage_log`, `user_profiles`, and the Supabase Auth user record.

The `ai_usage_log` monthly request counter is reset at the start of each calendar month. Historical log entries older than 3 months may be deleted by a scheduled job to keep the table size manageable (post-v1).

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

## Source

BRD Section 9 (Data Privacy & Security), FR-29 to FR-32 (Account management), PDR-AI-005.

## Date Decided

2026-04-17
