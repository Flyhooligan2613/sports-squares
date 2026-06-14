-- Player profile identity — legal name and mailing address for signup / profile edit

alter table public.player_profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text;

comment on column public.player_profiles.first_name is 'Player first name from signup or profile edit';
comment on column public.player_profiles.last_name is 'Player last name from signup or profile edit';
comment on column public.player_profiles.address_line1 is 'Primary mailing address line';
comment on column public.player_profiles.address_line2 is 'Optional address line (apt, suite)';
comment on column public.player_profiles.city is 'Mailing city';
comment on column public.player_profiles.state is 'Mailing state / province';
comment on column public.player_profiles.postal_code is 'Mailing ZIP / postal code';
