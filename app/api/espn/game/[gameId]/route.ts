import { NextResponse } from "next/server";
import { parseEspnSummary } from "@/lib/espn/parser";
import { getEspnSportConfig, normalizeEspnSport } from "@/lib/espn/sports";
import type { EspnSport } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const gameId = params.gameId?.trim();
  if (!gameId) {
    return NextResponse.json({ error: "Missing game ID" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const sport = normalizeEspnSport(searchParams.get("sport") as EspnSport);
  const config = getEspnSportConfig(sport);

  try {
    const response = await fetch(`${config.summaryUrl}?event=${gameId}`, {
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
    const game = parseEspnSummary(data, gameId);

    if (!game) {
      return NextResponse.json(
        { error: "Could not parse ESPN game data" },
        { status: 422 }
      );
    }

    return NextResponse.json({ game, sport });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch ESPN game data",
      },
      { status: 500 }
    );
  }
}
