import type { PlatformEvent, PlatformEventHandler } from "@/lib/events/types";
import {
  recordChampionShieldLegacy,
  recordShieldSaveLegacy,
  recordSurvivorChampionLegacy,
  recordSurvivorEliminatedLegacy,
  recordSurvivorWeekSurvivedLegacy,
} from "@/lib/survivor/db/careerStats";

/**
 * LegacyCore subscriber for Survivor X — career stats, badges, and Hall of Fame.
 */
export const survivorLegacyHandler: PlatformEventHandler = async (event) => {
  const email =
    event.actorEmail ??
    (typeof event.payload?.email === "string" ? event.payload.email : null);

  if (!email) return;

  try {
    if (event.type === "survivor.survived") {
      await recordSurvivorWeekSurvivedLegacy({ email });
      return;
    }

    if (event.type === "survivor.eliminated") {
      await recordSurvivorEliminatedLegacy({ email });
      return;
    }

    if (event.type === "survivor.shield_activated") {
      await recordShieldSaveLegacy({ email });
      return;
    }

    if (event.type === "survivor.champion_crowned") {
      const payload = event.payload ?? {};
      const seasonYear =
        typeof payload.seasonYear === "number"
          ? payload.seasonYear
          : new Date().getFullYear();
      const leagueId = String(payload.leagueId ?? event.entityId ?? "");
      const displayName = String(payload.displayName ?? email);
      const weeksSurvived =
        typeof payload.weeksSurvived === "number" ? payload.weeksSurvived : 0;
      const shieldWasUsed = payload.shieldWasUsed === true;

      if (leagueId && displayName) {
        await recordSurvivorChampionLegacy({
          email,
          displayName,
          seasonYear,
          leagueId,
          weeksSurvived,
          shieldWasUsed,
        });
      } else {
        await recordChampionShieldLegacy({ email, shieldWasUsed });
      }
    }
  } catch (err) {
    console.error("[SurvivorLegacy]", event.type, err);
  }
};

export function isSurvivorLegacyEvent(event: PlatformEvent): boolean {
  return (
    event.type === "survivor.survived" ||
    event.type === "survivor.eliminated" ||
    event.type === "survivor.shield_activated" ||
    event.type === "survivor.champion_crowned"
  );
}
