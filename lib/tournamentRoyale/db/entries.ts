import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import { displayNameFromEmail, normalizeEmail } from "@/lib/player/statsCore";
import { BRACKET_SHIELDS_PER_TOURNAMENT } from "@/lib/tournamentRoyale/config";

export interface TournamentEntryRow {
  id: string;
  event_id: string;
  pool_id: string;
  email: string;
  display_name: string;
  total_points: number;
  accuracy_pct: number;
  cinderella_meter: number;
  combo_streak: number;
  best_combo_streak: number;
  combo_multiplier: number;
  shield_available: boolean;
  bracket_completion_pct: number;
  rank_position: number | null;
  status: string;
}

export async function getTournamentEntry(
  poolId: string,
  email: string
): Promise<TournamentEntryRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_entries")
    .select("*")
    .eq("pool_id", poolId)
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw error;
  return data as TournamentEntryRow | null;
}

export async function joinTournamentPool(input: {
  eventId: string;
  poolId: string;
  email: string;
  displayName?: string;
}): Promise<TournamentEntryRow> {
  const email = normalizeEmail(input.email);
  const existing = await getTournamentEntry(input.poolId, email);
  if (existing) return existing;

  const name = input.displayName?.trim() || displayNameFromEmail(email);
  await ensurePlayerProfile(email, name);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_entries")
    .insert({
      event_id: input.eventId,
      pool_id: input.poolId,
      email,
      display_name: name,
      shield_available: BRACKET_SHIELDS_PER_TOURNAMENT > 0,
    })
    .select("*")
    .single();

  if (error) throw error;

  const count = await countPoolEntries(input.poolId);
  await supabase
    .from("tournament_royale_pools")
    .update({ entry_count: count })
    .eq("id", input.poolId);

  return data as TournamentEntryRow;
}

async function countPoolEntries(poolId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("tournament_royale_entries")
    .select("*", { count: "exact", head: true })
    .eq("pool_id", poolId);
  return count ?? 0;
}

export async function listTopEntries(
  poolId: string,
  limit = 5
): Promise<TournamentEntryRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_entries")
    .select("*")
    .eq("pool_id", poolId)
    .order("total_points", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as TournamentEntryRow[];
}

export async function countActiveEntries(poolId: string): Promise<number> {
  return countPoolEntries(poolId);
}
