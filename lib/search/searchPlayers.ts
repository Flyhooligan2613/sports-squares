import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";
import type { PlayerSearchResult } from "@/lib/search/types";

function sanitizeSearchTerm(raw: string): string {
  return raw
    .trim()
    .replace(/^@+/, "")
    .replace(/[%_,]/g, "")
    .slice(0, 48);
}

export async function searchPlayers(query: string, limit = 8): Promise<PlayerSearchResult[]> {
  const term = sanitizeSearchTerm(query);
  if (term.length < 2) return [];
  if (!isSupabaseAdminConfigured()) return [];

  const pattern = `%${term}%`;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .select("slug, display_name, username, avatar_emoji, follower_count, player_id")
    .or(
      [
        `slug.ilike.${pattern}`,
        `display_name.ilike.${pattern}`,
        `username.ilike.${pattern}`,
        `player_id.ilike.${pattern}`,
      ].join(",")
    )
    .order("follower_count", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    slug: row.slug as string,
    displayName: (row.display_name as string) ?? (row.slug as string),
    username: (row.username as string | null) ?? null,
    playerId: (row.player_id as string | null) ?? null,
    avatarEmoji: (row.avatar_emoji as string | null) ?? DEFAULT_AVATAR,
    followerCount: Number(row.follower_count ?? 0),
  }));
}
