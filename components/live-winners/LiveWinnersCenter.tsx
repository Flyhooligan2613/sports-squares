"use client";

import { useEffect, useRef, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LiveActivityFeed from "@/components/live-winners/LiveActivityFeed";
import HallOfChampions from "@/components/live-winners/HallOfChampions";
import LiveWinnersFeed from "@/components/live-winners/LiveWinnersFeed";
import LiveWinnersStatsGrid from "@/components/live-winners/LiveWinnersStatsGrid";
import { Button } from "@/components/ui/Button";
import type { LiveWinnersCenterData } from "@/lib/liveWinners/types";

const POLL_MS = 20_000;

export default function LiveWinnersCenter() {
  const [data, setData] = useState<LiveWinnersCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsActive, setStatsActive] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/live-winners", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as LiveWinnersCenterData;
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
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="lwc-page min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 relative overflow-hidden">
        <div className="lwc-glow" aria-hidden />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <header className="text-center mb-10 sm:mb-12 lwc-hero-enter">
            <div className="inline-flex items-center gap-2 lwc-live-pill mb-4">
              <span className="lwc-live-dot" />
              <span>🏆 Live Winners</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
              Live Winners Center
            </h1>
            <p className="text-sb-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Watch winners, payouts, and game activity happen in real time.
            </p>
          </header>

          {loading ? (
            <div className="space-y-4">
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
            <div className="space-y-10 sm:space-y-12">
              <div ref={statsRef}>
                <LiveWinnersStatsGrid stats={data.stats} active={statsActive} />
              </div>

              <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
                <div className="lg:col-span-2">
                  <LiveWinnersFeed winners={data.winners} />
                </div>
                <div>
                  <LiveActivityFeed activity={data.activity} />
                </div>
              </div>

              <HallOfChampions champions={data.champions} />

              <p className="text-center text-xs text-sb-muted">
                Updated {new Date(data.updatedAt).toLocaleTimeString()} · Refreshes automatically
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
