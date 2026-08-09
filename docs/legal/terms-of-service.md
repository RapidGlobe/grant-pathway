# Grant Pathway — Terms of Service

**Version:** 1.6

**Effective date: 7 August 2026**

**Last updated: 7 August 2026**

> **Change from v1.6 (5 August 2026) to v1.6-final (7 August 2026): independent solicitor review complete — closes S2b under `P5.1`.** The solicitor-reviewed final versions were returned and incorporated without a version-number bump, since the review corrected and clarified the existing v1.6 text rather than introducing a new commercial position. Changes: **(1) Section 1** now defines "you" as covering both the organisation and the individual registering on its behalf, and states both must comply. **(2) Section 2**: commercial fundraising restriction strengthened from "not intended for" to "may not be used for". **(3) Section 3**: clarified that an organisation may hold only one account regardless of employee count, and that an account may not be used on behalf of more than one organisation. **(4) Section 4**: added an indemnity — a user who breaches these terms and causes us or a third party loss must indemnify us, our directors, and our shareholders. **(5) Section 5**: added that we are not a fact-checker of the data submitted with an application. **(6) Section 6**: fair use is now expressly conditioned on meeting the Section 2 eligibility criteria. **(7) Section 7**: content ownership now explicitly includes intellectual property rights. **(8) Section 8**: source code protection now names copyright and other IP rights specifically. **(9) Section 9**: added a recommendation that users keep their own separate copies of material they upload. **(10) Section 14** renamed "Contact and Notices" and now states notices are sent to the email address on file. **(11) New Section 15 (General)**: severability, entire agreement, no waiver by delay, no assignment between charities, no third-party rights (Contracts (Rights of Third Parties) Act 1999), a lawful-basis undertaking for any personal data supplied to us, and a confidentiality obligation on non-public business/technical/financial information. No change to the fair-use limit, liability position, or governing law.
>
> **Change from v1.5 (5 August 2026, same day):** Section 5 restructured at WJ's request while a solicitor reviews both documents, to reduce ambiguity — no change in meaning. The no-guarantee-of-success statement ("We make no representation that using Grant Pathway will result in a successful grant application...") now sits under its own sub-heading, **"No Guarantee of Funding Success,"** rather than mid-paragraph between two unrelated statements (user responsibility for content, and how AI processing works). The AI-provider/data-processing paragraph was moved earlier in the section, ahead of the new sub-heading, so it does not end up nested under a heading about a different topic.
>
> **Change from v1.4 (30 July 2026): the effective date is set — 5 August 2026.** It had read `[TO BE CONFIRMED]` since these terms were first published on 10 July 2026 — audit finding **S2**, rated Severe, and a blocker on asking external testers to accept them. **The date is the date this text takes effect, not a future launch date**, since the service is already live and in use at a hosted URL; a future date would have asserted that no terms were in force while people were using the service. Go-live remains unscheduled and does not affect this date. Tracked as **S2a**; the independent legal review is **S2b** and remains open under `P5.1`. No other wording changed.

> **Change from v1.3 (10 July 2026):** Three corrections, all found while preparing these terms for external legal review. **(1) Section 6's fair-use limit corrected from 20 to 50 AI-assisted requests per calendar month.** This is the most consequential: it is a binding contractual term, it was published, and it understated what the service actually provides by 60%. The cap was raised from 20 to 50 on 2026-06-17 (`PDR-AI-005`) and `lib/prompts.ts` has enforced `MONTHLY_CAP = 50` ever since; these terms were never updated to follow. **(2) The contact email in Sections 2, 3, 6 and 14 changed from `wjokhia@rapidglobe.com` to `admin@rapidglobe.com`.** The Privacy Policy made this change at its v1.3 on 2026-06-17; these terms did not, so the two live legal documents gave different contact addresses for the same company. **(3) Section 5's AWS paragraph** said "when you request a summary or draft answer" — a leftover from the abandoned draft-generation model that the rest of that same section had already been corrected to disprove at v1.1. Now reads "a summary, or ask for help improving an answer you have written".

> **Change from v1.2 (2 July 2026):** Section 8 (Intellectual Property) corrected — Grant Pathway's source code is closed and proprietary, not open source. This was a stale claim carried over from `DR-BM-003`'s original 2026-04-09 position, which was reversed on 2026-07-10 (see `DR-BM-003`, `ADR-STACK-005`); the live GitHub repository has in fact been private with no open-source licence throughout.

> **Change from v1.1 (26 May 2026):** Section 5 corrected to describe the actual AI model — the charity writes every answer; AI refines and improves on request only, and does not generate answers from scratch. This corrects a stale claim left over from an earlier product model abandoned on 2026-05-28.

> **Change from v1.0 (22 May 2026):** Section 5 updated to reference Amazon Bedrock as the AI processing layer, consistent with the privacy policy and DR-DP-002. Section 9 updated to acknowledge that operational backup infrastructure is maintained for disaster recovery purposes; this does not constitute a guarantee of data recovery and does not change the limitation of liability in Section 10.

