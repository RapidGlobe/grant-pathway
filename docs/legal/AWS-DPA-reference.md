# AWS Data Processing Addendum (DPA) — Reference

## What this is

The AWS Data Processing Addendum (DPA) is the contractual agreement under which AWS commits to GDPR-compliant handling of customer data. It is incorporated directly into the **AWS Service Terms** and applies automatically to all AWS customers who use AWS services to process personal data — no separate acceptance is required.

The full whitepaper is stored alongside this file: `AWS-navigating-gdpr-compliance.pdf`  
Live source: https://docs.aws.amazon.com/whitepapers/latest/navigating-gdpr-compliance/aws-data-processing-addendum-dpa.html

## Relevance to Grant Pathway

Grant Pathway processes charity application data through Amazon Bedrock (eu-west-2). The AWS DPA is the operative legal mechanism confirming that:

- AWS does not use customer data to train, fine-tune, or improve its own or third-party AI models
- Customer data processed via Bedrock is not retained by AWS beyond the request/response cycle
- Strengthened commitments (February 2021 Supplementary Addendum) apply automatically — no opt-in required

This satisfies the commitment made in **DR-DP-003** (charity data never used for AI training) via the AWS contractual relationship, without requiring a separate Anthropic DPA.

## Key commitments (Supplementary Addendum, February 2021)

- Redirecting governmental requests for customer data directly to customers wherever possible
- Promptly notifying customers if AWS is compelled to disclose data (unless prohibited by law)
- Actively challenging governmental requests that are overly broad or conflict with EU/UK law
- Disclosing only the minimal amount of customer data when legally compelled

## Confirmed checks — 2026-06-22

| Check                                   | Result                                                      | Confirmed by                          |
| --------------------------------------- | ----------------------------------------------------------- | ------------------------------------- |
| Model invocation logging (eu-west-2)    | **Disabled** — prompts and responses not captured           | WJ — AWS Bedrock Console screenshot   |
| AWS DPA in force for RapidGlobe account | **Yes** — automatically incorporated into AWS Service Terms | WJ — AWS Agreements page + whitepaper |

## Related documents

- `docs/decisions/DR-DP-003-data-ownership.md` — charity data ownership and no-training commitment
- `docs/decisions/DR-DP-002-data-hosting.md` — data hosting location and Bedrock eu-west-2 decision
- `docs/Technical Decision and Design/ADR-AI-001-ai-provider.md` — Bedrock provider decision
