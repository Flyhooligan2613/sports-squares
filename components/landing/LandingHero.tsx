"use client";

import { useRef, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import Logo from "@/components/Logo";
import LandingPhoneShowcase from "@/components/landing/LandingPhoneShowcase";
import HeroParticles from "@/components/landing/HeroParticles";
import { HERO_COPY } from "@/lib/landing/blackLabelContent";
import { openSignupPrompt } from "@/lib/auth/signupPrompt";
import { Button } from "@/components/ui/Button";
import { useHeroParallax } from "@/lib/motion/useHeroParallax";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  useHeroParallax(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="landing-hero relative overflow-hidden min-h-[calc(100dvh-3.5rem)]"
      aria-label="SquareBoards hero"
      style={{ "--hero-parallax": "0" } as CSSProperties}
    >
      <div className="landing-hero-bg absolute inset-0 pointer-events-none" aria-hidden>
        <div className="landing-hero-gradient" />
        <div className="landing-hero-grid" />
        <div className="landing-hero-stadium-glow" />
        <HeroParticles />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 lg:pt-16 pb-12 lg:pb-16">
        <div className="hero-layout">
          <div className="hero-col-copy landing-fade-up">
            <Logo href="/" className="text-xl sm:text-2xl mb-6 sm:mb-8" />

            <h1 className="hero-headline hero-headline-v2 hero-headline-premium text-left mb-4 sm:mb-5">
              {HERO_COPY.headline}
            </h1>

            <p className="text-sb-muted text-base sm:text-lg leading-relaxed max-w-xl mb-6 sm:mb-8">
              {HERO_COPY.supporting}
            </p>

            <div className="hero-ctas hero-ctas-v2 hero-ctas-spacious sm:flex-row sm:items-center">
              <Button
                variant="primary"
                className="hero-btn-premium sb-btn-spring w-full sm:w-auto min-w-[200px] group"
                onClick={() => openSignupPrompt()}
              >
                {HERO_COPY.primaryCta}
                <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </Button>
              <Button
                variant="secondary"
                href="/about"
                className="hero-btn-secondary-v2 sb-btn-spring w-full sm:w-auto min-w-[200px]"
              >
                {HERO_COPY.secondaryCta}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="mt-5 text-sm text-sb-glow/90 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              {HERO_COPY.howItWorksLink}
            </button>
          </div>

          <div className="hero-col-scene landing-fade-up landing-delay-1">
            <LandingPhoneShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
