import { distributeRewards } from "../RewardDistributionService";
import {
  fetchCampaignBySlug,
  incrementCampaignRedemptions,
  insertRedemption,
} from "../repository";
import { fetchActiveMysteryPool } from "./repository";
import {
  AUTOMATION_COPY,
  MYSTERY_CAMPAIGN_SLUG,
  MYSTERY_FALLBACK_REWARD,
} from "./config";
import type { SquarePassMysteryPoolEntry, SquarePassMysteryRevealResult } from "./types";
import type { SquarePassRewardDef } from "../types";

function weightedPick(pool: SquarePassMysteryPoolEntry[]): SquarePassMysteryPoolEntry {
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return pool[pool.length - 1];
}

export async function revealMysterySquarePass(email: string): Promise<SquarePassMysteryRevealResult> {
  let pool = await fetchActiveMysteryPool();
  if (pool.length === 0) {
    pool = [
      {
        id: "fallback",
        slug: "fallback-xp",
        label: MYSTERY_FALLBACK_REWARD.label,
        reward: MYSTERY_FALLBACK_REWARD,
        weight: 100,
        active: true,
        sortOrder: 0,
      },
    ];
  }

  const picked = weightedPick(pool);
  const reward: SquarePassRewardDef = picked.reward;

  const granted = await distributeRewards(
    email,
    [reward],
    `square_pass_mystery_${picked.slug}`
  );

  const campaign = await fetchCampaignBySlug(MYSTERY_CAMPAIGN_SLUG);
  if (campaign) {
    await insertRedemption({
      email,
      codeId: null,
      campaignId: campaign.id,
      codeString: `MYSTERY:${picked.slug}`,
      rewardsGranted: granted.length > 0 ? granted : [{ type: reward.type, label: reward.label, amount: reward.amount, itemId: reward.itemId }],
      fraudFlags: [],
      blocked: false,
    });
    await incrementCampaignRedemptions(campaign.id);
  }

  return {
    ok: true,
    poolSlug: picked.slug,
    label: picked.label,
    celebration: {
      title: AUTOMATION_COPY.mysteryTitle,
      message: AUTOMATION_COPY.mysteryMessage,
      rewards: granted.length > 0 ? granted : [{ type: reward.type, label: reward.label, amount: reward.amount, itemId: reward.itemId }],
    },
  };
}
