"use client";

import Image from "next/image";

export default function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <Image
        src="/hero/hero-showcase.png"
        alt=""
        fill
        priority
        quality={92}
        sizes="100vw"
        className="hero-showcase-image object-cover"
      />

      {/* Soft top blend under site navbar */}
      <div className="hero-showcase-top-fade absolute inset-x-0 top-0 h-20 sm:h-24" />

      {/* Hide any leftover mockup text on the crop edge */}
      <div className="hero-showcase-left-fade absolute inset-y-0 left-0 w-24 sm:w-32" />

      {/* Fade into page content below hero */}
      <div className="hero-showcase-bottom-fade absolute bottom-0 left-0 right-0 h-40 sm:h-52" />
    </div>
  );
}
