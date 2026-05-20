# Grant Pathway — Design & Decision Changelog

**Purpose:** This log records every significant change to the original design of Grant Pathway, together with the reason for each change. Use it to refresh context on why the design evolved, without having to re-read all the source documents.

**Authoritative sources:** When this log refers to a decision record, the full rationale lives in the linked file. This log summarises; the ADR or DR is the definitive record.

---

## 2026-05-20 — P3.8 Complete: Email Infrastructure; Inactivity Emails Moved to Code

**What changed:**
- Resend sending domain `grantpathway.org.uk` verified (SPF + DKIM via GoDaddy DNS).
- Supabase Auth SMTP configured to send via Resend: `smtp.resend.com:465`, sender `noreply@grantpathway.org.uk`.
- Supabase Auth email templates updated: Confirm sign up and Reset password — teal CTA buttons, Grant Pathway branding, tone aligned to voice guide.
- Inactivity emails (Email 3 — inactivity warning; Email 4 — account deleted) will be built as dedicated code functions in `lib/emails/inactivity-warning.ts` and `lib/emails/account-deleted-inactivity.ts`, not as Resend templates.
- `RESEND_API_KEY` added to `.env.example` and `.env.local`.
- ⚠️ Prerequisite before testing: `noreply@grantpathway.org.uk` mailbox must be created in GoDaddy before any email flow is tested.

**Why:**
Resend's HTML template editor does not support variable substitution — variables rendered as literal strings (`{first_name}`) rather than being replaced at send time. Rather than use a workaround, the inactivity email HTML will be built in code as pure functions that accept variables and return an HTML string. This also separates email content from cron job logic, making both easier to maintain independently. The cron jobs in Slice 8 will call `resend.emails.send({ html: buildInactivityWarningEmail(firstName, deletionDate) })`.

---

## 2026-05-18 — Charity Profile Lookup Unavailable State Simplified

**What changed:**
- `components/charity-profile-form.tsx`: removed "Try again" and "Enter details manually" buttons from the API unavailable error state.
- Replaced with a single plain message: "We couldn't reach the Charity Commission right now. You can try again using the **Look up charity** button above, or fill in your details manually in the fields below."
- Removed the `showLookup` state and the conditional wrapper around the lookup section — the lookup is now always visible.
- Removed unused `handleTryAgain` and `handleEnterManually` functions.

**Why:**
"Try again" was redundant — the "Look up charity" button already visible above does the same thing. "Enter details manually" hid the lookup section, which was jarring and unnecessary since the form fields are always visible below. One clear message pointing to what is already on screen is simpler and less confusing.

---

## 2026-05-18 — Charity Profile AI Paraphrase on Lookup Match

**What changed:**
- `components/charity-profile-form.tsx`: when the Charity Commission lookup finds a match, "What does your charity do?" and "Who does your charity help?" are now pre-filled with AI-paraphrased plain-English versions of the charity's legal objects and beneficiary description.
- An amber "AI-generated content below" banner appears above the two fields explaining the source and instructing the user to review and edit before saving.
- The individual hint texts for those two fields are hidden when the banner is active (the banner replaces them). They remain visible when the lookup has not been run.
- A `paraphrasedFromLookup` state tracks whether pre-fill is active; also initialised from the `?lookup=match` URL param for static shell testing.

**Why:**
Asking non-technical users to locate and rewrite formal Charity Commission legal objects language is a barrier. AI paraphrase removes that burden while the prominent disclaimer ensures users understand the content is AI-generated and must be reviewed. One AI call (paraphrase on lookup match) rather than two.

---

## 2026-05-18 — Charity Profile Form Hint Text Added

**What changed:**
- `components/charity-profile-form.tsx`: added hint text beneath the label for three fields — "What does your charity do?", "Who does your charity help?", and "Where do you work?". Each hint is linked to its field via `aria-describedby`.

| Field | Hint text |
|-------|-----------|
| What does your charity do? | Points to Charity Commission entry (charitable objects) and website 'About us' page. |
| Who does your charity help? | Prompts user to think about age, background, or circumstances of beneficiaries; notes Charity Commission entry as a source. |
| Where do you work? | Suggests town, county, or region; explains 'National'; fallback to charity's home town if unsure. |

