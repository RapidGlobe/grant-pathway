-- =============================================================================
-- Grant Pathway v1 — Initial Schema
-- =============================================================================
-- Authority: data-model.md (supersedes technical-design.md Section 6 and
--            ADR-DATA-001 where they conflict — per plan resolution D30)
-- RLS matrix: ADR-SEC-002
-- Status values: D6 resolution (not_started/in_progress/approved/exported)
-- answer_source: D12 resolution
-- lookup_source: D14 resolution
-- No last_login_at on user_profiles: D11 resolution (use auth.users.last_sign_in_at)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------

create type public.application_status as enum (
  'not_started',
  'in_progress',
  'approved',
  'exported'
);

create type public.answer_source as enum (
  'ai_generated',
  'user_edited',
  'user_written'
);

create type public.ai_request_type as enum (
  'guideline_summary',
  'draft_generation'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- user_profiles
-- Stores application-level user data not held by Supabase Auth natively.
-- user_id is the FK to auth.users — NOT the same as id (per data-model.md D30).
create table public.user_profiles (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null unique references auth.users (id) on delete cascade,
  first_name     text        not null,
  last_name      text        not null,
  feedback_consent boolean   not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- charity_profiles
-- One per user. lookup_source records whether data came from Charity Commission
-- API or was entered manually (informational only, not enforced by constraint).
create table public.charity_profiles (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null unique references auth.users (id) on delete cascade,
  charity_name          text        not null,
  registration_number   text,
  what_charity_does     text        not null,
  who_charity_helps     text        not null,
  where_charity_works   text        not null,
  lookup_source         text        check (lookup_source in ('charity_commission', 'manual')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- applications
-- last_exported_at is updated on every export, not just the first (data-model.md).
-- Funder guidelines text is never stored here — session only (ADR-DATA-002).
create table public.applications (
  id               uuid                    primary key default gen_random_uuid(),
  user_id          uuid                    not null references auth.users (id) on delete cascade,
  funder_name      text                    not null,
  grant_name       text                    not null,
  status           public.application_status not null default 'not_started',
  current_step     integer                 not null default 1 check (current_step between 1 and 5),
  ai_summary       text,
  last_exported_at timestamptz,
  created_at       timestamptz             not null default now(),
  updated_at       timestamptz             not null default now()
);

-- application_answers
-- user_id is denormalised here to keep RLS simple (avoids subquery joins).
-- question_order is unique within each application.
-- Re-opening an application resets is_approved = false on all rows (data-model.md).
create table public.application_answers (
  id             uuid                  primary key default gen_random_uuid(),
  application_id uuid                  not null references public.applications (id) on delete cascade,
  user_id        uuid                  not null references auth.users (id) on delete cascade,
  question_text  text                  not null,
  question_order integer               not null,
  answer_text    text,
  answer_source  public.answer_source,
  is_approved    boolean               not null default false,
  created_at     timestamptz           not null default now(),
  updated_at     timestamptz           not null default now(),
  unique (application_id, question_order)
);

-- ai_usage_log
-- INSERT-only for users. UPDATE and DELETE are denied via RLS (ADR-SEC-002).
-- application_id is nullable — set to NULL if the parent application is deleted.
-- token_count populated from Bedrock API response for cost monitoring (PDR-AI-005).
create table public.ai_usage_log (
  id             uuid                    primary key default gen_random_uuid(),
  user_id        uuid                    not null references auth.users (id) on delete cascade,
  application_id uuid                    references public.applications (id) on delete set null,
  request_type   public.ai_request_type  not null,
  token_count    integer,
  created_at     timestamptz             not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.charity_profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.applications
  for each row execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.application_answers
  for each row execute function public.handle_updated_at();

-- (ai_usage_log has no updated_at — it is append-only)

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.user_profiles       enable row level security;
alter table public.charity_profiles    enable row level security;
alter table public.applications        enable row level security;
alter table public.application_answers enable row level security;
alter table public.ai_usage_log        enable row level security;

-- user_profiles
create policy "user_profiles: select own"
  on public.user_profiles for select
  using (user_id = auth.uid());

create policy "user_profiles: insert own"
  on public.user_profiles for insert
  with check (user_id = auth.uid());

create policy "user_profiles: update own"
  on public.user_profiles for update
  using (user_id = auth.uid());

create policy "user_profiles: delete own"
  on public.user_profiles for delete
  using (user_id = auth.uid());

-- charity_profiles
create policy "charity_profiles: select own"
  on public.charity_profiles for select
  using (user_id = auth.uid());

create policy "charity_profiles: insert own"
  on public.charity_profiles for insert
  with check (user_id = auth.uid());

create policy "charity_profiles: update own"
  on public.charity_profiles for update
  using (user_id = auth.uid());

create policy "charity_profiles: delete own"
  on public.charity_profiles for delete
  using (user_id = auth.uid());

-- applications
create policy "applications: select own"
  on public.applications for select
  using (user_id = auth.uid());

create policy "applications: insert own"
  on public.applications for insert
  with check (user_id = auth.uid());

create policy "applications: update own"
  on public.applications for update
  using (user_id = auth.uid());

create policy "applications: delete own"
  on public.applications for delete
  using (user_id = auth.uid());

-- application_answers
create policy "application_answers: select own"
  on public.application_answers for select
  using (user_id = auth.uid());

create policy "application_answers: insert own"
  on public.application_answers for insert
  with check (user_id = auth.uid());

create policy "application_answers: update own"
  on public.application_answers for update
  using (user_id = auth.uid());

create policy "application_answers: delete own"
  on public.application_answers for delete
  using (user_id = auth.uid());

-- ai_usage_log — SELECT and INSERT only; UPDATE and DELETE denied (ADR-SEC-002)
create policy "ai_usage_log: select own"
  on public.ai_usage_log for select
  using (user_id = auth.uid());

create policy "ai_usage_log: insert own"
  on public.ai_usage_log for insert
  with check (user_id = auth.uid());

-- UPDATE and DELETE policies are intentionally omitted — default-deny blocks them.
-- This prevents users from deleting usage history to bypass the 20 req/month limit.

-- ---------------------------------------------------------------------------
-- Storage: guidelines-temp bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guidelines-temp',
  'guidelines-temp',
  false,
  10485760,  -- 10 MB (ADR-FILE-002)
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Storage RLS: users can upload, read, and delete only within their own folder.
-- Files are stored at guidelines-temp/<user_id>/<filename>.
create policy "storage: upload own guidelines"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'guidelines-temp'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: read own guidelines"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'guidelines-temp'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: delete own guidelines"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'guidelines-temp'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
