-- Universal Podium Reward System™ — career finish tracking across contest types.

create table if not exists public.podium_finishes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  contest_kind text not null
    check (contest_kind in ('pickem_weekly', 'pickem_season', 'tournament_royale', 'bracket')),
  contest_id uuid not null,
  league_id uuid,
  sport text,
  season_year integer,
  placement integer not null check (placement between 1 and 10),
  near_perfect boolean not null default false,
  cash_cents bigint not null default 0,
  platform_rewards jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists podium_finishes_email_idx
  on public.podium_finishes (email, created_at desc);

create index if not exists podium_finishes_contest_idx
  on public.podium_finishes (contest_kind, contest_id);

create index if not exists podium_finishes_placement_idx
  on public.podium_finishes (email, placement)
  where near_perfect = false;

alter table public.podium_finishes enable row level security;

drop policy if exists "podium_finishes_select" on public.podium_finishes;
create policy "podium_finishes_select" on public.podium_finishes
  for select using (true);

drop policy if exists "podium_finishes_service" on public.podium_finishes;
create policy "podium_finishes_service" on public.podium_finishes
  for all using (true) with check (true);

comment on table public.podium_finishes is
  'Podium Reward Engine™ — 1st/2nd/3rd and Near Perfect™ finishes for Competitor Card stats.';
