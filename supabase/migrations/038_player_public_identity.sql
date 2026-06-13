-- Player public identity — bio caption and emoji-friendly usernames

alter table public.player_profiles
  add column if not exists profile_bio text not null default '',
  add column if not exists username_customized boolean not null default false;

comment on column public.player_profiles.profile_bio is 'Short player bio shown on dashboard (max 120 chars)';
comment on column public.player_profiles.username_customized is 'True after player picks their own username';
