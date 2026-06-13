import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PlayerTierSlug, TierDefinition } from "@/lib/platform/ecosystem/types";

export async function listTierDefinitions(): Promise<TierDefinition[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ecosystem_tier_definitions")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    slug: row.slug as PlayerTierSlug,
    displayName: row.display_name as string,
    sortOrder: row.sort_order as number,
    minLifetimeCredits: Number(row.min_lifetime_credits),
    benefits: (row.benefits as string[]) ?? [],
    profileFrameId: (row.profile_frame_id as string | null) ?? null,
  }));
}

export function resolveTierForCredits(
  tiers: TierDefinition[],
  lifetimeCredits: number
): { current: TierDefinition; next: TierDefinition | null; creditsToNext: number; progressPct: number } {
  const sorted = [...tiers].sort((a, b) => a.minLifetimeCredits - b.minLifetimeCredits);
  let current = sorted[0]!;
  let next: TierDefinition | null = null;

  for (const tier of sorted) {
    if (lifetimeCredits >= tier.minLifetimeCredits) current = tier;
  }

  const currentIndex = sorted.findIndex((t) => t.slug === current.slug);
  next = sorted[currentIndex + 1] ?? null;

  if (!next) {
    return { current, next: null, creditsToNext: 0, progressPct: 100 };
  }

  const span = next.minLifetimeCredits - current.minLifetimeCredits;
  const earned = lifetimeCredits - current.minLifetimeCredits;
  const progressPct = span > 0 ? Math.min(100, Math.round((earned / span) * 100)) : 100;

  return {
    current,
    next,
    creditsToNext: Math.max(0, next.minLifetimeCredits - lifetimeCredits),
    progressPct,
  };
}

export async function syncTierForAccount(email: string, lifetimeCredits: number): Promise<PlayerTierSlug> {
  const tiers = await listTierDefinitions();
  const { current } = resolveTierForCredits(tiers, lifetimeCredits);
  const supabase = getSupabaseAdmin();

  await supabase
    .from("player_profiles")
    .update({
      tier_slug: current.slug,
      profile_frame_id: current.profileFrameId,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  return current.slug;
}
