-- =============================================================================
-- Grant Pathway — Add MK Community Foundation (4 tiers) and Baily Thomas (2 tiers)
-- =============================================================================
-- Source: MKCF grant criteria PDFs (Seed/Sapling/Oak/Strategic Partnership, Nov 2025)
--         Baily Thomas General Application form and guidelines (Mar 2024)
-- Authority: WJ instruction 2026-06-11
--
-- MKCF portal: https://miltonkeynescommunityfoundation.my.site.com/fundseekerportal/s/login/
-- Baily Thomas portal: BenefactorCloud (linked from bailythomas.org.uk)
--
-- Safe to re-run — ON CONFLICT DO NOTHING prevents duplicates.
-- =============================================================================

insert into public.funders (name, funder_type, grant_range, guidelines_url, is_active)
values
  -- MK Community Foundation — 4 separate tiers, all via same portal
  (
    'MK Community Foundation — Seed Grants',
    'structured',
    'Up to £750',
    'https://www.mkcommunityfoundation.co.uk/apply-for-a-grant/grants-policy/',
    true
  ),
  (
    'MK Community Foundation — Sapling Grants',
    'structured',
    '£750–£5,000',
    'https://www.mkcommunityfoundation.co.uk/apply-for-a-grant/grants-policy/',
    true
  ),
  (
    'MK Community Foundation — Oak Grants',
    'structured',
    '£5,001–£15,000',
    'https://www.mkcommunityfoundation.co.uk/apply-for-a-grant/grants-policy/',
    true
  ),
  (
    'MK Community Foundation — Strategic Partnership Grants',
    'narrative',
    'Above £15,000 p.a.',
    'https://www.mkcommunityfoundation.co.uk/apply-for-a-grant/grants-policy/',
    true
  ),
  -- Baily Thomas Charitable Fund — learning disability focus only
  -- Three grant tiers as separate entries
  (
    'Baily Thomas — Small Grants',
    'structured',
    'Up to £5,000',
    'https://www.bailythomas.org.uk/grants/general-programme/general-guidelines',
    true
  ),
  (
    'Baily Thomas — General Programme',
    'structured',
    '£9,000+',
    'https://www.bailythomas.org.uk/grants/general-programme/general-guidelines',
    true
  ),
  (
    'Baily Thomas — Research Grants',
    'narrative',
    'Not specified (cost-based)',
    'https://www.bailythomas.org.uk/grants/research-programme',
    false  -- parked: specialist academic research programme; not relevant to typical charity users
  ),
  -- CPF Trust — email application, 500 words max, window 1 Jun–30 Sep only
  (
    'CPF Trust',
    'narrative',
    '£1,000–£3,000',
    'https://www.thecpftrust.org.uk/',
    true
  )
on conflict (name) do nothing;
