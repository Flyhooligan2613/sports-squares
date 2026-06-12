export interface PlayerLegacyStats {
  lifetimeWinnings: number;
  lifetimeWins: number;
  squaresWon: number;
  boardsPlayed: number;
  totalSquaresPurchased: number;
  seasonsPlayed: number;
  yearsPlayed: number;
  currentWinStreak: number;
  longestWinStreak: number;
}

export interface PlayerAchievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

export interface PlayerLegacyData {
  displayName: string;
  email: string;
  memberSince: string;
  stats: PlayerLegacyStats;
  achievements: PlayerAchievement[];
  headline: string;
}
