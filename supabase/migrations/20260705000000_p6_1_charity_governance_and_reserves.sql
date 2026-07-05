-- =============================================================================
-- Grant Pathway — Migration: P6.1 Profile Schema Extension (ADR-DATA-006, R13)
-- =============================================================================
-- Authority: docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md
--            (Phase 0 / P6.1), ADR-DATA-006 consequence 6
-- Scope: minimal — only the fields needed for the governance facts and the one
--        derived ratio named in R13 (Walton, MK Community Foundation). Does
--        NOT build out the rest of the documented-but-unimplemented "thick
--        profile" fields (address/contact, total_income, employee/volunteer
--        counts, salary bands, supporting-doc booleans) — that gap between
--        data-model.md and the live schema pre-dates this migration and is
--        out of scope here.
-- All columns are nullable and additive: existing rows and code paths that
-- don't reference these columns are unaffected.
-- =============================================================================

-- total_expenditure: total expenditure from latest signed accounts (£).
-- Already documented in data-model.md section 2.4 but never implemented;
-- added now because it is the denominator of the reserves ratio below.
alter table public.charity_profiles
  add column if not exists total_expenditure integer
    check (total_expenditure is null or total_expenditure >= 0);

-- reserves: unrestricted/free reserves held by the charity (£), as charity-
-- entered. Not previously documented anywhere — new for R13. Combined with
-- total_expenditure to display "months of reserve cover" (reserves ÷
-- (total_expenditure / 12)) during profile setup.
alter table public.charity_profiles
  add column if not exists reserves integer
    check (reserves is null or reserves >= 0);

-- trustees_related: whether any trustees are related to each other by family
-- or business relationship (Walton Charity governance-facts eligibility test).
alter table public.charity_profiles
  add column if not exists trustees_related boolean;

-- bank_signatory_count: number of people authorised as bank signatories
-- (Walton, MK Community Foundation governance-facts eligibility tests).
alter table public.charity_profiles
  add column if not exists bank_signatory_count integer
    check (bank_signatory_count is null or bank_signatory_count >= 0);

-- bank_signatories_related: whether any bank signatories are related to each
-- other or to a trustee (Walton, MK Community Foundation).
alter table public.charity_profiles
  add column if not exists bank_signatories_related boolean;
