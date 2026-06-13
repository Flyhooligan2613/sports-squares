import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getPlayerAvatar, setPlayerAvatar } from "@/lib/platform/ecosystem/progression";
import { PLAYER_AVATARS } from "@/lib/platform/ecosystem/avatars";

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

  const avatar = await getPlayerAvatar(user.email);
  return NextResponse.json({ avatar, options: PLAYER_AVATARS });
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

  const body = (await request.json()) as { emoji?: string };
  if (!body.emoji) {
    return NextResponse.json({ error: "emoji required." }, { status: 400 });
  }

  const avatar = await setPlayerAvatar(user.email, body.emoji);
  return NextResponse.json({ avatar });
}
