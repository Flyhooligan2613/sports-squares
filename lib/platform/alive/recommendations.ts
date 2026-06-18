import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { getWeeklyDropStatus } from "@/lib/platform/ecosystem/weeklyRewardDrop";
import { normalizeEmail } from "@/lib/player/statsCore";
import { CONTEST_CTAS } from "@/lib/platform/language/contestLanguage";
import { ALIVE_BRAND } from "@/lib/platform/language/aliveLanguage";
import type { AliveRecommendation } from "./types";
import type { PersonalPulse } from "./types";

export async function fetchAliveRecommendations(
  email: string,
  personal?: PersonalPulse | null
): Promise<AliveRecommendation[]> {
  const normalized = normalizeEmail(email);
  const [legacy, weeklyDrop] = await Promise.all([
    getPlayerLegacy(normalized),
    getWeeklyDropStatus(normalized).catch(() => null),
  ]);

  const recs: AliveRecommendation[] = [];
  const pulse = personal ?? null;

  if (!legacy || legacy.stats.boardsPlayed === 0) {
    recs.push({
      id: "first_contest",
      title: "Join your first contest",
      body: "Every competition builds your Legacy™ and Competitor Score™.",
      ctaLabel: CONTEST_CTAS.joinTheContest,
      ctaHref: "/contest-center",
      emoji: "🏈",
      priority: 100,
      context: "rookie",
    });
  }

  if (weeklyDrop?.dropReady) {
    recs.push({
      id: "weekly_drop",
      title: "Weekly Reward Drop ready",
      body: "Open your drop before the window closes — badges and credits inside.",
      ctaLabel: "Open Drop",
      ctaHref: "/my-games/rewards",
      emoji: "🎁",
      priority: 95,
      context: "rewards",
    });
  }

  if (pulse && pulse.dailyMissionsComplete < pulse.dailyMissionsTotal) {
    recs.push({
      id: "daily_missions",
      title: "Complete daily missions",
      body: `${pulse.dailyMissionsTotal - pulse.dailyMissionsComplete} missions left for bonus XP today.`,
      ctaLabel: "View Missions",
      ctaHref: "/game-day#missions",
      emoji: "🎯",
      priority: 90,
      context: "progression",
    });
  }

  if (pulse && pulse.walletBalanceCents < 2500) {
    recs.push({
      id: "fund_wallet",
      title: `Fund ${ALIVE_BRAND.squareWallet}`,
      body: "One deposit unlocks every contest on the platform.",
      ctaLabel: "Add Funds",
      ctaHref: "/my-games/wallet?tab=deposit",
      emoji: "💳",
      priority: 85,
      context: "wallet",
    });
  }

  if (pulse && !pulse.squarePassActive) {
    recs.push({
      id: "square_pass",
      title: `Activate ${ALIVE_BRAND.squarePass}`,
      body: "Daily bonuses, mystery rewards, and exclusive drops.",
      ctaLabel: "Open SquarePass",
      ctaHref: "/my-games/square-pass",
      emoji: "✨",
      priority: 70,
      context: "square_pass",
    });
  }

  if (pulse && pulse.tierProgressPct >= 80 && pulse.xpToNext > 0) {
    recs.push({
      id: "tier_push",
      title: "Tier promotion within reach",
      body: `${pulse.xpToNext} XP to level up — one more contest could do it.`,
      ctaLabel: CONTEST_CTAS.browseContests,
      ctaHref: "/contest-center",
      emoji: "📈",
      priority: 80,
      context: "progression",
    });
  }

  recs.push({
    id: "contest_center",
    title: "Explore Contest Center",
    body: "See every live board, pool, and bracket filling right now.",
    ctaLabel: "Contest Center",
    ctaHref: "/contest-center",
    emoji: "📋",
    priority: 50,
    context: "discovery",
  });

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 6);
}
