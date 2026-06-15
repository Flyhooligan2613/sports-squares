import { legacyAuditHandler } from "@/lib/events/handlers/legacyAudit";
import { analyticsHandler } from "@/lib/events/handlers/analytics";
import { liveCoreHandler } from "@/lib/events/handlers/liveCore";
import {
  survivorLegacyHandler,
} from "@/lib/events/handlers/survivorLegacy";
import { survivorRewardsHandler } from "@/lib/events/handlers/survivorRewards";
import {
  survivorLiveCoreHandler,
  survivorWeekLiveHandler,
} from "@/lib/events/handlers/survivorLiveCore";
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

  subscribeToPlatformEvent("survivor.shield_activated", survivorLegacyHandler, {
    name: "SurvivorLegacy",
  });
  subscribeToPlatformEvent("survivor.champion_crowned", survivorLegacyHandler, {
    name: "SurvivorLegacy",
  });
  subscribeToPlatformEvent("survivor.survived", survivorLegacyHandler, {
    name: "SurvivorLegacy",
  });
  subscribeToPlatformEvent("survivor.eliminated", survivorLegacyHandler, {
    name: "SurvivorLegacy",
  });
  subscribeToPlatformEvent("survivor.shield_activated", survivorLiveCoreHandler, {
    name: "SurvivorLiveCore",
    priorities: ["critical", "high"],
  });
  subscribeToPlatformEvent("survivor.week_complete", survivorWeekLiveHandler, {
    name: "SurvivorWeekLive",
  });

  subscribeToPlatformEvent("survivor.survived", survivorRewardsHandler, {
    name: "SurvivorRewards",
  });
  subscribeToPlatformEvent("survivor.shield_activated", survivorRewardsHandler, {
    name: "SurvivorRewards",
  });
  subscribeToPlatformEvent("survivor.life_lost", survivorRewardsHandler, {
    name: "SurvivorRewards",
  });
  subscribeToPlatformEvent("survivor.eliminated", survivorRewardsHandler, {
    name: "SurvivorRewards",
  });
  subscribeToPlatformEvent("survivor.champion_crowned", survivorRewardsHandler, {
    name: "SurvivorRewards",
  });
}
