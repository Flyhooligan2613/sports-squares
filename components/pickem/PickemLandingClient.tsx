"use client";

import { useEffect, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import { Button } from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlatformTrustStrip from "@/components/platform/PlatformTrustStrip";
import EntryTierSelector from "@/components/platform/EntryTierSelector";
import type { PickemOverviewStats, PickemWeekView } from "@/lib/pickem/types";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const FEATURES = [
  {
    title: "Pick winners, not spreads",
    description:
      "No point spreads, no odds, no fantasy stats. Just choose the team you think wins.",
  },
  {
    title: "Instant saves",
    description:
      "Tap a team and your pick saves immediately. Edit anytime until kickoff.",
  },
  {
    title: "Live game day",
    description:
      "Cards turn green or red as games finish. Track your record and streak in real time.",
  },
  {
    title: "One SquareBoards account",
    description:
      "Same login, wallet, notifications, and profile across every platform game.",
  },
];

export default function PickemLandingClient() {
  const [overview, setOverview] = useState<PickemOverviewStats | null>(null);
  const [week, setWeek] = useState<PickemWeekView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/pickem/overview", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          overview: PickemOverviewStats;
          week: PickemWeekView;
        };
        setOverview(json.overview);
        setWeek(json.week);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="pickem-page min-h-screen relative">
      <AmbientBackground className="pickem-ambient-green" />
      <AppMenuBar logoHref="/pickem" />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12">
          <ExperienceHero
            badgeLabel="Flagship Game #2"
            badgeVariant="live"
            title="SquareBoards Pick'em"
            subtitle="Predict every NFL winner. Build winning streaks. Compete worldwide."
            stats={
              overview
                ? [
                    { label: "Players This Week", value: overview.playersThisWeek },
                    { label: "Prize Pool", value: formatMoney(overview.prizePoolCents) },
                    { label: "Longest Streak", value: overview.longestActiveStreak },
                    { label: "Season Week", value: overview.seasonWeek },
                  ]
                : undefined
            }
            cta={{ label: "Play This Week", href: "/pickem/week" }}
          />

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Button href="/pickem/week">Play This Week</Button>
            <Button href="/pickem/week" variant="secondary">
              My Picks
            </Button>
            <Button href="/pickem/leaderboards" variant="secondary">
              Leaderboards
            </Button>
          </div>

          {overview ? (
            <p className="text-center text-sm text-sb-muted mt-6">
              {overview.contestLabel} · {overview.gamesRemaining} games remaining this week
            </p>
          ) : loading ? (
            <p className="text-center text-sm text-sb-muted mt-6">Loading live stats…</p>
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
              <EntryTierSelector hrefBuilder={(tier) => `/pickem/week?tier=${tier.cents}`} />
            </LandingGlassCard>
          </ScrollReveal>
        </LandingSection>

        <LandingSection>
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="How it works"
              title="Football pools, reimagined"
              subtitle="Classic pick-the-winner pools — built for everyone, from casual fans to die-hards."
            />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((feature, index) => (
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
                subtitle={`${week.games.length} NFL games · ${week.progress.remaining} picks remaining for you`}
              />
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <LandingGlassCard className="p-6 sm:p-8 text-center">
                <p className="text-3xl font-bold text-white mb-2">
                  {week.progress.completed}/{week.progress.total}
                </p>
                <p className="text-sb-muted text-sm mb-6">Your picks complete</p>
                <Button href="/pickem/week">Make your picks</Button>
              </LandingGlassCard>
            </ScrollReveal>
          </LandingSection>
        ) : null}
      </div>
    </div>
  );
}
