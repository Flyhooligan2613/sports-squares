"use client";

import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";
import { survivorPath } from "@/lib/survivor/routes";

export default function SurvivorLeaguesClient() {
  return (
    <div className="survivor-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="survivor-ambient-amber" fixed />
      <AppMenuBar logoHref={survivorPath()} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Leagues"
              title="Global Survivor is live"
              subtitle="Join the flagship SquareBoards Survivor X™ league — free entry, one pick per week, last standing wins."
            />
          </ScrollReveal>

          <div className="landing-glass-card max-w-xl mx-auto text-center py-14 px-6 mt-6">
            <p className="text-4xl mb-4" aria-hidden>
              🌎
            </p>
            <h2 className="text-xl font-bold text-white mb-2">Classic Global Survivor</h2>
            <p className="text-sm text-sb-muted leading-relaxed mb-6">
              Double Life, Turbo, and Private leagues arrive in a future phase. For now, everyone
              plays in the Global Classic pool.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href={survivorPath("week")}>Play This Week</Button>
              <Button href={survivorPath()} variant="secondary">
                Back to hub
              </Button>
            </div>
          </div>
        </LandingSection>
      </div>
    </div>
  );
}
