import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AliveEngine } from "@/lib/platform/alive";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const personalPulse = await AliveEngine.getPersonalPulse(user.email);
    return NextResponse.json({ personalPulse });
  } catch (err) {
    console.error("[api/alive/personal-pulse]", err);
    return NextResponse.json({ error: "Failed to load personal pulse" }, { status: 500 });
  }
}
