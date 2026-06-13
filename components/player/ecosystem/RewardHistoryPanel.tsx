"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";

export default function RewardHistoryPanel() {
  const { data, loading } = useRewardsCenter();

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading history…</p>;
  }

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Credit Activity</h3>
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {data.creditHistory.map((entry) => (
            <li key={entry.id} className="flex justify-between text-sm border-b border-white/5 py-2">
              <span className="text-white capitalize">
                {entry.entryType === "earn" ? "+" : "−"}
                {entry.amount} {entry.creditKind} · {entry.source.replace(/_/g, " ")}
              </span>
              <span className="text-sb-muted text-xs">
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
          {!data.creditHistory.length ? (
            <li className="text-sm text-sb-muted py-4 text-center">No credit activity yet.</li>
          ) : null}
        </ul>
      </LandingGlassCard>

      <LandingGlassCard className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Claimed Rewards</h3>
        <ul className="space-y-2">
          {data.redemptionHistory.map((r) => (
            <li key={r.id as string} className="flex justify-between text-sm border-b border-white/5 py-2">
              <span className="text-white">
                {(r.credits_spent as number).toLocaleString()} credits redeemed
              </span>
              <span className="text-sb-muted capitalize">
                {r.status as string} · {new Date(r.created_at as string).toLocaleDateString()}
              </span>
            </li>
          ))}
          {!data.redemptionHistory.length ? (
            <li className="text-sm text-sb-muted py-4 text-center">No redemptions yet.</li>
          ) : null}
        </ul>
      </LandingGlassCard>

      {data.legacy ? (
        <LandingGlassCard className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Player Legacy</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <LegacyStat label="Lifetime Gameplay" value={`$${(data.legacy.lifetimeGameplayCents / 100).toFixed(0)}`} />
            <LegacyStat label="Lifetime Purchases" value={`$${(data.legacy.lifetimePurchasesCents / 100).toFixed(0)}`} />
            <LegacyStat label="Lifetime Rewards" value={data.legacy.lifetimeRewardsEarned.toLocaleString()} />
            <LegacyStat label="Mystery Boxes Opened" value={String(data.legacy.mysteryBoxesOpened)} />
            <LegacyStat label="Rewards Redeemed" value={String(data.legacy.rewardsRedeemed)} />
            <LegacyStat label="Boards Played" value={String(data.legacy.boardsPlayed)} />
            <LegacyStat label="Seasons" value={String(data.legacy.seasonsPlayed)} />
            <LegacyStat label="Longest Streak" value={String(data.legacy.longestStreak)} />
            <LegacyStat label="Perfect Weeks" value="—" />
          </div>
        </LandingGlassCard>
      ) : null}
    </div>
  );
}

function LegacyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-wider text-sb-muted">{label}</p>
      <p className="font-bold text-white mt-1">{value}</p>
    </div>
  );
}
