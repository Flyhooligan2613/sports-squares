import type { PickemSide } from "@/lib/pickem/types";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

export type HuddleFeedSort =
  | "newest"
  | "trending"
  | "most_copied"
  | "most_liked"
  | "following";

export type CreatorLevel =
  | "community_rookie"
  | "rising_creator"
  | "trusted_picker"
  | "verified_creator"
  | "elite_creator"
  | "legend_creator"
  | "hall_of_fame_creator";

export interface PickSnapshotItem {
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  awayAbbr: string | null;
  homeAbbr: string | null;
  pickedSide: PickemSide;
  kickoffAt: string;
}

export interface HuddlePickPost {
  id: string;
  email: string;
  contestId: string;
  weekLabel: string;
  picks: PickSnapshotItem[];
  weeklyRecord: string | null;
  weeklyStreak: number;
  tierSlug: PlayerTierSlug | null;
  bioSnapshot: string | null;
  likeCount: number;
  copyCount: number;
  publishedAt: string;
  author: HuddlePlayerSummary;
  likedByViewer: boolean;
  copiedByViewer: boolean;
}

export interface HuddleSurvivorPost {
  id: string;
  email: string;
  entryId: string;
  weekId: string;
  leagueId: string;
  weekLabel: string;
  teamAbbr: string;
  teamName: string;
  weeksSurvived: number;
  shieldAvailable: boolean;
  tierSlug: PlayerTierSlug | null;
  bioSnapshot: string | null;
  likeCount: number;
  publishedAt: string;
  author: HuddlePlayerSummary;
  likedByViewer: boolean;
}

export type HuddleFeedItem =
  | { kind: "pickem"; post: HuddlePickPost; publishedAt: string }
  | { kind: "survivor"; post: HuddleSurvivorPost; publishedAt: string };

export interface HuddlePlayerSummary {
  email: string;
  slug: string;
  username: string;
  playerId: string | null;
  avatarEmoji: string;
  tierSlug: PlayerTierSlug;
  tierName: string;
  tierLevel: number;
  communityReputation: number;
  creatorLevel: CreatorLevel;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  pickAccuracyPct: number | null;
  currentStreak: number;
  longestStreak: number;
  bio: string | null;
  favoriteTeam: string | null;
  memberSince: string;
}

export interface HuddleFeedResponse {
  items: HuddleFeedItem[];
  pickOfWeek: HuddlePickPost | null;
  sort: HuddleFeedSort;
}

export const CREATOR_LEVEL_LABELS: Record<CreatorLevel, string> = {
  community_rookie: "Community Rookie",
  rising_creator: "Rising Creator",
  trusted_picker: "Trusted Picker",
  verified_creator: "Verified Creator",
  elite_creator: "Elite Creator",
  legend_creator: "Legend Creator",
  hall_of_fame_creator: "Hall of Fame Creator",
};

export const HUDDLE_TAGLINE = "Where sports fans build their legacy";
