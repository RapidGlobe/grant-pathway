# Grant Pathway — Design & Decision Changelog

**Purpose:** This log records every significant change to the original design of Grant Pathway, together with the reason for each change. Use it to refresh context on why the design evolved, without having to re-read all the source documents.

**Authoritative sources:** When this log refers to a decision record, the full rationale lives in the linked file. This log summarises; the ADR or DR is the definitive record.

> **Phase 0–4 entries** (up to 2026-05-22) have been moved to [CHANGELOG-ARCHIVE.md](CHANGELOG-ARCHIVE.md) to keep this file manageable. All entries are preserved in full.

---

## 2026-06-21 — Edge middleware wired up; IDOR/BOLA fix

### 1. middleware.ts created — edge middleware now active (ADR-SEC-001)

**What changed:**

- `middleware.ts` created at project root — exports `proxy` as `middleware` and re-exports `config` from `proxy.ts`.

**Why:**

At Phase 0 bootstrap, a comment in `proxy.ts` incorrectly stated that Next.js 16 renamed `middleware.ts` to `proxy.ts`. Next.js has never made this change — the framework always looks for `middleware.ts` at the project root. The auth logic in `proxy.ts` was correctly written at P3.4 (2026-05-19) but was never connected to the Next.js middleware pipeline. As a result, the edge-level route protection (redirect unauthenticated users from protected routes, redirect authenticated users away from auth-only routes, refresh session tokens on every request) was never executing. The gap was masked by server-side auth checks on every API route and RLS on every table. The fix is a single re-export file. Discovered during a vibe-coding security review on 2026-06-21.

---

### 2. IDOR/BOLA fix: applicationId ownership check added to /api/upload/process

**What changed:**

- `app/api/upload/process/route.ts` — added an ownership verification query before processing. The route now checks that the supplied `applicationId` belongs to the authenticated user (`eq('user_id', user.id)`) before downloading or processing the file. Returns `404` if the check fails.

**Why:**

A security review identified that this route accepted `applicationId` from the request body without verifying ownership. Every other sensitive API route in the application (export, generate-summary, generate-draft, refine-answer) already enforced ownership via a `user_id` column check, but `/api/upload/process` was missing that guard. An authenticated user could have passed another user's `applicationId` in the request body to associate a processed file with an application they do not own — a Broken Object Level Authorisation (BOLA/IDOR) vulnerability. The fix adds the same ownership pattern already in use across all other routes.

Note: the risk was partially mitigated by all IDs being UUIDs (not guessable sequential integers) and by the file `path` being namespaced by the uploader's own `user.id`. The ownership check closes the gap fully.

---

## 2026-06-17 — Privacy policy Section 7 corrected; legal docs consolidated to docs/legal/; generate-draft cap aligned to 50

Three issues found and fixed during the Phase 4→5 gate ADR re-review session (ADR-SEC-005 and ADR-DATA-005):

### 1. generate-draft monthly cap corrected from 20 → 50

**What changed:**

- `app/api/generate-draft/route.ts` — `MONTHLY_CAP` raised from 20 to 50; `APPROACHING_LIMIT_THRESHOLD` raised from 16 to 40.
- `docs/Technical Decision and Design/ADR-SEC-005-api-rate-limiting.md` — Context and Decision sections updated to state 50 req/month throughout; revision history row added.

**Why:**
`MONTHLY_CAP` on `generate-draft` was never updated when the monthly cap was raised to 50 on 2026-05-28 (Step 4 redesign). The 2026-06-08 readiness review confirmed `generate-summary` and `refine-answer` both enforced 50 but missed `generate-draft`. Users had a cap of 20 on draft generation while the other two AI routes enforced 50 — discovered during ADR-SEC-005 re-review.

### 2. Privacy policy Section 7 — incorrect GDPR disclosure on live /privacy page

**What changed:**

- `docs/legal/privacy-policy.md` — Already correct (updated when ADR-DATA-005 was decided, 2026-05-26).
- `docs/privacy-policy.md` (root level, now deleted) — Section 7 incorrectly stated "we do not retain a backup of your data after deletion". This was the file the live `/privacy` page was actually serving. Corrected before deletion to accurately disclose the 7-day automated backup retention window (Supabase Pro daily backups, eu-west-2).

**Why:**
The live `/privacy` page routed to the root-level `docs/privacy-policy.md`, which was not updated when ADR-DATA-005 introduced the 7-day backup commitment on 2026-05-26. The `docs/legal/privacy-policy.md` file had the correct disclosure, but the app was reading the wrong file. This was a GDPR Article 17 compliance gap: users were told no backup is retained after deletion, but Supabase Pro retains automated daily backups for 7 days before rotation.

### 3. Legal docs consolidated to docs/legal/ as single authoritative location

**What changed:**

- `docs/privacy-policy.md` and `docs/terms-of-service.md` (root level) — deleted via `git rm`.
- `app/(public)/privacy/page.tsx` — `readFile` path updated from `docs/privacy-policy.md` to `docs/legal/privacy-policy.md`.
- `app/(public)/terms/page.tsx` — `readFile` path updated from `docs/terms-of-service.md` to `docs/legal/terms-of-service.md`.

**Why:**
Two copies of each legal document existed and had drifted. `docs/legal/` was already the location of the authoritative privacy policy (since ADR-DATA-005 on 2026-05-26) but the page routes still served the root-level copies. Consolidation to `docs/legal/` as the single location eliminates the drift risk.

> **Correction to 2026-06-10 entry below:** The 2026-06-10 "Terms of Service and Privacy Policy pages live" entry states the pages read from `docs/terms-of-service.md` and `docs/privacy-policy.md`. Those root-level files have now been deleted; both pages serve from `docs/legal/` as of this entry.

---

## 2026-06-15 — Dependency updates merged and smoke tested

**What changed:**

