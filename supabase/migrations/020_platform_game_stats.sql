-- Platform expansion: per-game player statistics (multi-game ready)

create table if not exists public.player_game_stats (
  email text not null references public.player_profiles (email) on delete cascade,
  game_type text not null check (
    game_type in (
      'squareboards',
      'pickem',
      'survivor',
      'brackets',
      'baseball-pickem',
      'soccer-predictor'
    )
  ),
  wins integer not null default 0 check (wins >= 0),
  winnings_cents bigint not null default 0 check (winnings_cents >= 0),
  games_played integer not null default 0 check (games_played >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  extra jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (email, game_type)
);

create index if not exists player_game_stats_game_type_idx
  on public.player_game_stats (game_type);

alter table public.player_game_stats enable row level security;

drop policy if exists "player_game_stats_select" on public.player_game_stats;
create policy "player_game_stats_select" on public.player_game_stats
  for select using (true);

drop policy if exists "player_game_stats_service" on public.player_game_stats;
create policy "player_game_stats_service" on public.player_game_stats
  for all using (true) with check (true);

comment on table public.player_game_stats is
  'Cross-game player statistics keyed by platform game type. SquareBoards stats may be computed from legacy tables until materialized here.';
