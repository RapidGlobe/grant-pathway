# Non-Functional Requirements — Grant Pathway v1

**Tier:** 2 — Check if relevant to the task
**Volatility:** Medium
**Update when:** Any change to performance targets, availability, scalability, security, browser support, or accessibility approach

This document captures the agreed non-functional requirements for the v1 build. These inform the BRD and constrain the technical architecture and hosting choices.

---

## NFR-01 — Performance

| Metric                                                           | Target           |
| ---------------------------------------------------------------- | ---------------- |
| Page loads and navigation                                        | Under 3 seconds  |
| AI guideline summarisation — standard documents (up to ~8 pages) | Under 30 seconds |
| AI guideline summarisation — large documents (over 8 pages)      | Under 45 seconds |
| AI answer refine (per question)                                  | Under 15 seconds |

**Notes:** Grant writing is not a real-time task. Users will tolerate a short wait for AI summary generation and for AI-assisted refinement provided a clear progress indicator is shown. These targets are based on Amazon Bedrock Claude API performance observed during funder test cycles (2026-06-01 to 2026-06-04).

**Performance evidence from funder testing (2026-06-04):**

- LBF Specialist Programme (Word form, ~10 pages): 24 seconds ✅
- Walton Charity (PDF, 4 pages): 25 seconds ✅
- Garfield Weston Foundation (PDF, 11 pages): 33–37 seconds ✅ (under 45s target for large docs)
- Clothworkers' Foundation (PDF, multi-form): 40–47 seconds — approaches the large-document limit; performance improvement recommended before go-live

**Pre-launch recommendation:** The Clothworkers multi-form PDF reaching 40–47 seconds is close to the upper limit. Investigate document pre-processing or streaming responses before go-live to ensure consistent performance across all funder types.

**Vercel function region (2026-05-29):** Vercel function region was set to London (eu-west-2 / lhr1) to match AWS Bedrock (eu-west-2). This eliminates the transatlantic round trip that previously occurred with the default iad1 (Virginia) region, reducing AI call latency and lowering timeout risk on large guideline documents.

---

## NFR-02 — Availability

| Metric                  | Target    |
| ----------------------- | --------- |
| Uptime target           | 99.5%     |
| Maximum annual downtime | ~44 hours |

**Notes:** 99.5% is achievable for a solo developer using managed cloud hosting without requiring complex on-call infrastructure. 99.9% is not considered realistic for a solo build at this stage. Planned maintenance windows should be communicated to users in advance where possible.

---

## NFR-03 — Scalability

| Phase                               | Expected Concurrent Users |
| ----------------------------------- | ------------------------- |
| At launch                           | ~10                       |
| At scale (12–18 months post-launch) | ~100                      |

**Notes:** The architecture should be designed to scale from launch figures to the 12–18 month target without requiring a major rebuild. Managed cloud services (auto-scaling hosting, managed database) are preferred over self-managed infrastructure to keep operational overhead low for a solo developer.

**Concurrent AI generation behaviour (capacity plan — 2026-06-08):**

Each user has their own per-minute rate limit (5 AI calls / 60 seconds via Upstash Redis). There is no global rate limit across users. Expected behaviour at each scale tier:

| Tier                  | Concurrent AI calls                  | Expected outcome                                                                                                                                         |
| --------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| At launch (~10 users) | Up to 10 simultaneous Bedrock calls  | All succeed; each takes 20–45s independently; no cross-user interference                                                                                 |
| At scale (~100 users) | Up to 100 simultaneous Bedrock calls | Bedrock handles this comfortably; transient 429s handled by `withRetry()`; Supabase connection pool (pgbouncer) absorbs the read/write load              |
| Stress scenario       | >100 simultaneous Bedrock calls      | Bedrock may throttle individual users (429); `withRetry()` handles with 1s/3s backoff; Vercel auto-scales function instances; no single point of failure |

The main risk before the first marketing push is unmeasured AI route latency under concurrent load. Structured latency logging added to all three AI routes (2026-06-08, GAP-27 partial) will provide baseline data. Sentry performance monitoring to be configured at P5.4 once production traffic baseline is established.

---

## NFR-04 — Security

