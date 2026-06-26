import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { savePickemPick } from "@/lib/pickem/db/picks";
import { refreshPickemContestPlayerCount } from "@/lib/pickem/db/contests";
import type { PickemSide } from "@/lib/pickem/types";
import { normalizeEmail } from "@/lib/player/statsCore";
import { isValidEntryTierCents } from "@/lib/platform/core/entryTiers";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";

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

  const eligibilityError = await requirePlayEligible(user.email);
  if (eligibilityError) return eligibilityError;

  try {
    const body = (await request.json()) as {
      contestId?: string;
      gameId?: string;
      pickedSide?: PickemSide;
      tier?: number;
      entryTierCents?: number;
    };

    if (!body.contestId || !body.gameId || !body.pickedSide) {
      return NextResponse.json({ error: "Missing pick fields." }, { status: 400 });
    }

    if (body.pickedSide !== "away" && body.pickedSide !== "home") {
      return NextResponse.json({ error: "Invalid pick side." }, { status: 400 });
    }

    const rawTier = body.entryTierCents ?? body.tier;
    const entryTierCents =
      typeof rawTier === "number" && isValidEntryTierCents(rawTier) ? rawTier : 1000;

    const pick = await savePickemPick({
      contestId: body.contestId,
      gameId: body.gameId,
      email: normalizeEmail(user.email),
      pickedSide: body.pickedSide,
      entryTierCents,
    });

    await refreshPickemContestPlayerCount(body.contestId);

    return NextResponse.json({ pick });
  } catch (err) {
    console.error("[pickem/picks]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "save") },
      { status: 400 }
    );
  }
}
