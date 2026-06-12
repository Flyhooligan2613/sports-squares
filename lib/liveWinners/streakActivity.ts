import type { WinnerRow } from "@/lib/database/types";
import {
  WIN_STREAK_WINDOW_DAYS,
  maskPlayerLabel,
} from "@/lib/player/statsCore";
import type { LiveActivityItem } from "@/lib/liveWinners/types";

const STREAK_THRESHOLDS = [3, 5, 10] as const;

function streakTitle(streak: number): string {
  if (streak >= 10) return "10-Win Streak Legend!";
  if (streak >= 5) return "5-Win Streak!";
  return "3-Win Hot Streak!";
}

function streakDetail(name: string, streak: number): string {
  const masked = maskPlayerLabel(name);
  if (streak >= 10) return `${masked} is unstoppable — ${streak} wins in a row`;
  if (streak >= 5) return `${masked} is on a roll — ${streak} consecutive wins`;
  return `${masked} hit a ${streak}-win streak`;
}

export function buildStreakMilestoneActivity(
  winners: WinnerRow[],
  activitySinceIso: string
): LiveActivityItem[] {
  const activitySince = new Date(activitySinceIso);
  const windowMs = WIN_STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const byPlayer = new Map<string, { dates: Date[]; name: string }>();

  for (const winner of winners) {
    const key = winner.winning_player.trim().toLowerCase();
    if (!key) continue;

    let entry = byPlayer.get(key);
    if (!entry) {
      entry = { dates: [], name: winner.winning_player };
      byPlayer.set(key, entry);
    }
    entry.dates.push(new Date(winner.created_at));
  }

  const items: LiveActivityItem[] = [];

  for (const [key, { dates, name }] of Array.from(byPlayer.entries())) {
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    let run = 1;

    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].getTime() - sorted[i - 1].getTime() <= windowMs) {
        run += 1;
        if (
          STREAK_THRESHOLDS.includes(run as (typeof STREAK_THRESHOLDS)[number]) &&
          sorted[i] >= activitySince
        ) {
          items.push({
            id: `streak-${key}-${run}-${sorted[i].getTime()}`,
            type: "streak_milestone",
            title: streakTitle(run),
            detail: streakDetail(name, run),
            at: sorted[i].toISOString(),
            accent: run >= 5 ? "gold" : "yellow",
          });
        }
      } else {
        run = 1;
      }
    }
  }

  return items;
}
