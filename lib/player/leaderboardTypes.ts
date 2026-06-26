export type LeaderboardTab =
  | "all-time-winnings"
  | "all-time-wins"
  | "weekly-wins"
  | "streak-leaders";

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  slug?: string | null;
  avatarEmoji?: string | null;
  value: number;
  valueLabel: string;
  isViewer: boolean;
}

export interface LeaderboardBoard {
  id: LeaderboardTab;
  title: string;
  subtitle: string;
  entries: LeaderboardEntry[];
  viewerRank: number | null;
}

export interface LeaderboardsData {
  updatedAt: string;
  totalPlayers: number;
  boards: LeaderboardBoard[];
}
