"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import WeeklyRewardDropExperience from "@/components/player/ecosystem/WeeklyRewardDropExperience";
import WeeklyDropHistoryPanel from "@/components/player/ecosystem/WeeklyDropHistoryPanel";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import { BOX_VISUALS } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import type { DropBoxType } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import {
  SQUARE_DROP_NAME,
  SQUARE_DROP_TAGLINE,
  SQUARE_DROP_READY,
} from "@/lib/platform/ecosystem/squareDropBrand";
import WeeklyDropCountdownBanner from "@/components/player/ecosystem/WeeklyDropCountdownBanner";

export default function SquareDropPanel() {
  const { data, loading, refresh } = useRewardsCenter();
  const [showDrop, setShowDrop] = useState(false);
  const [boxType, setBoxType] = useState<DropBoxType>("bronze");

  useEffect(() => {
    if (!data?.unopenedMysteryBox) return;
    void fetch("/api/ecosystem/weekly-drop", { credentials: "include" })
      .then((res) => res.json())
      .then((json: { status?: { boxType?: DropBoxType; minGameplayCents?: number } }) => {
        if (json.status?.boxType) setBoxType(json.status.boxType);
      });
  }, [data?.unopenedMysteryBox]);

  if (loading && !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading {SQUARE_DROP_NAME}…</p>;
  }

  if (!data) {
    return <p className="text-center text-red-300 py-16">Unable to load {SQUARE_DROP_NAME}.</p>;
  }

  const visual = getTierVisual(data.dashboard.tier.slug);
  const boxVisual = data.unopenedMysteryBox ? BOX_VISUALS[boxType] : null;

  return (
    <>
      <div className="space-y-6">
        {data.weeklyDropSchedule ? (
          <WeeklyDropCountdownBanner schedule={data.weeklyDropSchedule} variant="compact" />
        ) : null}

        <LandingGlassCard className="p-8 text-center relative overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} opacity-50 pointer-events-none`}
          />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.25em] text-purple-300 mb-2">🎁 {SQUARE_DROP_NAME}™</p>
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
              {data.unopenedMysteryBox ? SQUARE_DROP_READY : boxVisual?.label ?? SQUARE_DROP_NAME}
            </h3>
            <p className="text-sm text-sb-muted max-w-lg mx-auto mb-6">
              {SQUARE_DROP_TAGLINE}. After your first square or Pick&apos;em line, your first drop unlocks in 6
              days — then a new drop every 6 days after you open it.
            </p>
            {data.unopenedMysteryBox ? (
              <Button className="player-btn-glow" onClick={() => setShowDrop(true)}>
                🎁 Open {SQUARE_DROP_NAME}
              </Button>
            ) : (
              <p className="text-sm text-sb-muted">
                {data.weeklyDropSchedule?.hasStartedDropTimer
                  ? "Your next drop is on the timer above."
                  : `Place your first square or Pick'em line to start your ${SQUARE_DROP_NAME} schedule.`}
              </p>
            )}
            <Link
              href="/my-games/rewards/gift-shop"
              className="block text-xs text-purple-300 hover:text-purple-200 mt-4"
            >
              Claim rewards in Gift Shop →
            </Link>
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
          <Link href="/my-games/rewards/achievements" className="text-xs text-purple-300 hover:text-purple-200 mt-2 inline-block">
            View drop achievements →
          </Link>
        </LandingGlassCard>

        <WeeklyDropHistoryPanel />
      </div>

      <WeeklyRewardDropExperience
        open={showDrop}
        boxType={boxType}
        onClose={() => setShowDrop(false)}
        onOpened={() => void refresh({ background: true })}
      />
    </>
  );
}
