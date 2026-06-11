-- Milestone 13: Entry fees, pool pot, and payout management

alter table public.pools
  add column if not exists cost_per_square numeric(10, 2) not null default 0
    check (cost_per_square >= 0),
  add column if not exists service_fee_percent numeric(5, 2) not null default 0
    check (service_fee_percent >= 0 and service_fee_percent <= 100);

alter table public.players
  add column if not exists amount_paid numeric(10, 2) not null default 0
    check (amount_paid >= 0),
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('paid', 'unpaid', 'partial'));

alter table public.winners
  add column if not exists payout_status text not null default 'pending'
    check (payout_status in ('pending', 'paid', 'unpaid'));
