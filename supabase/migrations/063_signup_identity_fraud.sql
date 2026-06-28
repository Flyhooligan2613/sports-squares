-- Signup identity hardening: DOB for age gate + fraud signal audit log
-- Phone uniqueness already enforced by player_profiles_phone_uidx (migration 035)
-- Email uniqueness via auth.users + player_profiles.email
-- Address is NOT unique — multiple household members may share an address

alter table public.player_profiles
  add column if not exists date_of_birth date;

comment on column public.player_profiles.date_of_birth is
  'Date of birth for 21+ age verification at signup and compliance.';

create table if not exists public.fraud_signal_log (
  id uuid primary key default gen_random_uuid(),
  signal_type text not null,
  player_email text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists fraud_signal_log_type_created_idx
  on public.fraud_signal_log (signal_type, created_at desc);

create index if not exists fraud_signal_log_email_idx
  on public.fraud_signal_log (player_email, created_at desc)
  where player_email is not null;

alter table public.fraud_signal_log enable row level security;

drop policy if exists "fraud_signal_log_service" on public.fraud_signal_log;
create policy "fraud_signal_log_service" on public.fraud_signal_log
  for all using (true) with check (true);

comment on table public.fraud_signal_log is
  'Audit trail for duplicate identity, billing ZIP mismatch, and other fraud signals.';
