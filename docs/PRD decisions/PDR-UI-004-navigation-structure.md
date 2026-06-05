---
id: PDR-UI-004
category: User Interface & Experience
status: Decided
---

# PDR-UI-004 — Navigation Structure

## Question

What are the main pages and navigation structure of the Grant Pathway application?

## Context

The navigation structure defines the top-level pages a user can access and how they move between them. It must cover all use cases (UC-01 to UC-15) while remaining simple enough for non-technical users like Margaret to navigate without confusion. Key areas that need a home in the navigation include: the dashboard (saved applications), starting a new application, the charity profile, and account settings. The structure also affects the URL design, breadcrumb navigation, and how the application handles back/forward browser navigation. Getting this right early prevents costly restructuring later in the build.

## Options

The navigation structure is defined by the functional requirements and use cases rather than discrete alternatives. The structure below was proposed and accepted, subject to revision following user testing.

## Decision

**Adopted navigation structure as proposed below. Subject to revision following downstream testing.**

### Public pages (unauthenticated)

| Page              | URL                | Purpose                              |
| ----------------- | ------------------ | ------------------------------------ |
| Landing / Sign in | `/`                | Login form with link to register     |
| Register          | `/register`        | New account creation                 |
| Verify email      | `/verify-email`    | Post-registration email confirmation |
| Forgot password   | `/forgot-password` | Password reset request               |

### Authenticated pages (logged-in users)

| Page                 | URL                  | Purpose                                       |
| -------------------- | -------------------- | --------------------------------------------- |
| Dashboard            | `/dashboard`         | All saved applications; start new application |
| New application      | `/applications/new`  | Step 1 of application flow                    |
| Application (active) | `/applications/[id]` | Continue or edit an in-progress application   |
| Charity profile      | `/profile`           | View and edit charity details                 |
| Account settings     | `/account`           | Change password, delete account               |

### Navigation bar (authenticated)

- **Grant Pathway logo** (left) — links to `/dashboard`
- **My Applications** — links to `/dashboard`
- **Charity Profile** — links to `/profile`
- **Account** (right, user email or initials) — dropdown: Account Settings / Sign Out

### Application flow

The multi-step application journey (guideline input → AI summary → draft generation → review → approve → export) is contained within `/applications/[id]` as a stepped flow. It is not exposed as separate top-level navigation pages, keeping the navigation clean and the user focused on one task at a time.

## Rationale

The structure is derived directly from the functional requirements (FR-01 to FR-43) and use cases (UC-01 to UC-15). Public pages cover authentication and onboarding. Authenticated pages cover all post-login user journeys. The navigation bar is deliberately minimal — three items plus account — to avoid overwhelming non-technical users such as the Margaret persona. The application flow is contained within a single route to maintain user focus and simplify breadcrumb and back-navigation handling. This structure will be validated during testing and adjusted if usability issues are identified.

## Date Decided

2026-04-16
