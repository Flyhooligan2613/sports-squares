"use client";

import { useState } from "react";
import { AUTOMATION_COPY } from "@/lib/platform/engines/squarePass/automation/config";
import type { SquarePassGrantedReward } from "@/lib/platform/engines/squarePass/types";
import RewardRevealAnimation from "@/components/square-pass/RewardRevealAnimation";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";
import { useSquarePassSound } from "./useSquarePassSound";

interface DailySquarePassModalProps {
  open: boolean;
  onContinue: () => void;
}

export default function DailySquarePassModal({ open, onContinue }: DailySquarePassModalProps) {
  const sound = useSquarePassSound();
  const [revealed, setRevealed] = useState(false);
  const [rewards, setRewards] = useState<SquarePassGrantedReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(0);

  async function reveal() {
    setLoading(true);
    sound.playReveal();
    try {
      const res = await fetch("/api/square-pass/automation/daily-bonus", {
        credentials: "include",
      });
      if (res.ok) {
        const json = (await res.json()) as { rewards?: SquarePassGrantedReward[] };
        setRewards(json.rewards ?? []);
        setRevealed(true);
        setConfetti(1);
        sound.playCelebration();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomationModalShell open={open} confettiTrigger={confetti}>
      <div className="p-8 space-y-5">
        <div className="text-center space-y-2">
          <p className="text-4xl" aria-hidden>
            ☀️
          </p>
          <h2 className="text-xl font-bold text-white">{AUTOMATION_COPY.dailyTitle}</h2>
          <p className="text-sm text-sb-muted">{AUTOMATION_COPY.dailyMessage}</p>
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={() => void reveal()}
            disabled={loading}
            className="w-full rounded-xl bg-sb-purple py-3 font-semibold text-white hover:bg-sb-purple/90 transition"
          >
            {loading ? "Revealing…" : "Reveal Daily Bonus"}
          </button>
        ) : (
          <>
            <RewardRevealAnimation
              title="Daily SquarePass"
              message="Come back tomorrow for your next exclusive opportunity."
              rewards={rewards}
            />
            <ContinueJourneyButton onClick={onContinue} />
          </>
        )}
      </div>
    </AutomationModalShell>
  );
}
