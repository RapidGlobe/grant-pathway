# Rollback and Incident Procedure

**Tier:** 2
**Volatility:** Medium
**Update when:** The hosting platform, deployment method, or database migration process changes

**Created:** 15 August 2026 (`P5.4`, `GAP-28`)
**Source:** `ADR-OPS-001` (deployment), `ADR-OPS-002` (deployment strategy), `ADR-OPS-004` (incident recording), `ADR-DATA-004` (migrations), `ADR-DATA-005` (backups)

> **Written for a solo, non-developer operator under pressure.** It assumes you are reading it _during_ an incident, not before one. Each section starts with what to do, not why.

---

## 1. Is this actually an incident?

| Symptom                                 | Likely cause                            | Go to                              |
| --------------------------------------- | --------------------------------------- | ---------------------------------- |
| Site returns an error for everyone      | Bad deployment                          | **§2 — Roll back**                 |
| Site is completely unreachable          | Host, DNS, or Supabase outage           | **§4 — Check before rolling back** |
| One feature broken, rest fine           | Bad deployment                          | **§2**, but read §3 first          |
| Site up but read-only / failing to save | **Supabase spend cap** — quota exceeded | **§5**                             |
| Nobody can register or reset a password | Auth configuration, not code            | **§6**                             |

**Rolling back is cheap and fast (~60 seconds) and almost never makes things worse.** If you are unsure, roll back first and diagnose afterwards. The exception is §5 — a rollback does nothing for a quota problem.

---

## 2. Roll back a bad deployment

1. **Vercel → your project → Deployments**
2. Find the last deployment that was working — the list shows the commit message and time
3. Click its **⋯** menu → **Promote to Production** (or **Redeploy**)
4. Wait ~60 seconds and reload the site

That is the whole procedure. It does not touch the database, and it does not require a git commit.

**Then, before doing anything else:** write down what happened, in `CHANGELOG.md`. What broke, what you saw, which deployment you rolled back to, and the time. `ADR-OPS-004` requires this and it is the step most likely to be skipped.

### ⚠️ The one case where rollback is not enough

**If the bad deployment included a database migration, rolling back the code does not roll back the database.** The old code will then be running against a newer schema, which may fail in different and more confusing ways.

Migrations in this project are almost always additive (new tables, new columns), so old code usually tolerates them. But if you rolled back _because_ of a migration, stop and treat it as a data incident — see §7.

---

## 3. Before you redeploy the fix

1. Confirm the root-cause fix is actually in the branch — not just written locally
2. Run `npm run type-check`, `npm run lint`, `npm test` and `npm run build` **locally, all four**
3. Only then push

**Deploy to production during business hours (09:00–17:00, Monday–Friday)** unless you are responding to a live incident. A deployment made at 22:00 is one nobody is awake to notice failing.

---

## 4. Check before rolling back — is it even us?

If the site is completely unreachable, a rollback may be pointless. Check in this order, it takes two minutes:

| Check           | Where                       | What it tells you                                                                                                                                          |
| --------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UptimeRobot     | your dashboard              | When it started, and whether it is still failing                                                                                                           |
| `/api/health`   | `https://<site>/api/health` | `{"status":"ok"}` means app **and** database are fine — the problem is elsewhere (DNS, certificate). A **503** means the app is up but the database is not |
| Vercel status   | vercel-status.com           | Platform outage — nothing you can do but wait                                                                                                              |
| Supabase status | status.supabase.com         | Same                                                                                                                                                       |

**If `/api/health` returns 200, do not roll back.** The application is healthy and you would be changing something that is not broken.

---

## 5. Site is up but read-only or failing to save

**Most likely the Supabase spend cap.** It is deliberately enabled (`ADR-DATA-005`), and **Supabase sends no warning before it bites** — the first symptom is the service failing.

1. **Supabase → Organisation → Usage** — look for an item at or over its included quota
2. If a quota is exceeded, the choice is: wait for the next billing cycle, or **temporarily disable the spend cap** (Billing → Cost Control) and accept the overage charge

**A code rollback will not help here.** Nothing is wrong with the deployment.

---

## 6. Nobody can register, verify or reset a password

This is configuration, not code, and a rollback will not fix it. Three things have caused it before — check in this order:

1. **Supabase → Authentication → URL Configuration.** Are the redirect URLs still correct, and do they cover the domain people are actually using? (`GAP-100` — production once pointed at a domain owned by someone else entirely.)
2. **Supabase → Authentication → Emails → SMTP Settings.** Is custom SMTP still enabled and pointed at Resend? (`GAP-101` — production was on Supabase's rate-limited built-in mailer.)
3. **Resend → Domains.** Is `grantpathway.org.uk` still verified, and are messages actually being delivered? Check Resend's own delivery log.

⚠️ **Password-reset failures are silent by design.** `requestPasswordReset` never reveals whether an address is registered (`AC-FR-05-02`), so a failure reaches neither the user nor Sentry. **Resend's log is the only place it shows.**

---

## 7. Data incident — wrong or lost data in production

**Stop. Do not attempt a fix in the Supabase SQL editor.** `ADR-DATA-004` prohibits it, and doing it under pressure is how the July 2026 migration drift happened.

1. **Establish when the data was last correct.** You need a time, not a guess.
2. **Supabase → Database → Backups.** Daily snapshots, ~03:05 UTC, **7 days retained**.
3. ⚠️ **Restoring replaces the entire database, including everything good that happened since that snapshot.** For anything short of catastrophic loss, this is usually the wrong tool.
4. ⚠️ **Backups do not include Storage objects** — only database rows. In practice nothing durable lives in Storage, but do not assume a restore brings files back.

For anything ambiguous, take a fresh manual backup **before** you change anything, so the current state is recoverable even if your fix makes it worse.

---

## 8. After any incident

- [ ] Write it up in `CHANGELOG.md` — what happened, what you did, how long it lasted (`ADR-OPS-004`)
- [ ] If a code defect caused it, raise a `GAP` in `ADR-TRACEABILITY.md` — **check `origin/master` first for the next free number**
- [ ] If the cause was configuration rather than code, ask whether any document asserts the opposite, and correct it
- [ ] If the failure was **invisible** until a user reported it, that is its own finding — the monitoring gap usually matters more than the original defect
