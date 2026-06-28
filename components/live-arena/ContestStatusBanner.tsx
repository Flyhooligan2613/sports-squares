"use client";

import AnimatedCurrency from "@/components/ui/AnimatedCurrency";

interface ContestStatusBannerProps {
  userIsWinning: boolean;
  payout: number;
  visible: boolean;
  animatePayout: boolean;
}

export default function ContestStatusBanner({
  userIsWinning,
  payout,
  visible,
  animatePayout,
}: ContestStatusBannerProps) {
  if (!visible) return null;

  if (userIsWinning) {
    return (
      <div
        className="la-contest-status la-contest-status--winning la-glass-card mx-auto max-w-[420px] p-3 border-amber-400/35 bg-gradient-to-r from-amber-500/12 via-amber-400/6 to-transparent"
        role="status"
      >
        <p className="text-sm font-bold text-amber-300 text-center tracking-wide">
          🏆 YOU ARE CURRENTLY WINNING
        </p>
        <p className="text-center text-xl font-bold text-sb-gold mt-1 tabular-nums la-payout-count">
          <AnimatedCurrency amount={payout} active={animatePayout} />
        </p>
      </div>
    );
  }

  return (
    <div
      className="la-contest-status la-contest-status--idle la-glass-card mx-auto max-w-[420px] p-2.5 border-white/[0.06]"
      role="status"
    >
      <p className="text-xs font-semibold text-white/50 text-center tracking-wide">
        ⚪ YOU ARE NOT CURRENTLY WINNING
      </p>
    </div>
  );
}
