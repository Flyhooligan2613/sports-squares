import { legacyAuditHandler } from "@/lib/events/handlers/legacyAudit";
import { analyticsHandler } from "@/lib/events/handlers/analytics";
import { liveCoreHandler } from "@/lib/events/handlers/liveCore";
import { subscribeToPlatformEvent } from "@/lib/events/engine";

let registered = false;

export function registerDefaultEventHandlers(): void {
  if (registered) return;
  registered = true;

  subscribeToPlatformEvent("*", legacyAuditHandler, { name: "LegacyAudit" });
  subscribeToPlatformEvent("*", analyticsHandler, {
    name: "Analytics",
    priorities: ["background", "normal"],
  });
  subscribeToPlatformEvent("game.started", liveCoreHandler, { name: "LiveCore" });
  subscribeToPlatformEvent("game.checkpoint_completed", liveCoreHandler, { name: "LiveCore" });
  subscribeToPlatformEvent("game.player_won", liveCoreHandler, { name: "LiveCore" });
  subscribeToPlatformEvent("game.payout_completed", liveCoreHandler, { name: "LiveCore" });
  subscribeToPlatformEvent("highlight.activated", liveCoreHandler, { name: "LiveCore" });
  subscribeToPlatformEvent("reward.earned", liveCoreHandler, { name: "LiveCore" });
  subscribeToPlatformEvent("system.leaderboard_refresh", liveCoreHandler, { name: "LiveCore" });
}
