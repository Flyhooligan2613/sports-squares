"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import WeeklyRewardDropExperience from "@/components/player/ecosystem/WeeklyRewardDropExperience";
import WeeklyDropHistoryPanel from "@/components/player/ecosystem/WeeklyDropHistoryPanel";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import { BOX_VISUALS } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import type { DropBoxType } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";

export default function MysteryBoxPanel() {
  const { data, loading, refresh } = useRewardsCenter();
  const [showDrop, setShowDrop] = useState(false);
  const [boxType, setBoxType] = useState<DropBoxType>("bronze");

  useEffect(() => {
    if (!data?.unopenedMysteryBox) return;
    void fetch("/api/ecosystem/weekly-drop", { credentials: "include" })
      .then((res) => res.json())
      .then((json: { status?: { boxType?: DropBoxType } }) => {
        if (json.status?.boxType) setBoxType(json.status.boxType);
      });
  }, [data?.unopenedMysteryBox]);

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading Weekly Reward Drop…</p>;
  }

  const visual = getTierVisual(data.dashboard.tier.slug);
  const minCents = 50000;
  const qualified = data.dashboard.account.weeklyGameplayCents >= minCents;
  const boxVisual = data.unopenedMysteryBox ? BOX_VISUALS[boxType] : null;

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-8 text-center relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} opacity-50 pointer-events-none`}
        />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">🎁 Weekly Reward Drop</p>
          <div
            className={`mx-auto w-32 h-32 rounded-2xl flex items-center justify-center text-6xl mb-6 ${
              data.unopenedMysteryBox ? "wrd-panel-cube-ready" : ""
            }`}
            style={
              boxVisual
                ? { boxShadow: `0 0 60px ${boxVisual.glow}66`, border: `2px solid ${boxVisual.glow}88` }
                : undefined
            }
          >
            {boxVisual?.emoji ?? "🎁"}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {boxVisual?.label ?? "Weekly Reward Drop"}
          </h3>
          <p className="text-sm text-sb-muted max-w-lg mx-auto mb-6">
            The signature SquareBoards experience. Qualify through weekly gameplay, VIP promotions,
            referral milestones, and special events — then open your premium reward crate.
          </p>
          <p className="text-xs text-sb-muted mb-4">
            This week: ${(data.dashboard.account.weeklyGameplayCents / 100).toFixed(2)} gameplay ·{" "}
            {qualified ? "Qualified ✓" : `$${((minCents - data.dashboard.account.weeklyGameplayCents) / 100).toFixed(2)} to qualify`}
          </p>
          {data.unopenedMysteryBox ? (
            <Button className="player-btn-glow" onClick={() => setShowDrop(true)}>
              🎁 Open Weekly Reward Drop
            </Button>
          ) : (
            <p className="text-sm text-sb-muted">
              {qualified
                ? "You've opened this week's drop — check back Monday!"
                : "Keep playing to unlock your Weekly Reward Drop."}
            </p>
          )}
        </div>
      </LandingGlassCard>

      <LandingGlassCard className="p-5">
        <h4 className="font-semibold text-white mb-3">Drop tiers by player tier</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {Object.entries(BOX_VISUALS).map(([key, v]) => (
            <div key={key} className="rounded-lg border border-white/10 px-3 py-2 text-sb-muted">
              {v.emoji} {v.label}
            </div>
          ))}
        </div>
        <p className="text-sm text-white mt-3">
          Your tier: {visual.icon} {data.dashboard.tier.displayName} · Drops opened:{" "}
          {data.dashboard.account.mysteryBoxesOpened}
        </p>
      </LandingGlassCard>

      <WeeklyDropHistoryPanel />

      <WeeklyRewardDropExperience
        open={showDrop}
        boxType={boxType}
        onClose={() => setShowDrop(false)}
        onOpened={() => void refresh()}
      />
    </div>
  );
}
