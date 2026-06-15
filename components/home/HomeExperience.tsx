"use client";

import { useEffect, useState } from "react";
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
import HomeProgressionCenter from "@/components/home/HomeProgressionCenter";
import HomeFriendsPanel from "@/components/home/HomeFriendsPanel";
import HomeWelcome from "@/components/home/HomeWelcome";
import {
  GameDayCommunityMoments,
  GameDayNotifications,
  GameDayRecapPanel,
} from "@/components/game-day/GameDaySocial";
import { LiveActivityProvider } from "@/components/liveActivity/LiveActivityProvider";
import LiveActivityTicker from "@/components/liveActivity/LiveActivityTicker";
import type { HomeData } from "@/lib/gameDay/types";

export default function HomeExperience() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/home", { cache: "no-store", credentials: "include" });
        if (res.status === 401) {
          window.location.href = "/my-games/login";
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load Home");
        }
        const json = (await res.json()) as HomeData;
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
    const interval = setInterval(load, 45_000);
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
          <p className="text-white font-semibold mb-2">Couldn&apos;t load Home</p>
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
      <div className={`home-page gd-page gd-theme-${data.atmosphere.theme}`}>
        <AmbientBackground />

        <div className="gd-live-ribbon home-live-ribbon">
          <LiveActivityTicker className="gd-live-ribbon-ticker" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 pt-6 sm:pt-8">
          <HomeWelcome
            greeting={data.greeting}
            subtitle={data.greetingSubtitle}
            avatarEmoji={data.avatarEmoji}
            isGameDay={data.isGameDay}
            atmosphereLabel={data.atmosphere.label}
          />

          <GameDayAtmosphereBanner
            emoji={data.atmosphere.emoji}
            label={data.atmosphere.label}
            tagline={data.atmosphere.tagline}
            theme={data.atmosphere.theme}
          />

          <GameDayStatusStrip items={data.statusItems} title="Today's Game Day" />

          <GameDayContinuePanel items={data.continuePlaying} />

          <GameDayLiveStrip items={liveStripItems} title="Live Game Day" />

          <HomeFriendsPanel data={data.friendsPlaying} />

          <GameDaySnapshotGrid cards={data.snapshotCards} />

          <GameDayTodaysGames games={data.todaysGames} />

          <HomeProgressionCenter progress={data.progressCenter} />

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
              <GameDayCommunityMoments items={data.communityMoments} />
            </aside>
          </div>
        </div>
      </div>
    </LiveActivityProvider>
  );
}
