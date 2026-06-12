-- Pick'em league sharding, weekly snapshots, and payout tracking

create table if not exists public.pickem_leagues (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  league_number integer not null,
  max_players integer not null default 5000,
  player_count integer not null default 0,
  prize_pool_cents bigint not null default 0,
  status text not null default 'open'
    check (status in ('open', 'full', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contest_id, league_number)
);

create index if not exists pickem_leagues_contest_idx
  on public.pickem_leagues (contest_id, league_number);

alter table public.pickem_picks
  add column if not exists league_id uuid references public.pickem_leagues (id) on delete set null;

alter table public.pickem_contests
  add column if not exists payout_status text not null default 'none'
    check (payout_status in ('none', 'pending', 'processing', 'paid', 'skipped'));

create table if not exists public.pickem_weekly_snapshots (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  league_id uuid references public.pickem_leagues (id) on delete cascade,
  email text not null,
  wins integer not null default 0,
  losses integer not null default 0,
  pending integer not null default 0,
  rank integer,
  updated_at timestamptz not null default now(),
  unique (contest_id, league_id, email)
);

create index if not exists pickem_weekly_snapshots_contest_rank_idx
  on public.pickem_weekly_snapshots (contest_id, rank);

create table if not exists public.pickem_payouts (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  league_id uuid references public.pickem_leagues (id) on delete set null,
  email text not null,
  place integer not null,
  amount_cents bigint not null,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'paid', 'failed', 'skipped')),
  stripe_transfer_id text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pickem_payouts_contest_idx
  on public.pickem_payouts (contest_id, status);

alter table public.pickem_leagues enable row level security;
alter table public.pickem_weekly_snapshots enable row level security;
alter table public.pickem_payouts enable row level security;

drop policy if exists "pickem_leagues_select" on public.pickem_leagues;
create policy "pickem_leagues_select" on public.pickem_leagues
  for select using (true);

drop policy if exists "pickem_leagues_service" on public.pickem_leagues;
create policy "pickem_leagues_service" on public.pickem_leagues
  for all using (true) with check (true);

drop policy if exists "pickem_weekly_snapshots_select" on public.pickem_weekly_snapshots;
create policy "pickem_weekly_snapshots_select" on public.pickem_weekly_snapshots
  for select using (true);

drop policy if exists "pickem_weekly_snapshots_service" on public.pickem_weekly_snapshots;
create policy "pickem_weekly_snapshots_service" on public.pickem_weekly_snapshots
  for all using (true) with check (true);

drop policy if exists "pickem_payouts_select" on public.pickem_payouts;
create policy "pickem_payouts_select" on public.pickem_payouts
  for select using (true);

drop policy if exists "pickem_payouts_service" on public.pickem_payouts;
create policy "pickem_payouts_service" on public.pickem_payouts
  for all using (true) with check (true);

comment on table public.pickem_leagues is
  'Auto-sharded leagues within a weekly contest when player capacity is reached.';

comment on table public.pickem_payouts is
  'Weekly Pick''em winner payouts — queued and processed automatically at week end.';
