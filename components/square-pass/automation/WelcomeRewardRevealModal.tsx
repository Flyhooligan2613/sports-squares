"use client";

import { useEffect, useState } from "react";
import { AUTOMATION_COPY } from "@/lib/platform/engines/squarePass/automation/config";
import type { SquarePassGrantedReward } from "@/lib/platform/engines/squarePass/types";
import RewardRevealAnimation from "@/components/square-pass/RewardRevealAnimation";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";
import { useSquarePassSound } from "./useSquarePassSound";

interface WelcomeRewardRevealModalProps {
  open: boolean;
  onContinue: () => void;
}

export default function WelcomeRewardRevealModal({
  open,
  onContinue,
}: WelcomeRewardRevealModalProps) {
  const sound = useSquarePassSound();
  const [rewards, setRewards] = useState<SquarePassGrantedReward[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confetti, setConfetti] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    void fetch("/api/square-pass/signup-bonus", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { bonuses: [] }))
      .then((json) => {
        if (cancelled) return;
        const items = (json.bonuses ?? []) as Array<{ rewards: SquarePassGrantedReward[] }>;
        const all = items.flatMap((b) => b.rewards);
        setRewards(all);
        if (all.length > 0) {
          setConfetti(1);
          sound.playCelebration();
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !loaded) return null;

  return (
    <AutomationModalShell open={open} confettiTrigger={confetti}>
      <div className="p-8 space-y-5">
        {rewards.length > 0 ? (
          <RewardRevealAnimation
            title={AUTOMATION_COPY.rewardRevealTitle}
            message={AUTOMATION_COPY.rewardRevealMessage}
            rewards={rewards}
          />
        ) : (
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">{AUTOMATION_COPY.rewardRevealTitle}</h2>
            <p className="text-sm text-sb-muted">
              Your welcome opportunities are active — explore the Contest Center to claim more.
            </p>
          </div>
        )}
        <ContinueJourneyButton onClick={onContinue} />
      </div>
    </AutomationModalShell>
  );
}
