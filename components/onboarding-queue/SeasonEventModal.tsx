"use client";

import { ONBOARDING_COPY } from "@/lib/platform/engines/onboardingQueue";
import AutomationModalShell, { ContinueJourneyButton } from "@/components/square-pass/automation/AutomationModalShell";

interface SeasonEventModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onContinue: () => void;
}

export default function SeasonEventModal({ open, title, message, onContinue }: SeasonEventModalProps) {
  return (
    <AutomationModalShell open={open}>
      <div className="p-8 text-center space-y-5">
        <p className="text-4xl" aria-hidden>
          🏆
        </p>
        <h2 className="text-2xl font-bold text-white">{title ?? ONBOARDING_COPY.seasonTitle}</h2>
        <p className="text-sm text-sb-muted">{message ?? ONBOARDING_COPY.seasonMessage}</p>
        <ContinueJourneyButton onClick={onContinue} label="Claim Season Bonus" />
      </div>
    </AutomationModalShell>
  );
}
