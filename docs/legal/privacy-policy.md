# Grant Pathway — Privacy Policy

**Version:** 1.9

**Effective date: 19 August 2026**

**Last updated: 19 August 2026**

> **Change from v1.8 (18 August 2026) to v1.9 (19 August 2026): Resend's support answered the question v1.8 left open, and it confirms the policy was right — with one disclosure gap it also exposes.** WJ asked whether the Irish sending region was egress-only or whether recipient data is also **stored** in Ireland, and whether any EEA residency option exists. **Resend's answer, in writing: the region setting "only affects where your emails leave our infrastructure"; recipient data (email addresses, names, message content) is stored in the United States; delivery logs and email event history are stored in the United States; and there is no EU/EEA data-residency option**, because the region controls the sending endpoint rather than the storage location. Their authoritative reference is https://resend.com/security/gdpr#where-is-resend-data-stored.
>
> ✅ **No substantive change was required, which is the point worth recording.** The policy has said "United States" since v1.0 and survived two attempts to move it to Ireland — the v1.7 draft and the v1.8 submitted revision, both reverted, and `GAP-102`, closed as disproven on 2026-08-17. **Three independent readings of the console said Ireland; the DPA said the United States; the DPA was right.** `AGENTS.md` §3's rule that a vendor console shows infrastructure while a DPA states processing now has a vendor's own confirmation behind it.
>
> ⚠️ **What the answer did change: delivery logs and email event history were never disclosed as a US transfer.** Section 6 named the recipient's name and email address and the content of the email, and stopped there. Resend's reply names the logs separately and places them in the US, so **Section 6** now includes them and **Section 7**'s email-delivery-records row states where they are held. **The transfer analysis was incomplete, not wrong** — under-disclosure of the same kind the reverted revisions would have caused, arrived at from the opposite direction.
>
> **Section 6** also now states plainly that the Irish infrastructure is the point of dispatch and does not affect where data is held, and that **no EU or EEA residency option exists** — closing the question rather than leaving a future reader to re-ask it. **Section 5**'s table cell changed from "email is sent from Irish infrastructure" to "Irish infrastructure is the sending endpoint only", for the same reason. ⚠️ **No further solicitor review commissioned** (WJ's standing decision of 2026-08-17, each carries a fee); the vendor's written answer is retained as the evidence.

> **Change from v1.7 (17 August 2026) to v1.8 (18 August 2026): two clarifications from WJ's own post-review read, and one change deliberately NOT made.** **Section 5, Axiom row** — expanded from "Germany (European Union) — see Section 6" to name both halves in the table itself: **"Germany (European Union) — technical logs; United States — RapidGlobe's account details, billing, etc."** The substance is unchanged from v1.7, which already explained the split in Section 6; this puts it where a reader meets the processor rather than three paragraphs later. **Section 5, Vercel row** — the "see Section 6" pointer dropped, the row now reading "United Kingdom (London) — Vercel is a US company".
>
> **Section 6 shortened to two points (WJ, 2026-08-18).** The **"Processed in the UK"** and **"Processed in the EEA"** paragraphs and the **Axiom two-part note** are all removed as adding no value: Section 5's table already states where each provider processes data, and the Axiom row now names both halves itself. What remains is the adequacy position, a pointer to Section 5, and the transfers-outside paragraphs. **Nothing disclosed in v1.7 has stopped being disclosed** — the detail moved into the table it duplicated.
>
> ⚠️ **The one part of the submitted rewrite not carried over is its framing**, which presented transfers outside the UK and EEA as a future possibility ("If this changes in future"). With Resend processing in the United States today, that shape cannot stand whatever the section's length, so the "Transfers outside the UK and EEA" paragraphs are retained verbatim from v1.7.
>
> ⚠️ **The change not made, and it is the important entry.** The revision as submitted also moved **Resend** from "United States" to **"Ireland (European Union) — emails are sent from an Irish data centre"** and rewrote **Section 6** so that transfers outside the UK and EEA read as a future possibility rather than a present fact. **Both were rejected and v1.7's wording is retained.** This is the second time this exact change has been proposed and reverted — the v1.7 draft carried it too, and `GAP-102` was closed on 2026-08-17 having disproven it.
>
> **Re-verified against Resend's live documents on 2026-08-18, not merely against yesterday's note:** the DPA (updated 2025-12-31) states **"Company's primary processing operations take place in the United States"**, offers **no EU or EEA data-residency option**, and names the legal entity as **Plus Five Five, Inc.**; the sub-processor page (updated 15 July 2026) lists **21 sub-processors, every one in the USA**, with no EU, EEA or UK entity anywhere on it. Transfers rest on the EU SCCs, the UK SCCs with the Addendum, and the EU–US Data Privacy Framework with its UK Extension.
>
> **The Irish reading is not wrong, it answers a different question.** Resend's console shows this domain's **sending region** as Ireland (`eu-west-1`), observed 15–16 August 2026 — that is where mail leaves from. Where data is **processed and who may access it** is what a privacy policy must state, and for that the DPA governs. **Publishing the revision as submitted would have removed a real US transfer disclosure and its safeguard from a solicitor-reviewed document — under-disclosure, which is the direction that carries risk.**
>
> ⚠️ **Open, and it does not block this version.** WJ has asked Resend's support to confirm whether the Irish region is egress-only or whether recipient data is also **stored** in Ireland, and whether any EEA residency option exists. **No answer can move this policy off "United States" unless Resend offers and we enable EU residency** — Plus Five Five is a US entity with 21 US sub-processors and US access, which is a transfer either way. A confirmation would let Section 6 distinguish where data rests from who can reach it. **WJ intends to take the wording to the solicitor once that answer arrives.**

