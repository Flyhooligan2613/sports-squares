"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ActivitySidebar from "@/components/live-tv/ActivitySidebar";
import BigWinnerCard from "@/components/live-tv/BigWinnerCard";
import BoardCreationCelebration from "@/components/live-tv/BoardCreationCelebration";
import HeroRotator from "@/components/live-tv/HeroRotator";
import LiveBoardVisualizer from "@/components/live-tv/LiveBoardVisualizer";
import LivePurchaseStream from "@/components/live-tv/LivePurchaseStream";
import LiveScoreboardGrid from "@/components/live-tv/LiveScoreboardGrid";
import MoneyCounters from "@/components/live-tv/MoneyCounters";
import PayoutStream from "@/components/live-tv/PayoutStream";
import PlatformSportMap from "@/components/live-tv/PlatformSportMap";
import TrendingGames from "@/components/live-tv/TrendingGames";
import UpcomingKickoffs from "@/components/live-tv/UpcomingKickoffs";
import WinnerAnnouncementOverlay from "@/components/live-tv/WinnerAnnouncementOverlay";
import NavDrawerTrigger from "@/components/nav/NavDrawerTrigger";
import StatusBadge from "@/components/ui/StatusBadge";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperiencePageSkeleton from "@/components/ui/ExperiencePageSkeleton";
import { Button } from "@/components/ui/Button";
import { useLiveTvSound } from "@/lib/liveTv/useLiveTvSound";
import type { LiveTvData } from "@/lib/liveTv/types";

const POLL_MS = 8_000;

export default function LiveTvExperience() {
  const [data, setData] = useState<LiveTvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsActive, setStatsActive] = useState(false);
  const [clock, setClock] = useState("");
  const statsRef = useRef<HTMLDivElement>(null);

  useLiveTvSound(true);

  async function load() {
    try {
      const res = await fetch("/api/live-tv", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as LiveTvData;
      setData(json);
      setError(null);
    } catch {
      setError("Could not refresh LIVE TV.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const pollId = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(pollId);
  }, []);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = window.setInterval(tick, 1000);
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
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="livetv-page lwc-page min-h-screen flex flex-col">
      <AmbientBackground />

      <header className="livetv-header sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <NavDrawerTrigger />
            <Link href="/" className="shrink-0">
              <Logo className="h-7 sm:h-8 w-auto" />
            </Link>
            <div className="min-w-0 hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.28em] text-sb-glow font-bold">
                SquareBoards
              </p>
              <p className="text-sm sm:text-base font-bold text-white truncate">
                LIVE TV
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge variant="live" pulse dot>
              On Air
            </StatusBadge>
            <span className="text-sm font-mono text-sb-muted tabular-nums hidden md:inline">
              {clock}
            </span>
          </div>
        </div>
      </header>

      <WinnerAnnouncementOverlay winner={data?.latestWinner ?? null} />
      <BoardCreationCelebration events={data?.boardEvents ?? []} />

      <main className="flex-1 relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {loading ? (
            <ExperiencePageSkeleton variant="live-tv" />
          ) : error && !data ? (
            <div className="text-center py-20">
              <p className="text-sb-muted mb-4">{error}</p>
              <Button onClick={() => load()}>Try again</Button>
            </div>
          ) : data ? (
            <div ref={statsRef} className="space-y-8 sm:space-y-10">
              <HeroRotator cards={data.heroCards} />
              <MoneyCounters money={data.money} active={statsActive} />

              <div className="grid xl:grid-cols-[1fr_320px] gap-8">
                <div className="space-y-8 sm:space-y-10 min-w-0">
                  <LiveScoreboardGrid games={data.scoreboard} />
                  <LiveBoardVisualizer board={data.featuredBoard} />
                  <LivePurchaseStream events={data.streamEvents} />
                  <TrendingGames games={data.trending} />
                  <div className="grid lg:grid-cols-2 gap-8">
                    <UpcomingKickoffs kickoffs={data.kickoffs} />
                    <BigWinnerCard winner={data.bigWinner} />
                  </div>
                  <PlatformSportMap sports={data.sportMap} />
                  <PayoutStream payouts={data.payouts} />
                </div>
                <ActivitySidebar feed={data.sidebarFeed} />
              </div>

              <p className="text-center text-xs text-sb-muted">
                Updated {new Date(data.updatedAt).toLocaleTimeString()} · Refreshes
                every {POLL_MS / 1000}s · Built for 24/7 broadcast
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
