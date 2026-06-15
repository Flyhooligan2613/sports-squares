/**
 * Executive Directive #001 — Project Legacy
 * Competitive platform language. Single source of truth for player-facing copy.
 * Internal stat keys (e.g. lifetimeWinnings) stay unchanged — use display labels here.
 */

export const PLATFORM_IDENTITY = {
  name: "SquareBoards",
  tagline: "The world's premier competitive sports platform.",
  category: "Competitive Sports Platform",
  mission:
    "Every fan deserves a place to compete, build reputation, and create unforgettable game day memories.",
} as const;

/** Primary platform CTA — use on buttons, cards, and hero actions. */
export const JOIN_THE_CONTEST = "Join the Contest";

export const PLATFORM_TERMS = {
  joinTheContest: JOIN_THE_CONTEST,
  contestCenter: "Contest Center",
  contestCenterTitle: "The Contest Center",
  contestCenterSubtitle:
    "What's live, what's starting soon, and which contest you should enter next — updated automatically.",
  contestWinnings: "Contest Winnings",
  competitionHistory: "Competition History",
  competitionResults: "Competition Results",
  competitor: "Competitor",
  competitors: "Competitors",
  browseContests: "Browse Contests",
  browseLiveContests: "Browse Live Contests",
  enterContest: "Enter the Contest",
  findAContest: "Find a contest",
  lifetimeContestWinnings: "Lifetime Contest Winnings",
  totalContestWinnings: "Total Contest Winnings",
  winHistory: "Competition History",
  playersLabel: "Competitors",
  userLabel: "Competitor",
} as const;

/** Game-specific "Join the Contest" lines from Directive #001. */
export const JOIN_CONTEST_BY_GAME = {
  squares: `${JOIN_THE_CONTEST} · Sports Squares™`,
  nflSquares: `${JOIN_THE_CONTEST} · Sports Squares™`,
  pickem: `${JOIN_THE_CONTEST} · Pick'em Royale™`,
  survivor: `${JOIN_THE_CONTEST} · Survivor X™`,
  tournamentRoyale: `${JOIN_THE_CONTEST} · Tournament Royale™`,
  mlbSquares: `${JOIN_THE_CONTEST} · MLB Squares™`,
  baseballPickem: `${JOIN_THE_CONTEST} · MLB Pick'em`,
  soccerPickem: `${JOIN_THE_CONTEST} · Football Pick'em Royale™`,
} as const;

export function joinContestCta(gameLabel: string): string {
  return `${JOIN_THE_CONTEST} · ${gameLabel}`;
}

/** Replace legacy gambling-oriented labels in UI copy. */
export const LEGACY_TERM_MAP: Record<string, string> = {
  "Play Now": JOIN_THE_CONTEST,
  "Play Pick'em": JOIN_CONTEST_BY_GAME.pickem,
  "Browse Boards": PLATFORM_TERMS.browseLiveContests,
  "Browse Live Boards": PLATFORM_TERMS.browseLiveContests,
  "Action Center": PLATFORM_TERMS.contestCenter,
  "The Action Center": PLATFORM_TERMS.contestCenterTitle,
  "My Winnings": PLATFORM_TERMS.contestWinnings,
  "Win History": PLATFORM_TERMS.competitionHistory,
  History: PLATFORM_TERMS.competitionHistory,
  "Total Winnings": PLATFORM_TERMS.totalContestWinnings,
  "Lifetime Winnings": PLATFORM_TERMS.lifetimeContestWinnings,
  "All-Time Winnings": PLATFORM_TERMS.lifetimeContestWinnings,
  Bettor: PLATFORM_TERMS.competitor,
  Bettors: PLATFORM_TERMS.competitors,
  Sportsbook: PLATFORM_TERMS.contestCenter,
  "Place Bet": PLATFORM_TERMS.enterContest,
  "Bet History": PLATFORM_TERMS.competitionHistory,
  "Get in the game": JOIN_THE_CONTEST,
  "Play Today's Boards": PLATFORM_TERMS.browseLiveContests,
};

export const MANIFESTO_PRINCIPLES = [
  "Every Fan Has A Chance.",
  "There Is No Wait Line.",
  "Protect The Player's Emotion.",
  "Build Moments, Not Features.",
  "Competition Before Transactions.",
  "Reputation Before Revenue.",
  "Trust Before Growth.",
  "Never Leave The Competitor Standing Still.",
] as const;

export const SQUAREBOARDS_TEST = [
  "Does this make competition more exciting?",
  "Does this strengthen community?",
  "Does this reward commitment?",
  "Does this build reputation?",
  "Does this improve the player experience?",
  "Does this create another memorable moment?",
] as const;
