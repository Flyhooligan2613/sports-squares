import type { CreatorLevel } from "@/lib/huddle/types";

export function reputationToCreatorLevel(reputation: number, isVerified: boolean): CreatorLevel {
  if (reputation >= 25000) return "hall_of_fame_creator";
  if (reputation >= 12000) return "legend_creator";
  if (reputation >= 6000) return "elite_creator";
  if (isVerified || reputation >= 3000) return "verified_creator";
  if (reputation >= 1500) return "trusted_picker";
  if (reputation >= 500) return "rising_creator";
  return "community_rookie";
}

export async function addCommunityReputation(
  email: string,
  delta: number,
  reason: string
): Promise<number> {
  const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
  const { normalizeEmail } = await import("@/lib/player/statsCore");
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: row } = await supabase
    .from("player_profiles")
    .select("community_reputation, is_community_verified")
    .eq("email", normalized)
    .maybeSingle();

  const current = Number(row?.community_reputation ?? 0);
  const next = Math.max(0, current + delta);
  const creatorLevel = reputationToCreatorLevel(
    next,
    Boolean(row?.is_community_verified)
  );

  await supabase
    .from("player_profiles")
    .update({
      community_reputation: next,
      creator_level: creatorLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalized);

  void reason;
  return next;
}

export function computeReputationDelta(event: {
  type:
    | "pick_liked"
    | "pick_copied"
    | "new_follower"
    | "weekly_win"
    | "perfect_week"
    | "achievement"
    | "referral";
}): number {
  switch (event.type) {
    case "pick_liked":
      return 2;
    case "pick_copied":
      return 5;
    case "new_follower":
      return 10;
    case "weekly_win":
      return 25;
    case "perfect_week":
      return 100;
    case "achievement":
      return 15;
    case "referral":
      return 20;
    default:
      return 0;
  }
}
