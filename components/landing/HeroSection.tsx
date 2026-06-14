"use client";

import { useRef, type CSSProperties } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import HeroBackground from "@/components/landing/hero/HeroBackground";
import GlobalSearchTrigger from "@/components/search/GlobalSearchTrigger";
import { Button } from "@/components/ui/Button";
import { useHeroParallax } from "@/lib/motion/useHeroParallax";

const ECOSYSTEM_HIGHLIGHTS = [
  "Play live Sports Squares",
  "Build winning Pick'em streaks",
  "Unlock weekly rewards",
  "Compete with friends",
  "Level up your profile",
];

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

      <div className="hero-showcase-overlay relative z-10 w-full px-4 sm:px-6 pt-4 sm:pt-6 lg:pt-8 pb-6">
        <div className="hero-v2-copy hero-v2-copy-over-art landing-fade-up mx-auto">
          <div className="hero-search-bar mx-auto mb-5 sm:mb-6 w-full max-w-lg">
            <GlobalSearchTrigger variant="hero" className="w-full" />
          </div>

          <div className="hero-logo-glow flex justify-center mb-4 sm:mb-5">
            <Logo href="/" className="text-xl sm:text-2xl hero-logo-breathe" />
          </div>

          <div className="flex justify-center mb-4 sm:mb-5">
            <div className="hero-live-pill hero-platform-pill">
              <Sparkles className="w-3.5 h-3.5 text-sb-glow" strokeWidth={2.5} />
              <span>The Premium Sports Gaming Platform</span>
            </div>
          </div>

          <h1 className="hero-headline hero-headline-v2 hero-headline-premium text-center">
            <span className="block">One Platform.</span>
            <span className="block hero-headline-accent">Every Way To Play.</span>
          </h1>

          <ul className="hero-ecosystem-list mx-auto">
            {ECOSYSTEM_HIGHLIGHTS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="hero-ctas hero-ctas-v2 hero-ctas-spacious justify-center">
            <Button
              variant="primary"
              className="hero-btn-premium sb-btn-spring w-full sm:w-auto min-w-[220px] group"
              onClick={() => scrollTo("marketplace")}
            >
              Browse Games
              <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </Button>
            <Button
              variant="secondary"
              className="hero-btn-secondary-v2 sb-btn-spring w-full sm:w-auto min-w-[220px]"
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
