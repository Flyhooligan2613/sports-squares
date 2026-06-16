"use client";

import { useState } from "react";
import { AUTOMATION_COPY } from "@/lib/platform/engines/squarePass/automation/config";
import type { SquarePassGrantedReward } from "@/lib/platform/engines/squarePass/types";
import RewardRevealAnimation from "@/components/square-pass/RewardRevealAnimation";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";
import { useSquarePassSound } from "./useSquarePassSound";

interface SurpriseRewardModalProps {
  open: boolean;
  surpriseSlug?: string;
  onContinue: () => void;
}

export default function SurpriseRewardModal({
  open,
  surpriseSlug,
  onContinue,
}: SurpriseRewardModalProps) {
  const sound = useSquarePassSound();
  const [revealed, setRevealed] = useState(false);
  const [rewards, setRewards] = useState<SquarePassGrantedReward[]>([
    { type: "xp", label: "75 Surprise XP", amount: 75 },
  ]);
  const [confetti, setConfetti] = useState(0);

  function reveal() {
    sound.playReveal();
    setRevealed(true);
    setConfetti(1);
    sound.playCelebration();
    void surpriseSlug;
  }

  return (
    <AutomationModalShell open={open} confettiTrigger={confetti}>
      <div className="p-8 space-y-5">
        <div className="text-center space-y-2">
          <p className="text-4xl animate-bounce" aria-hidden>
            ✨
          </p>
          <h2 className="text-xl font-bold text-white">{AUTOMATION_COPY.surpriseTitle}</h2>
          <p className="text-sm text-sb-muted">{AUTOMATION_COPY.surpriseMessage}</p>
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={reveal}
            className="w-full rounded-xl border border-sb-glow/40 bg-sb-glow/10 py-3 font-semibold text-white transition hover:bg-sb-glow/20"
          >
            Open Surprise
          </button>
        ) : (
          <>
            <RewardRevealAnimation
              title="Surprise Unlocked"
              message="A hidden reward just landed on your Competitor Card."
              rewards={rewards}
            />
            <ContinueJourneyButton onClick={onContinue} />
          </>
        )}
      </div>
    </AutomationModalShell>
  );
}