**Why:**
Non-technical users (primary persona Margaret) may not know what information to enter in these open-ended fields. The hints point to authoritative, accessible sources (Charity Commission register, charity website) and give concrete examples to reduce blank-page anxiety.

---

## 2026-05-18 — Step 5 Back Button Hidden After Approval

**What changed:**
- `components/application-step5-approve.tsx`: Back link now only renders when `isApproved` is false (pending state). It is hidden once the application is approved or exported.

**Why:**
Once approved or exported, "Re-open application" is the correct route back to Step 4 — it shows a confirmation dialog warning that approval will be removed. The plain Back link bypassed that dialog, silently navigating to Step 4 with no context. It was redundant at best and misleading at worst.

---

## 2026-05-18 — Step 3 Approaching-Limit Banner Moved to Step 4

**What changed:**
- `components/application-step3-summary.tsx`: removed `approachingLimit` prop and amber "You've used most of your monthly AI allowance" banner.
- `app/(authenticated)/applications/[id]/step/3/page.tsx`: removed `usage` search param and `approachingLimit` prop pass-through.
- `components/application-step3-summary.tsx`: fixed missing space between question count and "application" in green questions-found banner (rendered as "3application" → "3 application").

**Why:**
The approaching-limit banner on Step 3 contradicted the green banner below it, which promised to generate draft answers in the next step. Step 3 displays a summary that has already been generated, so the AI allowance warning is irrelevant at this point. Step 4 already shows the same warning immediately before the user triggers the draft-generation AI call, which is the correct placement.

---

## 2026-05-18 — Step 3 Continue Button Simplified

**What changed:**
- `components/application-step3-summary.tsx`: continue button text changed from "This looks right — continue" to "Continue".
- `docs/PRD inputs/screen-requirements.md`: Step 3 continue button spec updated to match.

**Why:**
"This looks right — continue" is unnecessarily wordy. "Continue" is cleaner and consistent with the button label used on Steps 1 and 2.

---

## 2026-05-18 — Step 2 Format and Scanned Error Messages Improved

**What changed:**
- `components/application-step2-form.tsx`: format and scanned error messages rewritten for consistency with the size error message.

| Error | Was | Now |
|-------|-----|-----|
| Format | "We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly." | "We can only accept PDF or Word (.docx) files. Check the funder's website for a version in one of these formats. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below." |
| Scanned | "We couldn't read the text in your PDF — it may be a scanned document. Please try copying and pasting the text directly instead." | "We couldn't read the text in your PDF — it looks like a scanned document rather than a digital one. Some funders also publish a Word version of their guidelines — check their website. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below." |

**Why:**
The scanned error made no mention of a Word doc as an alternative, inconsistent with the format error which correctly lists both accepted formats. All three error messages now follow the same pattern: explain the problem, point to the funder's website as the primary fix, then offer the paste fallback with guidance on what to paste.

---

## 2026-05-18 — Step 2 File Size Error Message Improved

**What changed:**
- `components/application-step2-form.tsx`: size error message rewritten.

| Was | Now |
|-----|-----|
| "Your file is over 10MB. Please upload a smaller file or paste the text directly." | "Your file is over 10MB. Some funders publish a shorter summary version of their guidelines — check their website first. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below." |

**Why:**
The original message was unhelpful — it told users to get a smaller file without explaining how. The revised message points users to the funder's website first (cleanest fix) and then offers the paste fallback as a secondary option.

---

## 2026-05-18 — Step 1 Heading Differentiated for New vs Existing Applications

**What changed:**
- `docs/PRD inputs/screen-requirements.md`: Step 1 heading split into two variants.
- `components/application-step1-form.tsx`: heading now conditional on whether an `applicationId` is present.

| Route | Heading |
|-------|---------|
| `/applications/new` | "Start a new application" |
| `/applications/[id]/step/1` | "Continue your application" |

**Why:**
The original spec had a single heading for both states. When returning to an existing application the user is not starting anything new — "Continue your application" better reflects the context and avoids confusion.

---

