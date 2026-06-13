import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PlayerRow, PoolRow, SquareRow, WinnerRow } from "@/lib/database/types";
import { buildAchievements, legacyHeadline } from "@/lib/player/achievements";
import type { PlayerLegacyData } from "@/lib/player/legacyTypes";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import { calcWinStreaks, normalizeEmail, playerOwnsWin } from "@/lib/player/statsCore";

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
    const identity = await getPlayerPublicIdentity(normalized);
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
      displayName: identity.publicLabel,
      publicLabel: identity.publicLabel,
      legacyName: identity.publicLabel,
      profileBio: identity.profileBio,
      email: normalized,
      memberSince: new Date().toISOString(),
      stats,
      achievements: buildAchievements(stats),
      headline: legacyHeadline(stats),
      publicSlug: null,
      publicPath: null,
    };
  }

  const players = playerRows as PlayerRow[];
  const poolIds = Array.from(new Set(players.map((p) => p.pool_id)));
  const playerIds = new Set(players.map((p) => p.id));
  const playerNames = new Set(players.map((p) => p.name.trim().toLowerCase()));
  const identity = await getPlayerPublicIdentity(normalized);

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
    displayName: identity.publicLabel,
    publicLabel: identity.publicLabel,
    legacyName: identity.publicLabel,
    profileBio: identity.profileBio,
    email: normalized,
    memberSince: new Date(memberSince).toISOString(),
    stats,
    achievements: buildAchievements(stats),
    headline: legacyHeadline(stats),
    publicSlug: null,
    publicPath: null,
  };
}
