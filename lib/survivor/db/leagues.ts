import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SurvivorLeagueStatus, SurvivorMode } from "@/lib/survivor/types";

const TABLE = "survivor_leagues";

export interface SurvivorLeagueRow {
  id: string;
  sport: string;
  season_year: number;
  mode: SurvivorMode;
  visibility: string;
  name: string;
  description: string | null;
  entry_fee_cents: number;
  lives_per_player: number;
  current_week: number;
  status: SurvivorLeagueStatus;
}

export interface SurvivorLeague {
  id: string;
  sport: string;
  seasonYear: number;
  mode: SurvivorMode;
  visibility: string;
  name: string;
  description: string | null;
  entryFeeCents: number;
  livesPerPlayer: number;
  currentWeek: number;
  status: SurvivorLeagueStatus;
}

function mapLeague(row: SurvivorLeagueRow): SurvivorLeague {
  return {
    id: row.id,
    sport: row.sport,
    seasonYear: row.season_year,
    mode: row.mode,
    visibility: row.visibility,
    name: row.name,
    description: row.description,
    entryFeeCents: Number(row.entry_fee_cents),
    livesPerPlayer: row.lives_per_player,
    currentWeek: row.current_week,
    status: row.status,
  };
}

export async function getSurvivorLeagueById(id: string): Promise<SurvivorLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapLeague(data as SurvivorLeagueRow) : null;
}

export async function getGlobalClassicLeague(
  seasonYear: number
): Promise<SurvivorLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", "nfl")
    .eq("season_year", seasonYear)
    .eq("mode", "global")
    .eq("visibility", "global")
    .maybeSingle();

  if (error) throw error;
  return data ? mapLeague(data as SurvivorLeagueRow) : null;
}

export async function upsertGlobalClassicLeague(seasonYear: number): Promise<SurvivorLeague> {
  const existing = await getGlobalClassicLeague(seasonYear);
  const supabase = getSupabaseAdmin();

  if (existing) return existing;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      sport: "nfl",
      season_year: seasonYear,
      mode: "global",
      visibility: "global",
      name: `Survivor X™ Global ${seasonYear}`,
      description: "SquareBoards flagship NFL Survivor — one pick per week, never the same team twice.",
      entry_fee_cents: 0,
      lives_per_player: 1,
      current_week: 1,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLeague(data as SurvivorLeagueRow);
}

export async function updateSurvivorLeagueFields(
  id: string,
  fields: Partial<{
    status: SurvivorLeagueStatus;
    current_week: number;
  }>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function listActiveSurvivorLeagues(): Promise<SurvivorLeague[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .in("status", ["open", "active"]);

  if (error) throw error;
  return ((data ?? []) as SurvivorLeagueRow[]).map(mapLeague);
}
