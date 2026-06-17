-- First-deposit match bonus (play-only) + withdrawal review holds

create table if not exists public.deposit_bonus_grants (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  wallet_id uuid references public.square_wallets (id) on delete set null,
  deposit_reference_id text not null,
  deposit_amount_cents bigint not null check (deposit_amount_cents > 0),
  bonus_amount_cents bigint not null check (bonus_amount_cents > 0),
  max_bonus_cents bigint not null default 10000,
  payment_transaction_id text,
  bonus_ledger_id text,
  created_at timestamptz not null default now(),
  constraint deposit_bonus_grants_player_unique unique (player_email),
  constraint deposit_bonus_grants_bonus_cap check (bonus_amount_cents <= max_bonus_cents)
);

create index if not exists deposit_bonus_grants_player_idx
  on public.deposit_bonus_grants (player_email);

create table if not exists public.withdrawal_review_holds (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  wallet_id uuid references public.square_wallets (id) on delete set null,
  hold_reason text not null check (
    hold_reason in ('rapid_deposit_withdraw', 'large_withdrawal', 'kyc_pending')
  ),
  deposit_ledger_id text,
  deposit_at timestamptz,
  deposit_amount_cents bigint,
  withdrawal_ledger_id text not null,
  withdrawal_amount_cents bigint not null check (withdrawal_amount_cents > 0),
  hold_until timestamptz not null,
  status text not null default 'pending_review' check (
    status in ('pending_review', 'approved', 'rejected')
  ),
  metadata jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by_admin text,
  created_at timestamptz not null default now()
);

create index if not exists withdrawal_review_holds_status_idx
  on public.withdrawal_review_holds (status, created_at desc);

create index if not exists withdrawal_review_holds_player_idx
  on public.withdrawal_review_holds (player_email, created_at desc);

alter table public.deposit_bonus_grants enable row level security;
alter table public.withdrawal_review_holds enable row level security;

drop policy if exists "deposit_bonus_grants_service" on public.deposit_bonus_grants;
create policy "deposit_bonus_grants_service" on public.deposit_bonus_grants
  for all using (true) with check (true);

drop policy if exists "withdrawal_review_holds_service" on public.withdrawal_review_holds;
create policy "withdrawal_review_holds_service" on public.withdrawal_review_holds
  for all using (true) with check (true);

comment on table public.deposit_bonus_grants is
  'First-deposit 100% match bonus grants (one per player, play-only bonus_credits).';
comment on table public.withdrawal_review_holds is
  'Mandatory compliance holds — rapid deposit→withdraw and large withdrawal review queue.';
