"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import PlayerCardPremium from "@/components/player/ecosystem/PlayerCardPremium";
import MysteryBoxModal from "@/components/player/ecosystem/MysteryBoxModal";
import type { EcosystemDashboard, RewardsCatalogItem } from "@/lib/platform/ecosystem/types";

export default function PlayerEcosystemHub() {
  const [dashboard, setDashboard] = useState<EcosystemDashboard | null>(null);
  const [catalog, setCatalog] = useState<RewardsCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBox, setShowBox] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [dashRes, rewardsRes] = await Promise.all([
      fetch("/api/ecosystem/dashboard", { cache: "no-store", credentials: "include" }),
      fetch("/api/ecosystem/rewards", { cache: "no-store" }),
    ]);
    const dash = (await dashRes.json()) as EcosystemDashboard & { error?: string };
    const rewards = (await rewardsRes.json()) as { catalog?: RewardsCatalogItem[] };
    if (!dashRes.ok) {
      setError(dash.error ?? "Could not load ecosystem.");
      setLoading(false);
      return;
    }
    setDashboard(dash);
    setCatalog(rewards.catalog ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function redeem(itemId: string) {
    setBusyId(itemId);
    const res = await fetch("/api/ecosystem/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ catalogItemId: itemId }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Redemption failed.");
      return;
    }
    await load();
  }

  if (loading) {
    return <p className="text-center text-sb-muted py-20 animate-pulse">Loading Player Ecosystem…</p>;
  }

  if (error && !dashboard) {
    return <p className="text-center text-red-300 py-20">{error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 space-y-8">
      <PageHeader
        title="Player Ecosystem"
        subtitle="Progression, rewards, referrals, and your SquareBoards legacy."
      />

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <PlayerCardPremium />

      {dashboard?.unopenedMysteryBox ? (
        <LandingGlassCard className="p-5 flex flex-wrap items-center justify-between gap-4 border border-amber-500/30">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-300">Mystery Reward Box</p>
            <p className="text-white font-semibold">Your weekly box is ready to open</p>
          </div>
          <Button onClick={() => setShowBox(true)}>Open Box</Button>
        </LandingGlassCard>
      ) : null}

      <div className="grid md:grid-cols-2 gap-6">
        <LandingGlassCard className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-white">Tier Credits</h3>
          <p className="text-3xl font-bold text-sb-purple-light">
            {dashboard?.account.availableTierCredits.toLocaleString() ?? 0}
          </p>
          <p className="text-sm text-sb-muted">
            Lifetime {dashboard?.account.lifetimeTierCredits.toLocaleString() ?? 0} · This week{" "}
            {dashboard?.account.weeklyTierCredits.toLocaleString() ?? 0}
          </p>
          <p className="text-sm text-sb-muted">
            Square wallet ${((dashboard?.account.squareCreditsCents ?? 0) / 100).toFixed(2)}
          </p>
        </LandingGlassCard>

        <LandingGlassCard className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-white">Referrals</h3>
          <p className="text-sm text-sb-muted">
            Code <span className="text-white font-mono">{dashboard?.referral.referralCode}</span>
          </p>
          <p className="text-sm text-sb-muted">
            {dashboard?.referral.qualifiedReferrals} qualified ·{" "}
            {dashboard?.referral.totalReferrals} total
          </p>
          <Link href="/my-games/referrals">
            <Button variant="secondary">Refer & Earn</Button>
          </Link>
        </LandingGlassCard>
      </div>

      <LandingGlassCard className="p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rewards Marketplace</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {catalog.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3"
            >
              <div>
                <p className="text-white font-medium">{item.title}</p>
                <p className="text-xs text-sb-muted mt-1">{item.description}</p>
              </div>
              <div className="flex items-center justify-between gap-2 mt-auto">
                <span className="text-sm text-sb-purple-light font-semibold">
                  {item.creditCost.toLocaleString()} credits
                </span>
                <Button size="sm" disabled={busyId === item.id} onClick={() => void redeem(item.id)}>
                  Redeem
                </Button>
              </div>
            </div>
          ))}
        </div>
      </LandingGlassCard>

      <MysteryBoxModal open={showBox} onClose={() => setShowBox(false)} onOpened={() => void load()} />
    </div>
  );
}
