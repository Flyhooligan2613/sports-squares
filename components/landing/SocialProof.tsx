"use client";

import { useEffect, useRef, useState } from "react";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useCountUp } from "@/lib/motion/useCountUp";

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
  delay,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  active: boolean;
  delay: number;
}) {
  const display = useCountUp(value, active, { duration: 900, delay });

  const formatted =
    prefix +
    (value >= 1000 ? display.toLocaleString() : String(display)) +
    suffix;

  return (
    <div className="landing-stat-block sb-glow-card">
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
      { threshold: 0.25 }
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
          <ScrollReveal key={stat.label} delay={index * 100}>
            <AnimatedStat {...stat} active={active} delay={index * 120} />
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
