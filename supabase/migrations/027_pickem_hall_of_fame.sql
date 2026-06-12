-- Pick'em Hall of Fame — permanent season archives and top standings

create table if not exists public.pickem_season_archives (
  id uuid primary key default gen_random_uuid(),
  sport text not null default 'nfl',
  season_year integer not null,
  champion_email text,
  champion_display_name text,
  champion_record text,
  champion_accuracy_pct numeric(5,1),
  champion_longest_streak integer not null default 0,
  champion_perfect_weeks integer not null default 0,
  champion_earnings_cents bigint not null default 0,
  total_players integer not null default 0,
  total_weeks integer not null default 0,
  archived_at timestamptz not null default now(),
  unique (sport, season_year)
);

create table if not exists public.pickem_season_standings (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.pickem_season_archives (id) on delete cascade,
  rank integer not null,
  email text not null,
  display_name text,
  season_wins integer not null default 0,
  season_losses integer not null default 0,
  pick_accuracy_pct numeric(5,1) not null default 0,
  longest_streak integer not null default 0,
  perfect_weeks integer not null default 0,
  lifetime_pickem_wins integer not null default 0,
  earnings_cents bigint not null default 0,
  unique (archive_id, rank)
);

create index if not exists pickem_season_archives_year_idx
  on public.pickem_season_archives (season_year desc);

create index if not exists pickem_season_standings_archive_idx
  on public.pickem_season_standings (archive_id, rank);

alter table public.pickem_season_archives enable row level security;
alter table public.pickem_season_standings enable row level security;

drop policy if exists "pickem_season_archives_select" on public.pickem_season_archives;
create policy "pickem_season_archives_select" on public.pickem_season_archives
  for select using (true);

drop policy if exists "pickem_season_archives_service" on public.pickem_season_archives;
create policy "pickem_season_archives_service" on public.pickem_season_archives
  for all using (true) with check (true);

drop policy if exists "pickem_season_standings_select" on public.pickem_season_standings;
create policy "pickem_season_standings_select" on public.pickem_season_standings
  for select using (true);

drop policy if exists "pickem_season_standings_service" on public.pickem_season_standings;
create policy "pickem_season_standings_service" on public.pickem_season_standings
  for all using (true) with check (true);

comment on table public.pickem_season_archives is
  'Permanent Pick''em season archive — champion snapshot when a season completes.';

comment on table public.pickem_season_standings is
  'Top 100 historical standings per archived Pick''em season.';
