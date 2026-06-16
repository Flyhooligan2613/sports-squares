import { fetchActiveCampaignsByType } from "../repository";
import type { SquarePassCampaign, SquarePassGrantedReward } from "../types";
import type { SquarePassAutomationState } from "./types";

export interface ActiveFlashEvent {
  campaign: SquarePassCampaign;
  endsAt: string | null;
  secondsRemaining: number | null;
}

export async function getActiveFlashEvents(
  email: string,
  state: SquarePassAutomationState
): Promise<ActiveFlashEvent[]> {
  void email;
  const campaigns = await fetchActiveCampaignsByType("event");
  const now = Date.now();
  const seen = new Set(state.flashEventsSeen);

  return campaigns
    .filter((c) => c.slug.includes("flash") && c.active && !seen.has(c.slug))
    .map((campaign) => {
      const endsAt = campaign.endsAt;
      let secondsRemaining: number | null = null;
      if (endsAt) {
        secondsRemaining = Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000));
      }
      return { campaign, endsAt, secondsRemaining };
    })
    .filter((e) => e.secondsRemaining === null || e.secondsRemaining > 0);
}

export async function grantFlashEventReward(
  email: string,
  campaignSlug: string
): Promise<SquarePassGrantedReward[]> {
  const { distributeRewards } = await import("../RewardDistributionService");
  const {
    fetchCampaignBySlug,
    incrementCampaignRedemptions,
    insertRedemption,
    countPlayerRedemptionsForCampaign,
  } = await import("../repository");

  const campaign = await fetchCampaignBySlug(campaignSlug);
  if (!campaign) return [];

  const prior = await countPlayerRedemptionsForCampaign(email, campaign.id);
  if (prior > 0) return [];

  const granted = await distributeRewards(
    email,
    campaign.rewards,
    `square_pass_flash_${campaign.slug}`
  );

  if (granted.length > 0) {
    await insertRedemption({
      email,
      codeId: null,
      campaignId: campaign.id,
      codeString: `FLASH:${campaign.slug}`,
      rewardsGranted: granted,
      fraudFlags: [],
      blocked: false,
    });
    await incrementCampaignRedemptions(campaign.id);
  }

  return granted;
}
