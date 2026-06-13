import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import { getTierVisual, computeTierLevel } from "@/lib/platform/ecosystem/tierVisuals";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { getPickemPlayerStats } from "@/lib/pickem/db/stats";
import { getProfileBio } from "@/lib/platform/ecosystem/profileBio";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import type { HuddlePlayerSummary, CreatorLevel } from "@/lib/huddle/types";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

export async function getHuddlePlayerSummary(email: string): Promise<HuddlePlayerSummary> {
  const normalized = normalizeEmail(email);
  await ensurePlayerProfile(normalized, normalized.split("@")[0] ?? "Player");

  const [identity, dashboard, pickemStats, bio, supabaseProfile] = await Promise.all([
    getPlayerPublicIdentity(normalized),
    getEcosystemDashboard(normalized).catch(() => null),
    getPickemPlayerStats(normalized, "nfl", new Date().getFullYear()).catch(() => null),
    getProfileBio(normalized).catch(() => null),
    getSupabaseAdmin()
      .from("player_profiles")
      .select(
        "slug, avatar_emoji, community_reputation, creator_level, is_community_verified, follower_count, following_count, favorite_team, created_at"
      )
      .eq("email", normalized)
      .maybeSingle(),
  ]);

  const profile = supabaseProfile.data;
  const tierSlug = (dashboard?.tier.slug ?? "rookie") as PlayerTierSlug;
  const visual = getTierVisual(tierSlug);
  const tierLevel = dashboard
    ? computeTierLevel(
        dashboard.account.lifetimeTierCredits,
        dashboard.tier.minLifetimeCredits
      )
    : 1;

  return {
    email: normalized,
    slug: (profile?.slug as string) ?? normalized.split("@")[0] ?? "player",
    username: identity.publicLabel,
    playerId: dashboard?.account.playerId ?? null,
    avatarEmoji: (profile?.avatar_emoji as string) ?? DEFAULT_AVATAR,
    tierSlug,
    tierName: dashboard?.tier.displayName ?? tierSlug,
    tierLevel,
    communityReputation: Number(profile?.community_reputation ?? 0),
    creatorLevel: (profile?.creator_level as CreatorLevel) ?? "community_rookie",
    isVerified: Boolean(profile?.is_community_verified),
    followerCount: Number(profile?.follower_count ?? 0),
    followingCount: Number(profile?.following_count ?? 0),
    pickAccuracyPct: pickemStats?.pickAccuracyPct ?? null,
    currentStreak: pickemStats?.currentStreak ?? 0,
    longestStreak: pickemStats?.longestStreak ?? 0,
    bio: bio ?? null,
    favoriteTeam: (profile?.favorite_team as string | null) ?? null,
    memberSince: (profile?.created_at as string) ?? new Date().toISOString(),
  };
}

export async function getHuddlePlayerSummaries(
  emails: string[]
): Promise<Map<string, HuddlePlayerSummary>> {
  const map = new Map<string, HuddlePlayerSummary>();
  const unique = Array.from(new Set(emails.map(normalizeEmail)));
  await Promise.all(
    unique.map(async (email) => {
      try {
        map.set(email, await getHuddlePlayerSummary(email));
      } catch {
        /* skip */
      }
    })
  );
  return map;
}
