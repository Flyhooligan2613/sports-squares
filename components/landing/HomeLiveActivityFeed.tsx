"use client";

import Link from "next/link";
import { useLandingLive } from "@/components/landing/LandingLiveProvider";
import LiveActivityFeed from "@/components/live-winners/LiveActivityFeed";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

const HOME_ACTIVITY_LIMIT = 10;

export default function HomeLiveActivityFeed() {
  const { data, loading } = useLandingLive();
  const activity = data?.activity.slice(0, HOME_ACTIVITY_LIMIT) ?? [];

  if (loading && !data) {
    return (
      <LandingGlassCard className="p-3 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="sb-xp-skeleton h-14 rounded-xl" />
        ))}
      </LandingGlassCard>
    );
  }

  return (
    <div>
      <LiveActivityFeed activity={activity} showHeader={false} />
      <p className="text-center mt-5">
        <Link
          href="/live-winners"
          className="text-sm font-medium text-emerald-400/90 hover:text-emerald-300 transition-colors"
        >
          View all live activity →
        </Link>
      </p>
    </div>
  );
}
