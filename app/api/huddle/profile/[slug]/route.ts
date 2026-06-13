import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerSocialProfile } from "@/lib/huddle/profileSocial";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const profile = await getPlayerSocialProfile(slug, user?.email ?? null);
    if (!profile) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[huddle/profile]", err);
    return NextResponse.json({ error: "Could not load profile." }, { status: 500 });
  }
}
