import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getLeaderboards } from "@/lib/database/services/leaderboards";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import { buildPlayerSlug } from "@/lib/player/slug";
import { normalizeEmail } from "@/lib/player/statsCore";

export async function ensurePlayerProfile(
  email: string,
  displayName: string
): Promise<string | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: existing, error: lookupError } = await supabase
    .from(TABLES.playerProfiles)
    .select("slug")
    .eq("email", normalized)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing?.slug) return existing.slug as string;

  let candidate = buildPlayerSlug(displayName, normalized);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (attempt > 0) candidate = `${buildPlayerSlug(displayName, normalized)}-${attempt + 1}`;

    const { data: conflict } = await supabase
      .from(TABLES.playerProfiles)
      .select("email")
      .eq("slug", candidate)
      .maybeSingle();

    if (conflict?.email && conflict.email !== normalized) continue;

    const { error: insertError } = await supabase.from(TABLES.playerProfiles).insert({
      email: normalized,
      slug: candidate,
      display_name: displayName,
    });

    if (!insertError) return candidate;
    if (insertError.code === "23505") {
      const { data: raced } = await supabase
        .from(TABLES.playerProfiles)
        .select("slug")
        .eq("email", normalized)
        .maybeSingle();
      if (raced?.slug) return raced.slug as string;
    } else {
      throw insertError;
    }
  }

  throw new Error("Could not create player profile.");
}

export async function getEmailForPlayerSlug(slug: string): Promise<string | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const normalizedSlug = slug.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .select("email")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error) throw error;
  if (data?.email) return data.email as string;

  const { data: players, error: playersError } = await supabase
    .from(TABLES.players)
    .select("email, name")
    .not("email", "is", null);

  if (playersError) throw playersError;

  const seen = new Set<string>();
  for (const row of players ?? []) {
    const email = (row.email as string | null)?.trim();
    if (!email) continue;
    const normalized = normalizeEmail(email);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const displayName =
      (row.name as string | null)?.split(" ")[0] ??
      normalized.split("@")[0] ??
      "Player";
    const candidate = buildPlayerSlug(displayName, normalized);
    if (candidate === normalizedSlug) {
      await ensurePlayerProfile(normalized, displayName);
      return normalized;
    }
  }

  return null;
}

export async function getPublicPlayerProfile(
  slug: string,
  viewerEmail?: string | null
): Promise<PublicPlayerProfile | null> {
  const email = await getEmailForPlayerSlug(slug);
  if (!email) return null;

  const legacy = await getPlayerLegacy(email);
  if (!legacy) return null;

  const ensuredSlug = (await ensurePlayerProfile(email, legacy.displayName)) ?? slug;
  const leaderboards = await getLeaderboards(email);

  const ranks =
    leaderboards?.boards
      .filter((board) => board.viewerRank != null)
      .map((board) => ({
        title: board.title,
        rank: board.viewerRank as number,
      })) ?? [];

  const normalizedViewer = viewerEmail?.trim()
    ? normalizeEmail(viewerEmail)
    : null;

  return {
    slug: ensuredSlug,
    displayName: legacy.displayName,
    memberSince: legacy.memberSince,
    headline: legacy.headline,
    stats: legacy.stats,
    achievements: legacy.achievements.filter((a) => a.unlocked),
    ranks,
    isOwner: normalizedViewer === email,
  };
}
