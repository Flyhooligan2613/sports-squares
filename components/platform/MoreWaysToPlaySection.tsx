import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import PlatformGameCard from "@/components/platform/PlatformGameCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { PLATFORM_GAMES } from "@/lib/platform/gameTypes";

export default function MoreWaysToPlaySection() {
  return (
    <LandingSection variant="glow">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Platform"
          title="More Ways To Play"
          subtitle="One account. Multiple premium games. SquareBoards is just the beginning."
          align="center"
        />
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {PLATFORM_GAMES.map((game, index) => (
          <ScrollReveal key={game.id} delay={index * 55}>
            <PlatformGameCard game={game} variant="home" index={index} />
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
