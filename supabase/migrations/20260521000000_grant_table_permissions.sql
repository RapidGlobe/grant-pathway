-- =============================================================================
-- Grant table-level permissions to authenticated role
-- =============================================================================
-- Tables created via the SQL editor (not Supabase Studio) do not automatically
-- receive table-level GRANTs for the authenticated/anon roles. RLS policies
-- control row-level access, but PostgreSQL still requires an explicit GRANT
-- before a role can perform any operation on a table.
--
-- Without these grants users get: 42501 permission denied for table <name>
-- even when their RLS policy would allow the row.
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
