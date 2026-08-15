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

### 🔴 Real divergence — production is missing dev's password hardening entirely

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

**Recommended action: set production to match dev on all five.** Dev is right; no decision is needed beyond confirming that.

### 🟠 Email templates — the known gap, now fully scoped

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
| `smtp_pass`      | Different stored values. See the credential note below.                                                                                   |

### ✅ Verified identical — 229 keys, including everything else on this checklist

**Rate limits** (`rate_limit_email_sent` 30, `rate_limit_verify` 30, `rate_limit_token_refresh` 150, `rate_limit_anonymous_users` 30) — **section D closes with no action**; dev and prod match exactly, so `GAP-99`'s recorded figures apply to both.

**Sessions** (`sessions_inactivity_timeout` 0, `sessions_timebox` 0, `jwt_exp` 3600), **CAPTCHA** (off both), **all MFA settings**, **all security-notification toggles** (all off on both — so `C1`–`C4` is a genuine shared choice, not a divergence), **OTP settings** (3600s / 8 digits), `mailer_secure_email_change_enabled` (true both), `disable_signup` (false both), and **SMTP host, user, sender name and admin email** — all identical. **Sections C, D and E close with no action.**

> ⚠️ **Still not covered by this audit, because it is not part of auth config:** section **F** — the `guidelines-temp` Storage bucket settings and database extensions. **F1 remains the most likely quiet failure** and needs a separate check.

---

## The checklist

Record **both** values. A setting that matches is as worth recording as one that doesn't — otherwise the next session re-checks it.

### A. Auth → Sign In / Providers → Email

| #   | Setting                                    | Prod (known 2026-08-15) | Dev | Match? |
| --- | ------------------------------------------ | ----------------------- | --- | ------ |
| A1  | Enable email provider                      | ON                      |     |        |
| A2  | Secure email change                        | ON                      |     |        |
| A3  | **Secure password change**                 | **OFF**                 |     |        |
| A4  | **Require current password when updating** | **OFF**                 |     |        |
| A5  | **Prevent use of leaked passwords**        | **OFF**                 |     |        |
| A6  | **Minimum password length**                | **6**                   |     |        |
| A7  | **Password requirements**                  | **none set**            |     |        |
| A8  | Email OTP expiration                       | 3600s                   |     |        |
| A9  | Email OTP length                           | 8                       |     |        |

⚠️ **A3–A7 are `GAP-104`.** The app enforces 12 characters itself (`lib/validation.ts`), so A6/A7 are not a live hole — but **the leaked-password check (A5) cannot be done by the application**, so that element of the documented `FR-02` policy is simply not in force on production.

⚠️ **A4 matters for a specific reason.** `actions/auth.ts`'s `changePassword` unconditionally sends `current_password`. `P5.4` already flagged that as an assumption rather than a verified fact. If dev has it ON and prod OFF, password change behaves differently in the two places — and every test to date ran against dev.

### B. Auth → Emails → Templates

**Known divergent — prod is on Supabase defaults.** Found 15 August by comparing two verification emails side by side.

| #   | Template             | Prod           | Dev     | Match? |
| --- | -------------------- | -------------- | ------- | ------ |
| B1  | Confirm signup       | ❌ **default** | branded | **NO** |
| B2  | Invite user          |                |         |        |
| B3  | Magic link / OTP     |                |         |        |
| B4  | Change email address |                |         |        |
| B5  | Reset password       |                |         |        |
| B6  | Reauthentication     |                |         |        |

**The fix is to copy dev's HTML into prod for each**, not to rewrite it. Dev's templates are the approved ones and match the tone-and-voice guide.

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

| #   | Setting                                                                                   | Why it matters                                                                                                                                                                                                                                                      | Prod  | Dev  | Match? |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---- | ------ |
| F1  | **`guidelines-temp` bucket settings** — `allowed_mime_types`, `file_size_limit`, `public` | ⚠️ **The initial-schema migration inserts this bucket with `on conflict (id) do nothing`.** If the bucket already existed on prod with different settings, **the migration would have silently left them alone** — a schema match does not prove the bucket matches |       |      |        |
| F2  | Database extensions enabled (`pg_cron`, `pgcrypto`, …)                                    | Enabled via dashboard, not always via migration                                                                                                                                                                                                                     |       |      |        |
| F3  | Compute size                                                                              | Known: dev NANO, prod MICRO — **expected to differ**, no action                                                                                                                                                                                                     | MICRO | NANO | n/a    |

⚠️ **F1 is the one most likely to be quietly wrong.** `GAP-48`'s storage policy tests passed **on dev**. If prod's bucket has different MIME restrictions, uploads could behave differently there — and the `P5.2` security review recorded that the storage results prove dev only.

### G. Third-party services — shared or separate?

Worth confirming rather than assuming, because a shared instance means dev activity affects production.

| #   | Service       | Question                                                                                                                               | Answer |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| G1  | Sentry        | One project for both environments, or separate? Does the `environment` tag distinguish them?                                           |        |
| G2  | Upstash Redis | Shared instance? If so, **rate-limit counters are shared between dev and prod** — the `grant-pathway:ai` prefix does not separate them |        |
| G3  | Resend        | Same API key and sending domain for both?                                                                                              |        |
| G4  | AWS Bedrock   | Same credentials and `eu-west-2` region for both?                                                                                      |        |

---

## How to record the result

1. Fill in the Dev and Match columns above.
2. **Every mismatch gets a decision, not an automatic fix** — dev is not automatically right. Templates are a clear case where dev's version should win; password settings may be a case where _neither_ is currently correct.
3. Record the outcome in `ADR-TRACEABILITY.md` under `GAP-105`, and raise separate gaps for anything needing its own work.
4. **Re-run this before go-live**, since production configuration will keep changing through `P5.4` and `P5.6`.
