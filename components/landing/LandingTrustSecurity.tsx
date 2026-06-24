import Link from "next/link";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { TRUST_SECURITY_ITEMS } from "@/lib/landing/blackLabelContent";
import { Button } from "@/components/ui/Button";

export default function LandingTrustSecurity() {
  return (
    <LandingSection id="trust-security" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Trust & Security"
          title="Built for Partners and Players"
          subtitle="Enterprise-grade security, compliance documentation, and fraud prevention — published openly."
        />
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {TRUST_SECURITY_ITEMS.map((item, index) => (
          <ScrollReveal key={item.title} delay={index * 50}>
            <LandingGlassCard className="p-6 sm:p-7 h-full">
              <span className="landing-icon-badge">
                <item.icon className="w-5 h-5" strokeWidth={1.75} />
              </span>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-sb-muted text-sm leading-relaxed mb-3">{item.description}</p>
              {item.href && (
                <Link
                  href={item.href}
                  className="text-sm text-sb-glow hover:text-white transition-colors"
                >
                  Learn more →
                </Link>
              )}
            </LandingGlassCard>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal delay={100}>
        <div className="text-center">
          <Button href="/trust" variant="secondary" className="min-w-[200px]">
            Visit Trust Center
          </Button>
        </div>
      </ScrollReveal>
    </LandingSection>
  );
}
