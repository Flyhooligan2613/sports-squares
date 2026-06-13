-- Player auth security: trusted devices, WebAuthn passkeys, security events

create table if not exists public.player_auth_profiles (
  email text primary key,
  auth_user_id uuid,
  email_verified_at timestamptz,
  remember_me boolean not null default true,
  biometric_prompted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_trusted_devices (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  device_key text not null,
  device_name text not null,
  platform text not null default 'web',
  user_agent text,
  last_active_at timestamptz not null default now(),
  registered_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (email, device_key)
);

create index if not exists player_trusted_devices_email_idx
  on public.player_trusted_devices (email, last_active_at desc);

create table if not exists public.player_webauthn_credentials (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  device_key text not null,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists player_webauthn_credentials_email_idx
  on public.player_webauthn_credentials (email);

create table if not exists public.player_security_events (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  event_type text not null check (event_type in (
    'new_device_login',
    'email_change',
    'payout_change',
    'password_change',
    'unusual_login',
    'sign_out_all',
    'device_revoked',
    'biometric_enabled'
  )),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

create index if not exists player_security_events_email_idx
  on public.player_security_events (email, created_at desc);

create table if not exists public.player_step_up_tokens (
  token_hash text primary key,
  email text not null,
  purpose text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists player_step_up_tokens_email_idx
  on public.player_step_up_tokens (email, expires_at desc);

alter table public.player_auth_profiles enable row level security;
alter table public.player_trusted_devices enable row level security;
alter table public.player_webauthn_credentials enable row level security;
alter table public.player_security_events enable row level security;
alter table public.player_step_up_tokens enable row level security;

drop policy if exists "player_auth_profiles_service" on public.player_auth_profiles;
create policy "player_auth_profiles_service" on public.player_auth_profiles
  for all using (true) with check (true);

drop policy if exists "player_trusted_devices_service" on public.player_trusted_devices;
create policy "player_trusted_devices_service" on public.player_trusted_devices
  for all using (true) with check (true);

drop policy if exists "player_webauthn_credentials_service" on public.player_webauthn_credentials;
create policy "player_webauthn_credentials_service" on public.player_webauthn_credentials
  for all using (true) with check (true);

drop policy if exists "player_security_events_service" on public.player_security_events;
create policy "player_security_events_service" on public.player_security_events
  for all using (true) with check (true);

drop policy if exists "player_step_up_tokens_service" on public.player_step_up_tokens;
create policy "player_step_up_tokens_service" on public.player_step_up_tokens
  for all using (true) with check (true);

comment on table public.player_trusted_devices is
  'Registered devices that completed email verification at least once.';
comment on table public.player_webauthn_credentials is
  'Platform passkeys (Face ID, Touch ID, fingerprint, Windows Hello).';
comment on table public.player_security_events is
  'Security audit trail and notification triggers for player accounts.';
