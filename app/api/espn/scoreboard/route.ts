import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
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
        { error: safeApiErrorMessage("scoreboard unavailable", "load") },
        { status: 502 }
      );
    }

    const data = await response.json();
    const games = parseEspnScoreboard(data);

    return NextResponse.json({ games, sport });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          safeApiErrorMessage(err, "load"),
      },
      { status: 500 }
    );
  }
}