## 2026-05-18 — Step Indicator Circle Styles Corrected (DDR-CS-004, DDR-AC-001)

**What changed:**
- `components/step-indicator.tsx`: two circle style fixes.

| State | Was | Now |
|-------|-----|-----|
| Current step | Teal fill + persistent teal ring | Teal fill only — no ring in default state |
| Upcoming steps | Grey fill (`#E2E8F0`) | White fill + `2px solid #E2E8F0` border |

**Why:**
DDR-CS-004 specifies upcoming steps as white fill with grey border, not grey fill. DDR-AC-001 specifies the amber focus ring (`#D97706`) applied on `:focus-visible` only — a persistent teal ring on the current step is not part of the spec. Identified during Phase 1 spec compliance review on 2026-05-18.

---

## 2026-05-18 — Charity Profile Incomplete Banner Corrected (design-requirements.md §5.12)

**What changed:**
- `components/dashboard-empty.tsx` and `components/dashboard-populated.tsx`: charity profile incomplete banner updated to match design-requirements.md Section 5.12.

| Property | Was | Now |
|----------|-----|-----|
| Background | `#FEF9F5` (warm white) | `#FEF3C7` (pale amber) |
| Border | `1px solid #EDE8E1` (warm border) | `1.5px solid #FDE68A` (amber-200) |
| Icon | None | `AlertTriangle` in `#D97706` |
| Text | "Before you start, add your charity details…" `#1E293B` | "Your charity profile isn't complete yet…" `#92400E` 500 weight |
| Button | Teal outline "Set up charity profile" | Amber fill "Complete your profile" |

**Why:**
The banner was built with warm-white styling instead of the spec'd pale amber. Identified during Phase 1 spec compliance review on 2026-05-18.

---

## 2026-05-18 — Review Prompts Moved to Step 4 Sticky Sidebar (DDR-LA-002)

**What changed:**
- `components/application-step4-draft.tsx`: content state changed from single-column to two-column layout. Main content (left, max 640px) + sticky right sidebar (280px) containing the three review prompts per DDR-LA-002 and DDR-LA-001.
- `components/application-step5-approve.tsx`: review prompts removed entirely. Step 5 is single-column per DDR-LA-001.

**Why:**
Review prompts were incorrectly placed inline at the top of Step 5 during Phase 1 implementation. DDR-LA-001 specifies single-column for Steps 1, 2, and 5, and two-column for Steps 3 and 4. DDR-LA-002 specifies the review prompts belong in a sticky right-hand sidebar on Step 4, always visible while the user edits answers. Identified during Phase 1 spec compliance review on 2026-05-18.

---

## 2026-05-18 — Step 5 Review Prompts Corrected to Exact Acceptance Criteria Wording

**What changed:**
- `components/application-step5-approve.tsx`: three review prompts replaced with exact wording from AC-FR-32-01.

| Was | Now |
|-----|-----|
| "Check that your answers are accurate and reflect your charity's work." | "Does this accurately describe your charity and project?" |
| "Make sure you have answered every question the funder asked." | "Are all figures, dates, and facts correct?" |
| "Read through as if you were the funder — does your application make a strong case?" | "Does this answer the question that was asked?" |

**Why:**
Custom prompt text was written during Phase 1 implementation instead of reading AC-FR-32-01 verbatim. Identified during Phase 1 spec compliance review on 2026-05-18.

---

## 2026-05-18 — Approve Confirmation Changed from Inline Expansion to Modal Dialog

**What changed:**
- [DDR-IP-001](Business%20Design/DDR-IP-001-confirmation-pattern.md) revised: approve application confirmation changed from **Option B (inline expansion)** to **Option A (modal dialog)**.
- Confirm button text set to **"Approve my application"** (was "Yes, approve" in original spec; matches what was built in Phase 1).
- No code changes required — `components/application-step5-approve.tsx` was already built with a modal dialog.

**Why:**
The approve action is consequential — once exported, a user may have already submitted to a funder, so a duplicate submission is a real risk. An inline expansion risks being overlooked; a modal ensures the user actively acknowledges the confirmation before proceeding. This also gives the product a fully consistent pattern: every consequential action (approve, re-open, re-export warning, delete application, delete account) uses a modal or explicit confirmation.

