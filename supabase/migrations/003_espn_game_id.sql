-- Milestone 10B: ESPN automatic score sync

alter table public.pools
  add column if not exists espn_game_id text;

create index if not exists pools_espn_game_id_idx
  on public.pools (espn_game_id)
  where espn_game_id is not null;
