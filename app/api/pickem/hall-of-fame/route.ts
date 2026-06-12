import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import {
  getPickemSeasonArchive,
  getPickemSeasonStandings,
  listPickemSeasonArchives,
} from "@/lib/pickem/db/hallOfFame";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const seasonYearParam = searchParams.get("seasonYear");

  try {
    if (seasonYearParam) {
      const seasonYear = parseInt(seasonYearParam, 10);
      const archive = await getPickemSeasonArchive({ sport: "nfl", seasonYear });
      if (!archive) {
        return NextResponse.json({ error: "Season not archived yet." }, { status: 404 });
      }
      const standings = await getPickemSeasonStandings(archive.id);
      return NextResponse.json({ archive, standings });
    }

    const seasons = await listPickemSeasonArchives("nfl");
    return NextResponse.json({ seasons });
  } catch (err) {
    console.error("[pickem/hall-of-fame]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load Hall of Fame." },
      { status: 500 }
    );
  }
}
