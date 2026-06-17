"use client";

import { useEffect, useState, useCallback } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import SportBackdrop from "@/components/sports/SportBackdrop";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import { Button } from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlatformTrustStrip from "@/components/platform/PlatformTrustStrip";
import EntryTierSelector from "@/components/platform/EntryTierSelector";
import type { PickemOverviewStats, PickemSport, PickemWeekView } from "@/lib/pickem/types";
import { pickemApiUrl, pickemAmbientClass, pickemBasePath, pickemSportLabel } from "@/lib/pickem/routes";
import { FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME } from "@/lib/soccerPickem/config";
import { WNBA_PICKEM_ROYALE_PUBLIC_NAME } from "@/lib/wnbaPickem/config";
import {
  pickemGamesRemainingLabel,
  pickemLandingAccountTagline,
  pickemLandingFeatures,
  pickemLandingHowItWorksSubtitle,
  pickemLandingHowItWorksTitle,
} from "@/lib/pickem/copy";
import { fastFetchJson } from "@/lib/client/fastFetch";
import { usePullRefresh } from "@/lib/client/usePullRefresh";
import { COMMUNITY_LABELS, CONTEST_CTAS, getLoadingMessage, PROFILE_LABELS } from "@/lib/platform/language";
import { pickemSportToBackdropId } from "@/lib/sports/sportBackdrops";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PickemLandingClient({ sport = "nfl" }: { sport?: PickemSport }) {
  const basePath = pickemBasePath(sport);
  const sportLabel = pickemSportLabel(sport);
  const ambientClass = pickemAmbientClass(sport);
  const heroTitle =
    sport === "mlb"
      ? "MLB Pick'em"
      : sport === "soccer"
        ? FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME
        : sport === "wnba"
          ? WNBA_PICKEM_ROYALE_PUBLIC_NAME
          : "SquareBoards Pick'em";
  const badgeLabel =
    sport === "soccer" ? "Global Football" : sport === "wnba" ? "Women's Sports Hub" : "Flagship Game #2";
  const seasonWeekLabel = sport === "soccer" ? "Matchweek" : "Season Week";
  const features = pickemLandingFeatures(sport);
  const [overview, setOverview] = useState<PickemOverviewStats | null>(null);
  const [week, setWeek] = useState<PickemWeekView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const json = await fastFetchJson<{
        overview: PickemOverviewStats;
        week: PickemWeekView;
      }>(`pickem-overview-${sport}`, pickemApiUrl("overview", sport), {
        maxAgeMs: 20_000,
      });
      setOverview(json.overview);
      setWeek(json.week);
    } finally {
      setLoading(false);
    }
  }, [sport]);

  useEffect(() => {
    void load();
  }, [load]);

  usePullRefresh(load);

  return (
    <div className="pickem-page min-h-screen relative overflow-x-hidden">
      <SportBackdrop sportId={pickemSportToBackdropId(sport)} variant="full" fixed />
      <AmbientBackground className={ambientClass} fixed />
      <AppMenuBar logoHref={basePath} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12">
          <ExperienceHero
            badgeLabel={badgeLabel}
            badgeVariant="live"
            title={heroTitle}
            subtitle={`Predict every ${sportLabel} winner. Build winning streaks. Compete worldwide.`}
            stats={
              overview
                ? [
                    { label: "Players This Week", value: overview.playersThisWeek },
                    { label: "Prize Pool", value: formatMoney(overview.prizePoolCents) },
                    { label: "Longest Streak", value: overview.longestActiveStreak },
                    { label: seasonWeekLabel, value: overview.seasonWeek },
                  ]
                : undefined
            }
            cta={{ label: CONTEST_CTAS.competeNow, href: `${basePath}/week` }}
          />

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Button href={`${basePath}/week`}>{CONTEST_CTAS.competeNow}</Button>
            <Button href={`${basePath}/week`} variant="secondary">
              My Picks
            </Button>
            <Button href={`${basePath}/leaderboards`} variant="secondary">
              {COMMUNITY_LABELS.competitionRankings}
            </Button>
            <Button href={`${basePath}/history`} variant="secondary">
              {PROFILE_LABELS.competitorProfile}
            </Button>
            <Button href={`${basePath}/hall-of-fame`} variant="secondary">
              Hall of Fame
            </Button>
            {sport === "soccer" && (
              <Button href={`${basePath}/learn`} variant="secondary">
                How to Play
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-sb-muted mt-4 max-w-xl mx-auto">
            {pickemLandingAccountTagline(sport)}
          </p>

          {overview ? (
            <p className="text-center text-sm text-sb-muted mt-6">
              {overview.contestLabel} · {overview.gamesRemaining} games remaining this week
            </p>
          ) : loading ? (
            <p className="text-center text-sm text-sb-muted mt-6">{getLoadingMessage("pickem")}</p>
          ) : null}

          <PlatformTrustStrip className="mt-8 px-4" />
        </LandingSection>

        <LandingSection>
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Entry levels"
              title="Pick your buy-in"
              subtitle="Every tier runs the same game — choose Beginner, Casual, or Premium."
            />
          </ScrollReveal>
          <ScrollReveal delay={60}>
            <LandingGlassCard className="p-6 sm:p-8">
              <EntryTierSelector
                hrefBuilder={(tier) => `${basePath}/week?tier=${tier.cents}`}
              />
            </LandingGlassCard>
          </ScrollReveal>
        </LandingSection>

        <LandingSection>
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="How it works"
              title={pickemLandingHowItWorksTitle(sport)}
              subtitle={pickemLandingHowItWorksSubtitle(sport)}
            />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 60}>
                <LandingGlassCard className="p-6 h-full pickem-feature-card">
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sb-muted text-sm leading-relaxed">{feature.description}</p>
                </LandingGlassCard>
              </ScrollReveal>
            ))}
          </div>
        </LandingSection>

        {week && week.games.length > 0 ? (
          <LandingSection variant="alt">
            <ScrollReveal>
              <LandingSectionHeader
                eyebrow="This week"
                title={`${week.contest.label} slate`}
                subtitle={pickemGamesRemainingLabel(
                  sport,
                  week.games.length,
                  week.progress.remaining
                )}
              />
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <LandingGlassCard className="p-6 sm:p-8 text-center">
                <p className="text-3xl font-bold text-white mb-2">
                  {week.progress.completed}/{week.progress.total}
                </p>
                <p className="text-sb-muted text-sm mb-6">Your picks complete</p>
                <Button href={`${basePath}/week`}>Make your picks</Button>
              </LandingGlassCard>
            </ScrollReveal>
          </LandingSection>
        ) : null}
      </div>
    </div>
  );
}
