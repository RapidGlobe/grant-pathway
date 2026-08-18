# Solicitor Brief — Processor Table Re-Review

**Tier:** 2
**Volatility:** Medium
**Update when:** A finding below is answered, or a further processor discrepancy is found

**Prepared:** 17 August 2026
**For:** Independent solicitor review (the same reviewer who signed off `privacy-policy-external.md` at `P5.1`)
**Subject:** `docs/legal/privacy-policy-external.md` — Section 5 (Who We Share Your Information With), Section 6 (International Data Transfers), Section 7 (How Long We Keep Your Information)
**Status:** DRAFT — not yet sent. No edit has been made to the published policy.

---

## Why this is one brief and not three amendments

Three separate discrepancies have been found between the published privacy policy's processor table and the services the product actually uses. All three were found within two days of each other (15–16 August 2026) during production infrastructure work, and all three are against the **same document**, which closed `P5.1` with an independent solicitor review.

They are sent together deliberately. Individually each is small — one is a region label, one is a missing row, one is a service added last week. Together they raise a fourth question that is larger than any of them, set out at the end: **nothing in this project connects "a service was added" to "the processor table needs updating."**

**No edits have been made to the published policy.** Each finding below has been verified against a console or a code path rather than inferred, and the evidence is given so the conclusion can be checked rather than taken on trust. What is sought is a decision on each, and a view on the fourth question.

---

## What the policy currently says

Section 5 lists **five** processors:

| Provider                          | What they do                                      | Where they are based                     |
| --------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| **Supabase**                      | Stores account, organisation profile, application | United Kingdom (London)                  |
| **Amazon Web Services (Bedrock)** | Powers the AI features                            | United Kingdom / European Union          |
| **Resend**                        | Sends transactional emails                        | United States                            |
| **Vercel**                        | Hosts the web application                         | United States (with global edge network) |
| **Sentry**                        | Captures error reports                            | European Union                           |

Section 6 states: _"Two of our service providers are based outside the United Kingdom — Resend and Vercel (both United States)"_, relying on the IDTA or equivalent SCCs.

---

## Finding 1 — Resend's region (`GAP-102`)

**Raised:** 15 August 2026. Observed twice, on 15 and 16 August.

| Item                    | Detail                                                                   |
| ----------------------- | ------------------------------------------------------------------------ |
| **Policy says**         | Resend — "United States"; named in Section 6 as a non-UK transfer        |
| **Console says**        | The sending region for `grantpathway.org.uk` is **Ireland (eu-west-1)**  |
| **Evidence**            | Resend console, domain configuration screen                              |
| **Internal ADR**        | `ADR-OPS-003` records the Resend decision but **names no region at all** |
| **Direction of error**  | Safe — the policy claims weaker protection than reality                  |
| **Personal data given** | Recipient email address, and the content of transactional emails         |

**The ambiguity to resolve:** "United States" may have been chosen deliberately to describe the **corporate entity** — Resend is a US company, and US entity access is possible regardless of where the mail is sent from. Or it may describe the **infrastructure**, in which case it is simply wrong.

**Question for the solicitor:** Should the table describe the corporate entity, the infrastructure region, or both? If both, is Section 6's transfer analysis still correct as written, given that the infrastructure is EEA?

---

## Finding 2 — Upstash is absent entirely (`GAP-109`)

**Raised:** 16 August 2026, during a development/production configuration parity audit.

Upstash (Redis) is used for rate limiting and **is not named in the processor table at all**. It is not an incidental infrastructure component holding nothing personal:

| Limiter           | Keyed by          | Personal data?                           | Call site                                                                                               |
| ----------------- | ----------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `resendRatelimit` | **Email address** | **Yes** — the address is part of the key | `actions/auth.ts:581`                                                                                   |
| `aiRatelimit`     | `user.id` (UUID)  | Pseudonymous only                        | `app/api/generate-summary/route.ts:211`, `app/api/refine-answer/route.ts:144`, `actions/charity.ts:313` |

Source: `lib/rate-limit.ts`.

