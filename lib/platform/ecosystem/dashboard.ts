import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { listRecentCreditActivity } from "@/lib/platform/ecosystem/credits";
import { getReferralSummary } from "@/lib/platform/ecosystem/referrals";
import { listTierDefinitions, resolveTierForCredits } from "@/lib/platform/ecosystem/tiers";
import { ensureWeeklyRewardDrop } from "@/lib/platform/ecosystem/weeklyRewardDrop";
import { getTierVisual, computeTierLevel, computeXpToNextTier } from "@/lib/platform/ecosystem/tierVisuals";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import type { EcosystemDashboard } from "@/lib/platform/ecosystem/types";

export async function getEcosystemDashboard(email: string): Promise<EcosystemDashboard> {
  const account = await ensureEcosystemAccount(email);
  const tiers = await listTierDefinitions();
  const tierState = resolveTierForCredits(tiers, account.lifetimeTierCredits);
  const referral = await getReferralSummary(email);
  const recentCreditActivity = await listRecentCreditActivity(email);

  await ensureWeeklyRewardDrop(email);
  const supabase = getSupabaseAdmin();
  const { data: box } = await supabase
    .from("player_mystery_boxes")
    .select("opened_at")
    .eq("email", normalizeEmail(email))
    .is("opened_at", null)
    .limit(1)
    .maybeSingle();

  return {
    account,
    tier: tierState.current,
    nextTier: tierState.next,
    creditsToNextTier: tierState.creditsToNext,
    tierProgressPct: tierState.progressPct,
    referral,
    unopenedMysteryBox: Boolean(box),
    recentCreditActivity,
  };
}

export async function buildPlayerCard(email: string) {
  const dashboard = await getEcosystemDashboard(email);
  const [legacy, identity] = await Promise.all([
    getPlayerLegacy(email),
    getPlayerPublicIdentity(email),
  ]);
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("player_profiles")
    .select("avatar_emoji, login_streak_days, lifetime_gameplay_cents, lifetime_purchases_cents, lifetime_rewards_earned")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  const visual = getTierVisual(dashboard.tier.slug);
  const tierLevel = computeTierLevel(
    dashboard.account.lifetimeTierCredits,
    dashboard.tier.minLifetimeCredits
  );

  return {
    ...dashboard,
    publicLabel: identity.publicLabel,
    profileBio: identity.profileBio,
    avatar: identity.avatarEmoji ?? DEFAULT_AVATAR,
    tierVisual: visual,
    computedTierLevel: tierLevel,
    xpToNext: computeXpToNextTier(dashboard.creditsToNextTier),
    ranks: {
      referral: dashboard.referral.qualifiedReferrals > 0 ? dashboard.referral.qualifiedReferrals : null,
      global: null,
      state: null,
    },
    legacy: legacy
      ? {
          lifetimeWinnings: legacy.stats.lifetimeWinnings,
          lifetimeWins: legacy.stats.lifetimeWins,
          currentStreak: legacy.stats.currentWinStreak,
          longestStreak: legacy.stats.longestWinStreak,
          achievements: legacy.achievements.filter((a) => a.unlocked),
          headline: legacy.headline,
          memberSince: legacy.memberSince,
          boardsPlayed: legacy.stats.boardsPlayed,
          seasonsPlayed: legacy.stats.seasonsPlayed,
          lifetimeGameplayCents: Number(profile?.lifetime_gameplay_cents ?? 0),
          lifetimePurchasesCents: Number(profile?.lifetime_purchases_cents ?? 0),
          lifetimeRewardsEarned: Number(profile?.lifetime_rewards_earned ?? 0),
          mysteryBoxesOpened: dashboard.account.mysteryBoxesOpened,
          loginStreakDays: Number(profile?.login_streak_days ?? 0),
        }
      : null,
    sharePath: `/player/${dashboard.account.slug}`,
  };
}
