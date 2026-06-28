import type { LiveArenaStats, LiveContest, UserSquareMeta } from "./types";
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

export const MOCK_STATS: LiveArenaStats = {
  playersLive: 4281,
  paidToday: 22540,
  winners: 517,
  boardsActive: 214,
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

export function getUserSquareIds(contest: LiveContest): number[] {
  return displayNumbersToSquareIds(
    [...USER_DISPLAY_NUMBERS],
    contest.innerNumbers
  );
}

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
  }));
}

export const PRIMARY_CONTEST = MOCK_CONTESTS[0];
