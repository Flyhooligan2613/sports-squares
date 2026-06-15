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
import WelcomeHomeTransition from "@/components/home/WelcomeHomeTransition";
import {
  GameDayCommunityMoments,
  GameDayNotifications,
  GameDayRecapPanel,
} from "@/components/game-day/GameDaySocial";
import { LiveActivityProvider } from "@/components/liveActivity/LiveActivityProvider";
import LiveActivityTicker from "@/components/liveActivity/LiveActivityTicker";
import {
  hasRewardDropReady,
  prioritizeContinueItems,
} from "@/lib/home/prioritizeActions";
import {
  consumeWelcomeHomePending,
  resolveWelcomeHomeFromUrl,
} from "@/lib/home/welcomeSession";
import type { HomeData } from "@/lib/gameDay/types";

function HomeStagger({
  delay,
  revealed,
  children,
}: {
  delay: number;
  revealed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={revealed ? "home-stagger home-stagger-active" : "home-stagger"}
      style={{ "--home-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default function HomeExperience() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [welcomeActive, setWelcomeActive] = useState(false);
  const [homeRevealed, setHomeRevealed] = useState(false);

  useEffect(() => {
    const fromUrl = resolveWelcomeHomeFromUrl();
    const pending = fromUrl || consumeWelcomeHomePending();
    setWelcomeActive(pending);
    if (!pending) setHomeRevealed(true);
  }, []);

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

  function handleWelcomeComplete() {
    setWelcomeActive(false);
    setHomeRevealed(true);
  }

  if (loading && !welcomeActive) {
    return <ExperiencePageSkeleton variant="player" />;
  }

  if (error && !data) {
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

  if (welcomeActive && !homeRevealed) {
    return (
      <>
        <WelcomeHomeTransition data={data} onComplete={handleWelcomeComplete} />
        {data ? (
          <LiveActivityProvider>
            <div className="sr-only" aria-hidden>
              Home loading
            </div>
          </LiveActivityProvider>
        ) : null}
      </>
    );
  }

  if (!data) {
    return <ExperiencePageSkeleton variant="player" />;
  }

  const continueItems = prioritizeContinueItems(data.continuePlaying);
  const rewardDropGlow = hasRewardDropReady(continueItems);

  const liveStripItems = data.liveActivity.map((e) => ({
    id: e.id,
    emoji: e.emoji,
    message: e.message,
  }));

  const stagger = homeRevealed;

  return (
    <LiveActivityProvider>
      <div className={`home-page home-page-revealed gd-page gd-theme-${data.atmosphere.theme}`}>
        <AmbientBackground />

        <HomeStagger delay={0} revealed={stagger}>
          <div className="gd-live-ribbon home-live-ribbon">
            <LiveActivityTicker className="gd-live-ribbon-ticker" />
          </div>
        </HomeStagger>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 pt-6 sm:pt-8">
          <HomeStagger delay={80} revealed={stagger}>
            <HomeWelcome
              greeting={data.greeting}
              subtitle={data.greetingSubtitle}
              avatarEmoji={data.avatarEmoji}
              isGameDay={data.isGameDay}
              atmosphereLabel={data.atmosphere.label}
            />
          </HomeStagger>

          <HomeStagger delay={140} revealed={stagger}>
            <GameDayAtmosphereBanner
              emoji={data.atmosphere.emoji}
              label={data.atmosphere.label}
              tagline={data.atmosphere.tagline}
              theme={data.atmosphere.theme}
            />
          </HomeStagger>

          <HomeStagger delay={220} revealed={stagger}>
            <GameDayStatusStrip items={data.statusItems} title="Today's Game Day" />
          </HomeStagger>

          <HomeStagger delay={300} revealed={stagger}>
            <GameDayContinuePanel
              items={continueItems}
              glowRewardDrop={rewardDropGlow}
            />
          </HomeStagger>

          <HomeStagger delay={380} revealed={stagger}>
            <GameDayLiveStrip items={liveStripItems} title="Live Game Day" />
          </HomeStagger>

          <HomeStagger delay={460} revealed={stagger}>
            <GameDayTodaysGames games={data.todaysGames} />
          </HomeStagger>

          <HomeStagger delay={540} revealed={stagger}>
            <GameDaySnapshotGrid cards={data.snapshotCards} />
          </HomeStagger>

          <HomeStagger delay={620} revealed={stagger}>
            <HomeFriendsPanel data={data.friendsPlaying} />
          </HomeStagger>

          <HomeStagger delay={700} revealed={stagger}>
            <HomeProgressionCenter progress={data.progressCenter} />
          </HomeStagger>

          <HomeStagger delay={780} revealed={stagger}>
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
          </HomeStagger>
        </div>
      </div>
    </LiveActivityProvider>
  );
}
