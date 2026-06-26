import { NextResponse } from "next/server";
import { formatUserError } from "@/lib/errors/formatUserError";
import { createClient } from "@/lib/supabase/server";
import { getPlayerDashboard } from "@/lib/database/services/playerDashboard";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

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
      { error: "Dashboard unavailable — server not configured." },
      { status: 503 }
    );
  }

  try {
    const dashboard = await getPlayerDashboard(user.email);
    return NextResponse.json(dashboard);
  } catch (err) {
    console.error("[player/dashboard]", err);
    return NextResponse.json(
      { error: formatUserError(err, "load") },
      { status: 500 }
    );
  }
}
