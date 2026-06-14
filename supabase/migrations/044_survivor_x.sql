-- Survivor X™ — Phase 1 schema (Executive Directive #007)

create table if not exists public.survivor_leagues (
  id uuid primary key default gen_random_uuid(),
  sport text not null default 'nfl'
    check (sport in ('nfl', 'ncaaf', 'nba', 'mlb', 'nhl', 'soccer')),
  season_year integer not null,
  mode text not null default 'classic'
    check (mode in ('classic', 'double_life', 'turbo', 'global', 'private')),
  visibility text not null default 'global'
    check (visibility in ('global', 'private')),
  name text not null,
  description text,
  invite_code text unique,
  image_url text,
  entry_fee_cents bigint not null default 0 check (entry_fee_cents >= 0),
  max_players integer check (max_players is null or max_players > 0),
  prize_pool_cents bigint not null default 0 check (prize_pool_cents >= 0),
  lives_per_player smallint not null default 1 check (lives_per_player >= 1 and lives_per_player <= 3),
  current_week integer not null default 1 check (current_week >= 1),
  status text not null default 'draft'
    check (status in ('draft', 'open', 'active', 'complete', 'archived')),
  creator_email text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists survivor_leagues_sport_season_idx
  on public.survivor_leagues (sport, season_year, status);

create index if not exists survivor_leagues_invite_code_idx
  on public.survivor_leagues (invite_code)
  where invite_code is not null;

create table if not exists public.survivor_entries (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.survivor_leagues (id) on delete cascade,
  email text not null,
  display_name text not null,
  lives_remaining smallint not null default 1 check (lives_remaining >= 0),
  status text not null default 'active'
    check (status in ('active', 'eliminated', 'champion')),
  eliminated_week integer check (eliminated_week is null or eliminated_week >= 1),
  eliminated_at timestamptz,
  weeks_survived integer not null default 0 check (weeks_survived >= 0),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, email)
);

create index if not exists survivor_entries_league_status_idx
  on public.survivor_entries (league_id, status);

create index if not exists survivor_entries_email_idx
  on public.survivor_entries (email);

create table if not exists public.survivor_weeks (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.survivor_leagues (id) on delete cascade,
  week_number integer not null check (week_number >= 1),
  label text not null,
  status text not null default 'open'
    check (status in ('scheduled', 'open', 'locked', 'scoring', 'complete')),
  opens_at timestamptz,
  locks_at timestamptz,
  completes_at timestamptz,
  players_remaining integer not null default 0,
  eliminated_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, week_number)
);

create table if not exists public.survivor_picks (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.survivor_leagues (id) on delete cascade,
  week_id uuid not null references public.survivor_weeks (id) on delete cascade,
  entry_id uuid not null references public.survivor_entries (id) on delete cascade,
  email text not null,
  team_abbr text not null,
  team_name text not null,
  espn_game_id text,
  result text not null default 'pending'
    check (result in ('pending', 'survived', 'eliminated', 'push')),
  locked_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, week_id),
  unique (entry_id, team_abbr)
);

create index if not exists survivor_picks_week_idx
  on public.survivor_picks (week_id, result);

create table if not exists public.survivor_career_stats (
  email text not null,
  sport text not null default 'nfl',
  seasons_played integer not null default 0,
  championships integer not null default 0,
  longest_survival_streak integer not null default 0,
  current_survival_streak integer not null default 0,
  perfect_seasons integer not null default 0,
  total_weeks_survived integer not null default 0,
  lifetime_eliminations integer not null default 0,
  hof_score integer not null default 0,
  badges jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (email, sport)
);

create table if not exists public.survivor_hof_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  sport text not null default 'nfl',
  season_year integer not null,
  league_id uuid references public.survivor_leagues (id) on delete set null,
  category text not null
    check (category in (
      'perfect_season',
      'longest_streak',
      'champion',
      'fastest_champion',
      'community_favorite',
      'most_seasons'
    )),
  headline text not null,
  detail text,
  stat_value integer,
  inducted_at timestamptz not null default now()
);

create index if not exists survivor_hof_sport_category_idx
  on public.survivor_hof_entries (sport, category, inducted_at desc);

alter table public.survivor_leagues enable row level security;
alter table public.survivor_entries enable row level security;
alter table public.survivor_weeks enable row level security;
alter table public.survivor_picks enable row level security;
alter table public.survivor_career_stats enable row level security;
alter table public.survivor_hof_entries enable row level security;

create policy "survivor_leagues_read" on public.survivor_leagues for select using (true);
create policy "survivor_entries_read" on public.survivor_entries for select using (true);
create policy "survivor_weeks_read" on public.survivor_weeks for select using (true);
create policy "survivor_picks_read" on public.survivor_picks for select using (true);
create policy "survivor_career_stats_read" on public.survivor_career_stats for select using (true);
create policy "survivor_hof_read" on public.survivor_hof_entries for select using (true);
