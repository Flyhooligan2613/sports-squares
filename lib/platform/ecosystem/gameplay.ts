import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import {
  earnTierCredits,
  gameplayToTierCredits,
  recordWeeklyGameplay,
} from "@/lib/platform/ecosystem/credits";
import { processReferralGameplay } from "@/lib/platform/ecosystem/referrals";
import { ensureWeeklyMysteryBox } from "@/lib/platform/ecosystem/mysteryBox";
import type { GameplayEvent } from "@/lib/platform/ecosystem/types";

export async function recordQualifiedGameplay(event: GameplayEvent): Promise<void> {
  const email = normalizeEmail(event.email);
  if (event.amountCents <= 0) return;

  await recordWeeklyGameplay(email, event.amountCents);

  const credits = await gameplayToTierCredits(event.amountCents);
  if (credits > 0) {
    await earnTierCredits({
      email,
      amount: credits,
      source: "qualified_gameplay",
      gameType: event.gameType,
      metadata: event.metadata,
    });
  }

  await processReferralGameplay({
    refereeEmail: email,
    amountCents: event.amountCents,
    isDeposit: event.isDeposit,
  });

  await ensureWeeklyMysteryBox(email);
}
