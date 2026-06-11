"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
}

export function useCountUp(
  target: number,
  active: boolean,
  { duration = 900, delay = 0 }: UseCountUpOptions = {}
): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    if (reduced) {
      setValue(target);
      return;
    }

    let raf = 0;
    let startTime: number | null = null;

    const timeout = window.setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setValue(Math.round(target * eased));

        if (progress < 1) {
          raf = requestAnimationFrame(animate);
        }
      };

      raf = requestAnimationFrame(animate);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [active, target, duration, delay, reduced]);

  return value;
}