| Control                           | Requirement                                                                                                                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Encryption in transit             | TLS 1.2 or higher (HTTPS everywhere); no unencrypted HTTP connections permitted                                                                                                                                                 |
| Encryption at rest                | Database-level encryption enabled on all data stores                                                                                                                                                                            |
| Passwords                         | Minimum 12 characters; must contain both letters and digits (hardened 2026-06-29 following pre-launch security review)                                                                                                          |
| Multi-factor authentication (MFA) | Not offered. Removed 2026-06-12 (FR-07 demoted to Won't Have). Risk analysis confirmed worst-case password compromise is low severity — no payment data, no submission capability, charity profile data is publicly registered. |
| Session timeout                   | Automatic logout after 60 minutes of inactivity                                                                                                                                                                                 |
| Security baseline                 | OWASP Top 10 used as the standard checklist for web application security                                                                                                                                                        |
| Secrets management                | No credentials, API keys, or secrets committed to the public repository (aligned with C17 — MIT open source licence)                                                                                                            |

**Notes:** MFA removed 2026-06-12. The OWASP Top 10 provides a practical, well-recognised baseline for a solo developer.

---

## NFR-05 — Browser and Device Support

| Category             | Supported                             |
| -------------------- | ------------------------------------- |
| Desktop browsers     | Google Chrome (latest 2 versions)     |
|                      | Microsoft Edge (latest 2 versions)    |
|                      | Mozilla Firefox (latest 2 versions)   |
|                      | Apple Safari (latest 2 versions)      |
| Mobile browsers      | Chrome on Android                     |
|                      | Safari on iOS                         |
| Minimum screen width | 320px (small mobile) and above        |
| Internet Explorer    | Not supported (end-of-life June 2022) |

**Notes:** The application is designed desktop-primary (PDR-UI-003). It must remain usable on mobile browsers (C16) as a byproduct of responsive layout, but no active mobile optimisation is undertaken in v1. Full mobile optimisation is deferred to a future phase if user feedback supports demand. Chrome and Edge cover the majority of UK charity workers. Safari is required for iPhone users. Internet Explorer 11 is not supported — supporting it would add significant development cost for negligible benefit given its retirement.

---

## NFR-06 — Accessibility Testing Approach

WCAG 2.2 Level AA compliance is a design-in requirement from day one (C15). An independent accessibility audit is deferred to a pre-scaling milestone (DR-LC-003). The following testing approach applies for v1:

| Stage                     | Method                                               | Tool                                                                      |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| During development        | Automated accessibility scanning on every new screen | axe DevTools browser extension (free) or Lighthouse in Chrome DevTools    |
| During development        | Keyboard-only navigation testing                     | Manual — tab through every screen without using a mouse                   |
| During development        | Screen reader testing                                | NVDA (free) with Chrome on Windows                                        |
| Pre-launch                | Manual WCAG 2.2 AA checklist review                  | Work through all Level AA success criteria against each screen            |
| Pre-launch                | Colour contrast verification                         | WebAIM Contrast Checker (free, online tool)                               |
| Pre/post-launch           | Assistive technology expert review                   | Engaged via trusted contact — professional AT expertise (see note below)  |
| Post-launch / pre-scaling | Independent accessibility audit                      | Deferred — triggered when the user base justifies formal audit investment |

**Notes:** Accessibility is not a retrofit — it must be considered at the design and build stage of every screen. The combination of automated scanning, keyboard testing, and screen reader testing provides a practical and cost-effective approach for a solo developer. The deferred independent audit provides a formal assurance milestone before the app scales significantly.

**Screen reader / AT testing (updated 2026-06-07):** NVDA/VoiceOver testing will not be self-conducted by the developer. A trusted contact with professional assistive technology expertise will be engaged to review the live service at an appropriate point. This provides more reliable real-world coverage than a developer-led screen reader test, and is a stronger signal of genuine WCAG compliance.

---

## Checklist Coverage

| Checklist Item | Description                                          | Status            |
| -------------- | ---------------------------------------------------- | ----------------- |
| Item 30        | Performance — acceptable AI response time            | Covered by NFR-01 |
| Item 31        | Availability — uptime target                         | Covered by NFR-02 |
| Item 32        | Scalability — concurrent users at launch vs at scale | Covered by NFR-03 |
| Item 33        | Security — encryption, MFA, session management       | Covered by NFR-04 |
| Item 34        | Browser and device support                           | Covered by NFR-05 |
| Item 35        | Accessibility testing approach                       | Covered by NFR-06 |

---

_Last updated: 2026-06-30_
_Sources: BRD Information Gathering Checklist items 30–35; constraints-and-assumptions.md (C15, C16, C17); DR-LC-003; PDR-UI-003 (desktop-primary decision)_
