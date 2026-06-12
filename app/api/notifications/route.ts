import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerNotifications } from "@/lib/database/services/playerNotifications";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
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
      { error: "Notifications unavailable — server not configured." },
      { status: 503 }
    );
  }

  try {
    const notifications = await getPlayerNotifications(user.email);
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("[notifications]", err);
    return NextResponse.json(
      { error: "Failed to load notifications." },
      { status: 500 }
    );
  }
}
