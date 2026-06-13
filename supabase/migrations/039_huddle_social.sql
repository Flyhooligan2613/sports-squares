-- Phase 3: The Huddle social prediction feed

alter table public.player_profiles
  add column if not exists community_reputation integer not null default 0,
  add column if not exists creator_level text not null default 'community_rookie',
  add column if not exists is_community_verified boolean not null default false,
  add column if not exists verified_at timestamptz,
  add column if not exists follower_count integer not null default 0,
  add column if not exists following_count integer not null default 0;

create table if not exists public.huddle_player_follows (
  id uuid primary key default gen_random_uuid(),
  follower_email text not null,
  following_email text not null,
  created_at timestamptz not null default now(),
  unique (follower_email, following_email),
  check (follower_email <> following_email)
);

create index if not exists huddle_follows_follower_idx on public.huddle_player_follows (follower_email);
create index if not exists huddle_follows_following_idx on public.huddle_player_follows (following_email);

create table if not exists public.huddle_pick_posts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  contest_id uuid not null references public.pickem_contests(id) on delete cascade,
  week_label text not null,
  picks_snapshot jsonb not null default '[]'::jsonb,
  weekly_record text,
  weekly_streak integer not null default 0,
  tier_slug text,
  bio_snapshot text,
  like_count integer not null default 0,
  copy_count integer not null default 0,
  published_at timestamptz not null default now(),
  unique (email, contest_id)
);

create index if not exists huddle_pick_posts_contest_idx on public.huddle_pick_posts (contest_id, published_at desc);
create index if not exists huddle_pick_posts_email_idx on public.huddle_pick_posts (email);
create index if not exists huddle_pick_posts_trending_idx on public.huddle_pick_posts (copy_count desc, like_count desc);

create table if not exists public.huddle_pick_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.huddle_pick_posts(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (post_id, email)
);

create index if not exists huddle_likes_post_idx on public.huddle_pick_post_likes (post_id);

create table if not exists public.huddle_pick_copies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.huddle_pick_posts(id) on delete cascade,
  copier_email text not null,
  contest_id uuid not null references public.pickem_contests(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, copier_email)
);

create table if not exists public.huddle_pick_of_week (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests(id) on delete cascade unique,
  post_id uuid not null references public.huddle_pick_posts(id) on delete cascade,
  email text not null,
  featured_at timestamptz not null default now()
);

create table if not exists public.huddle_content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_email text not null,
  target_type text not null check (target_type in ('bio', 'pick_post', 'profile')),
  target_id text not null,
  reason text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now()
);

create table if not exists public.huddle_hall_of_fame (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  email text not null,
  display_name text not null,
  value numeric not null default 0,
  detail jsonb not null default '{}'::jsonb,
  inducted_at timestamptz not null default now(),
  unique (category, email)
);

create index if not exists huddle_hof_category_idx on public.huddle_hall_of_fame (category, value desc);

alter table public.huddle_player_follows enable row level security;
alter table public.huddle_pick_posts enable row level security;
alter table public.huddle_pick_post_likes enable row level security;
alter table public.huddle_pick_copies enable row level security;
alter table public.huddle_pick_of_week enable row level security;
alter table public.huddle_content_reports enable row level security;
alter table public.huddle_hall_of_fame enable row level security;

insert into public.ecosystem_admin_config (key, value)
values (
  'huddle_verification',
  '{"minFollowers":100,"minWinningWeeks":10,"minReputation":500,"requireGoodStanding":true}'::jsonb
)
on conflict (key) do nothing;