> **Change from v1.6 (7 August 2026) to v1.7 (17 August 2026): the processor table brought back into line with the stack, and two disclosure gaps closed.** **Section 5** — **Upstash** and **Axiom** added as processors, neither having been named before (`GAP-109`; Axiom was connected 2026-08-16 and missing the same day). **Vercel** corrected from "United States (with global edge network)" to **United Kingdom (London)**, verified by the function reporting its own `VERCEL_REGION` (`GAP-110`) rather than by a dashboard setting. **Resend** confirmed as **United States** — `GAP-102` alleged this was wrong and the finding was itself wrong: Resend's DPA states processing is in the US and all 22 of its sub-processors are US entities, so the console's Irish sending region describes infrastructure, not processing. The column heading changed to "Where your data is processed", since the old "Where they are based" is what allowed entity and infrastructure to be conflated. **Section 6** rewritten and grouped UK / EEA / outside. Resend is now the only transfer outside the UK and EEA. Axiom's "some operations may be processed outside the EU" caveat is explained rather than quoted — its edge deployment handles ingest, storage and query in the EU, while the global control plane handling our own account sits outside it. Transfer bases named (EU SCCs, UK Addendum, EU–US DPF with UK Extension). **Section 2** — new **Technical logs** bullet. **v1.6 disclosed no IP-address collection anywhere.** This pre-dates Axiom, since Vercel has always logged IPs; the Axiom work exposed it. **Section 4** gained a matching lawful-basis row, and **Section 7** retention rows for technical logs (30 days) and rate-limiting data (~1 hour). **Section 9** — **`GAP-111`**: the policy declared one cookie and the live sign-in page sets **three** (Supabase PKCE code-verifier cookies, none HttpOnly, all written before authentication completes, verified in DevTools). Lawfulness unaffected — they are strictly necessary — the description was wrong. ⚠️ **No further solicitor review was commissioned (WJ, 17 August 2026)** — each carries a fee. The evidence for every change is recorded in `solicitor-brief-processor-table-2026-08-17.md`, which was written for that purpose and kept. **`GAP-112` raised for the underlying cause:** nothing connects adding a service to updating this table, which is why four findings arrived in two days.

> **Change from v1.6 (5 August 2026) to v1.6-final (7 August 2026): independent solicitor review complete — closes S2b under `P5.1`.** The solicitor-reviewed final versions were returned and incorporated without a version-number bump, since the review corrected and clarified the existing v1.6 text rather than introducing a new policy position. Changes: **(1)** Section 6 (International Data Transfers) widened to cover any future replacement provider based outside the UK, not just the two named today. **(2)** Section 7 (retention) closes with a recommendation that users keep their own copy of anything they may need after deletion. **(3)** Section 12 (How to Complain) now states we will acknowledge a complaint made to us within 30 days, ahead of the existing ICO escalation route. **(4)** Minor wording clarifications in Sections 2 and 6 ("whom you help", "may look up"). No change in legal basis, retention periods, or sub-processor list.

