"use client";

import { useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Radio } from "lucide-react";
import Logo from "@/components/Logo";
import HeroBackground from "@/components/landing/hero/HeroBackground";
import GlobalSearchTrigger from "@/components/search/GlobalSearchTrigger";
import { Button } from "@/components/ui/Button";
import { ESPN_SPORT_LIST } from "@/lib/espn/sports";
import type { EspnSport } from "@/lib/types";
import { useHeroParallax } from "@/lib/motion/useHeroParallax";

const HERO_SPORT_EMOJI: Record<EspnSport, string> = {
  nfl: "🏈",
  ncaaf: "🏈",
  nba: "🏀",
  ncaab: "🏀",
};

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();
  useHeroParallax(sectionRef);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function pickSport(sport: EspnSport) {
    router.replace(`/?sport=${sport}#marketplace`, { scroll: false });
    scrollTo("marketplace");
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

          <h1 className="hero-headline hero-headline-v2 hero-headline-premium text-center">
            <span className="block">Own Your Lucky Squares.</span>
            <span className="block hero-headline-accent">Win Every Quarter.</span>
          </h1>

          <p className="hero-subhead hero-subhead-v2 text-center mx-auto">
            Buy lucky squares, watch live scores, and compete for cash prizes every quarter.
          </p>

          <div className="hero-sport-bar mx-auto mb-5 sm:mb-6" role="group" aria-label="Pick a sport">
            {ESPN_SPORT_LIST.map((sport) => (
              <button
                key={sport.id}
                type="button"
                className="hero-sport-chip"
                onClick={() => pickSport(sport.id)}
              >
                <span aria-hidden>{HERO_SPORT_EMOJI[sport.id]}</span>
                {sport.label}
              </button>
            ))}
          </div>

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
