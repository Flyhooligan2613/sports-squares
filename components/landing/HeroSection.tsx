"use client";

import { useRef, type CSSProperties } from "react";
import { ChevronRight, Radio } from "lucide-react";
import Logo from "@/components/Logo";
import HeroBackground from "@/components/landing/hero/HeroBackground";
import HeroFeatureCards from "@/components/landing/hero/HeroFeatureCards";
import HeroProductShowcase from "@/components/landing/hero/HeroProductShowcase";
import { Button } from "@/components/ui/Button";
import { useHeroFeaturedPool } from "@/lib/landing/useHeroFeaturedPool";
import { useHeroParallax } from "@/lib/motion/useHeroParallax";

export default function HeroSection() {
  const { pool, liveGame, loading } = useHeroFeaturedPool();
  const sectionRef = useRef<HTMLElement>(null);
  useHeroParallax(sectionRef);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      ref={sectionRef}
      className="hero-section hero-v2 relative overflow-hidden min-h-[calc(100dvh-3.5rem)]"
      aria-label="SquareBoards hero"
      style={{ "--hero-parallax": "0" } as CSSProperties}
    >
      <HeroBackground />

      <div className="relative z-10 w-full px-4 sm:px-6 py-10 sm:py-12 lg:py-14">
        <div className="hero-v2-composition">
          {/* Headline → CTA */}
          <div className="hero-v2-copy landing-fade-up">
            <div className="hero-logo-glow flex justify-center mb-5 sm:mb-6">
              <Logo href="/" className="text-xl sm:text-2xl hero-logo-breathe" />
            </div>

            <div className="flex justify-center mb-4 sm:mb-5">
              <div className="hero-live-pill">
                <Radio className="w-3.5 h-3.5 text-sb-success" strokeWidth={2.5} />
                <span>Live Sports Squares</span>
                <span className="hero-live-pill-dot" aria-hidden />
              </div>
            </div>

            <h1 className="hero-headline hero-headline-v2 text-center">
              <span className="block">Pick Your Squares.</span>
              <span className="block hero-headline-accent">Watch the Game.</span>
              <span className="block">Win Big.</span>
            </h1>

            <p className="hero-subhead hero-subhead-v2 text-center mx-auto">
              Buy your lucky squares, follow live scores, and compete for every
              quarter using secure online payments.
            </p>

            <div className="hero-ctas hero-ctas-v2 justify-center mb-0">
              <Button
                variant="primary"
                className="hero-btn-premium w-full sm:w-auto min-w-[200px] group"
                onClick={() => scrollTo("pools")}
              >
                Play Now
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="secondary"
                className="hero-btn-secondary-v2 w-full sm:w-auto min-w-[200px]"
                onClick={() => scrollTo("join")}
              >
                Enter Pool Code
              </Button>
            </div>
          </div>

          {/* Live Scoreboard → Board → Stats */}
          <div className="hero-v2-showcase landing-fade-up landing-delay-1">
            <HeroProductShowcase
              pool={pool}
              liveGame={liveGame}
              loading={loading}
            />
          </div>

          <HeroFeatureCards className="hero-trust-demoted" />
        </div>
      </div>
    </section>
  );
}
