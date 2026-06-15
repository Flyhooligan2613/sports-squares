import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleSurvivorPostLike } from "@/lib/huddle/survivorPosts";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to like posts." }, { status: 401 });
  }

  try {
    const result = await toggleSurvivorPostLike(user.email, id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[huddle/survivor-post/like]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update like." },
      { status: 400 }
    );
  }
}
