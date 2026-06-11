-- Ensure server-side purchase fulfillment can read/write players and squares.
-- Some hosted projects with invite-security RLS need explicit service_role access.

grant all on table public.players to service_role;
grant all on table public.squares to service_role;

drop policy if exists "players_service_role_all" on public.players;
create policy "players_service_role_all" on public.players
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "squares_service_role_all" on public.squares;
create policy "squares_service_role_all" on public.squares
  for all to service_role
  using (true)
  with check (true);
