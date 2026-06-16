"use client";

import { useEffect, useState } from "react";
import ConfettiCelebration from "@/components/live-winners/ConfettiCelebration";
import RewardRevealAnimation from "./RewardRevealAnimation";
import type { SquarePassGrantedReward } from "@/lib/platform/engines/squarePass";

interface SignupBonusRevealProps {
  open: boolean;
  onDismiss: () => void;
}

export default function SignupBonusReveal({ open, onDismiss }: SignupBonusRevealProps) {
  const [bonuses, setBonuses] = useState<
    Array<{ campaignName: string; rewards: SquarePassGrantedReward[] }>
  >([]);
  const [loaded, setLoaded] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/square-pass/signup-bonus", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { bonuses: [] }))
      .then((json) => {
        const items = (json.bonuses ?? []) as Array<{
          campaignName: string;
          rewards: SquarePassGrantedReward[];
        }>;
        setBonuses(items);
        if (items.length > 0) setConfettiTrigger((n) => n + 1);
      })
      .finally(() => setLoaded(true));
  }, [open]);

  useEffect(() => {
    if (loaded && open && bonuses.length === 0) {
      onDismiss();
    }
  }, [loaded, open, bonuses.length, onDismiss]);

  if (!open || !loaded) return null;
  if (bonuses.length === 0) return null;

  const allRewards = bonuses.flatMap((b) => b.rewards);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <ConfettiCelebration trigger={confettiTrigger} tier="large" />
      <div className="relative max-w-md w-full rounded-2xl border border-white/10 bg-sb-surface p-6 space-y-4">
        <RewardRevealAnimation
          title="Welcome to the Roster"
          message="Your exclusive welcome opportunity is unlocked."
          rewards={allRewards}
        />
        <button
          type="button"
          onClick={onDismiss}
          className="w-full rounded-xl bg-sb-purple py-3 font-semibold text-white hover:bg-sb-purple/90 transition"
        >
          Enter the Arena
        </button>
      </div>
    </div>
  );
}
