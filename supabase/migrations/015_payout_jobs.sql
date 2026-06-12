-- Event-driven payout job queue (survives restarts, supports retries)

create table if not exists public.payout_jobs (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete restrict,
  winner_id uuid references public.winners(id) on delete set null,
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

alter table public.payout_jobs enable row level security;
