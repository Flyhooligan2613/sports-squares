-- Service role access for player_profiles (Connect payout setup)

grant all on table public.player_profiles to service_role;

drop policy if exists "player_profiles_service_role_all" on public.player_profiles;
create policy "player_profiles_service_role_all" on public.player_profiles
  for all to service_role using (true) with check (true);
