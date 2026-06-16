-- Project Genesis™ — Rookie Season & Mission Center (Platform Build Spec #008)

alter table public.player_profiles
  add column if not exists genesis_initialized_at timestamptz,
  add column if not exists rookie_season_started_at timestamptz,
  add column if not exists rookie_season_ends_at timestamptz,
  add column if not exists genesis_achievements jsonb not null default '[]'::jsonb,
  add column if not exists genesis_customization_unlocked boolean not null default false,
  add column if not exists first_win_celebrated_at timestamptz,
  add column if not exists first_loss_encouraged_at timestamptz,
  add column if not exists genesis_missions_completed integer not null default 0;

comment on column public.player_profiles.genesis_initialized_at is 'Project Genesis™ account bootstrap timestamp';
comment on column public.player_profiles.rookie_season_started_at is 'Rookie Season auto-start for new competitors';
comment on column public.player_profiles.genesis_achievements is 'Starter achievement IDs unlocked at signup';
comment on column public.player_profiles.genesis_customization_unlocked is 'Rookie profile customization unlocked immediately';

create table if not exists public.genesis_mission_progress (
  email text not null,
  mission_id text not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  xp_awarded integer not null default 0,
  reward_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (email, mission_id)
);

create index if not exists genesis_mission_progress_email_idx
  on public.genesis_mission_progress (email, status);

comment on table public.genesis_mission_progress is 'Project Genesis™ beginner mission progress per competitor';
