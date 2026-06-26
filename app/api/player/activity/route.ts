import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPlayerActivityTimeline } from "@/lib/notifications/buildPlayerActivity";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Activity unavailable — server not configured." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  try {
    const activity = await buildPlayerActivityTimeline(user.email, limit);
    return NextResponse.json({ activity });
  } catch (err) {
    console.error("[player/activity]", err);
    return NextResponse.json({ error: "Failed to load activity." }, { status: 500 });
  }
}
