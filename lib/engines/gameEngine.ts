import {
  dbUpsertGame,
  mapEspnStatusToGameStatus,
} from "@/lib/database/services/games";
import { parseEspnScoreboard } from "@/lib/espn/parser";
import { getEspnSportConfig } from "@/lib/espn/sports";
import { MARKETPLACE_SPORTS } from "@/lib/marketplace/config";
import type { EspnSport } from "@/lib/types";

export interface GameImportResult {
  sport: EspnSport;
  imported: number;
  errors: string[];
}

function defaultKickoff(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

export async function importGamesForSport(
  sport: EspnSport
): Promise<GameImportResult> {
  const config = getEspnSportConfig(sport);
  const errors: string[] = [];
  let imported = 0;

  try {
    const response = await fetch(config.scoreboardUrl, {
      headers: { "User-Agent": "SquareBoards/2.0" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ESPN HTTP ${response.status}`);
    }

    const data = await response.json();
    const events = parseEspnScoreboard(data);

    for (const event of events) {
      try {
        const kickoffAt = event.kickoffAt ?? defaultKickoff();
        const status = mapEspnStatusToGameStatus(
          event.completed,
          event.status
        );

        await dbUpsertGame({
          espnGameId: event.id,
          espnSport: sport,
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          kickoffAt,
          status,
        });
        imported += 1;
      } catch (err) {
        errors.push(
          err instanceof Error ? err.message : `Failed game ${event.id}`
        );
      }
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Import failed");
  }

  return { sport, imported, errors };
}

export async function importAllMarketplaceGames(): Promise<GameImportResult[]> {
  const results: GameImportResult[] = [];
  for (const sport of MARKETPLACE_SPORTS) {
    results.push(await importGamesForSport(sport));
  }
  return results;
}
