-- Saved payment wallet + admin security flags

alter table public.player_auth_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists default_payment_method_id text,
  add column if not exists payment_method_brand text,
  add column if not exists payment_method_last4 text,
  add column if not exists account_suspended boolean not null default false,
  add column if not exists security_flagged boolean not null default false,
  add column if not exists suspended_at timestamptz,
  add column if not exists flagged_at timestamptz;

create index if not exists player_auth_profiles_stripe_customer_idx
  on public.player_auth_profiles (stripe_customer_id)
  where stripe_customer_id is not null;

comment on column public.player_auth_profiles.stripe_customer_id is
  'Stripe Customer for saved payment methods and fast checkout.';
comment on column public.player_auth_profiles.default_payment_method_id is
  'Default card PM id — never store full PAN; display metadata only.';
comment on column public.player_auth_profiles.account_suspended is
  'Admin suspension — blocks fast checkout and sensitive actions.';
