# Dev / Production Configuration Parity Checklist

**Tier:** 2
**Volatility:** High
**Update when:** A setting is compared and recorded, or a new dashboard-only setting is introduced

**Created:** 15 August 2026 (`P5.4`, `GAP-105`)
**Purpose:** Find every setting that exists **only in a dashboard** — not in code, not in a migration — and confirm whether `grant-pathway-dev` and `grant-pathway-prod` agree.

---

## Why this exists

Dev has been shaped by hand since May 2026. Production was configured in a single sitting on 15 August 2026 from a checklist. **Anything adjusted in a dashboard along the way exists on dev and may not exist on prod**, and nothing in the repository would show the difference.

**This was not theoretical. It caught us three times in one day:**

| #   | What looked verified                          | What was actually true                                                      |
| --- | --------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Production environment variables set          | The live site was using the **dev database** (`GAP-103`)                    |
| 2   | Production SMTP proven by a real registration | That registration went to **dev** (`GAP-101`'s evidence)                    |
| 3   | Production email templates "already branded"  | Prod uses **Supabase's default templates**; the branded email came from dev |

Each time, dev's mature configuration made production look configured. **The pattern is the finding** — a check that cannot tell the two environments apart proves nothing.

---

## What is already known

**Verified matched — no action needed:**

| Area               | Evidence                                                       |
| ------------------ | -------------------------------------------------------------- |
| Database schema    | 32/32 migrations matched Local/Remote on both, 2026-08-15      |
| Schema drift alarm | `Schema Drift Check` green on **both** legs, run `31884422447` |
| Application code   | Same deployment serves both — nothing to diverge               |
| Region             | Both `AWS eu-west-2` (London)                                  |

**Configured on prod during `P5.4`, so known-good there:**
Redirect URLs (`GAP-100`) · custom SMTP (`GAP-101`) · Vercel Production env vars (`GAP-103`)

---

## ✅ RESULT — audit run 2026-08-15, programmatically

Run against the Supabase Management API (`GET /v1/projects/{ref}/config/auth`) using a temporary account token, comparing **all 242 auth-configuration keys** on both projects. This replaces the manual screenshot comparison the checklist below was written for, and **it can be re-run at any time** — which matters, because production configuration keeps changing through `P5.4` and `P5.6`.

**229 of 242 keys are identical. 13 differ.** Of those, **5 are real problems, 6 are the known template gap, and 2 are correct by design.**

### 🔴 Real divergence — production is missing dev's password hardening entirely → ✅ **APPLIED 2026-08-16**

> **All five were set on production by WJ on 2026-08-16**, screenshot-verified on `grant-pathway-prod` → Authentication → Sign In / Providers → Email. Production now matches dev on every row in the table below.
>
> ⚠️ **`GAP-104` stays 🔵 Partial, not ✅, and this document is the reason why.** The evidence is a dashboard screenshot — the settings are _configured_, and no behaviour has been observed under them. **That is the exact class of proof this checklist exists to distrust**: `GAP-103`, `GAP-101` and the template gap all looked verified on the same kind of evidence. **Two behavioural checks are deferred to `P5.5` (WJ's decision, 2026-08-16)** and written into `IMPLEMENTATION-PLAN.md` P5.5 §3 so the deferral survives the session — a registration with a breach-list password (the only test that distinguishes Supabase's check from `lib/validation.ts` doing the work), and a password change with an incorrect current password.
>
> **One consequence surfaces immediately: `GAP-106`.** With the leaked-password check on, all three password forms render a single message for every `weak_password` cause — _"must be at least 12 characters and include both letters and numbers"_ — which a breached password usually already satisfies. Latent on dev since 2026-06-29; live on production from 2026-08-16.

| Setting                                             | Dev              | Prod      |
| --------------------------------------------------- | ---------------- | --------- |
| `password_min_length`                               | **12**           | **6**     |
| `password_required_characters`                      | letters + digits | **none**  |
| `password_hibp_enabled` (leaked-password check)     | **true**         | **false** |
| `security_update_password_require_current_password` | **true**         | **false** |
| `security_update_password_require_reauthentication` | **true**         | **false** |

**This is `GAP-104`, and it is worse than first assessed.** The initial reading of production alone suggested weak settings. The comparison shows **dev has every one of them correct** — production is simply missing the hardening pass applied to dev on 2026-06-29 (`VQ-009`, the 6 → 12 change). It is not a difference of opinion between two environments; it is one environment that was hardened and one that never received it.

**Two consequences follow, and only one is mitigated:**

- The **12-character rule is not at risk** — `lib/validation.ts` enforces it in the application, so registration cannot accept a shorter password regardless of the Supabase floor.
- **`password_hibp_enabled` has no application-side equivalent.** It is a Supabase feature backed by HaveIBeenPwned. With it off, that element of the documented `FR-02` policy **is not in force on production at all**, and no amount of application code compensates.
- **`security_update_password_require_current_password`** resolves the assumption `P5.4` flagged: `actions/auth.ts`'s `changePassword` unconditionally sends `current_password`, and it has only ever been exercised against **dev, where the setting is ON**. Its behaviour on production, with the setting OFF, has never been observed.

**Recommended action: set production to match dev on all five.** Dev is right; no decision is needed beyond confirming that. — ✅ **Done 2026-08-16.** The table above records the values as they stood on 2026-08-15; the Prod column is now historical. See the note under this section's heading for what remains outstanding, which is verification rather than configuration.

### 🟠 Email templates — the known gap, now fully scoped → ✅ **COPIED 2026-08-16**

> **Dev's confirmation and recovery templates, subjects included, were copied verbatim into production by WJ on 2026-08-16.** The other four (invite, magic link, email change, reauthentication) were left stock on both, which is what the audit found and what `ADR-OPS-003`'s table should say.
>
> ⚠️ **Same standing as `GAP-104`: copied is not delivered.** No production email has been sent through the new templates. The check is a real registration against production, which lands in `P5.5` alongside the two password tests — one run covers all three.

Production runs Supabase's stock templates. **Exactly two are customised on dev**, and both differ:

| Key                                     | Dev                                   | Prod                         |
| --------------------------------------- | ------------------------------------- | ---------------------------- |
| `mailer_subjects_confirmation`          | "Verify your email — Grant Pathway"   | "Confirm your email address" |
| `mailer_templates_confirmation_content` | 2,201 chars (branded)                 | 184 chars (default)          |
| `mailer_subjects_recovery`              | "Reset your password — Grant Pathway" | "Reset your password"        |
| `mailer_templates_recovery_content`     | 2,229 chars (branded)                 | 254 chars (default)          |

**Useful finding: only confirmation and recovery were ever customised.** Invite, magic link, email-change and reauthentication are stock on **both** — so `ADR-OPS-003`'s template table, which lists three templates as requiring customisation, overstates what was actually done. Magic link is listed there and was never customised on either environment.

**Recommended action: copy dev's two templates and subjects into production verbatim.** They are the approved wording; nothing needs rewriting.

### ✅ Correct by design — no action

| Setting          | Why the difference is right                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `uri_allow_list` | Dev carries `http://localhost:3000/**` for local development; prod carries the three real hosts set by `GAP-100`. **They should differ.** |
| `smtp_pass`      | Different stored values. See the credential note directly below this table.                                                               |

#### Credential note — the `smtp_pass` values, and the rotation that was considered and declined

**Written 2026-08-16. The 2026-08-15 table above promised this note and it was never written** — recorded here rather than quietly filled in, because a dangling cross-reference in a parity document is the same failure mode the document exists to catch.

The audit printed both projects' `smtp_pass` values into the session transcript in full: **two 64-character hexadecimal strings**. They differ between dev and prod, which is why the row sits under "correct by design" rather than as a mismatch — a difference in stored credential is expected and is not drift.

**They are not usable Resend API keys.** Resend keys carry an `re_` prefix and are far shorter; a 64-character hex string is a transformed representation, not the plaintext credential. **Rotation was therefore considered and declined by WJ on 2026-08-16**, on the basis that no usable secret had been disclosed. Had it gone ahead, the key lives in **four** places and all four must move together or email fails silently: the Vercel `RESEND_API_KEY` variable (all scopes), the SMTP password on **both** Supabase projects, and `.env.local`.

⚠️ **The inference is sound but is an inference.** It rests on the format of a Resend key, not on a statement from Supabase, whose Management API documentation does not describe how `smtp_pass` is returned. If that assumption is ever shown to be wrong, the rotation above is the remedy and the four locations are the checklist.

### ✅ Verified identical — 229 keys, including everything else on this checklist

**Rate limits** (`rate_limit_email_sent` 30, `rate_limit_verify` 30, `rate_limit_token_refresh` 150, `rate_limit_anonymous_users` 30) — **section D closes with no action**; dev and prod match exactly, so `GAP-99`'s recorded figures apply to both.

**Sessions** (`sessions_inactivity_timeout` 0, `sessions_timebox` 0, `jwt_exp` 3600), **CAPTCHA** (off both), **all MFA settings**, **all security-notification toggles** (all off on both — so `C1`–`C4` is a genuine shared choice, not a divergence), **OTP settings** (3600s / 8 digits), `mailer_secure_email_change_enabled` (true both), `disable_signup` (false both), and **SMTP host, user, sender name and admin email** — all identical. **Sections C, D and E close with no action.**

> ⚠️ **Still not covered by this audit, because it is not part of auth config:** section **F** — the `guidelines-temp` Storage bucket settings and database extensions. **F1 remains the most likely quiet failure** and needs a separate check.

---

## The checklist

Record **both** values. A setting that matches is as worth recording as one that doesn't — otherwise the next session re-checks it.

### A. Auth → Sign In / Providers → Email

| #   | Setting                                    | Prod (known 2026-08-15)                  | Dev              | Match? |
| --- | ------------------------------------------ | ---------------------------------------- | ---------------- | ------ |
| A1  | Enable email provider                      | ON                                       |                  |        |
| A2  | Secure email change                        | ON                                       |                  |        |
| A3  | **Secure password change**                 | OFF → **ON** (2026-08-16)                | ON               | ✅ now |
| A4  | **Require current password when updating** | OFF → **ON** (2026-08-16)                | ON               | ✅ now |
| A5  | **Prevent use of leaked passwords**        | OFF → **ON** (2026-08-16)                | ON               | ✅ now |
| A6  | **Minimum password length**                | 6 → **12** (2026-08-16)                  | 12               | ✅ now |
| A7  | **Password requirements**                  | none → **letters + digits** (2026-08-16) | letters + digits | ✅ now |
| A8  | Email OTP expiration                       | 3600s                                    | 3600s            | ✅     |
| A9  | Email OTP length                           | 8                                        | 8                | ✅     |

⚠️ **A3–A7 are `GAP-104`, and all five were applied to production on 2026-08-16** — the Prod column records both the value found and the value set. The app enforces 12 characters itself (`lib/validation.ts`), so A6/A7 were never a live hole; **the leaked-password check (A5) is the one the application could not perform**, and that element of the documented `FR-02` policy was not in force on production until this change. **Configured is not verified** — see the note under the audit result above for the two checks deferred to `P5.5`.

⚠️ **A4 matters for a specific reason.** `actions/auth.ts`'s `changePassword` unconditionally sends `current_password`. `P5.4` already flagged that as an assumption rather than a verified fact. If dev has it ON and prod OFF, password change behaves differently in the two places — and every test to date ran against dev.

### B. Auth → Emails → Templates

**Known divergent — prod is on Supabase defaults.** Found 15 August by comparing two verification emails side by side.

| #   | Template             | Prod                          | Dev     | Match? |
| --- | -------------------- | ----------------------------- | ------- | ------ |
| B1  | Confirm signup       | default → **branded** (08-16) | branded | ✅ now |
| B2  | Invite user          | stock                         | stock   | ✅     |
| B3  | Magic link / OTP     | stock                         | stock   | ✅     |
| B4  | Change email address | stock                         | stock   | ✅     |
| B5  | Reset password       | default → **branded** (08-16) | branded | ✅ now |
| B6  | Reauthentication     | stock                         | stock   | ✅     |

**The fix was to copy dev's HTML into prod**, not to rewrite it — dev's templates are the approved ones and match the tone-and-voice guide. **Done 2026-08-16 for B1 and B5**, subjects included. B2, B3, B4 and B6 are stock on **both** environments and were deliberately left alone: matching stock is parity, and customising them here would create the divergence this document exists to remove.

### C. Auth → Emails → Security notifications

All **OFF** on prod. Includes _"Notify users when their password has changed"_ — a standard way a user discovers an account takeover.

| #   | Notification                    | Prod | Dev | Match? |
| --- | ------------------------------- | ---- | --- | ------ |
| C1  | Password changed                | OFF  |     |        |
| C2  | Email address changed           | OFF  |     |        |
| C3  | Sign-in method linked / removed | OFF  |     |        |
| C4  | MFA added / removed             | OFF  |     |        |

**Note these could not send at all before SMTP existed on prod.** They can now, so "off" becomes a real choice rather than a moot one.

### D. Auth → Rate Limits

Prod read 2026-08-15 (`GAP-99` closed). **Dev never read** — worth comparing, because every load-related behaviour observed in testing was observed against dev's limits.

| #   | Limit                 | Prod              | Dev | Match? |
| --- | --------------------- | ----------------- | --- | ------ |
| D1  | Sign-ups and sign-ins | 30 / 5 min per IP |     |        |
| D2  | Token verifications   | 30 / 5 min        |     |        |
| D3  | Token refreshes       | 150 / 5 min       |     |        |
| D4  | Emails sent           | 30 / hour         |     |        |
| D5  | IP address forwarding | OFF               |     |        |

### E. Auth → other screens

| #   | Setting                                                                                    | Prod | Dev | Match? |
| --- | ------------------------------------------------------------------------------------------ | ---- | --- | ------ |
| E1  | **Sessions** — timebox / inactivity settings                                               |      |     |        |
| E2  | **Attack Protection** — CAPTCHA enabled?                                                   |      |     |        |
| E3  | **Multi-Factor** — should be OFF both (MFA removed 2026-06-12, `FR-07` Won't Have)         |      |     |        |
| E4  | **URL Configuration** — prod fixed by `GAP-100`; confirm dev still has its localhost entry |      |     |        |

### F. Database and Storage

| #   | Setting                                                                                   | Why it matters                                                                                                                                                                                                                                                      | Prod                                                                       | Dev                                                               | Match? |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------ |
| F1  | **`guidelines-temp` bucket settings** — `allowed_mime_types`, `file_size_limit`, `public` | ⚠️ **The initial-schema migration inserts this bucket with `on conflict (id) do nothing`.** If the bucket already existed on prod with different settings, **the migration would have silently left them alone** — a schema match does not prove the bucket matches | private, 10 MB, `application/pdf` + OOXML `.docx`, **3** policies          | private, 10 MB, `application/pdf` + OOXML `.docx`, **3** policies | ✅     |
| F2  | Database extensions enabled (`pg_cron`, `pgcrypto`, …)                                    | Enabled via dashboard, not always via migration                                                                                                                                                                                                                     | `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, `uuid-ossp` | identical — same five                                             | ✅     |
| F3  | Compute size                                                                              | Known: dev NANO, prod MICRO — **expected to differ**, no action                                                                                                                                                                                                     | MICRO                                                                      | NANO                                                              | n/a    |

**Section F closes with no action — read from both dashboards 2026-08-16.**

**F1 was the one predicted to be quietly wrong, and it was not.** Both buckets carry exactly what `20260519000000_initial_schema.sql:247` inserts: private, 10485760 bytes, and the two MIME types `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document`. **The `on conflict (id) do nothing` risk was real and simply did not fire on either project** — no bucket pre-existed the migration, so nothing was silently skipped. **The policy count of 3 is correct, not merely equal:** `20260806000000_gap48_storage_rls_flat_prefix.sql:66` drops three policies and creates three, so three is the expected number on both. That means `GAP-48`'s storage results, recorded in `P5.2` as proving dev only, now rest on a bucket configuration **known** to be identical on production — they still need re-running there at `P5.5`, but the configuration underneath them is no longer an unknown.

**F2 is identical on both — five extensions each**, and `uuid-ossp` is the only one any migration creates ([initial_schema.sql:17](supabase/migrations/20260519000000_initial_schema.sql:17)); the other four are Supabase defaults. **Nothing was switched on by hand on either project**, which is the specific drift this row existed to find. Worth recording what is _absent_: **no `pg_cron` on either**, consistent with `ADR-OPS-004` scheduling jobs through Vercel Cron rather than in the database — a design decision now confirmed by observation rather than assumed from the ADR.

### G. Third-party services — shared or separate?

Worth confirming rather than assuming, because a shared instance means dev activity affects production.

| #   | Service       | Question                                                                                                                               | Answer                                                                                                                                                                                                                                                                                               |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | Sentry        | One project for both environments, or separate? Does the `environment` tag distinguish them?                                           | ⚠️ **Partly — and the tag does not distinguish what matters.** See `GAP-107` below.                                                                                                                                                                                                                  |
| G2  | Upstash Redis | Shared instance? If so, **rate-limit counters are shared between dev and prod** — the `grant-pathway:ai` prefix does not separate them | ❓ **Needs a Vercel read** — compare `UPSTASH_REDIS_REST_URL` across scopes                                                                                                                                                                                                                          |
| G3  | Resend        | Same API key and sending domain for both?                                                                                              | **Domain: same** (`grantpathway.org.uk`, one verified sending domain). **Keys: the two Supabase projects hold different `smtp_pass` values**, so at least two keys exist. Vercel's `RESEND_API_KEY` across scopes ❓ needs a read                                                                    |
| G4  | AWS Bedrock   | Same credentials and `eu-west-2` region for both?                                                                                      | ✅ **Separate credentials, same region — by design.** `VQ-021` (2026-06-29) created IAM user `grant-pathway-prod` scoped to `bedrock:InvokeModel` on one model ARN for Vercel Production; the older `grant-pathway-dev` user (`AmazonBedrockFullAccess`) was retained for dev only. Both `eu-west-2` |

**G1 — the answer is worse than a yes or a no, and it is raised as `GAP-107`.** All three Sentry runtime configs set `environment: process.env.NODE_ENV` (`sentry.client.config.ts:7`, `sentry.server.config.ts:7`, `sentry.edge.config.ts:7`). On Vercel, `NODE_ENV` is `production` for **preview deployments as well as production ones**, so the tag reads `production` for both and cannot separate them. It does separate local development, which reads `development` — so the row's question, read narrowly as "local versus deployed", is answered yes. **Read as the question `P5.4` is about to depend on — "can a Sentry alert rule filter to real production traffic?" — the answer is no.** `VERCEL_ENV` carries the distinction and is not used.

⚠️ **This lands immediately before `P5.4` step 13, which creates the new-issue alert rule and `GAP-03`'s P95 performance alert.** Both are meant to be scoped to production; on today's tagging, preview traffic would satisfy that scope. **Decide `GAP-107` before building those alerts**, not after.

**G2 and G3 are the two rows still open**, and both need a value read from a Vercel dashboard rather than anything in the repository. **G2 matters more than it looks:** a shared Upstash instance means the AI rate-limit counters are shared, because `lib/rate-limit.ts` uses the fixed prefixes `grant-pathway:ai` and `grant-pathway:resend` with no environment segment — local development would consume a real user's allowance and vice versa.

---

## How to record the result

1. Fill in the Dev and Match columns above.
2. **Every mismatch gets a decision, not an automatic fix** — dev is not automatically right. Templates are a clear case where dev's version should win; password settings may be a case where _neither_ is currently correct.
3. Record the outcome in `ADR-TRACEABILITY.md` under `GAP-105`, and raise separate gaps for anything needing its own work.
4. **Re-run this before go-live**, since production configuration will keep changing through `P5.4` and `P5.6`.
