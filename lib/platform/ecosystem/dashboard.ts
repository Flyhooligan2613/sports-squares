import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { listRecentCreditActivity } from "@/lib/platform/ecosystem/credits";
import { getReferralSummary } from "@/lib/platform/ecosystem/referrals";
import { listTierDefinitions, resolveTierForCredits } from "@/lib/platform/ecosystem/tiers";
import { ensureWeeklyMysteryBox } from "@/lib/platform/ecosystem/mysteryBox";
import type { EcosystemDashboard } from "@/lib/platform/ecosystem/types";

export async function getEcosystemDashboard(email: string): Promise<EcosystemDashboard> {
  const account = await ensureEcosystemAccount(email);
  const tiers = await listTierDefinitions();
  const tierState = resolveTierForCredits(tiers, account.lifetimeTierCredits);
  const referral = await getReferralSummary(email);
  const recentCreditActivity = await listRecentCreditActivity(email);

  const hasBox = await ensureWeeklyMysteryBox(email);
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
    unopenedMysteryBox: Boolean(hasBox && box),
    recentCreditActivity,
  };
}

export async function buildPlayerCard(email: string) {
  const dashboard = await getEcosystemDashboard(email);
  const legacy = await getPlayerLegacy(email);

  return {
    ...dashboard,
    legacy: legacy
      ? {
          lifetimeWinnings: legacy.stats.lifetimeWinnings,
          lifetimeWins: legacy.stats.lifetimeWins,
          currentStreak: legacy.stats.currentWinStreak,
          longestStreak: legacy.stats.longestWinStreak,
          achievements: legacy.achievements.filter((a) => a.unlocked),
          headline: legacy.headline,
        }
      : null,
    sharePath: `/player/${dashboard.account.slug}`,
  };
}
