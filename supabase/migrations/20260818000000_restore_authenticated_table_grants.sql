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
-- Every read and write by a signed-in user therefore failed with
-- `42501 permission denied for table <name>`, exactly as the original grant
-- migration warned it would. Found because saving a charity profile failed on
-- production; the cause reached nobody until `saveCharityProfile` was
-- instrumented (D-019), because that branch discarded the Supabase error.
--
-- WHAT THIS MEANS
-- Production has never worked for a signed-in user. The dashboard's "You don't
-- have any applications yet" was a permission error rendered as an empty state.
--
-- THE SURVIVING TABLES ARE THE CLUE
-- `application_guidelines` and `application_items` were healthy. Both are
-- granted by `20260723000000_grant_service_role_item_graph_tables.sql` (July).
-- Every table missing its privileges is one granted by
-- `20260521000000_grant_table_permissions.sql` (May), which
-- `supabase_migrations.schema_migrations` records as applied on production.
-- **A version row proves bookkeeping, not execution** — and `RT-00` compares the
-- set of applied versions, so it passed while five tables were unusable.
--
-- WHAT WAS RULED OUT, so nobody re-treads it
--   * The RLS hardening script (`20260622000003`) — all 139 lines are policies,
--     with no REVOKE anywhere. Suspected first, and exonerated.
--   * RLS policies themselves — present and correct on every table.
--   * `service_role` and `postgres` — both hold full privileges throughout.
--
-- TWO TABLES DELIBERATELY ABSENT FROM THIS FILE, recorded so their absence is
-- not read as an oversight and "fixed" by a later session:
--   * `application_answers` — dropped by `20260714000000_p6_2_application_item_graph.sql`
--     and replaced by `application_items`. Granting it errors with 42P01.
--   * `user_tooltip_dismissals` — dropped by `20260725000000_drop_user_tooltip_dismissals.sql`.
-- Production has 7 base tables and that is the correct number.
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

-- ai_usage_log — select + insert only (no update/delete per ADR-SEC-002)
grant select, insert on public.ai_usage_log to authenticated;

-- funders — read-only reference data (matches 20260601000000_add_funders_table.sql)
grant select on public.funders to authenticated;
