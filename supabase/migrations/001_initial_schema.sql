-- Sports Squares — Milestone 8 initial schema
-- Run in Supabase SQL Editor: Dashboard → SQL → New query

-- ---------------------------------------------------------------------------
-- pools
-- ---------------------------------------------------------------------------
create table if not exists public.pools (
  id text primary key,
  name text not null,
  home_team text not null,
  away_team text not null,
  invite_code text not null,
  status text not null default 'open'
    check (status in ('open', 'locked', 'numbers-drawn', 'completed', 'archived')),
  -- Required for number-draw UI (not in original spec, preserved for app behavior)
  top_numbers smallint[],
  side_numbers smallint[],
  created_at timestamptz not null default now()
);

create index if not exists pools_status_idx on public.pools (status);
create index if not exists pools_created_at_idx on public.pools (created_at desc);

-- ---------------------------------------------------------------------------
-- players
-- ---------------------------------------------------------------------------
create table if not exists public.players (
  id text primary key,
  pool_id text not null references public.pools (id) on delete cascade,
  name text not null,
  credits_allocated integer not null default 0 check (credits_allocated >= 0),
  credits_used integer not null default 0 check (credits_used >= 0),
  -- UI fields preserved from local app model
  initials text not null default '',
  color text,
  created_at timestamptz not null default now(),
  unique (pool_id, name)
);

create index if not exists players_pool_id_idx on public.players (pool_id);

-- ---------------------------------------------------------------------------
-- squares
-- ---------------------------------------------------------------------------
create table if not exists public.squares (
  id text primary key,
  pool_id text not null references public.pools (id) on delete cascade,
  square_number integer not null check (square_number >= 0 and square_number < 100),
  player_id text references public.players (id) on delete set null,
  claimed boolean not null default false,
  row_digit smallint check (row_digit is null or (row_digit >= 0 and row_digit <= 9)),
  column_digit smallint check (column_digit is null or (column_digit >= 0 and column_digit <= 9)),
  unique (pool_id, square_number)
);

create index if not exists squares_pool_id_idx on public.squares (pool_id);
create index if not exists squares_player_id_idx on public.squares (player_id);

-- ---------------------------------------------------------------------------
-- winners
-- ---------------------------------------------------------------------------
create table if not exists public.winners (
  id text primary key,
  pool_id text not null references public.pools (id) on delete cascade,
  quarter text not null check (quarter in ('Q1', 'Q2', 'Q3', 'Q4', 'FINAL')),
  winning_square integer not null check (winning_square >= 0 and winning_square < 100),
  winning_player text not null,
  home_score integer not null,
  away_score integer not null,
  created_at timestamptz not null default now(),
  unique (pool_id, quarter)
);

create index if not exists winners_pool_id_idx on public.winners (pool_id);

-- ---------------------------------------------------------------------------
-- Row Level Security (permissive — admin auth is enforced in the app)
-- ---------------------------------------------------------------------------
alter table public.pools enable row level security;
alter table public.players enable row level security;
alter table public.squares enable row level security;
alter table public.winners enable row level security;

create policy "pools_select" on public.pools for select using (true);
create policy "pools_insert" on public.pools for insert with check (true);
create policy "pools_update" on public.pools for update using (true);
create policy "pools_delete" on public.pools for delete using (true);

create policy "players_select" on public.players for select using (true);
create policy "players_insert" on public.players for insert with check (true);
create policy "players_update" on public.players for update using (true);
create policy "players_delete" on public.players for delete using (true);

create policy "squares_select" on public.squares for select using (true);
create policy "squares_insert" on public.squares for insert with check (true);
create policy "squares_update" on public.squares for update using (true);
create policy "squares_delete" on public.squares for delete using (true);

create policy "winners_select" on public.winners for select using (true);
create policy "winners_insert" on public.winners for insert with check (true);
create policy "winners_update" on public.winners for update using (true);
create policy "winners_delete" on public.winners for delete using (true);
