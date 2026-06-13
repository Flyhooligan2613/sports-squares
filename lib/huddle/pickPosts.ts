import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { listPickemGames } from "@/lib/pickem/db/games";
import { listUserPicksForContest } from "@/lib/pickem/db/picks";
import { getCurrentPickemContest } from "@/lib/pickem/db/contests";
import { getPickemPlayerStats } from "@/lib/pickem/db/stats";
import { savePickemPick } from "@/lib/pickem/db/picks";
import { getProfileBio } from "@/lib/platform/ecosystem/profileBio";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { getHuddlePlayerSummaries } from "@/lib/huddle/profiles";
import { listFollowingSet } from "@/lib/huddle/follows";
import { addCommunityReputation, computeReputationDelta } from "@/lib/huddle/reputation";
import type {
  HuddleFeedSort,
  HuddlePickPost,
  PickSnapshotItem,
} from "@/lib/huddle/types";
import type { PickemSide } from "@/lib/pickem/types";

interface PostRow {
  id: string;
  email: string;
  contest_id: string;
  week_label: string;
  picks_snapshot: PickSnapshotItem[];
  weekly_record: string | null;
  weekly_streak: number;
  tier_slug: string | null;
  bio_snapshot: string | null;
  like_count: number;
  copy_count: number;
  published_at: string;
}

function sundayPicksOnly<T extends { isMondayNight?: boolean }>(
  items: T[],
  isMondayNight: (item: T) => boolean
): T[] {
  return items.filter((item) => !isMondayNight(item));
}

export async function buildPickSnapshot(
  contestId: string,
  email: string
): Promise<PickSnapshotItem[]> {
  const [games, picks] = await Promise.all([
    listPickemGames(contestId),
    listUserPicksForContest(contestId, email),
  ]);

  const pickByGame = new Map(picks.map((p) => [p.gameId, p.pickedSide]));
  const sundayGames = games.filter((g) => !g.isMondayNight);

  return sundayGames
    .filter((g) => pickByGame.has(g.id))
    .map((g) => ({
      gameId: g.id,
      awayTeam: g.awayTeam,
      homeTeam: g.homeTeam,
      awayAbbr: g.awayAbbr,
      homeAbbr: g.homeAbbr,
      pickedSide: pickByGame.get(g.id) as PickemSide,
      kickoffAt: g.kickoffAt,
    }));
}

