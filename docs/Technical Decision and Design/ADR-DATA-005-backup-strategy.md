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

- Supabase Pro plan must be activated on the production project before go-live. Add to P5.4 pre-launch checklist in IMPLEMENTATION-PLAN.md (and the pre-launch checklist in ADR-OPS-002).
- Privacy policy Section 7 must be updated to disclose the 7-day backup retention window that applies after user-requested account deletion. ✅ Done 2026-05-26.
- Operating cost table in `technical-design.md` §3 must be updated: Supabase line changes from "Free tier (initially)" to "Pro (~£20/month)"; total fixed costs change from ~£16/month to ~£36/month. ✅ Done 2026-05-26.
- Business overview "Data, Privacy, and Trust" section updated to reflect operational resilience measures. ✅ Done 2026-05-26.
- Future consideration: at scale, revisit PITR (Option C) or supplement with custom pg_dump exports (Option D) for longer retention.

---

## Source

Risk assessment informed by DR-DP-001 (data stored), ADR-DATA-003 (data retention), ADR-STACK-002 (database), NFR-02 (99.5% uptime target), C1 (operating budget constraint).

## Date Decided

2026-05-26
