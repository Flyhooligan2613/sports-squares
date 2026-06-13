import { parseEspnScoreboard } from "@/lib/espn/parser";
import { getEspnSportConfig } from "@/lib/espn/sports";
import type { EspnLiveGame, EspnScoreboardGame, EspnSport } from "@/lib/types";

const SPORTS: EspnSport[] = ["nfl", "ncaaf", "nba", "ncaab"];

export function scoreboardKey(sport: EspnSport, espnGameId: string): string {
  return `${sport}-${espnGameId}`;
}

export function isScoreboardGameLive(game: EspnScoreboardGame): boolean {
  if (game.completed) return false;
  const status = game.status.toLowerCase();
  if (status.includes("final") || status.includes("postpon") || status.includes("cancel")) {
    return false;
  }
  if (game.period > 0) return true;
  if (
    status.includes("live") ||
    status.includes("progress") ||
    status.includes("half") ||
    status.includes("quarter") ||
    status.includes("period") ||
    status.includes("end")
  ) {
    return true;
  }
  if (game.kickoffAt) {
    const kickoff = new Date(game.kickoffAt).getTime();
    const elapsed = Date.now() - kickoff;
    return elapsed >= 0 && elapsed < 5 * 60 * 60 * 1000;
  }
  return false;
}

export function scoreboardToLiveGame(game: EspnScoreboardGame, espnGameId: string): EspnLiveGame {
  return {
    gameId: espnGameId,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    homeLineScores: [],
    awayLineScores: [],
    period: game.period,
    gameCompleted: Boolean(game.completed),
    statusDetail: game.status,
  };
}

async function fetchSportScoreboard(sport: EspnSport): Promise<EspnScoreboardGame[]> {
  const config = getEspnSportConfig(sport);
  try {
    const response = await fetch(config.scoreboardUrl, {
      headers: { "User-Agent": "SquareBoards/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return parseEspnScoreboard(data);
  } catch {
    return [];
  }
}

/** Live scores for the current ESPN scoreboard week, keyed by `${sport}-${espnId}`. */
export async function fetchCurrentWeekScoreboards(): Promise<Map<string, EspnScoreboardGame>> {
  const results = await Promise.all(SPORTS.map((sport) => fetchSportScoreboard(sport)));
  const map = new Map<string, EspnScoreboardGame>();

  for (let i = 0; i < SPORTS.length; i += 1) {
    const sport = SPORTS[i];
    for (const game of results[i] ?? []) {
      map.set(scoreboardKey(sport, game.id), { ...game, id: game.id });
    }
  }

  return map;
}
