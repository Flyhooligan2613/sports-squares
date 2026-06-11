-- Milestone 9: Player invite tokens for personal claim links

alter table public.players
  add column if not exists invite_token text;

create unique index if not exists players_invite_token_unique_idx
  on public.players (invite_token)
  where invite_token is not null;

create index if not exists players_invite_token_idx
  on public.players (invite_token);
