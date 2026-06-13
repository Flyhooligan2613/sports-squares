import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHuddleFeed } from "@/lib/huddle/pickPosts";
import type { HuddleFeedSort } from "@/lib/huddle/types";

export const dynamic = "force-dynamic";

const VALID_SORTS: HuddleFeedSort[] = [
  "newest",
  "trending",
  "most_copied",
  "most_liked",
  "following",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortParam = searchParams.get("sort") ?? "newest";
  const sort = VALID_SORTS.includes(sortParam as HuddleFeedSort)
    ? (sortParam as HuddleFeedSort)
    : "newest";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const feed = await getHuddleFeed({
      sort,
      viewerEmail: user?.email ?? null,
    });
    return NextResponse.json({ ...feed, sort });
  } catch (err) {
    console.error("[huddle/feed]", err);
    return NextResponse.json({ error: "Could not load The Huddle." }, { status: 500 });
  }
}
