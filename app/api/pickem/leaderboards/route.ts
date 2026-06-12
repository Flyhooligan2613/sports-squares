import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PICKEM_SPORT } from "@/lib/pickem/config";
import { ensureCurrentPickemContest } from "@/lib/pickem/engine/syncContest";
import { getPickemLeaderboardSuite } from "@/lib/pickem/leaderboards";
import type {
  PickemLeaderboardPeriod,
  PickemLeaderboardScope,
  PickemLeaderboardSort,
} from "@/lib/pickem/types";
import { getPickemLeaderboard } from "@/lib/pickem/leaderboards";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const scope = (searchParams.get("scope") ?? "worldwide") as PickemLeaderboardScope;
  const period = (searchParams.get("period") ?? "season") as PickemLeaderboardPeriod;
  const sort = (searchParams.get("sort") ?? "accuracy") as PickemLeaderboardSort;
  const suite = searchParams.get("suite") === "1";

  try {
    const contest = await ensureCurrentPickemContest(DEFAULT_PICKEM_SPORT);
    if (!contest) {
      return NextResponse.json({ error: "No contest found." }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (suite) {
      const boards = await getPickemLeaderboardSuite({
        sport: DEFAULT_PICKEM_SPORT,
        seasonYear: contest.seasonYear,
        viewerEmail: user?.email ?? null,
      });
      return NextResponse.json({ boards, seasonYear: contest.seasonYear });
    }

    const board = await getPickemLeaderboard({
      sport: DEFAULT_PICKEM_SPORT,
      seasonYear: contest.seasonYear,
      scope,
      period,
      sort,
      viewerEmail: user?.email ?? null,
    });

    return NextResponse.json({ board, seasonYear: contest.seasonYear });
  } catch (err) {
    console.error("[pickem/leaderboards]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load leaderboards." },
      { status: 500 }
    );
  }
}