**Internal maintenance note (added 2026-07-28):** This file is the internal working copy — full changelog with cross-references to internal decision records, kept here for audit trail. The live `/terms` page renders `terms-of-service-external.md` instead, a clean copy of the same body text with the "Change from vX.X" blockquotes above removed (they cite internal doc IDs like `DR-BM-003` that mean nothing to an external reader). **Whenever the numbered sections below change, mirror the same section change into `terms-of-service-external.md` — that file has no changelog of its own, so there is nothing else to prompt this.**

---

## 1. Introduction

Grant Pathway is a free online tool that helps UK charities write grant applications. It is provided by **RapidGlobe Ltd** (company registration number 05615649), a company registered in England and Wales at Ground Floor Suite, Crown House, 40 North Street, Hornchurch, Essex RM11 1EW ("we", "us", "our").

By creating an account and using Grant Pathway, you agree to be bound by these Terms of Service. Please read them carefully before you register. In these terms "you" means your organisation and also the individual representing it who registers their email address to use the service. Both the organisation and you, personally, must comply with these terms.

If you do not agree to these terms, you should not use the service.

---

## 2. Who Can Use Grant Pathway

Grant Pathway is intended for charitable organisations based in or operating in the United Kingdom. To register and use the service, you must:

- Represent a UK-based charitable organisation — this includes registered charities, charitable incorporated organisations (CIOs), community interest companies (CICs), charitable trusts, community benefit societies, and similar bodies whose purpose is charitable or for the public benefit
- Be authorised by that organisation to use the service on its behalf
- Be at least 18 years old

Grant Pathway is not for personal use. It may not be used for commercial fundraising. It is not for use by organisations that are not charitable in nature.

If you are unsure whether your organisation is eligible, please contact us at **admin@rapidglobe.com** before registering.

---

## 3. Your Account

When you register, you create a personal account linked to your email address. You are responsible for:

- Keeping your login credentials secure and confidential
- All activity that takes place under your account
- Ensuring that the information in your organisation profile is accurate and kept up to date

If you believe your account has been accessed without your authorisation, contact us immediately at **admin@rapidglobe.com**.

You may only hold one account per person. You may not share your account with other individuals. An organisation may only have one account even if it has several employees. You may not create multiple accounts to circumvent the fair-use limit nor any other restriction. Nor may you use it on behalf of several different charitable or other organisations.

---

## 4. Using the Service

You agree to use Grant Pathway only for its intended purpose: supporting your charitable organisation in writing grant applications.

You must not:

- Use the service for any unlawful purpose or in breach of any applicable law or regulation
- Submit false or misleading information about your organisation or its work
- Attempt to gain unauthorised access to the service, its systems, or other users' accounts
- Use the service to generate or distribute content that is unlawful, defamatory, discriminatory, or harmful
- Interfere with the service or place an unreasonable burden on our infrastructure in a way that disrupts access for other users
- Attempt to reverse engineer, decompile, or extract the source code of any proprietary components of the service

We reserve the right to suspend or terminate accounts that violate these terms (see Section 11) without prejudice to our other rights. Where you use the service in breach of these Terms of Service and this causes loss or liability to us and/or a third party claim against us, our directors or shareholders, you will fully indemnify and hold them harmless against such loss and liability.

---

## 5. AI-Generated Content

Grant Pathway uses artificial intelligence to summarise funder guidelines and, on request, help you refine and improve the answers you write to application questions. You write every answer yourself — the AI does not generate answers from scratch. This is designed to support your writing — not to replace your judgement.

Before any AI-generated content is saved to your application, you are asked to confirm that:

- It accurately describes your charity and project
- All figures, dates, and facts are correct
- It answers the question that was asked

**You are responsible for all content you submit in a grant application.** You write every answer. If you ask for help, Grant Pathway suggests an improved version of what you have already written — it does not create an answer from nothing. You decide whether to use the suggestion, edit it, or discard it entirely. We do not review your applications. We do not submit applications on your behalf. We are not a fact checker of the data you submit with a grant application.

The AI features are powered by the Anthropic Claude model, accessed via Amazon Web Services' Bedrock service (eu-west-2, London). When you request a summary, or ask for help improving an answer you have written, the relevant content from your funder guidelines and organisation profile is processed within UK and European Economic Area infrastructure. Please see our **Privacy Policy** for full details of how your data is handled in this process.

### No Guarantee of Funding Success

We make no representation that using Grant Pathway will result in a successful grant application. Funding decisions rest entirely with the relevant funder.

---

## 6. Fair Use

Grant Pathway is free to use to those who meet our criteria above for use. To manage the running costs of the AI features and ensure fair access for all users, each account is subject to a **fair-use limit of 50 AI-assisted requests per calendar month**.

This limit is intended to accommodate the realistic needs of a small charity writing grant applications throughout the year. The limit resets at the start of each calendar month.

If you believe the limit is preventing you from using the service reasonably, please contact us at **admin@rapidglobe.com**.

---

## 7. Your Content and Data

