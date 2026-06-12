-- Connect sample: map demo users to Stripe Accounts v2 IDs + subscription cache

create table if not exists public.connect_sample_accounts (
  demo_user_email text primary key,
  stripe_account_id text not null unique,
  display_name text not null,
  subscription_status text,
  subscription_price_id text,
  subscription_current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists connect_sample_accounts_stripe_idx
  on public.connect_sample_accounts (stripe_account_id);

alter table public.connect_sample_accounts enable row level security;

grant all on table public.connect_sample_accounts to service_role;

drop policy if exists "connect_sample_accounts_service_role_all" on public.connect_sample_accounts;
create policy "connect_sample_accounts_service_role_all" on public.connect_sample_accounts
  for all to service_role using (true) with check (true);
