import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/player/statsCore";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";
import { parseTournamentKey } from "@/lib/tournamentRoyale/config";
import { ensureDemoTournament } from "@/lib/tournamentRoyale/engine/seedDemo";
import { getTournamentEntry, joinTournamentPool } from "@/lib/tournamentRoyale/db/entries";
import { getActiveTournamentEvent } from "@/lib/tournamentRoyale/db/events";
import { getGlobalPoolForEvent } from "@/lib/tournamentRoyale/db/pools";
import { publishPlatformEvent } from "@/lib/events/engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to join." }, { status: 401 });
  }

  const eligibilityError = await requirePlayEligible(user.email);
  if (eligibilityError) return eligibilityError;

  try {
    const body = (await request.json()) as { tournamentKey?: string };
    const tournamentKey = parseTournamentKey(body.tournamentKey);

    await ensureDemoTournament(tournamentKey);

    const event = await getActiveTournamentEvent(tournamentKey);
    if (!event) {
      return NextResponse.json({ error: "No active tournament." }, { status: 404 });
    }

    const pool = await getGlobalPoolForEvent(event.id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found." }, { status: 404 });
    }

    const email = normalizeEmail(user.email);
    const existing = await getTournamentEntry(pool.id, email);
    if (existing) {
      return NextResponse.json({ entry: existing, joined: true });
    }

    const entry = await joinTournamentPool({
      eventId: event.id,
      poolId: pool.id,
      email,
      displayName: user.user_metadata?.display_name,
    });

    await publishPlatformEvent({
      type: "tournament.joined",
      priority: "normal",
      summary: `${entry.display_name} joined Tournament Royale™`,
      gameType: "brackets",
      entityType: "tournament_entry",
      entityId: entry.id,
      payload: { tournamentKey },
      idempotencyKey: `${entry.id}:joined`,
    }).catch(() => undefined);

    return NextResponse.json({ entry, joined: true });
  } catch (err) {
    console.error("[tournament-royale/join]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "join") },
      { status: 400 }
    );
  }
}
