"use client";

import { formatCurrency } from "@/lib/liveWinners/format";
import type { TickerPayout } from "@/lib/liveWinners/types";

interface RecentPayoutsTickerProps {
  payouts: TickerPayout[];
}

export default function RecentPayoutsTicker({ payouts }: RecentPayoutsTickerProps) {
  if (payouts.length === 0) return null;

  const items =
    payouts.length < 6
      ? [...payouts, ...payouts, ...payouts, ...payouts]
      : [...payouts, ...payouts];

  return (
    <div className="lwc-ticker-wrap" aria-label="Recent payouts">
      <div className="lwc-ticker-fade lwc-ticker-fade-left" aria-hidden />
      <div className="lwc-ticker-fade lwc-ticker-fade-right" aria-hidden />
      <div className="lwc-ticker-track">
        {items.map((item, index) => (
          <span key={`${item.id}-${index}`} className="lwc-ticker-item">
            <span className="lwc-ticker-icon">🏆</span>
            <span className="lwc-ticker-amount">{formatCurrency(item.amount)} Paid</span>
          </span>
        ))}
      </div>
    </div>
  );
}
