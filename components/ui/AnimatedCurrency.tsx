"use client";

import { useLiveStat } from "@/lib/motion/useLiveStat";
import { formatCurrency } from "@/lib/liveWinners/format";

interface AnimatedCurrencyProps {
  amount: number;
  active?: boolean;
  className?: string;
}

export default function AnimatedCurrency({
  amount,
  active = true,
  className = "",
}: AnimatedCurrencyProps) {
  const { value, glowing } = useLiveStat(amount, active);

  return (
    <span
      className={[
        "tabular-nums transition-all duration-300",
        glowing ? "sb-stat-glow text-sb-gold" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {formatCurrency(value)}
    </span>
  );
}
