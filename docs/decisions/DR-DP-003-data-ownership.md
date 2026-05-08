---
id: DR-DP-003
category: Data & Privacy
status: Decided
last-reviewed: 2026-05-07
---

# DR-DP-003 — Charity Data Ownership and AI Training Use

## Question

Who owns the data charities input into the app, and can it be used to train or improve AI models?

## Context

Charities may input sensitive information about their organisation, beneficiaries, finances, and strategy. It must be unambiguous that this data belongs to the charity and is not used without consent. Using charity data to train or fine-tune AI models could improve the product but raises serious consent and trust issues. This decision affects the Terms of Service, privacy policy, and the AI provider agreement. Many charities will ask this question directly before adopting the tool.

## Options

- **Option A: Charities own all data; no AI training use** — Data is never used to train, fine-tune, or improve any AI model; this is a hard contractual commitment
- **Option B: Charities own data; aggregate/anonymised use permitted** — Anonymised, aggregated insights may be used to improve the product, but no identifiable data is used for training
- **Option C: Opt-in AI training** — Charities can choose to allow their data to contribute to model improvement in exchange for a benefit (e.g. enhanced features)
- **Option D: Charities own data; AI provider terms apply** — Data ownership is clear but training use depends on the AI provider's current data policies

## Decision

**Option A: Charities own all data; no AI training use — ever** — All data inputted by charities belongs solely to them. It will never be used to train, fine-tune, or improve any AI model by the app operator or any third party. Charities retain the right to export and delete all their data at any time.

## Rationale

For a donated tool built for the charity sector, this is the only answer fully consistent with the app's ethos. Charities must be able to use the app with complete confidence that their organisational information and application content will never be used for AI training purposes.

Anthropic does not use customer data for model training by default when its models are accessed via Amazon Bedrock. This commitment is upheld through the AWS Data Processing Agreement and Anthropic's model terms as applied through the Bedrock service. No separate Anthropic DPA is required — the Bedrock arrangement is the operative data processing framework (see DR-DP-002 and DR-AI-002).

This commitment will be stated plainly and prominently in the privacy policy — not buried in legal language — as a clear trust signal to the sector.

## Review Note (2026-05-07)

The original decision (2026-04-09) referenced the Anthropic DPA as the contractual mechanism for locking in the no-training commitment. Following the change to Amazon Bedrock as the AI inference layer (DR-AI-002, DR-DP-002), the Anthropic DPA is no longer the operative instrument. The no-training commitment and the substance of this decision are unchanged; only the contractual mechanism through which it is enforced has been updated.

## Date Decided

2026-04-09

## Last Reviewed

2026-05-07
