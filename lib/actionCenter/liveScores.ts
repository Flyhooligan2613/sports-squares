import { buildGameId, mapEspnStatusToGameStatus } from "@/lib/database/services/games";
import { parseEspnScoreboard } from "@/lib/espn/parser";
import { getEspnSportConfig } from "@/lib/espn/sports";
import { isKickoffInCurrentWeek } from "@/lib/actionCenter/week";
import type { EspnLiveGame, EspnScoreboardGame, EspnSport, Game } from "@/lib/types";

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

export function sportFromScoreboardKey(key: string): EspnSport {
  const dash = key.indexOf("-");
  return key.slice(0, dash) as EspnSport;
}

export function scoreboardEntryToGame(sport: EspnSport, entry: EspnScoreboardGame): Game {
  const mapped = mapEspnStatusToGameStatus(entry.completed, entry.status);
  const status = entry.completed ? "final" : isScoreboardGameLive(entry) ? "live" : mapped;

  return {
    id: buildGameId(sport, entry.id),
    espnGameId: entry.id,
    espnSport: sport,
    homeTeam: entry.homeTeam,
    awayTeam: entry.awayTeam,
    kickoffAt: entry.kickoffAt ?? new Date().toISOString(),
    status,
  };
}

/** Merge DB rows with the current ESPN scoreboard (source of truth for slates). */
export function mergeDbAndScoreboardGames(
  dbGames: Game[],
  scoreboardByKey: Map<string, EspnScoreboardGame>
): Game[] {
  const byId = new Map<string, Game>();

  for (const game of dbGames) {
    byId.set(game.id, game);
  }

  for (const [key, entry] of Array.from(scoreboardByKey.entries())) {
    if (entry.completed) continue;
    const sport = sportFromScoreboardKey(key);
    const id = buildGameId(sport, entry.id);
    const fromScoreboard = scoreboardEntryToGame(sport, entry);
    const existing = byId.get(id);

    if (!existing) {
      byId.set(id, fromScoreboard);
      continue;
    }

    byId.set(id, {
      ...existing,
      kickoffAt: entry.kickoffAt ?? existing.kickoffAt,
      homeTeam: entry.homeTeam,
      awayTeam: entry.awayTeam,
      status: fromScoreboard.status === "final" ? "final" : fromScoreboard.status,
    });
  }

  return Array.from(byId.values());
}

export function isActionCenterVisibleGame(
  game: Game,
  scoreboard: EspnScoreboardGame | null
): boolean {
  if (scoreboard?.completed || game.status === "final" || game.status === "cancelled") {
    return false;
  }
  if (scoreboard) return true;
  if (game.status === "live") return true;
  if (isKickoffInCurrentWeek(game.kickoffAt)) return true;

  const hoursUntil = (new Date(game.kickoffAt).getTime() - Date.now()) / 3_600_000;
  return hoursUntil >= -5 && hoursUntil <= 7 * 24;
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
