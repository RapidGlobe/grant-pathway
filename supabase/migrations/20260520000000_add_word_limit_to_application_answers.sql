-- Add word_limit to application_answers
-- Omitted from initial schema (20260519000000_initial_schema.sql) during P3.1.
-- Specified in ADR-DATA-001, technical-design.md Section 12, and ADR-AI-004.
-- Populated by the AI Summary step (Slice 5) when questions are extracted from
-- funder guidelines; passed to the draft-answer prompt as a per-question
-- constraint (Slice 6). Nullable — not all funders specify a word limit.

alter table public.application_answers
  add column word_limit integer;
