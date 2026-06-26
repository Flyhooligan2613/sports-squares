import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { resolvePickemSportFromRequest, assertPickemSportEnabled } from "@/lib/pickem/resolveSport";
import {
  ensureCurrentPickemContest,
  listPickemWeeksForSeason,
} from "@/lib/pickem/engine/syncContest";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  try {
    const sport = resolvePickemSportFromRequest(request);
    assertPickemSportEnabled(sport);
    const current = await ensureCurrentPickemContest(sport);
    if (!current) {
      return NextResponse.json({ error: "No contest found." }, { status: 404 });
    }

    const weeks = await listPickemWeeksForSeason({
      sport,
      seasonYear: current.seasonYear,
    });

    return NextResponse.json({
      seasonYear: current.seasonYear,
      currentContestId: current.id,
      weeks: weeks.map((w) => ({
        id: w.id,
        label: w.label,
        weekNumber: w.weekNumber,
        seasonType: w.seasonType,
        status: w.status,
        playerCount: w.playerCount,
        isCurrent: w.id === current.id,
      })),
    });
  } catch (err) {
    console.error("[pickem/weeks]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}
