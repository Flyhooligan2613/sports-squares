import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishSurvivorHuddlePost } from "@/lib/huddle/survivorPosts";
import { publishPlatformEvent } from "@/lib/events/engine";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to share your Survivor pick." }, { status: 401 });
  }

  try {
    const post = await publishSurvivorHuddlePost(user.email);

    await publishPlatformEvent({
      type: "community.pick_shared",
      priority: "normal",
      summary: `${post.author.username} shared a Survivor X pick`,
      gameType: "survivor",
      entityType: "huddle_survivor_post",
      entityId: post.id,
      actorEmail: user.email,
      payload: {
        teamAbbr: post.teamAbbr,
        weekLabel: post.weekLabel,
      },
      idempotencyKey: `${post.id}:shared`,
    }).catch(() => undefined);

    return NextResponse.json({ post });
  } catch (err) {
    console.error("[huddle/survivor-post]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not share pick." },
      { status: 400 }
    );
  }
}
