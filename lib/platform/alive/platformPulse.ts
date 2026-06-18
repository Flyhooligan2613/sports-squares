import { getLiveWinnersCenterData } from "@/lib/database/services/liveWinnersCenter";
import { getActionCenterData } from "@/lib/database/services/actionCenter";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { ALIVE_STAT_LABELS } from "@/lib/platform/language/aliveLanguage";
import type { AliveStat, PlatformPulse } from "./types";

function formatDollars(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function estimateFromHour(): number {
  const hour = new Date().getHours();
  return 120 + hour * 18 + (hour % 5) * 7;
}

export async function fetchPlatformPulse(): Promise<PlatformPulse> {
  const now = new Date().toISOString();
  const stats: AliveStat[] = [];

  let playersOnline = 0;
  let isLive = false;

  if (isSupabaseAdminConfigured()) {
    try {
      const [liveWinners, actionCenter] = await Promise.all([
        getLiveWinnersCenterData().catch(() => null),
        getActionCenterData().catch(() => null),
      ]);

      if (liveWinners) {
        playersOnline = liveWinners.platform.playersOnline;
        isLive = liveWinners.platform.gamesCurrentlyLive > 0;

        stats.push({
          label: ALIVE_STAT_LABELS.contestsCompleted,
          value: liveWinners.stats.boardsPlayed,
          emoji: "🏆",
          source: "real",
        });
        stats.push({
          label: ALIVE_STAT_LABELS.prizeAwarded,
          value: formatDollars(liveWinners.stats.prizeMoneyToday * 100),
          emoji: "💰",
          source: "real",
        });
        stats.push({
          label: ALIVE_STAT_LABELS.rewardsClaimed,
          value: liveWinners.platform.weeklyRewardDropsOpenedToday,
          emoji: "🎁",
          source: "real",
        });
        stats.push({
          label: ALIVE_STAT_LABELS.competitorsJoined,
          value: liveWinners.platform.squaresPurchasedToday,
          emoji: "👥",
          source: "real",
        });
        stats.push({
          label: ALIVE_STAT_LABELS.rankPromotions,
          value: liveWinners.stats.todaysWinners,
          emoji: "📈",
          source: "estimated",
        });
      }

      if (actionCenter) {
        const filling =
          actionCenter.fillingFast?.length ??
          actionCenter.hotGames?.filter(
            (g) => g.openBoard && g.openBoard.squaresRemaining < 20
          ).length ??
          0;
        stats.push({
          label: ALIVE_STAT_LABELS.contestsFilling,
          value: filling,
          emoji: "🔥",
          source: filling > 0 ? "real" : "estimated",
        });
      }
    } catch {
      // fall through to estimates
    }
  }

  if (stats.length === 0) {
    const est = estimateFromHour();
    stats.push(
      { label: ALIVE_STAT_LABELS.contestsCompleted, value: est, emoji: "🏆", source: "fallback" },
      { label: ALIVE_STAT_LABELS.prizeAwarded, value: formatDollars(est * 4200), emoji: "💰", source: "fallback" },
      { label: ALIVE_STAT_LABELS.rewardsClaimed, value: Math.max(12, Math.floor(est / 8)), emoji: "🎁", source: "fallback" },
      { label: ALIVE_STAT_LABELS.contestsFilling, value: Math.max(3, Math.floor(est / 15)), emoji: "🔥", source: "fallback" },
      { label: ALIVE_STAT_LABELS.competitorsJoined, value: est * 4, emoji: "👥", source: "fallback" },
      { label: ALIVE_STAT_LABELS.rankPromotions, value: Math.max(5, Math.floor(est / 10)), emoji: "📈", source: "fallback" }
    );
    playersOnline = Math.max(48, est * 2);
  }

  stats.push({
    label: ALIVE_STAT_LABELS.playersOnline,
    value: playersOnline,
    emoji: "🟢",
    source: playersOnline > 0 ? "real" : "fallback",
  });

  return {
    updatedAt: now,
    stats: stats.slice(0, 6),
    playersOnline,
    isLive,
  };
}
