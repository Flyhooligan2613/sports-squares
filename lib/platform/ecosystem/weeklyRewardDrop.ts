import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import { ensureEcosystemAccount, updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { addInventoryItem } from "@/lib/platform/ecosystem/inventory";
import { addSquareCredits, earnTierCredits } from "@/lib/platform/ecosystem/credits";
import { listActivePromotions } from "@/lib/platform/ecosystem/promotions";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";
import type {
  DropBoxType,
  DropReward,
  DropRewardType,
  QualificationSource,
  RewardRarity,
  WeeklyDropRecord,
  WeeklyDropStatus,
  WeeklyRewardDropConfig,
} from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import { DEFAULT_WEEKLY_REWARD_DROP_CONFIG } from "@/lib/platform/ecosystem/config";

export function isoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function getWeeklyDropConfig(): Promise<WeeklyRewardDropConfig> {
  const raw = await getAdminConfig("weekly_reward_drop").catch(() => null);
  if (!raw || typeof raw !== "object") return DEFAULT_WEEKLY_REWARD_DROP_CONFIG;
  return { ...DEFAULT_WEEKLY_REWARD_DROP_CONFIG, ...(raw as WeeklyRewardDropConfig) };
}

function mapRow(row: Record<string, unknown>): WeeklyDropRecord {
  return {
    id: row.id as string,
    weekKey: row.week_key as string,
    boxType: (row.box_type as DropBoxType) ?? "bronze",
    tierSlug: row.tier_slug as PlayerTierSlug,
    qualificationSource: (row.qualification_source as QualificationSource) ?? "weekly_gameplay",
    rewards: (row.rewards as DropReward[]) ?? [],
    totalValueCents: Number(row.total_value_cents ?? 0),
    openedAt: (row.opened_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

function rollRarity(rates: WeeklyRewardDropConfig["dropRates"][DropBoxType]): RewardRarity {
  const roll = Math.random() * 100;
  let cumulative = 0;
  const order: RewardRarity[] = ["common", "rare", "epic", "legendary", "mythic"];
  for (const rarity of order) {
    cumulative += rates[rarity] ?? 0;
    if (roll < cumulative) return rarity;
  }
  return "common";
}

const REWARD_POOL: Record<
  RewardRarity,
  {
    type: DropRewardType;
    label: string;
    icon: string;
    amountRange?: [number, number];
    valueCentsRange?: [number, number];
  }[]
> = {
  common: [
    { type: "tier_credits", label: "Tier Credits", icon: "⭐", amountRange: [25, 75] },
    { type: "square_credit", label: "Square Credit", icon: "💵", valueCentsRange: [100, 300] },
  ],
  rare: [
    { type: "tier_credits", label: "Tier Credits", icon: "⭐", amountRange: [75, 150] },
    { type: "pickem_credit", label: "Pick'em Credit", icon: "🏈", valueCentsRange: [500, 1000] },
    { type: "bonus_entry", label: "Bonus Entry", icon: "🎟️", amountRange: [1, 1] },
  ],
  epic: [
    { type: "tier_credits", label: "Tier Credits", icon: "⭐", amountRange: [150, 350] },
    { type: "square_credit", label: "Square Credit", icon: "💵", valueCentsRange: [500, 1000] },
    { type: "coupon", label: "Merch Discount", icon: "🏷️", amountRange: [10, 25] },
    { type: "badge", label: "Exclusive Badge", icon: "🏅", amountRange: [1, 1] },
  ],
  legendary: [
    { type: "tier_credits", label: "Tier Credits", icon: "⭐", amountRange: [400, 800] },
    { type: "square_credit", label: "Square Credit", icon: "💵", valueCentsRange: [1000, 2500] },
    { type: "vip_ticket", label: "VIP Ticket", icon: "🎫", amountRange: [1, 1] },
    { type: "profile_frame", label: "Profile Frame", icon: "🖼️", amountRange: [1, 1] },
    { type: "golden_box", label: "Golden Box Token", icon: "📦", amountRange: [1, 1] },
  ],
  mythic: [
    { type: "tier_credits", label: "Tier Credits", icon: "⭐", amountRange: [800, 1500] },
    { type: "diamond_box", label: "Diamond Box Token", icon: "💎", amountRange: [1, 1] },
    { type: "animated_avatar", label: "Animated Avatar", icon: "✨", amountRange: [1, 1] },
    { type: "legend_box", label: "Legend Box Token", icon: "👑", amountRange: [1, 1] },
    { type: "secret_reward", label: "Secret Reward", icon: "🎁", amountRange: [1, 1] },
  ],
};

const SPECIAL_SURPRISES: { label: string; icon: string; type: DropRewardType; rarity: RewardRarity }[] = [
  { label: "FREE WEEK OF PLAY", icon: "🎮", type: "bonus_entry", rarity: "mythic" },
  { label: "FREE $100 BOARD", icon: "🏈", type: "square_credit", rarity: "mythic" },
  { label: "DOUBLE TIER CREDITS", icon: "⚡", type: "tier_credits", rarity: "legendary" },
  { label: "VIP ACCESS", icon: "🌟", type: "vip_ticket", rarity: "legendary" },
  { label: "LIMITED PROFILE FRAME", icon: "🖼️", type: "profile_frame", rarity: "legendary" },
  { label: "MERCH GIVEAWAY ENTRY", icon: "👕", type: "merch_credit", rarity: "epic" },
];

function randomInRange([min, max]: [number, number]): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildReward(rarity: RewardRarity, boxType: DropBoxType): DropReward {
  const pool = REWARD_POOL[rarity];
  const template = pool[Math.floor(Math.random() * pool.length)]!;
  const multiplier = boxType === "immortal" ? 1.5 : boxType === "legend" ? 1.35 : boxType === "diamond" ? 1.2 : boxType === "gold" ? 1.1 : 1;

  const reward: DropReward = {
    id: randomUUID(),
    type: template.type,
    label: template.label,
    rarity,
    icon: template.icon,
  };

  if (template.amountRange) {
    reward.amount = Math.round(randomInRange(template.amountRange) * multiplier);
  }
  if (template.valueCentsRange) {
    reward.valueCents = Math.round(randomInRange(template.valueCentsRange) * multiplier);
  }

  return reward;
}

function rewardCountForBox(boxType: DropBoxType): number {
  const counts: Record<DropBoxType, number> = {
    bronze: 1,
    silver: 2,
    gold: 2,
    diamond: 3,
    legend: 3,
    immortal: 4,
  };
  return counts[boxType];
}

function rollDropRewards(config: WeeklyRewardDropConfig, boxType: DropBoxType): DropReward[] {
  const rates = config.dropRates[boxType] ?? config.dropRates.bronze;
  const count = rewardCountForBox(boxType);
  const rewards: DropReward[] = [];

  for (let i = 0; i < count; i += 1) {
    rewards.push(buildReward(rollRarity(rates), boxType));
  }

  if (Math.random() * 100 < config.specialSurpriseChancePct) {
    const special = SPECIAL_SURPRISES[Math.floor(Math.random() * SPECIAL_SURPRISES.length)]!;
    rewards.push({
      id: randomUUID(),
      type: special.type,
      label: special.label,
      rarity: special.rarity,
      icon: special.icon,
      special: true,
      amount: special.type === "tier_credits" ? 500 : special.type === "square_credit" ? 10000 : 1,
      valueCents: special.type === "square_credit" ? 10000 : undefined,
    });
  }

  return rewards;
}

function totalValueCents(rewards: DropReward[]): number {
  return rewards.reduce((sum, r) => {
    if (r.valueCents) return sum + r.valueCents;
    if (r.type === "tier_credits" && r.amount) return sum + r.amount * 10;
    return sum + 100;
  }, 0);
}

async function resolveQualification(
  email: string,
  config: WeeklyRewardDropConfig
): Promise<{ qualified: boolean; source: QualificationSource }> {
  const account = await ensureEcosystemAccount(email);

  if (account.weeklyGameplayCents >= config.minWeeklyGameplayCents) {
    return { qualified: true, source: "weekly_gameplay" };
  }

  const promotions = await listActivePromotions(email);
  if (promotions.some((p) => p.promoType === "vip" && !p.claimed)) {
    return { qualified: true, source: "vip_promotion" };
  }

  if (promotions.some((p) => p.promoType === "giveaway" || p.promoType === "holiday")) {
    return { qualified: true, source: "holiday" };
  }

  const supabase = getSupabaseAdmin();
  const { data: pending } = await supabase
    .from("player_pending_rewards")
    .select("id")
    .eq("email", normalizeEmail(email))
    .eq("reward_type", "weekly_drop")
    .is("claimed_at", null)
    .limit(1)
    .maybeSingle();

  if (pending) return { qualified: true, source: "admin_giveaway" };

  return { qualified: false, source: "weekly_gameplay" };
}

export async function ensureWeeklyRewardDrop(email: string): Promise<boolean> {
  const config = await getWeeklyDropConfig();
  if (!config.enabled) return false;

  const account = await ensureEcosystemAccount(email);
  const weekKey = isoWeekKey();
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("player_mystery_boxes")
    .select("id, opened_at")
    .eq("email", normalized)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (existing) return !existing.opened_at;

  const { qualified, source } = await resolveQualification(email, config);
  if (!qualified) return false;

  const boxType = config.tierBoxMap[account.tierSlug] ?? "bronze";
  const rewards = rollDropRewards(config, boxType);

  await supabase.from("player_mystery_boxes").insert({
    email: normalized,
    week_key: weekKey,
    tier_slug: account.tierSlug,
    box_type: boxType,
    qualification_source: source,
    rewards,
    total_value_cents: totalValueCents(rewards),
    drop_metadata: { version: 1, gameTypes: ["squareboards", "pickem"] },
  });

  return true;
}

export async function getWeeklyDropStatus(email: string): Promise<WeeklyDropStatus> {
  const config = await getWeeklyDropConfig();
  const account = await ensureEcosystemAccount(email);
  const weekKey = isoWeekKey();
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  await ensureWeeklyRewardDrop(email).catch(() => false);

  const { data: row } = await supabase
    .from("player_mystery_boxes")
    .select("*")
    .eq("email", normalized)
    .eq("week_key", weekKey)
    .maybeSingle();

  const { qualified } = await resolveQualification(email, config);
  const min = config.minWeeklyGameplayCents;
  const progressPct = Math.min(100, Math.round((account.weeklyGameplayCents / min) * 100));

  if (!row) {
    return {
      qualified,
      hasUnopenedDrop: false,
      currentDrop: null,
      boxType: null,
      qualificationSource: null,
      weeklyGameplayCents: account.weeklyGameplayCents,
      minGameplayCents: min,
      progressPct,
    };
  }

  const drop = mapRow(row as Record<string, unknown>);
  return {
    qualified,
    hasUnopenedDrop: !drop.openedAt,
    currentDrop: drop,
    boxType: drop.boxType,
    qualificationSource: drop.qualificationSource,
    weeklyGameplayCents: account.weeklyGameplayCents,
    minGameplayCents: min,
    progressPct,
  };
}

async function fulfillReward(email: string, reward: DropReward, weekKey: string): Promise<void> {
  switch (reward.type) {
    case "tier_credits":
      if (reward.amount) {
        await earnTierCredits({ email, amount: reward.amount, source: "weekly_reward_drop", metadata: { rarity: reward.rarity } });
        await addInventoryItem({
          email,
          itemType: "tier_reward",
          title: `${reward.label} (${reward.rarity})`,
          quantity: reward.amount,
          source: "weekly_reward_drop",
          metadata: { weekKey, rarity: reward.rarity },
        });
      }
      break;
    case "square_credit":
      if (reward.valueCents) {
        await addSquareCredits({ email, amountCents: reward.valueCents, source: "weekly_reward_drop" });
        await addInventoryItem({
          email,
          itemType: "square_credit",
          title: reward.label,
          valueCents: reward.valueCents,
          source: "weekly_reward_drop",
          metadata: { rarity: reward.rarity },
        });
      }
      break;
    case "pickem_credit": {
      const account = await ensureEcosystemAccount(email);
      const cents = reward.valueCents ?? 1000;
      await updateEcosystemProfile(email, {
        pickem_credits_cents: account.pickemCreditsCents + cents,
      });
      await addInventoryItem({
        email,
        itemType: "pickem_entry",
        title: reward.label,
        valueCents: cents,
        source: "weekly_reward_drop",
      });
      break;
    }
    case "bonus_entry":
    case "coupon":
    case "merch_credit":
    case "referral_bonus":
      await addInventoryItem({
        email,
        itemType: reward.type === "coupon" ? "coupon" : reward.type === "merch_credit" ? "merch_coupon" : "reward_token",
        title: reward.label,
        quantity: reward.amount ?? 1,
        source: "weekly_reward_drop",
        metadata: { rarity: reward.rarity, special: reward.special },
      });
      break;
    case "badge":
    case "vip_ticket":
    case "profile_frame":
    case "animated_avatar":
    case "season_token":
    case "golden_box":
    case "diamond_box":
    case "legend_box":
    case "secret_reward":
      await addInventoryItem({
        email,
        itemType: reward.type === "badge" ? "badge" : reward.type.includes("box") ? "mystery_box" : "cosmetic",
        title: reward.label,
        quantity: 1,
        source: "weekly_reward_drop",
        metadata: { rarity: reward.rarity, type: reward.type, special: reward.special },
      });
      break;
    default:
      break;
  }
}

export async function openWeeklyRewardDrop(email: string): Promise<{ drop: WeeklyDropRecord }> {
  const weekKey = isoWeekKey();
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from("player_mystery_boxes")
    .select("*")
    .eq("email", normalized)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (error) throw error;
  if (!row) throw new Error("No Weekly Reward Drop available.");
  if (row.opened_at) throw new Error("Weekly Reward Drop already opened.");

  const drop = mapRow(row as Record<string, unknown>);
  const rewards = drop.rewards;

  for (const reward of rewards) {
    await fulfillReward(email, reward, weekKey);
  }

  await supabase
    .from("player_mystery_boxes")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", drop.id);

  const account = await ensureEcosystemAccount(email);
  await updateEcosystemProfile(email, {
    mystery_boxes_opened: account.mysteryBoxesOpened + 1,
  });

  return {
    drop: { ...drop, openedAt: new Date().toISOString() },
  };
}

export async function listWeeklyDropHistory(email: string, limit = 50): Promise<WeeklyDropRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_mystery_boxes")
    .select("*")
    .eq("email", normalizeEmail(email))
    .not("opened_at", "is", null)
    .order("opened_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}
