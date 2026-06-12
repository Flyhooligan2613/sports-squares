"use client";

import { useRef, type CSSProperties } from "react";
import { ChevronRight, Radio } from "lucide-react";
import Logo from "@/components/Logo";
import HeroBackground from "@/components/landing/hero/HeroBackground";
import { Button } from "@/components/ui/Button";
import { useHeroParallax } from "@/lib/motion/useHeroParallax";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useHeroParallax(sectionRef);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      ref={sectionRef}
      className="hero-section hero-v2 hero-showcase-bg relative overflow-hidden min-h-[calc(100dvh-3.5rem)]"
      aria-label="SquareBoards hero"
      style={{ "--hero-parallax": "0" } as CSSProperties}
    >
      <HeroBackground />

      <div className="hero-showcase-overlay relative z-10 w-full px-4 sm:px-6 pt-8 sm:pt-10 lg:pt-12 pb-6">
        <div className="hero-v2-copy hero-v2-copy-over-art landing-fade-up mx-auto">
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
              onClick={() => scrollTo("marketplace")}
            >
              Browse Games
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="secondary"
              className="hero-btn-secondary-v2 w-full sm:w-auto min-w-[200px]"
              onClick={() => scrollTo("join")}
            >
              Enter Invite Link
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
