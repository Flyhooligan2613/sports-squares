import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import {
  PICKEM_DEFAULT_PRIZE_POOL_CENTS,
  PICKEM_LEAGUE_MAX_PLAYERS,
} from "@/lib/pickem/config";
import type { PickemContest } from "@/lib/pickem/types";

const TABLE = "pickem_leagues";

export interface PickemLeague {
  id: string;
  contestId: string;
  leagueNumber: number;
  maxPlayers: number;
  playerCount: number;
  prizePoolCents: number;
  status: "open" | "full" | "complete";
}

interface LeagueRow {
  id: string;
  contest_id: string;
  league_number: number;
  max_players: number;
  player_count: number;
  prize_pool_cents: number;
  status: PickemLeague["status"];
}

function mapLeague(row: LeagueRow): PickemLeague {
  return {
    id: row.id,
    contestId: row.contest_id,
    leagueNumber: row.league_number,
    maxPlayers: row.max_players,
    playerCount: row.player_count,
    prizePoolCents: row.prize_pool_cents,
    status: row.status,
  };
}

export async function getPickemLeagueById(
  leagueId: string
): Promise<PickemLeague | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", leagueId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapLeague(data as LeagueRow) : null;
}

export async function listPickemLeaguesForContest(
  contestId: string
): Promise<PickemLeague[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("contest_id", contestId)
    .order("league_number", { ascending: true });

  if (error) throw error;
  return (data as LeagueRow[]).map(mapLeague);
}

async function createPickemLeague(
  contestId: string,
  leagueNumber: number
): Promise<PickemLeague> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      contest_id: contestId,
      league_number: leagueNumber,
      max_players: PICKEM_LEAGUE_MAX_PLAYERS,
      prize_pool_cents: PICKEM_DEFAULT_PRIZE_POOL_CENTS,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLeague(data as LeagueRow);
}

export async function ensureDefaultPickemLeague(
  contestId: string
): Promise<PickemLeague> {
  const existing = await listPickemLeaguesForContest(contestId);
  if (existing.length > 0) return existing[0];
  return createPickemLeague(contestId, 1);
}

export async function getPlayerPickemLeague(
  contestId: string,
  email: string
): Promise<PickemLeague | null> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data, error } = await supabase
    .from("pickem_picks")
    .select("league_id")
    .eq("contest_id", contestId)
    .eq("email", normalized)
    .not("league_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.league_id) return null;

  return getPickemLeagueById(data.league_id as string);
}

/**
 * Assign player to the first open league, or auto-create the next shard.
 */
export async function assignPlayerToPickemLeague(
  contest: PickemContest,
  email: string
): Promise<PickemLeague> {
  const existing = await getPlayerPickemLeague(contest.id, email);
  if (existing) return existing;

  let leagues = await listPickemLeaguesForContest(contest.id);
  if (!leagues.length) {
    leagues = [await ensureDefaultPickemLeague(contest.id)];
  }

  let openLeague = leagues.find(
    (l) => l.status === "open" && l.playerCount < l.maxPlayers
  );

  if (!openLeague) {
    const nextNumber = Math.max(...leagues.map((l) => l.leagueNumber)) + 1;
    openLeague = await createPickemLeague(contest.id, nextNumber);
  }

  return openLeague;
}

export async function refreshPickemLeaguePlayerCount(
  leagueId: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pickem_picks")
    .select("email")
    .eq("league_id", leagueId);

  if (error) throw error;

  const unique = new Set((data ?? []).map((r) => r.email as string));
  const playerCount = unique.size;

  const league = await getPickemLeagueById(leagueId);
  if (!league) return 0;

  const status =
    playerCount >= league.maxPlayers
      ? "full"
      : league.status === "complete"
        ? "complete"
        : "open";

  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      player_count: playerCount,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leagueId);

  if (updateError) throw updateError;
  return playerCount;
}

export function formatLeagueLabel(leagueNumber: number): string {
  return leagueNumber === 1 ? "League #1" : `League #${leagueNumber}`;
}
