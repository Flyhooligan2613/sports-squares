import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/player/statsCore";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";
import { saveSurvivorPick } from "@/lib/survivor/db/picks";
import { getSurvivorEntry } from "@/lib/survivor/db/entries";
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
      leagueId?: string;
      weekId?: string;
      teamAbbr?: string;
      teamName?: string;
      espnGameId?: string;
      kickoffAt?: string;
    };

    if (
      !body.leagueId ||
      !body.weekId ||
      !body.teamAbbr ||
      !body.teamName ||
      !body.espnGameId ||
      !body.kickoffAt
    ) {
      return NextResponse.json({ error: "Missing pick fields." }, { status: 400 });
    }

    const email = normalizeEmail(user.email);
    const entry = await getSurvivorEntry(body.leagueId, email);
    if (!entry) {
      return NextResponse.json({ error: "Join the league first." }, { status: 400 });
    }

    const pick = await saveSurvivorPick({
      leagueId: body.leagueId,
      weekId: body.weekId,
      entryId: entry.id,
      email,
      teamAbbr: body.teamAbbr,
      teamName: body.teamName,
      espnGameId: body.espnGameId,
      kickoffAt: body.kickoffAt,
    });

    await publishPlatformEvent({
      type: "survivor.pick_locked",
      priority: "high",
      summary: `${entry.displayName} locked ${body.teamName}`,
      gameType: "survivor",
      entityType: "survivor_pick",
      entityId: pick.id,
      payload: {
        teamAbbr: pick.teamAbbr,
        weekId: pick.weekId,
      },
      idempotencyKey: `${pick.id}:locked`,
    }).catch(() => undefined);

    return NextResponse.json({ pick });
  } catch (err) {
    console.error("[survivor/picks]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "save") },
      { status: 400 }
    );
  }
}
