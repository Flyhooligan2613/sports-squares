"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import LandingGlassCard from "@/components/landing/LandingGlassCard";

interface FirstLossEncouragementProps {
  open?: boolean;
  onClose?: () => void;
}

export default function FirstLossEncouragement({
  open: controlledOpen,
  onClose,
}: FirstLossEncouragementProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  if (!open) return null;

  function close() {
    setInternalOpen(false);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <LandingGlassCard className="max-w-md w-full p-8 text-center border border-purple-500/30">
        <p className="text-5xl mb-4" aria-hidden>
          💪
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">Tough break — keep competing</h2>
        <p className="text-sm text-sb-muted mb-6">
          Every champion loses quarters before they win championships. Your Competitor Score rewards
          showing up — join the next contest and stay in the fight.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/contest-center">Browse live contests</Button>
          <Button variant="ghost" onClick={close}>
            Continue
          </Button>
        </div>
      </LandingGlassCard>
    </div>
  );
}
