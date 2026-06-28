import type {
  ContestCenterStats,
  LiveArenaStats,
  LiveContest,
  LiveContestSummary,
  UserSquareMeta,
} from "./types";
import { displayNumbersToSquareIds } from "./squareUtils";

/** Fixed axis numbers — stay locked entire contest (standard squares). */
const BILLS_CHIEFS_TOP = [3, 7, 1, 9, 0, 5, 2, 8, 4, 6];
const BILLS_CHIEFS_SIDE = [2, 8, 4, 1, 7, 0, 9, 3, 6, 5];

/** Deterministic inner-number draw (display labels 1–100 on grid). */
function buildInnerNumbers(seed: number): number[] {
  const nums = Array.from({ length: 100 }, (_, i) => i + 1);
  let s = seed;
  for (let i = nums.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

export const USER_DISPLAY_NUMBERS = [12, 18, 47, 89] as const;

/** Styled team badges for broadcast header (emoji + brand tones). */
export const TEAM_BADGES: Record<
  string,
  { emoji: string; primary: string; accent: string }
> = {
  BUF: { emoji: "🦬", primary: "#00338D", accent: "#C60C30" },
  KC: { emoji: "🏹", primary: "#E31837", accent: "#FFB612" },
  LAL: { emoji: "🏀", primary: "#552583", accent: "#FDB927" },
  MIA: { emoji: "🔥", primary: "#98002E", accent: "#F9A01B" },
  NYY: { emoji: "⚾", primary: "#0C2340", accent: "#C4CED4" },
  BOS: { emoji: "🧦", primary: "#BD3039", accent: "#0C2340" },
  DAL: { emoji: "⭐", primary: "#003594", accent: "#869397" },
  PHI: { emoji: "🦅", primary: "#004C54", accent: "#A5ACAF" },
  PK: { emoji: "📋", primary: "#1e3a5f", accent: "#60a5fa" },
  W12: { emoji: "📅", primary: "#312e81", accent: "#818cf8" },
};

export function getTeamBadge(abbr: string) {
  return (
    TEAM_BADGES[abbr] ?? {
      emoji: "🏟",
      primary: "#1e3a5f",
      accent: "#60a5fa",
    }
  );
}

export const MOCK_STATS: LiveArenaStats = {
  playersLive: 4281,
  paidToday: 22540,
  winners: 517,
  boardsActive: 214,
};

export const MOCK_CENTER_STATS: ContestCenterStats = {
  activeContests: 5,
  potentialWinnings: 2500,
  walletBalance: 1847,
  winningBoards: 2,
  upcomingGames: 3,
  contestHistoryCount: 47,
};

export const MOCK_CONTESTS: LiveContest[] = [
  {
    id: "bills-chiefs",
    awayTeam: "Bills",
    awayAbbr: "BUF",
    homeTeam: "Chiefs",
    homeAbbr: "KC",
    sport: "nfl",
    prizePool: 5000,
    contestType: "10×10 Classic",
    topNumbers: BILLS_CHIEFS_TOP,
    sideNumbers: BILLS_CHIEFS_SIDE,
    innerNumbers: buildInnerNumbers(42),
    isLive: true,
  },
  {
    id: "lakers-heat",
    awayTeam: "Lakers",
    awayAbbr: "LAL",
    homeTeam: "Heat",
    homeAbbr: "MIA",
    sport: "nba",
    prizePool: 3200,
    contestType: "10×10 Classic",
    topNumbers: [8, 1, 4, 9, 0, 3, 7, 2, 5, 6],
    sideNumbers: [5, 0, 9, 2, 7, 4, 1, 8, 3, 6],
    innerNumbers: buildInnerNumbers(17),
    isLive: true,
  },
  {
    id: "yankees-redsox",
    awayTeam: "Yankees",
    awayAbbr: "NYY",
    homeTeam: "Red Sox",
    homeAbbr: "BOS",
    sport: "mlb",
    prizePool: 2800,
    contestType: "Inning Squares",
    topNumbers: [1, 6, 3, 8, 0, 4, 9, 2, 7, 5],
    sideNumbers: [7, 2, 5, 0, 9, 1, 4, 8, 3, 6],
    innerNumbers: buildInnerNumbers(99),
    isLive: true,
  },
  {
    id: "cowboys-eagles",
    awayTeam: "Cowboys",
    awayAbbr: "DAL",
    homeTeam: "Eagles",
    homeAbbr: "PHI",
    sport: "nfl",
    prizePool: 4200,
    contestType: "10×10 Classic",
    topNumbers: BILLS_CHIEFS_TOP,
    sideNumbers: BILLS_CHIEFS_SIDE,
    innerNumbers: buildInnerNumbers(71),
    isLive: true,
  },
  {
    id: "pickem-week",
    awayTeam: "Pick'em",
    awayAbbr: "PK",
    homeTeam: "Week 12",
    homeAbbr: "W12",
    sport: "pickem",
    prizePool: 1500,
    contestType: "Survivor Pick'em",
    topNumbers: BILLS_CHIEFS_TOP,
    sideNumbers: BILLS_CHIEFS_SIDE,
    innerNumbers: buildInnerNumbers(55),
    isLive: false,
  },
];

/** Live score snapshots for contest center cards (mock). */
export const MOCK_CONTEST_SUMMARIES: LiveContestSummary[] = MOCK_CONTESTS.map(
  (c) => {
    if (c.id === "bills-chiefs") {
      return {
        ...c,
        awayScore: 17,
        homeScore: 21,
        quarter: 3,
        clock: "8:41",
        userStatus: "winning",
      };
    }
    if (c.id === "lakers-heat") {
      return {
        ...c,
        awayScore: 98,
        homeScore: 102,
        quarter: 4,
        clock: "2:14",
        userStatus: "active",
      };
    }
    if (c.id === "yankees-redsox") {
      return {
        ...c,
        awayScore: 4,
        homeScore: 3,
        quarter: 7,
        clock: "Bot 7",
        userStatus: "in-play",
      };
    }
    if (c.id === "cowboys-eagles") {
      return {
        ...c,
        awayScore: 14,
        homeScore: 10,
        quarter: 2,
        clock: "5:33",
        userStatus: "active",
      };
    }
    return {
      ...c,
      userStatus: "upcoming",
      startTime: "Sun 4:25 PM ET",
    };
  }
);

export function getUserSquareIds(contest: LiveContest): number[] {
  return displayNumbersToSquareIds(
    [...USER_DISPLAY_NUMBERS],
    contest.innerNumbers
  );
}

const SQUARE_STATUSES: UserSquareMeta["status"][] = [
  "in-play",
  "active",
  "winning",
  "in-play",
];

export function buildUserSquareMeta(contest: LiveContest): UserSquareMeta[] {
  const ids = getUserSquareIds(contest);
  const payouts = [625, 625, 625, 625];
  const winRates = [0.08, 0.11, 0.06, 0.09];
  const quartersWon = [[], [2], [], [1, 3]];

  return ids.map((squareId, i) => ({
    squareId,
    displayNumber: USER_DISPLAY_NUMBERS[i],
    potentialPayout: payouts[i] ?? 625,
    historicalWinRate: winRates[i] ?? 0.08,
    quartersWon: quartersWon[i] ?? [],
    status: SQUARE_STATUSES[i] ?? "in-play",
  }));
}

export const PRIMARY_CONTEST = MOCK_CONTESTS[0];
