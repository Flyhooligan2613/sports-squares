-- Survivor Shields - Executive Directive 008

-- Every entry starts with one shield per season (auto-deploy on first loss).
alter table public.survivor_entries
  add column if not exists shield_available boolean not null default true,
  add column if not exists shield_used_week integer
    check (shield_used_week is null or shield_used_week >= 1),
  add column if not exists shield_used_at timestamptz;

-- Pick can resolve as shield_saved when the shield auto-activates.
alter table public.survivor_picks
  drop constraint if exists survivor_picks_result_check;

alter table public.survivor_picks
  add constraint survivor_picks_result_check
  check (result in ('pending', 'survived', 'eliminated', 'push', 'shield_saved'));

-- Audit trail for shield activations (supports future seasonal / limited designs).
create table if not exists public.survivor_shield_uses (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.survivor_entries (id) on delete cascade,
  league_id uuid not null references public.survivor_leagues (id) on delete cascade,
  week_id uuid references public.survivor_weeks (id) on delete set null,
  pick_id uuid references public.survivor_picks (id) on delete set null,
  email text not null,
  week_number integer not null check (week_number >= 1),
  team_abbr text,
  team_name text,
  shield_design text not null default 'classic',
  consumed_at timestamptz not null default now()
);

create index if not exists survivor_shield_uses_entry_idx
  on public.survivor_shield_uses (entry_id, consumed_at desc);

create index if not exists survivor_shield_uses_week_idx
  on public.survivor_shield_uses (league_id, week_number);

-- LegacyCore career tracking for shields.
alter table public.survivor_career_stats
  add column if not exists shield_saves_lifetime integer not null default 0
    check (shield_saves_lifetime >= 0),
  add column if not exists seasons_without_shield integer not null default 0
    check (seasons_without_shield >= 0),
  add column if not exists perfect_seasons_without_shield integer not null default 0
    check (perfect_seasons_without_shield >= 0);

-- Hall of Fame category for shield-related legends.
alter table public.survivor_hof_entries
  drop constraint if exists survivor_hof_entries_category_check;

alter table public.survivor_hof_entries
  add constraint survivor_hof_entries_category_check
  check (category in (
    'perfect_season',
    'longest_streak',
    'champion',
    'fastest_champion',
    'community_favorite',
    'most_seasons',
    'shield_savior',
    'untouchable'
  ));

alter table public.survivor_shield_uses enable row level security;

create policy "survivor_shield_uses_read"
  on public.survivor_shield_uses for select using (true);

-- Existing active entries receive their one shield for the current season.
update public.survivor_entries
set shield_available = true
where status in ('active', 'champion')
  and shield_used_week is null;
