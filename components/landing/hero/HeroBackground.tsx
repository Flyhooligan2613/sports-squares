"use client";

import HeroParticles from "@/components/landing/HeroParticles";

export default function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="hero-parallax-slow absolute inset-0 bg-sb-bg" />

      {/* Depth layers */}
      <div className="hero-parallax-mid hero-blueprint-grid absolute inset-0 opacity-25" />
      <div className="hero-parallax-mid hero-field-texture absolute inset-0 opacity-35" />

      {/* Stadium spotlight — lights the product zone */}
      <div className="hero-stadium-spotlight" />
      <div className="hero-product-zone-glow" />

      {/* Ambient gradients */}
      <div className="hero-parallax-slow absolute inset-0 bg-gradient-to-b from-sb-purple/12 via-transparent to-sb-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_15%,rgba(255,255,255,0.04),transparent_55%)]" />
      <div className="hero-parallax-mid absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_65%,rgba(91,76,247,0.14),transparent_60%)]" />

      {/* Haze */}
      <div className="hero-parallax-slow hero-fog hero-fog-1" />
      <div className="hero-stadium-haze" />

      {/* Stadium lights */}
      <div className="hero-stadium-light hero-stadium-light-left" />
      <div className="hero-stadium-light hero-stadium-light-right" />
      <div className="hero-stadium-light hero-stadium-light-center" />

      {/* Star dust */}
      <div className="hero-parallax-fast hero-starfield">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="hero-star"
            style={{
              left: `${(i * 19 + 8) % 100}%`,
              top: `${(i * 27 + 12) % 80}%`,
              animationDelay: `${(i % 6) * 0.6}s`,
              animationDuration: `${4 + (i % 3)}s`,
              opacity: 0.1 + (i % 4) * 0.05,
            }}
          />
        ))}
      </div>

      <div className="hero-vignette absolute inset-0" />
      <div className="hero-parallax-slow absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-sb-bg via-sb-bg/90 to-transparent" />

      <HeroParticles />
    </div>
  );
}
