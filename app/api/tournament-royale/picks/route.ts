import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/player/statsCore";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";
import { parseTournamentKey } from "@/lib/tournamentRoyale/config";
import { updateBracketCompletion } from "@/lib/tournamentRoyale/bracketView";
import { getTournamentEntry } from "@/lib/tournamentRoyale/db/entries";
import { getActiveTournamentEvent } from "@/lib/tournamentRoyale/db/events";
import { getMatchupById } from "@/lib/tournamentRoyale/db/matchups";
import { getGlobalPoolForEvent } from "@/lib/tournamentRoyale/db/pools";
import { upsertPick } from "@/lib/tournamentRoyale/db/picks";
import { TOURNAMENT_EVENT_TYPES } from "@/lib/tournamentRoyale/events";
import { publishPlatformEvent } from "@/lib/events/engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to lock your pick." }, { status: 401 });
  }

  const eligibilityError = await requirePlayEligible(user.email);
  if (eligibilityError) return eligibilityError;

  try {
    const body = (await request.json()) as {
      tournamentKey?: string;
      matchupId?: string;
      pickedTeamName?: string;
    };

    if (!body.matchupId || !body.pickedTeamName) {
      return NextResponse.json({ error: "Missing pick fields." }, { status: 400 });
    }

    const tournamentKey = parseTournamentKey(body.tournamentKey);
    const event = await getActiveTournamentEvent(tournamentKey);
    if (!event || (event.status !== "open" && event.status !== "active")) {
      return NextResponse.json({ error: "Bracket is locked." }, { status: 400 });
    }

    const pool = await getGlobalPoolForEvent(event.id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found." }, { status: 404 });
    }

    const email = normalizeEmail(user.email);
    const entry = await getTournamentEntry(pool.id, email);
    if (!entry) {
      return NextResponse.json({ error: "Join the tournament first." }, { status: 400 });
    }

    const matchup = await getMatchupById(body.matchupId);
    if (!matchup || matchup.status !== "scheduled") {
      return NextResponse.json({ error: "This matchup is locked." }, { status: 400 });
    }

    const validTeams = [matchup.top_team_name, matchup.bottom_team_name];
    if (!validTeams.includes(body.pickedTeamName)) {
      return NextResponse.json({ error: "Invalid team selection." }, { status: 400 });
    }

    const pick = await upsertPick({
      entryId: entry.id,
      matchupId: body.matchupId,
      pickedTeamName: body.pickedTeamName,
    });

    const completionPct = await updateBracketCompletion(entry.id, tournamentKey);

    await publishPlatformEvent({
      type: TOURNAMENT_EVENT_TYPES.PICK_LOCKED,
      priority: "normal",
      summary: `${entry.display_name} picked ${body.pickedTeamName}`,
      gameType: "brackets",
      entityType: "tournament_pick",
      entityId: pick.id,
      payload: {
        matchupId: body.matchupId,
        pickedTeamName: body.pickedTeamName,
      },
      idempotencyKey: `${pick.id}:locked`,
    }).catch(() => undefined);

    return NextResponse.json({ pick, completionPct });
  } catch (err) {
    console.error("[tournament-royale/picks]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "save") },
      { status: 400 }
    );
  }
}
