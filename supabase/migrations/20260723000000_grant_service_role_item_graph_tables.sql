-- =============================================================================
-- Grant service_role table-level permissions on application_items and
-- application_guidelines (account-deletion bug, 2026-07-23)
-- =============================================================================
-- Found live: WJ deleted a test account (grantpathway+lloyds1@gmail.com) and
-- got "Deletion failed. Please try again." `vercel logs` showed the real
-- cause: 42501 permission denied for table application_items when
-- app/api/account/delete/route.ts's service-role client tried to delete the
-- user's rows — nothing else in the cascade even ran.
--
-- Root cause: 20260714000000_p6_2_application_item_graph.sql and
-- 20260714000001_gap33_application_guidelines.sql both granted
-- select/insert/update/delete to `authenticated` only (following
-- 20260521000000_grant_table_permissions.sql's pattern), never to
-- `service_role`. The original tables (user_profiles, charity_profiles,
-- applications, ai_usage_log) already carry full service_role privileges —
-- granted ad hoc, outside any tracked migration, at some earlier point — so
-- this gap was invisible until a service-role code path (account deletion)
-- actually touched these two newer tables.
--
-- Without this grant, service_role gets: 42501 permission denied for table
-- <name> — same failure mode 20260521000000's own comment documents for
-- authenticated/anon, just for a different role.
-- =============================================================================

grant select, insert, update, delete on public.application_items to service_role;
grant select, insert, update, delete on public.application_guidelines to service_role;
