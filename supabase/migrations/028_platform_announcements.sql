-- Platform Announcement & Promotion System — admin-managed communication (not ads)

create table if not exists public.platform_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  button_text text,
  destination_href text,
  display_type text not null default 'top_banner'
    check (display_type in (
      'welcome_popup',
      'top_banner',
      'notification_card',
      'homepage_hero',
      'scrolling_ticker',
      'floating_toast',
      'live_event_banner'
    )),
  category text not null default 'feature_release'
    check (category in (
      'nfl_week_open',
      'thursday_night',
      'sunday_gameday',
      'monday_tiebreaker',
      'holiday',
      'promotion',
      'giveaway',
      'maintenance',
      'feature_release',
      'new_game',
      'personalized'
    )),
  audience text not null default 'all'
    check (audience in (
      'all',
      'anonymous',
      'new_players',
      'returning_players',
      'squares_players',
      'pickem_players',
      'vip_players'
    )),
  audience_regions text[] not null default '{}',
  priority integer not null default 0,
  dismissible boolean not null default true,
  frequency text not null default 'once'
    check (frequency in ('once', 'daily', 'weekly', 'always')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_announcements_active_idx
  on public.platform_announcements (active, starts_at desc, priority desc);

create index if not exists platform_announcements_schedule_idx
  on public.platform_announcements (starts_at, ends_at)
  where active = true;

create table if not exists public.platform_announcement_dismissals (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.platform_announcements (id) on delete cascade,
  viewer_key text not null,
  dismissed_at timestamptz not null default now(),
  unique (announcement_id, viewer_key)
);

create index if not exists platform_announcement_dismissals_viewer_idx
  on public.platform_announcement_dismissals (viewer_key, dismissed_at desc);

alter table public.platform_announcements enable row level security;
alter table public.platform_announcement_dismissals enable row level security;

drop policy if exists "platform_announcements_select" on public.platform_announcements;
create policy "platform_announcements_select" on public.platform_announcements
  for select using (true);

drop policy if exists "platform_announcements_service" on public.platform_announcements;
create policy "platform_announcements_service" on public.platform_announcements
  for all using (true) with check (true);

drop policy if exists "platform_announcement_dismissals_select" on public.platform_announcement_dismissals;
create policy "platform_announcement_dismissals_select" on public.platform_announcement_dismissals
  for select using (true);

drop policy if exists "platform_announcement_dismissals_service" on public.platform_announcement_dismissals;
create policy "platform_announcement_dismissals_service" on public.platform_announcement_dismissals
  for all using (true) with check (true);

comment on table public.platform_announcements is
  'Admin-managed platform communications — popups, banners, tickers, and event notices.';

comment on table public.platform_announcement_dismissals is
  'Per-viewer dismiss state for announcements (email or anonymous session key).';
