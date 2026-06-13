import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { getPlayerDashboard } from "@/lib/database/services/playerDashboard";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { recordDailyLogin } from "@/lib/platform/ecosystem/progression";
import { getInventorySummary } from "@/lib/platform/ecosystem/inventory";
import { listActivePromotions } from "@/lib/platform/ecosystem/promotions";
import { listRewardsCatalog } from "@/lib/platform/ecosystem/rewards";
import { getTierVisual, computeTierLevel, computeXpToNextTier } from "@/lib/platform/ecosystem/tierVisuals";
import { listRecentCreditActivity } from "@/lib/platform/ecosystem/credits";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";

export async function getRewardsCenterData(email: string) {
  const normalized = normalizeEmail(email);
  await recordDailyLogin(normalized).catch(() => null);

  const [dashboard, inventory, promotions, catalog, legacy, playerDash] = await Promise.all([
    getEcosystemDashboard(normalized),
    getInventorySummary(normalized),
    listActivePromotions(normalized),
    listRewardsCatalog(),
    getPlayerLegacy(normalized),
    getPlayerDashboard(normalized).catch(() => null),
  ]);

  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("player_profiles")
    .select("avatar_emoji, tier_xp, pending_rewards_count, lifetime_gameplay_cents, lifetime_purchases_cents, lifetime_rewards_earned, login_streak_days")
    .eq("email", normalized)
    .maybeSingle();

  const { data: pending } = await supabase
    .from("player_pending_rewards")
    .select("*")
    .eq("email", normalized)
    .is("claimed_at", null)
    .order("created_at", { ascending: false });

  const { data: redemptions } = await supabase
    .from("ecosystem_reward_redemptions")
    .select("id, credits_spent, status, created_at, catalog_item_id")
    .eq("email", normalized)
    .order("created_at", { ascending: false })
    .limit(30);

  const visual = getTierVisual(dashboard.tier.slug);
  const tierLevel = computeTierLevel(dashboard.account.lifetimeTierCredits, dashboard.tier.minLifetimeCredits);
  const xpToNext = computeXpToNextTier(dashboard.creditsToNextTier);

  const history = await listRecentCreditActivity(normalized, 40);

  const pendingPayout = (playerDash?.recentWins ?? [])
    .filter((w) => w.payoutStatus === "pending")
    .reduce((sum, w) => sum + w.amount, 0);

  return {
    dashboard,
    loginStreak: Number(profile?.login_streak_days ?? 0),
    wallet: {
      cashBalanceCents: Math.round((playerDash?.stats.totalWinnings ?? 0) * 100),
      pendingPayoutCents: Math.round(pendingPayout * 100),
      squareCreditsCents: dashboard.account.squareCreditsCents,
      pickemCreditsCents: dashboard.account.pickemCreditsCents,
      tierCredits: dashboard.account.availableTierCredits,
      weeklyTierCredits: dashboard.account.weeklyTierCredits,
      lifetimeTierCredits: dashboard.account.lifetimeTierCredits,
      mysteryBoxesAvailable: dashboard.unopenedMysteryBox ? 1 : 0,
      referralEarningsCents: dashboard.referral.referralEarningsCents,
      pendingRewards: (pending ?? []).length,
    },
    tierCard: {
      displayName: dashboard.account.username ?? dashboard.account.displayName,
      playerId: dashboard.account.playerId,
      tierName: dashboard.tier.displayName,
      tierSlug: dashboard.tier.slug,
      tierLevel,
      tierProgressPct: dashboard.tierProgressPct,
      tierCredits: dashboard.account.availableTierCredits,
      xpToNext,
      nextTierName: dashboard.nextTier?.displayName ?? null,
      visual,
      avatar: (profile?.avatar_emoji as string) ?? DEFAULT_AVATAR,
      frameId: dashboard.account.profileFrameId,
      benefits: dashboard.tier.benefits,
    },
    inventory,
    promotions,
    catalog,
    referral: dashboard.referral,
    pendingRewards: pending ?? [],
    redemptionHistory: redemptions ?? [],
    creditHistory: history,
    legacy: legacy
      ? {
          lifetimeWinnings: legacy.stats.lifetimeWinnings,
          lifetimeWins: legacy.stats.lifetimeWins,
          currentStreak: legacy.stats.currentWinStreak,
          longestStreak: legacy.stats.longestWinStreak,
          boardsPlayed: legacy.stats.boardsPlayed,
          totalSquares: legacy.stats.totalSquaresPurchased,
          seasonsPlayed: legacy.stats.seasonsPlayed,
          achievements: legacy.achievements.filter((a) => a.unlocked),
          memberSince: legacy.memberSince,
          lifetimeGameplayCents: Number(profile?.lifetime_gameplay_cents ?? 0),
          lifetimePurchasesCents: Number(profile?.lifetime_purchases_cents ?? 0),
          lifetimeRewardsEarned: Number(profile?.lifetime_rewards_earned ?? 0),
          mysteryBoxesOpened: dashboard.account.mysteryBoxesOpened,
          rewardsRedeemed: dashboard.account.rewardsRedeemed,
          loginStreakDays: Number(profile?.login_streak_days ?? 0),
        }
      : null,
    unopenedMysteryBox: dashboard.unopenedMysteryBox,
  };
}

export async function getBonusWallet(email: string) {
  const data = await getRewardsCenterData(email);
  return {
    wallet: data.wallet,
    inventory: data.inventory,
    tierCredits: data.dashboard.account.availableTierCredits,
    referral: {
      earningsCents: data.referral.referralEarningsCents,
      qualified: data.referral.qualifiedReferrals,
    },
  };
}