export async function publishPickPost(email: string): Promise<HuddlePickPost> {
  const normalized = normalizeEmail(email);
  const contest = await getCurrentPickemContest("nfl");
  if (!contest) throw new Error("No active Pick'em week to publish.");

  const picks = await buildPickSnapshot(contest.id, normalized);
  if (!picks.length) {
    throw new Error("Make at least one Sunday pick before publishing your card.");
  }

  const [stats, dashboard, bio] = await Promise.all([
    getPickemPlayerStats(normalized, "nfl", contest.seasonYear),
    getEcosystemDashboard(normalized),
    getProfileBio(normalized),
  ]);

  const weeklyRecord = `${stats.weeklyWins}-${stats.weeklyLosses}`;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("huddle_pick_posts")
    .upsert(
      {
        email: normalized,
        contest_id: contest.id,
        week_label: contest.label,
        picks_snapshot: picks,
        weekly_record: weeklyRecord,
        weekly_streak: stats.currentStreak,
        tier_slug: dashboard.tier.slug,
        bio_snapshot: bio,
        published_at: new Date().toISOString(),
      },
      { onConflict: "email,contest_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  const authorMap = await getHuddlePlayerSummaries([normalized]);
  const post = await mapPostRow(data as PostRow, normalized, new Set(), new Set(), authorMap);
  return post;
}

export async function copyPickPost(
  copierEmail: string,
  postId: string,
  entryTierCents = 1000
): Promise<{ copied: number; skippedMonday: boolean }> {
  const normalized = normalizeEmail(copierEmail);
  const supabase = getSupabaseAdmin();

  const { data: post, error } = await supabase
    .from("huddle_pick_posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (error || !post) throw new Error("Pick post not found.");
  if ((post.email as string) === normalized) {
    throw new Error("You cannot copy your own picks.");
  }

  const picks = (post.picks_snapshot as PickSnapshotItem[]) ?? [];
  let copied = 0;

  for (const snap of picks) {
    try {
      await savePickemPick({
        contestId: post.contest_id as string,
        gameId: snap.gameId,
        email: normalized,
        pickedSide: snap.pickedSide,
        entryTierCents,
      });
      copied += 1;
    } catch {
      /* locked or no entry — skip */
    }
  }

  await supabase.from("huddle_pick_copies").upsert(
    {
      post_id: postId,
      copier_email: normalized,
      contest_id: post.contest_id as string,
    },
    { onConflict: "post_id,copier_email" }
  );

  await supabase
    .from("huddle_pick_posts")
    .update({ copy_count: Number(post.copy_count ?? 0) + 1 })
    .eq("id", postId);

  await addCommunityReputation(
    post.email as string,
    computeReputationDelta({ type: "pick_copied" }),
    "pick_copied"
  );

  return { copied, skippedMonday: true };
}

export async function togglePickPostLike(
  email: string,
  postId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("huddle_pick_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("email", normalized)
    .maybeSingle();

  const { data: post } = await supabase
    .from("huddle_pick_posts")
    .select("like_count, email")
    .eq("id", postId)
    .maybeSingle();

  if (!post) throw new Error("Post not found.");

  let liked: boolean;
  let likeCount = Number(post.like_count ?? 0);

  if (existing) {
    await supabase.from("huddle_pick_post_likes").delete().eq("id", existing.id);
    liked = false;
    likeCount = Math.max(0, likeCount - 1);
  } else {
    await supabase.from("huddle_pick_post_likes").insert({
      post_id: postId,
      email: normalized,
    });
    liked = true;
    likeCount += 1;
    if ((post.email as string) !== normalized) {
      await addCommunityReputation(
        post.email as string,
        computeReputationDelta({ type: "pick_liked" }),
        "pick_liked"
      );
    }
  }

  await supabase.from("huddle_pick_posts").update({ like_count: likeCount }).eq("id", postId);
  return { liked, likeCount };
}

async function mapPostRow(
  row: PostRow,
  viewerEmail: string | null,
  likedSet: Set<string>,
  copiedSet: Set<string>,
  authorMap: Map<string, import("@/lib/huddle/types").HuddlePlayerSummary>
): Promise<HuddlePickPost> {
  const author = authorMap.get(normalizeEmail(row.email));
  if (!author) throw new Error("Author not found.");

  return {
    id: row.id,
    email: row.email,
    contestId: row.contest_id,
    weekLabel: row.week_label,
    picks: row.picks_snapshot ?? [],
    weeklyRecord: row.weekly_record,
    weeklyStreak: row.weekly_streak,
    tierSlug: (row.tier_slug as HuddlePickPost["tierSlug"]) ?? null,
    bioSnapshot: row.bio_snapshot,
    likeCount: row.like_count,
    copyCount: row.copy_count,
    publishedAt: row.published_at,
    author,
    likedByViewer: likedSet.has(row.id),
    copiedByViewer: copiedSet.has(row.id),
  };
}

export async function getHuddleFeed(input: {
  sort?: HuddleFeedSort;
  viewerEmail?: string | null;
  limit?: number;
}): Promise<{ posts: HuddlePickPost[]; pickOfWeek: HuddlePickPost | null }> {
  const sort = input.sort ?? "newest";
  const limit = input.limit ?? 30;
  const viewer = input.viewerEmail ? normalizeEmail(input.viewerEmail) : null;
  const supabase = getSupabaseAdmin();

  let query = supabase.from("huddle_pick_posts").select("*").limit(limit);

  if (sort === "newest") query = query.order("published_at", { ascending: false });
  if (sort === "most_copied") query = query.order("copy_count", { ascending: false });
  if (sort === "most_liked") query = query.order("like_count", { ascending: false });
  if (sort === "trending") {
    query = query.order("copy_count", { ascending: false }).order("like_count", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []) as PostRow[];

  if (sort === "following" && viewer) {
    const following = await listFollowingSet(viewer);
    rows = rows.filter((r) => following.has(r.email));
  }

  const postIds = rows.map((r) => r.id);
  const emails = rows.map((r) => r.email);

  const [authorMap, likedSet, copiedSet, pickOfWeekRow] = await Promise.all([
    getHuddlePlayerSummaries(emails),
    viewer && postIds.length
      ? supabase
          .from("huddle_pick_post_likes")
          .select("post_id")
          .eq("email", viewer)
          .in("post_id", postIds)
          .then((r) => new Set((r.data ?? []).map((x) => x.post_id as string)))
      : Promise.resolve(new Set<string>()),
    viewer && postIds.length
      ? supabase
          .from("huddle_pick_copies")
          .select("post_id")
          .eq("copier_email", viewer)
          .in("post_id", postIds)
          .then((r) => new Set((r.data ?? []).map((x) => x.post_id as string)))
      : Promise.resolve(new Set<string>()),
    supabase.from("huddle_pick_of_week").select("post_id").order("featured_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const posts = await Promise.all(
    rows.map((row) =>
      mapPostRow(row, viewer, likedSet as Set<string>, copiedSet as Set<string>, authorMap)
    )
  );

  let pickOfWeek: HuddlePickPost | null = null;
  if (pickOfWeekRow.data?.post_id) {
    const featured = rows.find((r) => r.id === pickOfWeekRow.data?.post_id) ??
      (await supabase
        .from("huddle_pick_posts")
        .select("*")
        .eq("id", pickOfWeekRow.data.post_id)
        .maybeSingle()).data as PostRow | null;

    if (featured) {
      pickOfWeek = await mapPostRow(
        featured as PostRow,
        viewer,
        likedSet as Set<string>,
        copiedSet as Set<string>,
        authorMap
      );
    }
  }

  if (!pickOfWeek && posts.length) {
    pickOfWeek = [...posts].sort((a, b) => b.copyCount - a.copyCount)[0] ?? null;
  }

  return { posts, pickOfWeek };
}

export async function getViewerPickPost(
  email: string,
  contestId?: string
): Promise<HuddlePickPost | null> {
  const normalized = normalizeEmail(email);
  const contest = contestId
    ? { id: contestId }
    : await getCurrentPickemContest("nfl");
  if (!contest) return null;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("huddle_pick_posts")
    .select("*")
    .eq("email", normalized)
    .eq("contest_id", contest.id)
    .maybeSingle();

  if (!data) return null;
  const authorMap = await getHuddlePlayerSummaries([normalized]);
  return mapPostRow(data as PostRow, normalized, new Set(), new Set(), authorMap);
}

export async function listPickPostsForEmail(
  email: string,
  viewerEmail?: string | null,
  limit = 20
): Promise<HuddlePickPost[]> {
  const normalized = normalizeEmail(email);
  const viewer = viewerEmail ? normalizeEmail(viewerEmail) : null;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("huddle_pick_posts")
    .select("*")
    .eq("email", normalized)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  const rows = (data ?? []) as PostRow[];
  if (!rows.length) return [];

  const postIds = rows.map((r) => r.id);
  const [authorMap, likedSet, copiedSet] = await Promise.all([
    getHuddlePlayerSummaries([normalized]),
    viewer
      ? supabase
          .from("huddle_pick_post_likes")
          .select("post_id")
          .eq("email", viewer)
          .in("post_id", postIds)
          .then((r) => new Set((r.data ?? []).map((x) => x.post_id as string)))
      : Promise.resolve(new Set<string>()),
    viewer
      ? supabase
          .from("huddle_pick_copies")
          .select("post_id")
          .eq("copier_email", viewer)
          .in("post_id", postIds)
          .then((r) => new Set((r.data ?? []).map((x) => x.post_id as string)))
      : Promise.resolve(new Set<string>()),
  ]);

  return Promise.all(
    rows.map((row) => mapPostRow(row, viewer, likedSet, copiedSet, authorMap))
  );
}
