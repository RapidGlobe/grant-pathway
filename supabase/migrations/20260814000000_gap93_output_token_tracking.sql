-- Migration: persist input/output token counts separately on ai_usage_log
-- Resolves GAP-93 (ADR-AI-011) — ai_usage_log.token_count has only ever
-- stored the combined input+output total, which cannot answer "how close
-- to an output token ceiling are we" because input length (guideline
-- document size) dominates and varies independently of output size. GAP-52
-- added an input/output split to console logs only; this persists it so the
-- question is answerable from real data over time instead of guessed once.

alter table public.ai_usage_log
  add column input_token_count  integer,
  add column output_token_count integer;

-- ---------------------------------------------------------------------------
-- update_ai_slot_token_count — extended with optional input/output split
-- ---------------------------------------------------------------------------
-- Postgres treats a different parameter list as a distinct overload rather
-- than a replacement, so the old 3-arg signature is dropped explicitly first
-- — all three call sites (generate-summary, refine-answer, charity.ts) are
-- updated in the same pass to pass the full 5-arg form, so no caller is left
-- depending on the old signature.
drop function if exists public.update_ai_slot_token_count(uuid, uuid, integer);

-- p_token_count remains required (existing combined-total behaviour,
-- unchanged for cost monitoring). The two new params are optional so any
-- caller that only has a combined figure would still work.
create or replace function public.update_ai_slot_token_count(
  p_log_id             uuid,
  p_user_id            uuid,
  p_token_count        integer,
  p_input_token_count  integer default null,
  p_output_token_count integer default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_usage_log
  set token_count        = p_token_count,
      input_token_count  = p_input_token_count,
      output_token_count = p_output_token_count
  where id      = p_log_id
    and user_id = p_user_id;
end;
$$;

grant execute on function public.update_ai_slot_token_count to authenticated;
