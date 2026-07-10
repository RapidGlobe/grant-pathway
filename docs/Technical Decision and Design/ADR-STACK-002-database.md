---
id: ADR-STACK-002
category: Stack
status: Decided
---

# ADR-STACK-002 — Database

## Context

Grant Pathway requires a relational database for structured user, charity, and application data. The database must support Row Level Security for multi-tenant data isolation, be hosted in the UK (GDPR), and be operable by a single developer without dedicated database administration overhead.

## Options Considered

- **Option A — Supabase (PostgreSQL, London):** Managed PostgreSQL with built-in Auth, RLS, Storage, and a JavaScript client. EU-West-2 (London) region available.
- **Option B — PlanetScale (MySQL):** Serverless MySQL, strong developer experience, no London region at launch.
- **Option C — Railway PostgreSQL:** Self-managed PostgreSQL on Railway, more control, more operational responsibility.
- **Option D — Neon (PostgreSQL):** Serverless Postgres, branching feature, fewer ancillary services (no built-in auth or storage).

## Decision

**Option A — Supabase (PostgreSQL) in the London region.**

Supabase is the database and backend service. All data is stored in the EU-West-2 (London) region. Row Level Security is enabled on all tables. Supabase Auth is used as the authentication provider (ADR-STACK-003). Supabase Storage is used for file handling (subject to ADR-FILE-001).

## Rationale

- PostgreSQL is a proven, standards-compliant database with strong JSON support for flexible AI output storage.
- Supabase bundles Auth, RLS, Storage, and a generated REST/realtime API, reducing the number of third-party services to manage.
- London region satisfies UK GDPR data residency requirements (C13 — UK-region data hosting).
- RLS policies enforce tenant data isolation at the database level, reducing application-layer security risk.
- Free tier covers the development and early launch phases; paid tier scales predictably.

## Consequences

- Supabase is a single point of dependency for auth, database, and storage. Vendor lock-in is accepted for the v1 scope.
- RLS policies must be written and tested for every table (ADR-SEC-002).
- Database migrations must be managed with a defined strategy (ADR-DATA-004).
- The Supabase JavaScript client (`@supabase/supabase-js`) is used in both server and client contexts.

## Source

technology-stack.md (TS-02 — Database), C13 (UK-region data hosting), Product Decision PDR-STACK-001.

## Date Decided

2026-04-17
