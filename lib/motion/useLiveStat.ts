"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

interface UseLiveStatOptions {
  duration?: number;
  delay?: number;
}

export function useLiveStat(
  target: number,
  active: boolean,
  { duration = 900, delay = 0 }: UseLiveStatOptions = {}
): { value: number; glowing: boolean } {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const [glowing, setGlowing] = useState(false);
  const valueRef = useRef(0);
  const prevTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    if (reduced) {
      setValue(target);
      valueRef.current = target;
      prevTargetRef.current = target;
      return;
    }

    const from = prevTargetRef.current !== null ? valueRef.current : 0;
    const delta = target - from;
    let glowTimeout = 0;

    if (prevTargetRef.current !== null && target !== prevTargetRef.current) {
      setGlowing(true);
      glowTimeout = window.setTimeout(() => setGlowing(false), 900);
    }

    let raf = 0;
    let startTime: number | null = null;

    const timeout = window.setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const next = Math.round(from + delta * eased);
        setValue(next);
        valueRef.current = next;

        if (progress < 1) {
          raf = requestAnimationFrame(animate);
        } else {
          prevTargetRef.current = target;
        }
      };

      raf = requestAnimationFrame(animate);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(glowTimeout);
      cancelAnimationFrame(raf);
    };
  }, [target, active, duration, delay, reduced]);

  return { value, glowing };
}
