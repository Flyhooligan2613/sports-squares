import type { Metadata } from "next";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import FootballPickemHowToPlayTutorial from "@/components/soccerPickem/FootballPickemHowToPlayTutorial";
import {
  FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME,
  SOCCER_PICKEM_BASE_PATH,
} from "@/lib/soccerPickem/config";

export const metadata: Metadata = {
  title: `How to Play | ${FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME}`,
  description: "Learn Football Pick'em Royale™ in under a minute — animated rules for SquareBoards.",
};

export default function SoccerPredictorLearnPage() {
  return (
    <div className="pickem-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="pickem-ambient-cyan" fixed />
      <AppMenuBar logoHref={SOCCER_PICKEM_BASE_PATH} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12 pb-16">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Interactive tutorial"
              title="How Football Pick'em Royale™ works"
              subtitle="Five steps. Every matchday. Learn through motion — not spreadsheets."
            />
          </ScrollReveal>
          <ScrollReveal delay={60}>
            <div className="max-w-2xl mx-auto mt-8">
              <FootballPickemHowToPlayTutorial />
            </div>
          </ScrollReveal>
        </LandingSection>
      </div>
    </div>
  );
}
