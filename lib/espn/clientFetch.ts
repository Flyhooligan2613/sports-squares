import type { EspnLiveGame, EspnScoreboardGame, EspnSport } from "@/lib/types";
import { getEspnSportConfig, normalizeEspnSport } from "./sports";
import { parseEspnScoreboard, parseEspnSummary } from "./parser";

/** Fetch scoreboard for the given sport directly from ESPN (browser). */
export async function fetchEspnScoreboard(
  sport?: EspnSport | null
): Promise<EspnScoreboardGame[]> {
  const config = getEspnSportConfig(sport);
  const response = await fetch(config.scoreboardUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`ESPN returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return parseEspnScoreboard(data);
}

/** Fetch a single game summary for the given sport directly from ESPN (browser). */
export async function fetchEspnGame(
  gameId: string,
  sport?: EspnSport | null
): Promise<EspnLiveGame> {
  const config = getEspnSportConfig(sport);
  const response = await fetch(`${config.summaryUrl}?event=${gameId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ESPN returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const game = parseEspnSummary(data, gameId);

  if (!game) {
    throw new Error("Could not parse ESPN game data");
  }

  return game;
}

/** @deprecated Use fetchEspnScoreboard(sport) */
export async function fetchNflScoreboard(): Promise<EspnScoreboardGame[]> {
  return fetchEspnScoreboard("nfl");
}

/** @deprecated Use fetchEspnGame(gameId, sport) */
export async function fetchNflGame(gameId: string): Promise<EspnLiveGame> {
  return fetchEspnGame(gameId, "nfl");
}
