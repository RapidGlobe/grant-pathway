-- =============================================================================
-- Restore table-level GRANTs for the authenticated role (D-020)
-- =============================================================================
-- 2026-08-18, during P5.5's first production test session.
--
-- WHAT WAS WRONG
-- On `grant-pathway-prod`, the `authenticated` role held only REFERENCES,
-- TRIGGER and TRUNCATE on five tables — no SELECT, INSERT, UPDATE or DELETE:
--
--   user_profiles, charity_profiles, applications, ai_usage_log, funders
--
-- Every write and read by a signed-in user therefore failed with
-- `42501 permission denied for table <name>`, exactly as the original grant
-- migration warned. Found because saving a charity profile failed on
-- production; the message reached nobody until `saveCharityProfile` was
-- instrumented (D-019), because the branch discarded the Supabase error.
--
-- WHY IT HAPPENED — and the evidence is in which tables survived
-- `application_guidelines` and `application_items` were fine. Those are granted
-- by `20260723000000_grant_service_role_item_graph_tables.sql` (July). Every
-- table missing its privileges is one granted by
-- `20260521000000_grant_table_permissions.sql` (May) — which
-- `supabase_migrations.schema_migrations` records as applied on production.
--
-- A migration recorded as applied whose statements never executed is the
-- signature of a repaired migration history: versions marked as applied rather
-- than run. `RT-00` compares the *set* of applied versions and passed, because
-- the row was there. **A version row proves bookkeeping, not execution.**
--
-- WHAT THIS MEANS
-- Production has never worked for a signed-in user. The dashboard's "You don't
-- have any applications yet" was a permission error rendered as an empty state.
--
-- WHAT WAS RULED OUT, so nobody re-treads it
--   * The RLS hardening script (`20260622000003`) — all 139 lines are policies;
--     it contains no REVOKE. Suspected first and exonerated.
--   * RLS policies themselves — present and correct on every table.
--   * The service_role and postgres roles — both hold full privileges.
--
-- This migration is idempotent: GRANT is additive, so running it against a
-- healthy database changes nothing.
-- =============================================================================

-- user_profiles
grant select, insert, update, delete on public.user_profiles to authenticated;

-- charity_profiles
grant select, insert, update, delete on public.charity_profiles to authenticated;

-- applications
grant select, insert, update, delete on public.applications to authenticated;

-- application_answers
grant select, insert, update, delete on public.application_answers to authenticated;

-- ai_usage_log — select + insert only (no update/delete per ADR-SEC-002)
grant select, insert on public.ai_usage_log to authenticated;

-- funders — read-only reference data (matches 20260601000000_add_funders_table.sql)
grant select on public.funders to authenticated;

-- user_tooltip_dismissals — included defensively; granted by its own migration,
-- but it was below the fold in the production audit and costs nothing to repeat.
grant select, insert, update, delete on public.user_tooltip_dismissals to authenticated;
