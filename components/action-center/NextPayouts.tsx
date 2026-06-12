"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { NextPayoutItem } from "@/lib/actionCenter/types";

interface NextPayoutsProps {
  payouts: NextPayoutItem[];
}

export default function NextPayouts({ payouts }: NextPayoutsProps) {
  return (
    <section>
      <h2 className="ac-section-title">Next Payouts</h2>
      {payouts.length === 0 ? (
        <LandingGlassCard className="p-6">
          <SectionEmptyState
            emoji="💰"
            title="Payouts on deck"
            description="Upcoming quarter and final payout windows will appear here as games progress."
            compact
          />
        </LandingGlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {payouts.map((item) => (
            <Link key={item.id} href={`/pool/${item.poolId}`}>
              <LandingGlassCard className="ac-payout-card p-4 h-full hover:border-sb-glow/30 transition-colors">
                <p className="text-xs font-bold text-sb-gold mb-1">🏆 {item.periodLabel}</p>
                <p className="text-sm font-bold text-white mb-2">
                  {item.awayTeam} vs {item.homeTeam}
                </p>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-sb-muted">
                      Estimated
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {item.estimatedLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-sb-muted">
                      Prize Pool
                    </p>
                    <p className="text-lg font-bold text-sb-gold tabular-nums">
                      {formatCurrency(item.prizePool)}
                    </p>
                  </div>
                </div>
              </LandingGlassCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
