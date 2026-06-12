import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPickemContestById } from "@/lib/pickem/db/contests";
import { listPickemGames } from "@/lib/pickem/db/games";
import { getPlayerPickemLeague } from "@/lib/pickem/db/leagues";
import { getPlayerWeekResult } from "@/lib/pickem/db/playerWeekResults";
import {
  getTiebreakerById,
  getTiebreakerEntryForPlayer,
  getTiebreakerForLeague,
  listTiebreakerEntries,
  submitTiebreakerPrediction,
} from "@/lib/pickem/db/tiebreakers";
import { getMondayNightGame } from "@/lib/pickem/mondayNight";
import { normalizeEmail } from "@/lib/player/statsCore";
import { parseEntryTierParam } from "@/lib/platform/core/entryTiers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const contestId = searchParams.get("contestId");
  const tier = parseEntryTierParam(searchParams.get("tier"));

  if (!contestId) {
    return NextResponse.json({ error: "contestId required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const contest = await getPickemContestById(contestId);
  if (!contest) {
    return NextResponse.json({ error: "Contest not found." }, { status: 404 });
  }

  const games = await listPickemGames(contestId);
  const mondayGame = getMondayNightGame(games);

  const league = user?.email
    ? await getPlayerPickemLeague(contestId, user.email, tier)
    : null;

  const tiebreaker = league ? await getTiebreakerForLeague(league.id) : null;

  let myEntry = null;
  let playerStatus = null;
  if (user?.email && league) {
    playerStatus = await getPlayerWeekResult({
      contestId,
      leagueId: league.id,
      email: user.email,
    });
    if (tiebreaker) {
      myEntry = await getTiebreakerEntryForPlayer({
        tiebreakerId: tiebreaker.id,
        email: user.email,
      });
    }
  }

  const entries = tiebreaker ? await listTiebreakerEntries(tiebreaker.id) : [];

  return NextResponse.json({
    contest,
    mondayGame,
    league,
    tiebreaker,
    playerStatus,
    myEntry,
    playersRemaining: entries.filter((e) => e.predictedTotal != null).length,
    tiedPlayers: entries.length,
  });
}

export async function POST(request: Request) {
  noStore();

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ error: "Sign in to submit prediction." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      tiebreakerId?: string;
      contestId?: string;
      tier?: number;
      predictedTotal?: number;
    };

    const predictedTotal = Math.floor(Number(body.predictedTotal));
    if (!Number.isFinite(predictedTotal) || predictedTotal < 0 || predictedTotal > 200) {
      return NextResponse.json(
        { error: "Enter a valid combined score prediction (0–200)." },
        { status: 400 }
      );
    }

    let tiebreaker = body.tiebreakerId
      ? await getTiebreakerById(body.tiebreakerId)
      : null;

    if (!tiebreaker && body.contestId) {
      const tier = parseEntryTierParam(String(body.tier ?? 1000));
      const league = await getPlayerPickemLeague(body.contestId, user.email, tier);
      if (league) {
        tiebreaker = await getTiebreakerForLeague(league.id);
      }
    }

    if (!tiebreaker) {
      return NextResponse.json({ error: "Tiebreaker not found." }, { status: 404 });
    }

    if (tiebreaker.status !== "active") {
      return NextResponse.json(
        { error: "Predictions are locked for this tiebreaker." },
        { status: 400 }
      );
    }

    const email = normalizeEmail(user.email);
    const league = await getPlayerPickemLeague(tiebreaker.contestId, email);
    if (!league || league.id !== tiebreaker.leagueId) {
      return NextResponse.json({ error: "You are not in this tiebreaker." }, { status: 403 });
    }

    const weekResult = await getPlayerWeekResult({
      contestId: tiebreaker.contestId,
      leagueId: league.id,
      email,
    });

    if (weekResult?.status !== "tiebreaker") {
      return NextResponse.json(
        { error: "Only tied players can submit a tiebreaker prediction." },
        { status: 403 }
      );
    }

    const games = await listPickemGames(tiebreaker.contestId);
    const mondayGame = getMondayNightGame(games);
    if (mondayGame && new Date(mondayGame.kickoffAt).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Kickoff has passed — predictions are locked." },
        { status: 400 }
      );
    }

    const entry = await submitTiebreakerPrediction({
      tiebreakerId: tiebreaker.id,
      email,
      predictedTotal,
    });

    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[pickem/tiebreaker]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save prediction." },
      { status: 500 }
    );
  }
}
