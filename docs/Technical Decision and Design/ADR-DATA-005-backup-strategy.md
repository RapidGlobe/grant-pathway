---
id: ADR-DATA-005
category: Data
status: Decided
---

# ADR-DATA-005 — Database Backup Strategy

## Context

Grant Pathway stores charity profiles and application history that represents significant effort by charity workers. With no automated backup in place (Supabase free tier), three categories of incident are unrecoverable:

1. **Bug or migration error** corrupting production data for multiple users simultaneously
2. **Compromised admin credentials** leading to deletion of large amounts of data
3. **Hosting or provider incident** that wipes the database entirely

None of these breach Grant Pathway's contractual obligations — no data-persistence guarantee is made in the Terms of Service. However, any such event affecting multiple charities simultaneously poses a material reputational risk, particularly in a sector where word-of-mouth and trust are critical to adoption.

ADR-STACK-002 explicitly noted that "the free tier covers development and early launch phases; paid tier scales predictably." The decision to enable automated backups is the natural realisation of that planned upgrade.

---

## Options Considered

### Option A — No backups (status quo, Supabase free tier)

All three risk scenarios are irrecoverable. Acceptable during development and early build; not acceptable in production with real charity data.

### Option B — Supabase Pro plan (~$25/month, ~£20/month)

Daily automated backups with 7-day retention. Managed entirely by Supabase. Restoration via the Supabase dashboard (no command line required for standard recovery). Backups stored in the same region as the project (London, eu-west-2), consistent with DR-DP-002 data residency requirements.

### Option C — Supabase Pro + Point-in-Time Recovery add-on (~$125/month, ~£100/month)

Continuous WAL streaming enabling restoration to any specific minute within a 7-day window. Best precision for migration error recovery (restore to exactly before the bad operation). At ~£100/month, this is incompatible with the C1 operating budget (£100/month total) at v1 scale — it would leave no headroom for Amazon Bedrock API costs.

### Option D — Custom scheduled pg_dump to AWS S3 (eu-west-2)

A scheduled job (Vercel Cron or GitHub Actions) exports the database to S3 on a custom schedule. Works on any Supabase plan tier. Gives full ownership of backup files and configurable retention period (e.g. 30, 60, or 90 days). Requires implementation effort, an additional AWS S3 service dependency (with associated GDPR disclosure), and a manual command-line restore process. Better suited as a future supplement to Option B for longer-term archival than as a standalone replacement.

### Option E — Logical replication / warm standby

A real-time secondary Supabase project receiving replication from the primary, promotable in a failover scenario. Near-zero data loss and near-instant recovery. Disproportionate in cost and complexity for a service with ~10–100 concurrent users. Not available natively through Supabase without significant custom infrastructure.

---

## Decision

**Option B — Supabase Pro plan.**

The Supabase Pro plan will be activated on the production project before go-live. Daily automated backups with 7-day retention are included as part of the Pro tier. Backups are stored by Supabase in the London region (eu-west-2), consistent with the data residency requirements established in ADR-STACK-002 and DR-DP-002.

**This is a billing plan change in the Supabase dashboard — it requires no implementation work.**

**The backup is an operational disaster-recovery safeguard, not a user-facing service feature.** Grant Pathway does not promise to restore user data from backups on request. No self-service restore capability is exposed to users. Backups exist solely to enable recovery from catastrophic infrastructure failures, operator error, or security incidents.

---

## Rationale

- The upgrade from free to Pro tier was always anticipated. ADR-STACK-002 explicitly states: _"Free tier covers the development and early launch phases; paid tier scales predictably."_ Backups are an included benefit of that upgrade, not an additional cost line.
- At ~£20/month, the cost sits comfortably within the C1 operating budget. Total committed monthly costs rise from ~£16/month (Vercel Pro only) to ~£36/month — leaving ~£64/month for Amazon Bedrock API usage.
- Daily backups with 7-day retention address all three risk scenarios provided the incident is detected within the retention window. For an active user base with regular logins this is a realistic assumption.
- Zero implementation effort removes the need for a new development task in the implementation plan.
- PITR (Option C) is the technically superior option and is the recommended upgrade path once the user base and/or a revenue model justifies the £100/month cost.
- Custom pg_dump exports (Option D) may be added as a long-term archive supplement in a future phase — for example, weekly exports to S3 retained for 90 days to cover slow-burn incidents outside the 7-day window. This is not a v1 requirement.

