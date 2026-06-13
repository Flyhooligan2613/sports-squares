import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishPickPost, getViewerPickPost } from "@/lib/huddle/pickPosts";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ post: null });
  }

  try {
    const post = await getViewerPickPost(user.email);
    return NextResponse.json({ post });
  } catch (err) {
    console.error("[huddle/posts GET]", err);
    return NextResponse.json({ post: null });
  }
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to publish your pick card." }, { status: 401 });
  }

  try {
    const post = await publishPickPost(user.email);
    return NextResponse.json({ post });
  } catch (err) {
    console.error("[huddle/posts POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not publish pick card." },
      { status: 400 }
    );
  }
}