PDR-UI-006 discourages modals for unexpected interruptions (errors). A user-initiated confirmation is not unexpected, so this does not conflict with that principle.

---

## 2026-05-18 — Step 2 Label Renamed to "Uploaded Guidelines"

**What changed:**
- [DDR-CS-004](Business%20Design/DDR-CS-004-step-indicator.md) updated: Step 2 label changed from "Funder Guidelines" to "Uploaded Guidelines".
- `components/step-indicator.tsx` updated to match.

**Why:**
During Phase 1 Static UI Shell review, the built label ("Upload Guidelines") was flagged as inconsistent with the spec ("Funder Guidelines"). Owner preference is "Uploaded Guidelines" — the past-tense phrasing better reflects that the user has already completed the upload action by the time they see it as a completed step, and is clearer to users at a glance than the more abstract "Funder Guidelines".

---

## 2026-05-17 — Observability Stack Completed

**What changed:**
- New [ADR-OPS-007](Technical%20Decision%20and%20Design/ADR-OPS-007-uptime-monitoring.md) created: uptime monitoring via UptimeRobot (free tier) + a `/api/health` endpoint.
- [ADR-OPS-005](Technical%20Decision%20and%20Design/ADR-OPS-005-error-tracking.md) updated: added cross-reference to ADR-OPS-007 for the complete observability picture.
- [ADR-INDEX](Technical%20Decision%20and%20Design/ADR-INDEX.md) updated: Operations group 6 → 7 ADRs, total 42 → 43.

**Why:**
Sentry (ADR-OPS-005) only captures errors when requests reach the application. A complete Vercel outage or failed deployment produces no Sentry events — the app would be down and silent. Without an external uptime monitor, there is no way to detect a total outage proactively, and no way to measure performance against the documented 99.5% uptime target (NFR-02).

The `/api/health` endpoint checks database connectivity, not just homepage availability — a broken Supabase connection returns a CDN-cached 200 from the homepage even while the app is functionally unusable.

**Observability stack as documented:**

| Layer | Tool | Covers |
|---|---|---|
| Uptime | UptimeRobot (free) | App reachable? DB responding? |
| App errors | Sentry EU | Unhandled exceptions, AI API failures |
| DB / Auth / Storage | Supabase dashboard | Slow queries, auth failures, storage errors |
| Deployments | Vercel dashboard | Build failures, deployment status |
| Dev debugging | Vercel function logs | Real-time logs during development |

**Previously:** The original design treated Vercel function logs as a dev-only complement to Sentry and did not document Supabase logs or external uptime monitoring.

---

## 2026-05-08 — Phase 0 Complete; Documentation Committed to GitHub

**What changed:**
- Project bootstrapped: Next.js 16.2.5, TypeScript, Tailwind v4, shadcn/ui 4.7.0 (14 components), lucide-react, zod.
- Design tokens confirmed: teal `#0D6E6E`, teal-light `#E6F4F4`, amber `#D97706`, success `#16A34A`, neutral-dark `#1E293B`, neutral-light `#F8FAFC`.
- Route group structure created: `(public)` and `(authenticated)` with 16 stub pages.
- All documentation (BRD, PRD, ADRs, PDRs, DRs, implementation plan, data model, personas) committed to `docs/` in this repository — GitHub is now the single source of truth for all project documentation.
- `proxy.ts` used in place of `middleware.ts` (Next.js 16 convention).
- Vercel deployment live.

**Why:**
Phase 0 establishes the technical skeleton and confirms the toolchain works before any feature development begins. Storing documentation in the repository links design decisions directly to the code that implements them.

---

## 2026-05-07 — Major Revision: AI Provider, Data Residency, and Implementation Plan

This is the most significant revision to the original design. Three decision records were formally revised and the implementation plan was finalised with 30 conflict resolutions.

---

### 1. AI Inference Layer: Anthropic Direct → Amazon Bedrock

**Original decision (2026-04-09):** Claude 3.5 Sonnet via Anthropic's direct API (US infrastructure). Required Anthropic DPA and Standard Contractual Clauses (SCCs) before launch.

