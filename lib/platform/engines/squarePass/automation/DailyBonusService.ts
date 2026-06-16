import { distributeRewards } from "../RewardDistributionService";
import {
  fetchCampaignBySlug,
  incrementCampaignRedemptions,
  insertRedemption,
} from "../repository";
import { DAILY_CAMPAIGN_SLUG } from "./config";
import type { SquarePassAutomationState } from "./types";
import type { SquarePassGrantedReward } from "../types";

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function isDailyBonusAvailable(
  email: string,
  state: SquarePassAutomationState
): Promise<boolean> {
  if (!state.lastDailyBonusAt) return true;
  const last = new Date(state.lastDailyBonusAt);
  return last < startOfTodayUtc();
}

export async function grantDailyBonus(email: string): Promise<SquarePassGrantedReward[]> {
  const campaign = await fetchCampaignBySlug(DAILY_CAMPAIGN_SLUG);
  if (!campaign) {
    return distributeRewards(
      email,
      [
        { type: "xp", amount: 50, label: "50 Daily XP" },
        { type: "reward_drops", amount: 1, label: "Daily Reward Drop" },
      ],
      "square_pass_daily_fallback"
    );
  }

  const todayStart = startOfTodayUtc().toISOString();
  const supabase = await import("@/lib/supabase/admin").then((m) => m.getSupabaseAdmin());
  const { count } = await supabase
    .from("square_pass_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("email", email.toLowerCase())
    .eq("campaign_id", campaign.id)
    .gte("created_at", todayStart)
    .eq("blocked", false);

  if ((count ?? 0) > 0) return [];

  const granted = await distributeRewards(
    email,
    campaign.rewards,
    `square_pass_daily_${todayStart.slice(0, 10)}`
  );

  if (granted.length > 0) {
    await insertRedemption({
      email,
      codeId: null,
      campaignId: campaign.id,
      codeString: `DAILY:${todayStart.slice(0, 10)}`,
      rewardsGranted: granted,
      fraudFlags: [],
      blocked: false,
    });
    await incrementCampaignRedemptions(campaign.id);
  }

  return granted;
}

export async function checkDailyBonus(email: string): Promise<{
  available: boolean;
  rewards?: SquarePassGrantedReward[];
}> {
  const { fetchAutomationState } = await import("./repository");
  const state = await fetchAutomationState(email);
  if (!state) return { available: true };

  const available = await isDailyBonusAvailable(email, state);
  if (!available) return { available: false };

  const rewards = await grantDailyBonus(email);
  return { available: true, rewards };
}
