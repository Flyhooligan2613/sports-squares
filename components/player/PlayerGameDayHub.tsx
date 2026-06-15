"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperiencePageSkeleton from "@/components/ui/ExperiencePageSkeleton";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import HotGames from "@/components/action-center/HotGames";
import GameDayTimeline, {
  GameDayLiveStrip,
  GameDayMissionsPanel,
  GameDayWhatsNextPanel,
} from "@/components/game-day/GameDaySections";
import GameDayStatusStrip, {
  GameDayAtmosphereBanner,
} from "@/components/game-day/GameDayStatusStrip";
import GameDaySnapshotGrid from "@/components/game-day/GameDaySnapshotGrid";
import GameDayContinuePanel from "@/components/game-day/GameDayContinuePanel";
import GameDayTodaysGames from "@/components/game-day/GameDayTodaysGames";
import GameDayProgressCenterPanel from "@/components/game-day/GameDayProgressCenter";
import {
  GameDayCommunityMoments,
  GameDayFriendsFeed,
  GameDayNotifications,
  GameDayRecapPanel,
} from "@/components/game-day/GameDaySocial";
import { LiveActivityProvider } from "@/components/liveActivity/LiveActivityProvider";
import LiveActivityTicker from "@/components/liveActivity/LiveActivityTicker";
import type { GameDayHubData } from "@/lib/gameDay/types";

export default function PlayerGameDayHub() {
  const [data, setData] = useState<GameDayHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/game-day", { cache: "no-store", credentials: "include" });
        if (res.status === 401) {
          window.location.href = "/my-games/login";
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load Game Day Hub");
        }
        const json = (await res.json()) as GameDayHubData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <ExperiencePageSkeleton variant="player" />;
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <LandingGlassCard className="p-8">
          <p className="text-white font-semibold mb-2">Couldn&apos;t load your Game Day Hub</p>
          <p className="text-sb-muted text-sm mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </LandingGlassCard>
      </div>
    );
  }

  const liveStripItems = data.liveActivity.map((e) => ({
    id: e.id,
    emoji: e.emoji,
    message: e.message,
  }));

  return (
    <LiveActivityProvider>
      <div className={`gd-page gd-player-hub gd-theme-${data.atmosphere.theme}`}>
        <AmbientBackground />

        <div className="gd-live-ribbon">
          <LiveActivityTicker className="gd-live-ribbon-ticker" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 pt-6 sm:pt-8">
          <header className="gd-player-welcome mb-8 sm:mb-10 admin-stat-enter">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {data.isGameDay ? (
                  <span className="gd-player-badge">Game Day Live</span>
                ) : (
                  <span className="gd-player-badge gd-player-badge-calm">Your Lounge</span>
                )}
                <h1 className="gd-player-greeting">{data.greeting}</h1>
                <p className="text-sb-muted text-sm sm:text-base mt-2 max-w-xl">
                  {data.atmosphere.tagline}
                </p>
              </div>
              <Link
                href="/action-center"
                className="gd-player-cta hidden sm:inline-flex"
              >
                Action Center →
              </Link>
            </div>
          </header>

          <GameDayAtmosphereBanner
            emoji={data.atmosphere.emoji}
            label={data.atmosphere.label}
            tagline={data.atmosphere.tagline}
            theme={data.atmosphere.theme}
          />

          <GameDayStatusStrip items={data.statusItems} />

          <GameDaySnapshotGrid cards={data.snapshotCards} />

          <GameDayTodaysGames games={data.todaysGames} />

          <GameDayContinuePanel items={data.continuePlaying} />

          <GameDayLiveStrip items={liveStripItems} />

          <GameDayFriendsFeed items={data.friendActivity} />
          <GameDayCommunityMoments items={data.communityMoments} />

          <GameDayProgressCenterPanel progress={data.progressCenter} />

          <div className="grid xl:grid-cols-[1fr_340px] gap-8 xl:gap-10">
            <div>
              <GameDayWhatsNextPanel items={data.whatsNext} />
              <GameDayTimeline sections={data.timeline} />
              {data.recap ? <GameDayRecapPanel recap={data.recap} /> : null}
              {data.hotGames.length > 0 ? (
                <div className="mb-10 sm:mb-12">
                  <HotGames games={data.hotGames} />
                </div>
              ) : null}
            </div>

            <aside className="space-y-0">
              <GameDayNotifications notifications={data.notifications} />
              <GameDayMissionsPanel missions={data.missions} />
            </aside>
          </div>
        </div>
      </div>
    </LiveActivityProvider>
  );
}
