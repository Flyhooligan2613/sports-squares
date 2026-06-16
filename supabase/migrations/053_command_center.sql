-- Command Center™ — configurable alerts (Platform Build Spec #007)
-- Activity feed reuses platform_audit_log + payment_transactions + support_threads.
-- Audit logs reuse platform_audit_log.

create table if not exists public.command_center_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_key text not null unique,
  title text not null,
  message text not null,
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'critical')),
  category text not null default 'system'
    check (category in ('system', 'payment', 'contest', 'compliance', 'community', 'support', 'fraud')),
  enabled boolean not null default true,
  threshold_config jsonb not null default '{}'::jsonb,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists command_center_alerts_category_idx
  on public.command_center_alerts (category, enabled);

alter table public.command_center_alerts enable row level security;

drop policy if exists "command_center_alerts_service" on public.command_center_alerts;
create policy "command_center_alerts_service" on public.command_center_alerts
  for all using (true) with check (true);

insert into public.command_center_alerts (alert_key, title, message, severity, category, threshold_config)
values
  (
    'payment.failed_spike',
    'Failed payment spike',
    'Alert when failed payment transactions exceed threshold in 1 hour.',
    'critical',
    'payment',
    '{"windowMinutes": 60, "threshold": 5}'::jsonb
  ),
  (
    'contest.low_fill_rate',
    'Low contest fill rate',
    'Alert when open contests average fill rate drops below threshold.',
    'warning',
    'contest',
    '{"thresholdPercent": 40}'::jsonb
  ),
  (
    'support.high_priority_backlog',
    'High-priority support backlog',
    'Alert when unresolved high-priority support threads exceed threshold.',
    'warning',
    'support',
    '{"threshold": 10}'::jsonb
  ),
  (
    'system.webhook_failures',
    'Webhook processing failures',
    'Alert when Stripe webhook failures exceed threshold in 24 hours.',
    'critical',
    'system',
    '{"windowHours": 24, "threshold": 3}'::jsonb
  )
on conflict (alert_key) do nothing;

comment on table public.command_center_alerts is
  'Command Center™ configurable alert definitions with severity and thresholds.';
