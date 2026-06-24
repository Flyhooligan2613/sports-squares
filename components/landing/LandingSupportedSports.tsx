import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { SUPPORTED_SPORTS } from "@/lib/landing/blackLabelContent";

export default function LandingSupportedSports() {
  return (
    <LandingSection id="supported-sports" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Sports"
          title="Supported Sports"
          subtitle="Classic squares boards and competitive formats across major leagues — with more on the way."
        />
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {SUPPORTED_SPORTS.map((sport, index) => (
          <ScrollReveal key={sport.name} delay={index * 50}>
            <LandingGlassCard className="p-6 sm:p-7 h-full">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="landing-icon-badge">
                  <sport.icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                {sport.status === "future" && (
                  <span className="text-[10px] uppercase tracking-wider text-sb-glow/80 border border-sb-purple/30 rounded-full px-2 py-0.5">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{sport.name}</h3>
              <p className="text-sb-muted text-sm leading-relaxed">{sport.description}</p>
            </LandingGlassCard>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
