"use client";

import { useEffect, useRef, useState } from "react";
import { useLandingLive } from "@/components/landing/LandingLiveProvider";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCountUp } from "@/lib/motion/useCountUp";

interface StatConfig {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

function AnimatedStat({
  value,
  suffix = "",
  prefix = "",
  label,
  active,
  delay,
}: StatConfig & { active: boolean; delay: number }) {
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

function StatSkeleton() {
  return (
    <div className="landing-stat-block sb-glow-card">
      <Skeleton className="sb-xp-skeleton h-10 w-24 mx-auto mb-2" />
      <Skeleton className="sb-xp-skeleton h-3 w-28 mx-auto" />
    </div>
  );
}

export default function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const { data, loading } = useLandingLive();
  const totals = data?.platformTotals;

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

  const stats: StatConfig[] = totals
    ? [
        { value: totals.totalPools, label: "Pools Created" },
        { value: totals.totalSquaresSold, label: "Squares Sold" },
        {
          value: totals.totalPrizeMoney,
          prefix: "$",
          label: "Prize Money Awarded",
        },
      ]
    : [];

  const playerLine =
    totals && totals.totalPlayers > 0
      ? `Join ${totals.totalPlayers.toLocaleString()} players buying squares, tracking live scores, and winning every quarter.`
      : "Join players buying squares, tracking live scores, and winning every quarter.";

  return (
    <LandingSection variant="alt">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Social Proof"
          title="Trusted by sports fans nationwide"
          subtitle={playerLine}
        />
      </ScrollReveal>
      <div
        ref={ref}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        {loading && !totals
          ? Array.from({ length: 3 }).map((_, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <StatSkeleton />
              </ScrollReveal>
            ))
          : stats.map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 100}>
                <AnimatedStat {...stat} active={active} delay={index * 120} />
              </ScrollReveal>
            ))}
      </div>
    </LandingSection>
  );
}
