"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency, formatTimeAgo } from "@/lib/liveWinners/format";
import type { LiveTvPayoutItem } from "@/lib/liveTv/types";

interface PayoutStreamProps {
  payouts: LiveTvPayoutItem[];
}

export default function PayoutStream({ payouts }: PayoutStreamProps) {
  return (
    <section>
      <h2 className="livetv-section-title">Automatic Payout Stream</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {payouts.length === 0 ? (
          <LandingGlassCard className="p-6 col-span-full text-center">
            <p className="text-sb-muted text-sm">Payouts will stream here automatically.</p>
          </LandingGlassCard>
        ) : (
          payouts.map((item, index) => (
            <LandingGlassCard
              key={item.id}
              className="livetv-payout-card p-4 admin-stat-enter"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <p className="text-xs font-bold text-sb-gold mb-1">{item.periodLabel}</p>
              <p className="text-2xl font-bold text-sb-gold tabular-nums">
                {formatCurrency(item.amount)}
              </p>
              <p className="text-sm text-white font-semibold mt-1">
                {item.awayTeam} vs {item.homeTeam}
              </p>
              <p className="text-xs text-sb-success font-semibold mt-1">Paid</p>
              <p className="text-[10px] text-sb-muted mt-1">{formatTimeAgo(item.paidAt)}</p>
            </LandingGlassCard>
          ))
        )}
      </div>
    </section>
  );
}
