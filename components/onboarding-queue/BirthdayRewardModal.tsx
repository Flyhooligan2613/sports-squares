"use client";

import { ONBOARDING_COPY } from "@/lib/platform/engines/onboardingQueue";
import AutomationModalShell, { ContinueJourneyButton } from "@/components/square-pass/automation/AutomationModalShell";
import { useSquarePassSound } from "@/components/square-pass/automation/useSquarePassSound";

interface BirthdayRewardModalProps {
  open: boolean;
  rewardLabel?: string;
  onContinue: () => void;
}

export default function BirthdayRewardModal({
  open,
  rewardLabel,
  onContinue,
}: BirthdayRewardModalProps) {
  const sound = useSquarePassSound();

  return (
    <AutomationModalShell open={open} confettiTrigger={open ? 1 : 0}>
      <div className="p-8 text-center space-y-5">
        <p className="text-4xl" aria-hidden>
          🎂
        </p>
        <h2 className="text-2xl font-bold text-white">{ONBOARDING_COPY.birthdayTitle}</h2>
        <p className="text-sm text-sb-muted">{ONBOARDING_COPY.birthdayMessage}</p>
        {rewardLabel ? (
          <p className="text-sm font-semibold text-sb-glow">{rewardLabel}</p>
        ) : null}
        <ContinueJourneyButton
          onClick={() => {
            sound.playCelebration();
            onContinue();
          }}
          label="Claim Birthday Reward"
        />
      </div>
    </AutomationModalShell>
  );
}
