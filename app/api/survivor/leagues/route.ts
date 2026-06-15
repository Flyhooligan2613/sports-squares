import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/player/statsCore";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";
import { publishPlatformEvent } from "@/lib/events/engine";
import { ensureSurvivorSeason, seedWeeksForLeague } from "@/lib/survivor/engine/seedSeason";
import {
  createPrivateSurvivorLeague,
  listPrivateSurvivorLeaguesForEmail,
  listPublicSurvivorLeagues,
} from "@/lib/survivor/db/leagues";
import { countEntriesByStatus, getSurvivorEntry, joinSurvivorLeague } from "@/lib/survivor/db/entries";

export const dynamic = "force-dynamic";

function mapLeagueResponse(
  league: Awaited<ReturnType<typeof listPublicSurvivorLeagues>>[number],
  entry: Awaited<ReturnType<typeof getSurvivorEntry>>,
  extras?: { playerCount?: number; isCreator?: boolean }
) {
  return {
    id: league.id,
    name: league.name,
    description: league.description,
    mode: league.mode,
    visibility: league.visibility,
    livesPerPlayer: league.livesPerPlayer,
    currentWeek: league.currentWeek,
    status: league.status,
    inviteCode: league.inviteCode,
    maxPlayers: league.maxPlayers,
    entryFeeCents: league.entryFeeCents,
    playerCount: extras?.playerCount,
    isCreator: extras?.isCreator ?? false,
    entry: entry
      ? {
          id: entry.id,
          status: entry.status,
          livesRemaining: entry.livesRemaining,
        }
      : null,
  };
}

export async function GET() {
  noStore();

  try {
    const { seasonYear } = await ensureSurvivorSeason();
    const leagues = await listPublicSurvivorLeagues(seasonYear);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const entries = user?.email
      ? await Promise.all(
          leagues.map(async (league) => ({
            leagueId: league.id,
            entry: await getSurvivorEntry(league.id, user.email!),
          }))
        )
      : [];

    const joinedByLeague = Object.fromEntries(
      entries.map((row) => [row.leagueId, row.entry])
    );

    let privateLeagues: ReturnType<typeof mapLeagueResponse>[] = [];
    if (user?.email) {
      const email = normalizeEmail(user.email);
      const privates = await listPrivateSurvivorLeaguesForEmail(email, seasonYear);
      privateLeagues = await Promise.all(
        privates.map(async (league) => {
          const [entry, playerCount] = await Promise.all([
            getSurvivorEntry(league.id, email),
            countEntriesByStatus(league.id),
          ]);
          return mapLeagueResponse(league, entry, {
            playerCount,
            isCreator: league.creatorEmail === email,
          });
        })
      );
    }

    return NextResponse.json({
      seasonYear,
      leagues: leagues.map((league) =>
        mapLeagueResponse(league, joinedByLeague[league.id] ?? null)
      ),
      privateLeagues,
    });
  } catch (err) {
    console.error("[survivor/leagues]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load leagues." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ error: "Sign in to create a private league." }, { status: 401 });
  }

  const eligibilityError = await requirePlayEligible(user.email);
  if (eligibilityError) return eligibilityError;

  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      livesPerPlayer?: number;
      maxPlayers?: number | null;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "League name is required." }, { status: 400 });
    }

    const { seasonYear } = await ensureSurvivorSeason();
    const email = normalizeEmail(user.email);

    const league = await createPrivateSurvivorLeague({
      seasonYear,
      creatorEmail: email,
      name: body.name,
      description: body.description,
      livesPerPlayer: body.livesPerPlayer,
      maxPlayers: body.maxPlayers,
    });

    await seedWeeksForLeague(league.id);

    const entry = await joinSurvivorLeague({
      leagueId: league.id,
      email,
      livesPerPlayer: league.livesPerPlayer,
    });

    await publishPlatformEvent({
      type: "survivor.league_joined",
      priority: "normal",
      summary: `${entry.displayName} created ${league.name}`,
      gameType: "survivor",
      entityType: "survivor_league",
      entityId: league.id,
      actorEmail: email,
      payload: { leagueId: league.id, inviteCode: league.inviteCode, created: true },
      idempotencyKey: `${league.id}:created`,
    }).catch(() => undefined);

    return NextResponse.json({
      league: mapLeagueResponse(league, entry, { playerCount: 1, isCreator: true }),
    });
  } catch (err) {
    console.error("[survivor/leagues POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create league." },
      { status: 400 }
    );
  }
}
