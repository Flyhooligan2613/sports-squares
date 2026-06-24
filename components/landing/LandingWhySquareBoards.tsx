import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { WHY_SQUAREBOARDS } from "@/lib/landing/blackLabelContent";

export default function LandingWhySquareBoards() {
  return (
    <LandingSection id="why-squareboards" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Platform"
          title="Why SquareBoards"
          subtitle="A premium competitive sports platform built on fairness, security, and trust."
        />
      </ScrollReveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {WHY_SQUAREBOARDS.map((item, index) => (
          <ScrollReveal key={item.title} delay={index * 70}>
            <LandingGlassCard className="p-6 sm:p-7 h-full">
              <span className="landing-icon-badge">
                <item.icon className="w-5 h-5" strokeWidth={1.75} />
              </span>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sb-muted text-sm leading-relaxed">{item.description}</p>
            </LandingGlassCard>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
