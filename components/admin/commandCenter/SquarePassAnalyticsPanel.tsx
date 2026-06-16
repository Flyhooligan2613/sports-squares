"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { SquarePassAnalytics } from "@/lib/platform/engines/squarePass";

export default function SquarePassAnalyticsPanel() {
  const [analytics, setAnalytics] = useState<SquarePassAnalytics | null>(null);

  useEffect(() => {
    void fetch("/api/admin/square-pass/analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setAnalytics(json?.analytics ?? null));
  }, []);

  if (!analytics) return null;

  return (
    <LandingGlassCard className="p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-sb-muted">SquarePass™</p>
        <h3 className="text-lg font-semibold text-white">Promotion & Referral Analytics</h3>
      </div>
      <div className="grid sm:grid-cols-4 gap-4 text-center">
        <Metric label="Redemptions" value={analytics.totalRedemptions} />
        <Metric label="Today" value={analytics.redemptionsToday} />
        <Metric label="Referrals" value={analytics.totalReferrals} />
        <Metric label="XP Granted" value={analytics.xpDistributed} />
      </div>
      {analytics.dataGaps.length > 0 ? (
        <p className="text-xs text-amber-400">{analytics.dataGaps.join(" ")}</p>
      ) : null}
    </LandingGlassCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-sb-muted">{label}</p>
    </div>
  );
}
