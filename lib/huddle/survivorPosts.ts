import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getProfileBio } from "@/lib/platform/ecosystem/profileBio";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { getHuddlePlayerSummaries } from "@/lib/huddle/profiles";
import { listFollowingSet } from "@/lib/huddle/follows";
import { addCommunityReputation, computeReputationDelta } from "@/lib/huddle/reputation";
import { ensureSurvivorSeason } from "@/lib/survivor/engine/seedSeason";
import { getSurvivorEntry } from "@/lib/survivor/db/entries";
import { getPickForWeek } from "@/lib/survivor/db/picks";
import { getSurvivorWeek } from "@/lib/survivor/db/weeks";
import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import { espnMetaForSurvivorWeekNumber } from "@/lib/survivor/nflWeeks";
import type { HuddleFeedSort, HuddleSurvivorPost } from "@/lib/huddle/types";

const TABLE = "huddle_survivor_posts";

interface SurvivorPostRow {
  id: string;
  email: string;
  entry_id: string;
  week_id: string;
  league_id: string;
  week_label: string;
  team_abbr: string;
  team_name: string;
  weeks_survived: number;
  shield_available: boolean;
  tier_slug: string | null;
  bio_snapshot: string | null;
  like_count: number;
  published_at: string;
}

async function mapSurvivorRow(
  row: SurvivorPostRow,
  viewerEmail: string | null,
  likedSet: Set<string>,
  authorMap: Map<string, import("@/lib/huddle/types").HuddlePlayerSummary>
): Promise<HuddleSurvivorPost> {
  const author = authorMap.get(normalizeEmail(row.email));
  if (!author) throw new Error("Author not found.");

  return {
    id: row.id,
    email: row.email,
    entryId: row.entry_id,
    weekId: row.week_id,
    leagueId: row.league_id,
    weekLabel: row.week_label,
    teamAbbr: row.team_abbr,
    teamName: row.team_name,
    weeksSurvived: row.weeks_survived,
    shieldAvailable: row.shield_available,
    tierSlug: (row.tier_slug as HuddleSurvivorPost["tierSlug"]) ?? null,
    bioSnapshot: row.bio_snapshot,
    likeCount: row.like_count,
    publishedAt: row.published_at,
    author,
    likedByViewer: likedSet.has(row.id),
  };
}

export async function publishSurvivorHuddlePost(email: string): Promise<HuddleSurvivorPost> {
  const normalized = normalizeEmail(email);
  const { leagueId, seasonYear } = await ensureSurvivorSeason();
  const entry = await getSurvivorEntry(leagueId, normalized);

  if (!entry) {
    throw new Error("Join Survivor X before sharing to The Huddle.");
  }

  const supabase = getSupabaseAdmin();
  const { data: leagueRow } = await supabase
    .from("survivor_leagues")
    .select("current_week")
    .eq("id", leagueId)
    .maybeSingle();

  const weekNumber = (leagueRow?.current_week as number) ?? 1;
  const currentWeek = await getSurvivorWeek(leagueId, weekNumber);
  if (!currentWeek) throw new Error("Survivor week not found.");

  const pick = await getPickForWeek(entry.id, currentWeek.id);
  if (!pick) {
    throw new Error("Lock your Survivor pick before sharing.");
  }

  const espnMeta = espnMetaForSurvivorWeekNumber(currentWeek.weekNumber);
  const { games } = await fetchPickemScoreboard({
    sport: "nfl",
    week: espnMeta.espnWeekNumber,
    seasonType: espnMeta.seasonType,
    seasonYear,
  });

  const game = games.find((g) => g.espnGameId === pick.espnGameId);
  if (!game) throw new Error("Could not verify game kickoff.");

  if (new Date(game.kickoffAt).getTime() > Date.now()) {
    throw new Error("Share after kickoff — your pick stays hidden until then.");
  }

  const [dashboard, bio] = await Promise.all([
    getEcosystemDashboard(normalized),
    getProfileBio(normalized),
  ]);

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        email: normalized,
        entry_id: entry.id,
        week_id: currentWeek.id,
        league_id: leagueId,
        week_label: currentWeek.label,
        team_abbr: pick.teamAbbr,
        team_name: pick.teamName,
        weeks_survived: entry.weeksSurvived,
        shield_available: entry.shieldAvailable,
        tier_slug: dashboard.tier.slug,
        bio_snapshot: bio,
        published_at: new Date().toISOString(),
      },
      { onConflict: "entry_id,week_id" }
    )
    .select("*")
    .single();

  if (error) throw error;

  const authorMap = await getHuddlePlayerSummaries([normalized]);
  return mapSurvivorRow(data as SurvivorPostRow, normalized, new Set(), authorMap);
}

export async function toggleSurvivorPostLike(
  email: string,
  postId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("huddle_survivor_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("email", normalized)
    .maybeSingle();

  const { data: post } = await supabase
    .from(TABLE)
    .select("like_count, email")
    .eq("id", postId)
    .maybeSingle();

  if (!post) throw new Error("Post not found.");

  let liked: boolean;
  let likeCount = Number(post.like_count ?? 0);

  if (existing) {
    await supabase.from("huddle_survivor_post_likes").delete().eq("id", existing.id);
    liked = false;
    likeCount = Math.max(0, likeCount - 1);
  } else {
    await supabase.from("huddle_survivor_post_likes").insert({
      post_id: postId,
      email: normalized,
    });
    liked = true;
    likeCount += 1;
    if ((post.email as string) !== normalized) {
      await addCommunityReputation(
        post.email as string,
        computeReputationDelta({ type: "pick_liked" }),
        "survivor_pick_liked"
      );
    }
  }

  await supabase.from(TABLE).update({ like_count: likeCount }).eq("id", postId);
  return { liked, likeCount };
}

export async function listSurvivorHuddlePosts(input: {
  sort?: HuddleFeedSort;
  viewerEmail?: string | null;
  limit?: number;
}): Promise<HuddleSurvivorPost[]> {
  const sort = input.sort ?? "newest";
  const limit = input.limit ?? 30;
  const viewer = input.viewerEmail ? normalizeEmail(input.viewerEmail) : null;
  const supabase = getSupabaseAdmin();

  let query = supabase.from(TABLE).select("*").limit(limit);

  if (sort === "newest") query = query.order("published_at", { ascending: false });
  if (sort === "most_liked" || sort === "trending") {
    query = query.order("like_count", { ascending: false });
  }
  if (sort === "most_copied") {
    query = query.order("published_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []) as SurvivorPostRow[];

  if (sort === "following" && viewer) {
    const following = await listFollowingSet(viewer);
    rows = rows.filter((r) => following.has(r.email));
  }

  const postIds = rows.map((r) => r.id);
  const emails = rows.map((r) => r.email);

  const [authorMap, likedSet] = await Promise.all([
    getHuddlePlayerSummaries(emails),
    viewer && postIds.length
      ? supabase
          .from("huddle_survivor_post_likes")
          .select("post_id")
          .eq("email", viewer)
          .in("post_id", postIds)
          .then((r) => new Set((r.data ?? []).map((x) => x.post_id as string)))
      : Promise.resolve(new Set<string>()),
  ]);

  return Promise.all(
    rows.map((row) => mapSurvivorRow(row, viewer, likedSet, authorMap))
  );
}
