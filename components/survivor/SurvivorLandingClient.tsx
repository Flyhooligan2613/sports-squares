"use client";

import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ExperienceHero from "@/components/ui/ExperienceHero";
import { Button } from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlatformTrustStrip from "@/components/platform/PlatformTrustStrip";
import SurvivorModeCards from "@/components/survivor/SurvivorModeCards";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";
import { survivorPath } from "@/lib/survivor/routes";

const PILLARS = [
  {
    title: "Live Survival Map",
    body: "Track eliminations, popular picks, and upset risk all weekend long.",
  },
  {
    title: "Legacy & Hall of Fame",
    body: "Every season builds your career stats, badges, and permanent legacy.",
  },
  {
    title: "Never Stand Still",
    body: "Eliminated? Side challenges, Reward Drops, Squares, and Pick'em keep you in the game.",
  },
];

export default function SurvivorLandingClient() {
  return (
    <div className="survivor-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="survivor-ambient-amber" fixed />
      <AppMenuBar logoHref={survivorPath()} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12">
          <ExperienceHero
            badgeLabel="Flagship Game #3"
            badgeVariant="live"
            title={SURVIVOR_X_PUBLIC_NAME}
            subtitle="Survive the entire NFL season. Build your legacy. One pick per week — never the same team twice."
            cta={{ label: "Play This Week", href: survivorPath("week") }}
          />

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Button href={survivorPath("week")}>Play This Week</Button>
            <Button href={survivorPath("learn")} variant="secondary">
              How to Play
            </Button>
            <Button href={survivorPath("hall-of-fame")} variant="secondary">
              Hall of Fame
            </Button>
          </div>

          <p className="text-center text-xs text-sb-muted mt-4 max-w-xl mx-auto">
            Global Classic is live — lock one NFL team each week. Never pick the same team twice.
          </p>

          <PlatformTrustStrip className="mt-8 px-4" />
        </LandingSection>

        <LandingSection>
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Game modes"
              title="Choose your Survivor journey"
              subtitle="Classic and Global launch first. Double Life, Turbo, and Private leagues follow."
            />
          </ScrollReveal>
          <ScrollReveal delay={40}>
            <SurvivorModeCards />
          </ScrollReveal>
        </LandingSection>

        <LandingSection variant="alt">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Platform"
              title="More than a pick'em pool"
              subtitle="Survivor X™ connects to legacy, rewards, community, and live tracking across SquareBoards."
            />
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
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
