import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { WHY_PLAYERS_CHOOSE } from "@/lib/landing/blackLabelContent";

export default function LandingWhyPlayersChoose() {
  return (
    <LandingSection id="why-players-choose" variant="alt" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Competitors"
          title="Why Players Choose SquareBoards"
          subtitle="Transparency, security, and community — the reasons competitors stay."
        />
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {WHY_PLAYERS_CHOOSE.map((item, index) => (
          <ScrollReveal key={item.title} delay={index * 50}>
            <LandingGlassCard className="p-6 sm:p-7 h-full">
              <span className="landing-icon-badge">
                <item.icon className="w-5 h-5" strokeWidth={1.75} />
              </span>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-sb-muted text-sm leading-relaxed">{item.description}</p>
            </LandingGlassCard>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
