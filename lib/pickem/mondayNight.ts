import { PICKEM_EASTERN_TZ } from "@/lib/pickem/config";
import type { PickemGame, PickemScheduleGame } from "@/lib/pickem/types";

function kickoffWeekdayEastern(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PICKEM_EASTERN_TZ,
    weekday: "long",
  }).format(new Date(iso));
}

/** Primary MNF game = latest Monday kickoff in the slate (NFL standard). */
export function identifyMondayNightEspnGameId(
  games: PickemScheduleGame[]
): string | null {
  const mondayGames = games.filter(
    (g) => kickoffWeekdayEastern(g.kickoffAt) === "Monday"
  );
  if (!mondayGames.length) return null;

  const sorted = [...mondayGames].sort(
    (a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime()
  );
  return sorted[0]?.espnGameId ?? null;
}

export function isMondayNightKickoff(kickoffAt: string): boolean {
  return kickoffWeekdayEastern(kickoffAt) === "Monday";
}

export function getMondayNightGame(games: PickemGame[]): PickemGame | null {
  const monday = games.filter((g) => g.isMondayNight);
  if (!monday.length) return null;
  return [...monday].sort(
    (a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime()
  )[0];
}

export function allSundaySlateGamesFinal(games: PickemGame[]): boolean {
  const sundaySlate = games.filter((g) => !g.isMondayNight);
  if (!sundaySlate.length) return games.every((g) => g.status === "final");
  return sundaySlate.every((g) => g.status === "final");
}

export function mondayGameCombinedScore(game: PickemGame): number | null {
  if (game.status !== "final") return null;
  if (game.awayScore == null || game.homeScore == null) return null;
  return game.awayScore + game.homeScore;
}
