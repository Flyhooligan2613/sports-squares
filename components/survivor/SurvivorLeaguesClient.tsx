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
              title="Global Survivor opens soon"
              subtitle="The first SquareBoards Global Survivor league launches with Phase 2 — weekly picks, live eliminations, and automatic legacy tracking."
            />
          </ScrollReveal>

          <div className="landing-glass-card max-w-xl mx-auto text-center py-14 px-6 mt-6">
            <p className="text-4xl mb-4" aria-hidden>
              🌎
            </p>
            <h2 className="text-xl font-bold text-white mb-2">Get ready for kickoff</h2>
            <p className="text-sm text-sb-muted leading-relaxed mb-6">
              Join the flagship Global Classic league when Week 1 opens. Private leagues with
              custom fees and invite codes follow in Phase 4.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href={survivorPath("learn")}>Learn the rules</Button>
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
