import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { PLATFORM_VALUE_PILLARS } from "@/lib/platform/ecosystemHome";

export default function HomePlatformValueSection() {
  return (
    <LandingSection variant="alt" className="home-platform-value-section">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Why SquareBoards"
          title="More Than A Game."
          subtitle="SquareBoards isn't one game. It's an entire sports gaming platform built for fans who want more."
          align="center"
        />
      </ScrollReveal>

      <div className="home-platform-value-grid">
        {PLATFORM_VALUE_PILLARS.map((pillar, index) => (
          <ScrollReveal key={pillar.title} delay={index * 40}>
            <div className="home-platform-value-pillar sb-card-interactive">
              <span className="home-platform-value-emoji" aria-hidden>
                {pillar.emoji}
              </span>
              <p className="home-platform-value-label">{pillar.title}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