> **Change from v1.5 (30 July 2026): the effective date is set — 5 August 2026.** It had read `[TO BE CONFIRMED]` since the policy was first published on 2 July 2026, which the 2026-07-29 Opus audit raised as finding **S2** and rated Severe: a published privacy policy with no effective date is not a defensible position for a registered data controller (ICO ZC168720), and it blocked external testers being asked to rely on it. **The date chosen is the date this text takes effect, not a future launch date.** The service has been live and in use by external testers at a hosted URL since before this change, so dating the policy from the day its current wording takes effect is accurate, where a future date would have claimed no policy was in force while people were already using the service. Go-live remains unscheduled (working estimate August–September 2026) and does not affect this date. Tracked as **S2a**; the independent legal review is **S2b** and remains open under `P5.1`. No other wording changed.

> **Change from v1.4 (2 July 2026):** Three disclosure gaps closed, all found by comparing this policy against the notice produced by the ICO's own Privacy Notice Generator (see `docs/legal/legal-review-options-2026-07-29.md`, which recommends using the free ICO tools first). **(1) Section 2 now discloses your first and last name and your password's treatment.** Registration has always collected `first_name` and `last_name` (both required, used in email greetings and the nav bar) but the policy listed only the email address. **(2) Consent is now recorded as a legal basis, and the right to withdraw consent has been added to Section 8.** The optional "happy to be contacted" checkbox at registration (`feedback_consent`, FR-08) is consent-based processing; it appeared nowhere in this policy, and as a result the right to withdraw consent — which UK GDPR requires wherever consent is a basis — was missing. **(3) A new "Where we get your information from" subsection** in Section 2 states that almost everything comes directly from you, and discloses the one exception: the optional Charity Commission register lookup used to pre-fill organisation details. Also added a short legitimate-interests balancing statement to Section 4 and a note in Section 8 that which rights apply depends on the legal basis.

> **Change from v1.3 (29 June 2026):** Sections 2, 3, and 5 corrected to describe the actual AI model — the charity writes every answer; AI refines and improves on request only, and does not generate answers from scratch. This corrects a stale claim left over from an earlier product model abandoned on 2026-05-28.

> **Change from v1.2 (17 June 2026):** Data protection contact email (Section 1), rights contact email (Section 8), and general contact email (Section 11) updated from wjokhia@rapidglobe.com to admin@rapidglobe.com.

> **Change from v1.1 (26 May 2026):** Section 1 updated to confirm ICO registration number ZC168720.

> **Change from v1.0 (22 May 2026):** Section 5 updated to reflect Amazon Bedrock (eu-west-2, London) as the AI processing provider, replacing the previous Anthropic direct API reference; Sentry data region corrected to European Union. Section 6 updated to reflect that AI processing no longer involves a US data transfer. Section 7 updated to accurately disclose the 7-day automated backup retention window that applies after account deletion (ADR-DATA-005).

**Internal maintenance note (added 2026-07-28):** This file is the internal working copy — full changelog with cross-references to internal decision records, kept here for audit trail. The live `/privacy` page renders `privacy-policy-external.md` instead, a clean copy of the same body text with the "Change from vX.X" blockquotes above removed (they cite internal doc IDs like `ADR-DATA-005` that mean nothing to an external reader). **Whenever the numbered sections below change, mirror the same section change into `privacy-policy-external.md` — that file has no changelog of its own, so there is nothing else to prompt this.**

---

## 1. Who We Are

Grant Pathway is a free online tool that helps UK charities write grant applications. It is provided by **RapidGlobe Ltd**, a company registered in England and Wales.

|                                 |                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------- |
| **Company name**                | RapidGlobe Ltd                                                               |
| **Company registration number** | 05615649                                                                     |
| **Registered address**          | Ground Floor Suite, Crown House, 40 North Street, Hornchurch, Essex RM11 1EW |
| **ICO registration number**     | ZC168720                                                                     |
| **Data protection contact**     | admin@rapidglobe.com                                                         |

