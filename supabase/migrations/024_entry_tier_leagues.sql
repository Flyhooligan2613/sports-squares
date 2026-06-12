-- Allow multiple Pick'em leagues per contest — one shard chain per entry tier.

alter table public.pickem_leagues
  drop constraint if exists pickem_leagues_contest_id_league_number_key;

create unique index if not exists pickem_leagues_contest_tier_league_idx
  on public.pickem_leagues (contest_id, entry_tier_cents, league_number);
