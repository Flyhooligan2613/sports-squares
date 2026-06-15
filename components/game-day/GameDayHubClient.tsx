"use client";

import { useEffect, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import GameDayStatusStrip, { GameDayAtmosphereBanner } from "@/components/game-day/GameDayStatusStrip";
import GameDayTimeline, {
  GameDayLiveStrip,
  GameDayMissionsPanel,
  GameDayWhatsNextPanel,
} from "@/components/game-day/GameDaySections";
import {
  GameDayCommunityMoments,
  GameDayFriendsFeed,
  GameDayNotifications,
  GameDayRecapPanel,
} from "@/components/game-day/GameDaySocial";
import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";
import HotGames from "@/components/action-center/HotGames";
import LiveActivityTicker from "@/components/liveActivity/LiveActivityTicker";
import { LiveActivityProvider } from "@/components/liveActivity/LiveActivityProvider";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import ExperiencePageSkeleton from "@/components/ui/ExperiencePageSkeleton";
import { Button } from "@/components/ui/Button";
import type { GameDayHubData } from "@/lib/gameDay/types";

const POLL_MS = 30_000;

export default function GameDayHubClient() {
  const [data, setData] = useState<GameDayHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/game-day", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/my-games/login?next=/game-day";
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load Game Day Hub");
      }
      const json = (await res.json()) as GameDayHubData;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  if (loading) {
    return <ExperiencePageSkeleton variant="action-center" />;
  }

  if (error || !data) {
    return (
      <div className="gd-page ac-page min-h-screen">
        <AmbientBackground />
        <div className="relative z-10 max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-white font-semibold mb-2">Couldn&apos;t load Game Day Hub</p>
          <p className="text-sb-muted text-sm mb-6">{error}</p>
          <Button onClick={() => void load()}>Try again</Button>
        </div>
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
      <div className={`gd-page ac-page min-h-screen gd-theme-${data.atmosphere.theme}`}>
        <AmbientBackground />
        <AppMenuBar />

        <div className="gd-live-ribbon">
          <LiveActivityTicker className="gd-live-ribbon-ticker" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <ExperienceHero
            badgeLabel={data.isGameDay ? "Game Day Live" : "Your Hub"}
            badgeVariant="live"
            title={data.greeting}
            subtitle={`${data.atmosphere.emoji} ${data.atmosphere.tagline}`}
            stats={[
              { label: "Phase", value: data.phaseLabel },
              { label: "Tier", value: data.tier.label },
              { label: "Progress", value: `${data.tier.progressPct}%` },
            ]}
            cta={{ label: PLATFORM_TERMS.contestCenter, href: "/contest-center" }}
            className="gd-hero"
          />

          <GameDayAtmosphereBanner
            emoji={data.atmosphere.emoji}
            label={data.atmosphere.label}
            tagline={data.atmosphere.tagline}
            theme={data.atmosphere.theme}
          />

          <GameDayStatusStrip items={data.statusItems} />

          <div className="grid xl:grid-cols-[1fr_340px] gap-8 xl:gap-10">
            <div>
              <GameDayWhatsNextPanel items={data.whatsNext} />
              <GameDayTimeline sections={data.timeline} />
              <GameDayLiveStrip items={liveStripItems} />
              {data.recap ? <GameDayRecapPanel recap={data.recap} /> : null}
              <div className="mb-10 sm:mb-12">
                <HotGames games={data.hotGames} />
              </div>
            </div>

            <aside className="space-y-0">
              <GameDayNotifications notifications={data.notifications} />
              <GameDayMissionsPanel missions={data.missions} />
              <GameDayFriendsFeed items={data.friendActivity} />
              <GameDayCommunityMoments items={data.communityMoments} />
            </aside>
          </div>
        </div>
      </div>
    </LiveActivityProvider>
  );
}
