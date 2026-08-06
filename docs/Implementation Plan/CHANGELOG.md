# Grant Pathway — Design & Decision Changelog

**Tier:** 1 — Always check after every task
**Volatility:** High
**Update when:** Any significant design decision, deviation from plan, or architectural change

**Purpose:** This log records every significant change to the original design of Grant Pathway, together with the reason for each change. Use it to refresh context on why the design evolved, without having to re-read all the source documents.

**Authoritative sources:** When this log refers to a decision record, the full rationale lives in the linked file. This log summarises; the ADR or DR is the definitive record.

---

## 2026-08-06 — GAP-45: the Help button always lands on the front page, and the deep-linking helper it needs already exists

**Raised by WJ. Logged with a verified slug map; not built.**

WJ's question was simple: pressing **Help** from Step 4 should open "Writing and editing an answer", not the help centre front page a user then has to navigate from.

**The plumbing has been there all along and was never connected.** `lib/help-centre.ts` exposes `helpCentreUrl(path)` specifically for this, and its header comment names the use case almost word for word — _"future deep-linking (e.g. linking Step 2's upload screen straight to the relevant help page) a one-line call site rather than a redesign."_ But `nav-authenticated.tsx` links to the bare `HELP_CENTRE_BASE_URL` constant instead of calling the helper, so **the function built for deep-linking is unused at precisely the place that most needs it.** The only caller anywhere in the codebase is `dashboard-empty.tsx`, and it passes no path. `nav-authenticated.tsx` is already `'use client'`, so `usePathname()` supplies the current route with no prop drilling — the change is a route map in `lib/help-centre.ts` plus one lookup in the nav.

**Slugs fetched and verified rather than guessed.** The live GitBook sitemap was read (21 pages) and the Step 4 target fetched to confirm it resolves to a real page rather than a 404. Guessed slugs would have been worse than the current behaviour: a wrong path 404s, where today's root landing at least works.

| Screen                      | Help page (path relative to the base URL)           |
| --------------------------- | --------------------------------------------------- |
| `/applications/new`, Step 1 | `applications/choosing-your-funder-and-grant`       |
| Step 2                      | `applications/uploading-funder-guidelines`          |
| Step 3                      | `applications/reviewing-the-ai-summary`             |
| **Step 4**                  | **`writing-answers/writing-and-editing-an-answer`** |
| Step 5                      | `finishing-up/final-review`                         |
| `/profile`                  | `getting-started/setting-up-your-charity-profile`   |
| `/account`                  | `account-settings/changing-your-password`           |
| `/account/delete`           | `account-settings/deleting-your-account`            |

**Two decisions left open for WJ.** `/dashboard` has no clean match — nearest is `reference-and-faqs/application-status-labels`, and the default is to leave it on the root. And the public routes could deep-link too (`/register` → `getting-started/creating-your-account`, sign-in and forgot-password → `getting-started/signing-in`), but WJ scoped this to the authenticated nav, so they are recorded rather than assumed.

**Deliberately not deep-linked:** the footer "Help centre" link and the dashboard empty-state link stay on the root. They are general-purpose; the nav button is the "help me with _this_ screen" affordance.

**Six of the 21 help pages cover Step 4 alone** — writing-and-editing, word-and-character-limits, getting-ai-help, sections-with-financial-information, adding-a-financial-or-governance-detail, approving-answers. One nav link can only target one. Landing the user in the right _section_ and letting GitBook's own sidebar carry them the rest of the way is the intended outcome, not a shortfall — worth stating so it is not later mistaken for incomplete work.

**⚠️ A maintenance risk that needs to be owned, not implied.** The help centre is an external GitBook. Today a broken URL is one obvious failure anyone would notice; with nine deep links, a page renamed on the GitBook side silently 404s one route's Help button. **Nothing in CI can catch this**, and there is no client-side fallback available — a GitBook 404 is invisible to the app, so we cannot detect it and drop back to the root. Two mitigations, both cheap and both now in place: the entire map lives in `lib/help-centre.ts` so there is one file to check, and **`help-and-tooltips-test-plan.md` gains HT-06** (v2.1) — click Help on every screen, confirm the right page, re-run whenever the help centre is restructured. HT-06 is written now and marked **not runnable** until the feature exists, so the coverage cannot be forgotten between logging and building.

**Documentation consequence for build time:** `AC-FR-49-01` says clicking Help "opens the help centre in a new browser tab" and will need to read _the relevant page of_ the help centre. It is accurate today and deliberately left unchanged until the behaviour changes.

---

## 2026-08-06 — AC-FR-18-02's silence rule withdrawn: every successful save will be visibly confirmed

**Decided by WJ the same day `GAP-44` was raised. Six statements of the old rule across four live documents amended in one pass. No code changed.**

`GAP-44` surfaced a conflict rather than a straightforward gap: adding the save confirmation WJ wanted would violate `AC-FR-18-02`, which required that during a background auto-save "no visible save indicator is shown to the user". That was a deliberate decision, not an oversight — `AC-FR-18-04`'s 2026-07-29 amendment had already carved **failures** out of the silence rule and pointedly left success alone.

Two options were put to WJ. The narrower one — confirm blur and explicit saves, keep the 60-second sweep silent — would have delivered the reassurance while satisfying every existing criterion unamended, and was the recommendation.

**WJ chose the broader option: amend `AC-FR-18-02` and confirm every save, sweep included.** His reasoning is a product judgement worth preserving in full, because it overturns the assumption the original rule rested on:

> Silence was chosen to avoid nagging the user with an indicator firing every 60 seconds regardless of what they were doing. Weighed against a real applicant's hesitancy to close a browser tab containing hours of writing, that is the lesser concern. **Silence reads as "nothing is happening", not "everything is fine"** — a nervous user given no signal assumes the worst. And the user who steps away mid-sentence _without_ moving focus is precisely the nervous user this is for; the narrower option is the one that leaves them with nothing.

**What survives from the withdrawn rule.** Its intent — do not get in the user's way — is now a constraint written into `AC-FR-18-05`: the confirmation must not interrupt typing, steal focus, or require dismissal, and must be visually distinct from `AC-FR-18-04`'s "Not saved." alert, which is an alert the user must act on rather than a confirmation they need not. Only the assumption that silence was the way to achieve that intent has been dropped.

**Amended as a class, not an instance.** The rule appeared in **six statements across four live documents**, and all six were changed together rather than only the one that prompted the question:

- `acceptance-criteria.md` — `AC-FR-18-02` rewritten with a full amendment note; `AC-FR-18-04`'s "Note on the deliberate exception to AC-FR-18-02" rewritten, since it described itself as an exception to a rule that no longer exists; `AC-FR-18-05` promoted from draft to criterion
- `PRD-Grant-Pathway.md` (**v0.67**) — FR-18's implementation notes and Section 7's auto-save line
- `docs/Business Design/design-requirements.md` §7.8 — "No visible indicator for background auto-save (avoids distraction)" reversed with the reasoning recorded
- `docs/Business Design/ui-inventory-and-data-contracts.md` — the cross-step auto-save statement

This project has now recorded the fix-the-instance-not-the-class failure seven times, most recently in `GAP-43` earlier the same day. Amending one statement and leaving five contradicting it would have been the eighth.

**`AC-FR-18-05` (now a criterion, not a draft):** every successful save is visibly confirmed — blur, background sweep and explicit alike — unobtrusively, without stealing focus or needing dismissal, and visually distinct from the failure alert. **Not built.** `GAP-42`, `GAP-43` and `GAP-44` all remain open with no covering task.

---

## 2026-08-06 — Step 4 never says you can stop and come back: GAP-42, GAP-43, GAP-44

**Raised by WJ after watching his wife work through a real application. All three approved, none built — one of them cannot be built until WJ rules on a spec conflict.**

WJ's observation was narrow and correct: Step 4 has an Approve action on every card and a sticky "N of N questions approved" bar, and between them the screen reads as _finish this in one sitting_. Nothing anywhere tells a charity worker they can close the tab on a part-written application and pick it up tomorrow. Checking it turned up two further problems behind the one he asked about.

### GAP-42 — the reassurance is missing, and it is purely a copy gap

**The capability already works.** The dashboard's Continue link goes to `/applications/[id]/step/[currentStep]` (`dashboard-populated.tsx`) and Step 4 rehydrates every answer and its approved state. She can genuinely leave and return; the product just never says so. The nearest existing wording — "Your work is saved automatically as you type" — asserts the data is safe _now_, which is a different reassurance from _the journey is resumable_, and the second is the one a first-time user closing a browser tab on two hours of writing actually needs.

**Agreed wording (WJ, 2026-08-06):** _"Answer each question below. Your answers are saved automatically. You can close this page at any time and continue from your dashboard."_

**"Continue from your dashboard" is deliberate and should not be strengthened.** Return is to the **step**, not the question — with 17 questions the user lands at the top of a long page and scrolls to find their place. "Return to the exact point" would be a promise the product does not keep.

### GAP-43 — the copy being replaced was false, and the PRD contradicted itself

"Saved automatically **as you type**" is not what happens. `handleAnswerChange` only updates local React state and marks the answer dirty; the writes are on **blur** and via a **60-second background sweep**. There is no debounce timer and no `beforeunload` guard anywhere in the codebase. Someone typing steadily for 59 seconds who closes the tab without clicking away loses that work.

**The behaviour is correct — the copy was wrong.** `AC-FR-18-03` explicitly accepts "at most 60 seconds of edits potentially lost", and the PRD's own FR-18 implementation notes describe blur + sweep accurately, including a **2026-07-13 correction that specifically disproved a "400ms-debounced auto-save as the user pauses typing" claim**. That correction fixed the implementation note and never checked the user-facing string specified in §7 of the same document. So this is PRD-versus-PRD, not code-versus-copy — and **the seventh recorded instance on this project of fixing an instance rather than the class.** The replacement string drops "as you type" entirely, so `GAP-42` and `GAP-43` close together.

Separately worth considering, not decided: a short debounce on typing would make a stronger claim honest and shrink the loss window. Recorded so the option isn't lost; the copy fix stands on its own.

### GAP-44 — nothing ever confirms a save succeeded, and fixing that collides with an existing criterion

The only save-related feedback in the entire component is the failure path: `saveError` renders "**Not saved.**" (added 2026-07-29, Opus audit M8, `AC-FR-18-04`). There is no "Saved" tick, no "Saving…" state, no positive signal of any kind. That makes `GAP-42`'s reassurance an assertion the screen never demonstrates — it tells the user their work is safe and then never shows it once. For a first-time user about to close a tab, a visible confirmation does more than any sentence of copy. WJ approved adding one.

**⚠️ It cannot be built yet.** `AC-FR-18-02` requires that during a background auto-save "no visible save indicator is shown to the user", and PRD FR-18's implementation notes repeat it. `AC-FR-18-04`'s 2026-07-29 amendment carved **failures** out of that silence rule and deliberately left success untouched.

**Two resolutions, written into `acceptance-criteria.md` as draft `AC-FR-18-05` for WJ to choose between:**

1. **Scope the indicator to blur and explicit saves, leaving the 60-second sweep silent.** `AC-FR-18-02` is written specifically about background saves, so on this reading nothing needs amending. **Recommended** — it delivers the reassurance while preserving the reason that criterion exists, which is that an indicator firing every 60 seconds regardless of user action is noise rather than information.
2. **Amend `AC-FR-18-02` to permit a success indicator on all saves.** Simpler, but reverses a deliberate decision and reintroduces the periodic-noise problem.

`AC-FR-18-05` is explicitly marked a draft, not a criterion, until that is closed. A build against option 1 satisfies every existing criterion; a build against option 2 requires the amendment first.

**Documents updated:** `PRD-Grant-Pathway.md` → **v0.66** (§7 Step 4 sub-heading respecified, flagged as agreed-not-built, with the live string recorded alongside it), `acceptance-criteria.md` (draft `AC-FR-18-05`), `ADR-TRACEABILITY.md` → **v2.23**.

---

## 2026-08-06 — GAP-41: the Word export destroys every line break, and rich-text editing deferred

**Found by WJ, same real application as `GAP-39`/`GAP-40`. No code changed — logging only, on WJ's instruction.**

His wife took the trouble to lay out her §4b answer (Q6, 215 words) properly: blank lines between paragraphs, a hyphen-bulleted list of the facilities York House charges for, a "Funding to Date" block, and a worked calculation. The `.docx` she downloaded rendered all of it as one continuous run of prose.

**The formatting is not lost anywhere else in the pipeline, which is what makes this cheap to fix.** The `<Textarea>` stores `\n` intact, the Step 5 preview renders it correctly via `whitespace-pre-wrap` (`application-step5-approve.tsx`), and the `format=txt` export is unaffected because it builds its output by joining an array of lines. The defect is confined to the Word generator: `app/api/export/[applicationId]/route.ts` puts the entire answer body into a **single** `TextRun` — once in the `assembled_draft` branch, once in the per-answer fallback — and the `docx` library ignores `\n` inside a run. That is a documented footgun of the library, not a subtle interaction.

**Agreed fix (not built):** split on `\n` and emit one `TextRun` per line with `break: 1` on all but the first. That reproduces the textarea exactly — soft line breaks inside one paragraph — so the existing spacing model is untouched. Roughly a ten-line helper applied in two places, no schema change, no new dependency. It covers the budget narrative field too, which is an ordinary `Textarea`; the two governance `£` inputs are single numbers and unaffected. **One thing to check in the same pass:** whether "Help me improve this" preserves line structure on the round-trip. The refine prompt takes and returns plain text with no instruction to keep layout, so a flattening round-trip would make the export fix feel unreliable even once it is correct.

**A test passed straight over this, and that is worth recording as its own finding.** `regression-test-plan.md` RT-09 ran against this exact code on 2026-07-28 and passed, verifying "no corrupted or missing content" — a bar that single-paragraph test answers clear while every line break in the document is being silently discarded. The defect was found by a user reading her own downloaded file, not by the plan whose job it was. RT-09 and RT-10 both gained an explicit multi-line fidelity step (v2.12) requiring an answer with blank lines and a bulleted list; RT-09's result is downgraded to **Pass (caveat)** and must be re-run once `GAP-41` is fixed. RT-10 gets the same check as a comparison case — its path was never affected, so a divergence between the two formats is the fastest signal of a regression in either.

### Rich-text formatting in answer fields — considered, deferred (FP-11)

WJ raised a second, larger question alongside the bug: should the fields offer real formatting controls (bold, italic, bullet and numbered lists) rather than leaving applicants to improvise with blank lines and hyphens?

**Deferred, on WJ's reasoning:** most charity workers transfer their answers into the funder's own web portal, which strips rich formatting on paste regardless of what the service produced. Rich text is therefore only genuinely valuable in the narrower case where a funder still requires a downloadable Word or PDF form — real, but not the common path and not a demonstrated demand. Fixing `GAP-41` already delivers line breaks, blank lines and hyphen bullets, all of which survive a portal paste, and those are precisely what the applicant reached for when she had no other tools.

Recorded as **`FP-11`** in `future-phases.md`, with the full implementation cost written down (editor component, storage format and migration, XSS sanitisation, markup-aware word/character counting against `PDR-AI-006`/`PDR-AI-012`, preview rendering, docx mapping to real bold runs and numbering, `.txt` degradation, refine prompts that preserve markup, and an `ADR-OPS-006` keyboard/screen-reader pass) so the cost is not re-derived next time it comes up. **No DR was raised** — nothing in any ADR, PDR or requirement document promises rich text, so no decision is being reversed; this records a considered "not now" and why. Trigger to revisit: evidence of repeated submission via downloadable Word/PDF forms rather than portals.

**Scope clarification worth keeping:** "all fields including budget" resolves to all _narrative_ fields. The budget narrative (§5a expenditure details) is an ordinary `Textarea` and is in scope for both the fix and any future editor; the two governance cards are single `£` numeric inputs and the yes/no governance items are dropdowns, where formatting has no meaning.

---

## 2026-08-06 — Two extraction defects found in a real, live grant application: GAP-39 and GAP-40

**Found by WJ. No code changed — logging only, on WJ's instruction, pending further review of the same application.**

This is the first defect report on this project drawn from a **genuine grant application submitted through the live service** rather than from a scripted test. WJ's wife completed a real Stony Stratford Town Council application for Stony Stratford Community Larder, using `docs/Grant Org Guidelines/Stony Stratford Grant-Application-Form-2026.docx` as the uploaded guidelines. Reconciling her 17 completed answers against the source form found two things wrong.

**What the app produced:** 17 cards on Step 4 = **2 governance facts** (§7 total expenditure and reserves, tagged "Budget", per `PDR-AI-008`) + **15 extracted questions**. The form contains 17 narrative asks. The mapping is recorded in full in `guideline-capability-matrix-test-plan.md` GCM-06.

**`GAP-39` (High) — two substantive questions were never extracted.** §4 has six lettered sub-questions; only a–d reached Step 4. Missing: **§4e "Please give an accurate figure for the number of people in the parish the project will serve"** and **§4f "For how long will the project run?"**. For a town council assessing a parish grant, beneficiary reach is close to the whole decision. Root cause is in `lib/prompts.ts`: the "questions" rule excludes data-entry fields and the TABLE FORMAT rule skips short numerical fields, and the **only** carve-out from either is the BUDGET/COST exception. Beneficiary counts and project durations are neither budget nor data-entry, so they fall straight through.

**The pattern matters more than the instance.** This is the **third** time a substantive question has been dropped for the sole reason that its answer is short — after MK Community Foundation and Idlewild, both on 2026-07-27 (`guideline-capability-matrix-test-plan.md` Defect Log #1). Each of the first two was closed by adding its own narrowly-scoped exception beside the others rather than by correcting the underlying rule, which is why a third case with a slightly different flavour of short answer was able to appear. When this is tasked, the fix should be to the rule — a short answer is not the same thing as a non-narrative question — not a third one-off exception.

**`GAP-40` (Medium) — two adjacent sub-questions merged into one card.** §10 MONITORING PROGRESS asks a) what you hope to have achieved six months after receiving a grant and b) twelve months after; both arrived as a single card (Q16), text concatenated. `lib/prompts.ts` already carries the governing rule verbatim — _"DO NOT MERGE ADJACENT QUESTIONS: even within a single form, each distinct question or ask must be extracted as its own separate item — never combine two related-but-distinct questions into one, even if they are adjacent, thematically similar, or commonly answered together"_ — and six-month versus twelve-month outcomes are precisely that case. **Nothing is lost to this applicant** (both asks are visible and one box answered both), which is why it is Medium and not High; a funder with per-question word limits, or two asks that diverge more sharply, would be materially misrepresented. Note the two defects need different remedies even though they live in the same file: `GAP-39` is a rule with an inadequate exception, `GAP-40` is an adequate rule the model did not follow.

**Checked and found correct, so recorded here to stop them being re-investigated:**

- **§1 "PURPOSE OF APPLICATION" is absent, and that is fine.** It is a numbered heading with no ask beneath it — only the skip note for recognised annual events. There was nothing to extract, and §2's wording ("a full description of your project, **or the purpose you require the grant for**") covers the same ground.
- **§7's reserves-justification prose is not missing.** "If your organisation holds a large amount of reserves, please state what these reserves are for" appears as the helper text on the Reserves governance card, which is the `PDR-AI-008` behaviour, not a drop.
- **Everything non-narrative was excluded correctly** — the front organisation-details table, §3's seven-principle tick-list, §5's expenditure/income table totals, §9's address and phone, §12's contact-person block, §13's supporting-documents checklist, and both signature blocks.
- **No "Finances of Your Group" catch-all card appeared.** `PDR-AI-010` Option C governs `free_form` **sections** mode; this document extracted in **questions** mode, so that decision is out of scope here rather than regressed. Worth confirming deliberately if this fixture is ever run through the paste path.

**Test coverage added the same day:** new **GCM-06** case in `guideline-capability-matrix-test-plan.md` (v1.5) — a docx **application form** rather than guidance about one, the only fixture in the corpus exercising lettered sub-question flattening and short-answer narrative asks. It is recorded as **Fail** and stays that way until both defects are fixed. `TEST-DASHBOARD.md` (v2.18) moves that plan 🟢 → 🔴, the first red on the dashboard since its 2026-07-16 reset.

**Practical consequence for the applicant, recorded because it is the actual cost of the bug:** §4e and §4f will be blank when the answers are transcribed onto the real form, and she has to write them herself with no prompt from the service. She only discovers this by reading the original form — which is exactly what the product exists to save her from.

---

## 2026-08-05 — Terms of Service v1.6: no-guarantee-of-funding statement given its own sub-heading

**Requested by WJ, ahead of solicitor review (S2b).** Section 5 (AI-Generated Content) previously carried _"We make no representation that using Grant Pathway will result in a successful grant application. Funding decisions rest entirely with the relevant funder"_ as a single sentence sitting between two unrelated paragraphs — user responsibility for submitted content, and how AI processing works. Nothing was wrong with the wording; it was just easy to skim past mid-paragraph, and a solicitor is about to read this document closely.

**Added a `### No Guarantee of Funding Success` sub-heading directly above the sentence, unchanged.** The AI-provider/data-processing paragraph (Anthropic Claude via AWS Bedrock, eu-west-2) was moved earlier in the section, ahead of the new sub-heading — it is not about funding outcomes, and leaving it where it was would have put it visually underneath a heading about a different topic. No wording changed anywhere; this is a structural clarity edit, not a substantive one.

**Worth naming, since it came up when deciding where to put it:** the statement isn't really AI-specific at all — a charity that writes every answer itself and never touches the AI features still gets no guarantee of success. It stays in Section 5 for this edit (cheapest change, matches what the solicitor will be expecting after seeing the pre-review version), but Section 4 ("Using the Service") would be the more precisely correct home if this document is restructured again.

Applied to both `terms-of-service.md` (internal, new changelog blockquote for v1.6) and `terms-of-service-external.md` (the file `/terms` actually renders) — verified live against the running dev server, heading renders directly above the guarantee paragraph as intended. **PDF/docx regenerated:** `Grant-Pathway-Terms-of-Service-v1.6.{pdf,docx}` via the established pandoc → docx → Word COM → PDF pipeline, 7 pages, sub-heading confirmed in both the table of contents and the body text. The superseded v1.5 files were deleted rather than archived, matching how the v1.4→v1.5 regeneration was handled the same way on 2026-08-05 — `docs/legal/archive/` holds only the much older v1.0 exports.

**Privacy Policy is untouched** — this request was scoped to the Terms of Service only, and the privacy policy has no equivalent statement to relocate.

---

## 2026-08-05 — GAP-31 built: the inactivity warning was sending thirty emails, not two

**`P5.3b` item 2.** Two related reliability defects in the S8.3 inactivity crons, both raised on 2026-06-08 by the Knox "Idempotency" and "Graceful Degradation" reviews and both open since. Sequenced here because the fix needs a migration, and P5.4 pushes migrations to production — leaving it later means doing that push twice.

### What the audit said, and what was actually happening

`ADR-TRACEABILITY.md`'s GAP-31 row described the first defect as: _"if Vercel fires the cron twice users receive the warning email twice."_ Reading `app/api/cron/inactivity-warning/route.ts` against its own schedule shows that framing understates it by an order of magnitude, and no double-fire is required.

The route's eligibility test is a **range**, not a threshold: `lastSignIn >= now-24months && lastSignIn < now-23months`. A user who crosses into it stays inside it for **a whole month**. The cron runs **daily** (`"0 8 * * *"`). With nothing recording what had already been sent, the eligible set was recomputed from scratch every morning, so a charity in that window was emailed _"Your Grant Pathway account will be deleted in 30 days"_ on roughly **thirty consecutive mornings** — and the "in 30 days" was only true on the first of them, since the deletion date shown is computed from the user's last sign-in and drew steadily closer while the subject line did not change.

**This was never ambiguous in the spec.** `docs/PRD inputs/email-notifications.md` states under Email 3: _"Only one inactivity warning email is sent per inactivity cycle."_ `PDR-DH-002` says _"Send a warning email"_, singular. The code did not do what either said. Recording this because the generalisable lesson is not about idempotency in the abstract: **a scheduled job whose eligibility test is a range rather than a threshold will re-match the same row on every run, and must record what it has already done.** The sibling deletion cron needs no such guard precisely because its test _is_ a threshold and deleting a deleted user is a no-op — which is why the audit correctly cleared it and why the difference is worth naming.

### The guard

New nullable `user_profiles.last_inactivity_warned_at` (migration `20260805000000_gap31_inactivity_warning_dedup.sql`). The cron sends only when it is null or **earlier than the user's `auth.users.last_sign_in_at`**, and stamps it after a successful send.

Comparing against `last_sign_in_at` rather than clearing the column on login is what makes it self-healing: a user who signs in after being warned moves `last_sign_in_at` past the stamp, so if they go quiet for another 23 months they are warned again — no reset step, and **nothing added to the sign-in path**, which matters because the sign-in path was the subject of a live anti-enumeration fix as recently as yesterday and is not somewhere to add incidental writes.

**The stamp is written after the send, not before, and that ordering is deliberate.** Stamping first would give at-most-once delivery: a failed send would leave a user marked as warned and never retried, and they would be deleted 30 days later having been told nothing. Stamping after gives at-least-once: the worst case is one repeat warning. A duplicate email is recoverable; a silent deletion is not. Send failures and stamp failures both now reach Sentry, so a stuck row is visible rather than inferred.

### The second defect: deletion could delete in complete silence

The register's second item was that Email 4's failure is _"caught silently"_. It is worse than a swallowed exception: **`lib/emails/send.ts` returns normally, without throwing, when `RESEND_API_KEY` is unset.** So in exactly the configuration where _every_ send fails, the route's `try/catch` never fired at all — no exception, no log beyond one line from the email helper, and every account the cron touched deleted with no notification and nothing raised. The audit's stated worst case (both warning and deletion emails fail → a user deleted with zero communication) was not a remote coincidence; it was one unset environment variable.

Fixed the way `/api/account/delete` already did it: **a preflight that aborts with 503 before deleting anything** if the key is missing. Deletion is irreversible, so being unable to tell someone is a reason to stop, not something to discover afterwards. Per-user failures now also reach Sentry — send failure, auth-delete failure, and the case of a deleted account with no email address on file, each tagged by `route` and `step` (`ADR-OPS-005`).

**One divergence found and closed in passing:** `app/api/account/delete/route.ts`'s header comment has read _"The email failure is logged to Sentry"_ since the route was written, and it was not — only `console.error` existed. The comment is now true rather than being quietly deleted.

### Supporting changes

- **`lib/inactivity.ts`** (new) holds the date arithmetic and both eligibility tests. `subMonths` had been copy-pasted verbatim into both routes; more to the point, the two crons run an hour apart against the same user list and **no user may ever be claimed by both**, which is a property of the pair, not of either file. A test asserts it across 800 days of possible sign-in dates. `lib/inactivity.ts` also documents two `Date` quirks left in place deliberately: short months roll forward rather than clamp (31 March − 1 month = 3 March), and `setMonth` works in local time so a DST-observing host shifts the resulting instant by an hour. Both move a retention boundary by at most a few days out of 23 months, and both crons inherit the same skew.
- **`__tests__/inactivity.test.ts`** — 18 new tests, suite 127 → 145. Includes the boundary pair (exactly 23 months is not yet eligible; exactly 24 months is warned, not deleted), a simulation confirming the old window matched on 25+ consecutive daily runs, and a simulation confirming the guard reduces that to exactly one send.
- **The migration states the `service_role` grant explicitly.** Migration `20260723000000`'s comment records that the four original tables carry `service_role` privileges "granted ad hoc, outside any tracked migration" — that omission on the newer tables broke account deletion live on 2026-07-23. The cron writes this column with the service-role client, so relying on untracked history to survive **P5.4's fresh production push** would repeat that failure on purpose.

**One test assertion had to be corrected before it passed, and the correction is the finding.** The short-month case initially asserted a fixed ISO string and failed by exactly one hour — `setMonth` is local-time, and the machine is on BST. Re-asserted on local calendar components so the suite is timezone-independent, and the behaviour is now documented rather than accidental.

### Not applied, and why

The migration is **not yet applied to `grant-pathway-dev`**. `supabase link --project-ref` needs an interactive database-password prompt, so it cannot be issued from a session — the same constraint recorded on 2026-06-29 when WJ ran the production migration repair from a real terminal himself. The command is in `IMPLEMENTATION-STATUS.md`'s notes. Until it runs, the warning cron's profile lookup will fail against dev and return 500 with a Sentry event, which is the loud failure it was designed to have.

---

## 2026-08-05 — GAP-25 built: Zod on every Server Action, and an ownership gap found in the process

**`P5.3b` item 1, the first of the six spec deviations and the one ordered first because it is a security gap rather than polish.** `ADR-ARCH-003` states "Zod is used for input validation on all Server Actions and API Routes". Only `actions/charity.ts` did. `applications.ts` and `auth.ts` reached Supabase with unvalidated input, and had done since they were written.

**Now validated: all 15 input-taking actions in `applications.ts` and all 7 in `auth.ts`.** `createApplication` and `signOut` take no arguments, so 22 of 24 exported actions carry a schema and the other two have nothing to check. Shared schemas live in a new **`lib/validation.ts`**, with **26 new unit tests** in `__tests__/validation.test.ts` (suite 101 → 127).

**The password policy now has one definition instead of four.** It was written out independently in `register-form.tsx`, `reset-password-form.tsx` and `account-settings-form.tsx` — three identical copies of `length < 12 || !/[a-zA-Z]/ || !/[0-9]/` — plus prose in `NFR-04`. The PRD's own 0.3 and 0.4 revisions record a live front-end/back-end password inconsistency being found and fixed once already, so this is a fourth-instance-waiting-to-happen. `lib/validation.ts` is now the single source; a test asserts both the length and the exact user-facing message, so a future divergence fails CI rather than reaching a user. **The three client components still hold their own copies** — deliberately not refactored here, because mixing a security fix with a UI refactor makes both harder to review, and those copies are currently _correct_. That is a follow-up, not a defect.

### The ownership gap, which Zod alone would not have closed

**Found because `AGENTS.md` §1's mandatory documentation check was actually run.** Next.js's Server Actions guide states plainly that schema validation "only checks the _shape_ of the input. A well-formed `Item` object can still refer to a row the caller does not own." That prompted checking entitlement as well as shape across all 24 actions — and 22 of them were already sound, constraining every query with `.eq('id', …).eq('user_id', user.id)` so a foreign id simply matches nothing.

**Two were not.** `saveManualAnswer` and `addManualGovernanceItems` write `application_items` rows using an `application_id` supplied by the caller, and because they **insert** rather than update, there is no `user_id` filter to make a foreign id miss. `application_items` RLS keys entirely on `user_id` (`20260714000000_p6_2_application_item_graph.sql`), so a row carrying the caller's own `user_id` satisfies the INSERT policy **regardless of which application it points at**.

**The exposure is integrity and availability, not disclosure**, and it is worth being precise rather than alarming: a crafted call could not read or overwrite another charity's answer, because the SELECT and UPDATE policies both filter on `user_id`, leaving the victim's rows invisible and untouchable. But `unique (application_id, item_order)` is a **table constraint, enforced independently of RLS** — so a caller could occupy `(victim_application_id, item_order)` and make the victim's own upsert at that position fail against a row they can neither see nor delete. A new `assertOwnsApplication` helper closes it in both actions. **Verification belongs to `GAP-17`**, P5.2's cross-user RLS test, which now has a specific case to exercise rather than a general intention.

### Two judgement calls worth recording, because both could have made things worse

**Sign-in validates presence only — not the password policy, and not email format.** Applying the 12-character rule there would lock out any account created before the 2026-06-29 hardening (VQ-009); applying strict RFC email validation would lock out any address whose format this regex and the one that accepted it at registration disagree about. Neither buys anything: the values go straight to GoTrue, which validates them itself. On a login path, a false rejection is worse than a permissive check.

**`requestPasswordReset` returns `{ status: 'sent' }` even for a malformed address.** `AC-FR-05-02` requires that action to return the same result unconditionally so it cannot be used to probe which addresses are registered. Returning a validation error for malformed input would have introduced an observable behavioural difference — a smaller leak than confirming registration, but the same kind. Similarly, `signIn` returns its existing generic `credentials` error rather than a distinct "invalid input" state, per `AC-FR-04-03`.

**No new error states anywhere.** Every schema failure maps onto a member of the action's existing result union, so no client component changed and no user can reach an unhandled state.

### One bug caught by auditing rather than assuming

After wiring everything, a check that validated values were actually _used_ — not merely validated — found `saveApplicationStep1` parsing its input and then writing the **raw** `funderName` and `grantName` to the database. Validating and then using the unvalidated value is the standard way schema validation gets bypassed by accident. It also mattered beyond tidiness: `getPreviousApplicationForFunder` matches a previous application on a **trimmed**, case-insensitive `funder_name`, so saving `" Henry Smith Charity "` would have silently stopped P6.5's reuse prompt ever offering that application again. Now uses the parsed values throughout.

**Verified:** type-check, lint, **127 tests**, and `prettier --check` all clean. **Sign-in re-checked live against the running dev server** — valid input still passes the new schema, reaches Supabase, and returns the correct generic anti-enumeration message, with no console errors. The malformed-input server path is covered by unit tests rather than end-to-end, because client-side validation blocks it before it can be reached through the UI — which is precisely why the server-side check needed to exist.

`ADR-ARCH-003`'s consequence is now discharged; `ADR-TRACEABILITY.md` → v2.19, with `GAP-25` moved from 📋 tasked to ✅ built.

---

## 2026-08-05 — Legal effective dates set, closing audit finding S2a

**Both live legal documents now carry a real effective date: 5 August 2026.** They had read `Effective date: [TO BE CONFIRMED]` since first publication — the Privacy Policy since 2 July 2026, the Terms since 10 July — which the Opus audit raised as **S2** and rated **Severe**, on the grounds that a published privacy policy with no effective date is not a defensible position for a registered data controller (ICO ZC168720), and that it blocked asking external testers to rely on either document. S2 split into **S2a** (set the dates, needs no solicitor) and **S2b** (the independent review). **S2a is now closed. S2b remains open and is the only thing still holding `P5.1`.**

**Eight replacements across four files**, each document carrying the date twice — once in the header block and once in the footer. The four are the two internal copies (`privacy-policy.md`, `terms-of-service.md`) and the two `-external.md` mirrors, and the mirrors matter most: `app/(public)/privacy/page.tsx` and `app/(public)/terms/page.tsx` read **the external copies**, not the internal ones, so setting the date in the internal files alone would have changed nothing a user sees. Versions bumped: privacy policy → **v1.6**, terms → **v1.5**.

**Why today's date rather than a launch date, which is what the placeholder was waiting for.** Go-live is unscheduled — the working estimate is August–September 2026 and no date is committed. But the service is already deployed and in use by external testers at a hosted URL, and both documents are already served at `/privacy` and `/terms`. A future effective date would therefore have asserted that **no policy and no terms were in force while people were actually using the service** — worse than the placeholder it replaced. Dating each document from the day its current wording takes effect is accurate, and it is what the placeholder should always have been resolved to. Go-live does not change it; a future material revision would produce a new version and a new effective date, which is the normal mechanism.

**One consequence to note, not yet actioned: the generated PDFs and Word files in `docs/legal/pdf/` are now stale.** They are `Grant-Pathway-Privacy-Policy-v1.5.pdf`/`.docx` and `Grant-Pathway-Terms-of-Service-v1.4.pdf`/`.docx`, all four still showing `[TO BE CONFIRMED]` and all four now a version behind. They exist to be sent to a legal reviewer, so they must be regenerated before S2b's outreach — otherwise the reviewer is sent the exact defect that was just fixed. Regeneration is pandoc → `.docx` → Word COM → PDF (LaTeX stalls on this machine); deliberately left until the reviewer is engaged, so it happens once against final text rather than twice.

Also corrected in the same pass: `legal-review-options-2026-07-29.md`'s "Why this exists" paragraph, which stated in the present tense that both pages "currently publish" the placeholder. `P5.1`'s two document rows and its intro, and `P5.6`'s effective-date check — now a verification that the deployed pages render the date, rather than an action to set it.

---

## 2026-08-05 — `P5.0` requirements reconciliation: 23 divergences, and a resolution that was written down and never propagated

`P5.0` is the blocking Phase 5 task added on 2026-07-30 for the doc-vs-build comparison that no Phase 5 task performed. Register: **`docs/Implementation Plan/pre-launch-reconciliation-2026-08-05.md`**. **23 divergences, none left undispositioned** — 15 fixed or amended the same day, **5 held for WJ's decision**, 3 accepted and recorded.

**Documents changed:** `non-functional-requirements.md` → **v1.2** (and gained its first-ever revision history), `PRD-Grant-Pathway.md` → **v0.65**, `BRD-Grant-Pathway.md` → **v0.55**, `technical-design.md` → **v1.25**.

**The completion flags now exist, which was the point of the task.** Both the PRD and the BRD had been reviewed section-by-section against live code — the PRD across versions 0.27–0.60, the BRD across 0.8–0.49 — and **neither said so.** The PRD's only words about its own review status were two `(in progress)` phrases in its 0.27 and 0.28 rows, accurate on 2026-07-13 and 36 versions stale thereafter; that is precisely how Phase 5 work came to be believed outstanding when it was already done. Both documents now carry a **Review Status — ✅ COMPLETE** block naming what was covered, over which versions, and what has happened since. The historical rows were left as written: they are accurate as history, and rewriting them would destroy the audit trail while fixing nothing.

**The most consequential finding is a viewport conflict that will break the next scheduled build.** `NFR-05` and PRD §12.5 promise a **320px** minimum width and usability on Chrome Android and Safari iOS. `ADR-ARCH-005` sets the minimum at **1024px**, and `GAP-05` — a `P5.3` task, next in line after the accessibility run — will add a banner below 768px that **blocks** the UI rather than warning. Both cannot be true, and `P5.5`'s cross-browser step asks a tester to confirm mobile usability that the banner would make impossible. **The sweep then found the conflict had already been identified and formally resolved — in the retired plan.** `docs/Old/Imp Plan/IMPLEMENTATION-STATUS.md` records it as OI-07: _"BRD Section 10.5 (320px) overridden by ADR-ARCH-005 (1024px desktop-first). ADR takes precedence… No action required."_ The live document set never received it. **That makes this the sixth recorded instance of fixing the instance rather than the class, and the worst of them, because the class fix already existed in writing.** A resolution that does not propagate is indistinguishable from no resolution at all. A second, related question came out of the same ADR: it sets a 1024px minimum but places the banner at 768px, leaving the **768–1023px band** — iPad portrait, small laptops — below the stated minimum, with no banner and no supported layout. Both are held for WJ because they change what `GAP-05` builds; `NFR-05` carries a visible conflict block in the meantime rather than a silent correction.

**A third meaning for ✅ was found, after "tasked" and "built": "present but inert."** `NFR-06` requires automated accessibility scanning on every new screen, and `ADR-TRACEABILITY.md` marks `GAP-14` ✅ "installed; wired into `app/layout.tsx`" — both true, and the control does nothing. `components/axe-provider.tsx` swallows a known `@axe-core/react` v4 / React 19 incompatibility in a **silent** `catch`, confirmed 2026-08-04 when a route with two real AA violations produced an empty console. So automated scanning has not run on any screen built since the React 19 move. `NFR-06` now says so. This is also the premise behind `GAP-15`, the accepted deviation that waived Lighthouse CI partly on the strength of in-development scanning catching regressions — that half of the justification has not held for months.

**Three NFRs were understating the service rather than overstating it**, which is the same shape as the Terms understating the AI cap by 60%: `NFR-04`'s password row omitted the leaked-password check, secure password change and current-password requirement; its session-timeout row omitted the 55-minute warning dialog and `D-013`; and `NFR-01` had no target at all for the **charity-objects paraphrase**, the third user-facing AI operation, despite its 60-second budget. `NFR-03` was measuring the wrong thing — it documented burst concurrency and never mentioned the per-user 50-requests-per-month cap or the $127/month Bedrock ceiling, when at ~100 users the binding constraint is **spend, not concurrency**.

**The £100 budget means three different things and is already exceeded.** `C1` says "maximum monthly infrastructure **and API** running cost… £100"; the PRD variously calls it total API spend, AI API spend, and monthly running cost. Against C1's reading, `P5.4` commits Vercel Pro (~~£16) **plus** Supabase Pro (~~£20) **plus** a Bedrock ceiling of ≈£100 — c. £136 before Upstash, Sentry, Resend or Axiom. `A3` and `A13` rest on the same figure. Held for WJ: either C1 is not a total, or the budget needs revising.

**Two smaller sweeps.** The contextual-tooltip count is **10 in code and 9 in the test and audit trail** — and `help-and-tooltips-test-plan.md` is internally inconsistent, its table listing ten rows while its HT-02 Pass note says "all 9 confirmed", so either one tooltip was never exercised or the note miscounts the table above it. Separately, `PDR-UI-008` names three tooltip ids (`tt-approve-required`, `tt-help-improve`, `tt-prior-export-signoff`) that exist nowhere in the codebase — the same failure class as `GAP-21`'s ADR naming a deleted route, since a PDR is what a session reads during the mandatory `AGENTS.md` §2 check. Both held for WJ rather than resolved by assumption.

**Items 2 and 4 came back clean**, which validates the 2026-07-30 decision to narrow this task rather than run six full passes. The item graph, `application_guidelines`, citations and `first_exported_at` are all correctly recorded in `data-model.md`, `technical-design.md` and `acceptance-criteria.md`; `user_tooltip_dismissals` is correctly logged as created and dropped; `last_inactivity_warned_at` is correctly absent everywhere, matching `GAP-31` being unbuilt. Two exceptions found in passing and recorded rather than dropped: `lib/site-url.ts` and `lib/action-error.ts` (both built 2026-07-29 under audit findings **M5** and **M8**, both architecture-level, neither in `technical-design.md` despite landing the day it was last updated), and `technical-design.md` being stamped v1.24 with **no v1.24 row** in its history.

**Seven of the 23 findings are a document failing to say where it stands**, and three are a correction made once and never swept. The documents are not sloppy — nothing was checking. That is the argument for `P5.0`, and it is why the fixes here favour removing duplication over correcting instances: the PRD's footer version line, which disagreed with two other statements in the same file, had already been corrected twice before (in the 0.7 and 0.23 reviews) and drifted again both times. It is now deleted rather than corrected a third time.

### Decisions taken the same day (WJ), and one register row withdrawn

**Viewport — block below 768px; 768–1023px functional but not optimised; mobile not supported in v1.** `ADR-ARCH-005` gained a 2026-08-05 amendment stating all three bands, which also resolves its own long-standing contradiction (a 1024px minimum with the banner at 768px and nothing said about the gap). `GAP-05` is unblocked and its bullet now specifies that the banner must **not** appear in the 768–1023px band. The reasoning: that band is iPad portrait and older small laptops, both common in small charities, so blocking them to satisfy a design target costs more than a cramped layout does — while phones are blocked because Step 4's two-column answer-and-guidelines layout genuinely cannot work at that width. **Eight live documents corrected**, not the five first identified: `NFR-05`, PRD §12.5, `C16`, `IMPLEMENTATION-PLAN.md`'s Phase 1 design line, `P5.5`'s cross-browser step, and then three the sweep turned up afterwards — `PDR-UI-003`'s Context premise, `v1-out-of-scope.md`, and **D24**.

**D24 is the finding that matters, and it sharpens the original one.** This plan's own discrepancy table already carried a row titled "Responsive strategy conflict" — and resolved it **in favour of the 320px claim**: _"desktop-first design per ADR-ARCH-005; must be usable on mobile browsers per C16 and NFR-05 (minimum 320px)"_, overriding the ADR it cites. The retired plan's OI-07 resolved the identical conflict the **opposite** way. So the first framing here — that the class fix existed in writing and never propagated — was only half right. **It was noticed twice and settled inconsistently, and the live record was the wrong one.** A conflict resolved in two directions is worse than one never resolved, because each record makes the other look redundant.

**Tooltips — ten, not nine; the count was wrong and the testing was not.** WJ confirmed HT-02 exercised everything in its table, which listed all ten throughout, and `git log` puts the tenth tooltip in the original `PDR-UI-008` build commit, so it existed when HT-02 ran on 2026-07-25. Corrected across five documents. **Root cause found:** PRD §7 read "these **9** tooltips, plus one hover-disabled variant" — arithmetically ten, but the "9 + 1" split was read as a total and propagated as "nine tooltips" into `GAP-38`'s register row, `accessibility-test-plan.md`, `TEST-DASHBOARD.md`, `help-and-tooltips-test-plan.md`'s own result notes and `P5.3`'s bullet. That wording is now stated as ten with the variant explained.

**R-09 withdrawn — it was an error in the register, not a defect in `PDR-UI-008`.** The three tooltip ids flagged as unbuilt (`tt-approve-required`, `tt-help-improve`, `tt-prior-export-signoff`) appear in that PDR only inside its **findings against the earlier input spec** and the rationale for them — a record of what that spec got wrong, correctly preserved. The PDR's own inventory was right throughout: **11 specified, 10 built**, `tt-register-password` deliberately excluded as a permanent visible hint. Confirmed with `git log -S` on all three ids across `components/`, `app/` and `lib/`: zero commits, ever. Recorded rather than quietly deleted, because a register that only ever accumulates findings is not being checked either.

**Budget — `C1` becomes £150/month and stays a _total_.** £150 covers the ~£136 already committed (Vercel Pro ~£16 + Supabase Pro ~£20 + the ≈£100 Bedrock ceiling) with ~~£14 unallocated for the first usage-based service to leave its free tier — Axiom and Upstash being the likeliest. **The AWS Budget itself is unchanged at $127**; what changed is that ≈£100 is no longer the entire budget, so `PDR-AI-005`'s "matching the C1 budget" parenthetical was corrected in the same pass. Applied across **13 statements in 8 documents**: `C1`, `A3`, `A13`, `OBJ-05`, `success-metrics.md`, `PDR-AI-005` ×2, `ADR-OPS-001` ×2 (including a recomputed headroom figure, previously "~~£64/month remaining"), `ADR-STACK-004`, `technical-design.md`'s cost table, and — the two that were the actual divergence — **PRD §10's "total API spend" and §14's "AI API spend"**, both restated as total running cost.

**`P5.0` is complete.** All 23 divergences dispositioned and applied; `P5.5` is no longer blocked by it.

---

## 2026-08-04 — Pre-AC-01 environment verification: the axe harness does not report, and the tester brief had no URL

WJ asked two questions before running AC-01 and before handing the build to an external tester: is the development service intact, and is it usable end to end by someone outside the project. Both were checked live rather than inferred. The service is healthy; two things were not.

**The environment is intact.** Local `npm run dev` boots on Next 16.2.12 (Turbopack) in 2.7s with all eight Sensitive secrets present in `.env.local`, `/api/health` returns `{"status":"ok"}`, every public and authenticated route returns 200, and the auth round-trip reaches Supabase — a deliberately invalid credential returned the correct anti-enumeration message, confirming GoTrue is live rather than merely that a page rendered. The same holds on the deployed build.

**Finding 1 — `@axe-core/react` is silently not reporting, which makes AC-01 unfalsifiable as written.** The dev console printed no axe output at all on `/`. Running axe-core directly against that same page found **two serious violations**: `color-contrast` on the version string (`text-[11px]` `#94A3B8` on `#FDF9F5` — **2.44:1** against a 4.5:1 requirement, SC 1.4.3) and `target-size` on the "Show password" button (**16×16px** against 24×24, and failing the spacing exception too, SC 2.5.8). axe-core 4.12.1 does load — `window.axe` is present and initialised — so the library is fine; what fails is the React integration. `components/axe-provider.tsx` wraps `await axe(React, ReactDOM, 1000)` in a **silent** `catch` for a known React 19 read-only-module-exports incompatibility, so a clean console is indistinguishable from axe never having run.

This is the more important half of the finding. **AC-01's pass condition — "check the dev console for violations, expect zero" — would have returned a false Pass on a route with two real AA failures.** It also retroactively explains the result AC-01's own scope note already refused to carry forward: HT-05's "zero violations across eight routes" on 2026-07-25, recorded verbally with no screenshots, is exactly what a non-functioning axe produces. The plan was right to re-run it, for a better reason than it knew. **Not fixed here** — it needs a decision between the minimal repair (make the failure loud, and drive each route with an explicit `axe.run()` instead of relying on React-render hooks) and the durable one (`@axe-core/playwright` or the axe CLI, which also removes AC-01's "interact enough to render conditional UI" fragility and its dependence on hand-walking twenty routes). AC-01 should not be run until one of the two is in place, or it measures nothing.

**Finding 2 — the external-tester brief named no URL, and both obvious guesses are wrong.** `external-tester-brief.md` described the test period, the AI usage limit and the eligibility hard stop well, but never stated where to go. That matters more than it sounds, because both plausible guesses fail: **`grantpathway.org.uk` is still a GoDaddy parking lander** (a 114-byte page redirecting to `/lander` — confirmed live today, so the two A records noted as outstanding on 2026-07-02 are still outstanding and still need registrar access), and **`grant-pathway.vercel.app` belongs to an unrelated product** — "Grant Pathway — Find Grants for Your Canadian Business". A tester who searched for the name, or guessed the subdomain from the project name, would land on a stranger's site. The working deployment is **`grant-pathway-three.vercel.app`**, verified serving this app with `/api/health` green and no deployment-protection wall. Added to the brief as a new "Where to find it" section, including the note about the name collision, since a tester is more likely to search than to guess.

**Open question raised and closed the same day: Vercel production points at `grant-pathway-dev`** (confirmed by WJ). It could not be read from the repo — auth is entirely server-side, so no client bundle exposes the project — and it mattered because if production had pointed at `grant-pathway-prod` the external tester could not have registered at all (prod's Resend SMTP was never configured, noted on 2026-07-02 as "should be checked before it does" have a live consumer) and nothing past Step 1 would have had a schema, every Phase 6 migration having been deliberately scoped to dev only pending P5.4. Recorded rather than dropped because the same question will recur at P5.4, when the answer is supposed to change.

**AC-01 was then rewritten from three lines into an executable procedure** (`accessibility-test-plan.md` → v1.1), at WJ's request, because knowing the harness is broken is not the same as knowing what to do instead. The case now opens with a **Step 0 availability gate** (`window.axe && window.axe.version` — `undefined` means the import itself failed, which is Blocked and a bigger finding than any violation), then drives axe explicitly via a **saved DevTools snippet** rather than watching the console. Saved snippets were chosen over a pasted one-liner deliberately: they survive navigation and full reloads, so the same keystroke works on all 24 routes.

The substantive addition is a **route table naming the conditional UI to render before each run**. axe only sees the DOM as it stands at the moment it runs, so a passively-visited route reports clean on UI that never appeared — which is the second way this case can produce a false Pass, independent of the harness. Step 4 alone needs **seven separate runs** because its states do not coexist, including the M8 "Not saved" banner (force it with DevTools → Offline; it postdates HT-05 and has never been swept by anything). Also specified: how to force the session-timeout modal without waiting out its real 55-minute threshold (`WARNING_MS` in `session-timeout-provider.tsx`, and don't touch the mouse — `mousemove` resets the timer), a `⚠️ do not confirm` on `/account/delete`, and `app/global-error.tsx` added to the route table, which the v1.0 table missed.

**The two known violations are written in as a reproduction check, not as examples.** A run of the sign-in page that does not surface both means the tooling is broken, not that the page is clean — the same inversion that made the original case unfalsifiable, caught one layer up. And the guidance is explicit that `incomplete` results are not passes, and that `target-size`/`color-contrast` hits overlap AC-11/AC-10 and should be logged once with a cross-reference rather than double-counted.

**Then rewritten a second time the same day, for a reader with no developer-tools experience (→ v1.2), and this is the more important of the two revisions.** WJ read v1.1 and asked what it actually meant — fairly. It was precise and unusable: "DevTools", "snippet", "the DOM", "conditional UI", "violation nodes", "blur the field", all unexplained. **It repeated, three cases later, the exact mistake this plan's NVDA section exists to prevent** — that operating the tool, not the testing, is what blocks these passes. Writing a careful procedure in the vocabulary of someone who already knows the tool produces a document only its author can run.

v1.2 opens Chrome, presses `F12`, names the tabs, and says in one sentence what axe is for before asking for anything. Three details earn their place. It warns about **Chrome's refusal to accept the first console paste** until you type `allow pasting` — an unexplained dead end that would stop a first-timer cold — and sidesteps it by making the one typed command four words long. The saved snippet now **copies its own result to the clipboard**, so recording a page is a paste rather than a transcription. And a **full worked example on the sign-in page comes before the route list**, with the exact expected output printed, so the tooling is proven against a known answer before twenty-three unknown ones — with `0 problem(s)` there labelled explicitly as a **setup failure, not a clean page**. The snippet was run against the live dev server before publishing and its output matches the documented example exactly. Also added: a time estimate, permission to stop and resume, and permission to record **Blocked** on the two error-screen rows, since forcing those is developer work and a guess is worse than an admitted gap.

**A correction worth recording, because it is the same failure mode this project keeps catching in itself.** The first version of this review flagged the GitBook user guide's "four stages of preparing an application" as contradicting the app's five numbered steps — citing the 2026-07-31 process-diagram fix, where that exact contradiction was a real defect. WJ corrected it: stages and steps are distinct items. They are, and the flag was wrong. The guide's "four stages" is its own **chapter structure** — Getting started / Applications / Writing answers / Finishing up — which deliberately does not map 1:1 to the steps (Getting started covers account and profile, both _before_ Step 1; Applications covers Steps 1–3; Writing answers is Step 4; Finishing up is Step 5). "Stage" is also a live term elsewhere in the project on its own terms: the Step 3 and Step 4 loading-message stages in `design-requirements.md` §5.10, and funder-side Stage 1 → Stage 2 processes. The lesson is the mirror image of the Lighthouse CI correction recorded in `accessibility-test-plan.md`: there, a real precedent was missed by not checking the register; here, a real precedent was **over-applied** to a structure that had not been checked. The guide was spot-checked in the same pass and is current — "Choosing your funder and grant" correctly says to _type_ the funder name and that "there's no fixed list", matching the funder-picker removal.

**Not verified, and out of scope for a pre-flight check:** the guide's remaining pages against current behaviour page by page, and anything requiring a real registration (which would send mail and create an account).

---

## 2026-08-03 (third pass) — `accessibility-test-plan.md` created: the seventh test layer, and the first plan that tests the product flow for accessibility at all

Agreed 2026-07-30 as P5.3's output artefact and its definition of done; written today at WJ's request. **v1.0, 15 cases (AC-01–15), not yet executed.**

**Why it exists.** `ADR-OPS-006` mandates a manual keyboard / focus / screen-reader / contrast pass **before every release**, and no test plan executed that for the product flow. The only accessibility case anywhere was `help-and-tooltips-test-plan.md` HT-05, scoped to tooltips — and that one narrow keyboard step found `GAP-38`: three of nine tooltips completely unreachable by keyboard, a WCAG 2.1.1 failure that had already shipped. One feature-scoped plan found a real defect on its first run; nothing had looked at the other twenty-odd routes.

**The NVDA section is the part that makes it usable, and it is deliberately not about Grant Pathway.** The screen-reader step was Blocked on 2026-07-25 and attempted again unsuccessfully on 2026-07-30, both times because NVDA was hard to operate — not because the testing was hard. So the plan opens with install guidance, the browse-mode/focus-mode distinction that makes NVDA feel broken to a first-time user, quick-navigation keys, the five keystrokes that matter (starting with `Ctrl` to stop speech), and a symptom-to-cause table. The single highest-value item is the **Speech Viewer** (NVDA menu → Tools): it renders everything NVDA says as text, so announcements can be screenshotted as evidence, read back slowly, and captured with the audio off entirely. Two setup choices are called out because getting them wrong disables about half the documented shortcuts: the Desktop/Laptop keyboard layout, and enabling CapsLock as the NVDA modifier on a machine with no numeric keypad.

**HT-05 step 4 was absorbed rather than left deferred in two places.** It becomes **AC-08**, which also samples the three `GAP-38` tooltips — the ones that are focusable only because `tabIndex={0}` was added by hand, so confirming they _announce_ as well as _receive focus_ is worth doing. `help-and-tooltips-test-plan.md` now points at AC-08 in both its step list and its notes, and its 🟡 clears when AC-08 does. One screen-reader session closes both plans.

**What the plan covers beyond the ADR's own list.** All five of `ADR-OPS-006`'s manual items, plus the two guideline-viewer items in its Consequences, plus the five WCAG 2.2-specific criteria flagged on 2026-07-30 as landing on built-but-untested features — **Consistent Help** (AC-12), **Accessible Authentication** (AC-13, including the paste-into-password requirement that touches `D-015` and the 2026-07-24 change-password rework), **Redundant Entry** (AC-14, P6.5's reuse path), **Focus Appearance** (AC-06) and **Target Size** (AC-11). AC-11 deliberately separates a WCAG failure (under 24×24) from a house-standard deviation (`ADR-OPS-006`'s stricter 44×44), because conflating them would either overstate a breach or hide one.

**Two findings the writing itself produced, before a single case has been run.**

**(1) The register's only 🔵 ADR-OPS-006 row now has a test.** The P6.4 guideline-viewer consequence has read "Built 2026-07-14, not yet manually tested" for three weeks, and no plan existed that would ever test it — so it could have stayed 🔵 indefinitely with nobody doing anything wrong. **AC-05** is now named as its test in `ADR-TRACEABILITY.md` (→ v2.18). Its status was deliberately **left 🔵**: per the v2.15 symbol key, a test being written is not a consequence being discharged, and this is precisely the distinction C2 was introduced to protect.

**(2) A likely real failure, recorded but not fixed.** `design-requirements.md` §8.6 states "text does not use `px` for sizing — use `rem`… to respect user browser font size preferences". The components use hardcoded pixel sizes throughout — `text-[14px]`, `text-[13px]`, `text-[12px]`, `text-[18px]` across `application-step4-draft.tsx`, `session-timeout-modal.tsx` and both nav components. Text in `px` scales with page zoom but not with a user's browser font-size preference, so AC-15 step 1 may well pass while step 4 fails. Written into AC-15 as an expected finding with its reasoning, deliberately **not** fixed inside a test-plan task: it is plausibly a large mechanical change and needs its own decision, including the legitimate option of amending §8.6 if `px`-plus-zoom is judged sufficient for AA.

**And a correction to this session's own work, recorded because it is the exact failure mode the project keeps finding in itself.** The first draft asserted that `ADR-OPS-006`'s Lighthouse CI consequence was undischarged and that a task should be added to P5.3. **It is not undischarged.** `GAP-15` closed it as an accepted deviation on 2026-06-16 — manual audit in place of CI automation for v1, on the grounds that this is a single-developer project and `@axe-core/react` catches regressions during development, with WJ's decision recorded on both the ADR consequence row and the gaps register. The claim came from checking the codebase (no `lighthouserc*`, no CI step — both true) without then checking the register that records why. **Absence in the code is not evidence of an unmade decision.** AC-02 is now written as the discharge of that consequence as amended, which is a reason to actually run it rather than a shortfall to log.

**Not marked 🟢, and it cannot be yet:** the plan's small-viewport cases depend on `GAP-05`'s mobile viewport banner, which is unbuilt and is P5.3's own development work. Build GAP-05, then execute. `TEST-DASHBOARD.md` → v2.17 (6 plans → 7; 🟢 count unchanged at 5).

---

## 2026-08-03 (second pass) — `Schema Drift Check` skips prod until P5.4, so dev drift is a live signal again

**Decision: WJ.** The open question raised in the 2026-07-31 seventh-pass entry — whether the prod job should be temporarily skipped rather than left permanently red — is now settled in favour of skipping.

**The problem was masking, not the failure itself.** The prod leg failed every scheduled run from at least 2026-07-24 to 2026-08-02 — ten consecutive days, verified via `gh run list` rather than taken from the earlier note — and it failed _correctly_: `prod migration count mismatch: 29 tracked locally, 18 recorded as applied on the remote`, because Phase 6's migrations exist only on `grant-pathway-dev`. But a check expected to be red cannot report anything else. `check-schema (dev)` passes, and a workflow's status is the worst of its jobs, so the whole workflow read red daily and a genuine, unrelated drift on **dev** would have been invisible inside the known prod failure. This is the audit's **M2** pattern exactly, one layer down: accepted noise swallowing a real signal.

**Why skipping was available here and was not for `ci.yml`.** M2 and M6 both turned on the fact that a _skipped required status check never reports success_, which is what made the dead `audit` context an unsatisfiable gate. `Schema Drift Check` is **not** a required context — confirmed against the branch protection API, which lists exactly `lint-and-typecheck`, `test` and `validate-migrations`. It runs on a schedule, not on push, and gates nothing. So narrowing it leaves no gate waiting on a check that never reports.

**What changed.** `.github/workflows/schema-drift-check.yml`'s matrix is now driven by a `workflow_dispatch` choice input defaulting to `'["dev"]'`; scheduled runs supply no inputs and fall through to that default. Prod did not become unreachable — the dropdown offers `["dev"]`, `["dev","prod"]` and `["prod"]`, so it can be checked on demand from the Actions tab with no commit, which is what P5.4 will want while applying migrations one at a time. Implemented as a matrix default rather than a job-level `if:` because job-level conditions cannot read the `env` context, and rather than a repository variable because the state then lives outside version control, where a future session reading the workflow file could not see it.

**The real hazard this creates, and what was done about it.** The workflow goes green from now on while production stays exactly as unprovisioned as it was — a green badge that no longer says anything about prod. P5.4's exit test was, verbatim, "the `Schema Drift Check` workflow green and staying green", which this change would have satisfied **vacuously**. That is the hollow-gate failure this project keeps finding in its own records (the `audit` context, GAP-11's phantom PR review, the nine gaps signed off at the Phase 4 → 5 gate on the strength of a task having been _written_). So the exit test was tightened in the same pass to require the prod leg switched back on, with an explicit note not to read the green tick alone as the gate being passed, and **re-enabling the leg is now its own tasked P5.4 checklist item** — placed last, after the migrations, and naming the one-line edit. Skipping the check does not make prod safer and is not a claim that it is; it removes a false alarm.

Also updated: `README.md` and `technology-stack.md` (→ v1.12), both of which described the workflow as covering dev _and_ prod daily.

---

## 2026-08-03 — Post-move verification: the old working copy is confirmed gone, and the two deferred cleanups are closed

First session from the relocated clone. Verified rather than assumed, because the 2026-07-31 (sixth pass) entry left two items open "for when the desktop app is closed".

**Both are now closed.** The user-level `~/.claude.json` no longer carries either stale OneDrive project entry for this repo. The gitignored `.claude/settings.local.json` has one OneDrive path left — `Read(//c/Users/WJ/OneDrive - Rapidglobe Ltd/Downloads/**)` — and it is **not** stale: it resolves to the parent folder that entry deliberately kept, so it still grants what it was written to grant. Two harmless residues remain and are recorded so a future session does not re-investigate them: `~/.claude.json` lists this repo twice under slash-direction variants of the same path, and it still lists a separate, earlier project under OneDrive that has nothing to do with Grant Pathway.

**No clone remains outside the new location.** A recursive sweep of the user profile and of both OneDrive roots finds no `grant-pathway` directory. The one surviving OneDrive folder is the kept parent — it holds no `.git`, `node_modules`, `.next` or `.vercel`, so it is source material, not a repository remnant.

**The move broke nothing.** Tree clean and level with `origin/master`; remote correct; Husky still wired via `core.hooksPath = .husky/_`, which a relocation can silently sever. All four CI gates pass locally — `type-check`, `lint` at `--max-warnings 0`, 101 tests across 10 files, and `format:check`. `.vercel/` now holds only `project.json`, `README.txt` and `.env.preview.local`; the `output/` directory that carried the OneDrive symlink `EPERM` is gone, as that entry intended. The clone is 0.85 GB against the 1.47 GB it occupied under sync.

---

## 2026-07-31 (seventh pass) — "Bypassed rule violations" on every push explained; audit M6 confirmed closed

Every push to `master` prints `remote: Bypassed rule violations for refs/heads/master: - 3 of 3 required status checks are expected`. Investigated because it reads like a failure. **It is not, and it cannot be made to go away without changing how we work.**

**Why it happens.** `master` carries classic branch protection requiring the three real CI jobs (`lint-and-typecheck`, `test`, `validate-migrations`), with `strict: true` and `enforce_admins: false`. The word that matters is **"expected"** — meaning not yet reported, not failed. A direct push can never satisfy a required status check, because checks only run once the commit exists. The push is therefore always in violation, and because admins are exempt it always proceeds. CI then runs on the push and reports afterwards. **It passed for both of today's commits, and across the last 40 CI runs on `master` there are zero non-successes.**

**Audit finding M6 is now closed.** The 2026-07-29 entry records, as an outstanding consequence, that protection still required a fourth context — `audit` — after that job moved to `security-audit.yml`, so the check could never report; it was "flagged to WJ, awaiting his go-ahead". Verified today: the required contexts are exactly the three real jobs and `audit` is gone from both the protection rule and `ci.yml` (only explanatory comments remain). That earlier note is superseded.

**What the bypass actually costs, and what it does not.** Protection on `master` is an alarm, not a gate — but it is a real gate on pull requests, which is where the changes we did not write ourselves arrive (Dependabot #84–#88). The genuine exposure is elsewhere and already recorded: production is not gated on CI at all, because Vercel deploys on push in parallel with it (`DEPLOYMENT-CHECKLIST.md`, audit **M2**). A red commit ships.

**On the permanent resolution.** Two distinct fixes, for two distinct problems, and only one is worth taking:

| Problem                           | Fix                                                                                                                                                                                    | Verdict                                                                                                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The "Bypassed" message itself     | Stop pushing directly: branch + PR + auto-merge, `enforce_admins: true`                                                                                                                | **Not recommended.** A real gate, but it taxes every commit, and most of ours are documentation-only. It also contradicts `AGENTS.md` §5, which mandates commit-and-push after every task. |
| A red commit can reach production | Invert the deploy trigger — disable Vercel's Git auto-deploy for `master`, add a `deploy-production` job to `ci.yml` gated on `needs: [lint-and-typecheck, test, validate-migrations]` | **The one with teeth.** Leaves §5 untouched and makes the bypass harmless in fact rather than in practice.                                                                                 |

`DEPLOYMENT-CHECKLIST.md` step 2 has been updated to record this assessment, including **why Vercel's Ignored Build Step — the mechanism it originally named — is the weaker option**: `ignoreCommand` runs when Vercel starts the build, which is the same moment CI starts, so there is no conclusion to read. It can skip a build, not wait for one. Left as an open decision, not actioned: it needs Vercel project settings and three repository secrets, which is WJ's call.

**Separately, and worth not misreading: `Schema Drift Check` has failed daily since at least 2026-07-27, and that is expected.** The failure is `prod migration count mismatch: 29 tracked locally, 18 recorded as applied on the remote`; `check-schema (dev)` passes. Eleven migrations are not on production because production is not provisioned yet — which is exactly **P5.4**, still open, whose exit test (added 2026-07-30) is "the `Schema Drift Check` workflow green and staying green". The red is the tracking mechanism working.

**But it carries the same risk the `audit` job did, and that is a new observation.** A check expected to be red until P5.4 lands cannot signal anything else in the meantime — a genuine, unrelated drift on `prod` would look identical to the known failure. This is precisely the pattern the 2026-07-29 entry describes for `ci.yml`, where accepted noise had made it red on 11 of its last 12 runs and would have masked a real failure. Worth deciding before launch whether the prod job should be temporarily skipped (so dev drift stays a live signal) rather than left permanently red.

---

## 2026-07-31 (sixth pass) — Working copy moved out of OneDrive; §4 reworded to stop naming a location

The local clone now lives outside OneDrive. Per §4 the path is not recorded here — what matters is that it is no longer inside a synced folder.

**Why it mattered.** The clone was 1.47 GB across 4,210 files, the bulk of it `node_modules/` and `.next/`, every build churning through sync. It also produced real failures, not just noise: the `.vercel/output/builds.json` left behind by the last build in that location recorded `EPERM: operation not permitted, symlink 'account\delete.func'` — OneDrive cannot create the symlinks a Vercel build emits. That stale output has been cleared; the next `vercel build` regenerates it. `.vercel/project.json` (the project link) was left intact.

**The old clone was deleted, after verification rather than on assumption.** It had no commits absent from `origin/master`, a clean tree, and one branch. It did hold two leftover `lint-staged` automatic backup stashes (10 and 13 July) — the kind of thing easily waved away as "just backups". One of them contained 45 lines in `app/(authenticated)/applications/[id]/step/4/page.tsx` that do not exist in `master`, which looked at first like lost work. It was not: those lines are the pre-rename form of the sync logic, `application_answers` / `question_order`, superseded by `application_items` / `item_order` in `82e11d9`, with the orphan predicate extracted to `lib/governance-items.ts` and covered by tests. Nothing was lost. **The parent folder was deliberately kept** — it holds material that is not in the repository and exists nowhere else, including the AWS/Supabase keys note, the logo originals and the archived overview PDFs.

Migration verified by `npm run type-check` passing from the new location, and by confirming `.env.local` (a `vercel env pull` output) is complete: the four keys it lacks against `.env.example` are all safe-by-design absences — `AI_ENABLED` unset means AI **enabled** (the guards test `!== 'false'`), `NEXT_PUBLIC_ALLOW_INDEXING` unset means no indexing (deliberately opt-in), `NEXT_PUBLIC_SITE_URL` falls back to the canonical domain, and `SUPABASE_DB_PASSWORD` is read by no code at all.

**§4 no longer names OneDrive.** All three points and the Why said "the OneDrive path", which made the rule read as _avoid OneDrive_ when it always meant _avoid absolute local paths_. Reworded to describe the working copy generically, with a note recording why, so the next relocation does not invalidate it again. The five historical mentions elsewhere — `CHANGELOG.md` (2026-07-30), `IMPLEMENTATION-STATUS.md`, and three in `regression-test-plan.md` — were **left untouched on purpose**: they record the RT-14 incident where a live test plan hardcoded the author's path, and rewriting them would destroy the audit trail that §3 exists to protect.

**Also fixed, found while in there:** `.claude/settings.json` allowed `Bash(npm run typecheck)`, but the script is `type-check` — the permission could never match, so the command prompted every time.

**Left for when the desktop app is closed:** two stale OneDrive project entries in the user-level `~/.claude.json` (both empty, so pruning is safe, but the app owns that file and rewrites it on exit), and some stale OneDrive permission entries in the gitignored `.claude/settings.local.json`, which are cosmetic — they simply match nothing now.

**Unrelated, noted for follow-up:** the push at the end of this work reported a high-severity Dependabot alert on the default branch, and that the push bypassed 3 required status checks.

---

## 2026-07-31 (fifth pass, later) — Overview v1.19: the Giving Evidence source attached to its citation as a footnote

The source note for the £900m / 17.5% figures sat as a loose paragraph at the very end of the `.docx`, four pages after the claim it supported, with no marker connecting them. It is now a real Word footnote anchored at the end of the citation paragraph, rendering at the foot of **page 2** where the figures are. Wording and styling unchanged (italic, 9pt); the stranded paragraph is gone, so the last page no longer carries a single orphaned line. Verified through Word itself rather than the XML alone — one footnote, reference on page 2, text intact including the `’` in "Foundations’".

Two consequences worth recording. **Content reflows:** still 6 pages, but "What Grant Pathway Does" moves from the foot of page 2 to the top of page 3, and page 6 — which previously held nothing but the orphaned source line — now carries the closing sections. **The `.md` and `.docx` are knowingly out of sync on this point:** at WJ's instruction the `.md` was left alone (it was needed urgently as an email attachment), so it still carries the note as a trailing paragraph. Markdown has no footnote form that survives a round-trip to `.docx`, so aligning them needs a deliberate decision rather than a copy-paste.

---

## 2026-07-31 (fifth pass) — New diagram swapped into the overview (v1.19)

The rebuilt SVG's PNG export replaces the AI-generated diagram in both the `.md` and the `.docx`. **v1.19** is now the live pair.

The `.docx` was again edited in place rather than regenerated, to preserve WJ's hand-finished title page, header and footer. `word/media/image4.png` swapped for the 3200 × 1660 export, and — the step it would be easy to miss — **both the `wp:extent` and the `a:ext` height values were recalculated**, since the new diagram has a different aspect ratio (1.93 against the old 2.36). Width held at the original 6.3 in (5760720 EMU), so the height moved 2443941 → 2988374 EMU (2.67 in → 3.27 in). Leaving those alone would have stretched the image vertically. Schema-validated against v1.18 (77 paragraphs, unchanged), exported via Word COM and checked page by page.

**Consequences worth recording:** the diagram no longer fits at the foot of page 3 and now heads **page 4**, which reads better than being squeezed under the body text. Document still 6 pages. File size dropped 1.9 MB → 1.1 MB, because the replaced image is smaller than the AI-generated original despite being twice the pixel dimensions.

**v1.18 was not archived**, on the same basis as v1.17 earlier the same day: it existed for a few hours, went to nobody, and `docs/overview/archive/` is for versions that actually reached an external audience. Superseded in place; wording preserved in `d455186`. The archive README now states this for both.

**Left deliberately undone: the old `grant-pathway-process-overview.png` has not been deleted.** The live overview no longer references it, but a repository-wide check for other uses was still running — a `.docx` embeds its own copy of an image, so a file can depend on the diagram without naming it anywhere, and `docs/overview/archive/Grant-Pathway-Business-Overview-v1_16.docx` is known to contain one. Deleting on the assumption that "nothing else uses it" is exactly the partial-sweep pattern the 2026-07-30 audit kept finding. Both READMEs record the file as retained pending that check.

**One cosmetic point for WJ, not actioned:** the diagram carries the Grant Pathway logo in its own top-left corner, and the document puts the same logo in the page header — so on page 4 it appears twice, a few centimetres apart. The logos are right for the SVG used standalone (a website, a deck) and only collide inside this document. A one-line change to the SVG would drop them if he prefers.

---

## 2026-07-31 (fourth pass) — `public/images` tidied: three unused logo files removed, the live one cut 98%

Follow-on from the correction above. Once it was established that `components/logo.tsx` already renders the real asset, the question became what was actually left in `public/images` — and the answer was three unused files and an oversized live one.

**Removed, all confirmed unreferenced by any code, config, template or route:**

| File                                          | Size   | What it was                                                                                              |
| --------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| `Grant Pathway PNG Logo.png`                  | 376 KB | The original Canva export, 1920 × 1080, **no alpha channel at all** — superseded before it was ever used |
| `logo-white-wordmark.png`                     | 190 KB | White-wordmark variant, added 2026-06-12 and "retained for dark/teal background contexts (emails etc.)"  |
| `Grant_Pathway_PNG_Logo-removebg-preview.png` | 49 KB  | A background-removal intermediate — the filename says "preview"                                          |

The white wordmark was the only judgement call, so it was checked rather than assumed: **both navs are `bg-white`** (`nav-public.tsx`, `nav-authenticated.tsx`), the teal `#0D6E6E` appears only on buttons and tints and never behind a logo, and the transactional emails contain **no images whatsoever** — so the dark logo is correct in every place it is actually used, and the variant sat unused for seven weeks against a context that never arrived. Recoverable from git history, or regenerable from the master, if a dark surface ever appears.

Worth noting these were in `public/`, so all three were **publicly served at guessable URLs** — the same shape as the `app/mockup` deletion (audit S3), though far less consequential: they are logos, not internal strategy notes.

**`public/images/logo.png`: 655 KB → 12 KB, a 98% cut.** It was the full 1562 × 560 master being served for a 156 × 56 nav render. Next/Image resizes on delivery so no user ever downloaded 655 KB, but the source was ~40× larger than needed. Now 625 × 224 (4× the display size, covering every device pixel ratio Next requests) and palette-reduced to 58 colours, which suits artwork that is two flat brand colours plus antialiasing. **Quality was verified, not assumed:** 16/32/64-colour variants were compared by RMSE against the original (0.0149 / 0.0133 / 0.0119 — all confined to edge antialiasing) and 64 was chosen; rendered side by side at 2× display size it is indistinguishable. Transparency confirmed intact (corner pixel `srgba(0,0,0,0)`, mean alpha 0.3204 → 0.3198).

**The docs copy was kept rather than deleted, reversing what was offered.** `docs/overview/assets/grant-pathway-logo.png` and `public/images/logo.png` were briefly identical, and deleting the docs one as a duplicate was the plan — but optimising the web copy makes them no longer duplicates, and the docs copy then becomes **the only full-resolution logo in the repository outside binary `.docx` files**. The overview's title page renders it around 900 px wide, so that resolution is genuinely needed. Both files and the split are now documented in `docs/overview/assets/README.md`, including the instruction to update both plus the SVG's embedded base64 copy if the brand artwork ever changes.

**Verification:** `npm run type-check` clean, `npm run lint` clean, **all 101 tests pass**, and a grep confirms nothing anywhere references the three deleted filenames. The logo asset itself was rendered at 156 × 56, on white and on the brand teal, and at 2× — sharp, correctly transparent, no halo. **Not verified in the running app**: that needs the dev server, and this environment cannot supply the eight required secrets (see the 2026-07-28 note on Vercel Sensitive variables). The asset is a drop-in replacement at the same path with the same aspect ratio and no code change, so the risk is low, but the nav has not been seen live.

---

## 2026-07-31 (third pass) — Process diagram rebuilt as an editable SVG; the old one had gibberish on it

WJ asked whether the infographic in the overview needed updating. It did, and for a worse reason than the "DATA STORED IN UK" line already flagged: **the artwork contained garbled text**. Stage 4 read _"(User confirms accuracy, the funder funders accuracy..)"_ — not a wording problem, actual gibberish, sitting on page 3 of a document prepared for external distribution and present through several versions.

### What was wrong

**Broken text:** the "funder funders" phrase; a sentence in stage 3 ending in a dangling "AI"; two unfinished ellipses ("AI improves structure…", "accuracy.."); and a stage-4 bracket that merely repeated its own heading ("Export Completed Application (Export completed application upload to form or portal)").

**Inaccurate or missing content:** "TRUST: DATA STORED IN UK" contradicted the text corrected earlier the same day, in the same document, two pages apart. "FREE FOR SMALL UK CHARITIES" contradicted the document's own audience definition (small **and mid-size**, up to ~£1m). The flow was drawn as a straight line 1→2→3→4 with **no exit**, when `FR-47` can terminate an application at Step 3 — the diagram showed a path that cannot always be walked. The Charity Commission lookup and `P6.5` reuse were absent. And its four stages contradicted the app's own five numbered steps, so a user holding the diagram beside the screen would count differently.

**Other:** the stage-4 icon was an imitation of the Microsoft Word logo (rendered as "w/") — unnecessary trademark exposure on external material. The RapidGlobe wordmark was placed so small it read as "RapidGiobe"; **that turned out to be a scaling artefact, not a typo** — cropping the supplied logo to its content and re-rendering shows "RapidGlobe Ltd" correctly, which is worth recording since the opposite was suspected.

**Root cause, and the durable lesson:** it was AI-generated raster artwork. Its text is pixels, so it could not be proof-read by any tool, could not be edited, and any one-line fix meant regenerating the whole image. **Do not use generated raster artwork for anything containing text that has to be correct.**

### What replaced it

`docs/overview/assets/grant-pathway-process-overview.svg` — hand-authored SVG, now the source of truth. Plain commented XML on the `BR-02` palette from `app-name-and-branding.md`, with the two real logos WJ supplied embedded as base64 so the file stands alone. Structure: **set up once**, then **five step cards matching the app's own Step 1–5 numbering**, an **amber exit off Step 3** for the eligibility hard stop, and four key principles. Icons are simple geometric paths — no imitation of anyone's trademark. Text is accurate to the built product: the register lookup, starting from an earlier application, per-answer approval, and Word export are all described as they actually behave.

**One overclaim was caught in the new diagram before it shipped:** a first draft said each summary point is linked back to the guidelines with "every point linked back". Citations are optional per `ADR-DATA-007` — the Wolfson case produced none until the `[ITEM N]` fallback was built — so "every" would have been a fresh overclaim of exactly the kind removed from the text earlier the same day. Now reads "with links back to the funder's own wording."

### Files, and why the old PNG is still present

`grant-pathway-process-overview-v2.png` (3200 × 1660) is the 2× export, **ready but not yet used** — WJ asked explicitly for no new version of the overview in this pass, having spotted further changes he wants. The old `grant-pathway-process-overview.png` is therefore **deliberately left in place**, because the live v1.18 still references it; it goes when the Word file is rebuilt. `assets/README.md` records which file is which so the next session does not guess.

Also saved as reusable assets: `grant-pathway-logo.png` (1562 × 560, **transparent background**) and `rapidglobe-logo.png`, both extracted from the overview's own `.docx` media and confirmed by WJ as the real artwork.

> **Correction, same day.** This entry originally claimed that `components/logo.tsx` "still carries a placeholder SVG" and that the extracted PNG was what the outstanding logo-replacement item had been waiting for. **That was wrong, and the error was mine** — it repeated a stale session note without checking the code. The placeholder was replaced on **2026-06-13** by commit `7626a9d` ("Replace placeholder logo with final Grant Pathway brand asset"), recorded in this same changelog, and `components/logo.tsx` has rendered the real transparent-background asset (`/images/logo.png`, 1562 × 560, the same artwork) ever since. There is nothing outstanding. Corrected after WJ questioned what the swap would actually involve — the right question, and it exposed both the stale note and this entry repeating it.

**Tooling note for future sessions.** No `rsvg-convert` or Inkscape on this machine, and ImageMagick's SVG delegate renders text badly. Headless Chrome is the working route, with two traps: it refuses to write a screenshot from a `file://` URL (serve the folder over `python -m http.server` instead), and **without `--user-data-dir` it fails silently with exit code 0 and writes nothing**. The Browser pane cannot help here — `computer{action:"screenshot"}` needs the pane displayed and times out otherwise. Full commands are in `assets/README.md`.

---

## 2026-07-31 (second pass) — Two day-one claims in the Business Overview tested and both failed; replaced with a sourced statistic (v1.18)

WJ read the "Problem We Are Solving" section of the freshly-issued v1.17 and asked directly whether one paragraph was authentic and accurate — the one naming "theory of change", "additionality" and "outcomes framework" as the jargon that confuses a volunteer, ending "Two to three days of her life, every time." It had been in the document, unchanged, since the first version. **Neither claim survived checking.**

### The jargon examples were wrong, and we could prove it from our own files

`docs/Grant Org Guidelines` holds **23 real funder documents** (11 PDFs plus docx and sample forms, from AB Charitable Trust, Garfield Weston, Clothworkers, Heritage Fund, Henry Smith, Idlewild, Lloyds Bank Foundation, MK Community Foundation, Nationwide/Norfolk, Walton and Wolfson). All 23 were extracted to text — every extraction verified non-empty, so a zero is a real zero — whitespace-normalised so line-wrapped phrases could not hide, and searched:

| Term                 | Appears in |
| -------------------- | ---------- |
| "theory of change"   | **0 / 23** |
| "additionality"      | **0 / 23** |
| "outcomes framework" | **0 / 23** |
| impact               | 13 / 23    |
| safeguarding         | 13 / 23    |
| outcomes             | 9 / 23     |
| core costs           | 8 / 23     |
| beneficiaries        | 6 / 23     |
| unrestricted         | 6 / 23     |
| sustainability       | 6 / 23     |

All three named terms are genuine sector jargon — they trace back to `BRD-Grant-Pathway-v0.2.md` and Persona 1's pain points — but they are **not the jargon the funders our users actually face put in front of them**. Replaced with "core costs", "unrestricted funding", "outcomes" and "sustainability": all four verified present in the corpus, and all four still genuinely opaque to someone with no fundraising training ("impact" and "safeguarding" are commoner still but are largely self-explanatory, so they were not used). A do-not-reintroduce note with the counts is now in `business-overview.md` beside the paragraph.

### "Two to three days" had no source and contradicted two other documents

It traces to Persona 1 (Margaret) in `user-personas-journeys-and-use-cases.md`, a composite with **no documented research basis** — no interviews, survey or citation anywhere in the repository. `DR-PS-001`'s rationale likewise asserts that small charities "consistently find the writing burden" the primary obstacle with nothing behind it. The figure also drifted: `tone-and-voice-guide.md` says "a full weekend", `PRD-Grant-Pathway.md` says "2-3 days", and the sentence immediately before it in the overview has her clearing her diary **for the weekend**. Now "A whole weekend of her life, every time", matching Margaret's own pull-quote in the personas document.

This mattered more than a normal wording slip because of who the document is for: the funding model (`DR-OD-002`) depends on approaching technology funders and digital inclusion programmes, who fund on evidence, and "two to three days" is exactly the sentence one of them asks about.

### A sourced statistic added in its place

The narrative framing ("Picture a volunteer at a small community charity…") is honest and was deliberately kept — an illustration needs no citation. What the document lacked was any evidenced claim at all, so one was added as a separate, attributed paragraph:

> Applying for grants costs UK charities **at least £900 million every year**, and the burden falls hardest on the smallest: for charities with an income under £100,000 it comes to **at least 17.5% of the money they raise from foundations**, against around 4% for charities above £1 million.

**Source:** Caroline Fiennes, Gemma Bull and Sarah Sandford, _Understanding and Reducing the System Costs of Foundations' Application Processes_, Giving Evidence, 2022, funded by the **Law Family Commission on Civil Society** — [authors' own summary](https://giving-evidence.com/2022/10/12/applicationcosts/) and [full report](https://giving-evidence.com/wp-content/uploads/2022/09/understanding-and-reducing-the-system-costs-of-foundations-application-processes.pdf). It says what Grant Pathway exists to fix, from an independent source a funder will respect, and every figure in it is a conservative minimum. Cited in a footnote in the `.md` and an italic source note on the last page of the `.docx`.

**Two candidate figures were rejected, and the reasons are recorded in `business-overview.md` so this is not re-litigated.** (1) The Law Family Commission's **own** briefing (`Giving pains: The cost of grant-making`, July 2022) states that small and medium charities spend "more than a third" of their resources on applying — irreconcilable with the underlying report's 17.5% (small) and 15% (medium), and it looks like the two brackets added together. The authors' figures were used, not the publisher's press framing. (2) **Brevio's 2020 survey** — 1,002 organisations, 1 in 8 spending three or more working days a week on applications, £442m sector-wide — is widely cited and is the low end of the range the Commission quotes, but it is a pandemic-period snapshot ("since March" 2020) from a commercial funding platform with an interest in the answer.

### Version handling

Reissued as **v1.18** (`.md` and `.docx`). **v1.17 was not archived**: it existed for about an hour, was never sent to anyone, and this project's `docs/overview/archive/` is for versions that actually reached an external audience — listing an undistributed one would imply somebody holds a copy. Superseded in place; the wording remains in commit `987c8fb`. The archive README now says so explicitly. Same in-place `.docx` XML editing method as the first pass, schema-validated (75 → 77 paragraphs) and checked page by page.

Also checked and deliberately left alone: **"a twenty-page PDF of funder guidelines"**. The real corpus runs 4 to 54 pages, median 10 — above typical but well within range, and clearly illustrative rather than asserted.

---

## 2026-07-31 — Business Overview reviewed before distribution and reissued as v1.17

WJ asked for the external Business Overview in `docs/overview/` to be reviewed ahead of distributing it, given the gaps found over the previous week. It was last issued on **20 July** as v1.16, before the legal-document work, and had drifted.

**Reissued as v1.17** (`docs/overview/Grant-Pathway-Business-Overview-v1_17.md` and `.docx`). v1.16 and the older v1.4 Word export are now in `docs/overview/archive/` behind a new `README.md` that states plainly nothing there is current and names the live files — the same pattern as `docs/legal/archive/`, created the day before for the same reason.

### Four substantive findings

1. **The data-residency claim was an overclaim, in a document about to be sent to charities and funders.** It read "All data is stored in UK-based infrastructure" with no qualification, while `docs/legal/privacy-policy.md` v1.5 Section 5 names **Vercel (US)**, **Resend (US)** and **Sentry (EU)** among the processors. The charity's own content genuinely is UK-only — Supabase London, and Bedrock `eu-west-2` which never leaves the EEA — so the fix states that precisely and then names the three supporting services that sit outside the UK under IDTA-equivalent safeguards, rather than softening a claim that is true of the part a charity cares about. The internal `docs/business-overview.md` carried the same sentence and has been corrected too, with a standing note not to restate the blanket version anywhere.
2. **Grant discovery was still listed as a future Grant Pathway idea.** "Helping charities find grants that match their work" survived in the future-ideas list six weeks after the **2026-07-11** decision that discovery becomes a **separate, chargeable RapidGlobe service** and explicitly not a Grant Pathway feature (`BRD-Grant-Pathway.md` Section 8). Distributing it would have advertised, for free, a feature that is now a paid separate product. Removed and replaced with an explicit statement that Grant Pathway is and will remain a writing tool. **Not reconciled: `FP-01` in `future-phases.md`** still frames discovery as a possible Grant Pathway phase, with `FP-02` (360Giving) hanging off it — flagged in `business-overview.md` for WJ to decide, not rewritten unasked.
3. **Three built, user-visible behaviours were described nowhere in the overview:** the Charity Commission register lookup that pre-fills the organisation profile (disclosed in the Privacy Policy on 2026-07-30, but never in the product description); the **P6.5** "start from one of your own earlier applications" path; and **FR-47's eligibility hard stop**. The last is the one that matters most to a reader deciding whether to use the service — the tool can tell a charity it is not eligible and refuse to take the application further, with no override — and a business overview that omits it undersells the honest, time-saving behaviour and surprises the user later. All three added.
4. **The review-and-approve paragraph appeared twice**, near-verbatim, one copy carrying a stray comma ("figures, dates, and facts, correct?"). Both were visible on page 3 of the distributable. Merged into one, and the surrounding mega-paragraph split so the writing interface and the review gate are described separately.

### Smaller corrections

- The fair-use paragraph now points at the Terms of Service for the current figure rather than leaving it unquantified — deliberately not restating "50 per month" in a static distributable, since that figure was itself wrong in the Terms until 2026-07-30.
- Deletion wording gained the seven-day backup-rotation qualifier, so "completely and permanently" is not read against `privacy-policy.md` Section 7, which is more precise.
- "The Privacy Policy and Terms of Service **will** set all of this out" moved to the present tense — both have existed and been published since 2026-06-10.

### Method note: the .docx was edited, not regenerated

v1.16's Word file was **hand-finished by WJ in Word** — Grant Pathway logo, RapidGlobe title page, running header and page footer, none of which exist in the `.md`. Regenerating from Markdown via pandoc would have silently dropped all of it, so the `.docx` was instead unzipped and `word/document.xml` edited paragraph by paragraph, preserving every style, image, header and footer. Schema-validated against the original (`validate.py --original`, paragraph count 72 → 75 as expected), converted to PDF via Word COM, and checked page by page. An **orphaned 1.2 MB PNG** that Word had left in the package with no relationship to it was dropped in passing: 3.1 MB → 1.9 MB. Note for future sessions: the docx skill's `soffice.py` shim is Unix-only and fails on Windows with `socket.AF_UNIX`; Word COM via PowerShell is the working route, consistent with the 2026-07-30 legal-PDF note.

### Two items left for WJ, neither actioned

- **The process diagram asserts the same broad claim the text has just been made careful about.** `assets/grant-pathway-process-overview.png` lists "TRUST: DATA STORED IN UK, NEVER SOLD OR USED FOR TRAINING" as a key principle. It is defensible for charity content, which is why it was not treated as a defect — but it is an image, so changing it means redrawing rather than editing, and it sits on the same page as the corrected text.
- **The overview reads throughout as though the service is live**, which it is not until `P5.4`/`P5.6`. Fine if WJ is distributing it as a "what we are building" document; worth a status line if recipients might try to register.

---

## 2026-07-30 — Legal documents prepared for external review: 3 privacy gaps closed, 2 Terms errors fixed, PDFs produced

WJ ran the **ICO's own Privacy Notice Generator** (recommended as step one in `docs/legal/legal-review-options-2026-07-29.md`) and asked for a comparison against `privacy-policy.md` before sending anything to a solicitor.

**The comparison's headline: our policy is substantially better and more complete than the ICO output**, which is a thin skeleton and, as generated, an unfinished one — it carried `[Your additional purpose]` placeholders, three orange instruction boxes, a red "delete these boxes" box, the company **number** typed into the **registered name** field, the wrong brand and domain ("Rapidglobe.com customer privacy notice"), the personal `Wjokhia@` address we deliberately moved away from at v1.3, a retention section pointing circularly at the temporary `grant-pathway-three.vercel.app/privacy` host, and only **one** processing purpose ("to allow the end user to logon"). It also proposed Legitimate interests for account creation where **Contract** is the better analysis. None of that was carried over. It remains useful as a **checklist**, and as evidence to a reviewer that the free ICO tools were used first.

### Three genuine gaps it exposed in our policy — all now closed (privacy policy → v1.5)

1. **First and last name were never disclosed.** Registration has always collected `first_name` and `last_name` (both required, used in email greetings and the nav bar); Section 2 listed only the email address. Now discloses both, plus how the password is treated (one-way hash, never recoverable).
2. **Consent was missing as a legal basis — the most substantive of the three.** The optional "happy to be contacted" checkbox at registration (`feedback_consent`, FR-08) is textbook consent-based processing and appeared **nowhere** in the policy: not in Section 2, not in the Section 4 basis table. Consequently Section 8 omitted the **right to withdraw consent**, which UK GDPR requires wherever consent is relied on. Now recorded as a basis, with the right added and an explicit statement that withdrawing has no effect on the account or on the lawfulness of prior processing.
3. **The Charity Commission lookup was undisclosed.** `actions/charity.ts` queries the public register to pre-fill organisation details. A new **"Where we get your information from"** subsection states that almost everything comes directly from the user and discloses this one exception, noting it is optional and returns public register data about the organisation. Flagged for the reviewer rather than asserted as settled: a small charity's registered address is often a trustee's home address.

Also added a short legitimate-interests balancing statement to Section 4, a note in Section 8 that which rights apply depends on the basis, and a retention row for the new fields.

### Two errors found in the Terms of Service while preparing it — one serious (terms → v1.4)

1. **⚠️ Section 6 stated a fair-use limit of 20 AI-assisted requests per month. The real limit is 50.** This is a **binding contractual term**, it was published, and it understated what the service provides by 60%. The cap was raised 20 → 50 on 2026-06-17 (`PDR-AI-005`) and `lib/prompts.ts` has enforced `MONTHLY_CAP = 50` ever since; the Terms were never updated. Six weeks live. **This is the single most consequential thing found today**, and it would have gone to a solicitor uncorrected.
2. **The contact email was `wjokhia@rapidglobe.com` in four places** (Sections 2, 3, 6, 14). The Privacy Policy moved to `admin@rapidglobe.com` at its v1.3 on 2026-06-17; the Terms did not, so **the two live legal documents gave different contact addresses for the same company.**
3. Section 5's AWS paragraph still said "when you request a summary or draft answer" — a leftover from the abandoned draft-generation model that the rest of that same section had already been corrected to disprove at v1.1.

**Swept for the stale cap elsewhere, and found two more instances:** `ADR-TRACEABILITY.md`'s `ADR-AI-008` consequence row (_"n of 20 AI requests used this month"_) and two comments in `lib/ai-error-handler.ts` describing a "20/month app-level cap". Both corrected. The 2026-07-10 pass that fixed this figure in `PDR-AI-005`, `ADR-AI-002` and `ADR-AI-008` missed the Terms, the traceability register and the code comments — the same partial-sweep pattern recorded throughout today.

### External copies regenerated rather than hand-mirrored

`privacy-policy-external.md` and `terms-of-service-external.md` were **regenerated from the internal files** by stripping the changelog blockquotes and the internal maintenance note, rather than being edited by hand. The diff was checked line by line to confirm the only changes were the intended ones. This removes the drift risk the internal maintenance note warns about — those files have no changelog of their own, so nothing else prompts the mirror.

### `docs/legal/archive/` created

Only the two genuinely superseded documents moved (`git mv`, history preserved): `grant-pathway-privacy-policy-v1.0.docx` and `grant-pathway-terms-of-service-v1.0.docx` — Word exports of the 22 May 2026 text, now five and four versions behind respectively. The ToS export predates the fair-use correction, so it states the wrong limit too.

**Everything else was deliberately left live** after checking: `AWS-DPA-reference.md`, `AWS-navigating-gdpr-compliance.pdf` (referenced from three documents), `ICO-registration-certificate-ZC168720.pdf`, `sar-procedure.md`, `legal-review-options-2026-07-29.md`, `dependency-licences-2026-07-30.md`, and the four current policy/terms files. References were checked **before** moving (today's L9 lesson): the only mention of either `.docx` is in an archived session note, correctly left as a historical record. `archive/README.md` states plainly that nothing in there is current and must not be sent to a reviewer, names the live authoritative files, and carries the re-base-your-links warning.

### PDFs for the solicitor

`docs/legal/pdf/` — `Grant-Pathway-Privacy-Policy-v1.5.pdf` (8 pages) and `Grant-Pathway-Terms-of-Service-v1.4.pdf` (7 pages), both with a table of contents and page numbers, both generated from the **external** copies since those are the legally operative published text. **`.docx` versions are committed alongside**, because a solicitor will usually want to mark up in Word with tracked changes.

**Method note for whoever regenerates these.** pandoc is installed and pdflatex/xelatex are present, but both LaTeX engines stalled for minutes on first run (MiKTeX installing packages on demand). The reliable route on this machine is **pandoc → `.docx`** (under a second) then **Word via PowerShell COM → PDF**, refreshing the table of contents before saving so page numbers are correct. Both PDFs were visually verified page by page, not assumed — a crude text-extraction check produced false negatives because Word subsets fonts.

**⚠️ Both documents still show `Effective date: [TO BE CONFIRMED]`.** That is audit finding **S2a**, owned by WJ, and it needs no solicitor — but it is the first thing a reviewer will ask about, so it should be set before these PDFs are sent.

## 2026-07-30 — L9, L10, and a CI cost fix found by a GitHub usage alert

### L9 — 24 broken relative links, and the cause worth naming

Independently re-scanned: exactly 24 broken relative markdown links across 5 files, **none in a live document**. The audit's count was right.

**They did not rot — archiving broke them.** Moving a document into an `archive/` subfolder invalidates every relative path inside it, and **22 of the 24 targets still existed**, unchanged, just at a different depth: eight ADRs and `ADR-INDEX.md`, four DRs and `DECISIONS-INDEX.md`, two DDRs, three test plans, `IMPLEMENTATION-PLAN.md`, `target-funder-list.md`. The remaining two were directory links to `PRD decisions/`. All 24 re-based programmatically against the real locations, then re-verified: **zero broken relative links repository-wide.**

**The durable point, which nothing currently says: archiving a document must include re-basing its relative links.** That is the actual root cause here, and it will recur at the next archiving pass — including the deferred Implementation Plan folder tidy-up, which is likely to move these very files again. Fixed now rather than deferred to that tidy-up, on the grounds that the tidy-up has already been deferred for some time and leaving 24 known-broken links in place against a possible future move is the worse bet. `CHANGELOG-ARCHIVE.md` held 16 of them and is not a dead document — it is the designated history for Phases 0–4 and is actively cited, so a reader tracing a Phase 3 decision was hitting dead ends.

### L10 — 23 format failures that were never real

`npm run format:check` reported 23 files as misformatted locally while CI passed. Confirmed the cause precisely rather than assuming it:

- `core.autocrlf=true` on the development machine, and **no `.gitattributes`**, so git checked every text file out with CRLF.
- Prettier's default `endOfLine: "lf"` then flagged all of them.
- **git has always stored LF** — verified by counting CR bytes in the stored blobs: zero. The repository content was never wrong; only the local checkout was.
- CI runs on Linux, checks out LF, and therefore never saw the problem.

So `npm run format:check` could not be trusted locally, and `npm run format` would have rewritten 23 files as pure line-ending churn. Worse than noise: it makes the local signal useless for the one check that genuinely applies to a documentation change.

**Fix.** New `.gitattributes` with `* text=auto eol=lf`, so the checkout matches what is stored on every platform, plus explicit `eol=crlf` for `.bat`/`.cmd`/`.ps1` and an explicit `binary` list for `.pdf`/`.docx`/`.xlsx`/images/fonts. The binary list is deliberate rather than trusting git's auto-detection: this repository stores funder guideline PDFs and exported Word documents as test inputs and deliverables, and a file corrupted by line-ending conversion is easy to cause and hard to notice. Working tree converted to LF in the same pass — which produced **no diff at all**, exactly as predicted, because git already stored LF.

`supabase/.temp/` added to `.prettierignore`. That was the one **genuine** failure of the 23: local Supabase CLI state (`linked-project.json`) that the CLI rewrites as a side effect of `supabase link` and `supabase db query`, and that Prettier has no business reformatting.

**`prettier --check .` now passes cleanly across the whole repository** — 23 failures to zero. Also relevant to `DR-BM-002`: a future maintainer on Windows would have hit the same false failures with nothing to explain them.

### A CI cost fix, prompted by a GitHub usage alert mid-session

WJ received a GitHub Actions alert: **2,702 of 3,000 included minutes used, 90%, resetting 2026-08-01.** Measured rather than estimated:

|                                   |                                                                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Billed cost per push              | **~4 minutes typical** — `lint-and-typecheck` 1.0 + `test` 0.7 + `validate-migrations` 2.3. GitHub bills the **sum** of parallel jobs, not wall-clock |
| `validate-migrations` variability | **2.3, 4.3 and 9.1 minutes** on three consecutive runs — by far the most expensive and least predictable job                                          |
| Today's cost                      | 12 CI runs, ~40 minutes wall-clock, roughly **60–85 billed minutes**                                                                                  |

**The waste:** `ci.yml` had no path filters, so it ran in full on every push — and nine of today's pushes were documentation-only. The project was starting a Supabase instance and replaying every migration to validate migrations that had not changed.

**The fix, and the trap avoided.** `validate-migrations` now checks whether anything under `supabase/` changed and skips its expensive steps if not — but **the job still runs and still reports success.** It was implemented as conditional _steps_ rather than `paths-ignore` or a job-level `if:` for a specific reason: `validate-migrations` is one of the three **required status checks** on `master`, and a required check that is _skipped_ never reports success, so it would block merging forever. That is precisely the unsatisfiable-gate failure that findings **M2** and **M6** were about — the required `audit` context outliving the job that produced it, and admin enforcement being impossible to enable as a consequence. Conditional steps keep the contract intact.

It also falls back to validating anyway when the base commit is unavailable — first push to a branch, a force-push, or an unrecognised base — so the safe default is to run, not to skip.

**`lint-and-typecheck` was deliberately left unconditional.** `format:check` runs `prettier --check .`, which covers Markdown, so it is the one job that genuinely does apply to a documentation-only change — and it has caught real failures in this repository before (`AGENTS.md` §5 records two). Skipping CI on docs would have removed the only check that mattered for the commits being made most often.

**Expected effect:** a documentation-only push drops from ~4 billed minutes to ~1, a saving of roughly 75% on the most frequent commit type, with no loss of coverage.

## 2026-07-30 — L8: the dependency licence review now exists; GAP-20 closed after ten weeks

`GAP-20` (`ADR-STACK-005` — "dependency licences reviewed for proprietary product compatibility") was the only row in the traceability register whose status cell had ever been **completely empty**, from 2026-05-20 to earlier today. Its P5.1 task existed the whole time. That emptiness is exactly how a task nobody had started stayed invisible for ten weeks while every other row carried something. The bookkeeping half was fixed earlier today under C2; **this entry is the review itself.**

**Artefact: `docs/legal/dependency-licences-2026-07-30.md`.**

### Conclusion

**No licence in the dependency tree prevents Grant Pathway from being a closed-source, proprietary, hosted service.** Nothing needs removing or replacing before launch. Three findings carry that:

1. **All 25 direct production dependencies are permissive** — MIT, Apache-2.0, ISC, BSD-2-Clause. No copyleft, no source-available restriction among the packages the product deliberately chose.
2. **No AGPL, SSPL or BUSL anywhere across 889 installed packages.** This is the finding that matters most for a hosted service: AGPL-3.0 treats network use as distribution and would otherwise oblige us to offer source to every user. Its absence is what makes the answer clean rather than qualified.
3. **No unlicensed or licence-unspecified packages** — usually the hardest category to clear, and there was nothing to clear.

### The four production-reachable packages that carry real conditions

| Package                           | Licence                              | Assessment                                                                                                                                                                                                                                                                                            |
| --------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@sentry/cli` (+ platform binary) | FSL-1.1-MIT                          | Not OSI open source — permits any use **except** competing with the licensor, converting to MIT after two years. Build-time CLI for source-map upload; never bundled, never distributed; a grant-writing tool competes with nothing Sentry sells. Dormant restriction.                                |
| `sharp`'s native binaries         | Apache-2.0 **AND LGPL-3.0-or-later** | Via `next`. LGPL obligations attach on **distribution** and require the component remain replaceable, not that the caller be opened. Separately invoked native modules; nothing distributed. **The one item a solicitor would most want named**, and first to re-check if the delivery model changes. |
| `jszip`                           | `(MIT OR GPL-3.0-or-later)`          | Dual-licensed; **MIT elected**, now recorded. Not academic — `jszip` genuinely ships, underpinning Word export (`docx`) and `.docx` extraction (`mammoth`).                                                                                                                                           |
| `caniuse-lite`                    | CC-BY-4.0                            | Browser-support **data**, not code. Build-time only. Ubiquitous.                                                                                                                                                                                                                                      |

Everything else with conditions is dev-only and confirmed unreachable in the production tree: `axe-core`/`@axe-core/react`, `lightningcss`, `@vercel/og`, all MPL-2.0 (file-level copyleft — we modify none of those files and none ships).

### What the conclusion depends on

**Grant Pathway being a hosted service does most of the work here**, because GPL and LGPL obligations attach to distributing software and nothing is distributed. The review names the triggers for re-running it: a change of delivery model (desktop, on-premise, a Docker image for third parties, publishing to npm), a move into a market that competes with Sentry, `jszip` dropping its MIT option, or any new AGPL/SSPL dependency. It also recommends treating an AGPL or SSPL package as a **decision** rather than a routine install, and records that `security-audit.yml` covers vulnerabilities, **not** licences — so nothing automated will catch a licence change. That gap is stated as accepted rather than left invisible.

### Two method points worth keeping

**`npm ci` was run first, and it mattered.** Ten packages were installed at versions not matching `package.json` — `next@16.2.11` against `^16.2.12`, `@sentry/nextjs@10.68.0` against `^10.69.0`, `@anthropic-ai/sdk@0.109.0` against `^0.115.0`, and seven more. This is **audit finding M7's lockfile drift, recurred**: it was cleared with `npm ci` on 2026-07-29 and drifted again, almost certainly on merging the grouped Dependabot PRs (#86/#87) afterwards. CI was unaffected (it runs `npm ci`), but local runs — including every check run earlier today — were not testing the pinned versions. **A licence review run before the resync would have described a dependency tree that neither CI nor production uses.** Worth noting that this drift is now a repeating condition rather than a one-off, and that merging a Dependabot PR leaves the local tree stale by design.

**No licence-checking tool was installed, deliberately.** Adding a dependency to `package.json` in order to audit `package.json` adds a supply-chain surface to answer a question the existing package metadata already answers. The method — read every installed package's declared `license`, then trace each non-permissive one with `npm ls <pkg> --omit=dev` to establish production reachability — is recorded in the artefact so it can be re-run identically.

**Limits stated in the artefact rather than glossed:** licence _texts_ were not read in full (the review trusts declared SPDX identifiers, the industry norm but occasionally wrong); no check that a package's declared licence matches its own `LICENSE` file; not a patent or trademark review; and not a review of the hosted **services** (Bedrock, Supabase, Vercel, Sentry, Upstash, Resend), which are governed by their own terms and tracked separately. **It is explicitly a technical review, not legal advice**, and does not substitute for the independent legal review still tracked in P5.1.

`ADR-TRACEABILITY.md` → v2.17 (GAP-20 and `ADR-STACK-005` both ✅), `IMPLEMENTATION-PLAN.md` P5.1 row marked done.

## 2026-07-30 — L7: `ADR-FILE-003` contradicted itself, in the section that is binding

The Consequences list required **two** extraction utilities — `lib/extract-pdf-text.ts` and `lib/extract-docx-text.ts`. The Decision section immediately above it has always specified a **single** wrapper, and the codebase has only ever contained `lib/extract-text.ts`. So the Decision and the implementation agreed; the Consequences list was wrong from the day it was written.

**Why this is not an ordinary inconsistency.** `AGENTS.md` §2 makes the Consequences section of every ADR mandatory pre-task reading and states plainly: _"These are binding requirements, not suggestions."_ A future session doing extraction work would therefore have been instructed to create two files that should not exist, and would have read the correct single-utility implementation as an unfinished gap — possibly "fixing" working code to match a wrong specification. Precisely the failure mode as `GAP-21` directing work at `/api/generate-draft` a month after it was deleted (finding **L2** above): the register or the ADR says one thing, the code says another, and the document is the one a session is told to trust.

Now a single bullet naming `lib/extract-text.ts` and marked built, with the correction and its reasoning recorded in place and in the ADR's Revision History.

**Sweep:** the two-utility claim appeared nowhere else in the repository — no other document, no stale import, no test. One instance only.

## 2026-07-30 — L6: MKCF flagship cited a guidelines file that has never existed

`MK-Community-Foundation-test-plan.md` cited `docs/Grant Org Guidelines/mkcf-oak-grants-criteria.pdf` in **two** places — the Overview and the "Guidelines — access before testing" section. No such file has ever existed. The real one is **`MK Comm oak-grants-criteria-final-nov-2025.pdf`**.

**The risk was the opposite of how the audit framed it, and worse.** The audit said a tester "cannot find the input document". But the access section read _"Obtain the MKCF Oak Grants criteria … and save to `…/mkcf-oak-grants-criteria.pdf` **if not already present**"_. A tester would not have been blocked — they would have concluded the file was absent, downloaded the **current** edition from MKCF, and saved a second copy under a different name. The repository copy is explicitly the **November 2025** edition, and every recorded MKCF result is measured against it, including the extracted question count, which has moved repeatedly across runs (10 → 12 → 16 on the paste path, 19 on the upload path). Testing against a silently newer edition would have invalidated every historical comparison with nothing visible to show it had happened — and on a flagship plan whose whole purpose is repeatable end-to-end coverage.

Both citations now name the existing file. The access section additionally forbids a fresh download and states what to do if the guidelines genuinely need refreshing: add the new edition alongside the old under a dated name, update the plan and its expected results, and record it in the Document History — never overwrite or substitute. Plan → v2.2.

**Sweep:** every guideline-file citation across all live test plans was checked. The other four resolve (`AB Trust Online-Application-Form-Guidance-July-2024-b.pdf`, `clothworkers-open-grants-guidance-and-sample-forms.pdf`, `garfield-weston-foundation-application-guidelines-2026.pdf`, `idlewild-arts-application-questions-dec2025.pdf`). This was the only broken one.

**`TEST-DASHBOARD.md` had it right all along** — its funder table cites the correct filename. So the right answer was sitting two documents away from the plan that got it wrong, which is the same propagation failure as the rest of this week's findings, just in the reverse direction: the correction never travelled _from_ the dashboard _to_ the plan. No dashboard change was needed and its status is unaffected.

**Incident during this fix, recorded because it is a real risk with the tooling and not a documentation point.** While amending the Document History, a Python one-liner of the form `open(path, "w").write(text)` raised a `UnicodeEncodeError` on an emoji escape sequence **after** the `"w"` mode had already truncated the file — leaving `MK-Community-Foundation-test-plan.md` at zero bytes. It was recovered immediately and completely with `git checkout --` on the uncommitted file, and the edits were redone through the normal editing tool. No committed content was ever at risk and nothing else was touched. The lesson is specific and worth keeping: **never write a file by chaining `.write()` onto `open(…, "w")` when the payload could raise** — build the full string first and write it in a separate statement, or use the editing tool, which never truncates on failure.

## 2026-07-30 — L4 and L5: the two documents that actually needed a Tier header

Done as one change, because L4's remainder and L5's actionable subset are the same fix on the same two files.

**L4 was already two-thirds resolved — by accident.** Of its three parts, the stale _"any affected **funder test plan** has been re-run"_ pre-deploy item (retired by `DR-TEST-001`) and the "still v1.1 / 15 June 2026" complaint were both cleared by the 2026-07-29 M2/M3 work, which took the checklist to v1.3. Only the missing `**Tier:**` header remained, exactly as that day's status note predicted.

**L5 said 147 of 174 live documents lack the header. It reads as 156 of 186 today** — not because anything regressed, but because the figure moves with every document added, which makes it a poor thing to track and worth not recording. The substance of L5 was always the small actionable subset, and the audit was right about that: the great majority of the 156 are correctly governed **by folder**, under `AGENTS.md`'s tier rules for DR/ADR/PDR/DDR records.

**The subset, verified rather than assumed:**

| Document                                           | Finding                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/PRD-Grant-Pathway.md`                        | Now **Tier 1**. `AGENTS.md` §3 has always listed it in the Tier 1 table — review after every task — but the document carried no header, so a reader coming to it directly had no way to know. Checked repo-wide: **it was the only document named in either of `AGENTS.md`'s tier tables that lacked one.** Every other Tier 1 and Tier 2 entry already had its header. |
| `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md` | Now **Tier 2**.                                                                                                                                                                                                                                                                                                                                                         |

**The audit was wrong about the second one, and the truth is worse.** L5 described both as "docs `AGENTS.md` names individually by tier that still have no header". `DEPLOYMENT-CHECKLIST.md` is **not named in `AGENTS.md` at all** — zero references, checked directly. So it was not a document whose header had merely been forgotten; it was governed by **nothing**: absent from every tier table and carrying no self-governing header, so no end-of-task checklist has ever pointed at it. That is the document an operator reads immediately before deploying to production, sitting outside the documentation discipline that governs everything else in the repository.

`AGENTS.md` was deliberately **not** modified. Its own §3 "Adding a new document" rule says _"No change to `AGENTS.md` is required — the tier header makes the doc self-governing"_, so the header is the complete fix, and using the project's existing mechanism is better than growing the governing file. Tier 2 rather than 1 because the document describes process rather than product state; **Volatility Medium rather than Low on the evidence** — it went v1.1 → v1.3 in five days. Also switched its `Last updated` to ISO format, which every other document uses.

`PRD-Grant-Pathway.md` → v0.64, `DEPLOYMENT-CHECKLIST.md` → v1.4.

## 2026-07-30 — L3: NFR-01's pre-launch recommendation resolved, and the real gap named

Audit finding **L3**: `non-functional-requirements.md` still carried _"**Pre-launch recommendation:** … Investigate document pre-processing or streaming responses before go-live"_, seven weeks after pre-processing shipped. Confirmed — `lib/preprocess-text.ts` exists (19KB), is wired into `/api/generate-summary`, and `GAP-30` was closed on 2026-06-07.

**The recommendation named two options and both are settled**, which is why "mark it done" would have been the wrong fix:

| Option                  | Status                                                                   |
| ----------------------- | ------------------------------------------------------------------------ |
| Document pre-processing | ✅ Built 2026-06-05 (`P5.PERF1`, `GAP-30` closed)                        |
| Streaming responses     | ➖ Deliberately deferred post-v1 as `FP-10` per `ADR-AI-010` — not a gap |

**The more useful half of this fix is what it exposes.** The performance evidence in NFR-01 — Clothworkers at 40–47s, Garfield Weston at 33–37s — was measured on **2026-06-04, the day before pre-processing existed.** Pre-processing was added specifically to create headroom against those numbers, and no timing run has happened since. So the document asserted a 45-second target on evidence gathered before the mitigation, while simultaneously implying the mitigation was still unbuilt — misleading in two directions at once.

The section now states the status of both options, carries a warning that the figures are a pre-mitigation baseline, and points at the `P5.5` measured-pass step that closes audit observation **O6**. The 2026-06-04 figures are explicitly reframed as a floor on performance rather than a description of it.

**Checked and deliberately not "corrected":** the character ceiling appears as **20,000** in `ADR-AI-010` and the traceability register, and as **50,000** in `IMPLEMENTATION-PLAN.md`'s `P5.PERF1`. Both are right — `DEFAULT_CHAR_CEILING = 20_000` is the code default and production overrides it to 50,000 via `PREPROCESS_CHAR_CEILING`, confirmed present in the Vercel Production environment. This looked like a discrepancy and is not one; a clarifying line now records why, so the next reader does not "fix" it.

**Sweep:** the stale recommendation existed in one live location only. Nothing else to correct.

## 2026-07-30 — L2: "all three AI routes" corrected in six places, and P5.0 told to sweep

**There are two AI routes:** `/api/generate-summary` and `/api/refine-answer`. `/api/generate-draft` was deleted on 2026-07-01 and is gone from the codebase entirely — `grep generate-draft` across `app/`, `lib/` and `actions/` returns nothing.

Audit finding **L2** flagged four locations still asserting three. Verified: **six** were stale, and one of the audit's four was already fixed.

| Location                                                  | What it said                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `technology-stack.md` TS-07                               | Upstash rate-limits "all three AI API routes… and the draft generation route"                           |
| **`ADR-TRACEABILITY.md`** — `ADR-OPS-005` consequence row | route tag in "`generate-summary` and `generate-draft`"                                                  |
| **`ADR-TRACEABILITY.md`** — `GAP-21` description          | "not implemented in `generate-summary` or `generate-draft`"                                             |
| `ADR-TRACEABILITY.md` — `GAP-27` note                     | "latency logging added to all three AI routes (2026-06-08)" — dated, so annotated rather than rewritten |
| `IMPLEMENTATION-PLAN.md` — Axiom log drains               | "log storage for all three AI routes"                                                                   |
| `PRD-Grant-Pathway.md` §10                                | "50 AI requests… across all three AI routes"                                                            |
| `non-functional-requirements.md`                          | "latency logging added to all three AI routes"                                                          |

**The two bolded rows are the ones that mattered.** They are ADR consequence entries — precisely what a session reads when performing the mandatory `AGENTS.md` §2 check before starting work. Whoever eventually builds `GAP-21` would have been instructed to add `Sentry.withScope` route tagging to a route that does not exist, and could reasonably have concluded the task was half-impossible or the register untrustworthy. The other four were cosmetic. `ADR-OPS-005`'s Task column was also moved to `P5.3b` to match the Phase 5 restructure.

**Already fixed, so removed from the finding:** the audit cited `DEPLOYMENT-CHECKLIST.md:82` ("draft prompt"). It is gone — yesterday's **M3** work replaced the feature-flag convention wholesale with the recovery-path convention and took that reference with it. Fixed as a side effect, not by intent.

**Deliberately left alone: dated statements that were true when written.** `ADR-SEC-005`'s history row recording the 20 → 50 cap raise "across all three AI routes (2026-06-17)", the `docs/Alan Knox Audits/` records, `ADR-AI-010`'s passage explicitly marked _"(Historical, pre-2026-05-28)"_, and every `CHANGELOG` and archive entry. Rewriting dated history to match today's code would be the wrong fix — it destroys the audit trail to tidy a sentence. Where such a statement sits in a live register (`GAP-27`), it is annotated with what is true now rather than altered.

**Why this survived a sweep that did happen.** The 2026-07-01 deletion was not careless — `CHANGELOG.md` that day records _"Documentation swept for every current (non-archived) reference to `/api/generate-draft`"_ and lists `future-phases.md`, `IMPLEMENTATION-PLAN.md` and six ADR files as corrected. It missed six places anyway, because it searched for the route **path** and these six describe the route by **count** ("three AI routes") or by **description** ("the draft generation route") without naming it. A sweep is only as good as the phrasings it looks for.

### `P5.0` amended: run it as a sweep, not a read-through

WJ's suggestion, and the evidence for it is now six instances deep. `P5.0` now carries an explicit method requirement: when a divergence is found, **grep the whole live documentation set for the same fact, path or claim, fix every instance in one pass, and record the sweep rather than only the fix.** A table in the task lists the six precedents:

| Instance                         | What happened                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Stale `business/…` paths         | Fixed locally 2026-07-10, again 2026-07-13, and **31 more survived in six documents** until today                     |
| Funder picker removal            | Reached the plan, BRD and test plans; never reached the personas document, which described a picker for six weeks     |
| "Production Sentry DSN is empty" | Corrected in reality, never in the archive — and the stale line then produced a **false Severe finding** in the audit |
| `✅` = tasked vs built           | Noticed for GAP-24; fifteen identical rows sat unexamined, six in the tables `AGENTS.md` §2 depends on                |
| `/api/generate-draft` deleted    | This finding — swept by path, missed by count                                                                         |
| "AI Grant Accelerator" retired   | Audit found one document; a sweep found six                                                                           |

In every case the first fix was correct and the sweep never happened. The task now states that **a finding is closed when the class is fixed, not the instance**, and that a deliberately bounded sweep must say so explicitly, because a silently partial fix reads as a complete one.

Documents: `technology-stack.md` → v1.11, `ADR-TRACEABILITY.md` → v2.16, `IMPLEMENTATION-PLAN.md` → v3.23, `PRD-Grant-Pathway.md` → v0.63, plus `non-functional-requirements.md` (no version field).

## 2026-07-30 — 31 stale documentation paths fixed across six documents

Follow-on from the L1 sweep below, done immediately at WJ's request ("otherwise it will get forgotten") rather than deferred to `P5.0`.

**What was wrong.** 31 backticked file paths across six live documents used a `business/…` prefix. **There is no `business/` directory inside the repository** — every one of them was dead. They are Related-Documents tables and cross-references, so the effect was that following any of them led nowhere.

| Document                                          | Paths fixed    |
| ------------------------------------------------- | -------------- |
| `docs/Business Design/DESIGN-DECISIONS-INDEX.md`  | 9              |
| `docs/Business Design/design-requirements.md`     | 8              |
| `docs/PRD inputs/PRD-INPUTS-INDEX.md`             | 6              |
| `docs/data-model.md`                              | 5 — **Tier 1** |
| `docs/information-architecture-and-navigation.md` | 2              |
| `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` | 1              |

(Plus three already fixed in `tone-and-voice-guide.md`, which is where the pattern was first noticed — 34 in total.)

**Why this was not a find-and-replace, and why it was done by hand.** WJ asked whether to delegate it. Three of the targets needed more than a prefix change, and a blind `business/` → `docs/` swap would have produced two brand-new broken paths and mangled two pieces of prose:

| Path as written                             | Correct target                                           | Why                                                                                 |
| ------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `business/BRD-Grant-Pathway-v1.md`          | `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md`  | File was **renamed** (2026-07-11) _and_ moved                                       |
| `business/technology-stack.md`              | `docs/Technical Decision and Design/technology-stack.md` | File **moved** into a subdirectory                                                  |
| `` `business/...` `` and `` `business/…` `` | left untouched                                           | Prose ellipses in changelog entries describing this very class of error — not paths |

Every rewritten target was then verified to exist on disk. All 31 resolve.

**A second stale-path pair found in the same sweep.** `information-architecture-and-navigation.md`'s legal-route rows cited `docs/terms-of-service.md` and `docs/privacy-policy.md` as "the authoritative source". Those root-level files were **deleted on 2026-06-22**. The routes actually read `docs/legal/terms-of-service-external.md` and `docs/legal/privacy-policy-external.md` — verified in `app/(public)/terms/page.tsx` and `app/(public)/privacy/page.tsx`, and true since the internal/external split of 2026-07-28. Both rows now name the file the page renders and explain its relationship to the authoritative `docs/legal/` source. Document → v1.9.

**The pattern worth naming, because it is now the third recorded instance.** This same class of error has been found and fixed locally twice before, and swept neither time:

- `PRD-Grant-Pathway.md:1502` — _"Paths corrected 2026-07-10. All entries below used a stale `business/...` prefix"_
- `IMPLEMENTATION-PLAN.md` v3.5 (2026-07-13) — _"Key References table paths corrected (all used a non-existent `business/` prefix)"_

Twice someone hit the wall, fixed the document in front of them, and stopped. That is the same failure mode as the funder-picker drift, the stale Sentry DSN note, and the tasked-vs-built tick: **a correction applied where it was noticed rather than where it applies.** `P5.0` exists for exactly this, and this is a good argument for it running as a sweep rather than a read-through.

**Why the audit's link scan did not catch any of it.** The scan checked markdown links and correctly reported none broken in live documents. These are backticked paths inside tables — text, not links. Worth recording as a genuine limitation of that check rather than treating the earlier "no broken links" result as wrong.

**Also noted, not fixed:** `data-model.md`'s Document History has the same ordering defect `technology-stack.md` had — 1.17 and 1.18 sit above an otherwise ascending 1.1→1.16 list — and the file carries no `**Version:**` header field at all, so its current version can only be read off the top of that table. Recorded in its v1.18 row for a future pass. `DESIGN-DECISIONS-INDEX.md`, `design-requirements.md` and `PRD-INPUTS-INDEX.md` have neither version fields nor history tables, so their changes are recorded here only.

## 2026-07-30 — L1: retired working title removed from six documents, not one

Audit finding **L1** said `technology-stack.md` was still titled _"Technology Stack — AI Grant Accelerator v1"_, and that its Document History was out of version order. Both confirmed. WJ's context: **"AI Grant Accelerator" was the project's internal working title before the rename to Grant Pathway**, and he was unable to rename the local working folder afterwards — which is exactly why the old name kept resurfacing in documents written against that folder.

WJ asked for a sweep for other references. **Six live documents carried the retired name, not one:**

| Document                                                 | Where                                          |
| -------------------------------------------------------- | ---------------------------------------------- |
| `docs/Technical Decision and Design/technology-stack.md` | Title (the one L1 found)                       |
| `docs/constraints-and-assumptions.md`                    | Title                                          |
| `docs/decisions/DECISIONS-INDEX.md`                      | Title                                          |
| `docs/user-personas-journeys-and-use-cases.md`           | Title                                          |
| `docs/vision-statement.md`                               | Title                                          |
| `docs/v1-out-of-scope.md`                                | Body — "version 1 of the AI Grant Accelerator" |

All six corrected. **Three remaining references are correct and were deliberately left:** `app-name-and-branding.md`'s "Working title (retired)" row (the record of the rename itself), the audit's own finding text, and the history entries describing this change. Archived copies under `docs/Old/` were not touched.

**Version-order fix.** `technology-stack.md`'s history listed 1.8 and 1.9 above 1.0 and then ran 1.0→1.7 ascending — new entries had been added to the top of an ascending table. Now descending, newest first. **Worth noting the repo has both conventions:** `IMPLEMENTATION-PLAN.md`, `ADR-TRACEABILITY.md` and the PDR/ADR records are descending, while `user-personas-journeys-and-use-cases.md` is ascending and internally consistent. Descending was chosen for `technology-stack.md` to match the high-traffic documents; the personas table was left ascending rather than reordered, because a document that is consistent with itself is not broken.

### Two further findings, both surfaced by the sweep rather than by the audit

**1. A live test plan hardcoded the author's full local OneDrive path.** `regression-test-plan.md` RT-14 step 4 instructed the tester to `cd` into the full `C:\Users\WJ\OneDrive - Rapidglobe Ltd\...` path. It surfaced here only because that path contains the old folder name. This violates `AGENTS.md` §4, which forbids exposing the full OneDrive path in documentation precisely because it is machine-specific — any other contributor following the step literally would `cd` into a directory that does not exist on their machine, and `DR-BM-002`'s succession assumption depends on these plans being followable by someone who is not WJ. Replaced with "the repository root — the directory containing `supabase/` and `package.json`". Plan → v2.11. No change to what the test actually does.

**2. `user-personas-journeys-and-use-cases.md` still describes the removed funder picker — flagged, not fixed.** Its v1.3 entry (2026-06-01) recorded UC-05 being updated _to_ the funder-directory model, and `DR-FD-001` v1.4 reversed that model on 2026-07-15: the picker was removed and Step 1 is free text again. Four places still describe a "searchable approved directory" and the "My funder isn't listed — request it" link — Journey 1 step 6, Journey 2 step 3, and UC-05 points 1 and 3. Raised with WJ and **carried into `P5.0`'s scope** rather than fixed inside a retitling change; the v1.3 history row is marked superseded so the drift is not invisible meanwhile. A good illustration of why P5.0 exists: the picker removal was propagated into the plan, the BRD and the test plans at the time, but not into this Tier 3 document.

### Follow-on: WJ asked whether `user-personas-journeys-and-use-cases.md` adds any value at all

A fair question, asked directly, and worth answering with evidence rather than an opinion. The answer differed by part.

**Parts 1 and 3 (personas, use cases) — yes, kept.** The personas are load-bearing and recently so: **`PDR-AI-008` (2026-07-15, two weeks before this review) cites Persona 1's lack of formal fundraising training as the reason the governance-fact fallback behaves as it does**, and `tone-and-voice-guide.md` uses both personas as the source for the product's writing voice — its §1 is written directly about Margaret and David. Neither reference is decorative. The overlap with BRD §2 is also smaller than it looks: the BRD covers target users demographically (income band, team size, technical literacy), the personas cover motivation and behaviour, and it is the second kind that informs product decisions.

**Part 2 (user journeys) — no, deleted.** 52 lines describing the five-step flow, which the product itself now defines and `PRD-Grant-Pathway.md` §7 specifies exactly. **A journey map is a pre-build instrument: it exists to decide what to build. Once the thing is built, it becomes a competing description that nobody updates.** Demonstrated precisely here — `DR-FD-001` v1.4 removed the funder picker on 2026-07-15, the change reached the plan, the BRD and the test plans, and did not reach this document, so two journeys went on describing a picker for six weeks. A pointer block now sits where Part 2 was, naming PRD §7, `acceptance-criteria.md` and the flagship test plans as the authorities on the flow, so anyone looking for journeys finds an answer at the place they look rather than nothing.

Deleting Part 2 removed two of the four stale picker references. The other two were in **UC-05** and were corrected in place, including its "Alternative Flows" entry — _"Funder not in directory → … **cannot proceed with an unlisted funder**"_. That gate no longer exists in any form: with free-text entry there is no such thing as an unlisted funder. Removing it was the substantive point of `DR-FD-001` v1.4, and it reflects the founding position that any funder's guidelines should be handled rather than a curated subset.

H1 retitled to "User Personas & Use Cases". **The filename deliberately keeps "journeys"** — nine documents reference this path, including `AGENTS.md`, and renaming a file for a section removal is more churn than value. A note at the top of the document says so.

Document → v1.5, 540 lines → 510.

### A systemic finding this exposed: 36 stale `business/…` paths across five live documents

`tone-and-voice-guide.md`'s Related Documents table pointed at three paths that **do not resolve** — `business/app-name-and-branding.md`, `business/user-personas-journeys-and-use-cases.md`, `business/PRD inputs/email-notifications.md`. All three live under `docs/`. There is no `business/` directory inside the repository at all. Corrected.

Sweeping for the same pattern found **36 further stale `business/…` references across five more live documents**:

| Document                                          | Count | Note                |
| ------------------------------------------------- | ----- | ------------------- |
| `docs/Business Design/DESIGN-DECISIONS-INDEX.md`  | 9     |                     |
| `docs/Business Design/design-requirements.md`     | 8     |                     |
| `docs/PRD inputs/PRD-INPUTS-INDEX.md`             | 6     |                     |
| `docs/data-model.md`                              | 5     | **Tier 1 document** |
| `docs/information-architecture-and-navigation.md` | 2     |                     |

**This exact class of error was found and fixed once before, in one document, and never swept.** `PRD-Grant-Pathway.md:1502` carries the note _"Paths corrected 2026-07-10. All entries below used a stale `business/...` prefix"_ — so on 2026-07-10 someone hit it, fixed that document, and stopped. The same shape as every other finding this week: corrected locally, never propagated.

**Why the audit's link scan missed all of it:** the scan checked markdown links and reported none broken in live documents, which was true. These are backticked paths inside tables — text, not links. Worth noting as a real limitation of that check rather than a gap in the finding.

Raised with WJ; scope beyond the L1 fix, so logged here and carried into `P5.0` rather than fixed inside a retitling change.

## 2026-07-30 — Phase 5 restructured: approved with amendments and applied

`phase-5-restructure-proposal-2026-07-29.md` walked section by section with WJ and **approved with amendments**. Applied in full: `IMPLEMENTATION-PLAN.md` → **v3.22**, `ADR-TRACEABILITY.md` → **v2.15**, both status documents corrected, proposal → v0.2 (now a record of the review, not the specification).

**Every claim in the proposal was re-verified against the code before being put to WJ**, and that found eight errors in the proposal itself — recorded in its new §8. Two mattered: **A3** overstated that `P5.5b` appeared nowhere in the status files (it appears in a Notes row; the substance — no task-table row, not named by the gate — held), and **P5.0's scope was wrong in a way that would have wasted a lot of time.**

**The four decisions.** Restructure **approved with amendments**; **`P5.5b` post-launch** with a condition (below); **Bedrock hard-stop IAM recorded as an accepted risk** — the per-user 50/month cap in `reserve_ai_slot` is the real control, and an IAM revocation would cut AI off mid-application for every user at once; **all in one pass, C2 included**.

**P5.0 — the new blocking task, and the story of its scope.** WJ challenged the six-document scope twice and was right twice. The **PRD** had been fully reviewed (Sections 1–15 + Appendix A + a cross-document sweep, v0.27 onward) and so had the **BRD** (Sections 1–10 in sequence, v0.8–0.49) — but **neither carries a completion flag**, so the only words describing the PRD's own review status were two "(in progress)" phrases written on day one and stale for thirty-odd versions. That is precisely why WJ believed work was outstanding when it was not. `data-model.md` and `acceptance-criteria.md` were both fully reviewed on 2026-07-13. The one genuinely unreviewed document is **`non-functional-requirements.md`** — no review entry in its history at all, and, unsurprisingly, where audit findings **L3** and **O6** both live. Revised scope: set the missing flags, cover the only two never-named sections (PRD §2, BRD §11), delta-check three documents against Phase 6, one real pass over the NFRs. Several sessions became roughly one. **The failure mode this task exists to prevent is not an unreviewed document — it is a reviewed document that does not say so.**

**P5.3 split.** Of its nine bullets, six were unbuilt ADR/PDR **code** changes filed under an "Accessibility" heading, where a WCAG audit could have signed them off without ever touching them. They now form **P5.3b**, **ordered by risk rather than GAP number**: GAP-25 first (Zod absent from two of the three files in `actions/` — a security gap, not polish), then GAP-31 (needs a migration, so it must precede P5.4's production push or that push happens twice), GAP-22, GAP-21 (do it with P5.4's Sentry work), and GAP-23 flagged as the only one where nothing is actually wrong. P5.3 keeps genuine accessibility work plus GAP-05's viewport banner.

**P5.4 gained an exit test.** The task is complete when the **`Schema Drift Check` workflow is green and staying green** — not when its checklist is ticked. It had been red on every daily run since 2026-07-06. Also added: the four items recorded elsewhere as belonging to P5.4 but never tasked — **the Supabase production redirect-URL allowlist above all, which silently breaks email verification, and therefore registration, for every user on day one** — plus audit **O11** (`SENTRY_AUTH_TOKEN` absent: no releases, minified production stack traces) and **O12** (`onRouterTransitionStart`). Neither O11 nor O12 was actually in the proposal's §2.5, despite O11 asserting it was.

**P5.5 rewritten around `TEST-DASHBOARD.md`**, executed against **production**, with the point stated plainly: **every 🟢 earned to date was earned against dev.** Two factual errors removed from the old bullet list — "draft generation within 60 seconds" (that route was deleted 2026-07-01) and "summary within 30 seconds" when NFR-01's real target is 45s for large documents, so as written P5.5 would have failed a run NFR-01 says passes. **The proposed MKCF question-count re-baseline was dropped:** that plan already carries 15, 16 and 19 in different places, so "12" would have been the next stale number. Counts become "observed N on \<date\>", with the assertion living in the pre-deploy prompt-change check added under M3 — otherwise every prompt fix silently invalidates a flagship plan, which is the drift `DR-TEST-001` was created to end.

**`P5.5b` post-launch — and WJ's condition, which found three latent defects.** The dashboard is internal, read-only and has no user-facing impact; it also reads across every charity's data with the **service-role key**, deliberately bypassing RLS, which is the last thing worth building under launch pressure. WJ's condition was that day-one statistics must not depend on it. New **`supabase/queries/operator-statistics.sql`** holds ten read-only queries — every dashboard panel plus feedback opt-ins and the application-status funnel — and **all ten were executed against `grant-pathway-dev` before being committed.** Testing them rather than transcribing them found that **three of P5.5b's eight specified queries reference columns that do not exist** and would each have errored on first run: `last_sign_in_at` and `email` are on `auth.users`, not `user_profiles` (the latter deliberately so — the D11 resolution, recorded in the initial schema migration), and `ai_usage_log`'s column is `request_type`, not `route`. All three corrected in the spec in place.

**C2 — a tick now means one thing.** `ADR-TRACEABILITY.md` gains a **status-symbol key**, and **sixteen rows were reclassified ✅ → 📋 "tasked only, not built"**: ten in the Gaps register and six in the **ADR consequence tables**. The ADR half is the more serious half — those rows are what a session reads when performing the mandatory `AGENTS.md` §2 consequences check, so a ✅ there actively asserted that a consequence was discharged when no code existed. Implemented as a new symbol rather than a new column because the register already uses ➖ for accepted deviations, so this extends a convention instead of re-fitting 37 already-enormous rows. The step that was missing — **📋 → ✅ when the code actually lands** — is now written into "How to use". **GAP-20's status cell was populated for the first time**; it had been entirely empty since 2026-05-20, the only such row, which is how a task nobody had started stayed invisible for ten weeks (audit **L8**).

**C4 — the Phase 4 → Phase 5 gate row is annotated, not rewritten.** It lists nine gaps as "resolved" when only GAP-26 was built at the time. The sign-off stands as an audit record; the annotation states what it did confirm (nothing unaccounted for) and what it never claimed (that the code existed). Count corrected from six unbuilt to **five**, GAP-24 having been built earlier the same day.

**Also arising, agreed with WJ:** a **separate `accessibility-test-plan.md`** as a seventh test layer and P5.3's output artefact — `ADR-OPS-006` mandates a manual keyboard/focus/screen-reader/contrast pass before every release and **no plan executed it for the product flow**; the only accessibility case anywhere was HT-05, scoped to tooltips, and that single narrow keyboard step is what found `GAP-38` (three of nine tooltips unreachable by keyboard, a real shipped WCAG 2.1.1 failure). The **NVDA/VoiceOver deferral was narrowed to formal sign-off only** — it had come to mean no screen-reader testing at all pending an engagement. `ADR-OPS-006`'s manual list is also WCAG **2.1**-shaped while P5.3 targets **2.2 AA**, and the 2.2-specific criteria land on features already built and tested by nothing: Consistent Help, Accessible Authentication, Redundant Entry, Focus Appearance, Target Size.

**Two smaller sequencing fixes:** the `v1.0.0` tag moved from P5.4 to the end of **P5.6** (as written it would have tagged the release before the DNS cutover, i.e. before the service was live), and P5.6 now carries the real DNS values plus a verification step that **the apex serves the application rather than merely returning `200`** — a registrar parking page already returned `200` once, on 2026-07-29, and read as success.

**Not changed, deliberately:** the launch decision, the Phase 6 gate itself, and every existing decision. No new features. WJ's own observation that the documentation set may be outsized for the service is agreed and deliberately **not** folded in here — it deserves its own decision once the audit is closed out.

---

## 2026-07-30 — GAP-24 built: the export disclaimer no longer claims accuracy has been checked

Pulled forward out of `P5.3` and fixed immediately, ahead of the rest of the Phase 5 walkthrough, because it is user-facing, it goes to a third party, and it is one line.

**What was wrong.** Every Word and plain-text export ended:

> _"Disclaimer: This application was prepared with AI assistance and reviewed by {name}. All content has been checked for accuracy before submission."_

Nothing in Grant Pathway checks accuracy. The service was therefore asserting a completed accuracy check **in the user's name, on the deliverable, to the funder**. `PDR-DH-003` had always specified the correct alternative — _"Please review carefully before submitting to the funder."_ — which states the user's responsibility rather than claiming a check that never happened.

**What changed, and in which direction.** The two sentences moved opposite ways, which is the part worth recording:

| Sentence                                                                                                            | Direction                  | Reason                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Second — "All content has been checked for accuracy…"                                                               | **Code moved to the spec** | This was the defect. Now reads `PDR-DH-003`'s "Please review carefully before submitting to the funder."                                                                                                                                                |
| First — "This **application** was **prepared** with AI assistance…" (spec said "This **draft** was **generated**…") | **Spec moved to the code** | Not a defect, only a difference. The built wording was a deliberate 2026-06-01 change made to match the Step 5 confirmation checkbox the user actually ticks. Reverting it would have undone a consistency fix to close a gap that was not the problem. |

Final wording, both formats: _"Disclaimer: This application was prepared with AI assistance and reviewed by {name}. Please review carefully before submitting to the funder."_

**Scope.** A single `disclaimer` constant in `app/api/export/[applicationId]/route.ts` feeds both the `.docx` and `.txt` exports, so one edit covered both. The Step 5 confirmation checkbox ("I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted") is untouched and was never the problem — there the **user** makes the statement about themselves, which is exactly right. No document pinned the exact disclaimer string except `PDR-DH-003`; the PRD and `acceptance-criteria.md` describe it generically ("an AI disclaimer"), and both flagship test plans say only "AI disclaimer present and correctly worded", so no test plan needed amending.

**The wider point this exposed — `✅` in the GAP register means two different things.** GAP-24's status read `✅ 2026-06-16 — disclaimer wording fix step added to P5.3`. That tick meant _a task was written_. Two rows away, GAP-26's `✅ Resolved 2026-06-15 (commit 372d95b)` means _the code exists_. Same column, same symbol, opposite claims. **Verified 2026-07-30: GAP-21, GAP-22, GAP-23, GAP-25 and GAP-31 all still carry the "tasked" form of ✅ and are all still unbuilt** — no `setTag('route'` in `app/`, no `timeout=true` anywhere, no `loading.tsx` files, Zod imported only by `actions/charity.ts`, and `last_inactivity_warned_at` absent from `supabase/`. The **Phase 4 → Phase 5 gate sign-off** (2026-05-22, signed WJ 2026-06-17) lists nine gaps as resolved, six of which are these unbuilt code changes: the gate was signed on a statement that was true as written and false as read. This is finding §2.2 of `phase-5-restructure-proposal-2026-07-29.md`; its item **C2** (separate "tasked" from "built" in the register) is **not yet approved**, so the column structure is unchanged and GAP-24's row now simply says **BUILT** in words.

**Verification:** `npm run type-check`, `npm run lint` and `npm test` (101 tests) all pass. **Not browser-verified** — confirming the rendered text needs an authenticated session with an application through to Step 5 and an actual export; worth eyeballing on the next flagship test run, where both plans already have a "disclaimer present and correctly worded" step.

**Documents updated:** `PDR-DH-003` (spec row + revision history), `ADR-TRACEABILITY.md` v2.14 (GAP-24 row → BUILT, with the tick-ambiguity note), `IMPLEMENTATION-PLAN.md` (P5.3 bullet struck through as done).

---

## 2026-07-29 — Phase 5 reviewed and found not to hang together; restructure proposed, not yet applied

WJ asked for a review of Phase 5 "given your knowledge of the service", and specifically whether the plan should contain a comparison of the built service against the BRD, PRD, technical design and acceptance criteria. It should, and does not. Full findings and the proposed structure: **`docs/Implementation Plan/phase-5-restructure-proposal-2026-07-29.md`** (awaiting WJ's approval — **no change has been made to `IMPLEMENTATION-PLAN.md` or either status document**).

The three structural problems, each verified against code, schema or documents rather than inferred:

1. **The status accounting misstates the position.** `IMPLEMENTATION-STATUS.md` says Phase 0–5 is "all complete, 97 tasks"; the archive says Phase 5 is 13 tasks / 7 done with P5.1–P5.6 each "Not started". Six of those seven "done" are the funder-directory tasks reversed on 2026-07-15 (`DR-FD-001` v1.4). Phase 5's real progress is one task — `P5.PERF1`.
2. **`P5.3` is headed "Accessibility" but seven of its bullets are not accessibility work** — GAP-05/21/22/23/24/25/31 are code changes derived from ADRs and PDRs, and **none of the seven is built**. The most consequential is **GAP-24**: every Word export still tells the funder "All content has been checked for accuracy before submission", a claim the app cannot make in the user's name. `PDR-DH-003` specifies different wording. One line in `app/api/export/[applicationId]/route.ts`.
3. **`P5.5` "Final Testing" predates Phase 6** — no coverage of citations, governance facts, the item graph, reuse-previous-application or the eligibility hard-stop, and it competes with the layer structure `DR-TEST-001` put in `TEST-DASHBOARD.md`.

**A related defect in how gaps are recorded, worth its own note.** `ADR-TRACEABILITY.md` marks GAP-21 to GAP-25 `✅ … step added to P5.3 in IMPLEMENTATION-PLAN.md` — meaning **a task was written**. Two rows away, GAP-26's `✅ Resolved (commit 372d95b)` means **the code exists**. One symbol, one column, two meanings. The consequence is not hypothetical: the **Phase 4 → Phase 5 gate sign-off** (2026-06-17) reads "GAP-05/12/17/21/22/23/24/25/26 resolved", and six of those nine are unbuilt. The proposal recommends splitting the column rather than rewriting a signed sign-off.

The proposal's headline addition is a new blocking **`P5.0` — requirements reconciliation**: one pass per requirement document against the built service, output to a dated register with every divergence dispositioned fix / amend-doc / accept, sequenced **before** `P5.5` so final testing tests the agreed specification. The justification is empirical — five instances of doc-vs-build drift were found this month (Stony Stratford, `DR-FD-001`, `DR-TEST-001`, GAP-33, the Opus audit) and every one was found by accident while doing something else.

---

## 2026-07-29 — Dependency updates merged; TypeScript 7 and ESLint 10 deliberately deferred

First output of the morning's `dependabot.yml` grouping rewrite, and it behaved as designed — minors and patches batched, majors left standalone so breakage stays isolated.

**Merged** (both squashed, all four required checks plus the Vercel preview green):

- **#86** `production-minor-patch`, 8 updates — Next 16.2.10 → 16.2.12, `@anthropic-ai/sdk` 0.109 → 0.115, `@sentry/nextjs` 10.68 → 10.69, `@supabase/ssr` 0.12.1 → 0.12.4, plus `lucide-react`, `shadcn`, `unpdf`
- **#87** `development-minor-patch`, 4 updates — `eslint-config-next` 16.2.10 → 16.2.12, `prettier` 3.9.2 → 3.9.6, `vitest` 4.1.9 → 4.1.10

**Deferred and then closed, both blocked upstream by `eslint-config-next` / Next itself, not by our code.** They were first left open, then closed later the same evening — see the note below on why the position changed.

- **#88 `typescript` 6.0.3 → 7.0.2.** CI fails with `typescript-eslint does not support TS 7.0` (`eslint-config-next@16.2.x` pins `typescript-eslint@^8`, peer range `>=4.8.4 <6.1.0`). The Vercel preview fails separately and more tellingly: Turbopack compiles fine, then **Next 16.2.11's own TypeScript step cannot load TS 7** and reports it as not installed.
- **#79 `eslint` 9.39.4 → 10.8.0.** Unchanged since 2026-07-20 — `eslint-plugin-react` inside `eslint-config-next` throws under ESLint 10's new API.

Consistent with WJ's 2026-07-20 decision on the ESLint major: wait for upstream rather than pin or override transitive dependencies.

**Both PRs were then closed the same evening, and the reason is worth recording.** They were initially left open. WJ then spotted two further red deployment rows and asked about them — they turned out to be **the same PR (#88) rebuilt twice**, because Dependabot re-bases and rebuilds an open PR on every merge to `master`. Left open, these two would have generated a red row on every future merge indefinitely. That is precisely the desensitisation failure **M2** (a permanently-red CI job masking real failures) and **M7** (a permanently-full PR queue that stopped carrying information) were both about, so leaving them open would have re-created the problem the day it was fixed. Closing costs nothing: Dependabot does not re-raise a PR for a version it has already had closed, but does raise a fresh one for the next release — by which time upstream should have caught up. Rationale is recorded on both closed PRs as well as here.

**A trap found while checking, worth keeping.** The Vercel preview on the **ESLint 10** branch is **green**, which reads as "the incompatibility is fixed". It is not: `next build` does not run ESLint, so a passing Vercel deployment says nothing about the upgrade. Only CI's `lint-and-typecheck` exercises it, and that is still red on the original `contextOrFilename.getFilename is not a function` error. Do not treat a green preview badge on a lint-related dependency PR as evidence.

**A red Vercel preview on a deferred major-version PR is expected and is not a production signal.**

**Two process notes worth keeping.** Branch protection refused the first merge attempt — `strict: true` requires the head branch be current with `master`, which had moved. The branch was rebased and re-checked rather than forced through with `--admin`; this was the first live exercise of the protection configured earlier the same day. Separately, #87 then hit a `package-lock.json` rebase conflict against the newly-merged #86, resolved by asking Dependabot to regenerate the lockfile rather than hand-merging it — a hand-merged lockfile can yield a dependency tree that nothing has tested.

---

## 2026-07-29 — Step 4 now tells the user when a save or action could not reach the server (Opus audit M8, second half)

M8's first half (enabling Vercel Skew Protection) was closed earlier today. This is the second and more important half: **the failure was silent.**

The Server Actions in `actions/` already return `{ ok, error }` result objects for expected errors, and Step 4 surfaces those correctly. The gap was the other category — the action call failing _before any result comes back_, where the HTTP request succeeds but the response is not a parseable Server Action payload, so the promise rejects with "An unexpected response was received from the server." Two causes, both observed: version skew (a deployment landing while the page is open) and session expiry (the 60-minute timeout, where the request is redirected to sign-in and React receives HTML).

None of Step 4's handlers caught that. `handleApprove`, `handleAddManualGovernanceItems`, `handleReadyToAssemble` and `handleManualContinue` all awaited their action with no `try`/`catch`, so the rejection escaped to `window.onunhandledrejection` — Sentry recorded it (`GRANT-PATHWAY-6`, 8 events over three weeks, **88% of them on Step 4**) but the user saw nothing: the button simply stopped, with no error, no retry prompt, and no indication anything had failed.

**Worst of all was `doSave`.** It _did_ have a `try`/`catch`, but the catch was empty, commented `// silent — blur will retry on next edit`. The reasoning was sound for a transient failure — and wrong for these two causes, where every retry fails too. A user could keep writing for a long stretch, watching "Saving…" appear and disappear, believing their work was safe while nothing was persisting.

**What changed:**

- **New `lib/action-error.ts`** holding the two user-facing messages, with the reasoning and the Sentry evidence recorded alongside them. The two causes are not reliably distinguishable from the client, so the copy covers both and leads with the recovery action.
- **`doSave` now surfaces failure** via a sticky `role="alert"` banner in the progress bar: "**Not saved.** This answer could not be saved. The app may have been updated, or your session may have timed out. Your text is still on screen — copy it if you want to be safe, then reload the page and sign in again if asked." with a **Reload now** button. It sits in the sticky bar deliberately — that is where the user already looks for save state, and being sticky it cannot be scrolled past while they carry on typing. It clears automatically when any later save succeeds.
- **The other four handlers now catch** and route to their existing inline error slots with the shorter "We could not reach the server… your answers are safe" message. No new UI was needed for these; the slots already existed for result-object errors.
- Telling the user the text is still on screen is deliberate: the answer is not lost, and they can copy it before reloading.

**Documentation, per the Tier 1 checklist:** `PRD-Grant-Pathway.md` Section 7 Screen 7 Step 4 gains an error-state row (v0.62), kept distinct from the existing "API failure" row, which covers the AI routes returning an error rather than an action failing to return at all. `acceptance-criteria.md` gains **AC-FR-18-04**, which also records why this is a deliberate exception to AC-FR-18-02's "background saves are silent, with no visible indicator" rule: silence remains correct for saves that _succeed_, since there is nothing to act on, but it should never have extended to failures.

`npm run type-check`, `npm run lint` and all 101 tests pass. **Not yet verified in the browser** — reproducing it needs an authenticated Step 4 session plus a forced transport failure. Quickest live check: open Step 4, type into an answer, set the browser's network to offline in devtools, click away to trigger the blur save, and confirm the banner appears; then go back online and confirm the next successful save clears it.

Scope note: only Step 4 was changed, matching the audit's recommendation and where 88% of the observed events occurred. The same pattern exists in other components that call Server Actions without a `try`/`catch`, and is worth a sweep post-launch.

---

## 2026-07-29 — Dependabot switched to weekly grouped updates; lockfile drift resolved; audit's PR count corrected (Opus audit M7, O8)

**First, a correction to the audit itself.** M7 claimed "twenty Dependabot PRs are open on `origin`, several already superseded," citing duplicate `next` and `lucide-react` bumps. That count was wrong. Five are open (#79, #81, #82, #84, #85), none superseded — each is a distinct package at its latest version. `.github/dependabot.yml` sets `open-pull-requests-limit: 5` per ecosystem, so a twenty-PR npm backlog was never possible. The superseded PRs the finding described were real, but had already been closed on 24–27 July, before the audit ran: #83 (`eslint-config-next` 16.2.11), #80 (`react-dom`), #72 (`eslint-config-next` 16.2.10), and #70 (`eslint` 10.7.0, itself superseded by #79 at 10.8.0). Dependabot closes its own PRs when it opens a newer bump for the same package, so the backlog had largely cleared itself. The audit report's M7 has been corrected in place.

**The queue did have a real problem, just not the one described.** `interval: 'daily'` with **no grouping** kept it pinned at the five-PR limit with one package per PR — so the queue stopped carrying information, the same desensitisation pattern as the permanently-red `audit` job in M2. Revised to `weekly` (Mondays) with grouping: routine production minor/patch bumps arrive as one PR, routine devDependency minor/patch bumps as another, so ordinary maintenance is two PRs a week instead of a rolling stream. **Major bumps are deliberately left ungrouped** so each arrives with its own changelog to read — the deferred ESLint 10 upgrade is the standing example, and it should stay visible as one identifiable PR rather than being buried in a batch. GitHub Actions updates also moved to weekly and grouped.

**Lockfile drift resolved.** `npm ls react` reported `react@19.2.7 deduped invalid: "19.2.8" from the root project` — the lockfile correctly pinned 19.2.8 while the installed tree had 19.2.7, so local runs were not testing the pinned versions (CI was unaffected, since it runs `npm ci`). Fixed by running `npm ci`; `react@19.2.8` now resolves consistently throughout the tree.

**Stale local branches deleted (audit observation O8).** `dependabot/npm_and_yarn/prettier-3.8.4` and `dependabot/npm_and_yarn/typescript-6.0.3` existed locally, both superseded by what `package.json` already declares (`prettier ^3.9.2`, `typescript ^6`). Removed; `master` is now the only local branch.

The five open PRs were left open — none is superseded, so there is nothing to close. ESLint 10 (#79) remains deferred as previously decided.

---

## 2026-07-29 — GAP-11 closed as an accepted deviation; dead ruleset deleted (Opus audit M6)

**Admin enforcement was considered and deliberately rejected, on a mechanical ground rather than a preference.** With the M2 fix in place the required checks are the three real jobs and they are green, so `enforce_admins: true` had become technically possible for the first time. It is still the wrong choice here: **required status checks are evaluated against the commit being pushed, but the checks only run after the push.** A direct push can therefore never satisfy them — which is exactly what the bypass message on earlier pushes was reporting (`4 of 4 required status checks are expected`, i.e. not yet reported). Turning on admin enforcement would not have tightened direct pushes; it would have **blocked them outright**, forcing a pull-request workflow in which the sole developer approves their own PRs. That adds process without adding a reviewer, and it contradicts `AGENTS.md` §5's instruction to push to `origin master` immediately after committing. WJ's decision: accept the exemption and document it.

**GAP-11's recorded status was wrong on both counts and has been rewritten.** It claimed branch protection "requires GitHub Pro for private repos" — untrue; classic protection is live on `master` with the three CI contexts required, `strict` mode on, and force-pushes and branch deletion blocked. And its workaround, "team enforces PR review manually," described a process that neither happens nor is required: there is no team, and no PR-review requirement exists. All three GAP-11 rows also referred to branch `main`; the branch is `master`. Status changed from 🔴 BLOCKED to ➖ accepted deviation, matching the register's existing convention for GAP-15/GAP-16, with the residual risk stated plainly — nothing prevents an unreviewed commit reaching production, and Vercel deploys independently of CI — alongside the mitigations actually relied on: the pre-deploy checklist, Vercel instant rollback, `AI_ENABLED`, and CI now being genuinely green so a real failure is visible. Flagged to revisit if a second contributor joins, at which point enforcement plus review stops being ceremonial.

**Dead configuration deleted.** The repository ruleset "Protect Master" (id `16804175`, created 2026-05-24, `enforcement: "disabled"`) had no effect and appeared to be the abandoned first attempt GAP-11 recorded as blocked. Deleted via the API so it cannot later be mistaken for live protection. The repository now has no rulesets; classic branch protection is the only mechanism, which removes the ambiguity of having both.

`ADR-OPS-002` and `ADR-STACK-005` consequence rows updated to ✅ with their stale wording corrected. `ADR-TRACEABILITY.md` bumped to v2.13.

---

## 2026-07-29 — M5 verified live; Skew Protection confirmed active; production accidentally rolled back and restored

**Deployment incident, worth recording because the cause is a trap.** While setting `NEXT_PUBLIC_SITE_URL` on production, `vercel redeploy <old-deployment-url>` was used to pick up the new variable. That command **re-deploys the source of the deployment you name** — and the URL taken from the top of `vercel ls --prod` was an older deployment. The result aliased production back to commit `6de08b6` (2026-07-28), **16 commits behind `master`**, silently undoing every change made earlier the same day in production — including the `app/mockup/` deletion, so the publicly reachable mock-up briefly returned.

Caught within minutes by checking the live `APP_VERSION`, which read `2026.07.29-6de08b6` instead of the expected `11feffc`. Fixed with `vercel deploy --prod` from a clean tree at `11feffc`. **The lesson for next time: to pick up an environment-variable change, deploy the current commit — do not `vercel redeploy` an arbitrary URL from `vercel ls`, which is a rollback dressed as a refresh.** Note also that `robots.ts` and `sitemap.ts` are statically prerendered, so an environment-variable change only takes effect on a **new build**; redeploying an existing build would not have applied it regardless.

**M5 then verified live** against `grant-pathway-three.vercel.app`:

| Check          | Result                                                               |
| -------------- | -------------------------------------------------------------------- |
| `APP_VERSION`  | `2026.07.29-11feffc` — current `master`                              |
| `/robots.txt`  | `User-Agent: *` / `Disallow: /` — indexing correctly blocked         |
| `/sitemap.xml` | URLs now `https://grant-pathway-three.vercel.app/…` from the env var |
| `/mockup`      | **404** — S3 confirmed gone from production                          |

`NEXT_PUBLIC_SITE_URL` was added via the CLI as **non-sensitive** (`--no-sensitive`). It was created as Sensitive by default, which is wrong for a `NEXT_PUBLIC_` value — that content is inlined into the client bundle and is public by definition — and marking it Sensitive blocks `vercel env pull`, worsening the existing local-development problem where none of the eight required secrets can be retrieved. Removed and re-added.

**Skew Protection (audit M8) confirmed active.** WJ enabled it at a 12-hour maximum age. Verified in production: every asset URL carries a deployment-pinning parameter, e.g. `?dpl=dpl_FGoKRGXkqQzQ4CkdN4KJCmysDHQc`. **The verification method matters** — an earlier check looked for a `__vdpl` cookie and found none, and that was the wrong signal: Next.js on Vercel pins the deployment ID into asset requests rather than setting that cookie, so the cookie's absence proves nothing. The audit report's M8 has been corrected accordingly. Twelve hours is sufficient because the exposure window is bounded by the 60-minute session timeout, not by tab lifetime — an idle tab becomes a signed-out tab, and signing back in loads the current build. That reasoning depends on `D-013` (fixed 2026-07-28) having restored the sign-out.

M8's second half — surfacing Server Action failures to the user instead of letting them reach the global unhandled-rejection handler — remains open.

---

## 2026-07-29 — Public base URL made environment-driven; indexing now opt-in (Opus audit M5)

`https://grantpathway.org.uk` was hardcoded in nine places while the domain did not serve the app. Checked directly today, and the position is worse than "DNS not pointed yet":

- The domain **is** attached to the `grant-pathway` Vercel project (both apex and `www`), but its nameservers are still the registrar's (`ns39`/`ns40.domaincontrol.com`). Vercel reports the domain as **not configured properly** and asks for `A grantpathway.org.uk 76.76.21.21`, or the nameservers moved to `ns1`/`ns2.vercel-dns.com`.
- `https://grantpathway.org.uk` returns HTTP `200` — but from `76.223.67.189`, serving a **registrar parking page**, not the app. It contains no `APP_VERSION`, whereas `grant-pathway-three.vercel.app` correctly serves `2026.07.29-0b8bdf9`. A `200` here is misleading: it looks alive and is not the product.
- `www.grantpathway.org.uk` does not resolve at all.

So the live consequence was real rather than theoretical: the three transactional emails that link to the domain — inactivity warning, and both account-deletion confirmations — have been sending users to a parking page, and `sitemap.xml` advertised five URLs that do not reach the app. (A note in this changelog dated 2026-07-28 said the domain "already points at `grant-pathway-dev`"; that is not correct, and the DNS check above supersedes it.)

**Fix — one new module, `lib/site-url.ts`, exporting two values:**

- **`SITE_URL`** — the public origin, from `NEXT_PUBLIC_SITE_URL`, defaulting to `https://grantpathway.org.uk` and stripped of any trailing slash. Now used by `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx` (`metadataBase` and the OpenGraph `url`) and all three emails. The cutover is now one environment variable instead of edits in nine files. The truthiness check is deliberate rather than `??`: `vercel env pull` writes an _empty string_ for an unset variable, which `??` would not catch — the same trap already documented in `next.config.ts` for `VERCEL_GIT_COMMIT_SHA`.
- **`ALLOW_INDEXING`** — from `NEXT_PUBLIC_ALLOW_INDEXING`, and **opt-in**: unless it is exactly `'true'`, `robots.ts` returns `disallow: '/'` for all user agents. Previously `robots.ts` had `allow: '/'` unconditionally, so the pre-launch `vercel.app` host and every preview deployment were indexable. Safe-by-default was chosen over "disallow until launch, then remember to change it" precisely because the second form relies on remembering.

Both variables documented in `.env.example`. `README.md` gains a short domain-status note so the `vercel.app`-only reality is visible to anyone starting from the readme, and its tech-stack Domain row is qualified.

**Two things deliberately left hardcoded.** The Resend sender address `noreply@grantpathway.org.uk` in `lib/emails/send.ts` — that is a verified sending identity tied to DKIM records at the registrar, not a link, and it works today. And the Word-export footer "Prepared using Grant Pathway v… — grantpathway.org.uk" — a printed brand line, where substituting a `localhost` or `vercel.app` origin during development would make exports look wrong for no gain.

`npm run type-check`, `npm run lint` and all 101 tests pass. **Still requires WJ:** the DNS change at the registrar, then `NEXT_PUBLIC_ALLOW_INDEXING=true` on production at launch. Until then, consider setting `NEXT_PUBLIC_SITE_URL=https://grant-pathway-three.vercel.app` in Vercel so email links reach the running app.

---

## 2026-07-29 — CI moved to Node 24 to match production; `engines` field added (Opus audit M4)

`ci.yml` pinned `node-version: '20'`. **Node 20 reached end-of-life on 30 April 2026**, so it receives no further security patches — but the more consequential problem was a mismatch nobody had checked. `vercel project inspect` shows the production project runs **Node 24.x**, and local development is on **v24.14.1**. CI was therefore the only place in the whole setup running Node 20 — the one place whose entire job is catching mistakes before they reach users. A regression that manifests only on 24 would have passed CI and broken production; a syntax feature working locally and in production but not on 20 would have failed CI spuriously. Either way a green tick meant "works on an obsolete version," not "works on the version users hit."

The audit's original recommendation was Node 22 or 24. Once the Vercel setting was confirmed as 24.x, **24 became the only sensible choice** — picking 22 would have left a smaller version of the same mismatch.

Changes:

- `node-version: '20'` → `'24'` in `ci.yml` (both Node jobs) and `security-audit.yml`
- **`"engines": { "node": ">=24" }` added to `package.json`.** There was no `engines` field at all, so nothing anywhere declared a Node requirement and each environment simply chose for itself — which is how three different answers arose. This also has a practical effect beyond documentation: Vercel reads `engines.node` when selecting a runtime, so the production Node version is now pinned in version-controlled code rather than existing only as a dashboard setting nobody had looked at.
- `README.md` prerequisite corrected from **"Node.js 18+"** — which was below the installed Next 16.2.11's own declared `>=20.9.0`, so anyone following the README with Node 18 would have produced a build that could not run. This mattered more than it looks: `DR-BM-002` (succession plan) assumes a future maintainer can follow the documentation.
- Same correction applied to `IMPLEMENTATION-PLAN.md` ("Node.js 20+" prerequisite) and `technical-design.md` ("Node.js 20+").
- `ADR-OPS-008`'s illustrative `ci.yml` snippet updated to `'24'`, with a correction note recording two further ways it had drifted from reality: it shows one job where three now gate, and its "before Vercel begins its build" claim was never true (see M2). The decision the ADR records is unchanged — only stale factual detail.

`npm run type-check`, `npm run lint` and all 101 tests pass after the change.

---

## 2026-07-29 — Feature-flag rule replaced with a recovery-path rule, `AI_ENABLED` documented, prompt-regression check added (Opus audit M3)

`DEPLOYMENT-CHECKLIST.md` §"Feature flag convention" stated that any change to AI prompt logic, funder eligibility rules or export behaviour **must be wrapped in an environment variable flag before it ships**. It was not being followed. Only two flags have ever existed, both about preprocessing (`DISABLE_TEXT_PREPROCESSING`, `PREPROCESS_CHAR_CEILING`), while at least four `lib/prompts.ts` changes shipped without one: the Step 3 extraction determinism fix (2026-07-15), the table-format budget-question rule (2026-07-27), the `[ITEM N]` fallback citation marker (2026-07-21), and governance-fact detection plus its manual-add fallback (`PDR-AI-008`).

WJ asked for the option that adds value rather than the option that merely restores compliance, and chose all three changes below.

**1. The rule was replaced, not reinstated — because it guarded the wrong risk.** Every one of those four unflagged changes was itself a _fix_ for a defect found during live testing. In each case the problem was not that a bad change could not be undone — Vercel instant rollback handles that in about a minute — but that the defect went undetected until a human tested manually. A per-change feature flag would not have helped with that at all, which is exactly why the rule was ignored in practice. It is now a **recovery-path convention**: every change in those three categories must have a named way to back it out, recorded in the commit or changelog entry, and Vercel rollback, `AI_ENABLED=false`, or a dedicated flag all qualify. A dedicated flag is still the right answer when a change must be switchable off _without_ reverting everything deployed alongside it. A mandatory rule that is routinely broken is worse than an honest one, because it teaches everyone that the checklist is optional.

**2. `AI_ENABLED` is now documented in the feature-flag table**, listed first. It is the master kill-switch — checked in `/api/generate-summary`, `/api/refine-answer` and the charity-objects paraphrase in `actions/charity.ts` — yet it was absent from the one table an operator would consult during an incident, despite being present in `.env.example` and in both routes. Documented with what users actually experience: the two AI routes return `503` and show the "AI service busy" message, while the charity paraphrase degrades silently so profile setup still completes. Also recorded is the sharp edge that it must be exactly the string `false`; any other value, including `FALSE` or `0`, leaves AI enabled.

**3. New pre-deploy item — the prompt-change regression check.** Any change to `lib/prompts.ts` now requires re-running one known guideline end to end and confirming the extracted question count is unchanged, or changed only as the fix intended, with before/after counts recorded in the changelog. This is the control that would have caught the 12→10 question regression, and it addresses the actual failure mode: silent extraction regressions are the most common defect class in this codebase and are invisible to CI, type-checking and the unit suite (see audit observation **O7** — there are no route-handler or Server Action tests).

**Also fixed in passing:** the pre-deploy item "Any affected funder test plan has been re-run" predated `DR-TEST-001`, which retired per-funder plans in favour of capability layers. It now points at `TEST-DASHBOARD.md` for the current structure. That closes the first half of audit finding **L4**; the missing `**Tier:**` header on this document is the other half and remains open for the documentation sweep.

`DEPLOYMENT-CHECKLIST.md` bumped to v1.3.

---

## 2026-07-29 — Legal-reviewer options researched and filed (Opus audit S2b); branch protection required-checks corrected

**New document: `docs/legal/legal-review-options-2026-07-29.md`.** Audit finding **S2** — both live legal pages publish `Effective date: [TO BE CONFIRMED]` — was accepted as Severe and is blocking external-tester verification. It splits into **S2a** (set the two dates; not blocked, needs no solicitor) and **S2b** (obtain an independent review), where the real blocker was that WJ had been unable to find a suitable, reasonably priced reviewer. Researched at his request and capped at 10 providers on his instruction.

Headline options, all with sourced published prices: **qLegal (QMUL) at £0** — the only free scheme found whose criteria admit a _for-profit_ company (turnover under £100k), reopening for enquiries July/August 2026; **Singleton Solicitors at £480 + VAT** — the only published fixed fee covering _both_ documents in one price, SRA-regulated with a commercial/IT specialism; and **Lawhive at roughly £200–£400** for both, the cheapest genuinely regulated route. Recommended path: use the free ICO tools (Privacy Notice Generator, self-assessment toolkit, SME helpline 0303 123 1113 option 4) to clean the drafts first, apply to qLegal in parallel, then pay for the review — realistic total around £576 inc. VAT, plausibly £0.

Ruled out honestly rather than padded: **LawWorks is a hard no** — its criteria require the applicant to _be_ a not-for-profit, so a company supplying charities is excluded regardless of what it provides for free. TrustLaw's >50%-profit-reinvestment test makes eligibility doubtful. The Chancery Lane Project (climate clause library) and Advocate (individuals, barristers, disputes) are not applicable. The main trap flagged is **DPO-as-a-service at £695–£5,000/month** — RapidGlobe almost certainly has no statutory DPO duty, so a monthly retainer to solve a one-off review would be the worst-value option available. Two prices could not be verified against the provider's own site on the day (Singleton and LawBite both failed to resolve) and are flagged in place.

The document is research into providers and their costs — explicitly **not** legal advice, and it makes no recommendation on the content of either legal document.

**Separately, branch protection on `master` corrected.** The previous entry moved the `audit` job out of `ci.yml`, but the protection rule still listed `audit` among its four required status checks — a context that no longer exists and could therefore never report, making the rule permanently unsatisfiable in a new way. Reduced to the three real contexts (`lint-and-typecheck`, `test`, `validate-migrations`) with WJ's authorisation. Everything else deliberately unchanged and verified after the change: `strict` still true, force-pushes and deletions still blocked, no PR-review requirement, and **`enforce_admins` still `false`** — that last one is audit finding **M6** and remains an open decision, not something to change as a side effect of this fix.

---

## 2026-07-29 — Dependency scan split out of ci.yml so a real CI failure is visible again (Opus audit M2)

The `audit` job (`npm audit --audit-level=high`) has been moved out of `ci.yml` into a new dedicated workflow, `.github/workflows/security-audit.yml`. WJ chose this option over the alternative of allowing the known advisory.

**Why.** A high-severity `brace-expansion` advisory reaching the tree via `eslint`/`eslint-config-next` (both devDependencies) has no fix available short of the ESLint 10 upgrade deferred in PR #70, so the `audit` job had been red continuously since roughly 2026-07-25. Because a workflow's overall status is the worst of its jobs, `ci.yml` was red on **11 of its last 12 runs** on `master` — which meant a genuine failure in `lint-and-typecheck`, `test` or `validate-migrations` would have produced exactly the same red as the known, accepted noise. All three were confirmed passing at audit time, but nothing would have signalled it if they had not been. The scan still runs and still reports; it simply no longer determines whether `ci.yml` is green.

`security-audit.yml` runs weekly (Mondays 08:00 UTC) plus on manual dispatch, rather than on every push — weekly is sufficient for advisory drift, and it is deliberately **not** a required status check. The removed job's place in `ci.yml` carries a comment explaining where it went and why, so the split does not read as an accidental deletion.

**Also corrected, same finding.** `DEPLOYMENT-CHECKLIST.md` stated under "Standard deploy" that "on CI pass, Vercel builds and deploys to production automatically." That was never true — Vercel deploys on push, independently of and in parallel with CI, so a red run has never stopped code reaching production. Corrected to say so plainly, with an explicit instruction that CI must be checked manually. Whether to make the gate real (via Vercel's Ignored Build Step) is recorded as an open decision, not silently resolved. The pre-deploy checklist item was also corrected: it listed three checks under the old invented names, and now names the three real gating jobs.

**Job naming reconciled across three documents.** `README.md`, `technology-stack.md` TS-08 and `DEPLOYMENT-CHECKLIST.md` all described CI using the labels Quality / Tests / Security / Migrations, which match no actual job name — so a red check in GitHub could not be traced to the document describing it. All three now use the real names (`lint-and-typecheck`, `test`, `validate-migrations`) and list `security-audit.yml` and `schema-drift-check.yml` separately as non-gating workflows.

**Outstanding consequence, not yet actioned:** `master`'s branch protection still lists `audit` among its four required status checks. That job no longer exists in `ci.yml`, so the check will never report and the requirement can never be met. This needs the protection rule updated to the three remaining contexts — flagged to WJ, awaiting his go-ahead since it is a repository settings change. Until then the position is unchanged in practice, because `enforce_admins` is `false` (audit finding **M6**).

---

## 2026-07-29 — AGENTS.md §1 Next.js documentation paths corrected (Opus audit M1) — and Middleware is deprecated in Next 16

`AGENTS.md` §1 is the first mandatory pre-task check and the most strongly worded rule in the file: identify the area you are working in and read the corresponding Next.js guide before touching any code, because "this is NOT the Next.js you know." The Opus audit (finding **M1**) found that **all five paths it listed did not exist** — they pointed under `node_modules/next/dist/docs/app-router/…`, and there is no `app-router` directory in the installed package at all. The rule has therefore been structurally unenforceable since the project began: every session following it literally found nothing and either skipped the check or improvised from training data, which is precisely what it exists to prevent. It also undermined `DR-BM-002` (succession plan), which assumes `AGENTS.md` is followable by a future maintainer.

Corrected against the installed Next 16.2.11 tree, with every path verified to exist. The real root is `node_modules/next/dist/docs/`, with `01-app/` for the App Router and `02-pages/` for the Pages Router (explicitly marked not-for-use here). The table was expanded slightly from five rows to seven — data fetching/mutations and caching/revalidation now have their own rows, since those were previously collapsed into a single "data-fetching" path that no longer reflects how the docs are organised.

**Found while verifying those paths — a real deprecation this codebase has not acted on.** There is no middleware documentation in Next 16 at all; searching the installed docs tree for "middleware" returns no file. The reason: **as of Next.js 16, Middleware is renamed to Proxy**, and `01-app/03-api-reference/03-file-conventions/proxy.md` states plainly that "the `middleware` file convention is deprecated and has been renamed to `proxy`." Functionality is unchanged; the rename reflects Next's intent to discourage the pattern and avoid confusion with Express-style middleware. Next ships a codemod for the migration: `npx @next/codemod@canary middleware-to-proxy .`, which renames both the file and the exported function.

This project still uses `middleware.ts` — which carries the route allow-list, the per-request CSP nonce, and session handling. **Not migrated in this entry**, deliberately: `middleware.ts` is load-bearing for authentication and security headers, so a rename belongs in its own change with its own testing, not bundled into a documentation fix. Logged here and noted in `AGENTS.md` §1 so no session mistakes the deprecated name for current practice. This is a good illustration of M1's cost: the check that would have surfaced this months ago was pointing at paths that did not exist.

`AGENTS.md` §1 also gained a standing instruction: if a listed path is missing, find the current location and correct the table rather than skipping the check, since Next.js reorganises its docs between versions. That is what stops this recurring.

**Logged as audit observation O10 at WJ's request**, with the recommendation to migrate after go-live rather than before — a rename touching authentication and CSP is not worth disturbing while production infrastructure work is outstanding. O10 also records how it went unnoticed: Next 16 arrived on 2026-05-20 inside commit `b369a95` ("fix: update dependencies to resolve security vulnerabilities"), so a major framework upgrade landed within a security patch and the release notes were never read; the deprecation produces no build, lint or CI signal; and the `AGENTS.md` check written to catch exactly this was unenforceable. Added to §6 and as row 12 of the report's suggested order of work.

---

## 2026-07-29 — Opus audit amended: S4's Sentry claim was wrong, and M8 (Server Action version skew) added

Two amendments to `docs/Opus Audit 290726.md`, both arising from the finding-by-finding walkthrough with WJ.

**S4's Sentry row was wrong and has been withdrawn.** The audit claimed the production Vercel Sentry DSN was empty and that production therefore had no error visibility. It is not empty. `vercel env ls` shows both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` present in Production (set 71 days ago), and the deployed production JavaScript bundle carries a live DSN on `o4511417358745600.ingest.de.sentry.io` — correct EU region, matching the org ID in `IMPLEMENTATION-PLAN.md:1587`, and the only Sentry host the CSP permits. WJ then confirmed from the Sentry dashboard that `production` events are arriving. The false claim was inherited from `IMPLEMENTATION-STATUS-ARCHIVE.md:830`, a P3.7-era note reading "production Vercel DSN is empty — to be set at P5.4" which was never updated after the DSN was set. **That archive line is still stale and should be corrected** — logged, not yet actioned. One part of the same P5.4 item does remain genuinely unverified: no Sentry alert rule appears to be configured (seven issues accumulated unnoticed), and PII scrubbing has not been confirmed active.

**New finding M8 — deploying over an open tab breaks Server Actions, and the failure is silent.** Investigating Sentry issue `GRANT-PATHWAY-6` ("An unexpected response was received from the server", 8 events over three weeks) produced an unambiguous diagnosis. On 2026-07-25 a tab loaded release `5895146` at 16:41, sat for 2h02m, then posted a Server Action at 18:43 — which returned HTTP `200` but a body React could not parse, throwing via `onunhandledrejection` 17 ms later. Commit `40453bf` had deployed at 17:30, in between, invalidating the older build's Server Action IDs. This is Vercel version skew: **Skew Protection is disabled** (confirmed — production sets no `__vdpl` cookie), and 14 commits were pushed to `master` that single day, each a production deploy invalidating every open tab. A second mechanism compounds it: the 2h02m gap exceeded the 60-minute session timeout, and `D-013` (fixed 2026-07-28) meant the client never signed the user out.

The more serious half is the handling rather than the cause: **88% of the 8 events occurred on `.../step/4`**, the answer-writing screen, not `/profile`. The rejection reaches the global handler with nothing surfaced in the UI, so a tester writing grant answers gets no error, no retry prompt, and no indication the submit failed. Fix is two-part — enable Skew Protection (Pro-plan settings toggle, no code change), then catch Server Action failures and surface a recoverable message, Step 4 first. Not yet distinguished: whether the ~7 early-July events (all release `efd0136c63f8`, all on `step/4`) are also skew or a since-fixed Step 4 fault; the discriminator is whether they show the same long gap before the failing POST.

No service code changed in this entry — audit report amendments plus this record only. Medium findings now number 8.

---

## 2026-07-29 — `app/mockup/` deleted: publicly reachable internal design mock-up removed (Opus audit S3)

The independent Opus audit (`docs/Opus Audit 290726.md`, finding **S3**) found `app/mockup/page.tsx` — a throwaway design mock-up for the Step 4 Draft Answers redesign, built 2026-06-05 — still shipping to production and reachable with no authentication. It sat outside both the `(public)` and `(authenticated)` route groups; `middleware.ts` gates by allow-list (`PROTECTED`), so a route absent from that list is open by default, and `app/robots.ts` disallows only `/api/`, `/account/` and `/dashboard/`, leaving `/mockup` indexable too.

No data exposure — the page was never connected to real data. The problem was that it published internal product-strategy notes on a public URL during an external tester beta, and some of those notes are now factually wrong: it stated "Does not handle narrative funders (Garfield Weston, City Bridge)" and recommended implementing "Option B", both of which were superseded when Option B was built. A public page telling a charity (or a named funder) that Grant Pathway does not handle their applications is actively misleading, quite apart from the roadmap and target-funder-coverage detail it disclosed.

Deleted rather than relocated. The file's own header already authorised this — _"Not connected to real data. Safe to delete after design sign-off"_ — and sign-off happened when Option B shipped. The equivalent static design artefact already lives at `docs/Business Design/mockup.html`, so nothing is lost by removing the live route. Verified before deletion that nothing references `app/mockup` or the `/mockup` route anywhere in the codebase (the other `/mockup` matches in `CHANGELOG.md` and `PRD-Grant-Pathway.md` are the tail of the `Business Design/mockup.html` path, unrelated).

WJ authorised this fix during a finding-by-finding walkthrough of the audit report. Note that the second half of the audit's suggested step 1 — adding `disallow: '/'` to `robots.ts` while `grantpathway.org.uk` is still pre-launch (finding **M5**) — is **not** included here; it remains open pending that finding's review.

---

## 2026-07-28 — external-tester-brief.md relocated to docs/Test Plans, GitBook help link added

WJ asked to move `docs/legal/external-tester-brief.md` (drafted the same day, see the AWS Bedrock entry below) to `docs/Test Plans/` — it's a testing-programme document (a briefing note for external testers), not a legal one, so `docs/legal` was never really its home. Moved with `git mv` (history preserved), not duplicated. While there, added a short "Need a hand while you're testing?" section pointing testers at the real help centre (`https://rapidglobe.gitbook.io/grant-pathway`) before they email in a question.

No change to `TEST-DASHBOARD.md` — this document isn't one of the tracked test-plan layers (`DR-TEST-001`), it's tester onboarding material, so it doesn't get a dashboard row.

---

## 2026-07-28 — Sign-in: email/password now trimmed before authentication (D-015)

WJ tried to log in on an iPhone ahead of an external demo and got `invalid_credentials` despite copy-pasting both fields correctly — traced via `vercel logs` to a trailing space at the end of the pasted password. Neither `components/sign-in-form.tsx` nor `signIn()` in `actions/auth.ts` trimmed the email or password before use: the client-side email regex would already reject a trailing-space email, but a trailing-space password passed client validation untouched and was sent to Supabase's `signInWithPassword()` as-is, which does an exact match and silently fails.

Fixed in both places: `signIn()` now trims both fields server-side before calling Supabase (the actual fix — copy-paste whitespace is not mobile-specific and can come from a password manager or document on any device); `SignInForm`'s client-side validation now trims before checking, so a trailing-space email no longer shows a spurious "invalid email" error before the request even reaches the server. Verified live in the dev server: a trailing-space password now passes client validation, reaches the server action, and is correctly rejected as wrong credentials rather than being silently mismatched by whitespace.

Registration, password reset, and change-password were not touched — out of scope for this fix, flagged as the same latent risk if it resurfaces there.

---

## 2026-07-28 — Documentation freshness audit: six gaps found and fixed across five Tier 1 docs

WJ asked whether all documentation referenced in `AGENTS.md` was up to date. Ran a targeted audit against the Tier 1 (always-check) docs plus the Tier 2 docs most likely to have drifted, cross-checking each against this changelog and the live code/schema. Six concrete gaps found, all fixed same day — no wrong facts anywhere, only missing updates:

1. **`IMPLEMENTATION-STATUS.md`** — was stale by a full day (Last-updated still said 2026-07-27); added a full narrative entry for 2026-07-28's work (eligibility confirmation, combined word-limit counter, EL-01/EL-03, RT-01b through RT-15, legal doc split, external tester brief, AWS spend-cap correction) and fixed stale version pointers.
2. **`data-model.md`** — `charity_profiles.lookup_source` documented `oscr`/`ccni` as valid values, but the live CHECK constraint only allows `charity_commission`/`manual` (corrected); added missing `service_role` grants documentation (and the 2026-07-23 incident/fix) to `application_items`/`application_guidelines`, previously undocumented anywhere; added the missing `added_manually` column to the formal field table (only existed in prose before). Bumped to v1.17.
3. **`PRD-Grant-Pathway.md`** — Section 7's Step 4 screen spec didn't mention the combined word-limit counter (already described in Section 6.6, never propagated); Section 12.4's session-timeout row said "any activity resets the timer," now qualified with the D-013 exception. Also fixed the trailing document-status line, drifted two versions behind (0.58 vs 0.60) — the same recurring class of bug flagged twice before in this doc's own history. Bumped to v0.61.
4. **`acceptance-criteria.md`** — no AC covered "ambient activity while the warning modal is open must not dismiss it." New AC-FR-06-05 added for D-013; AC-FR-06-02 cross-referenced to note the exception.
5. **`technical-design.md`** — session-timeout section didn't mention the D-013 exception, was missing `touchstart` from the tracked activity events, and described an invented "Stay signed in" button label instead of the real "I'm still here"/"Sign out now." All corrected. Bumped to v1.23.
6. **`moscow-feature-register.md`** — FR-29 and FR-47's notes didn't mention `PDR-AI-012` (combined counter) and `PDR-AI-011` (confirmation call) respectively, both built several days before this register was last touched. Bumped to v1.20.

Confirmed fully current, no action needed: `CHANGELOG.md` itself, `TEST-DASHBOARD.md`, `PRD-DECISIONS-INDEX.md`, `non-functional-requirements.md`, and all of `docs/legal/` (the internal/external split is byte-consistent, and the tester brief's stated 50/month AI limit and no-override eligibility claim both verified against the live code).

---

## 2026-07-28 — AWS Bedrock spend-cap backstop confirmed already built, PDR-AI-005 corrected

While reviewing external-tester readiness, flagged `PDR-AI-005`'s AWS Bedrock spend-cap backstop as apparently still just "planned" — the PDR's Backstop section used future tense ("will also be configured") with no confirmation it existed. WJ checked the AWS console and found it was already built: `grant-pathway-bedrock-cap`, a $127/month (≈£100, matching the C1 budget) AWS Budget with two alert thresholds ($70/55%, $127/100%) emailing the correct recipient. No cost-dimension filter is applied (tracks the whole account rather than `Service: Amazon Bedrock` specifically), confirmed not to matter in practice since the AWS account is Bedrock-only. No Budget Action is attached, so it is alert-only, not an automatic hard stop.

Corrected `PDR-AI-005` to describe this as confirmed and built rather than planned, and fixed the Rationale's inaccurate "hard backstop" wording to "alert-based backstop" to match the real configuration. No code or infrastructure change — documentation correction only.

---

## 2026-07-28 — RT-15 closed: session-timeout fixes confirmed, diagnostic timer reverted

WJ re-tested with the shortened diagnostic timer (see the two entries below) and confirmed both defects are fixed: the warning modal now stays on screen and is clickable even as the mouse moves toward its buttons, and the warning text reads correctly ("You'll be signed out in 1 minute due to inactivity.").

`WARNING_MS`/`TIMEOUT_MS` in `components/session-timeout-provider.tsx` have been reverted to the real 55/60 minutes — no diagnostic-only code remains in the file. RT-15 is closed as Pass; see `docs/Test Plans/regression-test-plan.md` v2.10. All 15 test cases in the regression plan now Pass.

---

## 2026-07-28 — RT-15 diagnostic surfaces and fixes two real session-timeout defects

With the diagnostic shortened timer in place (see previous entry below), the warning modal appeared as expected — but WJ found two real, previously-hidden defects while trying to interact with it.

**D-013 (Blocking): the modal dismissed itself the instant the mouse moved toward its buttons.** Root cause: the document-level activity listener in `components/session-timeout-provider.tsx` (`mousemove`/`keydown`/`click`/`touchstart`) called `resetTimers()` — which closes the modal and reschedules both timers — on any matching event anywhere on the page, with no check for whether the warning modal was already open. Moving the mouse toward "I'm still here" or "Sign out now" triggered this before the click ever landed, so the modal reappeared a full warning-window later without ever being clickable. This has likely been broken since the modal was first built — the only reason it wasn't caught sooner is that nobody had previously managed to keep the modal on screen long enough to try clicking it. Fixed by tracking modal-open state in a `modalOpenRef` and having the activity listener ignore ambient events while the modal is showing; only its own two buttons can end the warning state once triggered.

**D-014 (Cosmetic): warning text rendered "You'll be signed out in 1 minutedue to inactivity" — no space before "due".** Root cause: a JSX line-wrap whitespace-trimming gotcha in `components/session-timeout-modal.tsx`, not a plain typo — the sentence was written as JSX text wrapped across two source lines starting immediately after `{minuteLabel}`; Babel's JSX transform trims the leading space of each line before rejoining them, silently eating the one space that mattered. The space between `{minutesRemaining}` and `{minuteLabel}` survived because that pair sits on a single unwrapped line. Fixed by rewriting the sentence as one JS template literal, which is immune to this class of bug regardless of future reformatting.

Both fixes are pushed. The diagnostic shortened timer (1/2 minutes) remains in place pending a clean re-test that confirms both fixes hold and the original point of this re-test — the underlying sign-out logic — is sound; see `docs/Test Plans/regression-test-plan.md` v2.9, RT-15 and Defect Log D-013/D-014.

---

## 2026-07-28 — RT-15 session-timeout re-run failed to reproduce; timer temporarily shortened to diagnose

WJ ran a fresh scripted re-run of RT-15 (session timeout) in Google Chrome and saw neither the 55-minute warning modal nor the 60-minute automatic sign-out — the session simply stayed active throughout. The 2026-07-04 Pass on record was a genuine live occurrence (WJ away from the session over an hour during Clothworkers testing), not a scripted run, so this is the first deliberate attempt to reproduce the behaviour on demand.

Leading theory, unconfirmed: Chrome throttles (and, with Memory Saver enabled, can fully discard) JavaScript timers in backgrounded/inactive tabs, which is exactly the `setTimeout`/`setInterval` mechanism `components/session-timeout-provider.tsx` relies on. That would explain a real occurrence surfacing once under uncontrolled conditions but not reproducing reliably in a deliberate background-tab wait.

To isolate whether the sign-out logic itself is sound — independent of any Chrome background-tab behaviour — `WARNING_MS`/`TIMEOUT_MS` in `session-timeout-provider.tsx` have been temporarily shortened from 55/60 minutes to 1/2 minutes, so the full behaviour can be observed within a few minutes instead of an hour. The modal's countdown display was changed from a hardcoded 5-minute assumption to a value derived from the actual `WARNING_MS`/`TIMEOUT_MS` gap (`COUNTDOWN_MINUTES`), so it stays accurate whether the real or shortened thresholds are in effect. **This is a diagnostic-only change** — no product behaviour is intended to change; the thresholds will be reverted to 55/60 minutes once the underlying logic is confirmed working (or a real defect is found and fixed). See `docs/Test Plans/regression-test-plan.md` v2.8 for the re-test steps.

---

## 2026-07-28 — External tester brief drafted; Dependabot status confirmed unchanged

WJ decided to open the (already-live) `grant-pathway-dev`-backed site to external testers for a few weeks ahead of launch, rather than cutting over to `grant-pathway-prod` early. No infrastructure change needed — the live `grantpathway.org.uk` deployment already points at `grant-pathway-dev`.

New `docs/legal/external-tester-brief.md`: a plain-English note for testers covering the pre-launch caveats (build may change under them, test data may not be kept long-term), the two behaviours most likely to surprise someone hitting them for the first time (the 50/month AI usage limit and `DR-EL-001`'s no-override eligibility hard-stop), a link to the real Terms/Privacy, and a feedback contact. Not wired into the app — intended for WJ to send directly to testers.

Also checked GitHub Dependabot status while reviewing readiness: no change since the 2026-07-25 `brace-expansion`/ESLint-10-block finding. 5 open PRs, 4 of which fail CI only on the same known transitive `brace-expansion` audit finding (bundled inside ESLint 9's own dependency tree); the ESLint 9→10 PR itself still fails outright on the same `eslint-plugin-react`/ESLint 10 incompatibility recorded previously. Left untouched per WJ's standing instruction to leave this parked until prod-push week.

---

## 2026-07-28 — Legal pages split into internal (with changelog) and external (clean) copies

WJ noticed the live `/terms` and `/privacy` pages were rendering their "Change from vX.X" changelog blockquotes directly — internal-facing content (cross-references to `DR-BM-003`, `ADR-STACK-005`, `DR-DP-002`, `ADR-DATA-005`) with no meaning to an external reader (a charity user, a funder, a regulator).

`docs/legal/terms-of-service.md` and `privacy-policy.md` remain the internal working copies — unchanged, full changelog history preserved for audit trail. Two new files, `terms-of-service-external.md` and `privacy-policy-external.md`, hold the same body text with only the changelog blockquotes removed; the Version/Effective date/Last updated line stays on both, since both documents' own body text (ToS §12, Privacy §10) tells the reader that line is what shows them when the document last changed. `app/(public)/terms/page.tsx` and `app/(public)/privacy/page.tsx` now read from the `-external` files instead.

A maintenance note was added to both internal files: since the external copies carry no changelog of their own, any future section edit must be manually mirrored into the matching `-external` file — nothing else will prompt this.

Verified: `tsc --noEmit`, `eslint --max-warnings 0`, all 101 tests pass. Both live pages checked in a local dev server — render correctly, no changelog blocks visible, all section numbering and cross-references intact.

---

## 2026-07-28 — RT-01 through RT-14 all executed and passed; two stale plan-text issues corrected

WJ ran the full regression suite (`regression-test-plan.md`) end to end for the first time since RT-01b's addition — RT-01 through RT-14 all Pass. Two of those runs surfaced plan text that had drifted from the current app rather than any product defect:

- **RT-03** (dashboard renders with data): step 1's element list never mentioned the "Ineligible" application-count badge that `DR-EL-001`'s eligibility hard-stop added to the dashboard summary bar. Corrected.
- **RT-11** (dashboard reopen application): step 2 said "Click View", but the card's button for an approved/exported application now reads "Re-open" — consistent with the rename already recorded elsewhere (`FR-17`), just never updated in this specific test step. Corrected.

**RT-14** (delete account) is the first fresh confirmation since the 2026-07-23 `service_role` grant fix (`application_items`/`application_guidelines` were missing `service_role` table grants, causing every deletion to fail on the very first cascade step with `42501: permission denied`) — passed cleanly against `grant-pathway-dev`, confirming that fix holds. Migration `20260723000000_grant_service_role_item_graph_tables.sql` is **still not applied to `grant-pathway-prod`** — the same outstanding gap tracked since 2026-07-23, due at P5.4.

Only RT-15 (session timeout) remains — a fresh re-run was in progress at the time of this update; its existing 2026-07-04 Pass stands independently since it needs no re-verification. `regression-test-plan.md` bumped to v2.7, `TEST-DASHBOARD.md` to v2.13.

---

## 2026-07-28 — RT-01b (Charity Commission lookup) confirmed live, closed

`regression-test-plan.md`'s RT-01b (added 2026-07-24, never run) confirmed as a byproduct of the same day's eligibility testing rather than a dedicated run — both the found path (valid registration number pre-fills the charity profile) and the not-found path (invalid number falls back to manual entry with no crash) exercised while setting up EL-01/EL-03's charity profiles. No issues found. `regression-test-plan.md` bumped to v2.6, `TEST-DASHBOARD.md` to v2.11.

---

## 2026-07-28 — Both matrix fixes live-verified; EL-01/EL-03 completed; combined counter made more prominent

WJ live-tested both fixes built earlier the same day:

- **`PDR-AI-011` (eligibility confirmation):** retested National Opera Studio vs Idlewild Trust Arts directly — no false mismatch, no repeat of the original flip. `eligibility-check-test-plan.md` EL-01 (positive-match check) also run — Pass, no eligibility issues.
- **`PDR-AI-012` (combined word-limit counter):** retested CPF Trust — `overallWordLimit` correctly extracted, combined counter displayed and updated live (confirmed at "600 / 500 words" in red once over). WJ found the counter easy to miss against the sticky progress bar; bumped from 12px to 14px bold (resting colour darkened from `#64748B` to `#334155` for contrast), confirmed as an improvement on retest.

Also completed: `eligibility-check-test-plan.md`'s EL-03 (Harry's Rainbow vs Wolfson Foundation Health & Disability). No mismatch warning appeared — WJ initially read this as a failure, but the test plan's own Background/Expected result confirms this **is** the passing outcome: `DR-EL-001` requires the AI to default borderline/partial fits to `false`, and a bereavement-support charity against a Health & Disability funder that doesn't explicitly exclude it is exactly that case. Corrected and logged as Pass, not a defect. All three eligibility cases (EL-01/02/03) and both `guideline-capability-matrix-test-plan.md` observations from the 2026-07-27 session are now closed.

`guideline-capability-matrix-test-plan.md` bumped to v1.4, `eligibility-check-test-plan.md` to v1.3 (now 🟢 on `TEST-DASHBOARD.md`, v2.10).

---

## 2026-07-28 — Combined word-limit counter across split sections built (Defect Log #3, `PDR-AI-012`)

Built the fix agreed the previous session for the GCM-03 observation (CPF Trust): a funder's single 500-word limit covering the whole application had no home once `buildSummaryPrompt()` (correctly) split it into 3 topic sections, none of which showed any limit badge.

`AiSummaryData` gains an optional `overallWordLimit` field, populated only when the guidelines state one limit spanning multiple sections as a group (never invented, never summed from separately-stated per-section limits). No database migration — it lives in the existing `applications.ai_summary` JSONB column, read the same way `sections`/`governanceFacts` already are.

Step 4 (`components/application-step4-draft.tsx`) sums the live word count of every narrative section carrying no individual limit of its own, and shows it as a combined counter pinned inside the existing sticky progress-bar region — `Combined across N linked sections: X / <limit> words`, turning amber near the limit and red once exceeded, same visual escalation as any per-section counter. Never disables Approve or Ready to assemble — a soft nudge, consistent with how every other limit in the product already behaves. Each contributing section shows a small "Counts toward `<limit>`-word total" badge so its lack of an individual limit reads as intentional.

New automated coverage: `__tests__/step4-combined-word-limit.test.tsx` (3 tests, all passing) — verifies the combined sum excludes sections with their own separate limit, updates live as text is typed, and turns red once exceeded. `tsc --noEmit`, `eslint --max-warnings 0`, and the full `vitest` suite (101 tests) pass. Extraction itself (whether the AI correctly recognises an aggregate limit as such, rather than missing it or forcing a per-section split) is not yet live-verified — WJ's next CPF Trust regeneration is the outstanding step. See `PDR-AI-012` for full rationale.

---

## 2026-07-28 — Non-deterministic eligibility verdict (Defect Log #2) root-caused and fixed (`PDR-AI-011`)

Investigated the GCM-01 observation from the previous session's capability/shape matrix run: National Opera Studio against Idlewild Trust Arts guidelines failed the `DR-EL-001` eligibility hard-stop on one run, then passed on an immediate retry with no profile changes.

Root cause: `temperature: 0` is already set on the `generate-summary` Bedrock call (added 2026-07-15, for a different, already-fixed determinism issue) — this was not a missing-setting bug. Bedrock-hosted Claude does not guarantee bit-identical output across separate calls even at temperature 0 (batched-inference floating-point non-determinism — a hosted-LLM-wide limitation, not something fixable in this codebase). This matters here specifically because `eligibilityMismatch` gates a hard stop with **no override** (`DR-EL-001`): one wrong `true` permanently dead-ends an application. The GCM-01 case wasn't even a genuine borderline call — National Opera Studio does fit Idlewild's early-career remit — so the "fail" run was a real false positive.

Fix (`PDR-AI-011`, `app/api/generate-summary/route.ts`): when the first call returns `eligibilityMismatch: true`, a second identical call now confirms it before anything is shown to the user. Both calls must agree to proceed to the hard stop; if the second call disagrees, times out, or fails to parse, the route falls back to trusting the first verdict _unless_ the second call cleanly disagreed, in which case the mismatch is dropped — deliberately asymmetric, since a false "not blocked" costs nothing but a false "blocked" costs the user a deleted-and-restarted application. Both calls' tokens are logged against the same AI-usage row; no second monthly-cap slot is consumed.

`tsc --noEmit`, `eslint --max-warnings 0`, and all 98 `vitest` tests pass unchanged (no existing coverage of this route — Bedrock calls can't be exercised locally, `dotenvx` redacts AWS credentials for this agent). Not yet live-verified — WJ's next regeneration of the National Opera Studio / Idlewild Trust pairing is the outstanding step.

---

## 2026-07-27 — Guideline capability/shape matrix fully executed: GCM-01–05 all Pass

WJ completed a full run of `guideline-capability-matrix-test-plan.md` (GCM-01 through GCM-05) in one session, closing out the last untested layer of `DR-TEST-001`'s restructured suite. The table-format budget-question fix (previous entry) was found and fixed mid-run, then live-verified. Two further findings were logged as observations rather than fixed tonight, per WJ's call:

- **Non-deterministic eligibility verdict:** National Opera Studio against Idlewild Trust Arts failed the eligibility hard-stop on one run, then passed on an immediate retry with no profile changes. Not yet root-caused — worth investigating given `DR-EL-001`'s eligibility check is meant to be a reliable gate, not a coin flip on borderline cases.
- **No aggregate word-limit indicator across split sections:** CPF Trust's guidance caps the whole application at 500 words, but the AI (correctly) split the single email into 3 topic sections rather than one undifferentiated block — reasonable, since the source lists 5 named required pieces of information rather than genuinely free-flowing prose. However none of the 3 resulting cards shows any word-limit badge, so nothing stops the applicant exceeding 500 words in total. Agreed fix: a live combined word counter shown across the linked cards (soft nudge, not a hard block) — deferred to a future session, not built tonight.

GCM-04 (Clothworkers, large-document truncation) needed a different charity than the other three cases — National Opera Studio doesn't genuinely fit any of Clothworkers' 10 disadvantage/marginalisation programme areas (capital-projects-only funder) — so the archived `Clothworkers-Foundation-test-plan.md`'s Bridge Support MK fixture (young people facing economic disadvantage/homelessness, Milton Keynes) was reused on a fresh account, avoiding another one-per-account profile-overwrite mix-up. All 13 extracted questions were cross-checked directly against the source PDF's pages 21–24 — every citation, quote, and word limit matched exactly, doubling as a clean GCM-05 citation spot-check. `TEST-DASHBOARD.md` bumped to v2.7, this plan now 🟢.

---

## 2026-07-27 — Project funding-amount question silently dropped on table-shaped guidelines (GCM-01), fixed

Starting the guideline-capability-matrix-test-plan.md (GCM-01, multi-column table PDF shape), WJ tested Idlewild Trust's Arts application questions PDF against **National Opera Studio** — a genuine, unforced eligibility match for Idlewild's early-career-professional-development programme (Harry's Rainbow, used for this case in earlier sessions, was never a real match and has already failed AB Charitable Trust for the same underlying reason). Extraction otherwise looked clean (12 questions, correct character-limit typing), but Q24 — "State the total amount of funding you are requesting towards this project from Idlewild Trust" — was missing entirely from Step 4.

**Root cause:** the earlier same-day fix for MK Community Foundation's dropped budget questions only touched `lib/prompts.ts`'s general prose-based exclusion wording. Table-structured guideline documents (like this one) are matched by a separate TABLE FORMAT rule with its own independent skip-list keyed on the source table's "Type of question" column ("Short numerical field", "Drop-down list", etc.) — it had no budget-question exception at all, so Q24 (typed "Short numerical field" in the source table) was skipped outright regardless of the general carve-out. A different code path than the MKCF bug, same underlying failure mode, only surfacing on a table-shaped document — exactly the gap `guideline-capability-matrix-test-plan.md`'s GCM-01 case exists to catch.

**Fix:** added the same budget-question exception directly to the TABLE FORMAT skip-list in `lib/prompts.ts`. `tsc --noEmit`, `npm test` (98/98), and lint all pass. Not yet independently verified against a live Bedrock call — WJ's retest of GCM-01 is the outstanding step.

---

## 2026-07-27 — AB Charitable Trust flagship: full clean execution completed, two factual test-plan errors corrected

WJ ran the AB Charitable Trust flagship (v2.1/v2.2, Asylum Justice) end to end — ABC-01 through ABC-10 all Pass, one real defect found along the way (governance dropdown fix, previous entry).

Two errors in the test plan itself were also found and corrected, unrelated to the app: the Test Data table recorded the Open Programme's grant range as £10k–£40k/yr, but the actual guidelines document (`AB Trust Online-Application-Form-Guidance-July-2024-b.pdf`) states £10,000–£30,000 pa — confirmed by extracting the PDF text directly. Separately, the plan's Overview and ABC-04 asserted a "31 July 2026" application deadline that doesn't appear anywhere in the guidelines document at all (no deadline, closing date, or year is mentioned) — the AI summary correctly didn't surface a deadline because there isn't one to extract; the test plan's expectation was wrong, not the extraction. Both corrected in `AB-Charitable-Trust-test-plan.md` v2.2. ABC-04 was also renamed and stripped of eligibility-specific wording (now purely a content-accuracy check; eligibility matching is `eligibility-check-test-plan.md`'s job), and ABC-03's redundant navigation/PDF-fallback guidance was removed at WJ's request.

Also actioned: mid-session, WJ's first ABC-01 attempt mistakenly reused `grantpathway+ABC@gmail.com` (reserved as `eligibility-check-test-plan.md` EL-02's fixture account) and reset its charity profile before switching to the correct new account (`+ABC2@gmail.com`). The profile reset happened before the mix-up was caught, so EL-02's fixture is now gone — its recorded pass stands as historical evidence but that account can no longer reproduce the result. Flagged in `eligibility-check-test-plan.md` v1.2. `TEST-DASHBOARD.md` bumped to v2.6, AB Charitable Trust flagship now 🟢.

---

## 2026-07-27 — Manually-added governance dropdown could get permanently stuck at "Not sure yet", fixed

Live-testing the AB Charitable Trust flagship (ABC-08), WJ manually added the "Are any bank signatories related to each other or to a trustee?" governance item (via the "Need to add something about your finances or governance..." link) and left it at its default "Not sure yet" — no "Approve this answer" panel appeared at all. Switching the dropdown to "Yes" or "No" made the panel appear immediately.

**Root cause:** `components/application-step4-draft.tsx`'s Yes/No/Not sure yet `<select>` stored "Not sure yet" as `value=""` — literally indistinguishable from the field never having been touched. The approve-panel gate treats a manually-added item's blank answer as unanswered (deliberately, per the existing `!q.addedManually` comment — a manual add must be answered and approved like any other required question, unlike an AI-detected optional governance fact, which is allowed to stay blank and skip approval). Since "Not sure yet" collapsed to the same empty string as "never touched", the gate could never open for it — and with no way to remove a manually-added item, this permanently blocked Step 4 completion for anyone who genuinely meant "Not sure yet".

**Fix:** gave "Not sure yet" its own real value (`"Not sure yet"` instead of `""`) so an explicit selection is now distinguishable from an untouched field, and made a governance dropdown item's `isEmpty` calculation always `false` (a `<select>` always has _some_ option effectively selected — there's no genuine "blank" state for it, so it shouldn't be treated as unanswered at all). Also handled the residual case where a user approves without ever touching the dropdown (no `onChange` ever fires, so nothing is marked dirty to flush): `handleApprove` now explicitly persists `"Not sure yet"` rather than leaving `answer_text` null while `is_approved` flips true. AI-detected (non-manual) instances of the same dropdown were already showing the approve panel regardless of blankness via a separate bypass clause and are unaffected by this change; their existing skip-when-blank assembly-gate behaviour is untouched since it reads the raw answers map directly, not the per-item `isEmpty` flag that was changed. `npx tsc --noEmit`, `npm test` (98/98), and lint all pass. Not yet live re-verified — WJ's retest of the same stuck item (or a fresh one) is the outstanding step.

---

## 2026-07-27 — MK Community Foundation flagship: paste-path retest completed, citation fix live-verified

WJ ran a full fresh paste-path pass of the MK Community Foundation Oak Grants flagship (`MKCF Oak copy and paste Application Questions.docx` pasted directly rather than uploaded), to confirm the same-day question-extraction fix and citation fix both hold under the paste path specifically. Result: 16 application questions extracted (15 narrative + 1 governance fact), Step 3 summary content confirmed accurate against the source, and — the specific point of this retest — the previously-broken citations on the numbered questions corresponding to Q12/Q14/Q16/Q17 now open the guidelines viewer **with the correct passage highlighted**, resolving the `dewrapSoftLineBreaks()` fix's outstanding live-verification step from earlier the same day. MKCF-01 through MKCF-09 all passed on this run with no other issues reported.

One observation, not a defect: a criteria-section bullet ("There is a need for this project to be supported by grant funding...") that was cited as the source for a governance fact on the earlier upload-path run wasn't the quote chosen this time — expected run-to-run variance in which applicable passage the model selects to cite, not a regression, since that bullet sits under an eligibility/criteria heading rather than being a numbered application question.

This closes out live verification for both defects fixed earlier today (question-extraction gap, citation highlight loss) — see the two entries immediately below for root cause and fix detail.

---

## 2026-07-27 — Citation highlight missing on soft-wrapped numbered questions in pasted guidelines, root-caused and fixed

Continuing the same MK Community Foundation retest (paste path this time, `MKCF Oak copy and paste Application Questions.docx`), WJ found citation badges on several numbered narrative questions (Q5, Q7, Q9, Q10 in the source document — items 12, 14, 16, 17 on Step 4) correctly navigated to the right heading in the "view original guidelines" panel but highlighted nothing. Shorter numbered questions and a governance fact citation on the same document worked correctly, ruling out a general citation regression.

**Root cause:** `lib/preprocess-text.ts`'s `tagPastedTextSections()` (the fallback that tags `[SECTION: ...]` markers for pasted text with no file-level structure) treats each numbered application question as its own heading, using the full line text. Word's clipboard export sometimes preserves a question's visual line wrap as a literal newline rather than one continuous paragraph — confirmed by inspecting the "view original guidelines" panel, where the broken items' markers closed (`]`) mid-sentence exactly at the wrap point (e.g. "...reaches the intended]" with "beneficiaries? (Reach & Impact)" left dangling on the next line, outside the bracket). `looksLikeHeading()`'s numbered-line branch matched only the first physical line — short enough to pass its (then-100-character) length cap — and tagged it alone as the heading, injecting the marker's closing bracket into the middle of the sentence. Any citation "quote" spanning across that injection point could never match the guidelines text via `findQuoteRange`, since a literal `]` and newline sat where a natural sentence has none. Shorter questions that happened to fit on one physical line, and ones long enough that Word didn't wrap them at all, were unaffected — explaining why only some numbered questions broke.

**Fix:** added `dewrapSoftLineBreaks()`, run before heading detection in `tagPastedTextSections()` — merges a non-blank line into the previous one only when it starts with a lowercase letter and isn't itself a bullet, since a genuine new sentence, heading, or bullet reliably starts with a capital letter or bullet marker while a soft-wrapped continuation does not. Deliberately conservative (a continuation starting with a capitalised word or acronym is left unmerged, no worse than before) and verified not to merge a genuine short heading with its own separate body text (e.g. "1. Eligibility" + "Who can apply." stay separate). Also raised `looksLikeHeading()`'s length cap for the numbered-heading branch specifically (100 → 300 characters, ALL CAPS branch unchanged) — needed so a question that's now correctly rejoined into one long line still qualifies as a heading instead of silently losing its marker altogether. 3 new tests in `preprocess-text.test.ts`; all 98 tests, `tsc --noEmit`, and lint pass. Not yet independently re-verified against a live Bedrock call on the exact failing document — WJ's re-test of Q12/Q14/Q16/Q17 is the outstanding step.

---

## 2026-07-27 — Question-extraction gap found live-testing MKCF-06: project-budget questions and compound label+question lines were being dropped

Live-testing the MK Community Foundation Oak Grants flagship (MKCF-06), WJ found the AI-extracted 15 questions but was missing "What is the total cost of your project?" and "Description of your project" (from a compound "Project Name & Description of your project:" line), even though the criteria PDF asks both.

**Root cause:** `lib/prompts.ts`'s `buildSummaryPrompt()` question-extraction exclusion list read "number fields (income, expenditure, employee count, salary, grant amount)" with no distinction between the charity's own organisational figures (correctly excluded — captured by `governanceFacts` instead) and a project-specific budget/cost question, which the separate `is_budget_question` rule says should still be extracted as a narrative question. The model followed the exclusion list literally and dropped the project-cost question entirely instead of flagging it. The compound line was dropped in full because its leading "Project Name" label matched the data-entry exclusion pattern, taking the genuinely narrative "Description of your project" half down with it.

**Fix:** scoped the exclusion to organisational income/expenditure/employee count/salary figures only, added an explicit rule that project budget/cost questions are never excluded (extract with `is_budget_question=true` even when short/numeric-looking), and added a rule to extract only the narrative portion of a compound label+question line rather than dropping the whole line. `npm run type-check` passes. Not yet independently verified against a live Bedrock call — WJ's retest of MKCF-06 is the outstanding verification step.

Also found in the same session: the AB Charitable Trust flagship's Test Data charity ("Harry's Rainbow") doesn't actually align with any of AB's four eligible themes (access to justice/human rights/migrants/refugees/penal reform) despite the test data's framing — ABC-04 (intended as the positive/match case) triggered a genuine eligibility mismatch instead. The run was retained as a de facto completion of `EL-02` (the deliberately-mismatched case in `eligibility-check-test-plan.md`, bumped to v1.1 — caveat: its dashboard-badge step wasn't independently checked). `AB-Charitable-Trust-test-plan.md` bumped to v2.1: charity swapped to **Asylum Justice** (real charity, number 1112026) — its genuine, actual charitable objects (legal advice/assistance/representation for asylum seekers and refugees) are an unforced match against AB's Access to Justice and Migrants and Refugees categories, needing no invented "plausible alignment" wording. Required a new test account (`grantpathway+ABC2@gmail.com`) since `charity_profiles` is one-per-account (`docs/data-model.md` §2) and the original account stays reserved as EL-02's fixture. `TEST-DASHBOARD.md` bumped to v2.4. Not yet executed under the new charity.

**Why:** the exclusion list conflated two different concepts (organisational financial data-entry vs. project budget/cost questions) that the rest of the prompt and `acceptance-criteria.md` (AC-FR-45-03) already treat differently — budget questions are meant to still surface as narrative cards with disabled AI assist, not be silently discarded like true data-entry fields.

---

## 2026-07-25 — `tt-charity-lookup` flash bug (`GAP-36`): root-caused and fixed

Four hypotheses tested live and ruled out in earlier sessions today: browser-extension interference, `type="search"`'s native decoration, Base UI's `InputPrimitive` specifically, and a `side="top"` viewport-edge collision. WJ then tested a _second_ diagnostic tooltip on the same page (Charity name field) — it flashed too, ruling out "specific to the lookup input" and narrowing the cause to something page/component-wide.

With WJ's permission, drove his own already-authenticated Chrome session directly (no credentials entered or handled) to debug live rather than keep guessing blind. Used a `MutationObserver` plus dispatched pointer/focus events to watch `#charity-lookup` during the exact hover window: its `type` and `name` attributes were being toggled repeatedly. A controlled A/B on the same live page — an identical Base UI `Input` elsewhere with no tooltip attached — showed zero attribute churn under the same event sequence, isolating the cause to the tooltip wrapping specifically, not the input component itself.

**Root cause:** Base UI's `Tooltip.Trigger`, when composing its own props onto a polymorphic `render` target, applies button-oriented default props (`type`, `name`) — a sensible default for a `<button>` trigger, but setting `type` on a genuine `<input>` forces Chromium to reinitialise the native widget, blurring it instantly and closing the tooltip.

**Fix:** added a `wrapInStableSpan` option (plus a `spanClassName` passthrough for layout) to `components/contextual-tooltip.tsx`, reusing the existing focusable-span-wrapper mechanism that was previously only used for the hover-disabled case (`tt-ready-to-assemble`) — Base UI now composes its props onto a stable `<span>` instead of directly onto the input. Applied to `tt-charity-lookup`. The earlier disproven `type`/`side` experiments and the temporary diagnostic tooltip on Charity name were reverted/removed. Buttons, links, and plain text elements are unaffected (no `type`-dependent native behaviour) and don't need this — this is the only tooltip in the app wrapping a genuine `<input>`. `npm run type-check`, `lint`, and `test` (95 tests) all pass. Live re-confirmation by WJ still pending.

---

## 2026-07-25 — `tt-charity-lookup` flash bug (`GAP-36`): two more theories ruled out, third in progress

Both of the previous entry's candidate fixes turned out not to be it. WJ re-tested `type="text"` (previous entry) — still flashed, identically. Then, to isolate whether the styled `Input` component's underlying Base UI `InputPrimitive` was the cause, temporarily swapped it for a plain native `<input>` with matching styling — still flashed. So the cause is not the input's `type`, not the `Input` wrapper, and (from the previous entry) not a browser extension either.

Reverted both disproven diagnostic changes back to the original code (`Input` component, `type="search"` restored — that was intentional for the mobile "search" keyboard label, no reason to lose it now it's cleared). New hypothesis: the field sits close to the top of the page — only a heading, one padding block, and one line of label text above it — so a `side="top"` tooltip (every `ContextualTooltip` defaults to `side="top"`) may have too little vertical clearance and collide with the viewport edge. Some floating-position libraries hide the popup entirely rather than cleanly flipping side when this happens, which would look exactly like an instant open-then-vanish. Added `side="bottom"` to this one tooltip instance as a test. `npm run type-check`, `lint`, and `test` (95 tests) all pass. WJ stepped away mid-session; not yet confirmed either way.

---

## 2026-07-25 — `tt-charity-lookup` flash bug (`GAP-36`): fix attempted, pending confirmation

Live-debugging with WJ ruled out two leading theories one at a time: browser-extension interference (reproduced in Incognito across Chrome, Perplexity Comet, and Edge — all extensions off) and a mouse-only cause (also flashes when the field is reached via Tab, not just hover). This left `type="search"` as the standout difference — it's the only one of the 9 tooltips built on a native search input; the other 3 tooltips wrapping Base UI's own `Button` component (also `@base-ui/react/button` under the hood) are unaffected, so "wraps a Base UI primitive" isn't the differentiator, but "is a search input specifically" still is.

Changed `type="search"` to `type="text"` on the Charity Commission lookup field (`charity-profile-form.tsx`) — the field never used any native search behaviour (Enter is handled manually via `handleLookupKeyDown`, no `<form>` submit binding), so this is a safe, functionally-equivalent change either way. Not yet confirmed as the actual fix — logged in `ADR-TRACEABILITY.md`'s `GAP-36` row as "fix attempted, not yet confirmed" pending WJ's live re-test. `npm run type-check`, `lint`, and `test` (95 tests) all pass.

---

## 2026-07-25 — Three tooltips unreachable by keyboard, fixed (`GAP-38`); wrong copy fixed (`GAP-37`)

Live-testing HT-05's keyboard-only pass, WJ found only `tt-ai-help-limit` reachable via Tab/Shift+Tab on Step 4. Root cause: `tt-budget-no-ai` (Step 4 budget warning), `tt-guidelines-choice` (Step 2 intro), and `tt-summary-review` (Step 3 heading) each wrap a plain `<div>`/`<p>`/`<h1>` with no `tabIndex` — `ContextualTooltip`'s default path (`active` prop omitted) renders the child directly as the trigger with no focusable wrapper, so Base UI's hover/focus handling never gets a keyboard-reachable target for these three. A real WCAG 2.1.1 (Keyboard) failure, not test-data-dependent — the other 6 tooltips all wrap a real button/link/input and were unaffected. Fixed by adding `tabIndex={0}` plus the same `focus-visible` ring styling already used elsewhere in this codebase for non-button focusable elements (e.g. Step 2's upload dropzone).

Bundled in the same pass: `tt-summary-review`'s copy (`GAP-37`, found earlier the same session) was rewritten while this exact line was already being touched — from a caveat that can never actually apply to what's on screen, to a description of what the screen is for: "This is an AI-generated summary of the funder's guidelines — check it looks right before continuing. You can regenerate it if anything looks off."

`GAP-36` (`tt-charity-lookup`'s ~2ms open-then-close flash on hover) remains open — needs live browser debugging to root-cause, not fixable from a code read alone. `npm run type-check`, `lint`, and `test` (95 tests) all pass.

---

## 2026-07-25 — Tooltip persistence reversed and simplified (`PDR-UI-008` v3.0)

Continuing the same live-testing session that found the missing migration and built the "Reset tooltips" control (below), WJ stepped back and asked whether the whole persistence mechanism was actually adding value. Agreed: a missed migration, then needing a self-service reset control just to bring a dismissed tooltip back, was a lot of engineering and testing surface — a new table, RLS policies, grants to two roles, 5 trigger variants, dismiss/reset Server Actions — for a pre-launch product with no real users yet to have earned that complexity, versus a plain hover/focus tooltip with no memory (the pattern `tt-delete-account` already used).

Reversed: `components/contextual-tooltip.tsx` rewritten with no `variant` prop, no dismiss button, no persisted state — every tooltip is now an ordinary hover/focus hint. The only surviving prop beyond `content`/`children`/`side` is `active`, kept solely for `tt-ready-to-assemble` (hides the hint once its target button is no longer disabled). `actions/tooltips.ts` deleted entirely. The Reset tooltips control built earlier the same day is removed from `account-settings-form.tsx` — there's nothing left to reset. All 5 Server Component pages (`profile`, Steps 2–5) no longer fetch or thread dismissed-state. New migration `20260725000000_drop_user_tooltip_dismissals.sql` drops the table; pushed to `grant-pathway-dev`, confirmed via `to_regclass()`. `lib/database.types.ts` updated by hand (not full regeneration — this environment's `supabase gen types` collapsed an unrelated RPC's typed return shape, `reserve_ai_slot`, to generic `Json`, caught via diff before it could ship as a silent regression).

While rewriting `__tests__/contextual-tooltip.test.tsx` (6 tests → 4, matching the simplified component), removing an unrelated dead prop from `application-step3-summary.tsx` caused `react-hooks/set-state-in-effect` to newly flag 3 pre-existing, unchanged `useEffect` calls — the same 3 lines had identical disable-comments removed as "unused" during yesterday's `PDR-UI-008` build (see that PR's Consequences item 9). This looks like a real instability in this ESLint rule's bailout analysis tied to unrelated prop shape, not a code defect; re-added the 3 disables with a comment pointing at this history rather than refactoring tested, working Step 3 generation/progress-bar logic out of scope for this change.

Also removed per WJ's request, found in the same live-testing screenshot: Step 2's stale "Your guidelines are not saved between sessions" banner (`GAP-34`) — guideline text has been retained server-side since `GAP-33` (2026-07-14); the banner was deleted outright rather than reworded, since the Step 2 form's own re-upload behaviour is unchanged (session-only restore, not wired to the retained copy).

Docs updated: `PDR-UI-008` (new "Reversal" section, v3.0), `moscow-feature-register.md` (FR-49, v1.19), `data-model.md` (§5a removed, v1.16), `technical-design.md` (v1.22), `ADR-TRACEABILITY.md` (`GAP-34` and `GAP-35` both resolved/moot). `docs/Test Plans/help-and-tooltips-test-plan.md` still needs its own rewrite pass (HT-02/03/07 assumed persistence) — tracked as a follow-on, not done in this pass. `npm run type-check`, `lint`, and `test` (95 tests) all pass.

---

## 2026-07-25 — Missing tooltip-dismissal migration found; "Reset tooltips" control added (GAP-35)

Live-testing `PDR-UI-008` against `docs/Test Plans/help-and-tooltips-test-plan.md`: HT-01 (help centre links) passed. HT-02 (page-load tooltip dismiss-and-persist) first failed — `tt-charity-lookup` reappeared on every Profile page reload despite clicking its X. Root cause: migration `20260724000000_user_tooltip_dismissals.sql` was written and committed as part of yesterday's `PDR-UI-008` build, but never actually pushed to `grant-pathway-dev` — `supabase migration list --linked` showed it present locally with a blank remote column. The table not existing meant `getDismissedTooltipIds` silently caught its query error and returned an empty set (read as "nothing dismissed"), while `dismissTooltip`'s write also failed silently, since `contextual-tooltip.tsx` calls it as `void dismissTooltip(tooltipId)` and never checks the result. This is a deployment-step gap, not a code defect — the migration itself (RLS + grants to both `authenticated` and `service_role`) was written correctly, already applying the lesson from the 2026-07-23 account-deletion grant incident. Pushed via `supabase db push --linked`; HT-02 re-tested and passed.

While re-testing, WJ asked how a user brings back a tooltip once dismissed — there was no answer: nothing in `PDR-UI-008`'s spec or the code gave a self-service path, and `account-settings-form.tsx` (the natural home for such a control) only wraps the persistent delete-account warning. Logged as `GAP-35` in `ADR-TRACEABILITY.md`'s Gaps register. WJ then asked for it to be built immediately, to unblock further HT-0x testing rather than working around a one-way dismiss for the rest of the session. Added `resetAllTooltips()` to `actions/tooltips.ts` (deletes every `user_tooltip_dismissals` row for the current user — `tt-delete-account` and `tt-register-password` are unaffected, neither ever writes a row there) and a "Reset tooltips" section/button in `account-settings-form.tsx`, following the same success/error alert pattern already used for the password-change form on the same page. `npm run type-check`, `lint`, and `test` (97 tests) all pass.

---

## 2026-07-25 — react/react-dom peer-dependency conflict fixed; new postcss advisory patched

Dependabot PR #80 (`chore(deps): bump react-dom from 19.2.7 to 19.2.8`) failed every check — `react-dom@19.2.8` requires peer `react@^19.2.8`, but the PR only bumped `react-dom`, leaving `react` at `19.2.7`. `npm ci` failed immediately with an `ERESOLVE` conflict, taking `audit`, `lint-and-typecheck`, `test`, and the Vercel preview deployment down with it. `master` itself was never affected — confirmed via its own CI runs, all green. Fixed directly on `master` (not by pushing onto Dependabot's branch, which risks a force-push wiping any manual commit) by bumping both `react` and `react-dom` to `19.2.8` together; Dependabot is expected to auto-close #80 once it sees the target version already satisfied, as it has for prior PRs this week.

While verifying, `npm install` surfaced 12 new high-severity findings absent from this morning's clean `audit` CI run on this same commit (`found 0 vulnerabilities` at 15:33 UTC) — confirming these are freshly-disclosed advisories, not caused by the react bump (the lockfile diff touched only `react`/`react-dom`). Investigated each:

- **`postcss <=8.5.17`** (`GHSA-r28c-9q8g-f849`, path traversal via source-map auto-loading) — a same-major-version patch fix exists at `8.5.18`+. Raised the existing `postcss` override floor from `>=8.5.10` to `>=8.5.18`. Low risk, same playbook as the earlier `sharp`/`@hono/node-server` override fixes.
- **`brace-expansion <=5.0.7`** (`GHSA-mh99-v99m-4gvg`, DoS via unbounded expansion) — reached only via `eslint`'s own dependency tree (`@eslint/config-array`, `@eslint/eslintrc`, `eslint-config-next`'s `eslint-plugin-import`). No patched release exists in the installed `1.1.x` line (`1.1.16` is the last one ever published) — the fix requires `brace-expansion` 2.x+, which requires `minimatch`'s own major bump, which requires `eslint` 10. This is the exact same chain already blocking PR #70 (`eslint-config-next` incompatibility) — WJ already confirmed waiting it out rather than forcing a workaround. Left as-is: dev-tooling only (build-time lint), never shipped to users, and forcing an override here risks actually breaking `eslint` (an ESM-only rewrite under a CJS `minimatch@3.1.5`'s `require`), unlike the safe same-major-version `postcss` bump above.

`npm run type-check`, `lint`, `test` (97 tests), and `npm run build` all pass.

---

## 2026-07-24 — Help centre base URL corrected to the real GitBook address

WJ supplied an updated handoff spec (`grant-pathway-help-integration-spec_1.md`) confirming the actual GitBook help centre address: `https://rapidglobe.gitbook.io/grant-pathway`, not the placeholder `https://grantpathway.gitbook.io` used when `PDR-UI-008` was first built. Fixed the single source of truth, `lib/help-centre.ts`'s `DEFAULT_HELP_CENTRE_BASE_URL` — every help link (nav, footer, dashboard empty state) reads from this one constant, so no other file needed a change. Confirmed no test or doc hardcodes the old literal URL. Deep-linking (the spec's Part A table of per-page GitBook URLs) remains unbuilt, as already decided in `PDR-UI-008` — `helpCentreUrl(path)` already supports it as a one-line addition whenever that's wanted. `npm run type-check`, `lint`, and `test` (97 tests) all pass.

---

## 2026-07-24 — Help centre link + contextual tooltips built (`PDR-UI-008`)

WJ asked for a review of an externally-written spec (`grant-pathway-help-integration-spec.md`) proposing a persistent help-centre link and 11 in-app contextual tooltips (the spec's own P0/P1/P2 tables sum to 3+5+3=11 — an early effort estimate mislabelled this as "13," corrected in `PDR-UI-008` and here). After an effort estimate and a full technical plan (checked against Next.js's own Server Function docs, `ADR-SEC-002`, and `ADR-OPS-006`), WJ approved full scope.

**Checked the spec's assumptions against the actual codebase before building anything**, and corrected several: no tour library (`driver.js`/`intro.js`) was needed — a reusable `components/contextual-tooltip.tsx` wraps the existing `components/ui/tooltip.tsx` Base UI primitive instead, since none of the 11 items are a multi-step tour. No user-preferences table existed to persist dismissed-state server-side — new migration `20260724000000_user_tooltip_dismissals.sql` adds a normalized `user_tooltip_dismissals(user_id, tooltip_id, dismissed_at)` table (`text` + `CHECK`, not a Postgres `enum`, so a future tooltip doesn't need a two-deploy `ALTER TYPE`), RLS in the hardened form, grants to both `authenticated` and `service_role` in the same migration (the 2026-07-23 account-deletion incident happened because a prior table's migration granted only `authenticated`).

**Four tooltips' trigger variant was corrected mid-implementation** against the spec's own per-item trigger column, which an earlier planning pass had mis-grouped: `tt-charity-lookup`, `tt-budget-no-ai`, and `tt-governance-add-it` are `page-load` (not `focus`/`first-click` as first planned), and `tt-ai-help-limit` is `first-click` (not `hover-disabled`). The senior-review "checkbox" the spec describes for `tt-prior-export-signoff` doesn't exist — `application-step4-senior-review.tsx` has only two buttons, no checkbox; the tooltip targets the "Yes — assemble my draft" button instead.

**A real bug found and fixed along the way:** the AI-usage counter (`tt-ai-help-limit`'s "you've used X of 50 this month") had two separate discard points, not one. `app/api/refine-answer/route.ts` computed `current_usage` (already returned by the `reserve_ai_slot` RPC) and dropped it before responding. Separately, `.../step/4/page.tsx` computed an initial `currentUsage` at page load and never passed it as a prop at all — only two derived booleans were. Both fixed; `application-step4-draft.tsx` now keeps a live count in sync with each refine response.

**`tt-register-password` deliberately not built** — `register-form.tsx` already shows a permanent, always-visible hint below the password field with the exact same information a tooltip would add ("At least 12 characters, including letters and numbers"). A focus-triggered tooltip repeating it would be pure duplication, not added value; it's also structurally impossible to persist server-side pre-authentication (no `user_id` yet). 10 of 11 tooltips were built.

**New dev-only test infrastructure added**, since none existed for component-level tests: `@testing-library/react`, `@testing-library/jest-dom`, `happy-dom`. `vitest.config.ts` was `environment: 'node'`, `.test.ts` only — extended to also pick up `.test.tsx`, with a per-file `// @vitest-environment happy-dom` docblock so existing lib-level tests keep their `node` environment unchanged. `__tests__/contextual-tooltip.test.tsx` covers all 5 trigger variants (6 tests).

Found and fixed a stale documentation drift while touching `components/ui/tooltip.tsx`: `ADR-STACK-006` still said the UI library was built on Radix UI primitives; the actual code (and `ADR-OPS-006`'s own 2026-07-14 revision) has been on `@base-ui/react` for a while. Amended, not rewritten — the original Decision text is left in place with a dated correction, matching this repo's convention for factual drift.

`npm run type-check`, `npm run lint`, and `npm test` (97 tests, up from 91) all pass. **Live browser and accessibility verification (axe-core, keyboard-only pass, NVDA/VoiceOver) could not be performed in the implementing session** — this project's local dev server requires Supabase/AWS/Resend/Upstash credentials that read as redacted/empty in this environment, the same pre-existing limitation noted for prior sessions. WJ's own live testing is needed to confirm the tooltips actually render, dismiss, and persist correctly, and to complete the accessibility pass `ADR-OPS-006` requires as part of this feature's definition of done.

**Files changed:** `supabase/migrations/20260724000000_user_tooltip_dismissals.sql` (new), `lib/database.types.ts`, `actions/tooltips.ts` (new), `components/contextual-tooltip.tsx` (new), `__tests__/contextual-tooltip.test.tsx` (new), `vitest.config.ts`, `lib/help-centre.ts` (new), `components/nav-authenticated.tsx`, `components/nav-public.tsx`, `components/site-footer.tsx`, `components/dashboard-empty.tsx`, `app/api/refine-answer/route.ts`, `app/(authenticated)/applications/[id]/step/{2,3,4,5}/page.tsx`, `components/application-step{2,3,4,5}-*.tsx`, `app/(authenticated)/profile/page.tsx`, `components/charity-profile-form.tsx`, `components/account-settings-form.tsx`, `docs/PRD decisions/PDR-UI-008-help-centre-link-and-contextual-tooltips.md` (new), `docs/PRD decisions/PRD-DECISIONS-INDEX.md`, `docs/data-model.md`, `docs/Technical Decision and Design/ADR-STACK-006-ui-component-library.md`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `package.json`.

---

## 2026-07-24 — Help centre link + tooltips given their own test plan layer

`PDR-UI-008` (above) left verification as a manual to-do with no dedicated place to track it. Added `docs/Test Plans/help-and-tooltips-test-plan.md` under `DR-TEST-001`'s layer structure: 8 cases covering the help-centre link (4 locations), all 5 tooltip trigger variants (`page-load`, `first-click`, `hover-disabled`, `persistent`, and the deliberately-non-`ContextualTooltip` password hint), cross-session persistence (the one property that actually proves server-side storage over `localStorage`), and the `ADR-OPS-006` accessibility pass. Kept separate from the two flagship plans and the capability matrix — this is a horizontal UI concern spanning Profile, Steps 2-5, and Account Settings, not tied to a specific funder or guideline shape. `TEST-DASHBOARD.md` (v2.1) and `AGENTS.md`'s mandatory-coverage section updated to reference it. Not yet executed.

---

## 2026-07-24 — Test strategy restructured: funder-by-funder plans replaced with a capability/guideline-shape model (`DR-TEST-001`)

A routine review of `AB-Charitable-Trust-test-plan.md` against `grant-pathway-user-guide-v1.19.docx` surfaced that it still tested the funder picker/directory UI (search dropdown, "Structured" badge, "Request a Funder" link) removed entirely by `DR-FD-001` v1.4 on 2026-07-15. Separately, its ABC-04 eligibility-mismatch case assumed a mismatch was a soft, non-blocking observation — wrong since `DR-EL-001` (2026-06-02, predates this plan's v1.0), which made it a hard stop with no path to Step 4. That hard stop structurally conflicts with the same plan's later requirement to reach export in the same run.

Stepping back: both defects trace to the same root cause. The test suite in `docs/Test Plans/` has been organised one near-identical ~11-step plan per named funder since 2026-06-01, on the premise that Grant Pathway needed proving against a curated, approved funder set. That premise stopped holding on 2026-07-15 — extraction is driven per-application by whatever guidelines are uploaded, not by funder identity (`BD-04`; `ADR-DATA-006`'s "any guideline or form" direction). Testing by funder name after the product stopped varying on funder identity meant real, repeated drift: the same step-order bug was fixed across 11 plans on 2026-07-04, and the funder-picker removal was missed in at least this one plan for over a week.

**Decision (`DR-TEST-001`, WJ, 2026-07-24):** restructure into three layers — mechanical regression (unchanged, `regression-test-plan.md`), a new guideline-shape/capability matrix (`guideline-capability-matrix-test-plan.md`: multi-column table PDF, freeform narrative, pasted-text-only as a first-class path, large-document truncation, citation-coverage spot-check), and a new dedicated eligibility plan (`eligibility-check-test-plan.md`: 3 varied cases — positive match, clear negative hard-stop, borderline calibration check — rather than 1, since a single pass/fail proves the hard-stop mechanism but not whether the AI's eligibility judgement is well-calibrated). Two funders retained as flagship end-to-end plans (A B Charitable Trust — structured numbered-list PDF, tightest word limit tested; MK Community Foundation — mixed financial/governance/narrative/file-upload, character limits), chosen for least-overlap coverage between them, not because either is otherwise special. The remaining 10 named-funder plans (Baily Thomas, Clothworkers, CPF Trust, Garfield Weston, both Henry Smith plans, Idlewild, Lloyds, Nationwide, Walton, Wolfson) moved to `docs/Test Plans/archive/`; their genuinely useful defect history (Idlewild's D-IT-01, the origin of `DR-EL-001`'s IT-04 case, Wolfson's citation-fallback findings) is preserved via pointers in the new plans rather than lost.

**Explicitly accepted trade-off, not a strict improvement:** this gives up a direct, per-funder answer to "does funder X specifically still work" in exchange for closing real, currently-untested gaps (pasted-only guidelines as first-class, citation coverage, large-document truncation, Charity Commission lookup found/not-found — added to `regression-test-plan.md` as RT-01b) and cheaper ongoing maintenance. WJ took this trade-off knowingly after an explicit advantages/disadvantages discussion — see `DR-TEST-001`'s Rationale section for the full list, including the risk that the shape/capability abstraction could miss a funder-specific issue its shape-twin doesn't share.

`AGENTS.md`'s mandatory test-plan coverage rule rewritten accordingly: full end-to-end coverage remains mandatory for the two flagships and at least one capability-matrix path; individual matrix/eligibility cases may share a pre-seeded account rather than re-registering, matching `regression-test-plan.md`'s existing pattern.

**Files changed:** `docs/decisions/DR-TEST-001-capability-based-test-strategy.md` (new), `docs/decisions/DECISIONS-INDEX.md`, `docs/Test Plans/AB-Charitable-Trust-test-plan.md`, `docs/Test Plans/MK-Community-Foundation-test-plan.md`, `docs/Test Plans/guideline-capability-matrix-test-plan.md` (new), `docs/Test Plans/eligibility-check-test-plan.md` (new), `docs/Test Plans/regression-test-plan.md`, `docs/Test Plans/TEST-DASHBOARD.md`, `docs/Test Plans/archive/*` (10 files moved), `AGENTS.md`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-24 — Change-password fixed: GoTrue requires `current_password` in the `updateUser` payload itself

WJ tried to change the password on a test account (`grantpathway+walton1@gmail.com`) via Account Settings and got a generic "Something went wrong. Please try again." The current-password field showed no error, meaning `changePassword` (`actions/auth.ts`) got past `signInWithPassword` (the current password was correct) and failed later, at `supabase.auth.updateUser({ password: newPassword })`, returning a non-`weak_password` error the client always maps to the same generic message.

**First pass could not root-cause directly:** `changePassword` had zero error logging on this path — unlike `app/api/account/delete/route.ts`'s cascade, an `updateError` here was silently converted to `{ status: 'error' }` with nothing written to server logs. Reproducing locally via the Supabase Admin/anon APIs was also not possible in this environment — `SUPABASE_SERVICE_ROLE_KEY`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` read as empty strings here (secret redaction), so no authenticated Supabase call can be made from this session. Added logging only (`console.error('[change-password] Failed to update password:', { code, status, message })`) and asked WJ to retry.

**Root cause, confirmed via `vercel logs --query "change-password"` on the retry:** `code: 'current_password_required'`, `status: 400`, `message: 'Current password required when setting new password.'` — this Supabase project has `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` enabled, which makes GoTrue reject any `updateUser` password change that doesn't include a `current_password` field in that same request — regardless of the separate `signInWithPassword` re-verification `changePassword` already does immediately before it, which GoTrue has no visibility into. Confirmed via `@supabase/auth-js`'s own `UserAttributes` type (`node_modules/@supabase/auth-js/dist/main/lib/types.d.ts`): `current_password?: string` — "This is only ever present when the user is resetting their password and `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` is true." The initial hypothesis (a "Secure password change" reauthentication-nonce setting) was wrong — this is a different, simpler GoTrue setting entirely, one that's satisfied just by including the field, no nonce/OTP round-trip needed.

**Fix:** `changePassword` now passes `current_password: currentPassword` alongside `password: newPassword` in the `updateUser` call. The existing `signInWithPassword` verification step is unchanged and still gives the dedicated "Your current password is incorrect" UX before any update is attempted. `tsc --noEmit` and `eslint --max-warnings 0` clean, all 91 tests pass (unchanged — no unit test coverage existed for this server action; not addressed here).

**Two false alarms during live verification, both ruled out — not app bugs:** (1) After the fix deployed, WJ changed the password successfully (`auth.users.updated_at` confirmed bumped in the DB at the right moment) but then couldn't sign in with the new password. Suspected a rate limit at first — `changePassword`'s internal `signInWithPassword` re-verification consumes a sign-in attempt on every try, and `signIn`'s own error handling deliberately collapses every non-credentials error (including a genuine rate limit) into the same generic "email or password is incorrect" message, by design, to prevent email enumeration (AC-FR-04-03) — so a real rate limit would have looked identical to a wrong password. Added the same server-side-only logging to `signIn` to check; the actual logged error was `invalid_credentials`, ruling out a rate limit. (2) With rate-limiting ruled out and the DB write confirmed correct, WJ used the "Forgot password" reset flow (a separate code path, no `current_password` involved) to set a fresh password and confirmed sign-in worked — proving the underlying Auth/DB stack was healthy throughout. The true cause of the two failed sign-ins was simply mismatched password values between attempts (WJ normally copy-pastes test passwords from a notepad file rather than retyping, and confirmed this practice) — not a defect in either the `current_password` fix or `signIn`. **Live-verified 2026-07-24, same day:** WJ changed the password again, copy-pasted the exact new value from notepad, and signed in successfully on the first attempt.

**Files changed:** `actions/auth.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

**Files changed:** `actions/auth.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-23 — Account deletion fixed: `service_role` was missing table grants on the two newest item-graph tables

WJ tried to delete a test account (`grantpathway+lloyds1@gmail.com`, 2 applications) via Step 8.2's "Permanently delete my account" flow and got a generic "Deletion failed. Please try again." His own first hypothesis — that he'd clicked the delete button before typing `DELETE` in the confirmation box — was ruled out: the client-side confirmation check runs before any network call and shows a different message ("Please type DELETE in capitals to confirm"), so reaching the generic server error means the confirmation had already passed.

**Root-caused via `vercel logs --environment production --query "delete-account"`:** the real error was `42501: permission denied for table application_items`, thrown on the very first step of `app/api/account/delete/route.ts`'s cascade (`service` client's `.from('application_items').delete()`). A `select count(*)` re-check on every affected table after the failed attempt confirmed nothing had been deleted at all — the cascade aborted immediately on step 1, before touching `application_guidelines`, `applications`, or anything else.

**Root cause, confirmed by querying `information_schema.role_table_grants`:** `application_items` and `application_guidelines` (both added later, 2026-07-14, in `20260714000000_p6_2_application_item_graph.sql` and `20260714000001_gap33_application_guidelines.sql`) only ever granted `select, insert, update, delete` to `authenticated` — following `20260521000000_grant_table_permissions.sql`'s pattern for that role — never to `service_role`. The four original tables (`user_profiles`, `charity_profiles`, `applications`, `ai_usage_log`) already carry full `service_role` privileges, granted ad hoc at some earlier point outside any tracked migration (their grantor is `postgres`, but no migration file in the repo contains a `service_role` grant) — so this class of gap has existed since the item-graph rearchitecture and was invisible until a `service_role` code path (account deletion is the only one) actually touched these two tables.

**Fix:** new migration `20260723000000_grant_service_role_item_graph_tables.sql` grants `select, insert, update, delete` on both tables to `service_role`. Applied to `grant-pathway-dev` (currently linked project) and verified via `information_schema.role_table_grants` — both tables now show full `service_role` privileges. **Not yet applied to `grant-pathway-prod`** — same outstanding gap as the existing schema-drift tracking (`grant-pathway-prod` remains unlinked/behind per the Phase 6 convention until P5.4).

Purely additive (a `GRANT`, no data or schema change) — no user data was affected by the failed attempt; WJ's account and its 2 applications, 20 items, 1 guidelines row, and 10 `ai_usage_log` rows are all still intact, confirmed by direct count both before and after the failed attempt.

**Files changed:** `supabase/migrations/20260723000000_grant_service_role_item_graph_tables.sql`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-23 — Citation-highlight fix: list-bullet glyph tolerance

WJ, continuing a Garfield Weston test application on Step 4, noticed Q1 ("Total annual expenditure")'s citation badge opened the viewer with the quote correctly highlighted and scrolled to, but Q9 ("Your finances")'s badge — same funder, same document — opened the viewer with no highlight, landing on Page 1.

**Root-caused with `supabase db query --linked`** against `grant-pathway-dev`: pulled the actual `guideline_reference` for both items plus the retained `application_guidelines.guideline_text`. Q1's quote ("Please provide a breakdown of how much your organisation plans to spend") is a clean, unbroken sentence in the source. Q9's stored quote reads "We need to understand: that you have a robust plan to fund your work" — but the source PDF's actual text is "We need to understand:\n■ that you have a robust plan to fund your work" (a bulleted list, one bullet per line). The AI, quoting "verbatim," treated the "■" bullet glyph as decorative list formatting and quoted straight through it — reasonable behaviour, but `findQuoteRange`'s word-matching regex only tolerated whitespace between words, and a non-whitespace "■" sitting between "understand:" and "that" broke the match entirely, same shape of bug as the 2026-07-15 punctuation-tolerance fix and the 2026-07-17 heading-path fixes.

**Fix:** `findQuoteRange` (`lib/guideline-citations.ts`) now folds a small set of list-bullet glyphs (`■ • ● ▪ ◦ ‣ ·`) into the same separator it already uses for whitespace between quote words, so a bullet sitting amid the whitespace no longer breaks the match. This is a general fix, not scoped to Garfield Weston or to budget questions — it benefits any funder's guidelines where a bulleted list item gets quoted straight through its own bullet marker (PDF bullets frequently survive extraction as literal characters — see `lib/extract-text.ts`). No stored `guideline_reference` data needed correcting; the existing quote was already fine, only the client-side matching logic was too strict.

`tsc --noEmit`, `eslint --max-warnings 0`, all 27 tests in `guideline-citations.test.ts` pass (1 new — the exact live Garfield Weston case).

**Files changed:** `lib/guideline-citations.ts`, `__tests__/guideline-citations.test.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-21 — `[ITEM N]` citation fallback marker built (Wolfson zero-citation defect)

While generating screenshots for the user guide, WJ noticed the Wolfson Foundation's guidelines produced zero citations on Step 4, contradicting the app's own "We identified 6 sections to complete" summary. Investigated via `supabase db query --linked` against `grant-pathway-dev` and a live production log tail (`vercel logs --follow --environment production`) while WJ re-triggered a regeneration: `guideline_reference` was null on all 6 items, both today and on an earlier 2026-06-05 test of the same funder, and — tellingly — no per-citation debug warning fired at all (the logging `363afcc` added on 2026-07-17 only fires when a citation is _offered but invalid_; here nothing was ever offered).

**Root cause, confirmed by unzipping the actual docx:** every paragraph uses Word's default "Normal" style — zero `w:pStyle` Heading references anywhere in the file. "Applicant details", "Project details" etc. are plain paragraphs that only _look_ like section titles (bold), not real Word headings. `tagSectionsFromHtml()` (`lib/extract-text.ts`) only promotes real `<h1>`-`<h6>` tags to `[SECTION: ...]` markers, so this document produced none; being a docx, not a PDF, it also never gets `[PAGE N]` markers. The whole guideline carried no structural marker of any kind — the prompt's own "if you can't identify a marker, set citation to null" instruction was working exactly as designed. This is a genuine gap in what the tagging pipeline can anchor to, not a validation bug — and not Wolfson-specific: any short, flat, unheaded guideline (docx or pasted) hits the same wall.

**Fix (WJ's proposal — "can we not number the bullets and use them as citations?"):** a third citation `source_type`, `'item'`, anchored to a new `[ITEM N]` marker — one per paragraph/bullet/line — inserted only as a fallback when a document has no heading (or page) structure at all. Documents with real headings are completely unaffected, keeping the change scoped to exactly the class of document that was broken:

- `lib/extract-text.ts`'s `tagSectionsFromHtml()` and `lib/preprocess-text.ts`'s `tagPastedTextSections()` both gained the `[ITEM N]` fallback (docx and pasted-text paths respectively)
- New `lib/structural-markers.ts` consolidates the marker-recognition regex, previously duplicated across four separate hardcoded literals (three in `preprocess-text.ts`, one in `guideline-citations.ts`) — a shape of bug where a future marker type could easily be added to some copies but not others
- `lib/guideline-citations.ts` (`RawCitation`/`ValidMarkers` types, `extractValidMarkers`, `validateCitation`, `toGuidelineReferenceColumn`), `lib/types.ts`'s `GuidelineCitation`, the `citationSchema` in `app/api/generate-summary/route.ts`, and `lib/prompts.ts`'s citation instructions all gained the `'item'` branch
- `components/application-step4-draft.tsx`'s `citationFullLabel()` renders it as "Item N of the guidelines"; the "view original guidelines" text panel needed **no change** — it only ever searches for the `quote` string, never marker syntax, so it was already type-agnostic
- New migration `20260721000000_citation_item_marker.sql` extends the `application_items_guideline_reference_shape` CHECK constraint with a third disjunct; applied to `grant-pathway-dev`, prod push not yet done (flagged, per the existing schema-drift practice, as a separate explicit step)
- `ADR-DATA-007` amended; `docs/data-model.md`, `technical-design.md`, and `docs/PRD inputs/acceptance-criteria.md` (FR-48/AC-FR-48-02) updated to match

New test coverage: extended `__tests__/guideline-citations.test.ts` and `__tests__/preprocess-text.test.ts` with `item`-branch cases, and added `__tests__/extract-text.test.ts` (`tagSectionsFromHtml` had zero prior unit coverage — closed as part of this fix, by exporting the previously-private function). `tsc --noEmit`, `eslint --max-warnings 0`, and all 90 tests pass.

**Live-verified same day.** The first re-test attempt showed no citations — not because the fix failed, but because `components/application-step3-summary.tsx` only auto-calls `/api/generate-summary` when the DB has no existing summary yet for that application. Re-uploading the guideline and clicking through steps on an application that already had a cached summary silently skipped regeneration entirely (confirmed via `vercel logs`: zero `/api/generate-summary` requests that session, and `application_guidelines.guideline_text` unchanged from before the fix). WJ then explicitly clicked "Regenerate summary" on Step 3 and confirmed badges "Item 6 of the guidelines" / "Item 9 of the guidelines" now render correctly on Step 4 — the fix is confirmed working end-to-end, not just in unit tests.

**Two new findings from that same regeneration, logged but not yet investigated:** (1) the budget-flagged "Financial information" section shows no citation badge at all, unlike every narrative section (all of which got one) — unknown whether budget items are meant to be excluded from citation the same way they're excluded from AI-assist, or whether this is a gap; (2) the AI's own section count varied between identical runs on the same guideline — 6 sections in one extraction, 7 in the next, which WJ noticed directly. This echoes the extraction-determinism issue already addressed once (temperature:0 + anti-merge rule, 2026-07-15) — worth checking whether that fix still holds generally or this is a fresh instance of the same non-determinism. Neither has been acted on yet.

---

## 2026-07-17 — Session wrap-up: PDR-AI-010 decided and built, live-testing confirmed, one open finding logged

Reviewed a fresh Stony Stratford export (`NEO_stony_first_test_0759_170726_Application.docx`) as an end-of-session sanity check. All 12 items (3 governance facts + 9 narrative sections) are present, correctly sequenced, and persisted — confirming today's Step 4 sync fix holds across a full assemble/export cycle. Footer version matches the latest push. WJ: "Job done, it looks much better."

**PDR-AI-010 decided and built same day.** The "Finances of Your Group" duplication WJ flagged earlier (citing the same quote as a separate governance-fact card) is addressed via a new decision record: `buildSummaryPrompt()`'s "sections" rule now handles a themed financial section whose only content is numeric fields already captured by the 5 governance facts — still creates the section (the guidelines named the theme) but reframes its guidance as an explicit "tell us in your own words" invitation and omits its citation rather than duplicating one a governance fact already owns. Chosen over WJ's initially-proposed unconditional catch-all specifically to avoid repeating the anti-pattern `PDR-AI-008`'s original always-on governance block was corrected away from (an unconditional, guideline-unlinked card). Full detail in `docs/PRD decisions/PDR-AI-010-financial-section-catch-all.md`.

**One new finding, not yet acted on:** the fresh export's item 3 ("Are any of your trustees related to each other...") appears to be a hallucinated governance fact — neither Stony Stratford source document (`Stony Stratford Grant-Application-Form-2026.docx`, `Stony-Stratford-Town-Council-Grant-Scheme-2026-27-adopted-FC0226.docx`) contains any mention of trustee relatedness, even indirectly, contradicting `PDR-AI-008`'s "do NOT extract a field_key the guidelines never raise" rule and `TEST-DASHBOARD.md`'s existing 2-of-5-signal review for this funder. WJ: formal testing (to be recorded) will cover this rather than an ad-hoc dashboard update now — logged here so it isn't lost before that test.

**Temporary debug logging (added earlier today) kept deliberately, not removed.** WJ wants it retained to help diagnose any further citation-reliability issues during ongoing testing, but was explicit it must not reach production — added an explicit checklist item to the Phase 6 → Go-Live Gate (`IMPLEMENTATION-PLAN.md` v3.18) to confirm removal (or environment-gating) before DNS cutover, rather than relying on it being remembered.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 76 tests pass (unchanged). PDR-AI-010's prompt change is not independently verifiable against a real Bedrock call locally (`dotenvx` redacts AWS credentials for this agent) — a future guideline upload for a wholly-numeric financial section is the outstanding live-verification step. WJ is finishing the user guide next; test plans across all funders will be revised once that's done, given today's cumulative improvements.

---

## 2026-07-17 — Budget fields now also reflect the approved-state tint (extends the Yes/No dropdown fix)

WJ confirmed the Yes/No dropdown fix, then pointed out the same white-regardless-of-approval problem on every **budget-flagged** field too — the two £ governance inputs (total expenditure, reserves) and any budget-flagged narrative `Textarea` (e.g. "Budget for this Project"). The earlier CHANGELOG entry above had assumed the budget fields' hardcoded `bg-white` was a deliberate choice ("keeps manually-entered figures looking visually distinct") — WJ's ask makes clear that assumption was wrong; he wants every field, budget or not, to behave consistently once approved.

**Fix:** removed the `bg-white` override from the £-prefixed governance `Input` (`h-10 bg-white pl-6 text-[14px]` → `h-10 pl-6 text-[14px]`) and the budget-conditional on the ordinary narrative `Textarea` (`` `text-[14px] ${q.isBudgetQuestion ? 'bg-white' : ''}` `` → `"text-[14px]"`). Both now fall through to the shared `Input`/`Textarea` components' own `bg-transparent` default, same as every non-budget field already did.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 76 tests pass (unchanged). Not verified visually in this environment (same constraint as the dropdown fix) — WJ's next look at Step 4 is the verification step for all three field types together (dropdown, £ input, budget textarea).

---

## 2026-07-17 — Governance Yes/No dropdown now reflects the approved-state tint like every other field

WJ noticed once-approved cards turn green throughout Step 4 — except the Yes/No dropdown used for two of the five governance facts (trustee-relatedness, bank-signatories-relatedness), which stayed flat white regardless of approval. Compared side by side: Q3 ("Are any of your trustees related...", a `<select>`) stayed white; Q4 ("Description of Project", an ordinary `<Textarea>`) correctly turned green.

Root cause: `components/ui/input.tsx` and `components/ui/textarea.tsx` both default to `bg-transparent`, letting the parent card's tint (white/amber/green depending on approval and budget status) show through underneath — that's how every ordinary answer field already reflects approval. The governance Yes/No field is a plain native `<select>`, not built on either shared component, and was hardcoded to `bg-white` — never transparent, so it could never pick up the parent's colour regardless of approval state. Not a deliberate design choice (unlike the budget fields' deliberate always-white `bg-white`, which keeps manually-entered figures looking visually distinct) — just an oversight from building the dropdown with a plain baseline background rather than matching the transparent pattern every other non-budget field already uses.

**Fix:** changed the select's `bg-white` to `bg-transparent`, matching `Input`/`Textarea`'s existing pattern exactly.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 76 tests pass (unchanged — no existing coverage of this component). Not verified visually in this environment — reproducing an approved governance Yes/No item needs real application data this environment doesn't have set up, and the preview tool has been unreliable for this project all session; WJ's next look at Step 4 is the verification step.

---

## 2026-07-17 — Citation badges now truncate long headings

WJ confirmed item 4's citation fix worked ("brilliant") but flagged item 6's as much worse — its badge rendered an entire multi-sentence instructional paragraph verbatim, because Stony Stratford's source document applies a Heading style to "a) Give details of expenditure required for your project e.g. materials, equipment, professional fees..." rather than a short title. That citation is genuinely valid (a real marker, correctly found) — the source document's own styling choice is just unusually verbose, and nothing in `components/application-step4-draft.tsx`'s `citationLabel()` bounded the badge's length at all.

**Fix:** `citationLabel()` now truncates at a word boundary past 90 characters (chosen so item 4's own 86-character citation, which WJ was happy with, renders completely unchanged). The full, untruncated text remains available via the badge button's `title` attribute (hover) and inside the "view original guidelines" panel it opens — nothing is actually lost, only the badge's own display width is bounded. General fix: any funder whose document styles a long paragraph as a heading would hit the same badge-blowout, not just this one.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 76 tests pass (unchanged — no existing coverage of this component, consistent with prior fixes to this file). Verified via a standalone script: item 4's 86-character label passes through unchanged; item 6's paragraph-length label truncates cleanly at a word boundary.

---

## 2026-07-17 — Step 4 sync silently broken for any funder with both governance facts and narrative items (regression since 2026-07-15)

WJ regenerated Stony Stratford again and asked to check `vercel logs` per the debug logging added minutes earlier. The pull surfaced something far more serious than the citation gap it was meant to diagnose:

```
[step4] free_form upsert failed: null value in column "added_manually" of relation "application_items" violates not-null constraint
```

Root cause: `resolveGovernanceInserts()` (`lib/governance-items.ts`) always sets `added_manually` explicitly on governance-fact rows (added 2026-07-15, PDR-AI-008 fast-follow's manual-add migration). The narrative section/question insert objects in `app/(authenticated)/applications/[id]/step/4/page.tsx` — both the free_form and structured branches — never set it at all. When both get merged into a single `.upsert()` call (any funder with detected governance facts _and_ narrative items — Stony Stratford's exact case, and likely others), PostgREST needs a consistent column set across the whole batch and fills the missing key with `NULL` for the narrative rows rather than falling back to the column's default, tripping the `not null` constraint on every affected row. The entire upsert fails atomically — silently, caught in a try/catch that only logs to the server, never surfaced to the user — so Step 4 keeps showing whatever was already in the database no matter what the AI regenerates.

This has almost certainly been latent since the `added_manually` migration (`20260715001`) landed 2026-07-15 and simply hadn't been re-triggered by a fresh sync of a funder with both governance facts and narrative content until now. **Retroactive implication:** any regeneration of a funder with governance signal, on or after 2026-07-15, may have silently failed to sync — worth keeping in mind if any other funder's test data looks stale despite a reported regenerate.

**Fix:** added `added_manually: false` explicitly to both the free_form section inserts and the structured question inserts, matching the governance insert's explicit pattern.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 76 tests pass (unchanged — no existing test coverage of this Step 4 sync code, consistent with prior fixes to this file).

---

## 2026-07-17 — Citation heading_path fix, corrected: assembled from two markers, not one (third attempt, same Stony Stratford gap)

With the sync bug above fixed, `vercel logs` also gave direct visibility into the actual raw citations the AI was returning — something the two earlier same-day citation fixes could only speculate about. Both failing citations (the "Alignment with Council's Overarching Principles" section, and separately "Budget for this Project") turned out to share one real cause, different from either earlier hypothesis: the model was constructing a two-element `heading_path` by joining two separate, consecutive `[SECTION: ...]` marker lines that merely _read_ like parent/child in the prose (e.g. a tick-list heading immediately followed by a narrative-instruction heading) — but running the real extraction pipeline (`mammoth`/`tagSectionsFromHtml`) locally against the actual Stony Stratford `.docx` confirmed every single marker in this document is flat, single-element, with no genuine nesting anywhere at all. A heading_path assembled by combining two flat markers can never match a real one, so `validateCitation()` correctly (if unhelpfully) rejected it every time — the earlier punctuation-tolerance fix was solving a real but different problem, and remains a valid general fix in its own right.

**Fix:** `buildSummaryPrompt()`'s citation rule (`lib/prompts.ts`) now explicitly says heading_path must be copied from a single marker line, split only on a " > " the marker line itself already contains — never assembled from two separate marker lines just because one heading appears to introduce the next. Corrected the prior "Fixed 2026-07-17" doc comment, which had claimed the tick-list/narrative fix resolved this — it didn't, on its own.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 76 tests pass (unchanged). Not independently verifiable against a real Bedrock call locally (`dotenvx` redacts AWS credentials for this agent) — WJ's next regeneration, now that the sync bug is also fixed, is the outstanding live-verification step for both the citation gap and the underlying Step 4 sync.

---

## 2026-07-17 — Per-citation debug logging added (Stony Stratford gap persists after two fixes)

WJ regenerated Stony Stratford again after the punctuation-tolerance fix (below) and found item 4 still had no citation badge — plus a new gap on item 6 ("Budget for this Project"), which _had_ carried a citation in the very first test round. Item 6's real marker (`5. BUDGET FOR THIS PROJECT.`) contains no apostrophe/dash, so the punctuation fix can't explain its loss — the most likely explanation is ordinary run-to-run variance in the model's citation-reporting (temperature is already 0 for this route, but this project has hit temperature-0 non-determinism before, e.g. the 2026-07-15 Step 3 extraction-determinism fix).

Rather than propose a third speculative fix, `app/api/generate-summary/route.ts`'s citation-reconciliation loop now logs the raw `citation` object whenever one is offered but fails validation — previously only visible in aggregate (a warning if over half of all offered citations are invalid, which a single stray miss never trips). This surfaces the actual heading_path/quote the model returned for a specific miss via `vercel logs`, without needing a reproducible local Bedrock call (`dotenvx` redacts AWS credentials for this agent). Temporary/diagnostic — intended to be removed once citation reliability is no longer under active investigation.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 76 tests pass (unchanged — no test coverage of route-level logging). WJ's next regeneration plus a `vercel logs` pull is the next diagnostic step.

---

## 2026-07-17 — Citation validation made punctuation-tolerant for heading paths (second fix for the same Stony Stratford gap)

WJ regenerated the Stony Stratford summary after this morning's tick-list-plus-narrative-follow-up prompt fix and confirmed "Alignment with Council's Overarching Principles" still had no citation badge — the earlier fix alone didn't close the gap.

Investigation ran the actual `mammoth`/`tagSectionsFromHtml` extraction pipeline (`lib/extract-text.ts`) against the real Stony Stratford `.docx` locally — no Bedrock call needed, since extraction is pure local library code — and confirmed a real `[SECTION: ...]` marker does exist for this heading: `SSTC overarching principles > Which of the Council's overarching principles do you believe your project aligns with?`, using the source's real **curly apostrophe** (’) in "Council's". This is the only heading in the entire document containing an apostrophe. `validateCitation()` (`lib/guideline-citations.ts`) compares the AI's reported `heading_path` against real markers with a byte-exact `Set.has()` — no punctuation tolerance at all — while its sibling function `findQuoteRange()` (used for on-screen quote highlighting) already tolerates exactly this curly-vs-straight-apostrophe variation, found live once before (2026-07-15, MK Community Foundation). An AI-reported heading_path using a straight apostrophe (the LLM's routine "verbatim" quoting behaviour, per that same precedent) would fail the exact match and get silently dropped to no citation — a highly plausible explanation for why this specific heading, and only this one, kept failing.

**Fix:** moved `EQUIVALENT_PUNCTUATION_CLASSES` earlier in `lib/guideline-citations.ts` and added `normalizePunctuationForMatch()`, applied to both `extractValidMarkers()`'s stored heading paths and `validateCitation()`'s incoming `heading_path` lookup — the same tolerance `findQuoteRange()` already has for quotes, now applied consistently to marker matching too. New regression test reproduces the exact Stony Stratford heading and apostrophe variant. This is a general fix, not specific to this one form — any funder whose heading text contains an apostrophe, curly quote, or en/em dash was equally exposed.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 76 tests pass (75 existing + 1 new). Not independently verifiable against a real Bedrock call locally (`dotenvx` redacts AWS credentials for this agent) — WJ's next regeneration of this application is the outstanding live-verification step, alongside the earlier tick-list-plus-narrative-follow-up fix (both may have been needed together).

---

## 2026-07-17 — PDR-AI-009 false-positive investigated: compound questions, no change made

Continuing Stony Stratford Town Council live testing, WJ hit the "does not appear to address the question" warning (`PDR-AI-009`, built and live-verified earlier the same day) repeatedly enough to ask whether it needed loosening — on §5 "Application Background" (5 sub-asks bundled into one guidance paragraph: need, how identified, user involvement, headcount, duration) and §8/9 "General Activities of the Group" (3 sub-asks: activities, meeting frequency, accessibility).

Investigation found a confound before concluding the check was miscalibrated: both flagged test answers reused an identical boilerplate opening sentence copy-pasted from a different question's answer, which the prompt's own instruction already names as something that should fail the check ("boilerplate unrelated to the question"). WJ isolated the variable with a clean test — §11 "Publicity and Marketing" (a single, non-compound question) with a fresh, non-reused, on-topic answer — and got no warning at all, confirming the check works correctly for ordinary single-ask questions.

**WJ's call: no prompt change.** A compound question genuinely asks for several distinct things; flagging an answer that only covers some of them is a defensible reading of "does not address the question," not the same failure mode as the original Henry Smith case (wholly irrelevant filler text) this PDR was built to fix. Recorded in `PDR-AI-009`'s revision history rather than left as an unresolved live-test complaint.

---

## 2026-07-17 — Citation extraction fixed for tick-list-plus-narrative-follow-up sections

WJ live-tested Stony Stratford Town Council's guideline form (a "worst case" test document) and found 10 of 11 extracted items carried a citation badge, but "Alignment with Council's Overarching Principles" — the one section built from a tick-list ("3.1 Which of the Council's overarching principles do you believe your project aligns with? [tick table]") plus a separate narrative follow-up on the same topic ("3.2 Please outline how you believe your project aligns with these aims") — had none.

Investigation confirmed this wasn't a display bug: `validateCitation()` (`lib/guideline-citations.ts`) only checks that the AI's reported page/heading marker exists in the source text — it never inspects the quote's content — so a missing badge means the model itself returned `"citation": null`. The most likely cause: `buildSummaryPrompt()`'s citation rule already tells the model never to quote "a nearby word limit, character limit, **formatting instruction**, or other incidental detail" next to a question/section — and a tick-list intro ("tick all that apply") reads exactly like a formatting instruction. Faced with a section synthesised from a tick-list plus a narrative follow-up, the model likely couldn't tell which part counted as the section's "own text" and defaulted to no citation at all rather than guess.

**Fix:** added an explicit rule to the citation instruction in `lib/prompts.ts` — when a question/section combines a selection/tick-list instruction with a narrative follow-up on the same topic, the follow-up instruction's own wording _is_ the item's own text for citation purposes, not an incidental detail to avoid. This targets the general pattern (any funder combining a tick-list with a "please outline/explain how" follow-up), not just this one form.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged — no existing coverage of prompt string content). Not independently verifiable against a real Bedrock call locally (`dotenvx` redacts AWS credentials for this agent) — WJ's next guideline upload for Stony Stratford is the outstanding live-verification step.

---

## 2026-07-17 — Export date fixed to one timestamp per application

WJ live-tested a real Henry Smith application export and spotted a 2-minute gap between the "Date:" shown in the .txt export ("08:24") and the .docx export ("08:22") of the same application — an inconsistency he'd caught while reviewing the exports as part of confirming the site footer version fix (below) had reached the export document too.

Root cause: `app/api/export/[applicationId]/route.ts` computed `exportDate` as `new Date()` live on every request, so exporting each format separately — or re-downloading either format weeks later — showed a fresh timestamp each time, for what should read as one snapshot of the application. This is distinct from `applications.last_exported_at`, which is intentionally refreshed on every export to drive the separate "you already exported this" re-export warning — that column's behaviour is correct and unaffected.

**Fix:** new nullable `applications.first_exported_at` column (migration `20260717000000`, `grant-pathway-dev` only), set once on an application's very first export in either format and never overwritten again. The export route now reads this column for the displayed date instead of computing it live. `lib/database.types.ts` regenerated via `supabase gen types typescript` — the regeneration also required manually restoring a previously-lost type refinement for the `reserve_ai_slot` RPC's `Returns` shape (the CLI still can't introspect this function's actual return columns, same limitation as when the types file was first generated 2026-06-22).

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged). New `acceptance-criteria.md` AC-FR-37-03A; `PDR-DH-003` revision history updated; `docs/data-model.md` bumped 1.13 → 1.14; `technical-design.md` bumped 1.18 → 1.19.

---

## 2026-07-17 — Site footer now shows the app version

WJ asked live during Henry Smith testing whether the site footer should show a build/version id, given the confusion that same session about which of two similarly-named test applications he was looking at. Agreed to add one, deferred to the next session ("in the morning").

Not a new decision — the underlying versioning scheme (`YYYY.MM.DD-<short SHA>`, sourced from Vercel's build-time git commit metadata) was already proposed, approved, and built on 2026-07-02 (see that date's entries below), via `lib/version.ts`'s `getAppVersion()`. It was previously wired into only the **export document's** footer (`app/api/export/[applicationId]/route.ts`) — the live app's own footer (`components/site-footer.tsx`) had never shown a version at all. **Built:** `components/site-footer.tsx` now calls the same `getAppVersion()` helper and renders `Grant Pathway v<version>` beneath the existing tagline, in muted text consistent with the rest of the footer. No new design decision required — same helper, same format, second call site.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged, no existing coverage of this component).

**Live-verified by WJ the same day:** screenshot confirmed "Grant Pathway v2026.07.17-9d8d30c" rendering correctly beneath the tagline in the deployed footer.

---

## 2026-07-17 — PDR-AI-009 built: AI refine relevance-check consistency

WJ reviewed two live scenarios from Henry Smith Step 4 testing (screenshots supplied 2026-07-16) where "Help me improve this" declined to touch clearly irrelevant/off-topic filler text when the answer was over its word limit, but passed the same kind of content straight through unchanged when the answer was under limit. Investigation found this decline behaviour is not a designed safeguard: `buildRefinePrompt()` (`lib/prompts.ts`) has no relevance-check instruction at all — the sole safety net against irrelevant AI output is `DR-AI-003`'s Option A (mandatory human review checklist before approval), not anything in the prompt itself. The inconsistency WJ found is emergent LLM behaviour, not a bug in any existing logic. WJ: "A human checklist will not be enough, let's refine the prompt to make it consistent and tighter."

Design agreed the same morning, recorded as `PDR-AI-009`: `buildRefinePrompt()` always attempts its structure/clarity pass regardless of word-limit status (removing the limit-dependent inconsistency), but also judges whether the answer plausibly addresses the question at all — if not, it prepends a clearly-flagged warning line (new exported constant `REFINE_IRRELEVANT_WARNING`) to the same `refinedText` output rather than declining outright. Two alternatives were considered and rejected: always declining outright (needs a new API/UI shape to represent "declined," not a prompt-only fix) and always polishing silently (removes the model's only existing signal, the opposite of "tighter"). No API change — the warning rides inside the existing single-string response.

**Built same day.** One risk found and fixed during implementation: the "Suggested improvement" panel already displays `refinedText` correctly (its existing `whitespace-pre-wrap` rendering shows the warning as its own line, no UI change needed there), but "Use this improved version" previously saved that text verbatim — meaning the literal warning sentence could have ended up saved as part of the charity's actual answer if a user clicked through without reading it. Fixed with a `stripRefineWarning()` helper in `components/application-step4-draft.tsx` (matches `REFINE_IRRELEVANT_WARNING` by exact string, duplicated locally rather than importing the server-only `lib/prompts.ts` into this client component) applied both before adopting the suggestion and before computing `PDR-AI-006`'s "still over the limit" word/character count, which would otherwise have been inflated by the warning line itself (verified: 26 words/147 characters raw vs. the correct 8/39 once stripped). `tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged, no existing coverage of this component).

**Live-verified by WJ the same day:** retested a real Henry Smith safeguarding question (300-word limit) with the same irrelevant filler text from the original screenshots. Over the limit (503 words), the warning line appeared exactly as designed, followed by a suggestion compressed to within 300 words (no shortfall message shown). WJ confirmed the mid-text compression seen in the suggestion is expected, pre-existing behaviour from `buildRefinePrompt()`'s over-limit instruction (unrelated to this fix, and distinct from `PDR-AI-007`'s deterministic "Trim to limit"). WJ: "we can safely say this has passed testing."

---

## 2026-07-16 — Manually-added governance items no longer skip the assembly gate when blank

While digesting a live Henry Smith test scenario (screenshots: "8 of 8 questions approved", "Ready to assemble" still active), WJ ticked several financial/governance facts via the "Add a financial or governance detail" manual picker, left them all blank, and found "Ready to assemble" remained clickable throughout, right up to the senior-review gate. Not a bug in the mechanism itself — `GOVERNANCE_ITEMS`' `item_label` deliberately ends in "(optional)" so the existing skippable-when-blank gate treats it like any other optional question — but the reasoning behind that skip only fits the AI-auto-detected case: `PDR-AI-008` decided that a low-signal AI detection should never become a forced question for a novice user. A manual add is the opposite — the charity actively chose to answer that fact, so leaving it blank afterwards shouldn't silently bypass approval.

**Fix:** `components/application-step4-draft.tsx`'s `allApproved` computation, and the matching check that shows the "Approve this answer" panel while an answer is empty, are both now also gated on the existing `addedManually` flag (already used for the "Added by you" badge) — `!q.addedManually` is required alongside the "(optional)" text check before an empty item is treated as skippable. AI-detected governance facts (with or without a citation) are unaffected; only manually-added instances of the same 5 facts now require an answer and approval before assembly.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged — no existing coverage of this component).

**Files changed:** `components/application-step4-draft.tsx`, `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`, `docs/PRD inputs/acceptance-criteria.md` (new AC-FR-29-08), `docs/PRD-Grant-Pathway.md` (0.55 → 0.56), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — PDR-AI-006 built: refined suggestions still over the limit now name the exact shortfall

Third and final gap closed in this same-day cluster (see the two entries below). While discussing why AI refine sometimes can't help at all, WJ asked what benefit there was in offering both "Help me improve this" and "Trim to limit" — the answer surfaced `PDR-AI-006`'s own decision, made 2026-07-04 alongside `PDR-AI-007`: LLMs cannot reliably hit an exact word/character count when compressing (a 200-word answer against a 50-word limit was refined to 60, still over). That PDR's user-guide wording fix was built at the time, but its in-app half — a conditional message inside the "Suggested improvement" card, shown only when the suggestion is itself still over the limit — was left "decided-but-not-yet-built," the third such gap found in one session (after `DR-FD-001`'s free-text fallback and `PDR-AI-007` itself).

**Fix:** `components/application-step4-draft.tsx` now computes the refined suggestion's own word/character count against the question's limit, inside the per-question render loop, and shows exactly the wording `PDR-AI-006` decided: _"This suggestion is still \[N\] words over the limit — AI can't always hit an exact word count. Check the counter and trim it further, or try again."_ (adapted to "characters"/"character count" per `limitType`), directly under the suggested text, only when it's actually still over.

**One implementation snag, found and fixed during this task:** the first version computed this inline as an IIFE inside the JSX return (`{condition && (() => {...})()}`) and tripped the `react-hooks/refs` ESLint rule ("Cannot access refs during render"), even though nothing inside the IIFE touched a ref — almost certainly a false positive from the experimental React Compiler's static analysis misattributing an unrelated ref access elsewhere in the same render function to the IIFE's scope. Fixed by hoisting the computation to a plain `const` alongside the component's other per-question values (`isOver`, `isNear`, etc.), matching the file's existing pattern — this resolved the lint error immediately with no behaviour change.

Verified message wording and pluralisation with a standalone script (10 words → "10 words", 1 word → "1 word", 25 characters → "25 characters"). `tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged — no existing coverage of this component).

**Files changed:** `components/application-step4-draft.tsx`, `docs/PRD decisions/PDR-AI-006-word-limit-compression-disclosure.md`, `docs/PRD inputs/acceptance-criteria.md` (new AC-FR-30-03A), `docs/PRD-Grant-Pathway.md` (0.54 → 0.55), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — "Trim to limit" extended to ordinary narrative questions, alongside AI refine

Follow-on from PDR-AI-007's budget-only trim button (previous entry below). While live-testing Henry Smith, WJ hit an ordinary (non-budget) narrative question over its word limit, clicked "Help me improve this," and got back: _"The original answer provided does not contain any information about safeguarding processes or procedures for the planned trip. There is no relevant content to refine or improve. Please provide an answer that addresses the question so that it can be reviewed and refined appropriately."_ — correct behaviour (the refine prompt is instructed never to invent facts, and WJ's test answer was deliberately unrelated word-count-testing filler text, not real content), but it left him with no way forward at all: no rewritten answer, and no fallback.

Discussed the tradeoff directly: AI refine tries to genuinely improve the prose while staying in-limit (better result when it works) but has two known failure modes now confirmed in testing — it can undershoot and land the answer still over limit (`PDR-AI-006`), or it can decline to engage at all when there's nothing genuine to refine (found live, above). A deterministic trim guarantees a way forward either way, at effectively zero cost since `trimToLimit()` (built for PDR-AI-007) already exists and is not budget-specific. WJ agreed to add it as a secondary option, not a replacement for AI refine.

**Fix:** the "Trim to limit" button (same `handleTrimToLimit()` handler, same deterministic sentence-snap logic) now also appears under the existing "trim it or use AI" message for ordinary narrative questions over their limit — previously that message pointed at "use AI" with no concrete action available if AI declined or undershot. `tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged).

**Files changed:** `components/application-step4-draft.tsx`, `docs/PRD decisions/PDR-AI-007-budget-over-limit-messaging.md`, `docs/PRD inputs/acceptance-criteria.md`, `docs/PRD-Grant-Pathway.md`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — PDR-AI-007 built: budget questions over their limit get a deterministic trim, not silence

WJ live-testing Henry Smith hit a budget-flagged narrative question ("If you have not raised all the money needed, what are your plans to do so?", 300-word limit) with a deliberately over-limit 503-word test sample and asked: "I thought we had fixed this scenario... There is no AI, so therefore how do we assist the user to bring down the number of words?"

**Investigation found this had, in fact, already been decided** — `PDR-AI-007-budget-over-limit-messaging.md`, decided 2026-07-04 during Clothworkers Foundation testing and formalised 2026-07-11 — but a repo-wide search turned up no trace of the decided message or "Trim to limit" button anywhere outside the PDR document itself. The decision was never turned into a tracked task in `IMPLEMENTATION-PLAN.md`/`IMPLEMENTATION-STATUS.md`, so it sat "decided, not yet built" for 12 days and nobody noticed until WJ independently re-discovered the exact same gap. Same failure mode as `DR-FD-001`'s 2026-07-11 free-text-fallback amendment, found stale during the 2026-07-16 Phase 5 audit (see the entry further below) — a decision recorded only in its own document, with no corresponding line in the tracked task list, is invisible to anyone checking "what's left to build."

**Root cause (confirmed live in code):** the entire "Help me improve this" block in `components/application-step4-draft.tsx` — including the red over-limit warning ("...trim it or use AI...") — was wrapped in `{!q.isBudgetQuestion && (...)}`. Budget questions showed no over-limit message at all, just the raw counter turning red, exactly matching what WJ described.

**Built exactly as PDR-AI-007 decided** (Option C + Option E; Option F — AI assist on budget questions — remains explicitly rejected for now):

1. A budget-specific over-limit message, no AI reference, shown only for `q.isBudgetQuestion && !isGovernanceItem && isOver`: _"Your answer exceeds the funder's word/character limit. Please trim it — AI assist isn't available for financial figures, so this needs to be adjusted manually before approving."_
2. A new `trimToLimit()` helper plus a "Trim to limit" button, entirely deterministic (no AI/LLM call, preserving the "AI never sees financial figures" guarantee): snaps to the last complete sentence that still fits within the limit, falling back to a hard word/character cut (snapped to a word boundary) if even the first sentence alone exceeds it.

Verified with a standalone reproduction script against WJ's exact 502-word sample: trims to 285 words, cleanly snapped to a sentence boundary, well within the 300-word limit. Also checked a character-limit case and a no-sentence-fits hard-cut case. `tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged — this component has no existing test coverage; verified live is the established precedent, same as prior Step 4 fixes this session).

**Files changed:** `components/application-step4-draft.tsx`, `docs/PRD decisions/PDR-AI-007-budget-over-limit-messaging.md`, `docs/PRD inputs/acceptance-criteria.md` (new AC-FR-29-06), `docs/PRD-Grant-Pathway.md` (0.52 → 0.53), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — Numbering extended to free-form funders' sections and governance items

Follow-on from the Step 3 count-mismatch fix (next entry below): WJ then asked directly whether Step 4's lack of numbering on Walton Charity (a free-form funder) should also be revisited, since it looked inconsistent next to structured funders' numbered questions. Confirmed this was documented, intentional behaviour (`AC-FR-28-04`) — free-form funders were designed from the start to show unnumbered narrative sections, distinct from structured funders' numbered Q&A cards. WJ asked for it to be extended anyway, since that original premise pre-dates PDR-AI-008's governance facts (2026-07-15): a fact like "Are any of your trustees related to each other...?" reads as a discrete question regardless of the funder's own classification, not a narrative section title, so leaving it unnumbered inside a free-form item list was inconsistent even before this request.

**Fix:** `components/application-step4-draft.tsx`'s number span is no longer gated on `funderType === 'structured'` — every item (narrative question, narrative section, or governance item) is now numbered by its position in the ordered, answered list, matching the pattern already used for governance items on structured funders (2026-07-16, earlier fix this same day). The free-form textarea's `aria-label` now also includes the number (`Content for section N: ...`) rather than only the question text. `actions/applications.ts`'s `assembleAndAdvance()` no longer detects or branches on funder type at all — the entire "Detect funder type for assembly format" step was removed as dead code once both branches would produce the same numbered output; every answered item is simply prefixed with its position.

Reverses part of a formal, documented decision (`AC-FR-28-04`, `AC-FR-31A-04`) — both corrected with revision notes rather than silently rewritten, matching this repo's practice of never editing a past decision's history away. `PRD-Grant-Pathway.md` (0.51 → 0.52) updated to match.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged — no existing coverage of either file's numbering logic; verified live is the established precedent for both, same as the earlier structured-funder governance-numbering fix). Can't be verified live locally — Step 4 needs a real application with saved item data — next live check is WJ's.

**Files changed:** `components/application-step4-draft.tsx`, `actions/applications.ts`, `docs/PRD inputs/acceptance-criteria.md`, `docs/PRD-Grant-Pathway.md`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — Step 3 summary undercounted items whenever governance facts were detected

WJ live-testing Walton Charity with a fictitious charity saw Step 3 announce "We identified 4 sections to complete", then Step 4 show "0 of 7 sections approved" — a jarring mismatch between two consecutive screens.

**Root cause:** the Step 3 banner (`components/application-step3-summary.tsx`) computed its count from `summary.sections?.length` (free-form) or `summary.questions.length` (structured) only — it never added `summary.governanceFacts?.length`. Step 4 renders governance facts (PDR-AI-008) as ordinary items in the same list as narrative sections/questions, so its count (`questions.length` in that component, which is really "all items") always included them. Walton's guidelines raised 3 of the 5 governance facts (reserves, trustee-relatedness, bank-signatory-relatedness) alongside 4 narrative sections — 4 vs 7. The same undercount would show on any structured funder with detected governance facts too; it just hadn't been hit yet, since Lloyds Bank Foundation earlier in testing happened to have zero governance signal.

**Fix:** both banner strings now add `governanceFacts?.length ?? 0` to their total before rendering, so the number Step 3 promises always matches what Step 4 actually shows.

`tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged — no existing coverage of this component's banner text). Can't be verified live locally (needs a real Bedrock call; `dotenvx` redacts AWS credentials for this agent by design) — next live regeneration with governance facts detected is WJ's verification.

**Separately raised, not yet actioned:** WJ also noted no numbering appears on Step 4 for this (free-form) funder. Confirmed this is documented, intentional behaviour (`AC-FR-28-04`: free-form funders show narrative sections, never numbered, in both Step 4 and the assembled draft) — not a bug. Flagged back to WJ as a design question worth revisiting now that governance facts (more question-like than a narrative section) can appear inside a free-form funder's item list too, a case `AC-FR-28-04` pre-dates.

**Files changed:** `components/application-step3-summary.tsx`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — Phase 5 audit follow-up: migration-push task added, ToS/Privacy/Vercel Pro/cron status corrected

Second pass on the Phase 5 review begun earlier the same day (see the entry directly below). Three more findings from that review, all approved for fixing by WJ:

**1. P5.4 had no task for pushing Phase 6's migrations to production.** Every Phase 6 migration since P6.1 (2026-07-05) has been deliberately scoped to `grant-pathway-dev` only, with each task's own scoping note promising `grant-pathway-prod` would be "re-entered at P5.4" — but P5.4's actual checklist never contained a line item for that re-entry, and neither did the Phase 6 → Go-Live Gate. By the time Phase 5 starts, roughly 10 migrations (P6.1, P6.2a, P6.2, P6.3, P6.4, P6.5, both PDR-AI-008 migrations, GAP-33, the manual-add fallback) will need applying to prod. Added an explicit task to P5.4 (`supabase db push` against prod, verified via `supabase migration list` matching Local/Remote on both projects) and a matching checklist line to the Phase 6 → Go-Live Gate.

**2. P5.1's Terms of Service / Privacy Policy rows read as not-yet-drafted.** Both are in fact live — `/terms` since 2026-07-10, `/privacy` since 2026-07-02 (confirmed via `app/(public)/terms`, `app/(public)/privacy`, and the `docs/legal/*.md` sources). Updated both rows and the section preamble to reflect this, calling out the two items that genuinely remain open: the `Effective date` placeholder in both documents (currently `[TO BE CONFIRMED]`, confirmed by reading the actual files) and the solicitor review neither has had yet.

**3. P5.4's "Activate Vercel Pro" and cron-confirmation bullets read as pending.** Vercel Pro is active and all three crons in `vercel.json` are confirmed running (`cleanup-guidelines` every 30 min, `inactivity-warning`/`inactivity-deletion` daily) — corroborated independently, not just from memory: a 30-minute cron is not possible on Vercel's Hobby plan (once-daily crons only), so its presence in production confirms Pro is active. Both bullets marked done.

**Files changed:** `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.16 → v3.17), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — Phase 5 factual audit: Funder Directory section superseded, Admin Dashboard query fixed

WJ asked for a review of `IMPLEMENTATION-PLAN.md`'s Phase 5 section while stepping away, given a week of heavy Phase 6 changes — wanted confirmation it was still "intact and factual" ahead of Phase 5 starting next week.

**Finding:** the Funder Directory section (`P5.FD1`–`P5.FD6`) was still marked "✅ Complete (2026-06-01)", describing a searchable funder picker over a `funders` Supabase table with a "Request a Funder" escape hatch. That entire design was reversed on 2026-07-15 (`DR-FD-001` v1.4, already documented at the time but never propagated back into the Phase 5 plan) — Step 1's funder field is plain free text again, with no picker, no directory query, and no escape hatch. Root cause of the drift: `DR-FD-001` is a Tier 3 (stable) decision record, `IMPLEMENTATION-PLAN.md` is Tier 2 — the reversal was correctly logged in the Tier 3 doc on 2026-07-15 but the corresponding Tier 2 task spec was never revisited, since no task was "in progress" against it at the time.

**Fix:** section re-marked `~~Funder Directory (DR-FD-001)~~ — Superseded 2026-07-15`, with a summary of what changed and why; the six `P5.FD*` task descriptions are struck through and retained underneath for audit-trail purposes only, matching the pattern already used for P6.6's retirement.

**Knock-on fix:** P5.5b's Admin Dashboard "Top funders" panel query joined `applications.funder_id → funders.id` — since no application has populated `funder_id` since the picker was removed, that panel would have silently gone empty/stale for every application created from 2026-07-15 onward. Changed to `SELECT funder_name, COUNT(*) FROM applications GROUP BY funder_name ORDER BY COUNT(*) DESC LIMIT 10`. P5.5b is not yet built, so this is a planning-document correction only — no code changed.

No other Phase 5 content was found to be factually broken in the same review — P5.1–P5.5's GAP items, the P5.4 migration-reconciliation history, and the Performance section were all confirmed still accurate (the Performance section describes June's timing work; July's truncation/repeated-line accuracy fixes sit underneath it as later, separately-logged refinements, not contradictions).

**Files changed:** `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.15 → v3.16), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — Citation quote could highlight an incidental detail (e.g. a word limit) instead of the question itself

WJ spotted this live-testing Lloyds Bank Foundation: the "view original guidelines" panel for "Please provide a short summary of your charity's purpose and aims" highlighted "Suggested word count: 300 - 400 words, maximum 500." instead of the question text — technically a verbatim excerpt from the correct page, but not the sentence a user actually wants jumped to.

**Root cause:** the citation instruction in `buildSummaryPrompt()` (`lib/prompts.ts`) told the AI to quote "a short verbatim excerpt copied exactly from within that marker's text block — something a person could search for and find," without requiring the excerpt to come from the question/section's own wording. Any short, findable string on the cited page satisfied the instruction, including an adjacent word-limit line.

**Fix:** tightened the instruction to require the quote come from the question/section's own text (its title/wording or opening words) and explicitly rule out nearby word/character limits, formatting instructions, or other incidental details — stating the purpose directly (a reader clicking the citation should land on the question, not something next to it).

Prompt-only change — no code path to unit test, and the actual output can't be reproduced locally (Bedrock calls need real AWS credentials, which `dotenvx` redacts to empty strings for this agent by design). `tsc --noEmit`, `eslint --max-warnings 0`, all 75 tests pass (unchanged). Live re-verification is WJ's next Step 3 generation.

**Files changed:** `lib/prompts.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — Governance items now get a real sequential number, folded in with narrative questions

WJ reviewed a Clothworkers assembled draft (Step 5) showing "Total annual expenditure (£)" with no number at all, immediately followed by "1. Please describe the community/group of people you support..." — the first narrative question. He initially thought I'd misread his concern as being about truncated answer text (a red herring from investigating a different, unrelated question about deliberately-pasted word-count-testing content), then clarified: he expected the governance item to be numbered "1." and the narrative question to follow as "2.", not for governance items to be excluded from numbering entirely.

This reverses part of PDR-AI-008's original rendering design (governance items render as unnumbered "ordinary cards", and the 2026-07-15 Step 5 numbering fix explicitly matched that — see this file's 2026-07-15 entry and `PDR-AI-008`'s Revision History). Confirmed the exact scope with WJ before changing established, documented behaviour: number governance items in both Step 4 (writing) and Step 5 (assembled draft), keeping their existing sort-first position rather than moving them to the end.

**Fix:** both `components/application-step4-draft.tsx` and `actions/applications.ts` (`assembleAndAdvance`) now compute the displayed number from each item's **position in the already-ordered, answered list** (`index + 1`) rather than from the raw `item_order` column, which stays negative for governance items and was never meant to be user-facing. Step 4 previously suppressed the number entirely for governance items (`!isGovernanceItem`); Step 5 previously did the same via a `field_key !== null` check (the fix from 2026-07-15 that stopped it leaking the raw negative order). Both checks are removed — every structured-funder item now gets a number, governance items included, since governance items already sort before narrative questions by design (reserved negative `item_order`, -5 to -1).

Also removed `field_key` from `assembleAndAdvance`'s query — it was only ever read for the now-removed numbering condition.

`tsc --noEmit`, `eslint --max-warnings 0`, all 75 tests pass (unchanged — neither file has existing unit coverage, same precedent as the original 2026-07-15 fix: tightly coupled to the Supabase client / DOM rendering, verified live instead). **Files changed:** `components/application-step4-draft.tsx`, `actions/applications.ts`, `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — Repeated-line stripping was deleting genuine questions that recur verbatim across a funder's multiple forms

Follow-on from the form-aware truncation fix (next entry below): while verifying that fix against the real Clothworkers PDF, found that "Please describe the difference you expect your capital project to make" was missing from the cleaned text **even with no truncation ceiling applied at all** — a separate, pre-existing bug, not caused by truncation. WJ called it a serious bug and asked to fix it immediately rather than deferring, while he continued testing.

**Root cause:** `detectRepeatedLines()` (`lib/preprocess-text.ts`) treated any line appearing 3+ times identically (under 120 characters) as a PDF running header/footer and stripped it everywhere. Clothworkers repeats this exact question verbatim across all 3 of its forms (Small Grants, Large Grants stages 1 and 2) — a plain "identical 3+ times" rule can't distinguish that from an actual repeated header like "THE CLOTHWORKERS' FOUNDATION: OPEN GRANTS PROGRAMME GUIDANCE" (which legitimately appears near-identically on most pages and should be stripped).

**Fix:** added a marker-adjacency requirement. A genuine running header/footer reliably sits as the very first non-blank line after a `[PAGE N]`/`[SECTION: ...]` boundary, or the very last non-blank line before the next one — `isAdjacentToMarker()` checks this for every occurrence of a repeated line, and a line is only stripped if **all** of its occurrences qualify. Clothworkers' repeated question is embedded mid-page in each of its 3 forms (never adjacent to a page boundary), so it now survives; the genuine running header still strips cleanly since every one of its occurrences sits immediately after a page marker. Deliberately conservative: if even one occurrence isn't marker-adjacent, none of that line's occurrences are stripped — erring toward keeping content, consistent with this file's existing "when in doubt, omit a pattern" philosophy for boilerplate-heading stripping.

Verified against the real Clothworkers PDF (both fixes combined): the whole Small Grants form, including this question and the funding-shortfall question, now survives the 50,000-char production ceiling intact. Also spot-checked the cleaning step (no truncation, isolating this change's effect) against 7 other scheduled-funder guideline PDFs (A B Charitable Trust, Walton Charity, Idlewild, Garfield Weston, Nationwide, Heritage Fund, MK Community Foundation) — reductions stayed modest (0–2%) with no crashes or obviously broken output, per ADR-AI-010's requirement to test any pre-processing change across all scheduled funders. Full end-to-end (live AI extraction) re-verification per funder remains WJ's live-testing responsibility, same as always — this was a text-level sanity check only, not a substitute for it.

`tsc --noEmit`, `eslint --max-warnings 0`, all 75 tests pass (3 new: a true header still strips correctly; a genuine cross-form repeated question survives; a repeated line with mixed marker-adjacency is kept entirely).

**Files changed:** `lib/preprocess-text.ts`, `__tests__/preprocess-text.test.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — Form-aware truncation: large multi-form guideline PDFs were losing their actual application questions

WJ was live-testing Clothworkers' Foundation (Harry's Rainbow) — a scheduled ADR-AI-010 test funder whose 54-page guidance-plus-sample-forms PDF has always hit the truncation warning ("very large... reviewed the first section") — and asked directly: how many questions should this document actually produce, and can the message/process be improved rather than just accepted? Investigation confirmed the guidance was accurate but the underlying process was actively losing content: production's `PREPROCESS_CHAR_CEILING` (50,000, per this ADR's 2026-06-05 decision) truncated in raw document order, which meant a "keep the first N characters" cut systematically favoured front-loaded eligibility/overview prose over the actual Sample Small Grants Programme Application Form — landing mid-way through the form's most important narrative questions ("describe your project," "how you will raise the shortfall") on the real document.

Presented two fix options with a clear tradeoff (raise the ceiling further vs. detect-and-prioritise the real form section) and asked WJ to choose before changing a production-wide parameter; he chose the form-aware approach. **Built:** `findFormStartIndex()` (`lib/preprocess-text.ts`) scans for a strong "this is the actual sample form" heading (`SAMPLE ... APPLICATION`, falling back to `APPLICATION FORM`) — deliberately skipping numbered table-of-contents entries so an early "4. Sample Small Grants Programme Application Form" listing doesn't get mistaken for the real thing. When a form-start heading is found anywhere in a document that needs truncation, the ceiling budget is split: pre-form content is capped at 40% of the ceiling (`PREAMBLE_MAX_SHARE`) so the form section reliably gets the majority share, rather than letting a long preamble consume the whole budget before the form is ever reached. The existing marker-snap logic (drop a partial page/section entirely rather than leave it half-populated) was extracted into a reusable `snapToLastMarker()` helper and applied to both the preamble and form slices.

**A real implementation bug found and fixed during verification, not shipped as designed:** the first version only triggered the form-aware split when the form heading's offset was _beyond_ the ceiling — reproducing this exactly on the real Clothworkers PDF revealed that header/footer stripping (an earlier pipeline step) shrinks the cleaned document enough that the heading actually lands _before_ the ceiling, so the condition never fired and the plain path still cut the form short. Corrected to trigger whenever a form heading exists anywhere in a truncated document, not only when it's beyond the ceiling. Verified against the real PDF (not a synthetic fixture) both before and after this correction — confirmed broken, confirmed fixed — using a local repro script that reproduces `lib/extract-text.ts`'s exact `unpdf` extraction pipeline (no Bedrock call, so no secrets required; see `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`-adjacent tooling note in project memory about Bedrock calls specifically needing production logs instead).

The client-facing message (`components/application-step3-summary.tsx`) now distinguishes the two cases: when a form section was found and prioritised, the copy says so explicitly rather than the previous blanket "reviewed the first section" wording, which would have been actively misleading once truncation stopped happening in raw document order. The API response (`app/api/generate-summary/route.ts`) carries a new `formSectionPrioritized` boolean alongside the existing `guidelinesTruncated` flag.

**A second, separate bug surfaced during this investigation, not fixed here:** Clothworkers repeats the exact sentence "Please describe the difference you expect your capital project to make" identically across all three of its forms (Small Grants, Large Grants stages 1 and 2). The existing repeated-line header/footer detection (any line appearing 3+ times identically, `detectRepeatedLines`) treats this as page-header noise and strips it everywhere — including from the Small Grants form where it's a genuine, load-bearing question. Confirmed this happens regardless of truncation (reproduced with an artificially huge ceiling, no cut at all). Flagged to WJ as a distinct follow-up requiring its own fix and cross-funder validation (per this ADR's existing Consequences requirement to test any pre-processing change against all scheduled funders) — not bundled into this change.

`tsc --noEmit`, `eslint --max-warnings 0`, all 72 tests pass (4 new, covering: a SAMPLE-heading form prioritised over an earlier numbered TOC entry; the APPLICATION FORM fallback pattern; no-op when the form already fits the ceiling; plain fallback when no form heading exists at all).

**Files changed:** `lib/preprocess-text.ts`, `app/api/generate-summary/route.ts`, `components/application-step3-summary.tsx`, `__tests__/preprocess-text.test.ts`, `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — generate-summary fix: free_form sections with no word limit crashed Step 3 deterministically

WJ was live-testing Walton Charity (a `free_form` funder) specifically to exercise the eligibility-mismatch path (Harry's Rainbow — bereavement support in Milton Keynes vs. Walton's Elmbridge-only, poverty-focused criteria) and hit "We couldn't generate your summary right now" on Step 3. He asked whether it was a Claude outage. Anthropic's status page did show a resolved "Claude Sonnet 5 errors" incident earlier that morning (08:39–08:53 UTC), which looked like a plausible match at first, but the real Vercel function logs (retrieved after installing and linking the Vercel CLI — not previously set up in this environment — `vercel logs --status-code 500`) told a different story: `stop_reason: end_turn` on every attempt, ruling out output-token truncation, and the actual failure was `[generate-summary] JSON parse/validation failed after retry`.

**Root cause:** temporary diagnostic logging (added to `route.ts`, then removed once root-caused) surfaced the exact Zod error — 4× `"Invalid input: expected number, received null"`. Claude was returning `wordLimit: null` for each of Walton's narrative sections that has no stated word limit — the same convention already used and accepted for `questions[].wordLimit`. But `aiSummarySectionSchema.wordLimit` was `z.number().optional()` (missing `.nullable()`), so every section without an explicit limit failed validation. Since this route runs at `temperature: 0` (the 2026-07-15 determinism fix), the failure was 100% reproducible on this document, not transient — no amount of "Try again" could ever have worked, and the error copy's "this is usually temporary" was actively misleading for this failure mode.

**Fix:** `aiSummarySectionSchema` (`app/api/generate-summary/route.ts`) and the `AiSummarySection` type (`lib/types.ts`) now accept `wordLimit: number | null`, matching `aiSummaryQuestionSchema`'s existing pattern. Downstream consumers (`actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`) already normalised with `?? null` and needed no change — only the validation boundary was wrong. Confirmed fixed by WJ's live retry: the summary generated successfully and the eligibility-mismatch result rendered exactly as expected. `tsc --noEmit`, `eslint --max-warnings 0`, all 68 tests pass.

**Tooling note:** the Vercel CLI is now installed and linked to this project (`rapidglobes-projects/grant-pathway`), so `vercel logs`/`vercel ls` are available for future investigations — this was the missing piece that made root-causing this fast rather than guesswork.

**Files changed:** `app/api/generate-summary/route.ts`, `lib/types.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-15 — Step 5 assembled-draft numbering fix for governance items

WJ predicted, then live-verified, that MK Community Foundation's Sapling Grants guidelines would trigger the same 3-of-5 governance facts as Oak Grants (Reserves, bank-signatory count, bank-signatories-related) — confirming the extraction logic generalises correctly across a second programme from the same funder. But he then flagged the Step 5 "Review and approve" screen showing these items with their raw internal numbering visible: "-4. Reserves (£)", "-2. How many people are authorised as bank signatories?", "-1. Are any bank signatories related to each other or to a trustee?"

**Root cause:** governance items use a reserved negative `item_order` (-5 to -1) purely so they sort before a funder's own numbered questions — never meant to be shown to a user. Step 4's rendering already excludes this prefix for governance items, built during the PDR-AI-008 work. But `assembleAndAdvance()` (`actions/applications.ts`), which formats the Step 5 "assembled draft" independently by reading `item_order`/`item_label`/`answer_text` straight from the database, had no equivalent exclusion — it prefixes every structured-funder item with its raw `item_order` unconditionally.

**Fix:** the query now also selects `field_key`; a governance item (identified the same way Step 4 does — `field_key !== null`) renders as a plain label with no number, exactly matching Step 4's display. `tsc --noEmit` and `eslint --max-warnings 0` both clean. No test added — `assembleAndAdvance` has no existing unit coverage (heavy Supabase-client coupling, consistent with other server actions in this file) — live re-verification of the Step 5 screen is pending WJ's own testing, per this project's established pattern for AI/UI behaviour that can't be exercised from this environment.

**Files changed:** `actions/applications.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-15 — Citation-highlight fix: typographic punctuation tolerance

WJ asked a direct testable question after the PDR-AI-008 build: "will the MKCF guidelines trigger a governance question?" Read the actual MK Community Foundation Oak Grants PDF and predicted 2-3 of the 5 facts would trigger (reserves policy, bank-signatory relatedness, plausibly signatory count) based on the extraction rules. WJ then live-tested it and got exactly that — 12 narrative questions + 3 governance items — confirming the detection logic works as designed. But he flagged something the prediction didn't cover: the Reserves item's citation badge linked correctly to "Page 3," but clicking it opened the viewer with no highlight and no auto-scroll, landing on Page 1.

**Root-caused with a direct database query**, not guesswork: `supabase db query --linked` against `grant-pathway-dev` to pull the actual stored `guideline_reference.quote` for the 3 governance items and the retained `application_guidelines.guideline_text` for the same application, then ran the real `findQuoteRange` matching logic against both outside the app to reproduce the failure deterministically. Found: the AI's quote read "...six months' free reserves..." (straight apostrophe, U+0027) while the source PDF's actual text reads "...six months' free reserves..." (curly/smart apostrophe, U+2019) — a single-character mismatch that defeats the literal word-for-word regex match. WJ separately confirmed the two bank-signatory items (sharing a different quote with no smart punctuation) highlighted correctly — isolating the bug to typographic punctuation variants specifically, not a broader citation-viewer regression.

**Fix:** `findQuoteRange` (`lib/guideline-citations.ts`) now treats each of three punctuation-equivalence classes as interchangeable when building its match pattern — straight/curly apostrophe (`'` / `'` / `'` / `ʼ`), straight/curly double quote (`"` / `"` / `"`), and hyphen/en-dash/em-dash (`-` / `–` / `—`). Each character in the quote is matched against its whole equivalence class in the source text, not just that literal character — but the _displayed_ highlight still slices from the original text, so the on-screen result always shows the source's real typesetting (e.g. the curly apostrophe), never a normalised version. This is a general fix, not scoped to governance facts — it benefits any funder's guidelines using proper typographic punctuation, which is common in PDFs and Word documents generated by non-technical staff.

Verified against the real retained MKCF text before and after the fix (a standalone script reproducing the exact production logic) — confirmed broken beforehand, confirmed fixed afterward, before touching the actual source file.

`tsc --noEmit`, `eslint --max-warnings 0`, all 68 tests pass (4 new — the exact live case verbatim, the symmetric curly-in-quote/straight-in-source direction, double quotes, and dashes).

**Files changed:** `lib/guideline-citations.ts`, `__tests__/guideline-citations.test.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-15 — PDR-AI-008's manual-add fallback built (fast-follow)

The auto-detection half of PDR-AI-008 (previous entry) deliberately deferred the zero-signal fallback — a manual-add picker — as a separate follow-up. WJ asked for it to be built while stepping out briefly, and asked what was needed first; answered directly (the design was already agreed in the earlier conversation) and proceeded without a blocking plan-mode approval gate, since he wouldn't be present to approve one. One real judgement call was flagged rather than silently decided: how to distinguish a manually-added item from an AI-detected one with no citation, since both otherwise look identical (`guideline_reference: null`). Resolved with a new boolean column rather than overloading an existing enum.

**The mechanism:** a quiet link below the Step 4 question list — "Need to add something about your finances or governance that wasn't asked above? Add it." — appears only when at least one of the 5 governance facts isn't already shown, and disappears entirely once all 5 are present. Clicking it reveals checkboxes for just the missing facts, each carrying a plain-English explanation (`GOVERNANCE_FIELD_EXPLANATIONS`, `lib/governance-items.ts`) rather than a bare label — a novice user (Persona 1, Margaret) shouldn't have to already know what "bank signatory relatedness" means to decide whether it applies to her.

**Data:** new `application_items.added_manually` boolean column (migration `20260715000001`), `false` by default. A new server action `addManualGovernanceItems` (`actions/applications.ts`) creates the selected rows via `resolveGovernanceInserts()` with `added_manually: true`, scoped to the closed 5-field vocabulary only — any value outside `GOVERNANCE_FIELD_KEYS` is silently rejected server-side, not just hidden client-side.

**A real bug caught before it shipped:** the existing orphan-cleanup logic only treats a governance item's `item_order` as "in the summary" when the AI currently detects it. A manually-added item is never AI-detected by definition, so without a fix, the very next Step 4 sync (e.g. simply reloading the page) would have deleted an unanswered manually-added item as "orphaned." Fixed by folding any existing row's `added_manually` item_order into the same `summaryOrders` set used for narrative orphan-checking — a manually-added item now survives regardless of what any given extraction pass does or doesn't detect, exactly as intended.

**Rendering:** a manually-added item shows a small "Added by you" badge in place of a citation badge — honest about where the question came from, matching the UX design discussed earlier the same day. On successful add, the client does a hard page reload rather than reconciling local state — consistent with this codebase's existing "mutate then hard-refresh" pattern (`setDraftInProgress`'s own caller), and avoids duplicating the server's sort/guidance/citation logic on the client for what is a rare-use feature.

`tsc --noEmit`, `eslint --max-warnings 0`, all 64 tests pass (4 new — explanation-map coverage and `added_manually` default/override behaviour). Migration applied to `grant-pathway-dev` only (`supabase migration list`, 24/24 matched before and after); `grant-pathway-prod` confirmed still unlinked (`supabase projects list`).

**Files changed:** `supabase/migrations/20260715000001_governance_manual_add.sql` (new), `lib/database.types.ts`, `lib/governance-items.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-draft.tsx`, `__tests__/governance-items.test.ts`, `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`, `docs/PRD decisions/PRD-DECISIONS-INDEX.md`, `docs/data-model.md` (v1.13), `docs/PRD-Grant-Pathway.md` (v0.51), `docs/PRD inputs/acceptance-criteria.md` (new AC-FR-12A-04).

---

## 2026-07-15 — PDR-AI-008 built: governance facts now guideline-driven, superseding the always-on block

WJ's live testing of the always-on 5-item "Governance and reserves" block (built earlier the same day, commit `82e11d9`, currency-formatted in `7e68c9a`) found it disjointed from the rest of Step 4 — no citation, no funder-specific rationale, shown regardless of whether the funder cares. Decided (`docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`) and built the same day.

**The mechanism:** a new `"governanceFacts"` array joins `questions`/`sections` in the AI JSON schema (`lib/prompts.ts`), Zod-validated and citation-reconciled in `app/api/generate-summary/route.ts` through the exact same `extractValidMarkers`/`validateCitation` pipeline already used for narrative items — no new citation machinery. The key design choice: this array's extraction bar is deliberately **lower** than "questions" — a general eligibility or policy statement counts, not just a discrete question — and citation stays optional (an entry with `citation: null` is still shown, exactly like narrative questions/sections already behave). This is what delivers WJ's "auto-show on any signal" decision without needing a separate relaxed-citation tier.

**What creates the rows:** `lib/governance-items.ts` gained `resolveGovernanceInserts()` — given whichever facts the AI detected this time, it looks up `item_type`/`item_label`/`item_order`/`is_budget_question` from the fixed `GOVERNANCE_ITEMS` table (still never trusted from the AI — only _whether_ a row exists at all is now guideline-driven) and dedupes by `field_key`. Both sync paths (`setDraftInProgress`, Step 4's fallback sync) now call this conditionally, replacing the unconditional "always upsert all 5" block from this morning.

**Orphan cleanup simplified, not special-cased:** `isOrphanedItem()`'s `field_key` carve-out — needed this morning because governance items were never part of the AI's own numbering — is gone. A detected fact's reserved `item_order` now folds into the same `summaryOrders` set the narrative sync already builds, so a governance item whose fact the extraction no longer raises is cleaned up exactly like a dropped narrative question: deleted if unanswered, kept if already answered. This is a genuine simplification, not just new capability — one fewer special case in the codebase than this morning's build had.

**Rendering:** the dedicated "Governance and reserves" section heading in `components/application-step4-draft.tsx` is removed entirely (confirmed with WJ: blend in, no special framing) — a shown item now renders as an ordinary-looking card at its reserved sort position, picking up the same citation badge every other item gets automatically once `guideline_reference` is populated. The AI's extracted wording is surfaced through the existing `guidance` text slot (previously free_form-sections-only) instead of a removed heading's blurb — loosened that render condition to also cover governance items regardless of funder type or budget-question status.

**Deliberately not built this round:** a manual-add picker for the zero-signal case (WJ confirmed: auto-detection first, manual-add as a separate fast-follow — see `PDR-AI-008` for the full reasoning about why a self-serve relevance picker would ask a novice user, Persona 1 Margaret, to make a judgement call her persona says she can't reliably make).

`tsc --noEmit`, `eslint --max-warnings 0`, all 60 tests pass (2 tests removed — they asserted the exact carve-out being retired — 5 new tests added, 3 for `resolveGovernanceInserts`, 2 for the simplified `isOrphanedItem`). No DB migration — `field_key`/`guideline_reference` already existed from this morning's build.

**Files changed:** `lib/types.ts`, `lib/prompts.ts`, `lib/governance-items.ts`, `app/api/generate-summary/route.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-draft.tsx`, `__tests__/governance-items.test.ts`, `docs/Technical Decision and Design/ADR-DATA-006-application-item-graph-model.md`, `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`, `docs/PRD decisions/PRD-DECISIONS-INDEX.md`, `docs/data-model.md` (v1.12), `docs/PRD-Grant-Pathway.md` (v0.50), `docs/PRD inputs/acceptance-criteria.md`.

---

## 2026-07-15 — DR-FD-001 v1.4: curated funder picker/directory removed, free-text field restored

WJ questioned whether Step 1's "Who is offering this grant?" searchable picker was still needed, six weeks after it was introduced (DR-FD-001, 2026-06-01). Investigation found the 2026-07-11 amendment relaxing the picker to a free-text fallback had never actually been built — it existed only inside the decision record, with no corresponding task in `IMPLEMENTATION-PLAN.md`'s tracked list.

**Decision: go further than finishing that fallback — remove the picker/directory entirely.** With Step 3/4/5 processing already known (per the same 2026-07-11 amendment) to be driven per-application by the uploaded guidelines rather than by funder identity, a curated directory no longer serves the purpose it was built for. `Who is offering this grant?` is a plain free-text field again.

**Dependency sweep before touching anything** (WJ was explicit he didn't want something else to silently break): grepped every reference to `funder_id`/`funders`/`FunderOption` across the codebase. Contained to three files: `actions/applications.ts` (`getActiveFunders()` deleted; `saveApplicationStep1()` loses its `funderId` param), `components/application-step1-form.tsx` (whole picker/dropdown/keyboard-nav/mailto-link UI replaced with a plain text input), and the Step 1 server page (stops fetching the funder list). No test file referenced any of it.

**The one real compatibility question:** P6.5's "start from your last application to [Funder]" (`getPreviousApplicationForFunder`) matched "same funder" by exact `funder_id` equality. With no stable funder identity left, it now matches a trimmed, case-insensitive `funder_name` comparison instead (Postgres `ILIKE`, with `%`/`_`/`\` escaped so a funder name containing one of those characters literally isn't treated as a wildcard). Agreed with WJ as a deliberate soft-miss trade-off: typing a funder's name slightly differently between two applications means the reuse prompt just won't offer itself — it will never wrongly match two different funders' data together.

**Left alone, on purpose:** the `funders` table and `applications.funder_id` column — same low-priority-cleanup treatment already given to the table's own dormant `funder_type` column, rather than an urgent drop migration. No database migration in this change at all.

`tsc --noEmit`, `eslint --max-warnings 0`, all 55 tests pass.

**Files changed:** `actions/applications.ts`, `components/application-step1-form.tsx`, `app/(authenticated)/applications/[id]/step/1/page.tsx`, `docs/decisions/DR-FD-001-funder-directory-model.md` (v1.4), `docs/decisions/DECISIONS-INDEX.md`, `docs/PRD-Grant-Pathway.md` (v0.49), `docs/PRD inputs/acceptance-criteria.md` (FR-15), `docs/moscow-feature-register.md` (v1.17), `docs/data-model.md` (v1.11).

---

## 2026-07-15 — PDR-AI-008: governance-facts placement to be reworked via guideline-driven extraction

Following the £-formatting fix (next entry below), WJ's live testing prompted a bigger rethink: the fixed 5-item "Governance and reserves" block (built earlier the same day, previous entry) felt disjointed from the rest of Step 4 — no citation badge, no funder-specific rationale, shown unconditionally regardless of whether a given funder cares about any of it.

**Decision (full record: `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`):** fold these 5 facts into the same guideline-driven extraction pipeline that already produces ordinary narrative questions with citations — shown only when a funder's guidelines actually raise the topic, not unconditionally on every application.

**The key nuance, worth preserving:** the natural instinct was to require a precise, quotable citation before showing an item, with a self-serve "tick whichever of these applies" picker as the fallback for anything less precise. WJ pushed back once the conversation reached `docs/user-personas-journeys-and-use-cases.md`'s Persona 1, Margaret — no fundraising training, finds funder language confusing, already unsure whether her answers address what the funder asked. A picker that asks her to judge relevance herself just relocates the guesswork, it doesn't remove it. Also explicitly rejected: proactively suggesting a governance fact to a novice user when the AI has no signal at all — WJ's judgement was that this could make things worse for Margaret, not better, by introducing a decision point instead of removing one.

**Landed on instead:** auto-show a governance item whenever the AI has _any_ signal at all, even an imprecise, unlocalised one — so a novice user is never shown a gap she's expected to notice and fill herself. The manual-add picker (plain-English explanations, not jargon labels) stays available to everyone but is designed as a rare shortcut for a more experienced user (Persona 2, David) who might know a funder-specific quirk the guidelines don't spell out — not the primary safety net.

**Status: decided, not built.** This supersedes the "placement only, always show all 5 unconditionally" scope agreed earlier the same day (see the entry below) — that build stands as shipped and working, but its unconditional-display design will be reworked once this is scheduled.

---

## 2026-07-15 — Governance Step 4 items: £ fields reformatted to UK currency style

During his live verification pass of the governance-items redesign (previous entry below), WJ confirmed the 5 items render correctly at the top of Step 4, then asked for the two £ fields (total annual expenditure, reserves) to display in UK currency format — "£ n,nnn,nnn" — rather than a plain unformatted number input.

**Fix:** `components/application-step4-draft.tsx` splits the governance number-input branch in two: the two budget fields (`is_budget_question: true`) now render a text input with a fixed "£" affix and live UK thousands-separator formatting (`toLocaleString('en-GB')`) via a new `formatThousands()` helper; the bank-signatory count field (not a budget question) keeps the original plain number input, unaffected. The underlying stored `answer_text` stays raw digits (formatting is display-only, applied on render and stripped again on input) — no change to what's saved, so `saveAnswer`, Step 5 export, and the DB column are all unaffected.

`tsc --noEmit`, `eslint --max-warnings 0`, all 55 tests pass. `docs/PRD-Grant-Pathway.md` (v0.48) Step 4 Q&A table row corrected to describe the three number-field input types precisely instead of grouping them all as "plain number input".

**Files changed:** `components/application-step4-draft.tsx`, `docs/PRD-Grant-Pathway.md` (v0.48).

---

## 2026-07-15 — Governance/reserves facts re-sited from `charity_profiles` into `application_items`

WJ asked why the 5 governance/reserves facts (P6.1, 2026-07-05) lived on the charity profile page rather than at Step 3 or Step 4. Investigation found they were never actually consumed anywhere — not by Step 3's summary/eligibility logic, not by P6.5's clone — so `/profile`'s own copy ("helps flag issues before you apply") was untrue.

**Decision: Option C — re-site into the item-graph, not Step 3 or a hybrid.** The schema already had dormant scaffolding that looked purpose-built for exactly this: `item_type` values `data`/`number` and a `source_of_truth = 'charity_profile'` enum value, both defined by P6.2 but never populated. Chosen over keeping them at profile level (never wired up, no reuse of the citation/approval machinery every other item already has) and over building AI-driven per-funder relevance detection immediately (bigger scope, not asked for this round).

**Scope, confirmed with WJ:**

- Placement only, this round — all 5 items always shown, every application, matching today's behaviour. No AI relevance/citation detection yet; deferred.
- `/profile`'s governance section and the 5 `charity_profiles` columns retired outright. No backfill — this is dev/test data, and the new design has no per-charity "current value" store to backfill into anyway.
- **No seeding between applications, including P6.5 reuse.** WJ was explicit: carrying forward financial/governance figures silently risks stale data. Every application collects these 5 facts fresh, every time — no exception for the "start from your last application" reuse flow.

**Implementation:** new `application_items.field_key` column (CHECK-constrained to the 5 known values) identifies these rows robustly, independent of `item_label` wording. Reserved negative `item_order` (-5 to -1) sorts them first without touching the existing AI-driven narrative numbering. Created via the same dual sync path every other item already uses (`setDraftInProgress`, Step 4's fallback sync) — a third upsert block runs unconditionally in both, `answer_text` deliberately omitted so a fresh row inserts blank and an already-answered row is never clobbered on repeat syncs. `answer_text` stores the literal display value as plain text (not a coded enum), so `saveAnswer`/`approveAnswer` and the Step 5 export needed zero changes — only the Step 4 input widget is type-aware (a number input, or a Yes/No/Not sure yet select, instead of a textarea). P6.5's clone explicitly filters out `field_key IS NOT NULL` rows so reuse never carries these forward either. Item labels end in "(optional)" deliberately, reusing Step 4's existing optional-question gate with no code change to that logic.

Also fixed in passing: the Step 4 orphan-cleanup filter (deletes unanswered rows the AI summary no longer mentions) was duplicated identically in two branches — extracted into a single tested `isOrphanedItem()` helper, which also had to learn to never treat a governance item as orphaned regardless of the current AI summary's numbering.

`tsc --noEmit`, `eslint --max-warnings 0`, all 55 tests pass (9 new). Migration applied to `grant-pathway-dev` only (confirmed via `supabase migration list` before/after — 22/22, then 23/23); `grant-pathway-prod` remains unlinked. Live browser verification pending WJ.

**Files changed:** `supabase/migrations/20260715000000_governance_items_move_to_item_graph.sql`, `lib/governance-items.ts` (new), `lib/database.types.ts`, `actions/applications.ts`, `actions/charity.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-draft.tsx`, `components/charity-profile-form.tsx`, `__tests__/governance-items.test.ts` (new), `docs/data-model.md` (v1.10), `IMPLEMENTATION-STATUS.md`.

---

## 2026-07-15 — Step 3 extraction pinned to `temperature: 0`; anti-merge rule added

Ad-hoc E2E testing found a regression: MK Community Foundation — Oak Grants extracted 10 questions on a brand-new test run, down from the 12 confirmed correct the day before (2026-07-14 P6.3 live-test). `git log` and a same-code-path check ("Regenerate summary" vs. a first-time upload) ruled out a code change or stale cache — the guideline text and route were identical between runs.

**Root cause:** the Step 3 Bedrock call (`app/api/generate-summary/route.ts`) never set a `temperature`, leaving the model at its non-zero API default — the same input text can legitimately produce different extraction output, including a different question count, on separate calls. This had never been decided or documented anywhere (`ADR-AI-004`, the prompt-construction ADR, said nothing about temperature). Separately, `lib/prompts.ts`'s extraction rules only forbade merging questions _across_ multiple application forms — nothing stopped the model merging two adjacent, related-but-distinct questions _within_ one form, which is the specific pair (existing funding secured / fundraising plans) that went missing.

**Fixed:** `temperature: 0` pinned on the Step 3 summary call only — this is a structured-extraction task (pull out what's literally stated), not creative generation, so determinism is the correct behaviour. `/api/refine-answer` (rewording a user's own answer) is a different, more variation-tolerant task and was deliberately left unchanged. The extraction prompt gained an explicit instruction alongside the existing cross-form rule: never merge two distinct questions into one, even when adjacent or thematically related, even within the same form.

This is a general reliability fix, not specific to one funder — any funder's guidelines could in principle have hit the same non-deterministic merging behaviour.

`tsc --noEmit` and `eslint --max-warnings 0` both clean. No schema change.

**Live-verified by WJ the same day:** re-ran "Regenerate summary" three times on MK Community Foundation — Oak Grants — all three runs consistently returned 12 questions. Separately, a fresh funder (MK Community Foundation — Sapling Grants) was spot-checked: Claude's manual read of the PDF (applying the same extraction rules) predicted 6 narrative questions; the live app returned exactly 6.

**Files changed:** `app/api/generate-summary/route.ts`, `lib/prompts.ts`, `IMPLEMENTATION-STATUS.md`, `ADR-AI-004-prompt-construction.md`.

---

## 2026-07-14 — P6.6 (Transparency Status) retired, will not be built

P6.6 was designed to show a per-funder trust badge (fully supported / partially supported / guidance-only / unreviewed), keyed to whether a human curator had reviewed and approved a playbook for that funder. P6.5's pivot earlier today to private, per-charity reuse removed that basis entirely — no curator role exists or is planned. Rather than invent a substitute signal (extraction/citation quality, structured-vs-free-text parsing were both considered), WJ confirmed retiring the task: with no curation step anywhere in the product, every funder is in the identical state, so there is nothing left for a "trust tier" to differentiate.

**Effect on the launch gate:** the Phase 6 → Go-Live Gate now requires P6.1–P6.5 complete (was P6.1–P6.6). Phase 6's tracked task count drops from 8 to 7.

**Files changed:** `IMPLEMENTATION-PLAN.md` (v3.15), `IMPLEMENTATION-STATUS.md`, `ADR-DATA-006-application-item-graph-model.md` (new amendment), `ADR-TRACEABILITY.md` (v2.12), `docs/v1-out-of-scope.md`, `docs/constraints-and-assumptions.md`, `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md`.

---

## 2026-07-14 — P6.5 live-tested: two small UI tweaks

WJ live-tested P6.5 against MK Community Foundation — Oak Grants immediately after it shipped. The reuse choice, Step 2 skip, and carried-over citation/badge all worked correctly on the first try — no functional bugs found this time. Two presentation tweaks requested: the page citation badge now reads "Page N of the guidelines" (was just "Page N"); the "Carried over — please review" badge is now bold and larger, to draw more attention to the fact it needs a second look. `tsc --noEmit`, `eslint --max-warnings 0`, all 46 tests pass.

**Files changed:** `components/application-step4-draft.tsx`.

---

## 2026-07-14 — P6.5 built: private per-charity reuse, not the originally-designed shared "playbook"

**A design pivot made live, during the walkthrough, not discovered after building the wrong thing.** P6.5 had been scoped since 2026-07-05 as "Playbook Infrastructure and Curation Workflow" — a versioned, human-reviewed record per funder, approved once by a curator, reused by every charity applying to that funder. Before writing any migration, WJ asked directly: why shouldn't a charity applicant be their own curator? Working through it surfaced the real justification for a _shared_ playbook — reliability for every future applicant, not just whoever curated it first — and that a charity reviewing their own past application has no reason to notice extraction mistakes that don't affect them personally, which a shared record would then silently trust for every unrelated applicant afterwards. That risk doesn't exist if reuse is private to one charity's own account.

**What's built instead:** when a charity starts a new application for a funder they've already reached Step 4 with before, Step 1 offers an explicit choice — "Start fresh" or "Start from your last application to [Funder]." Choosing reuse carries across, entirely within that one account: the question list (`application_items`, including their own previous answers, `is_approved` reset to `false`), the retained guideline text (`application_guidelines`, a full independent copy), and the AI summary (`applications.ai_summary`, so Step 4's prep checklist isn't blank). Step 2 (guideline upload) is skipped entirely; the new application lands on Step 3 with the carried-over summary already showing. Carried-over answers are marked with a "Carried over — please review" badge on Step 4, reusing the citation-badge visual style.

**Schema footprint: one nullable column, not a new table.** `application_items.cloned_from_application_id` (self-referencing FK to `applications`, `ON DELETE SET NULL`, migration `20260714000002`) records which prior application a row was cloned from. `ON DELETE SET NULL` rather than `CASCADE` was deliberate — deleting the source application must not delete the clone, only forget where it came from. Verified by direct SQL round-trip against `grant-pathway-dev`: cloned answer text and citation carried across correctly, `is_approved` reset, and deleting the source application left the clone fully intact with `cloned_from_application_id` nulled.

**Two follow-on effects surfaced and tracked, not silently absorbed:**

1. **P6.6 (transparency status) needs re-design.** It was scoped to derive its per-funder support-status signal from "the approved playbook" — that concept no longer exists. `IMPLEMENTATION-PLAN.md`'s P6.6 section now states this is an open design question, not yet resolved, and must be answered before that task starts.
2. **The rubric-criteria table moved from P6.5 to P6.7.** WJ was explicit that this must not just quietly disappear as a passing mention inside P6.7's open-ended "ongoing" framing — so it's now a named, findable line item there, plus a dedicated `ADR-TRACEABILITY.md` row (⚠️ tracked, tied to `ADR-DATA-006`'s rubric-criterion-link field), plus a memory entry, as three independent tripwires against it being missed.

**Documentation:** `ADR-DATA-006` and `ADR-DATA-007` both amended the same day with the full design history (superseding, not deleting, their original playbook-based text — the original reasoning is kept as historical record per this project's "corrections are dated notes, not silent rewrites" convention). `BRD-Grant-Pathway.md` (v0.51), `PRD-Grant-Pathway.md` (v0.46), `acceptance-criteria.md`, `technical-design.md` (v1.16), and `data-model.md` (v1.9) all corrected to match — every prior reference to a curator-approved, cross-charity playbook was either struck through with the real behaviour alongside it, or marked permanently superseded rather than left as a stale "not yet built" pointer.

**Verification:** `tsc --noEmit`, `eslint --max-warnings 0`, all 46 Vitest tests pass, plus the SQL round-trip above. Live browser verification pending WJ.

**Files changed:** `supabase/migrations/20260714000002_p6_5_reuse_previous_application.sql`, `lib/database.types.ts`, `actions/applications.ts`, `components/application-step1-form.tsx`, `components/application-step4-draft.tsx`, `app/(authenticated)/applications/[id]/step/4/page.tsx`.

---

## 2026-07-14 — P6.4 live-testing bug fix: quote highlighting didn't survive PDF line-wraps

Found live-testing P6.4 minutes after it shipped: WJ opened the "view original guidelines" panel and it showed the top of page 1 instead of jumping to and highlighting the cited quote on page 5. The badge and panel both opened correctly — only the highlight/scroll silently failed.

**Root cause:** the retained text preserves the PDF's own line-wrapping, so a sentence that wraps mid-line becomes `"...this project\nwill address..."` in the stored text, while the AI's quote (a clean sentence) has `"...this project will address..."` — an ordinary space where the source has a newline. `GuidelineTextPanel`'s exact `text.indexOf(quote)` match failed silently and fell back to its "no highlight" degradation path (which was working exactly as designed — the bug was that this fallback triggered far more often than expected, not that the fallback itself misbehaved).

**Fix:** replaced the exact-substring match with a new `findQuoteRange()` (`lib/guideline-citations.ts`) that matches the quote's words in order joined by `\s+`, so any run of whitespace in the source — space, newline, multiple spaces — satisfies a single space in the quote. Moved out of the component and into the shared citation-logic module so it's unit-testable without a DOM environment (this codebase's test setup is Node-only, no jsdom/React Testing Library).

**Verification:** 6 new Vitest tests (`__tests__/guideline-citations.test.ts`), including one that reproduces the exact reported bug verbatim (the real newline-vs-space case), plus multiple/irregular whitespace, no-match, empty-quote, and regex-special-character-in-quote cases (e.g. "£5,001 - £15,000 (20% match required)"). `tsc --noEmit`, `eslint --max-warnings 0`, all 46 tests pass.

**Files changed:** `lib/guideline-citations.ts`, `components/application-step4-draft.tsx`, `__tests__/guideline-citations.test.ts`.

---

## 2026-07-14 — P6.4 built (first milestone): Step 4 shows citations, plus a live-verification finding

**P6.3 live-verified first.** Before starting P6.4, WJ regenerated the Step 3 summary for the real MK Community Foundation — Oak Grants test application (re-supplying the guidelines after a session reset). Checked the result against the actual PDF: the AI found 12 questions where the previous, pre-`P6.3` baseline (recorded in the test plan, 2026-07-03) had only 10. Questions 1–10 matched verbatim; questions 11–12 are genuine, verbatim page-5 questions about additional funding and fundraising plans — both correctly flagged as budget questions, both citing real page 5 content, and both filling a gap the original test-plan baseline had explicitly noted as missing ("no dedicated match-funding question found"). **Conclusion: a correct improvement, not a regression** — `P6.3`'s citation validation works end to end against a real Bedrock call, which local automated tests alone couldn't prove (no real AWS credentials in this environment). **Follow-up agreed, not yet done:** the MK Community Foundation test plan and the user guide need refreshing to reflect the corrected 12-question baseline.

**Then P6.4 built.** Step 4 now shows a small clickable badge next to any question with a validated citation (e.g. "Page 5"), opening a "view original guidelines" panel that highlights the cited quote in the retained text (`application_guidelines`, GAP-33) and auto-scrolls to it.

**Design correction made before writing any UI code:** `ADR-SEC-004`, `ADR-DATA-007`, and `ADR-OPS-006` all assumed this viewer would fetch the raw PDF and render it to a `<canvas>` (pdf.js-style) — a reasonable assumption in July when it was written, but one that stopped being true the moment GAP-33's fix confirmed only _text_ is ever retained, never the raw file. Corrected all three the same day: no PDF-rendering library, no CSP change (`ADR-SEC-004`'s `worker-src 'self' blob:` consequence removed — nothing loads a rendering web worker), no novel accessibility surface (`ADR-OPS-006`'s three-item checklist reduced to two — a text panel is natively screen-reader-accessible, unlike a canvas).

**Implementation:** `app/(authenticated)/applications/[id]/step/4/page.tsx` now selects `guideline_reference` (written by `P6.3`, never read back until now) and fetches `application_guidelines.guideline_text`. `components/application-step4-draft.tsx` gained the citation badge, a single reused `Dialog` (the existing `components/ui/dialog.tsx` Base UI primitive, already used for the senior-review and timeout-warning modals — no new dependency), and a `GuidelineTextPanel` helper that finds the cited quote in the retained text and highlights it — degrading gracefully to "shown but not highlighted" if the quote isn't found verbatim (citations are validated against real page/section markers, not a verbatim-substring guarantee).

**Scope confirmed with WJ before coding:** "walk the graph respecting visibility conditions" is a no-op this pass — nothing produces a branching or non-narrative item yet, so there's no graph-walking logic to actually build. Adding it now would be speculative, against this project's established practice.

**Verification:** `tsc --noEmit`, `eslint --max-warnings 0`, all 40 Vitest tests pass. Live browser verification is pending WJ, same pattern as `P6.2a`/`P6.3`.

**Files changed:** `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-draft.tsx`, `docs/Technical Decision and Design/ADR-SEC-004-http-security-headers.md`, `docs/Technical Decision and Design/ADR-DATA-007-guideline-source-reference-mechanism.md`, `docs/Technical Decision and Design/ADR-OPS-006-accessibility-testing.md`, `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.14), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.10), `docs/Technical Decision and Design/technical-design.md` (v1.15).

---

## 2026-07-14 — GAP-33 fixed: guideline-text retention built

New `application_guidelines` table (migration `20260714000001`) stores `guideline_text` — the marker-tagged text sent to the AI and validated against for citations (`P6.3`'s `textForPrompt`) — one row per application, upserted in `/api/generate-summary` alongside the existing `ai_summary` save. Not the raw uploaded file, which `ADR-DATA-002`/`ADR-FILE-001` never retain.

**Schema:** `id`, `application_id` (FK → `applications`, unique, cascade-deletes), `user_id` (FK → `auth.users`, cascade-deletes, denormalised for RLS same as `application_items`), `guideline_text`, `created_at`, `updated_at`. RLS restricted to own rows on all four operations, same hardened `(select auth.uid())` form as every other user-scoped table.

**Verification:** since this environment has no real AWS credentials, a live Bedrock-triggered write couldn't be tested end to end. Instead, verified by direct SQL round-trip against a real test application: insert, confirm `created_at` stays fixed while `updated_at` bumps on a second upsert (proving the regeneration-refresh path), then clean up. RLS policies confirmed present and correctly scoped via `pg_policies`. `tsc --noEmit`, `eslint --max-warnings 0`, all 40 Vitest tests pass.

**Also updated:** `app/api/account/delete/route.ts` now deletes `application_guidelines` explicitly alongside `application_items`, matching that route's existing explicit-deletion convention (the FK's `on delete cascade` would cover it regardless, but consistency with the documented pattern was judged worth the extra step).

**New gap found, not fixed:** GAP-34 (Low priority) — Step 2/3's "guidelines are not saved" UI copy is now stale, since retention exists server-side (invisible to the user — nothing surfaces it yet, that's `P6.4`). Left for a separate, smaller pass rather than widening this fix's scope.

**Files changed:** `supabase/migrations/20260714000001_gap33_application_guidelines.sql` (new), `lib/database.types.ts`, `app/api/generate-summary/route.ts`, `app/api/account/delete/route.ts`, `docs/data-model.md` (v1.8), `docs/Technical Decision and Design/technical-design.md` (v1.14), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.13), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.9).

---

## 2026-07-14 — GAP-33 found while scoping P6.4: guideline-text retention was never actually built

Before writing any P6.4 code, checked what its "view original guidelines" panel would actually have to render — and found nothing to render. The raw guideline file is deleted from Storage immediately after Step 2 extraction (`ADR-FILE-001`), and the extracted text only ever lives in the browser's `sessionStorage`, cleared the moment the AI summary saves (`lib/guidelines-session.ts`, `ADR-FILE-004`). Neither is retained in Postgres — only a small citation (`application_items.guideline_reference`, built in `P6.2`) is.

`ADR-DATA-002`'s 2026-07-10 reversal decided guideline text _should_ be retained precisely so a citation has something to point at. `ADR-TRACEABILITY.md` carried a task pointer for this — "P6.2a (groundwork) → P6.2 (storage)" — but that pointer was written the same day as the reversal, before `P6.2`'s real task list existed. When `P6.2`'s actual bullets were written (2026-07-13) and built (2026-07-14), they only covered the item-graph and citation-shape half; "store the guideline text itself" was never added to any task, by anyone, at any point. The pointer just sat there unreconciled.

**This is a planning-process gap, not a defect in P6.2's own build.** WJ asked directly whether P6.2 had been built incorrectly — it hadn't: P6.2 was built completely and correctly against what it actually promised (a typed item-graph with a citation-shape column), which is exactly what was verified, tested, and live-tested with zero regressions. The missing piece is a different, larger feature (full guideline-text retention) that a forward-looking ADR note gestured at but no task ever formally picked up.

**Fixed today:** the vague `ADR-TRACEABILITY.md` pointer replaced with a properly registered gap — **⚠️ GAP-33** (High priority, in the Gaps register) — plus two adjacent rows whose "unchanged until P6.2a/P6.2 ship" wording was now stale (both have shipped, without touching this).

**Left deliberately unfixed for now:** `ADR-SEC-004`'s consequence note for the P6.4 viewer says it can "fetch the file as bytes" from Storage — which contradicts `ADR-DATA-002`'s "no raw file ever stored" decision. Correcting that wording is deferred until GAP-33's actual fix is decided, so it's corrected once rather than twice.

**P6.4 is now blocked** on deciding how to plug GAP-33 — a design conversation with WJ is in progress before any P6.4 code is written.

**Files changed:** `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.8), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-14 — P6.3 built (first milestone): extraction now records citations, not just questions

Built the third part of `ADR-DATA-007` Option B: extraction cites a specific chunk of `P6.2a`'s tagged text for each question/section, rather than free-typing a page number. Scope confirmed with WJ before coding: questions/sections only this pass (the ones feeding `application_items`) — not the Step 3 summary bullets, which have no database column to store a citation in yet and nothing displays any citation regardless (that's `P6.4`).

**Prompt (`lib/prompts.ts`):** `buildSummaryPrompt`'s JSON schema gained an optional `citation` field per question/section — `source_type` ('page'/'heading'), `page_number`, `heading_path`, `quote` — matching the shape agreed with WJ on 2026-07-13. Explicit instruction: omit the citation entirely rather than guess if no `[PAGE N]`/`[SECTION: ...]` marker clearly applies.

**Validation (`lib/guideline-citations.ts`, new):** a citation is never trusted purely on the AI's word. `extractValidMarkers()` reads the real markers out of the text the AI was actually given; `validateCitation()` cross-checks the AI's reported citation against them and returns null if it doesn't check out (wrong page number, non-existent heading path, or an empty quote) — a fake or mismatched citation is dropped, not treated as a reason to fail or retry the whole response. If over half of what the AI offered for a document turns out invalid, a warning is logged (visible in error-monitoring only) as a signal worth checking, without blocking the user — threshold agreed with WJ. `toGuidelineReferenceColumn()` converts a validated citation into the exact JSONB shape `application_items.guideline_reference`'s `P6.2` CHECK constraint requires: the unused key (`page_number` or `heading_path`) must be an **absent object key**, not a `null` value, since the constraint tests key presence via the `?` operator, not value.

**Wiring:** `app/api/generate-summary/route.ts` reconciles citations once, after either the first-attempt or retry-attempt JSON parse succeeds, against `textForPrompt` (post-truncation — the same text the AI saw). Both `application_items` write points (`actions/applications.ts`'s `setDraftInProgress`, and Step 4's page-load sync fallback) now pass the validated citation into `guideline_reference`. No other field or item-type change — `item_type`/`source_of_truth` stay hardcoded `'narrative'`/`'user_input'` exactly as in `P6.2`.

**Design walkthrough:** presented item-by-item to WJ in plain language, as with `P6.2a`. One real decision point (silently drop an invalid citation vs. reject/retry the whole AI response) resolved in favour of dropping — a missing citation is a minor, invisible gap since nothing renders citations yet. A follow-up question (what threshold should trigger a warning) settled at >50% invalid.

**Verification:** `tsc --noEmit`, `eslint --max-warnings 0`, `prettier --check` all clean. 11 new Vitest tests (`__tests__/guideline-citations.test.ts`, 40/40 total passing) cover marker extraction, valid/invalid page and heading citations (including a citation pointing at a real-looking but non-existent page/heading — the hallucination-guard case), empty-quote rejection, and the key-omission behaviour required by the CHECK constraint. **Live verification limitation:** this local environment has no real AWS credentials configured (`.env.local`'s `AWS_ACCESS_KEY_ID` is an empty placeholder) — a real Bedrock call against the actual MK Community Foundation guideline PDF could not be made from here. "No information loss versus the current prompt" and citation accuracy against real content are confirmed by code review and unit tests only; live browser verification through Step 2/3 against the real PDF is still pending WJ, same pattern as `P6.2a`.

**Files changed:** `lib/prompts.ts`, `lib/types.ts`, `lib/guideline-citations.ts` (new), `app/api/generate-summary/route.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `__tests__/guideline-citations.test.ts` (new), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.12), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.7), `docs/Technical Decision and Design/technical-design.md` (v1.13).

---

## 2026-07-14 — P6.2a built: guideline extraction now tags structure instead of discarding it

Built the groundwork task from `ADR-DATA-007` Option B ("the text itself carries verifiable structure — e.g. `[PAGE 3]` markers") — extraction preserves page (PDF) or heading (docx, pasted text) boundaries so a future citation can only ever point at a chunk of text that structurally exists in the source, rather than a free-typed guess. This is groundwork only: nothing consumes the markers yet, that's `P6.3`.

**PDF (`lib/extract-text.ts`):** `unpdf` switched from `mergePages: true` (all pages flattened into one string, page boundaries lost) to per-page extraction, rejoined with a `[PAGE N]` marker before each page's text.

**Docx (`lib/extract-text.ts`):** switched from `mammoth.extractRawText` (plain text, headings discarded) to `mammoth.convertToHtml`, which preserves Word's heading styles as `<h1>`–`<h6>` tags. A new helper walks the HTML tracking a heading-level stack and emits `[SECTION: A > B]` markers preserving the full nesting trail — docx has no fixed pages, so headings are the fallback reference unit per the task spec.

**Pasted text (`lib/preprocess-text.ts`):** no file means no source of structure at all, so a new heuristic reuses the numbered ("1. Title"/"2.3 Section") and ALL-CAPS heading detection already in this file (previously only used to bound boilerplate-stripping) to insert the same `[SECTION: ...]` markers — numbered headings nest by depth, ALL-CAPS headings reset to top-level. Explicitly a guess, not a guarantee: text with no heading-like lines gets no markers. Skipped entirely if the text already carries markers from `extract-text.ts`.

**Marker protection (`lib/preprocess-text.ts`):** the existing page-number/repeated-line/boilerplate-heading stripping steps are all now marker-aware — a `[PAGE N]`/`[SECTION: ...]` line is never treated as noise.

**ADR consequence gap found and closed:** `ADR-DATA-007`'s consequences section names an `ADR-AI-007` follow-on that was not one of `IMPLEMENTATION-PLAN.md`'s three listed P6.2a bullets — the character-ceiling truncation safety net needs to become marker-aware, snapping to the last complete marker before the ceiling rather than the last newline, so a page/section that would be cut off is dropped in its entirety rather than left half-populated with no citation to anchor to. Added as a fourth step per AGENTS.md's mandatory ADR consequences check. The ceiling _value_ (20,000 chars dev / 50,000 prod) is unchanged — confirmed with WJ this fixes only where the cut lands, not how much is cut.

**Design walkthrough:** presented item-by-item to WJ in plain, jargon-free language (re-explained after an initial pass used too much technical shorthand) before any code was written — each item confirmed as information-only except the truncation fix, which WJ explicitly approved.

**Verification:** `tsc --noEmit`, `eslint --max-warnings 0`, `prettier --check` all clean. 7 new Vitest tests added (`__tests__/preprocess-text.test.ts`, 29/29 total passing) covering marker protection, pasted-text nesting including the ALL-CAPS reset case, no-double-tagging of already-marked text, and marker-aware truncation including the no-marker-in-range fallback. Live browser testing of an actual PDF/docx upload through Step 2 was not performed by Claude — per this project's convention, that is WJ's live-testing pass, not a substitute automated check.

**Files changed:** `lib/extract-text.ts`, `lib/preprocess-text.ts`, `__tests__/preprocess-text.test.ts` (new), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.11), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.6), `docs/Technical Decision and Design/technical-design.md` (v1.12).

---

## 2026-07-14 — P6.2 built: application_answers → application_items (item-graph model, compatibility mode)

Built the typed item-graph schema decided in `ADR-DATA-006` and `ADR-DATA-007`, replacing `application_answers` outright rather than extending it (migration `20260714000000`, `grant-pathway-dev` only — `grant-pathway-prod` stays untouched and unlinked until P5.4). Compatibility mode: only `item_type = 'narrative'` is populated — the new schema's other nine item types (`data`, `date`, `number`, `table`, `file`, `consent`, `eligibility_gate`, `scoring_criterion`, `manual_action`) exist in the enum but are not yet produced by any code path; that is P6.3 onward, funder by funder.

**Schema:** `question_text`/`question_order` renamed to `item_label`/`item_order`. New columns: `item_type`, `visibility_condition`, `source_of_truth`, `validation_mode`, `rubric_criterion_link` (no FK yet — the rubric table doesn't exist until P6.5), `decision_maker_visible`, `output_mode`, `guideline_reference`. Two decisions enforced at the database layer rather than left to application-code convention: `output_mode` is `CHECK`-constrained to `generic_export` only (`native_template_fill` is permanently out of scope per ADR-DATA-006's 2026-07-11 amendment — this makes that boundary real, not just documented), and `guideline_reference` is `CHECK`-constrained to ADR-DATA-007's discriminated-union shape (`source_type` XOR `page_number`/`heading_path`, `quote` always required when present).

**Migration approach:** new table created, all 169 existing rows copied across as `item_type = 'narrative'` with zero information loss (verified by direct query — all 10 items of the MK Community Foundation — Oak Grants test application, "Community Mental Health Drop-In Programme 2026–27 - Retest 040726", intact: labels, order, approval state, answer source), old table dropped. Chosen over an in-place `ALTER TABLE` rename because the shape change is large enough that a side-by-side compare-then-drop is safer than reshaping in place, and this is dev-only so there's no data-preservation cost to the cleaner approach. `funders.funder_type` also dropped in the same migration — ADR-DATA-006 consequence 5, formally superseding DR-FD-001 rather than leaving the column as unused cleanup.

**Live-tested by WJ same day, two passes:** (1) re-opened the application — Step 4 correctly showed all 10 items with their original labels and answers, and `is_approved` correctly reset to `false` on every row (the `reopen_application` RPC repointed at `application_items`, working as intended). This caught a documentation error in this entry's first draft, which had misquoted the item count as 13 — a conflation with the unrelated "13/13 test cases" figure from this funder's `TEST-DASHBOARD.md` test plan, not the actual `application_items` row count. Corrected here. (2) Full end-to-end write path exercised: edited and saved an answer (`saveAnswer`), approved all 10 individually and the whole application (`approveAnswer`, `approve_application` RPC), passed the senior-review gate, assembled the draft, and exported to Word — output document correctly showed the edited answer and all 10 numbered Q&A pairs. This satisfies P6.2's exit criterion in full ("proven end to end — extraction, storage, Step 4 rendering, export — with zero regression"), not just the read/re-open path.

**Blast radius:** the `approve_application`/`reopen_application` Postgres RPCs and seven application code files (`actions/applications.ts`, both Step 4/5 pages, the export/refine-answer/account-delete/cron-inactivity-deletion routes) all had to be repointed at the new table/columns in the same change, plus `supabase/seed.sql`. `tsc --noEmit`, `eslint --max-warnings 0`, and all 22 Vitest tests pass clean.

**Files changed:** `supabase/migrations/20260714000000_p6_2_application_item_graph.sql` (new), `supabase/seed.sql`, `lib/database.types.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `app/(authenticated)/applications/[id]/step/5/page.tsx`, `app/api/export/[applicationId]/route.ts`, `app/api/refine-answer/route.ts`, `app/api/account/delete/route.ts`, `app/api/cron/inactivity-deletion/route.ts`, `components/application-step4-prep-checklist.tsx`, `docs/data-model.md` (v1.7), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.10), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-13 — P6.2 environment scoping confirmed: dev only

Confirmed with WJ rather than assumed: P6.2 follows the same convention as P6.1 — applied only to `grant-pathway-dev`, with `grant-pathway-prod` untouched and unlinked until P5.4. Worth an explicit confirmation rather than inheriting the P6.1 precedent silently, since P6.2's migration is far larger in scope (it supersedes `application_answers` entirely, rather than adding five nullable columns) — the blast radius of getting this assumption wrong would be much bigger than it was for P6.1.

This was the last of three prerequisites identified before P6.2 build could start: test funder (Oak Grants, v3.7), citation-field shape (v3.8), and this scoping decision (v3.9). All three are now settled.

**Files changed:** `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.9), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-13 — P6.2 guideline-reference field shape agreed with WJ

The task list previously described the citation field vaguely ("page number or section/heading") with no concrete data shape — writing a migration against that wording would have meant guessing, with a real risk of a schema rewrite once P6.2a's actual output was known. Presented as a visual mockup (two worked examples — a PDF page-anchored citation from Idlewild Trust, a docx heading-anchored citation from Henry Smith Foundation — each shown as it would render in the app, plus the underlying data shape) rather than raw JSON, since a plain-text schema proposal isn't a format WJ can evaluate directly. Approved as proposed, with the caveat that live testing will be the real confirmation once built.

**Shape:** a discriminated union — `source_type: 'page' | 'heading'`, `page_number` (page citations only), `heading_path: string[]` (heading citations only, an array to preserve nesting), `quote` (short verbatim excerpt, always present regardless of source type — what the P6.4 "view original guidelines" panel highlights, and a second, human-checkable guarantee against a hallucinated citation).

**Files changed:** `docs/Technical Decision and Design/ADR-DATA-007-guideline-source-reference-mechanism.md`, `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.8), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-13 — P6.2 test funder chosen: MK Community Foundation — Oak Grants

P6.2's exit criterion requires proving the item-graph migration "end to end... with zero regression" against an existing funder, which needs a baseline result that's actually trustworthy today. Oak Grants is the only funder at 🟢 on `docs/Test Plans/TEST-DASHBOARD.md` — fully re-verified against the current schema (13/13 test cases, 2026-07-04). Every other funder is 🔁 (passed, but predates the 2026-07-01 schema fix) or 🟡 (untested), which would mean re-establishing a baseline before P6.2 work could even start. Checked Oak Grants' own test plan for entanglement with the parked Group Profile Score (R16, MK Community Foundation's own cross-application scoring criterion) — none found, so this stays within compatibility-mode scope.

**Files changed:** `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.7), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-13 — Phase 6 plan audit: P6.6/FR-46 conflict reconciled, three uncovered ADR consequences added, cross-check safeguard added to AGENTS.md

A full audit of the Phase 6 plan (`IMPLEMENTATION-PLAN.md`) against the BRD, PRD, `acceptance-criteria.md`, `technical-design.md`, and `technology-stack.md` found P6.6 (Transparency Status) specified a support-status field "per funder/playbook," surfaced in the Step 1 picker — the same funder-identity-scoped premise that FR-46 (three-tier funder coverage badge) was withdrawn for on 2026-07-11, six days after `ADR-DATA-006` first specified P6.6. Neither document had been cross-checked against the other at the time.

**Root cause:** the FR-46 withdrawal was reasoned entirely within `moscow-feature-register.md`/`v1-out-of-scope.md`, with no step requiring a check of the live Phase 6 task list for the same underlying concept.

**Fixed:** P6.6 reworded so status is explicitly scoped to the approved _playbook_ (pinned to a specific curated guideline version), not to the funder as a standalone identity — a funder with no matching approved playbook falls back to unreviewed/live-extraction status. `ADR-DATA-006` and `v1-out-of-scope.md` both updated with matching reconciliation notes.

**Also fixed during the same audit (three ADR consequences that had no covering task):** P6.2 gained an explicit bullet to drop the unused `funders.funder_type` column (`ADR-DATA-006` consequence 5) and to name the `scoring criterion` item type as R16's resolution mechanism; P6.5 gained an explicit `funder_note` field on the playbook (R17's disclosure mechanism, already documented in `clean-slate-design-proposal.md` but not named in the task list).

**Process change:** AGENTS.md's Tier 2 rule for `moscow-feature-register.md` now requires grepping the live Phase 6 task list for the same concept before closing out a withdrawal or promotion, so this failure mode does not recur.

**Files changed:** `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.6), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Technical Decision and Design/ADR-DATA-006-application-item-graph-model.md`, `docs/v1-out-of-scope.md`, `AGENTS.md`.

---

## 2026-07-13 — Date display made consistent (zero-padded day) across dashboard, Step 5, and export

Surfaced during the `PRD-Grant-Pathway.md` Section 7 (Screen Specifications) review, Screen 5 (Dashboard): the doc's own "Last updated [DD Month YYYY]" wording implies a zero-padded day, but `components/dashboard-populated.tsx`'s `formatDate()` and `components/application-step5-approve.tsx`'s `formatExportDate()` both used `day: 'numeric'` (e.g. "3 July 2026"), while the exported Word/text document's own date formatter (`app/api/export/[applicationId]/route.ts`) used `day: '2-digit'` (e.g. "03 July 2026"). WJ asked for all three to be made consistent. Changed both UI-side formatters to `day: '2-digit'` to match the export route, rather than the reverse, since the documentation's own "DD" convention already implied zero-padding.

**Files changed:** `components/dashboard-populated.tsx`, `components/application-step5-approve.tsx`, `docs/PRD-Grant-Pathway.md`.

---

## 2026-07-13 — Dashboard `mismatch` status now counted; "View" renamed to "Re-open"; re-open wording reconciled

Surfaced during a full section-by-section review of `docs/PRD inputs/acceptance-criteria.md` against live code (Section 9.3, Application Management).

**Dashboard summary strip didn't count `mismatch` applications.** `applications.status` has five values (`not_started`, `in_progress`, `approved`, `exported`, `mismatch` — the last set by FR-47's eligibility hard stop), but `components/dashboard-populated.tsx`'s summary strip only tallied four. A mismatched application still appeared as a card and counted toward the total shown, but was invisible in the breakdown — so the four numbers didn't sum to the total whenever a mismatch application existed. WJ decided `mismatch` should get its own fifth count so the numbers tally. Added `mismatch` to the `counts` object and a fifth "[n] ineligible" segment to the summary strip.

**"View" button relabelled to "Re-open."** The button shown on `approved`/`exported` cards was labelled "View" but is not read-only — clicking it opens a confirmation modal and, on confirm, reverts status to `in_progress`, resets `draft_status`, clears the assembled draft, and un-approves every answer. Renamed to "Re-open" to match what the confirmation modal, its own button, and the underlying `reopenApplication()`/`reopen_application` RPC already call it.

**Re-open confirmation wording reconciled.** Two different UI entry points for the same re-open action (the dashboard card's modal and Step 5's own "Re-open application to make changes" dialog) had slightly different confirmation text. Standardised both on: "Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."

**`acceptance-criteria.md` corrected to match** across Sections 9.3, 9.6, 9.7, and 9.9 (multiple other pre-existing wording/behaviour mismatches also found and corrected in that same pass — see the document's own revision note for the full list).

**Files changed:** `components/dashboard-populated.tsx`, `components/application-step5-approve.tsx`, `docs/PRD inputs/acceptance-criteria.md`, `actions/auth.ts` and `app/auth/callback/route.ts` (unrelated stale D-012 comments corrected in the same session — see below).

---

## 2026-07-13 — Stale D-012 code comments corrected to describe the shipped auto-submit behaviour

Two comments (`actions/auth.ts`'s `confirmEmail()`, `app/auth/callback/route.ts`) still described D-012's fix as requiring "an explicit button click" on the email-confirmation page. That described an earlier version of the fix; the shipped behaviour (`components/confirm-email-form.tsx`) auto-submits via a `useEffect` on mount with no visible button at all, relying on the fact that Gmail's link-scanner fetches the raw page over HTTP and never executes JavaScript. Found during the same acceptance-criteria.md review (FR-03 check) — `acceptance-criteria.md` itself already correctly described the real behaviour; only these two code comments were stale.

**Files changed:** `actions/auth.ts`, `app/auth/callback/route.ts`.

---

## 2026-07-10 — Stale "Generate your draft" copy corrected to "Write your answers"

The dashboard empty-state three-step explainer (`components/dashboard-empty.tsx`) still labelled Step 3 "Generate your draft," a holdover from the auto-generation model abandoned in the 2026-05-28 Step 4 redesign (`PRD-Grant-Pathway.md` Section 6.6): the app no longer auto-generates a draft, the charity writes every answer, and AI only assists on request via "Help me improve this." The same stale phrase had propagated into six other documents that were never updated when that redesign shipped.

Relabelled to "Write your answers" (paired description where one accompanies the label: "You write every answer — AI can help if you ask") in the component and in `PRD-Grant-Pathway.md` (bumped to v0.18), `screen-requirements.md`, `IMPLEMENTATION-PLAN.md`, `PDR-UI-005-dashboard-design.md`, `DDR-CS-006-empty-state.md`, `design-requirements.md`, and `Business Design/mockup.html`.

**Files changed:** `components/dashboard-empty.tsx`, `docs/PRD-Grant-Pathway.md`, `docs/PRD inputs/screen-requirements.md`, `docs/Implementation Plan/IMPLEMENTATION-PLAN.md`, `docs/PRD decisions/PDR-UI-005-dashboard-design.md`, `docs/Business Design/DDR-CS-006-empty-state.md`, `docs/Business Design/design-requirements.md`, `docs/Business Design/mockup.html`.

---

## 2026-07-10 — `supportingDocuments` surfaced on the Step 4 preparation checklist

A code review found the Step 3 AI summary prompt (`lib/prompts.ts`, `buildSummaryPrompt`) extracts a `supportingDocuments` field (list of document categories the funder requires) on every summarisation call, typed and Zod-validated, but never rendered anywhere — unlike `funderAiPolicy`, which has an explicit "deliberately not displayed" comment, this field had no such comment and looked like dead extraction work.

Presented WJ two options — display it on Step 3, or remove it from the prompt to cut extraction scope — and while investigating found a third: Step 4 already shows a hardcoded, generic "Before you begin writing" preparation checklist (`components/application-step4-prep-checklist.tsx`, S6.4) with the same four items for every funder. WJ chose to merge the extracted list into that screen instead, as a second, funder-specific checklist shown alongside (not replacing) the standing one — see `PDR-UI-007`.

`app/(authenticated)/applications/[id]/step/4/page.tsx` now parses `ai_summary` before the `draft_status === 'not_started'` branch (previously parsed later, only for question sync) and passes `funderName` + `supportingDocuments` into `ApplicationStep4PrepChecklist`. The component renders the extracted list under "[Funder name] also asks you to submit:" only when non-empty; the four hardcoded financial-prep items are unchanged. `tsc --noEmit` and `eslint` both clean; not yet verified in a live browser session (reaching this screen requires a real AI summarisation call against monthly quota, so left for WJ's own testing per the project's usual verification approach for this app).

**Files changed:** `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-prep-checklist.tsx`, `docs/PRD decisions/PDR-UI-007-supporting-documents-checklist.md` (new), `docs/PRD decisions/PRD-DECISIONS-INDEX.md`, `docs/PRD inputs/acceptance-criteria.md` (new AC-FR-28-09), `docs/PRD inputs/screen-requirements.md` (new "Step 4 — Preparation Checklist" section — this screen had no prior entry in this doc).

---

## 2026-07-10 — Dead code removed: `buildDraftPrompt`

`PRD-Grant-Pathway.md` v0.4 (Section 10.2) had confirmed `lib/prompts.ts`'s `buildDraftPrompt` function had zero callers anywhere in the codebase, since its presumed caller, the `/api/generate-draft` route, was deleted 2026-07-01 — but flagged the removal as a separate follow-up rather than fixing it in that pass. This closes that follow-up.

Removed `buildDraftPrompt` and the `ApplicationQuestion` type (used only by it) from `lib/prompts.ts`, and the three dedicated tests (`buildDraftPrompt — XML fencing` describe block and its import) from `__tests__/prompts.test.ts`. Re-confirmed zero remaining references via a full-codebase grep before removing. `tsc --noEmit`, `eslint . --max-warnings 0`, and the full Vitest suite (22 tests, 4 files) all pass clean afterward. `lib/prompts.ts` now exports exactly the two prompt builders live routes actually use: `buildSummaryPrompt` and `buildRefinePrompt`.

**Files changed:** `lib/prompts.ts`, `__tests__/prompts.test.ts`, `docs/PRD-Grant-Pathway.md` (bumped to v0.5 — Section 10.2 updated, revision history row added).

---

## 2026-07-10 — Open source vs. closed source conflict found and reversed: closed source confirmed

A review surfaced a standing conflict between two decision records dated eight days apart in April: `DR-BM-003` (2026-04-09) decided Grant Pathway would be fully open source under the MIT Licence, reasoning that the succession plan (`DR-BM-002`) depended on public hosting and that there was "no commercial value to protect." `ADR-STACK-005` (2026-04-17) decided the opposite — private GitHub repository, proprietary licence, all rights reserved — with no note linking it to or reversing `DR-BM-003`. The live repository has in fact been private with no licence file throughout, matching `ADR-STACK-005`, but several other docs (this codebase's own README, Terms of Service, business overview, constraints register, technology stack) still described the open-source position as current.

WJ decided closed source is correct going forward, for four reasons: (1) the "no commercial value to protect" premise doesn't hold — the AI prompt engineering (`lib/prompts.ts`) and the item-graph/playbook curation design (Phase 6, `ADR-DATA-006`) are genuinely differentiated, hard-won product work worth protecting; (2) the two options aren't symmetrically reversible — closed → open is trivial to decide later, open → closed is not, since public code can be cloned, forked, or mirrored and never fully retracted, so the reversible option is the sound default; (3) free-to-charities (C5) and closed source aren't in tension — C5 governs what charities pay to use the app, not who can see the source code; (4) the succession plan's actual continuity goal doesn't require public code specifically — `DR-BM-002` already listed escrow with a sector body (Option C) and a named co-maintainer (Option B) as alternatives that achieve the same goal without giving up IP protection.

**Files changed:** `DR-BM-003` — original Decision/Options/Rationale preserved unchanged as the historical record; a dated reversal note added at the top, frontmatter gains `superseded_by: ADR-STACK-005`. `DR-BM-002` — Decision and Rationale rewritten to adopt Option C (escrow with a named sector body or trusted third party, activated on a defined trigger) as the succession mechanism, with Option D (defined sunset process) unchanged as last-resort fallback; a "Change from Previous Decision" note added; frontmatter gains `supersedes: 2026-04-09 decision`. `ADR-STACK-005` — brief note added confirming it was actively reconsidered and reaffirmed 2026-07-10, not silently left alone; no content change. `constraints-and-assumptions.md` — C17 and C18 descriptions corrected to proprietary licence / private repository / escrow-based continuity (Ref numbers unchanged). `business-overview.md` and `docs/overview/business-overview.md` (stale duplicate copy) — "the code is open source" line corrected. `technology-stack.md` — TS-10 and Stack Summary corrected to private repository, proprietary licence; bumped to v1.5. `DECISIONS-INDEX.md` — `DR-BM-003` and `DR-BM-002` status changed to Revised, new Revision History row added; total Decided/Revised counts updated.

**Also corrected in the same sweep** (docs and repo root describing Grant Pathway's own codebase, not a third-party open-source dependency): `README.md` (top-line description and Licence section), `docs/legal/terms-of-service.md` Section 8 (Intellectual Property — bumped to v1.3), `docs/non-functional-requirements.md` and `docs/PRD-Grant-Pathway.md` (secrets-management rows referencing "public repository"), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` P0.1 (GitHub setup step), `docs/decisions/DR-BM-001-who-builds.md` (dated note — its stated intention to transition toward open-sourcing the codebase no longer holds), `docs/Technical Decision and Design/ADR-DATA-004-database-migrations.md` (rationale no longer ties local-dev onboarding to open source specifically).

**Not regenerated:** `Grant-Pathway-Business-Overview.docx` is now out of sync with the corrected `business-overview.md` and needs regenerating via the docx skill — deliberately left as a separate follow-up task pending review of these `.md` changes. **Not yet resolved:** `DR-BM-002`'s updated decision names escrow with "a named sector body or trusted third party" but no specific organisation has been identified yet — this was already an open action under the original decision and remains open under the new mechanism.

---

## 2026-07-10 — Guideline source-reference feature blended into Phase 6 (planning only)

Design discussion on adding page/section citations to the Phase 3 (AI Summary) and Phase 4 (Draft Answers) screens — so a user can cross-reference the AI's output against their own copy of the funder guidelines, and get reassurance that no section was dropped — considered three options: (1) a simple free-text page/section label attached to each summary bullet, generated and discarded at summary time; (2) chunk-anchored citations (guidelines pre-split into numbered chunks; the model cites a chunk ID rather than free-typing a number) plus a clickable "view original guidelines" panel that jumps to and highlights the source; (3) full document retention with a viewer but no structural citation guarantee. Recommended option 2, since a chunk ID the model must select from a known list can't be hallucinated the way a free-typed page number can, and the same chunking also enables an automated check that every guideline section got cited by something.

Initial analysis assumed `ADR-DATA-002` ("guidelines are never stored") still applied and estimated a ~2–3 week standalone build. Re-examining under the assumption that constraint didn't exist, and separately checking the actual Phase 6 plan, found option 2 would touch the exact same surface Phase 6 (P6.2–P6.5) is already rewriting: the data model (`application_answers` → item-graph), the extraction prompt (`lib/prompts.ts`), and Step 4 rendering. Building it as a standalone track ahead of Phase 6 would mean building it twice — once now against the current flat schema, again once P6.2's item-graph model lands. WJ decided to fold it into Phase 6 as one blended plan instead of running two separate ones.

**`IMPLEMENTATION-PLAN.md` (bumped to v3.2) and `IMPLEMENTATION-STATUS.md`** updated: added a new groundwork task **P6.2a** (preserve PDF page boundaries during extraction, currently flattened; stop `lib/preprocess-text.ts` stripping page-number markers; docx/pasted guidelines fall back to heading/section structure) — independent of P6.1 and P6.2, can start immediately. Added bullets to the existing tasks rather than new phase numbers: **P6.2** gains a guideline-reference field on each item in the new schema; **P6.3**'s extraction rewrite also records which page/section each item was drawn from, citing a chunk rather than free-typing a number; **P6.4**'s Step 4 rework shows the reference and adds the "view original guidelines" panel; **P6.5**'s human playbook review also confirms or corrects the reference once per funder, rather than trusting a fresh AI guess on every application.

Planning only — no code changed. No ADR or PDR written yet for the citation mechanism itself; worth adding one when P6.2/P6.3 build actually starts, per the ADR consequences check.

## 2026-07-05 — P6.1 complete: charity profile governance and reserves fields

First implementation work on Phase 6. Added `total_expenditure`, `reserves`, `trustees_related`, `bank_signatory_count`, and `bank_signatories_related` to `charity_profiles` (migration `20260705000000`), extended `actions/charity.ts` and the profile-setup form, and surfaced a live "months of reserve cover" ratio (`reserves ÷ (total_expenditure ÷ 12)`) once both figures are entered — closing R13 (Walton, MK Community Foundation) for the profile side. Scoped deliberately minimally, per WJ's decision, to only what R13 needs — not the rest of the documented-but-never-built "thick profile" fields already sitting in `data-model.md` (address/contact, remaining financial fields, supporting-doc status), which is a separate, pre-existing gap left untouched here. Applied to `grant-pathway-dev` only; `grant-pathway-prod` remains unlinked and untouched, consistent with prod not being re-entered until P5.4. All five new fields are nullable and optional — existing profiles and the rest of the product are unaffected. Verified via `tsc --noEmit`, `eslint`, the full Vitest suite, and `next build`, all clean; not yet verified in a live browser session.

## 2026-07-05 — Launch gated on Phase 6; target date no longer 31 July 2026

Same day ADR-DATA-006 was decided and Phase 6 was first added to `IMPLEMENTATION-PLAN.md` as a non-gating parallel track, WJ revised that framing: **Phase 6 (P6.1–P6.6) must now be complete before Grant Pathway launches.** Reasoning: launching on the current flat, narrative-only model while knowingly aware of R1–R20 — in particular, that non-narrative fields are currently silently invisible to the user, who finishes the Step 4 writing flow believing the form is complete when it may not be — risks the "trusted partner" objective established earlier in the day more than a later launch does. There is no commercial deadline forcing 31 July 2026 and no customers waiting; the cost of waiting is acceptable, the cost of a trust failure at launch is not.

Added a **Phase 6 → Go-Live Gate** to `IMPLEMENTATION-PLAN.md`, immediately before P5.6 (DNS and Go-Live) — mirroring the existing Phase 3→4 and Phase 4→5 gate pattern. Requires P5.1–P5.5 (the existing pre-launch checklist, unaffected and free to proceed independently) and P6.1–P6.6 complete. P6.7 (the ongoing funder-by-funder capability extension) is explicitly excepted — it has no completion state by design and does not block launch, nor do the two parked items (native-document output, R16).

**Target launch changed from 31 July 2026 to "not committed — working estimate August–September 2026"** everywhere it was recorded: `IMPLEMENTATION-PLAN.md`, `IMPLEMENTATION-STATUS.md`, `docs/constraints-and-assumptions.md` (C2), `docs/PRD-Grant-Pathway.md`. `ADR-DATA-006` and `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md` amended with same-day notes recording the reversal, rather than silently edited, so the record shows what was actually decided and when it changed.

**Direction given:** work begins on P6.1 (profile schema extension) immediately — tonight or 2026-07-06.

## 2026-07-05 — ADR-DATA-006 decided: Application Item-Graph Model

Formalises the recommendation from a day-long design exercise: a review of nine funders' actual guidance and application materials (`docs/BRD plus decisions Mark Two/question-coverage-analysis.md`) found the flat, narrative-only `application_answers` model (ADR-DATA-001) false in twenty distinct, recurring ways (R1–R20) — mixes of narrative and non-narrative fields, branching and multi-stage forms, published scoring rubrics, sensitive-data handling, at least four budget shapes, guidance split across documents, hard-vs-judgement rules, funder-native output requirements, manual actions Grant Pathway can never complete, guidance with no form to extract at all, and items of unequal importance to an actual decision-maker, among others.

Four architectural options were considered (`docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md` §5): a universal typed item-graph, bolt-on modules added piecemeal to the existing core, AI-drafted/human-reviewed playbooks per funder, and a declared scope boundary that simply excludes unsupported funders. **Decision: a combination — the item-graph as the data model, populated the playbook way, with the scope-boundary transparency principle applied unconditionally on top.** Bolt-on modules were explicitly rejected as the default failure mode this decision is meant to avoid repeating — it is, functionally, what BD-03/BD-04/BD-07 already were, and BD-08 already had to retire one of them (the funder-type badge) once it collided with a case it wasn't built for.

The recommendation was stress-tested against two further funders (Garfield Weston, Heritage Fund) after being drafted, specifically to check whether it would hold or need revision. It absorbed both with incremental additions (R18–R20) rather than a rewrite.

**Formally recorded as `ADR-DATA-006-application-item-graph-model.md`**, superseding `application_answers`' structure (ADR-DATA-001) in part and formally retiring the unused `funders.funder_type` column (DR-FD-001) rather than leaving it as low-priority cleanup. This is a decision, not an implementation — nothing in production changes as a result. Phased build sequencing is recorded separately in `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md`; R16 (scoring criteria driven by cross-application funder history) is explicitly parked pending a separate decision on whether to reverse BD-06.

## 2026-07-05 — Established git version-tagging convention; tagged v0.2.0 baseline before the any-guideline-or-form rearchitecture

Following a design proposal (`docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md`) and build plan (`docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md`) for a significant rearchitecture of guideline/application handling, decided to mark the pre-rearchitecture state in git history before Phase 1 of the build plan begins.

Checked `IMPLEMENTATION-PLAN.md` P5.4 (GAP-12) first, which already specifies a `git tag` step for the go-live commit — found it used two-part `v1.0`, inconsistent with the three-part semver `package.json` requires. Amended GAP-12 to `v1.0.0` and added a note establishing that pre-launch checkpoints use `v0.x.x` tags (no stability guarantee, standard semver meaning of a `0.x` major version), so the full tag history stays in one consistent format from now through go-live.

**Actioned:** `package.json` version bumped `0.1.0` → `0.2.0`; commit tagged `v0.2.0` and pushed; GitHub Release created linking the analysis, proposal, and build plan documents. The next `package.json` bump, to `0.3.0`, will mark the start of Phase 1 of the build plan.

## 2026-07-04 — DR-FD-001 amended: retired the funder picker's "Structured"/"Narrative" badge

Traced during a deep review of the funder-type/question-type terminology prompted by IT-CW-08 (Clothworkers testing). The Step 1 funder picker showed a "Structured" or "Narrative" pill badge next to each funder name, sourced from a `funder_type` column on the `funders` table. Reviewing the real guideline documents in `docs/Grant Org Guidelines/` (22 files, ~15 funders/programmes) found this label doesn't reflect a stable property of the funder: several funders with multiple documents (Henry Smith, Idlewild) have _both_ a discrete-question application form (structured) and free-form background guidance (narrative) — the "same" funder produces both, depending on which document happens to be uploaded in a given session.

Separately, this DB column turned out to be functionally disconnected from what actually matters: Step 3/4/5 behaviour (which UI mode renders, how the export is assembled) is driven by a _different_ `funder_type` value (`structured`/`free_form`), derived fresh from each application's own AI summary at Step 3 — not from this pre-committed DB column. The column was purely cosmetic, driving only the picker badge.

Also traced the terminology's origin: `funder_type` (`structured`/`narrative`) was introduced in `DR-FD-001` (2026-06-01) as a database-schema convenience, two days _after_ the actual product decisions (Mark Two BRD's BD-01–BD-07, 2026-05-29), which never mention it and never define what either term means. The name also collides with an unrelated, well-defined concept — `narrative` as a _question-level_ type (BD-04) — which was a likely source of ongoing confusion.

**Fix:** Removed `funder_type` from the Step 1 picker query and dropped the badge from the UI.

- `actions/applications.ts` — `FunderOption` type no longer carries `funderType`; `getActiveFunders()` selects only `id, name`
- `components/application-step1-form.tsx` — removed the badge `<span>` from each picker list item; the funder name renders alone

The `funders.funder_type` DB column itself is left in place, unused — dropping it is low-priority cleanup, not urgent. The dynamic, per-application `ai_summary.funder_type` classification is completely unaffected and continues to correctly drive Step 3/4/5 behaviour.

**Verified:** `npx tsc --noEmit` clean; full test suite (24 tests) passes unchanged; confirmed no other code references `FunderOption.funderType`.

Full amendment recorded in `docs/decisions/DR-FD-001-funder-directory-model.md` (v1.0 → v1.2).

---

## 2026-07-04 — D-CW-02: AI assist not reliably compressing over-limit answers

Found live during Clothworkers Foundation testing (IT-CW-09): a 344-word answer against a 250-word limit (38% over) was returned by "Help me improve this" almost completely unchanged — no words removed. An earlier, smaller case that same session (60 words against a 50-word limit, 20% over) was partially compressed but still left over the limit.

**Root cause:** `buildRefinePrompt` (`lib/prompts.ts`) told the model both "the refined answer must not exceed N words" and "do not change facts... the claims being made," with no instruction on _how_ to actually cut length when over. With those two instructions in tension and no explicit permission to trim, the model appears to have prioritised preserving every sentence over meeting the limit — more so as the excess grew, which fits both observed data points (worse compliance the further over the limit the answer started).

**Fix:** `buildRefinePrompt` now computes the answer's word count and, when it exceeds the limit, swaps in an explicit hard-requirement instruction: cut less essential detail, combine sentences, and remove repetition or examples to hit the limit. The general "don't change facts" instruction is now scoped explicitly to facts that are _kept_ — it no longer implies every sentence must survive — and explicitly permits omitting less essential detail to meet a word limit.

**Verified:** `npx tsc --noEmit` clean; existing `__tests__/prompts.test.ts` (9 tests) and full suite (24 tests) pass unchanged. **Not yet re-verified live against Bedrock** — pending WJ's next over-limit AI assist test during A B Charitable Trust testing.

Logged as D-CW-02 in `docs/Test Plans/Clothworkers-Foundation-test-plan.md`.

---

## 2026-07-02 — Versioning strategy: proposed and implemented same day

Raised while reinstating the export footer's version number (see entry below) -- the footer has always shown a hardcoded literal `"v1"`, which has never actually changed and doesn't derive from anything real. `package.json`'s own `version` field is `0.1.0` and is not connected to the footer at all. Whatever the footer is meant to support (traceability for support and issue reporting, per `PDR-DH-003`), a string that has never once updated cannot deliver on that.

**Why a manually-bumped semantic version (the obvious default) is a poor fit here specifically:** this project has no formal release cadence -- it's continuously deployed, often more than a dozen times a day (today alone had well over 20 pushes to `master`). A manual version bump requires remembering to do it on every meaningful change, which is exactly the discipline that has evidently already failed once (`"v1"` frozen since the footer was first built). Even bumped diligently, a coarse `MAJOR.MINOR.PATCH` wouldn't have the resolution to distinguish two builds shipped hours apart, which is the realistic scenario for a support conversation about this project ("was this generated before or after this afternoon's fix?").

**Proposed instead: auto-derived from build metadata, zero manual maintenance.**

Vercel automatically injects Git commit metadata as build-time environment variables on every deployment (`VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_MESSAGE`, etc.) -- no configuration needed. A version string built from this at build time would be:

- **Precise:** a short commit SHA maps to exactly one code state, unambiguously -- exactly what's needed to diagnose "what was live when this document was generated"
- **Human-readable at a glance:** paired with the deploy date, gives an immediate "roughly when" answer without needing to look anything up
- **Zero maintenance:** nobody has to remember to bump anything, ever -- it changes automatically with every deployment, which matches how this project actually ships

Suggested format: `v2026.07.02 (a2ca520)` or similar -- exact display wording is a matter of taste, not something this proposal is trying to settle. Mechanically: read `VERCEL_GIT_COMMIT_SHA` (and its own commit date) at build time in `next.config.ts`, expose it via `NEXT_PUBLIC_APP_VERSION` (or similar) so it's available without a database round-trip, and have the export route read it the same way it currently reads the hardcoded literal.

**Approved and implemented the same day.** Format settled on `YYYY.MM.DD-<short SHA>` (e.g. `2026.07.02-a2ca520`), joined with a hyphen rather than the parenthesised form originally suggested -- simpler to read inline in a discreet footer.

- `next.config.ts` -- computes `appVersion` once at build time (`new Date()` for the build date, `process.env.VERCEL_GIT_COMMIT_SHA` for the commit), exposed everywhere via the `env` config key as `process.env.APP_VERSION`
- `lib/version.ts` (new) -- `getAppVersion()` helper, falls back to `"dev"` when `APP_VERSION` is unset
- `app/api/export/[applicationId]/route.ts` -- footer now interpolates `getAppVersion()` instead of the hardcoded `"v1"` literal, on both export formats
- `__tests__/version.test.ts` (new) -- covers the set/fallback cases

**Bug caught before it shipped, via a local production build (`npm run build`), not just type-check:** the initial implementation used `process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'`. Locally, `.env.local` (written by a past `vercel env pull`) sets this variable to an **empty string**, not absent -- nullish coalescing (`??`) only falls back on `null`/`undefined`, not `""`, so the version silently came out as `2026.07.02-` with no identifier at all. Fixed with an explicit truthiness check instead. Would not have affected the real Vercel deployment (which sets a genuine SHA), but would have produced a subtly broken version string on any local build -- worth knowing about if this pattern (`vercel env pull` + `VERCEL_*` vars + `??`) comes up again elsewhere in the codebase.

Not yet done: PDR-DH-003's `[version number]` placeholder wording was updated to show the new format as an example, but this hasn't been wired into Sentry release tracking (`withSentryConfig` already auto-detects a release identifier from the local Git repo independently -- confirmed via `_sentryRelease` in the build output -- so this is a nice-to-have alignment, not a gap).

---

## 2026-07-02 — Export footer: version number briefly removed, then reinstated; page numbering added (PDR-DH-003 revised)

Wac downloaded both export formats during live RT-10 testing and initially asked for the version number to be removed from the footer, plus page numbers added to the Word export ("Page N of NN" — not meaningful for plain text, which has no concept of pages).

This wasn't just a typo fix -- `PDR-DH-003` (Export Format and Structure) explicitly specified the version number, with a stated rationale ("provides traceability for support and issue reporting"). Implemented and recorded as a decision reversal in `PDR-DH-003`'s new Revision History section rather than silently overwriting the original decision. **Wac then recalled the version number was included deliberately for that reason and asked to reinstate it** -- reverted the same session, before it was ever deployed to a real user-facing state for long. Recorded as a further Revision History entry rather than pretending the excursion didn't happen.

**Net result** (`app/api/export/[applicationId]/route.ts`):

- Footer text: unchanged from the original -- _"Prepared using Grant Pathway v1 — grantpathway.org.uk"_ on both formats
- Word export only: added a second footer paragraph, "Page N of NN", using `docx`'s `PageNumber.CURRENT` / `PageNumber.TOTAL_PAGES` fields (dynamic Word fields, computed by Word itself at open/print time) -- this part of the change stuck
- Verified via a standalone test document using the same `docx` calls, checked with the skill's `validate.py` -- structurally valid OOXML. Could not render to PDF for a visual check (the sandboxed LibreOffice wrapper hits a Windows socket-API incompatibility, unrelated to this change) -- relying on the well-documented, standard nature of these field codes instead.

**Documentation:** `PDR-DH-003` Revision History now has an honest two-entry record (removed, then reinstated) rather than a single edit that erases what actually happened. `acceptance-criteria.md` (`AC-FR-37-03`) and `regression-test-plan.md` both reflect the final state (version number present, page number added).

Also found and fixed in passing: `technical-design.md`'s API Routes table had `/api/export/[id]` -- the route folder is actually `[applicationId]`, and the table didn't mention the route also serves `format=txt`, not just Word. The route's own doc comment already had the correct param name -- just an internal inconsistency within the same file.

**Raised in passing, not yet actioned:** the footer's version string has always been a hardcoded literal (`"v1"`), never derived from `package.json` (currently `0.1.0`) or any real build/deploy metadata -- it has never actually tracked anything. See the versioning-strategy proposal below.

---

## 2026-07-02 — RT-09 and RT-10 merged: approve + Word export is one user action, so it's one test

Following on from the footer discussion above, Wac raised that RT-09 (approval) and RT-10 (Word export verification) would be better merged, given approve+download became a single action on 2026-06-12 -- testing them as two separate cases had forced awkward "if RT-09 used Word... if RT-09 used plain text..." branching logic to stitch them back together, which was itself a sign the split no longer matched reality.

**Fixed:** RT-09 is now "Final Review, Approval, and Word Export" -- tick checkboxes, click **Download as Word document** (a fixed choice, not "record which"), verify the approval RPC and banner, verify the resulting Word document content, all as one continuous test. The freed **RT-10** slot is reused for plain-text export (previously **RT-10a**, added earlier the same day when the gap was first found -- plain-text export had never had its own test at all). Because RT-09 now always downloads Word first, RT-10 (plain text) deterministically triggers the re-export confirmation dialog (D-WF-04) every time -- no more conditional "if/if" logic needed in either test.

---

## 2026-07-02 — RT-09 corrected: still described the approval modal removed weeks ago

Found by Wac while running the live regression suite — he recalled a past decision to not have a separate approval modal at Step 5, and asked for it to be checked against the design docs before treating it as a defect. Confirmed: `CHANGELOG.md`'s own 2026-06-12 entry ("Step 5: approve + download collapsed into a single action") already documents that the separate "Approve my application" button and its confirmation modal were deliberately removed -- three checkbox ticks already demonstrate intent, so the modal was judged redundant friction. `screen-requirements.md` and `acceptance-criteria.md` (AC-FR-33-01 through 03) were correctly updated at the time. Only `regression-test-plan.md`'s RT-09 was never updated to match -- rewritten to describe the actual flow (tick three checkboxes -> a download button becomes enabled -> clicking it approves and downloads in one action, no modal).

---

## 2026-07-02 — RT-07 corrected: stale test step never matched the real design

Found by Wac while running the live regression suite. RT-07 step 4 asked the tester to verify a "50 AI request monthly limit" tip on the Step 4 preparation checklist screen. Checked both the actual component (`components/application-step4-prep-checklist.tsx`) and the authoritative requirement (`AC-FR-28-01`) -- neither has ever specified this. That screen only covers the financial-documents checklist and the note about involving a senior colleague before the budget questions; the only AI-usage-limit messaging anywhere near Step 4 is a conditional banner inside the Q&A interface itself, shown only when nearing the 40-50 request range -- a different screen entirely. Corrected RT-07 to check for the senior-colleague note instead, which is what the screen actually shows.

---

## 2026-07-02 — D-012 continued: Gmail's own link scanning was silently consuming verification links

Follow-up to the Resend API key fix below. Once email delivery started working again, verification links began showing "This link has expired" within minutes of being sent -- confirmed as a _second, distinct_ root cause from the SMTP issue.

**Investigation:** Checked `auth.users` timestamps across 5 accounts spanning a month (`created_at` back to 2026-06-09) and found every single one confirmed 15-80 seconds after the email was sent -- far too fast for a human, and consistent regardless of which browser was used to read the email (Comet, Chrome, and later re-tested in Edge). Ruled out browser-specific causes directly: registered a fresh account in Wac's non-Chrome default browser as a controlled experiment, and it auto-confirmed in 25.7 seconds -- _faster_ than the Chrome attempt. Ruled out Resend's own click-tracking (the "New tracking subdomain" screen Wac found was an unsaved setup wizard, not an active config). Checked Supabase's own Auth Logs directly: the verification token (`token=pkce_...&type=signup`) was hit twice at `/auth/v1/verify`, 5 seconds apart, minutes before Wac ever opened the email.

**Root cause:** all 5 sampled accounts were `+alias@gmail.com` addresses on the same underlying Gmail inbox. Gmail performs server-side link scanning on incoming HTML email as part of spam/phishing detection -- entirely independent of the recipient's browser or device -- and was visiting the single-use verification link within seconds of delivery, before the real person ever saw it. This is a widely-documented gotcha for exactly this style of single-use email link, unrelated to this app's implementation quality; it will affect any Gmail recipient, including quite possibly the charity contact using the service next week.

**Fix, in two stages (both in `app/auth/callback/route.ts`, `actions/auth.ts`, and new files `app/(public)/verify-email/confirm/page.tsx` + `components/confirm-email-form.tsx`):**

1. `/auth/callback` no longer completes verification (`verifyOtp` / `exchangeCodeForSession`) the instant its page loads -- that's exactly the kind of GET request an automated scanner performs. Password recovery (`type=recovery` or `next=reset`) is unchanged. Signup confirmation now redirects to a new `/verify-email/confirm` page, which required an explicit "Confirm my email address" button click before the token is spent -- scanners fetch pages, they don't click buttons.
2. **Wac tested this via Comet and found it asked the user to verify twice** -- once via the button in the email itself, then again via the new page's button. Confirmed by checking `auth.users` (30s send-to-confirm, consistent with a human clicking through both steps quickly) and by Wac describing exactly two clicks. Fixed by auto-submitting the confirm page's form the instant it mounts in a real browser (`formRef.current.requestSubmit()` in a mount-only `useEffect`) -- Gmail's scanner fetches the raw page over HTTP and does not execute JavaScript, so this stays safe, while a real person gets back a single-click experience.
3. **Further UX refinement, also from Wac:** since a real person isn't expected to interact with the confirm step at all, showing "Confirm your email address" + a clickable button was misleading even though nobody has to click it. Replaced with a passive "Confirming your email… This will only take a moment." spinner, no interactive element at all.

On success, `confirmEmail()` (the new Server Action) signs the session back out immediately, mirroring the existing `resetPassword()` pattern, so the "Email verified" screen's button always leads to a normal sign-in with credentials rather than an active session carried over from the link. `verify-email/page.tsx`'s verified-state copy and button updated to match ("Sign in" / `/`, not "Go to my dashboard" / `/dashboard`).

**Verified fixed** by re-registering fresh accounts and completing the full flow via Comet, Chrome, and Edge -- all three confirmed cleanly (14.5s-30s, single pass, no repeat prompts) with no code changes between browsers.

**Documentation corrected in the same pass** (deferred until the fix was confirmed working, per Wac): `screen-requirements.md` (new `/verify-email/confirm` intermediate-screen entry; State 2 copy/button updated) and `acceptance-criteria.md` (AC-FR-03-03 updated, new AC-FR-03-3a added for the scanner-safety behaviour) both also had their verification-link expiry documented as 24 hours -- corrected to the actual 1 hour while in these files for an unrelated but adjacent reason. `technical-design.md` updated: project structure tree, public routes list, page inventory, API routes table (`/auth/callback` added), and the `actions/auth.ts` Server Actions row (`confirmEmail` added). `regression-test-plan.md`'s D-012 Defect Log entry rewritten to cover both chained root causes.

Temporary D-012 experiment logging (`Sentry.captureMessage` + `console.log` in `route.ts` and `actions/auth.ts`, tagged `d-012-auth-callback`) removed now that the fix is confirmed and documented.

---

## 2026-07-02 — D-012: registration broken for every new account (email delivery)

Found live during the first run of RT-01a (the new account-registration regression test). Every attempt to register a new account on dev showed the generic "Something went wrong. Please try again in a moment." error.

**Root cause, confirmed by calling Supabase Auth's `/auth/v1/signup` endpoint directly** (bypassing the app, using the project's anon key): `{"code":500,"error_code":"unexpected_failure","msg":"Error sending confirmation email"}`. This is Supabase Auth failing to send the verification email via its configured SMTP relay (Resend) -- not an application bug in the traditional sense. Checked in passing: the Resend API key recorded in `AWS and Supabase keys.md` also failed authentication when queried directly against Resend's API (`"API key is invalid"`) -- may or may not be the same key configured in Supabase's SMTP settings, but consistent with a Resend-side credential or account problem. **Not yet fixed -- needs Wac to check the Resend account (suspension, domain verification, sending limits) and the SMTP API key configured in Supabase Dashboard -> Authentication -> Settings -> SMTP Settings, for both dev and prod projects.**

Confirmed no orphaned/partially-created `auth.users` rows result from the failure (checked directly against the dev database) -- Supabase rolls back the whole signup, so retries are safe once the email issue is resolved.

**Fixed in code, separately from the root cause:** `actions/auth.ts`'s `registerUser` caught the Supabase error and returned a generic `{ error: 'unknown' }` with **no logging at all** -- the real reason was completely invisible without manually reproducing the API call. Added `Sentry.captureException(error, { tags: { action: 'registerUser' } })` before the generic return, so future auth failures of any kind surface in Sentry instead of vanishing silently.

Logged as **D-012** in `regression-test-plan.md`'s Defect Log, severity Blocking -- this affects every prospective new user, including the real charity application planned for next week, so it needs resolving before then regardless of testing progress otherwise.

**Resolved same day.** The Resend API key configured as the SMTP password in Supabase Dashboard -> Authentication -> Emails -> SMTP Settings (dev project) was stale/invalid -- confirmed independently by querying Resend's API directly with the key on file (`"API key is invalid"`), and by Resend's own dashboard showing zero sent emails in the last 15 days. Domain verification was ruled out first (DKIM and SPF records both correctly in place). Wac generated a new Resend API key (`grant-pathway-supabase-smtp`, Sending-access scope) and updated the SMTP password field. Verified fixed by repeating the direct `/auth/v1/signup` call -- Supabase returned a full success response with `confirmation_sent_at` set. Prod's SMTP settings were not touched -- prod has no live consumer yet -- but should be checked before it does.

---

## 2026-07-02 — P5.6 DNS: Vercel side configured, GoDaddy record outstanding

A real charity contact wants to complete a live application next week under Wac's supervision. That doesn't require production to be publicly reachable (the session will be supervised, on Wac's device, dev or prod both fine) -- but it surfaced that `grantpathway.org.uk` was never actually connected, worth fixing anyway since it's needed eventually. Investigated and got as far as CLI access allows:

- `grantpathway.org.uk` and `www.grantpathway.org.uk` added and attached to the `grant-pathway` Vercel project (`vercel domains add`).
- Confirmed via `vercel domains inspect` that the domain is still sitting on GoDaddy's default parking IPs (nameservers `ns39/ns40.domaincontrol.com`) -- never pointed at Vercel.
- **Deliberately did not recommend migrating nameservers to Vercel.** The domain has live MX records (`smtp.secureserver.net`, `mailstore1.secureserver.net`) and an SPF record covering both `secureserver.net` and `amazonses.com` -- real email depends on this, including the `noreply@grantpathway.org.uk` mailbox. A full nameserver migration would silently break it unless every record were manually recreated at Vercel DNS.
- **Correct fix instead:** a single `A` record at GoDaddy, `grantpathway.org.uk -> 76.76.21.21` (and the same for `www`), leaving nameservers and all other records untouched. This requires GoDaddy registrar access, which Claude does not have -- flagged for Wac.
- Checked the second half of the "domain gap" -- the SSO/Vercel-Authentication wall currently blocking the raw `*.vercel.app` production URL. Queried the Vercel API directly (`vercel api`) and found `ssoProtection.deploymentType = "all_except_custom_domains"` -- it's already configured to exempt custom domains. No Vercel-side change needed; the domain will work as soon as the DNS record is added.

See `IMPLEMENTATION-STATUS.md` P5.6 for the outstanding action.

---

## 2026-07-02 — Legal docs corrected for the abandoned AI-generates-drafts model

**`docs/legal/terms-of-service.md`** → v1.2, **`docs/legal/privacy-policy.md`** → v1.4, **`docs/business-overview.md`**

Flagged while preparing yesterday's session plan (`docs/Test Plans/2026-07-02-session-plan.md`, Priority 1): both live legal documents — the actual files `/terms` and `/privacy` read at request time — still described AI as generating draft answers to application questions from scratch. This is the same stale claim corrected in `business-overview.md` on 2026-05-29 (BD-01) after the product model was abandoned 2026-05-28, but it was never caught in the legal docs. Higher stakes here since these are the documents users click through to accept.

**Fixed:**

- `terms-of-service.md` Section 5 (two paragraphs) reworded to state the actual model: the charity writes every answer; AI refines and improves on request only via "Help me improve this," and never generates an answer from nothing. Confirmed against the current code (`components/application-step4-draft.tsx`'s `handleRefine` → `/api/refine-answer`; the old `/api/generate-draft` route was deleted 2026-07-01). Version bumped 1.1 → 1.2.
- `privacy-policy.md` Sections 2, 3, and 5 (five locations) reworded the same way. Version bumped 1.3 → 1.4. Also fixed a pre-existing bug found in passing: the document's footer said "Version 1.2 / Last updated 17 June 2026" while its own header said "Version 1.3 / 29 June 2026" — the footer had not been kept in sync through the last two version bumps.
- `business-overview.md` "What Grant Pathway Does Not Do" section had one residual line — "The AI generates a draft. A human reviews it." — missed by the 2026-05-29 pass that fixed the rest of the file. Corrected to match.
- Wording was drafted and approved by Wac before editing (legal document — deliberate wording, not a mechanical find-replace, per the session plan). Both amended documents are being taken offline by Wac for a further re-review pass. This does not replace the still-outstanding solicitor review or the `[TO BE CONFIRMED]` effective dates (P5.1).

---

## 2026-07-01 — Schema drift check automated; test URL confirmed as dev; target-funder-list.md retired

**`.github/workflows/schema-drift-check.yml`** (new), **`docs/Test Plans/regression-test-plan.md`**

Follow-up to the test dashboard reset (previous entry). Two items closed:

- **RT-00 automated.** New scheduled GitHub Actions workflow runs daily (07:00 UTC) plus on-demand, checking both `grant-pathway-dev` and `grant-pathway-prod` for the same two things RT-00 checks by hand: all 5 required RPC functions present, and the migration count tracked remotely matches the local `supabase/migrations/` file count. Fails loudly (GitHub email notification) if either environment drifts again. Requires two repository secrets (`SUPABASE_DEV_DB_URL`, `SUPABASE_PROD_DB_URL`) to be added manually in GitHub — not yet configured as of this commit.
- **Confirmed: `grant-pathway-three.vercel.app` (the regression/funder test URL) points to `grant-pathway-dev`.** Nothing currently points to `grant-pathway-prod` — it has no live consumer yet, pending the P5.6 DNS/go-live cutover. Recorded in `regression-test-plan.md`'s Test Data table.
- `docs/Test Plans/target-funder-list.md` retired to `docs/Test Plans/archive/target-funder-list-v1.1.md` — it was never updated after the 2026-06-11 funder additions and had drifted to missing 8 of 20 live funders. `TEST-DASHBOARD.md`'s Active Funders table is now the single source of truth for the funder list. Live references in `data-model.md` and `DR-FD-001` redirected accordingly; also found `DR-FD-001` referenced a "v1.3" version of the retired file that was apparently planned but never actually created.

---

## 2026-07-01 — Test dashboard reset; regression plan hardened; live `is_active` data bug found

**`docs/Test Plans/TEST-DASHBOARD.md`** → v2.0 (old v1.39 archived to `docs/Test Plans/archive/`), **`docs/Test Plans/regression-test-plan.md`** → v1.1, plus 3 funder test plans

Direct consequence of today's dev/prod schema-gap finding (see earlier entries): every recorded funder test result predates the 2026-06-22 introduction of the AI-cap RPC and the 2026-06-29 introduction of the approve/reopen RPC — both of which were broken on hosted environments until today. This means none of the 7 funders previously marked 🟢 "fully tested" have actually been verified against the current codebase; the schema gap was invisible from inside the app the whole time.

**Fixed:**

- `regression-test-plan.md` v1.1: added RT-00 (environment/schema verification — checks all 5 RPC functions exist and `supabase migration list` shows no drift, before trusting any other result) and RT-11 (dashboard reopen — the only test covering `reopen_application`, previously untested by this plan). Annotated RT-05 and RT-09 with their RPC dependencies. Noted the plan has zero recorded executions since it was written 2026-06-15.
- `TEST-DASHBOARD.md` reset to v2.0: all 7 previously-🟢 funders downgraded to a new 🔁 "needs re-verification" status (not a claim anything is broken — an honest statement that the last verified-passing result predates a confirmed infrastructure gap). Old dashboard (39 revisions, 2026-06-02 to 06-17) preserved at `docs/Test Plans/archive/TEST-DASHBOARD-v1.39.md`.
- **New finding, not yet fixed:** a live database check found `Foyle Foundation`, `Nationwide Building Society`, `Motability Foundation`, and `City Bridge Foundation` — all four documented as closed/parked/removed since 2026-06-04 — still have `is_active = true` in the database, meaning they're currently selectable in the live funder picker. Per the dashboard's own Funder Readiness Standard, parked funders should be `is_active = false`. Logged as a Known Issue in the new dashboard for WJ to action; remediation SQL provided there.
- 3 active funder test plans (A B Charitable Trust, Clothworkers' Foundation, Idlewild Trust) still referenced the old "10+ characters" password rule; corrected to the current 12-character-plus-letters-and-digits rule.
- `target-funder-list.md` (v1.1, 2026-06-04) noted as stale — missing MK Community Foundation, Baily Thomas, and CPF Trust variants added to the dropdown 2026-06-11. Not yet updated; flagged for a future pass since `TEST-DASHBOARD.md`'s Active Funders table is the more current source of truth in the meantime.

---

## 2026-07-01 — `Grant-Pathway-Business-Overview.docx` regenerated from `business-overview.md`

**`docs/Grant-Pathway-Business-Overview.docx`**

Closes the loop on the finding that started today's whole audit chain. The Word export was Version 1.3 (22 May 2026) and still described Grant Pathway as generating first-draft answers from scratch — the model abandoned on 2026-05-28 after real funder guidance (Henry Smith Foundation, National Lottery Community Fund) showed AI-generated content disadvantages applications. `docs/business-overview.md` was correctly updated to the "AI assists, doesn't generate" model on 2026-05-29 and verified accurate against the live Step 4 code; the `.docx` was simply never regenerated to match.

Rebuilt from scratch via `docx-js` (hand-editing the original's ~1100-line Word XML was judged too error-prone given how much prose changed) — same cover-page structure and both brand logos (Grant Pathway teal, RapidGlobe navy) reused from the original file, content copied verbatim from the current `business-overview.md`, version bumped to 1.4 (1 July 2026). Verified via `zipfile.testzip()` (clean) and a full pandoc round-trip extraction compared line-by-line against the source `.md` — no content drift.

---

## 2026-07-01 — `/api/generate-draft` and `advanceToStep5` deleted; all doc/diagram references corrected

**`app/api/generate-draft/route.ts`** (deleted), **`actions/applications.ts`** (`advanceToStep5` deleted), **`docs/Technical Decision and Design/technical-design.md`** → v1.7, plus 6 ADR files, `docs/future-phases.md`, `docs/Implementation Plan/IMPLEMENTATION-PLAN.md`, and both `docs/diagrams/01-system-architecture.*`/`07-application-workflow.*`

Final cleanup from today's orphaned-code audit (see earlier entries — the audit that found the dev/prod schema gap started here).

**Code deleted, both confirmed to have zero callers anywhere in the codebase:**

- `app/api/generate-draft/route.ts` — the route that started this entire investigation. Fully implemented, actively maintained (kill-switch, fail-closed cap check, cap raised to 50), but never wired to any UI since the 2026-05-28 charity-authored redesign. `answer_source: 'ai_generated'` (the enum value only this route could set) is now permanently unused — noted in `saveAnswer`'s docstring rather than removed from the DB enum, since removing an enum value is a separate, riskier migration.
- `advanceToStep5()` in `actions/applications.ts` — the code's own comment already called it "legacy — superseded by `setDraftReadyToAssemble`." Deleted along with its section header.

Verified via `tsc --noEmit`, `eslint`, and the full Vitest suite (22/22) after both deletions — clean.

**Documentation swept for every current (non-archived) reference to `/api/generate-draft`:**

- `technical-design.md` — removed from §4 project tree, §9 API routes table, §13 rate-limiting table; `/api/refine-answer`'s config corrected from "Default timeout" to the actual `maxDuration = 60`. Also caught and backfilled two missing document-history rows (v1.5 MFA fix, v1.6 route-naming fix) that were never logged when those versions were bumped earlier today.
- `future-phases.md` (FP-10) — corrected the "three AI routes" streaming-scope list, which also incorrectly named a non-existent `/api/paraphrase` route (charity paraphrase is a step inside `actions/charity.ts`, not a route).
- `IMPLEMENTATION-PLAN.md` — two still-pending P5.3/P5.4 tasks (Sentry route tagging, Sentry performance alert) retargeted from `generate-draft` to `refine-answer` so future work doesn't get pointed at a deleted route.
- Six ADR files (`ADR-AI-006`, `ADR-AI-010`, `ADR-ARCH-003`, `ADR-OPS-001`, `ADR-OPS-005`, `ADR-SEC-005`) — illustrative route examples and tables corrected to `refine-answer`. Formal decisions in each ADR are unchanged; only stale example route names/durations were updated, with an editorial note added where an ADR's _reasoning_ (not just its example) referenced `generate-draft`'s specific behaviour (ADR-AI-010's JSON-streaming-complexity argument, which doesn't transfer to `refine-answer`'s simple text response).
- `acceptance-criteria.md`, `IMPLEMENTATION-PLAN.md`'s Slice 6 note, and `docs/Implementation Plan/ADR-TRACEABILITY.md` already correctly described the route as removed/historical — left untouched.

**Diagrams corrected and regenerated** (`.svg` source edited, `.png`/`.docx` regenerated with ImageMagick, verified via crop-and-inspect):

- `01-system-architecture.svg` — removed from the API Routes panel; five remaining routes reflowed to close the gap.
- `07-application-workflow.svg` — Step 4's description corrected from "AI draft generation per answer" to "Charity writes answer · optional 'Help me improve this' AI refine," matching the edge-case callout already added to this diagram earlier today.

---

## 2026-07-01 — Dev/prod schema gap closed: AI features and approve/reopen were broken on every hosted environment

**`supabase/migrations/20260701000000_item21_transactional_approve_reopen.sql`** (new), **`docs/migrations/item-21-transactional-integrity.sql`** (removed), **`docs/Implementation Plan/IMPLEMENTATION-PLAN.md`** → v3.1 — **RESOLVED, both dev and prod fully reconciled**

Follow-up to the orphaned-code audit (previous entry). A full dev-vs-prod schema diff, prompted by the confirmed-broken `approve_application`/`reopen_application` finding, turned up a much larger gap:

- **`reserve_ai_slot`, `update_ai_slot_token_count`, `cancel_ai_slot` (the AI cap-check RPCs) existed on neither `grant-pathway-dev` nor `grant-pathway-prod`.** Every AI route (`generate-summary`, `refine-answer`, and the charity paraphrase action) calls `reserve_ai_slot` as its first step — this means the AI features have been non-functional on every hosted environment (Vercel preview and production both connect to one of these two remote Supabase projects, not local Docker) since the `20260622000002_ai_cap_rpc.sql` migration was written and never actually applied outside local dev/CI.
- **`approve_application`/`reopen_application` existed on dev but not prod** — confirmed via direct SQL query against both projects. Step 5 "Approve" and the dashboard "Reopen" action were broken in production.
- **6 columns missing on prod only:** `applications.assembled_draft`, `applications.draft_status`, `application_answers.ai_refined_answer`, `.is_budget_question`, `.char_limit`, `.limit_type` — breaking draft assembly and character-limit funders in production.
- **`ai_request_type` enum missing `'charity_paraphrase'` on both projects.**

Root cause: schema changes since 2026-05-20 have been applied by pasting SQL directly into the Supabase dashboard SQL editor rather than via `supabase db push`, so the CLI's own migration tracking table only recorded the first 3 of 17 migrations as applied — on both dev and prod. `docs/migrations/item-21-transactional-integrity.sql` (never a tracked migration) even had a header comment reading "Run this in the Supabase SQL Editor for grant-pathway-prod" immediately followed by dev's project reference ID — almost certainly why that fix reached dev but not production.

**Fixed:**

1. All missing schema (columns, enum value, all 5 missing functions) applied directly to `grant-pathway-dev` and `grant-pathway-prod` via the SQL Editor, in dependency order (columns before functions that reference them). Verified via a full table/column/function fingerprint re-diff — dev and prod now match exactly.
2. `item-21-transactional-integrity.sql` relocated from `docs/migrations/` into `supabase/migrations/20260701000000_item21_transactional_approve_reopen.sql` as a proper tracked migration. Verified it applies cleanly via `supabase db reset --local` (the same check CI's `validate-migrations` job runs).
3. `20260622000003_rls_hardening.sql`'s `WITH CHECK` policies confirmed genuinely present on prod (queried `pg_policy` directly on `applications`, not assumed) before including it in the repair.
4. Both `grant-pathway-dev` and `grant-pathway-prod` migration tracking tables fully repaired via `supabase migration repair --status applied` for the same 15 versions (14 previously-untracked plus the new item-21 migration) — confirmed via `supabase migration list` on both projects showing all 18 local migrations matched against remote. WJ ran the prod repair himself from a real terminal (`supabase link --project-ref` needs an interactive DB-password prompt that can't go through an AI-issued command). `supabase db push` is trustworthy against both dev and prod again.

**Why this matters:** CI's `validate-migrations` job only proves the tracked migration files apply cleanly to an empty local database — it says nothing about whether the real, hosted dev/prod databases match what's in version control. This gap would only have been caught by testing against an actually-deployed URL, which hadn't happened yet this close to launch.

---

## 2026-07-01 — Orphaned-code audit finds broken prod approve/reopen; migration tracking reconciliation added to P5.4

**`docs/Implementation Plan/IMPLEMENTATION-PLAN.md`** → v2.9

Following the FR-07/MFA and diagram accuracy work earlier today, a scoped audit was run across every API route, Server Action, and Supabase RPC function to check for orphaned/unreachable code (the same failure shape as the `/mfa` and `generate-draft` findings, but for live code rather than docs). Findings:

- `app/api/generate-draft/route.ts` and `advanceToStep5()` in `actions/applications.ts` confirmed orphaned (zero callers anywhere) — pending deletion, not yet actioned.
- **`approve_application` and `reopen_application` — the two Postgres RPC functions backing Step 5 "Approve" and the dashboard "Reopen" action — exist on `grant-pathway-dev` but do not exist on `grant-pathway-prod`.** Confirmed via direct SQL query against both projects. These features are currently broken in production.
- Root cause: `supabase migration list --linked` shows only 3 of 17 local migrations recorded as applied in the CLI's tracking table, on both dev and prod — schema changes since 2026-05-20 have been applied by pasting SQL directly into the Supabase dashboard SQL editor rather than via `supabase db push`. This is why the item-21 transactional-integrity fix (2026-06-29) ended up at `docs/migrations/item-21-transactional-integrity.sql` instead of a tracked `supabase/migrations/` file — and why it silently never reached production.
- `IMPLEMENTATION-PLAN.md` P5.4's existing "Apply initial migrations to production… `supabase db push --db-url [prod-url]`" bullet would fail if run as written, since the CLI believes 14 migrations have never been applied. Replaced with a migration tracking reconciliation sequence (link to prod, full dev-vs-prod schema diff, file the item-21 migration properly, apply to prod, `supabase migration repair` on both projects).

**Status:** Full dev-vs-prod schema comparison in progress. WJ to attempt Phase 5 next week.

---

## 2026-07-01 — Diagram edge-case update + route-naming consistency fix

**`docs/diagrams/07-application-workflow.svg`**, **`docs/Technical Decision and Design/technical-design.md`** → v1.6, **`docs/Technical Decision and Design/ADR-ARCH-004-multi-step-flow-state.md`**

Follow-up from the diagram review that surfaced the FR-07/MFA regression (see entry below). Two further items closed:

1. **Application-workflow diagram edge cases.** `07-application-workflow.svg` was missing two edge-case states added to `screen-requirements.md` on 2026-06-30: the Step 2 guidelines-truncation warning banner (>20k extracted characters) and the `AI_ENABLED` kill-switch "AI unavailable" state (Step 3 summary and Step 4 AI-assist). Added as a dashed callout box alongside Step 3. **Known limitation:** no SVG rasteriser (rsvg-convert, ImageMagick, headless browser) is available in this environment — Chrome automation blocked both `file://` and `localhost` navigation pending user permission grant. `07-application-workflow.svg` (the source of truth) is updated; `07-application-workflow.png` and `.docx` are now stale and need manual re-export.
2. **Route-naming inconsistency.** `technical-design.md` §4 (project tree) and §7 (routes tables) referred to the application-detail routes as `/application/[id]/step/N` (singular), while the actual codebase, `screen-requirements.md`, and the information architecture all use `/applications/[id]/step/N` (plural) — already resolved in favour of plural per decision D1 in `IMPLEMENTATION-PLAN.md`. `technical-design.md`'s project tree also listed `applications/` and `application/` as two separate top-level directories; merged into one. Same stale singular form corrected in `ADR-ARCH-004-multi-step-flow-state.md` (9 occurrences) — the ADR's decision (URL-encoded step state) is unchanged, only the example route string.

---

## 2026-07-01 — `07-application-workflow.png`/`.docx` regenerated (ImageMagick installed)

**`docs/diagrams/07-application-workflow.svg`**, **`.png`**, **`.docx`**

Follow-up to the entry above, which flagged the diagram's `.png`/`.docx` exports as stale with no SVG rasteriser available. WJ installed ImageMagick (`choco install imagemagick -y`), which bundles librsvg. Regenerated `07-application-workflow.png` at `-density 200` (matches the original's 2083×3125px output exactly — ImageMagick/rsvg treats the SVG at 96 DPI base, so density 200 reproduces the same pixel dimensions as the original renderer's 150 DPI-at-72-base assumption). Also fixed a rendering defect surfaced by the switch to ImageMagick: the `&#9888;` (⚠) Unicode warning-sign entity used in two diagram callouts rendered as a missing-glyph box under the local font set, whereas the original renderer (browser-based) had emoji font coverage. Replaced both occurrences in `07-application-workflow.svg` with a small hand-drawn vector warning-triangle icon (`<path>` + rect + circle) so rendering no longer depends on font/emoji coverage — verified consistent across the diagram.

`07-application-workflow.docx` updated by swapping the embedded image bytes only (same filename, same relationship ID, identical pixel dimensions) — no XML content changed. Verified via independent zip-integrity check (`zipfile.testzip()` clean, all 20 expected parts present, embedded PNG size matches exactly) since LibreOffice is not installed in this environment for a full visual re-render.

---

## 2026-07-01 — FR-07 (MFA) documentation regression corrected

**`docs/Technical Decision and Design/technical-design.md`** → v1.5, **`docs/PRD inputs/acceptance-criteria.md`**, **`middleware.ts`**

While reviewing the diagrams in `docs/diagrams` against yesterday's technical-design.md v1.4 gap-analysis update, a documentation regression was found: the gap-analysis pass had resurrected a `/mfa` TOTP challenge route as if it were live — in the project tree, the protected-routes list, and the routes table. In reality, MFA was implemented on 2026-05-20 (S0.6), then removed on 2026-06-12 (`fix: remove orphaned MFA component and page files`) and already correctly demoted to Won't Have in `docs/moscow-feature-register.md` with a documented risk-analysis rationale (worst-case password compromise exposes only draft applications and publicly-registered charity data; no payment data or submission capability; mandatory MFA friction outweighs the marginal security gain for non-technical volunteer users). The regression traced back to a stale `/mfa` entry left in `middleware.ts`'s `PROTECTED` array after the removal, which the gap-analysis picked up without checking whether the page still existed.

Fixed: `middleware.ts` dead `/mfa` entry and comment removed; technical-design.md v1.5 strips all 3 phantom `/mfa` references; acceptance-criteria.md FR-07 explicitly marked `~~Should Have~~` **Won't Have**, criteria retained for historical reference only.

Confirmed with WJ: MFA stays out of v1 permanently for now; may be reconsidered post-launch if user demand or a security incident warrants it. No new decision record was created — `docs/moscow-feature-register.md` already carries the full rationale and is the canonical record of this decision.

---

## 2026-07-01 — CI fix: `validate-migrations` rate-limit failures

**`.github/workflows/ci.yml`**

- `supabase/setup-cli@v2` step now passes `github-token: ${{ secrets.GITHUB_TOKEN }}`.

Overnight and through 2026-06-30, `validate-migrations` failed intermittently across many unrelated pushes (docs-only commits, dependency bumps) with `Failed to resolve latest Supabase CLI release: rate limit exceeded`. The action resolves `version: latest` via the GitHub API; without a token this call is unauthenticated (60 req/hour) and was being exhausted by the volume of CI runs. Passing the built-in `GITHUB_TOKEN` raises the quota to 1000 req/hour per repo. No actual migration files were broken — this was a CI infrastructure issue only.

---

## 2026-06-30 — Technology stack review completed

**`docs/Technical Decision and Design/technology-stack-review-2026-06-30.md`** and `.pdf` added.

Full review of all 10 v1 stack components against current alternatives. Verdict: retain all components.
One new addition recommended: Axiom (structured log management) at P5.4 to close the AI route latency
observability gap (GAP-27). No architectural changes arising from the review.

---

## 2026-06-30 — Tier 2 docs updated — future-phases FP-10 added

**`docs/future-phases.md`** (last updated 2026-05-29 → 2026-06-30)

- FP-10 added: Streaming AI responses deferred post-v1 per ADR-AI-010. All three AI routes use batch mode for v1; streaming requires a UX design change (incremental text render) and is deferred until a Sentry performance baseline is established post-launch.

---

## 2026-06-30 — Tier 2 docs updated — non-functional-requirements, information-architecture-and-navigation

Two Tier 2 documents updated to reflect changes since they were last written. No code changes.

**`docs/non-functional-requirements.md`** (last updated 2026-06-04 → 2026-06-30)

- NFR-04 password requirement corrected: minimum 10 characters → minimum 12 characters, must contain both letters and digits. Reflects Supabase password policy hardened on 2026-06-29.

**`docs/information-architecture-and-navigation.md`** → v1.7 (last updated 2026-06-10 → 2026-06-30)

- Step 1 description updated: funder is now selected from the funder directory picker, not entered as free text (funder directory added 2026-06-01 via DR-FD-001).
- §9 Inactivity: inactivity warning banner row added (55-minute warning; user can dismiss to reset timer). Resolves GAP-22 documentation gap.

---

## 2026-06-30 — Remaining Tier 1 docs updated — data-model, screen-requirements, acceptance-criteria

Three Tier 1 documents updated to reflect changes since they were last written. No code changes.

**`docs/data-model.md`** → v1.3

- `ai_usage_log.request_type` enum updated: `charity_paraphrase` added as third value (migration 20260622000001, applied via SQL Editor).

**`docs/PRD inputs/screen-requirements.md`** (last updated 2026-06-10 → 2026-06-30)

- Screen 2 (Register): password validation updated — minimum 12 characters (was 10), must contain letters and digits (2026-06-29 Supabase prod policy hardening).
- Step 2 (Upload): two new extraction error states — PDF exceeds 200 pages; extraction timeout (30 seconds) (2026-06-22).
- Step 3 (AI Summary): truncation warning banner added — shown when `guidelinesTruncated: true` (2026-06-22). AI kill-switch unavailable state added (2026-06-29).
- Step 4 (Draft Answers): AI kill-switch unavailable state added for "Help me improve this" button (2026-06-29).

**`docs/PRD inputs/acceptance-criteria.md`** (last updated 2026-06-04 → 2026-06-30)

- FR-02 requirement text updated (10→12 chars; letters + digits); AC-FR-02-02 updated; AC-FR-02-02b added.
- AC-FR-23-04 added: 200-page PDF cap rejection.
- AC-FR-23-05 added: extraction timeout handling.
- AC-FR-24-06 added: truncation warning shown when guidelines pre-processed.
- AC-FR-27-03 added: AI kill-switch error state on Step 3.
- AC-FR-27-04 added: AI kill-switch error state on Step 4 AI assist.

---

## 2026-06-30 — technical-design.md updated to v1.4 — gap analysis applied

`docs/Technical Decision and Design/technical-design.md` updated from v1.3 to v1.4. No code changes — documentation brought into line with the current codebase following a gap analysis performed on 2026-06-29.

**Gaps closed:**

| Section              | What changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| §3 Technology Stack  | Vitest and GitHub Actions added to stack table; AI cap corrected from 20 to 50 req/user/month in operating costs table                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| §4 Project Structure | Full file tree rewrite: added `__tests__/`, `vitest.config.ts`, `instrumentation*.ts`, `sentry.*.config.ts`, `global-error.tsx`, `(authenticated)/error.tsx`, `robots.ts`, `sitemap.ts`, new lib files (`env.ts`, `database.types.ts`, `types.ts`, `application-guard.ts`, `file-validation.ts`, `preprocess-text.ts`, `rate-limit.ts`, `utils.ts`); corrected `next.config.js` → `next.config.ts`; added new public routes (`/terms`, `/privacy`, `/verify-email`) and authenticated routes (`/mfa`)                                                  |
| §5 Auth / Middleware | Updated to `updateSession()` pattern (replacing `createMiddlewareClient`); documented per-request CSP nonce generation; corrected redirect target from `/sign-in` to `/` (landing page)                                                                                                                                                                                                                                                                                                                                                                |
| §6 Database Schema   | Full rewrite to match `data-model.md` (Tier 1): `user_profiles` corrected (`first_name`/`last_name`/`feedback_consent` replacing `email`/`full_name`); `charity_profiles` replaced with thick profile summary (BD-02); `funders` table added; `applications` updated with `funder_id`, `last_exported_at`, `mismatch` status; `application_answers` updated with `char_limit`, `limit_type`, `question_type`, `is_approved` and corrected `answer_source` enum; `ai_usage_log` `request_type` values corrected; RLS table updated to include `funders` |
| §9 API Routes        | `/api/generate-draft` restored as active route; `/api/health` added; `applications.ts` action list updated to include `approveApplication` and `reopenApplication`                                                                                                                                                                                                                                                                                                                                                                                     |
| §11 AI Integration   | `AiSummaryData` type canonical location updated to `lib/types.ts`; type updated with `charLimit`, `limitType`, `eligibilityMismatch`, `mismatchReason`; notes added on XML-tag fencing, Zod `safeParse`, `AI_ENABLED` kill-switch, and atomic `reserve_ai_slot` advisory lock                                                                                                                                                                                                                                                                          |
| §13 Security         | CSP documented as per-request (middleware, nonce-based) rather than static (`next.config.ts`); CSP directives table corrected (no `unsafe-inline` on `script-src`); defence-in-depth table updated (RLS WITH CHECK, Zod env validation, IDOR check, fail-closed cap, CSP nonce, Resend preflight); secrets table updated (`RESEND_API_KEY`, `AI_ENABLED`, split `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`)                                                                                                                                               |
| §14 Operations       | Branch name corrected `main` → `master`; GitHub Actions CI documented as active with 4 jobs; `vercel.json` example updated to show all 3 cron jobs; Sentry instrumentation file pattern documented                                                                                                                                                                                                                                                                                                                                                     |

---

## 2026-06-29 — technology-stack.md updated to v1.3 — five missing services documented

**What changed:**

`docs/Technical Decision and Design/technology-stack.md` updated from v1.2 to v1.3. Five services that were already live in production but undocumented in the stack doc have been added:

| Section | Service added                 |
| ------- | ----------------------------- |
| TS-05   | Resend (transactional email)  |
| TS-06   | Sentry EU (error tracking)    |
| TS-07   | Upstash Redis (rate limiting) |
| TS-08   | GitHub Actions (CI pipeline)  |
| TS-09   | Vitest (test framework)       |

The "To Be Set Up Before Development Begins" table (TS-10) has been retired — all accounts are now active. Replaced with a "Registered and active" status table. Stack Summary updated from 11 to 16 rows.

File also moved from `docs/` root to `docs/Technical Decision and Design/` to keep the docs root tidy.

**Why:**
The stack doc was written in April 2026 and not updated as new services were added during development. A gap analysis in June 2026 identified five services running in production with no stack entry. An undocumented stack is a risk for onboarding, handover, and future sessions that check technology decisions.

---

## 2026-06-29 — POST-LAUNCH item 25 resolved: production password policy hardened (VQ-009)

**What changed:**

Supabase prod project (`stanwaejdvlvremtffkf`) Auth settings updated:

| Setting                                | Before | After                   |
| -------------------------------------- | ------ | ----------------------- |
| Minimum password length                | 6      | 12                      |
| Password requirements                  | None   | Letters and digits      |
| Prevent use of leaked passwords        | Off    | On (HaveIBeenPwned API) |
| Secure password change                 | Off    | On                      |
| Require current password when updating | Off    | On                      |

**Why:**
Alan Knox POST-LAUNCH item 25, VQ-009, §2.3 item 25. The previous defaults (6-char minimum, no complexity, no breach check) were too weak for a service holding charity application data. NCSC recommends 12+ characters. The HaveIBeenPwned check silently rejects known-compromised passwords with no friction for users who choose sensible ones.

---

## 2026-06-29 — POST-LAUNCH item 26 resolved: least-privilege key scoping (VQ-021)

**What changed:**

- **AWS:** New IAM user `grant-pathway-prod` created with custom policy `grant.pathway.bedrock.invoke` — single permission `bedrock:InvokeModel` scoped to `arn:aws:bedrock:eu-west-2::foundation-model/anthropic.claude-sonnet-4-6`. New access key applied to Vercel Production env vars. Old `grant-pathway-dev` user (had `AmazonBedrockFullAccess`) retained for dev environment only.
- **Resend:** New API key `grant-pathway-production-send` created with Sending access scoped to `grantpathway.org.uk`. Old Full access key deleted. Vercel `RESEND_API_KEY` updated to new scoped key.
- **Charity Commission:** Read-only by API design — no action required.

**Why:**
Alan Knox POST-LAUNCH item 26, VQ-021, §2.3 item 26. `AmazonBedrockFullAccess` granted every Bedrock operation including model management and training. Resend Full access allowed domain management, API key deletion, and log access. Both are now scoped to the minimum required: invoke one model, send from one domain.

---

## 2026-06-29 — POST-LAUNCH item 27 resolved: SPF/DKIM/DMARC confirmed for grantpathway.org.uk (VQ-022)

**What changed:**

- SPF TXT record updated to add `include:amazonses.com` (Resend sends via Amazon SES): `v=spf1 include:secureserver.net include:amazonses.com -all`
- DKIM confirmed: `resend._domainkey.grantpathway.org.uk` present and Verified in Resend dashboard
- DMARC confirmed: `v=DMARC1; p=quarantine` in place

**Why:**
Alan Knox POST-LAUNCH item 27, VQ-022, §2.3 item 27. Without SPF covering Resend's infrastructure, transactional emails (welcome, inactivity warning, account deletion) risk landing in spam or being rejected. Cross-client email rendering deferred to P5.4 pre-launch testing.

---

## 2026-06-29 — POST-LAUNCH item 28 resolved: master branch protection enabled (VQ-014)

**What changed:**

- GitHub Pro activated on the RapidGlobe personal account.
- Branch protection rule applied to `master` via GitHub API: all four CI jobs required to pass (`lint-and-typecheck`, `test`, `audit`, `validate-migrations`); `strict: true` (branch must be up to date with master before merge); force-pushes and deletions blocked.

**Why:**
Alan Knox POST-LAUNCH item 28, VQ-014, §2.3 item 28. Without branch protection, a push directly to master could trigger a Vercel production deploy before CI completes, or a failed CI could be ignored. Branch protection closes that gap — no merge (or direct push from a PR) reaches master unless all four checks pass.

---

## 2026-06-29 — POST-LAUNCH item 22 resolved: CSP nonce migration — script-src off 'unsafe-inline' (F-08-02, M5)

**What changed:**

- `middleware.ts` — generates a fresh `crypto.randomUUID()` nonce (base64-encoded) on every request; builds the `Content-Security-Policy` header with `'nonce-{nonce}'` on `script-src` (replaces `'unsafe-inline'`); passes nonce to `updateSession`.
- `lib/supabase/middleware.ts` — accepts optional `nonce`; forwards it as `x-nonce` request header in both `NextResponse.next()` calls (including the cookie-refresh path) so the page layout can read it.
- `next.config.ts` — static `Content-Security-Policy` header removed; all other security headers unchanged. CSP is now set per-request in middleware.
- `app/layout.tsx` — made async; calls `await headers()` to make the layout dynamic so Next.js renders it fresh per request and stamps the nonce on its own inline hydration scripts.

**Why:**
Alan Knox POST-LAUNCH item 22, F-08-02 (M5), §2.2 item 22. `'unsafe-inline'` on `script-src` allows any injected inline script to execute — removing it eliminates that XSS vector. A static nonce in `next.config.ts` would be trivially bypassable (same value every request); a per-request nonce is not. TypeScript clean (0 errors).

---

## 2026-06-29 — POST-LAUNCH item 21 resolved: transactional integrity for approve and reopen (F-06-05/06, M9)

**What changed:**

- `docs/migrations/item-21-transactional-integrity.sql` (new) — two Postgres functions: `approve_application` and `reopen_application`. Each performs both table updates (`applications` + `application_answers`) in a single transaction; raises `application_not_found` if the row is missing or not owned by the caller. `SECURITY INVOKER` — RLS applies.
- `actions/applications.ts` — `approveApplication` and `reopenApplication` now call `supabase.rpc()` instead of two separate update calls.
- `lib/database.types.ts` — typed signatures added for both new RPC functions.

**Why:**
Alan Knox POST-LAUNCH item 21, F-06-05/06 (M9), §2.2 item 21. The previous two-step pattern left a window where `applications.status` could be updated but `application_answers.is_approved` not (or vice versa), leaving the application in a permanently inconsistent state visible to the user. Wrapping both writes in one Postgres transaction eliminates the window. Scope limited to approve and reopen — `assembleAndAdvance` is serial with no cross-table race risk, and the deletion paths are handled by Supabase Auth cascade.

---

## 2026-06-29 — POST-LAUNCH item 20 resolved: AI kill-switch added (F-09-03, M15)

**What changed:**

- `app/api/generate-summary/route.ts`, `app/api/generate-draft/route.ts`, `app/api/refine-answer/route.ts` — kill-switch check added as step 0 of each POST handler: if `AI_ENABLED === 'false'`, returns HTTP 503 with `overloaded` error body immediately, before authentication.
- `actions/charity.ts` — `AI_ENABLED !== 'false'` added to the Bedrock paraphrase guard; skips paraphrase and degrades gracefully (empty `whatDoes`/`whoHelps`) when kill-switch is active. Charity Commission lookup is unaffected.
- `.env.example` — `AI_ENABLED=true` added with usage instructions.

**Why:**
Alan Knox POST-LAUNCH item 20, F-09-03 (M15), §2.2 item 20. Provides an immediate lever to disable all AI spend in a runaway-cost incident or Bedrock outage without a code deploy — change `AI_ENABLED=false` in Vercel env vars and redeploy. TypeScript clean (0 errors).

---

## 2026-06-29 — POST-LAUNCH item 19 resolved: SAR procedure documented (Article 15, manual process)

**What changed:**

- `docs/legal/sar-procedure.md` (new) — Internal procedure for handling UK GDPR Article 15
  subject access requests. Covers: receipt and acknowledgement (within 3 working days),
  identity verification, Supabase SQL queries to retrieve all personal data held per user,
  response email template with ZIP attachment, and a running log of requests handled.

**Why:**
Alan Knox POST-LAUNCH item 19, F-05-02 (M12), §2.2 item 19. UK GDPR Article 15 requires a
response to SARs within one calendar month. Decision: manual process is proportionate at
pre-launch scale. Privacy Policy Section 8 already directs users to wjokhia@rapidglobe.com —
no policy change required. Automated self-serve export endpoint deferred to a future phase
once live user volumes justify the build effort.

---

## 2026-06-29 — POST-LAUNCH item 18 resolved: generated Supabase types, createClient<Database>(), AiSummaryData to lib/types.ts

**What changed:**

- `lib/database.types.ts` (new) — Generated from remote Supabase project (`stanwaejdvlvremtffkf`) via `supabase gen types typescript`. Three SECURITY DEFINER RPC function types (`reserve_ai_slot`, `update_ai_slot_token_count`, `cancel_ai_slot`) added manually (CLI did not detect them). `charity_paraphrase` enum value added manually (was applied via SQL Editor, not captured by gen).
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts` — `createClient<Database>()` type parameter applied to all three Supabase client factories.
- `lib/types.ts` (new) — `AiSummaryData`, `AiSummaryQuestion`, `AiSummarySection` moved here from `app/api/generate-summary/route.ts`. Re-exported from route to preserve all existing import paths without changes.
- `actions/applications.ts` — Update payload re-typed from `Record<string, unknown>` to `{ current_step: number; draft_status?: string }` (typed client now rejects the loose record type).

**Why:**
Alan Knox POST-LAUNCH item 18, F-06-07 (M10), §2.2 item 18. Typed Supabase clients catch schema mismatches at compile time rather than runtime. Moving shared types to `lib/` removes the dependency on a route file for types used across components and actions. TypeScript clean (0 errors).

---

## 2026-06-22 — POST-LAUNCH items 1–10 resolved: error boundaries, env validation, Resend preflight, truncation UX, RLS hardening, Bedrock timeout, OG/robots/sitemap, extraction bounds, npm audit CI, Sentry instrumentation

**What changed:**

- `app/(authenticated)/error.tsx` (new) — React error boundary for authenticated routes; `Sentry.captureException` in `useEffect`; Try again + Go to dashboard actions.
- `app/global-error.tsx` (new) — Root-level error boundary with minimal `html/body` wrapper; `captureException` on mount.
- `lib/env.ts` (new) — Zod schema validates all eight required server env vars at import time. Process throws if any are missing/invalid.
- `instrumentation.ts` — imports `lib/env.ts` (env check runs before first request) and `sentry.server.config.ts`.
- `instrumentation-client.ts` (new) — Client-side Sentry init hook (Next.js 15 `instrumentation-client`); imports `sentry.client.config.ts`.
- `app/api/account/delete/route.ts` — Preflight check: returns HTTP 503 if `RESEND_API_KEY` is absent, before any data is deleted.
- `app/api/generate-summary/route.ts` — `guidelinesTruncated` flag added to JSON response (tracked from existing `preprocessText` call).
- `components/application-step3-summary.tsx` — Inline warning banner shown when `guidelinesTruncated: true`; advises user to paste most-relevant sections manually.
- `supabase/migrations/20260622000003_rls_hardening.sql` (new) — All RLS policies on five tables recreated: `auth.uid()` → `(select auth.uid())` (once per statement, not per row); `WITH CHECK` added to all four UPDATE policies.
- `app/api/generate-summary/route.ts`, `app/api/generate-draft/route.ts`, `app/api/refine-answer/route.ts` — All `messages.create` calls (including JSON retry branches) now pass `{ signal: AbortSignal.timeout(60_000) }` as the second argument.
- `app/layout.tsx` — `metadataBase: new URL('https://grantpathway.org.uk')`, `openGraph`, and `twitter` cards added to root metadata.
- `app/robots.ts` (new) — Disallows `/api/`, `/account/`, `/dashboard/`; references sitemap.
- `app/sitemap.ts` (new) — Five public routes: home, login, register, terms, privacy.
- `lib/extract-text.ts` — 30-second `Promise.race` extraction timeout (returns `extraction_timeout`); PDF page count capped at 200 pages (returns `extraction_failed` if exceeded).
- `.github/workflows/ci.yml` — `audit` job added: `npm audit --audit-level=high` on every push/PR.

**Why:**
Alan Knox POST-LAUNCH items §2.1 items 8–14, §2.4 item 32, §2.5 items 34 + 36. TypeScript clean (0 errors), 22/22 tests pass.

---

## 2026-06-22 — Five LAUNCH-BLOCKERs resolved: DB indexes, prompt injection, cap TOCTOU, Vitest, migration CI gate

**What changed:**

- `supabase/migrations/20260622000000_add_performance_indexes.sql` — four missing indexes added: `ai_usage_log(user_id, created_at)` (cap check), `applications(user_id, updated_at DESC)` (dashboard), `application_answers(user_id)` (RLS/upload), `applications(funder_id)` (funder FK).
- `supabase/migrations/20260622000001_add_charity_paraphrase_enum.sql` — adds `charity_paraphrase` to `ai_request_type` enum (apply via SQL Editor, not CLI — `ALTER TYPE ADD VALUE` cannot run in a transaction).
- `supabase/migrations/20260622000002_ai_cap_rpc.sql` — three SECURITY DEFINER functions: `reserve_ai_slot` (advisory lock + count + insert placeholder atomically), `update_ai_slot_token_count`, `cancel_ai_slot`. Closes the count-then-insert TOCTOU.
- `lib/prompts.ts` / `AI_SYSTEM_PROMPT` — added XML data-isolation directive. All four prompt builders now wrap untrusted user content in XML tags: `<funder_guidelines>`, `<question>`, `<original_answer>`, `<funder_summary>`, `<questions>`, `<charitable_objects>`.
- `app/api/generate-summary/route.ts`, `app/api/generate-draft/route.ts`, `app/api/refine-answer/route.ts` — replaced manual count + insert with `reserve_ai_slot` RPC; `cancel_ai_slot` called on Bedrock or parse error; `update_ai_slot_token_count` called on success. Added Zod safeParse for all AI JSON responses.
- `actions/charity.ts` — same RPC pattern applied; `paraphraseSchema` Zod validation added; XML fencing on `buildParaphrasePrompt`.
- `vitest.config.ts`, `package.json` — Vitest installed; `npm test` runs `vitest run`; 22 tests across 3 files (pure functions + IDOR guard + cap thresholds).
- `__tests__/prompts.test.ts`, `__tests__/ai-cap.test.ts`, `__tests__/upload-idor.test.ts` — first test suite.
- `.github/workflows/ci.yml` — `test` job (runs `npm test`) and `validate-migrations` job (Supabase CLI, `db start` + `db reset`) added.

**Why:**
Alan Knox initial assessment LAUNCH-BLOCKER items §2.1 item 5 (indexes), §2.1 item 7 (prompt injection), §2.2 item 16 (cap TOCTOU), §2.2 item 17 (test strategy), §2.4 item 30 (migration CI gate). All five resolved. TypeScript clean (0 errors), 22/22 tests pass.

---

## 2026-06-22 — Authenticate and meter charity paraphrase in `lookupCharity`

**What changed:**

- `actions/charity.ts` — `lookupCharity` now calls `getUser()` at the top and returns `{ ok: false, reason: 'unavailable' }` for unauthenticated callers. Before the Bedrock paraphrase call: monthly cap checked fail-closed (query error or cap exceeded → skip Bedrock, degrade gracefully to empty `whatDoes`/`whoHelps`); `aiRatelimit.limit()` burst check applied. After a successful paraphrase: `ai_usage_log` row inserted (`request_type: 'charity_paraphrase'`, `application_id: null`).

**Why:**
Independent system specialist review flagged: _"Authenticate and meter the charity paraphrase: add `getUser()` to `lookupCharity`, write `ai_usage_log`, and apply the cap/burst limit."_ The Bedrock paraphrase in `lookupCharity` was an unguarded AI call — no auth, no usage recording, no cap or rate-limit enforcement. A user could trigger it without a session, or exhaust cost by repeated lookups without it counting toward their monthly limit. Degradation is preserved: if cap/rate blocks the paraphrase, the Charity Commission name and registration number are still returned successfully. TypeScript clean (0 errors).

---

## 2026-06-22 — Consolidate `MONTHLY_CAP` and `MODEL` into `lib/prompts.ts`

**What changed:**

- `lib/prompts.ts` — `MONTHLY_CAP = 50` and `APPROACHING_LIMIT_THRESHOLD = 40` exported alongside `MODEL`; single source of truth for all AI constants.
- `app/api/generate-summary/route.ts`, `app/api/generate-draft/route.ts`, `app/api/refine-answer/route.ts` — local `MONTHLY_CAP` and `APPROACHING_LIMIT_THRESHOLD` declarations removed; constants now imported from `lib/prompts`.
- `actions/charity.ts` — duplicate `const MODEL = 'anthropic.claude-sonnet-4-6'` (line 16) removed; `MODEL` now imported from `@/lib/prompts`.

**Why:**
Independent system specialist review flagged: _"Reconcile `MONTHLY_CAP` (50 in summary/refine, 20 in draft) into one shared constant; import `MODEL` from `lib/prompts.ts` everywhere instead of the duplicate in `charity.ts:16`."_ The `generate-draft` cap had already been corrected to 50 in a prior session but remained a local copy. Consolidating into `lib/prompts.ts` ensures a single update point — no risk of routes drifting apart again. TypeScript clean (0 errors).

---

## 2026-06-22 — AI cap-count made fail-closed across all three AI routes

**What changed:**

- `app/api/generate-summary/route.ts` — destructures `error` from the `ai_usage_log` count query; returns 500 (`server_error`) immediately if the query fails, instead of defaulting `usageCount ?? 0` to 0.
- `app/api/generate-draft/route.ts` — same fix applied.
- `app/api/refine-answer/route.ts` — same fix applied.

**Why:**
Independent system specialist review flagged as a launch-blocker (F-01-01): _"Make the AI cap-count fail closed: inspect the count-query `error` and refuse the call on error instead of defaulting `usageCount ?? 0` to 0."_ If the count query fails and the result is treated as zero, the monthly cap is silently bypassed — a user (or attacker) triggering a DB error on the usage log could make unlimited AI calls, resulting in unbounded Bedrock cost. The fix refuses all three AI calls with HTTP 500 if the cap cannot be read. TypeScript clean (0 errors).

---

## 2026-06-22 — Cross-user file-read IDOR closed on upload/process; Sentry breadcrumb type fix

**What changed:**

- `app/api/upload/process/route.ts` — storage path prefix check added: before the service-role download, the route now verifies `path.startsWith(user.id + '_')` and returns 403 if not. Combined with the existing `applicationId` ownership check, this closes the cross-user file-read IDOR.
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — breadcrumb scrubbing corrected: `event.breadcrumbs` is `Breadcrumb[]` in this SDK version (not `{ values: Breadcrumb[] }`); accessing `.values` silently resolved to `Array.prototype.values` and the scrubbing was never executing. TypeScript now clean (0 errors).

**Why:**
Independent system specialist review flagged as a launch-blocker: _"Add the ownership check on the upload path: before the service-role download, reject any `path` not prefixed with the caller's id and verify `applicationId` ownership. Closes the cross-user file-read IDOR."_ The `applicationId` ownership check (BOLA fix, 2026-06-21) was already in place; the storage path prefix check is the new addition. The Sentry breadcrumb type error was discovered during the typecheck run for this fix.

---

## 2026-06-22 — Sentry `beforeSend` hardened; storage paths and charity content scrubbed

**What changed:**

- `sentry.client.config.ts` — `beforeSend` hook updated: strips `event.request.data` (request body), `Authorization`/`Cookie` headers, and sensitive breadcrumb data keys (`guidelinesText`, `answerText`, `answer_text`, `path`, `signedUrl`).
- `sentry.server.config.ts` — same hardening applied.
- `sentry.edge.config.ts` — same hardening applied.
- `docs/Alan Knox Audits/initial-assessment-report-findings.md` — fourth review item logged as Actioned.

**Why:**
Independent system specialist review flagged as a launch-blocker: _"Confirm whether the storage path and guideline/answer text reach Sentry; a leak escalates the upload IDOR to Critical."_ Audit confirmed `sendDefaultPii` is not set (defaults false), so request bodies are not auto-captured by Sentry. However, all three `beforeSend` hooks have been hardened defensively to strip: the full request body (which may contain `guidelinesText` or `answerText` from API calls); `Authorization` and `Cookie` request headers; and any breadcrumb data entries keyed by storage-path or charity-content field names. Storage path (user UUID + timestamp) is now blocked from reaching Sentry regardless of how it might appear in breadcrumbs. Launch-blocker closed; IDOR severity remains at its pre-existing level — not escalated.

---

## 2026-06-22 — Supabase Pro activated; backups confirmed; restore drill RTO 6 min

**What changed:**

- `docs/Technical Decision and Design/ADR-DATA-005-backup-strategy.md` — Production verification section added recording all confirmed checks, RTO (6 minutes), and RPO (≤24 hours).
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — P5.4 Supabase pause warning replaced with completion note; Notes entry added for 2026-06-22.
- `docs/Alan Knox Audits/initial-assessment-report-findings.md` — third review item logged as Actioned.

**Why:**
Independent system specialist review flagged as a launch-blocker: _"Confirm the project is London/UK on a tier with daily backups, and run the first restore drill to record an RTO and RPO."_ All items confirmed on 2026-06-22: Supabase Pro activated on `grant-pathway-prod`; region AWS | eu-west-2; compute MICRO; daily physical backups running at ~02:55 UTC with 7-day retention (8 backups visible). Restore drill completed via "Restore to new project" — elapsed time 6 minutes (RTO), RPO ≤24 hours. Test project deleted post-drill. Launch-blocker closed.

---

## 2026-06-22 — Sentry region confirmed EU; privacy policy accurate; P5.4 updated

**What changed:**

- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — P3.7 note updated: EU region confirmed 2026-06-22, production DSN empty noted as expected pre-launch, P5.4 flagged as the action point.
- `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — P5.4 Sentry step updated: region pre-confirmed as EU, explicit note to set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in Vercel Production at P5.4.
- `docs/Alan Knox Audits/initial-assessment-report-findings.md` — second review item logged as Actioned.

**Why:**
An independent system specialist review flagged as a launch-blocker: _"Confirm whether the Sentry org is EU or US, and correct the served privacy policy to match the code."_ Sentry Organisation Settings (org: `rapidglobe-ltd`) confirmed Data Storage Region as **European Union (EU)**. The privacy policy v1.2 statement is accurate — no correction needed. The production Vercel DSN is empty (Sentry not yet active in production), which is expected pre-launch and covered by P5.4. The launch-blocker is closed.

---

## 2026-06-22 — Bedrock zero-retention launch-blocker closed; AWS DPA confirmed

**What changed:**

- `docs/legal/AWS-navigating-gdpr-compliance.pdf` (new) — AWS whitepaper "Navigating GDPR Compliance on AWS" added to the legal folder as the authoritative reference for the AWS Data Processing Addendum.
- `docs/legal/AWS-DPA-reference.md` (new) — Reference summary confirming DPA status, confirmed checks, and links to related decision records.
- `docs/decisions/DR-DP-003-data-ownership.md` — Review note added (2026-06-22) recording the two production account checks completed and formally closing the launch-blocker.
- `docs/decisions/DR-DP-002-data-hosting.md` — Pre-launch actions updated: three of four marked complete with dates; EU Geo fallback live test remains outstanding.

**Why:**
An independent system specialist review identified as a launch-blocker: _"Confirm the production Bedrock account in eu-west-2 enforces zero retention and no training-data use."_ Two checks were completed against the live AWS production account on 2026-06-22:

1. **Model Invocation Logging** — confirmed disabled in the AWS Bedrock Console (eu-west-2 Settings). Prompts and responses are not captured to S3 or CloudWatch.
2. **AWS Data Processing Agreement** — confirmed automatically in force for the RapidGlobe AWS account. The AWS DPA is incorporated into the AWS Service Terms and applies to all customers without separate acceptance (verified against the AWS GDPR whitepaper, February 2021 Supplementary Addendum).

The launch-blocker is closed. One pre-launch action remains open: a live test call to confirm EU Geo fallback routing (`eu.anthropic.claude-sonnet-4-6`) before go-live.

> **Phase 0–4 entries** (up to 2026-05-22) have been moved to [CHANGELOG-ARCHIVE.md](CHANGELOG-ARCHIVE.md) to keep this file manageable. All entries are preserved in full.

---

## 2026-06-21 — Dependabot vulnerabilities resolved; edge middleware wired up; IDOR/BOLA fix

### 1. Dependabot vulnerabilities resolved (6 open alerts cleared)

**What changed:**

- `@sentry/nextjs` upgraded `10.56.0` → `10.59.0` — resolves `@opentelemetry/core` (2.7.1 → 2.8.0, unbounded memory allocation in W3C Baggage propagation, CVE moderate).
- `package.json` overrides extended: `hono >=4.12.25` (installed 4.12.26), `@babel/core >=7.29.6`, `js-yaml >=4.2.0` — all transitive dependencies with no patch available via direct-dependency upgrades.
- Stale `eslint-disable-next-line react-hooks/set-state-in-effect` comment removed from `components/application-step2-form.tsx` — the rule no longer fires after the `eslint-plugin-react-hooks` update; the suppression became a lint warning under `--max-warnings 0`.
- `npm audit` now reports **0 vulnerabilities**.

**Why:**

Six Dependabot alerts were open on the repository (1 high, 5 moderate). All were in transitive dependencies — `hono` (via `shadcn` → `@modelcontextprotocol/sdk`) and `@opentelemetry/core` (via `@sentry/nextjs`). The `hono` vulnerabilities (CORS wildcard reflection, Lambda@Edge header handling, serve-static path traversal, body limit bypass) affect applications using hono as their HTTP server; Grant Pathway uses Next.js as its server and hono is not active in production — risk was low but alerts needed clearing. The `@opentelemetry/core` issue (unbounded memory in W3C Baggage propagation) is relevant as Sentry uses OpenTelemetry for tracing.

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

- Vercel Pro upgrade approved — Hobby plan blockers (sub-daily cron rejected, 2-cron cap, unreliable webhook) caused significant testing overhead. Upgrade to Pro (~~£16/month) will be actioned as part of P5.4. Total fixed costs remain within C1 budget (~~£36/month of £100/month).

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
