-- Milestone 12: Optional payout amounts per winner (future-ready)

alter table public.winners
  add column if not exists payout_amount numeric(10, 2);
