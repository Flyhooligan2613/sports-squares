"use client";

import HeroParticles from "@/components/landing/HeroParticles";

export default function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="hero-parallax-slow absolute inset-0 bg-sb-bg" />

      {/* Depth layers */}
      <div className="hero-parallax-mid hero-blueprint-grid absolute inset-0 opacity-35" />
      <div className="hero-parallax-mid hero-field-texture absolute inset-0 opacity-45" />

      {/* Ambient gradients */}
      <div className="hero-parallax-slow absolute inset-0 bg-gradient-to-b from-sb-purple/15 via-transparent to-sb-bg" />
      <div className="hero-parallax-mid hero-ambient-shift absolute inset-0" />
      <div className="hero-parallax-fast absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_20%,rgba(91,76,247,0.22),transparent_55%)] hero-glow-pulse" />
      <div className="hero-parallax-mid absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(123,97,255,0.12),transparent_60%)] sb-glow-ambient" />

      {/* Light streaks */}
      <div className="hero-light-streak hero-light-streak-1" />
      <div className="hero-light-streak hero-light-streak-2" />

      {/* Haze & fog */}
      <div className="hero-parallax-slow hero-fog hero-fog-1" />
      <div className="hero-parallax-mid hero-fog hero-fog-2" />
      <div className="hero-stadium-haze" />

      {/* Stadium lights */}
      <div className="hero-stadium-light hero-stadium-light-left" />
      <div className="hero-stadium-light hero-stadium-light-right" />
      <div className="hero-stadium-light hero-stadium-light-center" />

      {/* Star dust */}
      <div className="hero-parallax-fast hero-starfield">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className="hero-star"
            style={{
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 23 + 10) % 85}%`,
              animationDelay: `${(i % 8) * 0.5}s`,
              animationDuration: `${3 + (i % 4)}s`,
              opacity: 0.12 + (i % 5) * 0.06,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="hero-vignette absolute inset-0" />

      <div className="hero-parallax-slow absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-sb-bg via-sb-bg/90 to-transparent" />

      <HeroParticles />
    </div>
  );
}
