-- S6.3 — Q&A model: column additions for per-question AI refinement and assembly
-- Spec: docs/Implementation Plan/IMPLEMENTATION-PLAN.md (S6.3)
-- Design: docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md
--
-- Apply via Supabase SQL Editor or CLI.
-- Note: enum additions for ai_request_type are in 20260528000001_add_qa_model_enum_values.sql
-- and must be applied in a separate step (ALTER TYPE ADD VALUE cannot run inside a transaction).

-- ---------------------------------------------------------------------------
-- application_answers — two new columns
-- ---------------------------------------------------------------------------

-- Stores the AI-improved version of the user's answer when they click
-- "Help me improve this". NULL = user has not requested AI refinement.
alter table public.application_answers
  add column ai_refined_answer text;

-- Marks questions that ask for financial/budget data (income, expenditure,
-- projections, funding breakdown). Set from AiSummaryData.questions[n].is_budget_question.
-- The Step 4 UI disables the AI assist button on rows where this is true.
alter table public.application_answers
  add column is_budget_question boolean not null default false;

-- ---------------------------------------------------------------------------
-- applications — two new columns
-- ---------------------------------------------------------------------------

-- The final assembled application text, written by POST /api/assemble-draft (S6.7).
-- NULL until the charity has answered all questions and triggered assembly.
-- Step 5 export reads from this column rather than reassembling from answer rows.
alter table public.applications
  add column assembled_draft text;

-- Tracks progress through the Step 4 Q&A workflow:
--   not_started       → user has not yet seen the preparation checklist
--   in_progress       → preparation checklist passed; user is writing answers
--   ready_to_assemble → all questions answered; awaiting senior review confirmation
--   assembled         → /api/assemble-draft has completed; assembled_draft is populated
--   exported          → at least one export download has occurred
alter table public.applications
  add column draft_status text not null default 'not_started'
    check (draft_status in (
      'not_started',
      'in_progress',
      'ready_to_assemble',
      'assembled',
      'exported'
    ));
