-- Migration: Add performance indexes
-- Resolves F-06-01, F-06-02, F-06-03, CR-001
-- §2.1 item 5 — Alan Knox initial assessment (LAUNCH-BLOCKER)
--
-- Without these indexes, the monthly cap check performs a full seq-scan of
-- ai_usage_log per request, and the dashboard + upload queries are unindexed.

-- ai_usage_log: monthly cap check scans this table per user per month
create index if not exists idx_ai_usage_log_user_created
  on public.ai_usage_log (user_id, created_at);

-- applications: dashboard query filters by user_id and orders by updated_at
create index if not exists idx_applications_user_updated
  on public.applications (user_id, updated_at desc);

-- application_answers: RLS and upload queries filter by user_id
create index if not exists idx_application_answers_user
  on public.application_answers (user_id);

-- applications: funder FK join used in funder-picker queries
create index if not exists idx_applications_funder
  on public.applications (funder_id);
