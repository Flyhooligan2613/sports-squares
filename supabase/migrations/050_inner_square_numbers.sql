-- Randomized inner square display numbers (1–100) assigned at kickoff alongside axis digits.

alter table public.pools
  add column if not exists inner_numbers smallint[];

comment on column public.pools.inner_numbers is
  'Shuffled 1–100 display labels indexed by square_number (0–99). Assigned at number draw.';

-- Backfill boards that already drew axis numbers.
update public.pools p
set inner_numbers = (
  select array_agg(n order by random())
  from generate_series(1, 100) as n
)
where p.inner_numbers is null
  and p.top_numbers is not null
  and array_length(p.top_numbers, 1) = 10;
