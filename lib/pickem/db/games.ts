import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { identifyMondayNightEspnGameId } from "@/lib/pickem/mondayNight";
import type { PickemGame, PickemGameStatus, PickemScheduleGame } from "@/lib/pickem/types";

const TABLE = "pickem_games";

interface GameRow {
  id: string;
  contest_id: string;
  espn_game_id: string;
  away_team: string;
  home_team: string;
  away_abbr: string | null;
  home_abbr: string | null;
  away_record: string | null;
  home_record: string | null;
  away_logo_url: string | null;
  home_logo_url: string | null;
  kickoff_at: string;
  status: PickemGameStatus;
  winner_side: string | null;
  away_score: number | null;
  home_score: number | null;
  picks_locked: boolean;
  is_monday_night?: boolean;
}

export function mapPickemGame(row: GameRow): PickemGame {
  return {
    id: row.id,
    contestId: row.contest_id,
    espnGameId: row.espn_game_id,
    awayTeam: row.away_team,
    homeTeam: row.home_team,
    awayAbbr: row.away_abbr,
    homeAbbr: row.home_abbr,
    awayRecord: row.away_record,
    homeRecord: row.home_record,
    awayLogoUrl: row.away_logo_url,
    homeLogoUrl: row.home_logo_url,
    kickoffAt: row.kickoff_at,
    status: row.status,
    winnerSide: row.winner_side as PickemGame["winnerSide"],
    awayScore: row.away_score,
    homeScore: row.home_score,
    picksLocked: row.picks_locked,
    isMondayNight: row.is_monday_night ?? false,
  };
}

export async function listPickemGames(contestId: string): Promise<PickemGame[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("contest_id", contestId)
    .order("kickoff_at", { ascending: true });

  if (error) throw error;
  return (data as GameRow[]).map(mapPickemGame);
}

export async function upsertPickemGames(
  contestId: string,
  games: PickemScheduleGame[]
): Promise<PickemGame[]> {
  const supabase = getSupabaseAdmin();
  const mondayEspnId = identifyMondayNightEspnGameId(games);
  const rows = games.map((game) => ({
    contest_id: contestId,
    espn_game_id: game.espnGameId,
    away_team: game.awayTeam,
    home_team: game.homeTeam,
    away_abbr: game.awayAbbr,
    home_abbr: game.homeAbbr,
    away_record: game.awayRecord,
    home_record: game.homeRecord,
    away_logo_url: game.awayLogoUrl,
    home_logo_url: game.homeLogoUrl,
    kickoff_at: game.kickoffAt,
    status: game.status,
    winner_side: game.winnerSide,
    away_score: game.awayScore,
    home_score: game.homeScore,
    is_monday_night: game.espnGameId === mondayEspnId,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: "contest_id,espn_game_id" })
    .select("*");

  if (error) throw error;
  return (data as GameRow[]).map(mapPickemGame);
}

export async function lockPickemGamesPastKickoff(contestId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: games, error } = await supabase
    .from(TABLE)
    .select("id, kickoff_at, status, picks_locked")
    .eq("contest_id", contestId);

  if (error) throw error;

  let locked = 0;
  for (const game of games ?? []) {
    const kickoff = game.kickoff_at as string;
    const shouldLock =
      !game.picks_locked &&
      (new Date(kickoff).getTime() <= Date.now() ||
        game.status === "live" ||
        game.status === "final");

    if (!shouldLock) continue;

    const { error: updateError } = await supabase
      .from(TABLE)
      .update({
        picks_locked: true,
        status:
          game.status === "scheduled" && new Date(kickoff).getTime() <= Date.now()
            ? "live"
            : game.status,
        updated_at: now,
      })
      .eq("id", game.id);

    if (updateError) throw updateError;
    locked += 1;
  }

  return locked;
}

export async function countRemainingPickemGames(
  contestId: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("contest_id", contestId)
    .in("status", ["scheduled", "live"]);

  if (error) throw error;
  return count ?? 0;
}
