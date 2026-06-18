import { getLiveWinnersCenterData } from "@/lib/database/services/liveWinnersCenter";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { fetchPlatformPulse } from "./platformPulse";
import { fetchPersonalPulse } from "./personalPulse";
import { fetchLiveActivityFeed } from "./liveActivityFeed";
import { fetchSmartWalletInsights } from "./smartWalletInsights";
import { fetchAliveRecommendations } from "./recommendations";
import type { AliveDashboardPayload, CommunityPresenceData } from "./types";

async function fetchCommunityPresence(): Promise<CommunityPresenceData> {
  const fallback: CommunityPresenceData = {
    trendingCompetitors: [
      { id: "t1", label: "M. J.", detail: "3-win streak · NFL Squares™", score: 4820 },
      { id: "t2", label: "K. R.", detail: "Pick'em Royale™ climb", score: 4510 },
      { id: "t3", label: "A. S.", detail: "Weekly drop hunter", score: 4290 },
    ],
    topWinnersToday: [
      { id: "w1", label: "J. T.", amount: "$420", sport: "NFL" },
      { id: "w2", label: "S. M.", amount: "$275", sport: "MLB" },
      { id: "w3", label: "D. L.", amount: "$180", sport: "Pick'em" },
    ],
    recentlyJoined: [
      { id: "j1", label: "New competitor joined", at: new Date(Date.now() - 8 * 60_000).toISOString() },
      { id: "j2", label: "Board entry confirmed", at: new Date(Date.now() - 15 * 60_000).toISOString() },
    ],
  };

  if (!isSupabaseAdminConfigured()) return fallback;

  try {
    const data = await getLiveWinnersCenterData();
    return {
      trendingCompetitors: data.champions.week.slice(0, 5).map((c, i) => ({
        id: `week-${i}`,
        label: c.maskedName,
        detail: "Top performer this week",
        score: c.totalWon,
      })),
      topWinnersToday: data.champions.today.slice(0, 5).map((c, i) => ({
        id: `today-${i}`,
        label: c.maskedName,
        amount: `$${c.totalWon.toLocaleString()}`,
        sport: "Sports",
      })),
      recentlyJoined: data.activity
        .filter((a) => a.type === "game_opened" || a.type === "board_filled")
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          label: a.title,
          at: a.at,
        })),
    };
  } catch {
    return fallback;
  }
}

/** AliveEngine™ orchestrator — composes pulse, feed, insights, and recommendations. */
export const AliveEngine = {
  async getPlatformPulse() {
    return fetchPlatformPulse();
  },

  async getPersonalPulse(email: string) {
    return fetchPersonalPulse(email);
  },

  async getActivityFeed(limit = 20) {
    return fetchLiveActivityFeed(limit);
  },

  async getWalletInsights(email: string) {
    return fetchSmartWalletInsights(email);
  },

  async getRecommendations(email: string) {
    const personal = await fetchPersonalPulse(email).catch(() => null);
    return fetchAliveRecommendations(email, personal);
  },

  async getCommunityPresence() {
    return fetchCommunityPresence();
  },

  async getDashboard(email: string): Promise<AliveDashboardPayload> {
    const [platformPulse, personalPulse, activityFeed, walletInsights, recommendations, communityPresence] =
      await Promise.all([
        fetchPlatformPulse(),
        fetchPersonalPulse(email).catch(() => null),
        fetchLiveActivityFeed(15),
        fetchSmartWalletInsights(email).catch(() => []),
        fetchAliveRecommendations(email).catch(() => []),
        fetchCommunityPresence(),
      ]);

    if (personalPulse) {
      const enrichedRecs = await fetchAliveRecommendations(email, personalPulse);
      return {
        platformPulse,
        personalPulse,
        activityFeed,
        walletInsights,
        recommendations: enrichedRecs,
        communityPresence,
      };
    }

    return {
      platformPulse,
      personalPulse,
      activityFeed,
      walletInsights,
      recommendations,
      communityPresence,
    };
  },
};

export type { AliveDashboardPayload };
