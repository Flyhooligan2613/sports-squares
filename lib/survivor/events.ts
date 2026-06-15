/** Survivor X™ platform events — publish via EventEngine only. */
export const SURVIVOR_PLATFORM_EVENTS = [
  "survivor.pick_locked",
  "survivor.survived",
  "survivor.eliminated",
  "survivor.week_complete",
  "survivor.champion_crowned",
  "survivor.league_joined",
  "survivor.shield_activated",
  "survivor.shield_depleted",
  "survivor.life_lost",
] as const;

export type SurvivorPlatformEventType =
  (typeof SURVIVOR_PLATFORM_EVENTS)[number];
