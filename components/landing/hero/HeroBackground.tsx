"use client";

import HeroParticles from "@/components/landing/HeroParticles";

export default function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-sb-bg" />

      {/* Depth layers */}
      <div className="hero-blueprint-grid absolute inset-0 opacity-40" />
      <div className="hero-field-texture absolute inset-0 opacity-50" />

      {/* Ambient gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-sb-purple/15 via-transparent to-sb-bg" />
      <div className="hero-ambient-shift absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_20%,rgba(91,76,247,0.22),transparent_55%)] hero-glow-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(123,97,255,0.12),transparent_60%)]" />

      {/* Haze & fog */}
      <div className="hero-fog hero-fog-1" />
      <div className="hero-fog hero-fog-2" />
      <div className="hero-stadium-haze" />

      {/* Stadium lights */}
      <div className="hero-stadium-light hero-stadium-light-left" />
      <div className="hero-stadium-light hero-stadium-light-right" />
      <div className="hero-stadium-light hero-stadium-light-center" />

      {/* Star dust */}
      <div className="hero-starfield">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="hero-star"
            style={{
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 23 + 10) % 85}%`,
              animationDelay: `${(i % 8) * 0.4}s`,
              opacity: 0.15 + (i % 5) * 0.08,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="hero-vignette absolute inset-0" />

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-sb-bg via-sb-bg/90 to-transparent" />

      <HeroParticles />
    </div>
  );
}
