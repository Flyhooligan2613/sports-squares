import {
  findWinningSquare,
  type WinningSquareMatch,
} from "@/lib/winnerEngine";

export type { WinningSquareMatch };

/** Map display numbers (1–100) to grid square IDs via inner number assignment. */
export function displayNumbersToSquareIds(
  displayNumbers: number[],
  innerNumbers: number[]
): number[] {
  return displayNumbers
    .map((num) => innerNumbers.indexOf(num))
    .filter((id) => id >= 0);
}

export function getWinningSquareMatch(
  topNumbers: number[],
  sideNumbers: number[],
  homeScore: number,
  awayScore: number
): WinningSquareMatch | null {
  return findWinningSquare(topNumbers, sideNumbers, homeScore, awayScore);
}

export function getWinningSquareId(
  topNumbers: number[],
  sideNumbers: number[],
  homeScore: number,
  awayScore: number
): number | null {
  return getWinningSquareMatch(topNumbers, sideNumbers, homeScore, awayScore)
    ?.squareId ?? null;
}

export function formatClock(quarter: number, clock: string): string {
  const labels: Record<number, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
  };
  return `Quarter ${labels[quarter] ?? quarter}, ${clock} Remaining`;
}
