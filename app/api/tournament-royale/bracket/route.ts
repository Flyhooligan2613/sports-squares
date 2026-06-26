import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseTournamentKey } from "@/lib/tournamentRoyale/config";
import { ensureDemoTournament } from "@/lib/tournamentRoyale/engine/seedDemo";
import { buildBracketView } from "@/lib/tournamentRoyale/bracketView";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const tournamentKey = parseTournamentKey(searchParams.get("tournament"));

  try {
    await ensureDemoTournament(tournamentKey);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const view = await buildBracketView({
      tournamentKey,
      email: user?.email ?? null,
    });

    if (!view) {
      return NextResponse.json({ error: "No active tournament." }, { status: 404 });
    }

    return NextResponse.json(view);
  } catch (err) {
    console.error("[tournament-royale/bracket]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}
