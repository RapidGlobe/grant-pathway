-- Fix Henry Smith funder name: 'Henry Smith Charity' → 'Henry Smith Foundation'
-- Identified during IT-HSF-10 testing — export showed incorrect name.
-- The seed used the registered charity name; the trading/foundation name is used publicly.

update public.funders
set name = 'Henry Smith Foundation',
    guidelines_url = 'https://henrysmith.foundation/grants/'
where name = 'Henry Smith Charity';
