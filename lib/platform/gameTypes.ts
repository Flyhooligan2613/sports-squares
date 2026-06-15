/**
 * Platform game registry — single source of truth for multi-game expansion.
 * Future games plug into shared player account, wallet, notifications,
 * leaderboards, achievements, and payout systems via `PlatformGameId`.
 */

export type PlatformGameId =
  | "squareboards"
  | "nba-squares"
  | "mlb-squares"
  | "pickem"
  | "survivor"
  | "brackets"
  | "baseball-pickem"
  | "soccer-predictor";

export type PlatformGameStatus = "available" | "coming_soon";

export type PlatformNavBadge = "new" | "coming_soon";

export interface PlatformGameDefinition {
  id: PlatformGameId;
  name: string;
  description: string;
  icon: string;
  status: PlatformGameStatus;
  /** Playable route — null when coming soon */
  href: string | null;
  /** Optional how-to-play guide */
  learnHref?: string | null;
  /** Accent for card gradients (CSS color) */
  accent: string;
  /** Stat keys this game contributes to on player profiles */
  statKeys: string[];
  /** Optional nav badge override */
  navBadge?: PlatformNavBadge;
}

export const PLATFORM_GAMES: PlatformGameDefinition[] = [
  {
    id: "squareboards",
    name: "SquareBoards",
    description:
      "Classic 10×10 sports squares with live scores, Highlight Squares™, automatic winners, and instant payouts.",
    icon: "🎲",
    status: "available",
    href: "/games/nfl",
    accent: "#7b61ff",
    statKeys: ["squaresWon", "lifetimeWins", "lifetimeWinnings"],
  },
  {
    id: "nba-squares",
    name: "NBA Squares",
    description:
      "Basketball squares with quarter winners, Highlight Squares™, live ESPN scoring, and automatic payouts.",
    icon: "🏀",
    status: "available",
    href: "/games/nba",
    accent: "#f97316",
    navBadge: "new",
    statKeys: ["squaresWon", "lifetimeWins", "lifetimeWinnings"],
  },
  {
    id: "mlb-squares",
    name: "MLB Squares",
    description:
      "Baseball squares with inning checkpoints at the 3rd, 5th, 7th, and final — plus Highlight Squares™ bonus rewards.",
    icon: "⚾",
    status: "available",
    href: "/games/mlb",
    learnHref: "/learn/mlb-squares",
    accent: "#dc2626",
    navBadge: "new",
    statKeys: ["squaresWon", "lifetimeWins", "lifetimeWinnings"],
  },
  {
    id: "pickem",
    name: "Pick'em",
    description:
      "Predict every NFL winner each week. Build streaks, climb leaderboards, and compete worldwide — no spreads, no odds, just winners.",
    icon: "🏈",
    status: "available",
    href: "/pickem",
    accent: "#22c55e",
    navBadge: "new",
    statKeys: ["pickemWins", "pickAccuracyPct", "currentStreak", "longestStreak"],
  },
  {
    id: "survivor",
    name: "Survivor X™",
    description:
      "Survive the entire NFL season — one pick per week, never the same team twice. Legacy, live eliminations, and Hall of Fame glory.",
    icon: "🏆",
    status: "available",
    href: "/survivor",
    accent: "#f59e0b",
    navBadge: "new",
    statKeys: ["survivorWeeksSurvived", "survivorChampionships", "longestSurvivalStreak"],
  },
  {
    id: "brackets",
    name: "Brackets",
    description:
      "March Madness and tournament brackets with live scoring and big prizes.",
    icon: "🏀",
    status: "coming_soon",
    href: null,
    accent: "#3b82f6",
    statKeys: ["bracketPoints"],
  },
  {
    id: "baseball-pickem",
    name: "MLB Pick'em",
    description:
      "Predict every MLB winner each week. Build streaks, climb leaderboards, and compete all season — no spreads, no odds, just winners.",
    icon: "⚾",
    status: "available",
    href: "/baseball-pickem",
    accent: "#ef4444",
    navBadge: "new",
    statKeys: ["baseballPickemWins"],
  },
  {
    id: "soccer-predictor",
    name: "Soccer Predictor",
    description:
      "Predict match outcomes across leagues worldwide. Global leaderboards.",
    icon: "⚽",
    status: "coming_soon",
    href: null,
    accent: "#06b6d4",
    statKeys: ["soccerPredictionPoints"],
  },
];

export function getPlatformGame(id: PlatformGameId): PlatformGameDefinition {
  const game = PLATFORM_GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unknown platform game: ${id}`);
  return game;
}

export function isPlatformGameAvailable(id: PlatformGameId): boolean {
  return getPlatformGame(id).status === "available";
}

export function isBaseballPickemRoute(pathname: string): boolean {
  return pathname === "/baseball-pickem" || pathname.startsWith("/baseball-pickem/");
}

export function isPickemRoute(pathname: string): boolean {
  return (
    pathname === "/pickem" ||
    pathname.startsWith("/pickem/") ||
    isBaseballPickemRoute(pathname)
  );
}

export function isSquareBoardsRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/games/") ||
    pathname.startsWith("/pool/") ||
    pathname.startsWith("/live-tv") ||
    pathname.startsWith("/live-winners") ||
    pathname.startsWith("/action-center")
  );
}

export function isSurvivorRoute(pathname: string): boolean {
  return pathname === "/survivor" || pathname.startsWith("/survivor/");
}

export function isPlatformGameNavActive(
  game: PlatformGameDefinition,
  pathname: string
): boolean {
  if (game.status !== "available" || !game.href) return false;
  if (game.id === "squareboards") return isSquareBoardsRoute(pathname);
  if (game.id === "nba-squares") {
    return pathname.startsWith("/games/nba");
  }
  if (game.id === "mlb-squares") {
    return pathname.startsWith("/games/mlb") || pathname.startsWith("/learn/mlb-squares");
  }
  if (game.id === "pickem") return isPickemRoute(pathname) && !isBaseballPickemRoute(pathname);
  if (game.id === "survivor") return isSurvivorRoute(pathname);
  if (game.id === "baseball-pickem") return isBaseballPickemRoute(pathname);
  return pathname === game.href || pathname.startsWith(`${game.href}/`);
}
