import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateId } from "@/lib/utils";
import { normalizeEmail } from "@/lib/player/statsCore";
import { survivorSportLabel } from "@/lib/survivor/sports";
import type { SurvivorLeagueStatus, SurvivorMode, SurvivorSport } from "@/lib/survivor/types";

const TABLE = "survivor_leagues";

export interface SurvivorLeagueRow {
  id: string;
  sport: string;
  season_year: number;
  mode: SurvivorMode;
  visibility: string;
  name: string;
  description: string | null;
  invite_code: string | null;
  entry_fee_cents: number;
  max_players: number | null;
  lives_per_player: number;
  current_week: number;
  status: SurvivorLeagueStatus;
  creator_email: string | null;
}

export interface SurvivorLeague {
  id: string;
  sport: SurvivorSport;
  seasonYear: number;
  mode: SurvivorMode;
  visibility: string;
  name: string;
  description: string | null;
  inviteCode: string | null;
  entryFeeCents: number;
  maxPlayers: number | null;
  livesPerPlayer: number;
  currentWeek: number;
  status: SurvivorLeagueStatus;
  creatorEmail: string | null;
}

function mapLeague(row: SurvivorLeagueRow): SurvivorLeague {
  return {
    id: row.id,
    sport: row.sport as SurvivorSport,
    seasonYear: row.season_year,
    mode: row.mode,
    visibility: row.visibility,
    name: row.name,
    description: row.description,
    inviteCode: row.invite_code,
    entryFeeCents: Number(row.entry_fee_cents),
    maxPlayers: row.max_players,
    livesPerPlayer: row.lives_per_player,
    currentWeek: row.current_week,
    status: row.status,
    creatorEmail: row.creator_email,
  };
}

export async function getSurvivorLeagueById(id: string): Promise<SurvivorLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapLeague(data as SurvivorLeagueRow) : null;
}

export async function getGlobalClassicLeague(
  seasonYear: number,
  sport: SurvivorSport = "nfl"
): Promise<SurvivorLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", sport)
    .eq("season_year", seasonYear)
    .eq("mode", "global")
    .eq("visibility", "global")
    .maybeSingle();

  if (error) throw error;
  return data ? mapLeague(data as SurvivorLeagueRow) : null;
}

export async function getDoubleLifeLeague(
  seasonYear: number,
  sport: SurvivorSport = "nfl"
): Promise<SurvivorLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", sport)
    .eq("season_year", seasonYear)
    .eq("mode", "double_life")
    .eq("visibility", "global")
    .maybeSingle();

  if (error) throw error;
  return data ? mapLeague(data as SurvivorLeagueRow) : null;
}

export async function upsertDoubleLifeLeague(
  seasonYear: number,
  sport: SurvivorSport = "nfl"
): Promise<SurvivorLeague> {
  const existing = await getDoubleLifeLeague(seasonYear, sport);
  if (existing) return existing;

  const label = survivorSportLabel(sport);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      sport,
      season_year: seasonYear,
      mode: "double_life",
      visibility: "global",
      name: `Survivor X™ Double Life ${label} ${seasonYear}`,
      description: `Two lives per season — lose twice and you are out. One ${label} pick per week, never reuse a team.`,
      entry_fee_cents: 0,
      lives_per_player: 2,
      current_week: 1,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLeague(data as SurvivorLeagueRow);
}

export async function getTurboLeague(seasonYear: number): Promise<SurvivorLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", "nfl")
    .eq("season_year", seasonYear)
    .eq("mode", "turbo")
    .eq("visibility", "global")
    .maybeSingle();

  if (error) throw error;
  return data ? mapLeague(data as SurvivorLeagueRow) : null;
}

