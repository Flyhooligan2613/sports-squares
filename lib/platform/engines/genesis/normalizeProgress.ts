import type { GenesisProgressSnapshot } from "./types";

/** Drop malformed API payloads instead of crashing client mission UI. */
export function normalizeGenesisProgress(
  json: GenesisProgressSnapshot & { initialized?: boolean }
): GenesisProgressSnapshot | null {
  if (json.initialized === false || !json.initialized) {
    return null;
  }

  if (!json.rookieSeason || !Array.isArray(json.missions) || !json.career) {
    return null;
  }

  return {
    ...json,
    missions: json.missions,
    starterAchievements: Array.isArray(json.starterAchievements) ? json.starterAchievements : [],
    motivation: typeof json.motivation === "string" ? json.motivation : "",
    customizationUnlocked: Boolean(json.customizationUnlocked),
    startingCompetitorScore: Number(json.startingCompetitorScore ?? 0),
    firstWinPendingCelebration: Boolean(json.firstWinPendingCelebration),
    firstLossPendingEncouragement: Boolean(json.firstLossPendingEncouragement),
  };
}
