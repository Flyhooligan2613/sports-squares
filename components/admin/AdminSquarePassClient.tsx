"use client";

import { useCallback, useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import type { SquarePassAnalytics, SquarePassCampaign } from "@/lib/platform/engines/squarePass";

export default function AdminSquarePassClient() {
  const [campaigns, setCampaigns] = useState<SquarePassCampaign[]>([]);
  const [analytics, setAnalytics] = useState<SquarePassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaignRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/square-pass/campaigns"),
        fetch("/api/admin/square-pass/analytics"),
      ]);
      const campaignJson = await campaignRes.json();
      const analyticsJson = await analyticsRes.json();
      if (!campaignRes.ok) throw new Error(campaignJson.error ?? "Failed to load campaigns.");
      setCampaigns(campaignJson.campaigns ?? []);
      setAnalytics(analyticsJson.analytics ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleCampaign(id: string, active: boolean) {
    await fetch(`/api/admin/square-pass/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    void load();
  }

  async function runScheduler() {
    await fetch("/api/admin/square-pass/analytics", { method: "POST" });
    void load();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="SquarePass™"
        subtitle="Dynamic promotion & referral engine — configure campaigns without app updates."
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {analytics ? (
        <div className="grid sm:grid-cols-4 gap-4">
          <StatCard label="Redemptions" value={analytics.totalRedemptions} />
          <StatCard label="Today" value={analytics.redemptionsToday} />
          <StatCard label="Referral Rate" value={`${analytics.referralConversionRate}%`} />
          <StatCard label="XP Distributed" value={analytics.xpDistributed} />
        </div>
      ) : null}

      <LandingGlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Campaigns</h3>
          <Button variant="secondary" onClick={() => void runScheduler()}>
            Run Scheduler
          </Button>
        </div>

        {loading ? (
          <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 py-3"
              >
                <div>
                  <p className="text-white font-medium">{c.name}</p>
                  <p className="text-xs text-sb-muted">
                    {c.campaignType} · {c.slug} · {c.totalRedemptions} redemptions
                  </p>
                </div>
                <Button variant="secondary" onClick={() => void toggleCampaign(c.id, c.active)}>
                  {c.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </LandingGlassCard>

      {analytics?.topCodes?.length ? (
        <LandingGlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Codes</h3>
          <div className="space-y-2">
            {analytics.topCodes.map((row) => (
              <div key={row.code} className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="font-mono text-white">{row.code}</span>
                <span className="text-sb-muted">
                  {row.redemptions} · {row.campaignName}
                </span>
              </div>
            ))}
          </div>
        </LandingGlassCard>
      ) : null}

      {analytics?.dataGaps?.length ? (
        <p className="text-xs text-amber-400">{analytics.dataGaps.join(" ")}</p>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <LandingGlassCard className="p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-sb-muted uppercase tracking-wider">{label}</p>
    </LandingGlassCard>
  );
}
