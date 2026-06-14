import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { ensureSurvivorSeason } from "@/lib/survivor/engine/seedSeason";
import { getSurvivorLeagueById } from "@/lib/survivor/db/leagues";
import { listSurvivorWeeks } from "@/lib/survivor/db/weeks";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();

  try {
    const { leagueId } = await ensureSurvivorSeason();
    const league = await getSurvivorLeagueById(leagueId);
    if (!league) {
      return NextResponse.json({ error: "League not found." }, { status: 404 });
    }

    const weeks = await listSurvivorWeeks(leagueId);
    return NextResponse.json({
      leagueId,
      currentWeek: league.currentWeek,
      weeks: weeks.map((w) => ({
        id: w.id,
        weekNumber: w.weekNumber,
        label: w.label,
        status: w.status,
        isCurrent: w.weekNumber === league.currentWeek,
      })),
    });
  } catch (err) {
    console.error("[survivor/weeks]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load weeks." },
      { status: 500 }
    );
  }
}
