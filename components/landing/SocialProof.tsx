"use client";

import { useEffect, useRef, useState } from "react";
import { useLandingLive } from "@/components/landing/LandingLiveProvider";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCountUp } from "@/lib/motion/useCountUp";

const MIN_PLAYERS_TO_SHOW = 25;

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
    <div className="landing-stat-block sb-glow-card sb-card-interactive">
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
  const platform = data?.platform;

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

  const stats: StatConfig[] = [];

  if (totals && platform) {
    stats.push(
      { value: Math.max(platform.activeGames, totals.totalPools > 0 ? 1 : 0), label: "Games Available" },
      { value: totals.totalPools, label: "Boards Created" },
      { value: totals.totalSquaresSold, label: "Squares Sold" },
      { value: totals.totalPrizeMoney, prefix: "$", label: "Money Awarded" }
    );

    if (platform.playersOnline >= MIN_PLAYERS_TO_SHOW) {
      stats.push({ value: platform.playersOnline, label: "Players Online" });
    }
  }

  return (
    <LandingSection variant="alt">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Trust"
          title="Trusted by sports fans across the country"
          subtitle="Live games. Real payouts. Every quarter."
          align="center"
        />
      </ScrollReveal>
      <div
        ref={ref}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5"
      >
        {loading && !totals
          ? Array.from({ length: 4 }).map((_, index) => (
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
