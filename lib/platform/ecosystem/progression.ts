import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import { updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { earnTierCredits } from "@/lib/platform/ecosystem/credits";
import { isValidAvatar, DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";

export async function recordDailyLogin(email: string): Promise<{ streakDays: number; creditBonus: number }> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("last_login_date, login_streak_days")
    .eq("email", normalized)
    .maybeSingle();

  const lastDate = profile?.last_login_date as string | null;
  let streak = Number(profile?.login_streak_days ?? 0);
  let creditBonus = 0;

  if (lastDate === today) {
    return { streakDays: streak, creditBonus: 0 };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (lastDate === yesterdayStr) {
    streak += 1;
  } else {
    streak = 1;
  }

  creditBonus = Math.min(50, 5 + streak * 2);
  await earnTierCredits({
    email: normalized,
    amount: creditBonus,
    source: "daily_login",
    metadata: { streak },
  });

  await updateEcosystemProfile(normalized, {
    last_login_date: today,
    login_streak_days: streak,
  });

  return { streakDays: streak, creditBonus };
}

export async function setPlayerAvatar(email: string, emoji: string): Promise<string> {
  if (isValidAvatar(emoji)) {
    await updateEcosystemProfile(email, { avatar_emoji: emoji });
    return emoji;
  }

  const { canUseAvatarEmoji } = await import("@/lib/platform/ecosystem/premiumEmojis");
  if (await canUseAvatarEmoji(email, emoji)) {
    await updateEcosystemProfile(email, { avatar_emoji: emoji });
    return emoji;
  }

  const current = await getPlayerAvatar(email);
  return current || DEFAULT_AVATAR;
}

export async function getPlayerAvatar(email: string): Promise<string> {
  const identity = await getPlayerPublicIdentity(email);
  return identity.avatarEmoji;
}

/** Re-export client-safe display helpers for rewards UI (Phase 3D). */
export {
  buildProgressGoals,
  buildStreakSnapshot,
  buildRewardHistoryTimeline,
  resolveFeaturedAchievements,
  upcomingMilestones,
  tierRequirementLabel,
  sumEarnedCreditsSince,
} from "@/lib/platform/ecosystem/progressionDisplay";

export async function trackLifetimePurchase(email: string, amountCents: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("player_profiles")
    .select("lifetime_purchases_cents, lifetime_gameplay_cents")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  await updateEcosystemProfile(email, {
    lifetime_purchases_cents: Number(data?.lifetime_purchases_cents ?? 0) + amountCents,
    lifetime_gameplay_cents: Number(data?.lifetime_gameplay_cents ?? 0) + amountCents,
  });
}