| Item                  | Detail                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What it does**      | Limits verification-email resends to 3 per hour per address, and AI requests to 5 per minute                                                                           |
| **Region**            | **AWS `eu-west-1` (Ireland)** — EEA, read from the Upstash console                                                                                                     |
| **Retention**         | Transient. A 3-per-hour sliding window, so keys expire after roughly an hour. Nothing retained deliberately; `analytics` is explicitly disabled in `lib/rate-limit.ts` |
| **Transfer position** | Benign — EEA, covered by the UK's adequacy decision. No IDTA question arises                                                                                           |

**The omission is the finding, not the location or the retention.**

Worth noting: the **internal** `legal-review-options-2026-07-29.md` (line 255) **does** list Upstash in its processing chain. So the service was known to the legal work at the time. What did not carry through is the external document.

**Question for the solicitor:** Was the omission deliberate — a judgement that an hour-long transient key is below the threshold for naming a processor — or was it missed when the table was drafted? If the latter, a row is proposed at the end of this brief.

---

## Finding 3 — Axiom is new and not described anywhere

**Added:** 16 August 2026. Never in the table, because it did not exist when the table was reviewed.

Axiom is a log-management service, connected to Vercel as a log drain. It receives **every function log line** the application emits.

| Item                    | Detail                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **What it does**        | Stores application and request logs for diagnosis                                                                                  |
| **Personal data given** | **`request.ip`** appears in every log line, and IP addresses are personal data. Log lines also carry request paths and user agents |
| **Region**              | Axiom edge deployment **EU Central 1 (AWS)**                                                                                       |
| **Retention**           | **30 days**, fixed — the form rejects a higher value                                                                               |

⚠️ **Axiom cannot be described the way Sentry is, and this is the substantive point of this finding.** Section 6 currently says of Sentry that data is _"stored in the European Union, which is covered by the UK's adequacy decision … no additional transfer mechanism is required."_

**Axiom's own signup screen states that the EU Central 1 region _"includes a smaller set of ingest options, and some operations may be processed outside the EU."_** That is quoted from the provider's own interface at the point of selection. It remains the right region to have chosen — but the honest claim afterwards is "stored in the EU, some operations may be processed elsewhere", which is a materially different statement from Sentry's.

**Questions for the solicitor:**

1. Does Axiom need a row in the processor table, given it receives IP addresses? (Our assumption is yes.)
2. Does the "some operations may be processed outside the EU" caveat require a transfer mechanism (IDTA/SCCs) to be identified in Section 6, or is the vendor's own DPA sufficient without naming it in the policy?
3. Should the 30-day log retention appear in the Section 7 retention table, alongside the existing "Email delivery records — up to 90 days" row?

---

## Finding 4 — the mechanism, which is the real finding

**Three services in two days were found missing from or misdescribed in one table.** That is not three coincidences.

The processor table was written once, reviewed at `P5.1`, and has drifted from the stack ever since. **Nothing in this project's process connects the act of adding a service to the act of updating that table.** New services get an ADR, an entry in the technology stack document, and environment variables. None of those routes reaches the privacy policy.

The consequence is predictable: fix these three, and the fourth service will do exactly the same thing. Axiom is already the proof — it was added on 16 August and was missing from the table the same day, entirely innocently.

**Question for the solicitor:** This is a controls question rather than a drafting one, but it bears on how often re-review will be needed. Is there a standard practice you would recommend for keeping a processor table current — for example a periodic review interval, or a documented trigger on adding any new sub-processor?

**Internal action, independent of the answer:** this should be raised as its own item in the gap register, with a documented trigger in `AGENTS.md`'s post-task checklist so that adding a service forces a check of `docs/legal/`. That is ours to fix, not the solicitor's, and it is recommended regardless of what comes back.

---

## Proposed wording — for review, NOT applied

Offered so there is something concrete to react to. **None of this has been written into the published policy**, and it should not be until the questions above are answered.

**Section 5, two additional rows:**

| Provider    | What they do                                                               | Where they are based      |
| ----------- | -------------------------------------------------------------------------- | ------------------------- |
| **Upstash** | Protects the service from abuse by limiting how often requests can be made | Ireland (European Union)  |
| **Axiom**   | Stores technical logs so we can diagnose faults                            | European Union (see note) |

