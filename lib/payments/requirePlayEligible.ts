import { NextResponse } from "next/server";
import {
  getPlayEligibility,
  playEligibilityErrorMessage,
} from "@/lib/payments/playEligibility";
import { normalizeEmail } from "@/lib/player/statsCore";

export async function requirePlayEligible(email: string): Promise<NextResponse | null> {
  const status = await getPlayEligibility(normalizeEmail(email));

  if (status.eligible) return null;

  return NextResponse.json(
    {
      error: playEligibilityErrorMessage(status.blockers),
      code: "play_not_eligible",
      blockers: status.blockers,
      setupUrl: status.setupUrl,
    },
    { status: 403 }
  );
}
