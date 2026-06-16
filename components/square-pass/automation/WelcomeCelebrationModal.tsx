"use client";

import { AUTOMATION_COPY } from "@/lib/platform/engines/squarePass/automation/config";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";
import { useSquarePassSound } from "./useSquarePassSound";

interface WelcomeCelebrationModalProps {
  open: boolean;
  onContinue: () => void;
}

export default function WelcomeCelebrationModal({ open, onContinue }: WelcomeCelebrationModalProps) {
  const sound = useSquarePassSound();

  function handleContinue() {
    sound.playCelebration();
    onContinue();
  }

  return (
    <AutomationModalShell open={open} confettiTrigger={open ? 1 : 0}>
      <div className="p-8 text-center space-y-5">
        <p className="text-4xl" aria-hidden>
          🏟️
        </p>
        <h2 className="text-2xl font-bold text-white">{AUTOMATION_COPY.welcomeTitle}</h2>
        <p className="text-sm text-sb-muted leading-relaxed">{AUTOMATION_COPY.welcomeMessage}</p>
        <ContinueJourneyButton onClick={handleContinue} />
      </div>
    </AutomationModalShell>
  );
}
