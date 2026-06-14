import type { Metadata } from "next";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SurvivorHowToPlayTutorial from "@/components/survivor/SurvivorHowToPlayTutorial";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";
import { survivorPath } from "@/lib/survivor/routes";

export const metadata: Metadata = {
  title: `How to Play | ${SURVIVOR_X_PUBLIC_NAME}`,
  description: "Learn Survivor X™ in under a minute — animated rules for SquareBoards NFL Survivor.",
};

export default function SurvivorLearnPage() {
  return (
    <div className="survivor-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="survivor-ambient-amber" fixed />
      <AppMenuBar logoHref={survivorPath()} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12 pb-16">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Interactive tutorial"
              title="How Survivor X™ works"
              subtitle="Five rules. One season. Teach through motion — not walls of text."
            />
          </ScrollReveal>
          <ScrollReveal delay={60}>
            <div className="max-w-2xl mx-auto mt-8">
              <SurvivorHowToPlayTutorial />
            </div>
          </ScrollReveal>
        </LandingSection>
      </div>
    </div>
  );
}
