-- Governance/reserves facts move from charity_profiles into the item-graph
-- Authority: design discussion 2026-07-15 (WJ chose Option C over Step 3 /
-- hybrid placement) — see docs/Implementation Plan/CHANGELOG.md same date.
--
-- The 5 governance/reserves facts added by P6.1 (20260705000000) were never
-- actually consumed anywhere (not by Step 3's summary/eligibility logic, not
-- by P6.5's clone) — collected once on /profile and left inert. They are
-- re-sited as application_items rows instead, using the item-graph's
-- existing but previously-unpopulated 'data'/'number' item types and
-- 'charity_profile' source_of_truth (ADR-DATA-006/P6.2, 20260714000000).
--
-- Scope, confirmed with WJ:
--   - Placement only this round — no AI-driven per-funder relevance
--     detection or citation. All 5 facts are always shown, every
--     application, same as today's always-shown /profile fields.
--   - No seeding between applications, including P6.5 reuse — every new
--     application's 5 governance items start blank. Enforced in
--     application code (setDraftInProgress, Step 4 fallback sync,
--     cloneApplicationForReuse), not by this migration.
--   - Old charity_profiles values are dev/test data; WJ confirmed no
--     backfill is needed before dropping the columns.
--
-- Scoping: grant-pathway-dev only, same convention as every other Phase 6
-- migration. grant-pathway-prod remains untouched and unlinked until P5.4.

-- ---------------------------------------------------------------------------
-- application_items.field_key — robust, non-fragile identity for the 5
-- system-known governance items, independent of item_label (display copy
-- only). Null for every ordinary AI-extracted narrative item.
-- ---------------------------------------------------------------------------

alter table public.application_items
  add column field_key text;

alter table public.application_items
  add constraint application_items_field_key_check
    check (
      field_key is null
      or field_key in (
        'governance_total_expenditure',
        'governance_reserves',
        'governance_trustees_related',
        'governance_bank_signatory_count',
        'governance_bank_signatories_related'
      )
    );

comment on column public.application_items.field_key is
  'Set only for the 5 system-known governance/reserves items (source_of_truth = charity_profile); null for AI-extracted narrative items. Identifies the field robustly, independent of item_label wording.';

-- ---------------------------------------------------------------------------
-- Retire the P6.1 charity_profiles columns — superseded, not extended.
-- No backfill: this is dev/test data and every application now collects
-- these facts fresh (WJ confirmed 2026-07-15).
-- ---------------------------------------------------------------------------

alter table public.charity_profiles
  drop column total_expenditure,
  drop column reserves,
  drop column trustees_related,
  drop column bank_signatory_count,
  drop column bank_signatories_related;
