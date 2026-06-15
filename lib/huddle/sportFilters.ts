/**
 * The Huddle™ sport filters — scaffold for per-sport community feeds.
 * WNBA is the first women's sport filter; extend as more hubs launch.
 */

export type HuddleSportFilter = "all" | "nfl" | "nba" | "wnba" | "mlb" | "soccer";

export interface HuddleSportFilterOption {
  id: HuddleSportFilter;
  label: string;
  emoji: string;
  available: boolean;
}

export const HUDDLE_SPORT_FILTERS: HuddleSportFilterOption[] = [
  { id: "all", label: "All Sports", emoji: "🏆", available: true },
  { id: "nfl", label: "NFL", emoji: "🏈", available: true },
  { id: "nba", label: "NBA", emoji: "🏀", available: true },
  { id: "wnba", label: "WNBA", emoji: "🏀", available: true },
  { id: "mlb", label: "MLB", emoji: "⚾", available: true },
  { id: "soccer", label: "Soccer", emoji: "⚽", available: true },
];

/** Trending topic scaffold — wired when Huddle feed supports sport-scoped trending. */
export const HUDDLE_TRENDING_WNBA = {
  sport: "wnba" as const,
  label: "Trending WNBA",
  emoji: "🏀",
  hashtags: ["#WNBA", "#OwnTheCourt", "#PickemRoyale"],
  enabled: true,
};

export function parseHuddleSportFilter(value: string | null | undefined): HuddleSportFilter {
  const normalized = value?.trim().toLowerCase();
  const match = HUDDLE_SPORT_FILTERS.find((f) => f.id === normalized);
  return match?.available ? match.id : "all";
}
