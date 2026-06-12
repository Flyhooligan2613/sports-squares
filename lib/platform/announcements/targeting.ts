import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  AnnouncementAudience,
  PlatformAnnouncement,
  ViewerContext,
} from "@/lib/platform/announcements/types";

const VIP_EARNINGS_CENTS = 50_000;
const NEW_PLAYER_DAYS = 14;

export function buildViewerKey(email: string | null, anonymousId: string | null): string {
  if (email) return normalizeEmail(email);
  return anonymousId ? `anon:${anonymousId}` : "anon:guest";
}

export async function resolveViewerContext(input: {
  email: string | null;
  anonymousId?: string | null;
  region?: string | null;
}): Promise<ViewerContext> {
  const email = input.email ? normalizeEmail(input.email) : null;
  const viewerKey = buildViewerKey(email, input.anonymousId ?? null);
  const isAnonymous = !email;

  if (isAnonymous) {
    return {
      email: null,
      viewerKey,
      isAnonymous: true,
      isNewPlayer: false,
      isReturningPlayer: false,
      isSquaresPlayer: false,
      isPickemPlayer: false,
      isVipPlayer: false,
      region: input.region ?? null,
    };
  }

  const supabase = getSupabaseAdmin();

  const [playersRes, pickemRes, profileRes, pickemStatsRes] = await Promise.all([
    supabase.from("players").select("id, created_at").ilike("email", email).limit(1),
    supabase
      .from("pickem_entry_purchases")
      .select("id")
      .eq("email", email)
      .eq("status", "paid")
      .limit(1),
    supabase.from("player_profiles").select("created_at").eq("email", email).maybeSingle(),
    supabase
      .from("pickem_player_stats")
      .select("lifetime_earnings_cents")
      .eq("email", email)
      .order("lifetime_earnings_cents", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const isSquaresPlayer = (playersRes.data?.length ?? 0) > 0;
  const isPickemPlayer = (pickemRes.data?.length ?? 0) > 0;
  const isReturningPlayer = isSquaresPlayer || isPickemPlayer;

  const memberSince =
    (profileRes.data?.created_at as string | undefined) ??
    (playersRes.data?.[0]?.created_at as string | undefined) ??
    null;

  const memberAgeMs = memberSince
    ? Date.now() - new Date(memberSince).getTime()
    : Number.POSITIVE_INFINITY;
  const isNewPlayer =
    !isReturningPlayer ||
    memberAgeMs <= NEW_PLAYER_DAYS * 24 * 60 * 60 * 1000;

  const pickemEarnings = (pickemStatsRes.data?.lifetime_earnings_cents as number) ?? 0;
  const isVipPlayer = pickemEarnings >= VIP_EARNINGS_CENTS;

  return {
    email,
    viewerKey,
    isAnonymous,
    isNewPlayer,
    isReturningPlayer,
    isSquaresPlayer,
    isPickemPlayer,
    isVipPlayer,
    region: input.region ?? null,
  };
}

function matchesAudience(
  announcement: PlatformAnnouncement,
  viewer: ViewerContext
): boolean {
  switch (announcement.audience) {
    case "all":
      return true;
    case "anonymous":
      return viewer.isAnonymous;
    case "new_players":
      return !viewer.isAnonymous && viewer.isNewPlayer;
    case "returning_players":
      return !viewer.isAnonymous && viewer.isReturningPlayer;
    case "squares_players":
      return !viewer.isAnonymous && viewer.isSquaresPlayer;
    case "pickem_players":
      return !viewer.isAnonymous && viewer.isPickemPlayer;
    case "vip_players":
      return !viewer.isAnonymous && viewer.isVipPlayer;
    default:
      return true;
  }
}

function matchesRegion(
  announcement: PlatformAnnouncement,
  viewer: ViewerContext
): boolean {
  if (!announcement.audienceRegions.length) return true;
  if (!viewer.region) return false;
  const normalized = viewer.region.toUpperCase();
  return announcement.audienceRegions.some(
    (r) => r.toUpperCase() === normalized || normalized.endsWith(`-${r.toUpperCase()}`)
  );
}

export function filterAnnouncementsForViewer(
  announcements: PlatformAnnouncement[],
  viewer: ViewerContext
): PlatformAnnouncement[] {
  return announcements.filter(
    (item) => matchesAudience(item, viewer) && matchesRegion(item, viewer)
  );
}
