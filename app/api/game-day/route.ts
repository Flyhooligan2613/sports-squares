import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { formatUserError } from "@/lib/errors/formatUserError";
import { createClient } from "@/lib/supabase/server";
import { getGameDayHubData } from "@/lib/database/services/gameDayHub";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();

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
      { error: "Game Day Hub unavailable — server not configured." },
      { status: 503 }
    );
  }

  try {
    const hub = await getGameDayHubData(user.email);
    return NextResponse.json(hub);
  } catch (err) {
    console.error("[game-day]", err);
    return NextResponse.json(
      { error: formatUserError(err, "load") },
      { status: 500 }
    );
  }
}
