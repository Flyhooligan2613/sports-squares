import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolvePickemSportFromRequest, assertPickemSportEnabled } from "@/lib/pickem/resolveSport";
import { ensureCurrentPickemContest } from "@/lib/pickem/engine/syncContest";
import { buildPickemOverview } from "@/lib/pickem/weekView";
import { buildPickemWeekView } from "@/lib/pickem/weekView";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  try {
    const sport = resolvePickemSportFromRequest(request);
    assertPickemSportEnabled(sport);
    const contest = await ensureCurrentPickemContest(sport);
    if (!contest) {
      return NextResponse.json({ error: "No Pick'em contest available." }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [overview, week] = await Promise.all([
      buildPickemOverview(sport, contest),
      buildPickemWeekView({ contest, email: user?.email ?? null }),
    ]);

    return NextResponse.json({ overview, week });
  } catch (err) {
    console.error("[pickem/overview]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}
