import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import { ensureEcosystemAccount, updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { addInventoryItem } from "@/lib/platform/ecosystem/inventory";
import { addSquareCredits, earnTierCredits } from "@/lib/platform/ecosystem/credits";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

function isoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const MYSTERY_POOLS: Record<PlayerTierSlug, { credits: number[]; squareCents: number[]; labels: string[] }> = {
  rookie: { credits: [25, 50, 75], squareCents: [100, 200], labels: ["Tier Credits", "Square Credit"] },
  contender: { credits: [50, 100, 150], squareCents: [200, 300], labels: ["Tier Credits", "Bonus Credit"] },
  "all-star": { credits: [100, 150, 250], squareCents: [300, 500], labels: ["Tier Credits", "Board Credit"] },
  champion: { credits: [150, 250, 400], squareCents: [500, 750], labels: ["Premium Credits", "Board Credit"] },
  elite: { credits: [250, 400, 600], squareCents: [750, 1000], labels: ["Elite Credits", "VIP Credit"] },
  legend: { credits: [400, 600, 900], squareCents: [1000, 1500], labels: ["Legend Credits", "Jackpot Credit"] },
  "hall-of-fame": { credits: [600, 900, 1200], squareCents: [1500, 2000], labels: ["HOF Credits", "Mega Credit"] },
  immortal: { credits: [900, 1200, 2000], squareCents: [2000, 3000], labels: ["Immortal Credits", "Ultra Credit"] },
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export async function ensureWeeklyMysteryBox(email: string): Promise<boolean> {
  const account = await ensureEcosystemAccount(email);
  const config = await getAdminConfig("mystery_box");
  const weekKey = isoWeekKey();

  if (account.weeklyGameplayCents < config.minWeeklyGameplayCents) return false;

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("player_mystery_boxes")
    .select("id, opened_at")
    .eq("email", normalizeEmail(email))
    .eq("week_key", weekKey)
    .maybeSingle();

  if (existing) return !existing.opened_at;

  const pool = MYSTERY_POOLS[account.tierSlug] ?? MYSTERY_POOLS.rookie;
  const rewards = [
    {
      type: "tier_credits",
      amount: pickRandom(pool.credits),
      label: pickRandom(pool.labels),
    },
  ];

  if (Math.random() > 0.4) {
    rewards.push({
      type: "square_credit",
      amount: pickRandom(pool.squareCents),
      label: "Square Credit",
    });
  }

  await supabase.from("player_mystery_boxes").insert({
    email: normalizeEmail(email),
    week_key: weekKey,
    tier_slug: account.tierSlug,
    rewards,
  });

  return true;
}

export async function openMysteryBox(email: string): Promise<{ rewards: Record<string, unknown>[] }> {
  const weekKey = isoWeekKey();
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data: box, error } = await supabase
    .from("player_mystery_boxes")
    .select("*")
    .eq("email", normalized)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (error) throw error;
  if (!box) throw new Error("No Mystery Box available this week.");
  if (box.opened_at) throw new Error("Mystery Box already opened.");

  const rewards = (box.rewards as Record<string, unknown>[]) ?? [];

  for (const reward of rewards) {
    if (reward.type === "tier_credits") {
      await earnTierCredits({
        email,
        amount: Number(reward.amount),
        source: "mystery_box",
      });
      await addInventoryItem({
        email,
        itemType: "tier_reward",
        title: String(reward.label ?? "Tier Credits"),
        quantity: Number(reward.amount) || 1,
        source: "mystery_box",
      });
    }
    if (reward.type === "square_credit") {
      const amountCents = Number(reward.amount);
      await addSquareCredits({
        email,
        amountCents,
        source: "mystery_box",
      });
      await addInventoryItem({
        email,
        itemType: "square_credit",
        title: String(reward.label ?? "Square Credit"),
        valueCents: amountCents,
        source: "mystery_box",
      });
    }
  }

  await addInventoryItem({
    email,
    itemType: "mystery_box",
    title: "Weekly Mystery Box",
    source: "mystery_box",
    metadata: { weekKey },
  });

  await supabase
    .from("player_mystery_boxes")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", box.id as string);

  const account = await ensureEcosystemAccount(email);
  await updateEcosystemProfile(email, {
    mystery_boxes_opened: account.mysteryBoxesOpened + 1,
  });

  return { rewards };
}
