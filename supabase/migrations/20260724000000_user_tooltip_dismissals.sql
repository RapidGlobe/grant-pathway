-- PDR-UI-008 — contextual tooltip dismissed-state, persisted server-side
-- (not localStorage) so it follows the user across devices.
--
-- Normalized table (one row per user per tooltip), not a JSONB column on
-- user_profiles: avoids a read-modify-write race across concurrent
-- dismissals (two tabs dismissing two different tooltips), and matches the
-- per-concern-table convention already used by application_items,
-- application_guidelines, ai_usage_log.
--
-- tooltip_id is `text` + CHECK, not a Postgres enum: ALTER TYPE ... ADD
-- VALUE can't be used in the same transaction it runs in, which would make
-- shipping a future tooltip a two-deploy exercise. A CHECK constraint is one
-- ordinary migration, same as any other schema change here.
--
-- tt-register-password (pre-authentication, no user_id exists yet) and
-- tt-delete-account (always-repeat/non-dismissible per PDR-UI-008) never
-- write a row here — see actions/tooltips.ts and
-- components/contextual-tooltip.tsx for why.

create table public.user_tooltip_dismissals (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  tooltip_id   text        not null,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, tooltip_id),
  constraint user_tooltip_dismissals_tooltip_id_check check (
    tooltip_id in (
      'tt-charity-lookup',
      'tt-guidelines-choice',
      'tt-summary-review',
      'tt-ai-help-limit',
      'tt-budget-no-ai',
      'tt-ready-to-assemble',
      'tt-governance-add-it',
      'tt-senior-review-confirm',
      'tt-download-docx'
    )
  )
);

comment on table public.user_tooltip_dismissals is
  'PDR-UI-008 — one row per contextual tooltip a user has explicitly dismissed. Server-persisted so dismissed-state follows the user across devices. Absence of a row = not yet dismissed.';

-- ---------------------------------------------------------------------------
-- Row Level Security (hardened form per 20260622000003_rls_hardening.sql)
-- ---------------------------------------------------------------------------

alter table public.user_tooltip_dismissals enable row level security;

create policy "user_tooltip_dismissals: select own"
  on public.user_tooltip_dismissals for select
  using (user_id = (select auth.uid()));

create policy "user_tooltip_dismissals: insert own"
  on public.user_tooltip_dismissals for insert
  with check (user_id = (select auth.uid()));

create policy "user_tooltip_dismissals: update own"
  on public.user_tooltip_dismissals for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "user_tooltip_dismissals: delete own"
  on public.user_tooltip_dismissals for delete
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Table-level grants — Supabase requires these explicitly, see
-- 20260521000000_grant_table_permissions.sql. Both roles granted in this
-- same migration: a prior migration granting `authenticated` only caused a
-- real 42501 failure in production on 2026-07-23
-- (20260723000000_grant_service_role_item_graph_tables.sql) when a
-- service_role code path touched a table nobody had granted it access to.
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.user_tooltip_dismissals to authenticated;
grant select, insert, update, delete on public.user_tooltip_dismissals to service_role;
