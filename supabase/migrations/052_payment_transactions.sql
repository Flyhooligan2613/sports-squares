-- Transaction Center — centralized payment audit trail (PaymentEngine™ #005)
create table if not exists public.payment_transactions (
  id text primary key,
  player_email text not null,
  player_id text,
  contest_id text,
  pool_id text,
  provider text not null default 'stripe',
  provider_transaction_id text,
  wallet_type text check (wallet_type in ('available', 'pending')),
  payment_method_type text check (payment_method_type in ('card', 'bank_account', 'wallet', 'unknown')),
  payment_method_last4 text,
  transaction_type text not null check (
    transaction_type in (
      'deposit', 'withdrawal', 'contest_entry', 'prize_payout',
      'refund', 'reward_credit', 'wallet_transfer', 'authorization'
    )
  ),
  amount_cents integer not null default 0,
  fees_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending' check (
    status in ('pending', 'authorized', 'captured', 'completed', 'failed', 'cancelled', 'refunded')
  ),
  idempotency_key text,
  error_code text,
  error_message text,
  audit_log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payment_transactions_idempotency_idx
  on public.payment_transactions (idempotency_key)
  where idempotency_key is not null;

create index if not exists payment_transactions_player_email_idx
  on public.payment_transactions (player_email, created_at desc);

create index if not exists payment_transactions_provider_tx_idx
  on public.payment_transactions (provider_transaction_id)
  where provider_transaction_id is not null;

create index if not exists payment_transactions_contest_idx
  on public.payment_transactions (contest_id)
  where contest_id is not null;

create index if not exists payment_transactions_pool_idx
  on public.payment_transactions (pool_id)
  where pool_id is not null;

alter table public.payment_transactions enable row level security;

drop policy if exists "payment_transactions_service" on public.payment_transactions;
create policy "payment_transactions_service" on public.payment_transactions
  for all using (true) with check (true);

comment on table public.payment_transactions is
  'PaymentEngine Transaction Center — provider-agnostic financial audit trail.';
