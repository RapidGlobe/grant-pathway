---
id: DR-DP-002
category: Data & Privacy
status: Decided
supersedes: 2026-04-09 decision
---

# DR-DP-002 — Data Hosting Location

## Question

Where will the app's data be hosted, and must it remain within the UK?

## Context

UK GDPR requires that personal data transferred outside the UK is only sent to countries with adequate data protection. Many cloud providers (AWS, Azure, GCP) offer UK-region data centres. Hosting in the UK (or EEA) simplifies compliance and may be a requirement for charity sector trust. However, UK-only hosting may increase cost or limit provider choice. This decision covers both the app's own database and the AI inference layer, as data sent to AI APIs may leave the UK.

## Options

- **Option A: UK-only hosting** — All data stored and processed within UK data centres; AI API calls also restricted to UK endpoints
- **Option B: UK-preferred** — UK hosting used where available; EU/EEA fallback acceptable with appropriate safeguards
- **Option C: No geographic restriction** — Use the most cost-effective and reliable hosting regardless of location; ensure GDPR compliance through contractual mechanisms only
- **Option D: User's choice** — Allow charities to select their preferred data region

## Decision

**Option B: UK-primary with EU/EEA fallback** — All app data (charity profiles, application history) will be stored in UK-region cloud infrastructure. AI inference via Amazon Bedrock will use In-Region routing within AWS eu-west-2 (London) as the primary configuration. In the event of a capacity or availability issue requiring a fallback, data may be processed within the EU geographic region, covering up to 7 AWS regions as determined by Amazon Web Services, all of which are within the EEA and covered by UK adequacy decisions. Data will never be transferred outside the EU/EEA.

## Rationale

UK charities will ask where their data is stored and processed, and "in the UK" is the clearest and most trustworthy answer. AWS eu-west-2 (London) supports In-Region routing for Claude Sonnet 4.6, meaning AI inference requests are processed strictly within the UK under normal operating conditions.

The EU/EEA fallback position is legally sound. The UK has granted full adequacy to all 30 EU/EEA countries (all 27 EU Member States plus Iceland, Liechtenstein, and Norway) effective December 2020. Data processed within the EU Geo routing pool — Frankfurt, Stockholm, Milan, Spain, Ireland, London, Paris — therefore requires no additional transfer mechanism such as Standard Contractual Clauses or a Data Processing Agreement with the AI provider. The fallback destination within that pool is determined by AWS based on capacity and performance; the application has no control over the specific region chosen within the EU pool.

This approach removes the pre-launch legal actions required under the previous decision (Anthropic DPA and SCCs), simplifies the privacy policy, and enables a clean and honest statement to charities: their data is processed in the UK under normal conditions and never transferred outside the EU/EEA under any conditions.

## Change from Previous Decision (2026-04-09)

The original decision used the Anthropic Claude API directly, which processes requests on US infrastructure. That arrangement required an Anthropic Data Processing Agreement and Standard Contractual Clauses to be executed before launch, and required the US transfer to be disclosed in the privacy policy.

This decision supersedes that arrangement. By routing AI inference through Amazon Bedrock (eu-west-2, In-Region), no international transfer outside the EU/EEA occurs. The DPA and SCC requirement with Anthropic is removed. The privacy policy statement simplifies from "AI processing occurs on US servers under contractual safeguards" to "data is processed within the UK/EEA and never leaves the EU/EEA."

## Pre-Launch Actions Required

- Confirm AWS eu-west-2 In-Region routing is correctly configured for Claude Sonnet 4.6 (`anthropic.claude-sonnet-4-6`) before go-live
- Confirm EU Geo fallback inference ID (`eu.anthropic.claude-sonnet-4-6`) is configured and tested
- Reflect the UK-primary / EU-fallback arrangement clearly in the app's privacy policy
- No Anthropic DPA or SCCs required (supersedes previous pre-launch action)

## Date Decided

2026-05-07
