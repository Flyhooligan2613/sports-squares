-- Public player profiles for shareable legacy pages

create table if not exists public.player_profiles (
  email text primary key,
  slug text not null unique,
  display_name text not null,
  favorite_team text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists player_profiles_slug_idx on public.player_profiles (slug);

alter table public.player_profiles enable row level security;

create policy "player_profiles_select" on public.player_profiles
  for select using (true);

create policy "player_profiles_insert" on public.player_profiles
  for insert with check (true);

create policy "player_profiles_update" on public.player_profiles
  for update using (true);
