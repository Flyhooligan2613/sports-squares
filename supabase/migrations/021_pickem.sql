-- SquareBoards Pick'em — sport-agnostic weekly winner-pick contests

create table if not exists public.pickem_contests (
  id uuid primary key default gen_random_uuid(),
  sport text not null check (
    sport in ('nfl', 'ncaaf', 'nba', 'ncaab', 'mlb', 'nhl', 'soccer')
  ),
  season_year integer not null,
  season_type integer not null default 2,
  week_number integer not null,
  label text not null,
  status text not null default 'open'
    check (status in ('open', 'active', 'complete')),
  prize_pool_cents bigint not null default 0,
  player_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sport, season_year, season_type, week_number)
);

create table if not exists public.pickem_games (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  espn_game_id text not null,
  away_team text not null,
  home_team text not null,
  away_abbr text,
  home_abbr text,
  away_record text,
  home_record text,
  away_logo_url text,
  home_logo_url text,
  kickoff_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'live', 'final', 'cancelled', 'postponed')),
  winner_side text check (winner_side in ('away', 'home', 'tie')),
  away_score integer,
  home_score integer,
  picks_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contest_id, espn_game_id)
);

create table if not exists public.pickem_picks (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  game_id uuid not null references public.pickem_games (id) on delete cascade,
  email text not null,
  picked_side text not null check (picked_side in ('away', 'home')),
  is_correct boolean,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, game_id)
);

create table if not exists public.pickem_player_stats (
  email text not null,
  sport text not null,
  season_year integer not null,
  weekly_wins integer not null default 0,
  weekly_losses integer not null default 0,
  weekly_pending integer not null default 0,
  season_wins integer not null default 0,
  season_losses integer not null default 0,
  lifetime_wins integer not null default 0,
  lifetime_losses integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  perfect_week_streak integer not null default 0,
  weekly_win_streak integer not null default 0,
  weeks_played integer not null default 0,
  perfect_weeks integer not null default 0,
  season_championships integer not null default 0,
  total_picks integer not null default 0,
  correct_picks integer not null default 0,
  current_contest_id uuid references public.pickem_contests (id) on delete set null,
  achievements jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (email, sport, season_year)
);

create index if not exists pickem_contests_sport_season_idx
  on public.pickem_contests (sport, season_year, week_number desc);

create index if not exists pickem_games_contest_idx
  on public.pickem_games (contest_id, kickoff_at);

create index if not exists pickem_picks_contest_email_idx
  on public.pickem_picks (contest_id, email);

create index if not exists pickem_picks_email_idx
  on public.pickem_picks (email);

create index if not exists pickem_player_stats_sport_idx
  on public.pickem_player_stats (sport, season_year);

alter table public.pickem_contests enable row level security;
alter table public.pickem_games enable row level security;
alter table public.pickem_picks enable row level security;
alter table public.pickem_player_stats enable row level security;

drop policy if exists "pickem_contests_select" on public.pickem_contests;
create policy "pickem_contests_select" on public.pickem_contests
  for select using (true);

drop policy if exists "pickem_games_select" on public.pickem_games;
create policy "pickem_games_select" on public.pickem_games
  for select using (true);

drop policy if exists "pickem_picks_select" on public.pickem_picks;
create policy "pickem_picks_select" on public.pickem_picks
  for select using (true);

drop policy if exists "pickem_player_stats_select" on public.pickem_player_stats;
create policy "pickem_player_stats_select" on public.pickem_player_stats
  for select using (true);

drop policy if exists "pickem_service_all" on public.pickem_contests;
create policy "pickem_service_all" on public.pickem_contests
  for all using (true) with check (true);

drop policy if exists "pickem_games_service" on public.pickem_games;
create policy "pickem_games_service" on public.pickem_games
  for all using (true) with check (true);

drop policy if exists "pickem_picks_service" on public.pickem_picks;
create policy "pickem_picks_service" on public.pickem_picks
  for all using (true) with check (true);

drop policy if exists "pickem_stats_service" on public.pickem_player_stats;
create policy "pickem_stats_service" on public.pickem_player_stats
  for all using (true) with check (true);

comment on table public.pickem_contests is
  'Weekly pick''em contests — one row per sport/season/week.';
