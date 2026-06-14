import type { PlatformEvent, PlatformEventHandler } from "@/lib/events/types";

/** Analytics™ stub — Phase 1 logs background events; future: metrics pipeline. */
export const analyticsHandler: PlatformEventHandler = async (event) => {
  if (process.env.NODE_ENV === "production" && event.priority !== "background") {
    return;
  }

  if (process.env.EVENT_ENGINE_DEBUG === "true") {
    console.info("[EventEngine:Analytics]", event.type, event.eventId);
  }
};
