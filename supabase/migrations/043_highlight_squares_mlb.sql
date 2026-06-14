-- Highlight Squares™ + MLB Squares scoring periods

-- ---------------------------------------------------------------------------
-- pool_highlight_squares
-- ---------------------------------------------------------------------------
create table if not exists public.pool_highlight_squares (
  id uuid primary key default gen_random_uuid(),
  pool_id text not null references public.pools (id) on delete cascade,
  square_number integer not null check (square_number >= 0 and square_number < 100),
  assignment_seed text not null,
  reward_credits integer not null default 25 check (reward_credits > 0),
  activated_at timestamptz,
  activated_period text,
  owner_email text,
  created_at timestamptz not null default now(),
  unique (pool_id, square_number)
);

create index if not exists pool_highlight_squares_pool_idx
  on public.pool_highlight_squares (pool_id);

alter table public.pool_highlight_squares enable row level security;

create policy "pool_highlight_squares_read"
  on public.pool_highlight_squares for select using (true);

create policy "pool_highlight_squares_service"
  on public.pool_highlight_squares for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- MLB sport + inning winner periods
-- ---------------------------------------------------------------------------
alter table public.pools drop constraint if exists pools_espn_sport_check;

alter table public.pools add constraint pools_espn_sport_check
  check (espn_sport in ('nfl', 'ncaaf', 'nba', 'ncaab', 'mlb'));

alter table public.winners drop constraint if exists winners_quarter_check;

alter table public.winners add constraint winners_quarter_check
  check (quarter in ('Q1', 'Q2', 'Q3', 'Q4', '1H', '2H', 'INN3', 'INN5', 'INN7', 'FINAL'));
