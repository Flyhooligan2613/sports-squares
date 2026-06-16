"use client";

import { JOURNEY_OPTIONS, ONBOARDING_COPY } from "@/lib/platform/engines/onboardingQueue";
import AutomationModalShell, { ContinueJourneyButton } from "@/components/square-pass/automation/AutomationModalShell";

interface ChooseJourneyModalProps {
  open: boolean;
  options?: Array<{ id: string; title: string; emoji: string; href: string }>;
  onSelect: (option: { id: string; title: string; emoji: string; href: string }) => void;
}

export default function ChooseJourneyModal({ open, options, onSelect }: ChooseJourneyModalProps) {
  const journeys = options?.length ? options : [...JOURNEY_OPTIONS];

  return (
    <AutomationModalShell open={open}>
      <div className="p-8 space-y-5">
        <div className="text-center">
          <p className="text-4xl" aria-hidden>
            🧭
          </p>
          <h2 className="text-2xl font-bold text-white mt-3">{ONBOARDING_COPY.chooseJourneyTitle}</h2>
          <p className="text-sm text-sb-muted mt-2">{ONBOARDING_COPY.chooseJourneyMessage}</p>
        </div>
        <div className="grid gap-2">
          {journeys.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:border-sb-purple/40 hover:bg-sb-purple/10 transition"
            >
              <span className="text-2xl" aria-hidden>
                {option.emoji}
              </span>
              <span className="text-sm font-semibold text-white">{option.title}</span>
            </button>
          ))}
        </div>
      </div>
    </AutomationModalShell>
  );
}
