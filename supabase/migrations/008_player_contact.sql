-- Invite delivery: optional player contact info

alter table public.players
  add column if not exists email text,
  add column if not exists phone text;
