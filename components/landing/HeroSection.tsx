"use client";

import { useRef, type CSSProperties } from "react";
import HeroBackground from "@/components/landing/hero/HeroBackground";
import { useHeroParallax } from "@/lib/motion/useHeroParallax";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useHeroParallax(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="hero-section hero-v2 hero-showcase-only relative overflow-hidden"
      aria-label="SquareBoards live squares board"
      style={{ "--hero-parallax": "0" } as CSSProperties}
    >
      <HeroBackground />
    </section>
  );
}
