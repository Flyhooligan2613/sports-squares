"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default function AdminEcosystemClient() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void fetch("/api/admin/ecosystem/config")
      .then((res) => res.json())
      .then((json) => setConfig(json as Record<string, unknown>));
  }, []);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Player Ecosystem"
        subtitle="Configure rewards marketplace, weekly drops, referrals, and tier credits."
      />

      <LandingGlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Reward Drop</h3>
        <ConfigBlock title="Drop rates & eligibility" value={config?.weeklyRewardDrop} />
      </LandingGlassCard>

      <LandingGlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active promotions</h3>
        <div className="space-y-2">
          {(config?.promotions as { title: string; slug: string; active: boolean }[] | undefined)?.map(
            (promo) => (
              <div key={promo.slug} className="flex justify-between text-sm border-b border-white/5 py-2">
                <span className="text-white">{promo.title}</span>
                <span className="text-sb-muted">{promo.active ? "Active" : "Inactive"}</span>
              </div>
            )
          )}
        </div>
      </LandingGlassCard>

      <LandingGlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rewards catalog</h3>
        <div className="space-y-2">
          {(config?.catalog as { title: string; creditCost: number; category: string }[] | undefined)?.map(
            (item) => (
              <div key={item.title} className="flex justify-between text-sm border-b border-white/5 py-2">
                <span className="text-white">{item.title}</span>
                <span className="text-sb-muted">
                  {item.creditCost} credits · {item.category}
                </span>
              </div>
            )
          )}
        </div>
      </LandingGlassCard>

      <LandingGlassCard className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
        <ConfigBlock title="Referral rules" value={config?.referral} />
        <ConfigBlock title="Tier credits" value={config?.tierCredits} />
        <ConfigBlock title="Mystery box" value={config?.mysteryBox} />
        <ConfigBlock title="Weekly reward drop" value={config?.weeklyRewardDrop} />
        <ConfigBlock title="Tier ladder" value={config?.tiers} />
      </LandingGlassCard>

      <p className="text-xs text-sb-muted">
        Full catalog editing UI can extend this panel. Config is stored in{" "}
        <code className="text-sb-purple-light">ecosystem_admin_config</code>.
      </p>
    </div>
  );
}

function ConfigBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">{title}</p>
      <pre className="text-xs text-white/80 whitespace-pre-wrap overflow-auto max-h-40">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