Five Dependabot PRs merged to master (#37–#41):

| Package              | Before  | After   | Risk                        |
| -------------------- | ------- | ------- | --------------------------- |
| `@types/node`        | 25.9.1  | 25.9.3  | Low — types only            |
| `eslint-config-next` | 16.2.7  | 16.2.9  | Low — dev/lint only         |
| `lucide-react`       | 1.17.0  | 1.18.0  | Low — icons only            |
| `@anthropic-ai/sdk`  | 0.100.1 | 0.104.1 | Medium — core AI library    |
| `@supabase/ssr`      | 0.10.3  | 0.12.0  | Medium — auth/session layer |

**Why:**

Routine dependency hygiene. The `@supabase/ssr` bump (0.10.3 → 0.12.0) rewrote the cookie architecture but our codebase already used the `getAll`/`setAll` interface introduced in 0.5.0, so no code changes were required. The `@anthropic-ai/sdk` bump (0.100.1 → 0.104.1) included minor API additions; no breaking changes to our usage patterns.

**Smoke test result (2026-06-15, local dev):**

- Login / session persistence ✅ (Supabase SSR auth layer working)
- Dashboard data load ✅ (3 applications rendered, AI usage counter correct)
- Step 4 Q&A interface ✅ (page loads, question sections populated from DB)
- AI "Help me improve this" ✅ (`/api/refine-answer` returned 200, 317 tokens via Bedrock, suggestion rendered in UI)
- No console errors on any tested page

Note: the `.next` build cache from the previous dev server run needed to be cleared before the step pages would compile correctly under the new versions. No code changes required.

---

## 2026-06-13 — Final Grant Pathway logo implemented

**What changed:**

- `components/logo.tsx` — replaced hand-coded SVG placeholder with `next/image` referencing the real brand asset (`/public/images/logo.png`). The PNG was created in Canva AI and exported with transparent background (1562×560px).
- `public/images/logo.png` — final logo: teal arc + orange person figure icon, "Grant Pathway" two-word wordmark in dark teal. Works on all white/light backgrounds used by both navs.
- `public/images/logo-white-wordmark.png` — retained for dark/teal background contexts (emails etc.).

**Why:**
After multiple iterations attempting to hand-code the original logo as SVG (blocked by Canva exporting raster PNGs disguised as SVG), the decision was made to create a new logo using Canva AI with clear brand requirements. The new design is cleaner, more scalable, and professionally executed.

---

## 2026-06-12 — Logo icon mark updated to match brand design

**What changed:**

- `components/logo.tsx` — Placeholder SVG icon replaced with hand-coded SVG accurately matching the Canva brand asset. The icon mark is three orange elements: a head circle (top), a tall left vertical bar, and a G-arc with horizontal crossbar. The dark wordmark ("Grant" in teal, "Pathway" in dark) is retained — it works on white/light backgrounds used by both navs.
- `public/images/logo-white-wordmark.png` — Canva export (transparent background, white wordmark) added for use in dark/teal contexts such as email templates.

**Why:**
The Canva-exported SVG file was a base64-encoded PNG embedded in an SVG wrapper (309 KB), not a true vector. The PNG export has a white wordmark suitable only for dark backgrounds, while both nav bars use `bg-white`. The solution is a hand-coded SVG icon mark (faithful to the brand) combined with the existing CSS text wordmark, giving correct rendering on all backgrounds without needing multiple PNG variants in the component.

---

## 2026-06-12 — Two-factor authentication removed (FR-07 demoted to Won't Have)

**What changed:**

- `components/account-settings-form.tsx` — MFA section removed from Account Settings UI. `mfaEnabled` and `mfaFactorId` props removed.
- `app/(authenticated)/account/page.tsx` — `supabase.auth.mfa.listFactors()` call removed; component now only reads email.
- `actions/auth.ts` — `mfaEnroll`, `mfaVerifyEnrollment`, `mfaUnenroll`, `verifyMfaSignIn` actions removed. MFA assurance-level check and `/mfa` redirect removed from `signIn`.
- `docs/moscow-feature-register.md` — FR-07 demoted from Should Have to Won't Have.
- `docs/non-functional-requirements.md` — NFR-04 MFA row updated to reflect removal.

**Why:**
Risk analysis confirmed the worst-case password compromise is low severity for Grant Pathway: an attacker can view draft applications and charity profile data (all of which is publicly registered information for UK charities), but cannot access payment data (none exists), cannot submit applications on the charity's behalf (export is a file download the charity must manually submit), and cannot reach financial figures (never stored). The marginal security gain of optional MFA does not justify the friction it introduces for non-technical volunteer users — the primary persona. FR-07 was already Should Have (not Must Have); the decision is to not offer it in v1 or subsequent phases unless the product's data sensitivity materially increases.

---

## 2026-06-12 — Step 5: Back link replaced with Re-open (loop bug fix)

**What changed:**

- `components/application-step5-approve.tsx` — "Back" link removed from Step 5. "Re-open application to make changes" is now always shown, regardless of approval state. Unused `Link` import removed.
- `docs/PRD inputs/screen-requirements.md` — Back link row replaced with Re-open link row.

**Why:**
Step 4 (`app/(authenticated)/applications/[id]/step/4/page.tsx` line 49) unconditionally redirects to Step 5 when `draft_status === 'assembled'`. Since draft_status is always 'assembled' when a user reaches Step 5, clicking Back from Step 5 immediately bounced them straight back to Step 5 — an unescapable loop. The Back link gave the appearance of working navigation but never functioned. Re-open is the only correct route back to Step 4 as it resets `draft_status` to `in_progress`, clears the assembled draft, and redirects to Step 4 via the server action.

---

## 2026-06-12 — Step 5: approve + download collapsed into a single action

**What changed:**

- `components/application-step5-approve.tsx` — The separate "Approve my application" button and its confirmation modal have been removed. The download buttons (Word / plain text) are now disabled until all three confirmation checkboxes are ticked. On first click they approve the application and trigger the download in a single action. The re-export warning modal (for repeat downloads), re-open modal, and the three declaration checkboxes are all unchanged.
- `docs/PRD inputs/screen-requirements.md` — Step 5 table updated: Approve button row removed; Export buttons row updated to describe the merged approve-and-download behaviour.
- `docs/PRD inputs/acceptance-criteria.md` — AC-FR-33-01, AC-FR-33-02, AC-FR-33-03 rewritten to reflect new flow; AC-FR-39-03 updated to remove reference to the old approval button.

**Why:**
The previous flow required 6 interactions to complete a first download (3 checkbox ticks → Approve button → modal confirm → download click). The confirmation modal was redundant — three deliberate checkbox ticks already demonstrate intent; asking again immediately after added friction without adding safety. Collapsing approve + download reduces the flow to 4 interactions (3 checkbox ticks → download click) while preserving all legal declarations and the re-export / re-open safeguards.

---

## 2026-06-12 — AI suggestion card: "Use this version" renamed to "Use this improved version"

**What changed:**

- `components/application-step4-draft.tsx` — Button label on the AI suggestion card changed from _"Use this version"_ to _"Use this improved version"_.
- `docs/PRD inputs/screen-requirements.md` — AI assist button row updated to document the suggestion card buttons including the new label.
- `docs/PRD inputs/acceptance-criteria.md` — Acceptance criterion updated to match new button label.

**Why:**
The original label "Use this version" was ambiguous — it was unclear what "version" referred to without reading the surrounding context. "Use this improved version" is explicit: it tells the user exactly what they are accepting, reinforcing that the AI has refined their answer rather than replaced it.

---

## 2026-06-12 — Register button hidden on /privacy and /terms pages

**What changed:**

- `components/nav-public.tsx` — "Register — it's free" button now hidden on `/privacy` and `/terms` in addition to the existing `/register` and `/verify-email` exclusions.
- `docs/PRD inputs/screen-requirements.md` — Public navigation bar spec updated to reflect the new exclusions.

**Why:**
The register button is out of context on legal document pages. Visitors arrive there from footer links or search results to read policy content; a promotional CTA alongside legal text is inappropriate and clutters the header.

---

## 2026-06-11 — Six new funders added to dropdown (MK Community Foundation × 4, Baily Thomas × 2)

**What changed:**

- New migration `supabase/migrations/20260611000001_add_mkcf_and_baily_thomas_funders.sql` adds 6 funder rows.
- `docs/target-funder-list.md` updated to v1.1 with all 6 new entries.

**MK Community Foundation — 4 separate dropdown entries (one per grant tier):**

| Entry                                                  | funder_type | grant_range        |
| ------------------------------------------------------ | ----------- | ------------------ |
| MK Community Foundation — Seed Grants                  | structured  | Up to £750         |
| MK Community Foundation — Sapling Grants               | structured  | £750–£5,000        |
| MK Community Foundation — Oak Grants                   | structured  | £5,001–£15,000     |
| MK Community Foundation — Strategic Partnership Grants | narrative   | Above £15,000 p.a. |

Seed, Sapling and Oak use the MKCF online portal with discrete scored questions (structured). Strategic Partnership is an email EOI + invited full proposal — no portal, bespoke process (narrative).

**Baily Thomas — 2 separate dropdown entries (one per tier):**

| Entry                            | funder_type | grant_range  |
| -------------------------------- | ----------- | ------------ |
| Baily Thomas — Small Grants      | structured  | Up to £5,000 |
| Baily Thomas — General Programme | structured  | £9,000+      |

Both use the same BenefactorCloud portal with discrete word-limited fields. Learning disability focus only (eligibility confirmed in guidelines).

**Why:** WJ instruction 2026-06-11. Sources: MKCF grant criteria PDFs (Nov 2025); Baily Thomas General Application form (Mar 2024).

---

## 2026-06-10 — Register button hidden on /verify-email

**What changed:**

- `components/nav-public.tsx` — The "Register — it's free" nav button is now hidden on `/verify-email` as well as `/register`. A comment in the component records both exclusions and the reasoning.

**Why:** WJ's walkthrough test of the registration journey reached the "Email verified" screen and found the nav still offering "Register — it's free" — to a user who has just completed registration. Same circular-navigation rationale as the 2026-06-09 NavPublic clean-up (Register hidden on `/register`).

**Also checked, no change needed:** WJ reported the footer Terms/Privacy links opening in the same tab on this screen. The deployed page already serves `target="_blank"` on both (verified via curl against production) — the same-tab behaviour was a browser-cached copy of the pre-deploy page.

**Documentation updated:** `information-architecture-and-navigation.md` v1.6 (nav table); `PRD inputs/screen-requirements.md` (global elements).

---

## 2026-06-10 — Supabase production project pause warnings: accepted until Phase 5 (decision)

**What changed:** No code change. A decision was made and recorded after Supabase emailed a 7-day-inactivity pause warning for the production project `grant-pathway-prod` (ID `mvmjryipieepvsjudche`).

**Investigation findings:**

- The Vercel Pro crons are running correctly, but they generate activity on whichever Supabase project the deployment's env vars point at — and production still points at the **dev** project (P5.4 env var switch not yet done).
- The prod project therefore sits idle on the free tier, which auto-pauses after 7 days without API activity. It currently holds no schema and no data.

**Decision (Wac, 2026-06-10):** Accept the pause warnings (and any actual pause) until Phase 5, rather than activating Supabase Pro early. Rationale: nothing of value is in the prod database; a paused project restores with one click within 90 days; Phase 5 is expected within 2–3 weeks, comfortably inside that window; and ADR-DATA-005 already schedules the Pro upgrade (which permanently ends pausing and enables daily backups) for pre-go-live.

**Consequence recorded in IMPLEMENTATION-STATUS P5.4:** the opening steps of P5.4 are now (1) unpause `grant-pathway-prod`, (2) activate Supabase Pro per ADR-DATA-005, (3) apply migrations, (4) switch production env vars — with an explicit warning not to switch env vars while funder testing still runs against the production URL on the dev database.

---

## 2026-06-10 — No-dead-ends fix: footer legal links open in a new tab; public nav logo links home

**What changed:**

- `components/site-footer.tsx` — The Privacy Policy and Terms of Service footer links now open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`), matching the register form's consent-checkbox links. Each link carries a visually hidden "(opens in a new tab)" hint for screen readers.
- `components/nav-public.tsx` — The logo on the public navigation bar now links to `/` (previously deliberately unlinked). Signed-in users who click it are redirected on to `/dashboard` by the existing auth middleware.

**Why:** WJ's UX review of the new legal pages found a dead end: clicking a footer legal link navigated in the same tab, and the legal pages offered no route back (logo unlinked, only nav action "Register"). The user's sole way back was the browser Back button — a breach of the IA document's "No dead ends" principle. Worse for signed-in users: the footer appears on authenticated pages too, so the same-tab link pulled them out of an in-progress application. New-tab links fix the return journey for all footer entry points; the linked logo covers visitors who arrive at `/terms` or `/privacy` directly (search result, emailed link) and have no originating tab.

**Documentation updated:** `information-architecture-and-navigation.md` v1.5 (nav logo behaviour, footer link behaviour); `PRD inputs/screen-requirements.md` (global elements, Screen 10/11 notes).

---

## 2026-06-10 — Terms of Service and Privacy Policy pages live at /terms and /privacy

**What changed:**

- `app/(public)/terms/page.tsx` and `app/(public)/privacy/page.tsx` (new) — The legal pages now exist as routes. Each page reads its markdown source from `docs/` at build time and is statically prerendered, so `docs/terms-of-service.md` and `docs/privacy-policy.md` remain the single authoritative sources — the published page can never drift from the file a solicitor reviews.
- `components/legal-document.tsx` (new) — Shared server component rendering legal markdown with `react-markdown` + `remark-gfm` (GFM needed for the Privacy Policy's tables), styled to the app's design tokens. Headerless source tables (e.g. the company details table) have their empty header row hidden rather than rendering a blank stripe.
- **Dependencies added:** `react-markdown`, `remark-gfm`. Chosen over `@next/mdx` because the content is plain markdown read from `docs/` (not MDX pages in `app/`), needing no `next.config` changes or `mdx-components.tsx`.
- `components/site-footer.tsx` — Footer privacy link corrected from `/privacy-policy` (404) to `/privacy`, aligning with the register form's consent-checkbox link. Both legal pages are reachable from the footer (all pages) and the register form (new tab).
- `docs/privacy-policy.md` — Trailing "Last updated" date corrected from 22 May 2026 to 8 June 2026 to match the header date (the footer line was missed in the 2026-06-08 readiness review update).
- Routes are accessible in any auth state — they appear in neither the middleware's `PROTECTED` nor `AUTH_ONLY` lists, so signed-in users are not redirected away.

**Documentation updated:** `information-architecture-and-navigation.md` v1.4 (site map, route reference, access control, footer); `PRD inputs/screen-requirements.md` (Screens 10 and 11 added; stale unauthenticated-nav description from the 2026-06-09 NavPublic change also corrected); `IMPLEMENTATION-STATUS.md` (P5.1/P5.6 progress notes).

**Why:** P5.1 and P5.6 require the Terms of Service and Privacy Policy to be published, and the register form already linked to both routes — until now those links (and the footer's) led to 404s. **Still outstanding for P5.1:** the `[TO BE CONFIRMED]` effective dates in both documents must be set, and a solicitor should review both (particularly the Privacy Policy, UK GDPR) before go-live.

---

## 2026-06-09 — NavPublic: Sign in link removed; Register button hidden on /register; register form link wrapping fixed

**What changed:**

- `components/nav-public.tsx` — Two UX fixes to the public navigation bar:
  1. **"Sign in" link removed entirely.** The link pointed to `/` (the sign-in page) but appeared on every public page including the sign-in page itself — a circular no-op on that page and redundant on all others (every public-facing form already has a contextual sign-in link). Removing it de-clutters the nav without losing any user journey.
  2. **"Register — it's free" button hidden on `/register`** using `usePathname()`. When a user is already on the registration page, showing a button to navigate there is circular. The component was converted to a Client Component (`'use client'`) to support the `usePathname()` hook; the button renders on all other public pages unchanged.

- `components/register-form.tsx` — `whitespace-nowrap` class added to the Terms of Service and Privacy Policy `<a>` elements to prevent mid-phrase line breaks (e.g. "Terms of" / "Service" on separate lines).

**Why:** Both nav issues were identified during a UX review of the sign-in / registration flow. Circular or duplicate navigation links cause confusion — a user seeing "Sign in" in the nav while already on the sign-in page, or "Register" while on the registration page, questions whether they are in the right place. The wrapping fix is a polish item ensuring the consent checkbox text reads cleanly at all viewport widths.

---

## 2026-06-09 — P5.5: feedback opt-in verification and post-launch action added to implementation docs

**What changed:**

- `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — P5.5 gate checklist updated: (1) a pre-go-live test step added to verify the `feedback_consent` field in `user_profiles` is populated correctly by the `handle_new_user` Supabase trigger; (2) a post-launch reminder added to action the opt-in data (contact opted-in users) so it is not silently ignored.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — Same note added to the P5.5 gate checklist.

**Why:** The `feedbackConsent` checkbox on the register form writes to `user_profiles.feedback_consent` via a Supabase database trigger. The mechanism works in code but has not been end-to-end tested. Without an explicit gate item it could be omitted from pre-launch QA. The post-launch reminder ensures the opt-in has a defined follow-up action rather than being collected and never used.

---

## 2026-06-08 — GAP-27 partial resolution: structured latency logging + capacity plan

**What changed:**

Two parts of GAP-27 (performance observability) resolved following Knox "Readiness Testing" audit:

1. **Structured latency logging added to all three AI routes.** Each route now records `const bedrockStart = Date.now()` before the `withRetry()` call. On success, logs `[route] Bedrock latency: Xms, Y tokens`. On failure, the existing error log now includes duration: `[route] Bedrock error after retries (Xms):`. Consistent across `generate-summary`, `generate-draft`, and `refine-answer`.

2. **Capacity plan documented in NFR-03.** A "Concurrent AI generation behaviour" section added to `docs/non-functional-requirements.md` documenting expected system behaviour at launch (~10 concurrent users) and at scale (~100), the role of per-user rate limiting, and the key risk (unmeasured latency under concurrent load) to address before the first marketing push.

**What remains outstanding in GAP-27:** Sentry performance monitoring configuration, deferred to P5.4 once a production traffic baseline is established.

**Why:** Knox "Readiness Testing" article identified the absence of latency observability and a capacity plan as gaps against production readiness criteria. Both are low-effort, high-value additions before go-live.

---

## 2026-06-08 — Privacy Policy and Terms of Service readiness review; T&S corrected

**What changed:**

A readiness review of `docs/privacy-policy.md` and `docs/terms-of-service.md` was conducted against the implementation documentation set. Two inaccuracies were identified and corrected in the T&S:

- **Section 6 (Fair Use):** The stated limit of 20 AI-assisted requests per calendar month was incorrect. The implementation enforces 50 requests per calendar month (raised from 20 during Step 4 redesign, 2026-05-29). The T&S now states 50.
- **Section 8 (Intellectual Property):** The open-source licence was described vaguely as "its open-source licence". The MIT Licence is named explicitly, consistent with constraint C17.

**Remaining blockers before both documents can go live:**

| Item                              | Status                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ICO registration number           | 🔴 Outstanding — must be confirmed and inserted before publication                                   |
| Legal firm review                 | 🔴 Outstanding — not yet engaged                                                                     |
| Effective date                    | 🔴 Outstanding — set when go-live date is confirmed                                                  |
| Domain live (grantpathway.org.uk) | 🔴 Outstanding — DNS is Phase 5; Privacy Policy references this URL                                  |
| DPAs with all five providers      | ⚠️ Unverified — Supabase, Anthropic, Resend, Vercel, Sentry each need a DPA accepted; not documented |

**Items confirmed complete during review:**

| Item                                       | Evidence                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Account deletion (T&S §11, PP §7)          | S8.2 complete — cascade deletion, confirmation, redirect implemented                                            |
| Policy links in UI (registration + footer) | screen-requirements.md §registration, §footer — implemented; live URLs required before go-live                  |
| Fair-use limit enforcement (now 50/month)  | Both `generate-summary` and `refine-answer` routes enforce `MONTHLY_CAP = 50`                                   |
| Inactivity cron cadence (PP §7)            | Warning at 23 months (08:00 UTC daily), deletion at 24 months (09:00 UTC daily) — both confirmed live in Vercel |
| Sentry listed as data processor (PP §5)    | Sentry EU integrated at P3.7 — PII scrubbing via `beforeSend` confirmed                                         |

**Commit:** f4bc816

---

## 2026-06-07 — D-HSF-03 fixed (second attempt) — sync moved to Server Action; hard navigation added

**What changed (second attempt — first attempt 55c60a7 did not resolve the issue):**

- `actions/applications.ts` — `setDraftInProgress` now syncs `application_answers` from `ai_summary` before returning, ensuring rows exist in the DB before the Step 4 page renders. Return type changed from `Promise<{ ok: false; error: string }>` (redirect-on-success) to `Promise<{ ok: true } | { ok: false; error: string }>`.
- `components/application-step4-prep-checklist.tsx` — after receiving `{ ok: true }`, uses `window.location.href` (hard navigation) instead of relying on the Server Action's `redirect()` + Next.js Router Cache soft navigation.
- `app/(authenticated)/applications/[id]/step/4/page.tsx` — existing sync block retained as a fallback for returning users who navigate directly to Step 4 without going through the prep checklist.

**Why the first attempt failed (55c60a7):**
The first fix hardened the upsert in the Server Component (null filtering, explicit error checking, `ignoreDuplicates: false`). While those changes improve resilience, the actual root cause is a **Next.js Router Cache timing issue**: when `setDraftInProgress` called `redirect()` inside a `startTransition`, the router performed a soft navigation that served a cached render of Step 4 — either one from before the upsert ran, or one where the upsert ran on the server but the client received stale cached HTML. The workaround (Back → regenerate → confirm prep checklist again) worked because the two sequential Server Action redirects caused the cache to be busted differently.

**Root cause (second fix):**
Two structural problems:

1. The question sync ran in the Server Component (during page render), but the Router Cache served a stale render where `questionRows` was empty, bypassing that sync entirely.
2. `redirect()` inside `startTransition` is a soft navigation — it may reuse a cached RSC payload from the Router Cache rather than triggering a fresh server render.

The fix addresses both: sync happens in the Server Action (before any navigation), and `window.location.href` forces a full page reload (hard navigation) that bypasses the Router Cache.

**Prior hardening retained (55c60a7):** The Server Component sync block (null filtering, explicit upsert error logging, `ignoreDuplicates: false`) is retained as a robust fallback for direct navigation cases.

**Workaround (now obsolete):** Return to Step 3 and regenerate.

---

## 2026-06-05 — D-CWF-01 fixed — faith/religion conditional question exclusion

**What changed:**

- `lib/prompts.ts` — FAITH AND RELIGION QUESTIONS rule added to the `buildSummaryPrompt()` questions extraction clause. Questions asking primarily about an organisation's religious affiliation, the role of faith in its activities or governance, or whether staff/trustees are required to be of a particular religion are now excluded from extraction — they are treated as inherently conditional and must not appear as writing cards for non-faith-based organisations.

**Why the existing rule didn't catch it:**
The existing CONDITIONAL QUESTIONS rule requires the conditional qualifier to be explicitly stated in the surrounding text (e.g. "only required if applying for a vehicle"). For Clothworkers Q1, the qualifier ("If your organisation has a religious affiliation") sits on the preceding yes/no question, which is correctly excluded as a non-narrative field. This leaves the narrative follow-up question appearing as a universal question in isolation — the AI had no context that it was conditional. The new rule detects these questions by their subject matter rather than relying on the surrounding conditional text.

**Retest required:** Clothworkers must be retested to confirm Q1 no longer appears. Expected outcome: 9 questions (previously 10 with faith Q at position 1).

**Defect record:** D-CWF-01 in `docs/Test Plans/Clothworkers-Foundation-test-plan.md` — status updated to Fixed, retest required.

---

## 2026-06-05 — ADR-AI-010 testing complete; ceiling raised to 50,000; two defects logged

**Testing results — all seven required funders validated:**

| Funder                     | Time | Path        | Result                                             |
| -------------------------- | ---- | ----------- | -------------------------------------------------- |
| Garfield Weston Foundation | 34s  | PDF upload  | ✅ Pass — 3s saving vs 37s pre-preprocessing       |
| Clothworkers' Foundation   | 30s  | PDF upload  | ✅ Pass — ceiling raised to 50,000 (see below)     |
| AB Charitable Trust        | 17s  | PDF upload  | ✅ Pass — eligibility mismatch correct             |
| Idlewild Trust             | ~21s | PDF upload  | ✅ Pass — two eligibility mismatches expected      |
| Henry Smith Foundation     | 21s  | DOCX upload | ✅ Pass — IT-11 escape hatch verified (Branch B)   |
| Wolfson Foundation         | 18s  | DOCX upload | ✅ Pass — 7 sections extracted                     |
| Walton Charity             | 18s  | Paste       | ✅ Pass — 4 sections; also tested PDF upload (24s) |

All funders within NFR-01 (≤30s standard, ≤45s large document).

**PREPROCESS_CHAR_CEILING raised from 20,000 → 50,000:**
Clothworkers' PDF extracted at 97,906 characters — the 20,000 ceiling truncated the document before the application questions were reached, producing "No specific questions found" on first run. Ceiling raised to 50,000 via Vercel environment variable. Second run extracted all 9 questions in 30 seconds. The ceiling is now set as a Vercel production environment variable (`PREPROCESS_CHAR_CEILING=50000`) and does not require a code change to adjust further.

**Defects found during testing:**

- **D-CWF-01 (Medium, Open)** — Clothworkers Q1 (faith affiliation) extracted as a standard writing card for all charities. It is a conditional question applying only to faith-based organisations. The existing conditional exclusion rule in `lib/prompts.ts` does not detect this pattern. Fix: extend the prompt rule to skip faith/religious affiliation conditionals.
- **D-HSF-03 (Medium, Open)** — Step 4 shows "No specific questions found" on first load after multi-pass Step 3 flows (mismatch → profile fix → regeneration, or truncation → ceiling raised → regeneration). Sections appear correctly on second load after going Back and regenerating. Same root cause as D-HSF-02 and D-GWF-01 — Step 4 sync is fragile when `application_answers` rows exist from a prior failed/truncated summary generation. Workaround confirmed working.

**IT-11 escape hatch — first verified execution:**
Henry Smith IT-HSF-04 Branch B was executed for the first time — mismatch detected for Harry's Rainbow, profile corrected with age range and deprivation area language, reapplication passed eligibility. This was the IT-11 test deferred from Idlewild testing.

**Full decision record:** `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`

---

## 2026-06-05 — Document pre-processing implemented — ADR-AI-010 Phase 1

**What changed:**

- `lib/preprocess-text.ts` — new module. Pure function `preprocessText(raw, charCeiling?)` that:
  - Strips PDF artefacts: form feed characters, null bytes, CRLF normalisation
  - Removes page number lines (`1`, `Page 1 of 5`, `- 1 -`)
  - Removes repeated header/footer lines (identical short lines appearing 3+ times across the document)
  - Strips boilerplate sections by heading pattern: Contact Us, Privacy Policy, Data Protection, Accessibility, Equality & Diversity, Complaints, Freedom of Information, About Us, About the Foundation/Trust/Fund, Our History/Story, Disclaimer, Copyright, Website Terms. Each pattern is conservative and anchored — only exact section headings match, not headings that happen to contain those words.
  - Collapses 3+ consecutive blank lines to 2
  - Trims trailing whitespace per line
  - Applies a configurable character ceiling (default 20,000) as a safety net for very large multi-form PDFs; snaps to last newline within the final 10% to avoid mid-sentence cuts
  - Returns `{ text, wasTruncated, originalLength, processedLength }`
- `app/api/generate-summary/route.ts` — new step 6 inserted before the Bedrock call:
  - Calls `preprocessText(guidelinesText, charCeiling)` unless `DISABLE_TEXT_PREPROCESSING=true`
  - Ceiling configurable via `PREPROCESS_CHAR_CEILING` env var (defaults to 20,000)
  - Logs `[generate-summary] pre-processing: N → M chars` on every call
  - Logs an additional `console.warn` if truncation occurs
  - `textForPrompt` (processed) replaces `guidelinesText` in `buildSummaryPrompt()`

**Why:** NFR-01 large-document tier ceiling is 45 seconds. Garfield Weston (11-page PDF) already measures 33–37s. A projected Clothworkers 3-form PDF pack could reach 40–47s. Pre-processing reduces input tokens by 15–25% by removing content that never informs the AI summary, creating headroom before the ceiling without changing the API contract, client, or UI.

**Feature flag:** Set `DISABLE_TEXT_PREPROCESSING=true` in Vercel environment variables to disable preprocessing entirely if a quality regression is found. Set `PREPROCESS_CHAR_CEILING=<n>` to adjust the ceiling.

**Testing required before production:** Validate summary quality is unchanged (or improved) against all scheduled funder fixtures: Garfield Weston, Clothworkers, AB Charitable Trust, Idlewild, Walton, Henry Smith, Wolfson. If any funder's summary degrades, exclude the relevant boilerplate pattern and re-test.

**Full decision record:** `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`

---

## 2026-06-05 — AI summary performance strategy documented — ADR-AI-010

**What changed:**

- New ADR created: `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`
- ADR-INDEX.md updated: ADR-AI-010 added to Group 6 (AI Integration); total ADR count updated to 45
- ADR-TRACEABILITY.md updated: GAP-27 refined to reference ADR-AI-010; ADR-AI-010 consequences added

**Decision summary:**
The streaming vs document pre-processing investigation (conducted 2026-06-04 during funder testing) is formally recorded as ADR-AI-010. The decision is a hybrid, phased approach:

- **Pre-v1 (pre-launch):** Implement document pre-processing (`lib/preprocess-text.ts`) in `/api/generate-summary` to reduce input tokens by ~15–25% and build headroom before the NFR-01 large-document tier ceiling.
- **Post-v1:** Evaluate streaming responses as a quality-of-life improvement once the batch pipeline is stable.

**Why:** Real performance data from testing (LBF: 24s, Walton: 25s, Garfield Weston: 33–37s) confirmed NFR-01 is currently met. However, a projected Clothworkers multi-PDF pack could reach 40–47s — close to the 45s ceiling. Pre-processing is low-risk and additive. Streaming requires a UI redesign (replace progress bar with incremental text render) and Supabase save-on-stream complexity; it is deferred to post-v1 when it can be implemented coherently across both AI routes simultaneously.

**ADR-AI-005 status:** Unchanged — batch mode remains the v1 decision. ADR-AI-010 is an optimisation strategy within the batch architecture, not a replacement of it.

---

## 2026-06-05 — Linting and code quality infrastructure — ADR-OPS-008

**What changed (all four phases implemented):**

**Phase 1 — Scripts and Prettier:**

- `prettier` and `eslint-config-prettier` installed as dev dependencies
- `.prettierrc` created (semi: false, singleQuote: true, tabWidth: 2, trailingComma: all, printWidth: 100)
- `.prettierignore` created (ignores `.next/`, `out/`, `build/`, `node_modules/`, `public/`, `*.lock`)
- `eslint-config-prettier` added to `eslint.config.mjs` (last in config array — Prettier wins on style rules)
- `.vercel/**` added to ESLint `globalIgnores` (generated build artefacts were being linted)
- `package.json` scripts updated: `lint` now targets `.` with `--max-warnings 0`; `lint:fix`, `format`, `format:check`, `type-check` added
- ESLint downgraded from `^10` to `^9` — `eslint-config-next` bundles `eslint-plugin-react` that uses a deprecated API removed in ESLint 10 (`contextOrFilename.getFilename`). ESLint 9 is the correct version for Next.js 16
- One-time Prettier pass applied to all 226 existing files
- 14 pre-existing lint issues resolved across 4 source files (8 errors, 6 warnings): unused vars, stale `eslint-disable` comments, `react-hooks/set-state-in-effect` violations (all valid init patterns, suppressed with targeted comments), and one `react-hooks/refs` pattern suppressed (intentional "latest value" ref). All suppressions are documented inline.

**Phase 2 — Pre-commit hooks:**

- `husky` and `lint-staged` installed as dev dependencies
- `.husky/pre-commit` configured to run `npx lint-staged`
- `lint-staged` config added to `package.json`: ESLint + Prettier on `*.{ts,tsx}`; Prettier only on `*.{json,md,css}`

**Phase 3 — GitHub Actions CI:**

- `.github/workflows/ci.yml` created: runs `type-check`, `lint`, `format:check` on every push to `master` and every PR targeting `master`

**Phase 4 — TypeScript tightening:**

- `noImplicitReturns: true` and `noFallthroughCasesInSwitch: true` added to `tsconfig.json`
- Both flags passed `tsc --noEmit` cleanly with no new errors
- `noUncheckedIndexedAccess` deferred to a future session (per ADR — may surface existing issues requiring targeted fixes)

**Why this matters:** The pre-existing `lint` script (`eslint` with no path or `--max-warnings 0`) was silently doing nothing — all AI-generated code was committed without any automated check. The full stack (Prettier + Husky + CI + stricter TypeScript) means formatting inconsistencies are caught at commit time and type issues at push time, before Vercel begins its build.

**Full decision record:** `docs/Technical Decision and Design/ADR-OPS-008-linting-and-code-quality.md`

**Why this matters:** AI-assisted development dramatically increases the speed at which inconsistencies accumulate. Pre-commit hooks (Phase 2) are the most critical gap — currently all AI-generated code can be committed without any automated check.

**Full decision record:** `docs/Technical Decision and Design/ADR-OPS-008-linting-and-code-quality.md`

---

## 2026-06-04 — Step 4 stale cache fix; free-form path first test (Garfield Weston)

**What changed:**

- `actions/applications.ts` — `revalidatePath()` added before `redirect()` to step/4 in all three locations (`advanceToStep4`, `setDraftInProgress`, `reopenApplication`). Without this, Next.js App Router could serve a stale cached version of Step 4 after a Server Action redirect, causing the "No specific questions found" fallback to appear even though sections were correctly stored in the database.
- `components/application-step4-draft.tsx` — Budget section warning wording updated: "AI cannot generate these for you" → "AI cannot assist you with this". Applies to both free_form sections and structured questions.

**Why:**
Garfield Weston Foundation testing (2026-06-04) — first test of the free-form/narrative path. Step 4 showed the manual entry fallback immediately after the prep checklist. Database inspection confirmed all 11 sections were correctly stored; the issue was Next.js serving cached HTML after the Server Action redirect. `revalidatePath()` is the standard Next.js fix. Budget wording change was a user UX improvement identified during the same test session — "AI cannot assist you" is more accurate than "AI cannot generate these" because the distinction is about assistance, not just generation.

---

## 2026-06-04 — LBF defects D-LBF-01 to D-LBF-05 fixed; Foyle Foundation removed

**What changed:**

- `components/application-step4-draft.tsx`:
  - **D-LBF-01/03:** `isOptionalQ()` helper added. Detects optional questions matching either `"(optional)"` (existing pattern) or `"this question is optional..."` (Lloyds Bank Foundation Q10 pattern). Used in both the `allApproved` assembly gate and the approve section visibility condition. Fixes D-WF-01 regression where Lloyds Q10 (phrased as optional in the question text) was blocking the assembly gate.
  - **D-LBF-02:** Over-limit hard stop. `!isOver` added to the approve section condition — the "Approve this answer" panel is now hidden entirely when the answer exceeds the word/character limit. Over-limit message updated to "Please trim it or use AI to bring it within the limit before approving." This replaces the previous "warn but allow" behaviour.
- `components/application-step5-approve.tsx`:
  - **D-LBF-04:** `formatExportDate()` updated to include HH:MM time so re-export warning dialog shows full timestamp (e.g. "4 June 2026, 09:57") matching the format in the exported document.
  - **D-LBF-05:** `isDownloading` split into `isDownloadingDocx` and `isDownloadingTxt`. Each download button now shows its own loading state independently. Previously a shared state caused both buttons to show "Downloading…" when only one was active.
- `docs/target-funder-list.md` — Foyle Foundation struck through and annotated as permanently closed December 2025.
- `docs/Test Plans/TEST-DASHBOARD.md` — Foyle Foundation marked ❌; Nationwide, Motability Foundation, and City Bridge Foundation marked ⏸️ (offline/closed); Garfield Weston flagged as next active funder.

**Why:**
All five defects surfaced during Lloyds Bank Foundation testing (2026-06-04). D-LBF-02 (over-limit hard stop) was a deliberate product decision: grant portal systems uniformly reject over-limit answers, so allowing approval would give false confidence. D-LBF-01/03 shared a root cause — the optional detection relied on "(optional)" in parentheses, missing the Lloyds-style "This question is optional..." phrasing. D-LBF-04 and D-LBF-05 were minor polish items improving timestamp accuracy and loading state UX.

Foyle Foundation removed after research confirmed the foundation permanently closed its grant programme December 2025 — no new applications being accepted. Three other funders (Nationwide, Motability, City Bridge) parked as all currently offline or between rounds.

---

## 2026-06-04 — NFR-01 summarisation target revised; AGENTS.md NFR reference added

**What changed:**

- `docs/non-functional-requirements.md` — NFR-01 AI guideline summarisation target split into two tiers based on funder testing evidence: standard documents (up to ~8 pages) ≤30 seconds; large documents (over 8 pages) ≤45 seconds. Performance evidence from six funder test cycles added as a table. Pre-launch recommendation added for Clothworkers-style multi-form PDFs (40–47s) which approach the upper limit.
- `AGENTS.md` — `docs/non-functional-requirements.md` added to the documentation table so future sessions know to update it when performance targets change.
- Affected test plans updated to reference the correct NFR-01 tier (Clothworkers, LBF, Garfield Weston).

**Why:**
Garfield Weston Foundation testing (2026-06-04) produced summary times of 33–37 seconds on the 11-page guidelines PDF. The original single 30-second target was set before any real-funder testing. Six test cycles have now produced a range of measurements (24s–47s) that shows clearly that document size is the primary driver. A two-tier target (30s standard / 45s large) is both more accurate and more actionable: it confirms that simple structured PDFs are comfortably within target while flagging that very large multi-form PDFs need attention before go-live. The pre-launch recommendation to investigate streaming or document pre-processing ensures the issue is not lost.

---

## 2026-06-03 — Three testing defects fixed; Lloyds funder corrected; Lloyds test plan created

**What changed:**

- `components/application-step4-draft.tsx` — D-WF-01 fix: optional sections (question text contains "(optional)") now show the "Approve this answer" button even when the textarea is empty; `allApproved` gate updated to exclude unanswered optional sections from the required count.
- `components/application-step5-approve.tsx` — D-WF-04 fix: `handleDownloadClick` now checks `lastExported` (DB-sourced prior export history) rather than `isExported` (current session state) to trigger the re-export warning dialog. The warning now correctly appears after a re-open → re-approve → download cycle.
- `app/api/export/[applicationId]/route.ts` — D-WF-05 fix: `formatDate` updated to include HH:MM in Europe/London timezone (e.g. "03 June 2026, 17:35"). Allows users to distinguish between multiple exports on the same day.
- `supabase/migrations/20260603000000_update_lloyds_funder_to_england_wales.sql` — New migration replacing "Lloyds Bank Foundation CI" (Channel Islands) with "Lloyds Bank Foundation" (England & Wales) in the funder directory. ⚠️ Requires manual application to dev and prod via Supabase dashboard.
- `supabase/migrations/20260601000001_seed_funders.sql` — Seed file updated to reflect E&W foundation for future resets.
- `docs/Test Plans/Lloyds-Bank-Foundation-test-plan.md` — New test plan (v1.0, 13 cases).
- `docs/target-funder-list.md` — Lloyds CI replaced with Lloyds E&W.

**Why:**
Wolfson Foundation testing (12 tests, 2026-06-03) surfaced three defects:

- D-WF-01: Optional sections could not be approved when blank, blocking the assembly gate entirely — a UX dead-end requiring a workaround.
- D-WF-04: The re-export warning (protecting funders from receiving multiple versions) was bypassed after re-opening and re-approving an application — a meaningful safeguard gap.
- D-WF-05: Without a time component in the export date, two exports on the same day were indistinguishable in the downloaded document.

The Lloyds Bank Foundation CI was identified as unsuitable for Grant Pathway: Channel Islands-only geographic restriction, AI use discouraged, and the online form is currently offline. Replaced with the main England & Wales foundation which has a downloadable Word example form, permits AI use with conditions, and has a broad UK-wide remit appropriate for Grant Pathway's target charities.

---

## 2026-06-03 — Wolfson Foundation test plan created (Health & Disability Stage 1)

**What changed:**

- `docs/Test Plans/Wolfson-Foundation-test-plan.md` (v1.0, new) — 12-case end-to-end test plan for the Wolfson Foundation Health & Disability Stage 1 programme.

**Key test coverage decisions:**

- **Paste path tested.** Wolfson Stage 1 guidelines are published online only — there is no downloadable PDF or Word file. The test therefore exercises the Step 2 text-paste input rather than file upload. This is the first test plan to use the paste path as the primary input method.
- **New test charity: Compass Wellbeing.** A new test account (`grantpathway+wf1@gmail.com`) with a fictional South London mental health/brain injury charity is used, rather than reusing Harry's Rainbow. Compass Wellbeing is a clear fit for Wolfson's Health & Disability capital criteria, reducing mismatch risk and making the eligibility test meaningful.
- **Re-open → amend → re-approve → re-export cycle (IT-WF-11 and IT-WF-12).** This is the first test plan to explicitly cover the full re-opening flow: after a first export, the tester re-opens the application, amends one answer (Project summary), re-approves only that card, reassembles, re-approves the whole application, and re-exports. IT-WF-12 verifies the re-export warning dialog shows the correct prior export timestamp, and the downloaded document contains the amended answer.
- **Short word limit fields.** The 50-word "previous support" and 25-word "project title" fields are unusual — shorter than any question seen in previous test cycles. These are recorded as observation points: the AI may extract them as narrative cards or skip them as too short to be textareas.

**Why Wolfson Foundation next:**
Idlewild Trust Round 1 2026 (opens 8 June) is not being targeted in this cycle. Wolfson is a well-characterised structured funder with publicly listed questions and word limits, is already seeded in the funder picker, and exercises a paste-path test scenario not yet covered by any existing test plan.

---

## 2026-06-02 — AI assist allowed when answer exceeds word limit (FR-30 revised)

**What changed:**

- `components/application-step4-draft.tsx` — `isOver` removed from the disabled condition on "Help me improve this". AI assist is now available even when the answer exceeds the word limit.
- `app/api/refine-answer/route.ts` — Server-side word limit rejection removed. Belt-and-braces no longer needed since the refine prompt enforces the limit in the AI output.
- Over-limit message updated: _"Your answer exceeds the funder's word limit. In your interest, you can use AI to refine, improve the structure and bring it within the limit — or approve this answer as it stands."_

**Why:**
Idlewild and Henry Smith testing revealed an inconsistency: the over-limit message said "reduce it first" but the Approve button was still available. The two instructions contradicted each other. More importantly, the AI refine prompt already instructs the AI to stay within the word limit — so an over-limit answer is exactly the scenario where AI assist is most useful (the AI will compress to fit). Blocking it forced users to manually reduce first, which is a worse experience. The new message is advisory, not prescriptive, and honestly presents both options.

---

## 2026-06-02 — funderAiPolicy banner removed from Step 3

**What changed:**

- `components/application-step3-summary.tsx` — The blue AI policy banner (which displayed `summary.funderAiPolicy`) was removed from the Step 3 summary screen. The `funderAiPolicy` field remains in the `AiSummaryData` type and is stored in the database, but is no longer displayed.

**Why:**
Raised during Henry Smith Holiday Grants testing (IT-HSF-03). The banner added no value because:

1. Grant Pathway's Q&A model already embodies responsible AI use — the charity writes all content, AI only refines on request, mandatory review before approval, AI disclaimer in every export.
2. All approved funders are pre-screened by Rapidglobe; funders with explicit AI prohibitions are not listed.
3. Extraction quality was unreliable — some funder documents only contained a pointer to a website ("You can find AI guidance on our website"), which rendered as a confusing, unactionable banner.

---

## 2026-06-02 — GAP-28 Layer 1: three prompt extraction improvements

**What changed:**

- `lib/prompts.ts` — Three new exclusion rules added to the question extraction logic:
  1. **Conditional questions**: Questions prefaced with explicit project-type conditionals (e.g. "only required if applying for a vehicle") are excluded.
  2. **Multi-form PDFs**: When a document contains multiple application forms (e.g. Small Grants + Large Grants), only the first complete form is extracted.
  3. **Meta/feedback questions**: Questions asking for feedback about the application process (e.g. "Do you have any feedback for us?", "How long did this take?") are excluded — these are not grant application content.

**Why:**
Clothworkers and Henry Smith testing surfaced all three issues. The Clothworkers PDF contained both Small and Large Grants forms, causing duplicate questions. Henry Smith's form included "Do you have any feedback for us?" as Q9, which was appearing as a writing card. Conditional project-type questions (vehicle-only, digital infrastructure-only) were appearing for all applicants regardless of project type.

---

## 2026-06-02 — Question sync: Step 4 now syncs with regenerated AI summary

**What changed:**

- `app/(authenticated)/applications/[id]/step/4/page.tsx` — The `if (questionRows.length === 0)` guard was replaced with an always-run sync. On every Step 4 visit:
  1. Orphaned rows (question_order no longer in the current AI summary) that are unanswered are deleted.
  2. New questions from the summary are upserted.
  3. The DB is re-fetched after the upsert to get the full current set (fixing a Supabase `ignoreDuplicates: true` issue where the upsert return value was empty for existing rows).

**Why:**
Henry Smith testing (D-HSF-02): after regenerating the AI summary, returning to Step 4 showed "No specific questions were found" because the old question rows remained in the database and the upsert's `ignoreDuplicates: true` returned an empty array — overwriting `questionRows` with nothing. The sync now correctly handles regeneration mid-session without losing any answered content.

---

## 2026-06-02 — FR-47 eligibility mismatch hard stop

**What changed:**

- New `mismatch` application status added to the `application_status` enum (migration `20260602000000_add_mismatch_status.sql`).
- `lib/prompts.ts` — AI summary prompt extended with `eligibilityMismatch: boolean` and `mismatchReason: string | null` fields.
- `app/api/generate-summary/route.ts` — `AiSummaryData` type extended.
- `actions/applications.ts` — `setApplicationMismatch()` server action added.
- `components/application-step3-summary.tsx` — Mismatch display state added: red warning card, acknowledge button, redirect to dashboard.
- `components/dashboard-populated.tsx` — Red "Ineligible" badge for mismatch applications; no Continue/View button.

**Why:**
Raised during Idlewild Trust IT-04 testing. Harry's Rainbow (bereavement charity) was shown 9 application question cards for an arts-only grant — there is no purpose in a charity writing answers for a grant they clearly cannot receive. The hard stop protects funder relationships (preventing a stream of ineligible applications routed via Grant Pathway) and saves the charity from wasted effort. Full rationale: `docs/decisions/DR-EL-001-eligibility-mismatch-handling.md`.

---

## 2026-06-01 — Step 5 approval wording and export disclaimer improved

**What changed:**

- `components/application-step5-approve.tsx` — Three confirmation checkboxes updated with more professional, precise language appropriate for a formal grant application context:
  - "I have read through every answer and am satisfied with the content." → "I have reviewed all responses in full and am satisfied with their content."
  - "I confirm the information is accurate and true to the best of my knowledge." → "The information provided is accurate and complete to the best of my knowledge."
  - "I understand this application was drafted with AI assistance..." → "I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted."
- `app/api/export/[applicationId]/route.ts` — Export disclaimer updated from "drafted with AI assistance" to "prepared with AI assistance" to align with the Step 5 checkbox language.

**Why:**
Identified during AB Charitable Trust testing (2026-06-01). The original wording was informal and imprecise. "Reviewed" is stronger and more appropriate than "read through". "Accurate and complete" better reflects the scope of the declaration than "accurate and true". "Prepared" is more accurate than "drafted" given the charity-authored model. Disclaimer aligned with checkbox for consistency.

---

## 2026-06-01 — Spelling correction added to AI refine-answer prompt

**What changed:**

- `lib/prompts.ts` — `buildRefinePrompt` updated: "Correct any spelling errors and grammatical mistakes." added to the refine instruction, before the constraint "You must not add any information that is not already in the answer."

**Why:**
AB Charitable Trust testing (2026-06-01) showed the AI was returning answers unchanged when they contained only spelling errors, because the original prompt mentioned "structure, flow, and clarity" but did not explicitly include spelling correction. Correcting "oppotunity" → "opportunity" is not changing a fact — it falls under clarity improvement. This is a core part of the AI assist value for non-specialist charity users.

---

## 2026-06-01 — char_limit and limit_type DB columns added; Step 4 pipeline fixed

**What changed:**

- `supabase/migrations/20260601000002_add_char_limit_and_limit_type.sql` — New migration adds `char_limit integer` and `limit_type text check (words|characters|none)` to `application_answers`. These columns were defined in `data-model.md` (BD-05) and referenced in the Step 4 page code but were never backed by a migration.
- `app/(authenticated)/applications/[id]/step/4/page.tsx` — SELECT and upsert queries updated to include `char_limit` and `limit_type`.
- `components/application-step4-draft.tsx` — `QuestionRow` type extended with `charLimit` and `limitType` fields. Counter display updated: shows "X / 800 characters" when `limitType === 'characters'` and "X / 400 words" when `limitType === 'words'`.

**Why:**
Root cause of D-IT-01 (Step 4 silently showing Tier 3 free-form fallback despite AI summary correctly extracting questions): the `upsert` in `step/4/page.tsx` referenced `char_limit` and `limit_type` columns that did not exist in the database. The upsert failed with a PostgreSQL error that was swallowed by the `try/catch` block, leaving `questionRows` empty and triggering the "no questions found" path. The missing migration was the single root cause of the Step 4 failure across both Idlewild Trust and A B Charitable Trust testing.

---

## 2026-06-01 — AI summary prompt updated for table-format PDFs and character limits

**What changed:**

- `lib/prompts.ts` — `buildSummaryPrompt` updated with two significant rule changes:
  1. **Table format recognition**: `funder_type` rule extended — documents presented as a table with columns such as "Question", "Type of question", "Character limits", "Mandatory" are now classified as `structured`. A TABLE FORMAT extraction rule added to the `questions` rule: extract only rows where the "Type of question" column indicates narrative text (Long/Medium free text); skip Yes/No, Short free text (data fields), Drop-down, Date, Number, Address, and File upload rows.
  2. **Character limit handling**: Removed the incorrect instruction to convert character limits to approximate word counts. New rule: if the limit is in characters, set `charLimit` to the value and `limitType` to `'characters'`; if in words, set `wordLimit` and `limitType` to `'words'`; if no limit, set `limitType` to `'none'`.
- `app/api/generate-summary/route.ts` — `AiSummaryQuestion` type updated: added `charLimit?: number | null` and `limitType?: 'words' | 'characters' | 'none' | null` fields.

**Why:**
Idlewild Trust testing (2026-06-01) revealed two extraction failures. (1) The Idlewild Arts question set is published as a multi-column table — the AI could not parse table structure from extracted PDF text and returned an empty questions array. The TABLE FORMAT rule gives the AI explicit instructions for this format. (2) All Idlewild narrative questions use character limits (800 or 1600 chars), but the original prompt converted these to approximate word counts (800 chars ≈ 120 words), losing precision. The fix preserves the original limit type and value so counters show "X / 800 characters" correctly.

---

## 2026-06-01 — "Help me improve this" disabled when answer exceeds word/character limit

**What changed:**

- `components/application-step4-draft.tsx` — The "Help me improve this" AI assist button is now disabled when `isOver` is true (i.e. the answer exceeds the word or character limit). An inline message — "Your answer is over the limit. Edit it down first, then use AI to improve the structure." — is shown in red beneath the button when this condition applies.

**Why:**
AB Charitable Trust testing (2026-06-01) identified a design gap: clicking "Help me improve this" when an answer was already over the limit returned the answer unchanged, because the AI cannot remove factual content. This confused testers who expected the AI to help them fit within the limit. Disabling the button with an explanatory message makes the required user action explicit and prevents a silent no-op.

---

## 2026-06-01 — FR-32/FR-33 per-question approval step added to Step 4

**What changed:**

- `components/application-step4-draft.tsx` — Per-question approval flow added. Each question card now shows three plain-language review prompts (FR-32: "Does this accurately describe your charity and project?", "Are all figures, dates, and facts correct?", "Does this answer the question that was asked?") whenever an answer is non-empty and not yet approved. An "Approve this answer" button (FR-33) saves approval to the database. Editing text or accepting an AI refinement clears approval and requires re-review. Progress bar and "Ready to assemble" gate now use approved count, not answered count. Approved cards render with a green border and confirmation stamp.
- `actions/applications.ts` — New `approveAnswer(answerId)` Server Action added; sets `is_approved = true` on the `application_answers` row with `user_id` ownership check.
- `app/(authenticated)/applications/[id]/step/4/page.tsx` — `is_approved` added to the `application_answers` DB select (existing rows and both upsert paths); mapped to new `QuestionRow.isApproved` field.

**Why:**
AB Charitable Trust testing (2026-06-01) found that FR-32 (three plain-language review prompts alongside each draft) and FR-33 (explicit per-question approval before content is saved to the assembly queue) were missing from the Mark Two charity-authored Q&A interface. These requirements were present in the original Step 4 design but were not carried forward into the 2026-05-28 redesign. The fix brings the implementation into full compliance with the Must Have acceptance criteria.

---

## 2026-06-01 — Funder directory and access control model decided (DR-FD-001)

**What changed:**

- `docs/decisions/DR-FD-001-funder-directory-model.md` — New decision record created. Hybrid curated funder directory + "Request a Funder" escape hatch adopted as the funder access control model.
- `docs/decisions/DECISIONS-INDEX.md` — DR-FD-001 added under new "Funder Directory" section; total count updated to 29; revision history entry added.
- `docs/moscow-feature-register.md` v1.4 — FR-15 revised: funder selection is now via searchable curated picker (not free-text entry); "Request a Funder" escape hatch noted.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — Phase 5 build tasks added for funder directory implementation.

**Why:**
Grant Pathway's AI extraction and Q&A interface has only been validated against 12 specific funders (see `docs/Test Plans/target-funder-list.md`). Allowing users to freely enter any funder name would let untested combinations enter the system, producing degraded or misleading output with no warning. Five options were evaluated; the hybrid model (Option 5) was selected because it maintains a hard gate on untested funders while converting user frustration (unlisted funder = dead end) into a demand signal via the request form. The decision was taken to implement the near-final product model now so that all test activity — starting with Idlewild Trust (Round 1 2026, opens 8 June 2026) — reflects the real user experience rather than a temporary workaround.

**Build scope (Phase 5):**

1. `funders` Supabase table — seeded with 12 approved orgs from target funder list
2. RLS policy — authenticated users read; service role writes
3. `applications.funder_id` FK column — nullable migration-safe
4. Step 1 funder picker UI component — replaces free-text funder name input
5. "Request a Funder" link — mailto or Tally form in v1
6. Request notification to Rapidglobe

---

## 2026-05-29 — Product documents updated to reflect Mark Two BRD decisions

**What changed:**

- `docs/BRD-Grant-Pathway-v0.2.md` — Superseded notice added at top. Mark Two BRD (`BRD plus decisions Mark Two/BRD-Grant-Pathway-Mark-Two-v0.4.md`) is the authoritative reference; Mark One retained for audit only.
- `docs/vision-statement.md` — Vision updated: "preparation tool" replaces "writing companion" (BD-01); "AI-assisted writing" replaces "AI-powered drafting" to reflect the AI assists not generates principle.
- `docs/business-overview.md` — Elevator pitch and "What Grant Pathway Does" section updated: AI generates draft answers → AI assists on request; charity writes every substantive answer.
- `docs/information-architecture-and-navigation.md` v1.3 — Step 4 description updated to reflect question-level typing (BD-04): `narrative | data_entry | financial | dropdown | date | file_upload`; Tier 1/2/3 coverage model referenced.
- `docs/moscow-feature-register.md` v1.3 — FR-10/11 updated (OSCR/CCNI planned before general release); FR-12 updated (thick profile, BD-02); FR-29 extended (character limits + word limits, BD-05); FR-45 added (question-level typing, BD-04); FR-46 added (three-tier coverage model, BD-07). Summary count 39 → 41 Must Have.
- `docs/user-personas-journeys-and-use-cases.md` v1.2 — UC-04 updated to reflect thick charity profile fields (BD-02): identity, address/contact, mission/work, financial fields, supporting document status. OSCR/CCNI note added.
- `docs/data-model.md` v1.1 — `charity_profiles` table replaced with thick profile structure (BD-02): five sub-sections covering identity, address/contact, mission/work, financial fields, and supporting document status. `question_type` and `limit_type`/`word_limit`/`char_limit` fields added to `application_answers` (BD-04, BD-05). `is_budget_question` field added. AI cap corrected 20 → 50 in ai_usage_log constraints. Document history table added.
- `docs/technology-stack.md` v1.2 — TS-04 updated: Vercel function region explicitly set to London (eu-west-2 / lhr1). Stack Summary table and rationale updated.
- `docs/constraints-and-assumptions.md` — C8 updated (OSCR/CCNI planned before general release); C13 updated (Vercel function region confirmed as London); A8 revised (funder guidelines do not always yield discrete questions — three-tier coverage model added).
- `docs/future-phases.md` — FP-07 (OSCR/CCNI register lookup — planned before general release), FP-08 (full question-level typing implementation), and FP-09 (thick profile pre-fill for all funder tiers) added.
- `docs/non-functional-requirements.md` — NFR-01 updated: "AI draft answer generation" renamed to "AI answer refine (per question)" with ≤15 second target; Vercel function region note added.

**Why:**
The Mark Two BRD (`BRD-Grant-Pathway-Mark-Two-v0.4.md`) was created on 2026-05-29 following real-funder testing against the 12-funder target list. Key decisions confirmed today (BD-01 through BD-07) changed the product model in ways that were not yet reflected across the supporting documentation. This update brings all product documents into alignment with Mark Two.

---

## 2026-05-29 — Vercel function region set to London (eu-west-2 / lhr1)

**What changed:**

- Vercel project → Settings → Function Regions: London, United Kingdom (eu-west-2 / lhr1) selected and saved. Redeployment triggered.

**Why:**
AWS Bedrock is configured for `eu-west-2` (London). Vercel functions were previously executing from the default `iad1` region (Virginia, USA) — no European region had been explicitly configured. Every AI call was making a transatlantic round trip (Virginia → AWS London → Virginia), adding significant latency and contributing to timeout risk on large documents. Aligning Vercel and Bedrock in the same region reduces call latency, lowers timeout risk, and improves data residency (all processing stays in UK).

---

## 2026-05-29 — generate-summary parse_error fixed for large structured documents (D-011)

**What changed:**

- `app/api/generate-summary/route.ts` — `SUMMARY_MAX_TOKENS` raised from 2000 to 4000. Documents with large question sets (e.g. A B Charitable Trust: 33 questions across 4 labelled sections) were truncating the AI response mid-JSON, causing `JSON parse failed after retry` on both attempts and returning a 500 error.
- `lib/prompts.ts` — `buildSummaryPrompt` updated: (a) explicit JSON-only instruction added at end of user prompt ("Respond with ONLY the JSON object — no preamble, no explanation, no markdown fencing. Start your response with { and end with }."); (b) "questions" rule extended to instruct the AI to skip non-text question types (dropdowns, dates, numbers, file uploads, yes/no consent fields) — only narrative text questions should be extracted. This also partially resolves GAP-28.

**Why:**
Verified via Vercel function logs: three consecutive `[generate-summary] JSON parse failed after retry` entries (14:28, 14:29, 14:34) all for the same application. A B Charitable Trust document has 33 numbered questions but only ~5 require narrative text answers — the remaining 28 are data-entry, financial, or file upload fields. Extracting all 33 into JSON exceeded the 2000 token limit, truncating the response. Raising to 4000 and filtering to narrative-only questions eliminates both failure modes.

---

## 2026-05-29 — Dashboard AI cap display corrected from 20 to 50 (D-010)

**What changed:**

- `components/dashboard-populated.tsx` — `AI_REQUESTS_LIMIT` constant updated from `20` to `50`. The display showed "14 of 20 AI requests used this month" — the enforced cap in the API routes was correctly 50 but the constant driving the UI was never updated when the cap was raised. The under-display (20 vs 50) was misleading users into thinking they were closer to the limit than they were.

**Why:**
Discovered during testing session 2026-05-29. User dashboard showed 14 of 20. API routes (`generate-summary/route.ts`, `refine-answer/route.ts`) both use `MONTHLY_CAP = 50` correctly — only the display was wrong.

---

## 2026-05-29 — GAP-27 and GAP-28 raised: character limits and non-text questions

**What changed:**

- `docs/test-fixtures/` — Three Idlewild Trust PDFs added: `idlewild-arts-application-questions-dec2025.pdf`, `idlewild-conservation-application-questions-dec2025.pdf`, `idlewild-funding-guidelines-dec2025.pdf`. Sourced from `idlewildtrust.org.uk` ahead of Round One 2026 (opens 8 June 2026).
- `docs/test-plan-e2e-slices-4-8.md` v1.7 — GAP-27 and GAP-28 added to Known Expected Failures. Idlewild fixture note updated.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — GAP-27 and GAP-28 recorded.

**GAP-27 — Character limits not supported (Medium)**
Idlewild Trust question sets use character limits (800 chars, 1600 chars), not word limits. Grant Pathway's AI prompt extracts `wordLimit` only and the `word_limit` column in `application_answers` stores word counts. Character limits will either be missed entirely or incorrectly converted to word counts by the AI. Affects all funders whose published guidelines specify character limits rather than word limits. Fix: extend `AiSummaryData.questions` and `AiSummarySection` to carry a `limitType: 'words' | 'characters'` field; update the AI prompt to extract limit type; update the word count display in Step 4 to show "X / 800 characters" or "X / 200 words" as appropriate.

**GAP-28 — Non-text questions extracted as text (Medium)**
Idlewild Trust question sets include non-text question types: Yes/No (consent, ownership), dropdown (region, org status), date fields (start/end dates), number fields (grant amount), budget tables (cost breakdown, income raised, pending), and file uploads (accounts, safeguarding policy, photos). The AI has no way to distinguish question type from a PDF reference document and will extract all questions as text fields, showing them as textareas in Step 4. Budget table questions will be flagged as `is_budget_question` but will still appear as textareas rather than being excluded. Fix: extend the AI prompt to extract `questionType` for each question; filter non-text types (Yes/No, dropdown, date, number, table, file) from the Step 4 Q&A interface or display them as read-only aide-memoire items.

**Why:**
Discovered during pre-test review of Idlewild Arts and Conservation question set PDFs (2026-05-29). These gaps affect all structured funders that use portal-based forms with character limits and mixed question types. They do not affect the current passing test fixtures (TNL, Heritage Fund, Garfield Weston) which are narrative/free-form or simpler structured formats.

---

## 2026-05-29 — refine-answer: parse_error fix and stale rate-limit comment corrected

**What changed:**

- `lib/prompts.ts` — `buildRefinePrompt` strengthened: added explicit instruction to respond with JSON only (no preamble, no explanation, no markdown fencing); added fallback instruction to return the answer unchanged if too short to meaningfully improve. Fixes `parse_error` returned when the AI received a very short answer and returned a conversational response instead of JSON.
- `lib/rate-limit.ts` — Stale comment updated: "20 req/month" → "50 req/month" to match the current cap in `refine-answer/route.ts` and `generate-summary/route.ts`.

**Why:**
During free_form testing (Garfield Weston), clicking "Help me improve this" on sections with 1–2 word answers returned `parse_error` (D-008). The AI was responding with a natural language explanation rather than the required JSON object. The `rate_limited` error (D-009) on rapid successive clicks is expected production behaviour (5 req/60s burst limit) — no code change needed, but the stale comment was corrected.

---

## 2026-05-29 — Step 4: sticky progress bar fixed; Back link added to funder context bar; typo fixed

**What changed:**

- `components/application-step4-draft.tsx` — Sticky progress bar changed from `top-0` to `top-16` to offset correctly below the authenticated nav header (`h-16`, `sticky top-0 z-[100]`). Previously the bar was sticking behind the nav and not visible. Back link added to the funder context bar (top-right, white text) so users can navigate to Step 3 without scrolling to the bottom of long applications.
- `components/application-step3-summary.tsx` — Typo fixed: "sectionsto complete" → "sections to complete". Caused by JSX whitespace stripping the newline between `section` and `{"s"}`. Replaced with a template literal to guarantee correct spacing.

**Why:**
The sticky progress bar was requested and implemented in yesterday's session but was not visible in the deployed service because the `top-0` offset placed it directly behind the sticky nav. The Back button was only at the bottom of the page — inaccessible without scrolling through all sections on a long free_form application.

---

## 2026-05-29 — Test plan updated to v1.4

**What changed:**

- `docs/test-plan-e2e-slices-4-8.md` — Version 1.3 → 1.4. Four areas updated:
  1. **Test Fixtures** — pointer added to `docs/target-funder-list.md`; all 12 consolidated funders listed; missing fixture files identified per funder.
  2. **S5-P-02** — rewritten to reflect Step 3 two-column card layout redesign; S5-P-02b added (free_form funder summary — "Application sections" card, "X sections to complete" note).
  3. **S6-P-03b** — new test covering `advanceToStep4` bug fix: confirms `ready_to_assemble`/`assembled` states are not reset to `not_started` when user returns via Step 3.
  4. **NF-02** — rewritten: old auto-generation response time test removed (model no longer exists); replaced with refine-answer API response time test (≤15 seconds target).
- Summary table: total 114 → 116.

**Why:** Test plan had not been updated to reflect the Step 3 layout redesign, the advanceToStep4 bug fix, or the removal of the Step 4 auto-generation model. NF-02 was actively misleading — it described a test that could no longer pass because the behaviour it tested had been removed.

---

## 2026-05-29 — Consolidated target funder list documented; AGENTS.md audit trail rule strengthened

**What changed:**

- `docs/target-funder-list.md` — **New file.** Canonical consolidated list of 12 target grant-giving organisations (10 structured, 2 narrative) used to design and test Grant Pathway's Step 4 Q&A model and Step 5 assembly/export. Supersedes the 3-funder test fixture table that had been the only documented reference. Includes funder name, type, grant range, rationale for inclusion, and guidelines/apply URL.
- `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md` — Note added to the 3-funder test fixture table marking it as superseded and pointing to `docs/target-funder-list.md`.
- `docs/Implementation Plan/CHANGELOG.md` (this file) — Superseded note added to the earlier partial funder list entry (2026-05-27).
- `AGENTS.md` — Documentation rule (`implementation-docs-rules` section) substantially strengthened. Now explicitly requires: (a) all changes documented without exception, (b) product-level decisions (funder lists, research findings, scope) documented in `docs/` not just code comments, (c) agent must ask the user before proceeding if it is unclear where something should be documented. Motivated by the gap discovered this session.

**Why:**
The consolidated funder list was researched in a prior working session and used as the basis for the Step 4 redesign, but was never written to any file. It existed only in session context. This created an audit gap: the canonical list underpinning a fundamental product decision was not recoverable from the repository. This entry closes that gap and adds an explicit rule to AGENTS.md to prevent recurrence.

---

## 2026-05-29 — Step 4: section-by-section mode for narrative funders; advanceToStep4 bug fix

**What changed:**

- `app/api/generate-summary/route.ts` — New `AiSummarySection` type (`{ number, title, guidance, wordLimit?, is_budget_section }`); `sections?: AiSummarySection[]` field added to `AiSummaryData`; `questionsFound` response now returns `true` for free_form funders with sections; `SUMMARY_MAX_TOKENS` raised from 1500 → 2000 to accommodate sections guidance text.
- `lib/prompts.ts` — `buildSummaryPrompt` updated: `sections` array added to the JSON schema (populated for free_form funders only, with title + 2–3 sentence guidance + word limit + budget flag per section); `questions` array restricted to structured funders only (the two fields are mutually exclusive). Rule added: number sections sequentially starting at 1.
- `components/application-step3-summary.tsx` — "Application sections" card added for free_form funders, replacing "Application questions" card. `questionsFound` state init handles both cases. Green confirmation note reads "X sections to complete" for free_form, "X questions found" for structured.
- `app/(authenticated)/applications/[id]/step/4/page.tsx` — `funderName` and `grantName` destructured from `getApplicationOrRedirect`. Free_form path populates `application_answers` from `parsedSummary.sections` (section title → `question_text`, wordLimit, is_budget_section). Guidance map built from sections keyed by `question_order`. `guidance` passed per row to component.
- `components/application-step4-draft.tsx` — **Complete rebuild.** Wider layout (`max-w-[960px]`). Teal funder context bar showing funder name and grant name. Sticky progress bar (`sticky top-0 z-10`) showing "X of N sections/questions completed". Free_form mode: section title as header (no number prefix), guidance text shown below title, budget section warning copy updated. Structured mode: numbered Q&A with `q.questionOrder. q.questionText` header. Both modes share: word count, AI refine button, auto-save, 60-second sweep.
- `actions/applications.ts` — `assembleAndAdvance` updated: detects `funder_type` from `ai_summary` JSON; free_form format is `section_title\n\nanswer` (no number prefix, narrative flow); structured format is `N. question\n\nanswer` (unchanged).
- **Bug fix** (same release): `advanceToStep4` in `actions/applications.ts` reset `draft_status` to `not_started` whenever the user navigated forward from Step 3. Previously, if a user had started writing (`draft_status = in_progress`) and then returned to Step 3, clicking Continue again would skip the prep checklist gate. Fix: reset only when `draft_status = 'in_progress'`; states `ready_to_assemble` and `assembled` are preserved.

**Why:**
The 2026-05-28 Q&A redesign established a two-path model: structured funders (numbered questions → Q&A) vs free_form funders (narrative sections → open textarea). Only the structured path was implemented. This release completes the model:

For free_form funders (e.g. Garfield Weston), the AI now extracts the narrative sections from the guidelines (section title + guidance for the applicant), stores them as `application_answers` rows, and presents them as a section-by-section writing interface. Each section shows a guidance note derived from the funder's own instructions ("what to include in this section"). This matches how narrative funders expect content to be structured — not a list of Q&A pairs but a flowing document with discrete sections. The assembled draft format is `Title\n\nContent` (no number prefixes), suitable for flowing into a Word document at Step 5.

The sticky progress bar and funder context bar were specifically requested during mockup review and are present in both modes — they improve usability significantly on longer applications.

**Architectural consequences:**

- `AiSummaryData.sections[]` is optional (backwards compatible with existing saved summaries that lack this field)
- `application_answers` stores section titles as `question_text` — no DB schema change required
- Guidance text is re-derived from `ai_summary.sections[i].guidance` on each Step 4 page load, matched by `question_order` — not stored in DB (avoids duplication)
- `assembleAndAdvance` is now funder-type-aware — single source of truth for format

---

## 2026-05-29 — Step 3 summary redesigned: two-column card layout, highlighted section headings, supporting documents removed

**What changed:**

- `components/application-step3-summary.tsx`:
  - Single summary card replaced with individual cards in a responsive two-column grid (`md:grid-cols-2`)
  - Max-width widened: `max-w-[640px]` → `max-w-[960px]`
  - "About this grant" spans full width; "Grant amount" and "Who can apply" sit side-by-side; "Grant amount" auto-expands to full width if "Who can apply" is absent
  - Section headings highlighted: `CardTitle` sub-component adds a teal left border (`border-l-4 border-[#0D6E6E]`) to each card heading
  - "Documents you will need to submit" card removed from this step — supporting document requirements are noted in funder guidelines and do not need a separate card in the Step 3 summary
  - Button text changed: "This looks right — continue" → "Continue"

**Why:**
During testing, the single-card summary was described as "too busy" and hard to scan. Breaking information into separate cards reduces visual density and makes it easier to locate specific information (e.g. "How much can I apply for?" is now an immediately visible card, not a paragraph buried in a wall of text). The wider two-column layout makes better use of modern screen widths. The section heading highlights add visual anchoring without colour-coding the content itself. Supporting documents were removed because they add friction at the review step — the user has already read the guidelines and doesn't need a re-list of documents at this point.

---

## 2026-05-29 — Strategic pivot: Grant Pathway targets a curated set of UK funders with published guidelines

**What changed:**

- Product positioning: Grant Pathway is now explicitly designed for UK grant funders that publish accessible, downloadable application guidelines (structured Q&A or narrative). Funders that use online portals without downloadable guidelines, or that require a quiz to identify fund type, are out of scope for v1.
- Research conducted: ~12 target funders identified across structured (form-based) and free_form (narrative) categories with accessible guidelines and appropriate grant ranges for small/mid-size charities.
- No code changes in this release — this is a product scope decision. Future onboarding copy and help text will reference this scope.

**Target funder profile (v1):**

- Published downloadable guidelines (PDF or Word) or accessible online guidelines
- Applications reviewed on merit (not exclusively online portal input)
- Grant ranges broadly £5,000–£200,000
- No absolute AI prohibition in guidelines (a small number of funders explicitly ban AI tools — these are noted but outside scope)

**Example funders in scope (non-exhaustive):**

- Structured: A B Charitable Trust, Foyle Foundation (Main Grants), Walton Charity, Nationwide Building Society Community Grants, Garfield Weston Foundation (small grants), Bletchley & Fenny Stratford Town Council
- Free_form / narrative: Garfield Weston Foundation (larger grants), City Bridge Foundation

> **Superseded (2026-05-29):** The above example funder lists were a working approximation. The canonical consolidated target funder list (12 funders) is now documented in [`docs/target-funder-list.md`](../target-funder-list.md). All future funder references should use that document.

**Why:**
Grant funding authorities vary enormously in their application processes: some require a quiz to route applicants, some use locked online portals, some generate forms per-applicant, and some require multi-stage expressions of interest. There is no generalised API or extraction route that works across all types. By targeting funders with published, accessible guidelines, Grant Pathway can reliably extract structured data (questions, sections, word limits, eligibility criteria) and produce correctly formatted output. This constraint removes a category of support failure and makes the product significantly easier to test, demo, and explain to prospective users.

---

## 2026-05-28 — Step 4 redesign: auto-generation replaced with Q&A interview model

**What changed:**

- `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md` — all open questions resolved; final decisions documented; database design updated from JSONB column to table extension.
- `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — Slice 6 (Step 4) replaced in its entirety. Old 4 tasks (generate draft on load, editable textareas, regenerate all) removed. New 8 tasks (S6.1–S6.8) cover: extending the Step 3 prompt, Step 3 UI additions, database migration, preparation checklist, Q&A interface, per-question refine-answer API, senior review + assembly API, and Step 5 export update. Monthly AI cap updated from 20 to 50 throughout.
- `docs/PRD inputs/acceptance-criteria.md` — Section 9.6 rewritten. FR-28 (auto-generation on load) replaced with preparation checklist + user-authored answers. FR-29 (user-specified word limits) updated to auto-extracted word limits. FR-30 (AI draft inputs) updated to per-question assist + assembly. FR-31 (AI draft word limit warning) replaced with budget question flagging. FR-31A added (senior review prompt + funder-type-aware assembly). FR-34 (editable AI text) updated to user writes from scratch. FR-35 (discard/regenerate) updated to reflect that writing from scratch is the default.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — Summary table updated: Phase 4 grows from 36 to 40 tasks; 4 old S6 tasks removed from "done" count; 8 new tasks added as "not started". Phase 4→5 gate remains open pending S6 redesign completion.

**Why:**
Review of three real funder guidelines documents (Heritage Fund, Garfield Weston, Stony Stratford Town Council) and explicit AI policy statements from two major UK funders (Henry Smith Foundation, National Lottery Community Fund) established a clear finding: AI-generated draft answers actively disadvantage charities.

Both reviewed funders stated explicitly:

- Henry Smith: _"Your application should reflect your voice and experience"_ / _"Applications written in your own words give a much better insight into your work"_
- NLCF: _"AI supported applications do not tell the unique story of your community"_ / _"Being too generic in content may disadvantage your application"_

Funders score for specificity, community insight, and authentic voice — none of which appear in AI-generated boilerplate. The original design would have produced applications that are identifiable as AI-generated and weaker than manually written alternatives.

The new model aligns with Henry Smith's explicit guidance: "AI for structure not content." Grant Pathway uses AI to identify the right questions, assist with clarity and structure on request, and assemble the charity's own words into the required format. The charity writes the content.

**Architectural consequences:**

- `/api/generate-draft` route removed
- `application_answers` table: two new columns (`ai_refined_answer`, `is_budget_question`)
- `applications` table: two new columns (`assembled_draft`, `draft_status`)
- New API route: `POST /api/refine-answer` (structure/clarity only; AI assist disabled on budget questions)
- New API route: `POST /api/assemble-draft` (funder-type-aware; writes to `assembled_draft`)
- Step 5 export reads from `assembled_draft` (not assembled from individual answer rows)
- `funder_type: 'structured' | 'free_form'` extracted in Step 3; drives assembly format
- Monthly AI cap: 20 → 50; approaching-limit threshold: 16 → 40

**Full design record:** `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md`

---

## 2026-05-28 — Test fixture updated: TNL replaced with Stony Stratford Town Council

**What changed:**

- `docs/test-fixtures/tnl-community-fund-application-form-2025.docx` retired as a test fixture (it was a public appointment form, not a grant application — never a valid fixture).
- Replaced with two Stony Stratford Town Council documents: `Stony-Stratford-Town-Council-Grant-Scheme-2026-27-adopted-FC0226.docx` (scheme guidelines) and `Stony Stratford Grant-Application-Form-2026.docx` (application form).
- `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md` updated: fixture table corrected; design implications expanded to include Stony Stratford findings (supporting documents, budget table, countersignature requirement, third output format type); open question 1 marked resolved.

**Why:**
The TNL document was identified in the 2026-05-26 design review as a public appointment form for a board role at TNL Community Fund Wales — not a grant application. It provided no useful design signal. The Stony Stratford fixture is a genuine small local council grant (typical £100–£1,000) with discrete numbered questions, a budget table, a seven-category supporting documents checklist, and a mandatory treasurer countersignature. It adds a third distinct funder format to the test set and validates several design decisions in the Step 4 redesign proposal (budget question handling, supporting documents display, senior review prompt).

**Test fixture set now covers three distinct formats:**

- Heritage Fund: structured online portal, discrete questions + word limits, 11 supporting document categories
- Garfield Weston: free-form 10-page narrative, no discrete questions, financial tables required
- Stony Stratford: downloadable Word form submitted by email, 13 discrete questions, budget table, 7 supporting document categories, treasurer countersignature required

---

## 2026-05-26 — S1 testing: profile edit redirects to dashboard; beta feedback noted

**What changed:**

- `components/charity-profile-form.tsx` — After saving an edited charity profile, the page previously stayed on `/profile` and showed an inline "Your changes have been saved." banner. Changed to redirect to `/dashboard` instead.

**Why:**
During S1-P-04 testing, WJ found the stay-on-page behaviour felt like a dead end — after updating the profile the natural next step is to get on with an application. The original spec (IMPLEMENTATION-PLAN.md line 970) was: _"Subsequent saves: 'Your changes have been saved.' (stays on `/profile`)"_. The rationale was that an editor might want to review or further adjust their changes. In practice this feels less reassuring than being taken forward.

**Beta feedback needed:**
⚠️ **Collect user opinion on this during beta testing.** Ask users: "After saving changes to your charity profile, would you prefer to stay on the profile page or be taken to the dashboard?" The current behaviour (redirect to dashboard) matches new-user onboarding flow. If beta users frequently return straight to `/profile` after being redirected, reverting to stay-on-page with a success banner may be preferable.

---

## 2026-05-26 — S0 testing: four auth bugs fixed; Vercel infrastructure resolved

**What changed:**

**Bug fixes (found during S0-P-01 → S0-P-07 test run):**

- `components/nav-authenticated.tsx` — Sign out button had no `onClick` handler; clicking it did nothing. Fixed by wiring `onClick` directly on `DropdownMenuItem` and using `window.location.href = "/"` for a hard redirect (client-side `router.push` left stale auth cache). **(D-001)**
- `app/auth/callback/route.ts` + `actions/auth.ts` — Password reset email link landed on "Email verified" instead of "Choose a new password". Root cause: `resetPasswordForEmail` uses the PKCE code flow, so the callback received `?code=xxx` (not `?token_hash=xxx&type=recovery`) and the `code` branch always routed to `verify-email?state=verified`. Fixed by appending `?next=reset` to the `redirectTo` URL so the callback can distinguish recovery from email verification and redirect to `forgot-password?state=reset` instead. **(D-002)**
- `actions/auth.ts` + `components/reset-password-form.tsx` — Entering the same password during a reset showed the generic "Something went wrong" error. Fixed by detecting Supabase's `same_password` error code and returning a specific status that renders "Your new password must be different from your current password." **(D-003)**
- `actions/auth.ts` — After a successful password reset, clicking "Sign in" redirected to `/dashboard` because the recovery session was still active. Fixed by calling `supabase.auth.signOut()` immediately after `updateUser` succeeds, so the session is clean before the user reaches the sign-in page. **(D-004)**
- `docs/test-plan-e2e-slices-4-8.md` — Defect log updated with D-001 to D-004; sign-out reminder added at end of S0-P-02.

**Infrastructure fixes:**

- `vercel.json` — `cleanup-guidelines` cron schedule changed from `*/30 * * * *` (every 30 min) to `0 2 * * *` (daily 02:00 UTC). Vercel Hobby plan rejects sub-daily cron expressions and was silently canceling every deployment. **Revert to `*/30 * * * *` when upgrading to Vercel Pro (P5.4).**
- Vercel GitHub App webhook reconnected — auto-deploy from `master` had stopped working (no webhook installed on GitHub repo). Reconnecting the integration in Vercel Project Settings → Git restored auto-deploy.

**Decision recorded:**

- Vercel Pro upgrade approved — Hobby plan blockers (sub-daily cron rejected, 2-cron cap, unreliable webhook) caused significant testing overhead. Upgrade to Pro (~£16/month) will be actioned as part of P5.4. Total fixed costs remain within C1 budget (~£36/month of £100/month).

**Why:**
First full test run of Slice 0 (authentication) uncovered four bugs in the auth flow, all fixed on the same day. The most significant was D-002 (password reset routing) which required understanding the interaction between Supabase's PKCE code flow and the app's auth callback route. Infrastructure issues (Vercel Hobby cron restriction and missing webhook) caused unexpected deployment friction; both are resolved and documented.

---

## 2026-05-26 — ADR-DATA-005: Backup strategy decided; documentation updated

**What changed:**

- `docs/Technical Decision and Design/ADR-DATA-005-backup-strategy.md` (new) — Supabase Pro daily backup strategy decided. Decision: upgrade production Supabase project to Pro tier before go-live. Provides daily automated backups with 7-day retention, UK-hosted (eu-west-2). Zero implementation effort. Cost: ~£20/month.
- `docs/Technical Decision and Design/ADR-INDEX.md` — ADR-DATA-005 added to Group 4 (Data); total ADRs: 43 → 44; "Last updated" date updated.
- `docs/Technical Decision and Design/technical-design.md` (v1.0 → v1.1) — §3 operating costs table updated: Supabase line changed from "Free tier (initially)" to "Pro (~£20/month)"; total fixed costs updated from ~£16/month to ~£36/month.
- `docs/legal/privacy-policy.md` (v1.1, new folder) — Three corrections from v1.0: (1) Section 5 provider table updated — Anthropic/US replaced with Amazon Web Services Bedrock/UK; Sentry corrected from "United States" to "European Union". (2) Section 5 AI processing note rewritten to accurately describe Bedrock eu-west-2 routing. (3) Section 6 international transfers updated — AI processing no longer a US transfer. (4) Section 7 updated to disclose 7-day automated backup retention window that applies after account deletion (GDPR Article 17 requirement).
- `docs/legal/terms-of-service.md` (v1.1, new folder) — Section 5 updated to reference Amazon Bedrock as the AI processing layer. Section 9 updated to acknowledge operational backup infrastructure exists as an internal safeguard, with an explicit statement that this does not constitute a guarantee of data recovery.
- `docs/overview/business-overview.md` (v1.1, new folder) — "Data, Privacy, and Trust" section updated to: (1) correct AI data residency statement (Bedrock UK/EEA, not Anthropic US); (2) acknowledge operational daily backup infrastructure for disaster recovery; (3) clarify that deletions remain immediate and permanent from the user's perspective, with backup copies purged within 7 days.
- `docs/Implementation Plan/ADR-TRACEABILITY.md` — ADR-DATA-005 consequences added to the Data section.
- `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — P5.4 pre-launch checklist updated: "Activate Supabase Pro plan and confirm automated backup is active" added.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — Notes entry added for ADR-DATA-005 decision.
- Legal and overview documents moved from `docs/` root to `docs/legal/` and `docs/overview/` subfolders for better long-term version management.

**Why:**
The absence of any backup mechanism represented a reputational risk: a migration error, compromised credentials, or provider incident affecting multiple charities simultaneously would be permanently unrecoverable. Supabase Pro's daily automated backups (7-day retention, London region) address this risk with zero implementation effort and within the C1 budget constraint. Three pre-existing inaccuracies in the privacy policy were corrected at the same time: the Anthropic/US AI provider reference (superseded by the 2026-05-07 Bedrock migration, DR-DP-002), the Sentry region (EU, not US), and the backup retention window (a GDPR Article 17 disclosure obligation introduced by ADR-DATA-005).

---
