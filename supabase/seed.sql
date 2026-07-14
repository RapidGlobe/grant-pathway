-- =============================================================================
-- Grant Pathway v1 — Seed Data
-- =============================================================================
-- Based on Persona 1: Margaret, Volunteer Grant Writer
-- Charity: small community wellbeing charity, North of England
--
-- Run with: supabase db reset (local only — never run against production)
-- =============================================================================

-- Fixed UUIDs for reproducibility
-- User:             a0000000-0000-0000-0000-000000000001
-- user_profile:     b0000000-0000-0000-0000-000000000001
-- charity_profile:  c0000000-0000-0000-0000-000000000001
-- Application 1:    d0000000-0000-0000-0000-000000000001  (not_started, step 1)
-- Application 2:    d0000000-0000-0000-0000-000000000002  (in_progress, step 3)
-- Application 3:    d0000000-0000-0000-0000-000000000003  (approved, step 5)

-- ---------------------------------------------------------------------------
-- Auth user (local development only — uses pgcrypto bcrypt)
-- Email: margaret@helpinghandsuk.org  |  Password: TestPassword123!
-- ---------------------------------------------------------------------------

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  created_at,
  updated_at
)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'margaret@helpinghandsuk.org',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------------------

-- The on_auth_user_created trigger fires when auth.users is inserted above,
-- creating a user_profiles row with empty names. Upsert on user_id to ensure
-- the seed data overwrites the trigger-created placeholder with the correct values.
INSERT INTO public.user_profiles (id, user_id, first_name, last_name, feedback_consent)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Margaret',
  'Thompson',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  id               = EXCLUDED.id,
  first_name       = EXCLUDED.first_name,
  last_name        = EXCLUDED.last_name,
  feedback_consent = EXCLUDED.feedback_consent;

-- ---------------------------------------------------------------------------
-- charity_profiles
-- ---------------------------------------------------------------------------

INSERT INTO public.charity_profiles (
  id,
  user_id,
  charity_name,
  registration_number,
  what_charity_does,
  who_charity_helps,
  where_charity_works,
  lookup_source
)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Helping Hands Community Trust',
  '1187432',
  'We run weekly social groups, befriending services, and practical support programmes for isolated older adults. Our activities include a weekly lunch club, a telephone befriending service paired with trained volunteers, light gardening help, and signposting to statutory services. We also deliver a digital skills programme to help older people connect with family online.',
  'Isolated and lonely older adults aged 65 and over living in our local area, with a particular focus on those who live alone, have recently been bereaved, or have limited mobility that prevents them from accessing mainstream community activities.',
  'Market town of Harrogate and surrounding rural villages within a 10-mile radius in North Yorkshire',
  'charity_commission'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Application 1 — Not started (just created at Step 1)
-- ---------------------------------------------------------------------------

INSERT INTO public.applications (
  id, user_id, funder_name, grant_name, status, current_step
)
VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'The National Lottery Community Fund',
  'Awards for All England',
  'not_started',
  1
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Application 2 — In progress at Step 3 (AI summary generated)
-- ---------------------------------------------------------------------------

