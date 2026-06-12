import type { WinnerRow } from "@/lib/database/types";

export const WIN_STREAK_WINDOW_DAYS = 21;
export const LEADERBOARD_LIMIT = 25;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Player";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function playerOwnsWin(
  winner: WinnerRow,
  playerNames: Set<string>,
  ownedSquares: Set<number>
): boolean {
  if (ownedSquares.has(winner.winning_square)) return true;
  return playerNames.has(winner.winning_player.trim().toLowerCase());
}

export function calcWinStreaks(winDates: Date[]): {
  current: number;
  longest: number;
} {
  if (!winDates.length) return { current: 0, longest: 0 };

  const sorted = [...winDates].sort((a, b) => a.getTime() - b.getTime());
  const windowMs = WIN_STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].getTime() - sorted[i - 1].getTime() <= windowMs) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  let current = 1;
  for (let i = sorted.length - 1; i > 0; i -= 1) {
    if (sorted[i].getTime() - sorted[i - 1].getTime() <= windowMs) {
      current += 1;
    } else {
      break;
    }
  }

  const daysSinceLast =
    (Date.now() - sorted[sorted.length - 1].getTime()) / (24 * 60 * 60 * 1000);
  if (daysSinceLast > WIN_STREAK_WINDOW_DAYS) current = 0;

  return { current, longest };
}

export function maskPlayerLabel(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return "Player";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]!} ${parts[1]!.charAt(0).toUpperCase()}.`;
}
