import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  CreateCampaignInput,
  CreateCodeInput,
  SquarePassCampaign,
  SquarePassCode,
  SquarePassEligibilityRules,
  SquarePassRedemption,
  SquarePassReferral,
  SquarePassRewardDef,
} from "./types";

function mapCampaign(row: Record<string, unknown>): SquarePassCampaign {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    campaignType: row.campaign_type as SquarePassCampaign["campaignType"],
    description: (row.description as string | null) ?? null,
    rewards: (row.rewards as SquarePassRewardDef[]) ?? [],
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    usageLimitPerPlayer:
      row.usage_limit_per_player != null ? Number(row.usage_limit_per_player) : null,
    totalRedemptionLimit:
      row.total_redemption_limit != null ? Number(row.total_redemption_limit) : null,
    totalRedemptions: Number(row.total_redemptions ?? 0),
    eligibilityRules: (row.eligibility_rules as SquarePassEligibilityRules) ?? {},
    active: Boolean(row.active),
    autoActivate: Boolean(row.auto_activate),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapCode(row: Record<string, unknown>): SquarePassCode {
  return {
    id: row.id as string,
    code: row.code as string,
    campaignId: row.campaign_id as string,
    usageLimitPerPlayer:
      row.usage_limit_per_player != null ? Number(row.usage_limit_per_player) : null,
    maxRedemptions: row.max_redemptions != null ? Number(row.max_redemptions) : null,
    currentRedemptions: Number(row.current_redemptions ?? 0),
    eligibleSports: (row.eligible_sports as string[] | null) ?? null,
    eligibleRegions: (row.eligible_regions as string[] | null) ?? null,
    active: Boolean(row.active),
    expiresAt: (row.expires_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapRedemption(row: Record<string, unknown>): SquarePassRedemption {
  return {
    id: row.id as string,
    email: row.email as string,
    codeId: (row.code_id as string | null) ?? null,
    campaignId: row.campaign_id as string,
    codeString: row.code_string as string,
    rewardsGranted: (row.rewards_granted as SquarePassRedemption["rewardsGranted"]) ?? [],
    fraudFlags: (row.fraud_flags as string[]) ?? [],
    blocked: Boolean(row.blocked),
    createdAt: row.created_at as string,
  };
}

function mapReferral(row: Record<string, unknown>): SquarePassReferral {
  return {
    id: row.id as string,
    referrerEmail: row.referrer_email as string,
    refereeEmail: row.referee_email as string,
    referralCode: row.referral_code as string,
    status: row.status as SquarePassReferral["status"],
    milestoneRewards: (row.milestone_rewards as SquarePassReferral["milestoneRewards"]) ?? [],
    qualifiedAt: (row.qualified_at as string | null) ?? null,
    rewardedAt: (row.rewarded_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function fetchCampaignById(id: string): Promise<SquarePassCampaign | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCampaign(data as Record<string, unknown>) : null;
}

export async function fetchCampaignBySlug(slug: string): Promise<SquarePassCampaign | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_campaigns")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCampaign(data as Record<string, unknown>) : null;
}

export async function listCampaigns(activeOnly = false): Promise<SquarePassCampaign[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("square_pass_campaigns").select("*").order("created_at", { ascending: false });
  if (activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapCampaign(row as Record<string, unknown>));
}

export async function insertCampaign(input: CreateCampaignInput): Promise<SquarePassCampaign> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_campaigns")
    .insert({
      slug: input.slug,
      name: input.name,
      campaign_type: input.campaignType,
      description: input.description ?? null,
      rewards: input.rewards,
      starts_at: input.startsAt ?? null,
      ends_at: input.endsAt ?? null,
      usage_limit_per_player: input.usageLimitPerPlayer ?? null,
      total_redemption_limit: input.totalRedemptionLimit ?? null,
      eligibility_rules: input.eligibilityRules ?? {},
      active: input.active ?? false,
      auto_activate: input.autoActivate ?? false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapCampaign(data as Record<string, unknown>);
}

export async function updateCampaign(
  id: string,
  patch: Partial<CreateCampaignInput> & { active?: boolean; totalRedemptions?: number }
): Promise<SquarePassCampaign> {
  const supabase = getSupabaseAdmin();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.campaignType !== undefined) row.campaign_type = patch.campaignType;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.rewards !== undefined) row.rewards = patch.rewards;
  if (patch.startsAt !== undefined) row.starts_at = patch.startsAt;
  if (patch.endsAt !== undefined) row.ends_at = patch.endsAt;
  if (patch.usageLimitPerPlayer !== undefined) row.usage_limit_per_player = patch.usageLimitPerPlayer;
  if (patch.totalRedemptionLimit !== undefined) row.total_redemption_limit = patch.totalRedemptionLimit;
  if (patch.eligibilityRules !== undefined) row.eligibility_rules = patch.eligibilityRules;
  if (patch.active !== undefined) row.active = patch.active;
  if (patch.autoActivate !== undefined) row.auto_activate = patch.autoActivate;
  if (patch.totalRedemptions !== undefined) row.total_redemptions = patch.totalRedemptions;

  const { data, error } = await supabase
    .from("square_pass_campaigns")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapCampaign(data as Record<string, unknown>);
}

export async function fetchCodeByString(code: string): Promise<(SquarePassCode & { campaign: SquarePassCampaign }) | null> {
  const supabase = getSupabaseAdmin();
  const normalized = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from("square_pass_codes")
    .select("*, square_pass_campaigns(*)")
    .eq("code", normalized)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Record<string, unknown>;
  const campaignRow = row.square_pass_campaigns as Record<string, unknown>;
  return {
    ...mapCode(row),
    campaign: mapCampaign(campaignRow),
  };
}

export async function listCodesForCampaign(campaignId: string): Promise<SquarePassCode[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_codes")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapCode(row as Record<string, unknown>));
}

export async function insertCode(input: CreateCodeInput): Promise<SquarePassCode> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_codes")
    .insert({
      code: input.code.trim().toUpperCase(),
      campaign_id: input.campaignId,
      usage_limit_per_player: input.usageLimitPerPlayer ?? null,
      max_redemptions: input.maxRedemptions ?? null,
      eligible_sports: input.eligibleSports ?? null,
      eligible_regions: input.eligibleRegions ?? null,
      expires_at: input.expiresAt ?? null,
      active: input.active ?? true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapCode(data as Record<string, unknown>);
}

export async function incrementCodeRedemptions(codeId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("square_pass_codes")
    .select("current_redemptions")
    .eq("id", codeId)
    .single();
  const current = Number(data?.current_redemptions ?? 0);
  await supabase
    .from("square_pass_codes")
    .update({ current_redemptions: current + 1 })
    .eq("id", codeId);
}

export async function incrementCampaignRedemptions(campaignId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("square_pass_campaigns")
    .select("total_redemptions")
    .eq("id", campaignId)
    .single();
  const current = Number(data?.total_redemptions ?? 0);
  await supabase
    .from("square_pass_campaigns")
    .update({ total_redemptions: current + 1, updated_at: new Date().toISOString() })
    .eq("id", campaignId);
}

export async function countPlayerRedemptionsForCampaign(
  email: string,
  campaignId: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("square_pass_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("email", normalizeEmail(email))
    .eq("campaign_id", campaignId)
    .eq("blocked", false);
  if (error) throw error;
  return count ?? 0;
}

export async function insertRedemption(input: {
  email: string;
  codeId: string | null;
  campaignId: string;
  codeString: string;
  rewardsGranted: SquarePassRedemption["rewardsGranted"];
  fraudFlags: string[];
  blocked: boolean;
  ipHash?: string | null;
  deviceHash?: string | null;
}): Promise<SquarePassRedemption> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_redemptions")
    .insert({
      email: normalizeEmail(input.email),
      code_id: input.codeId,
      campaign_id: input.campaignId,
      code_string: input.codeString.toUpperCase(),
      rewards_granted: input.rewardsGranted,
      fraud_flags: input.fraudFlags,
      blocked: input.blocked,
      ip_hash: input.ipHash ?? null,
      device_hash: input.deviceHash ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapRedemption(data as Record<string, unknown>);
}

export async function fetchPersonalReferralCode(email: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_referral_codes")
    .select("code")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw error;
  return (data?.code as string | undefined) ?? null;
}

export async function upsertPersonalReferralCode(email: string, code: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("player_referral_codes").upsert({
    email: normalizeEmail(email),
    code: code.trim().toUpperCase(),
  });
}

export async function fetchReferrerByCode(
  code: string
): Promise<{ email: string; playerId: string } | null> {
  const supabase = getSupabaseAdmin();
  const normalized = code.trim().toUpperCase();

  const { data: vanity } = await supabase
    .from("player_referral_codes")
    .select("email")
    .eq("code", normalized)
    .maybeSingle();

  if (vanity?.email) {
    const { data: profile } = await supabase
      .from("player_profiles")
      .select("email, player_id")
      .eq("email", vanity.email as string)
      .maybeSingle();
    if (profile) {
      return {
        email: normalizeEmail(profile.email as string),
        playerId: profile.player_id as string,
      };
    }
  }

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("email, player_id")
    .eq("player_id", normalized)
    .maybeSingle();

  if (!profile?.email) return null;
  return {
    email: normalizeEmail(profile.email as string),
    playerId: profile.player_id as string,
  };
}

export async function insertSquarePassReferral(input: {
  referrerEmail: string;
  refereeEmail: string;
  referralCode: string;
}): Promise<SquarePassReferral> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_referrals")
    .insert({
      referrer_email: normalizeEmail(input.referrerEmail),
      referee_email: normalizeEmail(input.refereeEmail),
      referral_code: input.referralCode.toUpperCase(),
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapReferral(data as Record<string, unknown>);
}

export async function fetchReferralsByReferrer(email: string): Promise<SquarePassReferral[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_referrals")
    .select("*")
    .eq("referrer_email", normalizeEmail(email))
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((row) => mapReferral(row as Record<string, unknown>));
}

export async function fetchReferralByReferee(email: string): Promise<SquarePassReferral | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_referrals")
    .select("*")
    .eq("referee_email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw error;
  return data ? mapReferral(data as Record<string, unknown>) : null;
}

export async function listAutoActivateCampaigns(): Promise<SquarePassCampaign[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_campaigns")
    .select("*")
    .eq("auto_activate", true);
  if (error) throw error;
  return (data ?? []).map((row) => mapCampaign(row as Record<string, unknown>));
}

export async function fetchActiveCampaignsByType(
  campaignType: SquarePassCampaign["campaignType"]
): Promise<SquarePassCampaign[]> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("square_pass_campaigns")
    .select("*")
    .eq("campaign_type", campaignType)
    .eq("active", true);
  if (error) throw error;

  return (data ?? [])
    .map((row) => mapCampaign(row as Record<string, unknown>))
    .filter((c) => {
      if (c.startsAt && c.startsAt > now) return false;
      if (c.endsAt && c.endsAt < now) return false;
      if (c.totalRedemptionLimit != null && c.totalRedemptions >= c.totalRedemptionLimit) return false;
      return true;
    });
}

export async function countRedemptionsSince(iso: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("square_pass_redemptions")
    .select("id", { count: "exact", head: true })
    .gte("created_at", iso)
    .eq("blocked", false);
  if (error) throw error;
  return count ?? 0;
}

export async function fetchTopCodes(limit = 10): Promise<
  Array<{ code: string; redemptions: number; campaignName: string }>
> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_codes")
    .select("code, current_redemptions, square_pass_campaigns(name)")
    .order("current_redemptions", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const campaign = r.square_pass_campaigns as Record<string, unknown> | null;
    return {
      code: r.code as string,
      redemptions: Number(r.current_redemptions ?? 0),
      campaignName: (campaign?.name as string) ?? "Unknown",
    };
  });
}

export async function sumXpFromRedemptions(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_redemptions")
    .select("rewards_granted")
    .eq("blocked", false)
    .limit(5000);
  if (error) throw error;

  let total = 0;
  for (const row of data ?? []) {
    const rewards = (row.rewards_granted as Array<{ type?: string; amount?: number }>) ?? [];
    for (const r of rewards) {
      if (r.type === "xp" && r.amount) total += r.amount;
    }
  }
  return total;
}

export async function countReferrals(): Promise<{ total: number; qualified: number }> {
  const supabase = getSupabaseAdmin();
  const [totalRes, qualifiedRes] = await Promise.all([
    supabase.from("square_pass_referrals").select("id", { count: "exact", head: true }),
    supabase
      .from("square_pass_referrals")
      .select("id", { count: "exact", head: true })
      .in("status", ["qualified", "rewarded"]),
  ]);
  return {
    total: totalRes.count ?? 0,
    qualified: qualifiedRes.count ?? 0,
  };
}

export async function countActiveCampaigns(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("square_pass_campaigns")
    .select("id", { count: "exact", head: true })
    .eq("active", true);
  if (error) throw error;
  return count ?? 0;
}
