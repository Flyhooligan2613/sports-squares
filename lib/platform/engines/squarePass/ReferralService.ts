import { getAppUrl } from "@/lib/platform/engines/payment";
import { ensureEcosystemAccount, updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { applyReferralCode as applyLegacyReferral } from "@/lib/platform/ecosystem/referrals";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildDefaultMilestones, SQUARE_PASS_MILESTONE_REWARDS } from "./config";
import { checkReferralFraud } from "./FraudGuardService";
import { distributeRewards } from "./RewardDistributionService";
import {
  fetchPersonalReferralCode,
  fetchReferralsByReferrer,
  fetchReferrerByCode,
  insertSquarePassReferral,
  upsertPersonalReferralCode,
} from "./repository";
import type { ApplyReferralInput, SquarePassMyReferral } from "./types";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 2)}***@${domain}`;
}

function buildVanityCode(firstName: string, playerId: string): string {
  const base = firstName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8) || "PLAYER";
  const suffix = playerId.replace(/[^0-9]/g, "").slice(-2) || "25";
  return `${base}${suffix}`;
}

export async function ensurePersonalReferralCode(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  const existing = await fetchPersonalReferralCode(normalized);
  if (existing) return existing;

  const account = await ensureEcosystemAccount(normalized);
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("player_profiles")
    .select("first_name")
    .eq("email", normalized)
    .maybeSingle();

  const firstName = (profile?.first_name as string | undefined) ?? account.displayName.split(" ")[0] ?? "PLAYER";
  let code = buildVanityCode(firstName, account.playerId);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const conflict = await fetchReferrerByCode(code);
    if (!conflict || conflict.email === normalized) {
      await upsertPersonalReferralCode(normalized, code);
      return code;
    }
    code = `${buildVanityCode(firstName, account.playerId)}${attempt + 1}`;
  }

  await upsertPersonalReferralCode(normalized, account.playerId);
  return account.playerId;
}

export async function applyReferral(input: ApplyReferralInput): Promise<void> {
  const refereeEmail = normalizeEmail(input.refereeEmail);
  const code = input.referralCode.trim().toUpperCase();
  if (!code) throw new Error("Referral code is required.");

  const referrer = await fetchReferrerByCode(code);
  if (!referrer) throw new Error("Referral code not found.");

  const fraud = await checkReferralFraud({
    refereeEmail,
    referrerEmail: referrer.email,
    deviceKey: input.deviceKey,
    ip: input.ip,
  });
  if (!fraud.allowed) {
    throw new Error(
      fraud.flags.includes("self_referral")
        ? "You cannot refer yourself."
        : fraud.flags.includes("already_referred")
          ? "Referral code already applied."
          : "This referral cannot be applied."
    );
  }

  await insertSquarePassReferral({
    referrerEmail: referrer.email,
    refereeEmail,
    referralCode: code,
  });

  await applyLegacyReferral({
    refereeEmail,
    referralCode: referrer.playerId,
    deviceKey: input.deviceKey,
    ip: input.ip,
  }).catch(() => undefined);
}

export async function syncReferralQualification(refereeEmail: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(refereeEmail);

  const { data: legacy } = await supabase
    .from("player_referrals")
    .select("status, referrer_email")
    .eq("referee_email", normalized)
    .maybeSingle();

  if (!legacy || !["qualified", "rewarded"].includes(legacy.status as string)) return;

  const { data: spReferral } = await supabase
    .from("square_pass_referrals")
    .select("*")
    .eq("referee_email", normalized)
    .maybeSingle();

  if (!spReferral || spReferral.status === "rewarded") return;

  const referrerEmail = normalizeEmail(spReferral.referrer_email as string);
  await supabase
    .from("square_pass_referrals")
    .update({
      status: "qualified",
      qualified_at: new Date().toISOString(),
    })
    .eq("id", spReferral.id as string);

  const account = await ensureEcosystemAccount(referrerEmail);
  await updateEcosystemProfile(referrerEmail, {
    square_pass_referrals_qualified: account.qualifiedReferrals,
  });

  await processReferralMilestones(referrerEmail);
}

async function processReferralMilestones(referrerEmail: string): Promise<void> {
  const account = await ensureEcosystemAccount(referrerEmail);
  const qualified = account.qualifiedReferrals;
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(referrerEmail);

  const { data: existingMilestones } = await supabase
    .from("player_referral_milestones")
    .select("milestone_count")
    .eq("email", normalized);

  const rewardedCounts = new Set(
    (existingMilestones ?? []).map((m) => Number(m.milestone_count))
  );

  for (const [countStr, def] of Object.entries(SQUARE_PASS_MILESTONE_REWARDS)) {
    const count = Number(countStr);
    if (qualified < count || rewardedCounts.has(count)) continue;

    const granted = await distributeRewards(
      referrerEmail,
      def.rewards,
      `square_pass_referral_milestone_${count}`
    );

    await supabase.from("player_referral_milestones").insert({
      email: normalized,
      milestone_count: count,
      reward_type: "square_pass",
      reward_value: { granted },
    });
  }
}

export async function getMyReferral(email: string): Promise<SquarePassMyReferral> {
  const normalized = normalizeEmail(email);
  const account = await ensureEcosystemAccount(normalized);
  const personalCode = await ensurePersonalReferralCode(normalized);
  const appUrl = getAppUrl();
  const referrals = await fetchReferralsByReferrer(normalized);

  const supabase = getSupabaseAdmin();
  const { data: milestoneRows } = await supabase
    .from("player_referral_milestones")
    .select("milestone_count")
    .eq("email", normalized);

  const rewardedCounts = new Set(
    (milestoneRows ?? []).map((m) => Number(m.milestone_count))
  );

  return {
    personalCode,
    playerId: account.playerId,
    referralLink: `${appUrl}/my-games/login?ref=${encodeURIComponent(personalCode)}`,
    totalReferrals: account.totalReferrals,
    qualifiedReferrals: account.qualifiedReferrals,
    pendingReferrals: referrals.filter((r) => r.status === "pending").length,
    milestones: buildDefaultMilestones(account.qualifiedReferrals, rewardedCounts),
    recentReferrals: referrals.slice(0, 20).map((r) => ({
      id: r.id,
      refereeEmailMasked: maskEmail(r.refereeEmail),
      status: r.status,
      createdAt: r.createdAt,
    })),
  };
}
