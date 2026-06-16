import { patchGenesisProfile } from "@/lib/platform/engines/genesis/repository";
import { normalizeEmail } from "@/lib/player/statsCore";

export interface FirstWinCelebrationPayload {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  emoji: string;
}

export async function markFirstWinCelebrated(email: string): Promise<FirstWinCelebrationPayload> {
  const normalized = normalizeEmail(email);
  await patchGenesisProfile(normalized, {
    first_win_celebrated_at: new Date().toISOString(),
  });

  return {
    title: "Your first win!",
    body: "You earned it — this is how legacies begin on SquareBoards. Share your Competitor Card and keep the momentum going.",
    ctaLabel: "View your profile",
    ctaHref: "/my-games/profile",
    emoji: "🏆",
  };
}

export function buildFirstWinCelebration(): FirstWinCelebrationPayload {
  return {
    title: "Your first win!",
    body: "You earned it — this is how legacies begin on SquareBoards. Share your Competitor Card and keep the momentum going.",
    ctaLabel: "View your profile",
    ctaHref: "/my-games/profile",
    emoji: "🏆",
  };
}
