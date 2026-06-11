-- Customer purchase flow: delivery tracking and Stripe linkage

alter table public.players
  add column if not exists invite_delivery_status text not null default 'pending'
    check (invite_delivery_status in ('pending', 'sent', 'failed', 'skipped')),
  add column if not exists invite_sent_at timestamptz,
  add column if not exists invite_delivery_error text,
  add column if not exists sms_delivery_status text not null default 'skipped'
    check (sms_delivery_status in ('pending', 'sent', 'failed', 'skipped')),
  add column if not exists purchase_source text not null default 'manual'
    check (purchase_source in ('manual', 'stripe')),
  add column if not exists stripe_checkout_session_id text;

create unique index if not exists players_stripe_checkout_session_id_unique_idx
  on public.players (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists players_invite_delivery_status_idx
  on public.players (invite_delivery_status);
