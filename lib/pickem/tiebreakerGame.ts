import { PICKEM_EASTERN_TZ } from "@/lib/pickem/config";
import type { PickemSport } from "@/lib/pickem/types";
import type { PickemGame, PickemScheduleGame } from "@/lib/pickem/types";

function kickoffWeekdayEastern(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PICKEM_EASTERN_TZ,
    weekday: "long",
  }).format(new Date(iso));
}

function latestKickoffGame<T extends { kickoffAt: string; espnGameId: string }>(
  games: T[]
): T | null {
  if (!games.length) return null;
  return [...games].sort(
    (a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime()
  )[0];
}

/** NFL: latest Monday. MLB: latest Sunday. Soccer: latest Saturday (MLS weekend). */
export function identifyTiebreakerEspnGameId(
  sport: PickemSport,
  games: PickemScheduleGame[]
): string | null {
  if (sport === "mlb") {
    const sundayGames = games.filter(
      (g) => kickoffWeekdayEastern(g.kickoffAt) === "Sunday"
    );
    const target = latestKickoffGame(sundayGames) ?? latestKickoffGame(games);
    return target?.espnGameId ?? null;
  }

  if (sport === "soccer") {
    const saturdayGames = games.filter(
      (g) => kickoffWeekdayEastern(g.kickoffAt) === "Saturday"
    );
    const target = latestKickoffGame(saturdayGames) ?? latestKickoffGame(games);
    return target?.espnGameId ?? null;
  }

  const mondayGames = games.filter(
    (g) => kickoffWeekdayEastern(g.kickoffAt) === "Monday"
  );
  const target = latestKickoffGame(mondayGames);
  return target?.espnGameId ?? null;
}

export function isTiebreakerKickoff(sport: PickemSport, kickoffAt: string): boolean {
  if (sport === "mlb") return kickoffWeekdayEastern(kickoffAt) === "Sunday";
  if (sport === "soccer") return kickoffWeekdayEastern(kickoffAt) === "Saturday";
  return kickoffWeekdayEastern(kickoffAt) === "Monday";
}

export function getTiebreakerGame(games: PickemGame[]): PickemGame | null {
  const flagged = games.filter((g) => g.isMondayNight);
  if (!flagged.length) return null;
  return latestKickoffGame(flagged);
}

export function allMainSlateGamesFinal(games: PickemGame[]): boolean {
  const mainSlate = games.filter((g) => !g.isMondayNight);
  if (!mainSlate.length) return games.every((g) => g.status === "final");
  return mainSlate.every((g) => g.status === "final");
}

export function tiebreakerCombinedScore(game: PickemGame): number | null {
  if (game.status !== "final") return null;
  if (game.awayScore == null || game.homeScore == null) return null;
  return game.awayScore + game.homeScore;
}
