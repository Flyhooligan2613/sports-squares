import type { PlatformEvent, PlatformEventHandler } from "@/lib/events/types";
import { getLiveActivityService } from "@/lib/liveActivity/LiveActivityService";

/**
 * LiveCore™ — ingest Survivor Shield activations into the live activity feed.
 */
export const survivorLiveCoreHandler: PlatformEventHandler = async (event) => {
  if (event.type !== "survivor.shield_activated") return;

  const payload = event.payload ?? {};
  const username =
    (typeof payload.displayName === "string" ? payload.displayName : null) ??
    event.actorEmail ??
    "A player";
  const weekNumber = payload.weekNumber;
  const shieldsCount = payload.shieldsActivatedToday;

  const service = getLiveActivityService();

  service.addLiveActivity({
    type: "survivor_shield",
    category: "community",
    emoji: "🛡️",
    username,
    message:
      typeof shieldsCount === "number" && shieldsCount > 1
        ? `🛡️ ${shieldsCount} Survivor Shields activated this week`
        : `🛡️ ${username}'s Survivor Shield activated!`,
    game: typeof weekNumber === "number" ? `Week ${weekNumber}` : "Survivor X™",
    priority: 92,
    isCelebration: true,
    celebration: {
      headline: "🛡️ SHIELD ACTIVATED",
      title: username,
      subtitle: "You survived another week.",
    },
  });

  if (process.env.EVENT_ENGINE_DEBUG === "true") {
    console.info("[EventEngine:SurvivorLiveCore]", event.type, event.summary ?? "");
  }
};

export function isSurvivorLiveEvent(event: PlatformEvent): boolean {
  return (
    event.type === "survivor.shield_activated" ||
    event.type === "survivor.week_complete"
  );
}

/** Batch shield count message for week_complete events. */
export const survivorWeekLiveHandler: PlatformEventHandler = async (event) => {
  if (event.type !== "survivor.week_complete") return;

  const shieldsActivated = event.payload?.shieldsActivated;
  if (typeof shieldsActivated !== "number" || shieldsActivated <= 0) return;

  getLiveActivityService().addLiveActivity({
    type: "survivor_shield",
    category: "community",
    emoji: "🛡️",
    message: `🛡️ ${shieldsActivated} Survivor Shields activated`,
    game: `Week ${event.payload?.weekNumber ?? "—"}`,
    priority: 88,
    isCelebration: shieldsActivated >= 10,
  });
};
