import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SQUARE_PASS_COPY } from "./config";
import { runFraudChecks } from "./FraudGuardService";
import { isCampaignCurrentlyActive } from "./PromotionService";
import { distributeRewards } from "./RewardDistributionService";
import {
  countPlayerRedemptionsForCampaign,
  fetchActiveCampaignsByType,
  fetchCodeByString,
  incrementCampaignRedemptions,
  incrementCodeRedemptions,
  insertRedemption,
} from "./repository";
import type { RedeemCodeInput, SquarePassRedeemResult, SquarePassSignupBonus } from "./types";

export async function redeemPromoCode(input: RedeemCodeInput): Promise<SquarePassRedeemResult> {
  const email = normalizeEmail(input.email);
  const codeString = input.code.trim().toUpperCase();
  if (!codeString) throw new Error("Code is required.");

  const match = await fetchCodeByString(codeString);
  if (!match) throw new Error(SQUARE_PASS_COPY.redeemInvalid);

  const fraud = await runFraudChecks({
    email,
    code: match,
    campaign: match.campaign,
    deviceKey: input.deviceKey,
    ip: input.ip,
    region: input.region,
    sport: input.sport,
  });

  if (!fraud.allowed) {
    await insertRedemption({
      email,
      codeId: match.id,
      campaignId: match.campaignId,
      codeString,
      rewardsGranted: [],
      fraudFlags: fraud.flags,
      blocked: true,
      ipHash: fraud.ipHash,
      deviceHash: fraud.deviceHash,
    });
    throw new Error(SQUARE_PASS_COPY.redeemInvalid);
  }

  if (!isCampaignCurrentlyActive(match.campaign)) {
    throw new Error(SQUARE_PASS_COPY.redeemInvalid);
  }

  const granted = await distributeRewards(
    email,
    match.campaign.rewards,
    `square_pass_redeem_${match.campaign.slug}`
  );

  await insertRedemption({
    email,
    codeId: match.id,
    campaignId: match.campaignId,
    codeString,
    rewardsGranted: granted,
    fraudFlags: fraud.flags,
    blocked: false,
    ipHash: fraud.ipHash,
    deviceHash: fraud.deviceHash,
  });

  await incrementCodeRedemptions(match.id);
  await incrementCampaignRedemptions(match.campaignId);

  return {
    ok: true,
    celebration: {
      title: match.campaign.name,
      message: SQUARE_PASS_COPY.redeemSuccess,
      rewards: granted,
    },
    campaign: {
      slug: match.campaign.slug,
      name: match.campaign.name,
      campaignType: match.campaign.campaignType,
    },
  };
}

export async function processSignupBonuses(email: string): Promise<SquarePassSignupBonus[]> {
  const normalized = normalizeEmail(email);
  const account = await ensureEcosystemAccount(normalized);
  const campaigns = await fetchActiveCampaignsByType("signup");
  const results: SquarePassSignupBonus[] = [];

  for (const campaign of campaigns) {
    if (!isCampaignCurrentlyActive(campaign)) continue;

    const rules = campaign.eligibilityRules;
    if (rules.newAccountsOnly) {
      const memberSince = new Date(account.memberSince);
      const ageHours = (Date.now() - memberSince.getTime()) / 3_600_000;
      if (ageHours > (rules.maxAgeHours ?? 24)) continue;
    }

    if (rules.requiresGenesis) {
      const supabase = getSupabaseAdmin();
      const { data: profile } = await supabase
        .from("player_profiles")
        .select("genesis_initialized_at")
        .eq("email", normalized)
        .maybeSingle();
      if (!profile?.genesis_initialized_at) continue;
    }

    const prior = await countPlayerRedemptionsForCampaign(normalized, campaign.id);
    if (prior > 0) continue;

    const granted = await distributeRewards(
      normalized,
      campaign.rewards,
      `square_pass_signup_${campaign.slug}`
    );

    if (granted.length > 0) {
      await insertRedemption({
        email: normalized,
        codeId: null,
        campaignId: campaign.id,
        codeString: `SIGNUP:${campaign.slug}`,
        rewardsGranted: granted,
        fraudFlags: [],
        blocked: false,
      });
      await incrementCampaignRedemptions(campaign.id);

      results.push({
        campaignSlug: campaign.slug,
        campaignName: campaign.name,
        rewards: granted,
      });
    }
  }

  const launchCampaigns = await fetchActiveCampaignsByType("launch");
  for (const campaign of launchCampaigns) {
    if (!isCampaignCurrentlyActive(campaign)) continue;
    const rules = campaign.eligibilityRules;
    if (rules.newAccountsOnly) {
      const memberSince = new Date(account.memberSince);
      const ageHours = (Date.now() - memberSince.getTime()) / 3_600_000;
      if (ageHours > (rules.maxAgeHours ?? 72)) continue;
    }
    const prior = await countPlayerRedemptionsForCampaign(normalized, campaign.id);
    if (prior > 0) continue;

    const granted = await distributeRewards(
      normalized,
      campaign.rewards,
      `square_pass_launch_${campaign.slug}`
    );
    if (granted.length > 0) {
      await insertRedemption({
        email: normalized,
        codeId: null,
        campaignId: campaign.id,
        codeString: `LAUNCH:${campaign.slug}`,
        rewardsGranted: granted,
        fraudFlags: [],
        blocked: false,
      });
      await incrementCampaignRedemptions(campaign.id);

      results.push({
        campaignSlug: campaign.slug,
        campaignName: campaign.name,
        rewards: granted,
      });
    }
  }

  return results;
}
