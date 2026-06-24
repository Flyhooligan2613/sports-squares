"use client";

import type { ReactNode } from "react";
import ConfettiCelebration from "@/components/live-winners/ConfettiCelebration";

interface AutomationModalShellProps {
  open: boolean;
  confettiTrigger?: number;
  confettiTier?: "medium" | "large";
  children: ReactNode;
}

export default function AutomationModalShell({
  open,
  confettiTrigger = 0,
  confettiTier = "large",
  children,
}: AutomationModalShellProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 sb-safe-bottom animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <ConfettiCelebration trigger={confettiTrigger} tier={confettiTier} />
      <div className="relative max-w-lg w-full rounded-2xl border border-white/10 bg-sb-surface shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {children}
      </div>
    </div>
  );
}

export function ContinueJourneyButton({
  onClick,
  loading,
  label = "Continue Journey",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-xl bg-sb-purple py-3 font-semibold text-white hover:bg-sb-purple/90 transition disabled:opacity-60"
    >
      {loading ? "Loading…" : label}
    </button>
  );
}