**Section 5, Resend row:** amend "United States" to reflect whichever of entity/infrastructure the solicitor directs — e.g. "United States (company); emails sent from Ireland".

**Section 6:** revise the "Two of our service providers" sentence, which is inaccurate on its face once the table has seven rows. Add the Axiom caveat as its own sentence rather than folding it into the Sentry paragraph.

**Section 7, one additional row:**

| Data           | Retention period                                      |
| -------------- | ----------------------------------------------------- |
| Technical logs | Held by Axiom for 30 days, then automatically deleted |

---

## What is not in question

Stated so the review is not wider than it needs to be. None of the following is affected by any finding above:

- **AI processing.** Section 5's note on Bedrock is accurate and separately verified: UK (`eu-west-2`), never outside the EEA, email address never sent to the AI layer.
- **Supabase.** London, as stated. Both projects confirmed `eu-west-2` on 15 August 2026.
- **Sentry.** EU, as stated.
- **The lawful bases in Section 4**, the data subject rights in Section 8, and the retention periods for user-facing data in Section 7.

---

## Sources

| Claim                               | Verified how                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| Resend sending region = Ireland     | Resend console, domain screen, observed 15 and 16 August 2026                  |
| Upstash keyed by email address      | `lib/rate-limit.ts` and `actions/auth.ts:581`, read directly                   |
| Upstash region = `eu-west-1`        | Upstash console                                                                |
| Upstash retention transient         | `Ratelimit.slidingWindow(3, '1 h')` in `lib/rate-limit.ts`; `analytics: false` |
| Axiom receives `request.ip`         | Observed in the live log stream, Axiom dataset `vercel`                        |
| Axiom region and EU caveat          | Quoted from Axiom's own signup screen at region selection                      |
| Axiom retention = 30 days           | Axiom dataset configuration; the form rejects higher values                    |
| Upstash known to earlier legal work | `docs/legal/legal-review-options-2026-07-29.md` line 255                       |

**Related gap register rows:** `GAP-102`, `GAP-109`. Axiom's caveat has no row yet. Full history in `docs/Implementation Plan/ADR-TRACEABILITY.md`.

---

## Addendum 2026-08-18 — Resend's own answers, received from their support

Two questions were put to Resend and answered by Brian, Customer Success Engineer. **Recorded verbatim in substance because vendor statements are the evidence the policy is meant to rest on** — and `AGENTS.md` §3's service-change trigger is explicit that a DPA or a vendor statement governs, not a console screen.

**1. Email is never delivered over an unencrypted connection.** Resend's answer: where the receiving mail server does not support TLS, **the message bounces**, returning a bounce code stating the receiving server does not support TLS. It is not downgraded and sent in clear.

➡️ **This is an addition to the published policy, not a correction to it.** v1.7 makes **no statement at all** about encryption of email in transit — Section 6 covers transfer safeguards and Section 5 the processor, but neither addresses the transport. A sentence confirming that transactional email is only delivered over TLS is a positive, verifiable security property and belongs with the other security statements. **Not drafted here**, to avoid colliding with the review in progress.

**2. Resend's AI features do not process customer data.** Resend's answer: the AI functionality described at `https://resend.com/blog/one-more-ai-thing` applies only to features used **by the account holder while logged in** — for example generating email content in their dashboard. It is not applied to data passing through the sending pipeline.

➡️ **This closes the question of whether Resend introduces an AI sub-processor.** It does not, on the strength of the vendor's own statement, provided nobody uses those dashboard features. **That proviso is the operational condition:** the answer is conditional on account behaviour, not on infrastructure, so it holds only while the Resend dashboard's AI features go unused. Worth knowing before anyone reaches for them to draft a template.

⚠️ **Both answers came from support, not from the DPA.** They are better than console observation — which is what produced the mistaken `GAP-102` finding — but weaker than a contractual term. Treat them as evidence of current behaviour rather than as a commitment, and prefer the DPA where the two ever diverge.
