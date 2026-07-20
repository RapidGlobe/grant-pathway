-- One export-date timestamp shared by every format and every re-download
-- Authority: docs/PRD decisions/PDR-DH-003-export-format-and-structure.md (revision history 2026-07-17)
--
-- app/api/export/[applicationId]/route.ts previously computed the document's
-- displayed "Date:" as new Date() live on every request. WJ spotted a
-- 2-minute gap between a .txt and .docx export of the same application --
-- exporting one format then the other (or re-downloading either format
-- weeks later) showed a different date each time, for what should read as
-- one snapshot of the application.
--
-- This column is set once, the first time an application is exported in any
-- format, and never overwritten again -- every subsequent export (any
-- format, any time) reads this same value.
--
-- Distinct from last_exported_at, which is intentionally updated on every
-- export and drives the separate "you already exported this" re-export
-- warning (components/application-step5-approve.tsx) -- that column's
-- always-fresh semantics are correct and unaffected by this change.
--
-- Scoping: grant-pathway-dev only, same convention as every other Phase 6
-- migration. grant-pathway-prod remains untouched and unlinked until P5.4.

alter table public.applications
  add column first_exported_at timestamptz;

comment on column public.applications.first_exported_at is
  'Timestamp of this application''s very first export (any format). Set once, never overwritten -- every export document (.docx or .txt), on every download including future re-downloads, shows this same date rather than the moment of that particular request. Null until first export. Distinct from last_exported_at, which updates on every export for the re-export warning.';
