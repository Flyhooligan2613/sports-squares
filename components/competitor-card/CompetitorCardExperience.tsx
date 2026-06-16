"use client";

import { useCallback, useEffect, useState } from "react";
import DeferredMount from "@/components/ui/DeferredMount";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { CompetitorCardData, CompetitorCardMode } from "@/lib/competitorCard/types";
import { getLoadingMessage } from "@/lib/platform/language";
import AchievementsGrid from "./AchievementsGrid";
import CareerRecords from "./CareerRecords";
import CareerShowcase from "./CareerShowcase";
import CommunityPanel from "./CommunityPanel";
import CompetitorHeader from "./CompetitorHeader";
import CompetitorScoreCard from "./CompetitorScoreCard";
import CustomizationPanel from "./CustomizationPanel";
import HeroStats from "./HeroStats";
import LegacyTimeline from "./LegacyTimeline";
import ReputationPanel from "./ReputationPanel";
import Rivalries from "./Rivalries";
import SeasonDashboard from "./SeasonDashboard";
import TierProgressCard from "./TierProgressCard";
import TrophyRoom from "./TrophyRoom";
import { CardSkeleton } from "./shared";
import {
  CareerProgressTracker,
  DailyMotivationBanner,
  MissionCenterPanel,
  RookieWelcomeBanner,
  useGenesisPageVisit,
} from "@/components/genesis";
import GenesisProfileCustomization from "@/components/genesis/GenesisProfileCustomization";

interface CompetitorCardExperienceProps {
  mode: CompetitorCardMode;
  slug: string;
  initialData?: CompetitorCardData | null;
  className?: string;
}

export default function CompetitorCardExperience({
  mode,
  slug,
  initialData = null,
  className = "",
}: CompetitorCardExperienceProps) {
  const [data, setData] = useState<CompetitorCardData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const endpoint =
    mode === "own" ? "/api/profile" : `/api/profile/${encodeURIComponent(slug)}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { cache: "no-store", credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? COMPETITOR_CARD_COPY.errors.loadFailed);
      }
      const json = (await res.json()) as CompetitorCardData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : COMPETITOR_CARD_COPY.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (!initialData) void load();
  }, [initialData, load]);

  if (loading && !data) {
    return (
      <div className={`space-y-6 ${className}`} aria-busy aria-label={getLoadingMessage("profile")}>
        <CardSkeleton lines={4} />
        <CardSkeleton lines={3} />
        <div className="grid sm:grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-6 ${className}`} role="alert">
        <p className="text-red-200">{error}</p>
        <button
          type="button"
          className="mt-4 text-sm text-sb-glow hover:underline"
          onClick={() => void load()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const showGenesis = data.isOwner;

  return (
    <>
      <GenesisRookieHooks active={showGenesis} />
      <CompetitorCardBody data={data} className={className} />
    </>
  );
}

function GenesisRookieHooks({ active }: { active: boolean }) {
  useGenesisPageVisit(active ? "visit_trophy_room" : null);
  return null;
}

function CompetitorCardBody({
  data,
  className,
}: {
  data: CompetitorCardData;
  className: string;
}) {
  return (
    <article className={`cc-experience space-y-8 sm:space-y-10 ${className}`} aria-label={COMPETITOR_CARD_COPY.title}>
      {data.isOwner ? (
        <>
          <RookieWelcomeBanner />
          <DailyMotivationBanner />
          <CareerProgressTracker />
        </>
      ) : null}
      <CompetitorHeader data={data} />
      <CompetitorScoreCard score={data.score} />
      <HeroStats stats={data.heroStats} />
      <TierProgressCard tier={data.tier} />
      <ReputationPanel reputation={data.reputation} />

      <DeferredMount minHeight="12rem">
        <CareerShowcase items={data.careerShowcase} />
      </DeferredMount>

      <DeferredMount minHeight="12rem">
        <TrophyRoom trophies={data.trophies} />
      </DeferredMount>

      <DeferredMount minHeight="14rem">
        <LegacyTimeline events={data.legacyTimeline} />
      </DeferredMount>

      <DeferredMount minHeight="10rem">
        <SeasonDashboard season={data.season} />
      </DeferredMount>

      <DeferredMount minHeight="10rem">
        <CareerRecords records={data.careerRecords} />
      </DeferredMount>

      <DeferredMount minHeight="8rem">
        <Rivalries rivalries={data.rivalries} />
      </DeferredMount>

      <DeferredMount minHeight="10rem">
        <CommunityPanel community={data.community} />
      </DeferredMount>

      <DeferredMount minHeight="10rem">
        <AchievementsGrid achievements={data.achievements} />
      </DeferredMount>

      {data.isOwner ? (
        <DeferredMount minHeight="12rem">
          <MissionCenterPanel />
        </DeferredMount>
      ) : null}

      <DeferredMount minHeight="8rem">
        {data.isOwner ? (
          <GenesisProfileCustomization />
        ) : (
          <CustomizationPanel customization={data.customization} isOwner={data.isOwner} />
        )}
      </DeferredMount>
    </article>
  );
}
