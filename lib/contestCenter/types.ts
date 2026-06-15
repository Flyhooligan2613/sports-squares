import type { ContestCtaKey, FeaturedCtaPreset } from "@/lib/contestCenter/cta";

export type ContestStatus =
  | "open"
  | "filling"
  | "almost_full"
  | "locked"
  | "live"
  | "completed"
  | "coming_soon";

export type ContestKind = "squares" | "pickem" | "survivor" | "tournament" | "private";

export type ContestFilterId =
  | "all"
  | "nfl"
  | "mlb"
  | "nba"
  | "nhl"
  | "football"
  | "pickem"
  | "survivor"
  | "tournament"
  | "private"
  | "friends"
  | "trending"
  | "new"
  | "favorites"
  | "recent";

export type TrendingBadge =
  | "filling_fast"
  | "highest_prize"
  | "most_popular"
  | "new"
  | "featured";

export interface ContestListing {
  id: string;
  title: string;
  subtitle?: string;
  emoji: string;
  sport: string;
  sportKey: string;
  kind: ContestKind;
  status: ContestStatus;
  href: string;
  kickoffAt?: string;
  gameTimeLabel?: string;
  entryFeeLabel: string;
  playersJoined?: number;
  prizePoolLabel?: string;
  remainingSpots?: number;
  totalSpots?: number;
  fillPercent?: number;
  durationLabel: string;
  contestType: string;
  trendingBadge?: TrendingBadge;
  accent: string;
  featured?: boolean;
  /** Registry key for default CTA copy — see lib/contestCenter/cta.ts */
  ctaKey?: ContestCtaKey;
  /** Admin or campaign override — takes precedence over ctaKey */
  ctaLabel?: string;
  /** Featured contest preset when featured === true and ctaLabel is unset */
  featuredCtaPreset?: FeaturedCtaPreset;
  searchTerms: string[];
  filterTags?: string[];
}

export interface ContestFriendActivity {
  id: string;
  emoji: string;
  name: string;
  action: string;
  href?: string;
}

export interface ContestCenterViewModel {
  featured: ContestListing | null;
  liveContests: ContestListing[];
  trendingContests: ContestListing[];
  friendsActivity: ContestFriendActivity[];
  recommendations: ContestListing[];
  quickJoin: ContestListing | null;
  updatedAt: string;
  hasContests: boolean;
}