---

## GDPR Disclosure Requirement

Supabase Pro's automated daily backups introduce a distinction between logical deletion (immediate) and physical purging from all backup media (up to 7 days):

- When a user deletes their account, all data is immediately and permanently removed from the live production database (cascade delete order: `application_answers` → `applications` → `charity_profiles` → `ai_usage_log` → `user_profiles` → Supabase Auth user record — per ADR-DATA-003).
- Supabase's automated backup copies will retain a snapshot of this data until those backup files age out of the 7-day retention cycle.

This distinction is a GDPR-relevant disclosure under the Right to Erasure (Article 17 UK GDPR). The privacy policy must be updated to accurately reflect that:

- Deletion is immediate from live systems
- Automated backup copies are permanently removed within 7 days as part of standard backup rotation

---

## Consequences

- Supabase Pro plan must be activated on the production project before go-live. Add to P5.4 pre-launch checklist in IMPLEMENTATION-PLAN.md (and the pre-launch checklist in ADR-OPS-002). ✅ **Activated 2026-06-22.**
- Privacy policy Section 7 must be updated to disclose the 7-day backup retention window that applies after user-requested account deletion. ✅ Done 2026-05-26.
- Operating cost table in `technical-design.md` §3 must be updated: Supabase line changes from "Free tier (initially)" to "Pro (~£20/month)"; total fixed costs change from ~£16/month to ~£36/month. ✅ Done 2026-05-26.
- Business overview "Data, Privacy, and Trust" section updated to reflect operational resilience measures. ✅ Done 2026-05-26.
- Future consideration: at scale, revisit PITR (Option C) or supplement with custom pg_dump exports (Option D) for longer retention.

## Production verification — 2026-06-22

Completed as part of independent system specialist pre-launch review:

| Check                    | Result                                                                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase Pro activated   | ✅ Confirmed — Billing shows Pro Plan active                                                                                                                                                    |
| Project region           | ✅ AWS \| eu-west-2 (London) — confirmed in Supabase Projects dashboard                                                                                                                         |
| Compute tier             | ✅ MICRO — automatically upgraded with Pro                                                                                                                                                      |
| Scheduled backups active | ✅ 8 daily backups visible (15–22 Jun 2026), running at ~02:55 UTC                                                                                                                              |
| Backup retention         | ✅ 7 days confirmed                                                                                                                                                                             |
| Backup type              | ✅ PHYSICAL                                                                                                                                                                                     |
| Storage objects included | ⚠️ Not included — Storage API objects excluded from backup. Acceptable: `guidelines-temp` bucket holds temporary files only, cleared after Step 3 (GAP-10). No persistent user data in Storage. |
| Restore drill completed  | ✅ "Restore to new project" executed 2026-06-22 using 22 Jun backup                                                                                                                             |
| **RTO (actual)**         | **6 minutes** (restore started 12:11, completed 12:17)                                                                                                                                          |
| **RPO**                  | **≤ 24 hours** (daily backup at ~02:55 UTC)                                                                                                                                                     |
| Test project deleted     | ✅ Confirmed post-drill                                                                                                                                                                         |

---

## Production verification — 2026-08-15 (P5.4)

Re-verified on `grant-pathway-prod` directly, during `P5.4`'s Supabase walkthrough. Three findings, one of which is a decision this ADR did not previously record.

**1. Daily backups confirmed working.** Eight snapshots visible — 08 to 15 August 2026 inclusive — taken consistently around 03:05 UTC, type `PHYSICAL`, each with a Restore action. That spans the seven days this ADR specifies and the Privacy Policy discloses. **No discrepancy.**

