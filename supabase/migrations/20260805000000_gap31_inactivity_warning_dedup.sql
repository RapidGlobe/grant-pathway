-- Deduplication guard for the inactivity-warning cron (GAP-31)
-- Authority: docs/Implementation Plan/IMPLEMENTATION-PLAN.md, P5.3b item 2
-- Source: docs/Alan Knox Audits/idempotency-plan-of-action.md (2026-06-08)
--
-- app/api/cron/inactivity-warning/route.ts selects users whose last_sign_in_at
-- falls in the 23rd month of inactivity (>=23 months ago and <24 months ago)
-- and emails each one an account-deletion warning. It kept no record of having
-- done so, so the eligible set was recomputed from scratch on every run.
--
-- The audit that raised GAP-31 described the consequence as a double-fired
-- Vercel cron sending the warning twice. Re-reading the route against its
-- schedule while building this migration shows the real behaviour is worse and
-- needs no double-fire at all: the eligibility window is a whole month wide,
-- the cron runs daily ("0 8 * * *" in vercel.json), so a user sat in that
-- window received the same "your account will be deleted in 30 days" email
-- every morning for about thirty mornings. The "in 30 days" claim was also
-- only true on the first of them.
--
-- This column records when the warning for the *current* period of inactivity
-- was sent. The cron skips a user whose last_inactivity_warned_at is later
-- than their last_sign_in_at, which makes the guard self-healing: a user who
-- signs in after being warned moves their last_sign_in_at past this timestamp,
-- so if they later go quiet for another 23 months they are warned again with
-- no reset step and no hook into the sign-in path.
--
-- Written after the send, not before, so the failure mode is a possible repeat
-- rather than a silent skip. Deleting an account with no warning at all is the
-- worse outcome -- the second half of GAP-31 is about exactly that.
--
-- Scoping: grant-pathway-dev only, same convention as every other Phase 6
-- migration. grant-pathway-prod remains untouched and unlinked until P5.4.

alter table public.user_profiles
  add column last_inactivity_warned_at timestamptz;

comment on column public.user_profiles.last_inactivity_warned_at is
  'When the inactivity warning email (Email 3) was last sent to this user. Null until first warned. The inactivity-warning cron sends only when this is null or earlier than the user''s auth.users.last_sign_in_at, so each period of inactivity produces one warning and a user who signs in again becomes eligible for a fresh one. Set after a successful send, never cleared.';

-- The four original tables carry service_role privileges that were granted ad
-- hoc outside any migration (see 20260723000000's comment, written after that
-- omission broke account deletion live on newer tables). The cron updates this
-- column with the service-role client, so state the grant explicitly here
-- rather than rely on that untracked history surviving P5.4's fresh prod push.
grant select, update on public.user_profiles to service_role;
