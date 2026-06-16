-- SquareBank™ Financial Core — Platform Build Spec #012
-- Source of truth for all platform balances; SquareWallet™ is presentation-only.

create table if not exists public.square_bank_transaction_seq (
  year int primary key,
  last_value bigint not null default 0
);

create table if not exists public.square_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  wallet_id uuid references public.square_wallets (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'suspended', 'closed', 'fraud_hold')),
  lifetime_deposits_cents bigint not null default 0,
  lifetime_withdrawals_cents bigint not null default 0,
  lifetime_contest_entries_cents bigint not null default 0,
  lifetime_winnings_cents bigint not null default 0,
  kyc_status text not null default 'none' check (kyc_status in ('none', 'pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint square_bank_accounts_player_email_unique unique (player_email)
);

create index if not exists square_bank_accounts_player_email_idx
  on public.square_bank_accounts (player_email);

create index if not exists square_bank_accounts_wallet_id_idx
  on public.square_bank_accounts (wallet_id)
  where wallet_id is not null;

create table if not exists public.square_bank_balances (
  account_id uuid not null references public.square_bank_accounts (id) on delete cascade,
  account_type text not null check (
    account_type in (
      'available_cash',
      'pending_cash',
      'contest_credits',
      'bonus_credits',
      'reward_credits',
      'referral_credits',
      'promotional_credits',
      'locked_funds',
      'reserved_funds',
      'marketplace_credits'
    )
  ),
  amount_cents bigint not null default 0 check (amount_cents >= 0),
  updated_at timestamptz not null default now(),
  primary key (account_id, account_type)
);

create table if not exists public.square_bank_ledger (
  id text primary key,
  account_id uuid not null references public.square_bank_accounts (id) on delete restrict,
  player_email text not null,
  account_type text not null,
  direction text not null check (direction in ('credit', 'debit')),
  amount_cents bigint not null check (amount_cents > 0),
  running_balance_cents bigint,
  entry_type text not null,
  reference_type text,
  reference_id text,
  payment_transaction_id text references public.payment_transactions (id),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  module text,
  admin_email text,
  created_at timestamptz not null default now()
);

create index if not exists square_bank_ledger_account_idx
  on public.square_bank_ledger (account_id, created_at desc);

create index if not exists square_bank_ledger_player_idx
  on public.square_bank_ledger (player_email, created_at desc);

create index if not exists square_bank_ledger_entry_type_idx
  on public.square_bank_ledger (entry_type, created_at desc);

create table if not exists public.square_bank_audit_trail (
  id uuid primary key default gen_random_uuid(),
  ledger_entry_id text not null references public.square_bank_ledger (id) on delete restrict,
  player_email text not null,
  action text not null,
  amount_cents bigint not null,
  balance_before_cents bigint not null,
  balance_after_cents bigint not null,
  account_type text not null,
  reference_type text,
  reference_id text,
  module text,
  admin_email text,
  device_key text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists square_bank_audit_player_idx
  on public.square_bank_audit_trail (player_email, created_at desc);

create table if not exists public.square_bank_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  payment_engine_total_cents bigint,
  ledger_total_cents bigint,
  contest_total_cents bigint,
  mismatch_count int not null default 0,
  mismatch_details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.square_bank_disputes (
  id uuid primary key default gen_random_uuid(),
  ledger_entry_id text references public.square_bank_ledger (id) on delete set null,
  player_email text not null,
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'closed')),
  dispute_type text not null default 'transaction',
  amount_cents bigint not null default 0,
  contest_id text,
  payment_transaction_id text,
  timeline jsonb not null default '[]'::jsonb,
  resolution_notes text,
  assigned_admin_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists square_bank_disputes_status_idx
  on public.square_bank_disputes (status, created_at desc);

-- Migrate existing wallet accounts into SquareBank (idempotent)
insert into public.square_bank_accounts (
  player_email,
  wallet_id,
  status,
  lifetime_deposits_cents,
  lifetime_withdrawals_cents,
  lifetime_contest_entries_cents,
  lifetime_winnings_cents,
  created_at,
  updated_at
)
select
  w.player_email,
  w.id,
  w.status,
  w.lifetime_deposits_cents,
  w.lifetime_withdrawals_cents,
  w.lifetime_contest_entries_cents,
  w.lifetime_winnings_cents,
  w.created_at,
  w.updated_at
from public.square_wallets w
where not exists (
  select 1 from public.square_bank_accounts b where b.player_email = w.player_email
);

-- Seed bank balances from wallet balances
insert into public.square_bank_balances (account_id, account_type, amount_cents, updated_at)
select
  b.id,
  case wb.balance_type
    when 'available' then 'available_cash'
    when 'pending_winnings' then 'pending_cash'
    when 'pending_withdrawals' then 'reserved_funds'
    when 'contest_credits' then 'contest_credits'
    when 'bonus_credits' then 'bonus_credits'
    when 'reward_credits' then 'reward_credits'
    when 'promotional' then 'promotional_credits'
    when 'referral' then 'referral_credits'
    else 'available_cash'
  end,
  wb.amount_cents,
  wb.updated_at
from public.square_wallet_balances wb
join public.square_wallets w on w.id = wb.wallet_id
join public.square_bank_accounts b on b.wallet_id = w.id
on conflict (account_id, account_type) do nothing;

-- Initialize zero balances for new account types
insert into public.square_bank_balances (account_id, account_type, amount_cents)
select b.id, t.account_type, 0
from public.square_bank_accounts b
cross join (
  values
    ('available_cash'),
    ('pending_cash'),
    ('contest_credits'),
    ('bonus_credits'),
    ('reward_credits'),
    ('referral_credits'),
    ('promotional_credits'),
    ('locked_funds'),
    ('reserved_funds'),
    ('marketplace_credits')
) as t(account_type)
on conflict (account_id, account_type) do nothing;

alter table public.square_bank_accounts enable row level security;
alter table public.square_bank_balances enable row level security;
alter table public.square_bank_ledger enable row level security;
alter table public.square_bank_audit_trail enable row level security;
alter table public.square_bank_reconciliation_runs enable row level security;
alter table public.square_bank_disputes enable row level security;
alter table public.square_bank_transaction_seq enable row level security;

drop policy if exists "square_bank_accounts_service" on public.square_bank_accounts;
create policy "square_bank_accounts_service" on public.square_bank_accounts
  for all using (true) with check (true);

drop policy if exists "square_bank_balances_service" on public.square_bank_balances;
create policy "square_bank_balances_service" on public.square_bank_balances
  for all using (true) with check (true);

drop policy if exists "square_bank_ledger_service" on public.square_bank_ledger;
create policy "square_bank_ledger_service" on public.square_bank_ledger
  for select using (true);

drop policy if exists "square_bank_ledger_insert" on public.square_bank_ledger;
create policy "square_bank_ledger_insert" on public.square_bank_ledger
  for insert with check (true);

drop policy if exists "square_bank_audit_service" on public.square_bank_audit_trail;
create policy "square_bank_audit_service" on public.square_bank_audit_trail
  for all using (true) with check (true);

drop policy if exists "square_bank_reconciliation_service" on public.square_bank_reconciliation_runs;
create policy "square_bank_reconciliation_service" on public.square_bank_reconciliation_runs
  for all using (true) with check (true);

drop policy if exists "square_bank_disputes_service" on public.square_bank_disputes;
create policy "square_bank_disputes_service" on public.square_bank_disputes
  for all using (true) with check (true);

drop policy if exists "square_bank_seq_service" on public.square_bank_transaction_seq;
create policy "square_bank_seq_service" on public.square_bank_transaction_seq
  for all using (true) with check (true);

comment on table public.square_bank_accounts is
  'SquareBank™ — financial account per competitor (source of truth).';
comment on table public.square_bank_ledger is
  'SquareBank™ — immutable append-only ledger; never UPDATE or DELETE in app code.';
comment on table public.square_bank_balances is
  'SquareBank™ — materialized balances derived from ledger postings.';
