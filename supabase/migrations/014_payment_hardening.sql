-- Purchase ledger + webhook deduplication for production-safe payments

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  pool_id uuid not null references public.pools(id) on delete restrict,
  player_id uuid references public.players(id) on delete set null,
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
create index if not exists purchases_payment_intent_idx
  on public.purchases(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table public.stripe_webhook_events enable row level security;
alter table public.purchases enable row level security;

-- Service role only (no public policies; fulfillment uses service_role)
