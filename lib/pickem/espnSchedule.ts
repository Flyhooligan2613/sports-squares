import type {
  PickemGameStatus,
  PickemScheduleGame,
  PickemScoreboardMeta,
  PickemWinnerSide,
} from "@/lib/pickem/types";
import type { EspnScoreboardResponse } from "@/lib/espn/types";
import { parseEspnScoreboard } from "@/lib/espn/parser";
import {
  DEFAULT_PICKEM_SPORT,
  getPickemSportConfig,
  pickemScoreboardUrl,
} from "@/lib/pickem/config";
import type { PickemSport } from "@/lib/pickem/types";

function parseRecord(competitor: {
  records?: { summary?: string }[];
}): string | null {
  return competitor.records?.[0]?.summary ?? null;
}

function mapEspnStatus(
  completed: boolean,
  statusName: string
): PickemGameStatus {
  const lower = statusName.toLowerCase();
  if (completed || lower.includes("final")) return "final";
  if (
    lower.includes("in progress") ||
    lower.includes("halftime") ||
    lower.includes("end of")
  ) {
    return "live";
  }
  if (lower.includes("postponed")) return "postponed";
  if (lower.includes("cancel")) return "cancelled";
  return "scheduled";
}

function resolveWinnerSide(
  awayScore: number,
  homeScore: number,
  completed: boolean
): PickemWinnerSide | null {
  if (!completed) return null;
  if (awayScore > homeScore) return "away";
  if (homeScore > awayScore) return "home";
  return "tie";
}

export function parsePickemScoreboardMeta(
  data: EspnScoreboardResponse,
  sport: PickemSport = DEFAULT_PICKEM_SPORT
): PickemScoreboardMeta {
  const config = getPickemSportConfig(sport);
  return {
    weekNumber: data.week?.number ?? 1,
    seasonYear: data.season?.year ?? new Date().getFullYear(),
    seasonType: data.season?.type ?? config.defaultSeasonType,
  };
}

export function parsePickemScheduleGames(
  data: EspnScoreboardResponse
): PickemScheduleGame[] {
  const baseGames = parseEspnScoreboard(data);
  const games: PickemScheduleGame[] = [];

  for (const event of data.events ?? []) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

    const competitors = competition.competitors ?? [];
    const home = competitors.find((c) => c.homeAway === "home");
    const away = competitors.find((c) => c.homeAway === "away");
    if (!home || !away) continue;

    const statusType = competition.status?.type;
    const statusName =
      statusType?.shortDetail ??
      statusType?.detail ??
      statusType?.name ??
      "Scheduled";
    const completed = statusType?.completed ?? false;
    const awayScore = parseInt(away.score ?? "0", 10) || 0;
    const homeScore = parseInt(home.score ?? "0", 10) || 0;
    const base = baseGames.find((g) => g.id === event.id);

    games.push({
      espnGameId: event.id,
      awayTeam: away.team?.displayName ?? base?.awayTeam ?? "Away",
      homeTeam: home.team?.displayName ?? base?.homeTeam ?? "Home",
      awayAbbr: away.team?.abbreviation ?? null,
      homeAbbr: home.team?.abbreviation ?? null,
      awayRecord: parseRecord(away),
      homeRecord: parseRecord(home),
      awayLogoUrl: away.team?.logo ?? null,
      homeLogoUrl: home.team?.logo ?? null,
      kickoffAt: event.date ?? new Date().toISOString(),
      status: mapEspnStatus(completed, statusName),
      winnerSide: resolveWinnerSide(awayScore, homeScore, completed),
      awayScore,
      homeScore,
      completed,
    });
  }

  return games.sort(
    (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
  );
}

export async function fetchPickemScoreboard(input?: {
  sport?: PickemSport;
  week?: number;
  seasonType?: number;
}): Promise<{
  meta: PickemScoreboardMeta;
  games: PickemScheduleGame[];
}> {
  const sport = input?.sport ?? DEFAULT_PICKEM_SPORT;
  const config = getPickemSportConfig(sport);
  const url = pickemScoreboardUrl(
    sport,
    input?.week,
    input?.seasonType ?? config.defaultSeasonType
  );

  const response = await fetch(url, {
    headers: { "User-Agent": "SquareBoards-Pickem/1.0" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ESPN Pick'em scoreboard HTTP ${response.status}`);
  }

  const data = (await response.json()) as EspnScoreboardResponse;
  return {
    meta: parsePickemScoreboardMeta(data, sport),
    games: parsePickemScheduleGames(data),
  };
}
