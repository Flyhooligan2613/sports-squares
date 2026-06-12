import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
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
      { error: "Legacy unavailable — server not configured." },
      { status: 503 }
    );
  }

  try {
    const legacy = await getPlayerLegacy(user.email);
    if (!legacy) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(legacy);
  } catch (err) {
    console.error("[player/legacy]", err);
    return NextResponse.json(
      { error: "Failed to load legacy profile" },
      { status: 500 }
    );
  }
}
