"use client";

import AnimatedCurrency from "@/components/ui/AnimatedCurrency";

interface WinningBannerProps {
  visible: boolean;
  payout: number;
  eventLabel?: string | null;
}

export default function WinningBanner({
  visible,
  payout,
  eventLabel,
}: WinningBannerProps) {
  if (!visible) return null;

  return (
    <div
      className="la-winning-banner la-glass-card mx-auto max-w-[420px] p-3 border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent"
      role="status"
    >
      <p className="text-sm font-bold text-amber-300 text-center">
        🏆 YOU ARE CURRENTLY WINNING
      </p>
      <p className="text-center text-lg font-bold text-sb-gold mt-1 tabular-nums">
        <AnimatedCurrency amount={payout} />
      </p>
      {eventLabel && (
        <p className="text-[10px] text-center text-sb-muted mt-1">{eventLabel}</p>
      )}
    </div>
  );
}
