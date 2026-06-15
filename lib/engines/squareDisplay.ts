const INNER_SQUARE_COUNT = 100;

export function hasInnerSquareNumbers(
  innerNumbers?: number[] | null
): innerNumbers is number[] {
  return innerNumbers?.length === INNER_SQUARE_COUNT;
}

/** Display label (1–100) for a grid position after kickoff number draw. */
export function getSquareDisplayNumber(
  squareId: number,
  innerNumbers?: number[] | null
): number | null {
  if (!hasInnerSquareNumbers(innerNumbers)) return null;
  if (squareId < 0 || squareId >= INNER_SQUARE_COUNT) return null;
  return innerNumbers[squareId];
}

export function formatSquareDisplayLabel(
  squareId: number,
  innerNumbers?: number[] | null
): string {
  const display = getSquareDisplayNumber(squareId, innerNumbers);
  if (display != null) return `#${display}`;
  return "Available square";
}
