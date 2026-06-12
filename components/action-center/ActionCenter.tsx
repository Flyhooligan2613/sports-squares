"use client";

import { useEffect, useRef, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import BoardsFillingFast from "@/components/action-center/BoardsFillingFast";
import CountdownCenter from "@/components/action-center/CountdownCenter";
import HotGames from "@/components/action-center/HotGames";
import LivePurchaseFeed from "@/components/action-center/LivePurchaseFeed";
import NextPayouts from "@/components/action-center/NextPayouts";
import NowHappening from "@/components/action-center/NowHappening";
import PlatformHealth from "@/components/action-center/PlatformHealth";
import SmartRecommendations from "@/components/action-center/SmartRecommendations";
import TodaysTimeline from "@/components/action-center/TodaysTimeline";
import UpcomingSports from "@/components/action-center/UpcomingSports";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import ExperiencePageSkeleton from "@/components/ui/ExperiencePageSkeleton";
import { Button } from "@/components/ui/Button";
import { useKickoffCountdown } from "@/lib/motion/useKickoffCountdown";
import type { ActionCenterData } from "@/lib/actionCenter/types";

const POLL_MS = 10_000;

function StickyCountdownBar({
  nextKickoff,
  isLive,
}: {
  nextKickoff: string | null;
  isLive: boolean;
}) {
  const countdown = useKickoffCountdown(nextKickoff ?? new Date().toISOString(), isLive);
  if (!nextKickoff) return null;

  return (
    <div className="ac-sticky-countdown lg:hidden">
      <span className="text-[10px] uppercase tracking-wider text-sb-muted">
        {countdown.isLive ? "Live Now" : "Next Kickoff"}
      </span>
      <span
        className={[
          "text-sm font-bold",
          countdown.isLive ? "lwc-text-live ac-countdown-pulse" : "text-white",
        ].join(" ")}
      >
        {countdown.label}
      </span>
    </div>
  );
}

export default function ActionCenter() {
  const [data, setData] = useState<ActionCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsActive, setStatsActive] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/action-center", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as ActionCenterData;
      setData(json);
      setError(null);
    } catch {
      setError("Could not refresh the Action Center.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStatsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  const nextCountdown = data?.countdown.find((g) => g.status === "upcoming") ?? null;
  const liveCountdown = data?.countdown.find((g) => g.status === "live") ?? null;

  return (
    <div className="ac-page lwc-page min-h-screen flex flex-col">
      <AppMenuBar />
      <StickyCountdownBar
        nextKickoff={
          liveCountdown?.kickoffAt ?? nextCountdown?.kickoffAt ?? null
        }
        isLive={!!liveCountdown}
      />

      <main className="flex-1 relative overflow-hidden pb-20 lg:pb-10">
        <AmbientBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <ExperienceHero
            badgeLabel="⚡ Action Center"
            badgeVariant="live"
            title="The Action Center"
            subtitle="What's live, what's starting soon, and where you should play next — updated automatically."
            cta={{ label: "Browse Live Boards", href: "/games/nfl" }}
          />

          {loading ? (
            <ExperiencePageSkeleton variant="action-center" />
          ) : error && !data ? (
            <div className="text-center py-16">
              <p className="text-sb-muted mb-4">{error}</p>
              <Button onClick={() => load()}>Try again</Button>
            </div>
          ) : data ? (
            <div ref={statsRef} className="space-y-10 sm:space-y-12">
              <NowHappening cards={data.nowHappening} />

              <div className="grid lg:grid-cols-2 gap-8">
                <CountdownCenter games={data.countdown} />
                <LivePurchaseFeed purchases={data.purchaseFeed} />
              </div>

              <BoardsFillingFast boards={data.fillingFast} />
              <NextPayouts payouts={data.nextPayouts} />
              <HotGames games={data.hotGames} />
              <SmartRecommendations recommendations={data.recommendations} />
              <UpcomingSports sports={data.upcomingSports} />
              <TodaysTimeline events={data.timeline} />
              <PlatformHealth platform={data.platform} active={statsActive} />

              <p className="text-center text-xs text-sb-muted">
                Updated {new Date(data.updatedAt).toLocaleTimeString()} · Refreshes
                every {POLL_MS / 1000}s
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
