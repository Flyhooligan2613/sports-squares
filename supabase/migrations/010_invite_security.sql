-- Milestone: Invite token security hardening
-- Restrict anon access to sensitive player columns and block direct square writes.

-- Players: remove permissive anon/authenticated blanket policies
drop policy if exists "players_select" on public.players;
drop policy if exists "players_insert" on public.players;
drop policy if exists "players_update" on public.players;
drop policy if exists "players_delete" on public.players;

-- Logged-in admin sessions (Supabase Auth) retain full player access
create policy "players_authenticated_all" on public.players
  for all to authenticated
  using (true)
  with check (true);

-- Column-level grants: anon may only read non-sensitive player fields
revoke all on table public.players from anon;
grant select (
  id,
  pool_id,
  name,
  credits_allocated,
  credits_used,
  initials,
  color,
  amount_paid,
  payment_status,
  purchase_source,
  invite_delivery_status,
  sms_delivery_status
) on table public.players to anon;

create policy "players_anon_select_public_fields" on public.players
  for select to anon
  using (true);

-- Squares: anon can read the board but cannot claim directly from the browser
drop policy if exists "squares_insert" on public.squares;
drop policy if exists "squares_update" on public.squares;
drop policy if exists "squares_delete" on public.squares;

create policy "squares_authenticated_write" on public.squares
  for all to authenticated
  using (true)
  with check (true);
