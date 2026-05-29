# Technology Stack — AI Grant Accelerator v1
**Version:** 1.1

This document captures the agreed technology stack for the v1 build. These decisions inform the BRD and constrain the technical architecture.

---

## TS-01 — Programming Language & Framework

| Decision | Choice |
|----------|--------|
| Framework | Next.js |
| Language | TypeScript |

**Rationale:**
Next.js is a full-stack React framework — it handles both the user interface and server-side logic (API calls to Amazon Bedrock for Claude AI, Charity Commission lookups, database operations) within a single codebase. TypeScript is a typed superset of JavaScript that makes the codebase more self-documenting, directly supporting the open and documented codebase requirement (C18) and future handover to a successor organisation (DR-BM-002).

**Key benefits for this project:**
- Single codebase covers both frontend and backend — less to manage as a solo developer (C4)
- Both the Anthropic SDK and the AWS SDK support Amazon Bedrock integration in TypeScript
- Excellent accessible component libraries available (e.g. shadcn/ui built on Radix UI) supporting WCAG 2.2 AA compliance (C15)
- Deploys to any Node.js host including UK-region cloud platforms (C13)
- Largest web framework community — future maintainers or successor organisations are likely to know it

---

## TS-02 — Database

| Decision | Choice |
|----------|--------|
| Platform | Supabase |
| Database engine | PostgreSQL |
| Region | London (UK) |

**Rationale:**
Supabase is a managed platform built on PostgreSQL — the industry-standard open source relational database. Hosting in the London region satisfies the UK-region data storage requirement (C13, DR-DP-002). Supabase is the natural complement to Next.js and consolidates database, authentication, and file storage into a single platform, reducing complexity for a solo developer.

**Included in Supabase:**
- Managed PostgreSQL database with automatic backups
- Row Level Security — database-level enforcement of which user can access which charity's data
- Authentication (see TS-03)
- File storage — for uploaded funder guidelines
- Free tier sufficient for v1 usage volumes (NFR-03)

---

## TS-03 — Authentication Provider

| Decision | Choice |
|----------|--------|
| Provider | Supabase Auth (included in Supabase platform) |

**Rationale:**
Supabase Auth is included within the Supabase platform at no additional cost, eliminating the need for a separate authentication service. It integrates natively with the Supabase database via Row Level Security, ensuring that authentication and data access controls are enforced at the database level.

**Features:**
- Email and password login
- Magic link (passwordless) login
- Password reset — built in
- Optional MFA — available as opt-in, not mandatory in v1 (NFR-04)
- Account deletion — full user and data removal supported (DR-DP-003)

---

## TS-04 — Hosting Platform

| Layer | Platform | Region |
|-------|----------|--------|
| Application (Next.js) | Vercel | Global edge network |
| Data (database, auth, file storage) | Supabase | London, UK |

**Rationale:**
Vercel is built by the same team as Next.js — deployment is a single command and auto-scaling is handled automatically, requiring no infrastructure management from the developer. All charity data is stored exclusively in Supabase London, satisfying the UK-region data storage requirement (C13, DR-DP-002). Vercel's compute layer processes requests but holds no persistent data. The Privacy Policy will note that the application layer uses a global delivery network while all data is stored in UK region.

**Fallback:** If the UK data residency interpretation requires the compute layer to also be UK-hosted, AWS eu-west-2 (London) is the alternative hosting platform for the Next.js application. Both AWS and Azure cloud accounts are already in place (see TS-05).

---

## TS-05 — Existing Infrastructure & Accounts

### Available

| Item | Status | Notes |
|------|--------|-------|
| Domain name | ✅ Registered | **Grantpathway.org.uk** |
| AWS cloud account | ✅ Exists | Verify access and credentials before development starts |
| Azure cloud account | ✅ Exists | Verify access and credentials before development starts |
| VS Code | ✅ Installed | Primary development environment |

### To Be Set Up Before Development Begins

| Item | Action Required | Priority |
|------|----------------|----------|
| Amazon Bedrock Claude access | Enable Claude Sonnet 4.6 model access in AWS console (eu-west-2); configure IAM permissions for Bedrock inference | High — required for AI features |
| GitHub account | Create account at github.com; set up public repository for the project | High — required for open source licence (C17) and codebase continuity (C18) |
| Supabase account | Sign up at supabase.com; create project in London region | High — required for database and auth |
| Vercel account | Sign up at vercel.com; link to GitHub account | High — required for deployment |

### Notes on Domain

The domain **Grantpathway.org.uk** has been registered and is likely to inform the official product name (see App Name & Branding — checklist item 41). Once hosting is confirmed on Vercel, DNS records for Grantpathway.org.uk should be pointed to the Vercel deployment.

---

## Stack Summary

| Concern | Technology |
|---------|-----------|
| Language | TypeScript |
| Framework | Next.js |
| Database | PostgreSQL via Supabase (London) |
| Authentication | Supabase Auth |
| File storage | Supabase Storage (London) |
| App hosting | Vercel |
| AI API | Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2) |
| Charity register | Charity Commission for England and Wales public API |
| Source control | GitHub (public repository) |
| Development environment | VS Code |
| Domain | Grantpathway.org.uk |

---

## Checklist Coverage

| Checklist Item | Description | Status |
|---------------|-------------|--------|
| Item 36 | Preferred programming language and framework | Covered by TS-01 |
| Item 37 | Database preference | Covered by TS-02 |
| Item 38 | Hosting platform — UK region | Covered by TS-04 |
| Item 39 | Authentication provider | Covered by TS-03 |
| Item 40 | Existing infrastructure, accounts and tooling | Covered by TS-05 |

---

---

## Document History

| Version | Date | Author | Summary of changes |
|---------|------|--------|--------------------|
| 1.0 | 2026-04-13 | Rapidglobe Ltd | Initial version |
| 1.1 | 2026-05-29 | Rapidglobe Ltd | Document history table added to support multi-contributor development |
