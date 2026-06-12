import { TABLES } from "@/lib/database/config";
import type { PlayerRow, PoolRow, WinnerRow } from "@/lib/database/types";
import type {
  ChampionEntry,
  LiveActivityItem,
  LiveWinnerFeedItem,
  LiveWinnersCenterData,
  LiveWinnersStats,
} from "@/lib/liveWinners/types";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { EspnSport, ScoringPeriod } from "@/lib/types";

const SPORT_LABELS: Record<string, string> = {
  nfl: "NFL",
  ncaaf: "NCAAF",
  nba: "NBA",
  ncaab: "NCAAB",
};

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function periodLabel(period: ScoringPeriod): string {
  if (period === "FINAL") return "Final Winner";
  if (period === "1H") return "Half 1 Winner";
  if (period === "2H") return "Half 2 Winner";
  return `Quarter ${period.slice(1)} Winner`;
}

function sportLabel(sport: EspnSport | null | undefined): string {
  if (!sport) return "Sports";
  return SPORT_LABELS[sport] ?? sport.toUpperCase();
}

export function maskWinnerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Player";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return `${first} ${lastInitial}.`;
}

function buildChampions(
  winners: WinnerRow[],
  sinceIso: string
): ChampionEntry[] {
  const totals = new Map<string, number>();

  for (const winner of winners) {
    if (new Date(winner.created_at) < new Date(sinceIso)) continue;
    const amount = winner.payout_amount ?? 0;
    if (amount <= 0) continue;
    const key = winner.winning_player.trim().toLowerCase();
    totals.set(key, (totals.get(key) ?? 0) + amount);
  }

  return Array.from(totals.entries())
    .map(([key, totalWon]) => ({
      maskedName: maskWinnerName(
        winners.find((w) => w.winning_player.trim().toLowerCase() === key)
          ?.winning_player ?? key
      ),
      totalWon: Math.round(totalWon),
    }))
    .sort((a, b) => b.totalWon - a.totalWon)
    .slice(0, 5);
}

function emptyData(): LiveWinnersCenterData {
  return {
    stats: {
      todaysWinners: 0,
      todaysPayouts: 0,
      boardsPlayed: 0,
      squaresSold: 0,
      prizeMoneyToday: 0,
    },
    winners: [],
    activity: [],
    champions: { today: [], week: [], month: [] },
    updatedAt: new Date().toISOString(),
  };
}

