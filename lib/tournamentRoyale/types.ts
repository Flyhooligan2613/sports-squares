export type TournamentKey =
  | "ncaab_mens"
  | "ncaab_womens"
  | "nba_playoffs"
  | "nhl_playoffs"
  | "fifa_world_cup"
  | "uefa_champions_league"
  | "college_baseball"
  | "cfp";

export type TournamentSport = "ncaab" | "nba" | "nhl" | "soccer" | "mlb" | "ncaaf";

export type TournamentEventStatus = "draft" | "open" | "active" | "complete" | "archived";

export type TournamentRoundStatus = "scheduled" | "open" | "locked" | "scoring" | "complete";

export type TournamentMatchupStatus = "scheduled" | "live" | "final";

export interface TournamentDefinition {
  key: TournamentKey;
  sport: TournamentSport;
  emoji: string;
  name: string;
  description: string;
  available: boolean;
}

export interface TournamentLiveMap {
  remainingPerfectBrackets: number;
  communityAccuracyPct: number;
  topPlayers: { name: string; points: number }[];
  mostPickedChampion: string | null;
  biggestUpset: string | null;
  trendingGames: string[];
  playersActive: number;
}

export interface TournamentHubView {
  event: {
    id: string;
    name: string;
    tournamentKey: TournamentKey;
    sport: TournamentSport;
    seasonYear: number;
    status: TournamentEventStatus;
    currentRoundLabel: string;
    currentRoundNumber: number;
    locksAt: string | null;
  };
  entry: {
    id: string;
    totalPoints: number;
    accuracyPct: number;
    bracketCompletionPct: number;
    rankPosition: number | null;
    cinderellaMeter: number;
    comboStreak: number;
    comboMultiplier: number;
    bestComboStreak: number;
    shieldAvailable: boolean;
    tournamentXp: number;
  } | null;
  stats: {
    gamesRemaining: number;
    friendsRemaining: number;
    communityRank: number | null;
    bestUpset: string | null;
    biggestMiss: string | null;
    rewardProgressPct: number;
  };
  liveMap: TournamentLiveMap;
  currentRoundId: string | null;
  joined: boolean;
}

export interface BracketMatchupView {
  id: string;
  slotIndex: number;
  region: string | null;
  topTeamName: string;
  topTeamSeed: number;
  bottomTeamName: string;
  bottomTeamSeed: number;
  winnerTeamName: string | null;
  status: TournamentMatchupStatus;
  topScore: number | null;
  bottomScore: number | null;
  pickedTeamName: string | null;
  isCorrect: boolean | null;
  isUpset: boolean;
  pointsEarned: number;
  cinderellaPoints: number;
  isWinningPath: boolean;
  picksLocked: boolean;
}

export interface BracketRoundView {
  id: string;
  roundNumber: number;
  label: string;
  status: TournamentRoundStatus;
  matchups: BracketMatchupView[];
}

export interface BracketView {
  event: TournamentHubView["event"];
  entry: TournamentHubView["entry"];
  rounds: BracketRoundView[];
  canPick: boolean;
}
