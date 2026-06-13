import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  AnnouncementAudience,
  PlatformAnnouncement,
  ViewerContext,
} from "@/lib/platform/announcements/types";

const VIP_EARNINGS_CENTS = 50_000;
const NEW_PLAYER_DAYS = 14;
const ACTIVE_POOL_STATUSES = ["open", "locked", "numbers-drawn"];

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
      hasActiveBoards: false,
      hasNoPurchases: true,
      region: input.region ?? null,
    };
  }

  const supabase = getSupabaseAdmin();

  const [playersRes, pickemRes, profileRes, pickemStatsRes, purchasesRes] = await Promise.all([
    supabase.from("players").select("id, created_at, pool_id").ilike("email", email),
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
    supabase
      .from("purchases")
      .select("id")
      .eq("email", email)
      .eq("status", "fulfilled")
      .limit(1),
  ]);

  const isSquaresPlayer =
    (playersRes.data?.length ?? 0) > 0 || (purchasesRes.data?.length ?? 0) > 0;
  const isPickemPlayer = (pickemRes.data?.length ?? 0) > 0;
  const isReturningPlayer = isSquaresPlayer || isPickemPlayer;
  const hasNoPurchases = !isReturningPlayer;

  const poolIds = Array.from(new Set((playersRes.data ?? []).map((row) => row.pool_id as string)));
  let hasActiveBoards = false;

  if (poolIds.length) {
    const { count } = await supabase
      .from("pools")
      .select("id", { count: "exact", head: true })
      .in("id", poolIds)
      .in("status", ACTIVE_POOL_STATUSES);

    hasActiveBoards = (count ?? 0) > 0;
  }

  const memberSince =
    (profileRes.data?.created_at as string | undefined) ??
    (playersRes.data?.[0]?.created_at as string | undefined) ??
    null;

  const memberAgeMs = memberSince
    ? Date.now() - new Date(memberSince).getTime()
    : Number.POSITIVE_INFINITY;
  const isNewPlayer =
    !isReturningPlayer || memberAgeMs <= NEW_PLAYER_DAYS * 24 * 60 * 60 * 1000;

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
    hasActiveBoards,
    hasNoPurchases,
    region: input.region ?? null,
  };
}

function matchesEmailList(announcement: PlatformAnnouncement, viewer: ViewerContext): boolean {
  if (!announcement.audienceEmails.length) return false;
  if (!viewer.email) return false;
  const normalized = viewer.email.toLowerCase();
  return announcement.audienceEmails.some((entry) => entry.trim().toLowerCase() === normalized);
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
    case "active_boards_players":
      return !viewer.isAnonymous && viewer.hasActiveBoards;
    case "no_purchases_players":
      return !viewer.isAnonymous && viewer.hasNoPurchases;
    case "email_list":
      return matchesEmailList(announcement, viewer);
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
