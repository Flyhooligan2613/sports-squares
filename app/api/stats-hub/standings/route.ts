import { NextResponse } from "next/server";
import { fetchTeamStandings, type StatsHubSport } from "@/lib/statsHub/standings";

export const dynamic = "force-dynamic";

const VALID: StatsHubSport[] = ["nfl", "nba", "wnba", "mlb", "nhl", "soccer"];

export async function GET(request: Request) {
  const sport = (new URL(request.url).searchParams.get("sport") ?? "nfl") as StatsHubSport;
  const key = VALID.includes(sport) ? sport : "nfl";

  try {
    const standings = await fetchTeamStandings(key);
    return NextResponse.json({ sport: key, standings });
  } catch (err) {
    console.error("[stats-hub]", err);
    return NextResponse.json({ error: "Could not load standings." }, { status: 500 });
  }
}
