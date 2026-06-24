"use client";

import { ChevronRight } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { openSignupPrompt } from "@/lib/auth/signupPrompt";
import { Button } from "@/components/ui/Button";

export default function LandingFinalCTA() {
  return (
    <LandingSection id="ready-to-play" variant="glow" scrollMargin className="pb-16">
      <ScrollReveal>
        <div className="landing-cta-banner text-center px-6 py-12 sm:py-16">
          <p className="landing-section-eyebrow mb-3">Get Started</p>
          <h2 className="landing-section-title mb-3">Ready to Play?</h2>
          <p className="landing-section-subtitle mx-auto mb-8 max-w-xl">
            Join the platform trusted by competitors and built for launch-ready partners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="primary"
              className="hero-btn-premium sb-btn-spring w-full sm:w-auto min-w-[200px] group"
              onClick={() => openSignupPrompt()}
            >
              Download App
              <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </Button>
            <Button
              variant="secondary"
              className="sb-btn-spring w-full sm:w-auto min-w-[200px]"
              onClick={() => openSignupPrompt()}
            >
              Create Account
            </Button>
            <Button href="/about" variant="ghost" className="sb-btn-spring w-full sm:w-auto min-w-[200px]">
              Learn More
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </LandingSection>
  );
}
