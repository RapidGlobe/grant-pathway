# Non-Functional Requirements — Grant Pathway v1

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

---

## NFR-04 — Security

| Control                           | Requirement                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Encryption in transit             | TLS 1.2 or higher (HTTPS everywhere); no unencrypted HTTP connections permitted                                      |
| Encryption at rest                | Database-level encryption enabled on all data stores                                                                 |
| Passwords                         | Minimum 10 characters; no mandatory complexity rules (aligned with NCSC guidance)                                    |
| Multi-factor authentication (MFA) | Available as an option; not mandatory in v1 to avoid creating a barrier for non-technical users                      |
| Session timeout                   | Automatic logout after 60 minutes of inactivity                                                                      |
| Security baseline                 | OWASP Top 10 used as the standard checklist for web application security                                             |
| Secrets management                | No credentials, API keys, or secrets committed to the public repository (aligned with C17 — MIT open source licence) |

**Notes:** Mandatory MFA would create unnecessary friction for volunteer users with limited technical confidence (e.g. primary persona Margaret). MFA will be offered as an opt-in feature and may be made mandatory in a future phase. The OWASP Top 10 provides a practical, well-recognised baseline for a solo developer.

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
| Post-launch / pre-scaling | Independent accessibility audit                      | Deferred — triggered when the user base justifies formal audit investment |

**Notes:** Accessibility is not a retrofit — it must be considered at the design and build stage of every screen. The combination of automated scanning, keyboard testing, and screen reader testing provides a practical and cost-effective approach for a solo developer. The deferred independent audit provides a formal assurance milestone before the app scales significantly.

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

_Last updated: 2026-06-04_
_Sources: BRD Information Gathering Checklist items 30–35; constraints-and-assumptions.md (C15, C16, C17); DR-LC-003; PDR-UI-003 (desktop-primary decision)_
