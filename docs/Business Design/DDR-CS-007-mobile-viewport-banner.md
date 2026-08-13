---
id: DDR-CS-007
category: Component Style
status: Decided
---

# DDR-CS-007 — Mobile Viewport Banner

## Question

What should the below-768px blocking banner say and look like?

## Context

`ADR-ARCH-005` (amended 2026-08-05) decided that viewports below 768px must be **blocked**, not merely warned — a full-screen banner tells the user Grant Pathway is designed for desktop and asks them to switch to a desktop or laptop browser. This is `GAP-05`. Neither the ADR, `design-requirements.md`, nor `non-functional-requirements.md` specifies exact copy, an icon, or a visual treatment — only the behaviour ("blocks the UI," "full-screen banner"). This decision fills that gap.

The banner is the only thing a phone user (or anyone below 768px) ever sees of the product, so — per the tone-and-voice guide's "Margaret" test — it needs to explain _why_, not just refuse, and it needs to be genuinely non-dismissible per the ADR's "blocked, not warned" language.

## Options

- **Option A — Text-only banner:** A centred icon, a short heading, and a one-sentence explanation, styled consistently with the existing full-page-state pattern (`not-found.tsx`). No illustration asset needed. Fast, consistent with existing conventions, and matches the ADR's plain "tells the user... asks them to switch" wording exactly.
- **Option B — Illustrated banner:** A bespoke or stock illustration (e.g. a phone-to-laptop graphic) above the message. Warmer, but requires sourcing/creating an asset for a screen most users will never see (mobile is explicitly unsupported in v1), and risks feeling like more design investment than a Low-severity, out-of-scope-by-design screen warrants.
- **Option C — Banner with a "continue anyway" bypass link:** Same as Option A, plus a de-emphasised link letting a determined user proceed past the banner. Rejected outright — this directly contradicts the ADR's decision to _block_, not warn; the whole point of `GAP-05` is that the 640-and-below experience is not supported, so offering a bypass would silently reopen the exact gap the ADR closed.

## Decision

**Option A — text-only banner**, matching `not-found.tsx`'s established full-page-state pattern (centred flex column, `aria-hidden` Lucide icon, heading, one paragraph, literal hex colour tokens, `rem` text sizing per §8.6).

**Icon:** `MonitorSmartphone` (`lucide-react`) — a monitor-plus-phone glyph that literally depicts "switch device," and a clean first use of the icon (no existing usage elsewhere in the app to stay consistent with or conflict with).

**Copy:**

- Heading: **"Please use a desktop or laptop"**
- Body: **"Grant Pathway is designed for bigger screens, with space for funder guidelines and your draft answers side by side. Switch to a desktop or laptop browser to carry on."**

The body names a concrete, true reason (Step 4's side-by-side guidelines/draft layout, per `ADR-ARCH-005`'s own rationale for why phones specifically can't work) rather than a bare "unsupported" message, per the tone guide's "Encouraging" pillar and Plain English pillar — no breakpoint numbers or technical framing exposed to the user.

**Implementation is CSS-only** (`flex md:hidden` on the banner, `hidden md:flex` on a wrapper around the rest of the app), not JavaScript/`matchMedia` — Tailwind's default `md` breakpoint is exactly 768px in this project (no custom `--breakpoint` override), so no custom media-query code is needed, and there is no hydration-mismatch risk. See `docs/Implementation Plan/ADR-TRACEABILITY.md`'s `GAP-05` entry for the full build/verification record.

## Date Decided

2026-08-13

---

_Status: Decided_
_Created: 2026-08-13_
