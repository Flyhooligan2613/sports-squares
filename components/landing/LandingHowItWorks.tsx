"use client";

import HeroFloatingBoard from "@/components/landing/hero/HeroFloatingBoard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS_STEPS } from "@/lib/landing/blackLabelContent";

export default function LandingHowItWorks() {
  return (
    <LandingSection id="how-it-works" variant="alt" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="How It Works"
          title="How SquareBoards Works"
          subtitle="From sign-up to your first withdrawal — one account powers the full experience."
        />
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="landing-how-board-stage mb-10 sm:mb-12">
          <HeroFloatingBoard />
        </div>
      </ScrollReveal>

      <div className="landing-how-steps">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <ScrollReveal key={step.title} delay={index * 50}>
            <div className="landing-how-step">
              <LandingGlassCard className="p-5 sm:p-6 h-full" hover={false}>
                <span className="landing-step-number">{index + 1}</span>
                <h3 className="text-white font-semibold mb-1.5">{step.title}</h3>
                <p className="text-sb-muted text-sm leading-relaxed">{step.description}</p>
              </LandingGlassCard>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <span className="landing-how-step-arrow hidden lg:block" aria-hidden>
                  →
                </span>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
