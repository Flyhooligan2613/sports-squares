-- Milestone 11: Multi-sport ESPN integration

alter table public.pools
  add column if not exists espn_sport text not null default 'nfl'
    check (espn_sport in ('nfl', 'ncaaf', 'nba', 'ncaab'));

-- Allow NCAA basketball half winners
alter table public.winners drop constraint if exists winners_quarter_check;

alter table public.winners add constraint winners_quarter_check
  check (quarter in ('Q1', 'Q2', 'Q3', 'Q4', '1H', '2H', 'FINAL'));
