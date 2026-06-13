"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { SQUARE_DROP_NAME } from "@/lib/platform/ecosystem/squareDropBrand";

const UPCOMING_EVENTS = [
  { id: "monday-drop", title: "Monday Square Drop", emoji: "🎁", when: "Every Monday", detail: "Weekly drop unlocks for qualified players" },
  { id: "nfl-kickoff", title: "NFL Kickoff Season", emoji: "🏈", when: "Sep 2026", detail: "Bonus drops and kickoff-tier rewards" },
  { id: "playoffs", title: "Playoff Push", emoji: "🏆", when: "Jan 2027", detail: "Elevated drop tiers during playoffs" },
  { id: "march-madness", title: "March Madness", emoji: "🏀", when: "Mar 2027", detail: "Pick'em credits and bracket bonuses" },
  { id: "super-bowl", title: "Super Bowl Week", emoji: "🎉", when: "Feb 2027", detail: "Legend Drop chances for Elite+ tiers" },
  { id: "anniversary", title: "SquareBoards Anniversary", emoji: "🎂", when: "Special", detail: "Limited Immortal frames and titles" },
];

export default function UpcomingRewardsPanel() {
  const { data, loading } = useRewardsCenter();

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading upcoming rewards…</p>;
  }

  const minCents = 50000;
  const gameplay = data.dashboard.account.weeklyGameplayCents;
  const qualified = gameplay >= minCents;

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-6 border border-purple-500/20">
        <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-2">This Week</p>
        <h2 className="text-xl font-bold text-white mb-2">{SQUARE_DROP_NAME}</h2>
        <p className="text-sm text-sb-muted mb-4">
          {data.unopenedMysteryBox
            ? "Your drop is ready — open it now!"
            : qualified
              ? "You're qualified. Drop opens Monday if you haven't opened yet."
              : `$${((minCents - gameplay) / 100).toFixed(2)} gameplay remaining to qualify.`}
        </p>
        {data.unopenedMysteryBox ? (
          <Link
            href="/my-games/rewards/square-drop"
            className="inline-flex px-4 py-2 rounded-xl bg-sb-purple/30 text-white text-sm font-semibold border border-sb-purple/40 hover:bg-sb-purple/40 transition-colors"
          >
            Open Square Drop →
          </Link>
        ) : null}
      </LandingGlassCard>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Season & Special Events</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {UPCOMING_EVENTS.map((event) => (
            <LandingGlassCard key={event.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{event.emoji}</span>
                <div>
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-xs text-purple-300 mt-0.5">{event.when}</p>
                  <p className="text-xs text-sb-muted mt-1">{event.detail}</p>
                </div>
              </div>
            </LandingGlassCard>
          ))}
        </div>
      </div>

      {data.promotions.filter((p) => !p.claimed).length ? (
        <LandingGlassCard className="p-5">
          <h3 className="font-semibold text-white mb-3">Active Promotions</h3>
          <ul className="space-y-2">
            {data.promotions
              .filter((p) => !p.claimed)
              .map((p) => (
                <li key={p.id} className="flex justify-between text-sm border-b border-white/5 py-2">
                  <span className="text-white">{p.title}</span>
                  <Link href="/my-games/rewards/promotions" className="text-purple-300 text-xs">
                    Claim →
                  </Link>
                </li>
              ))}
          </ul>
        </LandingGlassCard>
      ) : null}
    </div>
  );
}
