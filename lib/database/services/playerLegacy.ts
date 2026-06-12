import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PlayerRow, PoolRow, SquareRow, WinnerRow } from "@/lib/database/types";
import { buildAchievements, legacyHeadline } from "@/lib/player/achievements";
import type { PlayerLegacyData } from "@/lib/player/legacyTypes";

const STREAK_WINDOW_DAYS = 21;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Player";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function playerOwnsWin(
  winner: WinnerRow,
  playerNames: Set<string>,
  ownedSquares: Set<number>
): boolean {
  if (ownedSquares.has(winner.winning_square)) return true;
  return playerNames.has(winner.winning_player.trim().toLowerCase());
}

function calcWinStreaks(winDates: Date[]): {
  current: number;
  longest: number;
} {
  if (!winDates.length) return { current: 0, longest: 0 };

  const sorted = [...winDates].sort((a, b) => a.getTime() - b.getTime());
  const windowMs = STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].getTime() - sorted[i - 1].getTime() <= windowMs) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  let current = 1;
  for (let i = sorted.length - 1; i > 0; i -= 1) {
    if (sorted[i].getTime() - sorted[i - 1].getTime() <= windowMs) {
      current += 1;
    } else {
      break;
    }
  }

  const daysSinceLast =
    (Date.now() - sorted[sorted.length - 1].getTime()) / (24 * 60 * 60 * 1000);
  if (daysSinceLast > STREAK_WINDOW_DAYS) current = 0;

  return { current, longest };
}

function seasonKey(date: Date): string {
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export async function getPlayerLegacy(
  email: string
): Promise<PlayerLegacyData | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: playerRows, error: playersError } = await supabase
    .from(TABLES.players)
    .select("*")
    .ilike("email", normalized);

  if (playersError) throw playersError;

  if (!playerRows?.length) {
    const stats = {
      lifetimeWinnings: 0,
      lifetimeWins: 0,
      squaresWon: 0,
      boardsPlayed: 0,
      totalSquaresPurchased: 0,
      seasonsPlayed: 0,
      yearsPlayed: 0,
      currentWinStreak: 0,
      longestWinStreak: 0,
    };
    return {
      displayName: displayNameFromEmail(normalized),
      email: normalized,
      memberSince: new Date().toISOString(),
      stats,
      achievements: buildAchievements(stats),
      headline: legacyHeadline(stats),
    };
  }

  const players = playerRows as PlayerRow[];
  const poolIds = Array.from(new Set(players.map((p) => p.pool_id)));
  const playerIds = new Set(players.map((p) => p.id));
  const playerNames = new Set(players.map((p) => p.name.trim().toLowerCase()));
  const displayName =
    players.find((p) => p.name.trim())?.name.split(" ")[0] ??
    displayNameFromEmail(normalized);

  const memberSince = players.reduce((earliest, row) => {
    const at = new Date(row.created_at).getTime();
    return at < earliest ? at : earliest;
  }, Date.now());

  const [poolsRes, squaresRes, winnersRes] = await Promise.all([
    supabase.from(TABLES.pools).select("*").in("id", poolIds),
    supabase.from(TABLES.squares).select("*").in("pool_id", poolIds),
    supabase.from(TABLES.winners).select("*").in("pool_id", poolIds),
  ]);

  if (poolsRes.error) throw poolsRes.error;
  if (squaresRes.error) throw squaresRes.error;
  if (winnersRes.error) throw winnersRes.error;

  const poolRows = (poolsRes.data ?? []) as PoolRow[];
  const squareRows = (squaresRes.data ?? []) as SquareRow[];
  const winnerRows = (winnersRes.data ?? []) as WinnerRow[];

  let lifetimeWinnings = 0;
  let lifetimeWins = 0;
  const winDates: Date[] = [];
  const seasonKeys = new Set<string>();
  const yearKeys = new Set<number>();

  for (const pool of poolRows) {
    const kickoff = pool.kickoff_at ? new Date(pool.kickoff_at) : null;
    if (kickoff && !Number.isNaN(kickoff.getTime())) {
      seasonKeys.add(seasonKey(kickoff));
      yearKeys.add(kickoff.getUTCFullYear());
    }

    const ownedSquares = new Set(
      squareRows
        .filter(
          (s) =>
            s.pool_id === pool.id && s.player_id && playerIds.has(s.player_id)
        )
        .map((s) => s.square_number)
    );

    for (const winner of winnerRows.filter((w) => w.pool_id === pool.id)) {
      if (!playerOwnsWin(winner, playerNames, ownedSquares)) continue;

      lifetimeWins += 1;
      winDates.push(new Date(winner.created_at));
      if (winner.payout_status === "paid" && winner.payout_amount) {
        lifetimeWinnings += winner.payout_amount;
      }
    }
  }

  for (const row of players) {
    yearKeys.add(new Date(row.created_at).getUTCFullYear());
  }

  const totalSquaresPurchased = players.reduce(
    (sum, row) => sum + (row.credits_allocated ?? 0),
    0
  );
  const streaks = calcWinStreaks(winDates);

  const stats = {
    lifetimeWinnings: Math.round(lifetimeWinnings),
    lifetimeWins,
    squaresWon: lifetimeWins,
    boardsPlayed: poolIds.length,
    totalSquaresPurchased,
    seasonsPlayed: seasonKeys.size || yearKeys.size,
    yearsPlayed: yearKeys.size,
    currentWinStreak: streaks.current,
    longestWinStreak: streaks.longest,
  };

  return {
    displayName,
    email: normalized,
    memberSince: new Date(memberSince).toISOString(),
    stats,
    achievements: buildAchievements(stats),
    headline: legacyHeadline(stats),
  };
}
