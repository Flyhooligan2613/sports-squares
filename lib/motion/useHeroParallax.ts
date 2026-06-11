"use client";

import { useEffect, type RefObject } from "react";

export function useHeroParallax(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let ticking = false;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
      el.style.setProperty("--hero-parallax", String(progress));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);
}
