-- Migration: Atomic AI cap check RPC functions
-- Resolves F-01-02 (TOCTOU cap atomicity) — §2.2 item 16, Alan Knox (LAUNCH-BLOCKER)
--
-- Replaces the manual count-then-insert pattern in the three AI routes and
-- charity action with three SECURITY DEFINER functions that serialise
-- concurrent calls from the same user using a Postgres advisory lock.
--
-- Flow:
--   1. App calls reserve_ai_slot (before Bedrock) — checks cap, inserts placeholder
--   2. App calls Bedrock
--   3a. On success: app calls update_ai_slot_token_count
--   3b. On failure: app calls cancel_ai_slot (returns the slot to the user)

-- ---------------------------------------------------------------------------
-- reserve_ai_slot
-- ---------------------------------------------------------------------------
-- Atomically checks the monthly cap and reserves a log slot.
-- Returns: { allowed, log_id, approaching_limit, current_usage }
--
-- Uses pg_advisory_xact_lock to serialise concurrent calls from the same user
-- so that two simultaneous requests cannot both pass the cap check.
create or replace function public.reserve_ai_slot(
  p_user_id               uuid,
  p_application_id        uuid,
  p_request_type          public.ai_request_type,
  p_monthly_cap           integer,
  p_approaching_threshold integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_of_month timestamptz;
  v_count          integer;
  v_new_id         uuid;
begin
  -- Serialise concurrent calls for the same user. hashtext is a stable,
  -- deterministic Postgres function. The lock is released at transaction end.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  v_start_of_month := date_trunc('month', now());

  select count(*) into v_count
  from public.ai_usage_log
  where user_id   = p_user_id
    and created_at >= v_start_of_month;

  if v_count >= p_monthly_cap then
    return jsonb_build_object(
      'allowed',           false,
      'log_id',            null,
      'approaching_limit', false,
      'current_usage',     v_count
    );
  end if;

  -- Reserve the slot; token_count is updated after the Bedrock call succeeds.
  insert into public.ai_usage_log (user_id, application_id, request_type, token_count)
  values (p_user_id, p_application_id, p_request_type, null)
  returning id into v_new_id;

  v_count := v_count + 1;

  return jsonb_build_object(
    'allowed',           true,
    'log_id',            v_new_id,
    'approaching_limit', v_count >= p_approaching_threshold,
    'current_usage',     v_count
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- update_ai_slot_token_count
-- ---------------------------------------------------------------------------
-- Sets the token_count on a reserved log row after a successful Bedrock call.
-- SECURITY DEFINER bypasses the INSERT-only RLS on ai_usage_log.
create or replace function public.update_ai_slot_token_count(
  p_log_id      uuid,
  p_user_id     uuid,
  p_token_count integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_usage_log
  set token_count = p_token_count
  where id      = p_log_id
    and user_id = p_user_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- cancel_ai_slot
-- ---------------------------------------------------------------------------
-- Deletes the reserved log row when the Bedrock call fails, returning the
-- slot so the user's monthly count is not decremented by a service error.
-- SECURITY DEFINER bypasses the INSERT-only RLS on ai_usage_log.
create or replace function public.cancel_ai_slot(
  p_log_id  uuid,
  p_user_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.ai_usage_log
  where id      = p_log_id
    and user_id = p_user_id;
end;
$$;

-- Grant execute to authenticated users
grant execute on function public.reserve_ai_slot           to authenticated;
grant execute on function public.update_ai_slot_token_count to authenticated;
grant execute on function public.cancel_ai_slot            to authenticated;