RapidGlobe Ltd is the **data controller** for the personal information you provide when using Grant Pathway. This means we decide how and why your data is used, and we are responsible for keeping it safe.

---

## 2. What Information We Collect

### Information you give us

When you register and use Grant Pathway, you provide:

- **Your name** — your first and last name, collected when you register. We use them to address you by name in emails and in the service
- **Your email address** — used to create and identify your account
- **Your password** — stored only as a secure one-way hash. We never see, store, or have any way to recover your actual password
- **Your organisation's details** — the name, description, whom you help, and where you work, as entered in your organisation profile
- **Grant application content** — funder guidelines you upload or paste in, and the answers you write and refine within the tool
- **Any AI-suggested improvements** you choose to accept, and any further edits you make, before saving your answer
- **Your feedback preference** — whether you tick the optional box at registration saying you are happy to be contacted about your experience of using the service. This is entirely optional, ticking it is not a condition of using Grant Pathway, and you can change your mind at any time (see Section 8)

### Information we collect automatically

- **Usage data** — a count of AI-assisted requests made per account each month, used to manage the fair-use limit
- **Session data** — a secure token stored in your browser that keeps you signed in while you use the service
- **Technical logs** — when your browser or device contacts our service, our systems record standard technical information about the request, including your **IP address**, the page or feature requested, the time, and the type of browser you are using. We use these logs only to keep the service running, diagnose faults, and detect abuse. They are automatically deleted after 30 days (see Section 7)
- **Error reports** — if something goes wrong, limited technical information about the error may be collected to help us diagnose and fix the problem

### Where we get your information from

Almost everything we hold comes **directly from you** — you type it in when you register, complete your organisation profile, or work on an application.

There is one exception. If you enter your charity's registration number, Grant Pathway may look that number up in the **public register maintained by the Charity Commission for England and Wales** and pre-fill some of your organisation's details, to save you typing them again. This is optional — you can leave the registration number blank and enter everything yourself. The information returned is public register data about the organisation, not about you personally, and we only use it to populate your organisation profile.

We do not buy personal information, receive it from data brokers, or obtain it from any other third-party source.

We do not collect payment information. We do not use advertising trackers. We do not build profiles for marketing purposes.

---

## 3. How We Use Your Information

We use your information to:

- **Provide the service** — create your account, save your organisation profile, generate AI-assisted summaries of funder guidelines and refine the answers you write on request, and let you export completed applications
- **Maintain the service** — monitor for errors, manage the fair-use limit, and keep the system running reliably
- **Communicate with you** — send a welcome email when you register, and a warning email if your account is approaching the two-year inactivity threshold (see Section 7)
- **Keep the service secure** — detect and prevent fraudulent or abusive use of the platform

We do not use your information for marketing. We do not sell your data. We do not use your information to train artificial intelligence models.

---

## 4. Legal Basis for Processing

Under the UK General Data Protection Regulation (UK GDPR), we must have a legal basis for processing your personal data. We rely on the following:

| Processing activity                                                                          | Legal basis                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Creating and managing your account                                                           | **Contract** — necessary to provide the service you have signed up for                                                                                                                                 |
| Saving your organisation profile and application content                                     | **Contract** — necessary to deliver the core features of the service                                                                                                                                   |
| Sending service emails (welcome, inactivity warning)                                         | **Contract / Legitimate interests** — necessary to operate the account lifecycle and keep you informed                                                                                                 |
| Managing the fair-use limit                                                                  | **Legitimate interests** — necessary to manage running costs and ensure fair access for all users                                                                                                      |
| Error monitoring and security                                                                | **Legitimate interests** — necessary to keep the service reliable and protect against abuse                                                                                                            |
| Keeping technical logs of requests made to the service, including IP addresses               | **Legitimate interests** — necessary to keep the service running, diagnose faults, and detect and prevent abuse. These logs are deleted automatically after 30 days                                    |
| Recording your feedback preference, and contacting you about your experience if you opted in | **Consent** — we only do this if you ticked the optional box at registration. You may withdraw your consent at any time, and doing so has no effect on your ability to use the service (see Section 8) |

