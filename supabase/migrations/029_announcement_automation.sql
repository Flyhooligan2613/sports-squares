-- Announcement automation — idempotent keys for cron-managed communications

alter table public.platform_announcements
  add column if not exists automation_key text,
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'automated'));

create unique index if not exists platform_announcements_automation_key_idx
  on public.platform_announcements (automation_key)
  where automation_key is not null;

create index if not exists platform_announcements_source_idx
  on public.platform_announcements (source, active);

comment on column public.platform_announcements.automation_key is
  'Stable key for automated upserts, e.g. auto:nfl_week_open:2026:2:6:top_banner';

comment on column public.platform_announcements.source is
  'manual = admin-created; automated = NFL calendar engine';
