import type { EspnLiveGame, EspnScoreboardGame } from "@/lib/types";
import type {
  EspnCompetitionRaw,
  EspnCompetitorRaw,
  EspnScoreboardEventRaw,
  EspnScoreboardResponse,
  EspnSummaryResponse,
} from "./types";

function parseScore(value: string | undefined): number {
  const n = parseInt(value ?? "0", 10);
  return Number.isNaN(n) ? 0 : n;
}

function parseLineScores(competitor: EspnCompetitorRaw | undefined): number[] {
  return (competitor?.linescores ?? []).map((ls) => ls.value ?? 0);
}

function parseCompetition(
  competition: EspnCompetitionRaw,
  gameId: string
): EspnLiveGame | null {
  const competitors = competition.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const status = competition.status;
  const statusType = status?.type;

  return {
    gameId,
    homeTeam: home.team?.displayName ?? home.team?.abbreviation ?? "Home",
    awayTeam: away.team?.displayName ?? away.team?.abbreviation ?? "Away",
    homeScore: parseScore(home.score),
    awayScore: parseScore(away.score),
    homeLineScores: parseLineScores(home),
    awayLineScores: parseLineScores(away),
    period: status?.period ?? 0,
    gameCompleted: statusType?.completed ?? false,
    statusDetail:
      statusType?.shortDetail ??
      statusType?.detail ??
      statusType?.name ??
      "Unknown",
  };
}

export function parseEspnSummary(
  data: EspnSummaryResponse,
  gameId: string
): EspnLiveGame | null {
  const competition = data.header?.competitions?.[0];
  if (!competition) return null;
  return parseCompetition(competition, gameId);
}

export function parseEspnScoreboard(
  data: EspnScoreboardResponse
): EspnScoreboardGame[] {
  return (data.events ?? [])
    .map((event) => parseScoreboardEvent(event))
    .filter((g): g is EspnScoreboardGame => g !== null);
}

function parseScoreboardEvent(
  event: EspnScoreboardEventRaw
): EspnScoreboardGame | null {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const competitors = competition.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const status = competition.status;
  const statusType = status?.type;

  return {
    id: event.id,
    name: event.name ?? `${away.team?.abbreviation} @ ${home.team?.abbreviation}`,
    homeTeam: home.team?.displayName ?? "Home",
    awayTeam: away.team?.displayName ?? "Away",
    homeScore: parseScore(home.score),
    awayScore: parseScore(away.score),
    status:
      statusType?.shortDetail ??
      statusType?.detail ??
      statusType?.name ??
      "Scheduled",
    period: status?.period ?? 0,
    kickoffAt: event.date,
    completed: statusType?.completed ?? false,
  };
}
