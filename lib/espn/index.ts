export { fetchEspnGame, fetchEspnScoreboard } from "./clientFetch";
export { parseEspnScoreboard, parseEspnSummary } from "./parser";
export {
  ESPN_SPORT_LIST,
  ESPN_SPORTS,
  DEFAULT_ESPN_SPORT,
  getDefaultScoringPeriod,
  getEspnSportConfig,
  getScoringPeriods,
  normalizeEspnSport,
} from "./sports";
export {
  detectWinnersToSync,
  getActivePeriodFromGame,
  getSportScoringPeriods,
} from "./sync";

/** @deprecated Use getActivePeriodFromGame */
export { getActivePeriodFromGame as getActiveQuarterFromGame } from "./sync";
