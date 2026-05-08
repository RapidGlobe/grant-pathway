# Constraints & Assumptions — AI Grant Accelerator v1

This document captures the key constraints and assumptions that bound the v1 build. These inform the BRD and should be reviewed if circumstances change.

---

## Design and Delivery Constraints

| Ref | Constraint | Description | Implication for v1 |
|-----|-----------|-------------|-------------------|
| C1 | Monthly running cost budget | The maximum monthly infrastructure and API running cost personally absorbed before the CIC is established is £100 per month, covering Amazon Bedrock Claude API usage, UK-region cloud hosting, and any third-party services | If projected costs approach or exceed this threshold, feature scope or usage limits must be reviewed before launch |
| C2 | Target launch date | The target launch date for v1 is 31 July 2026, approximately 3.5 months from April 2026 | BRD must be completed by early May 2026; two weeks reserved pre-launch for compliance checks, ToS/Privacy Policy publication, and AWS DPA review |
| C3 | UK-only coverage | The service is limited to UK charities and UK grant applications; EU and international grants are explicitly out of scope | Content, terminology, funder context, and regulatory framing must reflect the UK grant landscape only *(DR-PS-003)* |
| C4 | Single developer | The app will be built and maintained by one developer | Feature scope and delivery timeline must remain realistic for a solo build *(DR-BM-001)* |
| C5 | Free access model | The service must be available free of charge to all eligible UK charities with no subscriptions, charges, or freemium tiers | No payment infrastructure required in v1; operational costs covered personally until CIC grant funding is secured *(DR-OD-002)* |
| C6 | Writing-only focus | The service launches as a grant writing tool; grant discovery is explicitly deferred to later phases | Charities must already know which grant they are applying for; the service will not search for or recommend grants in v1 *(DR-PS-001, DR-PS-002)* |
| C7 | No live grant data | The service will not integrate with external grant databases or live funder data sources in v1 | No dependency on 360Giving, GrantNav, Funding Central, or any other grant data source *(DR-IN-002)* |
| C8 | Limited integrations | Only the Charity Commission register integration is in scope for v1; broader links to charity CRMs, finance systems, or other operational tools are deferred | All charity information beyond basic registration data is entered manually *(DR-IN-001)* |
| C9 | AI capability limits | In v1, AI is limited to text generation and document summarisation only | Eligibility matching, open-ended chat, and automated validation are out of scope *(DR-AI-001)* |
| C10 | Mandatory human review | All AI-generated content must be reviewed and approved by the user before it is used in a grant application, with plain-language guidance on what to check | The app enforces this step; it cannot be bypassed *(DR-AI-003)* |
| C11 | No liability for AI content | The service acts as a writing aid only; it does not guarantee funding outcomes or accept responsibility for submitted content | Terms of Service must state clearly: the app does not guarantee or promise funding, does not submit applications on behalf of charities, and makes no representations to funders *(DR-LC-002)* |
| C12 | No AI training use | Charity data will never be used to train, fine-tune, or improve any AI model by the app operator or any third party including Anthropic | Covered by Amazon Bedrock service terms; must be stated prominently in the Privacy Policy *(DR-DP-003)* |
| C13 | UK-region data hosting | All app data must be stored in UK-region cloud infrastructure | AI processing via Amazon Bedrock eu-west-2 (UK/EEA); no international transfer occurs; must be stated in the Privacy Policy *(DR-DP-002)* |
| C14 | Regulatory compliance | The service must comply with UK GDPR, the Data Protection Act 2018, and relevant Charity Commission guidance on digital tools | Compliance must be in place before launch; AI regulatory developments will be monitored but a full AI-specific compliance regime is not part of v1 *(DR-LC-001)* |
| C15 | Accessibility standard | The app must meet WCAG 2.2 Level AA from day one; accessibility is a design-in requirement, not a retrofit | An independent audit is deferred to a pre-scaling milestone *(DR-LC-003)* |
| C16 | Web application only | The app is a web application only; no native mobile app (iOS or Android) is in scope for v1 | The web application must be responsive and usable on mobile browsers |
| C17 | MIT open source licence | The codebase will be released under the MIT open source licence | No commercial use restrictions; security must be managed proactively; no secrets or credentials committed to the repository *(DR-BM-003)* |
| C18 | Open, documented codebase | The codebase must be documented and publicly hosted to enable continuity if maintenance is handed over | A named potential successor organisation should be identified informally before launch *(DR-BM-002)* |
| C19 | Defined sunset process | If support can no longer continue, charities must receive a minimum of three months' notice, the ability to export all their data, and a clean decommission | This is a last-resort fallback; the primary plan is handover to a successor *(DR-BM-002)* |
| C20 | Minimal metrics infrastructure | Only basic passive usage metrics (registrations, applications created, returning users) will be captured in v1 via database counts; no analytics platform, dashboard, or survey tooling is required | More advanced metrics are deferred to a later phase *(DR-SM-001)* |

---

## Planning Assumptions

