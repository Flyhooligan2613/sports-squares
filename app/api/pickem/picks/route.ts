import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { savePickemPick } from "@/lib/pickem/db/picks";
import { refreshPickemContestPlayerCount } from "@/lib/pickem/db/contests";
import type { PickemSide } from "@/lib/pickem/types";
import { normalizeEmail } from "@/lib/player/statsCore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to save picks." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      contestId?: string;
      gameId?: string;
      pickedSide?: PickemSide;
    };

    if (!body.contestId || !body.gameId || !body.pickedSide) {
      return NextResponse.json({ error: "Missing pick fields." }, { status: 400 });
    }

    if (body.pickedSide !== "away" && body.pickedSide !== "home") {
      return NextResponse.json({ error: "Invalid pick side." }, { status: 400 });
    }

    const pick = await savePickemPick({
      contestId: body.contestId,
      gameId: body.gameId,
      email: normalizeEmail(user.email),
      pickedSide: body.pickedSide,
    });

    await refreshPickemContestPlayerCount(body.contestId);

    return NextResponse.json({ pick });
  } catch (err) {
    console.error("[pickem/picks]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save pick." },
      { status: 400 }
    );
  }
}
