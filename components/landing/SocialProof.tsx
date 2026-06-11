"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const STATS = [
  { value: 100, suffix: "+", label: "Pools Created" },
  { value: 5000, suffix: "+", label: "Squares Sold" },
  { value: 10000, suffix: "+", label: "Prize Money Awarded", prefix: "$" },
];

function AnimatedStat({
  value,
  suffix = "",
  prefix = "",
  label,
  active,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  active: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const totalFrames = 48;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (frame >= totalFrames) window.clearInterval(timer);
    }, 20);

    return () => window.clearInterval(timer);
  }, [active, value]);

  const formatted =
    prefix +
    (value >= 1000 ? display.toLocaleString() : String(display)) +
    suffix;

  return (
    <div className="text-center px-4">
      <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono tabular-nums">
        {formatted}
      </p>
      <p className="text-sb-muted text-xs sm:text-sm mt-2 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  );
}

export default function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 sm:py-16 border-y border-white/[0.06] bg-sb-surface/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <p className="text-center text-sb-secondary text-sm sm:text-base mb-8 sm:mb-10 tracking-wide">
            Trusted by sports fans nationwide.
          </p>
        </ScrollReveal>
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6"
        >
          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
