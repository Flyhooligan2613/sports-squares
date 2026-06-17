"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState, useRef } from "react";
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
import WeeklyDropCountdownBanner from "@/components/player/ecosystem/WeeklyDropCountdownBanner";
import GameDayTodaysGames from "@/components/game-day/GameDayTodaysGames";
import GameHubSectionTabs from "@/components/home/GameHubSectionTabs";
import HomeWelcome from "@/components/home/HomeWelcome";
import GameRoomExperience from "@/components/home/GameRoomExperience";
import HomeStagger from "@/components/home/HomeStagger";
import WelcomeHomeTransition from "@/components/home/WelcomeHomeTransition";
import {
  GameDayCommunityMoments,
  GameDayNotifications,
  GameDayRecapPanel,
} from "@/components/game-day/GameDaySocial";
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
import { PlayerShellAvatarSync } from "@/components/player/PlayerShellAvatarProvider";
import { useHubHashScroll } from "@/components/home/useHubHashScroll";
import { fastFetchJson, isDocumentVisible } from "@/lib/client/fastFetch";
import { usePullRefresh } from "@/lib/client/usePullRefresh";
import { GAME_DAY_SECTION_TABS, peekPendingHubHash } from "@/lib/home/hubSections";

function HomeExperienceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("mode");
  const isGameRoom = viewMode === "home";

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
    if (window.location.hash || peekPendingHubHash()) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [viewMode]);

  useHubHashScroll(homeRevealed && Boolean(data), [viewMode, data]);

  const reloadHomeRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;

    async function load(background = false, force = false) {
      try {
        const json = force
          ? await (async () => {
              const res = await fetch("/api/home", { cache: "no-store", credentials: "include" });
              if (res.status === 401) {
                window.location.href = "/my-games/login";
                return null;
              }
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? "Failed to load Home");
              }
              return (await res.json()) as HomeData;
            })()
          : await fastFetchJson<HomeData>("home", "/api/home", {
              maxAgeMs: 25_000,
              init: { credentials: "include" },
            }).catch(async () => {
              const res = await fetch("/api/home", { cache: "no-store", credentials: "include" });
              if (res.status === 401) {
                window.location.href = "/my-games/login";
                return null;
              }
              if (!res.ok) throw new Error("Failed to load Home");
              return (await res.json()) as HomeData;
            });

        if (!json) return;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled && !background) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled && !background) setLoading(false);
      }
    }

    reloadHomeRef.current = () => {
      void load(false, true);
    };

    void load();
    const interval = setInterval(() => {
      if (isDocumentVisible()) void load(true, false);
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  usePullRefresh(() => reloadHomeRef.current());

  function handleWelcomeComplete() {
    setWelcomeActive(false);
    window.requestAnimationFrame(() => {
      setHomeRevealed(true);
    });
    if (viewMode !== "home") {
      router.replace("/my-games?mode=gameday", { scroll: false });
    }
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
    return <WelcomeHomeTransition data={data} onComplete={handleWelcomeComplete} />;
  }

  if (!data) {
    return <ExperiencePageSkeleton variant="player" />;
  }

  const continueItems = prioritizeContinueItems(data.continuePlaying);
  const rewardDropGlow = hasRewardDropReady(continueItems);
  const stagger = homeRevealed;
  const modeKey = viewMode ?? "gameday";

  if (isGameRoom) {
    return (
      <div key={modeKey}>
        <PlayerShellAvatarSync avatarEmoji={data.avatarEmoji} />
        <GameRoomExperience
          data={data}
          revealed={stagger}
          continueItems={continueItems}
          rewardDropGlow={rewardDropGlow}
        />
      </div>
    );
  }

  const liveStripItems = (data.liveActivity ?? []).map((e) => ({
    id: e.id,
    emoji: e.emoji,
    message: e.message,
  }));

  return (
    <div key={modeKey}>
      <PlayerShellAvatarSync avatarEmoji={data.avatarEmoji} />
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
            />
          </HomeStagger>

          <HomeStagger delay={120} revealed={stagger}>
            <WeeklyDropCountdownBanner schedule={data.weeklyDropSchedule} />
          </HomeStagger>

          <HomeStagger delay={160} revealed={stagger}>
            <GameHubSectionTabs tabs={GAME_DAY_SECTION_TABS} mode="gameday" />
          </HomeStagger>

          <HomeStagger delay={220} revealed={stagger}>
            <GameDayAtmosphereBanner
              emoji={data.atmosphere.emoji}
              label={data.atmosphere.label}
              tagline={data.atmosphere.tagline}
              theme={data.atmosphere.theme}
            />
          </HomeStagger>

          <HomeStagger delay={280} revealed={stagger}>
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

          <HomeStagger delay={860} revealed={stagger}>
            <div className="gameroom-gameday-nudge">
              <p className="gameroom-gameday-nudge-text">
                Done with Game Day?{" "}
                <Link href="/my-games?mode=home" className="text-sb-glow font-semibold hover:underline">
                  Enter the Game Room →
                </Link>
              </p>
            </div>
          </HomeStagger>
        </div>
      </div>
    </div>
  );
}

export default function HomeExperience() {
  return (
    <Suspense fallback={null}>
      <HomeExperienceInner />
    </Suspense>
  );
}
