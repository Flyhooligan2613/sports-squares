/** Standard Open Graph image dimensions for all SquareBoards share cards. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export interface ProfileShareData {
  username: string;
  displayName: string;
  avatarEmoji: string;
  competitorScore: number;
  rankTitle: string;
  tierName: string;
  level: number;
  worldRankLabel: string;
  headline: string;
  followers: number;
  winStreak: number;
  favoriteSport: string;
  showcaseAchievement: { title: string; emoji: string } | null;
  badges: string[];
}

export interface ContestShareData {
  id: string;
  name: string;
  sport: string;
  entryFeeLabel: string;
  prizePoolLabel: string;
  playerCount: number;
  spotsRemaining: number;
  countdownLabel: string;
  status: string;
}

export interface WinnerShareData {
  username: string;
  displayName: string;
  avatarEmoji: string;
  contestName: string;
  placement: string;
  prizeLabel: string;
  scoreEarned: number;
  winStreak: number;
}

export interface LevelUpShareData {
  username: string;
  displayName: string;
  avatarEmoji: string;
  oldTier: string;
  newTier: string;
  competitorScore: number;
  progressPct: number;
}

export interface AchievementShareData {
  username: string;
  displayName: string;
  avatarEmoji: string;
  achievementName: string;
  description: string;
  emoji: string;
  unlockedLabel: string;
}

export interface TrophyShareData {
  username: string;
  displayName: string;
  avatarEmoji: string;
  trophyTitle: string;
  competition: string;
  placement: string;
  prizeLabel: string;
  dateLabel: string;
}

export interface ReferralShareData {
  referrerName: string;
  avatarEmoji: string;
  referralCode: string;
  rewardLabel: string;
  bonusLabel: string;
}

export interface LeaderboardShareData {
  period: "weekly" | "monthly" | "all-time";
  periodLabel: string;
  topEntries: Array<{ rank: number; name: string; scoreLabel: string; tier: string; trend: string }>;
}

export interface StoryShareData {
  username: string;
  displayName: string;
  avatarEmoji: string;
  headline: string;
  highlights: string[];
}

export interface SeasonShareData {
  username: string;
  displayName: string;
  avatarEmoji: string;
  seasonLabel: string;
  totalWins: number;
  totalEntries: number;
  prizeMoneyLabel: string;
  bestSport: string;
  achievementCount: number;
  favoriteCompetition: string;
  hoursPlayed: number;
  legacyProgressPct: number;
}

export interface HomeShareData {
  title: string;
  tagline: string;
  description: string;
}
