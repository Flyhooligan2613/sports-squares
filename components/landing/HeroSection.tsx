"use client";

import { ChevronRight, Radio } from "lucide-react";
import Logo from "@/components/Logo";
import HeroBackground from "@/components/landing/hero/HeroBackground";
import HeroFeatureCards from "@/components/landing/hero/HeroFeatureCards";
import HeroScene from "@/components/landing/hero/HeroScene";
import { Button } from "@/components/ui/Button";
import { useHeroFeaturedPool } from "@/lib/landing/useHeroFeaturedPool";

export default function HeroSection() {
  const { pool, liveGame, loading } = useHeroFeaturedPool();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      className="hero-section relative overflow-hidden min-h-[calc(100dvh-3.5rem)]"
      aria-label="SquareBoards hero"
    >
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="hero-layout">
          {/* Copy + CTAs */}
          <div className="hero-col-copy landing-fade-up">
            <div className="hero-logo-wrap mb-5 sm:mb-6">
              <Logo href="/" className="text-lg sm:text-xl scale-110 origin-left" />
            </div>

            <div className="hero-live-pill mb-5 sm:mb-6">
              <Radio className="w-3.5 h-3.5 text-sb-success" strokeWidth={2.5} />
              <span>Live Sports Squares</span>
              <span className="hero-live-pill-dot" aria-hidden />
            </div>

            <h1 className="hero-headline">
              <span className="block">Pick Your Squares.</span>
              <span className="block hero-headline-accent">Watch the Game.</span>
              <span className="block">Win Big.</span>
            </h1>

            <p className="hero-subhead">
              Buy your lucky squares, follow live scores, and compete for every
              quarter using secure online payments.
            </p>

            <div className="hero-ctas">
              <Button
                variant="primary"
                className="hero-btn-primary w-full sm:w-auto min-w-[180px] group"
                onClick={() => scrollTo("pools")}
              >
                Play Now
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto min-w-[180px]"
                onClick={() => scrollTo("join")}
              >
                Enter Pool Code
              </Button>
            </div>

            <HeroFeatureCards className="mt-8 sm:mt-10 hidden lg:grid" />
          </div>

          {/* Stadium scene */}
          <div className="hero-col-scene landing-fade-up landing-delay-1">
            <HeroScene pool={pool} liveGame={liveGame} loading={loading} />
          </div>

          <HeroFeatureCards className="hero-features-mobile lg:hidden landing-fade-up landing-delay-1" />
        </div>
      </div>
    </section>
  );
}