export async function getLiveWinnersCenterData(): Promise<LiveWinnersCenterData> {
  if (!isSupabaseAdminConfigured()) return emptyData();

  const supabase = getSupabaseAdmin();
  const todayStart = startOfToday();
  const weekStart = daysAgo(7);
  const monthStart = daysAgo(30);
  const activitySince = daysAgo(2);

  const [winnersRes, poolsRes, playersRes] = await Promise.all([
    supabase
      .from(TABLES.winners)
      .select("*")
      .gte("created_at", activitySince)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase.from(TABLES.pools).select("*").order("created_at", { ascending: false }).limit(120),
    supabase
      .from(TABLES.players)
      .select("*")
      .gte("created_at", activitySince)
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  if (winnersRes.error) throw winnersRes.error;
  if (poolsRes.error) throw poolsRes.error;
  if (playersRes.error) throw playersRes.error;

  const winnerRows = (winnersRes.data ?? []) as WinnerRow[];
  const poolRows = (poolsRes.data ?? []) as PoolRow[];
  const playerRows = (playersRes.data ?? []) as PlayerRow[];

  const poolById = new Map(poolRows.map((p) => [p.id, p]));

  const todaysWinners = winnerRows.filter(
    (w) => new Date(w.created_at) >= new Date(todayStart)
  );

  const todaysPaid = todaysWinners.filter((w) => w.payout_status === "paid");
  const prizeMoneyToday = todaysWinners.reduce(
    (sum, w) => sum + (w.payout_amount ?? 0),
    0
  );

  const boardsPlayedToday = new Set(
    todaysWinners.map((w) => w.pool_id)
  ).size;

  const squaresSoldToday = playerRows
    .filter((p) => new Date(p.created_at) >= new Date(todayStart))
    .reduce((sum, p) => sum + (p.credits_allocated ?? 0), 0);

  const stats: LiveWinnersStats = {
    todaysWinners: todaysWinners.length,
    todaysPayouts: todaysPaid.length,
    boardsPlayed: boardsPlayedToday,
    squaresSold: squaresSoldToday,
    prizeMoneyToday: Math.round(prizeMoneyToday),
  };

  const winners: LiveWinnerFeedItem[] = winnerRows.slice(0, 24).map((winner) => {
    const pool = poolById.get(winner.pool_id);
    return {
      id: winner.id,
      sport: sportLabel(pool?.espn_sport),
      sportKey: pool?.espn_sport ?? null,
      awayTeam: pool?.away_team ?? "Away",
      homeTeam: pool?.home_team ?? "Home",
      boardIndex: pool?.board_index ?? 1,
      periodLabel: periodLabel(winner.quarter),
      amount: winner.payout_amount ?? 0,
      payoutStatus: winner.payout_status,
      wonAt: winner.created_at,
    };
  });

  const activity: LiveActivityItem[] = [];

  for (const winner of winnerRows.slice(0, 20)) {
    const pool = poolById.get(winner.pool_id);
    const matchup = pool
      ? `${pool.away_team} vs ${pool.home_team}`
      : "Game board";

    activity.push({
      id: `win-${winner.id}`,
      type: "quarter_winner",
      title: "Quarter Winner Determined",
      detail: `${matchup} · ${periodLabel(winner.quarter)}`,
      at: winner.created_at,
    });

    if (winner.payout_status === "paid") {
      activity.push({
        id: `pay-${winner.id}`,
        type: "payout_sent",
        title: "Automatic Payout Sent",
        detail: `$${(winner.payout_amount ?? 0).toFixed(0)} → ${maskWinnerName(winner.winning_player)}`,
        at: winner.created_at,
      });
    }
  }

  for (const pool of poolRows.slice(0, 30)) {
    const matchup = `${pool.away_team} vs ${pool.home_team}`;
    const createdAt = pool.created_at;

    if (pool.auto_created && new Date(createdAt) >= new Date(activitySince)) {
      activity.push({
        id: `created-${pool.id}`,
        type: "board_created",
        title: "New Board Automatically Created",
        detail: `${matchup} · Board #${pool.board_index ?? 1}`,
        at: createdAt,
      });
    }

    if (pool.status === "locked" && pool.locked_at) {
      activity.push({
        id: `locked-${pool.id}`,
        type: "board_filled",
        title: "Board Filled",
        detail: `${matchup} · Board #${pool.board_index ?? 1}`,
        at: pool.locked_at,
      });
    }

    if (pool.status === "numbers-drawn") {
      activity.push({
        id: `numbers-${pool.id}`,
        type: "numbers_assigned",
        title: "Numbers Assigned",
        detail: `${matchup} · Board #${pool.board_index ?? 1}`,
        at: pool.locked_at ?? createdAt,
      });
    }

    if (pool.kickoff_at && new Date(pool.kickoff_at) >= new Date(activitySince)) {
      activity.push({
        id: `kickoff-${pool.id}`,
        type: "kickoff_started",
        title: "Kickoff Started",
        detail: matchup,
        at: pool.kickoff_at,
      });
    }
  }

  for (const player of playerRows.slice(0, 20)) {
    if (player.purchase_source !== "stripe") continue;
    const pool = poolById.get(player.pool_id);
    activity.push({
      id: `purchase-${player.id}`,
      type: "squares_purchased",
      title: "Player Purchased Squares",
      detail: pool
        ? `${pool.away_team} vs ${pool.home_team} · ${player.credits_allocated} squares`
        : `${player.credits_allocated} squares purchased`,
      at: player.created_at,
    });
  }

  activity.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  const allWinnersForChampions = winnerRows.length
    ? winnerRows
    : ((await supabase.from(TABLES.winners).select("*").limit(200)).data ??
        []) as WinnerRow[];

  return {
    stats,
    winners,
    activity: activity.slice(0, 24),
    champions: {
      today: buildChampions(allWinnersForChampions, todayStart),
      week: buildChampions(allWinnersForChampions, weekStart),
      month: buildChampions(allWinnersForChampions, monthStart),
    },
    updatedAt: new Date().toISOString(),
  };
}
