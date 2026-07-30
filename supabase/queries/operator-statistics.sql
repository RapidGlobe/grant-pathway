-- Grant Pathway — operator statistics
--
-- Purpose: read the service's day-one numbers by hand, from the Supabase SQL Editor,
-- without the /admin dashboard.
--
-- Why this file exists: P5.5b (the /admin dashboard) was moved out of the launch gate to
-- post-launch on 2026-07-30 (WJ's decision). WJ's condition was that statistics must still
-- be available from day one of go-live. These are those statistics.
--
-- Every query below was executed successfully against grant-pathway-dev on 2026-07-30
-- before being written here. They are not copied from the P5.5b specification — three of
-- that spec's eight queries reference columns that do not exist and would error on first
-- run (see the note at the foot of this file).
--
-- How to run: Supabase dashboard → SQL Editor → paste one block at a time. Read-only;
-- nothing here writes, updates or deletes.
--
-- Run against grant-pathway-prod after go-live. Against grant-pathway-dev the numbers are
-- test data.


-- ── 1. Registered users ─────────────────────────────────────────────────────────────
-- One row per user profile. Equals the number of accounts that completed registration.

select count(*) as registered_users
from user_profiles;


-- ── 2. Active in the last 7 days ────────────────────────────────────────────────────
-- NOTE: last_sign_in_at lives on auth.users, NOT on user_profiles. There is deliberately
-- no last_login_at column on user_profiles — see the D11 resolution recorded in
-- supabase/migrations/20260519000000_initial_schema.sql.

select count(*) as active_last_7_days
from auth.users
where last_sign_in_at > now() - interval '7 days';


-- ── 3. Applications: total, and created today ───────────────────────────────────────

select
  count(*) as applications_total,
  count(*) filter (where created_at::date = current_date) as applications_today
from applications;


-- ── 4. Average applications per registered user ─────────────────────────────────────

select
  round(
    (select count(*)::numeric from applications)
      / nullif((select count(*) from user_profiles), 0),
    2
  ) as avg_applications_per_user;


-- ── 5. Top funders ──────────────────────────────────────────────────────────────────
-- Grouped by applications.funder_name. Do NOT join through funder_id: the funder
-- directory was removed on 2026-07-15 (DR-FD-001 v1.4), Step 1 is free text again, and no
-- application created since then populates funder_id. funder_name is the only funder
-- identity an application carries.

select funder_name, count(*) as applications
from applications
group by funder_name
order by count(*) desc
limit 10;


-- ── 6. AI usage this calendar month ─────────────────────────────────────────────────
-- NOTE: the column is request_type, not route. It is an enum of five values:
-- guideline_summary, refine_answer, charity_paraphrase, draft_generation, assemble_draft.
-- (draft_generation is historical — the /api/generate-draft route was deleted 2026-07-01.)

select request_type, count(*) as requests
from ai_usage_log
where created_at > date_trunc('month', now())
group by request_type
order by count(*) desc;


-- ── 7. Monthly cap utilisation ──────────────────────────────────────────────────────
-- AI requests this month as a percentage of the theoretical ceiling (50 per user per
-- month, enforced in reserve_ai_slot). A low number is expected and healthy; this is a
-- cost-exposure indicator, not a usage target.

select
  (select count(*) from ai_usage_log where created_at > date_trunc('month', now()))
    as requests_this_month,
  (select count(*) * 50 from user_profiles) as theoretical_ceiling,
  round(
    (select count(*)::numeric from ai_usage_log where created_at > date_trunc('month', now()))
      * 100 / nullif((select count(*) * 50 from user_profiles), 0),
    1
  ) as pct_of_ceiling;


-- ── 8. Recent registrations, with application counts ────────────────────────────────
-- NOTE: email lives on auth.users, not on user_profiles. user_profiles holds first_name,
-- last_name, feedback_consent, created_at — no email column.
--
-- Contains personal data. Read it, do not export or paste it elsewhere.

select
  u.email,
  u.created_at as registered_at,
  u.last_sign_in_at,
  count(a.id) as applications
from auth.users u
  left join applications a on a.user_id = u.id
group by u.id, u.email, u.created_at, u.last_sign_in_at
order by u.created_at desc
limit 10;


-- ── 9. Feedback opt-ins ─────────────────────────────────────────────────────────────
-- FR-08. P5.5 records a standing post-launch action to act on these rather than let the
-- consent go unused, so this query is the one that turns that into something doable.

select
  count(*) filter (where feedback_consent) as opted_in,
  count(*) as total,
  round(
    count(*) filter (where feedback_consent)::numeric * 100 / nullif(count(*), 0),
    1
  ) as pct_opted_in
from user_profiles;


-- ── 10. Application status spread ───────────────────────────────────────────────────
-- Where users are actually reaching. The gap between in_progress and exported is the
-- funnel figure worth watching from day one.

select status, count(*) as applications
from applications
group by status
order by count(*) desc;


-- ────────────────────────────────────────────────────────────────────────────────────
-- Defects found in the P5.5b specification while writing this file (2026-07-30)
--
-- The /admin dashboard spec in docs/Implementation Plan/IMPLEMENTATION-PLAN.md lists
-- eight panel queries. Three of them would error on first execution:
--
--   1. "Active last 7 days" reads last_sign_in_at from user_profiles. That column is on
--      auth.users. See query 2 above.
--   2. "Recent registrations" selects email from user_profiles. That column is also on
--      auth.users. See query 8 above.
--   3. "AI usage this month" groups ai_usage_log by route. No such column — it is
--      request_type. See query 6 above.
--
-- The spec has been corrected in place. Recorded here as well so that whoever builds the
-- dashboard uses this file as the tested reference rather than re-deriving the SQL.
