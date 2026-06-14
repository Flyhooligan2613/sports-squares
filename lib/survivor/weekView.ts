import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import type { PickemScheduleGame } from "@/lib/pickem/types";
import { getSurvivorEntry } from "@/lib/survivor/db/entries";
import type { SurvivorLeague } from "@/lib/survivor/db/leagues";
import {
  getPickForWeek,
  listPicksForWeek,
  listUsedTeamAbbrs,
} from "@/lib/survivor/db/picks";
import {
  getSurvivorWeek,
  type SurvivorWeek,
} from "@/lib/survivor/db/weeks";
import { espnMetaForSurvivorWeekNumber } from "@/lib/survivor/nflWeeks";
import type {
  SurvivorGameOption,
  SurvivorLiveMapStats,
  SurvivorWeekView,
} from "@/lib/survivor/types";

function buildGameOptions(
  games: PickemScheduleGame[],
  usedTeams: Set<string>,
  selectedAbbr: string | null
): SurvivorGameOption[] {
  const options: SurvivorGameOption[] = [];
  const now = Date.now();

  for (const game of games) {
    for (const side of [
      {
        abbr: game.awayAbbr,
        name: game.awayTeam,
        score: game.awayScore,
      },
      {
        abbr: game.homeAbbr,
        name: game.homeTeam,
        score: game.homeScore,
      },
    ]) {
      if (!side.abbr) continue;
      const abbrUpper = side.abbr.toUpperCase();
      options.push({
        espnGameId: game.espnGameId,
        awayTeam: game.awayTeam,
        homeTeam: game.homeTeam,
        teamAbbr: abbrUpper,
        teamName: side.name,
        kickoffAt: game.kickoffAt,
        status: game.status,
        awayScore: game.awayScore ?? 0,
        homeScore: game.homeScore ?? 0,
        picksLocked:
          new Date(game.kickoffAt).getTime() <= now ||
          game.status !== "scheduled",
        isSelected: selectedAbbr === abbrUpper,
        isUsedTeam: usedTeams.has(abbrUpper),
      });
    }
  }

  return options.sort(
    (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
  );
}

function buildLiveMap(
  week: SurvivorWeek,
  picks: Awaited<ReturnType<typeof listPicksForWeek>>,
  games: PickemScheduleGame[]
): SurvivorLiveMapStats {
  const counts = new Map<string, number>();
  for (const pick of picks) {
    counts.set(pick.teamAbbr, (counts.get(pick.teamAbbr) ?? 0) + 1);
  }

  let mostPopularPick: string | null = null;
  let max = 0;
  for (const [abbr, count] of Array.from(counts.entries())) {
    if (count > max) {
      max = count;
      mostPopularPick = abbr;
    }
  }

  let upsetRiskTeam: string | null = null;
  if (mostPopularPick) {
    const popularGame = games.find(
      (g) =>
        g.awayAbbr?.toUpperCase() === mostPopularPick ||
        g.homeAbbr?.toUpperCase() === mostPopularPick
    );
    if (popularGame?.status === "live") {
      const popularIsAway = popularGame.awayAbbr?.toUpperCase() === mostPopularPick;
      const popularScore = popularIsAway
        ? (popularGame.awayScore ?? 0)
        : (popularGame.homeScore ?? 0);
      const oppScore = popularIsAway
        ? (popularGame.homeScore ?? 0)
        : (popularGame.awayScore ?? 0);
      if (popularScore < oppScore) upsetRiskTeam = mostPopularPick;
    }
  }

  const total = week.playersRemaining + week.eliminatedCount;
  const survivorRatePct =
    total > 0 ? Math.round((week.playersRemaining / total) * 100) : 0;

  const eliminatedToday = picks.filter((p) => p.result === "eliminated").length;
  const perfectRemaining = picks.filter((p) => p.result === "survived").length;

  return {
    playersRemaining: week.playersRemaining,
    eliminatedToday,
    perfectPlayersRemaining: perfectRemaining,
    mostPopularPick,
    upsetRiskTeam,
    survivorRatePct,
  };
}

export async function buildSurvivorWeekView(input: {
  league: SurvivorLeague;
  weekNumber: number;
  email?: string | null;
}): Promise<SurvivorWeekView> {
  const week =
    (await getSurvivorWeek(input.league.id, input.weekNumber));

  if (!week) {
    throw new Error("Week not found.");
  }

  const espnMeta = espnMetaForSurvivorWeekNumber(week.weekNumber);
  const { games } = await fetchPickemScoreboard({
    sport: "nfl",
    week: espnMeta.espnWeekNumber,
    seasonType: espnMeta.seasonType,
    seasonYear: input.league.seasonYear,
  });

  const entry = input.email
    ? await getSurvivorEntry(input.league.id, input.email)
    : null;

  const usedTeams = entry
    ? new Set(await listUsedTeamAbbrs(entry.id))
    : new Set<string>();

  const myPick = entry ? await getPickForWeek(entry.id, week.id) : null;
  const weekPicks = await listPicksForWeek(week.id);

  const canPick =
    Boolean(entry) &&
    entry!.status === "active" &&
    (week.status === "open" || week.status === "scheduled") &&
    !myPick;

  return {
    league: {
      id: input.league.id,
      name: input.league.name,
      seasonYear: input.league.seasonYear,
      status: input.league.status,
      currentWeek: input.league.currentWeek,
    },
    week: {
      id: week.id,
      weekNumber: week.weekNumber,
      label: week.label,
      status: week.status,
      locksAt: week.locksAt,
    },
    entry: entry
      ? {
          id: entry.id,
          status: entry.status,
          livesRemaining: entry.livesRemaining,
          weeksSurvived: entry.weeksSurvived,
          displayName: entry.displayName,
        }
      : null,
    games: buildGameOptions(games, usedTeams, myPick?.teamAbbr ?? null),
    usedTeams: Array.from(usedTeams),
    myPick: myPick
      ? {
          teamAbbr: myPick.teamAbbr,
          teamName: myPick.teamName,
          result: myPick.result,
        }
      : null,
    liveMap: buildLiveMap(week, weekPicks, games),
    canPick,
  };
}
