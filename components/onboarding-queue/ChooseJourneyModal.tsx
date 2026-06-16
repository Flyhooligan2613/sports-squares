"use client";

import { useEffect, useMemo, useState } from "react";
import { JOURNEY_OPTIONS, ONBOARDING_COPY } from "@/lib/platform/engines/onboardingQueue";
import AutomationModalShell from "@/components/square-pass/automation/AutomationModalShell";

interface ChooseJourneyModalProps {
  open: boolean;
  options?: Array<{ id: string; title: string; emoji: string; href: string }>;
  onSelect: (option: { id: string; title: string; emoji: string; href: string }) => void;
}

const SAFE_JOURNEY_PREFIXES = ["/games/", "/pickem", "/contest-center"] as const;

function isSafeJourneyHref(href: string): boolean {
  return SAFE_JOURNEY_PREFIXES.some(
    (prefix) => href === prefix || href.startsWith(prefix)
  );
}

/** Prefer canonical config hrefs — never trust stale server payloads with dead /my-games/* paths. */
function resolveJourneyOptions(
  options?: Array<{ id: string; title: string; emoji: string; href: string }>
) {
  const canonical = new Map(JOURNEY_OPTIONS.map((option) => [option.id, option]));
  const source = options?.length ? options : [...JOURNEY_OPTIONS];

  return source
    .map((option) => {
      const known = canonical.get(option.id as (typeof JOURNEY_OPTIONS)[number]["id"]);
      return known ? { ...known } : option;
    })
    .filter((option) => isSafeJourneyHref(option.href));
}

export default function ChooseJourneyModal({ open, options, onSelect }: ChooseJourneyModalProps) {
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const journeys = useMemo(() => resolveJourneyOptions(options), [options]);

  useEffect(() => {
    if (!open) setSelectingId(null);
  }, [open]);

  function handleSelect(option: { id: string; title: string; emoji: string; href: string }) {
    if (selectingId) return;
    setSelectingId(option.id);
    onSelect(option);
  }

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
              disabled={Boolean(selectingId)}
              onClick={() => handleSelect(option)}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:border-sb-purple/40 hover:bg-sb-purple/10 transition disabled:opacity-60"
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
