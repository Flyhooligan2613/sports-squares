import type { SportEventDefinition } from "@/lib/events/types";
import { WNBA_HIGHLIGHT_EVENTS } from "@/lib/wnba/highlightEvents";

const sportEvents = new Map<string, SportEventDefinition>();

function sportEventKey(sportId: string, slug: string): string {
  return `${sportId}.${slug}`;
}

/** Platform event type for a registered sport moment, e.g. `sport.mlb.grand_slam`. */
export function sportPlatformEventType(sportId: string, slug: string): string {
  return `sport.${sportId}.${slug}`;
}

export function registerSportEventDefinition(definition: SportEventDefinition): void {
  const key = sportEventKey(definition.sportId, definition.slug);
  sportEvents.set(key, {
    ...definition,
    enabled: definition.enabled ?? true,
  });
}

export function registerSportEventDefinitions(definitions: SportEventDefinition[]): void {
  for (const definition of definitions) {
    registerSportEventDefinition(definition);
  }
}

export function getSportEventDefinition(
  sportId: string,
  slug: string
): SportEventDefinition | null {
  return sportEvents.get(sportEventKey(sportId, slug)) ?? null;
}

export function listSportEventDefinitions(sportId?: string): SportEventDefinition[] {
  const all = Array.from(sportEvents.values());
  if (!sportId) return all;
  return all.filter((entry) => entry.sportId === sportId);
}

/** Built-in sport moments — extend via registerSportEventDefinition. */
export function registerBuiltinSportEvents(): void {
  registerSportEventDefinitions([
    { id: "nfl.hail_mary", sportId: "nfl", slug: "hail_mary", label: "Hail Mary Touchdown" },
    { id: "nfl.pick_six", sportId: "nfl", slug: "pick_six", label: "Pick Six" },
    { id: "nfl.safety", sportId: "nfl", slug: "safety", label: "Safety" },
    { id: "mlb.grand_slam", sportId: "mlb", slug: "grand_slam", label: "Grand Slam" },
    { id: "mlb.walk_off", sportId: "mlb", slug: "walk_off", label: "Walk-Off Home Run" },
    { id: "mlb.triple_play", sportId: "mlb", slug: "triple_play", label: "Triple Play" },
    { id: "nba.buzzer_beater", sportId: "nba", slug: "buzzer_beater", label: "Buzzer Beater" },
    { id: "soccer.hat_trick", sportId: "soccer", slug: "hat_trick", label: "Hat Trick" },
    { id: "nhl.hat_trick", sportId: "nhl", slug: "hat_trick", label: "Hat Trick" },
    ...WNBA_HIGHLIGHT_EVENTS,
  ]);
}
