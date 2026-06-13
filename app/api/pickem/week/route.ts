import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolvePickemSportFromRequest, assertPickemSportEnabled } from "@/lib/pickem/resolveSport";
import { getPickemContestById } from "@/lib/pickem/db/contests";
import { ensureCurrentPickemContest } from "@/lib/pickem/engine/syncContest";
import { buildPickemWeekView } from "@/lib/pickem/weekView";
import { parseEntryTierParam } from "@/lib/platform/core/entryTiers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const contestId = searchParams.get("contestId");
  const entryTierCents = parseEntryTierParam(searchParams.get("tier"));

  const sport = resolvePickemSportFromRequest(request);
  assertPickemSportEnabled(sport);

  try {
    const contest = contestId
      ? await getPickemContestById(contestId)
      : await ensureCurrentPickemContest(sport);

    if (!contest) {
      return NextResponse.json({ error: "No contest found." }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const week = await buildPickemWeekView({
      contest,
      email: user?.email ?? null,
      entryTierCents,
    });

    return NextResponse.json(week);
  } catch (err) {
    console.error("[pickem/week]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load week." },
      { status: 500 }
    );
  }
}
