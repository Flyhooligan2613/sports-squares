-- SquareBoards platform core: audit log, growth fund, guaranteed play, support categories

create table if not exists public.platform_audit_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  game_type text,
  entity_type text,
  entity_id text,
  actor_email text,
  actor_role text not null default 'system'
    check (actor_role in ('system', 'admin', 'player', 'stripe')),
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_audit_log_created_idx
  on public.platform_audit_log (created_at desc);

create index if not exists platform_audit_log_event_type_idx
  on public.platform_audit_log (event_type, created_at desc);

create table if not exists public.platform_growth_fund_ledger (
  id uuid primary key default gen_random_uuid(),
  amount_cents bigint not null,
  direction text not null default 'credit'
    check (direction in ('credit', 'debit')),
  source_type text not null,
  source_id text,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists platform_growth_fund_ledger_created_idx
  on public.platform_growth_fund_ledger (created_at desc);

alter table public.squares
  add column if not exists platform_owned boolean not null default false;

alter table public.pools
  add column if not exists guaranteed_fill_at timestamptz,
  add column if not exists entry_tier_cents integer;

alter table public.pickem_leagues
  add column if not exists entry_tier_cents bigint not null default 1000;

alter table public.support_threads
  add column if not exists priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high'));

alter table public.platform_audit_log enable row level security;
alter table public.platform_growth_fund_ledger enable row level security;

drop policy if exists "platform_audit_log_select" on public.platform_audit_log;
create policy "platform_audit_log_select" on public.platform_audit_log
  for select using (true);

drop policy if exists "platform_audit_log_service" on public.platform_audit_log;
create policy "platform_audit_log_service" on public.platform_audit_log
  for all using (true) with check (true);

drop policy if exists "platform_growth_fund_select" on public.platform_growth_fund_ledger;
create policy "platform_growth_fund_select" on public.platform_growth_fund_ledger
  for select using (true);

drop policy if exists "platform_growth_fund_service" on public.platform_growth_fund_ledger;
create policy "platform_growth_fund_service" on public.platform_growth_fund_ledger
  for all using (true) with check (true);

comment on table public.platform_audit_log is
  'Immutable-style platform event stream for admin monitoring.';

comment on table public.platform_growth_fund_ledger is
  'Platform Growth Fund — winnings from platform-owned entries fund promotions.';
