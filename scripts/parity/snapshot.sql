-- =============================================================================
-- Environment parity snapshot — D-020, P5.5
-- =============================================================================
-- Produces ONE row with ONE json column describing everything about a Supabase
-- project's `public` schema that could differ between dev and production.
--
-- WHY THIS EXISTS
-- On 2026-08-18, `grant-pathway-prod` was found to have no DML privileges for
-- the `authenticated` role on five tables, so **no signed-in user could read or
-- write anything**. It had been that way for an unknown length of time. Nothing
-- caught it: the code was correct, the RLS policies were correct, and
-- `supabase_migrations.schema_migrations` recorded all 32 migrations as applied.
--
-- **`RT-00`, whose whole job is to prove the environment before other tests run,
-- passed that morning** — it compares the *set* of applied migration versions,
-- and the version row was present. A version row proves bookkeeping, not
-- execution.
--
-- So this snapshot deliberately reads the **live catalogue** rather than the
-- migration history: what privileges, policies, columns and functions actually
-- exist right now, not what the project believes it applied.
--
-- HOW TO USE IT
--   1. Supabase → `grant-pathway-dev` → SQL Editor → paste and run this file.
--   2. Copy the single JSON value into `scripts/parity/dev.json`.
--   3. Repeat against `grant-pathway-prod` into `scripts/parity/prod.json`.
--   4. `npx tsx scripts/parity/compare.ts` — prints the differences and exits
--      non-zero if any are found.
--
-- Both files are gitignored: they are a point-in-time dump, not a source of
-- truth, and a stale one would be worse than none.
--
-- WHY NOT CONNECT DIRECTLY
-- The script could diff both databases itself given two connection strings, but
-- that means the production database password sitting on a developer machine.
-- `GAP-114`'s recovery position deliberately keeps production credentials in a
-- password manager and out of the working copy, so the snapshot is run by a
-- human in the console instead. Two extra minutes; one less secret at rest.
--
-- READ-ONLY. This file only selects from catalogue views.
-- =============================================================================

with tables as (
  select
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    c.relforcerowsecurity as rls_forced
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
),

columns as (
  select
    table_name,
    column_name,
    data_type,
    is_nullable,
    coalesce(column_default, '') as column_default,
    coalesce(character_maximum_length::text, '') as max_length
  from information_schema.columns
  where table_schema = 'public'
),

-- The section that mattered on 2026-08-18. Grouped per table and role so a
-- missing DML privilege is a one-line difference rather than seven.
table_grants as (
  select
    table_name,
    grantee,
    string_agg(privilege_type, ',' order by privilege_type) as privileges
  from information_schema.role_table_grants
  where table_schema = 'public'
    and grantee in ('anon', 'authenticated', 'service_role')
  group by table_name, grantee
),

policies as (
  select
    tablename as table_name,
    policyname as policy_name,
    cmd,
    coalesce(array_to_string(roles, ','), '') as roles,
    coalesce(qual, '') as using_expr,
    coalesce(with_check, '') as check_expr
  from pg_policies
  where schemaname = 'public'
),

-- Signature and volatility included: a function present under a different
-- argument list is the failure mode where `supabase.rpc` returns PGRST202 and
-- the app reports a generic error.
functions as (
  select
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as returns,
    p.prosecdef as security_definer,
    coalesce(array_to_string(p.proacl::text[], ','), '') as acl
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),

triggers as (
  select
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as definition
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and not t.tgisinternal
),

-- Enum drift is silent and nasty: an INSERT with a value the target project
-- does not know about fails at runtime only, and only for that value.
enums as (
  select
    t.typname as enum_name,
    string_agg(e.enumlabel, ',' order by e.enumsortorder) as labels
  from pg_type t
  join pg_enum e on e.enumtypid = t.oid
  join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public'
  group by t.typname
),

indexes as (
  select tablename as table_name, indexname as index_name, indexdef as definition
  from pg_indexes
  where schemaname = 'public'
),

constraints as (
  select
    c.relname as table_name,
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as definition
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
),

-- Storage is outside `public` and outside the database backups
-- (`ADR-DATA-005`), so it is easy to forget and worth carrying here.
buckets as (
  select id as bucket_id, public as is_public, file_size_limit, allowed_mime_types::text as mime_types
  from storage.buckets
),

storage_policies as (
  select
    policyname as policy_name,
    cmd,
    coalesce(array_to_string(roles, ','), '') as roles,
    coalesce(qual, '') as using_expr,
    coalesce(with_check, '') as check_expr
  from pg_policies
  where schemaname = 'storage' and tablename = 'objects'
),

-- Recorded for completeness and explicitly NOT trusted as evidence of
-- execution — see the header.
migrations as (
  select version from supabase_migrations.schema_migrations
)

select json_build_object(
  'captured_at', now(),
  'database', current_database(),
  'postgres_version', current_setting('server_version'),
  'tables', (select coalesce(json_agg(t order by t.table_name), '[]'::json) from tables t),
  'columns', (select coalesce(json_agg(c order by c.table_name, c.column_name), '[]'::json) from columns c),
  'table_grants', (select coalesce(json_agg(g order by g.table_name, g.grantee), '[]'::json) from table_grants g),
  'policies', (select coalesce(json_agg(p order by p.table_name, p.policy_name), '[]'::json) from policies p),
  'functions', (select coalesce(json_agg(f order by f.function_name, f.arguments), '[]'::json) from functions f),
  'triggers', (select coalesce(json_agg(tr order by tr.table_name, tr.trigger_name), '[]'::json) from triggers tr),
  'enums', (select coalesce(json_agg(e order by e.enum_name), '[]'::json) from enums e),
  'indexes', (select coalesce(json_agg(i order by i.table_name, i.index_name), '[]'::json) from indexes i),
  'constraints', (select coalesce(json_agg(co order by co.table_name, co.constraint_name), '[]'::json) from constraints co),
  'buckets', (select coalesce(json_agg(b order by b.bucket_id), '[]'::json) from buckets b),
  'storage_policies', (select coalesce(json_agg(sp order by sp.policy_name), '[]'::json) from storage_policies sp),
  'migrations', (select coalesce(json_agg(m.version order by m.version), '[]'::json) from migrations m)
) as parity_snapshot;
