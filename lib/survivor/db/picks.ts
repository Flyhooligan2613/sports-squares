import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type { SurvivorPickResult } from "@/lib/survivor/types";
import { getSurvivorWeekById } from "@/lib/survivor/db/weeks";
import { getSurvivorEntry } from "@/lib/survivor/db/entries";

const TABLE = "survivor_picks";

export interface SurvivorPick {
  id: string;
  leagueId: string;
  weekId: string;
  entryId: string;
  email: string;
  teamAbbr: string;
  teamName: string;
  espnGameId: string | null;
  result: SurvivorPickResult;
  lockedAt: string | null;
}

interface PickRow {
  id: string;
  league_id: string;
  week_id: string;
  entry_id: string;
  email: string;
  team_abbr: string;
  team_name: string;
  espn_game_id: string | null;
  result: SurvivorPickResult;
  locked_at: string | null;
}

function mapPick(row: PickRow): SurvivorPick {
  return {
    id: row.id,
    leagueId: row.league_id,
    weekId: row.week_id,
    entryId: row.entry_id,
    email: row.email,
    teamAbbr: row.team_abbr,
    teamName: row.team_name,
    espnGameId: row.espn_game_id,
    result: row.result,
    lockedAt: row.locked_at,
  };
}

export async function listUsedTeamAbbrs(entryId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("team_abbr")
    .eq("entry_id", entryId);

  if (error) throw error;
  return (data ?? []).map((row) => row.team_abbr as string);
}

export async function getPickForWeek(
  entryId: string,
  weekId: string
): Promise<SurvivorPick | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("entry_id", entryId)
    .eq("week_id", weekId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPick(data as PickRow) : null;
}

export async function listPicksForWeek(weekId: string): Promise<SurvivorPick[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("week_id", weekId);

  if (error) throw error;
  return ((data ?? []) as PickRow[]).map(mapPick);
}

export async function saveSurvivorPick(input: {
  leagueId: string;
  weekId: string;
  entryId: string;
  email: string;
  teamAbbr: string;
  teamName: string;
  espnGameId: string;
  kickoffAt: string;
}): Promise<SurvivorPick> {
  const email = normalizeEmail(input.email);
  const week = await getSurvivorWeekById(input.weekId);
  if (!week || week.leagueId !== input.leagueId) {
    throw new Error("Week not found.");
  }

  if (week.status !== "open" && week.status !== "scheduled") {
    throw new Error("Picks are locked for this week.");
  }

  if (new Date(input.kickoffAt).getTime() <= Date.now()) {
    throw new Error("That game has already started.");
  }

  const entry = await getSurvivorEntry(input.leagueId, email);
  if (!entry || entry.id !== input.entryId) {
    throw new Error("Join the league before picking.");
  }

  if (entry.status !== "active") {
    throw new Error("You are eliminated from this league.");
  }

  const used = await listUsedTeamAbbrs(input.entryId);
  const abbr = input.teamAbbr.toUpperCase();
  if (used.includes(abbr)) {
    throw new Error("You already used that team this season.");
  }

  const existing = await getPickForWeek(input.entryId, input.weekId);
  if (existing) {
    throw new Error("You already submitted a pick this week.");
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      league_id: input.leagueId,
      week_id: input.weekId,
      entry_id: input.entryId,
      email,
      team_abbr: abbr,
      team_name: input.teamName,
      espn_game_id: input.espnGameId,
      locked_at: now,
      result: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapPick(data as PickRow);
}

export async function resolveSurvivorPick(
  pickId: string,
  result: SurvivorPickResult
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      result,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", pickId);

  if (error) throw error;
}
