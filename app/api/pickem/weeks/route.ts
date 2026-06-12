import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { DEFAULT_PICKEM_SPORT } from "@/lib/pickem/config";
import {
  ensureCurrentPickemContest,
  listPickemWeeksForSeason,
} from "@/lib/pickem/engine/syncContest";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();
  try {
    const current = await ensureCurrentPickemContest(DEFAULT_PICKEM_SPORT);
    if (!current) {
      return NextResponse.json({ error: "No contest found." }, { status: 404 });
    }

    const weeks = await listPickemWeeksForSeason({
      sport: DEFAULT_PICKEM_SPORT,
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
      { error: err instanceof Error ? err.message : "Failed to load weeks." },
      { status: 500 }
    );
  }
}
