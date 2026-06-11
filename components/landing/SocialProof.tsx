"use client";

import { useEffect, useRef, useState } from "react";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
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
    <div className="landing-stat-block">
      <p className="landing-stat-value font-mono">{formatted}</p>
      <p className="landing-stat-label">{label}</p>
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
    <LandingSection variant="alt">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Social Proof"
          title="Trusted by sports fans nationwide"
          subtitle="Join thousands of players buying squares, tracking live scores, and winning every quarter."
        />
      </ScrollReveal>
      <div
        ref={ref}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        {STATS.map((stat, index) => (
          <ScrollReveal key={stat.label} delay={index * 80}>
            <AnimatedStat {...stat} active={active} />
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
