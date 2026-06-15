-- Tournament Royale™ — Phase 1 schema (Executive Directive #015)

create table if not exists public.tournament_royale_events (
  id uuid primary key default gen_random_uuid(),
  tournament_key text not null
    check (tournament_key in (
      'ncaab_mens', 'ncaab_womens', 'nba_playoffs', 'nhl_playoffs',
      'fifa_world_cup', 'uefa_champions_league', 'college_baseball', 'cfp'
    )),
  sport text not null
    check (sport in ('ncaab', 'nba', 'nhl', 'soccer', 'mlb', 'ncaaf')),
  season_year integer not null,
  name text not null,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'active', 'complete', 'archived')),
  current_round_number integer not null default 1 check (current_round_number >= 1),
  champion_team text,
  locks_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_key, season_year)
);

create index if not exists tournament_royale_events_status_idx
  on public.tournament_royale_events (status, season_year desc);

create table if not exists public.tournament_royale_pools (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.tournament_royale_events (id) on delete cascade,
  name text not null default 'Global Bracket',
  visibility text not null default 'global'
    check (visibility in ('global', 'private')),
  invite_code text unique,
  max_entries integer check (max_entries is null or max_entries > 0),
  entry_count integer not null default 0 check (entry_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists tournament_royale_pools_event_idx
  on public.tournament_royale_pools (event_id);

create table if not exists public.tournament_royale_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.tournament_royale_events (id) on delete cascade,
  pool_id uuid not null references public.tournament_royale_pools (id) on delete cascade,
  email text not null,
  display_name text not null,
  total_points integer not null default 0 check (total_points >= 0),
  accuracy_pct numeric(5,2) not null default 0,
  cinderella_meter integer not null default 0 check (cinderella_meter >= 0),
  combo_streak integer not null default 0 check (combo_streak >= 0),
  best_combo_streak integer not null default 0 check (best_combo_streak >= 0),
  combo_multiplier numeric(4,2) not null default 1,
  shield_available boolean not null default true,
  shield_used_matchup_id uuid,
  bracket_completion_pct numeric(5,2) not null default 0,
  rank_position integer,
  status text not null default 'active'
    check (status in ('active', 'complete')),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pool_id, email)
);

create index if not exists tournament_royale_entries_event_email_idx
  on public.tournament_royale_entries (event_id, email);

create index if not exists tournament_royale_entries_pool_rank_idx
  on public.tournament_royale_entries (pool_id, total_points desc);

create table if not exists public.tournament_royale_rounds (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.tournament_royale_events (id) on delete cascade,
  round_number integer not null check (round_number >= 1),
  label text not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'open', 'locked', 'scoring', 'complete')),
  opens_at timestamptz,
  locks_at timestamptz,
  completes_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, round_number)
);

create table if not exists public.tournament_royale_matchups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.tournament_royale_events (id) on delete cascade,
  round_id uuid not null references public.tournament_royale_rounds (id) on delete cascade,
  slot_index integer not null check (slot_index >= 0),
  region text,
  top_team_name text not null,
  top_team_seed smallint not null check (top_team_seed >= 1 and top_team_seed <= 16),
  bottom_team_name text not null,
  bottom_team_seed smallint not null check (bottom_team_seed >= 1 and bottom_team_seed <= 16),
  winner_team_name text,
  espn_game_id text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'live', 'final')),
  top_score smallint,
  bottom_score smallint,
  advances_to_matchup_id uuid references public.tournament_royale_matchups (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (round_id, slot_index)
);

create index if not exists tournament_royale_matchups_event_idx
  on public.tournament_royale_matchups (event_id, round_id);

create table if not exists public.tournament_royale_picks (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.tournament_royale_entries (id) on delete cascade,
  matchup_id uuid not null references public.tournament_royale_matchups (id) on delete cascade,
  picked_team_name text not null,
  points_earned integer not null default 0,
  cinderella_points integer not null default 0,
  is_correct boolean,
  is_upset boolean not null default false,
  shield_applied boolean not null default false,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, matchup_id)
);

create index if not exists tournament_royale_picks_entry_idx
  on public.tournament_royale_picks (entry_id);

create table if not exists public.tournament_royale_shield_uses (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.tournament_royale_entries (id) on delete cascade,
  matchup_id uuid not null references public.tournament_royale_matchups (id) on delete cascade,
  round_label text not null,
  used_at timestamptz not null default now(),
  unique (entry_id)
);

create table if not exists public.tournament_royale_career_stats (
  email text not null,
  sport text not null,
  tournaments_played integer not null default 0,
  total_points integer not null default 0,
  best_finish_rank integer,
  perfect_rounds integer not null default 0,
  upset_picks_correct integer not null default 0,
  cinderella_peak integer not null default 0,
  shields_used integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (email, sport)
);

create table if not exists public.tournament_royale_hof_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text not null,
  event_id uuid references public.tournament_royale_events (id) on delete set null,
  category text not null
    check (category in (
      'champion', 'perfect_sweet_16', 'cinderella_king', 'upset_oracle',
      'combo_legend', 'community_favorite'
    )),
  season_year integer not null,
  detail text,
  inducted_at timestamptz not null default now()
);

alter table public.tournament_royale_events enable row level security;
alter table public.tournament_royale_pools enable row level security;
alter table public.tournament_royale_entries enable row level security;
alter table public.tournament_royale_rounds enable row level security;
alter table public.tournament_royale_matchups enable row level security;
alter table public.tournament_royale_picks enable row level security;
alter table public.tournament_royale_shield_uses enable row level security;
alter table public.tournament_royale_career_stats enable row level security;
alter table public.tournament_royale_hof_entries enable row level security;

create policy tournament_royale_events_read on public.tournament_royale_events
  for select using (true);

create policy tournament_royale_pools_read on public.tournament_royale_pools
  for select using (true);

create policy tournament_royale_entries_read on public.tournament_royale_entries
  for select using (true);

create policy tournament_royale_rounds_read on public.tournament_royale_rounds
  for select using (true);

create policy tournament_royale_matchups_read on public.tournament_royale_matchups
  for select using (true);

create policy tournament_royale_picks_read on public.tournament_royale_picks
  for select using (true);

create policy tournament_royale_shield_uses_read on public.tournament_royale_shield_uses
  for select using (true);

create policy tournament_royale_career_stats_read on public.tournament_royale_career_stats
  for select using (true);

create policy tournament_royale_hof_read on public.tournament_royale_hof_entries
  for select using (true);
