/** @deprecated Use tiebreakerGame.ts — kept for existing imports. */
export {
  allMainSlateGamesFinal as allSundaySlateGamesFinal,
  getTiebreakerGame as getMondayNightGame,
  tiebreakerCombinedScore as mondayGameCombinedScore,
} from "@/lib/pickem/tiebreakerGame";

import type { PickemScheduleGame } from "@/lib/pickem/types";
import { identifyTiebreakerEspnGameId } from "@/lib/pickem/tiebreakerGame";

export function identifyMondayNightEspnGameId(games: PickemScheduleGame[]): string | null {
  return identifyTiebreakerEspnGameId("nfl", games);
}

export function isMondayNightKickoff(kickoffAt: string): boolean {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
  }).format(new Date(kickoffAt)) === "Monday";
}
