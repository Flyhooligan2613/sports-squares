import type { Metadata } from "next";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TournamentRoyaleHowToPlayTutorial from "@/components/tournamentRoyale/TournamentRoyaleHowToPlayTutorial";
import { TOURNAMENT_ROYALE_PUBLIC_NAME } from "@/lib/tournamentRoyale/config";
import { tournamentRoyalePath } from "@/lib/tournamentRoyale/routes";

export const metadata: Metadata = {
  title: `How to Play | ${TOURNAMENT_ROYALE_PUBLIC_NAME}`,
  description: "Learn Tournament Royale™ in under a minute — animated tutorial for SquareBoards.",
};

export default function TournamentRoyaleLearnPage() {
  return (
    <div className="tr-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="tr-ambient-blue" fixed />
      <AppMenuBar logoHref={tournamentRoyalePath()} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12 pb-16">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Interactive tutorial"
              title="How Tournament Royale™ works"
              subtitle="Five steps. One ecosystem. Learn through motion — not spreadsheets."
            />
          </ScrollReveal>
          <ScrollReveal delay={60}>
            <div className="max-w-2xl mx-auto mt-8">
              <TournamentRoyaleHowToPlayTutorial />
            </div>
          </ScrollReveal>
        </LandingSection>
      </div>
    </div>
  );
}
