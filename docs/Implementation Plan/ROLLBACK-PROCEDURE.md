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

## 7b. GitHub is down and you need to deploy

**Written 2026-08-17, during a real GitHub outage** — major outage, impact critical, from 13:40 UTC. API, Issues, Pull Requests and Actions were all down; Git Operations and Webhooks were degraded. **Vercel builds from GitHub, so for several hours there was no route to production.** Nothing needed shipping urgently, which was luck rather than design. `GAP-114`.

**First, check it is actually GitHub:** [githubstatus.com](https://www.githubstatus.com). Note which components are affected — "Git Operations degraded" and "API major outage" are very different situations. On 2026-08-17 `git push` kept working throughout while everything else was failing.

### Your code is not stranded

There is a **local mirror** of the whole repository, including every document:

```
C:/Dev/grant-pathway-backup.git
```

It is configured as a git remote named `backup`. Push to it at any time:

```
git push backup --all && git push backup --tags
```

To restore from it into a fresh working copy:

```
git clone C:/Dev/grant-pathway-backup.git grant-pathway-restored
```

✅ **Verified 2026-08-17 by actually doing it** — cloned to a scratch directory, 1055 commits, working tree complete. Not assumed to work.

⚠️ **Know what this mirror does and does not protect.** It is on the **same machine** as the working copy. It protects against GitHub being unavailable, a repository being deleted, or a bad force-push. **It does not protect against losing the machine** — that is what the off-machine mirror below is for.

### The off-machine mirror (GitLab)

**Added 2026-08-18**, completing the outstanding half of `GAP-114` mitigation (1). A second hosted copy of the repository lives at:

```
https://gitlab.com/rapidglobe-group/grant-pathway.git
```

It is configured as a git remote named `gitlab`. Push to it alongside `origin`:

```
git push gitlab --all
git push gitlab --tags
```

To restore from it into a fresh working copy:

```
git clone https://gitlab.com/rapidglobe-group/grant-pathway.git grant-pathway-restored
```

✅ **Verified 2026-08-18 by actually restoring from it, not by trusting the push output** — cloned from GitLab into a scratch directory, **1056 commits**, `HEAD` at the same commit as local `master`, and `AGENTS.md`, `actions/auth.ts`, `ADR-TRACEABILITY.md` and the published privacy policy all present.

⚠️ **This mirror is manual, not automatic.** Nothing pushes to it on a schedule or as part of the normal commit workflow, so **it is only as current as the last time somebody ran the two commands above.** Treat it as a periodic off-machine snapshot, not as a live second remote. Refreshing it takes seconds.

⚠️ **It carries local branches and tags only.** `--all` pushes what exists locally; remote-only branches on GitHub (Dependabot's, for example) are not mirrored. That is acceptable — they are recreatable — but it means GitLab is a copy of the work, not a byte-for-byte copy of GitHub.

⚠️ **GitLab is a source-control mirror and nothing else.** It is not wired to Vercel and does not deploy. If GitHub is down, this mirror protects the code and every document in it; **getting to production is still the `npx vercel --prod` route below.**

### Deploying without GitHub

Vercel's CLI deploys from a local directory and **does not involve GitHub at all**:

```
npx vercel --prod
```

✅ **Tried and proven 2026-08-18, deliberately while nothing was on fire.** WJ ran it end to end. **What actually happened, so the next person is not guessing:**

1. `npx vercel whoami` — offers to install `vercel@59.1.4` first (answer `y`); then reports `Logged in as rapidglobe`, active team `rapidglobes-projects`. **No login was needed** — the CLI was already authenticated.
2. `npx vercel` (preview, does not touch production) — **Ready in 1m**, printing an Inspect URL and a preview URL, then a hint: `To deploy to production (grantpathway.org.uk +1), run 'vercel --prod'`.
3. `npx vercel --prod` — **Ready in 43s**, printing the Inspect URL, a `Production` deployment URL, and an `Aliased` line for `https://grantpathway.org.uk`.
4. Verified by loading `https://grant-pathway-three.vercel.app/api/health` → `{"status":"ok","region":"lhr1"}`.

**No project-linking prompt appeared**, because `.vercel/project.json` already holds the real `projectId` and `orgId` — that file is gitignored, so **a deploy from a freshly restored clone would ask.** Expect one extra prompt in that case and pick the existing `grant-pathway` project rather than creating a new one.

**Production environment variables came through** — Vercel pulls them from the project, not from your machine, so no local `.env` is required for a CLI production deploy.

⚠️ **Two traps found in the process, both easy to misread as failures:**

- **Preview URLs are gated.** Deployment Protection is on for previews, so opening a preview URL anonymously redirects to a Vercel login. A preview deploy proves the **build**, not the **page**. Verify against production, or while signed in to Vercel.
- **`grantpathway.org.uk` does not serve the site**, despite the CLI's `Aliased` line and its `production (grantpathway.org.uk +1)` hint. The domain is assigned inside Vercel, but its DNS still points at **123 Reg's parking page** — visiting it shows "is parked free, courtesy of 123 Reg". **The `+1` is the `vercel.app` domain, which is where production actually lives.** The DNS cutover is `P5.6`'s work and is not a deployment problem. **Verify a CLI deploy against `https://grant-pathway-three.vercel.app`, not the org.uk domain.**

⚠️ **`vercel --prod` deploys your local working directory, not GitHub's `master`.** That is exactly why it works during a GitHub outage — and exactly why it will happily ship uncommitted local changes. **Check `git status` is clean before running it.**

### If you cannot deploy at all

**Say so, and wait.** For a free service with no SLA and no users mid-application, a few hours without the ability to deploy is an inconvenience, not an incident. The wrong response is improvising a deployment path under time pressure using a tool nobody has run before.

---

## 7c. What is backed up, how long recovery takes, and what we accept losing

**Written 2026-08-18, closing `GAP-114` mitigations (3) and (4).** The gap was never a missing backup — it was that **nobody had written down what the recovery position actually is.** This section is that position. It is deliberately short, and every unproven step is labelled.

### What holds durable data — and it is only two things

| Store                                                    | Backed up?                                                                                                                                                               | Restore path                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| **Supabase Postgres (production)**                       | ✅ Daily `PHYSICAL` snapshots, **7-day retention**, ~03:05 UTC. Pro plan, `eu-west-2` (London). Verified on the live project twice — 2026-06-22 and 2026-08-15           | Supabase → Database → Backups → Restore |
| **The git repository** — code and every project document | ✅ **Three copies**: GitHub (`origin`), a local bare mirror at `C:/Dev/grant-pathway-backup.git`, and GitLab off-machine. All three proven by restoring, not by trusting | §7b                                     |

**Everything else is transient by design or vendor-held on a rolling window**, and none of it needs backing up: Supabase Storage (`guidelines-temp`, uploads deleted after processing), Upstash counters (~1 hour), Axiom logs (30 days), Resend send records (up to 90 days), Sentry errors (up to 12 months).

### The recovery time, stated honestly

| Measure                         | Value                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Database restore — measured** | **6 minutes** (12:11–12:17, drill of 2026-06-22)                                                                                |
| **Data loss window (RPO)**      | **Up to 24 hours** — backups are daily, and point-in-time recovery was not purchased (~£100/month against a £150 total ceiling) |
| **Whole service, from nothing** | ⚠️ **Never measured.** No from-nothing rebuild has been attempted                                                               |

⚠️ **Do not quote the 6 minutes as time-to-service-restored.** That drill was a **"Restore to new project"**. An in-place restore of `grant-pathway-prod` — what a real incident would use — **has never been run**, and a new project would also need its connection details swapped into Vercel before the service worked again.

### What we accept losing

1. **Up to 24 hours of user data** after a database failure. Accepted: point-in-time recovery costs more than the entire monthly budget allows.
2. **Uploaded guideline files**, which Supabase's backups exclude by design (`ADR-DATA-005`). Accepted **because the bucket is transient** — files are deleted after processing, so there is nothing durable to lose. ⚠️ **This acceptance expires the moment anything is stored there permanently.**
3. **Technical logs, error reports and email records** older than each vendor's window. Accepted: diagnostic data, not user content.

### Credentials — the thing that would actually stop a rebuild

The ~15 production environment variables in Vercel (Supabase service-role key and database password, AWS Bedrock keys, Resend, Charity Commission, Upstash, Sentry, Axiom, `CRON_SECRET`) **have no second copy, and deliberately do not need one.**

✅ **Confirmed by WJ, 2026-08-18: he can log into all seven vendor accounts independently of this machine.** Every value can be reissued at source — and `CRON_SECRET` was invented here, so a new one can simply be made up and set in Vercel.

⚠️ **This makes vendor account access, not the secrets, the real single point of failure.** The recovery position depends on those logins surviving the loss of this machine. If the password manager holding them is only on this laptop, that is the exposure to fix — not the environment variables.

### Accepted risk statement — Option A (WJ's decision, 2026-08-18)

> **Grant Pathway is a free service with no SLA and, pre-launch, no users. A day without the ability to deploy, and up to 24 hours of data loss in a disaster, are accepted risks.** Source control and every project document exist in three places, and there is a proven route to production that does not involve GitHub. No further redundancy will be built before launch.

⚠️ **This statement expires at launch, and that is the point of writing it down.** Post-launch the same outage costs charities their work mid-application, and `DR-BM-002`'s succession assumption compounds it — the operating knowledge sits with one person.

**Trigger, so it does not quietly rot:** the **Phase 6 → Go-Live gate** must not be signed until this statement is either replaced with a measured recovery time or consciously re-accepted with reasons. Two things are needed to replace it: an **in-place** restore drill on production, and one **from-nothing rebuild** timed end to end. Neither has been done.

---

## 8. After any incident

- [ ] Write it up in `CHANGELOG.md` — what happened, what you did, how long it lasted (`ADR-OPS-004`)
- [ ] If a code defect caused it, raise a `GAP` in `ADR-TRACEABILITY.md` — **check `origin/master` first for the next free number**
- [ ] If the cause was configuration rather than code, ask whether any document asserts the opposite, and correct it
- [ ] If the failure was **invisible** until a user reported it, that is its own finding — the monitoring gap usually matters more than the original defect
