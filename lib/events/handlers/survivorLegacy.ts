import type { PlatformEvent, PlatformEventHandler } from "@/lib/events/types";
import {
  recordChampionShieldLegacy,
  recordShieldSaveLegacy,
} from "@/lib/survivor/db/careerStats";

/**
 * LegacyCore™ subscriber for Survivor Shields™ — career stats and achievement badges.
 */
export const survivorLegacyHandler: PlatformEventHandler = async (event) => {
  if (event.type === "survivor.shield_activated") {
    const email =
      event.actorEmail ??
      (typeof event.payload?.email === "string" ? event.payload.email : null);

    if (email) {
      await recordShieldSaveLegacy({ email }).catch((err) => {
        console.error("[SurvivorLegacy:shield]", err);
      });
    }
    return;
  }

  if (event.type === "survivor.champion_crowned") {
    const shieldWasUsed = event.payload?.shieldWasUsed === true;
    const email = event.actorEmail;

    if (email) {
      await recordChampionShieldLegacy({ email, shieldWasUsed }).catch((err) => {
        console.error("[SurvivorLegacy:champion]", err);
      });
    }
    return;
  }
};

export function isSurvivorLegacyEvent(event: PlatformEvent): boolean {
  return (
    event.type === "survivor.shield_activated" ||
    event.type === "survivor.champion_crowned"
  );
}
