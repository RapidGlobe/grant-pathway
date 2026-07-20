-- P6.5 — Reuse Previous Application (private, per-charity, per-funder)
-- Authority: IMPLEMENTATION-PLAN.md P6.5 (rewritten 2026-07-14 — supersedes
-- the "Curated Funder Playbooks" design entirely; no playbook table, no
-- curator role, no versioning/approval workflow).
--
-- When a charity starts a new application for a funder they've already
-- reached Step 4 with before, they may choose to carry across the previous
-- application's question list, retained guidelines, AI summary, and their
-- own previous answers (reset to "needs review") rather than re-uploading
-- guidelines and waiting for fresh AI extraction. This is entirely private
-- to that one charity's own account — no cross-user sharing, so no new
-- role or approval concept is needed; the existing per-user RLS pattern
-- already covers it.
--
-- cloned_from_application_id records which prior application (if any) an
-- item row was carried over from, so Step 4 can show a "carried over —
-- please review" badge. ON DELETE SET NULL (not CASCADE): deleting the
-- source application later must not delete the clone's own rows, only
-- forget which application they came from — same pattern as
-- ai_usage_log.application_id.

alter table public.application_items
  add column cloned_from_application_id uuid references public.applications (id) on delete set null;

comment on column public.application_items.cloned_from_application_id is
  'Set when this row was carried over from a previous application via the P6.5 reuse feature. Drives the "carried over — please review" badge on Step 4. Null for freshly extracted or manually entered items.';

-- The P6.2 comment on rubric_criterion_link referenced "P6.5 (Playbook
-- Infrastructure)" — P6.5 no longer builds a rubric table (see
-- ADR-DATA-006's 2026-07-14 amendment). Corrected to point at the real
-- future home (P6.7) rather than leave a stale forward-reference.
comment on column public.application_items.rubric_criterion_link is
  'No FK constraint yet - the rubric-criteria table does not exist. Tracked as an explicit P6.7 task (ADR-TRACEABILITY.md), not P6.5 — constraint added when that table is built.';