| Ref | Assumption | Description | Impact if wrong |
|-----|-----------|-------------|----------------|
| A1 | Charity Commission API availability | The Charity Commission for England and Wales public API is freely available, stable, and reliable enough to use as a data source for charity onboarding | Alternative verification methods would be needed *(DR-IN-001)* |
| A2 | Amazon Bedrock capability | Amazon Bedrock Claude API remains available, competitively priced, and capable of supporting text generation and document summarisation at the quality required | Provider or usage model may need to change *(DR-AI-002)* |
| A3 | Amazon Bedrock pricing stability | Amazon Bedrock Claude API pricing will remain stable enough that typical usage costs stay within the £100/month budget constraint | Provider or usage model may need to change *(DR-AI-002)* |
| A4 | AWS DPA satisfies UK GDPR | Amazon Bedrock's DPA satisfies UK GDPR requirements; no international transfer occurs as AI processing is in UK/EEA via Bedrock eu-west-2; AWS DPA must be reviewed before launch | Alternative AI provider or hosting arrangement may be required *(DR-DP-002)* |
| A5 | Charity data is organisational, not personal | Application content (descriptions of charitable work, project plans, outcomes, budgets) constitutes organisational data rather than personal data about individuals | If beneficiary personal data is included in application content, additional GDPR controls will be required *(DR-DP-001)* |
| A6 | Basic digital literacy | Target users are assumed to have basic digital skills including using email, web forms, and copy-paste workflows; no familiarity with AI tools is assumed or required | Core UX flows would need significant redesign *(DR-TU-003)* |
| A7 | Charities know which grant to apply for | Charities using the app have already identified the grant they wish to apply for before using the service | Core product scope would need to change; discovery would need to be brought forward *(DR-PS-002)* |
| A8 | Funder guidelines are accessible | Charities have funder guidelines available in a format they can paste or upload (PDF, web page, Word document) | Document handling feature would need to be redesigned |
| A9 | Charities already hold required information | Charities already possess the organisational, project, budget, and impact information needed for a grant application; the service helps structure and express it, not gather it | Onboarding flow and AI output quality would be significantly affected *(DR-DP-001)* |
| A10 | Information is entered manually | In v1, all information is expected to be provided manually by the charity rather than pulled from external systems | Integration scope would need to expand *(DR-IN-001)* |
| A11 | Users will engage meaningfully with human review | Non-specialist users will genuinely review AI-generated content rather than treating the mandatory review step as a click-through | Review UX would need redesigning; liability position may need revisiting *(DR-AI-003)* |
| A12 | Trust depends on data control | Charities place high value on data ownership, privacy, and assurance that their data will not be used to train AI models; clear commitments on this are essential for adoption | Adoption may be significantly lower without explicit, prominent data ownership commitments *(DR-DP-003)* |
| A13 | Early-phase usage within budget | Usage volumes in the early phase will remain within the £100/month running cost constraint | Cost controls or usage limits would need to be introduced |
| A14 | Sector will adopt a free tool readily | The charity sector will adopt a free tool with minimal onboarding friction; small charities do not require formal procurement or IT approval processes | A more formal onboarding or sector endorsement route would be needed *(DR-OD-003)* |
| A15 | Basic metrics sufficient initially | Early evidence of value will come from simple measures such as registrations, applications created, and returning users; no complex attribution or outcome tracking is needed in v1 | Analytics infrastructure would need to be brought forward *(DR-SM-001)* |
| A16 | Advanced metrics deferred | More advanced measures — time saved, application success rates, satisfaction scores — are appropriate for a later phase once a meaningful user base exists | A formal impact reporting requirement from funders or partners could accelerate this *(DR-SM-001, DR-SM-002)* |
| A17 | WCAG 2.2 AA is achievable in chosen stack | The chosen technology stack will support WCAG 2.2 AA compliance without requiring specialist accessibility tooling | Stack selection may need to be revisited |
| A18 | Charity Commission register is sufficient for verification | The Charity Commission for England and Wales register (supplemented by OSCR and CCNI) is the correct and sufficient data source for basic charity verification at onboarding | Additional verification methods would be needed *(DR-IN-001)* |
| A19 | CIC formation is achievable post-launch | Establishing a CIC as the long-term owner of the app is achievable within a reasonable timeframe following launch | Long-term ownership and operational funding plan would need revisiting *(DR-OD-001)* |
| A20 | CIC operational funding is available | Grant funding for CIC operational costs will be available from sector funders (e.g. Nominet, Catalyst, Comic Relief Tech for Good) once the app is established and evidenced | A cost recovery or sustainability model would be needed *(DR-OD-002)* |
| A21 | Opt-in rate for feedback interviews | A sufficient number of early users will opt in to feedback interviews at registration to provide meaningful product feedback | Alternative feedback mechanisms would need to be introduced sooner *(DR-SM-002)* |

---

*Last updated: 2026-04-13*
*Sources: Decision records DR-PS-001 to DR-BM-003; constraints-and-assumptions-tables.docx*
