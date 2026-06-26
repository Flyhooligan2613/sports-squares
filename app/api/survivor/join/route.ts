import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/player/statsCore";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";
import { ensureSurvivorSeason } from "@/lib/survivor/engine/seedSeason";
import { getSurvivorLeagueById, getSurvivorLeagueByInviteCode } from "@/lib/survivor/db/leagues";
import { countEntriesByStatus, getSurvivorEntry, joinSurvivorLeague } from "@/lib/survivor/db/entries";
import { parseSurvivorSport } from "@/lib/survivor/sports";
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
    const body = (await request.json().catch(() => ({}))) as {
      leagueId?: string;
      inviteCode?: string;
      sport?: string;
    };
    const sport = parseSurvivorSport(body.sport);
    const { leagueId: defaultLeagueId } = await ensureSurvivorSeason(sport);

    const email = normalizeEmail(user.email);

    let leagueId = body.leagueId ?? defaultLeagueId;
    if (body.inviteCode?.trim()) {
      const byCode = await getSurvivorLeagueByInviteCode(body.inviteCode);
      if (!byCode) {
        return NextResponse.json({ error: "Invalid invite code." }, { status: 404 });
      }
      leagueId = byCode.id;
    }

    const league = await getSurvivorLeagueById(leagueId);

    if (!league) {
      return NextResponse.json({ error: "League not found." }, { status: 404 });
    }

    if (!["open", "active"].includes(league.status)) {
      return NextResponse.json({ error: "This league is not accepting entries." }, { status: 400 });
    }

    if (league.maxPlayers != null) {
      const playerCount = await countEntriesByStatus(league.id);
      const existing = await getSurvivorEntry(league.id, email);
      if (!existing && playerCount >= league.maxPlayers) {
        return NextResponse.json({ error: "This league is full." }, { status: 400 });
      }
    }

    if (league.entryFeeCents > 0) {
      return NextResponse.json(
        { error: "Paid private leagues are coming soon — free leagues only for now." },
        { status: 400 }
      );
    }

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
      { error: safeApiErrorMessage(err, "join") },
      { status: 400 }
    );
  }
}
