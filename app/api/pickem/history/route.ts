import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPickemHistorySummary } from "@/lib/pickem/db/history";
import { resolvePickemSportFromRequest, assertPickemSportEnabled } from "@/lib/pickem/resolveSport";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const sport = resolvePickemSportFromRequest(request);
  assertPickemSportEnabled(sport);

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to view history." }, { status: 401 });
  }

  try {
    const summary = await getPickemHistorySummary(user.email, sport);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[pickem/history]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load history." },
      { status: 500 }
    );
  }
}
