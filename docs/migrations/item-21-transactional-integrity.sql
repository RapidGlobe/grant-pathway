-- Item 21 — Transactional Integrity
-- Run this in the Supabase SQL Editor for grant-pathway-prod (stanwaejdvlvremtffkf)
-- Both functions execute as a single transaction — either both updates succeed or neither does.

-- ---------------------------------------------------------------------------
-- approve_application
-- Sets applications.status = 'approved' and is_approved = true on all answers.
-- Raises an exception if the application is not found or not owned by p_user_id.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION approve_application(
  p_application_id uuid,
  p_user_id       uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE applications
  SET status = 'approved'
  WHERE id = p_application_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'application_not_found';
  END IF;

  UPDATE application_answers
  SET is_approved = true
  WHERE application_id = p_application_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- reopen_application
-- Resets applications back to in_progress at step 4, clears assembled_draft,
-- and resets is_approved = false on all answers.
-- Raises an exception if the application is not found or not owned by p_user_id.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reopen_application(
  p_application_id uuid,
  p_user_id       uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE applications
  SET status         = 'in_progress',
      current_step   = 4,
      draft_status   = 'in_progress',
      assembled_draft = null
  WHERE id = p_application_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'application_not_found';
  END IF;

  UPDATE application_answers
  SET is_approved = false
  WHERE application_id = p_application_id;
END;
$$;
