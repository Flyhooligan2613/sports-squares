import { getLiveWinnersCenterData } from "@/lib/database/services/liveWinnersCenter";
import { maskWinnerName } from "@/lib/database/services/liveWinnersCenter";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { AliveActivityItem, AliveActivityKind } from "./types";

function mapActivityType(type: string): AliveActivityKind {
  if (type === "board_filled") return "board_filled";
  if (type === "game_opened" || type === "board_created") return "contest_opened";
  if (type.includes("winner") || type === "payout_sent") return "winner_announced";
  if (type === "kickoff" || type === "game_starting") return "contest_starting";
  return "community_join";
}

const SEED_ACTIVITY: AliveActivityItem[] = [
  {
    id: "seed-1",
    kind: "board_filled",
    title: "Board filled",
    detail: "NFL Squares™ board locked — numbers drawing soon",
    at: new Date(Date.now() - 4 * 60_000).toISOString(),
    accent: "green",
  },
  {
    id: "seed-2",
    kind: "winner_announced",
    title: "Winner announced",
    detail: "Quarter winner paid via SquareBank™",
    at: new Date(Date.now() - 12 * 60_000).toISOString(),
    accent: "gold",
  },
  {
    id: "seed-3",
    kind: "contest_starting",
    title: "Contest starting soon",
    detail: "Pick'em Royale™ pool opens in under an hour",
    at: new Date(Date.now() - 22 * 60_000).toISOString(),
    accent: "purple",
  },
  {
    id: "seed-4",
    kind: "reward_claimed",
    title: "Reward claimed",
    detail: "Weekly Reward Drop opened — new badge unlocked",
    at: new Date(Date.now() - 35 * 60_000).toISOString(),
    accent: "blue",
  },
];

export async function fetchLiveActivityFeed(limit = 20): Promise<AliveActivityItem[]> {
  if (!isSupabaseAdminConfigured()) {
    return SEED_ACTIVITY.slice(0, limit);
  }

  try {
    const data = await getLiveWinnersCenterData();
    const items: AliveActivityItem[] = [];

    for (const item of data.activity.slice(0, limit)) {
      const kind = mapActivityType(item.type);
      let detail = item.detail;
      if (kind === "winner_announced") {
        detail = detail.replace(/→\s*[^·]+/g, (m) => {
          const name = m.replace("→ ", "").trim();
          return `→ ${maskWinnerName(name)}`;
        });
      }

      items.push({
        id: item.id,
        kind,
        title: item.title,
        detail,
        at: item.at,
        accent:
          item.accent === "green"
            ? "green"
            : item.accent === "yellow"
              ? "gold"
              : item.accent === "purple"
                ? "purple"
                : "blue",
      });
    }

    data.champions.today.slice(0, 3).forEach((champ, i) => {
      items.push({
        id: `champ-today-${i}`,
        kind: "winner_announced",
        title: "Top winner today",
        detail: `${champ.maskedName} · $${champ.totalWon.toLocaleString()} won`,
        at: data.updatedAt,
        accent: "gold",
      });
    });

    if (items.length === 0) return SEED_ACTIVITY.slice(0, limit);
    return items
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, limit);
  } catch {
    return SEED_ACTIVITY.slice(0, limit);
  }
}
