-- The Huddle — Survivor X pick cards (share after kickoff)

create table if not exists public.huddle_survivor_posts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  entry_id uuid not null references public.survivor_entries (id) on delete cascade,
  week_id uuid not null references public.survivor_weeks (id) on delete cascade,
  league_id uuid not null references public.survivor_leagues (id) on delete cascade,
  week_label text not null,
  team_abbr text not null,
  team_name text not null,
  weeks_survived integer not null default 0 check (weeks_survived >= 0),
  shield_available boolean not null default false,
  tier_slug text,
  bio_snapshot text,
  like_count integer not null default 0 check (like_count >= 0),
  published_at timestamptz not null default now(),
  unique (entry_id, week_id)
);

create index if not exists huddle_survivor_posts_published_idx
  on public.huddle_survivor_posts (published_at desc);

create index if not exists huddle_survivor_posts_email_idx
  on public.huddle_survivor_posts (email);

create table if not exists public.huddle_survivor_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.huddle_survivor_posts (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (post_id, email)
);

alter table public.huddle_survivor_posts enable row level security;
alter table public.huddle_survivor_post_likes enable row level security;

create policy "huddle_survivor_posts_read"
  on public.huddle_survivor_posts for select using (true);

create policy "huddle_survivor_post_likes_read"
  on public.huddle_survivor_post_likes for select using (true);
