"use client";

import { useState } from "react";
import { AUTOMATION_COPY } from "@/lib/platform/engines/squarePass/automation/config";
import type { SquarePassGrantedReward } from "@/lib/platform/engines/squarePass/types";
import RewardRevealAnimation from "@/components/square-pass/RewardRevealAnimation";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";
import { useSquarePassSound } from "./useSquarePassSound";

interface MysterySquarePassModalProps {
  open: boolean;
  onRevealed: (rewards: SquarePassGrantedReward[]) => void;
  onContinue: () => void;
}

export default function MysterySquarePassModal({
  open,
  onRevealed,
  onContinue,
}: MysterySquarePassModalProps) {
  const sound = useSquarePassSound();
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [rewards, setRewards] = useState<SquarePassGrantedReward[]>([]);
  const [confetti, setConfetti] = useState(0);

  async function reveal() {
    if (revealing || revealed) return;
    setRevealing(true);
    sound.playReveal();
    try {
      const res = await fetch("/api/square-pass/automation/reveal-mystery", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const json = (await res.json()) as {
          celebration?: { rewards?: SquarePassGrantedReward[] };
        };
        const granted = json.celebration?.rewards ?? [];
        setRewards(granted);
        setRevealed(true);
        setConfetti((n) => n + 1);
        onRevealed(granted);
      }
    } finally {
      setRevealing(false);
    }
  }

  return (
    <AutomationModalShell open={open} confettiTrigger={confetti}>
      <div className="p-8 space-y-5">
        <div className="text-center space-y-2">
          <p className="text-4xl animate-pulse" aria-hidden>
            🎁
          </p>
          <h2 className="text-xl font-bold text-white">{AUTOMATION_COPY.mysteryTitle}</h2>
          <p className="text-sm text-sb-muted">{AUTOMATION_COPY.mysteryMessage}</p>
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={() => void reveal()}
            disabled={revealing}
            className="w-full rounded-xl border border-sb-purple/50 bg-gradient-to-br from-sb-purple/30 to-sb-purple/10 py-4 font-bold text-white hover:from-sb-purple/40 transition animate-in zoom-in duration-300"
          >
            {revealing ? "Revealing…" : "Reveal My Reward"}
          </button>
        ) : (
          <RewardRevealAnimation
            title="You unlocked"
            message="Your Mystery SquarePass reward is on your Competitor Card."
            rewards={rewards}
          />
        )}

        {revealed && <ContinueJourneyButton onClick={onContinue} />}
      </div>
    </AutomationModalShell>
  );
}
