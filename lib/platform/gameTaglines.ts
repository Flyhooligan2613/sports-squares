import type { PlatformGameId } from "@/lib/platform/gameTypes";

/** Gameplay-ready nickname shown on cards instead of "Available Now" / "NEW". */
export const PLATFORM_GAME_TAGLINES: Record<PlatformGameId, string> = {
  squareboards: "Action lives on the field",
  "nba-squares": "Fast breaks, big moments",
  "mlb-squares": "Swing batter batter swing",
  pickem: "Lock your card, ride the week",
  survivor: "One pick. Stay alive.",
  "baseball-pickem": "Diamond picks all summer",
  brackets: "Every prediction tells a story",
  "soccer-predictor": "Every match tells a story",
};

export function getPlatformGameTagline(id: PlatformGameId): string {
  return PLATFORM_GAME_TAGLINES[id];
}

/** Taglines for non-game ecosystem cards on the home grid. */
export const ECOSYSTEM_FEATURE_TAGLINES: Record<string, string> = {
  "weekly-rewards": "Your mystery box awaits",
  achievements: "Stack legacy, level up",
  "player-profiles": "Your fan identity",
  huddle: "Where picks go viral",
  "stats-hub": "Numbers tell the story",
  leaderboards: "Climb the ranks",
  "more-games": "Next kickoff loading",
};
