import type { ContestFilterId, ContestStatus, TrendingBadge } from "@/lib/contestCenter/types";

export const CONTEST_FILTERS: { id: ContestFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "nfl", label: "NFL" },
  { id: "mlb", label: "MLB" },
  { id: "nba", label: "NBA" },
  { id: "nhl", label: "NHL" },
  { id: "football", label: "Football" },
  { id: "pickem", label: "Pick'em" },
  { id: "survivor", label: "Survivor" },
  { id: "tournament", label: "Tournament" },
  { id: "private", label: "Private" },
  { id: "friends", label: "Friends" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "recent", label: "Recently Played" },
];

export const STATUS_LABELS: Record<ContestStatus, string> = {
  open: "Open",
  filling: "Filling",
  almost_full: "Almost Full",
  locked: "Locked",
  live: "Live",
  completed: "Completed",
  coming_soon: "Coming Soon",
};

export const TRENDING_LABELS: Record<TrendingBadge, string> = {
  filling_fast: "🔥 Filling Fast",
  highest_prize: "🏆 Highest Prize",
  most_popular: "⭐ Most Popular",
  new: "🆕 Newly Added",
  featured: "👑 Featured by SquareBoards",
};
