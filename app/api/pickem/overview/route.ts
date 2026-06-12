import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PICKEM_SPORT } from "@/lib/pickem/config";
import { ensureCurrentPickemContest } from "@/lib/pickem/engine/syncContest";
import { buildPickemOverview } from "@/lib/pickem/weekView";
import { buildPickemWeekView } from "@/lib/pickem/weekView";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();
  try {
    const contest = await ensureCurrentPickemContest(DEFAULT_PICKEM_SPORT);
    if (!contest) {
      return NextResponse.json({ error: "No Pick'em contest available." }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [overview, week] = await Promise.all([
      buildPickemOverview(DEFAULT_PICKEM_SPORT, contest),
      buildPickemWeekView({ contest, email: user?.email ?? null }),
    ]);

    return NextResponse.json({ overview, week });
  } catch (err) {
    console.error("[pickem/overview]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load Pick'em." },
      { status: 500 }
    );
  }
}
