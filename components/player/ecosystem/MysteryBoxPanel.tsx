"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import MysteryBoxModal from "@/components/player/ecosystem/MysteryBoxModal";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";

export default function MysteryBoxPanel() {
  const { data, loading, refresh } = useRewardsCenter();
  const [showBox, setShowBox] = useState(false);

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading mystery box…</p>;
  }

  const visual = getTierVisual(data.dashboard.tier.slug);
  const qualified = data.dashboard.account.weeklyGameplayCents >= 50000;

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-8 text-center relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} opacity-50 pointer-events-none`}
        />
        <div className="relative">
          <div
            className={`mx-auto w-32 h-32 rounded-2xl flex items-center justify-center text-6xl mb-6 ${
              data.unopenedMysteryBox ? "animate-pulse shadow-[0_0_60px_rgba(251,191,36,0.5)]" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, rgba(91,76,247,0.4), rgba(251,191,36,0.2))",
              border: "2px solid rgba(251,191,36,0.4)",
            }}
          >
            🎲
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Weekly Mystery Box</h3>
          <p className="text-sm text-sb-muted max-w-md mx-auto mb-6">
            Every Monday, players with $500+ weekly gameplay qualify. Higher tiers unlock better reward
            pools — Tier Credits, Square Credits, badges, VIP tickets, and more.
          </p>
          <p className="text-xs text-sb-muted mb-4">
            This week: ${(data.dashboard.account.weeklyGameplayCents / 100).toFixed(2)} gameplay ·{" "}
            {qualified ? "Qualified ✓" : `$${((50000 - data.dashboard.account.weeklyGameplayCents) / 100).toFixed(2)} to qualify`}
          </p>
          {data.unopenedMysteryBox ? (
            <Button onClick={() => setShowBox(true)}>
              Open Mystery Box
            </Button>
          ) : (
            <p className="text-sm text-sb-muted">
              {qualified
                ? "Check back Monday for your next box, or you've already opened this week's."
                : "Keep playing to unlock your weekly box."}
            </p>
          )}
        </div>
      </LandingGlassCard>

      <LandingGlassCard className="p-5">
        <h4 className="font-semibold text-white mb-3">Your tier pool — {data.dashboard.tier.displayName}</h4>
        <p className="text-sm text-sb-muted">
          {visual.icon} Higher tiers receive better credit ranges, bonus Square Credits, exclusive badges,
          and VIP giveaway entries.
        </p>
        <p className="text-sm text-white mt-3">
          Boxes opened: {data.dashboard.account.mysteryBoxesOpened}
        </p>
      </LandingGlassCard>

      <MysteryBoxModal
        open={showBox}
        onClose={() => setShowBox(false)}
        onOpened={() => void refresh()}
      />
    </div>
  );
}
