import type { PlatformEvent, PlatformEventHandler } from "@/lib/events/types";

/**
 * LiveCore™ stub — Phase 1 marks events for future live activity feed ingestion.
 * Phase 2 will push to LiveActivityService / API consumers.
 */
export const liveCoreHandler: PlatformEventHandler = async (event) => {
  const liveTypes = new Set([
    "game.started",
    "game.checkpoint_completed",
    "game.player_won",
    "game.payout_completed",
    "highlight.activated",
    "reward.earned",
    "system.leaderboard_refresh",
  ]);

  if (!liveTypes.has(event.type) && !event.type.startsWith("sport.")) {
    return;
  }

  if (process.env.EVENT_ENGINE_DEBUG === "true") {
    console.info("[EventEngine:LiveCore]", event.type, event.summary ?? "");
  }
};
