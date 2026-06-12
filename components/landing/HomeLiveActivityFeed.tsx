"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LiveActivityFeed from "@/components/live-winners/LiveActivityFeed";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LiveActivityItem } from "@/lib/liveWinners/types";

const POLL_MS = 12_000;
const HOME_ACTIVITY_LIMIT = 10;

export default function HomeLiveActivityFeed() {
  const [activity, setActivity] = useState<LiveActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/live-winners", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { activity: LiveActivityItem[] };
        setActivity(json.activity.slice(0, HOME_ACTIVITY_LIMIT));
      } catch {
        // Keep the last good snapshot on transient failures.
      } finally {
        setLoading(false);
      }
    }

    void load();
    const id = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  if (loading) {
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
