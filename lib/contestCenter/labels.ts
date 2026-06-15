import type { ContestFilterId, ContestStatus, TrendingBadge } from "@/lib/contestCenter/types";

export const CONTEST_SPORT_TABS = [
  { id: "nfl", label: "NFL", emoji: "🏈", href: "/games/nfl" },
  { id: "mlb", label: "MLB", emoji: "⚾", href: "/games/mlb" },
  { id: "nba", label: "NBA", emoji: "🏀", href: "/games/nba" },
  { id: "nhl", label: "NHL", emoji: "🏒", href: "/pickem?sport=nhl" },
  { id: "football", label: "Soccer", emoji: "⚽", href: "/soccer-predictor" },
] as const;

export const CONTEST_FILTER_TABS: { id: ContestFilterId; label: string; emoji?: string }[] = [
  { id: "all", label: "All", emoji: "🏆" },
  { id: "pickem", label: "Pick'em", emoji: "🎯" },
  { id: "survivor", label: "Survivor", emoji: "🛡️" },
  { id: "tournament", label: "Tournament", emoji: "🏅" },
  { id: "trending", label: "Trending", emoji: "🔥" },
  { id: "friends", label: "Friends", emoji: "👥" },
  { id: "private", label: "Private", emoji: "🔑" },
  { id: "new", label: "New", emoji: "✨" },
  { id: "recent", label: "Recent", emoji: "↩️" },
];

/** @deprecated Use CONTEST_FILTER_TABS */
export const CONTEST_FILTERS = CONTEST_FILTER_TABS;

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
