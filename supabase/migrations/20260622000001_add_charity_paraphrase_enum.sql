-- Migration: Add charity_paraphrase value to ai_request_type enum
-- Resolves enum completeness for charity paraphrase usage logging.
--
-- IMPORTANT: ALTER TYPE ... ADD VALUE cannot run inside a transaction in
-- PostgreSQL 15. Apply this file via the Supabase SQL Editor (not the CLI),
-- or run the statement individually outside a transaction block.
--
-- The existing enum values are kept for historical ai_usage_log rows.

alter type public.ai_request_type add value if not exists 'charity_paraphrase';
