-- Auth 2.0 — onboarding flags, device metadata, expanded security events

alter table public.player_auth_profiles
  add column if not exists pin_enabled boolean not null default false,
  add column if not exists biometric_enabled boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.player_trusted_devices
  add column if not exists custom_name text,
  add column if not exists browser_name text,
  add column if not exists last_location text,
  add column if not exists last_ip text,
  add column if not exists acknowledged_at timestamptz;

alter table public.player_security_events drop constraint if exists player_security_events_event_type_check;
alter table public.player_security_events add constraint player_security_events_event_type_check
  check (event_type in (
    'new_device_login',
    'email_change',
    'payout_change',
    'password_change',
    'unusual_login',
    'sign_out_all',
    'device_revoked',
    'biometric_enabled',
    'biometric_login',
    'pin_enabled',
    'pin_login',
    'pin_locked',
    'purchase_confirmed',
    'profile_update',
    'phone_change',
    'session_revoked',
    'device_acknowledged',
    'account_secured'
  ));

comment on column public.player_auth_profiles.pin_enabled is
  'Server flag only — PIN secret never stored server-side.';
comment on column public.player_auth_profiles.onboarding_completed_at is
  'When player finished Auth 2.0 security setup wizard.';