INSERT INTO public.applications (
  id, user_id, funder_name, grant_name, status, current_step, ai_summary
)
VALUES (
  'd0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Tudor Trust',
  'Core Costs Grant 2026',
  'in_progress',
  3,
  'The Tudor Trust offers flexible, multi-year core cost funding to small and medium charities working in disadvantaged communities across the UK. This grant round prioritises organisations delivering direct community benefit with strong volunteer involvement. Grants typically range from £5,000 to £30,000 per year for up to three years. The funder values honest, plain-language applications and is particularly interested in how organisations plan to remain sustainable beyond the grant period.

Key requirements:
- Clear description of the community you serve and the need you address
- Evidence of community involvement in your work (not just as beneficiaries)
- Honest account of your current financial position including reserves
- Plan for sustainability beyond the grant period

Extracted application questions:
1. Describe the community you work in and the need your organisation addresses. (300 words)
2. How does your community shape and influence your work? (200 words)
3. What would this funding allow you to do, and how would you know if it had made a difference? (400 words)'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Application 3 — Approved at Step 5 (answers approved, ready to export)
-- ---------------------------------------------------------------------------

INSERT INTO public.applications (
  id, user_id, funder_name, grant_name, status, current_step,
  ai_summary, last_exported_at
)
VALUES (
  'd0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'Lloyds Bank Foundation',
  'Invest Programme 2025',
  'approved',
  5,
  'The Lloyds Bank Foundation Invest programme supports small and medium charities in England and Wales that are working to help people overcome complex social issues. This round prioritises organisations that work directly with people at the margins — those who are often excluded from mainstream support. Grants are typically £25,000–£75,000 per year for two to three years, alongside non-financial development support.

Key requirements:
- Evidence of direct work with people facing complex disadvantage
- Clear theory of change explaining how your work leads to lasting change
- Organisational track record and financial health
- Willingness to engage with the Foundation''s development support programme

Extracted application questions:
1. Who do you work with and what complex issues do they face? (400 words)
2. Describe your approach and explain why it works. (400 words)
3. What are your plans for the organisation over the next three years? (300 words)',
  now() - interval '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- Answers for Application 3
INSERT INTO public.application_items (
  id, application_id, user_id, item_type, source_of_truth, item_label, item_order,
  answer_text, answer_source, is_approved
)
VALUES
(
  'e0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'narrative',
  'user_input',
  'Who do you work with and what complex issues do they face?',
  1,
  'Helping Hands Community Trust works with older adults aged 65 and over in Harrogate and the surrounding rural villages of North Yorkshire. The people we support share a common experience of isolation and loneliness — conditions that research consistently links to serious health deterioration, including increased risk of dementia, depression, and premature death.

Our beneficiaries often face multiple, compounding challenges. Many live alone following bereavement, sometimes after decades of marriage, and have lost not only their partner but the social routines built around that relationship. Others have experienced a sudden reduction in mobility — following a fall, illness, or surgery — that has made leaving the home difficult or impossible. Rural location compounds these difficulties significantly: irregular or non-existent bus services mean that people in surrounding villages cannot access town-centre services without a car or willing family member.

We currently support 87 regular beneficiaries, 62% of whom live alone. Of these, 34 are engaged through our telephone befriending service — the only regular contact some of them have with another person during the week. Our waiting list currently stands at 19 people, reflecting demand that consistently outstrips our capacity.',
  'user_edited',
  true
),
(
  'e0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'narrative',
  'user_input',
  'Describe your approach and explain why it works.',
  2,
  'Our approach is built on consistent, trusted human relationships — not one-off interventions. We believe that isolation is best addressed through sustained, low-pressure connection, and that the people best placed to provide this are trained volunteers from the same community.

Our weekly lunch club provides a regular anchor point for 45 older adults who might otherwise spend the day alone. Beyond the meal itself, the club offers structured social activity, conversation, and the quiet reassurance of a familiar face every week. Our volunteer befriending service pairs isolated individuals with a trained volunteer for a weekly telephone call, building a relationship that many participants describe as one of their most valued sources of support.

We know our approach works because we measure it. We use the UCLA Loneliness Scale at referral and at six months, and our most recent cohort showed a statistically significant reduction in loneliness scores for 71% of participants. Qualitative feedback reinforces this: "Before Helping Hands, I could go a whole week without speaking to anyone," one participant told us. "Now I look forward to Thursdays."

Our model is deliberately simple and human — no complex technology, no eligibility criteria that create barriers. This is what makes it accessible to the people who need it most.',
  'user_edited',
  true
),
(
  'e0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'narrative',
  'user_input',
  'What are your plans for the organisation over the next three years?',
  3,
  'Over the next three years, Helping Hands Community Trust aims to deepen the quality and reach of our existing services while building the organisational foundations needed for long-term sustainability.

In year one, with the support of Lloyds Bank Foundation funding, we will clear our current waiting list of 19 people and recruit and train eight additional volunteers to expand our befriending service. We will also pilot a small group befriending model for people who are housebound, using video calling with volunteer support to access the technology.

In year two, we will commission an independent evaluation of our outcomes model and use the findings to sharpen our referral criteria and strengthen our evidence base for future funding applications. We will also begin work on a small unrestricted reserves target — currently we hold three months of operating costs, and we aim to reach six months by the end of year three.

In year three, we will explore whether a small earned-income stream — such as a community café open to the wider public — could provide partial financial independence from grant funding. We are realistic that grant funding will remain important for the foreseeable future, but we are committed to reducing our dependence on any single source.

We are also actively involved in conversations with two neighbouring organisations about potential collaboration on transport — the single biggest barrier to service access in our rural catchment area.',
  'ai_generated',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- AI usage log — a few historical entries for Application 3
-- ---------------------------------------------------------------------------

INSERT INTO public.ai_usage_log (user_id, application_id, request_type, token_count)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'guideline_summary', 2847),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'draft_generation', 4203),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'guideline_summary', 3102);
