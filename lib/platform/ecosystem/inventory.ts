import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { updateEcosystemProfile } from "@/lib/platform/ecosystem/account";

export type InventoryItemType =
  | "square_credit"
  | "pickem_entry"
  | "reward_token"
  | "mystery_box"
  | "coupon"
  | "tier_reward"
  | "merch_coupon"
  | "giveaway_ticket"
  | "cosmetic"
  | "badge"
  | "referral_bonus"
  | "promo_credit"
  | "survivor_shield";

export interface InventoryItem {
  id: string;
  itemType: InventoryItemType;
  title: string;
  quantity: number;
  valueCents: number | null;
  metadata: Record<string, unknown>;
  source: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as string,
    itemType: row.item_type as InventoryItemType,
    title: row.title as string,
    quantity: Number(row.quantity ?? 1),
    valueCents: row.value_cents != null ? Number(row.value_cents) : null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    source: row.source as string,
    status: row.status as string,
    expiresAt: (row.expires_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function addInventoryItem(input: {
  email: string;
  itemType: InventoryItemType;
  title: string;
  quantity?: number;
  valueCents?: number | null;
  metadata?: Record<string, unknown>;
  source: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("player_inventory").insert({
    email: normalizeEmail(input.email),
    item_type: input.itemType,
    title: input.title,
    quantity: input.quantity ?? 1,
    value_cents: input.valueCents ?? null,
    metadata: input.metadata ?? {},
    source: input.source,
    status: "active",
  });
}

export async function listInventory(email: string, status = "active"): Promise<InventoryItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_inventory")
    .select("*")
    .eq("email", normalizeEmail(email))
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function getInventorySummary(email: string) {
  const items = await listInventory(email);
  const byType: Record<string, number> = {};
  for (const item of items) {
    byType[item.itemType] = (byType[item.itemType] ?? 0) + item.quantity;
  }
  return { items, counts: byType, totalItems: items.reduce((s, i) => s + i.quantity, 0) };
}

export async function markInventoryUsed(id: string, email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("player_inventory")
    .update({ status: "used" })
    .eq("id", id)
    .eq("email", normalizeEmail(email));
}

export async function incrementLifetimeRewards(email: string, amount: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("player_profiles")
    .select("lifetime_rewards_earned")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  await updateEcosystemProfile(email, {
    lifetime_rewards_earned: Number(data?.lifetime_rewards_earned ?? 0) + amount,
  });
}
