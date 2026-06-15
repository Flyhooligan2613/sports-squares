"use client";

import { Suspense } from "react";
import FeaturedPools from "@/components/landing/FeaturedPools";
import HomeEcosystemSection from "@/components/landing/HomeEcosystemSection";
import HomeHappeningNow from "@/components/landing/HomeHappeningNow";
import HomePlatformValueSection from "@/components/landing/HomePlatformValueSection";
import JoinPoolSection from "@/components/landing/JoinPoolSection";
import { LandingLiveProvider } from "@/components/landing/LandingLiveProvider";
import MarketplaceSports from "@/components/landing/MarketplaceSports";
import SocialProof from "@/components/landing/SocialProof";
import AmbientBackground from "@/components/ui/AmbientBackground";
import LiveActivityTicker from "@/components/liveActivity/LiveActivityTicker";
import GameDayContinuePanel from "@/components/game-day/GameDayContinuePanel";
import DailyStoryCard from "@/components/home/DailyStoryCard";
import GameRoomBrowseStrip from "@/components/home/GameRoomBrowseStrip";
import GameRoomHero from "@/components/home/GameRoomHero";
import GameRoomSportTabs from "@/components/home/GameRoomSportTabs";
import GameRoomRewardSection from "@/components/home/GameRoomRewardSection";
import HomeFriendsPanel from "@/components/home/HomeFriendsPanel";
import HomeProgressionCenter from "@/components/home/HomeProgressionCenter";
import HomeStagger from "@/components/home/HomeStagger";
import type { HomeData } from "@/lib/gameDay/types";
import type { GameDayContinueItem } from "@/lib/gameDay/types";
import {
  HUB_SECTION,
  GAME_ROOM_SECTION_TABS,
  hubSectionAnchorClassName,
} from "@/lib/home/hubSections";
import { useHubHashScroll } from "@/components/home/useHubHashScroll";
import GameHubSectionTabs from "@/components/home/GameHubSectionTabs";

interface GameRoomExperienceProps {
  data: HomeData;
  revealed: boolean;
  continueItems: GameDayContinueItem[];
  rewardDropGlow: boolean;
}

export default function GameRoomExperience({
  data,
  revealed,
  continueItems,
  rewardDropGlow,
}: GameRoomExperienceProps) {
  useHubHashScroll(revealed, [revealed]);

  return (
    <div className="gameroom-page home-page home-page-revealed">
      <AmbientBackground />
      <div className="gameroom-ambient-grid" aria-hidden />

      <HomeStagger delay={0} revealed={revealed}>
        <div className="gd-live-ribbon gameroom-live-ribbon">
          <LiveActivityTicker className="gd-live-ribbon-ticker" />
        </div>
      </HomeStagger>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 pt-4 sm:pt-6">
        <HomeStagger delay={60} revealed={revealed}>
          <GameRoomHero
            greeting={data.greeting}
            subtitle="Your hub for every game on SquareBoards — pick a table, chase rewards, and run it back."
            avatarEmoji={data.avatarEmoji}
            isGameDay={data.isGameDay}
            atmosphereLabel={data.atmosphere.label}
          />
        </HomeStagger>

        <HomeStagger delay={100} revealed={revealed}>
          <GameRoomSportTabs />
        </HomeStagger>

        <HomeStagger delay={120} revealed={revealed}>
          <GameHubSectionTabs tabs={GAME_ROOM_SECTION_TABS} mode="home" />
        </HomeStagger>

        {continueItems.length > 0 ? (
          <HomeStagger delay={140} revealed={revealed}>
            <GameDayContinuePanel items={continueItems} glowRewardDrop={rewardDropGlow} />
          </HomeStagger>
        ) : null}

        <HomeStagger delay={200} revealed={revealed}>
          <DailyStoryCard story={data.dailyStory} />
        </HomeStagger>

        <LandingLiveProvider>
          <HomeStagger delay={260} revealed={revealed} className="gameroom-section">
            <HomeHappeningNow />
          </HomeStagger>

          <HomeStagger delay={320} revealed={revealed}>
            <div id={HUB_SECTION.browse} className={hubSectionAnchorClassName()}>
              <GameRoomBrowseStrip />
            </div>
          </HomeStagger>

          <HomeStagger delay={380} revealed={revealed}>
            <div className="gameroom-player-row grid lg:grid-cols-2 gap-8 xl:gap-10 mb-2">
              <HomeFriendsPanel data={data.friendsPlaying} />
              <HomeProgressionCenter progress={data.progressCenter} />
            </div>
          </HomeStagger>

          <HomeStagger delay={440} revealed={revealed} className="gameroom-section">
            <HomeEcosystemSection />
          </HomeStagger>

          <HomeStagger delay={500} revealed={revealed} className="gameroom-section">
            <HomePlatformValueSection />
          </HomeStagger>

          <HomeStagger delay={560} revealed={revealed} className="gameroom-section">
            <Suspense fallback={null}>
              <MarketplaceSports />
            </Suspense>
          </HomeStagger>

          <HomeStagger delay={620} revealed={revealed} className="gameroom-section">
            <FeaturedPools />
          </HomeStagger>

          <HomeStagger delay={680} revealed={revealed} className="gameroom-section">
            <JoinPoolSection />
          </HomeStagger>

          <HomeStagger delay={740} revealed={revealed} className="gameroom-section">
            <SocialProof />
          </HomeStagger>

          <HomeStagger delay={800} revealed={revealed} className="gameroom-section">
            <div id={HUB_SECTION.rewards} className={hubSectionAnchorClassName()}>
              <GameRoomRewardSection />
            </div>
          </HomeStagger>
        </LandingLiveProvider>
      </div>
    </div>
  );
}
