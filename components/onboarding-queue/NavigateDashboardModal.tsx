"use client";

import { useState } from "react";
import { ONBOARDING_COPY } from "@/lib/platform/engines/onboardingQueue";
import AutomationModalShell, { ContinueJourneyButton } from "@/components/square-pass/automation/AutomationModalShell";
import { useSquarePassSound } from "@/components/square-pass/automation/useSquarePassSound";

interface NavigateDashboardModalProps {
  open: boolean;
  onContinue: () => void;
}

export default function NavigateDashboardModal({ open, onContinue }: NavigateDashboardModalProps) {
  const sound = useSquarePassSound();
  const [continuing, setContinuing] = useState(false);

  function handleContinue() {
    if (continuing) return;
    setContinuing(true);
    sound.playCelebration();
    onContinue();
  }

  return (
    <AutomationModalShell open={open} confettiTrigger={open ? 1 : 0} confettiTier="large">
      <div className="p-8 text-center space-y-5">
        <p className="text-4xl" aria-hidden>
          🚀
        </p>
        <h2 className="text-2xl font-bold text-white">{ONBOARDING_COPY.navigateTitle}</h2>
        <p className="text-sm text-sb-muted">{ONBOARDING_COPY.navigateMessage}</p>
        <ContinueJourneyButton
          onClick={handleContinue}
          loading={continuing}
          label="Enter Dashboard"
        />
      </div>
    </AutomationModalShell>
  );
}
