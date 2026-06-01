-- =============================================================================
-- Grant Pathway — Migration: Add funders table and funder_id FK
-- =============================================================================
-- Authority: DR-FD-001 (funder directory model)
--            data-model.md section 2a
--            ADR-SEC-002 (RLS policy matrix)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. funders table
-- ---------------------------------------------------------------------------
-- Global reference table — not user-scoped. Seeded by Rapidglobe via seed.sql
-- or direct insert using the service role. Users can only SELECT active rows.

create table public.funders (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null unique,
  funder_type    text        not null check (funder_type in ('structured', 'narrative')),
  grant_range    text,
  guidelines_url text,
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now()
);

comment on table public.funders is
  'Approved funder directory. Global reference table — not user-scoped. '
  'Seeded by Rapidglobe. Users can read active rows; only service role may write. '
  'See DR-FD-001 and data-model.md section 2a.';

-- ---------------------------------------------------------------------------
-- 2. RLS on funders
-- ---------------------------------------------------------------------------

alter table public.funders enable row level security;

-- Any authenticated user may read active funders (populates the Step 1 picker)
create policy "funders: select active"
  on public.funders for select
  to authenticated
  using (is_active = true);

-- INSERT, UPDATE, DELETE are intentionally omitted — default-deny blocks them
-- for all roles except the service role (which bypasses RLS).

-- ---------------------------------------------------------------------------
-- 3. Table-level grant
-- ---------------------------------------------------------------------------
-- Tables created via SQL migration do not automatically receive table-level
-- GRANTs (see 20260521000000_grant_table_permissions.sql). Without this grant
-- PostgreSQL blocks the query before RLS even runs (error 42501).
-- funders is read-only for authenticated users — SELECT only, no write grants.

grant select on public.funders to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Add funder_id FK to applications
-- ---------------------------------------------------------------------------
-- Nullable for migration safety — existing records are unaffected.
-- Populated when a user selects a funder from the picker at Step 1.

alter table public.applications
  add column funder_id uuid references public.funders (id) on delete set null;

comment on column public.applications.funder_id is
  'FK to funders.id. Nullable — existing records pre-dating DR-FD-001 have no '
  'funder_id. Set when user selects from the approved funder picker at Step 1.';
