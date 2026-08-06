-- =============================================================================
-- GAP-48 — Repoint the guidelines-temp storage RLS policies at the flat
--          object naming the application actually uses (2026-08-06)
-- =============================================================================
-- The three storage policies created in 20260519000000_initial_schema.sql have
-- never granted anything. They gate on:
--
--     (storage.foldername(name))[1] = auth.uid()::text
--
-- which assumes objects live at `guidelines-temp/<user_id>/<filename>`. They do
-- not, and never have. app/api/upload/signed-url/route.ts writes a FLAT name at
-- the bucket root — `{user_id}_{timestamp}`, containing no `/` — deliberately, so
-- the cleanup-guidelines cron's list('') needs no recursive traversal.
--
-- storage.foldername() splits on '/' and returns the directory components. For a
-- name with no '/' there are none, so the array is empty, [1] is NULL, and
-- `NULL = auth.uid()::text` evaluates to NULL — never true. Every one of the
-- three policies has therefore denied every request since 2026-05-19.
--
-- WHY NOTHING WAS EXPOSED, AND WHY THIS IS STILL WORTH FIXING
--
-- Nothing broke and nothing leaked, because no client ever relies on these
-- policies. The bucket is private; uploads use a signed upload URL minted with
-- the service role (which bypasses RLS entirely); downloads and deletes happen
-- server-side under the service role, behind a route that first checks the
-- caller owns the `{user_id}_` prefix. ADR-FILE-001's consequence explicitly
-- accepts this — "a storage RLS policy OR service-role-only access must prevent
-- users from accessing other users' temporary uploads" — and service-role-only
-- access is the control genuinely in force.
--
-- The defect is that dead code reads as though it were load-bearing. Anyone
-- adding a client-side Storage call would reasonably assume these policies work,
-- and would get a silent default-deny at best, or would remove them as broken at
-- worst. Repointing them rather than dropping them (decision: WJ, 2026-08-06)
-- keeps the tripwire for that case. They remain defence in depth, not the
-- primary control.
--
-- Found 2026-08-06 while fixing GAP-47 (account deletion not removing Storage
-- objects), from the same wrong folder-path assumption, which had also reached
-- data-model.md §6/§7 and the initial schema's own comment. Note that the
-- 2026-06-22 RLS hardening sweep (20260622000003) revised the policies on every
-- table but did not touch these — storage policies live in `storage.objects`
-- rather than a `public` table, so a table-by-table sweep does not see them.
--
-- WHY starts_with() AND NOT LIKE
--
-- The obvious form, `name like auth.uid()::text || '_%'`, is wrong in a way that
-- is easy to miss: in LIKE patterns `_` is a single-character wildcard, so that
-- predicate also matches `<uuid>Xanything`. It would need `'\_%'` to mean a
-- literal underscore. starts_with() takes no pattern and has no escaping rules,
-- so it cannot drift into that trap, and it mirrors the JavaScript ownership
-- test (`objectName.startsWith(userId + '_')`) in lib/storage-guidelines.ts and
-- app/api/upload/process/route.ts exactly. All three must agree.
--
-- The trailing underscore is required, not cosmetic: without it, a user id that
-- is a string prefix of another would match the other user's objects.
--
-- `(select auth.uid())` follows the hardened form established in
-- 20260622000003_rls_hardening.sql — evaluated once per statement rather than
-- once per row.
--
-- No UPDATE policy, matching the original: objects are written once and deleted,
-- never modified in place, so default-deny is correct for UPDATE.
-- =============================================================================

drop policy if exists "storage: upload own guidelines" on storage.objects;
drop policy if exists "storage: read own guidelines" on storage.objects;
drop policy if exists "storage: delete own guidelines" on storage.objects;

create policy "storage: upload own guidelines"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'guidelines-temp'
    and starts_with(name, (select auth.uid())::text || '_')
  );

create policy "storage: read own guidelines"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'guidelines-temp'
    and starts_with(name, (select auth.uid())::text || '_')
  );

create policy "storage: delete own guidelines"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'guidelines-temp'
    and starts_with(name, (select auth.uid())::text || '_')
  );
