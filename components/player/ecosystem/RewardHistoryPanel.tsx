"use client";

import { useMemo } from "react";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { buildRewardHistoryTimeline } from "@/lib/platform/ecosystem/progressionDisplay";
import { REWARDS_SECTIONS } from "@/lib/platform/language/rewardsLanguage";

export default function RewardHistoryPanel() {
  const { data, loading, error } = useRewardsCenter();

  const timeline = useMemo(() => {
    if (!data) return [];
    return buildRewardHistoryTimeline({
      creditHistory: data.creditHistory,
      redemptionHistory: data.redemptionHistory,
    });
  }, [data]);

  if (loading || !data) {
    return (
      <div className="space-y-4 py-8">
        <div className="sb-xp-skeleton h-48 rounded-2xl" />
        <div className="sb-xp-skeleton h-32 rounded-2xl" />
        <BrandedLoadingLabel context="rewardDrop" className="text-center text-sb-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <LandingGlassCard className="p-8 text-center">
        <p className="text-sm text-amber-200/90">{error}</p>
      </LandingGlassCard>
    );
  }

  if (!timeline.length) {
    return <AliveEmptyState context="no_rewards_history" emoji="📜" />;
  }

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-5 sb-card-lift">
        <h3 className="text-lg font-semibold text-white mb-1">{REWARDS_SECTIONS.rewardHistory}</h3>
        <p className="text-xs text-sb-muted mb-5">Credits earned, rewards claimed, and fulfillment status</p>

        <ol className="relative border-l border-white/10 ml-3 space-y-0" aria-label="Reward history timeline">
          {timeline.map((row, idx) => (
            <li key={row.id} className="relative pl-6 pb-6 last:pb-0">
              <span
                className={[
                  "absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-sb-bg",
                  row.kind === "earn" ? "bg-emerald-400" : "bg-sb-purple",
                ].join(" ")}
                aria-hidden
              />
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 sb-card-lift">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-white">{row.title}</p>
                  <time className="text-xs text-sb-muted tabular-nums" dateTime={row.date}>
                    {new Date(row.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <dt className="text-sb-muted uppercase tracking-wider text-[9px]">Source</dt>
                    <dd className="text-white capitalize mt-0.5">{row.source}</dd>
                  </div>
                  <div>
                    <dt className="text-sb-muted uppercase tracking-wider text-[9px]">Status</dt>
                    <dd className="text-white capitalize mt-0.5">{row.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sb-muted uppercase tracking-wider text-[9px]">Reference</dt>
                    <dd className="text-white font-mono mt-0.5">{row.reference}</dd>
                  </div>
                  <div>
                    <dt className="text-sb-muted uppercase tracking-wider text-[9px]">Type</dt>
                    <dd className="text-white capitalize mt-0.5">
                      {row.kind === "earn" ? "Reward earned" : "Redemption"}
                    </dd>
                  </div>
                </dl>
              </div>
              {idx < timeline.length - 1 ? (
                <span className="sr-only">Next entry</span>
              ) : null}
            </li>
          ))}
        </ol>
      </LandingGlassCard>

      {data.legacy ? (
        <LandingGlassCard className="p-5 sb-card-lift">
          <h3 className="text-lg font-semibold text-white mb-4">Player Legacy</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <LegacyStat label="Lifetime Gameplay" value={`$${(data.legacy.lifetimeGameplayCents / 100).toFixed(0)}`} />
            <LegacyStat label="Lifetime Purchases" value={`$${(data.legacy.lifetimePurchasesCents / 100).toFixed(0)}`} />
            <LegacyStat label="Lifetime Rewards" value={data.legacy.lifetimeRewardsEarned.toLocaleString()} />
            <LegacyStat label="Square Drops Opened" value={String(data.legacy.mysteryBoxesOpened)} />
            <LegacyStat label="Rewards Redeemed" value={String(data.legacy.rewardsRedeemed)} />
            <LegacyStat label="Boards Played" value={String(data.legacy.boardsPlayed)} />
            <LegacyStat label="Seasons" value={String(data.legacy.seasonsPlayed)} />
            <LegacyStat label="Longest Streak" value={String(data.legacy.longestStreak)} />
            <LegacyStat label="Login Streak" value={String(data.legacy.loginStreakDays)} />
          </div>
        </LandingGlassCard>
      ) : null}
    </div>
  );
}

function LegacyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 min-h-[56px]">
      <p className="text-[10px] uppercase tracking-wider text-sb-muted">{label}</p>
      <p className="font-bold text-white mt-1 tabular-nums">{value}</p>
    </div>
  );
}
