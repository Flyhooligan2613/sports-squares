import type { PickemSport } from "@/lib/pickem/types";
import type { SurvivorSport } from "@/lib/survivor/types";

export interface SurvivorSportDefinition {
  id: SurvivorSport;
  label: string;
  emoji: string;
  enabled: boolean;
  /** Turbo playoffs sprint is NFL-only for now. */
  turboAvailable: boolean;
}

export const SURVIVOR_SPORTS: SurvivorSportDefinition[] = [
  {
    id: "nfl",
    label: "NFL",
    emoji: "🏈",
    enabled: true,
    turboAvailable: true,
  },
  {
    id: "mlb",
    label: "MLB",
    emoji: "⚾",
    enabled: true,
    turboAvailable: false,
  },
];

export const SURVIVOR_ENABLED_SPORTS = SURVIVOR_SPORTS.filter((s) => s.enabled);

export function parseSurvivorSport(value?: string | null): SurvivorSport {
  const match = SURVIVOR_ENABLED_SPORTS.find((s) => s.id === value);
  return match?.id ?? "nfl";
}

export function getSurvivorSportDefinition(sport: SurvivorSport): SurvivorSportDefinition {
  return SURVIVOR_SPORTS.find((s) => s.id === sport) ?? SURVIVOR_SPORTS[0]!;
}

export function survivorSportToPickem(sport: SurvivorSport): PickemSport {
  if (sport === "mlb") return "mlb";
  return "nfl";
}

export function survivorSportLabel(sport: SurvivorSport): string {
  return getSurvivorSportDefinition(sport).label;
}
