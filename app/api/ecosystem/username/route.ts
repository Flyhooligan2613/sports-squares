import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  changeUsername,
  getUsernameChangeEligibility,
} from "@/lib/platform/ecosystem/username";
import { setProfileBio } from "@/lib/platform/ecosystem/profileBio";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [eligibility, identity] = await Promise.all([
    getUsernameChangeEligibility(user.email),
    getPlayerPublicIdentity(user.email),
  ]);

  return NextResponse.json({ ...eligibility, publicLabel: identity.publicLabel, avatarEmoji: identity.avatarEmoji });
}

export async function PATCH(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { username?: string; profileBio?: string };

  try {
    let savedBio: string | null | undefined;
    if (body.profileBio !== undefined) {
      savedBio = await setProfileBio(user.email, body.profileBio);
    }
    if (body.username?.trim()) {
      await changeUsername({ email: user.email, username: body.username });
    }

    const eligibility = await getUsernameChangeEligibility(user.email);
    const identity = await getPlayerPublicIdentity(user.email);
    return NextResponse.json({
      ok: true,
      ...eligibility,
      profileBio: savedBio ?? eligibility.profileBio,
      publicLabel: identity.publicLabel,
      avatarEmoji: identity.avatarEmoji,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