**Where we rely on legitimate interests**, we have considered whether the processing is necessary, whether it could reasonably be achieved another way, and whether it would override your interests or rights. In each case above the processing is limited to what is needed to run the service safely and within cost, and we are satisfied it does not.

---

## 5. Who We Share Your Information With

We do not sell your data. We do not share it for advertising or marketing purposes. We work with a small number of trusted third-party service providers who process data on our behalf:

| Provider                          | What they do                                                                                  | Where your data is processed                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Supabase**                      | Stores your account, organisation profile, and application data                               | United Kingdom (London)                                                                                |
| **Amazon Web Services (Bedrock)** | Powers the AI features that summarise funder guidelines and help refine the answers you write | United Kingdom / European Union                                                                        |
| **Resend**                        | Sends transactional emails (welcome email, inactivity warning)                                | United States (Irish infrastructure is the sending endpoint only — see Section 6)                      |
| **Vercel**                        | Hosts the Grant Pathway web application                                                       | United Kingdom (London) — Vercel is a US company                                                       |
| **Upstash**                       | Limits how often requests can be made, to protect the service from abuse                      | Ireland (European Union)                                                                               |
| **Sentry**                        | Captures error reports to help us diagnose and fix technical problems                         | Germany (European Union)                                                                               |
| **Axiom**                         | Stores technical logs so we can diagnose faults and detect abuse                              | Germany (European Union) — technical logs; United States — RapidGlobe's account details, billing, etc. |

Each provider is bound by a data processing agreement and is only permitted to use your data to deliver the service to us — not for their own commercial purposes.

**A note on AI processing:** When you ask Grant Pathway to summarise funder guidelines or help refine an answer you have written, the relevant content (funder guidelines and your organisation profile) is processed by Amazon Web Services using the Anthropic Claude model via the Amazon Bedrock service. This processing takes place within the United Kingdom (AWS eu-west-2, London) under normal operating conditions, and never outside the European Economic Area under any circumstances. Your email address is never sent to the AI processing layer. Anthropic does not use this data to train its AI models — this commitment is upheld through the AWS and Anthropic terms governing the Bedrock service.

---

## 6. International Data Transfers

Almost all of your data stays within the United Kingdom or the European Economic Area (EEA). The EEA is covered by the UK's adequacy decision, which means personal data may be transferred there without any additional safeguard being required. Section 5 sets out where each provider processes your data.

**Transfers outside the UK and EEA.** One provider processes your data in the United States: **Resend**, which sends our transactional email. Email for our domain leaves Resend's network from Irish infrastructure, but that setting controls only the point of dispatch and does not affect where data is held. Resend has confirmed to us in writing, and its data processing agreement states, that personal data is transferred to and processed in the United States as a necessary part of providing the service. This applies to the recipient's name and email address, the content of the email, and the delivery logs and email event history. Resend does not offer an EU or EEA data-residency option.

Where personal data is transferred outside the United Kingdom to Resend, or to any provider outside the United Kingdom we may substitute for it or for any other provider in future, we ensure that appropriate safeguards are in place — typically the UK's International Data Transfer Agreement (IDTA) or equivalent EEA standard contractual clauses — so that your data continues to be protected to the same standard as within the UK. Resend relies on the EU standard contractual clauses, the UK addendum to those clauses, and the EU–US Data Privacy Framework including its UK Extension.

---

## 7. How Long We Keep Your Information

| Data                                     | Retention period                                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Account details and organisation profile | Until you delete your account, or until the inactivity deletion policy applies (see below)                                             |
| Application content                      | Deleted when your account is deleted                                                                                                   |
| AI usage log                             | Deleted when your account is deleted                                                                                                   |
| Your name and feedback preference        | Deleted when your account is deleted                                                                                                   |
| Automated backup copies                  | Permanently removed within 7 days of account deletion, as part of standard backup rotation (see below)                                 |
| Email delivery records                   | Held by Resend in the United States, in accordance with their standard retention policy (up to 90 days)                                |
| Technical logs                           | Held for 30 days by our logging provider, and for a shorter period by our hosting provider, then automatically and permanently deleted |
| Rate-limiting data                       | Held only transiently — around one hour — and then automatically deleted                                                               |
| Error reports                            | Retained for up to 12 months for diagnostic purposes, anonymised where possible                                                        |

