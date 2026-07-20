-- P6.2 — Application Item-Graph Data Model (compatibility mode)
-- Authority: ADR-DATA-006 (item-graph model), ADR-DATA-007 (guideline
-- reference shape), IMPLEMENTATION-PLAN.md P6.2.
--
-- application_answers is superseded, not extended (ADR-DATA-006 consequence
-- 1) — this creates a new table, copies every existing row across as a
-- narrative item with zero information loss, repoints the two dependent
-- RPCs, then drops the old table. Compatibility mode: only item_type =
-- 'narrative' is ever written here; new item types are added by P6.3
-- onward, driven by the curation queue, not built speculatively.
--
-- Proves out against MK Community Foundation — Oak Grants (the only funder
-- currently re-verified against schema, chosen 2026-07-13) before any other
-- funder is migrated (build plan's no-big-bang-cutover principle).
--
-- Scoping confirmed with WJ 2026-07-13: grant-pathway-dev only.
-- grant-pathway-prod remains untouched and unlinked until P5.4.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.application_item_type as enum (
  'narrative',
  'data',
  'date',
  'number',
  'table',
  'file',
  'consent',
  'eligibility_gate',
  'scoring_criterion',
  'manual_action'
);

create type public.item_source_of_truth as enum (
  'user_input',
  'charity_profile',
  'derived',
  'disclosure'
);

create type public.item_validation_mode as enum (
  'hard_check',
  'judgement_flag'
);

create type public.item_output_mode as enum (
  'generic_export',
  'native_template_fill'
);

-- ---------------------------------------------------------------------------
-- application_items
-- ---------------------------------------------------------------------------
-- user_id denormalised as on application_answers, for the same RLS reason.
-- item_order is unique within each application, as question_order was.

create table public.application_items (
  id                     uuid                          primary key default gen_random_uuid(),
  application_id         uuid                          not null references public.applications (id) on delete cascade,
  user_id                uuid                          not null references auth.users (id) on delete cascade,
  item_type              public.application_item_type  not null,
  item_label             text                          not null,
  item_order             integer                       not null,
  visibility_condition   jsonb,
  source_of_truth        public.item_source_of_truth   not null,
  validation_mode        public.item_validation_mode,
  rubric_criterion_link  uuid,
  decision_maker_visible boolean                       not null default true,
  output_mode            public.item_output_mode       not null default 'generic_export',
  guideline_reference    jsonb,
  word_limit             integer,
  char_limit             integer,
  limit_type             text,
  is_budget_question     boolean                       not null default false,
  answer_text            text,
  ai_refined_answer      text,
  answer_source          public.answer_source,
  is_approved            boolean                       not null default false,
  created_at             timestamptz                   not null default now(),
  updated_at             timestamptz                   not null default now(),
  unique (application_id, item_order),
  constraint application_items_limit_type_check
    check (limit_type in ('words', 'characters', 'none')),
  constraint application_items_output_mode_check
    -- native_template_fill is permanently out of scope (ADR-DATA-006
    -- 2026-07-11 amendment), not deferred — enforced here, not just by
    -- convention. Lifting this requires an ADR amendment first.
    check (output_mode = 'generic_export'),
  constraint application_items_guideline_reference_shape
    -- ADR-DATA-007 discriminated union: source_type 'page' requires
    -- page_number and forbids heading_path, 'heading' the reverse; quote
    -- is always required when a reference exists at all. Null throughout
    -- compatibility mode — populated once P6.3's extraction rewrite lands.
    check (
      guideline_reference is null
      or (
        guideline_reference ? 'source_type'
        and guideline_reference ? 'quote'
        and (
          (guideline_reference ->> 'source_type' = 'page'
            and guideline_reference ? 'page_number'
            and not (guideline_reference ? 'heading_path'))
          or
          (guideline_reference ->> 'source_type' = 'heading'
            and guideline_reference ? 'heading_path'
            and not (guideline_reference ? 'page_number'))
        )
      )
    )
);

comment on table public.application_items is
  'Item-graph model (ADR-DATA-006), compatibility mode. Supersedes application_answers. Only item_type = narrative is populated until P6.3 extends extraction.';
comment on column public.application_items.rubric_criterion_link is
  'No FK constraint yet - the rubric table does not exist until P6.5 (Playbook Infrastructure). Constraint added then.';

-- ---------------------------------------------------------------------------
-- Data migration — copy every existing row across as a narrative item
-- ---------------------------------------------------------------------------

insert into public.application_items (
  id, application_id, user_id, item_type, item_label, item_order,
  source_of_truth, decision_maker_visible, output_mode,
  word_limit, char_limit, limit_type, is_budget_question,
  answer_text, ai_refined_answer, answer_source, is_approved,
  created_at, updated_at
)
select
  id, application_id, user_id, 'narrative', question_text, question_order,
  'user_input', true, 'generic_export',
  word_limit, char_limit, limit_type, is_budget_question,
  answer_text, ai_refined_answer, answer_source, is_approved,
  created_at, updated_at
from public.application_answers;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create trigger set_updated_at
  before update on public.application_items
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (hardened form per 20260622000003_rls_hardening.sql)
-- ---------------------------------------------------------------------------

alter table public.application_items enable row level security;

create policy "application_items: select own"
  on public.application_items for select
  using (user_id = (select auth.uid()));

create policy "application_items: insert own"
  on public.application_items for insert
  with check (user_id = (select auth.uid()));

create policy "application_items: update own"
  on public.application_items for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "application_items: delete own"
  on public.application_items for delete
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Table-level grants — Supabase requires these explicitly, see
-- 20260521000000_grant_table_permissions.sql
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.application_items to authenticated;

-- ---------------------------------------------------------------------------
-- Repoint approve_application / reopen_application (item21) at the new table
-- ---------------------------------------------------------------------------

create or replace function approve_application(
  p_application_id uuid,
  p_user_id       uuid
)
returns void
language plpgsql
security invoker
as $$
begin
  update applications
  set status = 'approved'
  where id = p_application_id
    and user_id = p_user_id;

  if not found then
    raise exception 'application_not_found';
  end if;

  update application_items
  set is_approved = true
  where application_id = p_application_id;
end;
$$;

create or replace function reopen_application(
  p_application_id uuid,
  p_user_id       uuid
)
returns void
language plpgsql
security invoker
as $$
begin
  update applications
  set status          = 'in_progress',
      current_step    = 4,
      draft_status    = 'in_progress',
      assembled_draft = null
  where id = p_application_id
    and user_id = p_user_id;

  if not found then
    raise exception 'application_not_found';
  end if;

  update application_items
  set is_approved = false
  where application_id = p_application_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Drop the superseded table (ADR-DATA-006: superseded, not extended)
-- ---------------------------------------------------------------------------

drop table public.application_answers;

-- ---------------------------------------------------------------------------
-- Drop funders.funder_type (ADR-DATA-006 consequence 5 — formally supersedes
-- DR-FD-001's funder_type concept; was already unused low-priority cleanup)
-- ---------------------------------------------------------------------------

alter table public.funders drop column funder_type;