You retain ownership including all intellectual property rights of all content you create or upload through Grant Pathway — including your organisation profile, any funder guidelines you upload, and the application content on which you work.

By using the service, you grant RapidGlobe Ltd a limited, non-exclusive licence to store, process, and use that content solely to provide the service to you. This licence ends when you delete the relevant content or close your account.

We do not use your content to train artificial intelligence models. We do not share it with third parties for commercial purposes.

For full details of how we handle your data, please read our **Privacy Policy**.

---

## 8. Intellectual Property

Grant Pathway's source code is proprietary and closed source. It is protected by copyright and other intellectual property rights. All rights are reserved by RapidGlobe Ltd. The source code is not publicly available and may not be used, copied, modified, or distributed without our prior written permission.

The Grant Pathway name, logo, and brand materials are owned by RapidGlobe Ltd. You may not use them without our prior written permission.

---

## 9. Availability and Changes to the Service

We aim to keep Grant Pathway available at all times, but we do not guarantee uninterrupted access. The service may be temporarily unavailable due to planned maintenance, technical issues, or circumstances outside our control.

We maintain operational backup infrastructure (automated daily database backups) as a safeguard against technical failures, security incidents, and provider outages. This is an internal operational measure. It does not constitute a guarantee that data can or will be recovered in any particular circumstance, and it does not entitle users to request restoration of previously deleted or lost data. You may want to store separately copies of all material you plan to upload or upload using Grant Pathway.

We reserve the right to:

- Modify, update, or remove features of the service at any time
- Suspend the service temporarily for maintenance or technical reasons
- Discontinue the service entirely

If we decide to discontinue the service permanently, we will give reasonable advance notice and ensure that users have the opportunity to export their data before the service closes.

---

## 10. Limitation of Liability

Grant Pathway is provided free of charge and on an "as is" basis. To the fullest extent permitted by applicable law, RapidGlobe Ltd excludes all warranties, express or implied, including any warranty that the service will be uninterrupted, error-free, or that AI-generated content will be accurate or suitable for any particular purpose.

To the fullest extent permitted by law, RapidGlobe Ltd shall not be liable for:

- Loss of funding or missed grant opportunities arising from use of the service
- Errors, inaccuracies, or omissions in AI-generated content
- Loss or corruption of data (other than where caused by our negligence)
- Any indirect, special, consequential, or incidental loss arising from your use of, or inability to use, the service

Nothing in these terms excludes or limits our liability for:

- Death or personal injury caused by our negligence
- Fraud or fraudulent misrepresentation
- Any other liability that cannot lawfully be excluded or limited

Because the service is provided free of charge, these limitations reflect a fair allocation of risk between us.

---

## 11. Suspension and Termination

**You** may close your account at any time from within the service. Closure is immediate and all associated data will be permanently deleted from our live systems. Automated backup copies are permanently removed within 7 days as part of standard backup rotation.

**We** may suspend or terminate your account if:

- You breach any of these terms
- We reasonably believe your account is being used fraudulently, abusively, or in a way that may harm other users or the service
- We are required to do so by law

Where we suspend or terminate your account for a breach, we will inform you unless we are legally prevented from doing so. Where possible, we will give you the opportunity to export your data before termination takes effect.

Accounts that have not been used for two years are subject to our inactivity deletion policy. Please see our **Privacy Policy** for details.

---

## 12. Changes to These Terms

We may update these terms from time to time. If we make significant changes, we will notify you by email at least 14 days before the changes take effect. Continued use of the service after the effective date of any change constitutes your acceptance of the updated terms.

If you do not agree to the updated terms, you should stop using the service and delete your account before the changes take effect.

The "Last updated" date at the top of this page tells you when the terms were most recently changed.

---

## 13. Governing Law

These Terms of Service are governed by the laws of England and Wales. Any dispute arising from or in connection with your use of Grant Pathway will be subject to the exclusive jurisdiction of the courts of England and Wales.

---

## 14. Contact and Notices

For any questions about these terms or formal notices, please contact us:

**Email:** admin@rapidglobe.com

**Post:** RapidGlobe Ltd, Ground Floor Suite, Crown House, 40 North Street, Hornchurch, Essex RM11 1EW

We will contact you on the email address you have provided to us.

---

## 15. General

If any provision of these Terms of Service is held to be void it will be severed and the remaining terms continue. These Terms and the Privacy Policy are the entire agreement between us. Any failure or delay in enforcing these terms will not waive our rights to do so. You may not assign this agreement from one charity to another. No rights are given to third parties in these Terms whether under the Contracts (Rights of Third Parties) Act 1999 or otherwise. You must not supply or use any personal data to us or using the service to which you do not have a lawful basis to do so under UK GDPR and the Data Protection Act 2018. You must keep confidential and only use for the purposes of your use of the service any business, product information, technical and financial information which is not in the public domain and other confidential information of ours.

---

_Grant Pathway is provided by RapidGlobe Ltd (company number 05615649), registered in England and Wales._

_Version: 1.6_
_Effective date: 7 August 2026_
_Last updated: 7 August 2026_
