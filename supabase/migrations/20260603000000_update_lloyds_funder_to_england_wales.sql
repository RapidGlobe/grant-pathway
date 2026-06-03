-- Update Lloyds Bank Foundation from CI (Channel Islands) to England & Wales
--
-- The original seed incorrectly pointed to the Channel Islands foundation
-- (lloydsbankfoundationci.org.uk). Grant Pathway targets the main England &
-- Wales foundation which has a broader remit and explicit downloadable
-- application guidance.

update public.funders
set
  name         = 'Lloyds Bank Foundation',
  grant_range  = '£25k–£75k',
  guidelines_url = 'https://www.lloydsbankfoundation.org.uk/funding'
where name = 'Lloyds Bank Foundation CI';
