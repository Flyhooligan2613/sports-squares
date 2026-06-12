/** Sport keys for pick'em — extensible beyond NFL. */
export type PickemSport =
  | "nfl"
  | "ncaaf"
  | "nba"
  | "ncaab"
  | "mlb"
  | "nhl"
  | "soccer";

export type PickemContestStatus = "open" | "active" | "complete";
export type PickemGameStatus =
  | "scheduled"
  | "live"
  | "final"
  | "cancelled"
  | "postponed";
export type PickemSide = "away" | "home";
export type PickemPlayerWeekStatus =
  | "active"
  | "eliminated"
  | "tiebreaker"
  | "winner"
  | "prize_split";

export type PickemTiebreakerStatus =
  | "pending"
  | "active"
  | "locked"
  | "complete"
  | "split";

export type PickemLeagueResolutionStatus =
  | "open"
  | "sunday_complete"
  | "tiebreaker_active"
  | "complete"
  | "payout_pending";
export type PickemWinnerSide = PickemSide | "tie";

export interface PickemContest {
  id: string;
  sport: PickemSport;
  seasonYear: number;
  seasonType: number;
  weekNumber: number;
  label: string;
  status: PickemContestStatus;
  prizePoolCents: number;
  playerCount: number;
  payoutStatus?: "none" | "pending" | "processing" | "paid" | "skipped";
}

export interface PickemGame {
  id: string;
  contestId: string;
  espnGameId: string;
  awayTeam: string;
  homeTeam: string;
  awayAbbr: string | null;
  homeAbbr: string | null;
  awayRecord: string | null;
  homeRecord: string | null;
  awayLogoUrl: string | null;
  homeLogoUrl: string | null;
  kickoffAt: string;
  status: PickemGameStatus;
  winnerSide: PickemWinnerSide | null;
  awayScore: number | null;
  homeScore: number | null;
  picksLocked: boolean;
  isMondayNight: boolean;
}

export interface PickemPick {
  id: string;
  contestId: string;
  gameId: string;
  email: string;
  pickedSide: PickemSide;
  isCorrect: boolean | null;
  lockedAt: string | null;
  leagueId?: string | null;
}

export interface PickemPlayerStats {
  email: string;
  sport: PickemSport;
  seasonYear: number;
  weeklyWins: number;
  weeklyLosses: number;
  weeklyPending: number;
  seasonWins: number;
  seasonLosses: number;
  lifetimeWins: number;
  lifetimeLosses: number;
  currentStreak: number;
  longestStreak: number;
  perfectWeekStreak: number;
  weeklyWinStreak: number;
  weeksPlayed: number;
  perfectWeeks: number;
  seasonChampionships: number;
  totalPicks: number;
  correctPicks: number;
  pickAccuracyPct: number;
  mondayTiebreakerWins: number;
  lifetimeEarningsCents: number;
  bestFinish: number | null;
  lifetimePickemWins: number;
  bestWeeklyRecord: string | null;
  achievements: PickemAchievement[];
}

export interface PickemWeekView {
  contest: PickemContest;
  games: PickemGameView[];
  progress: PickemPickProgress;
  playerStats: PickemPlayerStats | null;
  liveSummary: PickemLiveSummary | null;
  myPicks: PickemMyPicksSummary | null;
  entry: PickemEntryStatus;
  pools: PickemPoolSummary[];
  playerStatus: PickemPlayerPoolStatus | null;
  tiebreaker: PickemTiebreakerView | null;
}

export interface PickemEntryStatus {
  tierCents: number;
  amountCents: number;
  paid: boolean;
  requiresAuth: boolean;
}

export interface PickemPoolSummary {
  id: string;
  poolNumber: number;
  playerCount: number;
  maxPlayers: number;
  remainingSpots: number;
  prizePoolCents: number;
  entryTierCents: number;
  status: "open" | "full" | "complete";
  resolutionStatus: PickemLeagueResolutionStatus;
  poolStatusLabel: string;
  label: string;
  nextKickoffAt: string | null;
}

export interface PickemPlayerPoolStatus {
  status: PickemPlayerWeekStatus | null;
  sundayRecord: string | null;
  poolNumber: number | null;
  poolLabel: string | null;
  finishPlace: number | null;
  payoutCents: number | null;
}

