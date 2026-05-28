-- S6.3 — Q&A model: extend ai_request_type enum with new request types
-- Spec: docs/Implementation Plan/IMPLEMENTATION-PLAN.md (S6.3, S6.6, S6.7)
--
-- IMPORTANT: ALTER TYPE ... ADD VALUE cannot run inside a transaction in
-- PostgreSQL 15. Apply this file via the Supabase SQL Editor (not the CLI),
-- or run each statement individually outside a transaction block.
--
-- The existing 'draft_generation' value is kept for historical ai_usage_log rows.

-- Per-question AI assist call: POST /api/refine-answer (S6.6)
alter type public.ai_request_type add value if not exists 'refine_answer';

-- Final assembly call: POST /api/assemble-draft (S6.7)
alter type public.ai_request_type add value if not exists 'assemble_draft';
