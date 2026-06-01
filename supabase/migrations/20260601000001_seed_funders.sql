-- =============================================================================
-- Grant Pathway — Seed: Approved funder directory
-- =============================================================================
-- Source: docs/Test Plans/target-funder-list.md (v1.0, 2026-05-29)
-- Authority: DR-FD-001
-- 12 funders: 10 structured, 2 narrative
--
-- Run as part of the normal migration sequence.
-- Safe to re-run — ON CONFLICT DO NOTHING prevents duplicates.
-- To add a new funder: insert a row here and run a new migration.
-- =============================================================================

insert into public.funders (name, funder_type, grant_range, guidelines_url, is_active)
values
  (
    'Idlewild Trust',
    'structured',
    '£10k–£30k',
    'https://www.idlewildtrust.org.uk/apply-grant',
    true
  ),
  (
    'A B Charitable Trust',
    'structured',
    '£10k–£40k/yr',
    'https://www.abcharitabletrust.org.uk/apply',
    true
  ),
  (
    'Clothworkers'' Foundation',
    'structured',
    'Up to £15k+',
    'https://www.clothworkersfoundation.org.uk/apply-for-a-grant',
    true
  ),
  (
    'Henry Smith Charity',
    'structured',
    '£10k–£100k',
    'https://www.henrysmith.org/grants',
    true
  ),
  (
    'Wolfson Foundation',
    'structured',
    '£30k–£250k+',
    'https://www.wolfson.org.uk/funding/application-guidance',
    true
  ),
  (
    'Lloyds Bank Foundation CI',
    'structured',
    '£5k–£50k',
    'https://www.lloydsbankfoundationci.org.uk/grants',
    true
  ),
  (
    'Foyle Foundation — Main Grants',
    'structured',
    '£10k–£75k',
    'https://www.foylefoundation.org.uk',
    true
  ),
  (
    'Walton Charity — Community Grants',
    'structured',
    'Up to £10k',
    'https://www.waltoncharity.org.uk/applying-for-a-grant',
    true
  ),
  (
    'Nationwide Building Society — Community Grants',
    'structured',
    '£10k–£60k',
    'https://www.actiontogether.org.uk/nationwide',
    true
  ),
  (
    'Motability Foundation',
    'structured',
    '£50k–£1m',
    'https://www.motabilityfoundation.org.uk',
    true
  ),
  (
    'Garfield Weston Foundation',
    'narrative',
    'Up to £100k',
    'https://garfieldweston.org/for-grant-applicants/how-to-apply',
    true
  ),
  (
    'City Bridge Foundation',
    'narrative',
    '£75k–£450k',
    'https://www.citybridgefoundation.org.uk/funding/how-to-apply',
    true
  )
on conflict (name) do nothing;
