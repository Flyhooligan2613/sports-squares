import type { PlatformGameId } from "@/lib/platform/gameTypes";
import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";

export type GameStatusAction = "delayed" | "postponed" | "cancelled" | "forfeit";

export interface GameStatusDecision {
  action: string;
  notifyPlayers: boolean;
  pausePayouts: boolean;
  preserveEntries: boolean;
  refundEntries: boolean;
  followOfficialRuling: boolean;
}

export async function resolveGameStatusDecision(
  status: GameStatusAction,
  gameType: PlatformGameId
): Promise<GameStatusDecision> {
  const rules = await getAdminConfig("game_status");
  const action = rules[status];

  switch (status) {
    case "delayed":
      return {
        action,
        notifyPlayers: true,
        pausePayouts: true,
        preserveEntries: true,
        refundEntries: false,
        followOfficialRuling: false,
      };
    case "postponed":
      return {
        action,
        notifyPlayers: true,
        pausePayouts: true,
        preserveEntries: true,
        refundEntries: false,
        followOfficialRuling: false,
      };
    case "cancelled":
      return {
        action,
        notifyPlayers: true,
        pausePayouts: true,
        preserveEntries: false,
        refundEntries: true,
        followOfficialRuling: false,
      };
    case "forfeit":
      return {
        action,
        notifyPlayers: true,
        pausePayouts: false,
        preserveEntries: true,
        refundEntries: false,
        followOfficialRuling: true,
      };
    default:
      return {
        action: "manual_review",
        notifyPlayers: true,
        pausePayouts: true,
        preserveEntries: true,
        refundEntries: false,
        followOfficialRuling: false,
      };
  }
}
