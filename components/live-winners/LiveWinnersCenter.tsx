"use client";

import { useEffect, useRef, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import BigWinOfTheDay from "@/components/live-winners/BigWinOfTheDay";
import ConfettiCelebration from "@/components/live-winners/ConfettiCelebration";
import HallOfChampions from "@/components/live-winners/HallOfChampions";
import LiveActivityFeed from "@/components/live-winners/LiveActivityFeed";
import LivePlatformStatusSection from "@/components/live-winners/LivePlatformStatus";
import LiveWinnersFeed from "@/components/live-winners/LiveWinnersFeed";
import LiveWinnersStatsGrid from "@/components/live-winners/LiveWinnersStatsGrid";
import RecentPayoutsTicker from "@/components/live-winners/RecentPayoutsTicker";
import { Button } from "@/components/ui/Button";
import type { LiveWinnersCenterData } from "@/lib/liveWinners/types";

const POLL_MS = 12_000;

export default function LiveWinnersCenter() {
  const [data, setData] = useState<LiveWinnersCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsActive, setStatsActive] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [celebrationTier, setCelebrationTier] = useState<"medium" | "large">(
    "medium"
  );
  const statsRef = useRef<HTMLDivElement>(null);
  const seenWinnersRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  async function load() {
    try {
      const res = await fetch("/api/live-winners", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as LiveWinnersCenterData;

      if (!initialLoadRef.current) {
        for (const winner of json.winners) {
          if (seenWinnersRef.current.has(winner.id)) continue;
          seenWinnersRef.current.add(winner.id);
          if (winner.amount >= 1000) {
            setCelebrationTier("large");
            setCelebrationKey((key) => key + 1);
          } else if (winner.amount >= 500) {
            setCelebrationTier("medium");
            setCelebrationKey((key) => key + 1);
          }
        }
      } else {
        json.winners.forEach((winner) => seenWinnersRef.current.add(winner.id));
        initialLoadRef.current = false;
      }

      setData(json);
      setError(null);
    } catch {
      setError("Could not refresh live winners.");
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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="lwc-page min-h-screen flex flex-col">
      <AppMenuBar />
      <ConfettiCelebration trigger={celebrationKey} tier={celebrationTier} />

      <main className="flex-1 relative overflow-hidden">
        <div className="lwc-glow" aria-hidden />
        <div className="lwc-glow-secondary" aria-hidden />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <header className="text-center mb-8 sm:mb-10 lwc-hero-enter">
            <div className="inline-flex items-center gap-2 lwc-live-pill mb-4">
              <span className="lwc-live-dot" />
              <span>Live Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
              Live Winners Center
            </h1>
            <p className="text-sb-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Real-time winners, automatic payouts, and live game activity — all
              handled automatically.
            </p>
          </header>

          {loading ? (
            <div className="space-y-4">
              <div className="lwc-skeleton h-16" />
              <div className="lwc-skeleton h-24" />
              <div className="lwc-skeleton h-28" />
              <div className="lwc-skeleton h-48" />
              <div className="lwc-skeleton h-64" />
            </div>
          ) : error && !data ? (
            <div className="text-center py-16">
              <p className="text-sb-muted mb-4">{error}</p>
              <Button onClick={() => load()}>Try again</Button>
            </div>
          ) : data ? (
            <div ref={statsRef} className="space-y-8 sm:space-y-10">
              <RecentPayoutsTicker payouts={data.ticker} />

              <LivePlatformStatusSection
                platform={data.platform}
                active={statsActive}
              />

              <BigWinOfTheDay bigWin={data.bigWin} />

              <LiveWinnersStatsGrid stats={data.stats} active={statsActive} />

              <div className="grid xl:grid-cols-3 gap-8 xl:gap-10">
                <div className="xl:col-span-2">
                  <LiveWinnersFeed winners={data.winners} />
                </div>
                <div className="xl:sticky xl:top-6 xl:self-start">
                  <LiveActivityFeed activity={data.activity} />
                </div>
              </div>

              <HallOfChampions champions={data.champions} />

              <p className="text-center text-xs text-sb-muted">
                Updated {new Date(data.updatedAt).toLocaleTimeString()} ·
                Refreshes every {POLL_MS / 1000}s
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
