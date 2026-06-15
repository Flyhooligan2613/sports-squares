import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/player/statsCore";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";
import { ensureSurvivorSeason } from "@/lib/survivor/engine/seedSeason";
import { getSurvivorLeagueById } from "@/lib/survivor/db/leagues";
import { joinSurvivorLeague } from "@/lib/survivor/db/entries";
import { publishPlatformEvent } from "@/lib/events/engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to join Survivor X™." }, { status: 401 });
  }

  const eligibilityError = await requirePlayEligible(user.email);
  if (eligibilityError) return eligibilityError;

  try {
    const body = (await request.json().catch(() => ({}))) as { leagueId?: string };
    const { leagueId: defaultLeagueId } = await ensureSurvivorSeason();
    const leagueId = body.leagueId ?? defaultLeagueId;
    const league = await getSurvivorLeagueById(leagueId);

    if (!league) {
      return NextResponse.json({ error: "League not found." }, { status: 404 });
    }

    const email = normalizeEmail(user.email);
    const entry = await joinSurvivorLeague({
      leagueId,
      email,
      livesPerPlayer: league.livesPerPlayer,
    });

    await publishPlatformEvent({
      type: "survivor.league_joined",
      priority: "normal",
      summary: `${entry.displayName} joined ${league.name}`,
      gameType: "survivor",
      entityType: "survivor_entry",
      entityId: entry.id,
      payload: { leagueId, email },
      idempotencyKey: `${entry.id}:joined`,
    }).catch(() => undefined);

    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[survivor/join]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not join league." },
      { status: 400 }
    );
  }
}
