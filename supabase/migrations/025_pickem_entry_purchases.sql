-- Pick'em paid entry per contest + tier (Stripe checkout)

create table if not exists public.pickem_entry_purchases (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.pickem_contests (id) on delete cascade,
  league_id uuid references public.pickem_leagues (id) on delete set null,
  email text not null,
  entry_tier_cents bigint not null,
  amount_cents bigint not null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  unique (contest_id, email, entry_tier_cents)
);

create index if not exists pickem_entry_purchases_contest_idx
  on public.pickem_entry_purchases (contest_id, status);

create index if not exists pickem_entry_purchases_email_idx
  on public.pickem_entry_purchases (contest_id, email);

alter table public.pickem_entry_purchases enable row level security;

drop policy if exists "pickem_entry_purchases_select" on public.pickem_entry_purchases;
create policy "pickem_entry_purchases_select" on public.pickem_entry_purchases
  for select using (true);

drop policy if exists "pickem_entry_purchases_service" on public.pickem_entry_purchases;
create policy "pickem_entry_purchases_service" on public.pickem_entry_purchases
  for all using (true) with check (true);

comment on table public.pickem_entry_purchases is
  'Paid Pick''em weekly entry — one purchase per player per contest per entry tier.';
