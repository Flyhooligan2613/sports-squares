import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { followPlayer, unfollowPlayer } from "@/lib/huddle/follows";
import { getEmailForPlayerSlug } from "@/lib/database/services/playerProfiles";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to follow players." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { slug?: string; email?: string; action?: "follow" | "unfollow" };
    const targetEmail = body.email
      ? body.email
      : body.slug
        ? await getEmailForPlayerSlug(body.slug)
        : null;

    if (!targetEmail) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const result =
      body.action === "unfollow"
        ? await unfollowPlayer(user.email, targetEmail)
        : await followPlayer(user.email, targetEmail);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "share") },
      { status: 400 }
    );
  }
}
