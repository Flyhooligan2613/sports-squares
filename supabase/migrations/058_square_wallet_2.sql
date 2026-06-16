-- SquareWallet™ 2.0 — ledger-backed player wallet (Platform Build Spec #011)
-- Migration 034 was a placeholder; this is the authoritative wallet schema.

create table if not exists public.square_wallets (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'closed')),
  lifetime_deposits_cents bigint not null default 0,
  lifetime_withdrawals_cents bigint not null default 0,
  lifetime_contest_entries_cents bigint not null default 0,
  lifetime_winnings_cents bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint square_wallets_player_email_unique unique (player_email)
);

create index if not exists square_wallets_player_email_idx
  on public.square_wallets (player_email);

create table if not exists public.square_wallet_balances (
  wallet_id uuid not null references public.square_wallets (id) on delete cascade,
  balance_type text not null check (
    balance_type in (
      'available',
      'pending_winnings',
      'pending_withdrawals',
      'contest_credits',
      'bonus_credits',
      'reward_credits',
      'promotional',
      'referral'
    )
  ),
  amount_cents bigint not null default 0 check (amount_cents >= 0),
  updated_at timestamptz not null default now(),
  primary key (wallet_id, balance_type)
);

create table if not exists public.square_wallet_ledger_entries (
  id text primary key,
  wallet_id uuid not null references public.square_wallets (id) on delete cascade,
  player_email text not null,
  balance_type text not null,
  direction text not null check (direction in ('credit', 'debit')),
  amount_cents bigint not null check (amount_cents > 0),
  running_balance_cents bigint,
  entry_type text not null,
  reference_type text,
  reference_id text,
  payment_transaction_id text references public.payment_transactions (id),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists square_wallet_ledger_wallet_idx
  on public.square_wallet_ledger_entries (wallet_id, created_at desc);

create index if not exists square_wallet_ledger_player_idx
  on public.square_wallet_ledger_entries (player_email, created_at desc);

create index if not exists square_wallet_ledger_payment_tx_idx
  on public.square_wallet_ledger_entries (payment_transaction_id)
  where payment_transaction_id is not null;

alter table public.square_wallets enable row level security;
alter table public.square_wallet_balances enable row level security;
alter table public.square_wallet_ledger_entries enable row level security;

drop policy if exists "square_wallets_service" on public.square_wallets;
create policy "square_wallets_service" on public.square_wallets
  for all using (true) with check (true);

drop policy if exists "square_wallet_balances_service" on public.square_wallet_balances;
create policy "square_wallet_balances_service" on public.square_wallet_balances
  for all using (true) with check (true);

drop policy if exists "square_wallet_ledger_service" on public.square_wallet_ledger_entries;
create policy "square_wallet_ledger_service" on public.square_wallet_ledger_entries
  for all using (true) with check (true);

comment on table public.square_wallets is
  'SquareWallet™ 2.0 — per-competitor wallet account and lifetime stats.';
comment on table public.square_wallet_balances is
  'SquareWallet™ 2.0 — typed balance buckets per wallet.';
comment on table public.square_wallet_ledger_entries is
  'SquareWallet™ 2.0 — immutable ledger entries (source of truth for balances).';
