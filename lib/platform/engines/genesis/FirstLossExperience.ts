import { patchGenesisProfile } from "@/lib/platform/engines/genesis/repository";
import { normalizeEmail } from "@/lib/player/statsCore";

export interface FirstLossEncouragementPayload {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  emoji: string;
}

export async function markFirstLossEncouraged(email: string): Promise<FirstLossEncouragementPayload> {
  const normalized = normalizeEmail(email);
  await patchGenesisProfile(normalized, {
    first_loss_encouraged_at: new Date().toISOString(),
  });

  return buildFirstLossEncouragement();
}

export function buildFirstLossEncouragement(): FirstLossEncouragementPayload {
  return {
    title: "Tough break — keep competing",
    body: "Every champion loses quarters before they win championships. Your Competitor Score rewards showing up — join the next contest and stay in the fight.",
    ctaLabel: "Browse live contests",
    ctaHref: "/contest-center",
    emoji: "💪",
  };
}
