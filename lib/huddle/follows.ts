import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { addCommunityReputation, computeReputationDelta } from "@/lib/huddle/reputation";

async function syncFollowCounts(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase
      .from("huddle_player_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_email", normalized),
    supabase
      .from("huddle_player_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_email", normalized),
  ]);

  await supabase
    .from("player_profiles")
    .update({
      follower_count: followers ?? 0,
      following_count: following ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalized);
}

export async function followPlayer(
  followerEmail: string,
  followingEmail: string
): Promise<{ following: boolean }> {
  const follower = normalizeEmail(followerEmail);
  const following = normalizeEmail(followingEmail);
  if (follower === following) throw new Error("You cannot follow yourself.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("huddle_player_follows").insert({
    follower_email: follower,
    following_email: following,
  });

  if (error) {
    if (error.code === "23505") return { following: true };
    throw error;
  }

  await Promise.all([
    syncFollowCounts(follower),
    syncFollowCounts(following),
    addCommunityReputation(following, computeReputationDelta({ type: "new_follower" }), "new_follower"),
  ]);

  return { following: true };
}

export async function unfollowPlayer(
  followerEmail: string,
  followingEmail: string
): Promise<{ following: boolean }> {
  const follower = normalizeEmail(followerEmail);
  const following = normalizeEmail(followingEmail);
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("huddle_player_follows")
    .delete()
    .eq("follower_email", follower)
    .eq("following_email", following);

  if (error) throw error;

  await Promise.all([syncFollowCounts(follower), syncFollowCounts(following)]);
  return { following: false };
}

export async function isFollowing(
  followerEmail: string,
  followingEmail: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("huddle_player_follows")
    .select("id")
    .eq("follower_email", normalizeEmail(followerEmail))
    .eq("following_email", normalizeEmail(followingEmail))
    .maybeSingle();

  return Boolean(data);
}

export async function listFollowingSet(viewerEmail: string): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("huddle_player_follows")
    .select("following_email")
    .eq("follower_email", normalizeEmail(viewerEmail))
    .limit(500);

  if (error) throw error;
  return new Set((data ?? []).map((r) => r.following_email as string));
}
