import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getEmailForPlayerSlug } from "@/lib/database/services/playerProfiles";
import { getHuddlePlayerSummaries } from "@/lib/huddle/profiles";
import { listPickPostsForEmail } from "@/lib/huddle/pickPosts";
import { getPlayerWinHighlights } from "@/lib/huddle/winHighlights";
import { isFollowing } from "@/lib/huddle/follows";
import type { HuddlePickPost, HuddlePlayerSummary } from "@/lib/huddle/types";
import type { ProfileWinHighlight } from "@/lib/huddle/winHighlights";
import type { PlayerAchievement } from "@/lib/player/legacyTypes";

export type ProfileFeedItem =
  | {
      type: "win";
      id: string;
      at: string;
      win: ProfileWinHighlight;
    }
  | {
      type: "pick_post";
      id: string;
      at: string;
      post: HuddlePickPost;
    }
  | {
      type: "achievement";
      id: string;
      at: string;
      achievement: PlayerAchievement;
    };

export interface PlayerSocialProfile {
  slug: string;
  email: string;
  summary: HuddlePlayerSummary;
  followerCount: number;
  followingCount: number;
  pickPostCount: number;
  winCount: number;
  viewerIsFollowing: boolean;
  followers: HuddlePlayerSummary[];
  following: HuddlePlayerSummary[];
  pickPosts: HuddlePickPost[];
  winHighlights: ProfileWinHighlight[];
  feed: ProfileFeedItem[];
}

async function listFollowEmails(email: string, direction: "followers" | "following"): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const column = direction === "followers" ? "following_email" : "follower_email";
  const selectColumn = direction === "followers" ? "follower_email" : "following_email";

  const { data, error } = await supabase
    .from("huddle_player_follows")
    .select(selectColumn)
    .eq(column, normalized)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map((r) => r[selectColumn as keyof typeof r] as string);
}

export async function getPlayerSocialProfile(
  slug: string,
  viewerEmail?: string | null
): Promise<PlayerSocialProfile | null> {
  const email = await getEmailForPlayerSlug(slug);
  if (!email) return null;

  const normalized = normalizeEmail(email);
  const viewer = viewerEmail ? normalizeEmail(viewerEmail) : null;

  const [summary, pickPosts, winHighlights, followerEmails, followingEmails, viewerIsFollowing] =
    await Promise.all([
      getHuddlePlayerSummaries([normalized]).then((m) => m.get(normalized)!),
      listPickPostsForEmail(normalized, viewer, 20),
      getPlayerWinHighlights(normalized, 30),
      listFollowEmails(normalized, "followers"),
      listFollowEmails(normalized, "following"),
      viewer && viewer !== normalized
        ? isFollowing(viewer, normalized)
        : Promise.resolve(false),
    ]);

  const relatedEmails = Array.from(
    new Set([...followerEmails, ...followingEmails])
  );
  const relatedMap = await getHuddlePlayerSummaries(relatedEmails);

  const followers = followerEmails
    .map((e) => relatedMap.get(normalizeEmail(e)))
    .filter((p): p is HuddlePlayerSummary => Boolean(p));
  const following = followingEmails
    .map((e) => relatedMap.get(normalizeEmail(e)))
    .filter((p): p is HuddlePlayerSummary => Boolean(p));

  const feed: ProfileFeedItem[] = [
    ...winHighlights.map((win) => ({
      type: "win" as const,
      id: `win-${win.id}`,
      at: win.wonAt,
      win,
    })),
    ...pickPosts.map((post) => ({
      type: "pick_post" as const,
      id: `post-${post.id}`,
      at: post.publishedAt,
      post,
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return {
    slug,
    email: normalized,
    summary,
    followerCount: summary.followerCount,
    followingCount: summary.followingCount,
    pickPostCount: pickPosts.length,
    winCount: winHighlights.length,
    viewerIsFollowing,
    followers,
    following,
    pickPosts,
    winHighlights,
    feed,
  };
}
