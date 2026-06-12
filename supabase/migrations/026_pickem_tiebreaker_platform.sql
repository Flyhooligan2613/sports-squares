-- Pick'em worldwide platform: 1,000 player pools, Monday tiebreaker, player status & history

-- 1. Pool capacity: 1,000 players per shard
alter table public.pickem_leagues
  alter column max_players set default 1000;

update public.pickem_leagues
set max_players = 1000
where max_players > 1000;

-- 2. Monday Night Football flag for tiebreaker game
alter table public.pickem_games
  add column if not exists is_monday_night boolean not null default false;

-- 3. League resolution lifecycle
alter table public.pickem_leagues
  add column if not exists resolution_status text not null default 'open'
    check (resolution_status in (
      'open',
      'sunday_complete',
      'tiebreaker_active',
      'complete',
      'payout_pending'
    ));

-- 4. Monday Night tiebreaker sessions (one per pool/league)
create table if not exists public.pickem_tiebreakers (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  league_id uuid not null references public.pickem_leagues (id) on delete cascade,
  monday_game_id uuid references public.pickem_games (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'locked', 'complete', 'split')),
  actual_total_points integer,
  winner_count integer not null default 0,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (league_id)
);

create index if not exists pickem_tiebreakers_contest_idx
  on public.pickem_tiebreakers (contest_id, status);

-- 5. Tiebreaker total-point predictions (tied players only)
create table if not exists public.pickem_tiebreaker_entries (
  id uuid primary key default gen_random_uuid(),
  tiebreaker_id uuid not null references public.pickem_tiebreakers (id) on delete cascade,
  email text not null,
  predicted_total integer,
  distance integer,
  submitted_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tiebreaker_id, email)
);

create index if not exists pickem_tiebreaker_entries_email_idx
  on public.pickem_tiebreaker_entries (tiebreaker_id, email);

-- 6. Per-player weekly pool status
create table if not exists public.pickem_player_week_results (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  league_id uuid not null references public.pickem_leagues (id) on delete cascade,
  email text not null,
  sunday_wins integer not null default 0,
  sunday_losses integer not null default 0,
  sunday_record text not null default '0-0',
  status text not null default 'active'
    check (status in (
      'active',
      'eliminated',
      'tiebreaker',
      'winner',
      'prize_split'
    )),
  finish_place integer,
  payout_cents bigint not null default 0,
  updated_at timestamptz not null default now(),
  unique (contest_id, league_id, email)
);

create index if not exists pickem_player_week_results_league_idx
  on public.pickem_player_week_results (league_id, status);

-- 7. Permanent weekly history
create table if not exists public.pickem_week_history (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  league_id uuid references public.pickem_leagues (id) on delete set null,
  sport text not null,
  season_year integer not null,
  week_label text not null,
  entry_tier_cents bigint not null default 1000,
  pool_number integer not null default 1,
  weekly_record text not null,
  finish_place integer,
  status text not null,
  earnings_cents bigint not null default 0,
  tiebreaker_used boolean not null default false,
  created_at timestamptz not null default now(),
  unique (email, contest_id, league_id)
);

create index if not exists pickem_week_history_email_idx
  on public.pickem_week_history (email, season_year desc);

-- 8. Extended lifetime stats
alter table public.pickem_player_stats
  add column if not exists monday_tiebreaker_wins integer not null default 0;

alter table public.pickem_player_stats
  add column if not exists lifetime_earnings_cents bigint not null default 0;

alter table public.pickem_player_stats
  add column if not exists best_finish integer;

alter table public.pickem_player_stats
  add column if not exists lifetime_pickem_wins integer not null default 0;

alter table public.pickem_player_stats
  add column if not exists best_weekly_record text;

-- RLS
alter table public.pickem_tiebreakers enable row level security;
alter table public.pickem_tiebreaker_entries enable row level security;
alter table public.pickem_player_week_results enable row level security;
alter table public.pickem_week_history enable row level security;

drop policy if exists "pickem_tiebreakers_select" on public.pickem_tiebreakers;
create policy "pickem_tiebreakers_select" on public.pickem_tiebreakers
  for select using (true);

drop policy if exists "pickem_tiebreakers_service" on public.pickem_tiebreakers;
create policy "pickem_tiebreakers_service" on public.pickem_tiebreakers
  for all using (true) with check (true);

drop policy if exists "pickem_tiebreaker_entries_select" on public.pickem_tiebreaker_entries;
create policy "pickem_tiebreaker_entries_select" on public.pickem_tiebreaker_entries
  for select using (true);

drop policy if exists "pickem_tiebreaker_entries_service" on public.pickem_tiebreaker_entries;
create policy "pickem_tiebreaker_entries_service" on public.pickem_tiebreaker_entries
  for all using (true) with check (true);

drop policy if exists "pickem_player_week_results_select" on public.pickem_player_week_results;
create policy "pickem_player_week_results_select" on public.pickem_player_week_results
  for select using (true);

drop policy if exists "pickem_player_week_results_service" on public.pickem_player_week_results;
create policy "pickem_player_week_results_service" on public.pickem_player_week_results
  for all using (true) with check (true);

drop policy if exists "pickem_week_history_select" on public.pickem_week_history;
create policy "pickem_week_history_select" on public.pickem_week_history
  for select using (true);

drop policy if exists "pickem_week_history_service" on public.pickem_week_history;
create policy "pickem_week_history_service" on public.pickem_week_history
  for all using (true) with check (true);

comment on table public.pickem_tiebreakers is
  'Monday Night Football total-points tiebreaker — one per pool when top records tie after Sunday.';

comment on table public.pickem_player_week_results is
  'Live player status per weekly pool: active, eliminated, tiebreaker, winner, prize_split.';