**Revised decision:** Claude Sonnet 4.6 via **Amazon Bedrock, eu-west-2 (London), In-Region routing**. EU Geo fallback covers 7 EEA AWS regions. Data never leaves the EU/EEA under any operating condition.

**Why it changed:**
UK data residency is a trust and compliance requirement for charities. The Anthropic direct API processes data on US infrastructure, requiring DPA and SCCs — complex contractual arrangements that delay launch and complicate the privacy policy. Amazon Bedrock eu-west-2 provides In-Region routing at no surcharge, eliminating transatlantic data transfer entirely. The DPA/SCC requirement drops off the critical path.

The model capability and pricing are unchanged. Claude Sonnet 4.6 is the direct successor to Claude 3.5 Sonnet. Bedrock identifiers: `anthropic.claude-sonnet-4-6` (In-Region) / `eu.anthropic.claude-sonnet-4-6` (Geo EU fallback, 10% surcharge).

**References:** [DR-AI-002](decisions/DR-AI-002-ai-provider.md), [DR-DP-002](decisions/DR-DP-002-data-hosting.md), [ADR-AI-001](Technical%20Decision%20and%20Design/ADR-AI-001-ai-provider.md), [ADR-AI-002](Technical%20Decision%20and%20Design/ADR-AI-002-model-selection.md)

---

### 2. Context Window: 200,000 → 1,000,000 Tokens

**Original design:** Claude 3.5 Sonnet context window of 200,000 tokens. Soft warning triggered at 150,000 characters (ADR-AI-007). Hard truncation of documents above the threshold was in the plan.

**Revised design:** Claude Sonnet 4.6 context window of 1,000,000 tokens. Soft warning threshold set at 100,000 tokens (~400,000 characters) as a quality guidance measure only. Hard truncation removed entirely.

**Why it changed:**
The 200k window was a real engineering constraint with Claude 3.5 Sonnet — very long funder guidelines could not fit. Claude Sonnet 4.6's 1M token window makes this a non-issue. The soft warning is retained as guidance to focus on the most relevant sections of guidelines, not as a technical limit. The character threshold in ADR-AI-007 (150,000 characters) is superseded by the PRD token-based threshold (100,000 tokens).

**References:** [PDR-AI-004](PRD%20decisions/), [ADR-AI-007](Technical%20Decision%20and%20Design/ADR-AI-007-context-window-management.md)

---

### 3. Data Ownership: Contractual Mechanism Updated (Substance Unchanged)

**Original design:** Charities own all data; no AI training use ever. Enforced by Anthropic DPA.

**Revised design:** Commitment unchanged. Enforcement mechanism updated — AWS Data Processing Agreement + Anthropic model terms through Bedrock now provide the contractual guarantee. Anthropic DPA no longer required as a separate instrument.

**Why it changed:**
The shift to Bedrock changed the legal chain, not the promise. The user-facing commitment (no training, user owns data) is identical.

**References:** [DR-DP-003](decisions/DR-DP-003-data-ownership.md)

---

### 4. AWS Bedrock Spend Cap Added

**Original design:** Per-user monthly AI request limit (20 requests) as the primary cost control.

**Added:** AWS Bedrock monthly spend alert at £70 and hard cap at £100, configured in the AWS Bedrock console. This is a secondary backstop — the per-user limit remains the primary control. Estimated monthly cost at launch (~10 concurrent users): £35–£38.

**Why it changed:**
The Bedrock console provides native spend controls that were not available with the Anthropic direct API. Adding them as a backstop protects against unexpected usage spikes. Does not change user-facing behaviour.

---

### 5. Implementation Plan Finalised: 30 Specification Conflicts Resolved

During implementation planning, 30 conflicts between the BRD, PRD, ADRs, screen requirements, acceptance criteria, and data model were identified and resolved. The most significant resolutions:

