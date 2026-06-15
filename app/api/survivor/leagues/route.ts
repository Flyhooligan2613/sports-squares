import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { ensureSurvivorSeason } from "@/lib/survivor/engine/seedSeason";
import { listPublicSurvivorLeagues } from "@/lib/survivor/db/leagues";
import { getSurvivorEntry } from "@/lib/survivor/db/entries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

    return NextResponse.json({
      seasonYear,
      leagues: leagues.map((league) => ({
        id: league.id,
        name: league.name,
        description: league.description,
        mode: league.mode,
        livesPerPlayer: league.livesPerPlayer,
        currentWeek: league.currentWeek,
        status: league.status,
        entry: joinedByLeague[league.id]
          ? {
              id: joinedByLeague[league.id]!.id,
              status: joinedByLeague[league.id]!.status,
              livesRemaining: joinedByLeague[league.id]!.livesRemaining,
            }
          : null,
      })),
    });
  } catch (err) {
    console.error("[survivor/leagues]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load leagues." },
      { status: 500 }
    );
  }
}
