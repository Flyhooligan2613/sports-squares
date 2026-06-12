export interface PublicPlayerProfile {
  slug: string;
  displayName: string;
  memberSince: string;
  headline: string;
  stats: import("@/lib/player/legacyTypes").PlayerLegacyStats;
  achievements: import("@/lib/player/legacyTypes").PlayerAchievement[];
  ranks: Array<{ title: string; rank: number }>;
  isOwner: boolean;
}
