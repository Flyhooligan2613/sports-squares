import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import {
  getPickemSeasonArchive,
  getPickemSeasonStandings,
  listPickemSeasonArchives,
} from "@/lib/pickem/db/hallOfFame";
import { resolvePickemSportFromRequest, assertPickemSportEnabled } from "@/lib/pickem/resolveSport";
import type { PickemSport } from "@/lib/pickem/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const seasonYearParam = searchParams.get("seasonYear");

  try {
    const sport = resolvePickemSportFromRequest(request) as PickemSport;
    assertPickemSportEnabled(sport);

    if (seasonYearParam) {
      const seasonYear = parseInt(seasonYearParam, 10);
      const archive = await getPickemSeasonArchive({ sport, seasonYear });
      if (!archive) {
        return NextResponse.json({ error: "Season not archived yet." }, { status: 404 });
      }
      const standings = await getPickemSeasonStandings(archive.id);
      return NextResponse.json({ archive, standings });
    }

    const seasons = await listPickemSeasonArchives(sport);
    return NextResponse.json({ seasons });
  } catch (err) {
    console.error("[pickem/hall-of-fame]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load Hall of Fame." },
      { status: 500 }
    );
  }
}
