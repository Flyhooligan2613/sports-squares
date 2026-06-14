import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import { displayNameFromEmail, normalizeEmail } from "@/lib/player/statsCore";
import type { SurvivorEntryStatus } from "@/lib/survivor/types";

const TABLE = "survivor_entries";

export interface SurvivorEntry {
  id: string;
  leagueId: string;
  email: string;
  displayName: string;
  livesRemaining: number;
  status: SurvivorEntryStatus;
  eliminatedWeek: number | null;
  weeksSurvived: number;
}

interface EntryRow {
  id: string;
  league_id: string;
  email: string;
  display_name: string;
  lives_remaining: number;
  status: SurvivorEntryStatus;
  eliminated_week: number | null;
  weeks_survived: number;
}

function mapEntry(row: EntryRow): SurvivorEntry {
  return {
    id: row.id,
    leagueId: row.league_id,
    email: row.email,
    displayName: row.display_name,
    livesRemaining: row.lives_remaining,
    status: row.status,
    eliminatedWeek: row.eliminated_week,
    weeksSurvived: row.weeks_survived,
  };
}

export async function getSurvivorEntry(
  leagueId: string,
  email: string
): Promise<SurvivorEntry | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("league_id", leagueId)
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw error;
  return data ? mapEntry(data as EntryRow) : null;
}

export async function joinSurvivorLeague(input: {
  leagueId: string;
  email: string;
  displayName?: string;
  livesPerPlayer?: number;
}): Promise<SurvivorEntry> {
  const email = normalizeEmail(input.email);
  const existing = await getSurvivorEntry(input.leagueId, email);
  if (existing) return existing;

  const name = input.displayName?.trim() || displayNameFromEmail(email);
  await ensurePlayerProfile(email, name);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      league_id: input.leagueId,
      email,
      display_name: name,
      lives_remaining: input.livesPerPlayer ?? 1,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapEntry(data as EntryRow);
}

export async function countEntriesByStatus(
  leagueId: string,
  status?: SurvivorEntryStatus
): Promise<number> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("league_id", leagueId);

  if (status) query = query.eq("status", status);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function eliminateSurvivorEntry(input: {
  entryId: string;
  weekNumber: number;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: entry, error: fetchError } = await supabase
    .from(TABLE)
    .select("lives_remaining")
    .eq("id", input.entryId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!entry) return;

  const livesRemaining = Math.max(0, (entry.lives_remaining as number) - 1);
  const status: SurvivorEntryStatus =
    livesRemaining <= 0 ? "eliminated" : "active";

  const { error } = await supabase
    .from(TABLE)
    .update({
      lives_remaining: livesRemaining,
      status,
      eliminated_week: status === "eliminated" ? input.weekNumber : null,
      eliminated_at: status === "eliminated" ? now : null,
      updated_at: now,
    })
    .eq("id", input.entryId);

  if (error) throw error;
}

export async function markSurvivorWeekSurvived(entryId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data, error: fetchError } = await supabase
    .from(TABLE)
    .select("weeks_survived")
    .eq("id", entryId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!data) return;

  const { error } = await supabase
    .from(TABLE)
    .update({
      weeks_survived: (data.weeks_survived as number) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", entryId);

  if (error) throw error;
}

export async function crownSurvivorChampion(entryId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      status: "champion",
      updated_at: new Date().toISOString(),
    })
    .eq("id", entryId);

  if (error) throw error;
}
