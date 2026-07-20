-- Manual-add fallback for governance/reserves items (PDR-AI-008 fast-follow)
-- Authority: docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md
--
-- PDR-AI-008 (2026-07-15) decided a governance/reserves fact is only shown
-- when the AI's guideline extraction actually detects it. The residual
-- zero-signal case gets a rare, experienced-user-facing escape hatch: a
-- charity can manually add one of the 5 known facts the extraction missed,
-- via a picker scoped to that closed vocabulary only (never a free-text
-- "add any question" box).
--
-- This column distinguishes a manually-added item from an AI-detected one
-- with no citation — both otherwise look identical (guideline_reference is
-- null in each case) — so Step 4 can show an honest "Added by you" label
-- instead of a citation badge, rather than implying the funder's own
-- document asked for it.
--
-- Scoping: grant-pathway-dev only, same convention as every other Phase 6
-- migration. grant-pathway-prod remains untouched and unlinked until P5.4.

alter table public.application_items
  add column added_manually boolean not null default false;

comment on column public.application_items.added_manually is
  'True only for a governance/reserves item the charity added themselves via Step 4''s manual-add picker (PDR-AI-008 fast-follow), because the funder''s guidelines did not raise it. False for every AI-detected item (governance or narrative) and for any item created before this column existed. Drives the "Added by you" vs citation-badge distinction in Step 4 rendering.';
