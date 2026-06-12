import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboards } from "@/lib/database/services/leaderboards";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Leaderboards unavailable." },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const data = await getLeaderboards(user?.email);
    if (!data) {
      return NextResponse.json({ error: "Not available" }, { status: 503 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[leaderboards]", err);
    return NextResponse.json(
      { error: "Failed to load leaderboards" },
      { status: 500 }
    );
  }
}
