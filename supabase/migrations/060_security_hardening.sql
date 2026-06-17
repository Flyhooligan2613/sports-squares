-- Pre-launch security hardening: financial tables service_role-only; tighten pool writes.

-- ---------------------------------------------------------------------------
-- SquareWallet™ — service_role only (server API uses service role)
-- ---------------------------------------------------------------------------
revoke all on table public.square_wallets from anon, authenticated;
revoke all on table public.square_wallet_balances from anon, authenticated;
revoke all on table public.square_wallet_ledger_entries from anon, authenticated;

grant all on table public.square_wallets to service_role;
grant all on table public.square_wallet_balances to service_role;
grant all on table public.square_wallet_ledger_entries to service_role;

drop policy if exists "square_wallets_service" on public.square_wallets;
drop policy if exists "square_wallet_balances_service" on public.square_wallet_balances;
drop policy if exists "square_wallet_ledger_service" on public.square_wallet_ledger_entries;

create policy "square_wallets_service_role_all" on public.square_wallets
  for all to service_role using (true) with check (true);

create policy "square_wallet_balances_service_role_all" on public.square_wallet_balances
  for all to service_role using (true) with check (true);

create policy "square_wallet_ledger_service_role_all" on public.square_wallet_ledger_entries
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- SquareBank™ — service_role only
-- ---------------------------------------------------------------------------
revoke all on table public.square_bank_transaction_seq from anon, authenticated;
revoke all on table public.square_bank_accounts from anon, authenticated;
revoke all on table public.square_bank_balances from anon, authenticated;
revoke all on table public.square_bank_ledger from anon, authenticated;
revoke all on table public.square_bank_audit_trail from anon, authenticated;
revoke all on table public.square_bank_reconciliation_runs from anon, authenticated;
revoke all on table public.square_bank_disputes from anon, authenticated;

grant all on table public.square_bank_transaction_seq to service_role;
grant all on table public.square_bank_accounts to service_role;
grant all on table public.square_bank_balances to service_role;
grant all on table public.square_bank_ledger to service_role;
grant all on table public.square_bank_audit_trail to service_role;
grant all on table public.square_bank_reconciliation_runs to service_role;
grant all on table public.square_bank_disputes to service_role;

drop policy if exists "square_bank_accounts_service" on public.square_bank_accounts;
drop policy if exists "square_bank_balances_service" on public.square_bank_balances;
drop policy if exists "square_bank_ledger_service" on public.square_bank_ledger;
drop policy if exists "square_bank_ledger_insert" on public.square_bank_ledger;
drop policy if exists "square_bank_audit_service" on public.square_bank_audit_trail;
drop policy if exists "square_bank_reconciliation_service" on public.square_bank_reconciliation_runs;
drop policy if exists "square_bank_disputes_service" on public.square_bank_disputes;
drop policy if exists "square_bank_seq_service" on public.square_bank_transaction_seq;

create policy "square_bank_accounts_service_role_all" on public.square_bank_accounts
  for all to service_role using (true) with check (true);

create policy "square_bank_balances_service_role_all" on public.square_bank_balances
  for all to service_role using (true) with check (true);

create policy "square_bank_ledger_service_role_all" on public.square_bank_ledger
  for all to service_role using (true) with check (true);

create policy "square_bank_audit_service_role_all" on public.square_bank_audit_trail
  for all to service_role using (true) with check (true);

create policy "square_bank_reconciliation_service_role_all" on public.square_bank_reconciliation_runs
  for all to service_role using (true) with check (true);

create policy "square_bank_disputes_service_role_all" on public.square_bank_disputes
  for all to service_role using (true) with check (true);

create policy "square_bank_seq_service_role_all" on public.square_bank_transaction_seq
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Pools — anon read-only; authenticated admin sessions retain writes (poolStore)
-- ---------------------------------------------------------------------------
drop policy if exists "pools_insert" on public.pools;
drop policy if exists "pools_update" on public.pools;
drop policy if exists "pools_delete" on public.pools;

revoke insert, update, delete on table public.pools from anon;
grant insert, update, delete on table public.pools to authenticated;
grant all on table public.pools to service_role;

create policy "pools_authenticated_write" on public.pools
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "pools_service_role_all" on public.pools;
create policy "pools_service_role_all" on public.pools
  for all to service_role
  using (true)
  with check (true);
