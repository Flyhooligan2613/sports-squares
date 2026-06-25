export type BoardFillIndicator = "popular" | "nearly_full" | "sold_out";

const INDICATOR_LABELS: Record<BoardFillIndicator, string> = {
  popular: "Popular",
  nearly_full: "Nearly Full",
  sold_out: "Sold Out",
};

export function getBoardFillIndicator(
  fillPercent: number,
  remaining?: number
): BoardFillIndicator | null {
  if (fillPercent >= 100 || remaining === 0) return "sold_out";
  if (fillPercent >= 85) return "nearly_full";
  if (fillPercent >= 50) return "popular";
  return null;
}

export function boardFillIndicatorLabel(indicator: BoardFillIndicator): string {
  return INDICATOR_LABELS[indicator];
}

export function formatSquaresFilled(filled: number, total = 100): string {
  return `${filled.toLocaleString()} / ${total.toLocaleString()} Squares Filled`;
}

export function resolveFilledCount(
  fillPercent: number,
  totalSpots = 100,
  remainingSpots?: number
): number {
  if (remainingSpots != null && totalSpots > 0) {
    return Math.max(0, totalSpots - remainingSpots);
  }
  return Math.round((fillPercent / 100) * totalSpots);
}
