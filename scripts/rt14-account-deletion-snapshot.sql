-- RT-14 — Delete Account: before/after snapshot
-- ---------------------------------------------------------------------------
-- Run this in the SQL Editor of the project under test, BEFORE deletion and
-- again AFTER, unchanged both times. Compare the two outputs: that comparison
-- is the evidence, not either run on its own.
--
-- WHY THIS EXISTS. RT-14's steps 1-8 prove what the UI does: the confirmation
-- gate works, the redirect happens, and the old credentials no longer sign in.
-- None of that proves the rows are gone. A failed cascade step returns a
-- generic "Deletion failed" and the auth user survives, but a cascade that
-- half-succeeded and then hit `42501 permission denied` would leave orphaned
-- application rows behind with the auth user deleted -- and from the UI that
-- looks identical to a clean deletion, because the only visible evidence is
-- that sign-in fails, which it would either way.
--
-- That is not hypothetical here. On 2026-07-23 `application_items` and
-- `application_guidelines` were missing `service_role` grants, so every
-- deletion failed on the FIRST cascade step (migration
-- 20260723000000_grant_service_role_item_graph_tables.sql). RT-14's own notes
-- record that migration as applied to dev but NOT to production at the time of
-- the last run, which is precisely why the production run needs row-level
-- evidence rather than a UI observation. Section 3 below checks the grants
-- directly, so a missing one is visible before the deletion is attempted
-- rather than inferred from a 500 afterwards.
--
-- The table list mirrors `app/api/account/delete/route.ts` in its exact order.
-- If that route gains a table, add it here in the same position.

-- ---------------------------------------------------------------------------
-- THE ACCOUNT UNDER TEST
-- ---------------------------------------------------------------------------
-- The address is written inline in each section below rather than set once as
-- a variable: the Supabase web editor is psql-compatible for queries but does
-- NOT support psql meta-commands, so a `\set` line at the top fails with a
-- syntax error and takes the whole paste down with it. Find and replace the
-- address to retarget -- it appears five times (twice in section 2, once in
-- each of the others).
--
-- Currently set to: grantpathway+RT01test@gmail.com

-- ---------------------------------------------------------------------------
-- 1. IDENTITY — confirm exactly one auth user matches, and capture the id
-- ---------------------------------------------------------------------------
select
  id as user_id,
  email,
  created_at,
  last_sign_in_at,
  (email_confirmed_at is not null) as email_confirmed
from auth.users
where email = 'grantpathway+RT01test@gmail.com';

-- ---------------------------------------------------------------------------
-- 2. ROW COUNTS — one row per table the deletion route touches, in its order.
--    BEFORE: at least one non-zero count, or the test proves nothing.
--    AFTER:  every count must be 0, and auth_users must be 0 too.
-- ---------------------------------------------------------------------------
with target as (
  select id from auth.users where email = 'grantpathway+RT01test@gmail.com'
),
apps as (
  select a.id from public.applications a join target t on a.user_id = t.id
)
select 'auth.users' as table_name, 1 as step, count(*) as row_count
  from auth.users where email = 'grantpathway+RT01test@gmail.com'
union all
select 'application_items', 2, count(*)
  from public.application_items where application_id in (select id from apps)
union all
select 'application_guidelines', 3, count(*)
  from public.application_guidelines where application_id in (select id from apps)
union all
select 'applications', 4, count(*)
  from public.applications where user_id in (select id from target)
union all
select 'charity_profiles', 5, count(*)
  from public.charity_profiles where user_id in (select id from target)
union all
select 'ai_usage_log', 6, count(*)
  from public.ai_usage_log where user_id in (select id from target)
union all
select 'user_profiles', 7, count(*)
  from public.user_profiles where user_id in (select id from target)
order by step;

-- ---------------------------------------------------------------------------
-- 3. GRANTS — the 2026-07-23 defect, checked directly rather than inferred
--    Expect 4 rows: delete on application_items and application_guidelines,
--    for service_role. A missing row means deletion WILL fail at that step.
-- ---------------------------------------------------------------------------
select
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('application_items', 'application_guidelines')
  and grantee = 'service_role'
  and privilege_type in ('DELETE', 'SELECT')
order by table_name, privilege_type;

-- ---------------------------------------------------------------------------
-- 4. STORAGE — objects belonging to this user in `guidelines-temp`
--    Usually 0 both before and after: /api/upload/process deletes each object
--    seconds after extracting its text, and `cleanup-guidelines` sweeps every
--    30 minutes regardless. A non-zero BEFORE count is what makes RT-14's
--    optional GAP-47 add-on meaningful; if it is 0 before, that add-on was not
--    exercised and should not be recorded as passed.
--    Objects are flat at the bucket root, named <user_id>_<timestamp>.
-- ---------------------------------------------------------------------------
select
  o.name,
  o.created_at,
  o.metadata ->> 'size' as size_bytes
from storage.objects o
where o.bucket_id = 'guidelines-temp'
  and o.name like (
    (select id::text from auth.users where email = 'grantpathway+RT01test@gmail.com') || '%'
  )
order by o.created_at;