export async function upsertTurboLeague(seasonYear: number): Promise<SurvivorLeague> {
  const existing = await getTurboLeague(seasonYear);
  if (existing) return existing;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      sport: "nfl",
      season_year: seasonYear,
      mode: "turbo",
      visibility: "global",
      name: `Survivor X™ Turbo ${seasonYear}`,
      description:
        "Four-week NFL playoffs sprint — Wild Card through Super Bowl. Join late and chase a fast championship.",
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

export async function listPublicSurvivorLeagues(
  seasonYear: number,
  sport: SurvivorSport = "nfl"
): Promise<SurvivorLeague[]> {
  await upsertGlobalClassicLeague(seasonYear, sport);
  await upsertDoubleLifeLeague(seasonYear, sport);
  if (sport === "nfl") {
    await upsertTurboLeague(seasonYear);
  }

  const modes: SurvivorMode[] =
    sport === "nfl" ? ["global", "double_life", "turbo"] : ["global", "double_life"];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", sport)
    .eq("season_year", seasonYear)
    .eq("visibility", "global")
    .in("mode", modes)
    .in("status", ["open", "active", "complete"]);

  if (error) throw error;
  return ((data ?? []) as SurvivorLeagueRow[]).map(mapLeague);
}

export async function upsertGlobalClassicLeague(
  seasonYear: number,
  sport: SurvivorSport = "nfl"
): Promise<SurvivorLeague> {
  const existing = await getGlobalClassicLeague(seasonYear, sport);
  if (existing) return existing;

  const label = survivorSportLabel(sport);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      sport,
      season_year: seasonYear,
      mode: "global",
      visibility: "global",
      name: `Survivor X™ Global ${label} ${seasonYear}`,
      description: `SquareBoards flagship ${label} Survivor — one pick per week, never the same team twice.`,
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

async function generateUniqueInviteCode(): Promise<string> {
  const supabase = getSupabaseAdmin();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateId().toUpperCase().slice(0, 8);
    const { data, error } = await supabase
      .from(TABLE)
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();
    if (error) throw error;
    if (!data) return code;
  }
  throw new Error("Could not generate a unique invite code.");
}

export async function getSurvivorLeagueByInviteCode(
  inviteCode: string
): Promise<SurvivorLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("invite_code", inviteCode.trim().toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return data ? mapLeague(data as SurvivorLeagueRow) : null;
}

export async function createPrivateSurvivorLeague(input: {
  seasonYear: number;
  creatorEmail: string;
  name: string;
  sport?: SurvivorSport;
  description?: string | null;
  livesPerPlayer?: number;
  maxPlayers?: number | null;
}): Promise<SurvivorLeague> {
  const name = input.name.trim();
  if (!name) throw new Error("League name is required.");

  const sport = input.sport ?? "nfl";
  const livesPerPlayer = Math.min(3, Math.max(1, input.livesPerPlayer ?? 1));
  const maxPlayers =
    input.maxPlayers != null && input.maxPlayers > 0
      ? Math.min(500, Math.floor(input.maxPlayers))
      : null;

  const inviteCode = await generateUniqueInviteCode();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      sport,
      season_year: input.seasonYear,
      mode: livesPerPlayer > 1 ? "double_life" : "classic",
      visibility: "private",
      name,
      description:
        input.description?.trim() ||
        "Private Survivor X™ league — invite friends with your code.",
      invite_code: inviteCode,
      entry_fee_cents: 0,
      max_players: maxPlayers,
      lives_per_player: livesPerPlayer,
      current_week: 1,
      status: "open",
      creator_email: normalizeEmail(input.creatorEmail),
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLeague(data as SurvivorLeagueRow);
}

export async function listPrivateSurvivorLeaguesForEmail(
  email: string,
  seasonYear: number,
  sport?: SurvivorSport
): Promise<SurvivorLeague[]> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  let createdQuery = supabase
    .from(TABLE)
    .select("*")
    .eq("season_year", seasonYear)
    .eq("visibility", "private")
    .eq("creator_email", normalized)
    .in("status", ["open", "active", "complete"]);

  if (sport) createdQuery = createdQuery.eq("sport", sport);

  const { data: created, error: createdError } = await createdQuery;
  if (createdError) throw createdError;

  const { data: entryRows, error: entryError } = await supabase
    .from("survivor_entries")
    .select("league_id")
    .eq("email", normalized);

  if (entryError) throw entryError;

  const joinedLeagueIds = Array.from(
    new Set((entryRows ?? []).map((row) => row.league_id as string))
  );

  let joined: SurvivorLeagueRow[] = [];
  if (joinedLeagueIds.length > 0) {
    let joinedQuery = supabase
      .from(TABLE)
      .select("*")
      .in("id", joinedLeagueIds)
      .eq("season_year", seasonYear)
      .eq("visibility", "private")
      .in("status", ["open", "active", "complete"]);

    if (sport) joinedQuery = joinedQuery.eq("sport", sport);

    const { data: joinedRows, error: joinedError } = await joinedQuery;
    if (joinedError) throw joinedError;
    joined = (joinedRows ?? []) as SurvivorLeagueRow[];
  }

  const byId = new Map<string, SurvivorLeagueRow>();
  for (const row of [...((created ?? []) as SurvivorLeagueRow[]), ...joined]) {
    byId.set(row.id, row);
  }

  return Array.from(byId.values())
    .map(mapLeague)
    .sort((a, b) => a.name.localeCompare(b.name));
}
