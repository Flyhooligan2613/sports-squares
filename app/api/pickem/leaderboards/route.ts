import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolvePickemSportFromRequest, assertPickemSportEnabled } from "@/lib/pickem/resolveSport";
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
  const sport = resolvePickemSportFromRequest(request);
  assertPickemSportEnabled(sport);

  try {
    const contest = await ensureCurrentPickemContest(sport);
    if (!contest) {
      return NextResponse.json({ error: "No contest found." }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (suite) {
      const boards = await getPickemLeaderboardSuite({
        sport,
        seasonYear: contest.seasonYear,
        viewerEmail: user?.email ?? null,
        contestId: contest.id,
      });
      return NextResponse.json({ boards, seasonYear: contest.seasonYear });
    }

    const board = await getPickemLeaderboard({
      sport,
      seasonYear: contest.seasonYear,
      scope,
      period,
      sort,
      viewerEmail: user?.email ?? null,
      contestId: contest.id,
    });

    return NextResponse.json({ board, seasonYear: contest.seasonYear });
  } catch (err) {
    console.error("[pickem/leaderboards]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}
