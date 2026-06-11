import { calculateWinner } from "@/lib/winnerEngine";
import type {
  EspnLiveGame,
  EspnSport,
  ScoringPeriod,
  Square,
  WinnerHistory,
  WinnerResult,
} from "@/lib/types";
import { getScoringPeriods, normalizeEspnSport } from "./sports";

const QUARTER_SPORTS: EspnSport[] = ["nfl", "ncaaf", "nba"];

interface PeriodRule {
  period: ScoringPeriod;
  /** ESPN period number must exceed this for the period to be complete */
  minPeriod: number;
  /** Number of linescores to sum for cumulative score */
  lineScoreCount: number;
}

function cumulativeScore(lineScores: number[], count: number): number {
  return lineScores.slice(0, count).reduce((sum, value) => sum + value, 0);
}

function isPeriodComplete(
  rule: PeriodRule,
  game: EspnLiveGame
): boolean {
  if (rule.period === "FINAL") return game.gameCompleted;

  if (game.period > rule.minPeriod) return true;

  if (game.gameCompleted) {
    const hasHome = game.homeLineScores.length >= rule.lineScoreCount;
    const hasAway = game.awayLineScores.length >= rule.lineScoreCount;
    return hasHome && hasAway;
  }

  return false;
}

function getPeriodRules(sport: EspnSport): PeriodRule[] {
  if (sport === "ncaab") {
    return [
      { period: "1H", minPeriod: 1, lineScoreCount: 1 },
      { period: "2H", minPeriod: 2, lineScoreCount: 2 },
      { period: "FINAL", minPeriod: 99, lineScoreCount: 0 },
    ];
  }

  return [
    { period: "Q1", minPeriod: 1, lineScoreCount: 1 },
    { period: "Q2", minPeriod: 2, lineScoreCount: 2 },
    { period: "Q3", minPeriod: 3, lineScoreCount: 3 },
    { period: "Q4", minPeriod: 4, lineScoreCount: 4 },
    { period: "FINAL", minPeriod: 99, lineScoreCount: 0 },
  ];
}

/** Detect period winners that should be created/updated from ESPN live data. */
export function detectWinnersToSync(
  game: EspnLiveGame,
  history: WinnerHistory,
  topNumbers: number[],
  sideNumbers: number[],
  squares: Square[],
  sport?: EspnSport | null
): WinnerResult[] {
  const resolvedSport = normalizeEspnSport(sport);
  const results: WinnerResult[] = [];
  const rules = getPeriodRules(resolvedSport);

  for (const rule of rules) {
    if (rule.period === "FINAL") continue;
    if (history[rule.period]) continue;
    if (!isPeriodComplete(rule, game)) continue;

    const homeScore = cumulativeScore(game.homeLineScores, rule.lineScoreCount);
    const awayScore = cumulativeScore(game.awayLineScores, rule.lineScoreCount);

    const result = calculateWinner(
      rule.period,
      topNumbers,
      sideNumbers,
      squares,
      homeScore,
      awayScore
    );
    if (result) results.push(result);
  }

  if (game.gameCompleted && !history.FINAL) {
    const result = calculateWinner(
      "FINAL",
      topNumbers,
      sideNumbers,
      squares,
      game.homeScore,
      game.awayScore
    );
    if (result) results.push(result);
  }

  return results;
}

export function getActivePeriodFromGame(
  game: EspnLiveGame,
  sport?: EspnSport | null
): ScoringPeriod {
  const resolvedSport = normalizeEspnSport(sport);

  if (game.gameCompleted) return "FINAL";

  if (resolvedSport === "ncaab") {
    if (game.period <= 1) return "1H";
    if (game.period === 2) return "2H";
    return "FINAL";
  }

  if (game.period <= 1) return "Q1";
  if (game.period === 2) return "Q2";
  if (game.period === 3) return "Q3";
  if (game.period === 4) return "Q4";
  return "FINAL";
}

export function usesQuarterScoring(sport?: EspnSport | null): boolean {
  return QUARTER_SPORTS.includes(normalizeEspnSport(sport));
}

export function getSportScoringPeriods(sport?: EspnSport | null): ScoringPeriod[] {
  return getScoringPeriods(sport);
}
