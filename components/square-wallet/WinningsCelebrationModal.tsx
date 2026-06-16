"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

interface WinningsCelebrationModalProps {
  open: boolean;
  amountCents: number;
  contestName: string;
  onContinue: () => void;
}

export default function WinningsCelebrationModal({
  open,
  amountCents,
  contestName,
  onContinue,
}: WinningsCelebrationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <LandingGlassCard glow className="max-w-md w-full p-8 text-center border border-sb-gold/40">
        <p className="text-6xl mb-4 animate-bounce" aria-hidden>
          🏆
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">You Won!</h2>
        <p className="text-3xl font-bold text-sb-gold tabular-nums mb-2">
          ${(amountCents / 100).toFixed(2)}
        </p>
        <p className="text-sm text-sb-muted mb-6">{contestName}</p>
        <Button onClick={onContinue} className="w-full">
          See Your Options
        </Button>
      </LandingGlassCard>
    </div>
  );
}
