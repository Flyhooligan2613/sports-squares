"use client";

import HeroParticles from "@/components/landing/HeroParticles";

export default function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Base navy */}
      <div className="absolute inset-0 bg-sb-bg" />

      {/* Football field texture */}
      <div className="hero-field-texture absolute inset-0 opacity-60" />

      {/* Purple stadium wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-sb-purple/20 via-transparent to-sb-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_70%_40%,rgba(91,76,247,0.28),transparent_55%)] hero-glow-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(123,97,255,0.12),transparent_50%)]" />

      {/* Fog layers */}
      <div className="hero-fog hero-fog-1" />
      <div className="hero-fog hero-fog-2" />

      {/* Stadium floodlights */}
      <div className="hero-stadium-light hero-stadium-light-left" />
      <div className="hero-stadium-light hero-stadium-light-right" />

      {/* Horizon fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-sb-bg via-sb-bg/80 to-transparent" />

      <HeroParticles />
    </div>
  );
}
