---
id: ADR-SEC-002
category: Security
status: Decided
---

# ADR-SEC-002 — Row Level Security Policies

## Context

Grant Pathway uses Supabase PostgreSQL with Row Level Security (RLS) enabled (ADR-STACK-002). RLS policies ensure that users can only access their own data. Without correctly defined RLS policies, the application is vulnerable to horizontal privilege escalation — one user accessing another user's charity profile, applications, or answers.

The data model includes: `user_profiles`, `charity_profiles`, `applications`, `application_answers`, `ai_usage_log`.

## Options Considered

### Option A — User-scoped RLS on all tables (via `auth.uid()`)
- **What it is:** Every table has RLS policies that restrict SELECT, INSERT, UPDATE, and DELETE to rows where `user_id = auth.uid()`. The Supabase service role (used in server-side code only) bypasses RLS.
- **Strengths:** Simple, consistent, comprehensive. One policy pattern across all tables. Server-side code using the service role can perform admin operations (e.g., monthly usage reset, data export).
- **Weaknesses:** Requires explicit policies on every table and every operation. Forgetting to add a policy on a new table creates a vulnerability.

### Option B — Application-layer access control only (no RLS)
- **What it is:** RLS is disabled. All access control is implemented in API routes and server actions, which verify the user's session before querying.
- **Strengths:** Simpler database setup. No RLS policy maintenance.
- **Weaknesses:** A bug in application-layer access control exposes all users' data. No defence-in-depth. Not recommended for a multi-tenant application.

### Option C — RLS with per-table custom policies
- **What it is:** Each table has bespoke policies tailored to its access patterns (e.g., `charity_profiles` allows read by anyone matching the user, but `ai_usage_log` only allows insert and select-own).
- **Strengths:** Fine-grained control. Can model more complex access patterns (future: team/org accounts).
- **Weaknesses:** More complex to define and maintain. Overkill for v1's simple user-scoped model.

## Decision

**Option A — consistent `user_id = auth.uid()` policies on all tables, with Option C precision applied to `ai_usage_log`.**

RLS is enabled on all five tables with default-deny (no access unless explicitly granted). All policies use `user_id = auth.uid()` as the row filter. `ai_usage_log` denies UPDATE and DELETE to prevent users from manipulating their usage history to bypass the monthly AI request limit.

**Policy matrix:**

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `user_profiles` | Own rows | Own rows | Own rows | Own rows |
| `charity_profiles` | Own rows | Own rows | Own rows | Own rows |
| `applications` | Own rows | Own rows | Own rows | Own rows |
| `application_answers` | Own rows | Own rows | Own rows | Own rows |
| `ai_usage_log` | Own rows | Own rows | ✗ Denied | ✗ Denied |

"Own rows" = `user_id = auth.uid()`.

The Supabase service role key bypasses all RLS policies. It is used server-side only for admin operations: account deletion cascade (ADR-DATA-003) and any scheduled maintenance tasks. It must never appear in client-side code (ADR-SEC-006).

All policies are defined in the initial database migration file (ADR-DATA-004) and are version-controlled from day one.

## Consequences

- RLS must be tested as part of the development process — verify that cross-user data access is blocked.
- A Supabase migration file (ADR-DATA-004) must include all RLS policy definitions.
- The service role key must be stored as a server-only environment variable (ADR-SEC-006).

## Source

ADR-STACK-002, ADR-DATA-001, BRD Section 9 (Data Privacy & Security).

## Date Decided

2026-04-21
