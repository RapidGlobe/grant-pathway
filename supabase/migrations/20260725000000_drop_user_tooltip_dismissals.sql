-- PDR-UI-008 simplification, 2026-07-25 — contextual tooltips no longer
-- persist dismissed-state. WJ concluded server-side persistence (this
-- table), a self-service reset control, and 5 trigger variants were
-- over-engineered for a pre-launch product: the missing-migration incident
-- earlier the same day, plus the cross-device-state complexity it added,
-- outweighed the value over a plain hover/focus tooltip. Tooltips are now
-- an ordinary Tooltip with no dismiss button and no memory (see
-- components/contextual-tooltip.tsx).
--
-- Policies and grants on this table are dropped automatically with it.

drop table if exists public.user_tooltip_dismissals;
