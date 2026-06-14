-- EventEngine™ — central platform event stream (Architecture Directive #002)

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  idempotency_key text unique,
  event_type text not null,
  priority text not null default 'normal'
    check (priority in ('critical', 'high', 'normal', 'low', 'background')),
  occurred_at timestamptz not null,
  actor_email text,
  actor_role text not null default 'system'
    check (actor_role in ('system', 'admin', 'player', 'stripe')),
  entity_type text,
  entity_id text,
  game_type text,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_events_occurred_idx
  on public.platform_events (occurred_at desc);

create index if not exists platform_events_type_idx
  on public.platform_events (event_type, occurred_at desc);

create index if not exists platform_events_entity_idx
  on public.platform_events (entity_type, entity_id, occurred_at desc)
  where entity_type is not null and entity_id is not null;

create table if not exists public.platform_event_failures (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  handler_name text not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

create index if not exists platform_event_failures_event_idx
  on public.platform_event_failures (event_id, created_at desc);

alter table public.platform_events enable row level security;
alter table public.platform_event_failures enable row level security;

drop policy if exists "platform_events_select" on public.platform_events;
create policy "platform_events_select" on public.platform_events
  for select using (true);

drop policy if exists "platform_events_service" on public.platform_events;
create policy "platform_events_service" on public.platform_events
  for all using (true) with check (true);

drop policy if exists "platform_event_failures_service" on public.platform_event_failures;
create policy "platform_event_failures_service" on public.platform_event_failures
  for all using (true) with check (true);

comment on table public.platform_events is
  'EventEngine™ immutable event stream — every meaningful platform action.';

comment on table public.platform_event_failures is
  'EventEngine subscriber failures for retry and dead-letter review.';
