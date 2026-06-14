-- Web push subscriptions + delivery log for device notifications (PWA / mobile web).

create table if not exists public.player_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  platform text not null default 'web',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists player_push_subscriptions_email_idx
  on public.player_push_subscriptions (email);

create table if not exists public.push_notification_log (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  destination_url text not null default '/',
  source text not null default 'manual' check (source in ('manual', 'daily_automation', 'event')),
  automation_key text,
  sent_by text,
  subscriber_count integer not null default 0,
  success_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists push_notification_log_created_idx
  on public.push_notification_log (created_at desc);

create table if not exists public.push_digest_settings (
  id text primary key default 'default',
  daily_enabled boolean not null default true,
  daily_hour_et integer not null default 9 check (daily_hour_et >= 0 and daily_hour_et <= 23),
  updated_at timestamptz not null default now()
);

insert into public.push_digest_settings (id, daily_enabled, daily_hour_et)
values ('default', true, 9)
on conflict (id) do nothing;
