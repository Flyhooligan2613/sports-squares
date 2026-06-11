"use client";

import HeroParticles from "@/components/landing/HeroParticles";

export default function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="hero-parallax-slow absolute inset-0 bg-sb-bg" />

      <div className="hero-parallax-mid hero-blueprint-grid absolute inset-0 opacity-20" />

      {/* Stadium atmosphere — no artwork, CSS only */}
      <div className="hero-stadium-spotlight" />
      <div className="hero-parallax-slow absolute inset-0 bg-gradient-to-b from-sb-purple/14 via-transparent to-sb-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_12%,rgba(255,255,255,0.06),transparent_58%)]" />

      <div className="hero-parallax-slow hero-fog hero-fog-1" />
      <div className="hero-stadium-haze" />

      <div className="hero-stadium-light hero-stadium-light-left" />
      <div className="hero-stadium-light hero-stadium-light-right" />
      <div className="hero-stadium-light hero-stadium-light-center" />

      <div className="hero-parallax-fast hero-starfield">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="hero-star"
            style={{
              left: `${(i * 21 + 6) % 100}%`,
              top: `${(i * 29 + 8) % 75}%`,
              animationDelay: `${(i % 6) * 0.55}s`,
              animationDuration: `${4 + (i % 3)}s`,
              opacity: 0.08 + (i % 4) * 0.04,
            }}
          />
        ))}
      </div>

      <div className="hero-vignette absolute inset-0" />
      <div className="hero-parallax-slow absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-sb-bg via-sb-bg/92 to-transparent" />

      <HeroParticles />
    </div>
  );
}