export interface PickemTiebreakerView {
  active: boolean;
  tiebreakerId: string | null;
  status: PickemTiebreakerStatus | null;
  mondayGame: PickemGame | null;
  playersRemaining: number;
  prizePoolCents: number;
  predictedTotal: number | null;
  locked: boolean;
  kickoffAt: string | null;
  actualTotal: number | null;
}

export interface PickemMyPicksSummary {
  weeklyRecord: string;
  seasonRecord: string;
  currentStreak: number;
  longestStreak: number;
  projectedWeeklyRank: number | null;
  projectedSeasonRank: number | null;
  pickAccuracyPct: number;
  lifetimeRecord: string;
  perfectWeeks: number;
  weeksPlayed: number;
  leagueLabel: string | null;
}

export interface PickemGameView extends PickemGame {
  userPick: PickemSide | null;
  resultState: "pending" | "correct" | "incorrect" | "locked" | "unpicked";
}

export interface PickemPickProgress {
  total: number;
  completed: number;
  remaining: number;
  pct: number;
}

export interface PickemLiveSummary {
  weeklyRecord: string;
  seasonRecord: string;
  currentStreak: number;
  longestStreak: number;
  pickAccuracyPct: number;
  lifetimeRecord: string;
  projectedWeeklyRank: number | null;
  projectedSeasonRank: number | null;
  leagueLabel: string | null;
}

export interface PickemOverviewStats {
  playersThisWeek: number;
  prizePoolCents: number;
  longestActiveStreak: number;
  seasonWeek: number;
  gamesRemaining: number;
  contestLabel: string;
}

export type PickemLeaderboardScope =
  | "worldwide"
  | "united-states"
  | "state"
  | "friends";

export type PickemLeaderboardPeriod = "weekly" | "monthly" | "season" | "all-time";

export type PickemLeaderboardSort =
  | "accuracy"
  | "wins"
  | "current-streak"
  | "longest-streak"
  | "perfect-weeks"
  | "earnings"
  | "championships";

export interface PickemLeaderboardEntry {
  rank: number;
  displayName: string;
  email: string;
  value: number;
  valueLabel: string;
  isViewer: boolean;
}

export interface PickemLeaderboardBoard {
  id: string;
  title: string;
  scope: PickemLeaderboardScope;
  period: PickemLeaderboardPeriod;
  sort: PickemLeaderboardSort;
  entries: PickemLeaderboardEntry[];
  viewerRank: number | null;
}

export interface PickemAchievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string | null;
}

export interface PickemScheduleGame {
  espnGameId: string;
  awayTeam: string;
  homeTeam: string;
  awayAbbr: string | null;
  homeAbbr: string | null;
  awayRecord: string | null;
  homeRecord: string | null;
  awayLogoUrl: string | null;
  homeLogoUrl: string | null;
  kickoffAt: string;
  status: PickemGameStatus;
  winnerSide: PickemWinnerSide | null;
  awayScore: number | null;
  homeScore: number | null;
  completed: boolean;
}

export interface PickemWeekHistoryEntry {
  id: string;
  email: string;
  contestId: string;
  leagueId: string | null;
  sport: PickemSport;
  seasonYear: number;
  weekLabel: string;
  entryTierCents: number;
  poolNumber: number;
  weeklyRecord: string;
  finishPlace: number | null;
  status: PickemPlayerWeekStatus;
  earningsCents: number;
  tiebreakerUsed: boolean;
  createdAt: string;
}

export interface PickemSeasonArchive {
  id: string;
  sport: PickemSport;
  seasonYear: number;
  championEmail: string | null;
  championDisplayName: string | null;
  championRecord: string | null;
  championAccuracyPct: number;
  championLongestStreak: number;
  championPerfectWeeks: number;
  championEarningsCents: number;
  totalPlayers: number;
  totalWeeks: number;
  archivedAt: string;
}

export interface PickemSeasonStanding {
  rank: number;
  email: string;
  displayName: string;
  seasonWins: number;
  seasonLosses: number;
  pickAccuracyPct: number;
  longestStreak: number;
  perfectWeeks: number;
  lifetimePickemWins: number;
  earningsCents: number;
}

export interface PickemScoreboardMeta {
  weekNumber: number;
  seasonYear: number;
  seasonType: number;
}
