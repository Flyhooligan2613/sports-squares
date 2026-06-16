"use client";

import { GENESIS_STARTING_COMPETITOR_SCORE } from "@/lib/platform/engines/genesis";
import { ONBOARDING_COPY } from "@/lib/platform/engines/onboardingQueue";
import AutomationModalShell, { ContinueJourneyButton } from "@/components/square-pass/automation/AutomationModalShell";

interface CompetitorScoreOnboardingModalProps {
  open: boolean;
  score?: {
    total: number;
    genesisStartingBonus?: number;
    rankTitle: string;
  };
  onContinue: () => void;
}

export default function CompetitorScoreOnboardingModal({
  open,
  score,
  onContinue,
}: CompetitorScoreOnboardingModalProps) {
  const bonus = score?.genesisStartingBonus ?? GENESIS_STARTING_COMPETITOR_SCORE;
  const total = score?.total ?? GENESIS_STARTING_COMPETITOR_SCORE;

  return (
    <AutomationModalShell open={open}>
      <div className="p-8 text-center space-y-5">
        <p className="text-4xl" aria-hidden>
          📊
        </p>
        <h2 className="text-2xl font-bold text-white">{ONBOARDING_COPY.competitorScoreTitle}</h2>
        <p className="text-3xl font-bold text-sb-glow">{total}</p>
        <p className="text-xs uppercase tracking-wider text-sb-muted">{score?.rankTitle ?? "Rookie"}</p>
        <div className="rounded-xl border border-sb-glow/20 bg-sb-glow/5 p-4 text-left">
          <p className="text-[10px] uppercase tracking-wider text-sb-glow mb-1">Rookie Starting Score</p>
          <p className="text-sm text-white font-medium">
            Why {GENESIS_STARTING_COMPETITOR_SCORE}? Every official competitor begins with merit on
            the board — not wallet balance. Your score grows through contests, wins, achievements,
            and community reputation.
          </p>
          <p className="text-xs text-sb-muted mt-2">
            Current merit breakdown: {total - bonus} earned + {bonus} Rookie Season floor
          </p>
        </div>
        <ContinueJourneyButton onClick={onContinue} />
      </div>
    </AutomationModalShell>
  );
}
