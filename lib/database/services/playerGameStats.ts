import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PlatformGameId } from "@/lib/platform/gameTypes";
import type { GameTypeStats } from "@/lib/platform/playerStatsTypes";
import { emptyGameTypeStats } from "@/lib/platform/playerStatsTypes";
import { normalizeEmail } from "@/lib/player/statsCore";

const TABLE = TABLES.playerGameStats;

interface PlayerGameStatsRow {
  email: string;
  game_type: PlatformGameId;
  wins: number;
  winnings_cents: number;
  games_played: number;
  current_streak: number;
  longest_streak: number;
  extra: Record<string, number> | null;
  updated_at: string;
}

function rowToStats(row: PlayerGameStatsRow): GameTypeStats {
  return {
    gameType: row.game_type,
    wins: row.wins,
    winningsCents: row.winnings_cents,
    gamesPlayed: row.games_played,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    extra: row.extra ?? {},
  };
}

export async function loadPlayerGameStats(
  email: string
): Promise<Partial<Record<PlatformGameId, GameTypeStats>>> {
  if (!isSupabaseAdminConfigured()) return {};

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("email", normalizeEmail(email));

  if (error) throw error;
  if (!data?.length) return {};

  const out: Partial<Record<PlatformGameId, GameTypeStats>> = {};
  for (const row of data as PlayerGameStatsRow[]) {
    out[row.game_type] = rowToStats(row);
  }
  return out;
}

export async function upsertPlayerGameStats(
  email: string,
  stats: GameTypeStats
): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).upsert(
    {
      email: normalizeEmail(email),
      game_type: stats.gameType,
      wins: stats.wins,
      winnings_cents: stats.winningsCents,
      games_played: stats.gamesPlayed,
      current_streak: stats.currentStreak,
      longest_streak: stats.longestStreak,
      extra: stats.extra,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,game_type" }
  );

  if (error) throw error;
}

export async function getPlayerGameStats(
  email: string,
  gameType: PlatformGameId
): Promise<GameTypeStats> {
  const all = await loadPlayerGameStats(email);
  return all[gameType] ?? emptyGameTypeStats(gameType);
}

export { TABLE as PLAYER_GAME_STATS_TABLE };
