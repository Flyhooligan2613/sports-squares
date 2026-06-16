import { hashReferralFingerprint } from "@/lib/platform/ecosystem/account";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { countPlayerRedemptionsForCampaign } from "./repository";
import type { SquarePassCampaign, SquarePassCode } from "./types";

export interface FraudCheckInput {
  email: string;
  code: SquarePassCode;
  campaign: SquarePassCampaign;
  referrerEmail?: string | null;
  deviceKey?: string;
  ip?: string | null;
  region?: string | null;
  sport?: string | null;
}

export interface FraudCheckResult {
  allowed: boolean;
  flags: string[];
  deviceHash: string | null;
  ipHash: string | null;
}

export async function runFraudChecks(input: FraudCheckInput): Promise<FraudCheckResult> {
  const flags: string[] = [];
  const email = normalizeEmail(input.email);
  const now = new Date();

  const deviceHash = input.deviceKey ? hashReferralFingerprint(input.deviceKey) : null;
  const ipHash = input.ip ? hashReferralFingerprint(input.ip) : null;

  if (!input.code.active) flags.push("code_inactive");
  if (!input.campaign.active) flags.push("campaign_inactive");

  if (input.code.expiresAt && input.code.expiresAt < now.toISOString()) {
    flags.push("code_expired");
  }
  if (input.campaign.endsAt && input.campaign.endsAt < now.toISOString()) {
    flags.push("campaign_expired");
  }
  if (input.campaign.startsAt && input.campaign.startsAt > now.toISOString()) {
    flags.push("campaign_not_started");
  }

  if (
    input.code.maxRedemptions != null &&
    input.code.currentRedemptions >= input.code.maxRedemptions
  ) {
    flags.push("code_limit_reached");
  }
  if (
    input.campaign.totalRedemptionLimit != null &&
    input.campaign.totalRedemptions >= input.campaign.totalRedemptionLimit
  ) {
    flags.push("campaign_limit_reached");
  }

  const limit =
    input.code.usageLimitPerPlayer ?? input.campaign.usageLimitPerPlayer ?? null;
  if (limit != null) {
    const used = await countPlayerRedemptionsForCampaign(email, input.campaign.id);
    if (used >= limit) flags.push("player_limit_reached");
  }

  if (input.referrerEmail && normalizeEmail(input.referrerEmail) === email) {
    flags.push("self_referral");
  }

  const regions = input.code.eligibleRegions ?? input.campaign.eligibilityRules.regions;
  if (regions?.length && input.region) {
    const regionUpper = input.region.toUpperCase();
    if (!regions.map((r) => r.toUpperCase()).includes(regionUpper)) {
      flags.push("region_ineligible");
    }
  }

  const sports = input.code.eligibleSports ?? input.campaign.eligibilityRules.sports;
  if (sports?.length && input.sport) {
    const sportLower = input.sport.toLowerCase();
    if (!sports.map((s) => s.toLowerCase()).includes(sportLower)) {
      flags.push("sport_ineligible");
    }
  }

  const supabase = getSupabaseAdmin();
  const { data: priorSameCode } = await supabase
    .from("square_pass_redemptions")
    .select("id")
    .eq("email", email)
    .eq("code_string", input.code.code.toUpperCase())
    .eq("blocked", false)
    .limit(1)
    .maybeSingle();
  if (priorSameCode) flags.push("duplicate_redemption");

  if (deviceHash) {
    const { data: dupDevice } = await supabase
      .from("square_pass_redemptions")
      .select("id")
      .eq("device_hash", deviceHash)
      .eq("campaign_id", input.campaign.id)
      .neq("email", email)
      .eq("blocked", false)
      .limit(1)
      .maybeSingle();
    if (dupDevice) flags.push("duplicate_device");
  }

  const blocking = new Set([
    "code_inactive",
    "campaign_inactive",
    "code_expired",
    "campaign_expired",
    "campaign_not_started",
    "code_limit_reached",
    "campaign_limit_reached",
    "player_limit_reached",
    "self_referral",
    "region_ineligible",
    "sport_ineligible",
    "duplicate_redemption",
    "duplicate_device",
  ]);

  const allowed = !flags.some((f) => blocking.has(f));

  return { allowed, flags, deviceHash, ipHash };
}

export async function checkReferralFraud(input: {
  refereeEmail: string;
  referrerEmail: string;
  deviceKey?: string;
  ip?: string | null;
}): Promise<{ allowed: boolean; flags: string[] }> {
  const flags: string[] = [];
  const referee = normalizeEmail(input.refereeEmail);
  const referrer = normalizeEmail(input.referrerEmail);

  if (referee === referrer) flags.push("self_referral");

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("square_pass_referrals")
    .select("id")
    .eq("referee_email", referee)
    .maybeSingle();
  if (existing) flags.push("already_referred");

  if (input.deviceKey) {
    const deviceHash = hashReferralFingerprint(input.deviceKey);
    const { data: dup } = await supabase
      .from("square_pass_referrals")
      .select("id")
      .eq("referee_email", referee)
      .limit(1)
      .maybeSingle();
    if (dup && deviceHash) {
      const { data: deviceDup } = await supabase
        .from("player_referrals")
        .select("id")
        .eq("referee_device_hash", deviceHash)
        .neq("referee_email", referee)
        .limit(1)
        .maybeSingle();
      if (deviceDup) flags.push("duplicate_device");
    }
  }

  const blocking = new Set(["self_referral", "already_referred", "duplicate_device"]);
  return { allowed: !flags.some((f) => blocking.has(f)), flags };
}
