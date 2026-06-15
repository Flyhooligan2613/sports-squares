import { HIGHLIGHT_REWARD_CREDITS, HIGHLIGHT_SQUARE_COUNT } from "@/lib/highlight/config";

export const HIGHLIGHT_INTRO_STORAGE_KEY = "sb-highlight-squares-intro-v1";

export const HIGHLIGHT_POPUP_HEADLINE = "Highlight Mystery Box";

export const HIGHLIGHT_POPUP_TAGLINE =
  "Six mystery ⭐ squares hide on every board — win a checkpoint on one for bonus tier credits.";

export function highlightSquareCountLabel(count = HIGHLIGHT_SQUARE_COUNT): string {
  return `${count} random occupied square${count === 1 ? "" : "s"}`;
}

export function highlightRewardLabel(credits = HIGHLIGHT_REWARD_CREDITS): string {
  return `+${credits} tier credits`;
}

/** Shared explainer for how Highlight Squares™ are placed. */
export const HIGHLIGHT_PLACEMENT_EXPLAINER = [
  `When the board fills and numbers are drawn, ${highlightSquareCountLabel()} are secretly chosen from squares that players already own.`,
  "Selection is completely random — you cannot buy a Highlight Square and every player has equal odds.",
  "After numbers lock, look for the gold ⭐ on the grid. Those are your mystery Highlight Squares™.",
  `Win a checkpoint (quarter, inning, or final) on a Highlight Square and the star activates — you earn ${highlightRewardLabel()} on top of your normal payout.`,
] as const;

export const HIGHLIGHT_SHORT_TOOLTIP =
  "Mystery bonus squares — win a checkpoint on ⭐ for extra tier credits.";
