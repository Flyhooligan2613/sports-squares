import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";
import { normalizeEmail, displayNameFromEmail } from "@/lib/player/statsCore";
import { buildPlayerSlug } from "@/lib/player/slug";
import type { EcosystemAccount, PlayerTierSlug } from "@/lib/platform/ecosystem/types";

function generatePlayerId(label: string): string {
  const base = label.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "PLAYER";
  const suffix = String(Math.floor(Math.random() * 900) + 100);
  return `${base}${suffix}`;
}

export async function assignPlayerIdFromUsername(username: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  let playerId = generatePlayerId(username);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data: conflict } = await supabase
      .from(TABLES.playerProfiles)
      .select("email")
      .eq("player_id", playerId)
      .maybeSingle();
    if (!conflict) return playerId;
    playerId = generatePlayerId(username);
  }
  throw new Error("Could not assign Player ID.");
}

function mapAccount(row: Record<string, unknown>): EcosystemAccount {
  return {
    email: row.email as string,
    playerId: (row.player_id as string) ?? "",
    username: (row.username as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    displayName: row.display_name as string,
    slug: row.slug as string,
    tierSlug: (row.tier_slug as PlayerTierSlug) ?? "rookie",
    tierLevel: Number(row.tier_level ?? 1),
    lifetimeTierCredits: Number(row.lifetime_tier_credits ?? 0),
    availableTierCredits: Number(row.available_tier_credits ?? 0),
    weeklyTierCredits: Number(row.weekly_tier_credits ?? 0),
    weeklyGameplayCents: Number(row.weekly_gameplay_cents ?? 0),
    weeklyPeriodKey: (row.weekly_period_key as string | null) ?? null,
    squareCreditsCents: Number(row.square_credits_cents ?? 0),
    pickemCreditsCents: Number(row.pickem_credits_cents ?? 0),
    qualifiedReferrals: Number(row.qualified_referrals ?? 0),
    totalReferrals: Number(row.total_referrals ?? 0),
    mysteryBoxesOpened: Number(row.mystery_boxes_opened ?? 0),
    rewardsRedeemed: Number(row.rewards_redeemed ?? 0),
    profileFrameId: (row.profile_frame_id as string | null) ?? null,
    referredByCode: (row.referred_by_code as string | null) ?? null,
    memberSince: row.created_at as string,
  };
}

export function hashReferralFingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

export async function getEcosystemAccount(email: string): Promise<EcosystemAccount | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapAccount(data as Record<string, unknown>);
}

export async function ensureEcosystemAccount(
  email: string,
  displayName?: string
): Promise<EcosystemAccount> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();
  const name = displayName?.trim() || displayNameFromEmail(normalized);

  const existing = await getEcosystemAccount(normalized);
  if (existing?.playerId) return existing;

  let playerId = generatePlayerId(name);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data: conflict } = await supabase
      .from(TABLES.playerProfiles)
      .select("email")
      .eq("player_id", playerId)
      .maybeSingle();
    if (!conflict) break;
    playerId = generatePlayerId(name);
  }

  const slug =
    existing?.slug ??
    (await (async () => {
      let candidate = buildPlayerSlug(name, normalized);
      for (let i = 0; i < 6; i += 1) {
        const { data: slugConflict } = await supabase
          .from(TABLES.playerProfiles)
          .select("email")
          .eq("slug", candidate)
          .maybeSingle();
        if (!slugConflict || slugConflict.email === normalized) return candidate;
        candidate = `${buildPlayerSlug(name, normalized)}-${i + 2}`;
      }
      return candidate;
    })());

  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .upsert(
      {
        email: normalized,
        slug,
        display_name: name,
        player_id: playerId,
        username: existing?.username ?? slug.replace(/-/g, "").slice(0, 20),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapAccount(data as Record<string, unknown>);
}

export async function updateEcosystemProfile(
  email: string,
  patch: Record<string, unknown>
): Promise<void> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("email", normalized)
    .select("email");

  if (error) throw error;
  if (data?.length) return;

  await ensureEcosystemAccount(normalized);

  const { data: retry, error: retryError } = await supabase
    .from(TABLES.playerProfiles)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("email", normalized)
    .select("email");

  if (retryError) throw retryError;
  if (!retry?.length) {
    throw new Error("Could not update player profile.");
  }
}