**Inactivity deletion:** If your account has not been used for two years, we will send a warning email to your registered address. If you do not log in within 30 days of that warning, your account and all associated data will be permanently deleted. You will receive no further warning before deletion occurs.

**Account deletion on request:** You can delete your account at any time from within the service. Your data is removed from our live systems immediately and permanently. As part of our operational backup infrastructure, automated backup copies are permanently removed within 7 days as part of the standard backup rotation cycle. These backup copies are not accessible to users and cannot be used to restore deleted content.

It is recommended that you store any information that may be deleted separately if you think you may need to use it after it is deleted as set out above.

---

## 8. Your Rights

Under UK GDPR, you have the following rights in relation to your personal data:

- **Right of access** — you can request a copy of the personal data we hold about you
- **Right to rectification** — you can ask us to correct inaccurate or incomplete data
- **Right to erasure** — you can ask us to delete your personal data (you can also do this directly by deleting your account within the service)
- **Right to restriction** — you can ask us to limit how we process your data while a concern is being resolved
- **Right to data portability** — you can ask for your data in a structured, commonly used, machine-readable format
- **Right to object** — you can object to processing based on legitimate interests
- **Right to withdraw consent** — where we rely on your consent, you can withdraw it at any time. The only processing we base on consent is contacting you about your experience of the service, if you opted in at registration. You can withdraw that consent by emailing us, and it will not affect your account or your ability to use Grant Pathway in any way
- **Rights related to automated decision-making** — Grant Pathway does not make automated decisions that have a legal or similarly significant effect on you

Which of these rights apply depends on the legal basis we rely on for the processing in question — Section 4 sets out the basis for each activity. Withdrawing consent does not affect the lawfulness of anything we did before you withdrew it.

To exercise any of these rights, please contact us at **admin@rapidglobe.com**. We will respond within one month of receiving your request. We may need to verify your identity before we can process it.

There is no charge for exercising your rights in most cases.

---

## 9. Cookies

Grant Pathway uses a small number of cookies that are strictly necessary to operate the service:

- **Sign-in cookies** — when you open the sign-in page, a small number of temporary cookies are set so that the sign-in can be completed securely. They are part of the sign-in process itself and are not used to identify or track you.
- **Authentication cookie** — a secure, encrypted token that keeps you signed in during your session. This cookie is deleted when you sign out or when your session expires.

We do not use advertising cookies, analytics cookies, or any third-party tracking technology. Because we only use cookies that are strictly necessary for the service to function, we are not required to ask for your consent to set them — but we want to be transparent about their use.

---

## 10. Changes to This Policy

If we make significant changes to this policy — for example, if we add a new category of data or a new service provider — we will notify you by email before the changes take effect.

Minor or clarificatory changes may be made without advance notice. The updated policy will always be available at grantpathway.org.uk, and the "Last updated" date at the top of this page will reflect when it was last changed.

---

## 11. How to Contact Us

For any questions about this privacy policy, or to exercise your data rights, please contact us:

**Email:** admin@rapidglobe.com

**Post:** RapidGlobe Ltd, Ground Floor Suite, Crown House, 40 North Street, Hornchurch, Essex RM11 1EW

We aim to respond to all enquiries within five working days.

---

## 12. How to Complain

You have a right to complain to us about the handling of your personal data by emailing **admin@rapidglobe.com**. We will acknowledge your complaint within 30 days and will aim to resolve it as soon as possible after that.

If you are not satisfied with how we have handled your personal data, you have the right to lodge a complaint with the **Information Commissioner's Office (ICO)**, the UK's data protection authority:

- **Website:** [ico.org.uk](https://ico.org.uk)
- **Telephone:** 0303 123 1113
- **Post:** Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF

We would always prefer the opportunity to resolve any concern directly before a formal complaint is made. Please contact us first and we will do our best to address your concern promptly.

---

_Grant Pathway is provided by RapidGlobe Ltd (company number 05615649), registered in England and Wales._

_Version: 1.8_
_Effective date: 18 August 2026_
_Last updated: 18 August 2026_
