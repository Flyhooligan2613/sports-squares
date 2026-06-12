import { listPickemStatsForLeaderboard } from "@/lib/pickem/db/stats";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { maskPlayerLabel } from "@/lib/player/statsCore";
import type {
  PickemLeaderboardBoard,
  PickemLeaderboardEntry,
  PickemLeaderboardPeriod,
  PickemLeaderboardScope,
  PickemLeaderboardSort,
  PickemSport,
} from "@/lib/pickem/types";

const LIMIT = 50;

function sortStats(
  stats: Awaited<ReturnType<typeof listPickemStatsForLeaderboard>>,
  sort: PickemLeaderboardSort
) {
  return [...stats].sort((a, b) => {
    switch (sort) {
      case "accuracy":
        return b.pickAccuracyPct - a.pickAccuracyPct || b.correctPicks - a.correctPicks;
      case "wins":
        return b.seasonWins - a.seasonWins || b.correctPicks - a.correctPicks;
      case "current-streak":
        return b.currentStreak - a.currentStreak;
      case "longest-streak":
        return b.longestStreak - a.longestStreak;
      default:
        return 0;
    }
  });
}

function valueForSort(
  stats: Awaited<ReturnType<typeof listPickemStatsForLeaderboard>>[number],
  sort: PickemLeaderboardSort,
  period: PickemLeaderboardPeriod
): { value: number; label: string } {
  if (period === "weekly") {
    switch (sort) {
      case "accuracy": {
        const total = stats.weeklyWins + stats.weeklyLosses;
        const pct = total > 0 ? Math.round((stats.weeklyWins / total) * 1000) / 10 : 0;
        return { value: pct, label: `${pct}%` };
      }
      case "wins":
        return { value: stats.weeklyWins, label: `${stats.weeklyWins} wins` };
      case "current-streak":
        return { value: stats.currentStreak, label: `${stats.currentStreak} streak` };
      case "longest-streak":
        return { value: stats.longestStreak, label: `${stats.longestStreak} best` };
    }
  }

  switch (sort) {
    case "accuracy":
      return {
        value: stats.pickAccuracyPct,
        label: `${stats.pickAccuracyPct}%`,
      };
    case "wins":
      return {
        value: period === "all-time" ? stats.lifetimeWins : stats.seasonWins,
        label: `${period === "all-time" ? stats.lifetimeWins : stats.seasonWins} wins`,
      };
    case "current-streak":
      return { value: stats.currentStreak, label: `${stats.currentStreak} streak` };
    case "longest-streak":
      return { value: stats.longestStreak, label: `${stats.longestStreak} best` };
    default:
      return { value: 0, label: "—" };
  }
}

function boardTitle(
  scope: PickemLeaderboardScope,
  period: PickemLeaderboardPeriod,
  sort: PickemLeaderboardSort
): string {
  const scopeLabel =
    scope === "worldwide"
      ? "Worldwide"
      : scope === "united-states"
        ? "United States"
        : scope === "state"
          ? "State"
          : "Friends";
  const periodLabel =
    period === "weekly" ? "Weekly" : period === "season" ? "Season" : "All-Time";
  const sortLabel =
    sort === "accuracy"
      ? "Accuracy"
      : sort === "wins"
        ? "Wins"
        : sort === "current-streak"
          ? "Current Streak"
          : "Longest Streak";

  return `${scopeLabel} · ${periodLabel} · ${sortLabel}`;
}

export async function getPickemLeaderboard(input: {
  sport: PickemSport;
  seasonYear: number;
  scope?: PickemLeaderboardScope;
  period?: PickemLeaderboardPeriod;
  sort?: PickemLeaderboardSort;
  viewerEmail?: string | null;
  contestId?: string | null;
}): Promise<PickemLeaderboardBoard> {
  const scope = input.scope ?? "worldwide";
  const period = input.period ?? "season";
  const sort = input.sort ?? "accuracy";

  let stats = await listPickemStatsForLeaderboard({
    sport: input.sport,
    seasonYear: input.seasonYear,
    limit: LIMIT * 2,
  });

  if (period === "weekly" && input.contestId) {
    stats = await loadWeeklySnapshotStats(input.contestId, stats);
  }

  // Scope filters (state/friends) reserved for future profile graph data.
  const sorted = sortStats(stats, sort).slice(0, LIMIT);

  const entries: PickemLeaderboardEntry[] = sorted.map((row, index) => {
    const { value, label } = valueForSort(row, sort, period);
    const isViewer =
      input.viewerEmail != null &&
      row.email.toLowerCase() === input.viewerEmail.toLowerCase();

    return {
      rank: index + 1,
      displayName: maskPlayerLabel(row.email),
      email: row.email,
      value,
      valueLabel: label,
      isViewer,
    };
  });

  const viewerRank =
    input.viewerEmail != null
      ? (entries.find((e) => e.isViewer)?.rank ?? null)
      : null;

  return {
    id: `${scope}-${period}-${sort}`,
    title: boardTitle(scope, period, sort),
    scope,
    period,
    sort,
    entries,
    viewerRank,
  };
}

export async function getPickemLeaderboardSuite(input: {
  sport: PickemSport;
  seasonYear: number;
  viewerEmail?: string | null;
  contestId?: string | null;
}): Promise<PickemLeaderboardBoard[]> {
  const combos: Array<[PickemLeaderboardPeriod, PickemLeaderboardSort]> = [
    ["weekly", "wins"],
    ["season", "accuracy"],
    ["season", "current-streak"],
    ["all-time", "longest-streak"],
  ];

  return Promise.all(
    combos.map(([period, sort]) =>
      getPickemLeaderboard({
        sport: input.sport,
        seasonYear: input.seasonYear,
        period,
        sort,
        viewerEmail: input.viewerEmail,
        contestId: input.contestId,
      })
    )
  );
}

async function loadWeeklySnapshotStats(
  contestId: string,
  fallback: Awaited<ReturnType<typeof listPickemStatsForLeaderboard>>
): Promise<Awaited<ReturnType<typeof listPickemStatsForLeaderboard>>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pickem_weekly_snapshots")
    .select("email, wins, losses, pending, rank")
    .eq("contest_id", contestId)
    .order("rank", { ascending: true })
    .limit(LIMIT * 2);

  if (error || !data?.length) return fallback;

  const fallbackByEmail = new Map(fallback.map((s) => [s.email.toLowerCase(), s]));

  return data.map((row) => {
    const base = fallbackByEmail.get((row.email as string).toLowerCase());
    const wins = row.wins as number;
    const losses = row.losses as number;
    const graded = wins + losses;
    return {
      ...(base ?? {
        email: row.email as string,
        sport: "nfl" as const,
        seasonYear: new Date().getFullYear(),
        weeklyPending: 0,
        seasonWins: 0,
        seasonLosses: 0,
        lifetimeWins: 0,
        lifetimeLosses: 0,
        currentStreak: 0,
        longestStreak: 0,
        perfectWeekStreak: 0,
        weeklyWinStreak: 0,
        weeksPlayed: 0,
        perfectWeeks: 0,
        seasonChampionships: 0,
        totalPicks: 0,
        correctPicks: 0,
        mondayTiebreakerWins: 0,
        lifetimeEarningsCents: 0,
        bestFinish: null,
        lifetimePickemWins: 0,
        bestWeeklyRecord: null,
        achievements: [],
      }),
      weeklyWins: wins,
      weeklyLosses: losses,
      weeklyPending: row.pending as number,
      pickAccuracyPct: graded > 0 ? Math.round((wins / graded) * 1000) / 10 : 0,
    };
  });
}
