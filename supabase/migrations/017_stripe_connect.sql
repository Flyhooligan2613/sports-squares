-- Stripe Connect payout accounts + text-ID payment tables

-- Connect fields keyed by player email (cross-pool identity)
alter table public.player_profiles
  add column if not exists stripe_connect_account_id text,
  add column if not exists stripe_connect_details_submitted boolean not null default false,
  add column if not exists stripe_connect_payouts_enabled boolean not null default false,
  add column if not exists stripe_connect_onboarded_at timestamptz;

create unique index if not exists player_profiles_connect_account_uidx
  on public.player_profiles (stripe_connect_account_id)
  where stripe_connect_account_id is not null;

-- Payment ledger (text IDs — matches app generateId() schema)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  pool_id text not null references public.pools(id) on delete restrict,
  player_id text references public.players(id) on delete set null,
  email text not null,
  squares_count integer not null check (squares_count > 0),
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'fulfilled'
    check (status in ('pending', 'fulfilled', 'refunded', 'failed')),
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  refunded_at timestamptz
);

create index if not exists purchases_pool_id_idx on public.purchases(pool_id);
create index if not exists purchases_email_idx on public.purchases(pool_id, email);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

-- Payout job queue (text IDs — matches app generateId() schema)
create table if not exists public.payout_jobs (
  id uuid primary key default gen_random_uuid(),
  pool_id text not null references public.pools(id) on delete restrict,
  winner_id text references public.winners(id) on delete set null,
  quarter text not null,
  winning_player text not null,
  winning_square integer not null,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  last_error text,
  stripe_transfer_id text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,
  next_retry_at timestamptz
);

create index if not exists payout_jobs_status_idx on public.payout_jobs(status);
create index if not exists payout_jobs_pool_id_idx on public.payout_jobs(pool_id);
create index if not exists payout_jobs_next_retry_idx
  on public.payout_jobs(next_retry_at)
  where status in ('queued', 'failed');

alter table public.purchases enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.payout_jobs enable row level security;

grant all on table public.purchases to service_role;
grant all on table public.stripe_webhook_events to service_role;
grant all on table public.payout_jobs to service_role;

drop policy if exists "purchases_service_role_all" on public.purchases;
create policy "purchases_service_role_all" on public.purchases
  for all to service_role using (true) with check (true);

drop policy if exists "stripe_webhook_events_service_role_all" on public.stripe_webhook_events;
create policy "stripe_webhook_events_service_role_all" on public.stripe_webhook_events
  for all to service_role using (true) with check (true);

drop policy if exists "payout_jobs_service_role_all" on public.payout_jobs;
create policy "payout_jobs_service_role_all" on public.payout_jobs
  for all to service_role using (true) with check (true);
