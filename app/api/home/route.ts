import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
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
      { error: "Home unavailable — server not configured." },
      { status: 503 }
    );
  }

  try {
    const home = await getGameDayHubData(user.email);
    return NextResponse.json(home);
  } catch (err) {
    console.error("[api/home]", err);
    return NextResponse.json({ error: "Failed to load Home" }, { status: 500 });
  }
}
