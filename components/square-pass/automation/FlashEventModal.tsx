"use client";

import { useEffect, useState } from "react";
import { AUTOMATION_COPY } from "@/lib/platform/engines/squarePass/automation/config";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";

interface FlashEventModalProps {
  open: boolean;
  flashEndsAt?: string | null;
  flashCampaignSlug?: string;
  onContinue: () => void;
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function FlashEventModal({
  open,
  flashEndsAt,
  flashCampaignSlug,
  onContinue,
}: FlashEventModalProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !flashEndsAt) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(flashEndsAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [open, flashEndsAt]);

  return (
    <AutomationModalShell open={open} confettiTrigger={open ? 1 : 0}>
      <div className="p-8 space-y-5 text-center">
        <span className="inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase text-red-300">
          Flash Event · Double XP
        </span>
        <h2 className="text-xl font-bold text-white">{AUTOMATION_COPY.flashTitle}</h2>
        <p className="text-sm text-sb-muted">{AUTOMATION_COPY.flashMessage}</p>
        {secondsLeft != null && flashEndsAt && (
          <p className="text-2xl font-mono font-bold text-sb-glow">
            {formatCountdown(secondsLeft)}
          </p>
        )}
        {flashCampaignSlug && (
          <p className="text-xs text-sb-muted">Event: {flashCampaignSlug}</p>
        )}
        <ContinueJourneyButton onClick={onContinue} label="Claim Flash Bonus" />
      </div>
    </AutomationModalShell>
  );
}
