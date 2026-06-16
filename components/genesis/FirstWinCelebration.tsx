"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useGenesis } from "@/components/genesis/GenesisProvider";

export default function FirstWinCelebration() {
  const { progress, refresh } = useGenesis();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (progress?.firstWinPendingCelebration) setOpen(true);
  }, [progress?.firstWinPendingCelebration]);

  if (!open) return null;

  async function dismiss() {
    await fetch("/api/genesis/celebrate-first-win", { method: "POST", credentials: "include" }).catch(
      () => undefined
    );
    setOpen(false);
    await refresh();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <LandingGlassCard glow className="max-w-md w-full p-8 text-center border border-sb-gold/30">
        <p className="text-5xl mb-4" aria-hidden>
          🏆
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">Your first win!</h2>
        <p className="text-sm text-sb-muted mb-6">
          You earned it — this is how legacies begin on SquareBoards. Share your Competitor Card and
          keep the momentum going.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/my-games/profile">View profile</Button>
          <Button variant="ghost" onClick={() => void dismiss()}>
            Continue
          </Button>
        </div>
      </LandingGlassCard>
    </div>
  );
}
