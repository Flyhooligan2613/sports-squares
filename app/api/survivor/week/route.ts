import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureSurvivorSeason } from "@/lib/survivor/engine/seedSeason";
import { getSurvivorLeagueById } from "@/lib/survivor/db/leagues";
import { buildSurvivorWeekView } from "@/lib/survivor/weekView";
import { parseSurvivorSport } from "@/lib/survivor/sports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const leagueIdParam = searchParams.get("leagueId");
  const weekNumberParam = searchParams.get("weekNumber");
  const sport = parseSurvivorSport(searchParams.get("sport"));

  try {
    const { leagueId, seasonYear } = await ensureSurvivorSeason(sport);
    const league = leagueIdParam
      ? await getSurvivorLeagueById(leagueIdParam)
      : await getSurvivorLeagueById(leagueId);

    if (!league) {
      return NextResponse.json({ error: "League not found." }, { status: 404 });
    }

    const weekNumber = weekNumberParam
      ? parseInt(weekNumberParam, 10)
      : league.currentWeek;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const view = await buildSurvivorWeekView({
      league,
      weekNumber,
      email: user?.email ?? null,
    });

    return NextResponse.json({ ...view, seasonYear });
  } catch (err) {
    console.error("[survivor/week]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}
