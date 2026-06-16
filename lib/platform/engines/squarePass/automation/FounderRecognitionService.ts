import { distributeRewards } from "../RewardDistributionService";
import {
  countPlayerRedemptionsForCampaign,
  fetchCampaignBySlug,
  incrementCampaignRedemptions,
  insertRedemption,
} from "../repository";
import { fetchPlayerRegistrationOrder } from "./repository";
import { FOUNDER_CAMPAIGN_SLUG, FOUNDING_COMPETITOR_LIMIT } from "./config";
import type { SquarePassAutomationState } from "./types";
import type { SquarePassGrantedReward } from "../types";

export async function isFounderEligible(
  email: string,
  state: SquarePassAutomationState
): Promise<boolean> {
  if (state.founderClaimedAt) return false;

  const order = await fetchPlayerRegistrationOrder(email);
  if (order == null) return false;
  return order <= FOUNDING_COMPETITOR_LIMIT;
}

export async function grantFounderRecognition(email: string): Promise<{
  founderNumber: number;
  founderLimit: number;
  rewards: SquarePassGrantedReward[];
}> {
  const order = (await fetchPlayerRegistrationOrder(email)) ?? FOUNDING_COMPETITOR_LIMIT;
  const campaign = await fetchCampaignBySlug(FOUNDER_CAMPAIGN_SLUG);
  if (!campaign) {
    return {
      founderNumber: order,
      founderLimit: FOUNDING_COMPETITOR_LIMIT,
      rewards: [],
    };
  }

  const prior = await countPlayerRedemptionsForCampaign(email, campaign.id);
  if (prior > 0) {
    return {
      founderNumber: order,
      founderLimit: FOUNDING_COMPETITOR_LIMIT,
      rewards: [],
    };
  }

  const granted = await distributeRewards(
    email,
    campaign.rewards,
    `square_pass_founder_${campaign.slug}`
  );

  await insertRedemption({
    email,
    codeId: null,
    campaignId: campaign.id,
    codeString: `FOUNDER:${order}`,
    rewardsGranted: granted,
    fraudFlags: [],
    blocked: false,
  });
  await incrementCampaignRedemptions(campaign.id);

  return {
    founderNumber: order,
    founderLimit: FOUNDING_COMPETITOR_LIMIT,
    rewards: granted,
  };
}
