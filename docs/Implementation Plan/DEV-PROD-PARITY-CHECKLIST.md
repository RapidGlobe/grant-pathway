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
