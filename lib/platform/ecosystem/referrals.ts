import { getAppUrl } from "@/lib/platform/engines/payment";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import {
  ensureEcosystemAccount,
  getEcosystemAccount,
  hashReferralFingerprint,
  updateEcosystemProfile,
} from "@/lib/platform/ecosystem/account";
import { addSquareCredits, earnTierCredits } from "@/lib/platform/ecosystem/credits";
import type { ReferralStatus, ReferralSummary } from "@/lib/platform/ecosystem/types";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 2)}***@${domain}`;
}

export async function getReferralCodeForEmail(email: string): Promise<string> {
  const account = await ensureEcosystemAccount(email);
  return account.playerId;
}

export async function applyReferralCode(input: {
  refereeEmail: string;
  referralCode: string;
  deviceKey?: string;
  ip?: string | null;
}): Promise<void> {
  const refereeEmail = normalizeEmail(input.refereeEmail);
  const code = input.referralCode.trim().toUpperCase();
  if (!code) throw new Error("Referral code is required.");

  const referee = await ensureEcosystemAccount(refereeEmail);
  if (referee.referredByCode) throw new Error("Referral code already applied.");

  const supabase = getSupabaseAdmin();
  const { data: referrer, error } = await supabase
    .from("player_profiles")
    .select("email, player_id")
    .eq("player_id", code)
    .maybeSingle();

  if (error) throw error;
  if (!referrer?.email) throw new Error("Referral code not found.");

  const referrerEmail = normalizeEmail(referrer.email as string);
  if (referrerEmail === refereeEmail) throw new Error("You cannot refer yourself.");

  const deviceHash = input.deviceKey ? hashReferralFingerprint(input.deviceKey) : null;
  const ipHash = input.ip ? hashReferralFingerprint(input.ip) : null;

  if (deviceHash) {
    const { data: dupDevice } = await supabase
      .from("player_referrals")
      .select("id")
      .eq("referee_device_hash", deviceHash)
      .neq("referee_email", refereeEmail)
      .limit(1)
      .maybeSingle();
    if (dupDevice) throw new Error("This device already received a referral reward.");
  }

  await supabase.from("player_referrals").insert({
    referrer_email: referrerEmail,
    referee_email: refereeEmail,
    referral_code: code,
    referee_device_hash: deviceHash,
    referee_ip_hash: ipHash,
    status: "pending",
  });

  await updateEcosystemProfile(refereeEmail, {
    referred_by_email: referrerEmail,
    referred_by_code: code,
  });

  const referrerAccount = await getEcosystemAccount(referrerEmail);
  await updateEcosystemProfile(referrerEmail, {
    total_referrals: (referrerAccount?.totalReferrals ?? 0) + 1,
  });
}

async function rewardReferralMilestones(referrerEmail: string): Promise<void> {
  const config = await getAdminConfig("referral");
  const account = await ensureEcosystemAccount(referrerEmail);
  const supabase = getSupabaseAdmin();

  for (const milestone of config.milestones) {
    if (account.qualifiedReferrals < milestone) continue;

    const { data: existing } = await supabase
      .from("player_referral_milestones")
      .select("id")
      .eq("email", referrerEmail)
      .eq("milestone_count", milestone)
      .maybeSingle();

    if (existing) continue;

    const bonusCredits = milestone >= 100 ? 5000 : milestone >= 25 ? 1500 : milestone >= 10 ? 750 : 250;
    await earnTierCredits({
      email: referrerEmail,
      amount: bonusCredits,
      source: "referral_milestone",
      metadata: { milestone },
    });

    await supabase.from("player_referral_milestones").insert({
      email: referrerEmail,
      milestone_count: milestone,
      reward_type: "tier_credits",
      reward_value: { credits: bonusCredits },
    });
  }
}

export async function processReferralGameplay(input: {
  refereeEmail: string;
  amountCents: number;
  isDeposit?: boolean;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const refereeEmail = normalizeEmail(input.refereeEmail);

  const { data: referral, error } = await supabase
    .from("player_referrals")
    .select("*")
    .eq("referee_email", refereeEmail)
    .maybeSingle();

  if (error) throw error;
  if (!referral || referral.status === "rewarded" || referral.status === "rejected") return;

  const config = await getAdminConfig("referral");
  const firstDeposit = Math.max(
    Number(referral.first_deposit_cents ?? 0),
    input.isDeposit ? input.amountCents : 0
  );
  const gameplay = Number(referral.qualified_gameplay_cents ?? 0) + input.amountCents;

  const patch: Record<string, unknown> = {
    first_deposit_cents: firstDeposit,
    qualified_gameplay_cents: gameplay,
  };

  const qualified =
    firstDeposit >= config.minDepositCents && gameplay >= config.minGameplayCents;

  if (qualified && referral.status === "pending") {
    patch.status = "qualified";
    patch.qualified_at = new Date().toISOString();
  }

  await supabase.from("player_referrals").update(patch).eq("id", referral.id as string);

  if (qualified && referral.status === "pending") {
    await finalizeReferralReward(referrerEmailFromRow(referral), referral.id as string);
  }
}

function referrerEmailFromRow(referral: Record<string, unknown>): string {
  return normalizeEmail(referral.referrer_email as string);
}

async function finalizeReferralReward(referrerEmail: string, referralId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const config = await getAdminConfig("referral");

  const { data: referral } = await supabase
    .from("player_referrals")
    .select("status")
    .eq("id", referralId)
    .single();

  if (!referral || referral.status === "rewarded") return;

  await addSquareCredits({
    email: referrerEmail,
    amountCents: config.rewardCents,
    source: "referral_reward",
    metadata: { referralId },
  });

  await supabase
    .from("player_referrals")
    .update({ status: "rewarded", rewarded_at: new Date().toISOString() })
    .eq("id", referralId);

  const account = await ensureEcosystemAccount(referrerEmail);
  await updateEcosystemProfile(referrerEmail, {
    qualified_referrals: account.qualifiedReferrals + 1,
  });

  await rewardReferralMilestones(referrerEmail);
}

export async function getReferralSummary(email: string): Promise<ReferralSummary> {
  const account = await ensureEcosystemAccount(email);
  const config = await getAdminConfig("referral");
  const supabase = getSupabaseAdmin();
  const appUrl = getAppUrl();

  const { data: rows, error } = await supabase
    .from("player_referrals")
    .select("*")
    .eq("referrer_email", normalizeEmail(email))
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  const referrals = (rows ?? []).map((row) => ({
    id: row.id as string,
    refereeEmailMasked: maskEmail(row.referee_email as string),
    status: row.status as ReferralStatus,
    qualifiedGameplayCents: Number(row.qualified_gameplay_cents ?? 0),
    createdAt: row.created_at as string,
  }));

  const { data: milestones } = await supabase
    .from("player_referral_milestones")
    .select("milestone_count")
    .eq("email", normalizeEmail(email));

  const reached = new Set((milestones ?? []).map((m) => Number(m.milestone_count)));

  return {
    referralCode: account.playerId,
    referralLink: `${appUrl}/my-games/login?ref=${encodeURIComponent(account.playerId)}`,
    totalReferrals: account.totalReferrals,
    qualifiedReferrals: account.qualifiedReferrals,
    pendingReferrals: referrals.filter((r) => r.status === "pending").length,
    referralEarningsCents: account.qualifiedReferrals * config.rewardCents,
    milestones: config.milestones.map((count) => ({
      count,
      reached: account.qualifiedReferrals >= count,
      rewarded: reached.has(count),
    })),
    referrals,
  };
}
