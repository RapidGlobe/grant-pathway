# Success Metrics — Grant Pathway v1

This document defines the measurable KPIs for Grant Pathway v1. Targets are indicative — they provide a baseline for evaluating whether the product is delivering value post-launch and will be reviewed and revised once real usage data is available.

---

## 1. Acquisition — Are people finding and registering?

| Metric                            | Indicative target | Notes                                                                  |
| --------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| Registered users — end of month 1 | 10                | Initial growth driven by developer's personal and professional network |
| Registered users — end of month 2 | 40                | Early word of mouth within the charity sector                          |
| Registered users — end of month 3 | 90                | Sustained organic growth; no paid marketing assumed                    |

_Targets to be reviewed at month 3 and revised for month 6 onward based on actual growth data._

---

## 2. Activation — Are registered users actually using it?

| Metric                                                    | Indicative target | Notes                                                                          |
| --------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| % of registered users who complete their charity profile  | 70%               | Profile completion is required to proceed; drop-off reflects genuine browsers  |
| % of registered users who create at least one application | 50%               | Accounts for users who register to explore but do not commit to an application |

---

## 3. Completion — Are users finishing what they start?

| Metric                                               | Indicative target | Notes                                                     |
| ---------------------------------------------------- | ----------------- | --------------------------------------------------------- |
| % of created applications that reach Exported status | 55%               | Accounts for abandoned and in-progress applications       |
| Total Word documents exported by end of month 6      | 100               | Represents real, tangible value delivered to UK charities |

_The export completion rate is the single most important product metric — it confirms the full user journey is working end to end._

---

## 4. Retention — Are users coming back?

| Metric                                          | Indicative target | Notes                                                                         |
| ----------------------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| % of users who log in more than once            | 50%               | Grant writing is seasonal; low return rates do not necessarily signal failure |
| % of users who create more than one application | 30%               | Reflects users who trust the tool for repeat grant writing                    |

---

## 5. Operational — Is the service sustainable?

| Metric                                        | Indicative target | Notes                                                                                                                                                               |
| --------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monthly AI API spend                          | Within £100/month | Primary cost constraint (C1); monitored via Amazon Bedrock / AWS console                                                                                            |
| Average AI requests per active user per month | Fewer than 10     | Well within the 50-request per user monthly limit (PDR-AI-005) _(corrected 2026-07-10, was 20 -- the cap was raised 2026-06-17, see PDR-AI-005's Revision History)_ |

---

## 6. User Feedback — Are users satisfied?

| Metric                                                                      | Indicative target | Notes                                                                   |
| --------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------- |
| % of interviewed users who would recommend Grant Pathway to another charity | 80%               | Applies to users who opt in to feedback interviews (FR-08, Should Have) |

_If FR-08 is not implemented in v1, this metric is deferred to the first phase in which feedback interviews are introduced._

---

## Measurement Approach

| Metric category          | How measured                                                                                                                                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acquisition & activation | Supabase user records and profile/application creation timestamps                                                                                                                                                                                                                              |
| Completion & retention   | Application status records and login history in Supabase                                                                                                                                                                                                                                       |
| Operational              | Amazon Bedrock / AWS console spend; `ai_usage` table in Supabase (PDR-AI-005) _(corrected 2026-07-10, was "Anthropic API dashboard" -- stale since the 2026-05-07 Bedrock migration; inconsistent with this document's own Operational section above, which already said Bedrock/AWS console)_ |
| User feedback            | Manual — notes from opt-in feedback interviews (FR-08)                                                                                                                                                                                                                                         |

_No third-party analytics platform (e.g. Google Analytics) is included in v1 scope. All metrics are derived from existing Supabase data._

---

## Review Cadence

| Review point   | Action                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| End of month 1 | Check acquisition against target; assess whether outreach is working   |
| End of month 3 | Full review of all metrics; revise targets for months 4–6              |
| End of month 6 | Comprehensive review; inform decisions about future phases and scaling |

---

_Last updated: 2026-07-10_