| Topic | Original position | Resolved position | Authority |
|---|---|---|---|
| Route paths | Singular `/application/[id]` (tech-design.md) | Plural `/applications/[id]` | Screen requirements |
| Landing page | Separate landing + sign-in pages | Single `/` page combining both | Screen requirements |
| Password reset | Two routes (`/forgot-password` + `/reset-password`) | Single route with two states | Screen requirements |
| Step routing | IA document described in-page states | URL-based routing (`/step/[n]`) | ADR-ARCH-004 (later decision) |
| Charity profile fields | Included income band + registered address | Removed those fields; merged mission | Screen requirements |
| Dashboard AI usage | Not in original dashboard plan | AI usage indicator added (`n of 20 used`) | ADR-AI-008 consequence |
| Document truncation | Hard truncation above threshold | Soft warning only; no truncation | PDR-AI-004 |
| Word export font | Inter, teal headings (ADR-EXPORT-002) | Calibri 11pt, no teal headings | PDR-DH-003 (PRD takes precedence) |
| Inactivity tracking field | Custom `last_login_at` column | `auth.users.last_sign_in_at` (Supabase native) | data-model.md |
| Inactivity deletion (v1 scope) | Deferred in ADR | v1 requirement | PRD inputs + acceptance criteria |
| Charity Commission API error UX | No retry mechanism in original plan | "Try again" button added | PDR-UI-006 |
| AI persistent failure state | Single error state | Second error state after failed retry | PDR-UI-006 |
| Application status values | `draft, in_progress, complete` | `not_started, in_progress, approved, exported` | data-model.md |
| Status transition trigger | `not_started → in_progress` on Step 1 Continue | Transition occurs on Step 2 guideline save | application-status-model.md |
| Re-open approved application | Status reverts only | Status reverts + all `is_approved` reset to false | Acceptance criteria |
| Protected routes list | Singular paths in ADR-SEC-001 | Plural paths matching resolved routes | Implementation plan |

**References:** [Implementation Plan](Implementation%20Plan/IMPLEMENTATION-PLAN.md)

---

## 2026-04-17 to 2026-04-21 — Original Architectural Decisions (ADRs)

The 42 original Architectural Decision Records were created and decided in this window. These represent the baseline design. All subsequent changes above are revisions to or additions to this baseline.

Key decisions in the original baseline:

| Area | Decision |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Database | Supabase (PostgreSQL, eu-west-2) |
| Auth | Supabase Auth |
| Hosting | Vercel Pro |
| UI library | shadcn/ui on Radix UI primitives |
| Error tracking | Sentry EU with PII scrubbing |
| AI provider | Anthropic direct API (later revised to Bedrock — see above) |
| File uploads | Signed-URL direct to Supabase Storage (bypasses Vercel 4.5MB limit) |
| Rate limiting | Upstash Redis, 5 AI requests/60s per user |
| Export | Word (.docx) via `docx` library |
| AI retry logic | Exponential backoff: 2 retries, 1s then 3s delays, for 429/500/529 |
| Uptime target | 99.5% (NFR-02) |

**References:** [ADR-INDEX](Technical%20Decision%20and%20Design/ADR-INDEX.md) — all 43 ADRs listed with status.

---

## 2026-04-09 to 2026-04-16 — Original Business and Product Decisions

The foundational business decisions (DR series) and product requirements decisions (PDR series) were made in this window. These defined the original scope and user experience. The major revision on 2026-05-07 changed the AI delivery mechanism but left all product decisions intact.

Key product decisions that are unchanged from the original:

- **Target users:** Small-to-medium UK charities; non-technical grant writers; desktop-primary.
- **Access model:** Free at launch; registered charities only; no self-serve grant discovery.
- **AI capabilities:** Funder guideline summarisation + question extraction + draft answer generation. Human review mandatory before export.
- **Monthly AI limit:** 20 requests per user, with 80% soft warning.
- **Data storage:** Charities own all data; no AI training use; 24-month inactivity deletion with 30-day warning.
- **Liability:** App is a writing aid only; user responsible for all content submitted to funders.
- **Accessibility:** WCAG 2.2 AA.
- **UK-only scope:** UK grants, UK charities, UK data residency (achieved via Bedrock revision above).

**References:** [decisions/](decisions/DECISIONS-INDEX.md), [PRD decisions](PRD%20decisions/)

---

*Last updated: 2026-05-20*
*Maintained by: Rapidglobe Ltd*