import { TABLES } from "@/lib/database/config";
import { loadPlayerGameStats } from "@/lib/database/services/playerGameStats";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { buildPlatformPlayerStats } from "@/lib/platform/statsAdapter";
import type { PlatformPlayerStats } from "@/lib/platform/playerStatsTypes";
import { normalizeEmail } from "@/lib/player/statsCore";

interface ProfileRow {
  email: string;
  created_at: string;
  favorite_team: string | null;
}

async function loadProfileRow(email: string): Promise<ProfileRow | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .select("email, created_at, favorite_team")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

/** Unified cross-game stats for player profile expansion. */
export async function getPlatformPlayerStats(
  email: string
): Promise<PlatformPlayerStats | null> {
  const normalized = normalizeEmail(email);
  const [legacy, storedByGame, profile] = await Promise.all([
    getPlayerLegacy(normalized),
    loadPlayerGameStats(normalized),
    loadProfileRow(normalized),
  ]);

  if (!legacy && !profile && Object.keys(storedByGame).length === 0) {
    return null;
  }

  return buildPlatformPlayerStats({
    email: normalized,
    memberSince: profile?.created_at ?? legacy?.memberSince ?? null,
    favoriteTeam: profile?.favorite_team ?? null,
    legacyStats: legacy?.stats ?? null,
    storedByGame,
    achievements: legacy?.achievements.filter((a) => a.unlocked) ?? [],
  });
}
