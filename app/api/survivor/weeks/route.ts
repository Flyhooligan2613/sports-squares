import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { ensureSurvivorSeason } from "@/lib/survivor/engine/seedSeason";
import { getSurvivorLeagueById } from "@/lib/survivor/db/leagues";
import { listSurvivorWeeks } from "@/lib/survivor/db/weeks";
import { parseSurvivorSport } from "@/lib/survivor/sports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);

  try {
    const sport = parseSurvivorSport(searchParams.get("sport"));
    const { leagueId: defaultLeagueId } = await ensureSurvivorSeason(sport);
    const leagueIdParam = searchParams.get("leagueId");
    const leagueId = leagueIdParam ?? defaultLeagueId;
    const league = await getSurvivorLeagueById(leagueId);
    if (!league) {
      return NextResponse.json({ error: "League not found." }, { status: 404 });
    }

    const weeks = await listSurvivorWeeks(leagueId);
    return NextResponse.json({
      sport,
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
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}
