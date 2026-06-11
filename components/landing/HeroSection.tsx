"use client";

import Logo from "@/components/Logo";
import HeroParticles from "@/components/landing/HeroParticles";
import { Button } from "@/components/ui/Button";

const HERO_FEATURES = [
  "Secure Stripe Payments",
  "Instant Square Selection",
  "Live Game Scoring",
  "Automatic Winner Tracking",
];

export default function HeroSection() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative overflow-hidden min-h-[calc(100dvh-3.5rem)] sm:min-h-[85vh] flex flex-col justify-center">
      {/* Stadium lighting layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%)] pointer-events-none hero-glow-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(139,92,246,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_30%,rgba(79,70,229,0.1),transparent_45%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

      <HeroParticles />

      <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 pt-8 sm:pt-20 pb-12 sm:pb-24 text-center landing-fade-up">
        <div className="flex justify-center mb-6 sm:mb-8">
          <Logo href="/" className="text-base sm:text-lg" />
        </div>

        <h1 className="text-[1.85rem] leading-[1.15] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-slate-50 mb-5 sm:mb-6 max-w-3xl mx-auto tracking-tight">
          <span className="block">Pick Your Squares.</span>
          <span className="block bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-300 bg-clip-text text-transparent">
            Watch the Game.
          </span>
          <span className="block">Win Big.</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto mb-9 sm:mb-11 leading-relaxed px-1">
          Buy your lucky squares, follow live scores, and compete for every
          quarter using secure online payments.
        </p>

        <div className="flex flex-col gap-3 max-w-sm mx-auto sm:max-w-md">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => scrollTo("pools")}
          >
            Play Now
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => scrollTo("join")}
          >
            Enter Pool Code
          </Button>
        </div>

        <ul className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto mt-14 text-left landing-fade-up landing-delay-1">
          {HERO_FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 sb-card px-3.5 py-3"
            >
              <span className="text-indigo-400 shrink-0 text-sm" aria-hidden>
                ✓
              </span>
              <span className="text-slate-300 text-xs sm:text-sm font-medium">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
