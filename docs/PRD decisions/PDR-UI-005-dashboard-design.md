---
id: PDR-UI-005
category: User Interface & Experience
status: Decided
---

# PDR-UI-005 — Dashboard Design

## Question

What does a user see on their dashboard when they log in, and how is it laid out?

## Context

The dashboard is the first screen a logged-in user sees. For a first-time user it needs to guide them clearly towards setting up their charity profile and starting their first application. For a returning user like David it needs to show their saved applications clearly, with quick access to continue or start new work. The dashboard is the most important screen in the application — it sets the tone for the entire user experience and directly influences whether users return. It must work well for both empty state (new user, no applications yet) and populated state (returning user with multiple applications).

## Options

- **Option A — Cards layout:** Each application displayed as a card in a grid or column. Clean and visual but no summary context.
- **Option B — Table/list layout:** Applications in a table with columns for name, status, date, and actions. Information-dense but less approachable for non-technical users.
- **Option C — Cards with a summary strip:** Application cards plus a small summary strip at the top showing total applications and any requiring attention. Balances warmth for new users with efficiency for returning users.

## Decision

**Option C — Cards with a summary strip.**

### Empty state (new user, no applications)

- Welcome message: _"Welcome to Grant Pathway, [name]"_
- Prompt to complete charity profile if incomplete, with a **Set up charity profile** button
- **Start your first application** button (greyed out with tooltip if profile not yet complete)
- Brief three-step explainer: _Add funder guidelines → Get an AI summary → Write your answers_

### Populated state (returning user)

- Summary strip showing total application count and any drafts in progress requiring attention
- **"My Applications"** heading with **+ New Application** button (top right)
- Application cards, each displaying:
  - Funder name and grant name
  - Current status (e.g. _Draft in progress_, _Approved_, _Exported_)
  - Date last updated
  - Actions: **Continue**, **Delete**
- Cards sorted by most recently updated first
- Charity profile completion banner shown if profile is incomplete

This screen is identified as one of the 6 key screens requiring a low-fidelity wireframe sketch before coding begins (PDR-UI-002).

## Rationale

Option C serves both primary personas well. For Margaret (new, less confident user) the empty state provides clear guidance without overwhelming her. For David (returning user managing multiple applications) the summary strip and card layout give a fast, scannable overview. Cards are more approachable than a table for non-technical users, and the summary strip adds just enough at-a-glance information to make the dashboard useful without cluttering it.

## Date Decided

2026-04-16
