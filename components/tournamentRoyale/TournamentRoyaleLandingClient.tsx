"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import { CONTEST_CTA_LABELS } from "@/lib/contestCenter/cta";
import { Button } from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlatformTrustStrip from "@/components/platform/PlatformTrustStrip";
import TournamentRoyaleTournamentSwitcher from "@/components/tournamentRoyale/TournamentRoyaleTournamentSwitcher";
import {
  getTournamentDefinition,
  parseTournamentKey,
  TOURNAMENT_ROYALE_PUBLIC_NAME,
} from "@/lib/tournamentRoyale/config";
import { tournamentRoyalePath } from "@/lib/tournamentRoyale/routes";

const PILLARS = [
  {
    title: "Cinderella Meter™",
    body: "Bold upset picks fill your meter — unlocking achievements, XP, badges, and community recognition.",
  },
  {
    title: "Bracket Combos™",
    body: "Consecutive correct picks multiply your rewards. Three in a row? Combo x2. Seven? Combo x5.",
  },
  {
    title: "Bracket Shields™",
    body: "One shield per tournament protects a single Elite Eight miss — automatic, equal for everyone.",
  },
  {
    title: "Never Stand Still",
    body: "Daily challenges, Tournament Highlights™, and The Huddle keep you engaged all tournament long.",
  },
];

function LandingContent() {
  const searchParams = useSearchParams();
  const tournamentKey = parseTournamentKey(searchParams.get("tournament"));
  const def = getTournamentDefinition(tournamentKey);
  const hubHref =
    tournamentKey === "ncaab_mens"
      ? tournamentRoyalePath("hub")
      : `${tournamentRoyalePath("hub")}?tournament=${tournamentKey}`;

  return (
    <div className="tr-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="tr-ambient-blue" fixed />
      <AppMenuBar logoHref={tournamentRoyalePath()} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12">
          <div className="flex justify-center mb-6">
            <Suspense fallback={null}>
              <TournamentRoyaleTournamentSwitcher />
            </Suspense>
          </div>

          <ExperienceHero
            badgeLabel="Flagship Experience"
            badgeVariant="live"
            title={TOURNAMENT_ROYALE_PUBLIC_NAME}
            subtitle={`${def.emoji} ${def.description} Predict. Progress. Never get eliminated after one miss.`}
            cta={{ label: CONTEST_CTA_LABELS["tournament-royale"], href: hubHref }}
          />

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Button href={hubHref}>{CONTEST_CTA_LABELS["tournament-royale"]}</Button>
            <Button href={tournamentRoyalePath("learn")} variant="secondary">
              How to Play
            </Button>
            <Button href={tournamentRoyalePath("hall-of-fame")} variant="secondary">
              Hall of Fame
            </Button>
          </div>

          <p className="text-center text-xs text-sb-muted mt-4 max-w-xl mx-auto">
            We are not building brackets. We are building a tournament ecosystem.
          </p>

          <PlatformTrustStrip className="mt-8 px-4" />
        </LandingSection>

        <LandingSection>
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Exclusive features"
              title="More than a bracket"
              subtitle="Every correct prediction builds XP, Legacy, tier progress, and community reputation."
            />
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {PILLARS.map((pillar, index) => (
              <ScrollReveal key={pillar.title} delay={index * 50}>
                <div className="landing-glass-card p-5 sm:p-6 h-full">
                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-sb-muted leading-relaxed">{pillar.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </LandingSection>
      </div>
    </div>
  );
}

export default function TournamentRoyaleLandingClient() {
  return (
    <Suspense fallback={null}>
      <LandingContent />
    </Suspense>
  );
}
