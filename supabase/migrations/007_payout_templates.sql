-- Milestone 13b: Configurable payout templates per pool

alter table public.pools
  add column if not exists payout_template text not null default 'standard'
    check (payout_template in ('equal', 'standard', 'heavy_final', 'custom')),
  add column if not exists payout_percentages jsonb not null default '{}'::jsonb;
