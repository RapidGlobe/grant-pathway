---
id: ADR-DATA-004
category: Data
status: Decided
---

# ADR-DATA-004 — Database Migrations

## Context

Grant Pathway's database schema (ADR-DATA-001) including tables, indexes, RLS policies, and triggers must be version-controlled and applied consistently across development, preview, and production environments. A migration strategy ensures that schema changes are tracked, repeatable, and reversible.

## Options Considered

### Option A — Supabase Migration Files (via Supabase CLI)
- **What it is:** The Supabase CLI generates timestamped SQL migration files in `supabase/migrations/`. Migrations are applied with `supabase db push` (remote) or `supabase db reset` (local). The Supabase dashboard can also generate migration diffs.
- **Strengths:** First-party Supabase tooling. Migrations are SQL files committed to Git. Supports local development with `supabase start` (Docker). Preview branches can have their own database state.
- **Weaknesses:** Requires Docker for local development. Supabase CLI must be installed and configured.

### Option B — Drizzle ORM with migrations
- **What it is:** Drizzle ORM defines the schema in TypeScript. `drizzle-kit generate` produces SQL migration files. Type-safe database queries throughout the application.
- **Strengths:** Schema defined in TypeScript with full type inference. End-to-end type safety from schema to query results.
- **Weaknesses:** Adds an ORM layer on top of Supabase. Supabase client and Drizzle overlap. More complex setup. RLS policies still need to be written separately in SQL.

### Option C — Manual SQL migrations (no tooling)
- **What it is:** SQL migration scripts written manually and tracked in a `migrations/` folder. Applied manually via Supabase SQL editor or psql.
- **Strengths:** No tooling dependency.
- **Weaknesses:** Error-prone. No automated tracking of applied vs unapplied migrations. Not scalable.

### Option D — Prisma Migrate
- **What it is:** Prisma ORM with its migration system. Schema defined in Prisma schema language. Well-established tooling.
- **Weaknesses:** Prisma doesn't support Supabase's RLS policies or PostgREST features natively. Significant overlap and tension with the Supabase client.

## Decision

**Option A — Supabase CLI with migration files and full local Docker development.**

The Supabase CLI manages all schema changes. Migration files are SQL, committed to the `supabase/migrations/` directory, and version-controlled in Git from day one. Local development uses Docker Desktop (WSL2 backend on Windows) to run a full isolated Supabase stack — no remote project credentials required for day-to-day development.

This approach is chosen with open source and future CIC contributor experience in mind. Any contributor can clone the repository and get a fully working local environment with three commands:

```bash
supabase start        # spins up local Supabase stack in Docker
supabase db reset     # applies all migrations and seed data
npm run dev           # starts the Next.js application
```

**Setup:**
- Docker Desktop (WSL2 backend) installed on the development machine
- Supabase CLI installed (`npm install -g supabase` or via package manager)
- `supabase init` run at project root — creates the `supabase/` directory
- Two remote Supabase projects maintained: one for development/preview, one for production

**Migration workflow:**
- All schema changes are made via migration files — direct dashboard changes to schema are prohibited
- `supabase db diff --schema public` generates a migration file from dashboard changes if needed
- `supabase db push` applies pending migrations to the remote development or production project
- `supabase db reset` re-applies all migrations locally (safe for local only — destructive)

**Initial migration (`supabase/migrations/[timestamp]_initial_schema.sql`) includes:**
- All five tables from ADR-DATA-001 (`user_profiles`, `charity_profiles`, `applications`, `application_answers`, `ai_usage_log`)
- RLS enabled on all tables
- All RLS policies from ADR-SEC-002

**Seed file (`supabase/seed.sql`) includes:**
- Sample charity profile data
- Sample applications in various states
- Enables contributors to see a realistic local environment immediately

## Consequences

- A `supabase/` directory is added to the repository.
- All schema changes must go through migration files — direct changes in the Supabase dashboard without a corresponding migration file are prohibited.
- `supabase/migrations/` must be committed to the Git repository.
- The `SUPABASE_DB_PASSWORD` must be stored securely for CLI operations.

## Source

ADR-STACK-002, ADR-DATA-001, ADR-SEC-002.

## Date Decided

2026-04-21
