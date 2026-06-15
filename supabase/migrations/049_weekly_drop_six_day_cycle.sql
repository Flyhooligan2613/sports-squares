-- Reset Square Drop cadence: 6-day rolling cycle anchored to first square / Pick'em line.

alter table public.player_profiles
  add column if not exists first_play_at timestamptz,
  add column if not exists next_weekly_drop_at timestamptz;

comment on column public.player_profiles.first_play_at is
  'First square purchase or Pick''em line — starts the Square Drop timer.';
comment on column public.player_profiles.next_weekly_drop_at is
  'When the next Square Drop becomes available (6 days after first play, then 6 days after each open).';

-- Remove all unopened drops — clean slate.
delete from public.player_mystery_boxes where opened_at is null;

-- Backfill first play from earliest qualified gameplay ledger entry.
update public.player_profiles p
set first_play_at = sub.earliest
from (
  select email, min(created_at) as earliest
  from public.player_credit_ledger
  where source in ('qualified_gameplay', 'square_purchase', 'pickem_entry')
  group by email
) sub
where p.email = sub.email
  and p.first_play_at is null;

-- Also backfill from players who opened drops before (they clearly played).
update public.player_profiles p
set first_play_at = coalesce(p.first_play_at, p.created_at)
where p.mystery_boxes_opened > 0
  and p.first_play_at is null;

-- Schedule next drop: everyone with first play waits 6 days from reset (no instant drops).
update public.player_profiles
set next_weekly_drop_at = now() + interval '6 days'
where first_play_at is not null;

update public.player_profiles
set next_weekly_drop_at = null
where first_play_at is null;

-- Clear pending weekly_drop grants that would auto-qualify old rules.
delete from public.player_pending_rewards
where reward_type = 'weekly_drop'
  and claimed_at is null;

-- Update admin config default interval note (optional seed).
insert into public.ecosystem_admin_config (key, value)
values (
  'weekly_reward_drop',
  '{"enabled":true,"intervalDays":6,"minWeeklyGameplayCents":0}'::jsonb
)
on conflict (key) do update set
  value = public.ecosystem_admin_config.value || '{"enabled":true,"intervalDays":6,"minWeeklyGameplayCents":0}'::jsonb,
  updated_at = now();
