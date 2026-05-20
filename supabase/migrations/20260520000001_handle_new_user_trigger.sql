-- =============================================================================
-- Auto-create user_profiles row on registration (S0.1)
-- =============================================================================
-- Supabase Auth fires this trigger after INSERT on auth.users. It reads
-- first_name, last_name, and feedback_consent from raw_user_meta_data, which
-- is populated by the signUp() options.data in actions/auth.ts.
--
-- SECURITY DEFINER: runs with the privileges of the function owner (postgres)
-- so it can INSERT into public.user_profiles even though the calling
-- transaction is not yet authenticated.
-- SET search_path = '': prevents search-path injection (Supabase recommendation).
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id, first_name, last_name, feedback_consent)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce((new.raw_user_meta_data ->> 'feedback_consent')::boolean, false)
  );
  return new;
end;
$$;

-- Drop and recreate so re-running this migration is idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
