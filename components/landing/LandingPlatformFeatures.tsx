import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { PLATFORM_FEATURES } from "@/lib/landing/blackLabelContent";

export default function LandingPlatformFeatures() {
  return (
    <LandingSection id="platform-features" variant="glow" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Features"
          title="Platform Features"
          subtitle="Everything competitors need — wallet, contests, rewards, and community in one ecosystem."
        />
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {PLATFORM_FEATURES.map((feature, index) => (
          <ScrollReveal key={feature.title} delay={index * 40}>
            <LandingGlassCard className="p-6 sm:p-7 h-full" glow>
              <span className="landing-icon-badge">
                <feature.icon className="w-5 h-5" strokeWidth={1.75} />
              </span>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-sb-muted text-sm leading-relaxed">{feature.description}</p>
            </LandingGlassCard>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
