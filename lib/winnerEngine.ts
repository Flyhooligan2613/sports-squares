import type { ScoringPeriod, Square, WinnerResult } from "./types";

export function getLastDigit(score: number): number {
  return Math.abs(Math.floor(score)) % 10;
}

export interface WinningSquareMatch {
  squareId: number;
  row: number;
  col: number;
  homeDigit: number;
  awayDigit: number;
}

export function findWinningSquare(
  topNumbers: number[],
  sideNumbers: number[],
  homeScore: number,
  awayScore: number
): WinningSquareMatch | null {
  const homeDigit = getLastDigit(homeScore);
  const awayDigit = getLastDigit(awayScore);

  const col = topNumbers.indexOf(homeDigit);
  const row = sideNumbers.indexOf(awayDigit);

  if (col === -1 || row === -1) return null;

  return {
    squareId: row * 10 + col,
    row,
    col,
    homeDigit,
    awayDigit,
  };
}

export function calculateWinner(
  quarter: ScoringPeriod,
  topNumbers: number[],
  sideNumbers: number[],
  squares: Square[],
  homeScore: number,
  awayScore: number
): WinnerResult | null {
  const match = findWinningSquare(
    topNumbers,
    sideNumbers,
    homeScore,
    awayScore
  );
  if (!match) return null;

  const square = squares[match.squareId];
  const ownerName = square?.owner?.name ?? "Unclaimed";

  return {
    quarter,
    homeScore,
    awayScore,
    homeDigit: match.homeDigit,
    awayDigit: match.awayDigit,
    squareId: match.squareId,
    ownerName,
  };
}
