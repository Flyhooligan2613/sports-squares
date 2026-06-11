import { NextResponse } from "next/server";
import { parseEspnScoreboard } from "@/lib/espn/parser";
import { getEspnSportConfig, normalizeEspnSport } from "@/lib/espn/sports";
import type { EspnSport } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = normalizeEspnSport(searchParams.get("sport") as EspnSport);
  const config = getEspnSportConfig(sport);

  try {
    const response = await fetch(config.scoreboardUrl, {
      headers: { "User-Agent": "SportsSquares/1.0" },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `ESPN returned HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const games = parseEspnScoreboard(data);

    return NextResponse.json({ games, sport });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to fetch ESPN scoreboard",
      },
      { status: 500 }
    );
  }
}
