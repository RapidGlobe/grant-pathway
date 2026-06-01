-- =============================================================================
-- Grant Pathway — Migration: Add char_limit and limit_type to application_answers
-- =============================================================================
-- Authority: data-model.md section 4 (BD-05), DR-FD-001
-- Resolves: D-IT-01 (Step 4 upsert failing silently — char_limit and
--           limit_type columns referenced in code but not in schema)
-- =============================================================================

-- char_limit: stores the character limit for this question when the funder
-- specifies character limits rather than word limits (e.g. Idlewild Trust
-- uses 800 and 1600 character limits). Null if no character limit applies.
alter table public.application_answers
  add column if not exists char_limit integer;

-- limit_type: records whether this question has a word limit, character limit,
-- or no limit at all. Drives the Step 4 counter display:
--   'words'      → counter shows "X / 400 words"
--   'characters' → counter shows "X / 800 characters"
--   'none'       → counter shows "X words" (no limit)
--   null         → treated as 'none' for backwards compatibility
alter table public.application_answers
  add column if not exists limit_type text
    check (limit_type in ('words', 'characters', 'none'));
