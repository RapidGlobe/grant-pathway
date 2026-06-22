-- =============================================================================
-- RLS Hardening (POST-LAUNCH, Alan Knox review)
-- =============================================================================
-- Two improvements per ADR-SEC-002 review:
--
-- 1. Replace `auth.uid()` with `(select auth.uid())` in all USING/WITH CHECK
--    expressions. The subquery form is evaluated once per statement rather than
--    once per row, which prevents the planner from treating it as a volatile
--    function and can significantly improve performance on large tables.
--
-- 2. Add `WITH CHECK` clauses to all UPDATE policies. Without WITH CHECK,
--    Postgres only checks the USING clause (which row you can see) but allows
--    the UPDATE to change user_id to any value — including another user's ID.
--    WITH CHECK ensures the post-update row still satisfies ownership.
--
-- Pattern for each table: drop old policy → recreate with hardened form.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------------------

drop policy if exists "user_profiles: select own" on public.user_profiles;
drop policy if exists "user_profiles: insert own" on public.user_profiles;
drop policy if exists "user_profiles: update own" on public.user_profiles;
drop policy if exists "user_profiles: delete own" on public.user_profiles;

create policy "user_profiles: select own"
  on public.user_profiles for select
  using (user_id = (select auth.uid()));

create policy "user_profiles: insert own"
  on public.user_profiles for insert
  with check (user_id = (select auth.uid()));

create policy "user_profiles: update own"
  on public.user_profiles for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "user_profiles: delete own"
  on public.user_profiles for delete
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- charity_profiles
-- ---------------------------------------------------------------------------

drop policy if exists "charity_profiles: select own" on public.charity_profiles;
drop policy if exists "charity_profiles: insert own" on public.charity_profiles;
drop policy if exists "charity_profiles: update own" on public.charity_profiles;
drop policy if exists "charity_profiles: delete own" on public.charity_profiles;

create policy "charity_profiles: select own"
  on public.charity_profiles for select
  using (user_id = (select auth.uid()));

create policy "charity_profiles: insert own"
  on public.charity_profiles for insert
  with check (user_id = (select auth.uid()));

create policy "charity_profiles: update own"
  on public.charity_profiles for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "charity_profiles: delete own"
  on public.charity_profiles for delete
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------

drop policy if exists "applications: select own" on public.applications;
drop policy if exists "applications: insert own" on public.applications;
drop policy if exists "applications: update own" on public.applications;
drop policy if exists "applications: delete own" on public.applications;

create policy "applications: select own"
  on public.applications for select
  using (user_id = (select auth.uid()));

create policy "applications: insert own"
  on public.applications for insert
  with check (user_id = (select auth.uid()));

create policy "applications: update own"
  on public.applications for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "applications: delete own"
  on public.applications for delete
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- application_answers
-- ---------------------------------------------------------------------------

drop policy if exists "application_answers: select own" on public.application_answers;
drop policy if exists "application_answers: insert own" on public.application_answers;
drop policy if exists "application_answers: update own" on public.application_answers;
drop policy if exists "application_answers: delete own" on public.application_answers;

create policy "application_answers: select own"
  on public.application_answers for select
  using (user_id = (select auth.uid()));

create policy "application_answers: insert own"
  on public.application_answers for insert
  with check (user_id = (select auth.uid()));

create policy "application_answers: update own"
  on public.application_answers for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "application_answers: delete own"
  on public.application_answers for delete
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- ai_usage_log — SELECT and INSERT only (no UPDATE or DELETE per ADR-SEC-002)
-- ---------------------------------------------------------------------------

drop policy if exists "ai_usage_log: select own" on public.ai_usage_log;
drop policy if exists "ai_usage_log: insert own" on public.ai_usage_log;

create policy "ai_usage_log: select own"
  on public.ai_usage_log for select
  using (user_id = (select auth.uid()));

create policy "ai_usage_log: insert own"
  on public.ai_usage_log for insert
  with check (user_id = (select auth.uid()));

-- UPDATE and DELETE policies are intentionally omitted.
