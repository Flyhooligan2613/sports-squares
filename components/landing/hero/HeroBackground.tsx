"use client";

import Image from "next/image";

export default function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Brand hero artwork — full-bleed background */}
      <Image
        src="/hero/hero-artwork.png"
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="hero-artwork-image object-cover"
      />

      {/* Readability overlay — image stays visible, UI stays legible */}
      <div className="hero-artwork-overlay absolute inset-0" />

      {/* Fade into page below hero */}
      <div className="hero-artwork-fade absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-sb-bg via-sb-bg/95 to-transparent" />
    </div>
  );
}
