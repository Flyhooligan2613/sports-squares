/**
 * Platform game registry — single source of truth for multi-game expansion.
 * Future games plug into shared player account, wallet, notifications,
 * leaderboards, achievements, and payout systems via `PlatformGameId`.
 */

import { PLATFORM_GAME_TAGLINES } from "@/lib/platform/gameTaglines";
import { TOURNAMENT_ROYALE_PUBLIC_NAME } from "@/lib/tournamentRoyale/config";
import { FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME } from "@/lib/soccerPickem/config";

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

export interface PlatformGameDefinition {
  id: PlatformGameId;
  name: string;
  /** Gameplay-ready card tagline (replaces "Available Now" / "NEW" badges). */
  tagline: string;
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
}

export const PLATFORM_GAMES: PlatformGameDefinition[] = [
  {
    id: "squareboards",
    name: "NFL Squares",
    tagline: PLATFORM_GAME_TAGLINES.squareboards,
    description:
      "10×10 football squares with live quarter scoring, Highlight Squares™, and instant payouts.",
    icon: "🏈",
    status: "available",
    href: "/games/nfl",
    accent: "#7b61ff",
    statKeys: ["squaresWon", "lifetimeWins", "lifetimeWinnings"],
  },
  {
    id: "nba-squares",
    name: "NBA Squares",
    tagline: PLATFORM_GAME_TAGLINES["nba-squares"],
    description:
      "Basketball squares with quarter winners, Highlight Squares™, live ESPN scoring, and automatic payouts.",
    icon: "🏀",
    status: "available",
    href: "/games/nba",
    accent: "#f97316",
    statKeys: ["squaresWon", "lifetimeWins", "lifetimeWinnings"],
  },
  {
    id: "mlb-squares",
    name: "MLB Squares",
    tagline: PLATFORM_GAME_TAGLINES["mlb-squares"],
    description:
      "Baseball squares with inning checkpoints at the 3rd, 5th, 7th, and final — plus Highlight Squares™ bonus rewards.",
    icon: "⚾",
    status: "available",
    href: "/games/mlb",
    learnHref: "/learn/mlb-squares",
    accent: "#dc2626",
    statKeys: ["squaresWon", "lifetimeWins", "lifetimeWinnings"],
  },
  {
    id: "pickem",
    name: "Pick'em",
    tagline: PLATFORM_GAME_TAGLINES.pickem,
    description:
      "Predict every NFL winner each week. Build streaks, climb leaderboards, and compete worldwide — no spreads, no odds, just winners.",
    icon: "🏈",
    status: "available",
    href: "/pickem",
    accent: "#22c55e",
    statKeys: ["pickemWins", "pickAccuracyPct", "currentStreak", "longestStreak"],
  },
  {
    id: "survivor",
    name: "Survivor X™",
    tagline: PLATFORM_GAME_TAGLINES.survivor,
    description:
      "Survive the entire NFL season — one pick per week, never the same team twice. Legacy, live eliminations, and Hall of Fame glory.",
    icon: "🏆",
    status: "available",
    href: "/survivor",
    accent: "#f59e0b",
    statKeys: ["survivorWeeksSurvived", "survivorChampionships", "longestSurvivalStreak"],
  },
  {
    id: "brackets",
    name: TOURNAMENT_ROYALE_PUBLIC_NAME,
    tagline: PLATFORM_GAME_TAGLINES.brackets,
    description:
      "Immersive tournament predictions — Cinderella Meter™, Bracket Combos™, live bracket, and legacy rewards.",
    icon: "🏀",
    status: "available",
    href: "/tournament-royale",
    accent: "#3b82f6",
    statKeys: ["bracketPoints"],
  },
  {
    id: "baseball-pickem",
    name: "MLB Pick'em",
    tagline: PLATFORM_GAME_TAGLINES["baseball-pickem"],
    description:
      "Predict every MLB winner each week. Build streaks, climb leaderboards, and compete all season — no spreads, no odds, just winners.",
    icon: "⚾",
    status: "available",
    href: "/baseball-pickem",
    accent: "#ef4444",
    statKeys: ["baseballPickemWins"],
  },
  {
    id: "soccer-predictor",
    name: FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME,
    tagline: PLATFORM_GAME_TAGLINES["soccer-predictor"],
    description:
      "Immersive football predictions — matchday picks, live tracking, legacy rewards, and global community.",
    icon: "⚽",
    status: "available",
    href: "/soccer-predictor",
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

export function isSoccerPredictorRoute(pathname: string): boolean {
  return pathname === "/soccer-predictor" || pathname.startsWith("/soccer-predictor/");
}

export function isPickemRoute(pathname: string): boolean {
  return (
    pathname === "/pickem" ||
    pathname.startsWith("/pickem/") ||
    isBaseballPickemRoute(pathname) ||
    isSoccerPredictorRoute(pathname)
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

export function isTournamentRoyaleRoute(pathname: string): boolean {
  return pathname === "/tournament-royale" || pathname.startsWith("/tournament-royale/");
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
  if (game.id === "pickem") return isPickemRoute(pathname) && !isBaseballPickemRoute(pathname) && !isSoccerPredictorRoute(pathname);
  if (game.id === "survivor") return isSurvivorRoute(pathname);
  if (game.id === "brackets") return isTournamentRoyaleRoute(pathname);
  if (game.id === "baseball-pickem") return isBaseballPickemRoute(pathname);
  if (game.id === "soccer-predictor") return isSoccerPredictorRoute(pathname);
  return pathname === game.href || pathname.startsWith(`${game.href}/`);
}
