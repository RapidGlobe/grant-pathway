-- GAP-33 fix — Guideline Text Retention
-- Authority: ADR-DATA-002 (2026-07-10 reversal), ADR-DATA-007, PDR-DH-004.
--
-- ADR-DATA-002's 2026-07-10 reversal decided extracted, page/section-tagged
-- guideline text would be retained in Postgres so a citation has something
-- real to point at once P6.4's "view original guidelines" viewer exists.
-- No task ever actually built the storage half of that decision — only
-- P6.2's application_items.guideline_reference citation-shape column was
-- built. Found 2026-07-14 while scoping P6.4; registered as GAP-33 in
-- docs/Implementation Plan/ADR-TRACEABILITY.md. This migration is that
-- missing storage piece.
--
-- Stores guideline_text exactly as sent to the AI and validated against for
-- citations (P6.3's textForPrompt, post-preprocessing, marker-tagged) — not
-- the raw uploaded file, which ADR-DATA-002 explicitly never retains, and
-- not the pre-preprocessing text, to guarantee every valid citation's marker
-- is actually present in what's stored here.
--
-- One row per application, refreshed on every summary regeneration (same
-- "sync always" convention as application_items); cascade-deletes with the
-- owning application (ADR-DATA-003).

create table public.application_guidelines (
  id             uuid        primary key default gen_random_uuid(),
  application_id uuid        not null references public.applications (id) on delete cascade,
  user_id        uuid        not null references auth.users (id) on delete cascade,
  guideline_text text        not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (application_id)
);

comment on table public.application_guidelines is
  'Retained, marker-tagged guideline text (ADR-DATA-002 2026-07-10 reversal, GAP-33 fix) — the exact text sent to the AI and validated against for citations (P6.3), so P6.4''s "view original guidelines" viewer has something to render. One row per application; cascade-deletes with it.';

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create trigger set_updated_at
  before update on public.application_guidelines
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (hardened form per 20260622000003_rls_hardening.sql)
-- ---------------------------------------------------------------------------

alter table public.application_guidelines enable row level security;

create policy "application_guidelines: select own"
  on public.application_guidelines for select
  using (user_id = (select auth.uid()));

create policy "application_guidelines: insert own"
  on public.application_guidelines for insert
  with check (user_id = (select auth.uid()));

create policy "application_guidelines: update own"
  on public.application_guidelines for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "application_guidelines: delete own"
  on public.application_guidelines for delete
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Table-level grants — Supabase requires these explicitly, see
-- 20260521000000_grant_table_permissions.sql
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.application_guidelines to authenticated;
