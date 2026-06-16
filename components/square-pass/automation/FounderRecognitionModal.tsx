"use client";

import { AUTOMATION_COPY, FOUNDING_COMPETITOR_LIMIT } from "@/lib/platform/engines/squarePass/automation/config";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";
import { useSquarePassSound } from "./useSquarePassSound";

interface FounderRecognitionModalProps {
  open: boolean;
  founderNumber?: number;
  founderLimit?: number;
  onContinue: () => void;
}

export default function FounderRecognitionModal({
  open,
  founderNumber,
  founderLimit = FOUNDING_COMPETITOR_LIMIT,
  onContinue,
}: FounderRecognitionModalProps) {
  const sound = useSquarePassSound();

  function handleContinue() {
    sound.playCelebration();
    onContinue();
  }

  return (
    <AutomationModalShell open={open} confettiTrigger={open ? 1 : 0}>
      <div className="p-8 text-center space-y-5">
        <p className="text-5xl" aria-hidden>
          👑
        </p>
        <h2 className="text-2xl font-bold text-white">{AUTOMATION_COPY.founderTitle}</h2>
        <p className="text-sm text-sb-muted leading-relaxed">{AUTOMATION_COPY.founderMessage}</p>
        {founderNumber != null && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Competitor #{founderNumber.toLocaleString()} of {founderLimit.toLocaleString()} — your
            founding certificate is permanently recorded in your legacy.
          </p>
        )}
        <ul className="text-left text-sm text-white/80 space-y-1">
          <li>✦ Founding Competitor Badge</li>
          <li>✦ Founder Frame & Gold Theme</li>
          <li>✦ 500 Founder XP</li>
        </ul>
        <ContinueJourneyButton onClick={handleContinue} />
      </div>
    </AutomationModalShell>
  );
}
