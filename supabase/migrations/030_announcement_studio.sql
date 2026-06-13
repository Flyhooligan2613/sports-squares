-- Announcement Studio — uploads, analytics, templates, expanded targeting

-- Storage bucket for promo creatives (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'platform-announcements',
  'platform-announcements',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "platform_announcements_storage_public_read" on storage.objects;
create policy "platform_announcements_storage_public_read" on storage.objects
  for select using (bucket_id = 'platform-announcements');

drop policy if exists "platform_announcements_storage_service" on storage.objects;
create policy "platform_announcements_storage_service" on storage.objects
  for all using (bucket_id = 'platform-announcements') with check (bucket_id = 'platform-announcements');

alter table public.platform_announcements
  add column if not exists secondary_button_text text,
  add column if not exists secondary_destination_href text,
  add column if not exists timezone text not null default 'America/New_York',
  add column if not exists animation_style text not null default 'scale'
    check (animation_style in ('fade', 'scale', 'slide_up')),
  add column if not exists audience_emails text[] not null default '{}',
  add column if not exists template_key text;

alter table public.platform_announcements drop constraint if exists platform_announcements_audience_check;
alter table public.platform_announcements add constraint platform_announcements_audience_check
  check (audience in (
    'all', 'anonymous', 'new_players', 'returning_players',
    'squares_players', 'pickem_players', 'vip_players',
    'active_boards_players', 'no_purchases_players', 'email_list'
  ));

alter table public.platform_announcements drop constraint if exists platform_announcements_frequency_check;
alter table public.platform_announcements add constraint platform_announcements_frequency_check
  check (frequency in (
    'once', 'daily', 'weekly', 'always',
    'every_login', 'until_dismissed', 'never_after_click'
  ));

create table if not exists public.platform_announcement_events (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.platform_announcements (id) on delete cascade,
  viewer_key text not null,
  event_type text not null check (event_type in ('view', 'dismiss', 'click', 'secondary_click')),
  created_at timestamptz not null default now()
);

create index if not exists platform_announcement_events_announcement_idx
  on public.platform_announcement_events (announcement_id, event_type, created_at desc);

create index if not exists platform_announcement_events_viewer_idx
  on public.platform_announcement_events (viewer_key, announcement_id);

alter table public.platform_announcement_events enable row level security;

drop policy if exists "platform_announcement_events_select" on public.platform_announcement_events;
create policy "platform_announcement_events_select" on public.platform_announcement_events
  for select using (true);

drop policy if exists "platform_announcement_events_service" on public.platform_announcement_events;
create policy "platform_announcement_events_service" on public.platform_announcement_events
  for all using (true) with check (true);

create table if not exists public.platform_announcement_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.platform_announcement_templates enable row level security;

drop policy if exists "platform_announcement_templates_select" on public.platform_announcement_templates;
create policy "platform_announcement_templates_select" on public.platform_announcement_templates
  for select using (true);

drop policy if exists "platform_announcement_templates_service" on public.platform_announcement_templates;
create policy "platform_announcement_templates_service" on public.platform_announcement_templates
  for all using (true) with check (true);

comment on table public.platform_announcement_events is
  'Announcement analytics — views, dismissals, and button clicks.';

comment on table public.platform_announcement_templates is
  'Reusable announcement templates for the admin studio.';
