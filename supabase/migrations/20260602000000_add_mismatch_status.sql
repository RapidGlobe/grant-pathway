-- Add 'mismatch' to the application_status enum (FR-47, DR-EL-001)
--
-- Applications in 'mismatch' state have been flagged by the AI as having a
-- clear eligibility mismatch between the charity profile and the funder's
-- criteria. They cannot be resumed to Step 4. The user must correct their
-- charity profile and create a new application.

ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'mismatch';
