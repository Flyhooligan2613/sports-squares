import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  countActiveCampaigns,
  countRedemptionsSince,
  countReferrals,
  fetchTopCodes,
  sumXpFromRedemptions,
} from "../repository";
import type { SquarePassAnalytics } from "../types";

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function fetchSquarePassAnalytics(): Promise<SquarePassAnalytics> {
  const dataGaps: string[] = [];

  if (!isSupabaseAdminConfigured()) {
    return {
      totalRedemptions: 0,
      redemptionsToday: 0,
      totalReferrals: 0,
      qualifiedReferrals: 0,
      referralConversionRate: 0,
      xpDistributed: 0,
      walletCreditsDistributedCents: 0,
      topCodes: [],
      activeCampaigns: 0,
      dataGaps: ["Supabase admin not configured."],
    };
  }

  try {
    const today = startOfTodayIso();
    const [referrals, redemptionsToday, topCodes, xp, activeCampaigns] = await Promise.all([
      countReferrals(),
      countRedemptionsSince(today),
      fetchTopCodes(8),
      sumXpFromRedemptions(),
      countActiveCampaigns(),
    ]);

    const { count: totalRedemptions } = await (async () => {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      return getSupabaseAdmin()
        .from("square_pass_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("blocked", false);
    })();

    const referralConversionRate =
      referrals.total > 0 ? Math.round((referrals.qualified / referrals.total) * 100) : 0;

    return {
      totalRedemptions: totalRedemptions ?? 0,
      redemptionsToday,
      totalReferrals: referrals.total,
      qualifiedReferrals: referrals.qualified,
      referralConversionRate,
      xpDistributed: xp,
      walletCreditsDistributedCents: 0,
      topCodes,
      activeCampaigns,
      dataGaps,
    };
  } catch {
    dataGaps.push("SquarePass tables unavailable — run migration 055.");
    return {
      totalRedemptions: 0,
      redemptionsToday: 0,
      totalReferrals: 0,
      qualifiedReferrals: 0,
      referralConversionRate: 0,
      xpDistributed: 0,
      walletCreditsDistributedCents: 0,
      topCodes: [],
      activeCampaigns: 0,
      dataGaps,
    };
  }
}