**2. The Pro plan is an _organisation_-level subscription, not per-project.** The billing page states it plainly: "Each organization has it's own subscription plan, billing cycle, payment methods and usage quotas." The organisation is **RapidGlobe**, marked PRO, and **both** `grant-pathway-dev` and `grant-pathway-prod` sit inside it. This retires a genuine ambiguity: this ADR's consequence said "Supabase Pro must be activated **on the production project**" and recorded it "✅ Activated 2026-06-22" without naming a project, which was impossible to verify as written. Both projects are also confirmed `AWS | eu-west-2` — London — which is independent evidence for `C13` alongside the `X-Vercel-Id: lhr1` finding recorded in `security-review-2026-08-15.md`.

**3. ⚠️ Backups do not include Storage objects.** The dashboard states: "Database backups do not include objects stored via the Storage API, as the database only includes metadata about these objects. Restoring an old backup does not restore objects that have been deleted since then."

**This costs nothing today, but by design rather than by luck, and that distinction is the reason it is recorded here.** The only bucket is `guidelines-temp`; per `ADR-FILE-001` the raw guideline file is deleted immediately after text extraction, with the 30-minute `cleanup-guidelines` cron sweeping orphans. Nothing of durable value ever lives in Storage — the retained text lives in the `application_guidelines` **table**, which _is_ backed up. **The exposure would begin the moment anything durable is stored in a bucket**, and a reader seeing "daily backups, 7-day retention" would reasonably assume otherwise. Any future feature that writes to Storage must revisit this section before it ships.

### Open decision — Cost Control spend cap

**Spend cap is currently _enabled_ on the RapidGlobe organisation.** The dashboard's own wording: "You won't be charged any extra for usage. However, your projects could become unresponsive or enter read only mode if you exceed the included quota."

That is a real trade-off nobody had recorded, and it cuts against this ADR's purpose:

- **Cap on (current):** spend is bounded, which suits `C1`'s £150/month ceiling — only ~£14 of which is unallocated. But exceeding quota takes **production read-only or unresponsive**, which for a live service is a hard outage with no warning.
- **Cap off:** the service stays up; spend is unbounded.

**⚠️ Supabase gives no warning before the cap bites. Verified against their own documentation 2026-08-15:** the spend cap "doesn't allow for fine-grained cost control, such as setting budgets for specific usage item or **receiving notifications when certain costs are reached**", and on exceeding quota "further usage of that item is disallowed until the next billing cycle". There is no email, no threshold alert. Supabase directs users to check the organisation's **Usage** dashboard and the billing page's **Upcoming Invoice** manually.

**This materially changes what "leave the cap on" means:** the first sign of trouble would be the service failing, not a warning. Two consequences follow — **the UptimeRobot monitor (`ADR-OPS-007`, `P5.4`) stops being a nice-to-have and becomes the only automatic signal**, and someone has to look at the Usage page periodically, because nothing will prompt them.

**Decision: leave the spend cap ENABLED. WJ, 2026-08-15.**

Reasoning, recorded so it can be re-examined rather than re-argued: an unbounded bill is the larger risk to a service funded personally until CIC grant funding is secured, `C1` leaves only ~£14/month unallocated, and current usage is orders of magnitude below the included quota (8GB database, 250GB bandwidth, 100,000 monthly active users against a handful of test accounts and roughly 320 AI requests in total). A brief outage on a service with no live users costs less than a surprise invoice.

**Revisit when real charities depend on the service.** At that point the balance inverts: the outage becomes the more serious harm, and the absence of any warning mechanism is what makes it serious.

**Superseded recommendation, kept for the trail:** Pro's included quota (8GB database, 250GB bandwidth, 100,000 monthly active users) is orders of magnitude above current usage — a handful of test accounts and roughly 320 AI requests in total — and an unbounded bill is the larger risk to a personally-funded service. **Revisit once real charities are using the service**, since the failure mode is an outage rather than a slowdown. The UptimeRobot monitor (`ADR-OPS-007`, `P5.4`) is what would surface it if it ever bit.

## Source

Risk assessment informed by DR-DP-001 (data stored), ADR-DATA-003 (data retention), ADR-STACK-002 (database), NFR-02 (99.5% uptime target), C1 (operating budget constraint).

## Date Decided

2026-05-26
