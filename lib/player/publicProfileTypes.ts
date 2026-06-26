export interface PublicPlayerProfile {
  slug: string;
  username?: string | null;
  displayName: string;
  memberSince: string;
  headline: string;
  stats: import("@/lib/player/legacyTypes").PlayerLegacyStats;
  achievements: import("@/lib/player/legacyTypes").PlayerAchievement[];
  ranks: Array<{ title: string; rank: number }>;
  isOwner: boolean;
  avatarEmoji?: string;
  playerId?: string | null;
  bio?: string | null;
  tierName?: string;
  tierSlug?: string;
  pickAccuracyPct?: number | null;
  followerCount?: number;
  followingCount?: number;
  communityReputation?: number;
  creatorLevel?: string;
  isVerified?: boolean;
  favoriteTeam?: string | null;
  viewerIsFollowing?: boolean;
}
